const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const signups = (ids) => tbl('signups', 'user_id INT', ids.map((i) => [i]));
const confirmations = (rows) => tbl('confirmations', 'user_id INT, action VARCHAR', rows);
const cols = ['user_id', 'confirmation_rate'];

module.exports = {
  id: 'sql-d38-confirmation-rate', day: 38, lc: 'confirmation-rate', anchor: 'LC 1934', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Confirmation Rate', kind: 'select', ordered: false,
  schema: [
    'signups(user_id INT)   -- user_id is unique',
    "confirmations(user_id INT, action VARCHAR)   -- action is 'confirmed' or 'timeout'; one row per confirmation request",
  ],
  statement: para(
    'After signing up, a user can ask for a confirmation message. Each request is one row in `confirmations`. It ended either as `confirmed` or as `timeout`.',
    'The **confirmation rate** of a user is: the number of `confirmed` requests divided by the total number of requests. A user who made **no** request has a rate of `0`.',
    'Return `user_id` and `confirmation_rate` (rounded to 2 decimals) for **every** user in `signups`. Rows can come in any order.'
  ),
  starter: '-- Return: user_id, confirmation_rate  (2 decimals, every user in signups)\nSELECT\n',
  solution: [
    'SELECT s.user_id,',
    "       ROUND(AVG(CASE WHEN c.action = 'confirmed' THEN 1.0 ELSE 0.0 END), 2) AS confirmation_rate",
    'FROM signups s',
    'LEFT JOIN confirmations c ON c.user_id = s.user_id',
    'GROUP BY s.user_id',
  ].join('\n'),
  mutants: [
    { name: 'users with no request are missing', code: "SELECT c.user_id, ROUND(AVG(CASE WHEN c.action = 'confirmed' THEN 1.0 ELSE 0.0 END), 2) AS confirmation_rate FROM confirmations c JOIN signups s ON s.user_id = c.user_id GROUP BY c.user_id" },
    { name: 'no rounding', code: "SELECT s.user_id, AVG(CASE WHEN c.action = 'confirmed' THEN 1.0 ELSE 0.0 END) AS confirmation_rate FROM signups s LEFT JOIN confirmations c ON c.user_id = s.user_id GROUP BY s.user_id" },
    { name: 'the share of timeouts instead of confirmations', code: "SELECT s.user_id, ROUND(AVG(CASE WHEN c.action = 'timeout' THEN 1.0 ELSE 0.0 END), 2) AS confirmation_rate FROM signups s LEFT JOIN confirmations c ON c.user_id = s.user_id GROUP BY s.user_id" },
    { name: 'gives a user with no request a rate of NULL', code: "SELECT s.user_id, ROUND(AVG(CASE WHEN c.user_id IS NULL THEN NULL WHEN c.action = 'confirmed' THEN 1.0 ELSE 0.0 END), 2) AS confirmation_rate FROM signups s LEFT JOIN confirmations c ON c.user_id = s.user_id GROUP BY s.user_id" },
  ],
  hints: [
    'Users with no requests still need a row. That tells you which table goes on the left of the join.',
    'Turn each request into a number: 1 when it was confirmed and 0 when it was not. The average of those numbers is exactly the rate.',
    'LEFT JOIN confirmations onto signups, GROUP BY user_id, AVG(CASE ...), then ROUND to 2 decimals. A user with no requests gets one NULL-matched row that counts as 0.',
  ],
  approach: para(
    '**Trigger:** "rate", "share", "percent that did X". **Pattern:** the average of a 0/1 flag is the rate. `AVG(CASE WHEN good THEN 1.0 ELSE 0.0 END)`. **Complexity:** one join and one group.',
    'Start from `signups`, the table that lists **everyone**, and `LEFT JOIN` the events. An inner join, or starting from `confirmations`, silently drops users who never asked.',
    'A user with no request has one joined row where `action` is `NULL`. The `CASE` sends `NULL` to the `ELSE` branch, which gives 0.0, so their average is 0 as the question requires.'
  ),
  cases: [
    {
      tables: [signups([1, 2, 3, 4]), confirmations([[1, 'confirmed'], [1, 'timeout'], [1, 'timeout'], [2, 'confirmed'], [2, 'confirmed'], [3, 'timeout']])],
      expect: out(cols, [[1, 0.33], [2, 1], [3, 0], [4, 0]]),
    },
    { hidden: true, tables: [signups([9]), confirmations([])], expect: out(cols, [[9, 0]]) },
    { hidden: true, tables: [signups([1, 2]), confirmations([[1, 'confirmed'], [1, 'confirmed'], [1, 'confirmed'], [1, 'timeout'], [2, 'confirmed'], [2, 'timeout']])], expect: out(cols, [[1, 0.75], [2, 0.5]]) },
    { hidden: true, tables: [signups([5, 6, 7]), confirmations([[7, 'confirmed'], [7, 'timeout'], [7, 'timeout'], [5, 'confirmed'], [5, 'confirmed'], [5, 'timeout'], [5, 'timeout'], [5, 'timeout']])], expect: out(cols, [[5, 0.4], [6, 0], [7, 0.33]]) },
  ],
};
