# Question files

One file per question. `node tools/build_problems.js` checks them all and writes `tools/assets/problems.js`
for the page. Files that start with `_` are skipped.

```js
const { tbl, D } = require('../build_problems.js');
module.exports = {
  id: 'sql-d02-top-three-salaries',   // sql-dNN-name or py-dNN-name
  day: 2,                             // the day card the question belongs to
  anchor: 'LC 185',                   // matches the checkbox link text on that day (exactly, or "LC 185 — ...")
  cat: 'PRACTICE',                    // XP category: PRACTICE (SQL rep) or BUILD (Python problem)
  bounty: 20,                         // XP at stake: 20 for PRACTICE, 10 for BUILD
  lang: 'sql',                        // 'sql' | 'python'
  title: '...', statement: '...',     // plain text; `code`, **bold**, ``` fences, and blank-line paragraphs
  starter: '...',                     // what the editor starts with
  solution: '...',                    // the reference. Never shipped on its own; shown only in the full approach
  hints: ['nudge', 'bigger nudge', 'almost the answer'],   // exactly three, no code blocks
  approach: '...',                    // the explanation shown at reveal 4; the solution is appended
  mutants: [{ name: '...', code: '...', slipsPastSamples: true }],  // wrong answers that must NOT be accepted
  cases: [ ... ],
};
```

**SQL** adds `kind: 'select' | 'mutate'` (mutate runs the learner's statements, then your `verify` query),
`ordered: true|false`, `schema: ['emp(id INT, salary INT)']` for the description, and cases of
`{ tables: [tbl('emp', 'id INT, salary INT', [[1, 100]])], expect: {columns, rows}, hidden: true }`.
Use `D('2020-01-31')` for a DATE value.

**Python** adds `fn` (or `kind: 'class'` with `cls`), `signature`, `cmp: 'eq' | 'unordered' | 'groups'`, and cases of
`{ args: [[2, 7], 9], expect: [0, 1], hidden: true }`. A class case is `{ ops: ['Stack','push','top'], args: [[],[1],[]], expect: [null,null,1] }`.

**The rule for `expect`:** every visible case needs a hand-written answer. The build runs the reference and fails if it
disagrees, so the reference is checked by a person, not only by itself. Hidden cases take their answer from the
reference (write an `expect` there too if you want it double-checked).
`slipsPastSamples: true` on a mutant means "this wrong solution passes RUN but a hidden case catches it".
