---
title: LeetCode(20)有效的括号
author: 小呆
abbrlink: 14676
cover: https://cover.xdxmblog.cn/cover/cover_14676.webp
date: 2023-04-18 11:37:29
updated: 2023-04-18 11:37:29
tags:
 - 栈
categories: 每日一题
---

今天是小呆刷题的第9天，今天的题目是：力扣（LeetCode)的第20题，有效的括号

## 题目描述

> 给定一个只包括`'('`，`')'`，`'{'`，`'}'`，`'['`，`']'`的字符串`s`，判断字符串是否有效。
>
> 有效字符串需满足：
>
> 1. 左括号必须用相同类型的右括号闭合。
> 2. 左括号必须以正确的顺序闭合。
> 3. 每个右括号都有一个对应的相同类型的左括号。

<!--more-->

示例：

```
输入：s = "()"
输出：true

输入：s = "(]"
输出：false
```

提示：

- `1 <= s.length <= 10^4`
- `s`仅由括号`'()[]{}'`组成

## 解题思路

小呆做这道题的时候，5分钟内没解出来，果断看评论区和题解。这道题的主流思路是用栈来解决，由于括号都是成对出现的，所以我们可以让左侧的括号入栈，当遇到右侧的括号时，出栈匹配，能匹配到，就接着循环，直到所有括号都匹配完或者出现不匹配为止。在`JavaScript`中我们很容易用数组模拟一个栈。步骤如下：

1. 判断`s.length`是否为双数，如果是单数，直接返回`false`
2. 循环字符串，遇到左侧括号就执行入栈
3. 遇到右侧括号，出栈比对，匹配绩效执行，否则退出循环`false`
4. 所有括号匹配完，栈为空，则符合条件

老规矩，上gif图来辅助理解：

![有效的括号](//img.xdxmblog.cn/images/image-202304180001.gif)

```javascript
/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    let stack = []
    for(let item of s) {
      case '(':
      case '[':
      case '{':
      	stack.push(item)
      	break
      case: ')':
      	if(stack.pop() !== '(') return false
      	break
      case: ']':
      	if(stack.pop() !== '[') return false
      	break
      case: '}':
      	if(stack.pop() !== '{') return false
      	break
    }
  	return s.length === 0
};
```

## 小结

刷题的第9天，每当遇到一个不会的题，其实对于我们来说都是一件好事，这意味着你今天又可以获得一些知识/思路。不管是在工作还是生活中，一定不要觉得自己不行/失败。更多的时候，可能我们只比别人多努力1分钟，就能甩过1000个同龄人！加油吧！

## 引用

[力扣LeetCode的第20题-有效的括号](https://leetcode.cn/problems/valid-parentheses/)
