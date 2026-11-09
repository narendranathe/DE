'use strict';
// The judge against the real engines: DuckDB (SQL) and CPython through Pyodide (Python).
const test = require('node:test');
const assert = require('node:assert/strict');
const J = require('../tools/assets/judge.js');
const { sqlRunner, pyRunner } = require('../tools/dev/runners.js');

const T = (columns, rows) => ({ columns, rows });

/* ------------------------------------------------------------------ SQL */
test('SQL engine', async (t) => {
  const sql = await sqlRunner();
  t.after(() => sql.close());

  await t.test('arrowToTable gives plain values for every common type', async () => {
    const s = await sql.session();
    await s.exec("CREATE TABLE t(a INT, d DATE, x DECIMAL(10,2), s VARCHAR, ts TIMESTAMP, b BOOLEAN, big BIGINT, f DOUBLE)");
    await s.exec("INSERT INTO t VALUES (1, DATE '2024-03-05', 3.50, 'hi', TIMESTAMP '2024-03-05 10:11:12', TRUE, 9999999999, 1.5), (NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL)");
    const got = await s.query('SELECT * FROM t ORDER BY a NULLS LAST');
    await s.close();
    assert.deepEqual(got.columns, ['a', 'd', 'x', 's', 'ts', 'b', 'big', 'f']);
    assert.deepEqual(got.rows[0], [1, '2024-03-05', 3.5, 'hi', '2024-03-05 10:11:12', true, 9999999999, 1.5]);
    assert.deepEqual(got.rows[1], [null, null, null, null, null, null, null, null]);
  });

  await t.test('J5 a learner’s tables stay inside their own case', async () => {
    const a = await sql.session();
    await a.exec('CREATE TABLE leak AS SELECT 1 AS n');
    assert.deepEqual((await a.query('SELECT * FROM leak')).rows, [[1]]);
    await a.close();
    const b = await sql.session();
    await assert.rejects(() => b.query('SELECT * FROM leak'), /leak/i);
    await b.close();
  });

  await t.test('J5 temp tables do not leak from one case to the next', async () => {
    const a = await sql.session();
    await a.exec('CREATE TEMP TABLE scratch AS SELECT 1 AS n');
    await a.close();
    const b = await sql.session();
    await assert.rejects(() => b.query('SELECT * FROM scratch'), /scratch/i);
    await b.exec('CREATE TEMP TABLE scratch AS SELECT 2 AS n'); // the name is free again
    await b.close();
  });

  await t.test('J5 the playground’s own tables are not visible to judged code', async () => {
    await sql.run('CREATE TABLE playground_only AS SELECT 42 AS answer');
    const s = await sql.session();
    await assert.rejects(() => s.query('SELECT * FROM playground_only'), /playground_only/i);
    await s.close();
    // and the playground table survived the sessions
    assert.equal(sql.conn.query('SELECT answer FROM playground_only').getChildAt(0).get(0), 42);
    await sql.run('DROP TABLE playground_only');
  });

  const SALARY = {
    id: 'sql-salary', lang: 'sql', kind: 'select', ordered: false, verify: null,
    cases: [
      { setup: ['CREATE TABLE emp(id INT, salary INT)', 'INSERT INTO emp VALUES (1,100),(2,300),(3,200)'], expected: T(['top'], [[300]]) },
      { setup: ['CREATE TABLE emp(id INT, salary INT)', 'INSERT INTO emp VALUES (1,50)'], expected: T(['top'], [[50]]), hidden: true },
    ],
  };

  await t.test('J2 Accepted, Wrong Answer, Runtime Error on the real engine', async () => {
    const ok = await J.judge(SALARY, 'SELECT MAX(salary) AS top FROM emp', sql, { scope: 'submit' });
    assert.equal(ok.verdict, 'Accepted');
    const bad = await J.judge(SALARY, 'SELECT MIN(salary) AS top FROM emp', sql, { scope: 'submit' });
    assert.equal(bad.verdict, 'Wrong Answer');
    assert.deepEqual(bad.fail.actual, T(['top'], [[100]]));
    const err = await J.judge(SALARY, 'SELECT MAX(salary) FROM nope', sql, { scope: 'submit' });
    assert.equal(err.verdict, 'Runtime Error');
    assert.match(err.fail.message, /nope/);
    const syn = await J.judge(SALARY, 'SELEC 1', sql, { scope: 'submit' });
    assert.equal(syn.verdict, 'Runtime Error');
  });

  await t.test('J2 a case with a trailing semicolon and several statements still works', async () => {
    const v = await J.judge(SALARY, 'CREATE TEMP TABLE m AS SELECT MAX(salary) AS top FROM emp; SELECT top FROM m;', sql, { scope: 'submit' });
    assert.equal(v.verdict, 'Accepted');
  });

  await t.test('J3 ordered questions on the real engine', async () => {
    const p = {
      id: 'sql-ord', lang: 'sql', kind: 'select', ordered: true, verify: null,
      cases: [{ setup: ['CREATE TABLE n(v INT)', 'INSERT INTO n VALUES (3),(1),(2)'], expected: T(['v'], [[1], [2], [3]]) }],
    };
    assert.equal((await J.judge(p, 'SELECT v FROM n ORDER BY v', sql, { scope: 'submit' })).verdict, 'Accepted');
    const bad = await J.judge(p, 'SELECT v FROM n ORDER BY v DESC', sql, { scope: 'submit' });
    assert.equal(bad.verdict, 'Wrong Answer');
    assert.equal(bad.fail.reason, 'order');
  });

  await t.test('J6 mutate: run the learner’s DELETE, then compare the verification query', async () => {
    const p = {
      id: 'sql-mut', lang: 'sql', kind: 'mutate', ordered: false, verify: 'SELECT id, email FROM p ORDER BY id',
      cases: [{ setup: ['CREATE TABLE p(id INT, email VARCHAR)', "INSERT INTO p VALUES (1,'a'),(2,'a'),(3,'b')"], expected: T(['id', 'email'], [[1, 'a'], [3, 'b']]) }],
    };
    const ok = await J.judge(p, 'DELETE FROM p WHERE id NOT IN (SELECT MIN(id) FROM p GROUP BY email)', sql, { scope: 'submit' });
    assert.equal(ok.verdict, 'Accepted');
    const bad = await J.judge(p, 'DELETE FROM p WHERE id = 3', sql, { scope: 'submit' });
    assert.equal(bad.verdict, 'Wrong Answer');
  });

  await t.test('after many judged cases the engine is still clean', async () => {
    for (let i = 0; i < 12; i++) await J.judge(SALARY, 'SELECT MAX(salary) AS top FROM emp', sql, { scope: 'submit' });
    const dbs = sql.conn.query("SELECT COUNT(*) AS n FROM duckdb_databases() WHERE database_name LIKE 'judge_%'").getChildAt(0).get(0);
    assert.equal(Number(dbs), 0);
  });
});

/* ------------------------------------------------------------------ Python */
const TWO_SUM = {
  id: 'py-two-sum', lang: 'python', kind: 'func', fn: 'two_sum', cmp: 'unordered',
  cases: [
    { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
    { args: [[3, 2, 4], 6], expected: [1, 2] },
    { args: [[3, 3], 6], expected: [0, 1], hidden: true },
  ],
};
const GOOD = 'def two_sum(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        if target - x in seen:\n            return [seen[target - x], i]\n        seen[x] = i\n';

test('Python engine', async (t) => {
  const py = pyRunner();
  t.after(() => py.close());

  await t.test('J2 Accepted, Wrong Answer and the failing input', async () => {
    const ok = await J.judge(TWO_SUM, GOOD, py, { scope: 'submit' });
    assert.equal(ok.verdict, 'Accepted');
    assert.equal(ok.passed, 3);
    const bad = await J.judge(TWO_SUM, 'def two_sum(nums, target):\n    return [0, 0]\n', py, { scope: 'submit' });
    assert.equal(bad.verdict, 'Wrong Answer');
    assert.equal(bad.fail.index, 0);
    assert.equal(bad.fail.input, 'two_sum([2, 7, 11, 15], 9)');
    assert.deepEqual(bad.fail.actual, [0, 0]);
    assert.deepEqual(bad.fail.expected, [0, 1]);
  });

  await t.test('J1 run scope only runs the visible cases', async () => {
    const v = await J.judge(TWO_SUM, GOOD, py, { scope: 'run' });
    assert.equal(v.total, 2);
    assert.equal(v.verdict, 'Accepted');
  });

  await t.test('J4 Runtime Error names the exception and the line in the learner’s code', async () => {
    const v = await J.judge(TWO_SUM, 'def two_sum(nums, target):\n    x = 1\n    return nums[99]\n', py, { scope: 'submit' });
    assert.equal(v.verdict, 'Runtime Error');
    assert.match(v.fail.message, /IndexError/);
    assert.match(v.fail.message, /line 3/);
  });

  await t.test('J4 a syntax error is reported once, as a Runtime Error', async () => {
    const v = await J.judge(TWO_SUM, 'def two_sum(nums, target)\n    return 1\n', py, { scope: 'submit' });
    assert.equal(v.verdict, 'Runtime Error');
    assert.match(v.fail.message, /SyntaxError/);
  });

  await t.test('J4 a missing function says what to define', async () => {
    const v = await J.judge(TWO_SUM, 'def other(): pass\n', py, { scope: 'submit' });
    assert.equal(v.verdict, 'Runtime Error');
    assert.match(v.fail.message, /two_sum/);
  });

  await t.test('J4 the learner’s own print output is kept and does not break grading', async () => {
    const v = await J.judge(TWO_SUM, 'print("hello")\n' + GOOD.replace('return [', 'print("x", end="")\n            return ['), py, { scope: 'submit' });
    assert.equal(v.verdict, 'Accepted');
  });

  await t.test('J4 a loop that never ends is stopped, and the next run still works', async () => {
    await py.py('print(1)', 20000); // warm start, so the limit below measures only the hang
    const t0 = Date.now();
    const v = await J.judge(TWO_SUM, 'def two_sum(nums, target):\n    while True:\n        pass\n', py, { scope: 'submit', limitMs: 800 });
    assert.equal(v.verdict, 'Time Limit Exceeded');
    assert.equal(v.fail.index, 0);
    assert.ok(Date.now() - t0 < 6000, 'it did not hang the test');
    const again = await J.judge(TWO_SUM, GOOD, py, { scope: 'submit' });
    assert.equal(again.verdict, 'Accepted');
  });

  await t.test('J4 the learner cannot damage later cases by changing their input', async () => {
    const p = {
      id: 'py-mut', lang: 'python', kind: 'func', fn: 'first', cmp: 'eq',
      cases: [{ args: [[5, 6]], expected: 5 }, { args: [[5, 6]], expected: 5 }],
    };
    const v = await J.judge(p, 'def first(a):\n    x = a[0]\n    a.clear()\n    return x\n', py, { scope: 'submit' });
    assert.equal(v.verdict, 'Accepted');
  });

  await t.test('J4 comparison modes: eq with float tolerance, unordered, groups', async () => {
    const f = { id: 'f', lang: 'python', kind: 'func', fn: 'f', cmp: 'eq', cases: [{ args: [], expected: 0.3 }] };
    assert.equal((await J.judge(f, 'def f():\n    return 0.1 + 0.2\n', py, { scope: 'submit' })).verdict, 'Accepted');
    const g = { id: 'g', lang: 'python', kind: 'func', fn: 'g', cmp: 'groups', cases: [{ args: [], expected: [['ate', 'eat', 'tea'], ['bat']] }] };
    assert.equal((await J.judge(g, 'def g():\n    return [["bat"], ["tea", "ate", "eat"]]\n', py, { scope: 'submit' })).verdict, 'Accepted');
    assert.equal((await J.judge(g, 'def g():\n    return [["bat", "tea"], ["ate", "eat"]]\n', py, { scope: 'submit' })).verdict, 'Wrong Answer');
    const e = { id: 'e', lang: 'python', kind: 'func', fn: 'e', cmp: 'eq', cases: [{ args: [], expected: [1, 2] }] };
    assert.equal((await J.judge(e, 'def e():\n    return [2, 1]\n', py, { scope: 'submit' })).verdict, 'Wrong Answer');
    assert.equal((await J.judge(e, 'def e():\n    return (1, 2)\n', py, { scope: 'submit' })).verdict, 'Accepted', 'a tuple counts as a list');
  });

  await t.test('J4 class problems: constructor, then a list of calls', async () => {
    const MIN = {
      id: 'py-min', lang: 'python', kind: 'class', cmp: 'eq',
      cases: [{
        ops: ['MinStack', 'push', 'push', 'push', 'getMin', 'pop', 'getMin', 'pop', 'getMin'],
        args: [[], [3], [1], [2], [], [], [], [], []],
        expected: [null, null, null, null, 1, null, 1, null, 3],
      }],
    };
    const good = 'class MinStack:\n    def __init__(self):\n        self.s = []\n    def push(self, v):\n        self.s.append((v, min(v, self.s[-1][1]) if self.s else v))\n    def pop(self):\n        self.s.pop()\n    def getMin(self):\n        return self.s[-1][1]\n';
    assert.equal((await J.judge(MIN, good, py, { scope: 'submit' })).verdict, 'Accepted');
    const bad = good.replace('min(v, self.s[-1][1]) if self.s else v', 'v');
    const v = await J.judge(MIN, bad, py, { scope: 'submit' });
    assert.equal(v.verdict, 'Wrong Answer');
    assert.match(v.fail.input, /push\(3\); push\(1\); push\(2\)/);
  });

  await t.test('J4 booleans are not integers', async () => {
    const b = { id: 'b', lang: 'python', kind: 'func', fn: 'b', cmp: 'eq', cases: [{ args: [], expected: true }] };
    assert.equal((await J.judge(b, 'def b():\n    return 1\n', py, { scope: 'submit' })).verdict, 'Wrong Answer');
    assert.equal((await J.judge(b, 'def b():\n    return True\n', py, { scope: 'submit' })).verdict, 'Accepted');
  });

  await t.test('J4 code that has odd characters and quotes survives the harness', async () => {
    const p = { id: 's', lang: 'python', kind: 'func', fn: 's', cmp: 'eq', cases: [{ args: [], expected: 'a"b\'c\\d\né✓' }] };
    const code = 'def s():\n    return "a\\"b\'c\\\\d\\né✓"\n';
    assert.equal((await J.judge(p, code, py, { scope: 'submit' })).verdict, 'Accepted');
  });
});
