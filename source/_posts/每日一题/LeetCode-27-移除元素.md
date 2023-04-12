---
title: LeetCode(27)移除元素
author: 小呆
tags:
  - 算法
  - 双指针算法
categories: 每日一题
abbrlink: 4743
date: 2023-04-12 09:35:37
updated: 2023-04-12 09:35:37
---

今天是小呆刷题的第3天，今天的题目是：力扣（LeetCode)的第27题，移除元素

#### 题目要求

> 给你一个数组nums和一个值val，你需要**原地**移除所有数值等于val的元素，并返回移除后数组的新长度。
>
> 不要使用额外的数组空间，你必须仅使用O(1)额外空间并原地**修改输入数组**。
>
> 元素的顺序可以改变。你不需要考虑数组中超出新长度后面的元素。
>

<!--more-->

示例：

```
输入：nums = [0,1,2,2,3,0,4,2], val = 2
输出：5, nums = [0,1,4,0,3]
解释：函数应该返回新的长度5, 并且nums中的前五个元素均为0,1,3,0,4。注意这五个元素可为任意顺序。你不需要考虑数组中超出新长度后面的元素。例如，函数返回的新长度为5 ，而 nums = [0,1,3,0,4,2,2,2] 或 nums = [0,1,3,0,4,0,0,0]，也会被视作正确答案。
```

提示：

- `0 <= nums.length <= 100`
- `0 <= nums[i] <= 50`
- `0 <= val <= 100`

#### 解题思路

因为需要原地修改数组，并且无需考虑元素的顺序和数组中超出新长度后面的元素。思路的话就是循环数组，将所有值等于`val`的元素，替换为非`val`的元素。依然可以使用**双指针算法**进行解决。

依旧通过图例的方式来辅助理解每一次循环过程中`fast`指针和`slow`指针的变化：

![移除元素](//img.xdxmblog.cn/images/image-202304120001.gif)

```javascript
/**
 * @param {number[]} nums
 * @param {number} val
 * @return {number}
 */
var removeElement = function(nums, val) {
    if(nums.length == 0) {  // 依旧先判断边界值
        return 0
    }
    let fast = 0, slow = 0
    while(fast < nums.length) {
        if(nums[fast] !== val) {
            nums[slow] = nums[fast]  // 先将fast的值赋给slow，再对slow进行移位
            slow+
        }
        fast++
    }
}
```

#### 小结

由于这道题是删除指定的`val`，所以判断条件里当`fast`不等于`val`的时候，`slow`要先原地替换为`fast`的值再往前移，而前面两天的题都是先往前移再进行赋值。这里还是要注意变通一下。

#### 引用

[力扣LeetCode的第27题-移除元素](https://leetcode.cn/problems/remove-element)

[双指针技巧秒杀七道数组题目——作者：labuladong](https://labuladong.gitee.io/algo/di-yi-zhan-da78c/shou-ba-sh-48c1d/shuang-zhi-fa4bd/)
