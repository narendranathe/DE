const { tbl, D, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const views = (rows) => tbl('views', 'article_id INT, author_id INT, viewer_id INT, view_date DATE', rows.map((r) => [r[0], r[1], r[2], D(r[3])]));

module.exports = {
  id: 'sql-d48-article-views-i', day: 48, lc: 'article-views-i', anchor: 'LC 1148', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Article Views I', kind: 'select', ordered: true,
  schema: ['views(article_id INT, author_id INT, viewer_id INT, view_date DATE)   -- may hold duplicate rows'],
  statement: para(
    'Each row of `views` says that `viewer_id` looked at the article `article_id` written by `author_id`, on `view_date`. The table can hold exact duplicate rows.',
    'Find every author who **viewed at least one of their own articles**. Return their ids in a column called `id`, **each id once**, sorted from smallest to largest.'
  ),
  starter: '-- Return: id  (each author once, sorted)\nSELECT\n',
  solution: [
    'SELECT DISTINCT author_id AS id',
    'FROM views',
    'WHERE author_id = viewer_id',
    'ORDER BY id',
  ].join('\n'),
  mutants: [
    { name: 'the same author appears once per view', code: 'SELECT author_id AS id FROM views WHERE author_id = viewer_id ORDER BY id' },
    { name: 'returns the authors who viewed somebody else\'s article', code: 'SELECT DISTINCT author_id AS id FROM views WHERE author_id <> viewer_id ORDER BY id' },
    { name: 'returns article ids instead of author ids', code: 'SELECT DISTINCT article_id AS id FROM views WHERE author_id = viewer_id ORDER BY id' },
    { name: 'not sorted, in descending order', code: 'SELECT DISTINCT author_id AS id FROM views WHERE author_id = viewer_id ORDER BY id DESC' },
  ],
  hints: [
    'You can answer from one table with a plain filter. Two columns on the same row have to hold the same number.',
    'WHERE author_id = viewer_id keeps the rows where the reader is the writer.',
    'An author can do that many times, and the table can hold duplicates, so use SELECT DISTINCT. Then ORDER BY the id.',
  ],
  approach: para(
    '**Trigger:** "who did X to their own thing". **Pattern:** compare two columns of the same row in `WHERE`, then `DISTINCT`. **Complexity:** one scan.',
    'No join and no `GROUP BY` is needed. `DISTINCT` is the one-word answer to "each id once".',
    'The question says **sorted**, so add the `ORDER BY`. A result that happens to look sorted today is not a sorted result.'
  ),
  cases: [
    {
      tables: [views([[1, 3, 5, '2020-08-01'], [1, 3, 6, '2020-08-02'], [2, 7, 7, '2020-08-01'], [2, 7, 6, '2020-08-02'], [4, 7, 1, '2020-07-22'], [3, 4, 4, '2020-07-21'], [3, 4, 4, '2020-07-21']])],
      expect: out(['id'], [[4], [7]]),
    },
    { hidden: true, tables: [views([[1, 1, 2, '2021-01-01']])], expect: out(['id'], []) },
    { hidden: true, tables: [views([[1, 9, 9, '2021-01-01'], [1, 9, 9, '2021-01-02'], [1, 9, 9, '2021-01-03']])], expect: out(['id'], [[9]]) },
    { hidden: true, tables: [views([[1, 8, 8, '2021-01-01'], [2, 2, 2, '2021-01-01'], [3, 5, 5, '2021-01-01'], [4, 5, 5, '2021-01-02']])], expect: out(['id'], [[2], [5], [8]]) },
  ],
};
