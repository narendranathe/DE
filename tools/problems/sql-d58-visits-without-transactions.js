const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const visits = (rows) => tbl('visits', 'visit_id INT, customer_id INT', rows);
const transactions = (rows) => tbl('transactions', 'transaction_id INT, visit_id INT, amount INT', rows);
const cols = ['customer_id', 'count_no_trans'];

module.exports = {
  id: 'sql-d58-visits-without-transactions', day: 58, lc: 'customer-who-visited-but-did-not-make-any-transactions', anchor: 'LC 1581', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Customer Who Visited but Did Not Make Any Transactions', kind: 'select', ordered: false,
  schema: [
    'visits(visit_id INT, customer_id INT)   -- visit_id is unique',
    'transactions(transaction_id INT, visit_id INT, amount INT)   -- a visit can have several transactions, or none',
  ],
  statement: para(
    'A customer visits a shop, and during a visit they may make zero, one or several purchases. Purchases are rows in `transactions`, linked to a visit by `visit_id`.',
    'Find the customers who made **visits with no purchase at all**, and count those empty visits for each of them. A customer who bought something on some other visit still counts if they had at least one empty visit.',
    'Return `customer_id` and `count_no_trans`. Rows can come in any order.'
  ),
  starter: '-- Return: customer_id, count_no_trans\nSELECT\n',
  solution: [
    'SELECT v.customer_id, COUNT(*) AS count_no_trans',
    'FROM visits v',
    'LEFT JOIN transactions t ON t.visit_id = v.visit_id',
    'WHERE t.transaction_id IS NULL',
    'GROUP BY v.customer_id',
  ].join('\n'),
  mutants: [
    { name: 'counts all visits, with or without a purchase', code: 'SELECT customer_id, COUNT(*) AS count_no_trans FROM visits GROUP BY customer_id' },
    { name: 'drops every customer who ever bought something', code: 'SELECT customer_id, COUNT(*) AS count_no_trans FROM visits WHERE customer_id NOT IN (SELECT v.customer_id FROM visits v JOIN transactions t ON t.visit_id = v.visit_id) GROUP BY customer_id' },
    { name: 'counts the purchase rows of the empty visits, which is always zero rows', code: 'SELECT v.customer_id, COUNT(t.transaction_id) AS count_no_trans FROM visits v LEFT JOIN transactions t ON t.visit_id = v.visit_id WHERE t.transaction_id IS NULL GROUP BY v.customer_id' },
    { name: 'counts customers instead of visits', code: 'SELECT customer_id, 1 AS count_no_trans FROM visits WHERE visit_id NOT IN (SELECT visit_id FROM transactions) GROUP BY customer_id' },
  ],
  hints: [
    'The unit you count is a visit, not a customer and not a purchase. Decide which visits are "empty" first.',
    'A visit is empty when no row in transactions has its visit_id. LEFT JOIN transactions onto visits, then keep the rows where the transaction side is NULL.',
    'GROUP BY customer_id and COUNT(*) to count the empty visits for each customer.',
  ],
  approach: para(
    '**Trigger:** "things that have no related rows" (an anti-join). **Pattern:** `LEFT JOIN ... WHERE right.key IS NULL`, or `NOT IN` / `NOT EXISTS`. **Complexity:** one join.',
    'Filter the **visits** before you group. If you filter customers instead, a customer with one empty visit and one purchase would wrongly disappear.',
    'Count with `COUNT(*)`. `COUNT(t.transaction_id)` is always 0 on these rows, because the transaction side is `NULL` by definition.'
  ),
  cases: [
    {
      tables: [
        visits([[1, 23], [2, 9], [4, 30], [5, 54], [6, 96], [7, 54], [8, 54]]),
        transactions([[2, 5, 310], [3, 5, 300], [9, 5, 200], [12, 1, 910], [13, 2, 970]]),
      ],
      expect: out(cols, [[54, 2], [30, 1], [96, 1]]),
    },
    { hidden: true, tables: [visits([[1, 1], [2, 1]]), transactions([[1, 1, 10], [2, 2, 10]])], expect: out(cols, []) },
    { hidden: true, tables: [visits([[1, 7], [2, 7], [3, 7]]), transactions([])], expect: out(cols, [[7, 3]]) },
    { hidden: true, tables: [visits([[1, 5], [2, 5], [3, 6]]), transactions([[1, 1, 10], [2, 1, 20], [3, 3, 5]])], expect: out(cols, [[5, 1]]) },
  ],
};
