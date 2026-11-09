const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d20-number-of-islands', day: 20, lc: 'number-of-islands', anchor: 'Number of Islands', cat: 'BUILD', bounty: 10, lang: 'python',
  title: 'Number of Islands', kind: 'func', fn: 'num_islands', cmp: 'eq',
  signature: 'def num_islands(grid: list[list[int]]) -> int',
  statement: para(
    'A map is a grid of numbers: `1` is land and `0` is water. An **island** is a group of land cells connected **up, down, left or right**. Cells that touch only at a corner are **not** connected.',
    'Return how many islands the grid has. An empty grid has none.'
  ),
  starter: 'def num_islands(grid):\n    # Return the number of islands (groups of 1s connected up, down, left, right).\n    pass\n',
  solution: [
    'def num_islands(grid):',
    '    if not grid:',
    '        return 0',
    '    rows, cols = len(grid), len(grid[0])',
    '    seen = set()',
    '    islands = 0',
    '    for r in range(rows):',
    '        for c in range(cols):',
    '            if grid[r][c] == 1 and (r, c) not in seen:',
    '                islands += 1                          # a new island: flood it so it is not counted again',
    '                seen.add((r, c))',
    '                stack = [(r, c)]',
    '                while stack:',
    '                    y, x = stack.pop()',
    '                    for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):',
    '                        if 0 <= ny < rows and 0 <= nx < cols and grid[ny][nx] == 1 and (ny, nx) not in seen:',
    '                            seen.add((ny, nx))',
    '                            stack.append((ny, nx))',
    '    return islands',
  ].join('\n') + '\n',
  mutants: [
    { name: 'also joins land that touches at a corner', code: 'def num_islands(grid):\n    if not grid:\n        return 0\n    R, C = len(grid), len(grid[0])\n    seen, n = set(), 0\n    for r in range(R):\n        for c in range(C):\n            if grid[r][c] == 1 and (r, c) not in seen:\n                n += 1\n                seen.add((r, c))\n                st = [(r, c)]\n                while st:\n                    y, x = st.pop()\n                    for dy in (-1, 0, 1):\n                        for dx in (-1, 0, 1):\n                            ny, nx = y + dy, x + dx\n                            if 0 <= ny < R and 0 <= nx < C and grid[ny][nx] == 1 and (ny, nx) not in seen:\n                                seen.add((ny, nx))\n                                st.append((ny, nx))\n    return n\n' },
    { name: 'counts land cells', code: 'def num_islands(grid):\n    return sum(sum(row) for row in grid)\n' },
    { name: 'counts the runs of land in each row', code: 'def num_islands(grid):\n    n = 0\n    for row in grid:\n        prev = 0\n        for v in row:\n            if v == 1 and prev == 0:\n                n += 1\n            prev = v\n    return n\n' },
    { name: 'only looks right and down, so it misses land reached by going left or up', slipsPastSamples: true, code: 'def num_islands(grid):\n    if not grid:\n        return 0\n    R, C = len(grid), len(grid[0])\n    seen, n = set(), 0\n    for r in range(R):\n        for c in range(C):\n            if grid[r][c] == 1 and (r, c) not in seen:\n                n += 1\n                seen.add((r, c))\n                st = [(r, c)]\n                while st:\n                    y, x = st.pop()\n                    for ny, nx in ((y + 1, x), (y, x + 1)):\n                        if ny < R and nx < C and grid[ny][nx] == 1 and (ny, nx) not in seen:\n                            seen.add((ny, nx))\n                            st.append((ny, nx))\n    return n\n' },
  ],
  hints: [
    'Scan the grid cell by cell. When you meet land you have not seen yet, you have found a new island, and the whole island should be marked so you never count it twice.',
    'Marking an island is a flood fill: from that cell, visit every land neighbour, then their neighbours, until no land is left to reach. A stack (DFS) or a queue (BFS) both work.',
    'Keep a seen set of cells. Each time the scan finds land that is not in seen, add 1 to the answer and flood from there. Check the grid edges before you look at a neighbour.',
  ],
  approach: para(
    '**Trigger:** "connected groups", "regions", "components" on a grid. **Pattern:** scan + flood fill (DFS or BFS), counting how many times a flood starts. **Complexity:** O(rows x cols) time and space, because each cell is visited once.',
    'An iterative stack avoids Python\'s recursion limit on a large grid. A recursive DFS is shorter, and fine for small ones.',
    'Neighbours are the **four** directions. Including diagonals (eight directions) merges islands that only touch at a corner, which is a different question.'
  ),
  cases: [
    { args: [[[1, 1, 0, 0, 0], [1, 1, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 1, 1]]], expect: 3 },
    { args: [[[1, 0, 1], [0, 0, 0], [1, 0, 1]]], expect: 4 },
    { args: [[]], hidden: true, expect: 0 },
    { args: [[[0, 0], [0, 0]]], hidden: true, expect: 0 },
    { args: [[[1, 1], [1, 1]]], hidden: true, expect: 1 },
    { args: [[[1, 0, 1], [0, 1, 0], [1, 0, 1]]], hidden: true, expect: 5 },
    { args: [[[1, 1, 1], [0, 0, 1], [1, 1, 1], [1, 0, 0], [1, 1, 1]]], hidden: true, expect: 1 },
  ],
};
