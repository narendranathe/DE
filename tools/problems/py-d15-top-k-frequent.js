const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d15-top-k-frequent', day: 15, lc: 'top-k-frequent-elements', anchor: 'Top K Frequent Elements', cat: 'BUILD', bounty: 10, lang: 'python',
  title: 'Top K Frequent Elements', kind: 'func', fn: 'top_k_frequent', cmp: 'unordered',
  signature: 'def top_k_frequent(nums: list[int], k: int) -> list[int]',
  statement: para(
    'Given a list of integers `nums` and an integer `k`, return the `k` values that appear **most often**. Return them in any order.',
    'The answer is unique: there is never a tie for the last place in the top `k`.'
  ),
  starter: 'def top_k_frequent(nums, k):\n    # Return the k most frequent values.\n    pass\n',
  solution: [
    'from collections import Counter',
    '',
    'def top_k_frequent(nums, k):',
    '    counts = Counter(nums)',
    '    return [value for value, _ in counts.most_common(k)]',
  ].join('\n') + '\n',
  mutants: [
    { name: 'returns the first k different values it sees', slipsPastSamples: true, code: 'def top_k_frequent(nums, k):\n    seen = []\n    for x in nums:\n        if x not in seen:\n            seen.append(x)\n    return seen[:k]\n' },
    { name: 'returns the k largest values', code: 'def top_k_frequent(nums, k):\n    return sorted(set(nums), reverse=True)[:k]\n' },
    { name: 'returns the counts instead of the values', code: 'from collections import Counter\n\ndef top_k_frequent(nums, k):\n    return [c for _, c in Counter(nums).most_common(k)]\n' },
    { name: 'picks the k least frequent values', code: 'from collections import Counter\n\ndef top_k_frequent(nums, k):\n    return [v for v, _ in sorted(Counter(nums).items(), key=lambda p: p[1])[:k]]\n' },
  ],
  hints: [
    'Two steps: count how often each value appears, then pick the k biggest counts.',
    'collections.Counter does the counting. For the picking, you can sort the counts, use a heap of size k, or bucket the values by their count.',
    'Counter.most_common(k) returns the k pairs with the biggest counts. Take the value from each pair.',
  ],
  approach: para(
    '**Trigger:** "top k by frequency". **Pattern:** a counter, then a selection step. **Complexity:** sorting the counts is O(n log n); a min-heap of size k is O(n log k); bucket sort by count is O(n).',
    'Give both complexities when you narrate. Bucket sort works because a count can never be more than `len(nums)`: make a list of that size, put each value in the slot for its count, and read from the high end.'
  ),
  cases: [
    { args: [[1, 1, 1, 2, 2, 3], 2], expect: [1, 2] },
    { args: [[1], 1], expect: [1] },
    { args: [[4, 4, 4, 4, 5, 5, 5, 6, 6, 7], 3], hidden: true, expect: [4, 5, 6] },
    { args: [[-1, -1, -2, -2, -2, 3], 1], hidden: true, expect: [-2] },
    { args: [[5, 3, 3, 5, 5, 2, 2, 2, 2, 9], 2], hidden: true, expect: [2, 5] },
    { args: [[1, 2], 2], hidden: true, expect: [1, 2] },
  ],
};
