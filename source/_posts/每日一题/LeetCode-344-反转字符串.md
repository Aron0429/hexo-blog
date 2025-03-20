---
title: LeetCode(344)反转字符串
author: 小呆
tags:
  - 双指针算法
categories: 每日一题
abbrlink: 26802
cover: https://cover.xdxmblog.cn/cover/cover_26802.webp
date: 2023-04-17 23:16:41
updated: 2023-04-17 23:16:41
---

今天是小呆刷题的第8天，今天的题目是：力扣（LeetCode)的第344题，反转字符串

## 题目要求

> 编写一个函数，其作用是将输入的字符串反转过来。输入字符串以字符数组`s`的形式给出。
>
> 不要给另外的数组分配额外的空间，你必须原地**修改输入数组**、使用`O(1)`的额外空间解决这一问题。
>

<!--more-->

示例：

```
输入：s = ["h","e","l","l","o"]
输出：["o","l","l","e","h"]
```

提示：

- `1 <= s.length <= 10^5`
- `s[i]`都是[ASCII](https://baike.baidu.com/item/ASCII)码表中的可打印字符

## 解题思路

这道题，由于题目要求**原地修改数组**，小呆首先想到了前几天一直在用的双指针算法。具体思路如下：

1. 设置`left`,`right`两个指针，一个指向数组头部，一个指向数组尾部
2. 循环条件是`left <= right`
3. 设置一个`temp`变量，用于`left`和`right`交换时的中转站
4. 交换`left,right`，让`left`往后移一步，`right`往前移一步

具体过程用gif图辅助理解一下：

![反转字符串](http://img.xdxmblog.cn/images/image-202304170001.gif)

```javascript
/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
var reverseString = function(s) {
    let left = 0, right = s.length - 1
    while(left <= right) {
        let temp = s[left]
        s[left] = s[right]
        s[right] = temp
        left++
        right--
    }
    return s
};
```

## 小结

果然只有不断的练习，才能对一些算法形成条件反射。比如原地修改类的题型，小呆就会首先想到双指针算法。加油加油加油！坚持下去，努力终有回报~

## 引用

[力扣LeetCode的第344题-反转字符串](https://leetcode.cn/problems/reverse-string)
