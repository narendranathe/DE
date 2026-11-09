const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d20-binary-tree-level-order-traversal', day: 20, lc: 'binary-tree-level-order-traversal', anchor: 'Binary Tree Level Order Traversal', cat: 'BUILD', bounty: 10, lang: 'python',
  title: 'Binary Tree Level Order Traversal', kind: 'func', fn: 'level_order', cmp: 'eq', conv: { args: { 0: 'tree' } },
  signature: 'def level_order(root: TreeNode | None) -> list[list[int]]',
  statement: para(
    'Return the values of a binary tree **one level at a time**, from the top level to the bottom, and from left to right inside each level. The result is a list of lists: one inner list per level.',
    'The tests write a tree as a list in level order, with `null` for a missing child. Your function gets the root as a `TreeNode` (already defined for you, with fields `val`, `left` and `right`) or `None` for an empty tree. An empty tree gives an empty list.'
  ),
  starter: 'def level_order(root):\n    # root is a TreeNode (fields: val, left, right) or None.\n    # Return a list of levels, each level a list of values.\n    pass\n',
  solution: [
    'from collections import deque',
    '',
    'def level_order(root):',
    '    if root is None:',
    '        return []',
    '    levels = []',
    '    queue = deque([root])',
    '    while queue:',
    '        level = []',
    '        for _ in range(len(queue)):          # exactly the nodes of this level',
    '            node = queue.popleft()',
    '            level.append(node.val)',
    '            if node.left:',
    '                queue.append(node.left)',
    '            if node.right:',
    '                queue.append(node.right)',
    '        levels.append(level)',
    '    return levels',
  ].join('\n') + '\n',
  mutants: [
    { name: 'returns one flat list instead of a list of levels', code: 'def level_order(root):\n    out, q = [], [root] if root else []\n    for node in q:\n        out.append(node.val)\n        if node.left:\n            q.append(node.left)\n        if node.right:\n            q.append(node.right)\n    return out\n' },
    { name: 'lists the levels from the bottom up', code: 'def level_order(root):\n    if root is None:\n        return []\n    levels, q = [], [root]\n    while q:\n        levels.append([n.val for n in q])\n        q = [c for n in q for c in (n.left, n.right) if c]\n    return levels[::-1]\n' },
    { name: 'follows only the left children', code: 'def level_order(root):\n    levels = []\n    while root:\n        levels.append([root.val])\n        root = root.left\n    return levels\n' },
    { name: 'gives [[]] for an empty tree', slipsPastSamples: true, code: 'def level_order(root):\n    if root is None:\n        return [[]]\n    levels, q = [], [root]\n    while q:\n        levels.append([n.val for n in q])\n        q = [c for n in q for c in (n.left, n.right) if c]\n    return levels\n' },
  ],
  hints: [
    'Visit the tree in the order "all of level 0, then all of level 1, ...". That is breadth-first search, and a queue gives you that order.',
    'Start with the root in a queue. At each round, the queue holds exactly one level. Take its size first, so you know how many nodes belong to this level.',
    'Pop that many nodes, record their values as one inner list, and push their children for the next round. Stop when the queue is empty.',
  ],
  approach: para(
    '**Trigger:** "level by level", "closest first", "shortest number of steps". **Pattern:** breadth-first search with a queue, taking the queue size at the start of each round. **Complexity:** O(n) time, O(w) space for the widest level `w`.',
    'The trick is `for _ in range(len(queue))`. The size is read **before** the loop, so children added during the loop wait for the next round. That is how a flat queue turns into separate levels.',
    'Use `collections.deque` and `popleft()`. `list.pop(0)` shifts every element and makes it O(n) per pop.'
  ),
  cases: [
    { args: [[3, 9, 20, null, null, 15, 7]], expect: [[3], [9, 20], [15, 7]] },
    { args: [[1, 2, 3, 4, 5]], expect: [[1], [2, 3], [4, 5]] },
    { args: [[]], hidden: true, expect: [] },
    { args: [[1]], hidden: true, expect: [[1]] },
    { args: [[1, null, 2, null, 3]], hidden: true, expect: [[1], [2], [3]] },
    { args: [[1, 2, 3, null, 4, 5]], hidden: true, expect: [[1], [2, 3], [4, 5]] },
  ],
};
