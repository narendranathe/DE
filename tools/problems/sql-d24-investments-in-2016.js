const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const insurance = (rows) => tbl('insurance', 'pid INT, tiv_2015 DOUBLE, tiv_2016 DOUBLE, lat DOUBLE, lon DOUBLE', rows);
const cols = ['tiv_2016'];

module.exports = {
  id: 'sql-d24-investments-in-2016', day: 24, lc: 'investments-in-2016', anchor: 'LC 585', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Investments in 2016', kind: 'select', ordered: false,
  schema: ['insurance(pid INT, tiv_2015 DOUBLE, tiv_2016 DOUBLE, lat DOUBLE, lon DOUBLE)   -- pid is unique; tiv = total insured value'],
  statement: para(
    'Each row of `insurance` is one policy: its insured value in 2015 and in 2016, and the place (`lat`, `lon`) it covers.',
    'Add up `tiv_2016` over every policy that meets **both** rules:\n- its `tiv_2015` is shared with **at least one other** policy\n- its place, the pair (`lat`, `lon`), is **not** shared with any other policy',
    'Return that single total as `tiv_2016`, rounded to 2 decimals. If no policy qualifies, the total is `NULL`.'
  ),
  starter: '-- Return one row: tiv_2016 (rounded to 2 decimals)\nSELECT\n',
  solution: [
    'WITH counted AS (',
    '  SELECT tiv_2016,',
    '         COUNT(*) OVER (PARTITION BY tiv_2015)  AS same_2015,',
    '         COUNT(*) OVER (PARTITION BY lat, lon)  AS same_place',
    '  FROM insurance',
    ')',
    'SELECT ROUND(SUM(tiv_2016), 2) AS tiv_2016',
    'FROM counted',
    'WHERE same_2015 > 1 AND same_place = 1',
  ].join('\n'),
  mutants: [
    { name: 'ignores the place rule', code: 'SELECT ROUND(SUM(tiv_2016), 2) AS tiv_2016 FROM (SELECT tiv_2016, COUNT(*) OVER (PARTITION BY tiv_2015) AS same_2015 FROM insurance) WHERE same_2015 > 1' },
    { name: 'ignores the 2015 rule', code: 'SELECT ROUND(SUM(tiv_2016), 2) AS tiv_2016 FROM (SELECT tiv_2016, COUNT(*) OVER (PARTITION BY lat, lon) AS same_place FROM insurance) WHERE same_place = 1' },
    { name: 'compares latitude only instead of the (lat, lon) pair', slipsPastSamples: true, code: 'SELECT ROUND(SUM(tiv_2016), 2) AS tiv_2016 FROM (SELECT tiv_2016, COUNT(*) OVER (PARTITION BY tiv_2015) AS same_2015, COUNT(*) OVER (PARTITION BY lat) AS same_place FROM insurance) WHERE same_2015 > 1 AND same_place = 1' },
    { name: 'keeps policies whose 2015 value is not shared', code: 'SELECT ROUND(SUM(tiv_2016), 2) AS tiv_2016 FROM (SELECT tiv_2016, COUNT(*) OVER (PARTITION BY tiv_2015) AS same_2015, COUNT(*) OVER (PARTITION BY lat, lon) AS same_place FROM insurance) WHERE same_2015 >= 1 AND same_place = 1' },
  ],
  hints: [
    'Both rules are about "how many other rows look like this one". That is a count over a group, but you still need to keep every row.',
    'COUNT(*) OVER (PARTITION BY tiv_2015) tells each row how many policies share its 2015 value. Do the same for the (lat, lon) pair.',
    'Filter on those two counts (more than 1 for the value, exactly 1 for the place) and SUM(tiv_2016) over what is left. ROUND the sum to 2 decimals.',
  ],
  approach: para(
    '**Trigger:** "rows that have a twin" and "rows that are unique". **Pattern:** window `COUNT(*) OVER (PARTITION BY key)` to attach the group size to each row, then filter on it. **Complexity:** two partitioned scans.',
    'A `GROUP BY` would collapse the rows and lose `tiv_2016`. The window count keeps them. The same job can be done with two `IN (... GROUP BY ... HAVING COUNT(*) ...)` subqueries.',
    'The place is the **pair** `(lat, lon)`. Partitioning by `lat` alone would call two different places "the same" when they only share a latitude.',
    'With no qualifying row, `SUM` returns `NULL`, which is what the question asks for.'
  ),
  cases: [
    {
      tables: [insurance([[1, 10, 5, 10, 10], [2, 20, 20, 20, 20], [3, 10, 30, 20, 20], [4, 10, 40, 40, 40]])],
      expect: out(cols, [[45]]),
    },
    { hidden: true, tables: [insurance([[1, 10, 7.5, 1, 1], [2, 11, 8.5, 2, 2]])], expect: out(cols, [[null]]) },
    { hidden: true, tables: [insurance([[1, 5, 2.5, 1, 1], [2, 5, 3.5, 1, 2], [3, 5, 4, 3, 3]])], expect: out(cols, [[10]]) },
    { hidden: true, tables: [insurance([[1, 5, 1, 1, 1], [2, 5, 2, 1, 1], [3, 9, 4, 7, 7], [4, 9, 8, 8, 8]])], expect: out(cols, [[12]]) },
  ],
};
