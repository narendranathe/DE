const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d71-clone-graph', day: 71, lc: 'clone-graph', anchor: 'LC 133', cat: 'PRACTICE', bounty: 20, lang: 'python',
  title: 'Clone Graph', kind: 'func', fn: 'clone_graph', cmp: 'eq', conv: { args: { 0: 'graph' }, ret: 'graph' },
  signature: 'def clone_graph(node: Node | None) -> Node | None',
  statement: para(
    'You get one node of a **connected, undirected graph**. Return a **deep copy** of the whole graph: new nodes with the same values and the same connections. The copy must not share any node with the original.',
    'Each node is an object `Node` with a number `val` and a list `neighbors` of other `Node`s. `Node` is already defined for you. Edges go both ways, so if A lists B, then B lists A. The graph can have loops.',
    'The tests write a graph as an adjacency list: entry `i` holds the numbers of the neighbours of node `i + 1`, and every node has `val = its own number`. Your function gets node 1 (or `None` for an empty graph) and returns the copy of node 1 (or `None`). If your copy reuses a node of the original, the checker tells you.'
  ),
  starter: 'def clone_graph(node):\n    # node is a Node (fields: val, neighbors) or None.\n    # Return the copy of node, with copies of everything reachable from it.\n    pass\n',
  solution: [
    'def clone_graph(node):',
    '    if node is None:',
    '        return None',
    '    copies = {node: Node(node.val)}          # original node -> its copy',
    '    stack = [node]',
    '    while stack:',
    '        current = stack.pop()',
    '        for nb in current.neighbors:',
    '            if nb not in copies:             # first time we meet this node: make its copy',
    '                copies[nb] = Node(nb.val)',
    '                stack.append(nb)',
    '            copies[current].neighbors.append(copies[nb])   # always wire the edge',
    '    return copies[node]',
  ].join('\n') + '\n',
  mutants: [
    { name: 'returns the original graph, not a copy', code: 'def clone_graph(node):\n    return node\n' },
    { name: 'copies the start node and its neighbours but nothing further', code: 'def clone_graph(node):\n    if node is None:\n        return None\n    root = Node(node.val)\n    root.neighbors = [Node(n.val) for n in node.neighbors]\n    return root\n' },
    { name: 'drops the edges that lead back to a node it already copied', code: 'def clone_graph(node):\n    if node is None:\n        return None\n    copies = {node: Node(node.val)}\n    stack = [node]\n    while stack:\n        cur = stack.pop()\n        for nb in cur.neighbors:\n            if nb not in copies:\n                copies[nb] = Node(nb.val)\n                copies[cur].neighbors.append(copies[nb])\n                stack.append(nb)\n    return copies[node]\n' },
    { name: 'new nodes that still point at the original neighbours', code: 'def clone_graph(node):\n    if node is None:\n        return None\n    return Node(node.val, node.neighbors)\n' },
    { name: 'crashes on an empty graph', slipsPastSamples: true, code: 'def clone_graph(node):\n    copies = {node: Node(node.val)}\n    stack = [node]\n    while stack:\n        cur = stack.pop()\n        for nb in cur.neighbors:\n            if nb not in copies:\n                copies[nb] = Node(nb.val)\n                stack.append(nb)\n            copies[cur].neighbors.append(copies[nb])\n    return copies[node]\n' },
  ],
  hints: [
    'Walk the graph from the start node and make a new node for every original node you meet. The hard part is to make exactly one copy per original, even when you reach it by several paths.',
    'Keep a dict from original node to its copy. Before you copy a node, check the dict. If it is there, reuse that copy instead of making another.',
    'For each original node you visit, loop over its neighbours. Create any missing copy (and remember to visit it later), then append the neighbour\'s copy to the current copy\'s neighbours. Do this for every edge, including edges back to nodes you have already copied.',
  ],
  approach: para(
    '**Trigger:** "copy a structure that can contain loops or shared parts". **Pattern:** DFS or BFS with a **map from original to copy**. **Complexity:** O(V + E) time and space.',
    'The map has two jobs. It stops the walk from going around a loop forever, and it makes sure every edge points at the **one** copy of its target, so the copy has the same shape as the original and not a tree of duplicates.',
    'Wire the edge **every** time, not only when you create the neighbour\'s copy. An edge back to a node that is already copied is still an edge.',
    'A recursive version is shorter: `clone(n)` returns `copies[n]` if it exists, otherwise creates the copy, stores it **before** recursing, and clones each neighbour.'
  ),
  cases: [
    { args: [[[2, 4], [1, 3], [2, 4], [1, 3]]], expect: [[2, 4], [1, 3], [2, 4], [1, 3]] },
    { args: [[[2], [1]]], expect: [[2], [1]] },
    { args: [[]], hidden: true, expect: [] },
    { args: [[[]]], hidden: true, expect: [[]] },
    { args: [[[2, 3], [1, 3], [1, 2]]], hidden: true, expect: [[2, 3], [1, 3], [1, 2]] },
    { args: [[[2, 3], [1], [1]]], hidden: true, expect: [[2, 3], [1], [1]] },
    { args: [[[2], [1, 3], [2, 4], [3, 5], [4]]], hidden: true, expect: [[2], [1, 3], [2, 4], [3, 5], [4]] },
  ],
};
