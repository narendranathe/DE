const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d73-longest-consecutive-sequence', day: 73, lc: 'longest-consecutive-sequence', anchor: 'LC 128', cat: 'PRACTICE', bounty: 20, lang: 'python',
  title: 'Longest Consecutive Sequence', kind: 'func', fn: 'longest_consecutive', cmp: 'eq',
  signature: 'def longest_consecutive(nums: list[int]) -> int',
  statement: para(
    'Given an **unsorted** list of integers, return the length of the longest run of **consecutive values** that can be found in it. Consecutive means each value is exactly one more than the one before: `3, 4, 5, 6`.',
    'The values can sit anywhere in the list, in any order, and repeats count once. For `[9, 1, 4, 7, 3, 2, 8]`, the run `1, 2, 3, 4` has length 4, and the run `7, 8, 9` has length 3, so the answer is `4`. An empty list gives `0`.',
    'Aim for **O(n)** time. Sorting is O(n log n) and also accepted, but the point of the question is to avoid it.'
  ),
  starter: 'def longest_consecutive(nums):\n    # Return the length of the longest run of consecutive values (as in 3, 4, 5, 6).\n    pass\n',
  solution: [
    'def longest_consecutive(nums):',
    '    values = set(nums)                   # repeats count once; lookups are O(1)',
    '    best = 0',
    '    for x in values:',
    '        if x - 1 not in values:          # x starts a run: nothing just below it',
    '            end = x',
    '            while end + 1 in values:',
    '                end += 1',
    '            best = max(best, end - x + 1)',
    '    return best',
  ].join('\n') + '\n',
  mutants: [
    { name: 'takes the gap between the smallest and largest value', code: 'def longest_consecutive(nums):\n    return max(nums) - min(nums) + 1 if nums else 0\n' },
    { name: 'counts the different values', code: 'def longest_consecutive(nums):\n    return len(set(nums))\n' },
    { name: 'only looks at neighbours in the order of the list', code: 'def longest_consecutive(nums):\n    best = cur = 0\n    for i, x in enumerate(nums):\n        cur = cur + 1 if i and x == nums[i - 1] + 1 else 1\n        best = max(best, cur)\n    return best\n' },
    { name: 'sorts, but lets a repeated value break the run', slipsPastSamples: true, code: 'def longest_consecutive(nums):\n    if not nums:\n        return 0\n    nums = sorted(nums)\n    best = cur = 1\n    for a, b in zip(nums, nums[1:]):\n        cur = cur + 1 if b == a + 1 else 1\n        best = max(best, cur)\n    return best\n' },
  ],
  hints: [
    'Sorting makes runs easy to see, but costs O(n log n). Think about checking "is the next number in the list?" in O(1) instead.',
    'Put all numbers in a set. A number x starts a run when x - 1 is not in the set. Only those numbers need to be explored.',
    'From each start, walk upward with while end + 1 in values, counting steps. The answer is the longest walk. Each number is walked over at most once, so the total is O(n).',
  ],
  approach: para(
    '**Trigger:** "longest run / streak in an unsorted list" where order in the input does not matter. **Pattern:** a **set** plus **start-of-run detection**. **Complexity:** O(n) time, O(n) space.',
    'The check `x - 1 not in values` is the key. Without it you would walk the same run again from every member, and a long run would cost O(n^2).',
    'A set also removes repeats for free. In the sorting version you have to skip equal neighbours yourself, or `[1, 2, 2, 3]` breaks the run and gives 2 instead of 3.'
  ),
  cases: [
    { args: [[9, 1, 4, 7, 3, 2, 8]], expect: 4 },
    { args: [[]], expect: 0 },
    { args: [[1, 2, 2, 3]], hidden: true, expect: 3 },
    { args: [[10]], hidden: true, expect: 1 },
    { args: [[5, 5, 5]], hidden: true, expect: 1 },
    { args: [[-2, -1, 0, 1, 5, 6]], hidden: true, expect: 4 },
    { args: [[1, 3, 5, 7]], hidden: true, expect: 1 },
    { args: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], hidden: true, expect: 9 },
  ],
};
