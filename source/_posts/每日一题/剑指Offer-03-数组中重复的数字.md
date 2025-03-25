---
title: 剑指Offer(03)数组中重复的数字
author: 小呆
cover: 'https://cover.xdxmblog.cn/cover/cover_18093.webp'
abbrlink: 18093
date: 2023-04-27 11:33:12
updated: 2023-04-27 11:33:12
tags:
  - 哈希表
  - 排序算法
categories: 每日一题
---

今天是小呆刷题的第 18 天，今天的题目是：剑指 Offer 的第 3 题，数组中重复的数字

## 题目要求

> 找出数组中重复的数字。
>
> 在一个长度为`n`的数组`nums`里的所有数字都在`0～n-1`的范围内。数组中某些数字是重复的，但不知道有几个数字重复了，也不知道每个数字重复了几次。请找出数组中任意一个重复的数字。

<!--more-->

示例：

```
输入：
[2, 3, 1, 0, 2, 5, 3]
输出：2 或 3
```

提示：

- `2 <= n <= 100000`

## 解题思路

这道题的常规解法，就是利用哈希表，遍历数组，判断哈希表中是否包含当前值，如果包含，当前项就是重复项。这种在数组中查找重复的数字的题型，基本都可以用哈希表去解决，它的时间复杂度为`O(n)`，空间复杂度为`O(n)`。

### 哈希表

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var findRepeatNumber = function (nums) {
  let hasMap = new Set()
  for (let num of nums) {
    if (hasSet.has(num)) return num
    hasMap.add(num)
  }
}
```

当然我们也可以先将数组进行排序，排序后的数组，重复的两个数字一定相邻。

### 排序

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var findRepeatNumber = function (nums) {
  nums.sort((a, b) => a - b)
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === nums[i + 1]) {
      return nums[i]
    }
  }
  return -1
}
```

在《剑指 Offer 第 2 版》中，作者给出了另一种思路，是小呆之前没有想到过的。因为`nums`里的所有数字都在`0 ~ n - 1`的范围呢，那不重复的数字排序后，和下标应该是一一对应的。所以遍历时当遍历到下标为`i`的数字时，首先比较这个数字（用`m`表示）是不是等于`i`。如果是，则接着遍历下一个数字；如果不是，则再拿它和第`m`个数字进行比较。如果它和第`m`个数字相等，就找到了一个重复的数字；如果它和第`m`数字不相等，就把第`i`个数字和第`m`个数字交换，把`m`放到属于它的位置。

老规矩，配合动图去理解更佳：

![数组中重复的数字](https://img.xdxmblog.cn/images/article_18093_01.gif)

### 原地交换

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var findRepeatNumber = function (nums) {
  for (let i = 0; i < nums.length; i++) {
    while (nums[i] !== i) {
      if (nums[i] === nums[nums[i]]) {
        return nums[i]
      }
      let temp = nums[i]
      ;[nums[temp], nums[i]] = [nums[i], nums[temp]]
    }
  }
  return -1
}
```

注意在使用解构`[nums[temp], nums[i]] = [nums[i], nums[temp]]`前，声明临时变量时，末尾要加`;`，否则解构语句会报错。

## 小结

数组查找重复的数字，这种题型还是比较常见也是比较简单的，变种题型还会有查找数组中重复最多的数字，或者重复最多的次数。其实只要有了思路，基本都能写出来。当然《剑指 Offer 第 2 版》这本书中的思路也是非常能开拓视野的，感兴趣的小伙伴可以买来看看，书中的代码并非是 JavaScript，主要是开拓思路。

## 引用

本文内容参考了以下书籍，感兴趣的同学可以购买正版图书进行阅读。

《剑指 Offer 第 2 版》——作者：何海涛

[剑指 Offer 的第 3 题-数组中重复的数字](https://leetcode.cn/problems/shu-zu-zhong-zhong-fu-de-shu-zi-lcof)
