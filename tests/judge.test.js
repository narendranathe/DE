'use strict';
// Pure judge logic: comparison, hint cost, XP, history, verdicts. No browser, no real database.
// Real DuckDB and real Python are covered in judge.runtime.test.js and problems.test.js.
const test = require('node:test');
const assert = require('node:assert/strict');
const J = require('../tools/assets/judge.js');

const T = (columns, rows) => ({ columns, rows });

// ---------------------------------------------------------------- J3 compareTables
test('J3 identical tables match', () => {
  assert.equal(J.compareTables(T(['a', 'b'], [[1, 'x'], [2, 'y']]), T(['a', 'b'], [[1, 'x'], [2, 'y']])).ok, true);
});

test('J3 row order is ignored by default', () => {
  assert.equal(J.compareTables(T(['a'], [[2], [1]]), T(['a'], [[1], [2]])).ok, true);
});

test('J3 row order matters when the question is ordered', () => {
  const r = J.compareTables(T(['a'], [[2], [1]]), T(['a'], [[1], [2]]), { ordered: true });
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'order');
});

test('J3 ordered question with different rows reports values, not order', () => {
  const r = J.compareTables(T(['a'], [[1], [3]]), T(['a'], [[1], [2]]), { ordered: true });
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'values');
});

test('J3 duplicate rows count', () => {
  const r = J.compareTables(T(['a'], [[1], [1]]), T(['a'], [[1]]));
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'rows');
  assert.match(r.detail, /expected 1 row/i);
  assert.match(r.detail, /got 2/i);
});

test('J3 same row count, one different value', () => {
  const r = J.compareTables(T(['a'], [[1], [2]]), T(['a'], [[1], [3]]));
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'values');
});

test('J3 numbers match within 1e-6 and int equals float', () => {
  assert.equal(J.compareTables(T(['a'], [[0.1 + 0.2]]), T(['a'], [[0.3]])).ok, true);
  assert.equal(J.compareTables(T(['a'], [[2]]), T(['a'], [[2.0]])).ok, true);
  assert.equal(J.compareTables(T(['a'], [[1.0000011]]), T(['a'], [[1]])).ok, false);
  assert.equal(J.compareTables(T(['a'], [[1.0000004]]), T(['a'], [[1]])).ok, true);
});

test('J3 unordered match with tolerance when rounding differs', () => {
  const a = T(['a', 'b'], [[1, 0.3000000004], [2, 0.5]]);
  const e = T(['a', 'b'], [[2, 0.5], [1, 0.3]]);
  assert.equal(J.compareTables(a, e).ok, true);
});

test('J3 NULL equals NULL, NULL differs from 0 and empty string', () => {
  assert.equal(J.compareTables(T(['a'], [[null]]), T(['a'], [[null]])).ok, true);
  assert.equal(J.compareTables(T(['a'], [[null]]), T(['a'], [[0]])).ok, false);
  assert.equal(J.compareTables(T(['a'], [[null]]), T(['a'], [['']])).ok, false);
});

test('J3 a string is not a number', () => {
  assert.equal(J.compareTables(T(['a'], [['1']]), T(['a'], [[1]])).ok, false);
});

test('J3 column count must match', () => {
  const r = J.compareTables(T(['a'], [[1]]), T(['a', 'b'], [[1, 2]]));
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'columns');
  assert.match(r.detail, /2 columns/i);
});

test('J3 column names match ignoring case, differ otherwise', () => {
  assert.equal(J.compareTables(T(['ID', 'Name'], [[1, 'a']]), T(['id', 'name'], [[1, 'a']])).ok, true);
  const r = J.compareTables(T(['id', 'nm'], [[1, 'a']]), T(['id', 'name'], [[1, 'a']]));
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'columns');
  assert.match(r.detail, /name/);
});

test('J3 empty tables', () => {
  assert.equal(J.compareTables(T(['a'], []), T(['a'], [])).ok, true);
  assert.equal(J.compareTables(T(['a'], []), T(['a'], [[1]])).reason, 'rows');
});

test('J3 booleans and dates compare as themselves', () => {
  assert.equal(J.compareTables(T(['a'], [[true]]), T(['a'], [[true]])).ok, true);
  assert.equal(J.compareTables(T(['a'], [[true]]), T(['a'], [[1]])).ok, false);
  assert.equal(J.compareTables(T(['d'], [['2024-03-05']]), T(['d'], [['2024-03-05']])).ok, true);
});

// ---------------------------------------------------------------- H3 hint cost
test('H3 cost after k reveals, bounty 20', () => {
  assert.deepEqual([0, 1, 2, 3, 4].map(k => J.hintCost(20, k)), [0, 5, 10, 15, 20]);
});

test('H3 cost after k reveals, bounty 10 rounds half up', () => {
  assert.deepEqual([0, 1, 2, 3, 4].map(k => J.hintCost(10, k)), [0, 3, 5, 8, 10]);
});

test('H3 k is clamped to 0..4', () => {
  assert.equal(J.hintCost(20, -3), 0);
  assert.equal(J.hintCost(20, 9), 20);
  assert.equal(J.hintCost(20, 2.9), 10);
});

test('H2 next hint cost is the step, not the total', () => {
  assert.deepEqual([0, 1, 2, 3].map(k => J.nextHintCost(20, k)), [5, 5, 5, 5]);
  assert.deepEqual([0, 1, 2, 3].map(k => J.nextHintCost(10, k)), [3, 2, 3, 2]);
  assert.equal(J.nextHintCost(20, 4), 0);
});

// ---------------------------------------------------------------- H5 penalty and XP
const ITEMS = [
  { id: 'a', bounty: 20, cat: 'PRACTICE' },
  { id: 'b', bounty: 10, cat: 'BUILD' },
  { id: 'c', bounty: 10, cat: 'BUILD' },
];

test('H5 penalty counts only categories that are fully earned', () => {
  const hints = { a: 2, b: 4, c: 1 };
  assert.equal(J.penaltyFor(ITEMS, hints, { PRACTICE: true, BUILD: false }), 10);
  assert.equal(J.penaltyFor(ITEMS, hints, { PRACTICE: true, BUILD: true }), 10 + 10 + 3);
  assert.equal(J.penaltyFor(ITEMS, hints, {}), 0);
});

test('H5 penalty ignores questions with no hints and unknown ids', () => {
  assert.equal(J.penaltyFor(ITEMS, { zzz: 4 }, { PRACTICE: true, BUILD: true }), 0);
  assert.equal(J.penaltyFor(ITEMS, undefined, { PRACTICE: true, BUILD: true }), 0);
  assert.equal(J.penaltyFor([], { a: 4 }, { PRACTICE: true }), 0);
});

test('H5 applyPenalty never goes below zero', () => {
  assert.equal(J.applyPenalty(150, 10), 140);
  assert.equal(J.applyPenalty(5, 10), 0);
  assert.equal(J.applyPenalty(0, 0), 0);
});

// ---------------------------------------------------------------- H2 / H6 hint state
test('H2 revealNext is monotonic, capped at 4, and does not mutate', () => {
  const h0 = {};
  const h1 = J.revealNext(h0, 'a');
  assert.deepEqual(h0, {});
  assert.deepEqual(h1, { a: 1 });
  let h = h1;
  for (let i = 0; i < 6; i++) h = J.revealNext(h, 'a');
  assert.equal(h.a, 4);
  assert.deepEqual(J.revealNext({ a: 2, b: 1 }, 'b'), { a: 2, b: 2 });
});

test('H6 solutions unlock after a solve or the full approach, not before', () => {
  assert.equal(J.unlocked(undefined), false);
  assert.equal(J.unlocked({}), false);
  assert.equal(J.unlocked({ hints: 3 }), false);
  assert.equal(J.unlocked({ hints: 4 }), true);
  assert.equal(J.unlocked({ solved: 1700000000000 }), true);
  assert.equal(J.unlocked({ solved: 0, hints: 0 }), false);
});

// ---------------------------------------------------------------- S1 history
test('S1 addSubmission puts the newest first, keeps the last 50, and does not mutate', () => {
  let list = [];
  for (let i = 1; i <= 55; i++) {
    const next = J.addSubmission(list, { n: i });
    assert.notEqual(next, list);
    list = next;
  }
  assert.equal(list.length, 50);
  assert.equal(list[0].n, 55);
  assert.equal(list[49].n, 6);
  const before = list.slice();
  J.addSubmission(list, { n: 99 });
  assert.deepEqual(list, before);
  assert.deepEqual(J.addSubmission(undefined, { n: 1 }), [{ n: 1 }]);
});

// ---------------------------------------------------------------- judge() with a fake SQL runner
function sqlProblem(extra) {
  return Object.assign({
    id: 'sql-x', lang: 'sql', kind: 'select', ordered: false, verify: null,
    cases: [
      { setup: ['S1'], expected: T(['n'], [[1]]) },
      { setup: ['S2'], expected: T(['n'], [[2]]) },
      { setup: ['S3'], expected: T(['n'], [[3]]), hidden: true },
    ],
  }, extra || {});
}

// answers[setupKey] is what a correct run returns; `behave` can override per case.
function fakeRunner(behave) {
  const r = { opened: 0, closed: 0, aborted: 0, log: [] };
  r.abort = () => { r.aborted++; };
  r.session = async () => {
    r.opened++;
    const s = { setup: [], ran: [] };
    s.exec = async (q) => { r.log.push(q); s.ran.push(q); return behave.exec ? behave.exec(q, s) : undefined; };
    s.query = async (q) => { r.log.push(q); return behave.query(q, s); };
    s.close = async () => { r.closed++; };
    return s;
  };
  return r;
}

const answer = { S1: 1, S2: 2, S3: 3 };
function okQuery(q, s) {
  const key = s.ran[0];
  return T(['n'], [[answer[key]]]);
}

test('J2 Accepted when every case matches', async () => {
  const r = fakeRunner({ query: okQuery });
  const v = await J.judge(sqlProblem(), 'SELECT n', r, { scope: 'submit' });
  assert.equal(v.verdict, 'Accepted');
  assert.equal(v.passed, 3);
  assert.equal(v.total, 3);
  assert.equal(v.fail, null);
  assert.equal(r.closed, r.opened);
});

test('J1 run scope uses only the visible cases', async () => {
  const r = fakeRunner({ query: okQuery });
  const v = await J.judge(sqlProblem(), 'SELECT n', r, { scope: 'run' });
  assert.equal(v.verdict, 'Accepted');
  assert.equal(v.total, 2);
  assert.ok(!r.log.includes('S3'));
});

test('J2 Wrong Answer stops at the first failing case and shows it', async () => {
  const r = fakeRunner({ query: (q, s) => (s.ran[0] === 'S2' ? T(['n'], [[99]]) : okQuery(q, s)) });
  const v = await J.judge(sqlProblem(), 'SELECT n', r, { scope: 'submit' });
  assert.equal(v.verdict, 'Wrong Answer');
  assert.equal(v.passed, 1);
  assert.equal(v.total, 3);
  assert.equal(v.fail.index, 1);
  assert.equal(v.fail.hidden, false);
  assert.deepEqual(v.fail.actual, T(['n'], [[99]]));
  assert.deepEqual(v.fail.expected, T(['n'], [[2]]));
  assert.match(v.fail.input, /S2/);
  assert.equal(r.opened, 2, 'does not keep running after the first failure');
  assert.equal(r.closed, 2);
});

test('J2 a failing hidden case is flagged hidden', async () => {
  const r = fakeRunner({ query: (q, s) => (s.ran[0] === 'S3' ? T(['n'], [[0]]) : okQuery(q, s)) });
  const v = await J.judge(sqlProblem(), 'SELECT n', r, { scope: 'submit' });
  assert.equal(v.verdict, 'Wrong Answer');
  assert.equal(v.fail.hidden, true);
  assert.equal(v.passed, 2);
});

test('J2 Runtime Error carries the database message', async () => {
  const r = fakeRunner({ query: async () => { throw new Error('Catalog Error: Table "nope" does not exist'); } });
  const v = await J.judge(sqlProblem(), 'SELECT * FROM nope', r, { scope: 'submit' });
  assert.equal(v.verdict, 'Runtime Error');
  assert.match(v.fail.message, /nope/);
  assert.equal(v.passed, 0);
  assert.equal(r.closed, r.opened);
});

test('J2 a problem whose setup fails is a Judge Error, not the learner’s fault', async () => {
  const r = fakeRunner({ exec: async () => { throw new Error('setup broke'); }, query: okQuery });
  const v = await J.judge(sqlProblem(), 'SELECT n', r, { scope: 'submit' });
  assert.equal(v.verdict, 'Judge Error');
  assert.match(v.fail.message, /setup broke/);
});

test('J2 a runtime that cannot open is a Judge Error', async () => {
  const r = { abort() {}, session: async () => { throw new Error('duckdb failed to load'); } };
  const v = await J.judge(sqlProblem(), 'SELECT 1', r, { scope: 'submit' });
  assert.equal(v.verdict, 'Judge Error');
  assert.match(v.fail.message, /duckdb failed to load/);
});

test('J4 Time Limit Exceeded stops the runtime', async () => {
  const r = fakeRunner({ query: () => new Promise(() => {}) });
  const v = await J.judge(sqlProblem(), 'SELECT forever', r, { scope: 'submit', limitMs: 30 });
  assert.equal(v.verdict, 'Time Limit Exceeded');
  assert.equal(r.aborted, 1);
  assert.equal(v.fail.index, 0);
});

test('J2 a select that returns no table is Wrong Answer with a plain reason', async () => {
  const r = fakeRunner({ query: async () => T([], []) });
  const v = await J.judge(sqlProblem(), 'CREATE TABLE z(a int)', r, { scope: 'submit' });
  assert.equal(v.verdict, 'Wrong Answer');
  assert.match(v.fail.message, /no (table|result|columns)/i);
});

test('J3 ordered questions fail on a wrong order and pass on the right one', async () => {
  const p = sqlProblem({
    ordered: true,
    cases: [{ setup: ['S1'], expected: T(['n'], [[1], [2]]) }],
  });
  const bad = fakeRunner({ query: async () => T(['n'], [[2], [1]]) });
  assert.equal((await J.judge(p, 'q', bad, { scope: 'submit' })).verdict, 'Wrong Answer');
  const good = fakeRunner({ query: async () => T(['n'], [[1], [2]]) });
  assert.equal((await J.judge(p, 'q', good, { scope: 'submit' })).verdict, 'Accepted');
});

test('J6 mutate runs the learner statements, then the verification query', async () => {
  const p = {
    id: 'sql-m', lang: 'sql', kind: 'mutate', ordered: false, verify: 'SELECT * FROM t ORDER BY 1',
    cases: [{ setup: ['CREATE'], expected: T(['a'], [[1]]) }],
  };
  const r = fakeRunner({ query: async (q) => (q === 'SELECT * FROM t ORDER BY 1' ? T(['a'], [[1]]) : T([], [])) });
  const v = await J.judge(p, 'DELETE FROM t WHERE a > 1', r, { scope: 'submit' });
  assert.equal(v.verdict, 'Accepted');
  assert.deepEqual(r.log, ['CREATE', 'DELETE FROM t WHERE a > 1', 'SELECT * FROM t ORDER BY 1']);
});

// ---------------------------------------------------------------- Python harness output
test('J4 parsePyOutput reads case lines, keeps the learner’s own prints, and spots a fatal error', () => {
  const out = [
    'hello from user code',
    '@@CASE@@{"ok":true,"got":[0,1]}',
    '@@CASE@@{"ok":false,"got":[1,1]}',
    'another print',
    '@@CASE@@{"err":"ValueError: nope"}',
    '@@END@@',
  ].join('\n');
  const p = J.parsePyOutput(out);
  assert.equal(p.cases.length, 3);
  assert.equal(p.cases[0].ok, true);
  assert.deepEqual(p.cases[1].got, [1, 1]);
  assert.equal(p.cases[2].err, 'ValueError: nope');
  assert.equal(p.done, true);
  assert.equal(p.stdout, 'hello from user code\nanother print');
  const f = J.parsePyOutput('@@FATAL@@{"err":"SyntaxError: invalid syntax (line 2)"}');
  assert.equal(f.fatal, 'SyntaxError: invalid syntax (line 2)');
  assert.equal(J.parsePyOutput('').done, false);
});

function pyProblem() {
  return {
    id: 'py-x', lang: 'python', kind: 'func', fn: 'f', cmp: 'eq',
    cases: [
      { args: [1], expected: 1 },
      { args: [2], expected: 2 },
      { args: [3], expected: 3, hidden: true },
    ],
  };
}
const caseLine = (o) => '@@CASE@@' + JSON.stringify(o);

test('J2 Python Accepted, and run scope sends only the visible cases', async () => {
  const seen = [];
  const lines = (n) => Array.from({ length: n }, () => caseLine({ ok: true })).concat('@@END@@').join('\n');
  const submit = { abort() {}, py: async (src) => { seen.push(src); return lines(3); } };
  const v = await J.judge(pyProblem(), 'def f(x): return x', submit, { scope: 'submit' });
  assert.equal(v.verdict, 'Accepted');
  assert.equal(v.passed, 3);
  assert.equal(v.total, 3);
  assert.ok(/\[3\]/.test(seen[0]), 'the hidden case is in the submit run');
  const run = { abort() {}, py: async (src) => { seen.push(src); return lines(2); } };
  const w = await J.judge(pyProblem(), 'def f(x): return x', run, { scope: 'run' });
  assert.equal(w.total, 2);
  assert.ok(!/\[3\]/.test(seen[1]), 'the hidden case is not in the run');
});

test('J2 Python Wrong Answer shows input, expected and actual', async () => {
  const r = { abort() {}, py: async () => [caseLine({ ok: true }), caseLine({ ok: false, got: 7 }), '@@END@@'].join('\n') };
  const v = await J.judge(pyProblem(), 'def f(x): return 7', r, { scope: 'submit' });
  assert.equal(v.verdict, 'Wrong Answer');
  assert.equal(v.passed, 1);
  assert.equal(v.fail.index, 1);
  assert.equal(v.fail.input, 'f(2)');
  assert.equal(v.fail.expected, 2);
  assert.equal(v.fail.actual, 7);
});

test('J4 Python Runtime Error and a fatal error before any case', async () => {
  const r1 = { abort() {}, py: async () => [caseLine({ err: 'ZeroDivisionError: division by zero' }), '@@END@@'].join('\n') };
  const v1 = await J.judge(pyProblem(), 'x', r1, { scope: 'submit' });
  assert.equal(v1.verdict, 'Runtime Error');
  assert.match(v1.fail.message, /ZeroDivisionError/);
  const r2 = { abort() {}, py: async () => '@@FATAL@@{"err":"SyntaxError: invalid syntax (line 1)"}' };
  const v2 = await J.judge(pyProblem(), 'def (', r2, { scope: 'submit' });
  assert.equal(v2.verdict, 'Runtime Error');
  assert.match(v2.fail.message, /SyntaxError/);
});

test('J4 Python Time Limit Exceeded uses the partial output to say which case hung', async () => {
  const r = { aborted: 0, abort() { this.aborted++; }, py: async () => { const e = new Error('timeout'); e.timeout = true; e.partial = caseLine({ ok: true }) + '\n'; throw e; } };
  const v = await J.judge(pyProblem(), 'while 1: pass', r, { scope: 'submit' });
  assert.equal(v.verdict, 'Time Limit Exceeded');
  assert.equal(v.passed, 1);
  assert.equal(v.fail.index, 1);
});

test('J4 Python with no END marker and no error is a Judge Error', async () => {
  const r = { abort() {}, py: async () => 'garbage' };
  const v = await J.judge(pyProblem(), 'x', r, { scope: 'submit' });
  assert.equal(v.verdict, 'Judge Error');
});

test('J2 a runtime that throws something else is a Judge Error', async () => {
  const r = { abort() {}, py: async () => { throw new Error('pyodide failed to load'); } };
  const v = await J.judge(pyProblem(), 'x', r, { scope: 'submit' });
  assert.equal(v.verdict, 'Judge Error');
  assert.match(v.fail.message, /pyodide failed to load/);
});

// ---------------------------------------------------------------- display helpers
test('J2 describeCall formats the visible input of a Python case', () => {
  assert.equal(J.describeCall({ kind: 'func', fn: 'two_sum' }, { args: [[2, 7], 9] }), 'two_sum([2, 7], 9)');
  assert.equal(
    J.describeCall({ kind: 'class', cls: 'MinStack' }, { ops: ['MinStack', 'push', 'getMin'], args: [[], [3], []] }),
    'MinStack(); push(3); getMin()'
  );
});

test('A2 pyHarness can record every answer, which is how expected output is computed from the reference', () => {
  const p = pyProblem();
  assert.match(J.pyHarness(p, 'x', p.cases, { record: true }), /_record = True/);
  assert.match(J.pyHarness(p, 'x', p.cases), /_record = False/);
});
