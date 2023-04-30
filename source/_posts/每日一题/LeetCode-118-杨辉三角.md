---
title: LeetCode(118)杨辉三角
author: 小呆
cover: 'https://cover.xdxmblog.cn/cover/cover_24191.webp'
abbrlink: 24191
date: 2023-04-26 15:19:00
updated: 2023-04-26 15:19:00
keywords:
tags:
 - 动态规划
categories: 每日一题
---
今天是小呆刷题的第17天，今天的题目是：力扣（LeetCode)的第118题，杨辉三角

## 题目要求

> 给定一个非负整数*`numRows`，*生成「杨辉三角」的前*`numRows`*行。
>
> 在「杨辉三角」中，每个数是它左上方和右上方的数的和。

<!--more-->

![杨辉三角](//img.xdxmblog.cn/images/image-202304301533030.gif)

示例：

```
输入: numRows = 5
输出: [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]

输入: numRows = 1
输出: [[1]]
```

提示：

- `1 <= numRows <= 30`

## 解题思路

这道题其实官方已经给了非常容易理解的规律和图示：**每个数是它左上方和右上方的数的和**。

我们可以用一个二维数组来描述示例1的数据：

```javascript
let list = [
  [1],
  [1, 1],
  [1, 2, 1],
  [1, 3, 3, 1],
  [1, 4, 6, 4, 1]
]
```

根据上面给出的规律能够得出, 首尾的数字一定是1, 其次从第三行开始，除去首尾，其他的数字都是它左上方和右上方的数的和，所以我们可以做出以下公式：（用`i`表示行，用`j`表示列）

1. `list[i][0] = 1` 每行的第一个数字是1
2. `list[i][j] = list[i - 1][j - 1] + list[i - 1][j]` 当前行的第`j`个数等于上一行的`j - 1` + 上一行的`j`
3. `list[i][i] = 1` 每行的最后一个数字是1

不难看出，这道题其实用动态规划就可以解决:（本题动态gif图直接看上面给的官方图即可）

```javascript
/**
 * @param {number} numRows
 * @return {number[][]}
 */
var generate = function(numRows) {
  let ans = []
	for(let i = 0; i < numRows; i++) {
    ans[i] = [1] // 每一行的第一个数都是1
    for(let j = 1; j < i; j++) {
      ans[i][j] = ans[i - 1][j - 1] + ans[i - 1][j] // 当前行的第j个数等于上一行的j - 1 + 上一行的j
    }
    ans[i][i] = 1 // 每一行的最后一个数都是1
  }
  return ans
};
```

## 小结

刷题也有大半个月了，目前大部分题目都是刷的LeetCode热门100题，目前来看，简单难度的题目仔细思考还是能做出来的，但是看了几道中等难度的题目，基本上没思路的居多。只能先把同类型的简单题目多练习练习再去尝试中等难度的题目了。加油吧！

## 引用

[力扣LeetCode的第118题-杨辉三角](https://leetcode.cn/problems/pascals-triangle/)
