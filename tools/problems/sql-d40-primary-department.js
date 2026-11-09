const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const employee = (rows) => tbl('employee', 'employee_id INT, department_id INT, primary_flag VARCHAR', rows);
const cols = ['employee_id', 'department_id'];

module.exports = {
  id: 'sql-d40-primary-department', day: 40, lc: 'primary-department-for-each-employee', anchor: 'LC 1789', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Primary Department for Each Employee', kind: 'select', ordered: false,
  schema: ["employee(employee_id INT, department_id INT, primary_flag VARCHAR)   -- primary_flag is 'Y' or 'N'; (employee_id, department_id) is unique"],
  statement: para(
    'An employee can belong to one or more departments. One row of `employee` is one membership.',
    'When an employee belongs to **several** departments, exactly one row has `primary_flag = \'Y\'`. That is their primary department. When an employee belongs to **only one** department, the flag is `\'N\'`, but that department is still their primary one.',
    'Return `employee_id` and `department_id` of the primary department for **every** employee, one row each. Rows can come in any order.'
  ),
  starter: '-- Return: employee_id, department_id\nSELECT\n',
  solution: [
    'SELECT employee_id, department_id',
    'FROM employee',
    "WHERE primary_flag = 'Y'",
    '   OR employee_id IN (',
    '        SELECT employee_id FROM employee GROUP BY employee_id HAVING COUNT(*) = 1',
    '      )',
  ].join('\n'),
  mutants: [
    { name: 'keeps only the rows flagged Y, so one-department employees vanish', code: "SELECT employee_id, department_id FROM employee WHERE primary_flag = 'Y'" },
    { name: 'keeps only employees with one department', code: 'SELECT employee_id, department_id FROM employee WHERE employee_id IN (SELECT employee_id FROM employee GROUP BY employee_id HAVING COUNT(*) = 1)' },
    { name: 'keeps the N rows', code: "SELECT employee_id, department_id FROM employee WHERE primary_flag = 'N' OR employee_id IN (SELECT employee_id FROM employee GROUP BY employee_id HAVING COUNT(*) = 1)" },
    { name: 'keeps every row of an employee who has any Y row', code: "SELECT employee_id, department_id FROM employee WHERE employee_id IN (SELECT employee_id FROM employee WHERE primary_flag = 'Y') OR employee_id IN (SELECT employee_id FROM employee GROUP BY employee_id HAVING COUNT(*) = 1)" },
  ],
  hints: [
    'There are two kinds of employee, and each one has a different rule for finding the primary row. Write the two rules down first.',
    'Rule 1: the row with primary_flag = \'Y\'. Rule 2: the only row, for an employee who has exactly one row, whatever its flag says.',
    'Combine the rules with OR. For rule 2, find the lonely employees with GROUP BY employee_id HAVING COUNT(*) = 1 in a subquery.',
  ],
  approach: para(
    '**Trigger:** "pick one row per group, and the rule for picking depends on the group". **Pattern:** a filter that is an `OR` of two conditions, one on the row and one on the group (a subquery with `HAVING`). **Complexity:** one scan plus one group.',
    'A window version also works: `COUNT(*) OVER (PARTITION BY employee_id)` gives the group size, and you keep the row when the flag is `Y` or the size is 1. It avoids the second scan.',
    'Check both kinds of employee in your own sample data. Most wrong answers handle one kind and quietly drop the other.'
  ),
  cases: [
    {
      tables: [employee([[1, 1, 'N'], [2, 1, 'Y'], [2, 2, 'N'], [3, 3, 'N'], [4, 2, 'N'], [4, 3, 'Y'], [4, 4, 'N']])],
      expect: out(cols, [[1, 1], [2, 1], [3, 3], [4, 3]]),
    },
    { hidden: true, tables: [employee([[9, 5, 'N']])], expect: out(cols, [[9, 5]]) },
    { hidden: true, tables: [employee([[1, 1, 'N'], [1, 2, 'N'], [1, 3, 'Y']])], expect: out(cols, [[1, 3]]) },
    { hidden: true, tables: [employee([[1, 10, 'Y'], [2, 10, 'N'], [3, 11, 'Y'], [3, 12, 'N']])], expect: out(cols, [[1, 10], [2, 10], [3, 11]]) },
  ],
};
