const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const employee = (rows) => tbl('employee', 'id INT, name VARCHAR, salary INT, department_id INT', rows);
const department = (rows) => tbl('department', 'id INT, name VARCHAR', rows);
const cols = ['department', 'employee', 'salary'];

module.exports = {
  id: 'sql-d54-department-highest-salary', day: 54, lc: 'department-highest-salary', anchor: 'LC 184', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Department Highest Salary', kind: 'select', ordered: false,
  schema: [
    'employee(id INT, name VARCHAR, salary INT, department_id INT)   -- id is unique',
    'department(id INT, name VARCHAR)   -- id is unique',
  ],
  statement: para(
    'Each employee belongs to one department. For **every department**, find the employee or employees with the **highest salary** in that department.',
    'If several people share the top salary in a department, return all of them.',
    'Return `department` (the department name), `employee` (the employee name) and `salary`. Rows can come in any order.'
  ),
  starter: '-- Return: department, employee, salary\nSELECT\n',
  solution: [
    'WITH ranked AS (',
    '  SELECT department_id, name, salary,',
    '         RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk',
    '  FROM employee',
    ')',
    'SELECT d.name AS department, r.name AS employee, r.salary',
    'FROM ranked r',
    'JOIN department d ON d.id = r.department_id',
    'WHERE r.rnk = 1',
  ].join('\n'),
  mutants: [
    { name: 'ROW_NUMBER keeps only one person when two tie', code: 'WITH ranked AS (SELECT department_id, name, salary, ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk FROM employee) SELECT d.name AS department, r.name AS employee, r.salary FROM ranked r JOIN department d ON d.id = r.department_id WHERE r.rnk = 1' },
    { name: 'takes the highest salary of the whole company', code: 'SELECT d.name AS department, e.name AS employee, e.salary FROM employee e JOIN department d ON d.id = e.department_id WHERE e.salary = (SELECT MAX(salary) FROM employee)' },
    { name: 'takes the lowest salary in each department', code: 'WITH ranked AS (SELECT department_id, name, salary, RANK() OVER (PARTITION BY department_id ORDER BY salary ASC) AS rnk FROM employee) SELECT d.name AS department, r.name AS employee, r.salary FROM ranked r JOIN department d ON d.id = r.department_id WHERE r.rnk = 1' },
    { name: 'ranks the whole company at once, with no PARTITION BY', code: 'WITH ranked AS (SELECT department_id, name, salary, RANK() OVER (ORDER BY salary DESC) AS rnk FROM employee) SELECT d.name AS department, r.name AS employee, r.salary FROM ranked r JOIN department d ON d.id = r.department_id WHERE r.rnk = 1' },
  ],
  hints: [
    '"Highest in each department" means you compare people only with others in the same department.',
    'RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) numbers people inside each department, with 1 for the top salary.',
    'RANK gives tied people the same number, so keeping rank = 1 keeps all of them. Join to department for the name.',
  ],
  approach: para(
    '**Trigger:** "top / highest / latest **per group**". **Pattern:** `RANK()` (or `DENSE_RANK()`) with `PARTITION BY group`, keep rank 1. **Complexity:** one sort per department.',
    'The choice of ranking function is the whole question. `ROW_NUMBER()` never ties, so it silently drops the second person with the top salary. `RANK()` ties them both at 1.',
    'A second route is a correlated filter: `WHERE salary = (SELECT MAX(salary) FROM employee x WHERE x.department_id = e.department_id)`. It is easy to read and also keeps ties.'
  ),
  cases: [
    {
      tables: [
        employee([[1, 'Joe', 70000, 1], [2, 'Jim', 90000, 1], [3, 'Henry', 80000, 2], [4, 'Sam', 60000, 2], [5, 'Max', 90000, 1]]),
        department([[1, 'IT'], [2, 'Sales']]),
      ],
      expect: out(cols, [['IT', 'Jim', 90000], ['IT', 'Max', 90000], ['Sales', 'Henry', 80000]]),
    },
    { hidden: true, tables: [employee([[1, 'Solo', 100, 7]]), department([[7, 'Ops']])], expect: out(cols, [['Ops', 'Solo', 100]]) },
    {
      hidden: true,
      tables: [employee([[1, 'A', 10, 1], [2, 'B', 20, 2], [3, 'C', 5, 1], [4, 'D', 20, 2]]), department([[1, 'X'], [2, 'Y']])],
      expect: out(cols, [['X', 'A', 10], ['Y', 'B', 20], ['Y', 'D', 20]]),
    },
    { hidden: true, tables: [employee([[1, 'A', 50, 1], [2, 'B', 50, 1], [3, 'C', 50, 1]]), department([[1, 'Z']])], expect: out(cols, [['Z', 'A', 50], ['Z', 'B', 50], ['Z', 'C', 50]]) },
  ],
};
