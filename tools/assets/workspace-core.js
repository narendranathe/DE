/* workspace-core.js — the pure rules behind the question workspace. No DOM, no network.
 * Tested in Node (tests/workspace.core.test.js) and used by workspace.js in the page.
 *
 * "ws" is the learner's workspace state, kept inside the tracker's saved state:
 *   { hints: {id: reveals 0..4}, solved: {id: iso time}, subs: {id: [submission, newest first]}, drafts: {id: code} }
 * Every function that changes ws returns a new object and leaves the old one alone.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./judge.js'));
  else root.WorkspaceCore = factory(root.Judge);
})(typeof self !== 'undefined' ? self : this, function (J) {
  'use strict';

  var MAX_CODE = 20000, MAX_SUBS = 50, MAX_REVEALS = 4;
  var VERDICTS = ['Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded'];

  function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function copy(o) { var out = {}; for (var k in o) if (has(o, k)) out[k] = o[k]; return out; }
  function goodId(k) {
    return typeof k === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(k) && k !== '__proto__' && k !== 'constructor' && k !== 'prototype';
  }

  /* ---------------------------------------------------------------- matching a question to its checkbox (W1, A3) */
  function matchAnchor(text, anchor) {
    var t = String(text == null ? '' : text).trim(), a = String(anchor == null ? '' : anchor).trim();
    if (!t || !a) return false;
    return t === a || t.indexOf(a + ' —') === 0;
  }

  /* ---------------------------------------------------------------- statement text (P4) */
  // Splits text into plain, `code` and **bold** pieces. Nothing here makes HTML: the page puts each piece
  // on the screen with textContent, so markup typed into a statement or comment shows up as the characters it is.
  function parseInline(text) {
    var s = String(text == null ? '' : text), out = [], buf = '', i = 0;
    function flush() { if (buf) { out.push({ t: 'text', v: buf }); buf = ''; } }
    while (i < s.length) {
      if (s[i] === '`') {
        var e = s.indexOf('`', i + 1);
        if (e > i + 1) { flush(); out.push({ t: 'code', v: s.slice(i + 1, e) }); i = e + 1; continue; }
      } else if (s[i] === '*' && s[i + 1] === '*') {
        var f = s.indexOf('**', i + 2);
        if (f > i + 2) { flush(); out.push({ t: 'bold', v: s.slice(i + 2, f) }); i = f + 2; continue; }
      }
      buf += s[i]; i++;
    }
    flush();
    return out;
  }

  // Paragraphs, bullet or numbered lists, and fenced code blocks. That is all the question bank uses.
  function parseBlocks(src) {
    var lines = String(src == null ? '' : src).split('\n'), out = [], para = [], list = null, i = 0;
    function endPara() { if (para.length) { out.push({ t: 'p', v: parseInline(para.join(' ')) }); para = []; } }
    function endList() { if (list) { out.push({ t: 'ul', items: list }); list = null; } }
    while (i < lines.length) {
      var line = lines[i], trimmed = line.trim(), m;
      if (trimmed.indexOf('```') === 0) {
        endPara(); endList();
        var lang = trimmed.slice(3).trim(), body = [];
        i++;
        while (i < lines.length && lines[i].trim().indexOf('```') !== 0) { body.push(lines[i]); i++; }
        i++; // the closing fence, or the end of the text
        out.push({ t: 'code', lang: lang, v: body.join('\n') });
        continue;
      }
      if (!trimmed) { endPara(); endList(); i++; continue; }
      m = /^\s*(?:[-*]|\d+\.)\s+(.*)$/.exec(line);
      if (m) { endPara(); (list = list || []).push(parseInline(m[1])); i++; continue; }
      endList(); para.push(trimmed); i++;
    }
    endPara(); endList();
    return out;
  }

  /* ---------------------------------------------------------------- hints (H1 to H3, H6) */
  function used(n) { n = Math.floor(Number(n) || 0); return n < 0 ? 0 : n > MAX_REVEALS ? MAX_REVEALS : n; }

  // Four slots: hints 1 to 3 and the full approach. A closed slot carries no text at all.
  function hintSlots(problem, usedN, solved) {
    var k = used(usedN), out = [];
    for (var n = 1; n <= MAX_REVEALS; n++) {
      var open = !!solved || n <= k, next = !solved && n === k + 1;
      out.push({
        n: n,
        label: n < MAX_REVEALS ? 'Hint ' + n : 'Full approach',
        state: open ? 'open' : next ? 'next' : 'locked',
        cost: open ? 0 : next ? J.nextHintCost(problem.bounty, k) : null,
        text: open ? (n < MAX_REVEALS ? (problem.hints || [])[n - 1] || '' : problem.approach || '') : null,
      });
    }
    return out;
  }
  function canReveal(usedN, n, solved) { return !solved && n >= 1 && n <= MAX_REVEALS && n === used(usedN) + 1; }
  // Other people's solutions open after a solve, or after the full approach (4 reveals).
  function peopleUnlocked(rec, solved) { return !!solved || !!(rec && used(rec.hints) >= MAX_REVEALS); }

  function revealHint(ws, id, n) {
    var k = used(ws.hints[id]);
    if (ws.solved[id] || !canReveal(k, n, false)) return ws;
    var hints = copy(ws.hints);
    hints[id] = n;
    return Object.assign({}, ws, { hints: hints });
  }

  /* ---------------------------------------------------------------- state */
  function emptyWs() { return { hints: {}, solved: {}, subs: {}, drafts: {} }; }

  function recordSubmission(ws, problem, res, code, at) {
    if (res.verdict === 'Judge Error') return { ws: ws, firstSolve: false }; // the checker failed; that was not an attempt
    var id = problem.id;
    var entry = {
      code: String(code).slice(0, MAX_CODE), verdict: res.verdict, passed: res.passed, total: res.total,
      ms: res.ms == null ? null : res.ms, hints: used(ws.hints[id]), at: at,
    };
    var subs = copy(ws.subs); subs[id] = J.addSubmission(ws.subs[id], entry);
    var solved = copy(ws.solved), first = false;
    if (res.verdict === 'Accepted' && !solved[id]) { solved[id] = at; first = true; }
    return { ws: Object.assign({}, ws, { subs: subs, solved: solved }), firstSolve: first };
  }

  function draftFor(ws, problem) { return has(ws.drafts, problem.id) ? ws.drafts[problem.id] : problem.starter; }
  function setDraft(ws, id, code) {
    var drafts = copy(ws.drafts);
    if (code == null) delete drafts[id]; else drafts[id] = String(code).slice(0, MAX_CODE);
    return Object.assign({}, ws, { drafts: drafts });
  }

  // For state that comes from outside: an imported file, or an older saved version.
  function normalizeWs(x) {
    var out = emptyWs();
    if (!x || typeof x !== 'object') return out;
    var k, v;
    if (x.hints && typeof x.hints === 'object') {
      for (k in x.hints) {
        if (!has(x.hints, k) || !goodId(k)) continue;
        v = x.hints[k];
        if (typeof v !== 'number' || !isFinite(v)) continue;
        v = Math.floor(v);
        if (v > 0) out.hints[k] = v > MAX_REVEALS ? MAX_REVEALS : v;
      }
    }
    if (x.solved && typeof x.solved === 'object') {
      for (k in x.solved) if (has(x.solved, k) && goodId(k) && typeof x.solved[k] === 'string' && x.solved[k]) out.solved[k] = x.solved[k];
    }
    if (x.subs && typeof x.subs === 'object') {
      for (k in x.subs) {
        if (!has(x.subs, k) || !goodId(k) || !Array.isArray(x.subs[k])) continue;
        var list = [];
        x.subs[k].forEach(function (s) {
          if (!s || typeof s !== 'object' || typeof s.code !== 'string' || VERDICTS.indexOf(s.verdict) < 0) return;
          if (typeof s.passed !== 'number' || typeof s.total !== 'number') return;
          list.push({
            code: s.code.slice(0, MAX_CODE), verdict: s.verdict, passed: s.passed, total: s.total,
            ms: typeof s.ms === 'number' ? s.ms : null, hints: used(s.hints), at: typeof s.at === 'string' ? s.at : '',
          });
        });
        if (list.length) out.subs[k] = list.slice(0, MAX_SUBS);
      }
    }
    if (x.drafts && typeof x.drafts === 'object') {
      for (k in x.drafts) if (has(x.drafts, k) && goodId(k) && typeof x.drafts[k] === 'string') out.drafts[k] = x.drafts[k].slice(0, MAX_CODE);
    }
    return out;
  }

  /* ---------------------------------------------------------------- signing in on a second device (S3) */
  function time(s) { var t = Date.parse(s); return isNaN(t) ? 0 : t; }
  function earlier(a, b) { return time(a) <= time(b) ? a : b; }

  // Hint counts only go up and a solve is never undone, so merging is: the larger count, any solve.
  // up = the questions where this device knows more than the cloud does.
  function mergeProgress(local, remote) {
    var hints = {}, solved = {}, up = [], seen = {}, ids = [];
    remote = remote || {};
    [local.hints, local.solved, remote].forEach(function (m) {
      for (var k in m) if (has(m, k) && !seen[k]) { seen[k] = true; ids.push(k); }
    });
    ids.forEach(function (id) {
      var lh = used(local.hints[id]), ls = local.solved[id] || null;
      var r = remote[id] || {}, rh = used(r.hints), rs = r.solved || null;
      var h = Math.max(lh, rh), s = ls && rs ? earlier(ls, rs) : (ls || rs);
      if (h > 0) hints[id] = h;
      if (s) solved[id] = s;
      if (lh > rh || (ls && !rs)) up.push(id);
    });
    return { hints: hints, solved: solved, up: up };
  }

  function subKey(s) { return [s.code, s.verdict, s.passed, s.total, s.hints || 0].join('\u0001'); }
  // The cloud stamps its own time on a submission, so the same attempt is matched by what it contains.
  function mergeSubmissions(local, remote) {
    var out = (local || []).slice(), free = {};
    out.forEach(function (s, i) { (free[subKey(s)] = free[subKey(s)] || []).push(i); });
    (remote || []).forEach(function (r) {
      var q = free[subKey(r)];
      if (q && q.length) q.shift(); else out.push(r);
    });
    var order = out.map(function (s, i) { return { s: s, i: i }; });
    order.sort(function (a, b) { return (time(b.s.at) - time(a.s.at)) || (a.i - b.i); });
    return order.map(function (o) { return o.s; }).slice(0, MAX_SUBS);
  }

  /* ---------------------------------------------------------------- address and labels */
  function parseHash(h) {
    var m = /^#p\/([a-z0-9-]{1,80})$/.exec(String(h || ''));
    return m ? m[1] : null;
  }
  function hashFor(id) { return '#p/' + id; }

  function fmtMs(ms) { return ms < 1000 ? Math.round(ms) + ' ms' : (ms / 1000).toFixed(1) + ' s'; }
  function verdictLine(res, scope) {
    if (res.verdict === 'Judge Error') return 'Could not run the checker';
    var t = fmtMs(res.ms || 0), n = res.passed + '/' + res.total;
    if (scope === 'run') {
      if (res.verdict === 'Accepted') return 'Samples passed · ' + n + ' · ' + t;
      return res.verdict + ' on a sample · ' + n + ' passed · ' + t;
    }
    return res.verdict === 'Accepted'
      ? 'Accepted · ' + n + ' cases · ' + t
      : res.verdict + ' · ' + n + ' cases passed · ' + t;
  }
  function xpLabel(xp, max, pen) { return xp + ' / ' + max + ' XP' + (pen ? ' (−' + pen + ' hints)' : ''); }

  return {
    matchAnchor: matchAnchor, parseInline: parseInline, parseBlocks: parseBlocks,
    hintSlots: hintSlots, canReveal: canReveal, peopleUnlocked: peopleUnlocked, revealHint: revealHint,
    emptyWs: emptyWs, recordSubmission: recordSubmission, draftFor: draftFor, setDraft: setDraft, normalizeWs: normalizeWs,
    mergeProgress: mergeProgress, mergeSubmissions: mergeSubmissions,
    parseHash: parseHash, hashFor: hashFor, verdictLine: verdictLine, xpLabel: xpLabel,
    MAX_CODE: MAX_CODE, MAX_SUBS: MAX_SUBS,
  };
});
