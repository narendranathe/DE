const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const employees = (rows) => tbl('employees', 'employee_id INT, name VARCHAR, manager_id INT, salary INT', rows);

module.exports = {
  id: 'sql-d22-manager-left-the-company', day: 22, lc: 'employees-whose-manager-left-the-company', anchor: 'LC 1978', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Employees Whose Manager Left the Company', kind: 'select', ordered: true,
  schema: ['employees(employee_id INT, name VARCHAR, manager_id INT, salary INT)   -- employee_id is unique; manager_id is NULL for people who never had a manager'],
  statement: para(
    'When someone leaves the company, their row is deleted from `employees`. Rows of the people they managed stay, and still carry the old `manager_id`.',
    'Find the `employee_id` of every employee who meets **all three** conditions:\n- the salary is **strictly below 30000**\n- they have a `manager_id` (it is not `NULL`)\n- no row in the table has an `employee_id` equal to their `manager_id`',
    'Return `employee_id`, ordered from smallest to largest.'
  ),
  starter: '-- Return: employee_id  (ordered)\nSELECT\n',
  solution: [
    'SELECT employee_id',
    'FROM employees',
    'WHERE salary < 30000',
    '  AND manager_id IS NOT NULL',
    '  AND manager_id NOT IN (SELECT employee_id FROM employees)',
    'ORDER BY employee_id',
  ].join('\n'),
  mutants: [
    { name: 'counts people who never had a manager', code: 'SELECT e.employee_id FROM employees e LEFT JOIN employees m ON e.manager_id = m.employee_id WHERE e.salary < 30000 AND m.employee_id IS NULL ORDER BY e.employee_id' },
    { name: 'forgets the salary condition', code: 'SELECT employee_id FROM employees WHERE manager_id IS NOT NULL AND manager_id NOT IN (SELECT employee_id FROM employees) ORDER BY employee_id' },
    { name: 'includes a salary of exactly 30000', slipsPastSamples: true, code: 'SELECT employee_id FROM employees WHERE salary <= 30000 AND manager_id IS NOT NULL AND manager_id NOT IN (SELECT employee_id FROM employees) ORDER BY employee_id' },
    { name: 'keeps people whose manager is still here', code: 'SELECT employee_id FROM employees WHERE salary < 30000 AND manager_id IN (SELECT employee_id FROM employees) ORDER BY employee_id' },
  ],
  hints: [
    'A manager "left" when their id is mentioned in manager_id but is missing from the employee_id column.',
    'Test "this id is not in that list" with NOT IN (SELECT employee_id FROM employees), or with a LEFT JOIN to the manager row and a check that nothing matched.',
    'Add the salary test and the "has a manager" test. People with manager_id NULL never had a manager, so they have not lost one.',
  ],
  approach: para(
    '**Trigger:** "rows whose parent no longer exists" (an orphan check, also called an anti-join). **Pattern:** `NOT IN (subquery)`, `NOT EXISTS`, or `LEFT JOIN ... WHERE parent IS NULL`. **Complexity:** one hash lookup per row.',
    'The `LEFT JOIN` form has a trap: a person with `manager_id = NULL` also finds no match, so they show up. You must say **has a manager** (`manager_id IS NOT NULL`) separately.',
    '`NOT IN` is safe here because `employee_id` is never `NULL`. If the subquery column could be `NULL`, `NOT IN` returns nothing at all, and `NOT EXISTS` is the safer habit.'
  ),
  cases: [
    {
      tables: [employees([[1, 'Ada', null, 90000], [2, 'Ben', 1, 20000], [3, 'Cleo', 11, 10000], [4, 'Dev', 9, 25000], [5, 'Eli', 12, 50000], [6, 'Fay', null, 5000]])],
      expect: out(['employee_id'], [[3], [4]]),
    },
    { hidden: true, tables: [employees([[1, 'A', 99, 30000], [2, 'B', 98, 29999]])], expect: out(['employee_id'], [[2]]) },
    { hidden: true, tables: [employees([[1, 'A', null, 100], [2, 'B', 1, 100], [3, 'C', 2, 100]])], expect: out(['employee_id'], []) },
    { hidden: true, tables: [employees([[5, 'A', 7, 100], [3, 'B', 8, 100], [4, 'C', 3, 100]])], expect: out(['employee_id'], [[3], [5]]) },
  ],
};
