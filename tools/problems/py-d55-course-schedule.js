const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d55-course-schedule', day: 55, lc: 'course-schedule', anchor: 'LC 207', cat: 'PRACTICE', bounty: 20, lang: 'python',
  title: 'Course Schedule', kind: 'func', fn: 'can_finish', cmp: 'eq',
  signature: 'def can_finish(num_courses: int, prerequisites: list[list[int]]) -> bool',
  statement: para(
    'A school offers `num_courses` courses, numbered `0` to `num_courses - 1`. A prerequisite `[a, b]` means you must finish course `b` **before** you can take course `a`.',
    'Return `True` if it is possible to finish **all** the courses, and `False` if not (for example, when two courses need each other first). A course can be its own prerequisite, which makes finishing impossible.',
    'Some courses may have no prerequisites at all, and some may not be connected to any other.'
  ),
  starter: 'def can_finish(num_courses, prerequisites):\n    # Return True if you can finish every course, False if the prerequisites form a loop.\n    pass\n',
  solution: [
    'from collections import deque',
    '',
    'def can_finish(num_courses, prerequisites):',
    '    needs = [0] * num_courses                  # how many prerequisites each course still waits for',
    '    unlocks = [[] for _ in range(num_courses)]  # course -> courses that need it',
    '    for course, before in prerequisites:',
    '        needs[course] += 1',
    '        unlocks[before].append(course)',
    '    ready = deque(c for c in range(num_courses) if needs[c] == 0)',
    '    taken = 0',
    '    while ready:',
    '        c = ready.popleft()',
    '        taken += 1',
    '        for nxt in unlocks[c]:',
    '            needs[nxt] -= 1',
    '            if needs[nxt] == 0:',
    '                ready.append(nxt)',
    '    return taken == num_courses                # a loop leaves some courses stuck forever',
  ].join('\n') + '\n',
  mutants: [
    { name: 'always says yes', code: 'def can_finish(num_courses, prerequisites):\n    return True\n' },
    { name: 'only notices two courses that need each other', slipsPastSamples: true, code: 'def can_finish(num_courses, prerequisites):\n    pairs = set(map(tuple, prerequisites))\n    return not any((b, a) in pairs for a, b in pairs)\n' },
    { name: 'only follows prerequisites that start from course 0', slipsPastSamples: true, code: 'def can_finish(num_courses, prerequisites):\n    nxt = {}\n    for a, b in prerequisites:\n        nxt.setdefault(b, []).append(a)\n    state = {}\n    def dfs(u):\n        if state.get(u) == 1:\n            return False\n        if state.get(u) == 2:\n            return True\n        state[u] = 1\n        for v in nxt.get(u, []):\n            if not dfs(v):\n                return False\n        state[u] = 2\n        return True\n    return dfs(0)\n' },
    { name: 'ignores a course that needs itself', slipsPastSamples: true, code: 'from collections import deque\n\ndef can_finish(num_courses, prerequisites):\n    prerequisites = [p for p in prerequisites if p[0] != p[1]]\n    needs = [0] * num_courses\n    out = [[] for _ in range(num_courses)]\n    for a, b in prerequisites:\n        needs[a] += 1\n        out[b].append(a)\n    q = deque(c for c in range(num_courses) if needs[c] == 0)\n    n = 0\n    while q:\n        c = q.popleft()\n        n += 1\n        for x in out[c]:\n            needs[x] -= 1\n            if needs[x] == 0:\n                q.append(x)\n    return n == num_courses\n' },
  ],
  hints: [
    'Draw each prerequisite as an arrow from the course you take first to the one that needs it. You can finish everything exactly when this picture has no loop.',
    'Think about which courses you can take right now: the ones that are waiting for nothing. Take them, and every course they unlock has one less prerequisite to wait for.',
    'Keep a count of unmet prerequisites per course and a queue of courses at 0. Pop, count it as taken, lower its neighbours, and enqueue any that reach 0. If you took every course, there was no loop.',
  ],
  approach: para(
    '**Trigger:** "ordering with dependencies", "can this be scheduled", "detect a cycle in a directed graph". **Pattern:** **topological sort** (Kahn\'s algorithm with a queue). **Complexity:** O(V + E).',
    'A loop means some courses can never reach zero waiting prerequisites. They stay stuck in the counts, and `taken` ends up smaller than `num_courses`.',
    'The three traps in the graph itself: a loop with more than two courses, a loop that does not include course 0, and a course that lists itself. Kahn\'s method handles all three without extra code.',
    'A depth-first search with three states (unseen, in progress, done) also works. You find a loop when you reach a course that is still in progress.'
  ),
  cases: [
    { args: [2, [[1, 0]]], expect: true },
    { args: [2, [[1, 0], [0, 1]]], expect: false },
    { args: [1, []], hidden: true, expect: true },
    { args: [2, []], hidden: true, expect: true },
    { args: [3, [[1, 0], [2, 1], [0, 2]]], hidden: true, expect: false },
    { args: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], hidden: true, expect: true },
    { args: [4, [[2, 1], [3, 2], [1, 3]]], hidden: true, expect: false },
    { args: [1, [[0, 0]]], hidden: true, expect: false },
    { args: [5, [[1, 0], [2, 1], [3, 2], [4, 3]]], hidden: true, expect: true },
  ],
};
