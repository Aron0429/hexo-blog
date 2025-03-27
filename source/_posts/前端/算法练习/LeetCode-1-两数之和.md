---
title: LeetCode(1)两数之和
author: 小呆
abbrlink: 35485
cover: https://cover.xdxmblog.cn/cover/cover_35485.webp
date: 2023-04-14 23:21:51
updated: 2023-04-14 23:21:51
tags:
 - 哈希表
categories: 算法练习
---

今天是小呆刷题的第5天，今天的题目是：力扣（LeetCode)的第1题，两数之和

## 题目要求

> 给定一个整数数组`nums`和一个整数目标值`target`，请你在该数组中找出**和为目标值**`target`的那**两个**整数，并返回它们的数组下标。
>
> 你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。
>
> 你可以按任意顺序返回答案。

<!--more-->

示例：

```
输入：nums = [2,7,11,15], target = 9
输出：[0,1]
解释：因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。
```

提示：

- `2 <= nums.length <= 10^4`
- `-10^9 <= nums[i] <= 10^9`
- `-10^9 <= target <= 10^9`
- **只会存在一个有效答案**

## 解题思路

大名鼎鼎的LeetCode第一题，通过率只有52.9%，小呆第一次做这道题也没做出来。思路其实蛮简单的，维护一个`HasMap`，一般情况下我们存储数据都是`index -> value`，因为这道题要求返回下标，所以这个`HasMap`维护的是`value -> index`。循环数组，求出当前项的差值，看`HasMap`里是否有这个数据，有的话直接返回对应的下标，没有的话就把当前项存入`HasMap`。

老规矩，用gif动图来辅助理解整个流程：

![两数之和](https://img.xdxmblog.cn/images/article_35485_01.gif)

```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    const hasMap = new Map()
    for(let i = 0; i < nums.length; i++) {
      const targetNum = target - nums[i] // 计算当前元素的目标差
      if(hasMap.has(targetNum)) { // 如果能找到，说明两个数之和正好是target，返回对应下标
        return [hasMap.get(targetNum), i]
      }else {
        hasMap.set(nums[i], i) // 没找到，将当前元素和下标存入hasMap
      }
    }
};
```

## 小结

不要将时间浪费在大量的如何刷LeetCode的文章上。打开LeetCode，每天选一道题，5分钟内做不出来，就去看题解和评论区，然后记住并理解解法。之后默写，做做笔记，每周将这一周的七道题重新只看题目并做一遍。每个月将这一个月的题，重新做一遍，然后分类总结。相信自己，一定能提升！

## 引用

[力扣LeetCode的第1题-两数之和](https://leetcode.cn/problems/two-sum/)

