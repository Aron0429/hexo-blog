---
title: LeetCode(485)最大连续1的个数
author: 小呆
abbrlink: 16414
cover: https://cover.xdxmblog.cn/cover/cover_16414.webp
date: 2023-04-21 11:07:38
updated: 2023-04-21 11:07:38
tags:
 - 算法
categories: 每日一题
---

今天是小呆刷题的第12天，今天的题目是：力扣（LeetCode)的第485题，最大连续1的个数

## 题目要求

> 给定一个二进制数组`nums`， 计算其中最大连续`1`的个数。

<!--more-->

示例：

```
输入：nums = [1,1,0,1,1,1]
输出：3
解释：开头的两位和最后的三位都是连续 1 ，所以最大连续 1 的个数是 3.
```

提示：

- `1 <= nums.length <= 10^5`
- `nums[i]`不是`0`就是`1`.

## 解题思路

这道题还是比较简单的，题目要求计算最大连续的`1`的个数，那我们每遇到1个`1`，就计数一次，如果遇到`0`，说明中断了，就重新计数，最后返回计数的值就可以了。由于重新计数会覆盖之前的计数，所以还需要额外的一个变量来储存返回值。老规矩，哪怕再简单的题，一图胜千言。

![最大连续1的个数](//img.xdxmblog.cn/images/image-202304210001.gif)

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var findMaxConsecutiveOnes = function(nums) {
	let count = 0, result = 0
  for(let num of nums) {
    if(num === 1) {
      count++
    } else {
      result = result > count ? result : count
      count = 0
    }
  }
  return result > count ? result : count
};
```

除了上面的解法，评论区的[东冬d](https://leetcode.cn/u/dong-dong-d-c/)的思路也非常的有意思，可惜小呆（数学渣渣）没想到啊。这位同学的思路是这样的：

1. 由于数组中只有`0`和`1`，由于`0`乘任何数等于`0`,`1`乘任何数等于`1`
2. 循环数组时，加上当前数字再乘以当前数字，等同于遇一加一，遇零清零

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var findMaxConsecutiveOnes = function(nums) {
  let cur = 0, maximum = 0
  for(let num in nums) {
    cur = (cur + num) * num
    if(cur > maximum) {
      maximum = cur
    }
  }
  return maximum
};
```

## 小结

其实不难看出，做题的思维，有些时候往往就隔着一层纱，不断拓宽的视野，丰富的知识掌握，会让刷题的过程有意向不到的收获~加油吧！

## 引用

[力扣LeetCode的第485题-最大连续1的个数](https://leetcode.cn/problems/max-consecutive-ones/)

