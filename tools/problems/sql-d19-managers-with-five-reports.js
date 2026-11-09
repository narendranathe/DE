const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const employee = (rows) => tbl('employee', 'id INT, name VARCHAR, department VARCHAR, manager_id INT', rows);

module.exports = {
  id: 'sql-d19-managers-with-five-reports', day: 19, lc: 'managers-with-at-least-5-direct-reports', anchor: 'LC 570', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Managers with at Least 5 Direct Reports', kind: 'select', ordered: false,
  schema: ['employee(id INT, name VARCHAR, department VARCHAR, manager_id INT)   -- id is unique; manager_id points at another id, or is NULL for the top person'],
  statement: para(
    'Every row of `employee` is a person. `manager_id` holds the `id` of that person\'s direct manager. It is `NULL` for the person at the top.',
    'Return the `name` of every manager who has **five or more direct reports**. A direct report is someone whose `manager_id` is that manager\'s `id`. People further down the chain do not count.',
    'Two different people can have the same name, so do not merge managers by name. Rows can come in any order.'
  ),
  starter: '-- Return: name\nSELECT\n',
  solution: [
    'SELECT m.name',
    'FROM employee m',
    'JOIN employee e ON e.manager_id = m.id',
    'GROUP BY m.id, m.name',
    'HAVING COUNT(*) >= 5',
  ].join('\n'),
  mutants: [
    { name: 'needs only four reports', code: 'SELECT m.name FROM employee m JOIN employee e ON e.manager_id = m.id GROUP BY m.id, m.name HAVING COUNT(*) >= 4' },
    { name: 'needs more than five reports', code: 'SELECT m.name FROM employee m JOIN employee e ON e.manager_id = m.id GROUP BY m.id, m.name HAVING COUNT(*) > 5' },
    { name: 'groups by name, so two managers with the same name add up', slipsPastSamples: true, code: 'SELECT m.name FROM employee m JOIN employee e ON e.manager_id = m.id GROUP BY m.name HAVING COUNT(*) >= 5' },
    { name: 'counts the people who have a manager, not the manager\'s own reports', code: 'SELECT name FROM employee WHERE id IN (SELECT manager_id FROM employee WHERE manager_id IS NOT NULL GROUP BY manager_id HAVING COUNT(DISTINCT department) >= 5)' },
  ],
  hints: [
    'The table points at itself: one column holds the id of another row in the same table. That is a self-join.',
    'Join each employee to their manager (e.manager_id = m.id), then group by the manager and count the rows in each group.',
    'Keep groups with HAVING COUNT(*) >= 5. Group by the manager\'s id as well as the name, because two managers can share a name.',
  ],
  approach: para(
    '**Trigger:** "people who have at least N of something that points back at them". **Pattern:** self-join on the foreign key, `GROUP BY` the parent\'s **id**, `HAVING COUNT(*) >= N`. **Complexity:** one join and one group.',
    'Group by `m.id`, not by name alone. A name is a label, not a key. Two managers called "Sam" with three reports each would otherwise look like one manager with six.',
    'The top person has `manager_id = NULL`, so the join drops them as a report automatically. Only people with a real manager id take part.'
  ),
  cases: [
    {
      tables: [employee([
        [1, 'Ruth', 'A', null], [2, 'Ivo', 'A', 1], [3, 'Maya', 'A', 1], [4, 'Dee', 'B', 1], [5, 'Lee', 'B', 1], [6, 'Kai', 'B', 1],
        [7, 'Noor', 'C', 2], [8, 'Omar', 'C', 2], [9, 'Pia', 'C', 2], [10, 'Quin', 'C', 2],
      ])],
      expect: out(['name'], [['Ruth']]),
    },
    {
      hidden: true,
      tables: [employee([[1, 'Top', 'A', null], [2, 'a', 'A', 1], [3, 'b', 'A', 1], [4, 'c', 'A', 1], [5, 'd', 'A', 1], [6, 'e', 'A', 1]])],
      expect: out(['name'], [['Top']]),
    },
    {
      hidden: true,
      tables: [employee([
        [1, 'Sam', 'A', null], [2, 'Sam', 'B', null],
        [3, 'a', 'A', 1], [4, 'b', 'A', 1], [5, 'c', 'A', 1],
        [6, 'd', 'B', 2], [7, 'e', 'B', 2], [8, 'f', 'B', 2],
      ])],
      expect: out(['name'], []),
    },
    {
      hidden: true,
      tables: [employee([[1, 'Boss', 'A', null], [2, 'Mid', 'A', 1], [3, 'x', 'A', 2], [4, 'y', 'A', 2], [5, 'z', 'A', 2], [6, 'w', 'A', 2], [7, 'v', 'A', 2], [8, 'u', 'A', 2]])],
      expect: out(['name'], [['Mid']]),
    },
  ],
};
