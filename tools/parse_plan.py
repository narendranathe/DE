"""Parse the Notion 'Daily Executor' export into structured JSON for the study site."""
import json, re, html, os

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'generalized.md')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets', 'plan.js')

raw = open(SRC).read()
# strip the notion page wrapper
raw = raw.split('<content>', 1)[1].rsplit('</content>', 1)[0]
raw = raw.replace('\\"', '"').replace('\\_', '_').replace('\\>', '>').replace('\\<', '<').replace('\\~', '~')

# ---------------------------------------------------------------- inline md
def inline(s):
    """Markdown inline -> HTML. Code spans are protected from other rules."""
    codes = []
    def stash(m):
        codes.append(m.group(1))
        return '\x00%d\x00' % (len(codes) - 1)
    s = re.sub(r'`([^`]+)`', stash, s)
    s = html.escape(s, quote=False)
    s = re.sub(r'\[([^\]]+)\]\(([^)]+)\)',
               lambda m: '<a href="%s" target="_blank" rel="noopener">%s</a>'
                         % (html.escape(m.group(2), quote=True), m.group(1)), s)
    s = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', s)
    s = re.sub(r'(?<![\w*])\*([^*\n]+)\*(?![\w*])', r'<em>\1</em>', s)
    s = re.sub(r'\x00(\d+)\x00',
               lambda m: '<code>%s</code>' % html.escape(codes[int(m.group(1))], quote=False), s)
    return s

CHECK = re.compile(r'^-\s*\[( |x)\]\s*(.*)$')

def render(lines):
    """Block-level markdown -> HTML. Returns (html, checkbox_items)."""
    out, checks, i = [], [], 0
    list_open = None

    def close():
        nonlocal list_open
        if list_open:
            out.append('</%s>' % list_open)
            list_open = None

    while i < len(lines):
        ln = lines[i]
        st = ln.strip()

        if not st:
            close(); i += 1; continue

        if st.startswith('```'):
            lang = st[3:].strip() or 'text'
            body, i = [], i + 1
            while i < len(lines) and not lines[i].strip().startswith('```'):
                body.append(lines[i]); i += 1
            i += 1
            close()
            out.append('<pre class="code" data-lang="%s"><code>%s</code></pre>'
                       % (html.escape(lang, quote=True),
                          html.escape('\n'.join(body).replace('\t', '  '), quote=False)))
            continue

        if st.startswith('<table'):
            body, i = [], i
            while i < len(lines) and '</table>' not in lines[i]:
                body.append(lines[i]); i += 1
            body.append(lines[i] if i < len(lines) else '</table>'); i += 1
            close()
            out.append(table_html('\n'.join(body)))
            continue

        m = CHECK.match(st)
        if m:
            if list_open != 'ul':
                close(); out.append('<ul class="checks">'); list_open = 'ul'
            idx = len(checks)
            checks.append(m.group(2))
            out.append('<li class="check"><label><input type="checkbox" data-i="%d">'
                       '<span>%s</span></label></li>' % (idx, inline(m.group(2))))
            i += 1; continue

        if st.startswith('- ') or st.startswith('* '):
            if list_open != 'ul':
                close(); out.append('<ul>'); list_open = 'ul'
            out.append('<li>%s</li>' % inline(st[2:]))
            i += 1; continue

        m = re.match(r'^(\d+)\.\s+(.*)$', st)
        if m:
            if list_open != 'ol':
                close(); out.append('<ol>'); list_open = 'ol'
            out.append('<li>%s</li>' % inline(m.group(2)))
            i += 1; continue

        if st.startswith('> '):
            body = []
            while i < len(lines) and lines[i].strip().startswith('> '):
                body.append(lines[i].strip()[2:]); i += 1
            close()
            inner, sub = render(body)
            out.append('<blockquote>%s</blockquote>' % inner)
            checks.extend(sub)
            continue

        if st == '---':
            close(); out.append('<hr>'); i += 1; continue

        close()
        out.append('<p>%s</p>' % inline(st))
        i += 1

    close()
    return '\n'.join(out), checks


def table_html(src):
    rows = re.findall(r'<tr>(.*?)</tr>', src, re.S)
    header = 'header-row="true"' in src
    parts = ['<div class="table-wrap"><table>']
    for n, r in enumerate(rows):
        cells = re.findall(r'<td>(.*?)</td>', r, re.S)
        tag = 'th' if (header and n == 0) else 'td'
        if header and n == 1:
            parts.append('<tbody>')
        parts.append('<tr>' + ''.join('<%s>%s</%s>' % (tag, inline(c.strip()), tag) for c in cells) + '</tr>')
        if header and n == 0:
            parts.append('</thead>')
            parts.insert(1, '<thead>') if False else None
    parts.append('</table></div>')
    out = '\n'.join(parts)
    return out.replace('<div class="table-wrap"><table>\n<tr><th', '<div class="table-wrap"><table>\n<thead><tr><th', 1)


# ------------------------------------------------------------- block splitter
LEAD = re.compile(r'^\*\*([^*]{2,90}?)[.:]?\*\*\s*(.*)$')

def split_blocks(lines):
    """Split a day body into labelled sections keyed by their bold lead-in."""
    blocks, cur = [], None
    for ln in lines:
        st = ln.strip()
        m = LEAD.match(st)
        if m and not st.startswith('**Commit'):
            label = m.group(1).strip()
            rest = m.group(2).strip()
            cur = {'label': label, 'lines': ([rest] if rest else [])}
            blocks.append(cur)
        else:
            if cur is None:
                cur = {'label': '', 'lines': []}
                blocks.append(cur)
            cur['lines'].append(ln)
    return blocks

EMOJI = re.compile('^([\U0001F000-\U0001FAFF☀-➿⬀-⯿️←-⇿⌀-⏿\U0001F1E6-\U0001F1FF]+)\s*')

def strip_icon(label):
    label = label.replace('\u200d', '').strip()
    m = EMOJI.match(label)
    if m:
        return m.group(1).strip(), label[m.end():].lstrip('\u200d').strip()
    return '', label.strip()


# ------------------------------------------------------------------- sections
weeks, cheats, resources = [], [], []
lines = raw.split('\n')

# collect top-level chunks
chunks, cur = [], {'h': None, 'lines': []}
fence = False
for ln in lines:
    st = ln.strip()
    if st.startswith('```'):
        fence = not fence
    if not fence and st.startswith('# ') and not st.startswith('##'):
        chunks.append(cur)
        cur = {'h': st[2:].strip(), 'lines': []}
    else:
        cur['lines'].append(ln)
chunks.append(cur)

def parse_details(body):
    """<details><summary>X</summary>...</details> -> list of {title, html}"""
    items = []
    for m in re.finditer(r'<details>\s*<summary>(.*?)</summary>(.*?)</details>', body, re.S):
        title = m.group(1).strip()
        icon, name = strip_icon(title)
        h, _ = render([l for l in m.group(2).split('\n')])
        items.append({'icon': icon, 'title': name, 'html': h})
    return items

intro_html = ''
for ch in chunks:
    h = ch['h'] or ''
    body = '\n'.join(ch['lines'])
    if h.startswith('📚 Cheat Sheets'):
        cheats = parse_details(body)
    elif h.startswith('🛠️ Resource Library'):
        resources = parse_details(body)
    elif '📅 Week' in h:
        wm = re.match(r'📅 Week (\d+) — (.*)$', h)
        wnum, wtitle = int(wm.group(1)), wm.group(2).strip()
        # phase goal = leading blockquote before the first Day heading
        pre = body.split('## Day')[0]
        goal = ' '.join(l.strip()[2:] for l in pre.split('\n') if l.strip().startswith('> '))
        days = []
        for dm in re.finditer(r'^## Day (\d+)([^\n]*)\n(.*?)(?=^## |\Z)', body, re.S | re.M):
            dnum = int(dm.group(1))
            dtitle = dm.group(2).strip().lstrip('—').strip()
            boss = 'Boss Level' in dtitle
            dtitle = re.sub(r'🎮\s*(Boss Level|Level \d+)\s*🏁?', '', dtitle).strip()
            dicon, dtitle = strip_icon(dtitle)
            dlines = dm.group(3).split('\n')
            # cutoff target blockquote
            target = ''
            rest = []
            for ln in dlines:
                st = ln.strip()
                if st.startswith('> ') and 'Cutoff target' in st and not target:
                    target = inline(re.sub(r'^>\s*🎯\s*\*\*Cutoff target:\*\*\s*', '', st))
                else:
                    rest.append(ln)
            secs, checks = [], []
            for b in split_blocks(rest):
                if not b['label'] and not ''.join(b['lines']).strip():
                    continue
                icon, name = strip_icon(b['label'])
                h2, ck = render(b['lines'])
                if not h2.strip() and not name:
                    continue
                secs.append({'icon': icon, 'label': name, 'html': h2, 'checks': len(ck)})
                checks.extend(ck)
            days.append({'day': dnum, 'title': inline(dtitle), 'icon': dicon, 'boss': boss,
                         'target': target, 'sections': secs, 'checkCount': len(checks)})
        weeks.append({'week': wnum, 'title': inline(wtitle), 'goal': inline(goal), 'days': days})
    elif h.startswith('🚀 Daily Executor'):
        intro_html, _ = render(ch['lines'])

data = {'weeks': weeks, 'cheats': cheats, 'resources': resources}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w').write('window.PLAN=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('weeks', len(weeks), 'days', sum(len(w['days']) for w in weeks))
print('cheats', [c['title'] for c in cheats])
print('resources', [r['title'] for r in resources])
for w in weeks:
    print(w['week'], len(w['days']), w['title'][:50], '| checks:', sum(d['checkCount'] for d in w['days']))
