const { tbl, D, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const delivery = (rows) => tbl('delivery', 'delivery_id INT, customer_id INT, order_date DATE, preferred_date DATE', rows.map((r) => [r[0], r[1], D(r[2]), D(r[3])]));

module.exports = {
  id: 'sql-d04-immediate-food-delivery', day: 4, lc: 'immediate-food-delivery-ii', anchor: 'LC 1174', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Immediate Food Delivery II', kind: 'select', ordered: false,
  schema: ['delivery(delivery_id INT, customer_id INT, order_date DATE, preferred_date DATE)'],
  statement: para(
    'An order is **immediate** when `order_date` equals the customer\'s `preferred_date`. Otherwise it is scheduled.',
    'A customer\'s **first order** is their order with the earliest `order_date`. Each customer has only one order on that earliest date.',
    'Return the percentage of immediate orders among the first orders of all customers, rounded to 2 decimals, in a column named `immediate_percentage`.'
  ),
  starter: '-- Return: immediate_percentage\nSELECT\n',
  solution: [
    'SELECT ROUND(100.0 * AVG(CASE WHEN d.order_date = d.preferred_date THEN 1 ELSE 0 END), 2) AS immediate_percentage',
    'FROM delivery d',
    'WHERE d.order_date = (',
    '  SELECT MIN(order_date) FROM delivery WHERE customer_id = d.customer_id',
    ')',
  ].join('\n'),
  mutants: [
    { name: 'looks at every order, not only the first', code: 'SELECT ROUND(100.0 * AVG(CASE WHEN order_date = preferred_date THEN 1 ELSE 0 END), 2) AS immediate_percentage FROM delivery' },
    { name: 'forgets to round', slipsPastSamples: true, code: 'SELECT 100.0 * AVG(CASE WHEN d.order_date = d.preferred_date THEN 1 ELSE 0 END) AS immediate_percentage FROM delivery d WHERE d.order_date = (SELECT MIN(order_date) FROM delivery WHERE customer_id = d.customer_id)' },
    { name: 'uses the latest order instead of the first', slipsPastSamples: true, code: 'SELECT ROUND(100.0 * AVG(CASE WHEN d.order_date = d.preferred_date THEN 1 ELSE 0 END), 2) AS immediate_percentage FROM delivery d WHERE d.order_date = (SELECT MAX(order_date) FROM delivery WHERE customer_id = d.customer_id)' },
  ],
  hints: [
    'First answer a smaller question: which single row is each customer\'s first order? Write that query alone and check it.',
    'A correlated subquery, or a window function ranked by order_date, finds that row for each customer.',
    'Once only first orders remain, the percentage is the average of a 1-or-0 flag times 100.',
  ],
  approach: para(
    'State the grain first: **one row per customer, their first order**. Filter to that row, then the percentage is `AVG(flag) * 100`, where the flag is 1 for an immediate order and 0 otherwise.',
    'A window version works too: `RANK() OVER (PARTITION BY customer_id ORDER BY order_date) = 1`. The correlated subquery is shorter when each customer has one order on their first date, which the question promises.',
    'Check your rounding on a case like 1 of 3, where the answer is 33.33 and not 33.333333.'
  ),
  cases: [
    {
      tables: [delivery([[1, 1, '2019-08-01', '2019-08-02'], [2, 2, '2019-08-02', '2019-08-02'], [3, 1, '2019-08-11', '2019-08-12'], [4, 3, '2019-08-24', '2019-08-24'], [5, 3, '2019-08-21', '2019-08-22'], [6, 2, '2019-08-11', '2019-08-13'], [7, 4, '2019-08-09', '2019-08-09']])],
      expect: out(['immediate_percentage'], [[50]]),
    },
    { hidden: true, tables: [delivery([[1, 1, '2020-01-01', '2020-01-01'], [2, 2, '2020-01-02', '2020-01-03'], [3, 3, '2020-01-04', '2020-01-05']])], expect: out(['immediate_percentage'], [[33.33]]) },
    { hidden: true, tables: [delivery([[1, 1, '2020-01-01', '2020-01-01'], [2, 2, '2020-01-02', '2020-01-02']])], expect: out(['immediate_percentage'], [[100]]) },
    { hidden: true, tables: [delivery([[1, 1, '2020-01-01', '2020-01-02'], [2, 2, '2020-01-03', '2020-01-04']])], expect: out(['immediate_percentage'], [[0]]) },
    { hidden: true, tables: [delivery([[1, 1, '2020-01-01', '2020-01-05'], [2, 1, '2020-01-09', '2020-01-09']])], expect: out(['immediate_percentage'], [[0]]) },
  ],
};
