---
title: 剑指Offer(06)从头到尾打印链表
author: 小呆
cover: 'https://cover.xdxmblog.cn/cover/cover_10125.webp'
abbrlink: 10125
date: 2023-04-30 13:30:20
updated: 2023-04-30 13:30:20
tags:
  - 栈结构
  - 递归算法
categories: 算法练习
---

今天是小呆刷题的第 21 天，今天的题目是：剑指 Offer 的第 6 题，从头到尾打印链表

## 题目要求

> 输入一个链表的头节点，从尾到头反过来返回每个节点的值（用数组返回）。

<!--more-->

示例：

```
输入：head = [1,3,2]
输出：[2,3,1]
```

提示：

- `0 <= 链表长度 <= 10000`

## 解题思路

首先这道题的输入是从头到位，但是输出却是从尾到头。也就是`FILO`**先进后出**，这妥妥的就是**栈结构**嘛。所以我们可以遍历一遍链表，然后将每一项都存入数组中，最后反转数组即可。

### 栈结构

```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} head
 * @return {number[]}
 */
var reversePrint = function (head) {
  let arr = [],
    node = head,
    ans = []
  while (node !== null) {
    arr.push(node.val)
    node = node.next
  }

  /* 不用API反转数组
    for(let i = arr.length - 1; i >= 0; i--) {
      ans.push(arr[i])
    }
  	return ans
  */
  return arr.reverse() // 利用API反转数组
}
```

当然，利用`API`的话，我们还有更加简洁的写法，毕竟 JavaScript 无所不能~（偷笑）

```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} head
 * @return {number[]}
 */
var reversePrint = function (head) {
  let ans = [],
    node = head
  while (node !== null) {
    ans.unshift(node.val)
    node = node.next
  }
  return ans
}
```

既然用到了栈结构，那小呆很自然也能想到使用递归，毕竟递归本质上就是一种栈结构。

### 递归算法

```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} head
 * @return {number[]}
 */
var reversePrint = function (head) {
  if (head === null) return []
  const ans = reversePrint(head.next)
  ans.push(head.val)
  return ans
}
```

## 小结

这道题其实并不难，只要能想到栈结构，基本思路就出来了。当然也可以先把链表反转，然后在从头到尾顺序添加到数组中即可，但是如果面试题中不允许修改链表的话，这种方法就不太适合了。具体情况根据面试题要求选择对应解法即可。

## 引用

本文内容参考了以下书籍，感兴趣的同学可以购买正版图书进行阅读。

《剑指 Offer 第 2 版》——作者：何海涛

[剑指 Offer 的第 6 题-从头到尾打印链表](https://leetcode.cn/problems/cong-wei-dao-tou-da-yin-lian-biao-lcof/)
