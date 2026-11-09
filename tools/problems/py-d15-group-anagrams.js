const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d15-group-anagrams', day: 15, lc: 'group-anagrams', anchor: 'Group Anagrams', cat: 'BUILD', bounty: 10, lang: 'python',
  title: 'Group Anagrams', kind: 'func', fn: 'group_anagrams', cmp: 'groups',
  signature: 'def group_anagrams(strs: list[str]) -> list[list[str]]',
  statement: para(
    'Given a list of lowercase words, group the words that are **anagrams** of each other: the same letters in a different order.',
    'Return a list of groups. The order of the groups, and the order of the words inside a group, does not matter. A word that appears twice appears twice in its group.'
  ),
  starter: 'def group_anagrams(strs):\n    # Return a list of groups of words that are anagrams of each other.\n    pass\n',
  solution: [
    'from collections import defaultdict',
    '',
    'def group_anagrams(strs):',
    '    groups = defaultdict(list)',
    '    for word in strs:',
    '        groups[tuple(sorted(word))].append(word)   # same letters -> same key',
    '    return list(groups.values())',
  ].join('\n') + '\n',
  mutants: [
    { name: 'groups by word length', code: 'from collections import defaultdict\n\ndef group_anagrams(strs):\n    g = defaultdict(list)\n    for w in strs:\n        g[len(w)].append(w)\n    return list(g.values())\n' },
    { name: 'groups by the sum of the letters, so different words collide', slipsPastSamples: true, code: 'from collections import defaultdict\n\ndef group_anagrams(strs):\n    g = defaultdict(list)\n    for w in strs:\n        g[sum(ord(c) for c in w)].append(w)\n    return list(g.values())\n' },
    { name: 'uses a list as a dict key', code: 'from collections import defaultdict\n\ndef group_anagrams(strs):\n    g = defaultdict(list)\n    for w in strs:\n        g[sorted(w)].append(w)\n    return list(g.values())\n' },
    { name: 'puts every word in its own group', code: 'def group_anagrams(strs):\n    return [[w] for w in strs]\n' },
  ],
  hints: [
    'You need one value that is the same for every word in a group and different between groups. What stays the same when you shuffle the letters of a word?',
    'Sort the letters of the word. "eat", "tea" and "ate" all become "aet". A dict from that key to a list of words collects each group.',
    'A list cannot be a dict key because it can change. Turn the sorted letters into a string or a tuple first.',
  ],
  approach: para(
    '**Trigger:** "group things that are equal under some rule". **Pattern:** compute a canonical key for each item and use a hashmap from key to list. **Complexity:** O(n · k log k) time for n words of length k, O(n · k) space.',
    'The key must make two words collide **only** when they are anagrams. Sorted letters do. The sum of letter codes does not: "ad" and "bc" have the same sum.',
    'When every word is a lowercase letter string, a 26-count tuple is a key too, and it makes the time O(n · k).'
  ),
  cases: [
    { args: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], expect: [['bat'], ['nat', 'tan'], ['ate', 'eat', 'tea']] },
    { args: [['']], expect: [['']] },
    { args: [['a']], hidden: true, expect: [['a']] },
    { args: [['ab', 'ba', 'ab']], hidden: true, expect: [['ab', 'ba', 'ab']] },
    { args: [['ad', 'bc']], hidden: true, expect: [['ad'], ['bc']] },
    { args: [['abc', 'bca', 'cab', 'xyz', 'zyx', 'aab', 'aba']], hidden: true, expect: [['abc', 'bca', 'cab'], ['xyz', 'zyx'], ['aab', 'aba']] },
    { args: [[]], hidden: true, expect: [] },
  ],
};
