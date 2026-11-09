const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d27-three-sum', day: 27, lc: '3sum', anchor: 'LC 15', cat: 'PRACTICE', bounty: 20, lang: 'python',
  title: '3Sum', kind: 'func', fn: 'three_sum', cmp: 'groups',
  signature: 'def three_sum(nums: list[int]) -> list[list[int]]',
  statement: para(
    'Given a list of integers, find every **set of three numbers** from different positions in the list that add up to `0`.',
    'Each set must appear **once** in the answer, even if it can be made in several ways. Two sets are the same if they hold the same three values: `[-1, 0, 1]` and `[1, 0, -1]` are one set. The order of the sets, and the order inside a set, does not matter.',
    'Return a list of triplets. If there is none, return an empty list.'
  ),
  starter: 'def three_sum(nums):\n    # Return every unique triplet of values that adds up to 0.\n    pass\n',
  solution: [
    'def three_sum(nums):',
    '    nums = sorted(nums)',
    '    out = []',
    '    for i in range(len(nums) - 2):',
    '        if i > 0 and nums[i] == nums[i - 1]:',
    '            continue                         # same first number as before: same triplets',
    '        left, right = i + 1, len(nums) - 1',
    '        while left < right:',
    '            total = nums[i] + nums[left] + nums[right]',
    '            if total < 0:',
    '                left += 1',
    '            elif total > 0:',
    '                right -= 1',
    '            else:',
    '                out.append([nums[i], nums[left], nums[right]])',
    '                left += 1',
    '                while left < right and nums[left] == nums[left - 1]:',
    '                    left += 1                # skip repeats of the second number',
    '    return out',
  ].join('\n') + '\n',
  mutants: [
    { name: 'does not remove repeated triplets', code: 'def three_sum(nums):\n    nums = sorted(nums)\n    out = []\n    for i in range(len(nums) - 2):\n        l, r = i + 1, len(nums) - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if s < 0:\n                l += 1\n            elif s > 0:\n                r -= 1\n            else:\n                out.append([nums[i], nums[l], nums[r]])\n                l += 1\n                r -= 1\n    return out\n' },
    { name: 'uses the same position more than once', code: 'def three_sum(nums):\n    out = set()\n    n = len(nums)\n    for i in range(n):\n        for j in range(i, n):\n            for k in range(j, n):\n                if nums[i] + nums[j] + nums[k] == 0:\n                    out.add(tuple(sorted((nums[i], nums[j], nums[k]))))\n    return [list(t) for t in out]\n' },
    { name: 'skips a first number when the next one is equal, so a triplet with two equal values is lost', code: 'def three_sum(nums):\n    nums = sorted(nums)\n    out = []\n    for i in range(len(nums) - 2):\n        if i + 1 < len(nums) and nums[i] == nums[i + 1]:\n            continue\n        l, r = i + 1, len(nums) - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if s < 0:\n                l += 1\n            elif s > 0:\n                r -= 1\n            else:\n                out.append([nums[i], nums[l], nums[r]])\n                l += 1\n                r -= 1\n    return out\n' },
    { name: 'stops after the first triplet for each first number', code: 'def three_sum(nums):\n    nums = sorted(nums)\n    out = []\n    for i in range(len(nums) - 2):\n        if i > 0 and nums[i] == nums[i - 1]:\n            continue\n        l, r = i + 1, len(nums) - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if s < 0:\n                l += 1\n            elif s > 0:\n                r -= 1\n            else:\n                out.append([nums[i], nums[l], nums[r]])\n                break\n    return out\n' },
  ],
  hints: [
    'Checking every triple takes O(n^3). Fix one number, and the rest of the job is "find two numbers that add to the opposite", which you can do faster.',
    'Sort the list. For each first number, put one pointer just after it and one at the end. If the sum is too small, move the left pointer right. If it is too big, move the right pointer left.',
    'For uniqueness, skip a first number that equals the one before it. After you record a triplet, move the left pointer past repeated values.',
  ],
  approach: para(
    '**Trigger:** "find k numbers that add up to a target", "no duplicate answers". **Pattern:** sort, fix one number, **two pointers** for the rest. **Complexity:** O(n^2) time, because each first number costs one O(n) sweep.',
    'Sorting does two jobs. It makes the two pointers work (the sum moves in a known direction when a pointer moves), and it puts equal numbers next to each other so duplicates are easy to skip.',
    'The duplicate rule has two parts. Skip a **first** number equal to the previous first number. After a hit, skip repeats of the **second** number. Skip the first number by looking **back**: looking ahead loses triplets like `[-1, -1, 2]`.'
  ),
  cases: [
    { args: [[-1, 0, 1, 2, -1, -4]], expect: [[-1, -1, 2], [-1, 0, 1]] },
    { args: [[0, 1, 1]], expect: [] },
    { args: [[0, 0, 0]], hidden: true, expect: [[0, 0, 0]] },
    { args: [[0, 0, 0, 0]], hidden: true, expect: [[0, 0, 0]] },
    { args: [[0]], hidden: true, expect: [] },
    { args: [[]], hidden: true, expect: [] },
    { args: [[-2, 0, 0, 2, 2]], hidden: true, expect: [[-2, 0, 2]] },
    { args: [[-3, 0, 1, 2, 3]], hidden: true, expect: [[-3, 0, 3], [-3, 1, 2]] },
  ],
};
