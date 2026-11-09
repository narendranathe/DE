const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const seat = (rows) => tbl('seat', 'id INT, student VARCHAR', rows);

module.exports = {
  id: 'sql-d15-exchange-seats', day: 15, lc: 'exchange-seats', anchor: 'LC 626', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Exchange Seats', kind: 'select', ordered: true,
  schema: ['seat(id INT, student VARCHAR)   -- id is unique and counts 1, 2, 3, ... with no gaps'],
  statement: para(
    'A classroom has one student in each seat. Seats are numbered 1, 2, 3, and so on with no gaps.',
    'The teacher swaps students in **pairs**: seat 1 with seat 2, seat 3 with seat 4, and so on. If the number of seats is odd, the student in the last seat stays where they are.',
    'Return `id` and `student` after the swap, ordered by `id`. The `id` column keeps its numbers. Only the names move.'
  ),
  starter: '-- Return: id, student  (ordered by id)\nSELECT\n',
  solution: [
    'SELECT id,',
    '       COALESCE(',
    '         CASE WHEN id % 2 = 1 THEN LEAD(student) OVER (ORDER BY id)',
    '              ELSE LAG(student) OVER (ORDER BY id) END,',
    '         student) AS student',
    'FROM seat',
    'ORDER BY id',
  ].join('\n'),
  mutants: [
    { name: 'the last seat of an odd row ends up empty', code: 'SELECT id, CASE WHEN id % 2 = 1 THEN LEAD(student) OVER (ORDER BY id) ELSE LAG(student) OVER (ORDER BY id) END AS student FROM seat ORDER BY id' },
    { name: 'drops the last student when the count is odd', code: 'SELECT a.id, b.student FROM seat a JOIN seat b ON b.id = CASE WHEN a.id % 2 = 1 THEN a.id + 1 ELSE a.id - 1 END ORDER BY a.id' },
    { name: 'looks the wrong way: odd seats take the previous student', code: 'SELECT id, COALESCE(CASE WHEN id % 2 = 1 THEN LAG(student) OVER (ORDER BY id) ELSE LEAD(student) OVER (ORDER BY id) END, student) AS student FROM seat ORDER BY id' },
  ],
  hints: [
    'Every student takes the name from a neighbouring seat. Decide, for an odd id and for an even id, which neighbour that is.',
    'LEAD(student) OVER (ORDER BY id) reads the next row and LAG(student) reads the previous one. An odd id takes from the next seat, an even id from the previous.',
    'The last seat of an odd-sized row has no next seat, so LEAD gives NULL. Wrap the result in COALESCE(..., student) so that student stays put.',
  ],
  approach: para(
    '**Trigger:** "swap neighbours" or "compare a row with the row next to it". **Pattern:** `LEAD` / `LAG` with a `CASE` on the parity of `id`. **Complexity:** one sort of the table.',
    'Odd seats look **forward**, even seats look **backward**. The only edge case is the very last odd seat: it has nothing ahead, so `LEAD` returns `NULL` and `COALESCE` falls back to the student already sitting there.',
    'A self-join on `id + 1` / `id - 1` also works, but it silently loses the last student unless you add a `LEFT JOIN` and the same fallback.'
  ),
  cases: [
    { tables: [seat([[1, 'Ana'], [2, 'Bo'], [3, 'Cy'], [4, 'Di'], [5, 'Ed']])], expect: out(['id', 'student'], [[1, 'Bo'], [2, 'Ana'], [3, 'Di'], [4, 'Cy'], [5, 'Ed']]) },
    { hidden: true, tables: [seat([[1, 'Ana'], [2, 'Bo'], [3, 'Cy'], [4, 'Di']])], expect: out(['id', 'student'], [[1, 'Bo'], [2, 'Ana'], [3, 'Di'], [4, 'Cy']]) },
    { hidden: true, tables: [seat([[1, 'Solo']])], expect: out(['id', 'student'], [[1, 'Solo']]) },
    { hidden: true, tables: [seat([[3, 'Cy'], [1, 'Ana'], [2, 'Bo']])], expect: out(['id', 'student'], [[1, 'Bo'], [2, 'Ana'], [3, 'Cy']]) },
  ],
};
