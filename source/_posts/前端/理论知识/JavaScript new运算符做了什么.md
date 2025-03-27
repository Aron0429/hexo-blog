---
title: JavaScript new运算符做了什么
author: 小呆
abbrlink: 19802
cover: https://cover.xdxmblog.cn/cover/cover_19802.webp
tags:
  - 面试
  - JavaScript
categories: 
  - 前端积累
  - JavaScript
date: 2023-03-29 23:41:06
updated: 2023-03-29 23:41:06
---

new运算符，想必大家都不陌生，在工作当中肯定用到过。而且也是面试当中经常问的一道面试题，那你有了解过new运算符背后的原理和如何实现一个new吗？一起来复习一下吧！

## 知识点

- new运算符的作用与原理
- 如何实现一个new运算符

<!--more-->

### new运算符的作用与原理

> **new运算符**创建一个用户定义的对象类型的实例或具有构造函数的内置对象的实例。

通俗的来讲，new运算符的作用就是通过构造函数来创建一个带有原型链的实例对象。或者你可以这样理解：就像小时候的中秋节，家里会用刻有小兔子的月饼的模具，生产好多个印有小兔子的月饼的过程。是不是就有那味儿了~

举个例子：中秋节妈妈交给我一个任务，需要我做5个印有小兔子的月饼。我们用代码来实现一下：

```javascript
var moonCake = { id: 1, fill: 'wuren', type: 'rabbit', info: function() { console.log('eat') } }
var moonCake2 = { id: 2, fill: 'zhima', type: 'rabbit', info: function() { console.log('eat') } }
var moonCake3 = { id: 3, fill: 'shuiguo', type: 'rabbit', info: function() { console.log('eat') } }
var moonCake4 = { id: 4, fill: 'danhuang', type: 'rabbit', info: function() { console.log('eat') } }
var moonCake5 = { id: 5, fill: 'hetao', type: 'rabbit', info: function() { console.log('eat') } }
```

很简单，对不对，每个月饼的外观都是小兔子，功能其实也一样，就是吃。但是如果要做100个月饼呢？虽然可以用for实现，但是这样写的问题是会浪费很多内存。

1. 月饼的type属性和info动作对于每个月饼都是一样的，其实只需要引用同一个值就好，没必要每个月饼都写一遍。
2. 只有id和fill才需要创建多次，因为不同的月饼会有不同的口味。

之前我们通过学习，知道问题1可以通过原型链去解决。所以new操作符实际上帮我们做了这样几件事：

> 1. 创建一个空的简单JavaScript对象（即{}）；
> 2. 给这个空对象添加隐式原型，指向函数的原型对象；
> 3. 改变this的指向，将this指向这个创建出来的对象；
> 4. 如果该函数没有返回对象，则返回this；

通过隐式原型，我们就可以很方便的调用构造函数原型对象上的属性和方法。如果对原型链不太了解的可以看[《Instanceof与原型链》](https://www.xdxmblog.cn/posts/2.html)这篇文章。通过改变this的指向，当我们向函数中再传递实参时，参数就会被挂载到实例对象上去。

```javascript
function MoonCakeModel(id, fill) {
    this.id = id
    this.fill = fill
}
MoonCakeModel.prototype.type = 'rabbit'
MoonCakeModel.prototype.info = function() {
    console.log('eat')
}
var moonCake = new MoonCakeModel(1, 'wuren')
var moonCake2 = new MoonCakeModel(2, 'zhima')
// 打印创建出来的两个月饼，他们的type属性值，都指向构造函数的原型对象的type属性
console.log(moonCake.id, moonCake.type) // 1 rabbit
console.log(moonCake2.id, moonCake.type) // 2 rabbit
//修改原型对象的type属性值，发现两个实例的type都变成了lion
MoonCakeModel.prototype.type = 'lion'
console.log(moonCake.id, moonCake.type) // 1 lion
console.log(moonCake2.id, moonCake.type) // 2 lion
//用instanceof运算符测试得出，MoonCakeModel构造函数的原型对象确实出现在了实例的原型链上
console.log(moonCake instanceof MoonCakeModel) // true
console.log(moonCake2 instanceof MoonCakeModel) // true
```

通过控制台打印moonCake，也能发现info和type属性都是在原型链上，而fill和id属性才是在实例对象本身上面。这也符合上面说的第2、3条。构造函数里我们并没有写任何返回值，但是却返回了一个对象。所以也符合上面说的第1、4条。

![实例、构造函数、原型链](https://img.xdxmblog.cn/images/article_19802_01.png)

### 如何实现一个new运算符

既然我们已经理解了new运算符的作用和它的实现原理，那么我们就用一个方法来模拟实现一个myNew函数，达到与new同样的效果，强化理解：

```javascript
function myNew(fn, ...args) {
    let obj = Object.create(null) // 创建一个空对象
    Object.setPrototypeOf(obj, fn.prototype) // 将obj的隐式原型指向构造函数的原型对象，形成原型链
    let result = fn.apply(obj, args) // 通过apply改变this指向，指向obj
    if(typeof result == 'object') { // 判断函数返回值，若不是对象返回obj
        return result
    } else {
        return obj
    }
}

var moonCake = myNew(MoonCakeModel, 1, 'wuren')
var moonCake2 = myNew(MoonCakeModel, 2, 'zhima')

console.log(moonCake.id, moonCake.type) // 1 rabbit
console.log(moonCake2.id, moonCake.type) // 2 rabbit
console.log(moonCake instanceof MoonCakeModel) // true
console.log(moonCake2 instanceof MoonCakeModel) // true
```

在实现myNew的过程中，有一个typeof的判断，对apply函数不太了解的同学可能会有点懵，apply在劫持this的时候，会立即执行这个被劫持的方法（函数），在上面的例子当中是MoonCakeModel。所以如果构造函数中显示的return了一个对象，就需要返回该对象。**构造函数的返回规则遵循以下几点：**

1. 在构造函数中，如果不写return的话默认就是返回创建的实例对象；
2. 如果return的是一个基本数据类型的话比如：boolean, number,undefined等那么仍然返回实例对象
3. 如果return的是一个对象的话，则返回该对象。原本的指向实例对象的this会被无效化

我们修改MoonCakeModel函数来测试一下：

```javascript
function MoonCakeModel(id, fill) {
    this.id = id
    this.fill = fill
    return {id: 999, fill: 'gold'}
}
var moonCake = myNew(MoonCakeModel, 1, 'wuren')
console.log(moonCake.id, moonCake.type) // 1 undefined
console.log(moonCake instanceof MoonCakeModel) // false
console.log(moonCake);
```

我们可以通过控制台打印发现：moonCake的属性值并不是我们传入myNew的参数，而是构造函数return的那个对象。并且moonCake与MoonCakeModel之前也没有了原型链的关系。

![构造函数显示返回对象](https://img.xdxmblog.cn/images/article_19802_02.png)

### Object.create(null)和{}

我们都知道创建对象有很多种方式，但是在实现new的过程中，我们却使用了Object.create(null)。这是为什么呢？答案是：**使用Object.create(null)，只是单纯的空对象，它没有原型链，更干净纯粹。而{}的创建过程，会带有原型链。**

## 小结

归根结底，new运算符的出现主要是为了我们更快速的创建多个实例，同时利用原型链的特性减少内存占用。理解并掌握new运算符的原理和实现才是重中之重，它能更好的帮助我们串联很多知识。希望这篇文章能够帮助到你！
