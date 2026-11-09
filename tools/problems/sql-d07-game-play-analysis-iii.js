const { tbl, D, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const activity = (rows) => tbl('activity', 'player_id INT, device_id INT, event_date DATE, games_played INT', rows.map((r) => [r[0], r[1], D(r[2]), r[3]]));
const cols = ['player_id', 'event_date', 'games_played_so_far'];

// Appears only inside the day 7 timed set, so there is no checkbox of its own: bounty 0, no category.
module.exports = {
  id: 'sql-d07-game-play-analysis-iii', day: 7, lc: 'game-play-analysis-iii', bounty: 0, lang: 'sql',
  title: 'Games Played So Far', kind: 'select', ordered: false,
  schema: ['activity(player_id INT, device_id INT, event_date DATE, games_played INT)   -- (player_id, event_date) is unique'],
  statement: para(
    'Each row of `activity` says how many games a player finished on one day, on one device.',
    'For every row, report the player\'s **running total**: all the games they played on that day **plus** all the games from their earlier days. Each player has their own running total, and it starts again from zero for the next player.',
    'Return `player_id`, `event_date` and `games_played_so_far`, one row for each row of `activity`, in any order.'
  ),
  starter: '-- Return: player_id, event_date, games_played_so_far\nSELECT\n',
  solution: [
    'SELECT player_id,',
    '       event_date,',
    '       SUM(games_played) OVER (PARTITION BY player_id ORDER BY event_date) AS games_played_so_far',
    'FROM activity',
  ].join('\n'),
  mutants: [
    { name: 'one running total across all players', code: 'SELECT player_id, event_date, SUM(games_played) OVER (ORDER BY event_date) AS games_played_so_far FROM activity' },
    { name: 'gives every row the player\'s grand total', code: 'SELECT player_id, event_date, SUM(games_played) OVER (PARTITION BY player_id) AS games_played_so_far FROM activity' },
    { name: 'collapses each player to one row', code: 'SELECT player_id, MAX(event_date) AS event_date, SUM(games_played) AS games_played_so_far FROM activity GROUP BY player_id' },
  ],
  hints: [
    'You need a number that grows row by row inside each player. A plain GROUP BY gives one number per player, which is too coarse.',
    'A window function keeps every row and adds a column. SUM(...) OVER (...) can add up the rows that came before the current one.',
    'PARTITION BY player_id restarts the total for each player. ORDER BY event_date inside the OVER makes it a running total instead of a grand total.',
  ],
  approach: para(
    '**Trigger:** "total so far", "cumulative", "year to date". **Pattern:** `SUM(x) OVER (PARTITION BY who ORDER BY when)`. With an `ORDER BY` in the window, SQL adds up from the first row to the current row by default.',
    'Two details decide the answer. Without `PARTITION BY`, one player\'s games leak into the next player\'s total. Without `ORDER BY`, every row gets the same grand total.',
    'If two rows could share a date for one player, the default frame would count both at once. Here `(player_id, event_date)` is unique, so that cannot happen.'
  ),
  cases: [
    {
      tables: [activity([[1, 2, '2020-03-01', 5], [1, 2, '2020-03-02', 6], [1, 3, '2020-04-01', 1], [2, 1, '2020-03-01', 0], [2, 1, '2020-03-03', 4], [3, 4, '2020-05-01', 9]])],
      expect: out(cols, [[1, '2020-03-01', 5], [1, '2020-03-02', 11], [1, '2020-04-01', 12], [2, '2020-03-01', 0], [2, '2020-03-03', 4], [3, '2020-05-01', 9]]),
    },
    { hidden: true, tables: [activity([[7, 1, '2021-01-05', 3]])], expect: out(cols, [[7, '2021-01-05', 3]]) },
    {
      hidden: true,
      tables: [activity([[1, 1, '2021-02-03', 4], [2, 1, '2021-02-01', 10], [1, 2, '2021-02-01', 2], [2, 1, '2021-02-09', 1], [1, 1, '2021-02-02', 1]])],
      expect: out(cols, [[1, '2021-02-01', 2], [1, '2021-02-02', 3], [1, '2021-02-03', 7], [2, '2021-02-01', 10], [2, '2021-02-09', 11]]),
    },
    { hidden: true, tables: [activity([])], expect: out(cols, []) },
  ],
};
