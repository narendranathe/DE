const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d29-longest-repeating-character-replacement', day: 29, lc: 'longest-repeating-character-replacement', anchor: 'LC 424', cat: 'PRACTICE', bounty: 20, lang: 'python',
  title: 'Longest Repeating Character Replacement', kind: 'func', fn: 'character_replacement', cmp: 'eq',
  signature: 'def character_replacement(s: str, k: int) -> int',
  statement: para(
    'You get a string `s` of capital letters and a whole number `k`. You may change **at most `k` characters** of the string, each into any capital letter.',
    'After your changes, look for a run of **one repeated letter**. Return the length of the **longest** such run you can make.',
    'Examples: `"ABAB"` with `k = 2` gives `4` (change both B to A). `"AABABBA"` with `k = 1` gives `4`.'
  ),
  starter: 'def character_replacement(s, k):\n    # Return the length of the longest run of one letter you can make with at most k changes.\n    pass\n',
  solution: [
    'def character_replacement(s, k):',
    '    counts = {}',
    '    left = best = 0',
    '    for right, ch in enumerate(s):',
    '        counts[ch] = counts.get(ch, 0) + 1',
    '        # the window is fine while (its length - its most common letter) <= k',
    '        while (right - left + 1) - max(counts.values()) > k:',
    '            counts[s[left]] -= 1',
    '            left += 1',
    '        best = max(best, right - left + 1)',
    '    return best',
  ].join('\n') + '\n',
  mutants: [
    { name: 'ignores k and returns the longest run that already exists', code: 'def character_replacement(s, k):\n    best = cur = 0\n    prev = None\n    for ch in s:\n        cur = cur + 1 if ch == prev else 1\n        prev = ch\n        best = max(best, cur)\n    return best\n' },
    { name: 'allows only k - 1 changes', code: 'def character_replacement(s, k):\n    counts = {}\n    left = best = 0\n    for right, ch in enumerate(s):\n        counts[ch] = counts.get(ch, 0) + 1\n        while (right - left + 1) - max(counts.values()) > k - 1:\n            counts[s[left]] -= 1\n            left += 1\n        best = max(best, right - left + 1)\n    return best\n' },
    { name: 'uses the most common letter of the whole string, not of the window', code: 'from collections import Counter\n\ndef character_replacement(s, k):\n    if not s:\n        return 0\n    return min(len(s), max(Counter(s).values()) + k)\n' },
    { name: 'forgets to remove the letter that leaves the window', code: 'def character_replacement(s, k):\n    counts = {}\n    left = best = 0\n    for right, ch in enumerate(s):\n        counts[ch] = counts.get(ch, 0) + 1\n        while (right - left + 1) - max(counts.values()) > k:\n            left += 1\n        best = max(best, right - left + 1)\n    return best\n' },
  ],
  hints: [
    'Think of a window of the string. It can be turned into one letter if its length minus the count of its most common letter is at most k. Those are the letters you must change.',
    'Grow the window to the right one character at a time and keep a count of each letter inside it.',
    'When (window length - highest count) goes above k, the window is too hungry. Move the left edge right (and lower that letter\'s count) until it is fine again. The answer is the largest window you saw.',
  ],
  approach: para(
    '**Trigger:** "longest substring where at most k things are wrong". **Pattern:** a **sliding window** with a count of each letter. **Complexity:** O(26 n), which is O(n).',
    'You never have to decide which letter to turn the window into. The best choice is always the **most common letter inside the window**, so the cost is `length - highest count`.',
    'There is a known shortcut that tracks the highest count seen so far instead of recomputing it. It is faster by a constant factor and harder to explain. With only 26 letters, taking `max(counts.values())` each time is fine.'
  ),
  cases: [
    { args: ['ABAB', 2], expect: 4 },
    { args: ['AABABBA', 1], expect: 4 },
    { args: ['', 5], hidden: true, expect: 0 },
    { args: ['A', 0], hidden: true, expect: 1 },
    { args: ['ABC', 0], hidden: true, expect: 1 },
    { args: ['AAAA', 2], hidden: true, expect: 4 },
    { args: ['ABCDE', 2], hidden: true, expect: 3 },
    { args: ['AABBBCCCCD', 2], hidden: true, expect: 6 },
  ],
};
