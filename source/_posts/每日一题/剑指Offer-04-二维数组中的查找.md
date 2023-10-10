---
title: 剑指Offer(04)二维数组中的查找
author: 小呆
cover: 'https://cover.xdxmblog.cn/cover/cover_8122.webp'
abbrlink: 8122
date: 2023-04-28 13:29:44
updated: 2023-04-28 13:29:44
tags:
  - 坐标轴法
categories: 每日一题
---

今天是小呆刷题的第 19 天，今天的题目是：剑指 Offer 的第 4 题，二维数组中的查找

## 题目要求

> 在一个`n * m`的二维数组中，每一行都按照从左到右**非递减**的顺序排序，每一列都按照从上到下**非递减**的顺序排序。请完成一个高效的函数，输入这样的一个二维数组和一个整数，判断数组中是否含有该整数。
>
> 来源：力扣（LeetCode）
> 链接：
> 著作权归领扣网络所有。商业转载请联系官方授权，非商业转载请注明出处。

<!--more-->

示例：

现有矩阵 matrix 如下：

```
[
  [1,   4,  7, 11, 15],
  [2,   5,  8, 12, 19],
  [3,   6,  9, 16, 22],
  [10, 13, 14, 17, 24],
  [18, 21, 23, 26, 30]
]
```

给定 target = `5`，返回`true`。

给定 target = `20`，返回`false`。

提示：

- `0 <= n <= 1000`
- `0 <= m <= 1000`

## 解题思路

这道题小呆的思路是先找出题中的二维数组规律。然后进行分析：因为这个二维数组每一行从左到右递增，每一列从上到下递增。所以我们能够得出：

1. 某列的某个数字，该数字上方的数字都比它小。
2. 某列的某个数字，该数字右侧的数字都比它小。

所以我们可以将这个二维数组的左下角定为原点，建立一个直角坐标轴。如果原点的数字比要查询的数字大，就往上移一位；如果原点的数字比要查询的数字小，就往右移一位。

话不多说，上图：

![二维数组中额查找-坐标轴法](//img.xdxmblog.cn/images/image-202304280001.gif)

```javascript
/**
 * @param {number[][]} matrix
 * @param {number} target
 * @return {boolean}
 */
var findNumberIn2DArray = function (matrix, target) {
  let x = matrix.length - 1,
    y = 0
  while (x >= 0 && y < matrix[0].length) {
    if (matrix[x][y] === target) {
      return true
    }
    if (matrix[x][y] > target) {
      x--
    } else {
      y++
    }
  }
  return false
}
```

## 小结

做了这么多天题，其实小呆发现解题的一个非常重要的点就是：**要善于发现题目所给的规律，运用恰当的计算机逻辑、数学知识等条件**。写不出来没关系，但是思维模式很重要。不要气馁，凤凰涅槃，浴火重生，我们也要有不屈不挠的坚强的意志。加油！

## 引用

本文内容参考了以下书籍，感兴趣的同学可以购买正版图书进行阅读。

《剑指 Offer 第 2 版》——作者：何海涛

[剑指 Offer 的第 4 题-二维数组中的查找](https://leetcode.cn/problems/er-wei-shu-zu-zhong-de-cha-zhao-lcof)
