const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d17-daily-temperatures', day: 17, lc: 'daily-temperatures', anchor: 'Daily Temperatures', cat: 'BUILD', bounty: 10, lang: 'python',
  title: 'Daily Temperatures', kind: 'func', fn: 'daily_temperatures', cmp: 'eq',
  signature: 'def daily_temperatures(temperatures: list[int]) -> list[int]',
  statement: para(
    'Given a list of daily temperatures, return a list of the same length. For each day, the answer is **how many days you wait** until a **strictly warmer** day.',
    'If no warmer day ever comes, the answer for that day is 0.'
  ),
  starter: 'def daily_temperatures(temperatures):\n    # For each day, how many days until a strictly warmer one? 0 if never.\n    pass\n',
  solution: [
    'def daily_temperatures(temperatures):',
    '    answer = [0] * len(temperatures)',
    '    stack = []                            # indices of days still waiting for a warmer day',
    '    for i, t in enumerate(temperatures):',
    '        while stack and temperatures[stack[-1]] < t:',
    '            j = stack.pop()',
    '            answer[j] = i - j',
    '        stack.append(i)',
    '    return answer',
  ].join('\n') + '\n',
  mutants: [
    { name: 'counts an equal temperature as warmer', slipsPastSamples: true, code: 'def daily_temperatures(temperatures):\n    answer = [0] * len(temperatures)\n    stack = []\n    for i, t in enumerate(temperatures):\n        while stack and temperatures[stack[-1]] <= t:\n            j = stack.pop()\n            answer[j] = i - j\n        stack.append(i)\n    return answer\n' },
    { name: 'returns the warmer temperature instead of the wait', code: 'def daily_temperatures(temperatures):\n    answer = [0] * len(temperatures)\n    stack = []\n    for i, t in enumerate(temperatures):\n        while stack and temperatures[stack[-1]] < t:\n            answer[stack.pop()] = t\n        stack.append(i)\n    return answer\n' },
    { name: 'only looks at the next day', code: 'def daily_temperatures(temperatures):\n    return [1 if i + 1 < len(temperatures) and temperatures[i + 1] > t else 0 for i, t in enumerate(temperatures)]\n' },
    { name: 'stores temperatures on the stack, so it cannot measure a distance', code: 'def daily_temperatures(temperatures):\n    answer = [0] * len(temperatures)\n    for i, t in enumerate(temperatures):\n        for j in range(i + 1, len(temperatures)):\n            if temperatures[j] > t:\n                answer[i] = 1\n                break\n    return answer\n' },
  ],
  hints: [
    'The slow way scans forward from every day. Think about which days are still waiting for an answer as you walk left to right.',
    'Keep a stack of the indices of days that have not found a warmer day yet. Their temperatures are in non-increasing order from the bottom to the top.',
    'When today is warmer than the day on top of the stack, pop it and its answer is today\'s index minus its index. Repeat while that stays true, then push today.',
  ],
  approach: para(
    '**Trigger:** "next greater element to the right". **Pattern:** a monotonic stack of **indices**. **Complexity:** O(n) time, because each index is pushed once and popped once, and O(n) space.',
    'Push indices, not temperatures: you need the index to compute the distance. The comparison is strict, so an equal temperature does not pop anything.'
  ),
  cases: [
    { args: [[73, 74, 75, 71, 69, 72, 76, 73]], expect: [1, 1, 4, 2, 1, 1, 0, 0] },
    { args: [[30, 40, 50, 60]], expect: [1, 1, 1, 0] },
    { args: [[30, 60, 90]], hidden: true, expect: [1, 1, 0] },
    { args: [[90, 80, 70]], hidden: true, expect: [0, 0, 0] },
    { args: [[50]], hidden: true, expect: [0] },
    { args: [[70, 70, 70, 71]], hidden: true, expect: [3, 2, 1, 0] },
    { args: [[]], hidden: true, expect: [] },
  ],
};
