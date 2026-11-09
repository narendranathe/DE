const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d17-valid-parentheses', day: 17, anchor: 'Valid Parentheses', cat: 'BUILD', bounty: 10, lang: 'python',
  title: 'Valid Parentheses', kind: 'func', fn: 'is_valid', cmp: 'eq',
  signature: 'def is_valid(s: str) -> bool',
  statement: para(
    'A string contains only the characters `(`, `)`, `[`, `]`, `{` and `}`. It is **valid** when every opening bracket is closed by the same type of bracket, in the right order.',
    'Return `True` if `s` is valid. An empty string is valid.'
  ),
  starter: 'def is_valid(s):\n    # Return True if every bracket is closed by the right type, in the right order.\n    pass\n',
  solution: [
    'def is_valid(s):',
    '    pairs = {")": "(", "]": "[", "}": "{"}',
    '    stack = []',
    '    for c in s:',
    '        if c in pairs:',
    '            if not stack or stack.pop() != pairs[c]:',
    '                return False',
    '        else:',
    '            stack.append(c)',
    '    return not stack',
  ].join('\n') + '\n',
  mutants: [
    { name: 'only counts each bracket type and ignores the order', slipsPastSamples: true, code: 'def is_valid(s):\n    return s.count("(") == s.count(")") and s.count("[") == s.count("]") and s.count("{") == s.count("}")\n' },
    { name: 'never checks for a leftover opening bracket', slipsPastSamples: true, code: 'def is_valid(s):\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    for c in s:\n        if c in pairs:\n            if not stack or stack.pop() != pairs[c]:\n                return False\n        else:\n            stack.append(c)\n    return True\n' },
    { name: 'pops without checking that the stack has anything', code: 'def is_valid(s):\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    for c in s:\n        if c in pairs:\n            if stack.pop() != pairs[c]:\n                return False\n        else:\n            stack.append(c)\n    return not stack\n' },
    { name: 'removes pairs with replace but only one type at a time', code: 'def is_valid(s):\n    for p in ("()", "[]", "{}"):\n        s = s.replace(p, "")\n    return s == ""\n' },
  ],
  hints: [
    'The most recent opening bracket must be the first one to close. Which data structure gives you "last in, first out"?',
    'Push each opening bracket. When you see a closing bracket, pop and check that it is the matching type.',
    'Two ways to fail: a closing bracket with nothing to pop, and opening brackets still on the stack at the end.',
  ],
  approach: para(
    '**Trigger:** nesting or "match the most recent open thing". **Pattern:** a stack. **Complexity:** O(n) time, O(n) space.',
    'A dict from each closing bracket to its opening partner keeps the check short. Test three edge cases before you submit: an empty string, a lone `)` (pop on an empty stack), and a lone `(` (leftover on the stack).'
  ),
  cases: [
    { args: ['()'], expect: true },
    { args: ['()[]{}'], expect: true },
    { args: ['(]'], expect: false },
    { args: ['([)]'], hidden: true, expect: false },
    { args: ['{[]}'], hidden: true, expect: true },
    { args: ['('], hidden: true, expect: false },
    { args: [')'], hidden: true, expect: false },
    { args: [''], hidden: true, expect: true },
    { args: ['((()))'], hidden: true, expect: true },
    { args: ['}{'], hidden: true, expect: false },
  ],
};
