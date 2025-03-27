---
title: LeetCode(141)环形链表
author: 小呆
cover: 'https://cover.xdxmblog.cn/cover/cover_37519.webp'
abbrlink: 37519
date: 2023-04-24 11:00:44
updated: 2023-04-24 11:00:44
tags:
  - 双指针算法
categories: 
  - 前端积累
  - 算法练习
---

今天是小呆刷题的第 15 天，今天的题目是：力扣（LeetCode)的第 141 题，环形链表

## 题目要求

> 给你一个链表的头节点`head`，判断链表中是否有环。
>
> 如果链表中有某个节点，可以通过连续跟踪`next`指针再次到达，则链表中存在环。 为了表示给定链表中的环，评测系统内部使用整数`pos`来表示链表尾连接到链表中的位置（索引从 0 开始）。注意：`pos`不作为参数进行传递 。仅仅是为了标识链表的实际情况。
>
> 如果链表中存在环 ，则返回`true`。 否则，返回`false`。

<!--more-->

示例：

![环形链表-示例图](https://img.xdxmblog.cn/images/article_37519_01.png)

```
输入：head = [3,2,0,-4], pos = 1
输出：true
解释：链表中有一个环，其尾部连接到第二个节点。
```

提示：

- 链表中节点的数目范围是`[0, 10^4]`
- `-10^5 <= Node.val <= 10^5`
- `pos`为-1 或者链表中的一个**有效索引**。

## 解题思路

遇到数组，链表类的题目，首先考虑的就是**双指针算法**。在这道题中，由于存在一个环，实际上在遍历的时候，如果进入环中，就会无限循环。那其实只要两个指针的步频不一样，就会相交。上图辅助理解：

![双指针算法-环形链表](https://img.xdxmblog.cn/images/article_37519_02.gif)

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
 * @return {boolean}
 */
var hasCycle = function (head) {
  if (!head === null) return false // 判断边界值
  let fast = head,
    slow = head
  while (fast !== null && fast.next !== null) {
    fast = fast.next.next
    slow = slow.next
    if (fast == slow) {
      return true
    }
  }
  return false
}
```

然后依旧翻了翻了评论区，发现几个挺有意思的思路，这里也记录一下，但是面试时能不用就不用，不然容易被面试官送走。

### 标记法

给遍历过的节点打记号，如果遍历过程中遇到有记号的，说明成环了。

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
 * @return {boolean}
 */
var hasCycle = function (head) {
  if (!head === null) return false // 判断边界值
  while (head) {
    if (head.tag) {
      return true
    }
    head.tag = true
    head = head.next
  }
  return false
}
```

### JSON 序列化秒杀

利用`JSON.stringify()`无法对循环引用的对象做转化的特性，直接秒了。（这思路我咋就没想到呢）

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
 * @return {boolean}
 */
var hasCycle = function (head) {
  if (!head === null) return false // 判断边界值
  try {
    JSON.stringify(head)
  } catch {
    return true
  }
  return false
}
```

### 另辟蹊径法

题目说了范围不超过`100000`，没超过 size 能发现空节点`null`就是没有环，超过了就是有环~

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
 * @return {boolean}
 */
var hasCycle = function (head) {
  if (!head === null) return false // 判断边界值
  let i = 0,
    size = 100000
  let node = head
  while (++i <= size) {
    if (!node) return false
    node = node.next
  }
  return true
}
```

## 小结

有时候碰到不会的题，你会难过、甚至退缩，那么当你难过的时候，其实可以看看 LeetCode 的评论区，超多有意思的思路和别致的解题方法会让你忘掉难过，哈哈大笑。人总是要学会调节自己的情绪，才能更好的进行学习，生活也是如此，做人亦如此！

## 引用

[力扣 LeetCode 的第 141 题-环形链表](https://leetcode.cn/problems/linked-list-cycle/)
