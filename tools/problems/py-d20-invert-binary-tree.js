const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d20-invert-binary-tree', day: 20, lc: 'invert-binary-tree', anchor: 'Invert Binary Tree', cat: 'BUILD', bounty: 10, lang: 'python',
  title: 'Invert Binary Tree', kind: 'func', fn: 'invert_tree', cmp: 'eq', conv: { args: { 0: 'tree' }, ret: 'tree' },
  signature: 'def invert_tree(root: TreeNode | None) -> TreeNode | None',
  statement: para(
    'Flip a binary tree left to right: at **every** node, the left and right children trade places. Return the root of the flipped tree.',
    'The tests write a tree as a list in level order, with `null` for a missing child: `[4, 2, 7, 1, 3, 6, 9]` is a root `4` with children `2` and `7`, and so on. Your function gets the root as a `TreeNode` (already defined for you, with fields `val`, `left` and `right`) or `None` for an empty tree. Return a `TreeNode` or `None`.'
  ),
  starter: 'def invert_tree(root):\n    # root is a TreeNode (fields: val, left, right) or None.\n    # Return the root of the flipped tree.\n    pass\n',
  solution: [
    'def invert_tree(root):',
    '    if root is None:',
    '        return None',
    '    # flip the two subtrees first, then swap them',
    '    root.left, root.right = invert_tree(root.right), invert_tree(root.left)',
    '    return root',
  ].join('\n') + '\n',
  mutants: [
    { name: 'swaps the children of the root only', code: 'def invert_tree(root):\n    if root is not None:\n        root.left, root.right = root.right, root.left\n    return root\n' },
    { name: 'returns the tree unchanged', code: 'def invert_tree(root):\n    return root\n' },
    { name: 'goes down one side only, so the other side is never flipped', code: 'def invert_tree(root):\n    if root is None:\n        return None\n    root.left, root.right = root.right, root.left\n    invert_tree(root.left)\n    return root\n' },
    { name: 'crashes on an empty tree', slipsPastSamples: true, code: 'def invert_tree(root):\n    if root.left:\n        invert_tree(root.left)\n    if root.right:\n        invert_tree(root.right)\n    root.left, root.right = root.right, root.left\n    return root\n' },
  ],
  hints: [
    'Flipping a whole tree means every node swaps its two children. The same job repeats at each node, so think recursion.',
    'For one node: flip the left subtree, flip the right subtree, then swap the two. The base case is an empty tree, which has nothing to flip.',
    'Do it in one line: root.left, root.right = invert_tree(root.right), invert_tree(root.left). Return root so the caller gets the new tree.',
  ],
  approach: para(
    '**Trigger:** "do the same thing at every node of a tree". **Pattern:** recursion with the base case `None`. **Complexity:** O(n) time, O(h) stack, where `h` is the height.',
    'Each call trusts the call below it to hand back a correctly flipped subtree. You only have to swap them at your own level.',
    'The base case is part of the answer: an empty tree is a valid input, and `root.left` on `None` raises an error. A breadth-first loop with a queue gives the same result without recursion.'
  ),
  cases: [
    { args: [[4, 2, 7, 1, 3, 6, 9]], expect: [4, 7, 2, 9, 6, 3, 1] },
    { args: [[2, 1, 3]], expect: [2, 3, 1] },
    { args: [[]], hidden: true, expect: [] },
    { args: [[1]], hidden: true, expect: [1] },
    { args: [[1, 2]], hidden: true, expect: [1, null, 2] },
    { args: [[1, null, 2, 3]], hidden: true, expect: [1, 2, null, null, 3] },
  ],
};
