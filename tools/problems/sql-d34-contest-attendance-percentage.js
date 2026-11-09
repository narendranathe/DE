const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const users = (n) => tbl('users', 'user_id INT, user_name VARCHAR', Array.from({ length: n }, (_, i) => [i + 1, 'user' + (i + 1)]));
const register = (rows) => tbl('register', 'contest_id INT, user_id INT', rows);
const cols = ['contest_id', 'percentage'];

module.exports = {
  id: 'sql-d34-contest-attendance-percentage', day: 34, lc: 'percentage-of-users-attended-a-contest', anchor: 'LC 1633', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Percentage of Users Attended a Contest', kind: 'select', ordered: true,
  schema: [
    'users(user_id INT, user_name VARCHAR)   -- user_id is unique',
    'register(contest_id INT, user_id INT)   -- (contest_id, user_id) is unique',
  ],
  statement: para(
    '`users` lists everyone with an account. `register` has one row for each user who signed up for a contest.',
    'For each contest, work out the **percentage of all users** who registered for it, rounded to **2 decimals**.',
    'Return `contest_id` and `percentage`. Order by `percentage` from high to low. When two contests have the same percentage, put the smaller `contest_id` first.'
  ),
  starter: '-- Return: contest_id, percentage  (ordered)\nSELECT\n',
  solution: [
    'SELECT contest_id,',
    '       ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM users), 2) AS percentage',
    'FROM register',
    'GROUP BY contest_id',
    'ORDER BY percentage DESC, contest_id',
  ].join('\n'),
  mutants: [
    { name: 'divides by the number of sign-ups, not by the number of users', code: 'SELECT contest_id, ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM register), 2) AS percentage FROM register GROUP BY contest_id ORDER BY percentage DESC, contest_id' },
    { name: 'divides by the users who signed up for anything', code: 'SELECT contest_id, ROUND(100.0 * COUNT(*) / (SELECT COUNT(DISTINCT user_id) FROM register), 2) AS percentage FROM register GROUP BY contest_id ORDER BY percentage DESC, contest_id' },
    { name: 'no rounding', code: 'SELECT contest_id, 100.0 * COUNT(*) / (SELECT COUNT(*) FROM users) AS percentage FROM register GROUP BY contest_id ORDER BY percentage DESC, contest_id' },
    { name: 'breaks ties with the larger contest_id first', code: 'SELECT contest_id, ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM users), 2) AS percentage FROM register GROUP BY contest_id ORDER BY percentage DESC, contest_id DESC' },
  ],
  hints: [
    'The percentage is "users in this contest" divided by "all users", times 100. The bottom number is the same for every contest.',
    'GROUP BY contest_id and COUNT(*) gives the top number. A scalar subquery, (SELECT COUNT(*) FROM users), gives the bottom number.',
    'Use 100.0 so the division is not whole-number division, then ROUND(..., 2). In ORDER BY, sort by percentage DESC and then by contest_id for ties.',
  ],
  approach: para(
    '**Trigger:** "percentage of the total". **Pattern:** `GROUP BY` for the numerator and a **scalar subquery** for a denominator that does not depend on the group. **Complexity:** one scan of each table.',
    'The denominator is **all users**, including people who never registered for anything. Taking it from `register` instead would shrink it and inflate every percentage.',
    'Always state the tie rule out loud. Without `contest_id` in the `ORDER BY`, equal percentages can come out in any order, and the answer is no longer repeatable.'
  ),
  cases: [
    { tables: [users(3), register([[100, 1], [100, 2], [101, 1], [102, 1], [102, 2]])], expect: out(cols, [[100, 66.67], [102, 66.67], [101, 33.33]]) },
    { hidden: true, tables: [users(4), register([[5, 1], [5, 2], [5, 3], [5, 4]])], expect: out(cols, [[5, 100]]) },
    { hidden: true, tables: [users(6), register([[9, 1], [9, 2], [8, 3]])], expect: out(cols, [[9, 33.33], [8, 16.67]]) },
    { hidden: true, tables: [users(5), register([[3, 1], [1, 2], [2, 3]])], expect: out(cols, [[1, 20], [2, 20], [3, 20]]) },
  ],
};
