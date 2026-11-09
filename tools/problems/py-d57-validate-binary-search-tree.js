const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d57-validate-binary-search-tree', day: 57, lc: 'validate-binary-search-tree', anchor: 'LC 98', cat: 'PRACTICE', bounty: 20, lang: 'python',
  title: 'Validate Binary Search Tree', kind: 'func', fn: 'is_valid_bst', cmp: 'eq', conv: { args: { 0: 'tree' } },
  signature: 'def is_valid_bst(root: TreeNode | None) -> bool',
  statement: para(
    'A **binary search tree** (BST) follows one rule at every node: **every** value in its left subtree is **smaller** than the node, and **every** value in its right subtree is **larger**. Equal values are not allowed.',
    'Return `True` if the tree is a valid BST and `False` otherwise. An empty tree is valid.',
    'The tests write a tree as a list in level order, with `null` for a missing child. Your function gets the root as a `TreeNode` (already defined for you, with fields `val`, `left` and `right`) or `None`.'
  ),
  starter: 'def is_valid_bst(root):\n    # root is a TreeNode (fields: val, left, right) or None.\n    # Return True if it is a valid binary search tree.\n    pass\n',
  solution: [
    'def is_valid_bst(root):',
    '    def ok(node, low, high):                 # every value must be strictly between low and high',
    '        if node is None:',
    '            return True',
    '        if (low is not None and node.val <= low) or (high is not None and node.val >= high):',
    '            return False',
    '        return ok(node.left, low, node.val) and ok(node.right, node.val, high)',
    '    return ok(root, None, None)',
  ].join('\n') + '\n',
  mutants: [
    { name: 'only compares each node with its own children', code: 'def is_valid_bst(root):\n    if root is None:\n        return True\n    if root.left and root.left.val >= root.val:\n        return False\n    if root.right and root.right.val <= root.val:\n        return False\n    return is_valid_bst(root.left) and is_valid_bst(root.right)\n' },
    { name: 'only checks the left side of the tree', code: 'def is_valid_bst(root):\n    while root and root.left:\n        if root.left.val >= root.val:\n            return False\n        root = root.left\n    return True\n' },
    { name: 'allows equal values', slipsPastSamples: true, code: 'def is_valid_bst(root):\n    def ok(node, low, high):\n        if node is None:\n            return True\n        if (low is not None and node.val < low) or (high is not None and node.val > high):\n            return False\n        return ok(node.left, low, node.val) and ok(node.right, node.val, high)\n    return ok(root, None, None)\n' },
  ],
  hints: [
    'It is not enough that each node beats its own two children. A node deep in the right subtree must also be bigger than the root.',
    'Pass a range down the tree. At the root, any value is allowed. Going left, the node\'s value becomes the new upper limit. Going right, it becomes the new lower limit.',
    'At each node, check low < value < high (strictly). Recurse into both children with their updated range. An empty node is valid.',
  ],
  approach: para(
    '**Trigger:** "check a rule that depends on ancestors, not just the parent". **Pattern:** a recursive walk that **carries bounds** down. **Complexity:** O(n) time, O(h) stack.',
    'The classic mistake is a **local check**: compare a node with its children only. The tree `5 -> (4, 6 -> (3, 7))` passes it, but `3` sits in the right subtree of `5`, so the tree is invalid.',
    'Another valid route is an in-order walk. A BST gives a **strictly increasing** sequence. Keep the previous value and fail on `<=`. Use `<=`, not `<`, so equal values are rejected.'
  ),
  cases: [
    { args: [[2, 1, 3]], expect: true },
    { args: [[5, 4, 6, null, null, 3, 7]], expect: false },
    { args: [[]], hidden: true, expect: true },
    { args: [[1]], hidden: true, expect: true },
    { args: [[2, 2, 2]], hidden: true, expect: false },
    { args: [[1, null, 1]], hidden: true, expect: false },
    { args: [[3, 1, 5, 0, 2, 4, 6]], hidden: true, expect: true },
    { args: [[10, 5, 15, null, null, 6, 20]], hidden: true, expect: false },
    { args: [[32, 26, 47, 19, null, null, 56, null, 27]], hidden: true, expect: false },
  ],
};
