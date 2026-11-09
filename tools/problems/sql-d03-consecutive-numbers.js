const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const logs = (vals) => tbl('logs', 'id INT, num INT', vals.map((n, i) => [i + 1, n]));

module.exports = {
  id: 'sql-d03-consecutive-numbers', day: 3, anchor: 'LC 180', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Consecutive Numbers', kind: 'select', ordered: false,
  schema: ['logs(id INT, num INT)   -- read the rows in order of id'],
  statement: para(
    'Read the `logs` table in order of `id`. Find every number that shows up **at least three times in a row**: three neighbouring rows with the same `num`.',
    'Return each such number once, in a column named `num`. If no number qualifies, return no rows.'
  ),
  starter: '-- Return: num\nSELECT\n',
  solution: [
    'SELECT DISTINCT num',
    'FROM (',
    '  SELECT num,',
    '         LAG(num, 1) OVER (ORDER BY id) AS prev1,',
    '         LAG(num, 2) OVER (ORDER BY id) AS prev2',
    '  FROM logs',
    ')',
    'WHERE num = prev1 AND num = prev2',
  ].join('\n'),
  mutants: [
    { name: 'counts a number anywhere in the table, not in a row', code: 'SELECT num FROM logs GROUP BY num HAVING COUNT(*) >= 3' },
    { name: 'two in a row is enough', code: 'SELECT DISTINCT num FROM (SELECT num, LAG(num) OVER (ORDER BY id) AS p FROM logs) WHERE num = p' },
    { name: 'forgets DISTINCT, so a long run is listed twice', slipsPastSamples: true, code: 'SELECT num FROM (SELECT num, LAG(num, 1) OVER (ORDER BY id) AS p1, LAG(num, 2) OVER (ORDER BY id) AS p2 FROM logs) WHERE num = p1 AND num = p2' },
  ],
  hints: [
    '"In a row" means you need to compare a row with the rows next to it. Which window functions look at a neighbour?',
    'LAG(num, 1) is the previous number and LAG(num, 2) is the one before that. Order both by id.',
    'Keep the rows where num equals both of those, and use DISTINCT because a run of four would match twice.',
  ],
  approach: para(
    'Two `LAG` calls bring the previous two values onto the current row. A row that equals both is the end of a run of at least three. A run of four has two such rows, so `DISTINCT` is needed.',
    'The same idea works with a self-join on `id`, `id + 1` and `id + 2`. That version breaks if ids have gaps, while `LAG` follows row order. Name which one you chose and why.'
  ),
  cases: [
    { tables: [logs([1, 1, 1, 2, 1, 2, 2])], expect: out(['num'], [[1]]) },
    { tables: [logs([1, 1, 2, 1, 1])], hidden: true, expect: out(['num'], []) },
    { tables: [logs([5, 5, 5, 5])], hidden: true, expect: out(['num'], [[5]]) },
    { tables: [logs([3, 3, 3, 4, 4, 4, 4, 9])], hidden: true, expect: out(['num'], [[3], [4]]) },
    { tables: [logs([7])], hidden: true, expect: out(['num'], []) },
  ],
};
