const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const person = (rows) => tbl('person', 'id INT, email VARCHAR', rows);

module.exports = {
  id: 'sql-d01-delete-duplicate-emails', day: 1, anchor: 'LC 196', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Delete Duplicate Emails', kind: 'mutate', ordered: false,
  verify: 'SELECT id, email FROM person ORDER BY id',
  schema: ['person(id INT, email VARCHAR)   -- id is unique'],
  statement: para(
    'The `person` table has one row per sign-up. The same email can appear on more than one row.',
    'Write one `DELETE` statement that removes the duplicates. For each email, keep the row with the **smallest `id`** and delete the rest.',
    'After your statement runs, the checker reads the whole `person` table and compares it with the expected rows.'
  ),
  starter: '-- Write one DELETE statement.\n',
  solution: 'DELETE FROM person\nWHERE id NOT IN (SELECT MIN(id) FROM person GROUP BY email)',
  mutants: [
    { name: 'deletes every row that has a twin, including the one to keep', code: 'DELETE FROM person\nWHERE email IN (SELECT email FROM person GROUP BY email HAVING COUNT(*) > 1)' },
    { name: 'keeps the largest id instead of the smallest', code: 'DELETE FROM person\nWHERE id NOT IN (SELECT MAX(id) FROM person GROUP BY email)' },
    { name: 'keeps only one row in the whole table', code: 'DELETE FROM person\nWHERE id > (SELECT MIN(id) FROM person)' },
  ],
  hints: [
    'Two rows are duplicates when they share an email. Before you write any SQL, decide which single row per email you will keep.',
    'GROUP BY email gives one group per email. Inside each group, MIN(id) picks the row to keep.',
    'Collect the ids to keep with a subquery, then delete every row whose id is not in that list.',
  ],
  approach: para(
    'The grain of the answer is **one kept row per email**. A subquery with `GROUP BY email` and `MIN(id)` lists exactly the ids to keep. Everything else goes.',
    '`NOT IN` is safe here because `id` is never NULL. If the column could hold NULLs, `NOT IN` would match nothing, and you would switch to `NOT EXISTS` or a `DELETE ... USING` self-join.',
    'Say the tie rule out loud before you code: "smallest id wins". Interviewers listen for it.'
  ),
  cases: [
    { tables: [person([[1, 'a@x.com'], [2, 'b@x.com'], [3, 'a@x.com']])], expect: out(['id', 'email'], [[1, 'a@x.com'], [2, 'b@x.com']]) },
    { tables: [person([[1, 'a'], [2, 'b']])], hidden: true, expect: out(['id', 'email'], [[1, 'a'], [2, 'b']]) },
    { tables: [person([[5, 'z'], [2, 'z'], [9, 'z'], [4, 'y']])], hidden: true, expect: out(['id', 'email'], [[2, 'z'], [4, 'y']]) },
    { tables: [person([[1, 'a'], [2, 'a'], [3, 'b'], [4, 'b'], [5, 'c']])], hidden: true, expect: out(['id', 'email'], [[1, 'a'], [3, 'b'], [5, 'c']]) },
    { tables: [person([])], hidden: true, expect: out(['id', 'email'], []) },
  ],
};
