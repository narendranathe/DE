# Question files

One file per question. `node tools/build_problems.js` checks them all and writes `tools/assets/problems.js`
for the page. Files that start with `_` are skipped.

```js
const { tbl, D } = require('../build_problems.js');
module.exports = {
  id: 'sql-d02-top-three-salaries',   // sql-dNN-name or py-dNN-name
  day: 2,                             // the day card where the question first appears
  lc: 'department-top-three-salaries',// the LeetCode problem it replaces: leetcode.com/problems/<lc>/ . Unique across the bank
  anchor: 'LC 185',                   // matches the checkbox link text on that day (exactly, or "LC 185 — ...")
  cat: 'PRACTICE',                    // XP category: PRACTICE (SQL rep or a later Python problem) or BUILD (Python, Days 15-20)
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

**`lc` and the plan.** The build rewrites every link to `leetcode.com/problems/<lc>/` in the plan: the link text now opens
this question, and a small `LC ↗` link keeps the LeetCode page one click away. A problem that has no checkbox of its own
(it only appears in a checkbox that lists several problems, like a timed set) uses `bounty: 0`, leaves out `cat` and `anchor`,
and has no XP at stake. When the same problem shows up again on a later day, the page gives that day's box its own
SOLVE HERE button on its own, with no XP.

**SQL** adds `kind: 'select' | 'mutate'` (mutate runs the learner's statements, then your `verify` query),
`ordered: true|false`, `schema: ['emp(id INT, salary INT)']` for the description, and cases of
`{ tables: [tbl('emp', 'id INT, salary INT', [[1, 100]])], expect: {columns, rows}, hidden: true }`.
Use `D('2020-01-31')` for a DATE value.

**Python** adds `fn` (or `kind: 'class'` with `cls`), `signature`, `cmp: 'eq' | 'unordered' | 'groups'`, and cases of
`{ args: [[2, 7], 9], expect: [0, 1], hidden: true }`. A class case is `{ ops: ['Stack','push','top'], args: [[],[1],[]], expect: [null,null,1] }`.

**Trees and graphs.** For a Python function that takes or returns a tree, add `conv: { args: { 0: 'tree' }, ret: 'tree' }`
(`args` maps an argument position to `'tree'` or `'graph'`; `ret` is `'tree'` or `'graph'`). The cases stay plain lists:
a tree is a level-order list with `null` for a gap, a graph is an adjacency list where entry `i` holds the neighbours of
node `i + 1`. The learner gets `TreeNode(val, left, right)` and `Node(val, neighbors)` already defined. A returned graph that
reuses a node of the original is rejected as "not a copy".

**The rule for `expect`:** every visible case needs a hand-written answer. The build runs the reference and fails if it
disagrees, so the reference is checked by a person, not only by itself. Hidden cases take their answer from the
reference (write an `expect` there too if you want it double-checked).
`slipsPastSamples: true` on a mutant means "this wrong solution passes RUN but a hidden case catches it".
