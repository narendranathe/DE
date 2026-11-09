const { tbl, D, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const activity = (rows) => tbl('activity', 'user_id INT, session_id INT, activity_date DATE, activity_type VARCHAR', rows.map((r) => [r[0], r[1], D(r[2]), r[3]]));
const cols = ['day', 'active_users'];

module.exports = {
  id: 'sql-d46-user-activity-last-30-days', day: 46, lc: 'user-activity-for-the-past-30-days-i', anchor: 'LC 1141', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'User Activity for the Past 30 Days I', kind: 'select', ordered: false,
  schema: ["activity(user_id INT, session_id INT, activity_date DATE, activity_type VARCHAR)   -- activity_type is 'open_session', 'end_session', 'scroll_down' or 'send_message'"],
  statement: para(
    'Each row of `activity` is one thing a user did in one session on one day.',
    'Count the **daily active users** for the 30 days that **end on 2020-03-31**. That window runs from 2020-03-02 to 2020-03-31, **both days included**. A user is active on a day if they have at least one row on that day.',
    'Return `day` (the date) and `active_users`. Only days with at least one active user appear. Rows can come in any order.'
  ),
  starter: '-- Return: day, active_users\nSELECT\n',
  solution: [
    'SELECT activity_date AS day,',
    '       COUNT(DISTINCT user_id) AS active_users',
    'FROM activity',
    "WHERE activity_date BETWEEN DATE '2020-03-02' AND DATE '2020-03-31'",
    'GROUP BY activity_date',
  ].join('\n'),
  mutants: [
    { name: 'counts rows, so a busy user is counted many times', code: "SELECT activity_date AS day, COUNT(*) AS active_users FROM activity WHERE activity_date BETWEEN DATE '2020-03-02' AND DATE '2020-03-31' GROUP BY activity_date" },
    { name: 'counts sessions instead of users', code: "SELECT activity_date AS day, COUNT(DISTINCT session_id) AS active_users FROM activity WHERE activity_date BETWEEN DATE '2020-03-02' AND DATE '2020-03-31' GROUP BY activity_date" },
    { name: 'the window is 31 days long', slipsPastSamples: true, code: "SELECT activity_date AS day, COUNT(DISTINCT user_id) AS active_users FROM activity WHERE activity_date BETWEEN DATE '2020-03-01' AND DATE '2020-03-31' GROUP BY activity_date" },
    { name: 'leaves out the last day of the window', slipsPastSamples: true, code: "SELECT activity_date AS day, COUNT(DISTINCT user_id) AS active_users FROM activity WHERE activity_date >= DATE '2020-03-02' AND activity_date < DATE '2020-03-31' GROUP BY activity_date" },
    { name: 'leaves out the first day of the window', slipsPastSamples: true, code: "SELECT activity_date AS day, COUNT(DISTINCT user_id) AS active_users FROM activity WHERE activity_date > DATE '2020-03-02' AND activity_date <= DATE '2020-03-31' GROUP BY activity_date" },
  ],
  hints: [
    'Two steps: keep only the rows inside the 30-day window, then count users per day.',
    'Count 30 days carefully. If the window ends on March 31 and includes both ends, find the first day by counting back 29 days, not 30.',
    'GROUP BY activity_date and use COUNT(DISTINCT user_id). One user can have many rows on the same day and must count once.',
  ],
  approach: para(
    '**Trigger:** "daily / weekly active users", "distinct things per day". **Pattern:** filter the date window, `GROUP BY` the date, `COUNT(DISTINCT user_id)`. **Complexity:** one scan.',
    'The fence-post error is the real test. A window of 30 days that includes both ends starts **29** days before the last day: 2020-03-31 minus 29 days is 2020-03-02. Count the days on your fingers for a 3-day window if you doubt it.',
    '`COUNT(*)` would count rows, and a single user scrolling five times would look like five users.'
  ),
  cases: [
    {
      tables: [activity([
        [1, 1, '2020-03-10', 'open_session'], [1, 1, '2020-03-10', 'scroll_down'], [1, 1, '2020-03-10', 'end_session'],
        [2, 4, '2020-03-10', 'open_session'], [2, 4, '2020-03-11', 'send_message'], [3, 5, '2020-03-11', 'open_session'],
        [4, 6, '2020-02-20', 'open_session'], [5, 7, '2020-04-02', 'open_session'],
      ])],
      expect: out(cols, [['2020-03-10', 2], ['2020-03-11', 2]]),
    },
    {
      hidden: true,
      tables: [activity([
        [1, 1, '2020-03-02', 'open_session'], [2, 2, '2020-03-31', 'open_session'], [3, 3, '2020-03-01', 'open_session'], [4, 4, '2020-04-01', 'open_session'],
      ])],
      expect: out(cols, [['2020-03-02', 1], ['2020-03-31', 1]]),
    },
    { hidden: true, tables: [activity([[1, 1, '2019-12-31', 'open_session']])], expect: out(cols, []) },
    {
      hidden: true,
      tables: [activity([[1, 1, '2020-03-15', 'open_session'], [1, 2, '2020-03-15', 'open_session'], [1, 3, '2020-03-16', 'open_session'], [2, 4, '2020-03-15', 'send_message']])],
      expect: out(cols, [['2020-03-15', 2], ['2020-03-16', 1]]),
    },
  ],
};
