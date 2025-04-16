---
title: LeetCode(83)删除排序链表中的重复元素
author: 小呆
tags:
  - 双指针算法
categories: 
  - 前端积累
  - 算法练习
abbrlink: 39872
cover: https://cover.xdxmblog.cn/cover/cover_39872.webp
date: 2023-04-30 13:00:15
updated: 2023-04-30 13:00:15
---

今天要练习的题目是：力扣（LeetCode)的第83题，删除排序链表中的重复元素

## 题目要求

> 给定一个已排序的链表的头`head`，*删除所有重复的元素，使每个元素只出现一次*。返回*已排序的链表*。

<!--more-->

示例：

![删除排序链表中的重复元素](https://img.xdxmblog.cn/images/article_39872_01.png)

```
输入：head = [1,1,2,3,3]
输出：[1,2,3]
```

提示：

- 链表中节点数目在范围`[0, 300]`内
- `-100 <= Node.val <= 100`
- 题目数据保证链表已经按升序**排列**

## 解题思路

由于链表已经按升序排列，所以值相同的两个节点肯定相连。这道题的本质其实与[昨天的题](https://www.xdxmblog.cn/posts/1148.html)一样，只不过数据结构由数组变成了链表。我们依然可以使用**双指针算法**来解决。

依旧用一张git图来帮助理解代码在循环过程中，及最后的`slow.next = null`的作用。

![删除排序链表中的重复元素](https://img.xdxmblog.cn/images/article_39872_02.gif)

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
var deleteDuplicates = function(head) {
    if(head === null) return null // 判断链表的边界值
    let fast = head, slow = head
    while(fast !== null) {
        if(fast.val !== slow.val) {
            slow.next = fast  // 
            slow = slow.next
        }
        fast = fast.next
    }
    slow.next = null
    return head
}
```

由于`JavaScript`自带垃圾回收机制，会自动回收那些未被引用的链表节点，所以我们无需对它们进行额外的操作来释放内存。

## 小结

依旧是一道`easy`难度的题，但是有了昨天的经验，这道题我马上就有了思路，只需要实现代码即可。水滴石穿，坚持下去才能有所收货，加油！

## 引用

[力扣LeetCode的第83题-删除排序链表中的重复元素](https://leetcode.cn/problems/remove-duplicates-from-sorted-list/)

[双指针技巧秒杀七道数组题目——作者：labuladong](https://labuladong.gitee.io/algo/di-yi-zhan-da78c/shou-ba-sh-48c1d/shuang-zhi-fa4bd/)

