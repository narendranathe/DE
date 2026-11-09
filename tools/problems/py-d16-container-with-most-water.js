const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d16-container-with-most-water', day: 16, lc: 'container-with-most-water', anchor: 'Container With Most Water', cat: 'BUILD', bounty: 10, lang: 'python',
  title: 'Container With Most Water', kind: 'func', fn: 'max_area', cmp: 'eq',
  signature: 'def max_area(height: list[int]) -> int',
  statement: para(
    'You have vertical lines at positions 0, 1, 2, ... and `height[i]` is the height of line `i`. Pick two lines. Together with the x-axis they form a container.',
    'The water it holds is the **distance between the lines** times the **shorter** of the two heights. Return the largest amount of water any pair can hold.'
  ),
  starter: 'def max_area(height):\n    # Return the most water any two lines can hold.\n    pass\n',
  solution: [
    'def max_area(height):',
    '    i, j = 0, len(height) - 1',
    '    best = 0',
    '    while i < j:',
    '        best = max(best, (j - i) * min(height[i], height[j]))',
    '        if height[i] < height[j]:      # the shorter line limits the area, so move it',
    '            i += 1',
    '        else:',
    '            j -= 1',
    '    return best',
  ].join('\n') + '\n',
  mutants: [
    { name: 'uses the taller line instead of the shorter one', code: 'def max_area(height):\n    best = 0\n    for i in range(len(height)):\n        for j in range(i + 1, len(height)):\n            best = max(best, (j - i) * max(height[i], height[j]))\n    return best\n' },
    { name: 'measures the width one short', code: 'def max_area(height):\n    i, j, best = 0, len(height) - 1, 0\n    while i < j:\n        best = max(best, (j - i - 1) * min(height[i], height[j]))\n        if height[i] < height[j]:\n            i += 1\n        else:\n            j -= 1\n    return best\n' },
    { name: 'moves the taller pointer', code: 'def max_area(height):\n    i, j, best = 0, len(height) - 1, 0\n    while i < j:\n        best = max(best, (j - i) * min(height[i], height[j]))\n        if height[i] > height[j]:\n            i += 1\n        else:\n            j -= 1\n    return best\n' },
    { name: 'only looks at the two end lines', code: 'def max_area(height):\n    return (len(height) - 1) * min(height[0], height[-1])\n' },
  ],
  hints: [
    'Start with the widest container: the first and last lines. Any narrower container needs to be taller to beat it.',
    'The shorter line decides the height. Moving the taller line inward can only make the width smaller, so it can never help.',
    'Compute the area, keep the best, then move the pointer at the shorter line inward. Stop when the pointers meet.',
  ],
  approach: para(
    '**Trigger:** "best pair in a sequence" where the value depends on both ends. **Pattern:** converging two pointers that always discard the end that cannot improve the answer. **Complexity:** O(n) time, O(1) space.',
    'Say why moving the shorter side is safe: with the shorter side fixed, every container that keeps it is narrower and no taller, so none beats what you already recorded.',
    'The brute-force double loop is O(n²). Mention it, then improve it.'
  ),
  cases: [
    { args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expect: 49 },
    { args: [[1, 1]], expect: 1 },
    { args: [[4, 3, 2, 1, 4]], hidden: true, expect: 16 },
    { args: [[1, 2, 1]], hidden: true, expect: 2 },
    { args: [[2, 3, 4, 5, 18, 17, 6]], hidden: true, expect: 17 },
    { args: [[9, 8, 7, 6]], hidden: true, expect: 18 },
  ],
};
