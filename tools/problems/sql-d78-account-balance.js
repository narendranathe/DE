const { tbl, D, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const transactions = (rows) => tbl('transactions', 'account_id INT, day DATE, type VARCHAR, amount INT', rows.map((r) => [r[0], D(r[1]), r[2], r[3]]));
const cols = ['account_id', 'day', 'balance'];

// Appears only inside the day 78 mock set, so there is no checkbox of its own: bounty 0, no category.
module.exports = {
  id: 'sql-d78-account-balance', day: 78, lc: 'account-balance', bounty: 0, lang: 'sql',
  title: 'Account Balance', kind: 'select', ordered: true,
  schema: ["transactions(account_id INT, day DATE, type VARCHAR, amount INT)   -- type is 'Deposit' or 'Withdraw'; (account_id, day) is unique"],
  statement: para(
    'Every row of `transactions` is one deposit or one withdrawal on one account, on one day. An account has at most one transaction per day, and it never goes below zero.',
    'For every transaction, report the account\'s **balance at the end of that day**: all earlier deposits minus all earlier withdrawals, including the transaction of that day.',
    'Return `account_id`, `day` and `balance`, ordered by `account_id` and then `day`.'
  ),
  starter: '-- Return: account_id, day, balance  (ordered by account_id, day)\nSELECT\n',
  solution: [
    'SELECT account_id,',
    '       day,',
    "       SUM(CASE WHEN type = 'Deposit' THEN amount ELSE -amount END)",
    '         OVER (PARTITION BY account_id ORDER BY day) AS balance',
    'FROM transactions',
    'ORDER BY account_id, day',
  ].join('\n'),
  mutants: [
    { name: 'one balance across all accounts', code: "SELECT account_id, day, SUM(CASE WHEN type = 'Deposit' THEN amount ELSE -amount END) OVER (ORDER BY account_id, day) AS balance FROM transactions ORDER BY account_id, day" },
    { name: 'withdrawals are added', code: 'SELECT account_id, day, SUM(amount) OVER (PARTITION BY account_id ORDER BY day) AS balance FROM transactions ORDER BY account_id, day' },
    { name: 'every row shows the final balance, not the running one', code: "SELECT account_id, day, SUM(CASE WHEN type = 'Deposit' THEN amount ELSE -amount END) OVER (PARTITION BY account_id) AS balance FROM transactions ORDER BY account_id, day" },
  ],
  hints: [
    'This is a running total again, but the amounts have two signs: deposits go up and withdrawals go down.',
    'A CASE expression turns amount into +amount for a Deposit and -amount for a Withdraw.',
    'SUM(that signed amount) OVER (PARTITION BY account_id ORDER BY day) gives the balance after each transaction, separately for each account.',
  ],
  approach: para(
    '**Trigger:** "balance after each transaction", "running total with ups and downs". **Pattern:** signed amount from `CASE`, then `SUM(...) OVER (PARTITION BY account ORDER BY day)`. **Complexity:** one sort.',
    'This is the day 7 question with a sign. The idea is the same: one window, a partition for each account, an order for time.',
    'Without `PARTITION BY`, one account\'s money flows into the next. Without `ORDER BY` in the window, each row shows the final balance instead of the balance at that moment.'
  ),
  cases: [
    {
      tables: [transactions([[1, '2021-05-01', 'Deposit', 100], [1, '2021-05-03', 'Withdraw', 30], [1, '2021-05-09', 'Deposit', 5], [2, '2021-05-02', 'Deposit', 50], [2, '2021-05-04', 'Withdraw', 50]])],
      expect: out(cols, [[1, '2021-05-01', 100], [1, '2021-05-03', 70], [1, '2021-05-09', 75], [2, '2021-05-02', 50], [2, '2021-05-04', 0]]),
    },
    { hidden: true, tables: [transactions([[9, '2022-01-01', 'Deposit', 10]])], expect: out(cols, [[9, '2022-01-01', 10]]) },
    {
      hidden: true,
      tables: [transactions([[3, '2022-02-03', 'Withdraw', 20], [3, '2022-02-01', 'Deposit', 60], [3, '2022-02-02', 'Deposit', 10], [1, '2022-02-01', 'Deposit', 1]])],
      expect: out(cols, [[1, '2022-02-01', 1], [3, '2022-02-01', 60], [3, '2022-02-02', 70], [3, '2022-02-03', 50]]),
    },
    { hidden: true, tables: [transactions([])], expect: out(cols, []) },
  ],
};
