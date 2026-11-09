const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const stocks = (rows) => tbl('stocks', 'stock_name VARCHAR, operation VARCHAR, operation_day INT, price INT', rows);
const cols = ['stock_name', 'capital_gain_loss'];

module.exports = {
  id: 'sql-d32-capital-gain-loss', day: 32, lc: 'capital-gainloss', anchor: 'LC 1393', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Capital Gain/Loss', kind: 'select', ordered: false,
  schema: ['stocks(stock_name VARCHAR, operation VARCHAR, operation_day INT, price INT)   -- operation is \'Buy\' or \'Sell\'; (stock_name, operation_day) is unique'],
  statement: para(
    'Each row of `stocks` is one trade of one stock: a `Buy` or a `Sell`, on a given day, at a given `price`.',
    'A stock is bought and sold in turn: the first trade of a stock is a `Buy`, and every `Buy` is followed later by a `Sell`. So the trades of one stock always pair up.',
    'For each stock, return its **capital gain or loss**: everything it sold for, minus everything it was bought for. Return `stock_name` and `capital_gain_loss`. Rows can come in any order.'
  ),
  starter: '-- Return: stock_name, capital_gain_loss\nSELECT\n',
  solution: [
    'SELECT stock_name,',
    "       SUM(CASE WHEN operation = 'Sell' THEN price ELSE -price END) AS capital_gain_loss",
    'FROM stocks',
    'GROUP BY stock_name',
  ].join('\n'),
  mutants: [
    { name: 'adds every price, buys included', code: 'SELECT stock_name, SUM(price) AS capital_gain_loss FROM stocks GROUP BY stock_name' },
    { name: 'signs reversed: buys minus sells', code: "SELECT stock_name, SUM(CASE WHEN operation = 'Buy' THEN price ELSE -price END) AS capital_gain_loss FROM stocks GROUP BY stock_name" },
    { name: 'counts the sells and ignores the buys', code: "SELECT stock_name, SUM(CASE WHEN operation = 'Sell' THEN price ELSE 0 END) AS capital_gain_loss FROM stocks GROUP BY stock_name" },
    { name: 'compares the highest sell with the lowest buy, so only one trade pair counts', slipsPastSamples: true, code: "SELECT stock_name, MAX(CASE WHEN operation = 'Sell' THEN price END) - MIN(CASE WHEN operation = 'Buy' THEN price END) AS capital_gain_loss FROM stocks GROUP BY stock_name" },
  ],
  hints: [
    'Think of each Buy as money going out and each Sell as money coming in. The answer per stock is the sum of those signed amounts.',
    'A CASE expression can turn price into +price for a Sell and -price for a Buy.',
    'SUM that signed value and GROUP BY stock_name. You do not need to match each Buy with its Sell.',
  ],
  approach: para(
    '**Trigger:** "net", "profit", "balance": two kinds of rows that push a total in opposite directions. **Pattern:** conditional aggregation, `SUM(CASE WHEN ... THEN x ELSE -x END)`. **Complexity:** one pass.',
    'You never need to pair a `Buy` with its `Sell`. Because every buy is eventually sold, "sells minus buys" over all rows equals the sum of each pair\'s difference.',
    'The `MAX(sell) - MIN(buy)` shortcut is wrong the moment a stock is traded more than once.'
  ),
  cases: [
    {
      tables: [stocks([['Acme', 'Buy', 1, 10], ['Acme', 'Sell', 2, 15], ['Zed', 'Buy', 1, 50], ['Zed', 'Sell', 3, 40]])],
      expect: out(cols, [['Acme', 5], ['Zed', -10]]),
    },
    {
      hidden: true,
      tables: [stocks([['A', 'Buy', 1, 5], ['A', 'Sell', 2, 9], ['A', 'Buy', 3, 3], ['A', 'Sell', 4, 4], ['A', 'Buy', 5, 20], ['A', 'Sell', 6, 21]])],
      expect: out(cols, [['A', 6]]),
    },
    { hidden: true, tables: [stocks([['Low', 'Buy', 1, 100], ['Low', 'Sell', 9, 1]])], expect: out(cols, [['Low', -99]]) },
    { hidden: true, tables: [stocks([['B', 'Buy', 2, 7], ['B', 'Sell', 4, 7], ['C', 'Buy', 1, 1], ['C', 'Sell', 2, 100]])], expect: out(cols, [['B', 0], ['C', 99]]) },
  ],
};
