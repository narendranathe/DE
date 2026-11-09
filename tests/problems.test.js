'use strict';
// Content tests for the question bank, run against the real engines.
// ONLY=sql-d03 npm test   runs just the questions whose id contains that text.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const B = require('../tools/build_problems.js');
const J = require('../tools/assets/judge.js');
const { sqlRunner, pyRunner } = require('../tools/dev/runners.js');

const all = B.loadProblems();
const only = process.env.ONLY;
const list = only ? all.filter((p) => p.id.includes(only)) : all;

test('A1 the bank has the 24 questions this release promises', () => {
  const sql = all.filter((p) => p.lang === 'sql').map((p) => p.day);
  const py = all.filter((p) => p.lang === 'python').map((p) => p.day);
  assert.deepEqual(sql, [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13]);
  assert.deepEqual(py, [15, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18]);
  assert.equal(all.length, 24);
});

test('A1 every source file passes validation', () => {
  assert.deepEqual(B.validateAll(all), []);
});

test('H3 bounties follow the XP rule: 20 for SQL practice reps, 10 for Python build problems', () => {
  for (const p of all) {
    if (p.lang === 'sql') { assert.equal(p.cat, 'PRACTICE', p.id); assert.equal(p.bounty, 20, p.id); }
    else { assert.equal(p.cat, 'BUILD', p.id); assert.equal(p.bounty, 10, p.id); }
  }
});

test('H1 hints guide without pasting the answer', () => {
  for (const p of all) {
    for (const h of p.hints) assert.ok(!h.includes('```'), p.id + ': a hint contains a code block');
    assert.ok(p.approach.length > 80, p.id + ': approach is too short to be useful');
  }
});

test('A2 each question: reference matches the hand-written answers, the starter fails, every mutant fails', async (t) => {
  const sql = await sqlRunner();
  const py = pyRunner();
  t.after(async () => { sql.close(); await py.close(); });
  const runners = { sql, py };

  for (const src of list) {
    await t.test(src.id, async () => {
      const full = await B.computeExpected(src, runners); // throws if the reference disagrees with a hand-written answer
      const run = (code, scope) => J.judge(full, code, src.lang === 'sql' ? sql : py, { scope: scope || 'submit', limitMs: 8000 });

      const ref = await run(src.solution);
      assert.equal(ref.verdict, 'Accepted', 'reference: ' + JSON.stringify(ref.fail));
      assert.equal(ref.total, src.cases.length);

      const start = await run(src.starter);
      assert.notEqual(start.verdict, 'Accepted', 'the starter code must not pass');

      for (const m of src.mutants) {
        const v = await run(m.code);
        assert.notEqual(v.verdict, 'Accepted', 'mutant "' + m.name + '" was accepted');
        assert.notEqual(v.verdict, 'Judge Error', 'mutant "' + m.name + '" broke the judge: ' + JSON.stringify(v.fail));
        if (m.slipsPastSamples) {
          const r = await run(m.code, 'run');
          assert.equal(r.verdict, 'Accepted', 'mutant "' + m.name + '" is meant to pass the samples');
          assert.equal(v.fail.hidden, true, 'mutant "' + m.name + '" is meant to be caught by a hidden case');
        }
      }
    });
  }
});

test('A1 the generated problems.js matches the sources (run: node tools/build_problems.js)', { skip: !!only }, async () => {
  const code = await B.main(['--check']);
  assert.equal(code, 0);
});

test('A1 the page payload stays small', { skip: !!only }, () => {
  const file = path.join(__dirname, '../tools/assets/problems.js');
  assert.ok(fs.existsSync(file), 'problems.js has not been built');
  assert.ok(fs.statSync(file).size < 400 * 1024, 'problems.js is over 400 KB');
});
