const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d67-insert-interval', day: 67, lc: 'insert-interval', anchor: 'LC 57', cat: 'PRACTICE', bounty: 20, lang: 'python',
  title: 'Insert Interval', kind: 'func', fn: 'insert_interval', cmp: 'eq',
  signature: 'def insert_interval(intervals: list[list[int]], new_interval: list[int]) -> list[list[int]]',
  statement: para(
    '`intervals` is a list of `[start, end]` pairs that are **sorted by start** and **do not overlap**. You also get one more interval, `new_interval`.',
    'Insert `new_interval` into the list. If it overlaps one or more intervals, merge them all into one. Two intervals overlap when they share at least one point, so `[1, 2]` and `[2, 3]` overlap and become `[1, 3]`.',
    'Return the new list. It must still be sorted and have no overlaps.'
  ),
  starter: 'def insert_interval(intervals, new_interval):\n    # Return the sorted, non-overlapping list that includes new_interval.\n    pass\n',
  solution: [
    'def insert_interval(intervals, new_interval):',
    '    start, end = new_interval',
    '    out, i, n = [], 0, len(intervals)',
    '    while i < n and intervals[i][1] < start:          # 1) entirely before the new one: keep',
    '        out.append(intervals[i])',
    '        i += 1',
    '    while i < n and intervals[i][0] <= end:           # 2) overlaps (or touches): fold into the new one',
    '        start = min(start, intervals[i][0])',
    '        end = max(end, intervals[i][1])',
    '        i += 1',
    '    out.append([start, end])',
    '    out.extend(intervals[i:])                         # 3) entirely after: keep',
    '    return out',
  ].join('\n') + '\n',
  mutants: [
    { name: 'puts the new interval in order but never merges', code: 'def insert_interval(intervals, new_interval):\n    return sorted(intervals + [new_interval])\n' },
    { name: 'does not merge intervals that only touch', slipsPastSamples: true, code: 'def insert_interval(intervals, new_interval):\n    start, end = new_interval\n    out, i, n = [], 0, len(intervals)\n    while i < n and intervals[i][1] <= start:\n        out.append(intervals[i])\n        i += 1\n    while i < n and intervals[i][0] < end:\n        start = min(start, intervals[i][0])\n        end = max(end, intervals[i][1])\n        i += 1\n    out.append([start, end])\n    out.extend(intervals[i:])\n    return out\n' },
    { name: 'drops the intervals that come after the new one', code: 'def insert_interval(intervals, new_interval):\n    start, end = new_interval\n    out, i, n = [], 0, len(intervals)\n    while i < n and intervals[i][1] < start:\n        out.append(intervals[i])\n        i += 1\n    while i < n and intervals[i][0] <= end:\n        start = min(start, intervals[i][0])\n        end = max(end, intervals[i][1])\n        i += 1\n    out.append([start, end])\n    return out\n' },
    { name: 'takes the end of the last overlapping interval, not the farthest end', code: 'def insert_interval(intervals, new_interval):\n    start, end = new_interval\n    out, i, n = [], 0, len(intervals)\n    while i < n and intervals[i][1] < start:\n        out.append(intervals[i])\n        i += 1\n    while i < n and intervals[i][0] <= end:\n        start = min(start, intervals[i][0])\n        end = intervals[i][1]\n        i += 1\n    out.append([start, end])\n    out.extend(intervals[i:])\n    return out\n' },
    { name: 'keeps the new start even when an earlier interval reaches further back', code: 'def insert_interval(intervals, new_interval):\n    start, end = new_interval\n    out, i, n = [], 0, len(intervals)\n    while i < n and intervals[i][1] < start:\n        out.append(intervals[i])\n        i += 1\n    while i < n and intervals[i][0] <= end:\n        end = max(end, intervals[i][1])\n        i += 1\n    out.append([start, end])\n    out.extend(intervals[i:])\n    return out\n' },
  ],
  hints: [
    'Because the list is already sorted, the intervals fall into three groups relative to the new one: entirely before it, overlapping it, and entirely after it.',
    'Copy the ones that end before the new interval starts. Then, for every interval that starts at or before the new interval\'s end, stretch the new interval: take the smaller start and the larger end.',
    'Add the stretched interval, then copy the rest. One pass with a single index is enough.',
  ],
  approach: para(
    '**Trigger:** "add a range to a sorted set of ranges". **Pattern:** a **three-phase sweep** over a sorted list: before, overlapping, after. **Complexity:** O(n) time. You do not need to sort again.',
    'The test for "overlaps" is two comparisons. An interval is **before** if `its end < new start`. It is **after** if `its start > new end`. Everything between the two overlaps. Use `<` and `>` for those, so a touching interval counts as an overlap.',
    'When you fold an interval into the new one, use `min` for the start and `max` for the end. An interval that swallows the new one, such as `[1, 5]` with new `[2, 3]`, must keep its larger end.'
  ),
  cases: [
    { args: [[[1, 3], [6, 9]], [2, 5]], expect: [[1, 5], [6, 9]] },
    { args: [[[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 7]], expect: [[1, 2], [3, 7], [8, 10], [12, 16]] },
    { args: [[], [5, 7]], hidden: true, expect: [[5, 7]] },
    { args: [[[1, 5]], [2, 3]], hidden: true, expect: [[1, 5]] },
    { args: [[[1, 2], [3, 4]], [2, 3]], hidden: true, expect: [[1, 4]] },
    { args: [[[3, 4]], [1, 2]], hidden: true, expect: [[1, 2], [3, 4]] },
    { args: [[[1, 2]], [3, 4]], hidden: true, expect: [[1, 2], [3, 4]] },
    { args: [[[1, 2], [5, 6]], [3, 4]], hidden: true, expect: [[1, 2], [3, 4], [5, 6]] },
    { args: [[[2, 3], [5, 7]], [0, 10]], hidden: true, expect: [[0, 10]] },
    { args: [[[1, 5], [8, 9]], [3, 4]], hidden: true, expect: [[1, 5], [8, 9]] },
  ],
};
