const { tbl, D, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const users = (rows) => tbl('users', 'user_id INT, name VARCHAR', rows);
const movies = (rows) => tbl('movies', 'movie_id INT, title VARCHAR', rows);
const ratings = (rows) => tbl('ratings', 'movie_id INT, user_id INT, rating INT, created_at DATE', rows.map((r) => [r[0], r[1], r[2], D(r[3])]));

module.exports = {
  id: 'sql-d13-movie-rating', day: 13, lc: 'movie-rating', anchor: 'LC 1341', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Movie Rating', kind: 'select', ordered: false,
  schema: ['users(user_id INT, name VARCHAR)', 'movies(movie_id INT, title VARCHAR)', 'ratings(movie_id INT, user_id INT, rating INT, created_at DATE)'],
  statement: para(
    'Return **two rows** in one column named `results`:',
    '1. The **name of the user** who rated the most movies. If users tie, return the name that comes first alphabetically.\n2. The **title of the movie** with the highest **average rating in February 2020**. If movies tie, return the title that comes first alphabetically.',
    'The two rows can come back in any order.'
  ),
  starter: '-- Return one column: results (two rows)\nSELECT\n',
  solution: [
    '(SELECT u.name AS results',
    ' FROM ratings r JOIN users u ON u.user_id = r.user_id',
    ' GROUP BY u.user_id, u.name',
    ' ORDER BY COUNT(*) DESC, u.name',
    ' LIMIT 1)',
    'UNION ALL',
    '(SELECT m.title',
    ' FROM ratings r JOIN movies m ON m.movie_id = r.movie_id',
    " WHERE r.created_at >= DATE '2020-02-01' AND r.created_at < DATE '2020-03-01'",
    ' GROUP BY m.movie_id, m.title',
    ' ORDER BY AVG(r.rating) DESC, m.title',
    ' LIMIT 1)',
  ].join('\n'),
  mutants: [
    { name: 'breaks the user tie by user_id instead of by name', slipsPastSamples: true, code: "(SELECT u.name AS results FROM ratings r JOIN users u ON u.user_id = r.user_id GROUP BY u.user_id, u.name ORDER BY COUNT(*) DESC, u.user_id LIMIT 1) UNION ALL (SELECT m.title FROM ratings r JOIN movies m ON m.movie_id = r.movie_id WHERE r.created_at >= DATE '2020-02-01' AND r.created_at < DATE '2020-03-01' GROUP BY m.movie_id, m.title ORDER BY AVG(r.rating) DESC, m.title LIMIT 1)" },
    { name: 'averages the movie ratings over every month', code: "(SELECT u.name AS results FROM ratings r JOIN users u ON u.user_id = r.user_id GROUP BY u.user_id, u.name ORDER BY COUNT(*) DESC, u.name LIMIT 1) UNION ALL (SELECT m.title FROM ratings r JOIN movies m ON m.movie_id = r.movie_id GROUP BY m.movie_id, m.title ORDER BY AVG(r.rating) DESC, m.title LIMIT 1)" },
    { name: 'breaks the movie tie by the last title instead of the first', code: "(SELECT u.name AS results FROM ratings r JOIN users u ON u.user_id = r.user_id GROUP BY u.user_id, u.name ORDER BY COUNT(*) DESC, u.name LIMIT 1) UNION ALL (SELECT m.title FROM ratings r JOIN movies m ON m.movie_id = r.movie_id WHERE r.created_at >= DATE '2020-02-01' AND r.created_at < DATE '2020-03-01' GROUP BY m.movie_id, m.title ORDER BY AVG(r.rating) DESC, m.title DESC LIMIT 1)" },
    { name: 'counts a month boundary wrongly and drops 29 February', slipsPastSamples: true, code: "(SELECT u.name AS results FROM ratings r JOIN users u ON u.user_id = r.user_id GROUP BY u.user_id, u.name ORDER BY COUNT(*) DESC, u.name LIMIT 1) UNION ALL (SELECT m.title FROM ratings r JOIN movies m ON m.movie_id = r.movie_id WHERE r.created_at >= DATE '2020-02-01' AND r.created_at < DATE '2020-02-29' GROUP BY m.movie_id, m.title ORDER BY AVG(r.rating) DESC, m.title LIMIT 1)" },
  ],
  hints: [
    'There are two separate questions. Write each as its own query that returns one row, then stack them.',
    'Each query is GROUP BY, ORDER BY the measure descending then the name or title ascending, and LIMIT 1. The tie-break is the second ORDER BY column.',
    'Wrap each query in parentheses and join them with UNION ALL. Filter the movie query to 2020-02-01 up to but not including 2020-03-01.',
  ],
  approach: para(
    'Each half is a "top 1 with a tie-break" query: `ORDER BY measure DESC, name ASC LIMIT 1`. The second `ORDER BY` column is the tie rule, so a tie can never leave the answer to chance.',
    'Parentheses around each half let each have its own `ORDER BY` and `LIMIT`, and `UNION ALL` stacks the two single-row answers.',
    'Use a half-open date range (`>= Feb 1` and `< Mar 1`). It includes 29 February and never breaks on the last day of the month.'
  ),
  cases: [
    {
      tables: [
        users([[1, 'Daniel'], [2, 'Monica'], [3, 'Maria'], [4, 'James']]),
        movies([[1, 'Avengers'], [2, 'Frozen 2'], [3, 'Joker']]),
        ratings([[1, 1, 3, '2020-01-12'], [1, 2, 4, '2020-02-11'], [1, 3, 2, '2020-02-12'], [1, 4, 1, '2020-01-01'], [2, 1, 5, '2020-02-17'], [2, 2, 2, '2020-02-01'], [2, 3, 2, '2020-03-01'], [3, 1, 3, '2020-02-22'], [3, 2, 4, '2020-02-25']]),
      ],
      expect: out(['results'], [['Daniel'], ['Frozen 2']]),
    },
    {
      hidden: true,
      tables: [users([[1, 'Zed'], [2, 'Amy']]), movies([[1, 'Alpha'], [2, 'Beta']]), ratings([[1, 1, 4, '2020-02-03'], [2, 1, 4, '2020-02-04'], [1, 2, 4, '2020-02-05']])],
      expect: out(['results'], [['Zed'], ['Alpha']]),
    },
    {
      hidden: true,
      tables: [users([[1, 'Zed'], [2, 'Amy']]), movies([[1, 'Gamma'], [2, 'Delta']]), ratings([[1, 1, 3, '2020-02-03'], [2, 2, 3, '2020-02-04']])],
      expect: out(['results'], [['Amy'], ['Delta']]),
    },
    {
      hidden: true,
      tables: [users([[1, 'Kim']]), movies([[1, 'Old'], [2, 'Leap']]), ratings([[1, 1, 5, '2020-01-31'], [1, 1, 5, '2020-03-01'], [2, 1, 3, '2020-02-29'], [1, 1, 1, '2020-02-02']])],
      expect: out(['results'], [['Kim'], ['Leap']]),
    },
  ],
};
