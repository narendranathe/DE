const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d16-longest-substring', day: 16, anchor: 'Longest Substring Without Repeating Characters', cat: 'BUILD', bounty: 10, lang: 'python',
  title: 'Longest Substring Without Repeating Characters', kind: 'func', fn: 'length_of_longest_substring', cmp: 'eq',
  signature: 'def length_of_longest_substring(s: str) -> int',
  statement: para(
    'Given a string `s`, return the length of the longest **substring** (a run of neighbouring characters) in which no character appears twice.',
    'An empty string has an answer of 0.'
  ),
  starter: 'def length_of_longest_substring(s):\n    # Return the length of the longest substring with no repeated character.\n    pass\n',
  solution: [
    'def length_of_longest_substring(s):',
    '    last = {}                  # char -> index where it was last seen',
    '    left = best = 0',
    '    for right, c in enumerate(s):',
    '        if c in last and last[c] >= left:',
    '            left = last[c] + 1  # jump past the earlier copy',
    '        last[c] = right',
    '        best = max(best, right - left + 1)',
    '    return best',
  ].join('\n') + '\n',
  mutants: [
    { name: 'lets the left edge move backwards', slipsPastSamples: true, code: 'def length_of_longest_substring(s):\n    last = {}\n    left = best = 0\n    for right, c in enumerate(s):\n        if c in last:\n            left = last[c] + 1\n        last[c] = right\n        best = max(best, right - left + 1)\n    return best\n' },
    { name: 'starts over from nothing at every repeat', slipsPastSamples: true, code: 'def length_of_longest_substring(s):\n    seen = set()\n    best = 0\n    for c in s:\n        if c in seen:\n            seen = set()\n        seen.add(c)\n        best = max(best, len(seen))\n    return best\n' },
    { name: 'counts the different letters in the whole string', code: 'def length_of_longest_substring(s):\n    return len(set(s))\n' },
    { name: 'returns the length of the whole string', code: 'def length_of_longest_substring(s):\n    return len(s)\n' },
  ],
  hints: [
    'Keep a window [left, right] that never holds a repeated character. Grow right one step at a time and record the window size.',
    'When the new character is already inside the window, move left to just past its earlier copy. A dict from character to its last index tells you where that copy is.',
    'Only move left forward, never back: check that the earlier copy is at or after left before you jump.',
  ],
  approach: para(
    '**Trigger:** "longest contiguous stretch with a property". **Pattern:** sliding window. **Invariant:** the window `s[left..right]` has no repeated character. **Complexity:** O(n) time, O(min(n, alphabet)) space.',
    'The classic bug is on "abba". When the second `a` arrives, its earlier copy is at index 0, which is **left of** the window start. If you jump left back to 1, the window "bba" holds a repeat. Guard the jump with `last[c] >= left`.'
  ),
  cases: [
    { args: ['abcabcbb'], expect: 3 },
    { args: ['bbbbb'], expect: 1 },
    { args: ['pwwkew'], expect: 3 },
    { args: [''], hidden: true, expect: 0 },
    { args: ['abba'], hidden: true, expect: 2 },
    { args: ['dvdf'], hidden: true, expect: 3 },
    { args: ['tmmzuxt'], hidden: true, expect: 5 },
    { args: ['abcdef'], hidden: true, expect: 6 },
  ],
};
