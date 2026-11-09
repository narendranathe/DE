const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const customer = (rows) => tbl('customer', 'customer_id INT, product_key INT', rows);
const product = (keys) => tbl('product', 'product_key INT', keys.map((k) => [k]));

module.exports = {
  id: 'sql-d30-customers-who-bought-all-products', day: 30, lc: 'customers-who-bought-all-products', anchor: 'LC 1045', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Customers Who Bought All Products', kind: 'select', ordered: false,
  schema: [
    'customer(customer_id INT, product_key INT)   -- one row per purchase; the same pair can repeat',
    'product(product_key INT)   -- every product the shop sells; product_key is unique',
  ],
  statement: para(
    '`product` lists everything the shop sells. `customer` has one row for each purchase, so a customer can buy the same product more than once.',
    'Return the `customer_id` of every customer who has bought **every** product in `product` at least once. Each id appears once. Rows can come in any order.',
    'Every `product_key` in `customer` also exists in `product`.'
  ),
  starter: '-- Return: customer_id\nSELECT\n',
  solution: [
    'SELECT customer_id',
    'FROM customer',
    'GROUP BY customer_id',
    'HAVING COUNT(DISTINCT product_key) = (SELECT COUNT(*) FROM product)',
  ].join('\n'),
  mutants: [
    { name: 'counts repeat purchases as different products', code: 'SELECT customer_id FROM customer GROUP BY customer_id HAVING COUNT(*) = (SELECT COUNT(*) FROM product)' },
    { name: 'accepts a customer who bought anything', code: 'SELECT DISTINCT customer_id FROM customer' },
    { name: 'has the number of products typed in', slipsPastSamples: true, code: 'SELECT customer_id FROM customer GROUP BY customer_id HAVING COUNT(DISTINCT product_key) = 3' },
  ],
  hints: [
    '"Bought all" means: the number of different products this customer bought equals the number of products that exist.',
    'Group the purchases by customer and count the DISTINCT product keys in each group. Repeat purchases must not add to the count.',
    'Compare that count with the size of the product table using a subquery in HAVING: HAVING COUNT(DISTINCT product_key) = (SELECT COUNT(*) FROM product).',
  ],
  approach: para(
    '**Trigger:** "for all", "every", "has done each of". This is relational division. **Pattern:** `GROUP BY who`, then `HAVING COUNT(DISTINCT thing) = (SELECT COUNT(*) FROM all_things)`. **Complexity:** one group.',
    'Two details. Use `DISTINCT`, because the same purchase can repeat and must count once. And read the total from the `product` table, never type the number in. The query should keep working when the shop adds a product.',
    'It only works because every key in `customer` exists in `product`. If a stray key were possible, you would first filter the purchases to keys that are in `product`.'
  ),
  cases: [
    {
      tables: [customer([[1, 5], [1, 6], [1, 7], [2, 6], [3, 5], [3, 6], [3, 7], [3, 5], [4, 5], [4, 5], [4, 7]]), product([5, 6, 7])],
      expect: out(['customer_id'], [[1], [3]]),
    },
    { hidden: true, tables: [customer([[1, 1], [1, 1], [1, 1]]), product([1, 2])], expect: out(['customer_id'], []) },
    { hidden: true, tables: [customer([[1, 1], [1, 2], [1, 3], [1, 4], [2, 1], [2, 2], [2, 3]]), product([1, 2, 3, 4])], expect: out(['customer_id'], [[1]]) },
    { hidden: true, tables: [customer([[7, 9], [8, 9]]), product([9])], expect: out(['customer_id'], [[7], [8]]) },
  ],
};
