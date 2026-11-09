const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const activity = (rows) => tbl('activity', 'machine_id INT, process_id INT, activity_type VARCHAR, ts DOUBLE', rows);
const cols = ['machine_id', 'processing_time'];

module.exports = {
  id: 'sql-d36-average-process-time-per-machine', day: 36, lc: 'average-time-of-process-per-machine', anchor: 'LC 1661', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Average Time of Process per Machine', kind: 'select', ordered: false,
  schema: ['activity(machine_id INT, process_id INT, activity_type VARCHAR, ts DOUBLE)   -- activity_type is \'start\' or \'end\'; ts is the time in seconds'],
  statement: para(
    'Machines run processes. Each process on a machine writes two rows to `activity`: one `start` and one `end`, each with a time `ts` in seconds. The pair is identified by (`machine_id`, `process_id`).',
    'A process\'s run time is its `end` time minus its `start` time. For each machine, return the **average run time** of its processes, rounded to **3 decimals**.',
    'Return `machine_id` and `processing_time`. Rows can come in any order.'
  ),
  starter: '-- Return: machine_id, processing_time  (rounded to 3 decimals)\nSELECT\n',
  solution: [
    'SELECT s.machine_id,',
    '       ROUND(AVG(e.ts - s.ts), 3) AS processing_time',
    'FROM activity s',
    'JOIN activity e',
    '  ON e.machine_id = s.machine_id',
    ' AND e.process_id = s.process_id',
    " AND s.activity_type = 'start'",
    " AND e.activity_type = 'end'",
    'GROUP BY s.machine_id',
  ].join('\n'),
  mutants: [
    { name: 'averages every timestamp', code: 'SELECT machine_id, ROUND(AVG(ts), 3) AS processing_time FROM activity GROUP BY machine_id' },
    { name: 'adds the run times instead of averaging them', code: "SELECT s.machine_id, ROUND(SUM(e.ts - s.ts), 3) AS processing_time FROM activity s JOIN activity e ON e.machine_id = s.machine_id AND e.process_id = s.process_id AND s.activity_type = 'start' AND e.activity_type = 'end' GROUP BY s.machine_id" },
    { name: 'divides by the number of rows, which is twice the number of processes', code: "SELECT machine_id, ROUND(SUM(CASE WHEN activity_type = 'end' THEN ts ELSE -ts END) / COUNT(*), 3) AS processing_time FROM activity GROUP BY machine_id" },
    { name: 'rounds to 2 decimals', code: "SELECT s.machine_id, ROUND(AVG(e.ts - s.ts), 2) AS processing_time FROM activity s JOIN activity e ON e.machine_id = s.machine_id AND e.process_id = s.process_id AND s.activity_type = 'start' AND e.activity_type = 'end' GROUP BY s.machine_id" },
  ],
  hints: [
    'The start and the end of one process are on two different rows. Put them side by side before you subtract.',
    'Join the table to itself on machine_id and process_id. Keep the start rows on one side and the end rows on the other.',
    'AVG(e.ts - s.ts) per machine gives the average run time. Wrap it in ROUND(..., 3).',
  ],
  approach: para(
    '**Trigger:** "time between two events that are stored on separate rows". **Pattern:** self-join the pair on its key and subtract, or use conditional aggregation `SUM(CASE WHEN end THEN ts ELSE -ts END)`. **Complexity:** one join.',
    'The join gives **one row per process**, so `AVG` averages processes, which is what the question asks. If you work on the raw rows, remember that each process owns two of them. Dividing by `COUNT(*)` halves the answer.',
    'Say the grain out loud: "one row per process, then one row per machine".'
  ),
  cases: [
    {
      tables: [activity([[7, 0, 'start', 1.0], [7, 0, 'end', 2.5], [7, 1, 'start', 3.0], [7, 1, 'end', 3.75], [8, 0, 'start', 0.5], [8, 0, 'end', 2.5], [8, 1, 'start', 1.25], [8, 1, 'end', 1.75], [8, 2, 'start', 4.0], [8, 2, 'end', 5.0]])],
      expect: out(cols, [[7, 1.125], [8, 1.167]]),
    },
    { hidden: true, tables: [activity([[1, 1, 'start', 10], [1, 1, 'end', 14]])], expect: out(cols, [[1, 4]]) },
    { hidden: true, tables: [activity([[2, 5, 'end', 9.5], [2, 5, 'start', 4.25], [2, 6, 'start', 1], [2, 6, 'end', 1.5]])], expect: out(cols, [[2, 2.875]]) },
    { hidden: true, tables: [activity([[3, 0, 'start', 0], [3, 0, 'end', 0.125], [4, 0, 'start', 5], [4, 0, 'end', 8], [3, 1, 'start', 2], [3, 1, 'end', 2.125]])], expect: out(cols, [[3, 0.125], [4, 3]]) },
  ],
};
