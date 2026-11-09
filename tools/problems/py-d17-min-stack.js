const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d17-min-stack', day: 17, anchor: 'Min Stack', cat: 'BUILD', bounty: 10, lang: 'python',
  title: 'Min Stack', kind: 'class', cls: 'MinStack', cmp: 'eq',
  signature: 'class MinStack: push(val), pop(), top(), getMin()',
  statement: para(
    'Design a stack that supports `push(val)`, `pop()`, `top()` and `getMin()`. All four must run in **O(1)** time.',
    '`getMin()` returns the smallest value currently in the stack. `pop()` and `top()` are only called on a non-empty stack.',
    'Name your class `MinStack`. The checker builds one, calls the methods in order, and compares what each call returns. Methods that return nothing are expected to return `None`.'
  ),
  starter: 'class MinStack:\n    def __init__(self):\n        pass\n\n    def push(self, val):\n        pass\n\n    def pop(self):\n        pass\n\n    def top(self):\n        pass\n\n    def getMin(self):\n        pass\n',
  solution: [
    'class MinStack:',
    '    def __init__(self):',
    '        self.stack = []        # each entry is (value, smallest value at or below it)',
    '',
    '    def push(self, val):',
    '        low = min(val, self.stack[-1][1]) if self.stack else val',
    '        self.stack.append((val, low))',
    '',
    '    def pop(self):',
    '        self.stack.pop()',
    '',
    '    def top(self):',
    '        return self.stack[-1][0]',
    '',
    '    def getMin(self):',
    '        return self.stack[-1][1]',
  ].join('\n') + '\n',
  mutants: [
    { name: 'keeps one minimum that is never restored after a pop', code: 'class MinStack:\n    def __init__(self):\n        self.s = []\n        self.m = None\n    def push(self, val):\n        self.s.append(val)\n        self.m = val if self.m is None else min(self.m, val)\n    def pop(self):\n        self.s.pop()\n    def top(self):\n        return self.s[-1]\n    def getMin(self):\n        return self.m\n' },
    { name: 'tracks minimums only when strictly smaller, so equal values break it', slipsPastSamples: true, code: 'class MinStack:\n    def __init__(self):\n        self.s = []\n        self.mins = []\n    def push(self, val):\n        self.s.append(val)\n        if not self.mins or val < self.mins[-1]:\n            self.mins.append(val)\n    def pop(self):\n        v = self.s.pop()\n        if v == self.mins[-1]:\n            self.mins.pop()\n    def top(self):\n        return self.s[-1]\n    def getMin(self):\n        return self.mins[-1]\n' },
    { name: 'getMin returns the top of the stack', code: 'class MinStack:\n    def __init__(self):\n        self.s = []\n    def push(self, val):\n        self.s.append(val)\n    def pop(self):\n        self.s.pop()\n    def top(self):\n        return self.s[-1]\n    def getMin(self):\n        return self.s[-1]\n' },
  ],
  hints: [
    'min(stack) works but takes O(n). You need the minimum to be ready before anyone asks for it.',
    'When you push a value, you already know the smallest value in the stack at that moment. Store that number next to the value.',
    'Keep pairs (value, smallest so far). Pop removes the pair, so the previous smallest is automatically back on top.',
  ],
  approach: para(
    '**Trigger:** "a stack with an extra O(1) query". **Pattern:** store the answer to the query alongside each element. **Complexity:** O(1) per call, O(n) space.',
    'The minimum **so far** at each depth never changes after the push, and popping only removes the newest depth. That is why a single running minimum fails: after `pop` it still holds a value that is gone.',
    'A second stack of minimums also works. If you push to it only on strictly smaller values, equal values break it, so push on `<=`.'
  ),
  cases: [
    {
      ops: ['MinStack', 'push', 'push', 'push', 'getMin', 'pop', 'top', 'getMin'],
      args: [[], [-2], [0], [-3], [], [], [], []],
      expect: [null, null, null, null, -3, null, 0, -2],
    },
    { ops: ['MinStack', 'push', 'top', 'getMin'], args: [[], [7], [], []], expect: [null, null, 7, 7] },
    {
      hidden: true,
      ops: ['MinStack', 'push', 'push', 'push', 'getMin', 'pop', 'getMin', 'pop', 'getMin'],
      args: [[], [2], [2], [1], [], [], [], [], []],
      expect: [null, null, null, null, 1, null, 2, null, 2],
    },
    {
      hidden: true,
      ops: ['MinStack', 'push', 'push', 'getMin', 'pop', 'getMin', 'push', 'getMin'],
      args: [[], [5], [3], [], [], [], [4], []],
      expect: [null, null, null, 3, null, 5, null, 4],
    },
  ],
};
