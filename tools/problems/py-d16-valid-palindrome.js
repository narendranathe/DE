const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d16-valid-palindrome', day: 16, lc: 'valid-palindrome', anchor: 'Valid Palindrome', cat: 'BUILD', bounty: 10, lang: 'python',
  title: 'Valid Palindrome', kind: 'func', fn: 'is_palindrome', cmp: 'eq',
  signature: 'def is_palindrome(s: str) -> bool',
  statement: para(
    'A phrase is a palindrome if it reads the same forwards and backwards after you **lowercase it and remove everything that is not a letter or a digit**.',
    'Return `True` if `s` is a palindrome and `False` if not. An empty result, such as a string of spaces, counts as a palindrome.'
  ),
  starter: 'def is_palindrome(s):\n    # Ignore case and anything that is not a letter or a digit.\n    pass\n',
  solution: [
    'def is_palindrome(s):',
    '    i, j = 0, len(s) - 1',
    '    while i < j:',
    '        while i < j and not s[i].isalnum():',
    '            i += 1',
    '        while i < j and not s[j].isalnum():',
    '            j -= 1',
    '        if s[i].lower() != s[j].lower():',
    '            return False',
    '        i += 1',
    '        j -= 1',
    '    return True',
  ].join('\n') + '\n',
  mutants: [
    { name: 'does not ignore case', code: 'def is_palindrome(s):\n    t = [c for c in s if c.isalnum()]\n    return t == t[::-1]\n' },
    { name: 'does not remove punctuation', code: 'def is_palindrome(s):\n    t = s.lower()\n    return t == t[::-1]\n' },
    { name: 'keeps only letters and drops digits', slipsPastSamples: true, code: 'def is_palindrome(s):\n    t = [c.lower() for c in s if c.isalpha()]\n    return t == t[::-1]\n' },
    { name: 'says an empty result is not a palindrome', slipsPastSamples: true, code: 'def is_palindrome(s):\n    t = [c.lower() for c in s if c.isalnum()]\n    return bool(t) and t == t[::-1]\n' },
  ],
  hints: [
    'Two pointers fit a mirror check: one from the left end, one from the right end, moving toward the middle.',
    'Before comparing, move each pointer past characters that are not letters or digits. str.isalnum() tells you which are.',
    'Compare the two characters in lowercase. The first mismatch means False. If the pointers meet, it is a palindrome.',
  ],
  approach: para(
    '**Trigger:** "reads the same from both ends". **Pattern:** converging two pointers. **Complexity:** O(n) time and O(1) extra space, because you never build a cleaned copy.',
    'Building a cleaned string and comparing it with its reverse is simpler and also correct, at the cost of O(n) space. Name the trade-off.',
    'Two traps: `isalpha()` drops digits, so "0P" would look like a palindrome, and an all-punctuation string is a palindrome by the rules above.'
  ),
  cases: [
    { args: ['A man, a plan, a canal: Panama'], expect: true },
    { args: ['race a car'], expect: false },
    { args: [' '], hidden: true, expect: true },
    { args: ['0P'], hidden: true, expect: false },
    { args: ['.,'], hidden: true, expect: true },
    { args: ['ab_a'], hidden: true, expect: true },
    { args: ['Was it a car or a cat I saw?'], hidden: true, expect: true },
    { args: ['abca'], hidden: true, expect: false },
  ],
};
