const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d15-two-sum', day: 15, anchor: 'Two Sum', cat: 'BUILD', bounty: 10, lang: 'python',
  title: 'Two Sum', kind: 'func', fn: 'two_sum', cmp: 'unordered',
  signature: 'def two_sum(nums: list[int], target: int) -> list[int]',
  statement: para(
    'Given a list of integers `nums` and an integer `target`, return the **indices** of the two numbers that add up to `target`.',
    'Exactly one pair works. You may not use the same element twice. Return the two indices in any order.'
  ),
  starter: 'def two_sum(nums, target):\n    # Return the indices of the two numbers that add up to target.\n    pass\n',
  solution: [
    'def two_sum(nums, target):',
    '    seen = {}                      # value -> index',
    '    for i, x in enumerate(nums):',
    '        if target - x in seen:     # check before you insert',
    '            return [seen[target - x], i]',
    '        seen[x] = i',
  ].join('\n') + '\n',
  mutants: [
    { name: 'inserts before checking, so a number pairs with itself', code: 'def two_sum(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        seen[x] = i\n        if target - x in seen:\n            return [seen[target - x], i]\n' },
    { name: 'uses the same element twice', code: 'def two_sum(nums, target):\n    for i, x in enumerate(nums):\n        if target - x in nums:\n            return [i, nums.index(target - x)]\n' },
    { name: 'skips negative numbers', slipsPastSamples: true, code: 'def two_sum(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        if x < 0:\n            continue\n        if target - x in seen:\n            return [seen[target - x], i]\n        seen[x] = i\n' },
    { name: 'returns the values instead of the indices', code: 'def two_sum(nums, target):\n    seen = set()\n    for x in nums:\n        if target - x in seen:\n            return [target - x, x]\n        seen.add(x)\n' },
  ],
  hints: [
    'The slow way checks every pair. Ask what you would need to know about the earlier numbers to answer "is there a partner for this one?" in one step.',
    'For the number x you are looking at, its partner is target - x. A dict can tell you in O(1) whether you have already seen that value, and where.',
    'Walk the list once. For each x, look for target - x in the dict first. If it is there, you are done. If not, store x with its index and move on.',
  ],
  approach: para(
    '**Trigger:** "find a pair that adds up to something" and you only need a yes, a count or an index, not sorted order. **Pattern:** one pass with a hashmap that remembers what you have seen. **Complexity:** O(n) time, O(n) space.',
    'The order inside the loop is the whole trick. **Look up first, insert second.** If you insert first, a number can match itself: with `[3, 2, 4]` and target 6, the first 3 would pair with the 3 you just stored.'
  ),
  cases: [
    { args: [[2, 7, 11, 15], 9], expect: [0, 1] },
    { args: [[3, 2, 4], 6], expect: [1, 2] },
    { args: [[3, 3], 6], hidden: true, expect: [0, 1] },
    { args: [[-1, -2, -3, -4, -5], -8], hidden: true, expect: [2, 4] },
    { args: [[0, 4, 3, 0], 0], hidden: true, expect: [0, 3] },
    { args: [[1, 5, 9, 14, 20], 23], hidden: true, expect: [2, 3] },
  ],
};
