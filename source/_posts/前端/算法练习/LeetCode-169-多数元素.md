---
title: LeetCode(169)多数元素
author: 小呆
cover: 'https://cover.xdxmblog.cn/cover/cover_53817.webp'
abbrlink: 53817
date: 2023-04-25 15:12:07
updated: 2023-04-25 15:12:07
tags:
  - 哈希表
  - 摩尔投票算法
categories: 算法练习
---

今天是小呆刷题的第 16 天，今天的题目是：力扣（LeetCode)的第 169 题，多数元素

## 题目要求

> 给定一个大小为`n`的数组`nums`，返回其中的多数元素。多数元素是指在数组中出现次数**大于**`⌊ n/2 ⌋`的元素。
>
> 你可以假设数组是非空的，并且给定的数组总是存在多数元素。

<!--more-->

示例：

```
输入：nums = [3,2,3]
输出：3

输入：nums = [2,2,1,1,1,2,2]
输出：2
```

提示：

- `n == nums.length`
- `1 <= n <= 5 * 104`
- `-109 <= nums[i] <= 109`

## 解题思路

这道题小呆的第一思路就是用**哈希表**来解决，因为跟返回数组中出现次数最多的题的思路是一样的，只不过这道题是返回次数大于`n/2`的那个元素。

![哈希表-多数元素](https://img.xdxmblog.cn/images/article_53817_01.gif)

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var majorityElement = function (nums) {
  let hasMap = new Map(),
    half = nums.length / 2

  for (let num of nums) {
    if (hasMap.has(num)) {
      hasMap.set(num, hasMap.get(num) + 1)
    } else {
      hasMap.set(num, 1)
    }
    if (hasMap.get(num) > half) {
      return num
    }
  }
}
```

习惯性的做完去评论区开拓视野，然后发现了这道题至少有 4 种解法，除了上面的哈希表，还可以用**排序**、**摩尔投票**、**分治**来解决，分治目前小呆还没接触过，所以直接跳过，等到学会分治算法之后再回过头来看这道题。其他两种题解分享一下,首先是排序：

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var majorityElement = function (nums) {
  nums.sort((a, b) => a - b)
  return Math.floor(nums.length / 2)
}
```

其次是摩尔投票，**摩尔投票的核心就是对拼消耗**。评论区`你我山巅自相逢`同学解释的挺好：

> 题目中我们需要查找的数字超过数组长度的一半，也就是说，要查找的数字 target 的个数会超过其他数字个数。
>
> 假设不同数字相互抵消，那么最后剩下的数字，就是我们要找的多数元素。
>
> 我们可以把这个过程打个比方，比如现在多军对峙，假设阵营 A 士兵人数比其他方的人数都多，阵营 A 士兵能以一杀一，那么只要阵营 A 士兵不杀自己人（相同数字），去杀不同阵营的人（不同数字），那么最后剩下的那些士兵，就是阵营 A 的士兵。

![摩尔投票-多数元素](https://img.xdxmblog.cn/images/article_53817_02.png)

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var majorityElement = function (nums) {
  let count = 1
  let majority = nums[0] // 先选择nums[0]所代表的队伍为对拼方
  for (let i = 1; i < nums.length; i++) {
    if (count === 0) {
      // 这支队伍暂时没人了可以对拼了，那就先换只队伍
      marjority = nums[i]
    }
    if (nums[i] === majority) {
      // 友军，拉到我们的队伍里
      count++
    } else {
      count-- // 非友军，对拼消耗
    }
  }
}
```

## 小结

今天又学到了一种新算法，摩尔投票法，收获满满！

## 引用

[力扣 LeetCode 的第 169 题-多数元素](https://leetcode.cn/problems/majority-element/submissions/)

[通俗易懂的摩尔投票法-作者：你我山巅自相逢](https://leetcode.cn/problems/majority-element/solution/tong-su-yi-dong-mo-er-tou-piao-fa-by-ni-h4m1b/)
