const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d51-subarray-sum-equals-k', day: 51, lc: 'subarray-sum-equals-k', anchor: 'LC 560', cat: 'PRACTICE', bounty: 20, lang: 'python',
  title: 'Subarray Sum Equals K', kind: 'func', fn: 'subarray_sum', cmp: 'eq',
  signature: 'def subarray_sum(nums: list[int], k: int) -> int',
  statement: para(
    'Count the **contiguous subarrays** of `nums` whose numbers add up to `k`. A subarray is a run of neighbouring elements, and it needs at least one element.',
    'The numbers can be negative or zero, so a longer subarray is not always bigger. Two subarrays at different positions count separately even if they hold the same values.',
    'Example: `[1, 2, 3]` with `k = 3` has two such subarrays: `[1, 2]` and `[3]`.'
  ),
  starter: 'def subarray_sum(nums, k):\n    # Return how many contiguous subarrays add up to k.\n    pass\n',
  solution: [
    'def subarray_sum(nums, k):',
    '    seen = {0: 1}               # prefix sum -> how many times it has happened (the empty prefix counts)',
    '    total = count = 0',
    '    for x in nums:',
    '        total += x              # sum of everything up to and including x',
    '        count += seen.get(total - k, 0)    # earlier prefixes that leave exactly k',
    '        seen[total] = seen.get(total, 0) + 1',
    '    return count',
  ].join('\n') + '\n',
  mutants: [
    { name: 'forgets the empty prefix, so subarrays that start at the front are missed', code: 'def subarray_sum(nums, k):\n    seen = {}\n    total = count = 0\n    for x in nums:\n        total += x\n        count += seen.get(total - k, 0)\n        seen[total] = seen.get(total, 0) + 1\n    return count\n' },
    { name: 'a sliding window that assumes every number is positive', slipsPastSamples: true, code: 'def subarray_sum(nums, k):\n    left = cur = count = 0\n    for right, x in enumerate(nums):\n        cur += x\n        while cur > k and left <= right:\n            cur -= nums[left]\n            left += 1\n        if cur == k:\n            count += 1\n    return count\n' },
    { name: 'says whether one exists, not how many', code: 'def subarray_sum(nums, k):\n    for i in range(len(nums)):\n        s = 0\n        for j in range(i, len(nums)):\n            s += nums[j]\n            if s == k:\n                return 1\n    return 0\n' },
    { name: 'counts each prefix sum once, so repeated prefixes are lost', code: 'def subarray_sum(nums, k):\n    seen = {0}\n    total = count = 0\n    for x in nums:\n        total += x\n        if total - k in seen:\n            count += 1\n        seen.add(total)\n    return count\n' },
  ],
  hints: [
    'Brute force tries every start and end, which is O(n^2). Think about what the sum of a subarray is in terms of running totals (prefix sums).',
    'The subarray from i+1 to j sums to prefix[j] - prefix[i]. You want that to equal k, so for each j you want to know how many earlier prefixes equal prefix[j] - k.',
    'Keep a dict that counts how many times each prefix sum has appeared, starting with {0: 1} for the empty prefix. At each step, add seen[total - k] to the answer, then record the new total.',
  ],
  approach: para(
    '**Trigger:** "count subarrays with a given sum", especially when numbers can be negative. **Pattern:** **prefix sums + a hashmap of counts**. **Complexity:** O(n) time, O(n) space.',
    'A sliding window only works when every number is positive, because then the sum grows as the window grows. With negatives or zeros, the sum can go down again, and the window loses answers.',
    'The `{0: 1}` seed stands for the empty prefix. Without it, a subarray that starts at index 0 has nothing to subtract and is never counted.',
    'Store **counts**, not a set. Two earlier positions with the same prefix sum make two different subarrays.'
  ),
  cases: [
    { args: [[1, 1, 1], 2], expect: 2 },
    { args: [[1, 2, 3], 3], expect: 2 },
    { args: [[1, -1, 0], 0], hidden: true, expect: 3 },
    { args: [[0, 0, 0], 0], hidden: true, expect: 6 },
    { args: [[2, -1, 2, 1, -2, 3], 3], hidden: true, expect: 4 },
    { args: [[5], 5], hidden: true, expect: 1 },
    { args: [[5], 3], hidden: true, expect: 0 },
    { args: [[], 0], hidden: true, expect: 0 },
    { args: [[1, 2, 1, 2, 1], 3], hidden: true, expect: 4 },
  ],
};
