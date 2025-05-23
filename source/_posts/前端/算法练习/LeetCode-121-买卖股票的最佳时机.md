---
title: LeetCode(121)买卖股票的最佳时机
author: 小呆
cover: 'https://cover.xdxmblog.cn/cover/cover_37133.webp'
abbrlink: 37133
date: 2023-06-15 00:04:43
updated: 2023-06-15 00:04:43
tags:
  - 贪心算法
  - 动态规划
categories: 
  - 前端积累
  - 算法练习
---

今天要练习的题目是：力扣（LeetCode)的第 121 题，买卖股票的最佳时机

## 题目要求

> 给定一个数组`prices`，它的第`i`个元素`prices[i]`表示一支给定股票第`i`天的价格。
>
> 你只能选择`某一天`买入这只股票，并选择在**未来的某一个不同的日子**卖出该股票。设计一个算法来计算你所能获取的最大利润。
>
> 返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回`0`。

<!--more-->

示例：

```
输入：[7,1,5,3,6,4]
输出：5
解释：在第 2 天（股票价格 = 1）的时候买入，在第 5 天（股票价格 = 6）的时候卖出，最大利润 = 6-1 = 5 。
     注意利润不能是 7-1 = 6, 因为卖出价格需要大于买入价格；同时，你不能在买入前卖出股票。

输入：prices = [7,6,4,3,1]
输出：0
解释：在这种情况下, 没有交易完成, 所以最大利润为 0。
```

提示：

- `1 <= prices.length <= 10^5`
- `0 <= prices[i] <= 10^4`

## 解题思路

这道题首先我们要明确一个股票买卖的规则就是：**当天买入，第二天及以后才能卖出**。上面的示例来理解，第 3 天的股价为 5 元（`prices[2] = 5`），那也就是说，我一定是在第 1 天或者第 2 天（`[price[0] - price[i(2) - 1]]`）的范围里买入的股票，才能在第 3 天卖出。小呆首先能想到的肯定是暴力解法，套 2 层循环，去计算区间`j`和`i`的差，然后返回最大值即可。但是这种方式的性能也比较差，时间复杂度达到了`O(n^2)`，超出了时间限制。

```javascript
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (prices) {
  if (prices.length <= 1) return 0
  let maxProfit = 0
  for (let i = 0; i < prices.length - 1; i++) {
    for (let j = i + 1; j < prices.length; j++) {
      maxProfit = Math.max(maxProfit, prices[j] - prices[i])
    }
  }
  return maxProfit
}
```

暴力解法肯定不是我们想要的，因为性能比较差，例如这道题直接就超时了，所以我们要想想其他的思路。通过观察示例，其实我们想要得到的就是一个**区间范围内的最大值和最小值**。也就是`[0, prices[i]]（i >= 1）`区间范围内的最大值和最小值。所以还可以利用贪心算法来求解。老规矩用动图来辅助理解：

![贪心算法](https://img.xdxmblog.cn/images/article_37133_01.gif)

```javascript
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (prices) {
  if (prices.length <= 1) return 0
  let maxProfit = 0,
    minProfit = prices[0]
  for (let i = 1; i < prices.length; i++) {
    maxProfit = Math.max(maxProfit, prices[i] - minProfit)
    minProfit = Math.min(minProfit, prices[i])
  }
  return maxProfit
}
```

除了上面的两种解法。小呆没有想到其他思路，习惯性的点开题解看了看，发现这道题还可以用动态规划的思路去做，小呆也是反复看了好几遍，才理解了动态规划的思路。这道题的要求是最大利润，其实可以理解为**我们从开始到结束，手里能够持有的最大现金数**。那我们每天的状态可以分为两种：

- 一种是我们当天持有股票（不代表当天买入，可能是之前就买了，当天只是持有不操作）时，手里还有的最大现金
- 另一种是我们当天不持有股票（不代表当天就卖出，可能之前就卖了，当天不买也不卖）时，手里还有的最大现金

所以我们需要用一个二维数组表示这两个状态：

1. `dp[i][0]`表示持有股票时，手里的最大现金。
2. `dp[i][1]`表示不持有股票时，手里的最大现金。

然后我们需要明确要求的结果：也就是在最后一天，手里的最大现金。也是在下面两种状态中取最大值：

1. `dp[dp.length - 1][0]`，最后一天手里持有股票时，手里的最大现金。
2. `dp[dp.length - 1][1]`，最后一天手里不持有股票时，手里的最大现金。

因为本题股票买卖只能操作一次，所以要求的结果是第二种：`dp[dp.lengh - 1][1]`。

接下来需要**确定递推公式**:

- 如果第`i`天持有股票`dp[i][0]`，那第`i`天的最大现金可以根据下面两个状态来推断：
  - 前一天`i - 1`手里就持有股票，今天啥也不干，所以今天的最大现金就与前一天一样，就是`dp[i - 1][0]`
  - 今天买入股票，今天的最大现金就是买了今天股票之后的最大现金：`-prices[i]`（因为要把钱花掉，所以是`-prices[i]`)

因为要求当天所持有的最大现金，这两种状态肯定选现金多的，也就是`dp[i][0] = Math.max(dp[i - 1][0], -prices[i])`

- 如果第`i`天不持有股票`dp[i][1]`，那第`i`天的最大现金也可以根据下面两个状态来推断：
  - 前一天`i - 1`手里就不持有股票，今天啥也不干，所以今天的最大现金就与前一天一样，就是`dp[i - 1][1]`
  - 今天卖出股票，今天的最大现金就是今天卖了股票之后的最大现金：`dp[i - 1][0] + prices[i]`（昨天持有股票后剩余的最大现金+今天股票卖出后所得的现金）

同理：`dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][1] + prices[i])`

下一步是要**对`dp`数组进行初始化**：

通过递推公式，我们发现，**当天的最大现金肯定与前一天手里的最大现金相关联**，所以第一天我们能干的事儿就两种：

1. 买入股票（借钱买），持有它，于是`dp[0][i] = -prices[0]`，也就是我们手里的现金是负数。
2. 不操作，不持有股票，于是`dp[0][1] = 0`。

然后我们确定遍历顺序，由于`dp[i]`是有`dp[i - 1]`推导出来的，所以是从前向后，遍历的下标也就一定是从 1 开始。

老规矩，配张动图辅助理解：

![动态规划-买卖股票](https://img.xdxmblog.cn/images/article_37133_02.gif)

```javascript
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (prices) {
  let dp = new Array(prices.length)
  for (let i = 0; i < dp.length; i++) {
    dp[i] = new Array()
  }
  // 上面创建二维数组的方式也可以用fill，只不过用fill填充的是同一个数组的引用，每次操作都会改变所有dp[i]
  // 单从做题来看，使用fill执行速度更快，内存占用更小。
  // 但是如果从理解动态规划来看，还是使用for为每一个dp[i]创建一个数组，更容易观察递推公式的每一步流程
  // let dp = new Array(prices.length).fill(new Array())

  dp[0][0] = -prices[0]
  dp[0][1] = 0

  for (let i = 1; i < prices.length; i++) {
    dp[i][0] = Math.max(dp[i - 1][0], -prices[i]) // 前一天手里有股票的现金，和前一天没股票，今天买完股票后的现金取较多的一方
    dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][0] + prices[i]) // 前一天未持有股票的现金，（今天卖完股票后的现金 + 前一天持有股票时，剩下的现金）
  }
  return dp[dp.length - 1][1] // 因为只允许买卖一次，所以肯定是清空股票之后的现金要比持有股票的现金多
}
```

最后附上执行时间：

|                                    | 执行用时 | 内存消耗 |
| ---------------------------------- | -------- | -------- |
| 贪心算法                           | 80ms     | 50.5MB   |
| 动态规划（使用 fill 创建二维数组） | 92ms     | 51.5MB   |
| 动态规划（使用 for 创建二维数组）  | 216ms    | 78.4MB   |

## 小结

今天最大的收获还是对动态规划的理解，挺有意思的一个过程，通过推导来解决一个问题。加油~

## 引用

[力扣 LeetCode 的第 121 题-买卖股票的最佳时机](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/)

[动态规划之 LeetCode: 121.买卖股票的最佳时机 1——作者：代码随想录](https://www.bilibili.com/video/BV1Xe4y1u77q/?spm_id_from=333.337.search-card.all.click&vd_source=b93a2e63f467c0498e10b6110465fcb4)
