const { tbl, D, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const tx = (rows) => tbl('transactions', 'id INT, country VARCHAR, state VARCHAR, amount INT, trans_date DATE', rows.map((r) => [r[0], r[1], r[2], r[3], D(r[4])]));
const cols = ['month', 'country', 'trans_count', 'approved_count', 'trans_total_amount', 'approved_total_amount'];

module.exports = {
  id: 'sql-d12-monthly-transactions', day: 12, lc: 'monthly-transactions-i', anchor: 'LC 1193', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Monthly Transactions I', kind: 'select', ordered: false,
  schema: ["transactions(id INT, country VARCHAR, state VARCHAR, amount INT, trans_date DATE)   -- state: 'approved' or 'declined'"],
  statement: para(
    'For each **month** and **country**, report:',
    '- `trans_count`: how many transactions there were\n- `approved_count`: how many were approved\n- `trans_total_amount`: the sum of all their amounts\n- `approved_total_amount`: the sum of the approved amounts',
    'Show the month as text in the form `YYYY-MM` in a column named `month`. When a group has no approved transactions, the approved columns are **0**, not NULL.'
  ),
  starter: '-- Return: month, country, trans_count, approved_count, trans_total_amount, approved_total_amount\nSELECT\n',
  solution: [
    "SELECT strftime(trans_date, '%Y-%m') AS month, country,",
    '       COUNT(*) AS trans_count,',
    "       SUM(CASE WHEN state = 'approved' THEN 1 ELSE 0 END) AS approved_count,",
    '       SUM(amount) AS trans_total_amount,',
    "       SUM(CASE WHEN state = 'approved' THEN amount ELSE 0 END) AS approved_total_amount",
    'FROM transactions',
    'GROUP BY 1, 2',
  ].join('\n'),
  mutants: [
    { name: 'groups by month number only, so January of two years merge', slipsPastSamples: true, code: "SELECT strftime(MIN(trans_date), '%Y-%m') AS month, country, COUNT(*) AS trans_count, SUM(CASE WHEN state = 'approved' THEN 1 ELSE 0 END) AS approved_count, SUM(amount) AS trans_total_amount, SUM(CASE WHEN state = 'approved' THEN amount ELSE 0 END) AS approved_total_amount FROM transactions GROUP BY month(trans_date), country" },
    { name: 'leaves the approved total as NULL when nothing was approved', slipsPastSamples: true, code: "SELECT strftime(trans_date, '%Y-%m') AS month, country, COUNT(*) AS trans_count, SUM(CASE WHEN state = 'approved' THEN 1 ELSE 0 END) AS approved_count, SUM(amount) AS trans_total_amount, SUM(CASE WHEN state = 'approved' THEN amount END) AS approved_total_amount FROM transactions GROUP BY 1, 2" },
    { name: 'counts every transaction as approved', code: "SELECT strftime(trans_date, '%Y-%m') AS month, country, COUNT(*) AS trans_count, COUNT(*) AS approved_count, SUM(amount) AS trans_total_amount, SUM(CASE WHEN state = 'approved' THEN amount ELSE 0 END) AS approved_total_amount FROM transactions GROUP BY 1, 2" },
  ],
  hints: [
    'The group is a (month, country) pair. Turn the date into a text month first, then GROUP BY it with country.',
    'For "approved only" numbers, put a CASE inside the aggregate: SUM(CASE WHEN state = \'approved\' THEN amount ELSE 0 END).',
    'Use ELSE 0 so a group with nothing approved gives 0. Without an ELSE the CASE gives NULL and SUM of only NULLs is NULL.',
  ],
  approach: para(
    'This is **conditional aggregation**: one pass over the table with a `CASE` inside each aggregate, instead of several queries joined together.',
    '`strftime(trans_date, \'%Y-%m\')` makes the month key. It keeps the year, so January 2019 and January 2020 stay apart.',
    '`SUM` of a CASE with no ELSE returns NULL when no row matched. `ELSE 0` is what turns that into the 0 the question asks for.'
  ),
  cases: [
    {
      tables: [tx([[121, 'US', 'approved', 1000, '2018-12-18'], [122, 'US', 'declined', 2000, '2018-12-19'], [123, 'US', 'approved', 2000, '2019-01-01'], [124, 'DE', 'approved', 2000, '2019-01-07']])],
      expect: out(cols, [['2018-12', 'US', 2, 1, 3000, 1000], ['2019-01', 'US', 1, 1, 2000, 2000], ['2019-01', 'DE', 1, 1, 2000, 2000]]),
    },
    { hidden: true, tables: [tx([[1, 'FR', 'declined', 500, '2020-03-01'], [2, 'FR', 'declined', 700, '2020-03-15']])], expect: out(cols, [['2020-03', 'FR', 2, 0, 1200, 0]]) },
    {
      hidden: true,
      tables: [tx([[1, 'US', 'approved', 10, '2019-12-31'], [2, 'US', 'approved', 20, '2020-12-01'], [3, 'US', 'declined', 5, '2020-12-02']])],
      expect: out(cols, [['2019-12', 'US', 1, 1, 10, 10], ['2020-12', 'US', 2, 1, 25, 20]]),
    },
    {
      hidden: true,
      tables: [tx([[1, 'US', 'approved', 100, '2021-05-01'], [2, 'CA', 'approved', 50, '2021-05-02'], [3, 'CA', 'declined', 25, '2021-05-03']])],
      expect: out(cols, [['2021-05', 'US', 1, 1, 100, 100], ['2021-05', 'CA', 2, 1, 75, 50]]),
    },
  ],
};
