const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d19-kth-largest-in-a-stream', day: 19, lc: 'kth-largest-element-in-a-stream', anchor: 'Kth Largest Element in a Stream', cat: 'BUILD', bounty: 10, lang: 'python',
  title: 'Kth Largest Element in a Stream', kind: 'class', cls: 'KthLargest', cmp: 'eq',
  signature: 'class KthLargest: __init__(k, nums), add(val)',
  statement: para(
    'Build a class that tracks the **k-th largest** number in a stream of numbers.',
    '`KthLargest(k, nums)` starts with the numbers in `nums`. `add(val)` adds one more number to the stream and returns the k-th largest number **so far**. The k-th largest counts repeats: in `[5, 5, 3]` the 2nd largest is `5`.',
    'The stream can start with fewer than `k` numbers, but by the time `add` is asked for an answer, there are at least `k` numbers. Name the class `KthLargest`. The checker builds one, calls the methods in order, and compares what each call returns. Methods that return nothing are expected to return `None`.'
  ),
  starter: 'class KthLargest:\n    def __init__(self, k, nums):\n        pass\n\n    def add(self, val):\n        # Add val to the stream and return the k-th largest number so far.\n        pass\n',
  solution: [
    'import heapq',
    '',
    'class KthLargest:',
    '    def __init__(self, k, nums):',
    '        self.k = k',
    '        self.heap = []                 # a min-heap that holds only the k largest numbers',
    '        for x in nums:',
    '            self._push(x)',
    '',
    '    def _push(self, val):',
    '        heapq.heappush(self.heap, val)',
    '        if len(self.heap) > self.k:',
    '            heapq.heappop(self.heap)   # drop the smallest of the k + 1',
    '',
    '    def add(self, val):',
    '        self._push(val)',
    '        return self.heap[0]            # the smallest of the k largest is the k-th largest',
  ].join('\n') + '\n',
  mutants: [
    { name: 'keeps every number, so the top of the heap is the smallest overall', code: 'import heapq\n\nclass KthLargest:\n    def __init__(self, k, nums):\n        self.k = k\n        self.h = list(nums)\n        heapq.heapify(self.h)\n    def add(self, val):\n        heapq.heappush(self.h, val)\n        return self.h[0]\n' },
    { name: 'keeps one number too few, so it answers with the (k-1)-th largest', code: 'import heapq\n\nclass KthLargest:\n    def __init__(self, k, nums):\n        self.k = k\n        self.h = []\n        for x in nums:\n            self._p(x)\n    def _p(self, v):\n        heapq.heappush(self.h, v)\n        while len(self.h) > max(1, self.k - 1):\n            heapq.heappop(self.h)\n    def add(self, val):\n        self._p(val)\n        return self.h[0]\n' },
    { name: 'assumes the stream already starts with k numbers', slipsPastSamples: true, code: 'import heapq\n\nclass KthLargest:\n    def __init__(self, k, nums):\n        self.k = k\n        self.h = list(nums)\n        heapq.heapify(self.h)\n        while len(self.h) > k:\n            heapq.heappop(self.h)\n    def add(self, val):\n        if val > self.h[0]:\n            heapq.heapreplace(self.h, val)\n        return self.h[0]\n' },
  ],
  hints: [
    'Sorting the whole list on every add works, but it is slow. Think about what you really need to remember: only the numbers that could ever be the k-th largest.',
    'Keep just the k largest numbers you have seen. Among them, the smallest one is exactly the k-th largest overall.',
    'A min-heap (heapq) gives the smallest item at heap[0] in O(1). Push each new number, and if the heap now holds more than k, pop once to drop the smallest.',
  ],
  approach: para(
    '**Trigger:** "k-th largest of a growing collection". **Pattern:** a **min-heap capped at size k**. **Complexity:** O(log k) per `add`, O(k) space.',
    'It feels backwards to use a **min**-heap for a **largest** question. The heap holds the k biggest numbers, and its smallest member sits on top. That member is the one at the boundary, which is the k-th largest.',
    'Build the starting state with the same push-then-trim step as `add`. Then the class also works when `nums` is shorter than `k`, or empty.'
  ),
  cases: [
    {
      ops: ['KthLargest', 'add', 'add', 'add', 'add', 'add'],
      args: [[3, [4, 5, 8, 2]], [3], [5], [10], [9], [4]],
      expect: [null, 4, 5, 5, 8, 8],
    },
    { ops: ['KthLargest', 'add', 'add'], args: [[1, [7]], [3], [9]], expect: [null, 7, 9] },
    { hidden: true, ops: ['KthLargest', 'add', 'add', 'add', 'add', 'add'], args: [[1, []], [-3], [-2], [-4], [0], [4]], expect: [null, -3, -2, -2, 0, 4] },
    { hidden: true, ops: ['KthLargest', 'add', 'add', 'add', 'add', 'add'], args: [[2, [0]], [-1], [1], [-2], [-4], [3]], expect: [null, -1, 0, 0, 0, 1] },
    { hidden: true, ops: ['KthLargest', 'add', 'add', 'add'], args: [[2, [5, 5]], [5], [6], [7]], expect: [null, 5, 5, 6] },
  ],
};
