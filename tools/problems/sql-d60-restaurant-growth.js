const { tbl, D, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const customer = (rows) => tbl('customer', 'customer_id INT, name VARCHAR, visited_on DATE, amount INT', rows.map((r) => [r[0], r[1], D(r[2]), r[3]]));
const cols = ['visited_on', 'amount', 'average_amount'];

module.exports = {
  id: 'sql-d60-restaurant-growth', day: 60, lc: 'restaurant-growth', anchor: 'LC 1321', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Restaurant Growth', kind: 'select', ordered: true,
  schema: ['customer(customer_id INT, name VARCHAR, visited_on DATE, amount INT)   -- (customer_id, visited_on) is unique; several customers can visit on one day; every calendar day in the range has at least one visit'],
  statement: para(
    'Each row of `customer` is one customer\'s payment (`amount`) on one day (`visited_on`). Several customers can pay on the same day.',
    'The owner wants a **7-day moving window**: for each day, look at that day and the **6 days before it**. Report, for every day that has a full 7-day window (the first 6 days of data do not):\n- `visited_on`\n- `amount`: the total paid across the 7 days of the window\n- `average_amount`: that total divided by 7, rounded to **2 decimals**',
    'Order by `visited_on`.'
  ),
  starter: '-- Return: visited_on, amount, average_amount  (ordered by visited_on)\nSELECT\n',
  solution: [
    'WITH daily AS (',
    '  SELECT visited_on, SUM(amount) AS amount',
    '  FROM customer',
    '  GROUP BY visited_on',
    '),',
    'windowed AS (',
    '  SELECT visited_on,',
    '         SUM(amount) OVER w AS amount,',
    '         AVG(amount) OVER w AS avg_amount,',
    '         ROW_NUMBER() OVER (ORDER BY visited_on) AS day_no',
    '  FROM daily',
    '  WINDOW w AS (ORDER BY visited_on ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)',
    ')',
    'SELECT visited_on, amount, ROUND(avg_amount, 2) AS average_amount',
    'FROM windowed',
    'WHERE day_no >= 7',
    'ORDER BY visited_on',
  ].join('\n'),
  mutants: [
    { name: 'windows over customer rows instead of over days', code: 'WITH w AS (SELECT visited_on, SUM(amount) OVER (ORDER BY visited_on ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS amount, AVG(amount) OVER (ORDER BY visited_on ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS avg_amount, ROW_NUMBER() OVER (ORDER BY visited_on) AS day_no FROM customer) SELECT visited_on, amount, ROUND(avg_amount, 2) AS average_amount FROM w WHERE day_no >= 7 ORDER BY visited_on' },
    { name: 'also reports the first 6 days, which have short windows', code: 'WITH daily AS (SELECT visited_on, SUM(amount) AS amount FROM customer GROUP BY visited_on) SELECT visited_on, SUM(amount) OVER w AS amount, ROUND(AVG(amount) OVER w, 2) AS average_amount FROM daily WINDOW w AS (ORDER BY visited_on ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) ORDER BY visited_on' },
    { name: 'the window is 8 days wide', code: 'WITH daily AS (SELECT visited_on, SUM(amount) AS amount FROM customer GROUP BY visited_on), w AS (SELECT visited_on, SUM(amount) OVER (ORDER BY visited_on ROWS BETWEEN 7 PRECEDING AND CURRENT ROW) AS amount, AVG(amount) OVER (ORDER BY visited_on ROWS BETWEEN 7 PRECEDING AND CURRENT ROW) AS avg_amount, ROW_NUMBER() OVER (ORDER BY visited_on) AS day_no FROM daily) SELECT visited_on, amount, ROUND(avg_amount, 2) AS average_amount FROM w WHERE day_no >= 7 ORDER BY visited_on' },
    { name: 'no rounding', code: 'WITH daily AS (SELECT visited_on, SUM(amount) AS amount FROM customer GROUP BY visited_on), w AS (SELECT visited_on, SUM(amount) OVER (ORDER BY visited_on ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS amount, AVG(amount) OVER (ORDER BY visited_on ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS avg_amount, ROW_NUMBER() OVER (ORDER BY visited_on) AS day_no FROM daily) SELECT visited_on, amount, avg_amount AS average_amount FROM w WHERE day_no >= 7 ORDER BY visited_on' },
  ],
  hints: [
    'The window is made of days, but the table has one row per payment. First get one row per day.',
    'GROUP BY visited_on to get a daily total. Then a window frame of ROWS BETWEEN 6 PRECEDING AND CURRENT ROW adds up that day and the six before it.',
    'The first six days have shorter windows, so drop them. Number the days with ROW_NUMBER() and keep day 7 onwards. ROUND the average to 2 decimals.',
  ],
  approach: para(
    '**Trigger:** "moving average", "rolling sum", "last N days". **Pattern:** aggregate to the grain of the window first (one row per day), then `SUM/AVG(...) OVER (ORDER BY day ROWS BETWEEN N-1 PRECEDING AND CURRENT ROW)`. **Complexity:** one sort.',
    'If you skip the daily aggregation, the frame counts **rows**. A day with two customers uses up two of the seven slots, and the window covers fewer than seven days.',
    '`6 PRECEDING AND CURRENT ROW` is 7 rows. This frame works here because every day has a row. If days could be missing, you would use `RANGE BETWEEN INTERVAL 6 DAY PRECEDING AND CURRENT ROW` instead.',
    'The first six days only have partial windows, so the question leaves them out.'
  ),
  cases: [
    {
      tables: [customer([
        [1, 'A', '2021-03-01', 10], [2, 'B', '2021-03-02', 5], [3, 'C', '2021-03-02', 15], [4, 'D', '2021-03-03', 30], [5, 'E', '2021-03-04', 10],
        [6, 'F', '2021-03-05', 40], [7, 'G', '2021-03-06', 20], [8, 'H', '2021-03-07', 50], [9, 'I', '2021-03-08', 10], [10, 'J', '2021-03-09', 30],
      ])],
      expect: out(cols, [['2021-03-07', 180, 25.71], ['2021-03-08', 180, 25.71], ['2021-03-09', 190, 27.14]]),
    },
    {
      hidden: true,
      tables: [customer([[1, 'A', '2021-01-01', 7], [1, 'A', '2021-01-02', 7], [1, 'A', '2021-01-03', 7], [1, 'A', '2021-01-04', 7], [1, 'A', '2021-01-05', 7], [1, 'A', '2021-01-06', 7]])],
      expect: out(cols, []),
    },
    {
      hidden: true,
      tables: [customer([[1, 'A', '2021-02-26', 14], [1, 'A', '2021-02-27', 14], [1, 'A', '2021-02-28', 14], [1, 'A', '2021-03-01', 14], [1, 'A', '2021-03-02', 14], [1, 'A', '2021-03-03', 14], [1, 'A', '2021-03-04', 70]])],
      expect: out(cols, [['2021-03-04', 154, 22]]),
    },
    {
      hidden: true,
      tables: [customer([
        [1, 'A', '2022-01-01', 1], [2, 'B', '2022-01-01', 1], [3, 'C', '2022-01-02', 2], [4, 'D', '2022-01-03', 3], [5, 'E', '2022-01-04', 4],
        [6, 'F', '2022-01-05', 5], [7, 'G', '2022-01-06', 6], [8, 'H', '2022-01-07', 7], [9, 'I', '2022-01-07', 7], [10, 'J', '2022-01-08', 8],
      ])],
      expect: out(cols, [['2022-01-07', 36, 5.14], ['2022-01-08', 42, 6]]),
    },
  ],
};
