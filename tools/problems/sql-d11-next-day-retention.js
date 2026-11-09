const { tbl, D, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const plays = (rows) => tbl('plays', 'player_id INT, device_id INT, event_date DATE, games INT', rows.map((r) => [r[0], r[1], D(r[2]), r[3]]));

module.exports = {
  id: 'sql-d11-next-day-retention', day: 11, lc: 'game-play-analysis-iv', anchor: 'LC 550', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Game Play Analysis IV', kind: 'select', ordered: false,
  schema: ['plays(player_id INT, device_id INT, event_date DATE, games INT)   -- one row per player, device and day'],
  statement: para(
    'Each row says a player logged in on a device on a date. A player\'s **first login** is their earliest `event_date`.',
    'Return the **fraction of players** who logged in again on the **day right after** their first login, rounded to 2 decimals, in a column named `fraction`.',
    'A player counts once, even if they logged in twice on that next day from two devices.'
  ),
  starter: '-- Return: fraction\nSELECT\n',
  solution: [
    'WITH first_login AS (',
    '  SELECT player_id, MIN(event_date) AS d FROM plays GROUP BY player_id',
    ')',
    'SELECT ROUND(COUNT(DISTINCT p.player_id) * 1.0 / (SELECT COUNT(*) FROM first_login), 2) AS fraction',
    'FROM first_login f',
    'JOIN plays p ON p.player_id = f.player_id AND p.event_date = f.d + 1',
  ].join('\n'),
  mutants: [
    { name: 'counts players who ever come back, not only the next day', code: 'WITH f AS (SELECT player_id, MIN(event_date) AS d FROM plays GROUP BY player_id) SELECT ROUND(COUNT(DISTINCT p.player_id) * 1.0 / (SELECT COUNT(*) FROM f), 2) AS fraction FROM f JOIN plays p ON p.player_id = f.player_id AND p.event_date > f.d' },
    { name: 'forgets DISTINCT, so two devices on the next day count twice', slipsPastSamples: true, code: 'WITH f AS (SELECT player_id, MIN(event_date) AS d FROM plays GROUP BY player_id) SELECT ROUND(COUNT(p.player_id) * 1.0 / (SELECT COUNT(*) FROM f), 2) AS fraction FROM f JOIN plays p ON p.player_id = f.player_id AND p.event_date = f.d + 1' },
    { name: 'divides by login rows instead of players', code: 'WITH f AS (SELECT player_id, MIN(event_date) AS d FROM plays GROUP BY player_id) SELECT ROUND(COUNT(DISTINCT p.player_id) * 1.0 / (SELECT COUNT(*) FROM plays), 2) AS fraction FROM f JOIN plays p ON p.player_id = f.player_id AND p.event_date = f.d + 1' },
  ],
  hints: [
    'Split it in two: first find each player\'s first login date, then check whether that player has a row exactly one day later.',
    'Join the first-login result back to plays on player_id and event_date = first date + 1.',
    'Divide the number of distinct players found by the number of distinct players overall.',
  ],
  approach: para(
    'The numerator and denominator count **players**, not rows. A player can have several rows on the day after their first login, so the numerator uses `COUNT(DISTINCT player_id)`.',
    'Compute each player\'s first date once in a CTE. Reuse it for the join and for the denominator. `date + 1` moves a date forward by one day, and it handles month and year ends for you.'
  ),
  cases: [
    { tables: [plays([[1, 2, '2016-03-01', 5], [1, 2, '2016-03-02', 6], [2, 3, '2017-06-25', 1], [3, 1, '2016-03-02', 0], [3, 4, '2018-07-03', 5]])], expect: out(['fraction'], [[0.33]]) },
    { hidden: true, tables: [plays([[1, 1, '2020-01-01', 1], [1, 2, '2020-01-02', 1], [1, 3, '2020-01-02', 1]])], expect: out(['fraction'], [[1]]) },
    { hidden: true, tables: [plays([[1, 1, '2020-01-01', 1], [1, 1, '2020-01-03', 1], [2, 1, '2020-01-05', 1]])], expect: out(['fraction'], [[0]]) },
    { hidden: true, tables: [plays([[1, 1, '2020-02-28', 1], [1, 1, '2020-02-29', 1], [2, 1, '2020-12-31', 1], [2, 1, '2021-01-01', 1]])], expect: out(['fraction'], [[1]]) },
  ],
};
