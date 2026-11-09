const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const queue = (rows) => tbl('queue', 'person_id INT, person_name VARCHAR, weight INT, turn INT', rows);

module.exports = {
  id: 'sql-d09-last-person-on-the-bus', day: 9, lc: 'last-person-to-fit-in-the-bus', anchor: 'LC 1204', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Last Person to Fit in the Bus', kind: 'select', ordered: false,
  schema: ['queue(person_id INT, person_name VARCHAR, weight INT, turn INT)   -- turn is unique'],
  statement: para(
    'People board a bus one at a time, in order of `turn`. The bus can carry **1000 kg** in total. Someone boards only if the total weight on the bus, including them, stays at or under 1000.',
    'Boarding stops at the first person who would push it over. Return the name of the **last person who boards**, in a column named `person_name`. The first person in line always fits.'
  ),
  starter: '-- Return: person_name\nSELECT\n',
  solution: [
    'SELECT person_name',
    'FROM (',
    '  SELECT person_name, SUM(weight) OVER (ORDER BY turn) AS total',
    '  FROM queue',
    ')',
    'WHERE total <= 1000',
    'ORDER BY total DESC',
    'LIMIT 1',
  ].join('\n'),
  mutants: [
    { name: 'treats exactly 1000 as too heavy', slipsPastSamples: true, code: 'SELECT person_name FROM (SELECT person_name, SUM(weight) OVER (ORDER BY turn) AS total FROM queue) WHERE total < 1000 ORDER BY total DESC LIMIT 1' },
    { name: 'adds weights in weight order instead of turn order', code: 'SELECT person_name FROM (SELECT person_name, SUM(weight) OVER (ORDER BY weight) AS total FROM queue) WHERE total <= 1000 ORDER BY total DESC LIMIT 1' },
    { name: 'checks each person alone instead of the running total', code: 'SELECT person_name FROM queue WHERE weight <= 1000 ORDER BY turn DESC LIMIT 1' },
  ],
  hints: [
    'You need the total weight on the bus after each person boards. That is a running total.',
    'SUM(weight) OVER (ORDER BY turn) gives the total up to and including each row.',
    'Keep the rows whose running total is 1000 or less, then take the one with the largest total.',
  ],
  approach: para(
    'A running total is a windowed `SUM` ordered by the boarding order: `SUM(weight) OVER (ORDER BY turn)`. Because every weight is positive, the total only goes up, so the last person under the limit is the one with the **largest total that is still 1000 or less**.',
    'Say the boundary out loud: exactly 1000 kg still fits, so the test is `<=`.'
  ),
  cases: [
    { tables: [queue([[5, 'Alice', 250, 4], [4, 'Bob', 175, 1], [3, 'Alex', 350, 2], [6, 'John', 400, 3], [1, 'Winston', 500, 6], [2, 'Marie', 200, 5]])], expect: out(['person_name'], [['John']]) },
    { hidden: true, tables: [queue([[1, 'A', 400, 1], [2, 'B', 300, 2], [3, 'C', 300, 3], [4, 'D', 1, 4]])], expect: out(['person_name'], [['C']]) },
    { hidden: true, tables: [queue([[1, 'A', 100, 1], [2, 'B', 100, 2], [3, 'C', 100, 3]])], expect: out(['person_name'], [['C']]) },
    { hidden: true, tables: [queue([[9, 'A', 900, 1], [8, 'B', 200, 2], [7, 'C', 50, 3]])], expect: out(['person_name'], [['A']]) },
  ],
};
