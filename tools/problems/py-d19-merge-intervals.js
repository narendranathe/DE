const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d19-merge-intervals', day: 19, lc: 'merge-intervals', anchor: 'Merge Intervals', cat: 'BUILD', bounty: 10, lang: 'python',
  title: 'Merge Intervals', kind: 'func', fn: 'merge_intervals', cmp: 'eq',
  signature: 'def merge_intervals(intervals: list[list[int]]) -> list[list[int]]',
  statement: para(
    'You get a list of intervals, each written `[start, end]`, in **any order**. Merge every group of intervals that overlap and return the merged intervals.',
    'Two intervals overlap when they share at least one point, so `[1, 4]` and `[4, 5]` overlap (they touch at 4) and become `[1, 5]`.',
    'Return the result **sorted by start**, with no two intervals in it overlapping.'
  ),
  starter: 'def merge_intervals(intervals):\n    # Return the merged intervals, sorted by start.\n    pass\n',
  solution: [
    'def merge_intervals(intervals):',
    '    merged = []',
    '    for start, end in sorted(intervals):              # sort by start first',
    '        if merged and start <= merged[-1][1]:          # overlaps (or touches) the last one',
    '            merged[-1][1] = max(merged[-1][1], end)    # keep the farther end',
    '        else:',
    '            merged.append([start, end])',
    '    return merged',
  ].join('\n') + '\n',
  mutants: [
    { name: 'does not sort first', code: 'def merge_intervals(intervals):\n    merged = []\n    for start, end in intervals:\n        if merged and start <= merged[-1][1]:\n            merged[-1][1] = max(merged[-1][1], end)\n        else:\n            merged.append([start, end])\n    return merged\n' },
    { name: 'does not merge intervals that only touch', slipsPastSamples: true, code: 'def merge_intervals(intervals):\n    merged = []\n    for start, end in sorted(intervals):\n        if merged and start < merged[-1][1]:\n            merged[-1][1] = max(merged[-1][1], end)\n        else:\n            merged.append([start, end])\n    return merged\n' },
    { name: 'takes the end of the new interval, even when the earlier one reaches farther', slipsPastSamples: true, code: 'def merge_intervals(intervals):\n    merged = []\n    for start, end in sorted(intervals):\n        if merged and start <= merged[-1][1]:\n            merged[-1][1] = end\n        else:\n            merged.append([start, end])\n    return merged\n' },
    { name: 'returns the intervals sorted but never merges them', code: 'def merge_intervals(intervals):\n    return sorted(intervals)\n' },
  ],
  hints: [
    'If the intervals were sorted by start, which single interval could a new one possibly overlap?',
    'Sort by start. Then only the last interval you kept can overlap the next one. If next.start <= last.end, they merge.',
    'When they merge, the new end is the larger of the two ends, max(last.end, next.end). One interval can fully contain another.',
  ],
  approach: para(
    '**Trigger:** "overlapping ranges", "booking conflicts", "merge ranges". **Pattern:** sort by start, then one sweep that keeps a growing last interval. **Complexity:** O(n log n) for the sort, O(n) for the sweep.',
    'Sorting is what makes the sweep possible. After it, an interval can only reach back to the last merged one, never further.',
    'Two details that tests like to hit: **touching counts** (`<=`, not `<`), and the merged end is the **max** of the two ends, because `[1, 10]` followed by `[2, 3]` must stay `[1, 10]`.'
  ),
  cases: [
    { args: [[[8, 10], [1, 3], [2, 6], [15, 18]]], expect: [[1, 6], [8, 10], [15, 18]] },
    { args: [[[1, 4], [0, 2], [3, 5]]], expect: [[0, 5]] },
    { args: [[]], hidden: true, expect: [] },
    { args: [[[1, 4], [4, 5]]], hidden: true, expect: [[1, 5]] },
    { args: [[[1, 10], [2, 3], [4, 5]]], hidden: true, expect: [[1, 10]] },
    { args: [[[5, 6], [1, 2], [3, 4]]], hidden: true, expect: [[1, 2], [3, 4], [5, 6]] },
    { args: [[[2, 2]]], hidden: true, expect: [[2, 2]] },
  ],
};
