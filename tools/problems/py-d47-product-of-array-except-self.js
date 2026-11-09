const { para } = require('../build_problems.js');

module.exports = {
  id: 'py-d47-product-of-array-except-self', day: 47, lc: 'product-of-array-except-self', anchor: 'LC 238', cat: 'PRACTICE', bounty: 20, lang: 'python',
  title: 'Product of Array Except Self', kind: 'func', fn: 'product_except_self', cmp: 'eq',
  signature: 'def product_except_self(nums: list[int]) -> list[int]',
  statement: para(
    'Given a list `nums`, return a list `answer` of the same length where `answer[i]` is the **product of every number in `nums` except `nums[i]`**.',
    '**Do not use division.** Do it in O(n) time. The list can contain zeros and negative numbers. Every product fits in a normal integer.'
  ),
  starter: 'def product_except_self(nums):\n    # answer[i] = product of all numbers except nums[i]. No division.\n    pass\n',
  solution: [
    'def product_except_self(nums):',
    '    n = len(nums)',
    '    answer = [1] * n',
    '    running = 1',
    '    for i in range(n):                    # answer[i] = product of everything to the left of i',
    '        answer[i] = running',
    '        running *= nums[i]',
    '    running = 1',
    '    for i in range(n - 1, -1, -1):        # then multiply in the product of everything to the right',
    '        answer[i] *= running',
    '        running *= nums[i]',
    '    return answer',
  ].join('\n') + '\n',
  mutants: [
    { name: 'divides the total product by each number', code: 'def product_except_self(nums):\n    total = 1\n    for x in nums:\n        total *= x\n    return [total // x for x in nums]\n' },
    { name: 'divides, and answers 0 when it meets a zero', code: 'def product_except_self(nums):\n    total = 1\n    for x in nums:\n        total *= x\n    return [total // x if x else 0 for x in nums]\n' },
    { name: 'multiplies only the numbers on the left', code: 'def product_except_self(nums):\n    out, run = [], 1\n    for x in nums:\n        out.append(run)\n        run *= x\n    return out\n' },
    { name: 'multiplies only the two neighbours', code: 'def product_except_self(nums):\n    n = len(nums)\n    return [(nums[i - 1] if i > 0 else 1) * (nums[i + 1] if i < n - 1 else 1) for i in range(n)]\n' },
  ],
  hints: [
    'The product of everything except nums[i] is: (product of everything to the left of i) times (product of everything to the right of i).',
    'You can build the "left product" for every position in one pass from the left, keeping a running product. Store it in the answer list.',
    'Then walk from the right with a second running product, and multiply each answer entry by it. No division is needed, so zeros are no problem.',
  ],
  approach: para(
    '**Trigger:** "result at i depends on everything except i". **Pattern:** **prefix and suffix products**, two passes. **Complexity:** O(n) time, O(1) extra space (the answer list does not count).',
    'The division shortcut `total // x` fails the moment `x` is `0`. It breaks when there is one zero (the product for that position is not zero) and when there are two.',
    'The first pass stores the product of the numbers to the left. The second pass multiplies in the numbers to the right, using one variable that grows as you walk backwards.'
  ),
  cases: [
    { args: [[1, 2, 3, 4]], expect: [24, 12, 8, 6] },
    { args: [[-1, 1, 0, -3, 3]], expect: [0, 0, 9, 0, 0] },
    { args: [[2, 3]], hidden: true, expect: [3, 2] },
    { args: [[0, 0]], hidden: true, expect: [0, 0] },
    { args: [[1, 1, 1]], hidden: true, expect: [1, 1, 1] },
    { args: [[5, 0, 2]], hidden: true, expect: [0, 10, 0] },
    { args: [[-2, -3]], hidden: true, expect: [-3, -2] },
  ],
};
