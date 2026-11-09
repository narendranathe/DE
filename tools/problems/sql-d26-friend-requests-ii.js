const { tbl, D, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const accepted = (rows) => tbl('request_accepted', 'requester_id INT, accepter_id INT, accept_date DATE', rows.map((r) => [r[0], r[1], D(r[2])]));
const cols = ['id', 'num'];

module.exports = {
  id: 'sql-d26-friend-requests-ii', day: 26, lc: 'friend-requests-ii-who-has-the-most-friends', anchor: 'LC 602', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Friend Requests II: Who Has the Most Friends', kind: 'select', ordered: false,
  schema: ['request_accepted(requester_id INT, accepter_id INT, accept_date DATE)   -- (requester_id, accepter_id) is unique'],
  statement: para(
    'Each row of `request_accepted` means: `requester_id` sent a friend request, and `accepter_id` accepted it on `accept_date`. A friendship is **mutual**. After the row exists, each of the two people has the other as a friend.',
    'Find the person with the **most friends**, and how many they have. Return `id` and `num`. The data guarantees exactly one person has the highest count.',
    'Each pair appears in at most one row, and nobody sends a request to themselves.'
  ),
  starter: '-- Return one row: id, num\nSELECT\n',
  solution: [
    'WITH everyone AS (',
    '  SELECT requester_id AS id FROM request_accepted',
    '  UNION ALL',
    '  SELECT accepter_id        FROM request_accepted',
    ')',
    'SELECT id, COUNT(*) AS num',
    'FROM everyone',
    'GROUP BY id',
    'ORDER BY num DESC',
    'LIMIT 1',
  ].join('\n'),
  mutants: [
    { name: 'counts only the requests a person sent', code: 'SELECT requester_id AS id, COUNT(*) AS num FROM request_accepted GROUP BY requester_id ORDER BY num DESC LIMIT 1' },
    { name: 'counts only the requests a person accepted', code: 'SELECT accepter_id AS id, COUNT(*) AS num FROM request_accepted GROUP BY accepter_id ORDER BY num DESC LIMIT 1' },
    { name: 'picks the person with the fewest friends', code: 'WITH everyone AS (SELECT requester_id AS id FROM request_accepted UNION ALL SELECT accepter_id FROM request_accepted) SELECT id, COUNT(*) AS num FROM everyone GROUP BY id ORDER BY num ASC, id LIMIT 1' },
  ],
  hints: [
    'A person can appear on either side of a row. Counting just one column misses the other half of their friendships.',
    'Stack the two columns into one list of ids, so each row contributes both people. UNION ALL keeps every entry, including repeats.',
    'GROUP BY id and COUNT(*) gives each person\'s friend count. Sort descending and take one row.',
  ],
  approach: para(
    '**Trigger:** "a relationship that goes both ways, stored once". **Pattern:** unpivot with `UNION ALL` (both columns into one), then group and count. **Complexity:** one pass over the table twice.',
    'Use `UNION ALL`, not `UNION`. Plain `UNION` removes duplicate ids, and a person who appears in three rows would shrink to one entry.',
    'Because each pair is stored once, an id showing up in the stacked list once per friendship is exactly the friend count. No extra de-duplication is needed.'
  ),
  cases: [
    { tables: [accepted([[1, 2, '2020-01-01'], [1, 3, '2020-01-02'], [2, 3, '2020-01-03'], [3, 4, '2020-01-04']])], expect: out(cols, [[3, 3]]) },
    { hidden: true, tables: [accepted([[5, 6, '2021-05-01']])], expect: out(cols, [[5, 1]]) },
    { hidden: true, tables: [accepted([[1, 9, '2021-01-01'], [2, 9, '2021-01-02'], [3, 9, '2021-01-03'], [1, 2, '2021-01-04']])], expect: out(cols, [[9, 3]]) },
    { hidden: true, tables: [accepted([[7, 1, '2021-02-01'], [7, 2, '2021-02-02'], [7, 3, '2021-02-03'], [7, 4, '2021-02-04'], [1, 2, '2021-02-05']])], expect: out(cols, [[7, 4]]) },
  ],
};
