const { tbl, D, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const products = (rows) => tbl('products', 'product_id INT, product_name VARCHAR, product_category VARCHAR', rows);
const orders = (rows) => tbl('orders', 'product_id INT, order_date DATE, unit INT', rows.map((r) => [r[0], D(r[1]), r[2]]));
const cols = ['product_name', 'unit'];

module.exports = {
  id: 'sql-d17-list-the-products-ordered-in-a-period', day: 17, lc: 'list-the-products-ordered-in-a-period', anchor: 'LC 1327', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Products Ordered in a Period', kind: 'select', ordered: false,
  schema: [
    'products(product_id INT, product_name VARCHAR, product_category VARCHAR)   -- product_id is unique',
    'orders(product_id INT, order_date DATE, unit INT)   -- one row per order line',
  ],
  statement: para(
    'Each row of `orders` is one order line: a product, the day it was ordered, and how many `unit`s were ordered.',
    'Find the products that sold **at least 100 units in total during February 2020** (1 February to 29 February, both days included). Orders outside that month do not count towards the total.',
    'Return `product_name` and the February total, named `unit`. Rows can come in any order.'
  ),
  starter: '-- Return: product_name, unit\nSELECT\n',
  solution: [
    'SELECT p.product_name, SUM(o.unit) AS unit',
    'FROM products p',
    'JOIN orders o ON o.product_id = p.product_id',
    "WHERE o.order_date >= DATE '2020-02-01' AND o.order_date < DATE '2020-03-01'",
    'GROUP BY p.product_id, p.product_name',
    'HAVING SUM(o.unit) >= 100',
  ].join('\n'),
  mutants: [
    { name: 'forgets the date filter', code: 'SELECT p.product_name, SUM(o.unit) AS unit FROM products p JOIN orders o ON o.product_id = p.product_id GROUP BY p.product_id, p.product_name HAVING SUM(o.unit) >= 100' },
    { name: 'tests each order line instead of the total', code: "SELECT p.product_name, SUM(o.unit) AS unit FROM products p JOIN orders o ON o.product_id = p.product_id WHERE o.order_date >= DATE '2020-02-01' AND o.order_date < DATE '2020-03-01' AND o.unit >= 100 GROUP BY p.product_id, p.product_name" },
    { name: 'needs more than 100 instead of at least 100', slipsPastSamples: true, code: "SELECT p.product_name, SUM(o.unit) AS unit FROM products p JOIN orders o ON o.product_id = p.product_id WHERE o.order_date >= DATE '2020-02-01' AND o.order_date < DATE '2020-03-01' GROUP BY p.product_id, p.product_name HAVING SUM(o.unit) > 100" },
    { name: 'includes 1 March', slipsPastSamples: true, code: "SELECT p.product_name, SUM(o.unit) AS unit FROM products p JOIN orders o ON o.product_id = p.product_id WHERE o.order_date BETWEEN DATE '2020-02-01' AND DATE '2020-03-01' GROUP BY p.product_id, p.product_name HAVING SUM(o.unit) >= 100" },
  ],
  hints: [
    'Two filters are in play and they act at different times: one on single rows (the month) and one on a per-product total (at least 100).',
    'Row filters go in WHERE, before grouping. A condition on SUM(...) cannot go in WHERE. It needs HAVING.',
    'Filter the dates, GROUP BY the product, then HAVING SUM(unit) >= 100. For a month, use "on or after the 1st" and "before the 1st of next month" so the last day is never lost.',
  ],
  approach: para(
    '**Trigger:** "total per thing, but only things whose total passes a bar". **Pattern:** `WHERE` for the rows you want, `GROUP BY`, then `HAVING` on the aggregate. **Complexity:** one scan and one hash group.',
    'Use a half-open date range: `>= first day` and `< first day of next month`. It works for any month, and it stays correct if the column ever becomes a timestamp.',
    'The bar is "at least 100", so the test is `>= 100`. A product with exactly 100 in total is in.'
  ),
  cases: [
    {
      tables: [
        products([[1, 'Pen', 'Office'], [2, 'Lamp', 'Home'], [3, 'Mug', 'Home']]),
        orders([[1, '2020-02-03', 60], [1, '2020-02-20', 55], [2, '2020-02-10', 90], [2, '2020-01-31', 50], [3, '2020-02-05', 150]]),
      ],
      expect: out(cols, [['Pen', 115], ['Mug', 150]]),
    },
    {
      hidden: true,
      tables: [products([[1, 'Pen', 'Office'], [2, 'Lamp', 'Home']]), orders([[1, '2020-02-29', 100], [2, '2020-03-01', 500], [2, '2020-02-29', 99]])],
      expect: out(cols, [['Pen', 100]]),
    },
    { hidden: true, tables: [products([[1, 'Pen', 'Office']]), orders([[1, '2020-03-01', 300], [1, '2020-01-15', 300]])], expect: out(cols, []) },
    { hidden: true, tables: [products([[4, 'Desk', 'Home'], [5, 'Chair', 'Home']]), orders([[4, '2020-02-01', 40], [4, '2020-02-02', 40], [4, '2020-02-03', 40], [5, '2020-02-01', 99]])], expect: out(cols, [['Desk', 120]]) },
  ],
};
