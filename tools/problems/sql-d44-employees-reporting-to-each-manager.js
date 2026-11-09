const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const employees = (rows) => tbl('employees', 'employee_id INT, name VARCHAR, reports_to INT, age INT', rows);
const cols = ['employee_id', 'name', 'reports_count', 'average_age'];

module.exports = {
  id: 'sql-d44-employees-reporting-to-each-manager', day: 44, lc: 'the-number-of-employees-which-report-to-each-employee', anchor: 'LC 1731', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'The Number of Employees Which Report to Each Employee', kind: 'select', ordered: true,
  schema: ['employees(employee_id INT, name VARCHAR, reports_to INT, age INT)   -- employee_id is unique; reports_to is NULL for the top person'],
  statement: para(
    'A **manager** is an employee that at least one other employee reports to directly (`reports_to` equals the manager\'s `employee_id`).',
    'For each manager, return:\n- `employee_id` and `name` of the manager\n- `reports_count`: how many people report to them directly\n- `average_age`: the average age of those people, **rounded to the nearest whole number** (a half rounds up)',
    'Order the result by `employee_id`. Employees with no direct reports are not in the result.'
  ),
  starter: '-- Return: employee_id, name, reports_count, average_age  (ordered by employee_id)\nSELECT\n',
  solution: [
    'SELECT m.employee_id,',
    '       m.name,',
    '       COUNT(*) AS reports_count,',
    '       CAST(ROUND(AVG(e.age)) AS INT) AS average_age',
    'FROM employees e',
    'JOIN employees m ON e.reports_to = m.employee_id',
    'GROUP BY m.employee_id, m.name',
    'ORDER BY m.employee_id',
  ].join('\n'),
  mutants: [
    { name: 'no rounding, so the average keeps its decimals', code: 'SELECT m.employee_id, m.name, COUNT(*) AS reports_count, AVG(e.age) AS average_age FROM employees e JOIN employees m ON e.reports_to = m.employee_id GROUP BY m.employee_id, m.name ORDER BY m.employee_id' },
    { name: 'cuts the decimals off instead of rounding', code: 'SELECT m.employee_id, m.name, COUNT(*) AS reports_count, CAST(FLOOR(AVG(e.age)) AS INT) AS average_age FROM employees e JOIN employees m ON e.reports_to = m.employee_id GROUP BY m.employee_id, m.name ORDER BY m.employee_id' },
    { name: 'averages the age of the manager, not of the reports', code: 'SELECT m.employee_id, m.name, COUNT(*) AS reports_count, CAST(ROUND(AVG(m.age)) AS INT) AS average_age FROM employees e JOIN employees m ON e.reports_to = m.employee_id GROUP BY m.employee_id, m.name ORDER BY m.employee_id' },
    { name: 'lists every employee, including people with no reports', code: 'SELECT m.employee_id, m.name, COUNT(e.employee_id) AS reports_count, CAST(ROUND(AVG(e.age)) AS INT) AS average_age FROM employees m LEFT JOIN employees e ON e.reports_to = m.employee_id GROUP BY m.employee_id, m.name ORDER BY m.employee_id' },
  ],
  hints: [
    'The table refers to itself: reports_to is the id of another row. Think of two copies of the table, one for the employee and one for the manager.',
    'Join them with e.reports_to = m.employee_id. Then GROUP BY the manager, and COUNT and AVG over the employee side.',
    'AVG(e.age) is the average age of the reports. ROUND it, cast it to a whole number, and ORDER BY the manager\'s id.',
  ],
  approach: para(
    '**Trigger:** "per manager" or "per parent", when parent and child live in the same table. **Pattern:** self-join `child.parent_id = parent.id`, then `GROUP BY parent.id`. **Complexity:** one join.',
    'An inner join keeps only managers that really have reports, which is what the question wants. A `LEFT JOIN` from the manager side would add everyone else with a count of 0.',
    'Rounding to the nearest whole number is `ROUND`, not `FLOOR`. An average of 36.5 must become 37.'
  ),
  cases: [
    {
      tables: [employees([[1, 'Ines', null, 50], [2, 'Jo', 1, 30], [3, 'Kim', 1, 33], [4, 'Lou', 2, 20], [5, 'Max', 2, 25], [6, 'Ned', 2, 28], [7, 'Opal', 3, 40]])],
      expect: out(cols, [[1, 'Ines', 2, 32], [2, 'Jo', 3, 24], [3, 'Kim', 1, 40]]),
    },
    { hidden: true, tables: [employees([[1, 'A', null, 60], [2, 'B', 1, 36], [3, 'C', 1, 37]])], expect: out(cols, [[1, 'A', 2, 37]]) },
    { hidden: true, tables: [employees([[1, 'A', null, 60]])], expect: out(cols, []) },
    { hidden: true, tables: [employees([[9, 'Z', 3, 22], [3, 'M', null, 55], [4, 'Y', 3, 23], [5, 'X', 4, 18]])], expect: out(cols, [[3, 'M', 2, 23], [4, 'Y', 1, 18]]) },
  ],
};
