---
title: LeetCode(206)反转链表
author: 小呆
tags:
  - 算法
  - 双指针算法
categories: 每日一题
abbrlink: 27687
cover: https://cover.xdxmblog.cn/cover/cover_27687.webp
date: 2023-04-15 16:05:05
updated: 2023-04-15 16:05:05
---

今天是小呆刷题的第6天，今天的题目是：力扣（LeetCode)的第206题，反转链表

## 题目要求

> 给你单链表的头节点`head` ，请你反转链表，并返回反转后的链表。

<!--more-->

示例：

![反转链表](//img.xdxmblog.cn/images/image-20230415160636127.png)

```
输入：head = [1,2,3,4,5]
输出：[5,4,3,2,1]
```

提示：

- 链表中节点的数目范围是`[0, 5000]`
- `-5000 <= Node.val <= 5000`

## 解题思路

关于链表和数组的题目，小呆还是优先考虑是否可以用双指针算法解决，毕竟最近刷的几道题都与双指针有关。由于链表之间是由`next`相连，所以反转链表其实就是把`next`的指向反转。那如何将`next`指向反转的呢？一共有3步：

1. 链表的尾部节点的`next`一定指向null，所以我们初始化两个指针`prev`，`curr`，让其一个指向`null`，一个指向链表头`head`
2. 进入循环，终止条件为`curr !== null`表示链表已经循环完毕
3. 由于反转`next`会断掉当前链表，所以创建一个临时变量`next`，指向`curr.next`，防止反转`next`找不到路
4. 将`curr.next`指向`prev`，然后将`prev`指向`curr`，最后将`curr`指向`next`
5. 最后返回`prev`，链接就反转完成了

老规矩一张动态gif图辅助理解代码：

![反转链表](//img.xdxmblog.cn/images/image-202304150001.gif)

```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function(head) {
  let prev = null, curr = head
  while(curr !== null) {
    const next = curr.next
    curr.next = prev
    prev = curr
    curr = next
  }
  return prev
}
```

## 引用

[力扣LeetCode的第206题-反转链表](https://leetcode.cn/problems/reverse-linked-list/submissions/)
