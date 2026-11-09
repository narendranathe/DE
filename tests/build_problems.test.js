'use strict';
// The problem-file format and the build step: validation, expected-output computation, page output.
const test = require('node:test');
const assert = require('node:assert/strict');
const B = require('../tools/build_problems.js');
const J = require('../tools/assets/judge.js');

const T = (columns, rows) => ({ columns, rows });

function sqlSrc(over) {
  return Object.assign({
    id: 'sql-d01-demo', day: 1, lang: 'sql', anchor: 'LC 1', cat: 'PRACTICE', bounty: 20,
    title: 'Demo', kind: 'select', ordered: false,
    statement: 'Return the biggest salary.',
    schema: ['emp(id INT, salary INT)'],
    starter: '-- write your query\n',
    solution: 'SELECT MAX(salary) AS top FROM emp',
    mutants: [{ name: 'min', code: 'SELECT MIN(salary) AS top FROM emp' }, { name: 'sum', code: 'SELECT SUM(salary) AS top FROM emp' }],
    hints: ['one', 'two', 'three'],
    approach: 'Use an aggregate.',
    cases: [
      { tables: [B.tbl('emp', 'id INT, salary INT', [[1, 100], [2, 300]])], expect: T(['top'], [[300]]) },
      { tables: [B.tbl('emp', 'id INT, salary INT', [[1, 5]])], hidden: true },
      { tables: [B.tbl('emp', 'id INT, salary INT', [[1, 5], [2, 5]])], hidden: true },
    ],
  }, over || {});
}

function pySrc(over) {
  return Object.assign({
    id: 'py-d15-demo', day: 15, lang: 'python', anchor: 'Demo', cat: 'BUILD', bounty: 10,
    title: 'Demo', kind: 'func', fn: 'double', cmp: 'eq',
    statement: 'Return twice n.', signature: 'def double(n: int) -> int:',
    starter: 'def double(n):\n    pass\n',
    solution: 'def double(n):\n    return n * 2\n',
    mutants: [{ name: 'plus', code: 'def double(n):\n    return n + 2\n' }, { name: 'same', code: 'def double(n):\n    return n\n' }],
    hints: ['one', 'two', 'three'],
    approach: 'Multiply.',
    cases: [
      { args: [2], expect: 4 },
      { args: [0], hidden: true },
      { args: [-3], hidden: true },
    ],
  }, over || {});
}

/* ------------------------------------------------------------ validate (A1) */
test('A1 valid SQL and Python sources pass', () => {
  assert.deepEqual(B.validate(sqlSrc()), []);
  assert.deepEqual(B.validate(pySrc()), []);
});

const BAD = [
  ['an id that does not follow the pattern', sqlSrc({ id: 'Demo 1' }), /id/],
  ['a missing title', sqlSrc({ title: '' }), /title/],
  ['an unknown language', sqlSrc({ lang: 'ruby' }), /lang/],
  ['a day outside 1..84', sqlSrc({ day: 0 }), /day/],
  ['a bounty that is not a positive whole number', sqlSrc({ bounty: 2.5 }), /bounty/],
  ['two hints instead of three', sqlSrc({ hints: ['a', 'b'] }), /hints/],
  ['an empty hint', sqlSrc({ hints: ['a', '', 'c'] }), /hints/],
  ['no approach text', sqlSrc({ approach: '' }), /approach/],
  ['fewer than two mutants', sqlSrc({ mutants: [{ name: 'x', code: 'SELECT 1' }] }), /mutants/],
  ['no hidden case', sqlSrc({ cases: sqlSrc().cases.slice(0, 1) }), /hidden/],
  ['a visible case with no expected output', sqlSrc({ cases: [{ tables: sqlSrc().cases[0].tables }, sqlSrc().cases[1], sqlSrc().cases[2]] }), /expect/],
  ['a mutate question with no verify query', sqlSrc({ kind: 'mutate' }), /verify/],
  ['an unknown SQL kind', sqlSrc({ kind: 'drop' }), /kind/],
  ['a case with no tables and no setup', sqlSrc({ cases: [{ expect: T(['top'], [[1]]) }, sqlSrc().cases[1], sqlSrc().cases[2]] }), /tables|setup/],
  ['an unknown comparison', pySrc({ cmp: 'fuzzy' }), /cmp/],
  ['a Python func problem with no fn', pySrc({ fn: '' }), /fn/],
  ['a Python case with no args', pySrc({ cases: [{ expect: 1 }, pySrc().cases[1], pySrc().cases[2]] }), /args/],
  ['a class problem whose first op is not the class', pySrc({ kind: 'class', cls: 'Box', fn: undefined, cases: [{ ops: ['Other', 'put'], args: [[], [1]], expect: [null, null] }, { ops: ['Box'], args: [[]], hidden: true }, { ops: ['Box'], args: [[]], hidden: true }] }), /ops/],
];
for (const [name, src, re] of BAD) {
  test('A1 validate rejects ' + name, () => {
    const errs = B.validate(src);
    assert.ok(errs.length > 0, 'expected an error');
    assert.match(errs.join(' | '), re);
    assert.match(errs[0], new RegExp(String(src.id).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 'errors name the problem');
  });
}

test('A1 validateAll rejects duplicate ids', () => {
  const errs = B.validateAll([sqlSrc(), sqlSrc()]);
  assert.match(errs.join(' '), /duplicate/i);
});

test('A3 validateAll rejects two problems with the same day and anchor', () => {
  const errs = B.validateAll([sqlSrc(), sqlSrc({ id: 'sql-d01-other' })]);
  assert.match(errs.join(' '), /anchor/i);
});

/* ------------------------------------------------------------ setup SQL from tables */
test('A1 setupOf turns table specs into CREATE and INSERT statements with safe literals', () => {
  const stmts = B.setupOf([B.tbl('t', 'id INT, name VARCHAR, d DATE, x DOUBLE', [[1, "O'Hara", B.D('2020-02-03'), null], [2, 'b', B.D('2020-02-04'), 1.5]])]);
  assert.equal(stmts[0], 'CREATE TABLE t(id INT, name VARCHAR, d DATE, x DOUBLE)');
  assert.equal(stmts[1], "INSERT INTO t VALUES (1, 'O''Hara', DATE '2020-02-03', NULL), (2, 'b', DATE '2020-02-04', 1.5)");
  assert.deepEqual(B.setupOf([B.tbl('empty', 'a INT', [])]), ['CREATE TABLE empty(a INT)']);
});

/* ------------------------------------------------------------ compute expected (A2) */
// A tiny SQL stand-in: the "reference" returns max or min of the inserted numbers.
function fakeSql() {
  return {
    abort() {},
    session: async () => {
      const nums = [];
      return {
        exec: async (q) => { const m = /VALUES (.*)$/.exec(q); if (m) for (const row of m[1].match(/\(([^)]*)\)/g)) nums.push(Number(row.slice(1, -1).split(',')[1])); },
        query: async (q) => T(['top'], [[/MAX/.test(q) ? Math.max(...nums) : Math.min(...nums)]]),
        close: async () => {},
      };
    },
  };
}

test('A2 computeExpected fills the hidden cases from the reference and keeps the visible ones', async () => {
  const out = await B.computeExpected(sqlSrc(), { sql: fakeSql() });
  assert.deepEqual(out.cases[0].expected, T(['top'], [[300]]));
  assert.deepEqual(out.cases[1].expected, T(['top'], [[5]]));
  assert.equal(out.cases[1].hidden, true);
  assert.match(out.cases[0].setup[0], /^CREATE TABLE emp/);
  assert.ok(!('expect' in out.cases[0]));
});

test('A2 computeExpected fails loudly when the reference disagrees with a hand-written visible answer', async () => {
  const src = sqlSrc();
  src.cases[0].expect = T(['top'], [[999]]);
  await assert.rejects(() => B.computeExpected(src, { sql: fakeSql() }), (e) => /sql-d01-demo/.test(e.message) && /case 1/i.test(e.message) && /999/.test(e.message));
});

test('A2 computeExpected checks a hidden case too when the author wrote an answer for it', async () => {
  const src = sqlSrc();
  src.cases[1].expect = T(['top'], [[6]]);
  await assert.rejects(() => B.computeExpected(src, { sql: fakeSql() }), /case 2/i);
});

test('A2 computeExpected for Python records every answer from the reference', async () => {
  const py = {
    abort() {},
    py: async (src) => {
      assert.match(src, /_record = True/);
      return ['@@CASE@@{"ok":true,"got":4}', '@@CASE@@{"ok":true,"got":0}', '@@CASE@@{"ok":true,"got":-6}', '@@END@@{}'].join('\n');
    },
  };
  const out = await B.computeExpected(pySrc(), { py });
  assert.deepEqual(out.cases.map((c) => c.expected), [4, 0, -6]);
});

test('A2 computeExpected fails when the Python reference raises', async () => {
  const py = { abort() {}, py: async () => '@@CASE@@{"ok":true,"got":4}\n@@CASE@@{"err":"ZeroDivisionError: x"}\n@@END@@{}' };
  await assert.rejects(() => B.computeExpected(pySrc(), { py }), /ZeroDivisionError/);
});

/* ------------------------------------------------------------ page output */
test('A1 toPage keeps what the page needs and drops the author-only parts', async () => {
  const full = await B.computeExpected(sqlSrc(), { sql: fakeSql() });
  const page = B.toPage(full);
  assert.equal(page.id, 'sql-d01-demo');
  assert.ok(!('mutants' in page));
  assert.ok(!('solution' in page));
  assert.ok(!('expect' in page.cases[0]));
  assert.equal(page.cases.length, 3);
  assert.equal(page.hints.length, 3);
  assert.match(page.approach, /Use an aggregate\./);
  assert.match(page.approach, /SELECT MAX\(salary\)/, 'the reference solution is appended to the full approach');
  assert.ok(Array.isArray(page.cases[0].tables), 'visible cases keep their tables for display');
  assert.ok(Array.isArray(page.cases[1].setup));
});

test('A1 render wraps the problems as a script-safe assignment', () => {
  const js = B.render([{ id: 'x', title: '</script><b>' }]);
  assert.ok(js.startsWith('window.PROBLEMS='));
  assert.ok(!js.includes('</script>'));
  const back = new Function('window', js + '; return window.PROBLEMS;')({});
  assert.equal(back[0].title, '</script><b>');
});

/* ------------------------------------------------------------ the judge accepts what computeExpected builds */
test('A2 a computed problem is judged Accepted by its own reference and rejects a mutant', async () => {
  const full = await B.computeExpected(sqlSrc(), { sql: fakeSql() });
  const runner = fakeSql();
  assert.equal((await J.judge(full, sqlSrc().solution, runner, { scope: 'submit' })).verdict, 'Accepted');
  assert.equal((await J.judge(full, sqlSrc().mutants[0].code, runner, { scope: 'submit' })).verdict, 'Wrong Answer');
});
