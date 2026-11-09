const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const orders = (rows) => tbl('orders', 'order_number INT, customer_number INT', rows);

module.exports = {
  id: 'sql-d20-customer-with-most-orders', day: 20, lc: 'customer-placing-the-largest-number-of-orders', anchor: 'LC 586', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Customer Placing the Largest Number of Orders', kind: 'select', ordered: false,
  schema: ['orders(order_number INT, customer_number INT)   -- order_number is unique'],
  statement: para(
    'Each row of `orders` is one order, placed by one customer.',
    'Return the `customer_number` of the customer who placed **the most orders**. The data guarantees that exactly one customer has the highest count, so the answer is a single row.',
    '*Follow-up to think about:* what would you change if two customers could tie, and you had to return both?'
  ),
  starter: '-- Return: customer_number\nSELECT\n',
  solution: [
    'SELECT customer_number',
    'FROM orders',
    'GROUP BY customer_number',
    'ORDER BY COUNT(*) DESC',
    'LIMIT 1',
  ].join('\n'),
  mutants: [
    { name: 'picks the customer with the fewest orders', code: 'SELECT customer_number FROM orders GROUP BY customer_number ORDER BY COUNT(*) ASC LIMIT 1' },
    { name: 'picks the highest customer number instead of the highest count', code: 'SELECT customer_number FROM orders GROUP BY customer_number ORDER BY customer_number DESC LIMIT 1' },
    { name: 'picks the runner-up', code: 'SELECT customer_number FROM orders GROUP BY customer_number ORDER BY COUNT(*) DESC LIMIT 1 OFFSET 1' },
  ],
  hints: [
    'You need a count per customer first. Then you need the customer with the biggest count.',
    'GROUP BY customer_number gives one row per customer. COUNT(*) is the number of orders in each group.',
    'Sort the groups by that count, largest first, and keep one row with LIMIT 1.',
  ],
  approach: para(
    '**Trigger:** "the one with the most / the least". **Pattern:** `GROUP BY`, `ORDER BY COUNT(*) DESC`, `LIMIT 1`. **Complexity:** one group and one sort.',
    'You can sort by an aggregate that is not in the `SELECT` list, so you do not need to show the count.',
    '**The follow-up.** `LIMIT 1` hides ties: it keeps one customer and drops the other. To return every tied customer, compare each count with the maximum: `HAVING COUNT(*) = (SELECT MAX(c) FROM (SELECT COUNT(*) AS c FROM orders GROUP BY customer_number))`. Or rank the counts with `RANK()` and keep rank 1.'
  ),
  cases: [
    { tables: [orders([[1, 2], [2, 2], [3, 3], [4, 1], [5, 2]])], expect: out(['customer_number'], [[2]]) },
    { hidden: true, tables: [orders([[1, 8], [2, 5], [3, 8], [4, 5], [5, 8]])], expect: out(['customer_number'], [[8]]) },
    { hidden: true, tables: [orders([[1, 4]])], expect: out(['customer_number'], [[4]]) },
    { hidden: true, tables: [orders([[10, 1], [11, 9], [12, 9], [13, 9], [14, 2], [15, 2]])], expect: out(['customer_number'], [[9]]) },
  ],
};
