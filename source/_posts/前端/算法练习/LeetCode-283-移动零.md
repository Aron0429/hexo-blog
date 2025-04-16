---
title: LeetCode(283)移动零
author: 小呆
tags:
  - 双指针算法
categories: 
  - 前端积累
  - 算法练习
abbrlink: 46328
cover: https://cover.xdxmblog.cn/cover/cover_46328.webp
date: 2023-05-06 10:17:45
updated: 2023-05-06 10:17:45
---

今天要练习的题目是：力扣（LeetCode)的第283题，移动零

## 题目要求

> 给定一个数组`nums`，编写一个函数将所有`0`移动到数组的末尾，同时保持非零元素的相对顺序。
>
> **请注意**，必须在不复制数组的情况下原地对数组进行操作。

<!--more-->

示例：

```
输入: nums = [0,1,0,3,12]
输出: [1,3,12,0,0]
```

提示:

- `1 <= nums.length <= 10^4`
- `-2^31 <= nums[i] <= 2^31 - 1`

## 解题思路

遇到这种原地操作数组的题，看起来要求跟[第27题移除元素](https://www.xdxmblog.cn/posts/4743.html)很相似，唯一的区别是把数组里所有的`0`移到末尾。小呆首先的思路是考虑用**双指针算法**，所以第一步是先将非`0`的元素移到前面。以示例代码为例：

```javascript
/**
 * @param {number[0, 1, 0, 3, 12]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var moveZeroes = function(nums) {
    if(nums.length === 0) return // 老规矩先判断边界值
    let fast = 0, slow = 0
    while(fast < nums.length) {
        if(nums[fast] !== 0) {
            nums[slow] = nums[fast]
            slow++
        }
        fast++
    }
    return nums
}
console.log(moveZeroes[0, 1, 0, 3, 12]) // [1, 3, 12, 3, 12]   运行到这里，fast：5  slow:3
```

从打印结果可以看出，非`0`的代码已经都移到前面了，只需要从`slow`开始，到数组末尾的数字替换为`0`即可，于是有了下面的代码：

```javascript
/**
 * @param {number[0, 1, 0, 3, 12]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var moveZeroes = function(nums) {
    if(nums.length === 0) return // 老规矩先判断边界值
    let fast = 0, slow = 0
    while(fast < nums.length) {  // 第一轮循环用于把非0的元素移到前面
        if(nums[fast] !== 0) {
            nums[slow] = nums[fast]
            slow++
        }
        fast++
    }
    while(slow < nums.length) { // 第二轮循环用于把剩余的元素替换为0
        nums[slow] = 0
        slow++
    }
    return nums
}
console.log(moveZeroes[0, 1, 0, 3, 12]) // [1, 3, 12, 0, 0]
```

老规矩，上动图帮助理解，加深记忆：

![移动零](https://img.xdxmblog.cn/images/article_46328_01.gif)

上面的代码写了2个`while`循环，那能不能只写一种循环呢？我们来改动代码试试：

```javascript
/**
 * @param {number[0, 1, 0, 3, 12]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var moveZeroes = function(nums) {
    if(nums.length === 0) return // 老规矩先判断边界值
    let fast = 0, slow = 0
    while(slow < nums.length) {
        if(fast >= nums.length) {
            nums[slow] = 0
            slow++
        } else {
            if(nums[fast] !== 0) {
            	nums[slow] = nums[fast]
            	slow++
        	}
            fast++
        }
    }
    return nums
}
console.log(moveZeroes[0, 1, 0, 3, 12]) // [1, 3, 12, 0, 0]
```

`while`循环的条件从`fast`变为了`slow`，当`fast`的位置超出数组最后一位时，说明所有非`0`的元素已经都移位好了，此时只需要将剩余的元素设为`0`即可。下面是两种方式`LeetCode`提交代码的结果，仅供参考。

|          | 执行用时 | 内存消耗 |
| -------- | -------- | -------- |
| 两个循环 | 104ms    | 45.1MB   |
| 一个循环 | 84ms     | 45.8MB   |



## 小结

到目前为止已经刷了几道题了，数量虽然不多，但是最令小呆享受的是制作动图的过程，虽然目的是为了方便看这篇文章的同学便于理解，但无形之中也是对于小呆自身的一个理解强化。如果看这篇文章的你也跟我一样算法是短板，那就跟我一起坚持下去吧，期待花开结果的那天~

## 引用

[力扣LeetCode的第283题-移动零](https://leetcode.cn/problems/move-zeroes/)

[双指针技巧秒杀七道数组题目——作者：labuladong](https://labuladong.gitee.io/algo/di-yi-zhan-da78c/shou-ba-sh-48c1d/shuang-zhi-fa4bd/)
