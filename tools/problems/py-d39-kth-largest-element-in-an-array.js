const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d39-kth-largest-element-in-an-array', day: 39, lc: 'kth-largest-element-in-an-array', anchor: 'LC 215', cat: 'PRACTICE', bounty: 20, lang: 'python',
  title: 'Kth Largest Element in an Array', kind: 'func', fn: 'find_kth_largest', cmp: 'eq',
  signature: 'def find_kth_largest(nums: list[int], k: int) -> int',
  statement: para(
    'Return the **k-th largest** number in the list `nums`.',
    'Repeats count. If the list is `[5, 5, 3]`, the 1st and 2nd largest are both `5`, and the 3rd is `3`. You can assume `1 <= k <= len(nums)`.',
    'Try for something faster than sorting everything: a heap can do it in O(n log k).'
  ),
  starter: 'def find_kth_largest(nums, k):\n    # Return the k-th largest number (repeats count).\n    pass\n',
  solution: [
    'import heapq',
    '',
    'def find_kth_largest(nums, k):',
    '    heap = []                          # a min-heap holding the k largest numbers so far',
    '    for x in nums:',
    '        heapq.heappush(heap, x)',
    '        if len(heap) > k:',
    '            heapq.heappop(heap)        # drop the smallest of k + 1',
    '    return heap[0]                     # the smallest of the k largest',
  ].join('\n') + '\n',
  mutants: [
    { name: 'returns the k-th smallest', code: 'def find_kth_largest(nums, k):\n    return sorted(nums)[k - 1]\n' },
    { name: 'counts equal numbers once', code: 'def find_kth_largest(nums, k):\n    return sorted(set(nums), reverse=True)[k - 1]\n' },
    { name: 'off by one: returns the (k+1)-th largest', code: 'def find_kth_largest(nums, k):\n    return sorted(nums, reverse=True)[k]\n' },
    { name: 'returns the largest', code: 'def find_kth_largest(nums, k):\n    return max(nums)\n' },
  ],
  hints: [
    'If the list were sorted from biggest to smallest, the answer would sit at position k (counting from 1).',
    'You do not need the whole list sorted. You only need to remember the k biggest numbers.',
    'Keep a min-heap of size k. Push each number and pop whenever it grows past k. When you are done, the smallest number in the heap, heap[0], is the k-th largest.',
  ],
  approach: para(
    '**Trigger:** "k-th largest / smallest", "top k". **Pattern:** a **min-heap capped at k** for the k-th largest. **Complexity:** O(n log k) time, O(k) space. Sorting is O(n log n) and also accepted.',
    'Use a **min**-heap for "largest". It lets you throw away the smallest of the current top k, and what remains on top is the boundary: the k-th largest.',
    'Repeats count here. Putting the numbers through `set(...)` first would answer a different question: the k-th largest **distinct** value.',
    'The fastest average method is quickselect. It is O(n) on average, but it is rarely what an interview asks you to write out.'
  ),
  cases: [
    { args: [[3, 2, 1, 5, 6, 4], 2], expect: 5 },
    { args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expect: 4 },
    { args: [[1], 1], hidden: true, expect: 1 },
    { args: [[5, 5, 5], 2], hidden: true, expect: 5 },
    { args: [[-1, -2, -3], 3], hidden: true, expect: -3 },
    { args: [[7, 6, 5, 4, 3, 2, 1], 7], hidden: true, expect: 1 },
    { args: [[2, 1], 1], hidden: true, expect: 2 },
  ],
};
