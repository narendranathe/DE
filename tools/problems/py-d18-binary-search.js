const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d18-binary-search', day: 18, anchor: 'Binary Search', cat: 'BUILD', bounty: 10, lang: 'python',
  title: 'Binary Search', kind: 'func', fn: 'search', cmp: 'eq',
  signature: 'def search(nums: list[int], target: int) -> int',
  statement: para(
    '`nums` is a list of **distinct integers sorted from smallest to largest**. Return the index of `target` in `nums`, or `-1` if it is not there.',
    'Your solution should take O(log n) time.'
  ),
  starter: 'def search(nums, target):\n    # Return the index of target, or -1.\n    pass\n',
  solution: [
    'def search(nums, target):',
    '    lo, hi = 0, len(nums) - 1',
    '    while lo <= hi:',
    '        mid = (lo + hi) // 2',
    '        if nums[mid] == target:',
    '            return mid',
    '        if nums[mid] < target:',
    '            lo = mid + 1',
    '        else:',
    '            hi = mid - 1',
    '    return -1',
  ].join('\n') + '\n',
  mutants: [
    { name: 'stops one step early with lo < hi', slipsPastSamples: true, code: 'def search(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n' },
    { name: 'returns True or False instead of an index', code: 'def search(nums, target):\n    return target in nums\n' },
    { name: 'returns the position where the value would go', code: 'import bisect\n\ndef search(nums, target):\n    return bisect.bisect_left(nums, target)\n' },
    { name: 'always returns -1', code: 'def search(nums, target):\n    return -1\n' },
  ],
  hints: [
    'Because the list is sorted, one comparison with the middle element lets you throw away half of what is left.',
    'Keep two indices, lo and hi, for the part that could still hold the target. Compare with nums[mid]: equal means found, smaller means search right, larger means search left.',
    'When you move, skip mid itself (mid + 1 or mid - 1). Loop while lo <= hi, so a range with one element still gets checked.',
  ],
  approach: para(
    '**Trigger:** a sorted sequence and a "find or locate" question. **Pattern:** binary search that keeps an invariant: if the target exists, it is inside `[lo, hi]`. **Complexity:** O(log n) time, O(1) space.',
    'The loop condition is where bugs live. With `hi = len(nums) - 1` (inclusive), use `lo <= hi`. With `lo < hi` a one-element list is never examined.'
  ),
  cases: [
    { args: [[-1, 0, 3, 5, 9, 12], 9], expect: 4 },
    { args: [[-1, 0, 3, 5, 9, 12], 2], expect: -1 },
    { args: [[5], 5], hidden: true, expect: 0 },
    { args: [[5], -5], hidden: true, expect: -1 },
    { args: [[1, 3, 5, 7, 9], 1], hidden: true, expect: 0 },
    { args: [[1, 3, 5, 7, 9], 9], hidden: true, expect: 4 },
    { args: [[2, 4], 4], hidden: true, expect: 1 },
    { args: [[1, 2, 3, 4], 0], hidden: true, expect: -1 },
  ],
};
