const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const employee = (rows) => tbl('employee', 'id INT, salary INT', rows);
const cols = ['third_highest_salary'];

module.exports = {
  id: 'sql-d18-nth-highest-salary', day: 18, lc: 'nth-highest-salary', anchor: 'LC 177', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Third Highest Salary', kind: 'select', ordered: false,
  schema: ['employee(id INT, salary INT)   -- id is unique; salaries can repeat'],
  statement: para(
    'Find the **third highest distinct salary** in `employee`.',
    '"Distinct" means equal salaries count once: if the salaries are 300, 300, 200, 100, the first highest is 300, the second is 200 and the third is 100.',
    'Return exactly **one row** with one column, `third_highest_salary`. If there are fewer than three distinct salaries, the value must be `NULL` (still one row).',
    'This is the "N = 3" version of the classic question. The same idea works for any N.'
  ),
  starter: '-- Return one row: third_highest_salary (NULL if there is no third)\nSELECT\n',
  solution: [
    'SELECT (',
    '  SELECT DISTINCT salary',
    '  FROM employee',
    '  ORDER BY salary DESC',
    '  LIMIT 1 OFFSET 2',
    ') AS third_highest_salary',
  ].join('\n'),
  mutants: [
    { name: 'counts repeated salaries separately', code: 'SELECT (SELECT salary FROM employee ORDER BY salary DESC LIMIT 1 OFFSET 2) AS third_highest_salary' },
    { name: 'skips one too many (fourth highest)', code: 'SELECT (SELECT DISTINCT salary FROM employee ORDER BY salary DESC LIMIT 1 OFFSET 3) AS third_highest_salary' },
    { name: 'returns no row at all when there is no third salary', slipsPastSamples: true, code: 'SELECT DISTINCT salary AS third_highest_salary FROM employee ORDER BY salary DESC LIMIT 1 OFFSET 2' },
    { name: 'gives the lowest of the top three rows, so it answers even with two salaries', slipsPastSamples: true, code: 'SELECT MIN(salary) AS third_highest_salary FROM (SELECT DISTINCT salary FROM employee ORDER BY salary DESC LIMIT 3)' },
  ],
  hints: [
    'Think of the distinct salaries sorted from high to low. The answer is the third one in that list.',
    'SELECT DISTINCT salary ... ORDER BY salary DESC puts them in order. LIMIT 1 OFFSET 2 skips two and takes one.',
    'If there is no third row, that query returns zero rows, not NULL. Put it inside a scalar subquery in the SELECT list: a scalar subquery with no row gives NULL.',
  ],
  approach: para(
    '**Trigger:** "Nth highest / lowest value". **Pattern:** distinct values, sorted, `LIMIT 1 OFFSET N-1`, wrapped in a scalar subquery so a missing row turns into `NULL`. **Complexity:** one sort.',
    'Two traps. Ties: without `DISTINCT`, a salary that repeats uses up two places in the list. Empty result: a bare `LIMIT ... OFFSET` returns no row, but the question asks for one row holding `NULL`.',
    'The other common answer is `DENSE_RANK() OVER (ORDER BY salary DESC)` and then `WHERE rnk = 3`. It handles ties the same way. Use `MAX(salary)` over that filter so you still get a `NULL` row when nothing matches.'
  ),
  cases: [
    { tables: [employee([[1, 300], [2, 300], [3, 200], [4, 100], [5, 50]])], expect: out(cols, [[100]]) },
    { hidden: true, tables: [employee([[1, 100], [2, 200]])], expect: out(cols, [[null]]) },
    { hidden: true, tables: [employee([[1, 70], [2, 70], [3, 70], [4, 90]])], expect: out(cols, [[null]]) },
    { hidden: true, tables: [employee([[1, 10], [2, 30], [3, 20]])], expect: out(cols, [[10]]) },
    { hidden: true, tables: [employee([])], expect: out(cols, [[null]]) },
  ],
};
