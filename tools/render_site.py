"""Render the single-file Daily Executor tracker from the parsed Notion plan."""
import json, os, re, html as H

HERE = os.path.dirname(os.path.abspath(__file__))
PLAN = json.loads(open(os.path.join(HERE, 'assets', 'plan.js')).read()
                  .split('=', 1)[1].rstrip().rstrip(';'))
OUT = os.environ.get('DE_OUT') or os.path.join(HERE, '..', 'docs', 'index.html')


def asset(name):
    return open(os.path.join(HERE, 'assets', name), encoding='utf-8').read()


def inline_js(name):
    """A script that sits inside a <script> block must not hold anything that ends or hides the block."""
    src = asset(name)
    if '<!--' in src or re.search(r'<script', src, re.I):
        raise SystemExit(f'{name}: contains "<!--" or "<script", which can break the page when inlined')
    return re.sub(r'</(script)', r'<\\/\1', src, flags=re.I)


PG_CSS = asset('playground.css')
PG_JS = asset('playground.js')
WS_CSS = asset('workspace.css')
JUDGE_JS, CORE_JS, COMMUNITY_JS = inline_js('judge.js'), inline_js('workspace-core.js'), inline_js('community.js')
RUNTIME_JS, WS_JS = inline_js('judge-runtime.js'), inline_js('workspace.js')
PROBLEMS_JS = inline_js('problems.js')

# The question bank (tools/problems -> tools/assets/problems.js). Each question is tied to one checkbox of its day.
PROBLEMS = json.loads(asset('problems.js').split('=', 1)[1].rstrip().rstrip(';'))
PROBLEMS_BY_DAY = {}
PROBLEM_BY_LC = {}
for _p in PROBLEMS:
    PROBLEMS_BY_DAY.setdefault(_p['day'], []).append(_p)
    PROBLEM_BY_LC[_p['lc']] = _p


def match_anchor(text, anchor):
    """Same rule as WorkspaceCore.matchAnchor: the link text is the anchor, or the anchor then a dash and a title."""
    t, a = (text or '').strip(), (anchor or '').strip()
    return bool(t and a) and (t == a or t.startswith(a + ' \u2014'))

DONE_THRU, TODAY = 0, 1          # ships blank: a new reader starts at Day 1
TOTAL = 84

THEMES = {
    1:  ('SQL · DATA MODELING',      'sql-lab'),
    2:  ('PRODUCTION PYTHON',        'Sentinel-Lite'),
    3:  ('DSA PATTERNS',             'drills'),
    4:  ('LAKEHOUSE · SPARK',        'iceberg-lakehouse-lab'),
    5:  ('DBT · AIRFLOW · GOVERN',   'iceberg-lakehouse-lab'),
    6:  ('DATA SYSTEM DESIGN',       'designs'),
    7:  ('LLM FUNDAMENTALS',         'llm-lab'),
    8:  ('RAG · EVALS',              'rag-eval-service'),
    9:  ('AGENTS · LLMOPS · COST',   'llm-lab'),
    10: ('CAPSTONE PT.1 — THE SLICE','ai-ready-lakehouse'),
    11: ('CAPSTONE PT.2 — SHIP',     'ai-ready-lakehouse'),
    12: ('MOCKS · CONVERSION',       'convert'),
}

ARC = [('W1–2',  'sql-lab + Sentinel-Lite', 'a SQL warehouse, then a typed, tested service',  'today'),
       ('W4–5',  'iceberg-lakehouse-lab',   'CDC → Iceberg, with Spark, dbt and Airflow on top', 'next'),
       ('W7',    'llm-lab',                 'a tested LLM feature behind an API contract',       'next'),
       ('W8',    'rag-eval-service',        'retrieval with an eval gate that blocks deploys',   'next'),
       ('W10–11','ai-ready-lakehouse',      'the capstone: all of it, self-healing',             'next')]

# the fixed ritual, in order; each day's blocks are sorted onto these slots
RITUAL = [
    ('REVIEW',       '15 min &middot; old material, from memory'),
    ('CONCEPT',      'what &amp; why engineers use it'),
    ('ALTERNATIVES', 'and when to pick each'),
    ('ROADBLOCK → FIX', 'the wall everyone hits, and the fix'),
    ('READ',         'two sources &middot; with the concept, a 20-min learn block'),
    ('BUILD &amp; SAVE', '55 min &middot; the real test, git commit = checkpoint'),
    ('PRACTICE',     '15 min &middot; one timed SQL or algorithm rep'),
    ('DONE WHEN',    'the cutoff checklist'),
    ('RECALL',       '15 min &middot; boss check, book closed'),
]

SLOT = [
    (r'^review',                                     'REVIEW'),
    (r'roadblock',                                   'ROADBLOCK → FIX'),
    (r'alternativ|when to pick|how to identify',     'ALTERNATIVES'),
    (r'^the concept|^what the pattern|^what you|^why today|^the week', 'CONCEPT'),
    (r'^read',                                       'READ'),
    (r'build|solve &amp; narrate|solve & narrate|do &amp; log|do & log|the arena', 'BUILD & SAVE'),
    (r'^practice reps',                              'PRACTICE'),
    (r'^done when',                                  'DONE WHEN'),
    (r'^recall',                                     'RECALL'),
    (r'^reward',                                     'REWARD'),
    (r'key ideas|hints|sql bridge|thought process',  'NOTES'),
]
ORDER = ['REVIEW', 'CONCEPT', 'ALTERNATIVES', 'ROADBLOCK → FIX', 'NOTES', 'READ',
         'BUILD & SAVE', 'PRACTICE', 'DONE WHEN', 'RECALL', 'REWARD']

def slot_of(label):
    l = (label or '').lower()
    for pat, name in SLOT:
        if re.search(pat, l):
            return name
    return 'NOTES'

CATS = [(r'^review', 'REVIEW'),
        (r'^practice reps', 'PRACTICE'),
        (r'^recall', 'RECALL'),
        (r'^read', 'READ'),
        (r'^done when|build|solve|do &amp; log|do & log|the arena', 'BUILD')]

CAT_XP = {'REVIEW': 20, 'READ': 30, 'BUILD': 50, 'PRACTICE': 20, 'RECALL': 25}
BONUS = 25

def cat_of(label):
    l = (label or '').lower()
    for pat, name in CATS:
        if re.search(pat, l):
            return name
    return None


DAYDATA = {}

XP_CEIL = re.compile(r'(?:up to\s*~?\s*|=\s*)\*?\*?~?(\d{2,3})\s*XP', re.I)

def stated_max(sections):
    """The plan writes each day's ceiling into its Reward line; trust that over
    anything derived from which sections happen to carry checkboxes."""
    for sec in sections:
        if (sec['label'] or '').lower().startswith('reward'):
            m = XP_CEIL.search(strip_tags(sec['html']))
            if m:
                return int(m.group(1))
    return None


def day_of(n):
    for w in PLAN['weeks']:
        for d in w['days']:
            if d['day'] == n:
                return d
    raise KeyError(n)


def wk_of(n):
    return (n - 1) // 7 + 1


def total_checks():
    t = 0
    for w in PLAN['weeks']:
        for d in w['days']:
            t += d['checkCount']
            t += any((sec['label'] or '').lower().startswith('read') for sec in d['sections'])
    return t


def status_of(n):
    return 'done' if n <= DONE_THRU else ('today' if n == TODAY else 'next')

GLYPH = {'done': '✓', 'today': '◐', 'next': '○'}
WORD  = {'done': 'COMPLETE', 'today': 'TODAY', 'next': 'UPCOMING'}


def day_status_counts():
    return DONE_THRU, 1, TOTAL - DONE_THRU - 1


def strip_tags(s):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', s)).strip()


# Strips decorative emoji only. The arrow block (U+2190-21FF) is deliberately
# excluded: "CDC -> Iceberg" and "retrieve -> generate" are content, not decoration.
EMOJI = re.compile(
    '[\U0001F000-\U0001FAFF\U00002300-\U000023FF'
    '\U00002460-\U000024FF\U000025A0-\U000027BF\U00002B00-\U00002BFF'
    '\U0001F1E6-\U0001F1FF\uFE0F\u200D]+')

def deglyph(s):
    """Drop decorative emoji from prose. Keeps every word; only symbols go."""
    s = EMOJI.sub('', s)
    return re.sub(r'  +', ' ', s).replace('( ', '(').replace(' )', ')')


def clip(s, n=170):
    """Trim to a word boundary, preferring to end on a sentence."""
    s = deglyph(strip_tags(s))
    s = re.sub(r'^Phase goal:\s*', '', s)
    if len(s) <= n:
        return s
    cut = s[:n]
    dot = max(cut.rfind('. '), cut.rfind('? '))
    if dot > n * 0.55:
        return cut[:dot + 1]
    return cut[:cut.rfind(' ')].rstrip(' ,;:—-·') + '…'


# ---------------------------------------------------------------- fragments
def console_panel():
    opts = ''.join(
        f'<option value="{w["days"][0]["day"]}">W{w["week"]:02d} · DAY '
        f'{w["days"][0]["day"]}–{w["days"][-1]["day"]} · {THEMES[w["week"]][0]}</option>'
        for w in PLAN['weeks'])
    return f'''
<section id="today" class="sec console-sec">
  <div class="console" id="console">
    <div class="con-bar">
      <div class="con-l mono"><span class="con-eyebrow" id="conEyebrow">TODAY</span>
        <span class="con-day" id="conDay">DAY 1</span>
        <span class="con-date mono" id="conDate"></span>
        <span class="con-title" id="conTitle"></span></div>
      <div class="con-nav mono">
        <button type="button" class="nb" id="btnPrev" aria-label="Previous day">◀ PREV</button>
        <button type="button" class="nb" id="btnToday">TODAY</button>
        <button type="button" class="nb" id="btnNext" aria-label="Next day">NEXT ▶</button>
        <select id="weekJump" class="mono" aria-label="Jump to week">{opts}</select>
      </div>
    </div>
    <div class="con-set">
      <label class="cs-l mono" for="setDay">TODAY IS</label>
      <input id="setDay" class="mono" type="text" autocomplete="off" spellcheck="false"
             placeholder='paste "today is Day 19"' aria-label="Set which day is today">
      <button type="button" class="btn sm" id="btnSet">SET</button>
      <span class="cs-msg mono" id="setMsg" role="status" aria-live="polite"></span>
    </div>
    <div class="con-target"><span class="t-l mono">CUTOFF TARGET</span>
      <div class="t-b prose" id="conTarget"></div></div>
    <div class="con-xp">
      <div class="con-rail"><i id="conRail"></i></div>
      <div class="con-xp-t mono"><span id="conXp">0 / 170 XP</span>
        <span class="sep">/</span><span id="conChecks">0 TICKED</span></div>
    </div>
    <div class="con-groups" id="conGroups"></div>
    <div class="con-foot mono">
      <a id="conOpen" href="#d1">OPEN THE FULL CARD IN THE LOG ↓</a>
      <a href="#playground">TRY CODE IN THE PLAYGROUND ↓</a>
      <span class="con-kbd">← → TO MOVE BETWEEN DAYS</span>
    </div>
  </div>
</section>'''


def playground_panel():
    return """
<section id="playground" class="sec">
  <h2 class="sec-h"><span class="sec-n mono">07</span> PLAYGROUND</h2>
  <div class="sec-sub mono">PYTHON AND SQL / FREE / RUNS IN YOUR BROWSER / NO SIGN-IN, NO SERVER</div>
  <div class="pg" id="pg">
    <div class="pg-bar">
      <div class="pg-tabs" role="tablist" aria-label="Language">
        <button type="button" class="pg-tab" id="pgTabPy" role="tab" aria-selected="true">PYTHON</button>
        <button type="button" class="pg-tab" id="pgTabSql" role="tab" aria-selected="false">SQL</button>
      </div>
      <div class="pg-tools">
        <select id="pgEx" class="mono" aria-label="Load an example"></select>
        <button type="button" class="pg-btn" id="pgSeed" hidden title="Create customers, orders, order_items, events and activity">LOAD SAMPLE WAREHOUSE</button>
        <button type="button" class="pg-btn" id="pgTables" hidden>SHOW TABLES</button>
        <button type="button" class="pg-btn" id="pgStop" hidden>RESET PYTHON</button>
        <button type="button" class="pg-btn run" id="pgRun" title="Ctrl or Cmd + Enter">&#9654; RUN</button>
      </div>
    </div>
    <textarea id="pgEd" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"
      aria-label="Code editor"></textarea>
    <div class="pg-status mono" id="pgStatus" role="status" aria-live="polite"></div>
    <div class="pg-out" id="pgOut" aria-live="polite"></div>
    <div class="pg-foot mono">
      <span>CTRL / &#8984; + ENTER RUNS <span class="sep">/</span> ESC THEN TAB LEAVES THE EDITOR</span>
      <button type="button" id="pgClear">CLEAR OUTPUT</button>
    </div>
  </div>
  <details class="pg-notes">
    <summary>HOW IT WORKS, AND WHAT IT CANNOT DO</summary>
    <div class="pg-notes-b">
      <ul>
        <li><b>Python</b> is CPython compiled to WebAssembly (Pyodide). It starts the first time you press RUN, in a
          background worker, so <b>RESET PYTHON</b> or <b>STOP</b> ends a runaway loop without freezing the page.
          Variables stay between runs until you reset. Top-level <code>await</code> works.</li>
        <li><b>Packages:</b> the standard library, <code>pydantic</code>, <code>pytest</code>, <code>numpy</code>,
          <code>pandas</code>, <code>sqlite3</code> and most other popular libraries load by name when you import them.
          For a pure-Python package from PyPI, put <code># pip: name</code> on the first line.</li>
        <li><b>SQL</b> is DuckDB, also compiled to WebAssembly. It matches the DuckDB used in the sql-lab repo, so
          <code>QUALIFY</code>, window frames, <code>generate_series</code> and <code>EXPLAIN ANALYZE</code> work.
          <b>LOAD SAMPLE WAREHOUSE</b> builds five small tables with planted problems: duplicates, NULLs and orphan keys.
          The data lives in memory and is gone when you reload.</li>
        <li><b>Not here:</b> <code>requests</code> and <code>urllib</code> calls (a browser has no raw sockets),
          <code>input()</code>, threads, subprocesses, your local files, Spark, Airflow and dbt. Do the real build in
          your repo; use this to try an idea in one minute.</li>
        <li><b>Download:</b> each runtime is roughly 10 MB the first time, from a public CDN
          (jsDelivr), then your browser caches it. Your code stays in this browser only.</li>
        <li><b>Try it from a card:</b> every Python and SQL code block in the day cards and cheat sheets has a
          <b>TRY IN PLAYGROUND</b> button that copies it into the editor.</li>
      </ul>
    </div>
  </details>
</section>"""


def program_arc():
    arc = [('W1', 'SQL + data modeling', 'the most-tested skill goes first'),
           ('W2', 'Production Python', 'typed, tested, resilient, observable'),
           ('W3', 'DSA patterns', 'trigger \u2192 pattern \u2192 complexity'),
           ('W4\u20135', 'Lakehouse, Spark, dbt', 'table formats, CDC, Airflow, governance'),
           ('W6', 'Data system design', 'consistency, partitioning, delivery, failure'),
           ('W7', 'LLM fundamentals', 'tokens, attention, API contracts'),
           ('W8', 'RAG + evals', 'retrieval and answers you can measure'),
           ('W9', 'Agents + LLMOps', 'tracing, guardrails, cost, drift'),
           ('W10\u201311', 'The capstone', 'an AI-ready lakehouse that heals itself'),
           ('W12', 'Mocks + conversion', 'turn the build into interviews')]
    cells = ''.join(
        f'<div class="pa-cell"><div class="pa-w mono">{w}</div>'
        f'<div class="pa-t">{t}</div><div class="pa-d">{d}</div></div>' for w, t, d in arc)
    return f'''
<section id="arc" class="sec">
  <h2 class="sec-h"><span class="sec-n mono">09</span> THE WHOLE ARC</h2>
  <div class="sec-sub mono">TWELVE WEEKS END TO END <span class="sep">/</span>
    SIX PUBLIC REPOS <span class="sep">/</span> ONE STANDOUT CAPSTONE</div>
  <div class="pa-grid">{cells}</div>
  <p class="pa-note">Finish it and you have six public repos, a capstone that runs end to end,
    and a review habit that keeps all of it retrievable \u2014 whatever background you started from. What the
    portfolio says about you is yours to frame; the build stands on its own.</p>
</section>'''


def backup_panel():
    return '''
<section id="backup" class="sec">
  <h2 class="sec-h"><span class="sec-n mono">10</span> STATE</h2>
  <div class="sec-sub mono">PROGRESS LIVES IN THIS BROWSER / EXPORT BEFORE A REDEPLOY</div>
  <div class="backup">
    <div class="bk-row">
      <button type="button" class="btn" id="btnExport">EXPORT STATE ↓</button>
      <button type="button" class="btn ghost" id="btnImportFile">IMPORT FILE ↑</button>
      <button type="button" class="btn ghost" id="btnPaste">PASTE JSON</button>
      <button type="button" class="btn danger" id="btnReset">RESET</button>
      <input type="file" id="fileIn" accept="application/json,.json" hidden>
    </div>
    <p class="bk-note">Export downloads <code>daily-executor-state.json</code> and also drops the
      JSON below so you can copy it anywhere downloads are blocked. Import accepts either.</p>
    <textarea id="ioBox" class="mono" spellcheck="false" hidden
      aria-label="State JSON for copy or paste"></textarea>
    <div class="bk-stats mono" id="bkStats"></div>
  </div>
</section>'''


def masthead():
    d, t, u = day_status_counts()
    return f'''
<header class="masthead">
  <div class="mh-l">
    <div class="kicker" id="mhKicker">DAILY EXECUTOR <span class="sep">/</span> 12-WEEK ENGINEERING PROGRAM</div>
    <h1 id="mhTitle">AI + Data + Lakehouse Engineer</h1>
    <p class="mission">One page. Open it, find today, do the card, tick the boxes. Every day is two
      hours: a 15-minute review of older material from memory, one concept taught before it tests you,
      a build, one timed practice rep and a closed-book recall. A git commit is the checkpoint. The
      review loop is what keeps week 1 in your head in week 12.</p>
    <div class="mh-role mono" id="mhRole"></div>
  </div>
  <div class="mh-r mono">
    <div class="mh-now">DAY {TODAY} / {TOTAL}</div>
    <div class="mh-sub">WEEK {wk_of(TODAY)} &middot; {THEMES[wk_of(TODAY)][0]}</div>
    <div class="mh-sub" id="mhStreak">STREAK {DONE_THRU} \U0001f525</div>
  </div>
</header>'''


def jumpstrip():
    items = [('#status', 'STATUS'), ('#position', 'THE 84'), ('#weeks', 'WEEKS'),
             ('#ritual', 'RITUAL'), ('#xp', 'XP'), ('#resources', 'RESOURCES'),
             ('#cheats', 'CHEATS'), ('#playground', 'PLAYGROUND'), ('#days', 'ALL 84 DAYS'), ('#arc', 'THE ARC'),
             ('#backup', 'STATE')]
    items = [('#today', 'TODAY')] + items
    tabs = ''.join(f'<a class="jt" href="{h}">{t}</a>' for h, t in items)
    live = ('<div class="jt-live mono"><span id="liveDay">DAY 1</span>'
            '<span class="sep">/</span><span id="liveXp">0 XP</span>'
            '<span class="sep">/</span><span id="liveStreak">0 \U0001f525</span></div>')
    toggle = ('<button type="button" class="jt-theme mono" id="themeBtn" aria-pressed="false">'
              '<span class="tg-g">\u25d0</span><span id="themeLbl">DARK</span></button>'
              '<button type="button" class="jt-theme jt-gear" id="gearBtn" '
              'aria-label="Settings" title="Settings">\u2699</button>')
    return (f'<nav class="jumpstrip mono" aria-label="Section navigation">{tabs}{live}'
            f'{toggle}</nav>')


def stats():
    d, t, u = day_status_counts()
    cells = [(TOTAL, 'DAYS', ''), (12, 'WEEKS', ''), (d, 'COMPLETE', 'done'),
             (t, 'TODAY', 'today'), (u, 'UPCOMING', 'next'), (DONE_THRU, 'DAY STREAK', 'streak')]
    out = ''.join(
        f'<div class="stat {c}"><div class="num">{n}</div><div class="lbl mono">{l}</div></div>'
        for n, l, c in cells)
    pct = round(d / TOTAL * 100)
    return f'''
<section id="status" class="sec">
  <div class="stats">{out}</div>
  <div class="progress-row">
    <div class="prog" role="img" aria-label="{pct}% of the program complete">
      <i style="width:{d / TOTAL * 100:.4f}%"></i><b style="left:{TODAY / TOTAL * 100:.4f}%"></b>
    </div>
    <div class="prog-meta mono"><b>{pct}% OF PROGRAM COMPLETE</b> <span class="sep">/</span>
      {DONE_THRU} OF {TOTAL} DAYS <span class="sep">/</span> 0 OF {total_checks()} CHECKS
      <span class="sep">/</span> 0 XP BANKED</div>
  </div>
</section>'''


def arc_band():
    cells = ''.join(
        f'<div class="arc-cell {st}"><div class="arc-w mono">{w}'
        f'<span class="arc-st mono">{GLYPH[st]} {"BUILDING NOW" if st == "today" else "QUEUED"}</span></div>'
        f'<div class="arc-n mono">{n}</div><div class="arc-d">{d}</div></div>'
        for w, n, d, st in ARC)
    return f'''
  <div class="subhead mono">THE RUNNING BUILD <span class="sep">/</span> one arc, each repo feeding the next</div>
  <div class="arc">{cells}</div>'''


def week_cards():
    cards = ''
    for w in PLAN['weeks']:
        n = w['week']
        days = [d['day'] for d in w['days']]
        lo, hi = min(days), max(days)
        done = sum(1 for d in days if d <= DONE_THRU)
        st = 'done' if done == len(days) else ('today' if lo <= TODAY <= hi else 'next')
        badge = (f'{GLYPH["done"]} COMPLETE' if st == 'done' else
                 f'{GLYPH["today"]} {done}/7 DONE' if st == 'today' else
                 f'{GLYPH["next"]} UPCOMING')
        theme, repo = THEMES[n]
        cap = ' <span class="cap-tag mono">CAPSTONE</span>' if n in (10, 11) else ''
        if n == 10:
            cards += ('<div class="cap-group" id="capGroup">'
                      '<div class="cap-bracket"><span class="cap-lbl mono">ONE CAPSTONE</span></div>'
                      '<div class="cap-cards">')
        cards += f'''
    <article class="wk {st}">
      <div class="wk-top">
        <span class="wk-n mono">W{n:02d}</span>
        <span class="wk-days mono">DAY {lo}–{hi}</span>
        <span class="wk-badge mono">{badge}</span>
      </div>
      <div class="wk-body">
        <h3 class="wk-theme">{theme}{cap}</h3>
        <p class="wk-goal">{clip(w['goal'])}</p>
        <div class="wk-rail"><i data-wkfill="{n}"></i></div>
        <div class="wk-foot mono"><span class="wk-repo">{repo}</span>
          <span class="wk-frac" data-wkfrac="{n}">{done}/7</span>
          <a class="wk-jump" href="#w{n}">OPEN →</a></div>
      </div>
    </article>'''
        if n == 11:
            cards += '</div></div>'
    return f'''
<section id="weeks" class="sec">
  <h2 class="sec-h"><span class="sec-n mono">02</span> WEEK BY WEEK</h2>
  <div class="sec-sub mono">TWELVE PHASES <span class="sep">/</span> W10–11 ARE ONE CONNECTED CAPSTONE</div>
  {arc_band()}
  <div class="wk-grid">{cards}</div>
</section>'''


def punchcard():
    rows = ''
    for w in PLAN['weeks']:
        cells = ''
        for d in w['days']:
            n, st = d['day'], status_of(d['day'])
            boss = ' boss' if d['boss'] else ''
            here = '<span class="here mono">HERE</span>' if st == 'today' else ''
            cells += (f'<a class="cell {st}{boss}" href="#d{n}" data-day="{n}" '
                      f'aria-label="Day {n}, {strip_tags(d["title"])}, {WORD[st]}">'
                      f'<span class="c-n mono">{n}</span>{here}</a>')
        done = sum(1 for d in w['days'] if d['day'] <= DONE_THRU)
        lo, hi = w['days'][0]['day'], w['days'][-1]['day']
        rows += (f'<div class="dg-row" data-week="{w["week"]}">'
                 f'<a class="dg-wk mono" href="#w{w["week"]}" '
                 f'title="Week {w["week"]}: {strip_tags(w["title"])}">W{w["week"]:02d}</a>'
                 f'{cells}'
                 f'<span class="dg-tally mono" data-tally="{w["week"]}">{done}/7</span></div>')
    cols = ''.join(f'<span class="dg-col mono">D{i}</span>' for i in range(1, 8))
    nxt = []
    for w in PLAN['weeks']:
        for d in w['days']:
            if d['day'] >= TODAY and len(nxt) < 4:
                nxt.append(f'<a href="#d{d["day"]}">Day {d["day"]} {strip_tags(d["title"])}</a>')
    return f'''
<section id="position" class="sec">
  <h2 class="sec-h"><span class="sec-n mono">01</span> CURRENT POSITION</h2>
  <div class="sec-sub mono">EIGHTY-FOUR DAYS, TWELVE ROWS <span class="sep">/</span>
    ONE SQUARE PER LEVEL <span class="sep">/</span> HOVER ANY SQUARE FOR ITS TARGET</div>
  <div class="pos-grid">
    <div class="daygrid">
      <div class="dg-head"><span class="dg-wk"></span>{cols}<span class="dg-tally"></span></div>
      {rows}
    </div>
    <div class="pos-side">
      <div class="here-strip">
        <div class="here-l mono">YOU ARE HERE</div>
        <div class="here-m">
          <div class="here-day mono">DAY {TODAY}</div>
          <div class="here-t">{strip_tags(day_of(TODAY)["title"])}</div>
          <div class="here-s mono">WEEK {wk_of(TODAY)} <span class="sep">/</span> LEVEL {TODAY}
            <span class="sep">/</span> 0 OF 7 CHECKS TICKED</div>
        </div>
        <a class="here-go mono" href="#d{TODAY}">OPEN TODAY’S CARD →</a>
      </div>
      <div class="legend mono">
        <span><i class="sw done"></i><b data-lg="done">{GLYPH['done']} COMPLETE · {DONE_THRU}</b></span>
        <span><i class="sw today"></i><b data-lg="today">{GLYPH['today']} TODAY · 1</b></span>
        <span><i class="sw part"></i><b data-lg="part">{GLYPH['today']} IN PROGRESS · 0</b></span>
        <span><i class="sw next"></i><b data-lg="next">{GLYPH['next']} UPCOMING · {TOTAL - DONE_THRU - 1}</b></span>
        <span><i class="sw boss"></i>BOSS LEVEL · EVERY 7TH DAY</span>
      </div>
      <div class="nextup mono"><span class="nu-l">NEXT UP</span>{' <span class="sep">→</span> '.join(nxt)}</div>
    </div>
  </div>
</section>'''


def ritual():
    cells = ''
    for i, (name, sub) in enumerate(RITUAL, 1):
        cells += (f'<div class="loop-cell"><div class="lc-n mono">{i:02d}</div>'
                  f'<div class="lc-t mono">{name}</div><div class="lc-s">{sub}</div></div>')
    return f'''
<section id="ritual" class="sec">
  <h2 class="sec-h"><span class="sec-n mono">03</span> THE DAILY RITUAL</h2>
  <div class="sec-sub mono">NINE STEPS <span class="sep">/</span> TWO HOURS <span class="sep">/</span> EVERY CARD, EVERY DAY</div>
  <div class="loop-strip">{cells}</div>
  <p class="ritual-note">The order is the point. You read only after you know why the thing exists, you
    build only after you know what breaks, and the day does not close until you can say it back with the
    book shut. The day opens with a review because pulling old material out of memory, a little later each
    time, is what makes it last. A day is <em>cleared</em> when its tests pass and the commit lands — not when
    you have read it.</p>
</section>'''


def xp_panel():
    rows = [('review', 'REVIEW FROM MEMORY', '+20', 'answered before looking anything up'),
            ('read', 'READ &amp; UNDERSTOOD', '+30', 'per source, extract stated (no reading on boss and capstone build days)'),
            ('build', 'BUILD / LEVEL CLEARED', '+50', 'tests pass, commit lands'),
            ('practice', 'PRACTICE REP', '+20', 'timed, miss logged in error-log.md'),
            ('recall', 'RECALL BOSS CHECK', '+25', 'book closed, said aloud'),
            ('perfect', 'PERFECT DAY BONUS', '+25', 'every box on the card')]
    tr = ''.join(
        f'<tr><td class="mono">{k}</td><td class="mono val">{v}</td>'
        f'<td>{d}</td><td><span class="xp-state mono open" data-xprow="{i}">○ LOCKED</span></td></tr>'
        for i, k, v, d in rows)
    tr += ('<tr class="total"><td class="mono">PERFECT DAY TOTAL</td>'
           '<td class="mono val">170</td><td>the ceiling (140 on days with no reading)</td>'
           '<td><span class="xp-state mono open" data-xprow="total">0 / 170</span></td></tr>')
    ms = [('s7', '7-DAY STREAK', 'DAY 7'), ('s14', '14-DAY STREAK', 'DAY 14'),
          ('week', 'FINISH ANY WEEK (7/7)', 'W1 7/7'), ('ship', 'SHIP THE CAPSTONE', 'DAY 77')]
    mrows = ''.join(
        f'<div class="ms locked" data-ms="{k}"><span class="ms-n mono">{lbl}</span>'
        f'<span class="ms-s mono">○ LOCKED · {sub}</span>'
        f'<input class="ms-r mono" data-reward="{k}" type="text" autocomplete="off"'
        f' placeholder="write your reward…" aria-label="Reward for {lbl}"></div>'
        for k, lbl, sub in ms)
    return f'''
<section id="xp" class="sec">
  <h2 class="sec-h"><span class="sec-n mono">04</span> XP &amp; REWARDS</h2>
  <div class="sec-sub mono">A SCOREBOARD, NOT WILLPOWER <span class="sep">/</span>
    STREAK BREAKS ON ANY ZERO DAY <span class="sep">/</span>
    STATE SHOWN FOR <b id="xpFor">DAY {TODAY}</b></div>
  <div class="xp-grid">
    <div class="xp-table">
      <table><thead><tr><th class="mono">TASK</th><th class="mono">XP</th>
      <th class="mono">CONDITION</th><th class="mono">STATE</th></tr></thead>
      <tbody>{tr}</tbody></table>
    </div>
    <div class="xp-side">
      <div class="xp-big"><div class="xp-num" id="xpBank">0</div>
        <div class="lbl mono">XP BANKED</div></div>
      <div class="xp-big"><div class="xp-num" id="xpStreak">{DONE_THRU}<span class="fire">\U0001f525</span></div>
        <div class="lbl mono">DAY STREAK</div></div>
      <div class="xp-rule mono">STREAK RULE<br><span class="dim">Any day with at least one
        cleared task extends it. A zero day resets it to zero.</span></div>
    </div>
  </div>
  <div class="subhead mono">MILESTONE REWARDS</div>
  <div class="ms-grid">{mrows}</div>
</section>'''


def collapsibles(items, sec_id, num, title, sub):
    body = ''
    for i, c in enumerate(items):
        body += f'''
    <details class="fold">
      <summary><span class="fold-n mono">{i + 1:02d}</span>
        <span class="fold-t">{H.escape(c['title'])}</span>
        <span class="fold-x mono">+</span></summary>
      <div class="fold-body prose">{deglyph(c['html'])}</div>
    </details>'''
    return f'''
<section id="{sec_id}" class="sec">
  <h2 class="sec-h"><span class="sec-n mono">{num}</span> {title}</h2>
  <div class="sec-sub mono">{sub}</div>
  {body}
</section>'''


STAR_SLOTS = [
    ('bug', 'A bug you root-caused',
     'What broke, how you found it, the fix — and what it would have cost unfixed.'),
    ('speed', 'An efficiency win with a number',
     'Runtime, cost, deploy time, bytes scanned. Any figure you can defend.'),
    ('own', 'An incident you owned end to end',
     'Detection through resolution through the follow-up that stopped a repeat.'),
    ('push', 'A technical disagreement you navigated',
     'What you argued, what you conceded, what shipped.'),
    ('ambig', 'Something you shipped under ambiguity',
     'No spec, unclear owner, moving target — how you decided what to build.'),
    ('capstone', "This program's capstone",
     'The AI-ready lakehouse: what it detects, what it repairs, what it proves.'),
]


def star_bank():
    """Day 82 asks for six STAR stories. The program supplies the prompts; the
    reader supplies the stories. Slots start empty on purpose."""
    rows = ''.join(
        f'<div class="star-slot"><div class="ss-h mono"><span class="ss-n">{i:02d}</span>'
        f'<span class="ss-t">{H.escape(title)}</span></div>'
        f'<div class="ss-p">{H.escape(prompt)}</div>'
        f'<textarea class="ss-in" data-star="{k}" rows="3" spellcheck="true"'
        f' placeholder="Situation \u00b7 Task \u00b7 Action \u00b7 Result-with-metric"'
        f' aria-label="STAR story: {H.escape(title)}"></textarea>'
        f'<div class="ss-f mono"><span data-startag="{k}">\u25cb EMPTY</span>'
        f'<span class="ss-hint">land a number</span></div></div>'
        for i, (k, title, prompt) in enumerate(STAR_SLOTS, 1))
    return ('<div class="star-block">'
            '<div class="star-h mono"><span class="star-ico">\u2605</span>'
            '<span>YOUR STAR BANK &mdash; SIX SLOTS, WRITE YOUR OWN</span></div>'
            '<p class="star-note">Situation 15s &middot; Task 10s &middot; Action 45s &middot; '
            'Result-with-metric 20s. Saved in this browser and included in your state export.</p>'
            f'<div class="star-grid">{rows}</div></div>')


def day_card(d, wk):
    n, st = d['day'], status_of(d['day'])
    blocks = {}
    for sec in d['sections']:
        blocks.setdefault(slot_of(sec['label']), []).append(sec)

    idx = [0]                      # per-day running checkbox index
    cats = {'REVIEW': [], 'READ': [], 'BUILD': [], 'PRACTICE': [], 'RECALL': []}
    console = []                   # groups the TODAY console rebuilds
    probs = []                     # bank questions found on this card: {id, key, cat, bounty}

    LC_LINK = re.compile(r'<a [^>]*href="https://leetcode\.com/problems/([^"/]+)/?[^"]*"[^>]*>(.*?)</a>', re.S)

    def attach(fragment, cat):
        """Every link to a LeetCode problem that has a question here opens that question. A checkbox that holds exactly
        one such problem also gets a SOLVE HERE button. On the question's first day the box carries the bounty; on
        any later day it is a review: the hints were paid for once, so it costs nothing again."""
        def sub(m):
            inner = m.group(1)
            key = re.search(r'data-k="([\d.]+)"', inner)
            links = [(PROBLEM_BY_LC[a.group(1)], a) for a in LC_LINK.finditer(inner) if a.group(1) in PROBLEM_BY_LC]
            if not key or len(links) != 1:
                return m.group(0)
            q, link = links[0]
            text = H.unescape(strip_tags(link.group(2))).strip()
            if q['bounty'] > 0 and q['day'] == n and match_anchor(text, q['anchor']):
                if q['cat'] != cat:
                    raise SystemExit(f"{q['id']}: its checkbox is in {cat}, the question says {q['cat']}")
                probs.append({'id': q['id'], 'key': key.group(1), 'cat': q['cat'], 'bounty': q['bounty']})
            else:
                if not cat:
                    return m.group(0)
                probs.append({'id': q['id'], 'key': key.group(1), 'cat': cat, 'bounty': 0, 'review': True})
            btn = (f'<button type="button" class="solve mono" data-p="{q["id"]}" '
                   f'aria-label="Solve here: {H.escape(q["title"], quote=True)}">SOLVE HERE</button>')
            return f'<li class="check">{inner}{btn}</li>'

        def link(m):
            q = PROBLEM_BY_LC.get(m.group(1))
            if not q:
                return m.group(0)
            return (f'<a class="qlink" href="#p/{q["id"]}" data-p="{q["id"]}">{m.group(2)}</a> '
                    f'<a class="lc" href="https://leetcode.com/problems/{m.group(1)}/" target="_blank" rel="noopener noreferrer" '
                    'title="The same idea on LeetCode. Some LeetCode problems need a paid plan.">LC \u2197</a>')

        out = re.sub(r'<li class="check">(.*?)</li>', sub, fragment, flags=re.S)
        return LC_LINK.sub(link, out)

    def stamp(fragment, cat):
        """Give every checkbox in this fragment a stable key and file it by category."""
        items = []

        def sub(m):
            k = f'{n}.{idx[0]}'
            idx[0] += 1
            if cat:
                cats[cat].append(k)
            items.append(k)
            return f'<input type="checkbox" data-k="{k}"'
        out = re.sub(r'<input type="checkbox"', sub, fragment)
        return out, items

    body = ''
    step = 0
    for name in ORDER:
        for sec in blocks.get(name, []):
            step += 1
            hh = deglyph(sec['html'])
            cat = cat_of(sec['label'])
            hh, keys = stamp(hh, cat)
            hh = attach(hh, cat)

            # the READ step is part of the ritual but carries no box in the source —
            # give it one so the 30 XP it is worth is actually claimable
            if name == 'READ':
                rk = f'{n}.{idx[0]}'
                idx[0] += 1
                cats['READ'].append(rk)
                keys = [rk]
                hh += ('<ul class="checks"><li class="check"><label>'
                       f'<input type="checkbox" data-k="{rk}">'
                       '<span>Both sources read, extract noted</span></label></li></ul>')

            if st == 'done':
                hh = hh.replace('<input type="checkbox"', '<input type="checkbox" checked disabled')

            label = name if name != 'NOTES' else (sec['label'] or 'NOTES').upper()
            if keys and cat:
                console.append({'k': cat, 'label': label, 'html': hh})
            body += (f'<div class="step"><div class="step-h mono">'
                     f'<span class="step-n">{step:02d}</span>{H.escape(label)}</div>'
                     f'<div class="step-b prose">{hh}</div></div>')

    # every bank question of this day must have landed on exactly one checkbox
    for q in PROBLEMS_BY_DAY.get(n, []):
        if q['bounty'] == 0:
            continue
        found = sum(1 for x in probs if x['id'] == q['id'] and not x.get('review'))
        if found != 1:
            raise SystemExit(f"{q['id']}: anchor \"{q['anchor']}\" matched {found} checkboxes on day {n}, expected 1")

    derived = sum(CAT_XP[c] for c in cats if cats[c]) + BONUS
    maxxp = stated_max(d['sections']) or derived
    DAYDATA[n] = {'t': H.unescape(deglyph(strip_tags(d['title']))), 'w': wk['week'], 'boss': d['boss'],
                  'target': deglyph(d['target']), 'cats': {c: v for c, v in cats.items() if v},
                  'max': maxxp, 'groups': console}
    if probs:
        DAYDATA[n]['probs'] = probs

    boss = '<span class="boss-tag mono">BOSS LEVEL</span>' if d['boss'] else ''
    return f'''
      <article class="day {st}" id="d{n}" data-day="{n}">
        <div class="day-head">
          <div class="day-id mono"><span class="day-n">{n:02d}</span>
            <span class="day-st">{GLYPH[st]} {WORD[st]}</span></div>
          <div class="day-title"><h4>{deglyph(d['title'])}</h4>{boss}
            <span class="day-xp mono" data-xp="{n}">0 / {maxxp} XP</span></div>
        </div>
        {f'<div class="target"><span class="t-l mono">CUTOFF TARGET</span><div class="t-b prose">{deglyph(d["target"])}</div></div>' if d['target'] else ''}
        <div class="steps">{body}</div>
        {star_bank() if n == 82 else ''}
      </article>'''


def all_days():
    out = ''
    for w in PLAN['weeks']:
        n = w['week']
        days = [d['day'] for d in w['days']]
        done = sum(1 for d in days if d <= DONE_THRU)
        st = 'done' if done == len(days) else ('today' if min(days) <= TODAY <= max(days) else 'next')
        theme, repo = THEMES[n]
        cards = ''.join(day_card(d, w) for d in w['days'])
        out += f'''
    <div class="wkblock {st}" id="w{n}">
      <div class="wkblock-h">
        <div class="wb-l"><span class="wb-n mono">WEEK {n:02d}</span>
          <h3 class="wb-t">{theme}</h3></div>
        <div class="wb-r mono">DAY {min(days)}–{max(days)} <span class="sep">/</span>
          {GLYPH[st]} {done}/7 <span class="sep">/</span> {repo}</div>
      </div>
      <p class="wb-goal">{deglyph(w['goal'])}</p>
      <div class="days">{cards}</div>
    </div>'''
    return f'''
<section id="days" class="sec">
  <h2 class="sec-h"><span class="sec-n mono">08</span> ALL 84 DAYS</h2>
  <div class="sec-sub mono">EVERY CARD IN FULL <span class="sep">/</span> OPEN ANY DAY</div>
  {out}
</section>'''


CSS = r'''
:root{
  --paper:#f4f2ec; --paper2:#eae7de; --paper3:#dedace;
  --ink:#16181c; --ink2:#55585f; --ink3:#696b71;   /* 4.76:1 on paper */
  --rule:#cfcbc0; --rule2:#b9b4a6;

  /* ---- semantic palette: every colour answers a status question ----
     Tune these six; the whole page follows. Each pairs with a glyph or a
     label wherever it appears, so the page still reads in grayscale. */
  --color-done:#3d7a52;        /* completed: days, weeks, ticked boxes    */
  --color-done-on:#ffffff;     /*   5.12:1 on the fill                    */
  --color-today:#c47f17;       /* the current day. Nothing else, ever.    */
  --color-today-on:#16181c;    /*   ink on amber 5.41:1 (white is 3.28)   */
  --color-today-text:#976011;  /*   darkened for amber-as-text 4.69:1     */
  --color-today-sub:#2b1f06;   /*   sub-labels on the amber fill 4.91:1   */
  --color-progress:#4a6d8c;    /* in progress: current week, partial      */
  --color-progress-on:#ffffff; /*   5.44:1                                */
  --color-boss:#a33b3b;        /* boss level: outline or marker only      */
  --color-streak:#9f5818;      /* the streak counter alone                */
  --color-upcoming:var(--rule2);  /* no colour of its own -- that IS the signal */

  --wash-today:color-mix(in srgb, var(--color-today) 13%, var(--paper));
  --wash-done:color-mix(in srgb, var(--color-done) 9%, var(--paper));
  --wash-progress:color-mix(in srgb, var(--color-progress) 11%, var(--paper));

  /* Ink means TEXT. These three are the surfaces and rules that merely
     happen to be ink-coloured in light mode; in dark they part company. */
  --chrome:#16181c;        /* dark bars: nav, console head, table heads, code */
  --chrome-on:#f4f2ec;     /* text on those bars                              */
  --rule-hard:#16181c;     /* structural borders and grid gutters             */
  --hatch:rgba(22,24,28,.022);  /* the completed-day hatch                    */

  /* anything still reaching for the old single accent degrades to plain
     ink rather than borrowing a status meaning it has not earned */
  --accent:var(--ink); --accent-w:var(--paper2);
  --mono:"IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;
  --sans:"IBM Plex Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
  --disp:"Archivo Black","IBM Plex Sans",system-ui,sans-serif;
}

/* System preference, unless the reader has explicitly chosen light. */
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    /* ---------------------------- DARK ----------------------------------
       Rebuilt, not inverted. Near-black ground, off-white text, and every
       semantic hue lifted and slightly desaturated so it sits on the dark
       ground without vibrating. Amber stays the brightest of the six, so
       TODAY still dominates. Fills take dark text in this mode. */
    --paper:#14171a; --paper2:#1b1f24; --paper3:#232830;
    --ink:#e6e4dd; --ink2:#a4a8ae; --ink3:#7c8189;
    --rule:#282d34; --rule2:#3a4048;

    --color-done:#4e9a68;         /* 5.27:1 on the ground   */
    --color-done-on:#14171a;
    --color-today:#dd9a33;        /* 7.49:1 -- the brightest, by design */
    --color-today-on:#14171a;
    --color-today-text:#dd9a33;   /* bright enough to use as text as-is */
    --color-today-sub:#3a2a06;
    --color-progress:#6d95b8;     /* 5.69:1 */
    --color-progress-on:#14171a;
    --color-boss:#cd6b6b;         /* 5.06:1 */
    --color-streak:#d1873f;       /* 6.21:1, and below amber so it cannot compete */
    --color-upcoming:var(--rule2);

    --chrome:#242930;
    --chrome-on:#e6e4dd;
    --rule-hard:#454d57;
    --hatch:rgba(230,228,221,.035);
  }
}
/* An explicit choice wins in both directions. */
:root[data-theme="dark"]{
  /* ---------------------------- DARK ----------------------------------
     Rebuilt, not inverted. Near-black ground, off-white text, and every
     semantic hue lifted and slightly desaturated so it sits on the dark
     ground without vibrating. Amber stays the brightest of the six, so
     TODAY still dominates. Fills take dark text in this mode. */
  --paper:#14171a; --paper2:#1b1f24; --paper3:#232830;
  --ink:#e6e4dd; --ink2:#a4a8ae; --ink3:#7c8189;
  --rule:#282d34; --rule2:#3a4048;

  --color-done:#4e9a68;         /* 5.27:1 on the ground   */
  --color-done-on:#14171a;
  --color-today:#dd9a33;        /* 7.49:1 -- the brightest, by design */
  --color-today-on:#14171a;
  --color-today-text:#dd9a33;   /* bright enough to use as text as-is */
  --color-today-sub:#3a2a06;
  --color-progress:#6d95b8;     /* 5.69:1 */
  --color-progress-on:#14171a;
  --color-boss:#cd6b6b;         /* 5.06:1 */
  --color-streak:#d1873f;       /* 6.21:1, and below amber so it cannot compete */
  --color-upcoming:var(--rule2);

  --chrome:#242930;
  --chrome-on:#e6e4dd;
  --rule-hard:#454d57;
  --hatch:rgba(230,228,221,.035);
}
*{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:56px;-webkit-text-size-adjust:100%}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}
  *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
body{margin:0;background:var(--paper);color:var(--ink);color-scheme:light dark;font-family:var(--sans);
  font-size:15px;line-height:1.6;-webkit-font-smoothing:antialiased}
.mono{font-family:var(--mono)}
.sep{color:var(--ink3);padding:0 .35em}
.dim{color:var(--ink2)}
a{color:inherit}
a:focus-visible,summary:focus-visible,input:focus-visible,button:focus-visible,
select:focus-visible{outline:2px solid currentColor;outline-offset:2px}
h1,h2,h3,h4{margin:0;text-wrap:balance}
.wrap{max-width:1180px;margin:0 auto;padding:0 28px}

/* ============================ MASTHEAD ============================ */
.masthead{border-bottom:3px solid var(--rule-hard);padding:18px 28px 16px;max-width:1180px;
  margin:0 auto;display:flex;gap:28px;align-items:flex-end;justify-content:space-between;flex-wrap:wrap}
.mh-l{flex:1 1 460px;min-width:0}
.kicker{font-family:var(--mono);font-size:10.5px;letter-spacing:.18em;color:var(--ink2);
  text-transform:uppercase}
.masthead h1{font-family:var(--disp);font-size:clamp(24px,3.4vw,38px);line-height:1.02;
  letter-spacing:-.015em;margin:6px 0 0;text-transform:uppercase}
.mh-role{font-size:9.5px;letter-spacing:.14em;color:var(--ink3);margin-top:9px;
  text-transform:uppercase}
.mh-role b{color:var(--ink2);font-weight:700}
.mission{margin:8px 0 0;max-width:64ch;color:var(--ink2);font-size:13.5px;line-height:1.5}
.mh-r{text-align:right;background:var(--color-today);color:var(--color-today-on);padding:12px 16px;align-self:stretch;
  display:flex;flex-direction:column;justify-content:center;box-shadow:5px 5px 0 var(--rule-hard);
  min-width:212px}
.mh-now{font-family:var(--disp);font-size:30px;color:var(--color-today-on);line-height:1}
.mh-sub{font-size:10px;letter-spacing:.12em;color:var(--color-today-sub);margin-top:5px;text-transform:uppercase}
#mhStreak{color:var(--color-today-sub);font-weight:700}
#liveStreak{color:#e0a76a;font-weight:700}   /* ember on the ink strip: 8.38:1 */

/* ============================ JUMPSTRIP =========================== */
.jumpstrip{position:sticky;top:0;z-index:30;background:var(--chrome);display:flex;
  overflow-x:auto;white-space:nowrap;scrollbar-width:none}
.jumpstrip::-webkit-scrollbar{display:none}
.jt{padding:11px 13px;font-size:10.5px;letter-spacing:.13em;color:#b6b3ab;text-decoration:none;
  border-right:1px solid #2c2f36;flex-shrink:0}
.jt:hover{background:#2c3037;color:#fff}

/* ============================= SECTIONS =========================== */
.sec{max-width:1180px;margin:0 auto;padding:34px 28px 30px;border-bottom:3px solid var(--rule-hard)}
.sec:last-of-type{border-bottom:0}
.sec-h{font-family:var(--disp);font-size:clamp(19px,2.4vw,27px);letter-spacing:-.01em;
  display:flex;align-items:baseline;gap:13px}
.sec-n{font-family:var(--mono);font-size:12px;color:var(--accent);letter-spacing:.1em;
  border:1.5px solid var(--accent);padding:2px 7px;font-weight:700}
.sec-sub{font-size:10.5px;letter-spacing:.13em;color:var(--ink2);margin:7px 0 16px;
  text-transform:uppercase}
.subhead{font-size:10.5px;letter-spacing:.13em;color:var(--ink2);text-transform:uppercase;
  margin:20px 0 9px;padding-bottom:6px;border-bottom:1px solid var(--rule)}

/* ============================== STATS ============================= */
.stats{display:grid;grid-template-columns:repeat(6,1fr);gap:2px;background:var(--rule-hard);
  border:3px solid var(--rule-hard)}
.stat{background:var(--paper);padding:14px 12px;text-align:center}
.stat .num{font-family:var(--disp);font-size:clamp(26px,3.4vw,36px);line-height:1}
.stat .lbl{font-size:9.5px;letter-spacing:.14em;color:var(--ink2);margin-top:7px}
.stat.done .num{color:var(--color-done)}
.stat.next .num{color:var(--ink3)}
.stat.streak .num{color:var(--color-streak)}
.stat.today{background:var(--color-today);color:var(--color-today-on)}
.stat.today .num{color:var(--color-today-on)}
.stat.today .lbl{color:var(--color-today-sub)}
.progress-row{margin-top:12px;display:flex;gap:18px;align-items:center;flex-wrap:wrap}
.prog{flex:1 1 320px;height:14px;border:2px solid var(--rule-hard);background:var(--paper2);position:relative}
.prog i{display:block;height:100%;background:var(--color-done)}
.prog b{position:absolute;top:-5px;bottom:-5px;width:3px;background:var(--color-today)}
.prog-meta{font-size:10.5px;letter-spacing:.1em;color:var(--ink2)}
.prog-meta b{color:var(--ink);font-weight:700}

/* =============================== ARC ============================== */
.arc{display:grid;grid-template-columns:repeat(5,1fr);gap:2px;background:var(--rule-hard);
  border:2px solid var(--rule-hard)}
.arc-cell{background:var(--paper);padding:10px 12px}
.arc-w{font-size:9.5px;letter-spacing:.14em;color:var(--ink3);font-weight:700;
  display:flex;justify-content:space-between;gap:8px;align-items:baseline}
.arc-st{font-size:8.5px;letter-spacing:.1em;color:var(--ink3)}
.arc-cell.today{background:var(--wash-progress);box-shadow:inset 3px 0 0 var(--color-progress)}
.arc-cell.today .arc-w,.arc-cell.today .arc-st{color:var(--color-progress)}
.arc-n{font-size:12.5px;font-weight:600;margin:4px 0 5px;word-break:break-word}
.arc-d{font-size:12px;color:var(--ink2);line-height:1.45}

/* ============================== WEEKS ============================= */
.wk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(252px,1fr));gap:13px;margin-top:6px}
.wk{border:2.5px solid var(--rule-hard);background:var(--paper);box-shadow:4px 4px 0 var(--rule-hard);
  display:flex;flex-direction:column}
.wk.today{box-shadow:4px 4px 0 var(--color-progress);border-color:var(--color-progress)}
.wk.done{border-color:var(--color-done);box-shadow:4px 4px 0 var(--color-done)}
.wk.done .wk-top{background:var(--color-done);border-bottom-color:var(--color-done)}
.wk.done .wk-top *{color:var(--color-done-on)}
.wk.next{box-shadow:2px 2px 0 var(--color-upcoming);border-width:1.5px;border-color:var(--color-upcoming)}
.wk-top{display:flex;align-items:center;gap:9px;padding:8px 12px;border-bottom:2px solid var(--rule-hard);
  background:var(--paper2)}
.wk.today .wk-top{background:var(--color-progress);border-bottom-color:var(--color-progress)}
.wk.today .wk-top *{color:var(--color-progress-on)}
.wk.next .wk-top{border-bottom:1.5px solid var(--rule2);background:transparent}
.wk-n{font-family:var(--disp);font-size:13px}
.wk-days{font-size:9.5px;letter-spacing:.1em;color:var(--ink2)}
.wk-badge{margin-left:auto;font-size:9.5px;letter-spacing:.08em;font-weight:700}
.wk-body{padding:11px 13px 10px;display:flex;flex-direction:column;gap:6px;flex:1}
.wk-theme{font-size:14px;letter-spacing:.01em;font-weight:700;line-height:1.25}
.cap-tag{font-size:9px;letter-spacing:.1em;border:1.5px solid var(--accent);color:var(--accent);
  padding:1px 5px;vertical-align:middle;white-space:nowrap}
.wk-goal{margin:0;font-size:12.5px;color:var(--ink2);line-height:1.5;flex:1}
.wk-rail{height:5px;background:var(--paper2);border:1px solid var(--rule);margin-top:auto}
.wk-rail i{display:block;height:100%;width:0;background:var(--color-upcoming);transition:width .35s}
.wk.done .wk-rail i{background:var(--color-done)}
.wk.today .wk-rail i{background:var(--color-progress)}
.wk-frac{font-variant-numeric:tabular-nums;color:var(--ink2);font-weight:700}
.wk.done .wk-frac{color:var(--color-done)}
.wk.today .wk-frac{color:var(--color-progress)}
.wk.done{background:var(--wash-done)}
.wk-foot{display:flex;justify-content:space-between;gap:10px;font-size:10px;letter-spacing:.06em;
  border-top:1px solid var(--rule);padding-top:9px;align-items:center}
.wk-repo{color:var(--ink3)}
.wk-jump{text-decoration:none;font-weight:700;color:var(--accent)}
.wk.next .wk-jump{color:var(--ink2)}

.cap-group{grid-column:1/-1;display:grid;grid-template-columns:26px 1fr;gap:0;
  border:1.5px dashed var(--color-upcoming);border-right:0;padding:9px 0 9px 0}
.cap-group.done{border-color:var(--color-done)}
.cap-group.today{border-color:var(--color-progress)}
.cap-bracket{position:relative;display:flex;align-items:center;justify-content:center}
.cap-lbl{writing-mode:vertical-rl;transform:rotate(180deg);font-size:8.5px;letter-spacing:.2em;
  font-weight:700;color:var(--ink3);white-space:nowrap}
.cap-group.done .cap-lbl{color:var(--color-done)}
.cap-group.today .cap-lbl{color:var(--color-progress)}
.cap-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:13px;
  padding-right:9px}

/* ============================ POSITION ============================ */
.here-strip{border:3px solid var(--color-today);background:var(--wash-today);padding:13px 17px;
  display:flex;gap:18px;align-items:center;flex-wrap:wrap;margin-bottom:18px;
  box-shadow:5px 5px 0 var(--color-today)}
.here-l{font-size:10px;letter-spacing:.2em;color:var(--color-today-text);font-weight:700;writing-mode:vertical-rl;
  transform:rotate(180deg);border-right:2px solid var(--color-today);padding-right:8px;align-self:stretch}
.here-m{flex:1 1 260px;min-width:0}
.here-day{font-family:var(--disp);font-size:30px;color:var(--color-today-text);line-height:1}
.here-t{font-size:16px;font-weight:600;margin:3px 0 5px}
.here-s{font-size:10px;letter-spacing:.1em;color:var(--ink2)}
.here-go{margin-left:auto;border:2px solid var(--color-today);background:var(--color-today);color:var(--color-today-on);
  padding:10px 15px;font-size:10.5px;letter-spacing:.1em;font-weight:700;text-decoration:none}
.here-go:hover{background:var(--ink);border-color:var(--ink)}
.pos-grid{display:grid;grid-template-columns:auto 1fr;gap:30px;align-items:start}
.daygrid{display:flex;flex-direction:column;gap:5px}
.dg-head,.dg-row{display:grid;grid-template-columns:34px repeat(7,52px) 40px;gap:5px;
  align-items:center}
.dg-col{font-size:9px;letter-spacing:.1em;color:var(--ink3);text-align:center}
.dg-wk{font-size:9.5px;letter-spacing:.08em;color:var(--ink2);text-decoration:none;
  font-weight:700;text-align:right;padding-right:2px}
.dg-wk:hover{color:var(--ink)}
.dg-tally{font-size:9.5px;color:var(--ink3);text-align:right;font-variant-numeric:tabular-nums}
.dg-tally.full{color:var(--color-done);font-weight:700}
.dg-tally.part{color:var(--color-progress);font-weight:700}
.cell{position:relative;height:52px;border:1.5px solid var(--color-upcoming);background:var(--paper);
  display:flex;align-items:center;justify-content:center;text-decoration:none;color:var(--ink3)}
.cell .c-n{font-size:12px;font-weight:600}
.cell.done{background:var(--color-done);border-color:var(--color-done);color:var(--color-done-on)}
.cell.done::after{content:"\2713";position:absolute;top:1px;right:4px;font-size:10px;opacity:.9}
.cell.part{background:var(--wash-progress);border-color:var(--color-progress);
  color:var(--color-progress)}
.cell.part::after{content:"\25D0";position:absolute;top:1px;right:4px;font-size:9px}
.cell.today{background:var(--color-today);border-color:var(--color-today);
  color:var(--color-today-on);animation:cellpulse 2.6s ease-out infinite}
@keyframes cellpulse{
  0%,100%{box-shadow:0 0 0 0 color-mix(in srgb, var(--color-today) 60%, transparent)}
  55%{box-shadow:0 0 0 7px color-mix(in srgb, var(--color-today) 0%, transparent)}}
.cell.today .c-n{font-family:var(--disp);font-size:17px}
.cell.boss{border-width:3px;border-color:var(--color-boss)}
.cell:hover,.cell:focus-visible{outline:2px solid var(--rule-hard);outline-offset:1px;z-index:3}
.here{position:absolute;bottom:-13px;left:50%;transform:translateX(-50%);font-size:7.5px;
  letter-spacing:.1em;color:var(--color-today-text);font-weight:700;background:var(--paper);
  padding:0 3px;z-index:2}
.pos-side{display:flex;flex-direction:column;gap:16px;min-width:0}
.legend{display:flex;flex-direction:column;gap:9px;font-size:10px;letter-spacing:.1em;
  color:var(--ink2);border:2px solid var(--rule-hard);padding:13px 15px}
.legend span{display:flex;align-items:center;gap:9px}
.legend b{font-weight:inherit}
.sw{width:13px;height:13px;border:1.5px solid var(--color-upcoming);display:block;flex:none}
.sw.done{background:var(--color-done);border-color:var(--color-done)}
.sw.today{background:var(--color-today);border-color:var(--color-today)}
.sw.part{background:var(--wash-progress);border-color:var(--color-progress)}
.sw.boss{border-width:3px;border-color:var(--color-boss)}

/* one tooltip, moved to the hovered square */
.tip{position:fixed;z-index:200;max-width:330px;background:var(--chrome);color:var(--chrome-on);
  border:2px solid var(--rule-hard);padding:10px 13px;pointer-events:none;opacity:0;
  transition:opacity .11s;box-shadow:5px 5px 0 rgba(0,0,0,.22)}
.tip.on{opacity:1}
.tip-h{font-family:var(--mono);font-size:10px;letter-spacing:.1em;font-weight:700;
  display:flex;gap:9px;align-items:baseline;flex-wrap:wrap;margin-bottom:5px}
.tip-st{padding:1px 6px;font-size:8.5px}
.tip-st.done{background:var(--color-done);color:var(--color-done-on)}
.tip-st.today{background:var(--color-today);color:var(--color-today-on)}
.tip-st.part{background:var(--color-progress);color:var(--color-progress-on)}
.tip-st.next{border:1px solid #4a4e57;color:#a9adb5}
.tip-boss{border:1px solid var(--color-boss);color:#e08a8a;padding:1px 6px;font-size:8.5px}
.tip-t{font-size:14px;font-weight:600;line-height:1.3;margin-bottom:6px}
.tip-b{font-size:12px;line-height:1.5;color:#c3c7cd}
.tip-b code{background:#2a2e35;border-color:#3a3f47;color:#e4e1d8}
.nextup{margin-top:16px;border:2px solid var(--rule-hard);padding:11px 15px;font-size:11.5px;
  display:flex;gap:9px;flex-wrap:wrap;align-items:center}
.nextup a{text-decoration:none;border-bottom:1px solid var(--rule2)}
.nextup a:hover{border-color:var(--accent);color:var(--accent)}
.nu-l{font-size:9.5px;letter-spacing:.16em;color:var(--accent);font-weight:700;
  border-right:2px solid var(--rule-hard);padding-right:11px}

/* ============================= RITUAL ============================= */
.loop-strip{display:flex;flex-wrap:wrap;border-top:2px solid var(--rule-hard);border-left:2px solid var(--rule-hard)}
.loop-cell{flex:1 1 118px;min-width:118px;border-right:2px solid var(--rule-hard);
  border-bottom:2px solid var(--rule-hard);padding:13px 13px 15px;background:var(--paper)}
.lc-n{font-family:var(--disp);font-size:18px;color:var(--accent);line-height:1}
.lc-t{font-size:10.5px;letter-spacing:.09em;font-weight:700;margin:7px 0 5px}
.lc-s{font-size:11.5px;color:var(--ink2);line-height:1.4}
.ritual-note{margin:16px 0 0;font-size:14px;color:var(--ink2);max-width:76ch;
  border-left:3px solid var(--rule-hard);padding-left:16px}

/* =============================== XP =============================== */
.xp-grid{display:grid;grid-template-columns:1.55fr 1fr;gap:2px;background:var(--rule-hard);
  border:3px solid var(--rule-hard)}
.xp-table{background:var(--paper);padding:0}
.xp-table table{border-collapse:collapse;width:100%;font-size:12.5px}
.xp-table th{background:var(--paper2);font-family:var(--mono);font-size:9.5px;letter-spacing:.13em;
  text-align:left;padding:10px 15px;border-bottom:2px solid var(--rule-hard);color:var(--ink2)}
.xp-table td{padding:11px 15px;border-bottom:1px solid var(--rule);color:var(--ink2)}
.xp-table td:first-child{color:var(--ink);font-size:11px;letter-spacing:.06em;font-weight:600}
.xp-table td.val{font-variant-numeric:tabular-nums;font-weight:700;color:var(--ink);
  text-align:right;width:64px;font-size:13px}
.xp-table tr.total td{background:var(--paper2);border-bottom:0;border-top:2px solid var(--rule-hard)}
.xp-table tr.total td.val{color:var(--accent);font-size:15px}
.xp-side{background:var(--paper);padding:18px;display:flex;flex-direction:column;gap:2px}
.xp-big{border:2px solid var(--rule-hard);padding:13px 15px;margin-bottom:10px}
.xp-num{font-family:var(--disp);font-size:32px;line-height:1;font-variant-numeric:tabular-nums}
.xp-big+.xp-big .xp-num{color:var(--color-streak)}
.fire{font-size:19px;margin-left:6px}
.xp-big .lbl{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;color:var(--ink2);margin-top:6px}
.xp-rule{font-size:9.5px;letter-spacing:.13em;color:var(--accent);font-weight:700;
  border-top:2px solid var(--rule-hard);padding-top:11px;margin-top:auto}
.xp-rule .dim{font-size:12px;letter-spacing:0;font-weight:400;line-height:1.5;
  font-family:var(--sans);text-transform:none;display:block;margin-top:5px}
.ms-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:2px;
  background:var(--rule-hard);border:2px solid var(--rule-hard)}
.ms{background:var(--paper);padding:13px 15px;display:flex;flex-direction:column;gap:6px}
.ms.locked .ms-n{color:var(--ink3)}
.ms.locked .ms-s{color:var(--ink3)}
.ms-r{font-size:11px;letter-spacing:.02em;color:var(--ink);background:transparent;
  border:0;border-bottom:1px dashed var(--rule2);padding:4px 1px;width:100%;margin-top:2px}
.ms-r::placeholder{color:var(--ink3);font-style:italic}
.ms-r:focus{outline:0;border-bottom-color:var(--ink);background:var(--paper2)}
.ms.done .ms-r{border-bottom-color:var(--color-done)}
.xp-state{font-size:9px;letter-spacing:.09em;font-weight:700;padding:2px 7px;white-space:nowrap;
  display:inline-block}
.xp-state.earned{background:var(--wash-done);color:var(--color-done);
  box-shadow:inset 2px 0 0 var(--color-done)}
.xp-state.open{color:var(--ink2);border:1px solid var(--rule2)}
.xp-state.none{color:var(--ink2);border:0}
.xp-table td:last-child{text-align:right;width:96px}
.ms-n{font-size:10.5px;letter-spacing:.09em;font-weight:700}
.ms-s{font-size:9.5px;letter-spacing:.1em;color:var(--ink3)}
.ms.done .ms-s{color:var(--ink)}
.ms.done{background:var(--wash-done);box-shadow:inset 3px 0 0 var(--color-done)}
.ms.done .ms-n{color:var(--color-done)}

/* ============================ RESOURCES =========================== */
.fold{border:2px solid var(--rule-hard);margin-bottom:-2px;background:var(--paper)}
.fold summary{padding:13px 16px;cursor:pointer;display:flex;align-items:center;gap:13px;
  list-style:none;font-weight:600;font-size:14.5px}
.fold summary::-webkit-details-marker{display:none}
.fold-n{font-size:10px;letter-spacing:.1em;color:var(--accent);border:1.5px solid var(--accent);
  padding:2px 6px;font-weight:700;flex:none}
.fold-t{flex:1;min-width:0}
.fold-x{margin-left:auto;font-size:17px;color:var(--ink2);flex:none;line-height:1}
.fold[open] .fold-x{transform:rotate(45deg)}
.fold[open] summary{border-bottom:2px solid var(--rule-hard);background:var(--paper2)}
.fold-body{padding:6px 20px 20px}

/* ============================== DAYS ============================== */
.wkblock{border:3px solid var(--rule-hard);margin-bottom:24px;background:var(--paper)}
.wkblock.today{border-color:var(--color-progress);box-shadow:5px 5px 0 var(--color-progress)}
.wkblock.done{border-color:var(--color-done)}
.wkblock.done .wkblock-h{background:var(--color-done);color:var(--color-done-on)}
.wkblock.next{border-color:var(--rule2)}
.wkblock-h{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;
  padding:13px 18px;background:var(--chrome);color:var(--chrome-on)}
.wkblock.today .wkblock-h{background:var(--color-progress);color:var(--color-progress-on)}
.wkblock.next .wkblock-h{background:var(--paper2);color:var(--ink)}
.wb-l{display:flex;align-items:baseline;gap:13px;flex-wrap:wrap}
.wb-n{font-size:10.5px;letter-spacing:.16em;opacity:.75}
.wb-t{font-family:var(--disp);font-size:17px;letter-spacing:-.005em}
.wb-r{font-size:10px;letter-spacing:.1em;opacity:.85}
.wb-goal{margin:0;padding:14px 18px;font-size:13.5px;color:var(--ink2);border-bottom:2px solid var(--rule-hard);
  background:var(--paper2)}
.days{padding:0}
.day{border-bottom:1px solid var(--rule);padding:20px 18px 24px}
.day:last-child{border-bottom:0}
.day.done{background:repeating-linear-gradient(135deg,transparent,transparent 9px,
  var(--hatch) 9px,var(--hatch) 18px);box-shadow:inset 4px 0 0 var(--color-done)}
.day.done .day-st{color:var(--color-done)}
.day.next .day-st{color:var(--ink3)}
.day.today{background:var(--wash-today);border-top:3px solid var(--color-today);
  border-bottom:3px solid var(--color-today)}
.day-head{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;
  border-bottom:2px solid var(--rule-hard);padding-bottom:11px;margin-bottom:14px}
.day-id{display:flex;flex-direction:column;gap:3px;flex:none}
.day-n{font-family:var(--disp);font-size:30px;line-height:1}
.day.done .day-n{color:var(--color-done)}
.day.today .day-n{color:var(--color-today-text)}
.day-st{font-size:9px;letter-spacing:.12em;color:var(--ink2);font-weight:700}
.day.today .day-st{color:var(--color-today-text)}
.day-title{flex:1;min-width:0;display:flex;align-items:center;gap:11px;flex-wrap:wrap}
.day-title h4{font-size:19px;letter-spacing:-.01em;font-weight:700}
.day.done .day-title h4{color:var(--ink2)}
.boss-tag,.day-xp{font-size:9px;letter-spacing:.11em;padding:2px 7px;border:1.5px solid var(--rule-hard);
  font-weight:700;white-space:nowrap}
.boss-tag{border-color:var(--color-boss);color:var(--color-boss)}
.day-xp{border-color:var(--rule2);color:var(--ink2);margin-left:auto}
.target{border:2px solid var(--rule-hard);padding:11px 15px;margin-bottom:16px;display:flex;gap:15px;
  align-items:flex-start;flex-wrap:wrap;background:var(--paper)}
.day.today .target{border-color:var(--color-today)}
.t-l{font-size:9px;letter-spacing:.15em;color:var(--accent);font-weight:700;flex:none;padding-top:3px}
.t-b{flex:1;min-width:220px;font-size:14px}
.steps{display:flex;flex-direction:column;gap:0}
.step{display:grid;grid-template-columns:150px 1fr;gap:20px;padding:13px 0;
  border-top:1px solid var(--rule)}
.step-h{font-size:9.5px;letter-spacing:.13em;color:var(--ink2);font-weight:700;padding-top:3px;
  display:flex;gap:8px;align-items:baseline}
.step-n{color:var(--accent);font-size:10px}
.step-b{min-width:0}

/* ============================== PROSE ============================= */
.prose>:first-child{margin-top:0}
.prose>:last-child{margin-bottom:0}
.prose p{margin:9px 0;font-size:14px}
.prose ul,.prose ol{margin:9px 0;padding-left:20px}
.prose li{margin:4px 0;font-size:14px}
.prose h3{font-size:15px;margin:18px 0 7px}
.prose strong{font-weight:700}
.prose a{color:var(--ink);text-decoration:none;border-bottom:1.5px solid var(--accent)}
.prose a:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
.prose code{font-family:var(--mono);font-size:.86em;background:var(--paper2);
  border:1px solid var(--rule);padding:.08em .32em}
.prose pre.code{background:var(--chrome);color:var(--chrome-on);border:0;padding:14px 16px;overflow-x:auto;
  font-size:12.5px;line-height:1.6;margin:12px 0}
.prose pre.code code{background:none;border:0;padding:0;color:inherit}
.prose blockquote{margin:12px 0;padding:10px 15px;border-left:3px solid var(--accent);
  background:var(--paper2);font-size:13.5px;color:var(--ink2)}
.prose blockquote>:first-child{margin-top:0}
.prose blockquote>:last-child{margin-bottom:0}
.prose hr{border:0;border-top:1px solid var(--rule);margin:16px 0}
.table-wrap{overflow-x:auto;border:2px solid var(--rule-hard);margin:12px 0}
.prose table{border-collapse:collapse;width:100%;font-size:12.5px}
.prose th{background:var(--chrome);color:var(--chrome-on);font-family:var(--mono);font-size:9.5px;
  letter-spacing:.11em;text-align:left;padding:8px 12px;text-transform:uppercase}
.prose td{padding:8px 12px;border-bottom:1px solid var(--rule);color:var(--ink2)}
.prose tr:last-child td{border-bottom:0}
ul.checks{list-style:none;padding-left:0!important}
li.check{margin:0!important}
li.check label{display:flex;gap:10px;align-items:flex-start;padding:5px 8px;cursor:pointer;
  border-bottom:1px solid var(--rule)}
li.check label:hover{background:var(--paper2)}
li.check input{appearance:none;width:15px;height:15px;flex:none;margin-top:3px;
  border:1.5px solid var(--ink2);background:var(--paper);cursor:pointer;position:relative}
li.check input:checked{background:var(--color-done);border-color:var(--color-done)}
li.check input:checked::after{content:"✓";position:absolute;inset:0;display:grid;place-items:center;
  color:var(--paper);font-size:11px;font-weight:700}
li.check input:disabled{cursor:default}
li.check input:checked~span{color:var(--ink3);text-decoration:line-through}

/* ============================= CONSOLE ============================ */
.console-sec{padding-top:22px;padding-bottom:26px}
.console{border:3px solid var(--rule-hard);box-shadow:6px 6px 0 var(--rule-hard);background:var(--paper)}
.console.v-today{box-shadow:6px 6px 0 var(--color-today)}
.console.v-done{box-shadow:6px 6px 0 var(--color-done)}
.console.v-next{box-shadow:6px 6px 0 var(--color-upcoming)}
.con-bar{display:flex;gap:16px;align-items:center;flex-wrap:wrap;padding:11px 16px;
  background:var(--chrome);color:var(--chrome-on)}
.con-l{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;min-width:0;flex:1}
.con-eyebrow{font-size:9px;letter-spacing:.18em;font-weight:700;padding:3px 8px;
  background:var(--ink2);color:var(--paper);flex:none}
.con-eyebrow.is-today{background:var(--color-today);color:var(--color-today-on)}
.con-eyebrow.is-done{background:var(--color-done);color:var(--color-done-on)}
.con-eyebrow.is-next{background:transparent;color:#8b8d94;border:1.5px solid #3b3f47}
.con-day{font-family:var(--disp);font-size:21px;line-height:1;flex:none}
.con-title{font-size:13px;color:#b6b3ab;letter-spacing:.02em;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap;min-width:0}
.con-nav{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.nb{font-family:var(--mono);font-size:9.5px;letter-spacing:.11em;font-weight:700;
  background:transparent;color:var(--chrome-on);border:1.5px solid #3b3f47;padding:6px 10px;
  cursor:pointer;line-height:1}
.nb:hover:not(:disabled){background:#2c3037;border-color:#5a5f68}
.nb:disabled{opacity:.32;cursor:default}
#weekJump{font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;background:var(--chrome-on);
  color:var(--chrome);border:1.5px solid var(--chrome-on);padding:6px 8px;max-width:230px;cursor:pointer}
.con-target{display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap;padding:13px 16px;
  border-bottom:2px solid var(--rule-hard);background:var(--accent-w)}
.con-xp{display:flex;gap:14px;align-items:center;flex-wrap:wrap;padding:10px 16px;
  border-bottom:2px solid var(--rule-hard)}
.con-rail{flex:1 1 240px;height:12px;border:2px solid var(--rule-hard);background:var(--paper2)}
.con-rail i{display:block;height:100%;background:var(--color-progress);transition:width .2s}
.con-rail i.full{background:var(--color-done)}
.con-xp-t{font-size:10.5px;letter-spacing:.11em;color:var(--ink2);font-weight:700}
.con-groups{display:flex;flex-wrap:wrap;background:var(--paper);
  border-bottom:2px solid var(--rule-hard)}
.cgroup{flex:1 1 300px;min-width:265px;background:var(--paper);padding:12px 15px 14px;
  border-top:2px solid var(--rule-hard);border-right:2px solid var(--rule-hard)}
.cgroup:last-child{border-right:0}
.cgroup.full{background:var(--wash-done)}
.cgroup.full .cg-k{color:var(--color-done)}
.cg-h{display:flex;gap:9px;align-items:baseline;flex-wrap:wrap;margin-bottom:7px;
  padding-bottom:6px;border-bottom:1px solid var(--rule)}
.cg-k{font-size:10px;letter-spacing:.13em;font-weight:700;color:var(--accent)}
.cgroup.full .cg-k{color:var(--ink)}
.cg-l{font-size:9px;letter-spacing:.09em;color:var(--ink3);flex:1;min-width:0}
.cg-x{font-size:9.5px;letter-spacing:.08em;font-weight:700;color:var(--ink2)}
.cg-b .prose p:first-child,.cg-b p:first-child{margin-top:0}
.cg-b{font-size:13px}
.cg-b p{font-size:13px;margin:6px 0}
.cg-b li{font-size:13px}
.con-foot{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:10px 16px;
  font-size:9.5px;letter-spacing:.11em}
.con-foot a{color:var(--accent);text-decoration:none;font-weight:700}
.con-foot a:hover{text-decoration:underline}
.con-kbd{color:var(--ink3)}
.jt-live{margin-left:auto;display:flex;align-items:center;gap:2px;padding:0 16px;flex-shrink:0;
  font-size:10px;letter-spacing:.1em;color:#cfcbc0;border-left:1px solid #2c2f36}
.jt.on{background:var(--chrome-on);color:var(--chrome);font-weight:700}
.jt-theme{flex-shrink:0;display:flex;align-items:center;gap:7px;padding:0 16px;height:100%;
  background:transparent;border:0;border-left:1px solid #3a3f47;color:#cfcbc0;cursor:pointer;
  font-family:var(--mono);font-size:10px;letter-spacing:.13em;font-weight:700}
.jt-theme:hover{background:#2c3037;color:#fff}
.jt-theme .tg-g{font-size:13px;line-height:1}
.jt-live+.jt-theme{border-left:1px solid #3a3f47}

.con-set{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:9px 16px;
  border-bottom:2px solid var(--rule-hard);background:var(--paper2)}
.cs-l{font-size:9px;letter-spacing:.16em;font-weight:700;color:var(--ink2);flex:none}
#setDay{font-family:var(--mono);font-size:12px;padding:7px 10px;border:2px solid var(--rule-hard);
  background:var(--paper);color:var(--ink);width:250px;max-width:100%}
#setDay:focus{outline:2px solid var(--rule-hard);outline-offset:-2px}
.btn.sm{padding:7px 12px;font-size:9.5px}
.cs-msg{font-size:10px;letter-spacing:.09em;color:var(--ink2);flex:1;min-width:150px}
.cs-msg.ok{color:var(--ink)}
.cs-msg.err{color:var(--accent);font-weight:700}
.cs-undo{background:none;border:0;padding:0 0 0 8px;font-family:var(--mono);font-size:10px;
  letter-spacing:.09em;color:var(--accent);font-weight:700;cursor:pointer;text-decoration:underline}

.pa-grid{display:flex;flex-wrap:wrap;background:var(--paper);
  border:2px solid var(--rule-hard);border-bottom:0}
.pa-cell{flex:1 1 215px;min-width:200px;background:var(--paper);padding:13px 15px;
  border-right:2px solid var(--rule-hard);border-bottom:2px solid var(--rule-hard)}
.pa-cell:last-child{border-right:0}
.pa-w{font-size:9.5px;letter-spacing:.14em;color:var(--ink3);font-weight:700}
.pa-t{font-size:14px;font-weight:700;margin:4px 0 4px;letter-spacing:-.005em}
.pa-d{font-size:12.5px;color:var(--ink2);line-height:1.45}
.pa-note{margin:16px 0 0;font-size:14px;color:var(--ink2);max-width:76ch;
  border-left:3px solid var(--rule-hard);padding-left:16px}

.star-block{margin-top:22px;padding-top:16px;border-top:2px solid var(--rule-hard)}
.star-h{display:flex;align-items:center;gap:9px;font-size:11px;letter-spacing:.11em;
  font-weight:700;color:var(--ink);text-transform:uppercase;margin-bottom:6px}
.star-ico{font-size:14px;color:var(--color-progress)}
.star-note{font-size:12.5px;color:var(--ink2);margin:0 0 12px}
.star-grid{display:flex;flex-wrap:wrap;background:var(--paper);
  border:2px solid var(--rule-hard);border-bottom:0}
.star-slot{flex:1 1 300px;min-width:270px;background:var(--paper);padding:12px 14px 11px;
  display:flex;flex-direction:column;gap:6px;border-right:2px solid var(--rule-hard);
  border-bottom:2px solid var(--rule-hard)}
.star-slot:last-child{border-right:0}
.ss-h{display:flex;gap:9px;align-items:baseline;font-size:10px;letter-spacing:.1em;font-weight:700}
.ss-n{color:var(--color-progress)}
.ss-t{color:var(--ink)}
.ss-p{font-size:12px;color:var(--ink2);line-height:1.45}
.ss-in{font-family:var(--sans);font-size:13px;line-height:1.5;color:var(--ink);
  background:var(--paper2);border:1px solid var(--rule);padding:8px 10px;resize:vertical;width:100%}
.ss-in::placeholder{color:var(--ink3);font-style:italic}
.ss-in:focus{outline:2px solid var(--ink);outline-offset:-2px}
.ss-f{display:flex;justify-content:space-between;gap:10px;font-size:9px;letter-spacing:.1em;
  color:var(--ink3)}
.ss-f [data-startag].filled{color:var(--color-done);font-weight:700}
.ss-hint{font-style:italic}

.con-date{font-size:9.5px;letter-spacing:.13em;color:#8b8f97;flex:none}
.jt-gear{font-size:15px;padding:0 14px;letter-spacing:0}
.cfg{border:3px solid var(--rule-hard);background:var(--paper);color:var(--ink);padding:0;
  max-width:520px;width:calc(100% - 32px);box-shadow:8px 8px 0 var(--chrome)}
.cfg::backdrop{background:rgba(10,12,15,.55)}
.cfg-in{padding:0}
.cfg-h{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;
  background:var(--chrome);color:var(--chrome-on);font-size:11px;letter-spacing:.16em;font-weight:700}
.cfg-x{background:none;border:0;color:var(--chrome-on);font-size:20px;line-height:1;cursor:pointer;
  padding:0 2px}
.cfg-note{font-size:12.5px;color:var(--ink2);margin:0;padding:13px 16px 4px;line-height:1.5}
.cfg-f{display:flex;flex-direction:column;gap:5px;padding:9px 16px}
.cfg-f>span{font-size:9px;letter-spacing:.14em;color:var(--ink2);font-weight:700}
.cfg-f>span i{color:var(--ink3);font-style:normal;font-weight:400}
.cfg-f input[type=text],.cfg-f input[type=date],.cfg-f input[type=number]{
  font-family:var(--sans);font-size:14px;padding:8px 10px;border:2px solid var(--rule-hard);
  background:var(--paper2);color:var(--ink);width:100%}
.cfg-f input:focus{outline:2px solid var(--color-today);outline-offset:-2px}
.cfg-row{display:flex;gap:0;flex-wrap:wrap}
.cfg-row .cfg-f{flex:1 1 200px}
.cfg-hint{margin:0;padding:0 16px 6px;font-size:9px;letter-spacing:.1em;color:var(--ink3)}
.cfg-colour{display:flex;gap:9px;align-items:center;flex-wrap:wrap}
.cfg-colour input[type=color]{width:44px;height:36px;padding:0;border:2px solid var(--rule-hard);
  background:var(--paper2);cursor:pointer;flex:none}
.cfg-colour input[type=text]{width:100px;flex:none}
.cfg-contrast{font-size:9px;letter-spacing:.08em;color:var(--ink3);flex:1;min-width:120px}
.cfg-actions{display:flex;gap:9px;flex-wrap:wrap;padding:14px 16px 16px;
  border-top:2px solid var(--rule-hard);margin-top:8px}

/* ============================== BACKUP ============================ */
.backup{border:2px solid var(--rule-hard);padding:16px 18px;background:var(--paper)}
.bk-row{display:flex;gap:9px;flex-wrap:wrap}
.btn{font-family:var(--mono);font-size:10px;letter-spacing:.12em;font-weight:700;cursor:pointer;
  background:var(--chrome);color:var(--chrome-on);border:2px solid var(--chrome);padding:10px 15px;line-height:1}
.btn:hover{background:var(--ink2);border-color:var(--ink2)}
.btn.ghost{background:transparent;color:var(--ink)}
.btn.ghost:hover{background:var(--chrome);color:var(--chrome-on)}
.btn.danger{background:transparent;color:var(--ink);border-color:var(--ink);
  border-style:dashed}
.btn.danger:hover{background:var(--chrome);color:var(--chrome-on)}
.bk-note{font-size:12.5px;color:var(--ink2);margin:12px 0 0;max-width:72ch}
#ioBox{width:100%;height:150px;margin-top:12px;font-size:11.5px;padding:11px;
  border:2px solid var(--rule-hard);background:var(--paper2);color:var(--ink);resize:vertical}
.bk-stats{margin-top:13px;padding-top:11px;border-top:1px solid var(--rule);font-size:9.5px;
  letter-spacing:.11em;color:var(--ink2)}

/* ============================== FOOTER ============================ */
.foot{max-width:1180px;margin:0 auto;padding:30px 28px 60px;border-top:3px solid var(--rule-hard);
  display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;font-size:10px;
  letter-spacing:.11em;color:var(--ink2);text-transform:uppercase}

@media (max-width:1080px){.jt-live{display:none}}
@media (max-width:1080px){
  .pos-grid{grid-template-columns:1fr}
  .pos-side{max-width:640px}
}
@media (max-width:900px){
  .stats{grid-template-columns:repeat(3,1fr)}
  .arc{grid-template-columns:repeat(2,1fr)}
  .xp-grid{grid-template-columns:1fr}
  .step{grid-template-columns:1fr;gap:7px}
  .step-h{border-bottom:1px solid var(--rule);padding-bottom:6px}
  .mh-r{border-left:0;padding-left:0;text-align:left}
}
@media (max-width:560px){
  .sec{padding:36px 18px 32px}
  .masthead{padding:20px 18px 18px}
  .wrap,.foot{padding-left:18px;padding-right:18px}
  .stats{grid-template-columns:repeat(2,1fr)}
  .arc{grid-template-columns:1fr}
  .here-l{writing-mode:horizontal-tb;transform:none;border-right:0;border-bottom:2px solid var(--accent);
    padding:0 0 6px;align-self:auto}
  .punch{width:34px;height:34px}
  .punch.today{width:46px;height:46px}
  .here-go{margin-left:0}
  .cgroup{flex:1 1 100%;min-width:0;border-right:0}
  .dg-head,.dg-row{grid-template-columns:22px repeat(7,1fr) 26px;gap:3px}
  .cell{height:38px}
  .cell .c-n{font-size:10px}
  .cell.today .c-n{font-size:13px}
  .dg-wk,.dg-tally,.dg-col{font-size:8px}
  .tip{max-width:calc(100vw - 24px)}
  .cap-group{grid-template-columns:20px 1fr}
  .cap-cards{padding-right:6px}
  .jt-live{display:none}
  .con-nav{width:100%}
  #weekJump{flex:1;max-width:none}
}
@media print{
  .jumpstrip{display:none}
  .fold[open] .fold-body,.fold .fold-body{display:block}
  .day,.wk,.fold{break-inside:avoid}
  body{font-size:11px}
}
'''

JS = r'''
(function(){
  'use strict';
  var D=window.DAYS, TOTAL=__TOTAL__, SEED=__SEED__;
  var XP={REVIEW:20,READ:30,BUILD:50,PRACTICE:20,RECALL:25}, BONUS=25, KEY='daily-executor.v4';
  var WC=window.WorkspaceCore, JD=window.Judge;   // question rules: hints, XP cost, saved attempts
  var $=function(i){return document.getElementById(i)};
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var days=Object.keys(D).map(Number).sort(function(a,b){return a-b});

  /* ------------------------------------------------------------ config */
  var CKEY='daily-executor.config';
  var DEFAULTS=Object.assign({programTitle:'AI + Data + Lakehouse Engineer',
    targetRole:'Data / AI Engineer',startDate:'',currentDay:1,userName:'',
    accentColor:'#c47f17'}, window.CONFIG||{});
  var C=Object.assign({},DEFAULTS);
  try{var saved=JSON.parse(localStorage.getItem(CKEY));
      if(saved&&typeof saved==='object')C=Object.assign(C,saved)}catch(e){}
  function saveConfig(){try{localStorage.setItem(CKEY,JSON.stringify(C))}catch(e){}}
  function clampDay(n){n=Math.round(+n||1);return n<1?1:(n>TOTAL?TOTAL:n)}

  /* The day the reader is on. startDate makes it advance by the calendar;
     with no startDate the explicit currentDay is used. */
  function curDay(){
    if(C.startDate){
      var t=Date.parse(C.startDate+'T00:00:00');
      if(!isNaN(t)){
        var now=new Date(); now.setHours(0,0,0,0);
        return clampDay(Math.floor((now-t)/86400000)+1);
      }
    }
    return clampDay(C.currentDay);
  }
  function dateOfDay(n){
    if(!C.startDate)return '';
    var t=Date.parse(C.startDate+'T00:00:00');
    if(isNaN(t))return '';
    var d=new Date(t+(n-1)*86400000);
    return d.toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'});
  }

  /* ---- accent: derive the readable partners rather than trusting a guess ---- */
  function toRgb(h){h=(h||'').replace('#','');
    if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    return [0,2,4].map(function(i){return parseInt(h.slice(i,i+2),16)||0})}
  function relLum(c){var x=c.map(function(v){v/=255;
    return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});
    return 0.2126*x[0]+0.7152*x[1]+0.0722*x[2]}
  function ratio(a,b){var l1=relLum(a),l2=relLum(b),hi=Math.max(l1,l2),lo=Math.min(l1,l2);
    return (hi+0.05)/(lo+0.05)}
  function hex(c){return '#'+c.map(function(v){
    v=Math.max(0,Math.min(255,Math.round(v)));
    return (v<16?'0':'')+v.toString(16)}).join('')}
  function shiftTo(c,ground,target,up){
    var out=c.slice(), guard=0;
    while(ratio(out,ground)<target&&guard++<60){
      out=out.map(function(v){return up?v+(255-v)*0.06:v*0.94});
    }
    return out;
  }
  function applyAccent(){
    var root=document.documentElement, st=root.style;
    if(!C.accentColor||!/^#[0-9a-f]{3,6}$/i.test(C.accentColor)){
      ['--color-today','--color-today-on','--color-today-text','--color-today-sub']
        .forEach(function(k){st.removeProperty(k)});
      return;
    }
    var dark=effective()==='dark';
    var acc=toRgb(C.accentColor);
    // a light-mode accent is too dark to carry a dark ground; lift it there
    if(dark)acc=shiftTo(acc,toRgb('#14171a'),4.5,true);
    var ground=toRgb(dark?'#14171a':'#f4f2ec');
    var onDark=toRgb('#16181c'), onLight=toRgb('#ffffff');
    var on=ratio(acc,onDark)>=ratio(acc,onLight)?onDark:onLight;
    st.setProperty('--color-today',hex(acc));
    st.setProperty('--color-today-on',hex(on));
    st.setProperty('--color-today-text',hex(shiftTo(acc,ground,4.5,dark)));
    st.setProperty('--color-today-sub',hex(shiftTo(on,acc,4.5,relLum(on)>relLum(acc))));
  }
  function accentReport(){
    if(!/^#[0-9a-f]{3,6}$/i.test(C.accentColor||''))return '';
    var acc=toRgb(C.accentColor), g=toRgb('#f4f2ec');
    var r=ratio(acc,g);
    return r.toFixed(2)+':1 vs paper' + (r<3?' \u2014 very low, text on it is auto-darkened':'');
  }

  function applyConfig(){
    var t=(C.programTitle||'').trim()||DEFAULTS.programTitle;
    document.title=t+' \u2014 12-Week Program';
    $('mhTitle').textContent=t;
    var name=(C.userName||'').trim();
    $('mhKicker').innerHTML='DAILY EXECUTOR <span class="sep">/</span> 12-WEEK ENGINEERING PROGRAM'+
      (name?' <span class="sep">/</span> '+esc(name.toUpperCase()):'');
    var role=(C.targetRole||'').trim();
    $('mhRole').innerHTML=role?'BUILDS TOWARD: <b>'+esc(role)+'</b>'+
      (C.startDate?' <span class="sep">/</span> STARTED '+esc(dateOfDay(1)):''):'';
    applyAccent();
  }

  /* ------------------------------------------------------------- state */
  var S=load();
  function today(){var d=new Date();return stamp(d)}
  function stamp(d){return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())}
  function p2(n){return(n<10?'0':'')+n}
  function load(){
    var s=null;
    try{s=JSON.parse(localStorage.getItem(KEY))}catch(e){}
    if(s&&s.checks)return{checks:s.checks||{},log:s.log||{},rewards:s.rewards||{},star:s.star||{},
      started:s.started||today(),ws:WC.normalizeWs(s.ws)};
    // ships blank: no progress, no streak, day 1 -- ready for a stranger
    return {checks:{},log:{},rewards:{},star:{},started:today(),ws:WC.emptyWs()};
  }
  function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
  function on(k){return !!S.checks[k]}

  /* --------------------------------------------------------- scoring */
  function score(n){
    var c=D[n].cats, earned=0, all=true, has=0, tick=0, tot=0;
    for(var k in c){
      has++;
      var every=c[k].every(on);
      c[k].forEach(function(key){tot++; if(on(key))tick++});
      if(every)earned+=XP[k]; else all=false;
    }
    var done=has>0&&all;
    if(done)earned=D[n].max;           // cleared: the plan's own stated ceiling
    else if(earned>D[n].max)earned=D[n].max;
    // hints cost XP, but only where the question's category is fully earned, and never below 0
    var pen=0;
    if(D[n].probs){
      var fullCat={};
      for(var kc in c)fullCat[kc]=c[kc].every(on);
      pen=JD.penaltyFor(D[n].probs,S.ws.hints,fullCat);
    }
    return{xp:JD.applyPenalty(earned,pen),pen:pen,max:D[n].max,done:done,ticked:tick,total:tot};
  }
  function totals(){
    var xp=0,done=0,tick=0,tot=0;
    days.forEach(function(n){var s=score(n);xp+=s.xp;if(s.done)done++;tick+=s.ticked;tot+=s.total});
    return{xp:xp,done:done,ticked:tick,total:tot};
  }
  // "today" is what the reader configured; progress is tracked separately
  function firstOpen(){ return curDay(); }
  function firstUncleared(){
    for(var i=0;i<days.length;i++)if(!score(days[i]).done)return days[i];
    return days[days.length-1];
  }
  function streak(){
    var d=new Date(),n=0;
    if(!S.log[today()])d.setDate(d.getDate()-1);
    for(;;){ if(!S.log[stamp(d)])break; n++; d.setDate(d.getDate()-1); }
    return n;
  }

  /* ---------------------------------------------------------- console */
  var view=null;
  function render(n){
    if(!D[n])return;               // ignore an out-of-range or empty target
    view=n;
    var d=D[n], cur=firstOpen(), s=score(n);
    $('conEyebrow').textContent = n===cur?'TODAY':(s.done?'CLEARED':'UPCOMING');
    var vstate=(n===cur?'today':(s.done?'done':'next'));
    $('conEyebrow').className='con-eyebrow is-'+vstate;
    $('console').className='console v-'+vstate;
    var dstr=dateOfDay(n);
    $('conDay').textContent='DAY '+n+(dstr?'':'');
    var dd=$('conDate'); if(dd)dd.textContent=dstr?dstr.toUpperCase():'';
    $('conTitle').textContent=d.t+(d.boss?'  ·  BOSS LEVEL':'');
    $('conTarget').innerHTML=d.target||'<em>No cutoff target on this card.</em>';
    $('conOpen').setAttribute('href','#d'+n);
    $('weekJump').value=String(D[n].w?firstOfWeek(D[n].w):n);
    $('btnPrev').disabled=(n<=days[0]);
    $('btnNext').disabled=(n>=days[days.length-1]);
    $('btnToday').disabled=(n===cur);

    var g='';
    d.groups.forEach(function(gr){
      var keys=d.cats[gr.k]||[];
      var hit=keys.filter(on).length, full=keys.length&&hit===keys.length;
      var lbl=gr.label.toUpperCase().replace(/[^A-Z ]/g,'').trim();
      if(lbl.indexOf(gr.k)===0)lbl='';   // don't print "BUILD BUILD SAVE"
      g+='<div class="cgroup'+(full?' full':'')+'">'+
         '<div class="cg-h mono"><span class="cg-k">'+gr.k+'</span>'+
         '<span class="cg-l">'+lbl+'</span>'+
         '<span class="cg-x">'+(full?'✓ ':'')+'+'+XP[gr.k]+' XP</span></div>'+
         '<div class="cg-b prose">'+gr.html+'</div></div>';
    });
    $('conGroups').innerHTML=g;
    // console boxes share storage keys with the log, so reflect current state
    $('conGroups').querySelectorAll('input[type=checkbox]').forEach(function(cb){
      cb.disabled=false; cb.checked=on(cb.getAttribute('data-k'));
    });
    paintConsole();
  }
  function firstOfWeek(w){
    for(var i=0;i<days.length;i++)if(D[days[i]].w===w)return days[i];
    return days[0];
  }
  function paintConsole(){
    if(view==null)return;
    var s=score(view);
    $('conXp').textContent=WC.xpLabel(s.xp,s.max,s.pen);
    $('conChecks').textContent=s.ticked+' OF '+s.total+' TICKED';
    $('conRail').style.width=(s.total?s.ticked/s.total*100:0)+'%';
    $('conRail').className=s.done?'full':'';
    $('conGroups').querySelectorAll('.cgroup').forEach(function(el,i){
      var gr=D[view].groups[i]; if(!gr)return;
      var keys=D[view].cats[gr.k]||[];
      var full=keys.length&&keys.every(on);
      el.classList.toggle('full',full);
      var x=el.querySelector('.cg-x');
      if(x)x.textContent=(full?'✓ ':'')+'+'+XP[gr.k]+' XP';
    });
  }

  /* ------------------------------------------------------------ paint */
  function paint(){
    var t=totals(), cur=firstOpen(), stk=streak();
    var up=TOTAL-t.done-1; if(up<0)up=0;
    var nums=document.querySelectorAll('.stat .num');
    if(nums[2])nums[2].textContent=t.done;
    if(nums[4])nums[4].textContent=up;
    if(nums[5])nums[5].textContent=stk;
    var pct=Math.round(t.done/TOTAL*100);
    var fill=document.querySelector('.prog i'); if(fill)fill.style.width=(t.done/TOTAL*100)+'%';
    var mark=document.querySelector('.prog b'); if(mark)mark.style.left=(cur/TOTAL*100)+'%';
    var meta=document.querySelector('.prog-meta');
    if(meta)meta.innerHTML='<b>'+pct+'% OF PROGRAM COMPLETE</b> <span class="sep">/</span> '+
      t.done+' OF '+TOTAL+' DAYS <span class="sep">/</span> '+t.ticked+' OF '+t.total+
      ' CHECKS <span class="sep">/</span> '+t.xp.toLocaleString()+' XP BANKED';

    var xb=$('xpBank'); if(xb)xb.textContent=t.xp.toLocaleString();
    var xs=$('xpStreak'); if(xs)xs.innerHTML=stk+'<span class="fire">\uD83D\uDD25</span>';
    $('liveDay').textContent='DAY '+cur;
    $('liveXp').textContent=t.xp.toLocaleString()+' XP';
    $('liveStreak').textContent=stk+' 🔥';
    var mn=document.querySelector('.mh-now'); if(mn)mn.textContent='DAY '+cur+' / '+TOTAL;
    var ms=document.querySelector('.mh-sub');
    if(ms)ms.textContent='WEEK '+D[cur].w+' · '+D[cur].t;
    var mk=$('mhStreak'); if(mk)mk.textContent='STREAK '+stk+' 🔥';

    // punch card + here strip follow the live position
    var partial=0;
    document.querySelectorAll('.cell').forEach(function(el){
      var n=+el.dataset.day, s=score(n);
      var k=s.done?'done':(n===cur?'today':(s.ticked>0?'part':'next'));
      if(k==='part')partial++;
      el.classList.remove('done','today','next','part');
      el.classList.add(k);
      el.setAttribute('aria-label','Day '+n+', '+D[n].t+', '+
        (k==='done'?'complete':k==='today'?'today':k==='part'?'in progress':'upcoming'));
      var h=el.querySelector('.here');
      if(n===cur&&!h){h=document.createElement('span');h.className='here mono';h.textContent='HERE';el.appendChild(h)}
      else if(n!==cur&&h)h.remove();
    });
    document.querySelectorAll('[data-tally]').forEach(function(el){
      var w=+el.getAttribute('data-tally'),d=0,tot=0;
      days.forEach(function(n){if(D[n].w===w){tot++;if(score(n).done)d++}});
      el.textContent=d+'/'+tot;
      el.className='dg-tally mono'+(d===tot?' full':(d?' part':''));
    });
    var hd=document.querySelector('.here-day'); if(hd)hd.textContent='DAY '+cur;
    var ht=document.querySelector('.here-t'); if(ht)ht.textContent=D[cur].t;
    var hs=document.querySelector('.here-s'), cs=score(cur);
    if(hs)hs.innerHTML='WEEK '+D[cur].w+' <span class="sep">/</span> LEVEL '+cur+
      ' <span class="sep">/</span> '+cs.ticked+' OF '+cs.total+' CHECKS TICKED';
    var hg=document.querySelector('.here-go'); if(hg)hg.setAttribute('href','#d'+cur);

    // per-day XP chips + week tallies in the log
    days.forEach(function(n){
      var chip=document.querySelector('[data-xp="'+n+'"]'), s=score(n);
      if(chip)chip.textContent=WC.xpLabel(s.xp,s.max,s.pen);
      var card=document.getElementById('d'+n);
      if(card){card.classList.remove('done','today','next');
        card.classList.add(s.done?'done':(n===cur?'today':'next'));
        var st=card.querySelector('.day-st');
        if(st)st.textContent=(s.done?'✓ COMPLETE':(n===cur?'◐ TODAY':'○ UPCOMING'));}
    });
    document.querySelectorAll('.wkblock').forEach(function(wb){
      var d=0,tot=0;
      wb.querySelectorAll('.day').forEach(function(c){tot++;if(score(+c.dataset.day).done)d++});
      var r=wb.querySelector('.wb-r');
      if(r)r.innerHTML=r.innerHTML.replace(/[✓◐○] \d+\/\d+/,(d===tot?'✓':d?'◐':'○')+' '+d+'/'+tot);
    });
    document.querySelectorAll('.wk').forEach(function(card){
      var a=card.querySelector('.wk-jump'); if(!a)return;
      var w=+a.getAttribute('href').slice(2), d=0, tot=0;
      days.forEach(function(n){if(D[n].w===w){tot++;if(score(n).done)d++}});
      card.classList.remove('done','today','next');
      card.classList.add(d===tot?'done':(D[cur].w===w?'today':'next'));
      var b=card.querySelector('.wk-badge');
      if(b)b.textContent=d===tot?'✓ COMPLETE':(D[cur].w===w?'◐ '+d+'/'+tot+' DONE':'○ UPCOMING');
      var f=card.querySelector('[data-wkfill]');
      if(f)f.style.width=(tot?d/tot*100:0)+'%';
      var fr=card.querySelector('[data-wkfrac]');
      if(fr)fr.textContent=d+'/'+tot;
    });
    var lg={done:t.done,today:1,part:partial,next:TOTAL-t.done-1-partial};
    if(lg.next<0)lg.next=0;
    var lgw={done:'✓ COMPLETE',today:'◐ TODAY',part:'◐ IN PROGRESS',next:'○ UPCOMING'};
    document.querySelectorAll('[data-lg]').forEach(function(el){
      var k=el.getAttribute('data-lg');
      el.textContent=lgw[k]+' · '+lg[k];
    });
    var nu=document.querySelector('.nextup');
    if(nu){
      var chain=[];
      for(var i=0;i<days.length&&chain.length<4;i++){
        var n=days[i];
        if(n>=cur)chain.push('<a href="#d'+n+'">Day '+n+' '+esc(D[n].t)+'</a>');
      }
      nu.innerHTML='<span class="nu-l">NEXT UP</span>'+
        chain.join(' <span class="sep">→</span> ');
    }
    var cg=$('capGroup');
    if(cg){
      var cd=0,ct=0,live=false;
      days.forEach(function(n){
        if(D[n].w>=10&&D[n].w<=11){ct++;if(score(n).done)cd++;if(n===cur)live=true}
      });
      cg.className='cap-group'+(cd===ct?' done':(live?' today':''));
    }
    var bs=$('bkStats');
    if(bs)bs.textContent=t.done+' DAYS CLEARED / '+t.ticked+' OF '+t.total+' CHECKS / '+
      t.xp.toLocaleString()+' XP / '+stk+'-DAY STREAK / SAVED '+
      (Object.keys(S.log).length)+' ACTIVE DAYS';
    paintXp(cur);
    paintConsole();
  }

  function paintXp(cur){
    var n=(view!=null?view:cur), c=D[n].cats, sc=score(n);
    var rows={REVIEW:'review',READ:'read',BUILD:'build',PRACTICE:'practice',RECALL:'recall'};
    for(var k in rows){
      var el=document.querySelector('[data-xprow="'+rows[k]+'"]');
      if(!el)continue;
      var keys=c[k];
      if(!keys){el.className='xp-state mono none';el.textContent='—';continue}
      var full=keys.every(on);
      el.className='xp-state mono '+(full?'earned':'open');
      el.textContent=full?'✓ EARNED':'○ '+keys.filter(on).length+'/'+keys.length;
    }
    var pf=document.querySelector('[data-xprow="perfect"]');
    if(pf){pf.className='xp-state mono '+(sc.done?'earned':'open');
      pf.textContent=sc.done?'✓ EARNED':'○ LOCKED'}
    var tt=document.querySelector('[data-xprow="total"]');
    if(tt){tt.className='xp-state mono '+(sc.done?'earned':'open');
      tt.textContent=sc.xp+' / '+sc.max+(sc.pen?' (\u2212'+sc.pen+' hints)':'')}
    var lbl=$('xpFor');
    if(lbl)lbl.textContent='DAY '+n;
    // milestones
    var stk=streak(), wkDone=0;
    for(var w=1;w<=12;w++){
      var d=0,tot=0;
      days.forEach(function(x){if(D[x].w===w){tot++;if(score(x).done)d++}});
      if(d===tot&&tot)wkDone++;
    }
    var ms={s7:stk>=7,s14:stk>=14,week:wkDone>0,ship:score(77).done};
    var lblv={s7:'7-DAY STREAK',s14:'14-DAY STREAK',week:'FINISH ANY WEEK (7/7)',
              ship:'SHIP THE CAPSTONE'};
    var sub={s7:'DAY 7',s14:'DAY 14',week:'W1 7/7',ship:'DAY 77'};
    for(var k2 in ms){
      var el2=document.querySelector('[data-ms="'+k2+'"]');
      if(!el2)continue;
      el2.className='ms '+(ms[k2]?'done':'locked');
      var sp=el2.querySelector('.ms-s');
      if(sp)sp.textContent=ms[k2]?'✓ UNLOCKED':'○ LOCKED · '+sub[k2];
    }
  }

  /* ------------------------------------------------------------ events */
  document.addEventListener('change',function(e){
    var cb=e.target; if(cb.type!=='checkbox')return;
    var k=cb.getAttribute('data-k'); if(!k)return;
    if(cb.checked){S.checks[k]=1; S.log[today()]=(S.log[today()]||0)+1}
    else delete S.checks[k];
    save();
    // mirror the tick into the twin box (console <-> log)
    document.querySelectorAll('input[data-k="'+k+'"]').forEach(function(o){
      if(o!==cb&&!o.disabled)o.checked=cb.checked;
    });
    paint();
  });

  $('btnPrev').onclick=function(){if(view>days[0])render(view-1)};
  $('btnNext').onclick=function(){if(view<days[days.length-1])render(view+1)};
  $('btnToday').onclick=function(){render(firstOpen())};
  $('weekJump').onchange=function(){var v=+this.value; if(D[v])render(v)};

  document.addEventListener('keydown',function(e){
    if(/input|textarea|select/i.test(e.target.tagName))return;
    if(e.metaKey||e.ctrlKey||e.altKey)return;
    if(e.key==='ArrowLeft'&&view>days[0]){e.preventDefault();render(view-1)}
    if(e.key==='ArrowRight'&&view<days[days.length-1]){e.preventDefault();render(view+1)}
  });

  /* -------------------------------------------------- "today is Day N" */
  function allKeys(n){
    var out=[], c=D[n].cats;
    for(var k in c)out=out.concat(c[k]);
    return out;
  }
  function ticksFrom(n){
    var c=0;
    days.forEach(function(d){if(d>=n)allKeys(d).forEach(function(k){if(on(k))c++})});
    return c;
  }
  var undoSnap=null;
  function setToday(n){
    if(!D[n])return false;
    var lost=ticksFrom(n);
    if(lost&&!confirm('Set Day '+n+' as today?\n\n'+
        '• Days 1–'+(n-1)+' will be marked complete\n'+
        '• Days '+n+'–'+TOTAL+' will be cleared — '+lost+' tick'+(lost===1?'':'s')+
        ' will be lost\n\nExport your state first if you want to keep them.'))return false;
    undoSnap=JSON.stringify({s:S,c:C});
    C.currentDay=n; C.startDate=''; saveConfig(); applyConfig();
    var checks={};
    days.forEach(function(d){if(d<n)allKeys(d).forEach(function(k){checks[k]=1})});
    // a coherent streak: one active day for each completed day, ending yesterday
    var log={};
    for(var i=n-1;i>=1;i--){var dt=new Date();dt.setDate(dt.getDate()-i);log[stamp(dt)]=1}
    S={checks:checks,log:log,rewards:S.rewards||{},star:S.star||{},started:S.started,ws:S.ws};
    save(); syncBoxes(); render(n); paint();
    return true;
  }
  function parseDay(text){
    var t=String(text||'').trim();
    if(!t)return null;
    var m=t.match(/day\s*#?\s*(\d{1,3})/i)||t.match(/^#?(\d{1,3})$/);
    return m?+m[1]:null;
  }
  function say(msg,cls,undo){
    var el=$('setMsg');
    el.className='cs-msg mono'+(cls?' '+cls:'');
    el.textContent=msg;
    if(undo){
      var b=document.createElement('button');
      b.type='button'; b.className='cs-undo'; b.textContent='UNDO';
      b.onclick=function(){
        if(!undoSnap)return;
        var u=JSON.parse(undoSnap); undoSnap=null;
        S=u.s; C=Object.assign({},u.c); save(); saveConfig(); applyConfig();
        syncBoxes(); render(firstOpen()); paint();
        say('\u2713 Reverted.','ok');
      };
      el.appendChild(b);
    }
  }
  function applySet(){
    var raw=$('setDay').value, n=parseDay(raw);
    if(n===null)return say('\u2715 Could not read a day number — try "today is Day 19".','err');
    if(n<days[0]||n>days[days.length-1])
      return say('\u2715 Day '+n+' is outside 1–'+TOTAL+'.','err');
    if(!setToday(n))return say('\u25cb Left unchanged.','');
    $('setDay').value='';
    say('\u2713 Day '+n+' is now today — 1–'+(n-1)+' complete, '+(n+1<=TOTAL?(n+1)+'–'+TOTAL:'none')+
        ' upcoming.','ok',true);
  }
  $('btnSet').onclick=applySet;
  $('setDay').addEventListener('keydown',function(e){
    if(e.key==='Enter'){e.preventDefault();applySet()}
  });
  // pasting the phrase is enough; no need to reach for the button
  $('setDay').addEventListener('paste',function(){
    var el=this;
    setTimeout(function(){if(parseDay(el.value)!==null)applySet()},0);
  });

  /* ------------------------------------------------------------ backup */
  function snapshot(){
    return JSON.stringify({v:4,exported:new Date().toISOString(),
      checks:S.checks,log:S.log,rewards:S.rewards||{},star:S.star||{},started:S.started,ws:S.ws},null,2);
  }
  var box=$('ioBox');
  $('btnExport').onclick=function(){
    var text=snapshot();
    box.hidden=false; box.value=text; box.select();
    try{
      var b=new Blob([text],{type:'application/json'}), u=URL.createObjectURL(b);
      var a=document.createElement('a');
      a.href=u; a.download='daily-executor-state.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){URL.revokeObjectURL(u)},2000);
    }catch(err){}
  };
  function apply(text){
    var o;
    try{o=JSON.parse(text)}catch(e){return alert('That is not valid JSON.')}
    if(!o||typeof o!=='object'||!o.checks)return alert('No "checks" field — not a Daily Executor snapshot.');
    S={checks:o.checks||{},log:o.log||{},rewards:o.rewards||{},star:o.star||{},started:o.started||today(),
      ws:WC.normalizeWs(o.ws)};
    save(); syncBoxes();
    document.querySelectorAll('[data-reward]').forEach(function(el){
      el.value=(S.rewards||{})['reward.'+el.getAttribute('data-reward')]||'';
    });
    document.querySelectorAll('[data-star]').forEach(function(el){
      var key=el.getAttribute('data-star');
      el.value=(S.star||{})['star.'+key]||'';
      var t=document.querySelector('[data-startag="'+key+'"]');
      if(t){var h=el.value.trim().length>0;t.textContent=h?'\u2713 WRITTEN':'\u25cb EMPTY';
        t.className=h?'filled':''}
    });
    render(firstOpen()); paint();
    box.hidden=true;
    alert('State restored.');
  }
  $('btnImportFile').onclick=function(){$('fileIn').click()};
  $('fileIn').onchange=function(){
    var f=this.files&&this.files[0]; if(!f)return;
    var r=new FileReader(); r.onload=function(){apply(String(r.result))}; r.readAsText(f);
    this.value='';
  };
  $('btnPaste').onclick=function(){
    if(box.hidden||!box.value.trim()){
      box.hidden=false; box.value=''; box.placeholder='Paste a snapshot here, then press PASTE JSON again';
      box.focus(); return;
    }
    apply(box.value);
  };
  $('btnReset').onclick=function(){
    if(!confirm('Erase every tick, hint, submission and saved draft, the XP total and the streak history? This cannot be undone.'))return;
    S={checks:{},log:{},rewards:{},star:{},started:today(),ws:WC.emptyWs()};
    save();
    document.querySelectorAll('input[data-k]').forEach(function(cb){if(!cb.disabled)cb.checked=false});
    document.querySelectorAll('[data-reward]').forEach(function(el){el.value=''});
    document.querySelectorAll('[data-star]').forEach(function(el){
      el.value='';
      var t=document.querySelector('[data-startag="'+el.getAttribute('data-star')+'"]');
      if(t){t.textContent='\u25cb EMPTY';t.className=''}
    });
    box.value=''; box.hidden=true;
    render(firstOpen()); paint();
  };

  /* ---------------------------------------------------------- settings */
  var dlg=$('cfgDlg');
  function fillForm(){
    $('cfgTitle').value=C.programTitle||'';
    $('cfgRole').value=C.targetRole||'';
    $('cfgName').value=C.userName||'';
    $('cfgStart').value=C.startDate||'';
    $('cfgDay').value=clampDay(C.currentDay);
    $('cfgAccent').value=/^#[0-9a-f]{6}$/i.test(C.accentColor||'')?C.accentColor:'#c47f17';
    $('cfgAccentHex').value=C.accentColor||'';
    hintDay(); $('cfgContrast').textContent=accentReport();
  }
  function hintDay(){
    var h=$('cfgDayHint');
    if($('cfgStart').value){
      var t=Date.parse($('cfgStart').value+'T00:00:00');
      if(!isNaN(t)){
        var now=new Date(); now.setHours(0,0,0,0);
        var d=clampDay(Math.floor((now-t)/86400000)+1);
        h.textContent='\u25d0 START DATE SET \u2014 TODAY IS DAY '+d+
          '. CURRENT DAY IS IGNORED WHILE A START DATE EXISTS.';
        return;
      }
    }
    h.textContent='\u25cb NO START DATE \u2014 CURRENT DAY IS USED AS-IS.';
  }
  function openCfg(){fillForm();
    if(dlg.showModal)dlg.showModal(); else dlg.setAttribute('open','');
    $('cfgTitle').focus()}
  function closeCfg(){if(dlg.close)dlg.close(); else dlg.removeAttribute('open')}
  $('gearBtn').onclick=openCfg;
  $('cfgClose').onclick=closeCfg;
  dlg.addEventListener('click',function(e){if(e.target===dlg)closeCfg()});
  $('cfgStart').addEventListener('input',hintDay);
  $('cfgAccent').addEventListener('input',function(){
    $('cfgAccentHex').value=this.value;
    $('cfgContrast').textContent=(function(){var o=C.accentColor;C.accentColor=this.value;
      var r=accentReport();C.accentColor=o;return r}).call(this);
  });
  $('cfgAccentHex').addEventListener('input',function(){
    if(/^#[0-9a-f]{6}$/i.test(this.value))$('cfgAccent').value=this.value;
  });
  $('cfgSave').onclick=function(){
    C.programTitle=$('cfgTitle').value.trim();
    C.targetRole=$('cfgRole').value.trim();
    C.userName=$('cfgName').value.trim();
    C.startDate=$('cfgStart').value.trim();
    C.currentDay=clampDay($('cfgDay').value);
    var a=$('cfgAccentHex').value.trim();
    C.accentColor=/^#[0-9a-f]{3,6}$/i.test(a)?a:DEFAULTS.accentColor;
    saveConfig(); applyConfig(); render(firstOpen()); paint(); closeCfg();
  };
  $('cfgReset').onclick=function(){
    if(!confirm('Reset the six settings to this file\'s defaults? '+
                'Your progress, rewards and STAR stories are not touched.'))return;
    C=Object.assign({},DEFAULTS);
    try{localStorage.removeItem(CKEY)}catch(e){}
    applyConfig(); fillForm(); render(firstOpen()); paint();
  };

  /* ------------------------------------------------------- STAR bank */
  document.querySelectorAll('[data-star]').forEach(function(el){
    var k='star.'+el.getAttribute('data-star');
    var tag=document.querySelector('[data-startag="'+el.getAttribute('data-star')+'"]');
    function mark(){
      var has=el.value.trim().length>0;
      if(tag){tag.textContent=has?'\u2713 WRITTEN':'\u25cb EMPTY';
        tag.className=has?'filled':''}
    }
    if(S.star&&S.star[k])el.value=S.star[k];
    mark();
    el.addEventListener('input',function(){
      S.star=S.star||{};
      if(el.value.trim())S.star[k]=el.value; else delete S.star[k];
      save(); mark();
    });
  });

  /* -------------------------------------------------- milestone rewards */
  // each reader writes their own treat; the plan leaves these blank on purpose
  document.querySelectorAll('[data-reward]').forEach(function(el){
    var k='reward.'+el.getAttribute('data-reward');
    if(S.rewards&&S.rewards[k])el.value=S.rewards[k];
    el.addEventListener('input',function(){
      S.rewards=S.rewards||{};
      if(el.value.trim())S.rewards[k]=el.value; else delete S.rewards[k];
      save();
    });
  });

  /* ------------------------------------------------------------ theme */
  var TKEY='daily-executor.theme';
  function storedTheme(){try{return localStorage.getItem(TKEY)}catch(e){return null}}
  function effective(){
    var t=document.documentElement.getAttribute('data-theme');
    if(t)return t;
    return matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
  }
  function paintToggle(){
    var dark=effective()==='dark';
    $('themeLbl').textContent=dark?'DARK':'LIGHT';
    $('themeBtn').setAttribute('aria-pressed',dark?'true':'false');
    $('themeBtn').setAttribute('aria-label','Theme: '+(dark?'dark':'light')+'. Switch to '+
      (dark?'light':'dark')+'.');
  }
  function setTheme(t){
    if(t)document.documentElement.setAttribute('data-theme',t);
    else document.documentElement.removeAttribute('data-theme');
    try{t?localStorage.setItem(TKEY,t):localStorage.removeItem(TKEY)}catch(e){}
    paintToggle(); applyAccent();
  }
  $('themeBtn').onclick=function(){setTheme(effective()==='dark'?'light':'dark')};
  // follow the OS only while the reader has not chosen for themselves
  if(matchMedia('(prefers-color-scheme:dark)').addEventListener){
    matchMedia('(prefers-color-scheme:dark)').addEventListener('change',function(){
      if(!storedTheme()){paintToggle();applyAccent()}
    });
  }
  paintToggle();
  applyConfig();

  /* ---------------------------------------------------------- tooltip */
  var tip=document.createElement('div');
  tip.className='tip'; tip.setAttribute('role','presentation');
  document.body.appendChild(tip);
  var tipFor=null;
  function showTip(cell){
    var n=+cell.dataset.day, d=D[n], sc=score(n), cur=firstOpen();
    var k=sc.done?'done':(n===cur?'today':(sc.ticked>0?'part':'next'));
    var word={done:'COMPLETE',today:'TODAY',part:'IN PROGRESS',next:'UPCOMING'}[k];
    tip.innerHTML='<div class="tip-h"><span>DAY '+n+'</span>'+
      '<span class="tip-st '+k+'">'+word+'</span>'+
      (d.boss?'<span class="tip-boss">BOSS</span>':'')+
      '<span style="color:#8b8f97">W'+d.w+' · '+sc.ticked+'/'+sc.total+' · '+sc.xp+'/'+sc.max+' XP</span></div>'+
      '<div class="tip-t">'+esc(d.t)+'</div>'+
      (d.target?'<div class="tip-b">'+d.target+'</div>':'');
    tip.classList.add('on');
    tipFor=cell; placeTip();
  }
  function placeTip(){
    if(!tipFor)return;
    var r=tipFor.getBoundingClientRect(), t=tip.getBoundingClientRect();
    var x=r.left+r.width/2-t.width/2, y=r.top-t.height-9;
    if(y<8)y=r.bottom+9;
    if(x<8)x=8;
    if(x+t.width>innerWidth-8)x=innerWidth-t.width-8;
    tip.style.left=x+'px'; tip.style.top=y+'px';
  }
  function hideTip(){tip.classList.remove('on');tipFor=null}
  document.addEventListener('mouseover',function(e){
    var c=e.target.closest?e.target.closest('.cell'):null;
    if(c)showTip(c);
  });
  document.addEventListener('mouseout',function(e){
    var c=e.target.closest?e.target.closest('.cell'):null;
    if(c&&c===tipFor)hideTip();
  });
  document.addEventListener('focusin',function(e){
    if(e.target.classList&&e.target.classList.contains('cell'))showTip(e.target);
  });
  document.addEventListener('focusout',hideTip);
  addEventListener('scroll',function(){if(tipFor)hideTip()},{passive:true});

  /* ------------------------------------------------------------- boot */
  // days 1-7 render disabled in the log; unlock them so restored state can differ
  function syncBoxes(){
    document.querySelectorAll('input[data-k]').forEach(function(cb){
      cb.disabled=false; cb.checked=on(cb.getAttribute('data-k'));
    });
  }

  /* What the question workspace may touch. It cannot reach S directly. */
  window.DE={
    // the box a question's XP is on (its first day). Repeats on later days are reviews and are found with slot().
    problem:function(id){var out=null; days.forEach(function(n){(D[n].probs||[]).forEach(function(p){if(p.id===id&&!p.review&&!out)out={id:p.id,key:p.key,cat:p.cat,bounty:p.bounty,day:n}})}); return out},
    // whatever question sits on one checkbox, review or not
    slot:function(key){var out=null; days.forEach(function(n){(D[n].probs||[]).forEach(function(p){if(p.key===key)out={id:p.id,key:p.key,cat:p.cat,bounty:p.bounty,day:n,review:!!p.review}})}); return out},
    ws:function(){return S.ws},
    // quiet=true saves without repainting the day cards (used for draft saves while typing)
    setWs:function(w,quiet){S.ws=w; save(); if(!quiet)paint()},
    isOn:on,
    // an Accepted answer ticks the question's own box, the same way a click would
    tick:function(key){
      if(on(key))return;
      S.checks[key]=1; S.log[today()]=(S.log[today()]||0)+1; save();
      document.querySelectorAll('input[data-k="'+key+'"]').forEach(function(o){if(!o.disabled)o.checked=true});
      paint();
    },
  };
  syncBoxes();
  render(firstOpen());
  paint();

  var tabs=[].slice.call(document.querySelectorAll('.jt'));
  var secs=tabs.map(function(t){return document.querySelector(t.getAttribute('href'))});
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(en){
        if(!en.isIntersecting)return;
        var i=secs.indexOf(en.target);
        tabs.forEach(function(t,j){t.classList.toggle('on',j===i)});
      });
    },{rootMargin:'-45% 0px -50% 0px'});
    secs.forEach(function(s){if(s)io.observe(s)});
  }
})();
'''.replace('__TOTAL__', str(TOTAL)).replace('__SEED__', str(DONE_THRU))


CONFIG_BLOCK = """
/* ===== CONFIG =========================================================
   EDIT THESE SIX VALUES to make the program yours — nothing else in this
   file needs touching. startDate ("YYYY-MM-DD") makes today advance by the
   calendar; leave it "" and currentDay is used instead. accentColor recolours
   the TODAY highlight only. The Settings panel (gear, top right) edits the
   same six fields and saves them to your browser, so editing here is optional.
   supabaseUrl and supabaseKey are optional and only matter if you want sign-in,
   shared solutions and discussion. Leave them "" and the community stays off
   while everything else works. Steps: supabase/README.md.
   ===================================================================== */
window.CONFIG = {
  programTitle: "AI + Data + Lakehouse Engineer",
  targetRole:   "Data / AI Engineer",
  startDate:    "",          // e.g. "2026-01-06" — first day of Week 1
  currentDay:   1,           // used when startDate is empty. 1-84
  userName:     "",          // optional, shown in the masthead
  accentColor:  "#c47f17",   // the TODAY colour, light mode
  supabaseUrl:  "",          // optional: https://<project>.supabase.co
  supabaseKey:  ""           // optional: the project's anon (public) key. Never the service_role key.
};
/* ===== nothing below this line needs editing ========================== */
"""


BOOT_THEME = ("/* Apply the saved theme before first paint, so the page never flashes. */"
              "(function(){try{var t=localStorage.getItem('daily-executor.theme');"
              "if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}})();")


def build():
    # body first: rendering the day log is what populates DAYDATA
    parts = {
        'mast': masthead(), 'jump': jumpstrip(), 'console': console_panel(),
        'stats': stats(), 'weeks': week_cards(), 'punch': punchcard(),
        'ritual': ritual(), 'xp': xp_panel(),
        'res': collapsibles(PLAN['resources'], 'resources', '05', 'RESOURCE LIBRARY',
                            'EVERY LINK FROM THE PLAN / GROUPED BY HOW YOU USE IT'),
        'cheats': collapsibles(PLAN['cheats'], 'cheats', '06', 'CHEAT SHEETS',
                               'SKIM BEFORE THE CARD / THEY FEED THE REVIEW LOOP'),
        'play': playground_panel(), 'days': all_days(), 'arc': program_arc(), 'backup': backup_panel(),
    }
    data = json.dumps(DAYDATA, ensure_ascii=False, separators=(',', ':'))
    doc = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Daily Executor — 12-Week AI + Data Engineering Program</title>
<meta name="description" content="An open 12-week AI + Data engineering program: 84 two-hour day-cards with built-in spaced review, a daily ritual checklist, XP, streak and progress tracking. Bring your own targets.">
<meta name="color-scheme" content="light dark">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%2316181c'/><text x='50' y='72' font-size='62' font-family='monospace' font-weight='bold' fill='%23c8341f' text-anchor='middle'>8</text></svg>">
<script>{CONFIG_BLOCK}</script>
<style>{CSS}{PG_CSS}{WS_CSS}</style>
<script>{BOOT_THEME}</script>
</head>
<body>
{parts['mast']}
{parts['jump']}
{parts['console']}
{parts['stats']}
{parts['punch']}
{parts['weeks']}
{parts['ritual']}
{parts['xp']}
{parts['res']}
{parts['cheats']}
{parts['play']}
{parts['days']}
{parts['arc']}
{parts['backup']}
<dialog id="cfgDlg" class="cfg" aria-label="Settings">
  <form method="dialog" class="cfg-in" id="cfgForm">
    <div class="cfg-h mono"><span>SETTINGS</span>
      <button type="button" class="cfg-x mono" id="cfgClose" aria-label="Close">&times;</button></div>
    <p class="cfg-note">Saved in this browser only. Everything here also lives in the CONFIG
      block at the top of the file, if you would rather edit it there.</p>
    <label class="cfg-f"><span class="mono">PROGRAM TITLE</span>
      <input id="cfgTitle" type="text" maxlength="80" autocomplete="off"></label>
    <label class="cfg-f"><span class="mono">TARGET ROLE</span>
      <input id="cfgRole" type="text" maxlength="60" autocomplete="off"></label>
    <label class="cfg-f"><span class="mono">YOUR NAME <i>optional</i></span>
      <input id="cfgName" type="text" maxlength="40" autocomplete="off"></label>
    <div class="cfg-row">
      <label class="cfg-f"><span class="mono">START DATE <i>day 1</i></span>
        <input id="cfgStart" type="date"></label>
      <label class="cfg-f"><span class="mono">CURRENT DAY <i>1&ndash;84</i></span>
        <input id="cfgDay" type="number" min="1" max="84" step="1"></label>
    </div>
    <p class="cfg-hint mono" id="cfgDayHint"></p>
    <label class="cfg-f"><span class="mono">ACCENT (TODAY)</span>
      <span class="cfg-colour"><input id="cfgAccent" type="color">
        <input id="cfgAccentHex" type="text" class="mono" maxlength="7" autocomplete="off">
        <span class="cfg-contrast mono" id="cfgContrast"></span></span></label>
    <div class="cfg-actions">
      <button type="button" class="btn" id="cfgSave">SAVE</button>
      <button type="button" class="btn ghost" id="cfgReset">RESET TO DEFAULTS</button>
    </div>
  </form>
</dialog>
<footer class="foot">
  <span>DAILY EXECUTOR <span class="sep">/</span> {TOTAL} DAYS <span class="sep">/</span> 12 WEEKS</span>
  <span>STATE SAVES IN THIS BROWSER <span class="sep">/</span> EXPORT BEFORE A REDEPLOY</span>
</footer>
<script>window.DAYS={data};</script>
<script>{JUDGE_JS}</script>
<script>{CORE_JS}</script>
<script>{COMMUNITY_JS}</script>
<script>{PROBLEMS_JS}</script>
<script>{JS}</script>
<script>{PG_JS}</script>
<script>{RUNTIME_JS}</script>
<script>{WS_JS}</script>
</body>
</html>"""
    open(OUT, 'w').write(doc)
    return doc


if __name__ == '__main__':
    d = build()
    print('wrote', OUT, len(d), 'bytes')
