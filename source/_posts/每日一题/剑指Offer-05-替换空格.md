---
title: 剑指Offer(05)替换空格
author: 小呆
cover: 'https://cover.xdxmblog.cn/cover/cover_50720.webp'
abbrlink: 50720
date: 2023-04-29 13:30:06
updated: 2023-04-29 13:30:06
keywords:
tags:
- 双指针算法
categories: 每日一题
---
今天是小呆刷题的第20天，今天的题目是：剑指Offer的第5题，替换空格

## 题目要求

> 请实现一个函数，把字符串`s`中的每个空格替换成"%20"。
>

<!--more-->

示例：

```
输入：s = "We are happy."
输出："We%20are%20happy."
```

提示：

- `0 <= s 的长度 <= 10000`

## 解题思路

这道题其实还是蛮简单的一道题，看过题目后小呆至少能想到三种方法：正则、分割、遍历。

### 正则

```javascript
/**
 * @param {string} s
 * @return {string}
 */
var replaceSpace = function(s) {
  return s.replace(/\s/g, '%20')
};
```

### 分割

```javascript
/**
 * @param {string} s
 * @return {string}
 */
var replaceSpace = function(s) {
  return s.split(' ').join('%20')
};
```

### 遍历+字符串拼接

```javascript
/**
 * @param {string} s
 * @return {string}
 */
var replaceSpace = function(s) {
  let ans = ''
  for(let i = 0; i < s.length; i++) {
    if(s[i] === ' ') {
      ans+= '%20'
    } else {
      ans += s[i]
    }
  }
  return ans
};
```

在《剑指Offer 第2版》一书中，作者给出了另一种实现思路。通过计算空格的数量，对字符串的长度进行扩充，然后利用双指针去替换其中的空格。当然因为在JavaScript中，字符串无法直接扩充长度，所以还是要进行转换操作，这里我们只学习其中的思路即可。

老规矩，动态辅助理解：

![替换空格-双指针算法](//img.xdxmblog.cn/images/image-202304290001.gif)

### 双指针

```javascript
/**
 * @param {string} s
 * @return {string}
 */
var replaceSpace = function(s) {
  let strArr = Array.from(s)
  let count = 0
  
  for(let i = 0; i < strArr.length; i++) {
    if(strArr[i] === ' ') {
      count++
    }
  }
  
  let left = strArr.length - 1
  let right = strArr.length + count * 2 - 1
	
  while(left >= 0) {
    if(strArr[left] === ' ') {
      strArr[right--] = '0'
      strArr[right--] = '2'
      strArr[right--] = '%'
      left--
    } else {
      strArr[right--] = strArr[left--]
    }
  }
  return strArr.join('')
};
```

## 小结

单从解题来看，其实利用现成的API或者遍历，要比双指针算法简单的多。并且由于JavaScript中字符串无法扩展长度，还是要转成数组进行操作，最终仍然要通过`Array.join()`方法再转换成字符串。但是双指针的这种思路，仍然值得我们去学习。

## 引用

本文内容参考了以下书籍，感兴趣的同学可以购买正版图书进行阅读。

《剑指Offer 第2版》——作者：何海涛

[剑指Offer的第5题-替换空格](https://leetcode.cn/problems/ti-huan-kong-ge-lcof/)
