const { tbl, D, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const weather = (rows) => tbl('weather', 'id INT, record_date DATE, temperature INT', rows.map((r) => [r[0], D(r[1]), r[2]]));

module.exports = {
  id: 'sql-d52-rising-temperature', day: 52, lc: 'rising-temperature', anchor: 'LC 197', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Rising Temperature', kind: 'select', ordered: true,
  schema: ['weather(id INT, record_date DATE, temperature INT)   -- id and record_date are unique; rows are not in date order and some days can be missing'],
  statement: para(
    'Each row of `weather` is the temperature recorded on one date. The rows are **not** sorted by date, the `id` values say nothing about the date order, and some dates can be missing.',
    'Return the `id` of every day that was **warmer than the calendar day right before it**. If the day before has no row, the day does not qualify.',
    'Return `id`, ordered from smallest to largest.'
  ),
  starter: '-- Return: id  (ordered)\nSELECT\n',
  solution: [
    'SELECT today.id',
    'FROM weather today',
    'JOIN weather yesterday',
    '  ON yesterday.record_date = today.record_date - INTERVAL 1 DAY',
    'WHERE today.temperature > yesterday.temperature',
    'ORDER BY today.id',
  ].join('\n'),
  mutants: [
    { name: 'compares with the previous row, even across a missing day', slipsPastSamples: true, code: 'SELECT id FROM (SELECT id, temperature, LAG(temperature) OVER (ORDER BY record_date) AS prev FROM weather) WHERE temperature > prev ORDER BY id' },
    { name: 'assumes id order is date order', slipsPastSamples: true, code: 'SELECT a.id FROM weather a JOIN weather b ON b.id = a.id - 1 WHERE a.temperature > b.temperature ORDER BY a.id' },
    { name: 'counts a day that is only as warm as the day before', code: 'SELECT today.id FROM weather today JOIN weather yesterday ON yesterday.record_date = today.record_date - INTERVAL 1 DAY WHERE today.temperature >= yesterday.temperature ORDER BY today.id' },
    { name: 'compares with the next day instead of the day before', code: 'SELECT today.id FROM weather today JOIN weather tomorrow ON tomorrow.record_date = today.record_date + INTERVAL 1 DAY WHERE today.temperature > tomorrow.temperature ORDER BY today.id' },
  ],
  hints: [
    'You need today\'s temperature and yesterday\'s temperature side by side on one row.',
    'Join the table to itself so that one copy\'s record_date is exactly one day after the other copy\'s record_date.',
    'Subtracting one day from today\'s date finds yesterday\'s row. Keep the pairs where today.temperature > yesterday.temperature, and order by id.',
  ],
  approach: para(
    '**Trigger:** "compare with the previous day / period". **Pattern:** self-join on `date = other.date - 1 day`, or `LAG` plus a check that the gap is exactly one day. **Complexity:** one join.',
    'Joining on the **date** is the point. `LAG` and `id - 1` both mean "the previous row", and the previous row is not always the previous day: a missing date or an unsorted table breaks them.',
    'If you use `LAG`, also check `record_date - LAG(record_date) = 1 day` before you trust it.'
  ),
  cases: [
    {
      tables: [weather([[1, '2021-03-01', 10], [2, '2021-03-02', 25], [3, '2021-03-03', 20], [4, '2021-03-04', 30], [5, '2021-03-05', 30]])],
      expect: out(['id'], [[2], [4]]),
    },
    { hidden: true, tables: [weather([[1, '2021-05-03', 30], [2, '2021-05-01', 10], [3, '2021-05-02', 20]])], expect: out(['id'], [[1], [3]]) },
    { hidden: true, tables: [weather([[1, '2021-05-01', 10], [2, '2021-05-02', 10]])], expect: out(['id'], []) },
    { hidden: true, tables: [weather([[1, '2021-01-31', 5], [2, '2021-02-01', 6], [3, '2020-12-31', 1], [4, '2021-01-01', 2]])], expect: out(['id'], [[2], [4]]) },
  ],
};
