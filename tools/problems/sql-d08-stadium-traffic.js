const { tbl, D, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const stadium = (rows) => tbl('stadium', 'id INT, visit_date DATE, people INT', rows.map((r) => [r[0], D(r[1]), r[2]]));
const cols = ['id', 'visit_date', 'people'];

module.exports = {
  id: 'sql-d08-stadium-traffic', day: 8, lc: 'human-traffic-of-stadium', anchor: 'LC 601', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Human Traffic of Stadium', kind: 'select', ordered: true,
  schema: ['stadium(id INT, visit_date DATE, people INT)   -- id and visit_date are unique'],
  statement: para(
    'Each row is one day at a stadium. Find the days that belong to a **run of three or more consecutive ids** where **every day had at least 100 people**.',
    'Consecutive means the ids follow each other with no gap. A day with fewer than 100 people, or a missing id, ends a run.',
    'Return `id`, `visit_date` and `people`, ordered by `visit_date` ascending.'
  ),
  starter: '-- Return: id, visit_date, people  (ordered by visit_date)\nSELECT\n',
  solution: [
    'WITH busy AS (',
    '  SELECT *, id - ROW_NUMBER() OVER (ORDER BY id) AS grp',
    '  FROM stadium',
    '  WHERE people >= 100',
    ')',
    'SELECT id, visit_date, people',
    'FROM busy',
    'WHERE grp IN (SELECT grp FROM busy GROUP BY grp HAVING COUNT(*) >= 3)',
    'ORDER BY visit_date',
  ].join('\n'),
  mutants: [
    { name: 'a run of two is enough', code: 'WITH busy AS (SELECT *, id - ROW_NUMBER() OVER (ORDER BY id) AS grp FROM stadium WHERE people >= 100) SELECT id, visit_date, people FROM busy WHERE grp IN (SELECT grp FROM busy GROUP BY grp HAVING COUNT(*) >= 2) ORDER BY visit_date' },
    { name: 'numbers the rows before filtering, so every busy day lands in one group', code: 'WITH t AS (SELECT *, id - ROW_NUMBER() OVER (ORDER BY id) AS grp FROM stadium) SELECT id, visit_date, people FROM t WHERE people >= 100 AND grp IN (SELECT grp FROM t WHERE people >= 100 GROUP BY grp HAVING COUNT(*) >= 3) ORDER BY visit_date' },
    { name: 'uses more than 100 instead of at least 100', slipsPastSamples: true, code: 'WITH busy AS (SELECT *, id - ROW_NUMBER() OVER (ORDER BY id) AS grp FROM stadium WHERE people > 100) SELECT id, visit_date, people FROM busy WHERE grp IN (SELECT grp FROM busy GROUP BY grp HAVING COUNT(*) >= 3) ORDER BY visit_date' },
  ],
  hints: [
    'This is a "gaps and islands" problem: you want groups of neighbouring ids that all pass the people filter.',
    'Keep only rows with people >= 100 first. Then id minus ROW_NUMBER() over those rows is the same number for every id in one unbroken run.',
    'Group by that number, keep the groups with at least three rows, and join back to list their days.',
  ],
  approach: para(
    'After you filter to busy days, `id - ROW_NUMBER() OVER (ORDER BY id)` stays constant while ids are consecutive and jumps when an id is missing or a quiet day was removed. That constant is a label for each run.',
    'Count rows per label, keep labels with three or more, and return those rows ordered by date.',
    'The order matters: filter **before** you number the rows. Numbering the whole table first hides the gaps you are trying to find.'
  ),
  cases: [
    {
      tables: [stadium([[1, '2017-01-01', 10], [2, '2017-01-02', 109], [3, '2017-01-03', 150], [4, '2017-01-04', 99], [5, '2017-01-05', 145], [6, '2017-01-06', 1455], [7, '2017-01-07', 199], [8, '2017-01-09', 188]])],
      expect: out(cols, [[5, '2017-01-05', 145], [6, '2017-01-06', 1455], [7, '2017-01-07', 199], [8, '2017-01-09', 188]]),
    },
    { hidden: true, tables: [stadium([[1, '2020-01-01', 100], [2, '2020-01-02', 100], [4, '2020-01-04', 100], [5, '2020-01-05', 100]])], expect: out(cols, []) },
    { hidden: true, tables: [stadium([[1, '2020-01-01', 100], [2, '2020-01-02', 120], [3, '2020-01-03', 130], [4, '2020-01-04', 99]])], expect: out(cols, [[1, '2020-01-01', 100], [2, '2020-01-02', 120], [3, '2020-01-03', 130]]) },
    {
      hidden: true,
      tables: [stadium([[1, '2020-02-01', 200], [2, '2020-02-02', 200], [3, '2020-02-03', 50], [4, '2020-02-04', 300], [5, '2020-02-05', 301], [6, '2020-02-06', 302]])],
      expect: out(cols, [[4, '2020-02-04', 300], [5, '2020-02-05', 301], [6, '2020-02-06', 302]]),
    },
  ],
};
