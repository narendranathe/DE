const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d18-koko-eating-bananas', day: 18, anchor: 'Koko Eating Bananas', cat: 'BUILD', bounty: 10, lang: 'python',
  title: 'Koko Eating Bananas', kind: 'func', fn: 'min_eating_speed', cmp: 'eq',
  signature: 'def min_eating_speed(piles: list[int], h: int) -> int',
  statement: para(
    'Koko has piles of bananas and `h` hours. She picks a speed of `k` bananas per hour. Each hour she chooses one pile and eats up to `k` bananas from it. If the pile has fewer than `k`, she finishes it and **does not start another pile that hour**.',
    'Return the **smallest whole number `k`** that lets her eat every pile within `h` hours. There are never fewer hours than piles.'
  ),
  starter: 'def min_eating_speed(piles, h):\n    # Return the smallest speed k that finishes every pile within h hours.\n    pass\n',
  solution: [
    'def min_eating_speed(piles, h):',
    '    lo, hi = 1, max(piles)                 # the answer is somewhere in [1, max pile]',
    '    while lo < hi:',
    '        k = (lo + hi) // 2',
    '        hours = sum(-(-p // k) for p in piles)   # ceiling division',
    '        if hours <= h:',
    '            hi = k                          # k works, maybe a smaller one does too',
    '        else:',
    '            lo = k + 1                      # too slow',
    '    return lo',
  ].join('\n') + '\n',
  mutants: [
    { name: 'rounds the hours down instead of up', code: 'def min_eating_speed(piles, h):\n    lo, hi = 1, max(piles)\n    while lo < hi:\n        k = (lo + hi) // 2\n        hours = sum(p // k for p in piles)\n        if hours <= h:\n            hi = k\n        else:\n            lo = k + 1\n    return lo\n' },
    { name: 'leaves the biggest pile out of the search range', code: 'def min_eating_speed(piles, h):\n    lo, hi = 1, max(piles) - 1\n    while lo < hi:\n        k = (lo + hi) // 2\n        hours = sum(-(-p // k) for p in piles)\n        if hours <= h:\n            hi = k\n        else:\n            lo = k + 1\n    return lo\n' },
    { name: 'tries every speed from 1 upward, which is too slow for huge piles', code: 'def min_eating_speed(piles, h):\n    k = 1\n    while sum(-(-p // k) for p in piles) > h:\n        k += 1\n    return k\n' },
    { name: 'returns the biggest pile', code: 'def min_eating_speed(piles, h):\n    return max(piles)\n' },
  ],
  hints: [
    'Do not search for the pile. Search for the **speed**: if speed k is fast enough, then every speed above k is too.',
    'For a given k, the hours needed are the sum over piles of ceil(pile / k). The speed is somewhere between 1 and the biggest pile.',
    'Binary search the speed. If k finishes in h hours or fewer, try a slower speed (hi = k). Otherwise go faster (lo = k + 1). Stop when lo meets hi.',
  ],
  approach: para(
    '**Trigger:** "find the minimum value that makes a yes/no check pass", where the check is monotonic. **Pattern:** binary search on the **answer**. **Complexity:** O(n log m) time for n piles and a biggest pile of m, O(1) space.',
    'Each check is a full pass over the piles. The search space is the speeds 1 to `max(piles)`, which halves each step. Counting up from 1 would take `max(piles)` steps, which is far too slow for a pile of a billion.',
    'Round the hours **up**: a pile of 7 at speed 3 takes 3 hours, not 2. In Python, `-(-p // k)` is ceiling division.'
  ),
  cases: [
    { args: [[3, 6, 7, 11], 8], expect: 4 },
    { args: [[30, 11, 23, 4, 20], 5], expect: 30 },
    { args: [[30, 11, 23, 4, 20], 6], expect: 23 },
    { args: [[1], 1], hidden: true, expect: 1 },
    { args: [[5, 5, 5], 3], hidden: true, expect: 5 },
    { args: [[2, 2], 4], hidden: true, expect: 1 },
    { args: [[1000000000], 2], hidden: true, expect: 500000000 },
    { args: [[312884470], 312884469], hidden: true, expect: 2 },
  ],
};
