/* workspace.js — the question workspace: a split view with the problem on the left and a runnable editor on the right.
 *
 * Reads: window.PROBLEMS (the bank), Judge, WorkspaceCore, JudgeRuntime, Community, and DE (the tracker's hooks).
 * It never writes HTML from text: every piece of user or bank text goes in with textContent (PRD P4).
 *
 * For tests and other backends:
 *   Workspace.open(id)             open a question
 *   Workspace.useCommunity(api)    use another community service (same API as community.js); null goes back to the configured one
 *   Workspace.refresh()            reload who is signed in and repaint the current tab; returns a promise
 *   Workspace.setLimit(ms)         time limit for one check (default 5000)
 */
(function () {
  'use strict';

  var WC = window.WorkspaceCore, JD = window.Judge, DE = window.DE, RT = window.JudgeRuntime;
  var PROBLEMS = window.PROBLEMS || [];
  if (!WC || !JD || !DE || !RT || !window.Community || !PROBLEMS.length) { window.Workspace = {}; return; }

  var byId = {};
  PROBLEMS.forEach(function (p) { byId[p.id] = p; });
  var CFG = window.CONFIG || {};
  var MINUS = '−';
  var USER_KEY = 'daily-executor.ws-user';

  var defaultCommunity = window.Community.create({ url: CFG.supabaseUrl, key: CFG.supabaseKey });
  var community = defaultCommunity;
  var me = null;

  var dlg = null, els = {}, cur = null, opener = null, pushed = false, shown = false, backing = false, backTimer = 0;
  var limitMs = JD.LIMIT_MS, runners = {}, busy = false, tok = 0, draftTimer = 0, userLoaded = false;
  var revealed = {}; // spoiler comments the reader has opened this session

  /* ------------------------------------------------------------ small helpers */
  function noop() {}
  function h(tag, attrs, kids) {
    var e = document.createElement(tag), k, v;
    if (attrs) {
      for (k in attrs) {
        v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') e.className = v;
        else if (k === 'value' || k === 'checked' || k === 'disabled' || k === 'hidden') e[k] = v;
        else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
        else e.setAttribute(k, v === true ? '' : String(v));
      }
    }
    add(e, kids);
    return e;
  }
  function add(e, kids) {
    if (kids == null || kids === false) return e;
    if (Array.isArray(kids)) { kids.forEach(function (c) { add(e, c); }); return e; }
    e.appendChild(typeof kids === 'string' || typeof kids === 'number' ? document.createTextNode(String(kids)) : kids);
    return e;
  }
  function clear(e) { while (e.firstChild) e.removeChild(e.firstChild); return e; }
  function when(iso) {
    var d = new Date(iso);
    return isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  function note(text, kind, extra) { return h('div', { class: 'ws-note' + (kind ? ' ' + kind : '') }, [h('span', null, text), extra || null]); }
  function ws() { return DE.ws(); }
  function errText(e) {
    switch (e && e.code) {
      case 'network': return 'Could not reach the community service. A free project sleeps after a week unused, so the first call can be slow. Try again in a moment.';
      case 'auth': return 'Sign in with GitHub first.';
      case 'rate_limit': return 'You are posting too fast. Try again in a while.';
      case 'forbidden': return 'That is not allowed.';
      case 'off': return 'The community is not set up on this site.';
      default: return (e && e.message) || 'Something went wrong.';
    }
  }

  /* ------------------------------------------------------------ safe text: statement blocks, tables */
  function inline(spans) {
    return spans.map(function (s) {
      return s.t === 'code' ? h('code', null, s.v) : s.t === 'bold' ? h('strong', null, s.v) : document.createTextNode(s.v);
    });
  }
  function blocks(md, loadable) {
    return WC.parseBlocks(md).map(function (b) {
      if (b.t === 'p') return h('p', null, inline(b.v));
      if (b.t === 'ul') return h('ul', null, b.items.map(function (it) { return h('li', null, inline(it)); }));
      var pre = h('pre', null, h('code', null, b.v));
      if (!loadable) return pre;
      return h('div', null, [pre, h('div', { class: 'ws-actions' }, h('button', {
        type: 'button', class: 'ws-btn small quiet', onclick: function () { loadCode(b.v + '\n', 'Loaded the code into the editor.'); },
      }, 'LOAD INTO EDITOR'))]);
    });
  }
  function cell(td, v) {
    if (v === null || v === undefined) { td.textContent = 'NULL'; td.className = 'nul'; }
    else if (typeof v === 'number') { td.textContent = String(v); td.className = 'num'; }
    else td.textContent = typeof v === 'object' ? JSON.stringify(v) : String(v);
    return td;
  }
  function table(t, caption) {
    var rows = (t.rows || []).slice(0, 50), more = (t.rows || []).length - rows.length;
    var el = h('table', { class: 'ws-tbl' }, [
      caption ? h('caption', null, caption) : null,
      h('thead', null, h('tr', null, (t.columns || []).map(function (c) { return h('th', null, String(c)); }))),
      h('tbody', null, rows.map(function (r) { return h('tr', null, r.map(function (v) { return cell(h('td'), v); })); })),
    ]);
    return h('div', { class: 'ws-tblwrap' }, [el, more > 0 ? h('div', { class: 'ws-sub-note' }, '… ' + more + ' more rows') : null]);
  }
  function sampleTable(t) {
    var cols = String(t.cols || '').split(',').map(function (c) { return c.trim().split(/\s+/)[0]; }).filter(Boolean);
    return table({ columns: cols, rows: t.rows }, t.name + ' (' + t.cols + ')');
  }
  function pre(text, cls) { return h('pre', { class: cls || '' }, String(text)); }

  /* ------------------------------------------------------------ the overlay */
  var TABS = [['desc', 'DESCRIPTION'], ['hints', 'HINTS'], ['solutions', 'SOLUTIONS'], ['discuss', 'DISCUSSION'], ['subs', 'SUBMISSIONS']];

  function build() {
    if (dlg) return;
    els.close = h('button', { type: 'button', class: 'ws-x', id: 'wsClose', 'aria-label': 'Close the workspace (Esc)', onclick: function () { dlg.close(); } }, '×');
    els.kind = h('span', { class: 'ws-kind mono', id: 'wsKind' });
    els.title = h('h2', { id: 'wsTitle' });
    els.bounty = h('span', { class: 'ws-bounty mono', id: 'wsBounty' });
    els.auth = h('div', { id: 'wsAuth' });
    els.tabs = h('div', { class: 'ws-tabs', role: 'tablist', 'aria-label': 'Question sections' }, TABS.map(function (t) {
      return h('button', {
        type: 'button', class: 'ws-tab', role: 'tab', 'data-tab': t[0], id: 'wsTab-' + t[0], 'aria-selected': 'false', 'aria-controls': 'wsPane',
        onclick: function () { selectTab(t[0]); },
        onkeydown: function (e) {
          var i = TABS.findIndex(function (x) { return x[0] === t[0]; }), n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
          if (n == null) return;
          e.preventDefault();
          var next = TABS[(n + TABS.length) % TABS.length][0];
          selectTab(next);
          els.tabs.querySelector('[data-tab="' + next + '"]').focus();
        },
      }, t[1]);
    }));
    els.pane = h('div', { class: 'ws-pane', id: 'wsPane', role: 'tabpanel', tabindex: '0' });
    els.lang = h('span', { class: 'ws-lang', id: 'wsLang' });
    els.run = h('button', { type: 'button', class: 'ws-btn run', id: 'wsRun', title: 'Ctrl or Cmd + Enter', onclick: function () { go('run'); } }, '▶ RUN');
    els.submit = h('button', { type: 'button', class: 'ws-btn go', id: 'wsSubmit', title: 'Ctrl or Cmd + Shift + Enter', onclick: function () { go('submit'); } }, 'SUBMIT');
    els.reset = h('button', { type: 'button', class: 'ws-btn quiet', id: 'wsReset', onclick: askReset }, 'RESET');
    els.ed = h('textarea', { id: 'wsEditor', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', autocorrect: 'off', 'aria-label': 'Code editor' });
    els.keys = h('div', { class: 'ws-keys' }, 'RUN checks the samples. SUBMIT checks every test. Tab indents, Shift+Tab leaves the editor.');
    els.res = h('div', { class: 'ws-result', id: 'wsResult', role: 'status', 'aria-live': 'polite' });

    els.ed.addEventListener('input', function () {
      clearTimeout(draftTimer);
      draftTimer = setTimeout(saveDraft, 300);
    });
    els.ed.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); go(e.shiftKey ? 'submit' : 'run'); return; }
      if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        var pad = cur && cur.p.lang === 'python' ? '    ' : '  ';
        els.ed.setRangeText(pad, els.ed.selectionStart, els.ed.selectionEnd, 'end');
        els.ed.dispatchEvent(new Event('input'));
      }
    });

    dlg = h('dialog', { class: 'ws', id: 'ws', 'aria-labelledby': 'wsTitle' }, [
      h('div', { class: 'ws-bar' }, [els.close, els.kind, els.title, els.bounty, els.auth]),
      h('div', { class: 'ws-body' }, [
        h('section', { class: 'ws-left', 'aria-label': 'Problem' }, [els.tabs, els.pane]),
        h('section', { class: 'ws-right', 'aria-label': 'Editor' }, [
          h('div', { class: 'ws-edbar' }, [els.lang, els.run, els.submit, els.reset]),
          els.ed, els.keys, els.res,
        ]),
      ]),
    ]);
    dlg.addEventListener('close', onClosed);
    document.body.appendChild(dlg);
  }

  function onClosed() {
    if (!shown || dlg.open) return; // a late 'close' event for a dialog that was already handled, or one opened again since
    shown = false;
    clearTimeout(draftTimer); saveDraft();
    document.documentElement.classList.remove('ws-open');
    var from = opener, id = cur && cur.p.id;
    opener = null;
    if (/^#p\//.test(location.hash)) {
      if (pushed) {
        // we pushed the address when it opened, so going back takes it away again. The hashchange that follows is ours.
        backing = true;
        clearTimeout(backTimer);
        backTimer = setTimeout(function () { backing = false; }, 1500);
        history.back();
      } else history.replaceState(null, '', location.pathname + location.search);
    }
    pushed = false;
    var el = from && from.isConnected ? from : (id ? document.querySelector('.solve[data-p="' + id + '"]') : null);
    if (el && el.focus) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }
  }

  function open(id, from, o) {
    var p = byId[id];
    if (!p) return false;
    build();
    if (shown && !dlg.open) onClosed(); // closed a moment ago and its event has not arrived yet: finish that first
    var was = dlg.open;
    cur = { p: p, tab: 'desc', solSort: 'votes', cmSort: 'votes' };
    if (!was) opener = from || document.activeElement;
    var want = WC.hashFor(id);
    if (want !== location.hash) {
      // inside the overlay, or while the last close is still stepping back, a new question takes the current entry instead of adding one
      if (was || backing) history.replaceState(null, '', want);
      else { history.pushState(null, '', want); pushed = true; }
    } else if (o && o.pushed) pushed = true;
    paintHead();
    els.lang.textContent = p.lang === 'sql' ? 'SQL · DUCKDB' : 'PYTHON · PYODIDE';
    els.ed.value = WC.draftFor(ws(), p);
    els.ed.setAttribute('aria-label', 'Code editor, ' + (p.lang === 'sql' ? 'SQL' : 'Python'));
    clear(els.res).appendChild(h('div', { class: 'ws-busy-idle' }, 'RUN checks the samples. SUBMIT checks every test, saves the attempt, and ticks the box when it passes.'));
    selectTab('desc');
    if (!was) { dlg.showModal(); shown = true; document.documentElement.classList.add('ws-open'); }
    try { els.ed.focus({ preventScroll: true }); } catch (e) { els.ed.focus(); }
    ensureUser();
    return true;
  }

  function paintHead() {
    var p = cur.p, w = ws(), used = w.hints[p.id] || 0, cost = JD.hintCost(p.bounty, used);
    els.kind.textContent = (p.lang === 'sql' ? 'SQL' : 'PYTHON') + ' · DAY ' + p.day + ' · ' + (p.cat === 'PRACTICE' ? 'PRACTICE REP' : 'BUILD');
    els.title.textContent = p.title;
    els.bounty.textContent = 'BOUNTY ' + p.bounty + ' XP' + (cost ? ' · HINTS ' + MINUS + cost + ' XP' : '') + (w.solved[p.id] ? ' · SOLVED ✓' : '');
  }

  function paintAuth() {
    if (!els.auth) return;
    clear(els.auth);
    if (!community.enabled) return;
    if (me) {
      if (me.avatar && /^https:\/\//.test(me.avatar)) els.auth.appendChild(h('img', { src: me.avatar, alt: '', width: '22', height: '22', referrerpolicy: 'no-referrer' }));
      add(els.auth, [h('span', null, '@' + me.handle), h('button', { type: 'button', onclick: function () { community.signOut().then(refresh, noop); } }, 'SIGN OUT')]);
    } else {
      add(els.auth, h('button', { type: 'button', onclick: signIn }, 'SIGN IN WITH GITHUB'));
    }
  }
  function signIn() { community.signIn().catch(function (e) { flash(errText(e)); }); }

  function selectTab(name, keep) {
    cur.tab = name;
    Array.prototype.forEach.call(els.tabs.children, function (b) {
      var on = b.dataset.tab === name;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    els.pane.setAttribute('aria-labelledby', 'wsTab-' + name);
    ++tok;
    if (!keep) els.pane.scrollTop = 0;
    ({ desc: paintDesc, hints: paintHints, solutions: paintSolutions, discuss: paintDiscuss, subs: paintSubs })[name]();
  }
  function setPane(nodes) { clear(els.pane); add(els.pane, nodes); }
  function repaintTab() { if (dlg && dlg.open && cur) { paintHead(); selectTab(cur.tab, true); } }

  /* ------------------------------------------------------------ editor */
  function saveDraft() {
    if (!cur || !els.ed) return;
    var w = ws(), p = cur.p;
    if ((w.drafts[p.id] === undefined ? p.starter : w.drafts[p.id]) === els.ed.value) return;
    DE.setWs(WC.setDraft(w, p.id, els.ed.value), true);
  }
  function loadCode(code, message) {
    els.ed.value = code;
    saveDraft();
    flash(message);
    els.ed.focus();
  }
  function flash(text) {
    clear(els.res).appendChild(h('div', { class: 'ws-note' }, text));
  }
  function askReset() {
    if (busy) return;
    var p = cur.p;
    clear(els.res).appendChild(h('div', { class: 'ws-box ws-confirm-reset' }, [
      h('span', null, 'Replace your code with the starter code? Your attempts stay in Submissions.'),
      h('div', { class: 'ws-row' }, [
        h('button', { type: 'button', class: 'ws-btn danger small ws-confirm', onclick: function () {
          els.ed.value = p.starter;
          DE.setWs(WC.setDraft(ws(), p.id, null), true);
          flash('Starter code restored.');
        } }, 'YES, RESET'),
        h('button', { type: 'button', class: 'ws-btn quiet small ws-cancel', onclick: function () { flash('Kept your code.'); } }, 'CANCEL'),
      ]),
    ]));
  }
  function setButtons() { [els.run, els.submit, els.reset].forEach(function (b) { b.disabled = busy; }); }

  /* ------------------------------------------------------------ checking (J1, J2) */
  function runnerFor(lang) {
    var key = lang === 'sql' ? 'sql' : 'py';
    if (!runners[key]) runners[key] = RT[key](function (t) { if (busy) showBusy(t); });
    return runners[key];
  }
  function showBusy(text) { clear(els.res).appendChild(h('div', { class: 'ws-busy' }, text)); }

  async function go(scope) {
    if (busy || !cur) return;
    var p = cur.p, code = els.ed.value;
    if (!code.trim()) { flash('Write some code first.'); return; }
    saveDraft();
    busy = true; setButtons();
    showBusy(scope === 'run' ? 'Checking the samples…' : 'Checking every test…');
    var res;
    try { res = await JD.judge(p, code, runnerFor(p.lang), { scope: scope, limitMs: limitMs }); }
    catch (e) { res = { verdict: 'Judge Error', passed: 0, total: 0, ms: 0, fail: { message: RT.msg(e) } }; }
    busy = false; setButtons();

    var first = false, info = DE.problem(p.id);
    if (scope === 'submit') {
      var r = WC.recordSubmission(ws(), p, res, code, new Date().toISOString());
      if (r.ws !== ws()) DE.setWs(r.ws);
      first = r.firstSolve;
      if (res.verdict === 'Accepted' && info) DE.tick(info.key);
      cloudAfterSubmit(p, res, code);
      if (cur && cur.p.id === p.id) paintHead();
    }
    if (cur && cur.p.id === p.id) { paintResult(res, scope, first, info); if (scope === 'submit' && (cur.tab === 'subs' || cur.tab === 'hints' || cur.tab === 'solutions')) selectTab(cur.tab, true); }
    markButtons();
  }

  function cloudAfterSubmit(p, res, code) {
    if (!me || res.verdict === 'Judge Error') return;
    var w = ws();
    community.addSubmission(p.id, { code: code, verdict: res.verdict, passed: res.passed, total: res.total, ms: res.ms, hints: w.hints[p.id] || 0 }).catch(noop);
    community.saveProgress(p.id, { hints: w.hints[p.id] || 0, solved: w.solved[p.id] || null }).catch(noop);
  }

  function paintResult(res, scope, first, info) {
    clear(els.res);
    var cls = res.verdict === 'Accepted' ? 'v-ok' : res.verdict === 'Judge Error' ? 'v-meh' : 'v-bad';
    add(els.res, h('div', { class: 'ws-verdict ' + cls, 'data-verdict': res.verdict }, WC.verdictLine(res, scope)));
    var f = res.fail;
    if (res.verdict === 'Accepted') {
      if (scope === 'run') add(els.res, h('p', null, 'The samples pass. Press SUBMIT to run the hidden tests too.'));
      else {
        var cost = JD.hintCost(cur.p.bounty, ws().hints[cur.p.id] || 0);
        add(els.res, h('p', null, 'All tests pass' + (info ? ' and your box for Day ' + info.day + ' is ticked.' : '.') + (cost ? ' Hints cost ' + cost + ' XP on this question.' : '')));
        add(els.res, h('div', { class: 'ws-after' }, [
          h('button', { type: 'button', class: 'ws-btn small', onclick: function () { selectTab('solutions'); } }, community.enabled ? 'SHARE YOUR SOLUTION / SEE OTHERS' : 'SEE THE APPROACH'),
        ]));
      }
      return;
    }
    if (!f) return;
    if (res.verdict === 'Judge Error') {
      add(els.res, [pre(f.message, 'err'), h('p', null, 'This is a problem with loading the checker, not with your code. Engines download from a CDN the first time, so check your connection and try again.')]);
      return;
    }
    var box = h('div', { class: 'ws-fail' });
    add(box, h('h4', null, 'Case ' + (f.index + 1) + (f.hidden ? ' (hidden test)' : ' (sample)')));
    if (f.message) add(box, pre(f.message, res.verdict === 'Wrong Answer' ? '' : 'err'));
    if (cur.p.lang === 'sql') {
      if (f.input) add(box, h('details', null, [h('summary', null, 'SETUP SQL FOR THIS CASE'), pre(f.input)]));
      if (f.expected && f.expected.columns) add(box, [h('h4', null, 'Expected'), table(f.expected)]);
      if (f.actual && f.actual.columns) add(box, [h('h4', null, 'Your output'), table(f.actual)]);
    } else {
      if (f.input) add(box, [h('h4', null, 'Input'), pre(f.input)]);
      if ('expected' in f) add(box, [h('h4', null, 'Expected'), pre(JD.pyRepr(f.expected))]);
      if ('actual' in f) add(box, [h('h4', null, 'Your output'), pre(JD.pyRepr(f.actual))]);
      if (f.stdout) add(box, [h('h4', null, 'What you printed'), pre(String(f.stdout).slice(0, 2000))]);
    }
    add(els.res, box);
  }

  /* ------------------------------------------------------------ Description */
  function paintDesc() {
    var p = cur.p, out = [];
    out.push(h('div', { class: 'ws-chips' }, [
      h('span', { class: 'ws-chip' }, p.lang === 'sql' ? 'SQL' : 'PYTHON'),
      h('span', { class: 'ws-chip' }, 'DAY ' + p.day),
      h('span', { class: 'ws-chip' }, p.cat === 'PRACTICE' ? 'PRACTICE REP' : 'BUILD'),
    ]));
    out = out.concat(blocks(p.statement));
    if (p.lang === 'python' && p.signature) out.push(h('h4', null, 'Function'), pre(p.signature));
    if (p.kind === 'mutate' && p.verify) out.push(note('Your statements change the tables. Then this query reads them back and the result is compared:'), pre(p.verify));
    if (p.ordered) out.push(note('The order of the rows counts for this question.'));
    var shown = (p.cases || []).filter(function (c) { return !c.hidden; });
    shown.forEach(function (c, i) {
      out.push(h('h3', null, 'Example ' + (i + 1)));
      if (p.lang === 'sql') {
        (c.tables || []).forEach(function (t) { out.push(sampleTable(t)); });
        out.push(h('h4', null, p.kind === 'mutate' ? 'Expected result of the check query' : 'Expected output'), table(c.expected));
      } else {
        out.push(h('h4', null, 'Input'), pre(JD.describeCall(p, c)), h('h4', null, 'Output'), pre(JD.pyRepr(c.expected)));
      }
    });
    var hid = (p.cases || []).length - shown.length;
    if (hid > 0) out.push(note(hid + ' more test' + (hid === 1 ? '' : 's') + ' run when you press SUBMIT. You see the first one that fails.'));
    setPane(out);
  }

  /* ------------------------------------------------------------ Hints (H1 to H3) */
  function paintHints() {
    var p = cur.p, w = ws(), used = w.hints[p.id] || 0, solved = !!w.solved[p.id];
    var slots = WC.hintSlots(p, used, solved), cost = JD.hintCost(p.bounty, used), out = [];
    out.push(solved
      ? note('You solved this one, so every hint and the full approach are open and free.')
      : note('Bounty ' + p.bounty + ' XP. Hints open in order, and each one takes XP off what this question earns' + (cost ? ' (so far ' + cost + ' XP)' : '') + '. The full approach costs whatever is left of the bounty and opens other learners’ solutions.', 'warn'));
    slots.forEach(function (s) {
      var head = h('div', { class: 'ws-hint-h' }, [h('span', null, s.label.toUpperCase()), h('span', null, s.state === 'open' ? 'OPEN' : s.state === 'next' ? 'NEXT' : 'LOCKED')]);
      var body = h('div', { class: 'ws-hint-b' });
      if (s.state === 'open') add(body, blocks(s.text, s.n === 4));
      else if (s.state === 'next') add(body, revealControl(s, body));
      else add(body, h('p', { class: 'ws-locked' }, 'Opens after ' + (s.n === 4 ? 'hint 3' : 'hint ' + (s.n - 1)) + '.'));
      out.push(h('div', { class: 'ws-hint', 'data-n': s.n, 'data-state': s.state }, [head, body]));
    });
    setPane(out);
  }

  function revealControl(s, body) {
    var label = s.n === 4 ? 'OPEN THE FULL APPROACH' : 'REVEAL HINT ' + s.n;
    return h('button', {
      type: 'button', class: 'ws-btn ws-reveal',
      onclick: function () {
        clear(body).appendChild(h('div', { class: 'ws-confirm-box' }, [
          h('span', null, s.n === 4
            ? 'This opens the full solution. It costs ' + s.cost + ' XP, the rest of the bounty, and it cannot be undone.'
            : 'This hint costs ' + s.cost + ' XP and cannot be undone.'),
          h('button', { type: 'button', class: 'ws-btn danger small ws-confirm', onclick: function () { doReveal(s.n); } }, 'REVEAL'),
          h('button', { type: 'button', class: 'ws-btn quiet small ws-cancel', onclick: paintHints }, 'CANCEL'),
        ]));
      },
    }, label + ' · ' + MINUS + s.cost + ' XP');
  }

  function doReveal(n) {
    var p = cur.p, before = ws(), after = WC.revealHint(before, p.id, n);
    if (after === before) { paintHints(); return; }
    DE.setWs(after);
    var w = ws();
    if (me) community.saveProgress(p.id, { hints: w.hints[p.id] || 0, solved: w.solved[p.id] || null }).catch(noop);
    paintHead(); paintHints();
  }

  /* ------------------------------------------------------------ community gate, shared by Solutions and Discussion */
  function gate(what) {
    if (!community.enabled) return note(what + ' are not set up on this site yet. The practice itself works without them.');
    if (!me) return note('Sign in with GitHub to use ' + what.toLowerCase() + '.', null, h('button', { type: 'button', class: 'ws-btn small', onclick: signIn }, 'SIGN IN WITH GITHUB'));
    return null;
  }
  function who(a, at, tags) {
    return h('div', { class: 'ws-who' }, [
      a && a.avatar && /^https:\/\//.test(a.avatar) ? h('img', { src: a.avatar, alt: '', width: '20', height: '20', referrerpolicy: 'no-referrer' }) : null,
      h('strong', { class: 'handle' }, '@' + ((a && a.handle) || 'someone')),
      h('span', null, when(at)),
      tags || null,
    ]);
  }
  function tag(text, warn, cls) { return h('span', { class: 'ws-tag' + (warn ? ' warn' : '') + (cls ? ' ' + cls : '') }, text); }

  // one set of buttons for a solution or a comment
  function itemActions(kind, it, o) {
    var acts = h('div', { class: 'ws-actions' }), boxHost = h('div');
    if (!it.mine) {
      var vote = h('button', { type: 'button', class: 'ws-btn small ws-vote', 'aria-pressed': it.voted ? 'true' : 'false', 'aria-label': 'Upvote' }, '▲ ' + it.score);
      vote.addEventListener('click', async function () {
        vote.disabled = true;
        try {
          var r = await community.toggleVote(kind, it.id);
          it.voted = r.voted; it.score = r.score;
          vote.setAttribute('aria-pressed', r.voted ? 'true' : 'false');
          vote.textContent = '▲ ' + r.score;
        } catch (e) { flash(errText(e)); }
        vote.disabled = false;
      });
      acts.appendChild(vote);
    } else acts.appendChild(h('span', { class: 'ws-score' }, '▲ ' + it.score));
    if (o.extra) add(acts, o.extra);
    if (it.mine) {
      if (o.onEdit) add(acts, h('button', { type: 'button', class: 'ws-btn small quiet ws-edit', onclick: function () { o.onEdit(boxHost); } }, 'EDIT'));
      add(acts, h('button', { type: 'button', class: 'ws-btn small quiet ws-del', onclick: function () {
        clear(boxHost).appendChild(h('div', { class: 'ws-box ws-confirm-del' }, [
          h('span', null, 'Delete this ' + (kind === 'solution' ? 'solution' : 'comment') + (kind === 'comment' && !it.parentId ? ' and its replies' : '') + '?'),
          h('div', { class: 'ws-row' }, [
            h('button', { type: 'button', class: 'ws-btn danger small ws-confirm', onclick: async function () {
              try { await (kind === 'solution' ? community.deleteSolution(it.id) : community.deleteComment(it.id)); o.repaint(); } catch (e) { flash(errText(e)); }
            } }, 'DELETE'),
            h('button', { type: 'button', class: 'ws-btn quiet small ws-cancel', onclick: function () { clear(boxHost); } }, 'CANCEL'),
          ]),
        ]));
      } }, 'DELETE'));
    } else {
      var rep = h('button', { type: 'button', class: 'ws-btn small quiet ws-report', onclick: function () {
        var reason = h('input', { type: 'text', maxlength: '500', 'aria-label': 'Why are you reporting this?', placeholder: 'Why? (spam, rude, wrong, a spoiler)' });
        clear(boxHost).appendChild(h('div', { class: 'ws-box ws-report-box' }, [
          reason,
          h('div', { class: 'ws-row' }, [
            h('button', { type: 'button', class: 'ws-btn small ws-confirm', onclick: async function () {
              try {
                await community.report(kind, it.id, reason.value);
                clear(boxHost);
                rep.replaceWith(h('span', { class: 'ws-score ws-report-done' }, 'Reported'));
              } catch (e) { flash(errText(e)); }
            } }, 'SEND REPORT'),
            h('button', { type: 'button', class: 'ws-btn quiet small ws-cancel', onclick: function () { clear(boxHost); } }, 'CANCEL'),
          ]),
        ]));
        reason.focus();
      } }, 'REPORT');
      acts.appendChild(rep);
    }
    if (me && me.role === 'moderator' && !it.hidden) {
      add(acts, h('button', { type: 'button', class: 'ws-btn small danger ws-hide', onclick: async function () {
        try { await community.hide(kind, it.id); o.repaint(); } catch (e) { flash(errText(e)); }
      } }, 'HIDE'));
    }
    return h('div', null, [acts, boxHost]);
  }

  /* ------------------------------------------------------------ Solutions (C2, C4) */
  function paintSolutions() {
    var p = cur.p, w = ws(), used = w.hints[p.id] || 0, solved = !!w.solved[p.id], my = tok;
    var out = [h('h3', null, 'Official approach')];
    if (WC.hintSlots(p, used, solved)[3].state === 'open') out = out.concat(blocks(p.approach, true));
    else out.push(note('The full approach is hint 4. It costs ' + (WC.hintSlots(p, used, solved).filter(function (s) { return s.state === 'next'; })[0] ? 'the rest of the bounty' : 'XP') + ' and opens other learners’ solutions.', 'warn',
      h('button', { type: 'button', class: 'ws-btn small', onclick: function () { selectTab('hints'); } }, 'GO TO HINTS')));
    out.push(h('h3', null, 'Solutions from other learners'));
    var box = h('div');
    out.push(box);
    setPane(out);
    fillSolutions(box, my);
  }

  async function fillSolutions(box, my) {
    var p = cur.p, w = ws(), used = w.hints[p.id] || 0, solved = !!w.solved[p.id];
    var g = gate('Shared solutions');
    if (g) { box.appendChild(g); return; }
    if (solved) box.appendChild(shareForm(function () { selectTab('solutions', true); }));
    if (!WC.peopleUnlocked({ hints: used }, solved)) {
      box.appendChild(note('Solve this question, or open the full approach, to read other people’s solutions.'));
      return;
    }
    var list = h('div'); box.appendChild(list);
    list.appendChild(h('p', null, 'Loading…'));
    var items;
    try { items = await community.listSolutions(p.id, { sort: cur.solSort }); }
    catch (e) { if (my === tok) { clear(list); list.appendChild(note(errText(e), 'bad')); } return; }
    if (my !== tok) return;
    clear(list);
    list.appendChild(h('div', { class: 'ws-sep' }, [
      h('span', { class: 'ws-note-t' }, items.length + (items.length === 1 ? ' solution' : ' solutions')),
      sortSelect(cur.solSort, function (v) { cur.solSort = v; selectTab('solutions', true); }),
    ]));
    if (!items.length) list.appendChild(note('Nobody has shared a solution for this question yet.'));
    items.forEach(function (s) {
      list.appendChild(h('div', { class: 'ws-sol', 'data-id': s.id }, [
        who(s.author, s.at, s.hidden ? tag('hidden by a moderator', true, 'ws-hidden-tag') : null),
        h('h4', null, s.title),
        blocks(s.explanation || ''),
        h('pre', null, h('code', null, s.code)),
        itemActions('solution', s, {
          repaint: function () { selectTab('solutions', true); },
          extra: h('button', { type: 'button', class: 'ws-btn small quiet ws-load', onclick: function () { loadCode(s.code, 'Loaded @' + s.author.handle + '’s solution into the editor.'); } }, 'LOAD INTO EDITOR'),
        }),
      ]));
    });
  }

  function sortSelect(value, onChange) {
    var sel = h('select', { class: 'ws-sort', 'aria-label': 'Sort order' }, [h('option', { value: 'votes' }, 'Top voted'), h('option', { value: 'new' }, 'Newest')]);
    sel.value = value;
    sel.addEventListener('change', function () { onChange(sel.value); });
    return sel;
  }

  function lastAcceptedCode() {
    var subs = ws().subs[cur.p.id] || [];
    for (var i = 0; i < subs.length; i++) if (subs[i].verdict === 'Accepted') return subs[i].code;
    return els.ed.value;
  }
  function shareForm(done) {
    var title = h('input', { type: 'text', id: 'wsShareTitle', maxlength: '120', placeholder: 'For example: DENSE_RANK in a subquery' });
    var text = h('textarea', { id: 'wsShareText', maxlength: '4000', placeholder: 'Explain the idea in a few sentences. Backticks make code.' });
    var code = h('textarea', { id: 'wsShareCode', class: 'codey', maxlength: '20000', 'aria-label': 'Solution code' });
    code.value = lastAcceptedCode();
    var msg = h('p', { class: 'ws-msg', role: 'status' });
    var btn = h('button', { type: 'button', class: 'ws-btn go', id: 'wsShare', onclick: async function () {
      btn.disabled = true; msg.textContent = '';
      try { await community.shareSolution(cur.p.id, { title: title.value, explanation: text.value, code: code.value }); done(); }
      catch (e) { msg.textContent = errText(e); btn.disabled = false; }
    } }, 'SHARE');
    return h('div', { class: 'ws-form' }, [
      h('h3', null, 'Share your solution'),
      h('label', null, ['TITLE', title]),
      h('label', null, ['HOW IT WORKS', text]),
      h('label', null, ['CODE', code]),
      h('p', { class: 'ws-locked' }, 'Your GitHub name shows next to it. Anyone who has solved this question can read it. It is shared under this repository’s licence.'),
      btn, msg,
    ]);
  }

  /* ------------------------------------------------------------ Discussion (C3, C5, C7) */
  function paintDiscuss() {
    var my = tok, p = cur.p, out = [], g = gate('Discussion');
    if (g) { setPane(g); return; }
    var body = h('textarea', { id: 'wsCommentBody', maxlength: '4000', placeholder: 'Ask a question, share an approach, or point out a trap.', 'aria-label': 'Write a comment' });
    var spoiler = h('input', { type: 'checkbox', id: 'wsSpoiler' });
    var msg = h('p', { class: 'ws-msg', role: 'status' });
    var post = h('button', { type: 'button', class: 'ws-btn go', id: 'wsPost', onclick: async function () {
      post.disabled = true; msg.textContent = '';
      try { await community.addComment(p.id, { body: body.value, spoiler: spoiler.checked }); selectTab('discuss', true); }
      catch (e) { msg.textContent = errText(e); post.disabled = false; }
    } }, 'POST');
    out.push(h('div', { class: 'ws-form' }, [
      body,
      h('label', { class: 'inline' }, [spoiler, 'SPOILER: hide the text until someone clicks']),
      h('div', { class: 'ws-row' }, [post, msg]),
    ]));
    var list = h('div'); out.push(list);
    setPane(out);
    list.appendChild(h('p', null, 'Loading…'));
    community.listComments(p.id, { sort: cur.cmSort }).then(function (items) {
      if (my !== tok) return;
      clear(list);
      var tops = items.filter(function (c) { return !c.parentId; }).length;
      list.appendChild(h('div', { class: 'ws-sep' }, [
        h('span', null, tops + (tops === 1 ? ' thread' : ' threads')),
        sortSelect(cur.cmSort, function (v) { cur.cmSort = v; selectTab('discuss', true); }),
      ]));
      if (!items.length) list.appendChild(note('No comments yet. Be the first.'));
      items.forEach(function (c) { list.appendChild(commentNode(c)); });
    }, function (e) { if (my === tok) { clear(list); list.appendChild(note(errText(e), 'bad')); } });
  }

  function commentNode(c) {
    var repaint = function () { selectTab('discuss', true); };
    var el = h('div', { class: 'ws-cm' + (c.parentId ? ' is-reply' : ''), 'data-id': c.id });
    var bodyHost = h('div');
    function showBody() { clear(bodyHost).appendChild(h('p', { class: 'ws-cm-body' }, c.body)); }
    if (c.spoiler && !revealed[c.id]) {
      bodyHost.appendChild(h('button', { type: 'button', class: 'ws-btn small quiet ws-spoiler-btn', onclick: function () { revealed[c.id] = true; showBody(); } }, 'Spoiler — click to show'));
    } else showBody();
    var replyHost = h('div');
    function reply(host) {
      var ta = h('textarea', { maxlength: '4000', 'aria-label': 'Write a reply' });
      var m = h('span', { class: 'ws-msg' });
      var send = h('button', { type: 'button', class: 'ws-btn small go ws-post-reply', onclick: async function () {
        send.disabled = true;
        try { await community.addComment(cur.p.id, { body: ta.value, parentId: c.id }); repaint(); } catch (e) { m.textContent = errText(e); send.disabled = false; }
      } }, 'REPLY');
      clear(host).appendChild(h('div', { class: 'ws-box ws-reply-box' }, [ta, h('div', { class: 'ws-row' }, [send, h('button', { type: 'button', class: 'ws-btn quiet small ws-cancel', onclick: function () { clear(host); } }, 'CANCEL'), m])]));
      ta.focus();
    }
    function edit(host) {
      var ta = h('textarea', { maxlength: '4000', 'aria-label': 'Edit your comment' });
      ta.value = c.body;
      var sp = h('input', { type: 'checkbox' }); sp.checked = c.spoiler;
      var m = h('span', { class: 'ws-msg' });
      var save = h('button', { type: 'button', class: 'ws-btn small go ws-save', onclick: async function () {
        save.disabled = true;
        try { await community.editComment(c.id, { body: ta.value, spoiler: sp.checked }); revealed[c.id] = true; repaint(); } catch (e) { m.textContent = errText(e); save.disabled = false; }
      } }, 'SAVE');
      clear(host).appendChild(h('div', { class: 'ws-box ws-edit-box' }, [ta, h('label', { class: 'inline' }, [sp, 'SPOILER']), h('div', { class: 'ws-row' }, [save, h('button', { type: 'button', class: 'ws-btn quiet small ws-cancel', onclick: function () { clear(host); } }, 'CANCEL'), m])]));
      ta.focus();
    }
    var extra = c.parentId ? null : h('button', { type: 'button', class: 'ws-btn small quiet ws-reply', onclick: function () { reply(replyHost); } }, 'REPLY');
    add(el, [
      who(c.author, c.at, [c.edited ? tag('edited') : null, c.hidden ? tag('hidden by a moderator', true, 'ws-hidden-tag') : null]),
      bodyHost,
      itemActions('comment', c, { repaint: repaint, extra: extra, onEdit: edit }),
      replyHost,
    ]);
    return el;
  }

  /* ------------------------------------------------------------ Submissions (S1 to S3) */
  function paintSubs() {
    var p = cur.p, my = tok, local = ws().subs[p.id] || [];
    function show(list, syncing) {
      var out = [];
      out.push(note(me ? 'Your attempts are saved in this browser and in your account, so they follow you to another device.' : 'Your attempts are saved in this browser' + (community.enabled ? '. Sign in to keep them on every device.' : '.')));
      if (syncing) out.push(h('p', { class: 'ws-locked' }, 'Checking your account for attempts from other devices…'));
      if (!list.length) out.push(h('p', null, 'No submissions yet. Press SUBMIT to be judged on every test.'));
      out.push(h('div', { class: 'ws-subs' }, list.map(function (s) {
        return h('button', { type: 'button', class: 'ws-sub', 'data-verdict': s.verdict, onclick: function () { loadCode(s.code, 'Loaded the submission from ' + when(s.at) + '.'); } }, [
          h('span', { class: 'vd' }, s.verdict),
          h('span', null, s.passed + '/' + s.total),
          h('span', null, s.ms == null ? '' : (s.ms < 1000 ? Math.round(s.ms) + ' ms' : (s.ms / 1000).toFixed(1) + ' s')),
          h('span', null, s.hints ? s.hints + (s.hints === 1 ? ' hint' : ' hints') : 'no hints'),
          h('span', { class: 'grow' }),
          h('span', { class: 'when' }, when(s.at)),
        ]);
      })));
      setPane(out);
    }
    show(local, !!me);
    if (!me) return;
    community.listSubmissions(p.id).then(function (remote) {
      if (my === tok) show(WC.mergeSubmissions(local, remote), false);
    }, function () { if (my === tok) show(local, false); });
  }

  /* ------------------------------------------------------------ who is signed in, and progress on another device (S3) */
  function refreshUser() {
    return community.user().then(function (u) { me = u; paintAuth(); }, function () { me = null; paintAuth(); });
  }
  function ownerId() { try { return localStorage.getItem(USER_KEY); } catch (e) { return null; } }
  function setOwner(id) { try { localStorage.setItem(USER_KEY, id); } catch (e) { /* the sync still works this session */ } }

  async function syncProgress() {
    if (!me) return;
    var remote;
    try { remote = await community.loadProgress(); } catch (e) { return; }
    var w = ws(), m = WC.mergeProgress(w, remote), owner = ownerId();
    var changed = JSON.stringify(m.hints) !== JSON.stringify(w.hints) || JSON.stringify(m.solved) !== JSON.stringify(w.solved);
    if (changed) DE.setWs(Object.assign({}, w, { hints: m.hints, solved: m.solved }));
    Object.keys(m.solved).forEach(function (id) { var pr = DE.problem(id); if (pr) DE.tick(pr.key); });
    // this browser's progress goes up only for the account that owns it. A different account just pulls.
    if (!owner || owner === me.id) {
      if (!owner) setOwner(me.id);
      m.up.forEach(function (id) { community.saveProgress(id, { hints: m.hints[id] || 0, solved: m.solved[id] || null }).catch(noop); });
    }
    markButtons();
  }

  function refresh() {
    return refreshUser().then(syncProgress).then(function () { paintAuth(); repaintTab(); }, noop);
  }
  function ensureUser() {
    if (userLoaded) return;
    userLoaded = true;
    if (!community.enabled) return;
    refresh();
    community.onAuth(function () { refresh(); });
  }
  // for tests and other backends. Returns once the new service has said who is signed in.
  function useCommunity(api) {
    var mine = community = api || defaultCommunity;
    me = null; userLoaded = true;
    if (dlg) paintAuth();
    if (!mine.enabled) return Promise.resolve();
    mine.onAuth(function () { if (community === mine) refresh(); });
    return refresh();
  }

  /* ------------------------------------------------------------ buttons in the day cards */
  function markButtons() {
    var solved = ws().solved;
    Array.prototype.forEach.call(document.querySelectorAll('.solve[data-p]'), function (b) {
      var id = b.getAttribute('data-p'), p = byId[id], done = !!solved[id];
      b.classList.toggle('is-solved', done);
      var want = done ? 'SOLVED ✓' : 'SOLVE HERE';
      if (b.textContent !== want) b.textContent = want;
      b.setAttribute('aria-label', (done ? 'Open solved question: ' : 'Solve here: ') + (p ? p.title : id));
    });
  }

  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('.solve[data-p]') : null;
    if (!b) return;
    e.preventDefault();
    open(b.getAttribute('data-p'), b);
  });
  window.addEventListener('hashchange', function () {
    if (backing) {
      // the step back our own close asked for. If a question was opened meanwhile, put its address on the entry we landed on.
      backing = false;
      if (dlg && dlg.open && cur) { history.replaceState(null, '', WC.hashFor(cur.p.id)); pushed = false; }
      return;
    }
    var id = WC.parseHash(location.hash);
    if (id && byId[id]) { if (!dlg || !dlg.open || !cur || cur.p.id !== id) open(id, null, { pushed: true }); }
    else if (dlg && dlg.open) dlg.close();
  });
  var conGroups = document.getElementById('conGroups');
  if (conGroups && window.MutationObserver) new MutationObserver(markButtons).observe(conGroups, { childList: true });

  markButtons();
  var startId = WC.parseHash(location.hash);
  if (startId && byId[startId]) open(startId);
  // coming back from the GitHub sign-in page: let the client library finish the sign-in
  if (community.enabled && /[?&]code=/.test(location.search)) ensureUser();

  window.Workspace = {
    open: function (id) { return open(id); },
    close: function () { if (dlg && dlg.open) dlg.close(); },
    refresh: refresh,
    useCommunity: useCommunity,
    setLimit: function (ms) { limitMs = ms; },
  };
})();
