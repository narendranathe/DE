const { tbl, D, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const changes = (rows) => tbl('price_changes', 'product_id INT, new_price INT, change_date DATE', rows.map((r) => [r[0], r[1], D(r[2])]));

module.exports = {
  id: 'sql-d06-price-on-a-date', day: 6, anchor: 'LC 1164', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Product Price at a Given Date', kind: 'select', ordered: false,
  schema: ['price_changes(product_id INT, new_price INT, change_date DATE)'],
  statement: para(
    'Every product starts at a price of **10**. Each row of `price_changes` says that on `change_date` the product\'s price became `new_price`.',
    'Return the price of **every product** on **2019-08-16**, with the columns `product_id` and `price`. A change dated 2019-08-16 already applies on that day.',
    'Products whose first change comes after that date still appear, at the starting price of 10.'
  ),
  starter: '-- Return: product_id, price  (as of 2019-08-16)\nSELECT\n',
  solution: [
    'SELECT p.product_id, COALESCE(x.new_price, 10) AS price',
    'FROM (SELECT DISTINCT product_id FROM price_changes) p',
    'LEFT JOIN (',
    '  SELECT product_id, new_price,',
    '         ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY change_date DESC) AS rn',
    "  FROM price_changes WHERE change_date <= DATE '2019-08-16'",
    ') x ON x.product_id = p.product_id AND x.rn = 1',
  ].join('\n'),
  mutants: [
    { name: 'treats the change on the day itself as not yet applied', code: "SELECT p.product_id, COALESCE(x.new_price, 10) AS price FROM (SELECT DISTINCT product_id FROM price_changes) p LEFT JOIN (SELECT product_id, new_price, ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY change_date DESC) AS rn FROM price_changes WHERE change_date < DATE '2019-08-16') x ON x.product_id = p.product_id AND x.rn = 1" },
    { name: 'drops products that have no change yet', code: "SELECT product_id, new_price AS price FROM (SELECT product_id, new_price, ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY change_date DESC) AS rn FROM price_changes WHERE change_date <= DATE '2019-08-16') WHERE rn = 1" },
    { name: 'takes the earliest change instead of the latest', code: "SELECT p.product_id, COALESCE(x.new_price, 10) AS price FROM (SELECT DISTINCT product_id FROM price_changes) p LEFT JOIN (SELECT product_id, new_price, ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY change_date) AS rn FROM price_changes WHERE change_date <= DATE '2019-08-16') x ON x.product_id = p.product_id AND x.rn = 1" },
    { name: 'takes the highest price instead of the latest', slipsPastSamples: true, code: "SELECT p.product_id, COALESCE(MAX(c.new_price), 10) AS price FROM (SELECT DISTINCT product_id FROM price_changes) p LEFT JOIN price_changes c ON c.product_id = p.product_id AND c.change_date <= DATE '2019-08-16' GROUP BY p.product_id" },
  ],
  hints: [
    'This is a "what was true on this date" lookup. For each product you want the most recent change on or before 2019-08-16.',
    'Filter the changes to change_date <= 2019-08-16, then pick the newest row per product with ROW_NUMBER ordered by change_date descending.',
    'Start from the list of all products and LEFT JOIN the picked rows, so products with no change yet keep a row. COALESCE the missing price to 10.',
  ],
  approach: para(
    'This is the slowly-changing-dimension idea in miniature: **the latest row at or before a point in time**. Filter to `change_date <= :date`, rank per product by `change_date DESC`, keep rank 1.',
    'Products with no row before the date would vanish from an inner join. Start from the distinct product list and `LEFT JOIN`, then `COALESCE(price, 10)` for the default.',
    'Watch the boundary: `<=` includes a change made on the day itself. Say which one you chose.'
  ),
  cases: [
    { tables: [changes([[1, 20, '2019-08-14'], [2, 50, '2019-08-14'], [1, 30, '2019-08-15'], [1, 35, '2019-08-16'], [2, 65, '2019-08-17'], [3, 20, '2019-08-18']])], expect: out(['product_id', 'price'], [[1, 35], [2, 50], [3, 10]]) },
    { hidden: true, tables: [changes([[4, 40, '2019-08-01'], [4, 25, '2019-08-10']])], expect: out(['product_id', 'price'], [[4, 25]]) },
    { hidden: true, tables: [changes([[5, 99, '2019-09-01']])], expect: out(['product_id', 'price'], [[5, 10]]) },
    { hidden: true, tables: [changes([[6, 12, '2018-01-01'], [6, 18, '2019-08-16'], [7, 70, '2019-08-17'], [7, 71, '2019-12-01']])], expect: out(['product_id', 'price'], [[6, 18], [7, 10]]) },
  ],
};
