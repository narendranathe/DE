const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d75-k-closest-points-to-origin', day: 75, lc: 'k-closest-points-to-origin', anchor: 'LC 973', cat: 'PRACTICE', bounty: 20, lang: 'python',
  title: 'K Closest Points to Origin', kind: 'func', fn: 'k_closest', cmp: 'unordered',
  signature: 'def k_closest(points: list[list[int]], k: int) -> list[list[int]]',
  statement: para(
    'You get a list of points on a flat grid, each written `[x, y]`. Return the **`k` points closest to the origin** `(0, 0)`.',
    'Distance is the usual straight-line distance, `sqrt(x*x + y*y)`. You do not need the square root to compare distances: the point with the smaller `x*x + y*y` is the closer one.',
    'You can return the `k` points in **any order**. The tests never have a tie for the last place, so the answer is unique apart from its order.'
  ),
  starter: 'def k_closest(points, k):\n    # Return the k points closest to (0, 0), in any order.\n    pass\n',
  solution: [
    'import heapq',
    '',
    'def k_closest(points, k):',
    '    # compare squared distances: same order as real distances, and no square root',
    '    return heapq.nsmallest(k, points, key=lambda p: p[0] * p[0] + p[1] * p[1])',
  ].join('\n') + '\n',
  mutants: [
    { name: 'measures distance by |x| + |y| instead of straight-line distance', code: 'def k_closest(points, k):\n    return sorted(points, key=lambda p: abs(p[0]) + abs(p[1]))[:k]\n' },
    { name: 'returns the k farthest points', code: 'def k_closest(points, k):\n    return sorted(points, key=lambda p: p[0] * p[0] + p[1] * p[1], reverse=True)[:k]\n' },
    { name: 'returns the distances, not the points', code: 'def k_closest(points, k):\n    return sorted(p[0] * p[0] + p[1] * p[1] for p in points)[:k]\n' },
    { name: 'sorts by x only', slipsPastSamples: true, code: 'def k_closest(points, k):\n    return sorted(points, key=lambda p: p[0])[:k]\n' },
  ],
  hints: [
    'First decide what "closer" means as a number. For a point (x, y), a smaller x*x + y*y means closer, and you can skip the square root.',
    'The simplest way is to sort every point by that number and take the first k. That is O(n log n).',
    'For O(n log k), keep a max-heap of size k, or use heapq.nsmallest(k, points, key=...), which does the work for you.',
  ],
  approach: para(
    '**Trigger:** "the k best / nearest / largest items by some score". **Pattern:** a **score function**, then a **bounded heap** (or a sort). **Complexity:** O(n log k) with a heap, O(n log n) with a sort.',
    'Compare **squared** distances. `sqrt` is increasing, so it never changes which point is closer, and integers stay exact where floating point could round two close values into a tie.',
    'The score is the entire question. `|x| + |y|` (Manhattan distance) is a different distance, and ordering by `x` alone is not a distance at all.'
  ),
  cases: [
    { args: [[[1, 3], [-2, 2]], 1], expect: [[-2, 2]] },
    { args: [[[3, 3], [5, -1], [-2, 4]], 2], expect: [[3, 3], [-2, 4]] },
    { args: [[[0, 1], [1, 0]], 2], hidden: true, expect: [[0, 1], [1, 0]] },
    { args: [[[1, 1]], 1], hidden: true, expect: [[1, 1]] },
    { args: [[[0, 0], [5, 5], [-1, -1], [2, 2]], 3], hidden: true, expect: [[0, 0], [-1, -1], [2, 2]] },
    { args: [[[10, 0], [0, -9], [-3, 4], [6, 6]], 2], hidden: true, expect: [[-3, 4], [6, 6]] },
  ],
};
