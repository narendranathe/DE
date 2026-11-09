const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d61-time-based-key-value-store', day: 61, lc: 'time-based-key-value-store', anchor: 'LC 981', cat: 'PRACTICE', bounty: 20, lang: 'python',
  title: 'Time Based Key-Value Store', kind: 'class', cls: 'TimeMap', cmp: 'eq',
  signature: 'class TimeMap: set(key, value, timestamp), get(key, timestamp)',
  statement: para(
    'Build a store where each key can hold **several values over time**.',
    '- `set(key, value, timestamp)` saves `value` for `key` at that moment.\n- `get(key, timestamp)` returns the value that `key` had **at that moment**: the one saved with the **largest timestamp that is less than or equal to** `timestamp`. If the key has nothing saved at or before that time (or has never been set), return the empty string `""`.',
    'For one key, the `set` calls arrive with **increasing timestamps**. Name your class `TimeMap`. The checker builds one, calls the methods in order, and compares what each call returns. `set` returns nothing, so it is expected to return `None`.'
  ),
  starter: 'class TimeMap:\n    def __init__(self):\n        pass\n\n    def set(self, key, value, timestamp):\n        pass\n\n    def get(self, key, timestamp):\n        pass\n',
  solution: [
    'from bisect import bisect_right',
    '',
    'class TimeMap:',
    '    def __init__(self):',
    '        self.times = {}      # key -> timestamps, already in increasing order',
    '        self.values = {}     # key -> values, in the same order',
    '',
    '    def set(self, key, value, timestamp):',
    '        self.times.setdefault(key, []).append(timestamp)',
    '        self.values.setdefault(key, []).append(value)',
    '',
    '    def get(self, key, timestamp):',
    '        times = self.times.get(key)',
    '        if not times:',
    '            return ""',
    '        i = bisect_right(times, timestamp)     # how many saves happened at or before this time',
    '        return self.values[key][i - 1] if i else ""',
  ].join('\n') + '\n',
  mutants: [
    { name: 'only finds a value saved at exactly that timestamp', code: 'class TimeMap:\n    def __init__(self):\n        self.d = {}\n    def set(self, key, value, timestamp):\n        self.d[(key, timestamp)] = value\n    def get(self, key, timestamp):\n        return self.d.get((key, timestamp), "")\n' },
    { name: 'off by one: a save at exactly the asked time is skipped', code: 'from bisect import bisect_left\n\nclass TimeMap:\n    def __init__(self):\n        self.t = {}\n        self.v = {}\n    def set(self, key, value, timestamp):\n        self.t.setdefault(key, []).append(timestamp)\n        self.v.setdefault(key, []).append(value)\n    def get(self, key, timestamp):\n        ts = self.t.get(key)\n        if not ts:\n            return ""\n        i = bisect_left(ts, timestamp)\n        return self.v[key][i - 1] if i else ""\n' },
    { name: 'ignores the timestamp and returns the latest value', code: 'class TimeMap:\n    def __init__(self):\n        self.d = {}\n    def set(self, key, value, timestamp):\n        self.d[key] = value\n    def get(self, key, timestamp):\n        return self.d.get(key, "")\n' },
    { name: 'returns None instead of an empty string when there is nothing', code: 'from bisect import bisect_right\n\nclass TimeMap:\n    def __init__(self):\n        self.t = {}\n        self.v = {}\n    def set(self, key, value, timestamp):\n        self.t.setdefault(key, []).append(timestamp)\n        self.v.setdefault(key, []).append(value)\n    def get(self, key, timestamp):\n        ts = self.t.get(key)\n        if not ts:\n            return None\n        i = bisect_right(ts, timestamp)\n        return self.v[key][i - 1] if i else None\n' },
    { name: 'keeps one history for all keys', slipsPastSamples: true, code: 'from bisect import bisect_right\n\nclass TimeMap:\n    def __init__(self):\n        self.t = []\n        self.v = []\n    def set(self, key, value, timestamp):\n        self.t.append(timestamp)\n        self.v.append(value)\n    def get(self, key, timestamp):\n        i = bisect_right(self.t, timestamp)\n        return self.v[i - 1] if i else ""\n' },
  ],
  hints: [
    'For each key, you store a growing list of (timestamp, value). A get asks: which entry is the last one at or before this time?',
    'Because the timestamps for a key only go up, the list is already sorted. That means you can use binary search instead of scanning.',
    'Keep a list of timestamps and a list of values for each key. Use bisect_right(times, t): it returns how many timestamps are <= t. If that count is 0, return "". Otherwise the answer is the value at index count - 1.',
  ],
  approach: para(
    '**Trigger:** "the value as of a point in time", "latest entry not after X". **Pattern:** a dict of **sorted lists** and a **binary search**. **Complexity:** O(1) per `set`, O(log n) per `get`.',
    '`bisect_right` gives the position just after every entry that is `<=` the asked time, so the entry before that position is the last one that qualifies. With `bisect_left`, an entry saved at exactly the asked time would be skipped.',
    'Keep one history **per key**. A single shared list would answer for the wrong key.',
    'Return `""`, not `None`, when nothing qualifies. That covers a key never set, and a time before the key\'s first save.'
  ),
  cases: [
    {
      ops: ['TimeMap', 'set', 'get', 'get', 'get', 'set', 'get', 'get'],
      args: [[], ['k', 'v1', 5], ['k', 5], ['k', 4], ['k', 9], ['k', 'v2', 8], ['k', 7], ['k', 100]],
      expect: [null, null, 'v1', '', 'v1', null, 'v1', 'v2'],
    },
    { ops: ['TimeMap', 'get'], args: [[], ['nope', 1]], expect: [null, ''] },
    {
      hidden: true,
      ops: ['TimeMap', 'set', 'set', 'get', 'get', 'get'],
      args: [[], ['a', 'x', 1], ['b', 'y', 2], ['a', 2], ['b', 1], ['b', 2]],
      expect: [null, null, null, 'x', '', 'y'],
    },
    {
      hidden: true,
      ops: ['TimeMap', 'set', 'set', 'set', 'set', 'get', 'get', 'get', 'get', 'get', 'get', 'get'],
      args: [[], ['k', 'a', 1], ['k', 'b', 3], ['k', 'c', 5], ['k', 'd', 7], ['k', 0], ['k', 1], ['k', 2], ['k', 3], ['k', 6], ['k', 7], ['k', 8]],
      expect: [null, null, null, null, null, '', 'a', 'a', 'b', 'c', 'd', 'd'],
    },
  ],
};
