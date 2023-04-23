---
title: LeetCode(21)合并两个有序链表
author: 小呆
abbrlink: 39311
cover: https://cover.xdxmblog.cn/cover/cover_39311.webp
date: 2023-04-16 16:28:05
updated: 2023-04-16 16:28:05
tags:
 - 递归算法
categories: 每日一题
---

今天是小呆刷题的第7天，今天的题目是：力扣（LeetCode)的第21题，合并两个有序链表

## 题目要求

> 将两个升序链表合并为一个新的**升序**链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。

<!--more-->

示例：

![合并两个有序链表](//img.xdxmblog.cn/images/image-20230417163218173.png)

```
输入：l1 = [1,2,4], l2 = [1,3,4]
输出：[1,1,2,3,4,4]
```

提示：

- 两个链表的节点数目范围是`[0, 50]`
- `-100 <= Node.val <= 100`
- `l1`和`l2`均按**非递减顺序**排列

## 解题思路

这道题，5分钟内我没写出来。思路其实是有的，就是比较两个链表的头节点，把小的拿出来放前面，然后去比对剩下的两个链表，依次类推，但是问题是，思路有，但不知道该怎么写，这其实也是我刷题过程中最难受的。看了题解，用递归比较好实现。

1. 比较两个链表节点的val值，将值较小的节点往前排
2. 用值较小的节点的next节点，与另一个链表的节点比较，依次类比
3. 两个链表的任意一方到达尾部，直接返回另一方即可

具体过程用gif图辅助理解一下：

![合并两个有序链表](//img.xdxmblog.cn/images/image-202304160001.gif)

```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
var mergeTwoLists = function(list1, list2) {
  if(list1 === null) return list2
  if(list2 === null) return list1
  if(list1.val <= list2.val) {
    list1.next = mergeTwoLists(list1.next, list2)
    return list1
  } else {
    list2.next = mergeTwoLists(list, list2.next)
    return list2
  }
}
```

## 小结

递归，在日常的开发当中也会用到，比如生成一个`tree`树，看来递归算法的使用场景还是很多的。要强化练习才行啊~

### 引用

[力扣LeetCode的第21题-合并两个有序链表](https://leetcode.cn/problems/merge-two-sorted-lists/)
