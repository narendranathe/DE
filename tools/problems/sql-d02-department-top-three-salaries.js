const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const department = (rows) => tbl('department', 'id INT, name VARCHAR', rows);
const employee = (rows) => tbl('employee', 'id INT, name VARCHAR, salary INT, department_id INT', rows);

module.exports = {
  id: 'sql-d02-department-top-three-salaries', day: 2, lc: 'department-top-three-salaries', anchor: 'LC 185', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Department Top Three Salaries', kind: 'select', ordered: false,
  schema: ['department(id INT, name VARCHAR)', 'employee(id INT, name VARCHAR, salary INT, department_id INT)'],
  statement: para(
    'Find the top earners in every department. An employee is a top earner if their salary is one of the **three highest distinct salaries** in their department.',
    'If two people share a salary, both are included, and that salary uses only one of the three places.',
    'Return the columns `department`, `employee` and `salary`. Departments with no employees do not appear.'
  ),
  starter: '-- Return: department, employee, salary\nSELECT\n',
  solution: [
    'SELECT department, employee, salary',
    'FROM (',
    '  SELECT d.name AS department, e.name AS employee, e.salary,',
    '         DENSE_RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) AS rnk',
    '  FROM employee e',
    '  JOIN department d ON d.id = e.department_id',
    ')',
    'WHERE rnk <= 3',
  ].join('\n'),
  mutants: [
    { name: 'RANK leaves out the person right after a tie', slipsPastSamples: true, code: 'SELECT department, employee, salary FROM (SELECT d.name AS department, e.name AS employee, e.salary, RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) AS rnk FROM employee e JOIN department d ON d.id = e.department_id) WHERE rnk <= 3' },
    { name: 'ROW_NUMBER drops tied salaries', slipsPastSamples: true, code: 'SELECT department, employee, salary FROM (SELECT d.name AS department, e.name AS employee, e.salary, ROW_NUMBER() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) AS rnk FROM employee e JOIN department d ON d.id = e.department_id) WHERE rnk <= 3' },
    { name: 'takes the top three of the whole company', code: 'SELECT d.name AS department, e.name AS employee, e.salary FROM employee e JOIN department d ON d.id = e.department_id ORDER BY e.salary DESC LIMIT 3' },
    { name: 'off by one: only the top two', code: 'SELECT department, employee, salary FROM (SELECT d.name AS department, e.name AS employee, e.salary, DENSE_RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) AS rnk FROM employee e JOIN department d ON d.id = e.department_id) WHERE rnk < 3' },
  ],
  hints: [
    'You need a rank inside each department, so think "window function with PARTITION BY".',
    'Decide the tie rule first. "Three highest distinct salaries" means two people on the same salary share one place and the next salary gets the next place. Which of RANK, DENSE_RANK and ROW_NUMBER does that?',
    'Compute DENSE_RANK() over each department ordered by salary descending in a subquery, then keep rows where the rank is 3 or less.',
  ],
  approach: para(
    'The rule "distinct salaries, ties share a place" is exactly `DENSE_RANK`. `RANK` skips numbers after a tie (1, 1, 3), so the person who is third by salary would be left out. `ROW_NUMBER` never ties, so it drops people who earn the same.',
    'A window function cannot be filtered in the same `SELECT`, so the rank goes in a subquery and the outer query filters `rnk <= 3`. `QUALIFY` does the same in one step in DuckDB.',
    'Say the tie rule out loud before you pick the function. That sentence is the whole interview signal.'
  ),
  cases: [
    {
      tables: [department([[1, 'Sales'], [2, 'Tech']]), employee([[1, 'Ann', 90, 1], [2, 'Bob', 80, 1], [3, 'Cy', 70, 1], [4, 'Di', 60, 1], [5, 'Eve', 100, 2], [6, 'Fay', 95, 2]])],
      expect: out(['department', 'employee', 'salary'], [['Sales', 'Ann', 90], ['Sales', 'Bob', 80], ['Sales', 'Cy', 70], ['Tech', 'Eve', 100], ['Tech', 'Fay', 95]]),
    },
    {
      hidden: true,
      tables: [department([[1, 'Sales'], [2, 'Tech']]), employee([[1, 'A', 100, 1], [2, 'B', 100, 1], [3, 'C', 90, 1], [4, 'D', 80, 1], [5, 'E', 70, 1], [6, 'F', 10, 2]])],
      expect: out(['department', 'employee', 'salary'], [['Sales', 'A', 100], ['Sales', 'B', 100], ['Sales', 'C', 90], ['Sales', 'D', 80], ['Tech', 'F', 10]]),
    },
    {
      hidden: true,
      tables: [department([[1, 'Sales'], [2, 'Tech'], [3, 'Empty']]), employee([[1, 'P', 50, 1], [2, 'Q', 40, 1], [3, 'R', 30, 2], [4, 'S', 20, 2]])],
      expect: out(['department', 'employee', 'salary'], [['Sales', 'P', 50], ['Sales', 'Q', 40], ['Tech', 'R', 30], ['Tech', 'S', 20]]),
    },
    {
      hidden: true,
      tables: [department([[1, 'Ops']]), employee([[1, 'W', 10, 1], [2, 'X', 10, 1], [3, 'Y', 10, 1], [4, 'Z', 10, 1]])],
      expect: out(['department', 'employee', 'salary'], [['Ops', 'W', 10], ['Ops', 'X', 10], ['Ops', 'Y', 10], ['Ops', 'Z', 10]]),
    },
  ],
};
