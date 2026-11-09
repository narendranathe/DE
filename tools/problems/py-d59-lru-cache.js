const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d59-lru-cache', day: 59, lc: 'lru-cache', anchor: 'LC 146', cat: 'PRACTICE', bounty: 20, lang: 'python',
  title: 'LRU Cache', kind: 'class', cls: 'LRUCache', cmp: 'eq',
  signature: 'class LRUCache: __init__(capacity), get(key), put(key, value)',
  statement: para(
    'Design a cache that holds at most `capacity` entries and throws away the **least recently used** one when it is full.',
    '- `get(key)` returns the value for `key`, or `-1` if it is not in the cache. A successful `get` counts as using the key.\n- `put(key, value)` stores the value. If `key` is already there, update its value. Either way, the key now counts as the most recently used. If the cache is over capacity after the put, remove the least recently used key.',
    'Both methods must run in **O(1)** on average. Name your class `LRUCache`. The checker builds one, calls the methods in order, and compares what each call returns. `put` returns nothing, so it is expected to return `None`.'
  ),
  starter: 'class LRUCache:\n    def __init__(self, capacity):\n        pass\n\n    def get(self, key):\n        pass\n\n    def put(self, key, value):\n        pass\n',
  solution: [
    'from collections import OrderedDict',
    '',
    'class LRUCache:',
    '    def __init__(self, capacity):',
    '        self.capacity = capacity',
    '        self.data = OrderedDict()          # oldest use first, newest use last',
    '',
    '    def get(self, key):',
    '        if key not in self.data:',
    '            return -1',
    '        self.data.move_to_end(key)         # reading counts as using',
    '        return self.data[key]',
    '',
    '    def put(self, key, value):',
    '        if key in self.data:',
    '            self.data.move_to_end(key)',
    '        self.data[key] = value',
    '        if len(self.data) > self.capacity:',
    '            self.data.popitem(last=False)  # drop the least recently used',
  ].join('\n') + '\n',
  mutants: [
    { name: 'reading a key does not count as using it (first in, first out)', code: 'from collections import OrderedDict\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.cap = capacity\n        self.d = OrderedDict()\n    def get(self, key):\n        return self.d.get(key, -1)\n    def put(self, key, value):\n        self.d[key] = value\n        if len(self.d) > self.cap:\n            self.d.popitem(last=False)\n' },
    { name: 'removes the most recently used key instead of the least', code: 'from collections import OrderedDict\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.cap = capacity\n        self.d = OrderedDict()\n    def get(self, key):\n        if key not in self.d:\n            return -1\n        self.d.move_to_end(key)\n        return self.d[key]\n    def put(self, key, value):\n        if key in self.d:\n            self.d.move_to_end(key)\n        self.d[key] = value\n        if len(self.d) > self.cap:\n            self.d.popitem(last=True)\n' },
    { name: 'holds one entry too many', code: 'from collections import OrderedDict\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.cap = capacity\n        self.d = OrderedDict()\n    def get(self, key):\n        if key not in self.d:\n            return -1\n        self.d.move_to_end(key)\n        return self.d[key]\n    def put(self, key, value):\n        if key in self.d:\n            self.d.move_to_end(key)\n        self.d[key] = value\n        if len(self.d) > self.cap + 1:\n            self.d.popitem(last=False)\n' },
    { name: 'putting an existing key changes its value but not its place in the order', slipsPastSamples: true, code: 'from collections import OrderedDict\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.cap = capacity\n        self.d = OrderedDict()\n    def get(self, key):\n        if key not in self.d:\n            return -1\n        self.d.move_to_end(key)\n        return self.d[key]\n    def put(self, key, value):\n        if key in self.d:\n            self.d[key] = value\n            return\n        self.d[key] = value\n        if len(self.d) > self.cap:\n            self.d.popitem(last=False)\n' },
    { name: 'putting an existing key keeps the old value', slipsPastSamples: true, code: 'from collections import OrderedDict\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.cap = capacity\n        self.d = OrderedDict()\n    def get(self, key):\n        if key not in self.d:\n            return -1\n        self.d.move_to_end(key)\n        return self.d[key]\n    def put(self, key, value):\n        if key in self.d:\n            self.d.move_to_end(key)\n            return\n        self.d[key] = value\n        if len(self.d) > self.cap:\n            self.d.popitem(last=False)\n' },
  ],
  hints: [
    'You need two things at once: look up a key fast, and know which key was used longest ago. A plain dict gives the first. Something has to remember the order.',
    'Keep the keys in order of use, oldest first and newest last. Every get or put moves its key to the newest end. The key at the oldest end is the one to remove.',
    'Python\'s collections.OrderedDict does exactly this: move_to_end(key) marks a key as newest, and popitem(last=False) removes the oldest. Do not forget that put on an existing key also makes it the newest.',
  ],
  approach: para(
    '**Trigger:** "evict the least recently used", "a cache with a size limit". **Pattern:** a hash map plus an **ordering of use**. Inside, that is a hash map pointing into a doubly linked list. `OrderedDict` packages both. **Complexity:** O(1) per call.',
    'A **hit** (`get`) is a use, so it moves the key to the newest end. Without that, the cache becomes first-in-first-out, a different and simpler policy.',
    'Three places to slip: `put` on a key that already exists (update the value **and** refresh its position), evicting only when you are over capacity, and `get` on a missing key (return `-1` and change nothing).',
    'In an interview you may be asked to build the linked list by hand. The idea is the same: a dummy head and tail, and O(1) unlink and relink.'
  ),
  cases: [
    {
      ops: ['LRUCache', 'put', 'put', 'get', 'put', 'get', 'put', 'get', 'get', 'get'],
      args: [[2], [1, 10], [2, 20], [1], [3, 30], [2], [4, 40], [1], [3], [4]],
      expect: [null, null, null, 10, null, -1, null, -1, 30, 40],
    },
    { ops: ['LRUCache', 'get', 'put', 'get'], args: [[3], [9], [9, 90], [9]], expect: [null, -1, null, 90] },
    {
      hidden: true,
      ops: ['LRUCache', 'put', 'put', 'put', 'put', 'get', 'get', 'get'],
      args: [[2], [1, 1], [2, 2], [1, 100], [3, 3], [2], [1], [3]],
      expect: [null, null, null, null, null, -1, 100, 3],
    },
    {
      hidden: true,
      ops: ['LRUCache', 'put', 'put', 'get', 'get', 'put', 'get', 'get'],
      args: [[1], [1, 1], [2, 2], [1], [2], [3, 3], [2], [3]],
      expect: [null, null, null, -1, 2, null, -1, 3],
    },
    {
      hidden: true,
      ops: ['LRUCache', 'put', 'put', 'put', 'get', 'put', 'get', 'get', 'get', 'get'],
      args: [[3], [1, 1], [2, 2], [3, 3], [1], [4, 4], [2], [3], [1], [4]],
      expect: [null, null, null, null, 1, null, -1, 3, 1, 4],
    },
  ],
};
