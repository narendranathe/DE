const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d18-search-rotated-array', day: 18, anchor: 'Search in Rotated Sorted Array', cat: 'BUILD', bounty: 10, lang: 'python',
  title: 'Search in Rotated Sorted Array', kind: 'func', fn: 'search_rotated', cmp: 'eq',
  signature: 'def search_rotated(nums: list[int], target: int) -> int',
  statement: para(
    'A sorted list of **distinct** integers was rotated at some point. For example `[0, 1, 2, 4, 5, 6, 7]` can become `[4, 5, 6, 7, 0, 1, 2]`. It may also be rotated zero times.',
    'Return the index of `target`, or `-1` if it is not in the list. Your solution should take O(log n) time.'
  ),
  starter: 'def search_rotated(nums, target):\n    # Return the index of target in the rotated list, or -1.\n    pass\n',
  solution: [
    'def search_rotated(nums, target):',
    '    lo, hi = 0, len(nums) - 1',
    '    while lo <= hi:',
    '        mid = (lo + hi) // 2',
    '        if nums[mid] == target:',
    '            return mid',
    '        if nums[lo] <= nums[mid]:            # the left half is sorted',
    '            if nums[lo] <= target < nums[mid]:',
    '                hi = mid - 1',
    '            else:',
    '                lo = mid + 1',
    '        else:                                # the right half is sorted',
    '            if nums[mid] < target <= nums[hi]:',
    '                lo = mid + 1',
    '            else:',
    '                hi = mid - 1',
    '    return -1',
  ].join('\n') + '\n',
  mutants: [
    { name: 'plain binary search that ignores the rotation', code: 'def search_rotated(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n' },
    { name: 'tests "left half is sorted" with < instead of <=', slipsPastSamples: true, code: 'def search_rotated(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[lo] < nums[mid]:\n            if nums[lo] <= target < nums[mid]:\n                hi = mid - 1\n            else:\n                lo = mid + 1\n        else:\n            if nums[mid] < target <= nums[hi]:\n                lo = mid + 1\n            else:\n                hi = mid - 1\n    return -1\n' },
    { name: 'only searches the left half of the list', code: 'def search_rotated(nums, target):\n    half = nums[: len(nums) // 2 + 1]\n    return half.index(target) if target in half else -1\n' },
    { name: 'always returns -1', code: 'def search_rotated(nums, target):\n    return -1\n' },
  ],
  hints: [
    'Plain binary search breaks because the whole list is not sorted. But after you pick a middle, at least one of the two halves is still sorted.',
    'Compare nums[lo] with nums[mid]. If nums[lo] <= nums[mid], the left half is sorted. Otherwise the right half is.',
    'In the sorted half you can tell for sure whether the target is inside it by comparing with its two ends. If it is, search that half. If not, search the other one.',
  ],
  approach: para(
    '**Trigger:** "sorted, but rotated" with an O(log n) requirement. **Pattern:** binary search that first asks "which half is sorted?" and then "is the target in that half?". **Complexity:** O(log n) time, O(1) space.',
    'Use `<=` when you test whether the left half is sorted. With two elements, `mid` equals `lo`, the left half is that single element, and it is sorted. A strict `<` sends you the wrong way on `[3, 1]`.'
  ),
  cases: [
    { args: [[4, 5, 6, 7, 0, 1, 2], 0], expect: 4 },
    { args: [[4, 5, 6, 7, 0, 1, 2], 3], expect: -1 },
    { args: [[1], 0], expect: -1 },
    { args: [[3, 1], 1], hidden: true, expect: 1 },
    { args: [[5, 1, 3], 5], hidden: true, expect: 0 },
    { args: [[1, 3], 3], hidden: true, expect: 1 },
    { args: [[1, 2, 3, 4], 4], hidden: true, expect: 3 },
    { args: [[4, 5, 6, 7, 0, 1, 2], 6], hidden: true, expect: 2 },
    { args: [[6, 7, 0, 1, 2, 3, 4, 5], 7], hidden: true, expect: 1 },
    { args: [[2, 3, 4, 5, 6, 7, 8, 9, 1], 1], hidden: true, expect: 8 },
  ],
};
