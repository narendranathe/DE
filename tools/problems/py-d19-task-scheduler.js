const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d19-task-scheduler', day: 19, lc: 'task-scheduler', anchor: 'Task Scheduler', cat: 'BUILD', bounty: 10, lang: 'python',
  title: 'Task Scheduler', kind: 'func', fn: 'least_interval', cmp: 'eq',
  signature: 'def least_interval(tasks: list[str], n: int) -> int',
  statement: para(
    'A processor runs one task per time unit, or sits idle for a unit. Each task is a capital letter, and the same letter means the same kind of task.',
    'After the processor runs a task, it must wait **at least `n` time units** before it can run the **same kind** of task again. Different kinds have no limit between them. You may run the tasks in any order.',
    'Return the **smallest number of time units** needed to finish every task, idle units included.'
  ),
  starter: 'def least_interval(tasks, n):\n    # Return the least number of time units needed to run all the tasks.\n    pass\n',
  solution: [
    'from collections import Counter',
    '',
    'def least_interval(tasks, n):',
    '    counts = Counter(tasks)',
    '    top = max(counts.values())                          # the busiest task',
    '    ties = sum(1 for c in counts.values() if c == top)  # how many tasks are that busy',
    '    # (top - 1) full rounds of n + 1 slots, then one last row for the busiest tasks',
    '    frame = (top - 1) * (n + 1) + ties',
    '    return max(len(tasks), frame)                       # idle time only when the frame is longer',
  ].join('\n') + '\n',
  mutants: [
    { name: 'ignores the cooldown and returns the number of tasks', code: 'def least_interval(tasks, n):\n    return len(tasks)\n' },
    { name: 'forgets that several tasks can tie for the highest count', code: 'from collections import Counter\n\ndef least_interval(tasks, n):\n    top = max(Counter(tasks).values())\n    return max(len(tasks), (top - 1) * (n + 1) + 1)\n' },
    { name: 'forgets that there is never less time than the number of tasks', slipsPastSamples: true, code: 'from collections import Counter\n\ndef least_interval(tasks, n):\n    counts = Counter(tasks)\n    top = max(counts.values())\n    ties = sum(1 for c in counts.values() if c == top)\n    return (top - 1) * (n + 1) + ties\n' },
  ],
  hints: [
    'Do not simulate the schedule. Ask which task forces the most waiting, and build the shortest schedule around it.',
    'The task that appears most often (say `top` times) needs `top - 1` gaps of `n` units between its runs. Picture rows of `n + 1` slots with one copy of it at the start of each row.',
    'The length is (top - 1) * (n + 1), plus one slot for every task that ties for the top count (they share the last row). But it can never be shorter than the number of tasks, so take the max with len(tasks).',
  ],
  approach: para(
    '**Trigger:** "cooldown between the same item", "minimum time with idle slots". **Pattern:** count, then a **formula from the most frequent item**. No heap and no simulation is needed. **Complexity:** O(n) to count.',
    'The busiest task sets a frame of `(top - 1)` full rows of `n + 1` slots, then a last partial row holding one copy of each task tied for busiest. Everything else fits in the gaps of that frame.',
    'If there are so many different tasks that the gaps are all filled, nothing idles and the answer is just `len(tasks)`. That is why the formula needs the `max`.'
  ),
  cases: [
    { args: [['A', 'A', 'A', 'B', 'B', 'B'], 2], expect: 8 },
    { args: [['A', 'B', 'C'], 5], expect: 3 },
    { args: [['A', 'A', 'A', 'B', 'B', 'B'], 0], hidden: true, expect: 6 },
    { args: [['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D'], 1], hidden: true, expect: 8 },
    { args: [['A', 'A', 'A', 'A', 'A', 'A', 'B', 'C', 'D', 'E', 'F', 'G'], 2], hidden: true, expect: 16 },
    { args: [['A', 'A', 'A', 'B', 'B', 'B', 'C', 'C', 'C', 'D', 'D', 'E'], 2], hidden: true, expect: 12 },
  ],
};
