const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const sales = (rows) => tbl('sales', 'sale_id INT, product_id INT, year INT, quantity INT, price INT', rows);

module.exports = {
  id: 'sql-d05-first-year-sales', day: 5, lc: 'product-sales-analysis-iii', anchor: 'LC 1070', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Product Sales Analysis III', kind: 'select', ordered: false,
  schema: ['sales(sale_id INT, product_id INT, year INT, quantity INT, price INT)'],
  statement: para(
    'For every product, return **all** of its sales rows from the **first year** that product was sold. A product can have several sales in its first year, and each one is returned.',
    'Return the columns `product_id`, `first_year`, `quantity` and `price`.'
  ),
  starter: '-- Return: product_id, first_year, quantity, price\nSELECT\n',
  solution: [
    'SELECT product_id, year AS first_year, quantity, price',
    'FROM (',
    '  SELECT *, MIN(year) OVER (PARTITION BY product_id) AS y0',
    '  FROM sales',
    ')',
    'WHERE year = y0',
  ].join('\n'),
  mutants: [
    { name: 'uses one first year for the whole table', code: 'SELECT product_id, year AS first_year, quantity, price FROM sales WHERE year = (SELECT MIN(year) FROM sales)' },
    { name: 'keeps one row per product and loses a second sale in the same year', slipsPastSamples: true, code: 'SELECT product_id, year AS first_year, quantity, price FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY year) AS rn FROM sales) WHERE rn = 1' },
    { name: 'sums everything instead of listing the rows', code: 'SELECT product_id, MIN(year) AS first_year, SUM(quantity) AS quantity, MAX(price) AS price FROM sales GROUP BY product_id' },
    { name: 'picks the latest year', code: 'SELECT product_id, year AS first_year, quantity, price FROM (SELECT *, MAX(year) OVER (PARTITION BY product_id) AS y0 FROM sales) WHERE year = y0' },
  ],
  hints: [
    'Say the grain of the answer out loud: it is rows of sales, not one row per product.',
    'You need each product\'s earliest year attached to every one of its rows. A window MIN with PARTITION BY product_id does that.',
    'Keep the rows where year equals that earliest year.',
  ],
  approach: para(
    'The grain is **sales rows from each product\'s first year**. First attach the product\'s earliest year to every row, then filter on equality. A window `MIN(year) OVER (PARTITION BY product_id)` does both in one pass.',
    'The same result comes from `WHERE (product_id, year) IN (SELECT product_id, MIN(year) FROM sales GROUP BY product_id)`.',
    '`ROW_NUMBER() = 1` looks right but returns a single row per product, which loses the second sale in a shared first year.'
  ),
  cases: [
    { tables: [sales([[1, 100, 2008, 10, 5000], [2, 100, 2009, 12, 5000], [7, 200, 2011, 15, 9000]])], expect: out(['product_id', 'first_year', 'quantity', 'price'], [[100, 2008, 10, 5000], [200, 2011, 15, 9000]]) },
    { hidden: true, tables: [sales([[1, 100, 2008, 10, 5000], [2, 100, 2008, 5, 5100], [3, 100, 2010, 7, 5000]])], expect: out(['product_id', 'first_year', 'quantity', 'price'], [[100, 2008, 10, 5000], [100, 2008, 5, 5100]]) },
    { hidden: true, tables: [sales([[1, 100, 2012, 3, 10], [2, 100, 2010, 4, 11], [3, 200, 2011, 8, 20], [4, 200, 2013, 9, 21]])], expect: out(['product_id', 'first_year', 'quantity', 'price'], [[100, 2010, 4, 11], [200, 2011, 8, 20]]) },
    { hidden: true, tables: [sales([[1, 300, 2015, 1, 99]])], expect: out(['product_id', 'first_year', 'quantity', 'price'], [[300, 2015, 1, 99]]) },
  ],
};
