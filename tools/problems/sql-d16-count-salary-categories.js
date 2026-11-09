const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const accounts = (rows) => tbl('accounts', 'account_id INT, income INT', rows);
const cols = ['category', 'accounts_count'];

module.exports = {
  id: 'sql-d16-count-salary-categories', day: 16, lc: 'count-salary-categories', anchor: 'LC 1907', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Count Salary Categories', kind: 'select', ordered: false,
  schema: ['accounts(account_id INT, income INT)   -- account_id is unique'],
  statement: para(
    'Each bank account has a yearly `income`. Put every account in one of three bands:',
    '- `Low Salary`: income **below** 20000\n- `Average Salary`: income from 20000 to 50000, **both ends included**\n- `High Salary`: income **above** 50000',
    'Return one row per band with the number of accounts in it, as `category` and `accounts_count`. **All three bands must appear**, even a band with no accounts (its count is 0). Rows can come in any order.'
  ),
  starter: '-- Return: category, accounts_count   (all three categories, even if a count is 0)\nSELECT\n',
  solution: [
    'SELECT c.category, COUNT(a.account_id) AS accounts_count',
    "FROM (VALUES ('Low Salary'), ('Average Salary'), ('High Salary')) AS c(category)",
    'LEFT JOIN accounts a',
    '  ON c.category = CASE WHEN a.income < 20000 THEN \'Low Salary\'',
    '                       WHEN a.income <= 50000 THEN \'Average Salary\'',
    '                       ELSE \'High Salary\' END',
    'GROUP BY c.category',
  ].join('\n'),
  mutants: [
    { name: 'a band with no accounts is missing', code: "SELECT CASE WHEN income < 20000 THEN 'Low Salary' WHEN income <= 50000 THEN 'Average Salary' ELSE 'High Salary' END AS category, COUNT(*) AS accounts_count FROM accounts GROUP BY 1" },
    { name: 'an empty band shows 1 instead of 0', code: "SELECT c.category, COUNT(*) AS accounts_count FROM (VALUES ('Low Salary'), ('Average Salary'), ('High Salary')) AS c(category) LEFT JOIN accounts a ON c.category = CASE WHEN a.income < 20000 THEN 'Low Salary' WHEN a.income <= 50000 THEN 'Average Salary' ELSE 'High Salary' END GROUP BY c.category" },
    { name: 'income of exactly 50000 counted as High', slipsPastSamples: true, code: "SELECT c.category, COUNT(a.account_id) AS accounts_count FROM (VALUES ('Low Salary'), ('Average Salary'), ('High Salary')) AS c(category) LEFT JOIN accounts a ON c.category = CASE WHEN a.income < 20000 THEN 'Low Salary' WHEN a.income < 50000 THEN 'Average Salary' ELSE 'High Salary' END GROUP BY c.category" },
    { name: 'income of exactly 20000 counted as Low', slipsPastSamples: true, code: "SELECT c.category, COUNT(a.account_id) AS accounts_count FROM (VALUES ('Low Salary'), ('Average Salary'), ('High Salary')) AS c(category) LEFT JOIN accounts a ON c.category = CASE WHEN a.income <= 20000 THEN 'Low Salary' WHEN a.income <= 50000 THEN 'Average Salary' ELSE 'High Salary' END GROUP BY c.category" },
  ],
  hints: [
    'Counting rows that exist is easy. Showing a band that has **no** rows needs a list of all three bands that does not depend on the data.',
    'Build that list with VALUES, then LEFT JOIN the accounts onto it. A CASE expression in the ON clause decides which band each account belongs to.',
    'Count a column from the accounts side, COUNT(a.account_id), not COUNT(*). An empty band still has one joined row, and COUNT(*) would count it as 1.',
  ],
  approach: para(
    '**Trigger:** "report every category, including the empty ones". **Pattern:** a fixed list of categories on the left, `LEFT JOIN` the data to it, then `COUNT` a column from the right side. **Complexity:** one pass.',
    'A plain `GROUP BY CASE ...` can only show groups that have at least one row, so an empty band vanishes. The `VALUES` list guarantees all three rows exist.',
    '`COUNT(*)` counts the joined row even when the right side is all `NULL`. `COUNT(a.account_id)` skips the `NULL`, so an empty band reads 0.',
    'Check the edges out loud: **20000 and 50000 both belong to Average**.'
  ),
  cases: [
    { tables: [accounts([[1, 25000], [2, 30000], [3, 70000]])], expect: out(cols, [['Low Salary', 0], ['Average Salary', 2], ['High Salary', 1]]) },
    { hidden: true, tables: [accounts([[1, 20000], [2, 50000], [3, 19999], [4, 50001]])], expect: out(cols, [['Low Salary', 1], ['Average Salary', 2], ['High Salary', 1]]) },
    { hidden: true, tables: [accounts([])], expect: out(cols, [['Low Salary', 0], ['Average Salary', 0], ['High Salary', 0]]) },
    { hidden: true, tables: [accounts([[1, 5], [2, 10], [3, 19000], [4, 120000]])], expect: out(cols, [['Low Salary', 3], ['Average Salary', 0], ['High Salary', 1]]) },
  ],
};
