/* judge.js — the grading rules for the problem workspace.
 *
 * One file, two homes: the page loads it as a plain script (window.Judge) and the tests
 * require() it in Node. It has no DOM, no network and no database of its own. A "runner"
 * object passed in does the actual SQL or Python work, so the same rules run in the
 * browser (DuckDB-WASM, Pyodide) and in the tests (DuckDB for Node, Pyodide for Node).
 *
 *   SQL runner     { session() -> Promise<{exec(sql), query(sql) -> {columns, rows}, close()}>, abort() }
 *   Python runner  { py(source, limitMs) -> Promise<stdout string>, abort() }
 *                  py() rejects with err.timeout = true (and err.partial = stdout so far) on a hang.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Judge = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var TOL = 1e-6;
  var LIMIT_MS = 5000;
  var MAX_REVEALS = 4;
  var KEEP_SUBMISSIONS = 50;

  /* ---------------------------------------------------------------- values */
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function isoDate(ms) { var d = new Date(ms); return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate()); }
  function isoTs(ms) { var d = new Date(ms); return isoDate(ms) + ' ' + pad2(d.getUTCHours()) + ':' + pad2(d.getUTCMinutes()) + ':' + pad2(d.getUTCSeconds()); }

  // One Arrow cell -> a plain JS value (null, number, string, boolean).
  function cellOf(v, type) {
    var ts = String(type || '');
    if (v === null || v === undefined) return null;
    if (/^Decimal/.test(ts)) {
      // DuckDB hands back the unscaled integer; put the decimal point back using the column's scale
      var scale = type && typeof type.scale === 'number' ? type.scale : 0, s = String(v);
      if (/^-?\d+$/.test(s) && scale > 0) {
        var neg = s.charAt(0) === '-'; if (neg) s = s.slice(1);
        while (s.length <= scale) s = '0' + s;
        s = (neg ? '-' : '') + s.slice(0, s.length - scale) + '.' + s.slice(s.length - scale);
      }
      return Number(s);
    }
    if (typeof v === 'bigint') {
      return (v <= BigInt(Number.MAX_SAFE_INTEGER) && v >= BigInt(-Number.MAX_SAFE_INTEGER)) ? Number(v) : v.toString();
    }
    if (typeof v === 'number') {
      if (/^Date/.test(ts)) return isoDate(v);
      if (/^Timestamp/.test(ts)) return isoTs(v);
      return v;
    }
    if (v instanceof Date) return /^Date/.test(ts) ? isoDate(v.getTime()) : isoTs(v.getTime());
    if (typeof v === 'boolean' || typeof v === 'string') return v;
    try { return JSON.stringify(v, function (k, x) { return typeof x === 'bigint' ? x.toString() : x; }); }
    catch (e) { return String(v); }
  }

  // An Apache Arrow result table (what DuckDB returns) -> { columns: [names], rows: [[cells]] }
  function arrowToTable(res) {
    var fields = res.schema.fields, n = res.numRows, rows = [], j;
    var cols = fields.map(function (f, k) { return res.getChildAt(k); });
    for (var i = 0; i < n; i++) {
      var row = [];
      for (j = 0; j < fields.length; j++) row.push(cellOf(cols[j].get(i), fields[j].type));
      rows.push(row);
    }
    return { columns: fields.map(function (f) { return f.name; }), rows: rows };
  }

  /* ---------------------------------------------------------------- compare (J3) */
  function cellEq(a, b) {
    if (a === null || b === null) return a === b;
    if (typeof a === 'number' && typeof b === 'number') {
      if (a !== a && b !== b) return true;
      return Math.abs(a - b) <= TOL;
    }
    return a === b;
  }
  function rowEq(r, s) {
    if (r.length !== s.length) return false;
    for (var i = 0; i < r.length; i++) if (!cellEq(r[i], s[i])) return false;
    return true;
  }
  // numbers are rounded to 6 places so near-equal rows land in the same bucket
  function rowKey(r) {
    return r.map(function (v) {
      if (v === null) return 'n';
      if (typeof v === 'number') return 'd' + (Math.round(v * 1e6) / 1e6);
      return (typeof v === 'boolean' ? 'b' : 's') + v;
    }).join('\u0001');
  }
  function sameMultiset(A, E) {
    var buckets = {}, left = [], rem = [], i, k;
    for (i = 0; i < E.length; i++) { k = rowKey(E[i]); (buckets[k] = buckets[k] || []).push(E[i]); }
    for (i = 0; i < A.length; i++) {
      k = rowKey(A[i]);
      if (buckets[k] && buckets[k].length) buckets[k].pop(); else left.push(A[i]);
    }
    for (k in buckets) if (Object.prototype.hasOwnProperty.call(buckets, k)) rem = rem.concat(buckets[k]);
    if (left.length !== rem.length) return false;
    for (i = 0; i < left.length; i++) {
      var hit = -1;
      for (var j = 0; j < rem.length; j++) if (rowEq(left[i], rem[j])) { hit = j; break; }
      if (hit < 0) return false;
      rem.splice(hit, 1);
    }
    return true;
  }
  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }

  // -> { ok: true } or { ok: false, reason: 'columns'|'rows'|'order'|'values', detail }
  function compareTables(actual, expected, opts) {
    var ordered = !!(opts && opts.ordered);
    var ac = actual.columns || [], ec = expected.columns || [];
    if (ac.length !== ec.length) {
      return { ok: false, reason: 'columns', detail: 'Expected ' + plural(ec.length, 'column') + ' (' + ec.join(', ') + '), got ' + plural(ac.length, 'column') + (ac.length ? ' (' + ac.join(', ') + ')' : '') + '.' };
    }
    for (var i = 0; i < ec.length; i++) {
      if (String(ac[i]).toLowerCase() !== String(ec[i]).toLowerCase()) {
        return { ok: false, reason: 'columns', detail: 'Column names should be (' + ec.join(', ') + '), got (' + ac.join(', ') + ').' };
      }
    }
    var A = actual.rows || [], E = expected.rows || [];
    if (A.length !== E.length) {
      return { ok: false, reason: 'rows', detail: 'Expected ' + plural(E.length, 'row') + ', got ' + A.length + '.' };
    }
    if (ordered) {
      var same = true;
      for (var r = 0; r < A.length; r++) if (!rowEq(A[r], E[r])) { same = false; break; }
      if (same) return { ok: true };
      if (sameMultiset(A, E)) return { ok: false, reason: 'order', detail: 'The rows are right but the order is wrong. This question wants a specific order.' };
      return { ok: false, reason: 'values', detail: 'Some rows or values differ from the expected result.' };
    }
    if (sameMultiset(A, E)) return { ok: true };
    return { ok: false, reason: 'values', detail: 'Some rows or values differ from the expected result.' };
  }

  /* ---------------------------------------------------------------- hints and XP (H) */
  function clampK(k) { k = Math.floor(Number(k) || 0); return k < 0 ? 0 : k > MAX_REVEALS ? MAX_REVEALS : k; }
  // XP lost after k reveals. Reveal 4 is the full approach and costs the whole bounty.
  function hintCost(bounty, k) { return Math.round(bounty * clampK(k) / MAX_REVEALS); }
  // what the confirm box shows: the cost of the next reveal only
  function nextHintCost(bounty, used) {
    var k = clampK(used);
    return k >= MAX_REVEALS ? 0 : hintCost(bounty, k + 1) - hintCost(bounty, k);
  }
  // items: [{id, bounty, cat}] for one day; hints: {id: reveals}; earned: {CAT: true} for categories fully earned
  function penaltyFor(items, hints, earned) {
    var total = 0;
    (items || []).forEach(function (it) {
      if (!earned || !earned[it.cat]) return;
      total += hintCost(it.bounty, hints && hints[it.id]);
    });
    return total;
  }
  function applyPenalty(xp, penalty) { return Math.max(0, xp - penalty); }
  function revealNext(hints, id) {
    var out = {}, k;
    for (k in (hints || {})) if (Object.prototype.hasOwnProperty.call(hints, k)) out[k] = hints[k];
    out[id] = clampK((out[id] || 0) + 1);
    return out;
  }
  // other people's solutions open after a solve, or after the full approach is revealed
  function unlocked(rec) { return !!(rec && (rec.solved || (rec.hints || 0) >= MAX_REVEALS)); }
  function addSubmission(list, sub) { return [sub].concat(list || []).slice(0, KEEP_SUBMISSIONS); }

  /* ---------------------------------------------------------------- display helpers */
  function pyRepr(v) {
    if (v === null || v === undefined) return 'None';
    if (v === true) return 'True';
    if (v === false) return 'False';
    if (typeof v === 'string') return JSON.stringify(v);
    if (Array.isArray(v)) return '[' + v.map(pyRepr).join(', ') + ']';
    if (typeof v === 'object') return '{' + Object.keys(v).map(function (k) { return JSON.stringify(k) + ': ' + pyRepr(v[k]); }).join(', ') + '}';
    return String(v);
  }
  function argList(a) { return (a || []).map(pyRepr).join(', '); }
  function describeCall(problem, c) {
    if (problem.kind === 'class') {
      return (c.ops || []).map(function (op, i) { return op + '(' + argList(c.args && c.args[i]) + ')'; }).join('; ');
    }
    return problem.fn + '(' + argList(c.args) + ')';
  }

  /* ---------------------------------------------------------------- Python harness (J4) */
  function pyLit(value) { return JSON.stringify(JSON.stringify(value)); } // a Python string literal holding JSON

  var PY_HEAD = [
    'import json as _json, copy as _copy, sys as _sys',
    '',
    'def _emit(tag, obj):',
    '    _sys.stdout.write("\\n" + tag + _json.dumps(obj, allow_nan=False) + "\\n")',
    '    _sys.stdout.flush()',
    '',
    'def _describe(e):',
    '    name = type(e).__name__',
    '    if isinstance(e, SyntaxError):',
    '        return "%s: %s (line %s)" % (name, e.msg, e.lineno)',
    '    msg = str(e)',
    '    line = None',
    '    tb = e.__traceback__',
    '    while tb is not None:',
    '        if tb.tb_frame.f_code.co_filename == "<solution>":',
    '            line = tb.tb_lineno',
    '        tb = tb.tb_next',
    '    out = name + (": " + msg if msg else "")',
    '    return out + (" (line %d)" % line if line else "")',
    '',
    'def _norm(v):',
    '    if v is None or isinstance(v, (bool, int, str)):',
    '        return v',
    '    if isinstance(v, float):',
    '        if v != v:',
    '            return "NaN"',
    '        if v in (float("inf"), float("-inf")):',
    '            return "Infinity" if v > 0 else "-Infinity"',
    '        return v',
    '    if isinstance(v, (list, tuple)):',
    '        return [_norm(x) for x in v]',
    '    if isinstance(v, (set, frozenset)):',
    '        return sorted((_norm(x) for x in v), key=repr)',
    '    if isinstance(v, dict):',
    '        return {str(k): _norm(x) for k, x in v.items()}',
    '    return repr(v)',
    '',
    'def _eq(a, b):',
    '    if isinstance(a, bool) or isinstance(b, bool):',
    '        return type(a) is type(b) and a == b',
    '    if isinstance(a, (int, float)) and isinstance(b, (int, float)):',
    '        return abs(a - b) <= 1e-6',
    '    if isinstance(a, list) and isinstance(b, list):',
    '        return len(a) == len(b) and all(_eq(x, y) for x, y in zip(a, b))',
    '    if isinstance(a, dict) and isinstance(b, dict):',
    '        return a.keys() == b.keys() and all(_eq(a[k], b[k]) for k in a)',
    '    return a == b',
    '',
    'def _check(mode, got, want):',
    '    if mode == "unordered" and isinstance(got, list) and isinstance(want, list):',
    '        return _eq(sorted(got, key=repr), sorted(want, key=repr))',
    '    if mode == "groups" and isinstance(got, list) and isinstance(want, list):',
    '        try:',
    '            g = sorted((sorted(x, key=repr) for x in got), key=repr)',
    '            w = sorted((sorted(x, key=repr) for x in want), key=repr)',
    '        except TypeError:',
    '            return False',
    '        return _eq(g, w)',
    '    return _eq(got, want)',
  ].join('\n');

  var PY_BODY = [
    '',
    'def _main():',
    '    ns = {"__name__": "__judge__"}',
    '    try:',
    '        exec(compile(_src, "<solution>", "exec"), ns)',
    '    except BaseException as e:',
    '        _emit("@@FATAL@@", {"err": _describe(e)})',
    '        return',
    '    need = _ops0 if _kind == "class" else _fn',
    '    if need not in ns:',
    '        what = "a class" if _kind == "class" else "a function"',
    '        _emit("@@FATAL@@", {"err": "NameError: define %s named %s" % (what, need)})',
    '        return',
    '    for c in _cases:',
    '        try:',
    '            if _kind == "class":',
    '                obj = ns[c["ops"][0]](*_copy.deepcopy(c["args"][0]))',
    '                got = [None]',
    '                for op, a in zip(c["ops"][1:], c["args"][1:]):',
    '                    got.append(getattr(obj, op)(*_copy.deepcopy(a)))',
    '            else:',
    '                got = ns[_fn](*_copy.deepcopy(c["args"]))',
    '            got = _norm(got)',
    '            ok = _check(_cmp, got, c.get("expected"))',
    '            if ok and not _record:',
    '                _emit("@@CASE@@", {"ok": True})',
    '            else:',
    '                _emit("@@CASE@@", {"ok": ok, "got": got})',
    '        except BaseException as e:',
    '            _emit("@@CASE@@", {"err": _describe(e)})',
    '    _emit("@@END@@", {})',
    '',
    '_main()',
    '',
  ].join('\n');

  // cases: the list to run (visible only for RUN, all for SUBMIT). Hidden flags are not sent.
  // opts.record: report every answer, not only the wrong ones (used at build time to compute expected output)
  function pyHarness(problem, code, cases, opts) {
    var slim = cases.map(function (c) { return problem.kind === 'class' ? { ops: c.ops, args: c.args, expected: c.expected } : { args: c.args, expected: c.expected }; });
    var ops0 = problem.kind === 'class' && cases.length ? cases[0].ops[0] : '';
    return PY_HEAD + '\n\n' +
      '_cases = _json.loads(' + pyLit(slim) + ')\n' +
      '_src = _json.loads(' + pyLit(code) + ')\n' +
      '_kind = ' + JSON.stringify(problem.kind === 'class' ? 'class' : 'func') + '\n' +
      '_fn = ' + JSON.stringify(problem.fn || '') + '\n' +
      '_ops0 = ' + JSON.stringify(ops0) + '\n' +
      '_cmp = ' + JSON.stringify(problem.cmp || 'eq') + '\n' +
      '_record = ' + (opts && opts.record ? 'True' : 'False') + '\n' +
      PY_BODY;
  }

  // stdout of the harness -> { cases, done, fatal, stdout }
  function parsePyOutput(out) {
    var res = { cases: [], done: false, fatal: null, stdout: '' }, mine = [];
    String(out || '').split('\n').forEach(function (line) {
      var m = /@@(CASE|FATAL|END)@@/.exec(line);
      if (!m) { mine.push(line); return; }
      if (m.index > 0) mine.push(line.slice(0, m.index));
      var body = line.slice(m.index + m[0].length), obj = null;
      if (body) { try { obj = JSON.parse(body); } catch (e) { obj = null; } }
      if (m[1] === 'CASE') { if (obj) res.cases.push(obj); }
      else if (m[1] === 'FATAL') res.fatal = obj && obj.err ? obj.err : 'The Python run stopped early.';
      else res.done = true;
    });
    while (mine.length && mine[mine.length - 1] === '') mine.pop();
    while (mine.length && mine[0] === '') mine.shift();
    res.stdout = mine.join('\n');
    return res;
  }

  /* ---------------------------------------------------------------- judge (J1, J2) */
  function withTimeout(p, ms) {
    return new Promise(function (resolve, reject) {
      var t = setTimeout(function () { var e = new Error('Time limit exceeded'); e.timeout = true; reject(e); }, ms);
      Promise.resolve(p).then(function (v) { clearTimeout(t); resolve(v); }, function (e) { clearTimeout(t); reject(e); });
    });
  }
  function msg(e) { return String(e && e.message ? e.message : e).replace(/^(Error: )+/, ''); }
  function done(verdict, passed, total, fail) { return { verdict: verdict, passed: passed, total: total, fail: fail || null, ms: 0 }; }
  function quietClose(s) { try { return Promise.resolve(s.close()).catch(function () {}); } catch (e) { return Promise.resolve(); } }

  async function judgeSql(problem, code, runner, cases, limit) {
    var total = cases.length, passed = 0;
    for (var i = 0; i < total; i++) {
      var c = cases[i], s = null, got;
      var where = { index: i, hidden: !!c.hidden, input: (c.setup || []).join('\n') };
      try { s = await withTimeout(runner.session(), limit); }
      catch (e) { return done('Judge Error', passed, total, Object.assign(where, { message: 'The SQL engine did not start: ' + msg(e) })); }
      try {
        for (var q = 0; q < (c.setup || []).length; q++) await withTimeout(s.exec(c.setup[q]), limit);
      } catch (e) {
        await quietClose(s);
        return done('Judge Error', passed, total, Object.assign(where, { message: 'The question’s own setup failed: ' + msg(e) }));
      }
      try {
        if (problem.kind === 'mutate') {
          await withTimeout(s.exec(code), limit);
          got = await withTimeout(s.query(problem.verify), limit);
        } else {
          got = await withTimeout(s.query(code), limit);
        }
      } catch (e) {
        if (e && e.timeout) {
          if (runner.abort) runner.abort();
          quietClose(s);
          return done('Time Limit Exceeded', passed, total, Object.assign(where, { message: 'Stopped after ' + (limit / 1000) + ' seconds.' }));
        }
        await quietClose(s);
        return done('Runtime Error', passed, total, Object.assign(where, { message: msg(e) }));
      }
      await quietClose(s);
      if (!got || !got.columns || !got.columns.length) {
        return done('Wrong Answer', passed, total, Object.assign(where, { expected: c.expected, actual: got || { columns: [], rows: [] }, message: 'Your query returned no result table. End with a SELECT.' }));
      }
      var cmp = compareTables(got, c.expected, { ordered: !!problem.ordered });
      if (!cmp.ok) {
        return done('Wrong Answer', passed, total, Object.assign(where, { expected: c.expected, actual: got, message: cmp.detail, reason: cmp.reason }));
      }
      passed++;
    }
    return done('Accepted', passed, total, null);
  }

  async function judgePy(problem, code, runner, cases, limit) {
    var total = cases.length, out, timedOut = false;
    try { out = await runner.py(pyHarness(problem, code, cases), limit); }
    catch (e) {
      if (e && e.timeout) { timedOut = true; out = e.partial || ''; if (runner.abort) runner.abort(); }
      else return done('Judge Error', 0, total, { index: 0, hidden: false, message: 'The Python engine did not run: ' + msg(e) });
    }
    var p = parsePyOutput(out);
    if (p.fatal) return done('Runtime Error', 0, total, { index: 0, hidden: false, message: p.fatal, stdout: p.stdout });
    for (var i = 0; i < p.cases.length && i < total; i++) {
      var r = p.cases[i], c = cases[i];
      var where = { index: i, hidden: !!c.hidden, input: describeCall(problem, c), stdout: p.stdout };
      if (r.err) return done('Runtime Error', i, total, Object.assign(where, { message: r.err }));
      if (!r.ok) return done('Wrong Answer', i, total, Object.assign(where, { expected: c.expected, actual: r.got, message: 'Your output differs from the expected output.' }));
    }
    if (timedOut) {
      var k = Math.min(p.cases.length, total - 1);
      return done('Time Limit Exceeded', p.cases.length, total, { index: k, hidden: !!cases[k].hidden, input: describeCall(problem, cases[k]), message: 'Stopped after ' + (limit / 1000) + ' seconds.', stdout: p.stdout });
    }
    if (!p.done || p.cases.length < total) {
      return done('Judge Error', p.cases.length, total, { index: p.cases.length, hidden: false, message: 'The Python run ended without a full result.', stdout: p.stdout });
    }
    return done('Accepted', total, total, null);
  }

  // scope 'run' uses the visible cases; 'submit' uses all of them
  async function judge(problem, code, runner, opts) {
    opts = opts || {};
    var limit = opts.limitMs || LIMIT_MS;
    var cases = (problem.cases || []).filter(function (c) { return opts.scope === 'run' ? !c.hidden : true; });
    var t0 = Date.now();
    var res = problem.lang === 'python' ? await judgePy(problem, code, runner, cases, limit) : await judgeSql(problem, code, runner, cases, limit);
    res.ms = Date.now() - t0;
    return res;
  }

  /* ---------------------------------------------------------------- SQL sessions */
  // Each case gets its own connection and its own in-memory database, so a learner's CREATE TABLE
  // (or CREATE TEMP TABLE) cannot touch the playground's tables or leak into the next case.
  // newConn() -> Promise<{ query(sql) -> arrow table, close() }>
  var seq = 0;
  async function openSession(newConn) {
    var conn = await newConn();
    var name = 'judge_' + (++seq);
    function run(sql) { return conn.query(sql); }
    try {
      await run("ATTACH ':memory:' AS " + name);
      await run('USE ' + name);
    } catch (e) {
      try { await conn.close(); } catch (e2) { /* already gone */ }
      throw e;
    }
    return {
      exec: async function (sql) { await run(sql); },
      query: async function (sql) { return arrowToTable(await run(sql)); },
      close: async function () {
        try { await run('USE memory'); await run('DETACH ' + name); } catch (e) { /* the engine may already be gone */ }
        try { await conn.close(); } catch (e) { /* same */ }
      },
    };
  }

  return {
    TOL: TOL, LIMIT_MS: LIMIT_MS, MAX_REVEALS: MAX_REVEALS,
    arrowToTable: arrowToTable, cellOf: cellOf,
    compareTables: compareTables,
    hintCost: hintCost, nextHintCost: nextHintCost, penaltyFor: penaltyFor, applyPenalty: applyPenalty,
    revealNext: revealNext, unlocked: unlocked, addSubmission: addSubmission,
    describeCall: describeCall, pyRepr: pyRepr,
    pyHarness: pyHarness, parsePyOutput: parsePyOutput,
    judge: judge, openSession: openSession,
  };
});
