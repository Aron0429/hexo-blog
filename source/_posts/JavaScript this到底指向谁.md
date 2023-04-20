---
title: JavaScript this到底指向谁
author: 小呆
abbrlink: 45186
tags:
  - 前端面试
categories: JavaScript
date: 2023-04-07 17:36:44
updated: 2023-04-07 17:36:44
---

相信很多前端同学在曾经的面试过程中，都经历过this指向的灵魂拷问。对于基础知识掌握不扎实的同学，this指向似乎是一门玄学，有人说this的绑定是在代码创建阶段完成的，有人说this的绑定是在代码执行阶段完成的，那真相到底是什么，跟着我一起复习一下吧。

## 知识点

- this的绑定是在什么阶段完成的
- this的绑定规则
- this绑定的优先级
- 特殊环境的this指向

<!--more-->

## this的绑定是在什么阶段完成的

如果你了解JavaScript执行上下文（对JS执行上下文不了解的同学推荐先看我的另一篇文章[《理解执行上下文》](https://www.xdxmblog.cn/posts/4596.html)），那么你一定能脱口而出：**this的绑定是在执行阶段完成**。我们先来回顾一下不同的执行上下文是如何被创建出来的：

1. JavaScript引擎先创建全局执行上下文（this在此阶段被绑定到GlobalObject）
2. 全局执行上下文入栈
3. 代码开始执行，遇到函数调用，创建函数执行上下文（this在此阶段根据上下文动态绑定）
4. 执行函数内部代码，执行完毕，函数执行上下文出栈

我们都知道**全局执行上下文的this指向的是window对象（浏览器下）**。那函数的执行上下文，this绑定的依据是什么？答案是：**调用位置**。

> 调用位置就是函数在代码中被调用的位置（而不是声明的位置）。

接下来我们看看在函数的执行过程中，调用位置如何决定this的绑定对象。

## this的绑定规则

函数执行上下文中，this的绑定遵循四条绑定规则：**默认绑定、隐式绑定、显示绑定以及new绑定**。我们分别来看一下:

### 默认绑定

最常见的函数调用方式是：独立函数调用。这条规则可以看作是无法应用其他规则时的默认规则。**在非严格模式下：函数中的this默认指向window**。

```javascript
function foo() {
	console.log(this.a)
}
var a = 2
foo() // 2
```

上面的代码中，foo()函数是不带任何修饰的函数引用进行调用的（独立函数调用），所以只能使用默认绑定，因此指向window。而全局执行上下文中的变量，实际上都挂在window对象上，所以这里的this.a === window.a，结果是2。

**如果使用严格模式**，则不能将全局对象用于默认绑定，因此**this会绑定到undefined**。

```javascript
function foo() {
    "use strict"
	console.log(this.a)
}
var a = 2
foo() // undefined
```

另外需要注意的是：**虽然this的绑定规则完全取决于调用位置，但是只有函数运行在非严格模式下时，默认绑定才能绑定到全局对象。在严格模式下调用则不影响默认绑定。**

```javascript
function foo() {
	console.log(this.a) // 在非严格模式下运行
}
var a = 2
(function() {
    "use strict"
    foo() // 2  在严格模式下调用
})();
```

这个例子中，函数foo()虽然是在严格模式下调用的，但是JS文件头部或者foo函数内部并没有声明严格模式，所以this其实还是运行在非严格模式下，因此this仍然会应用默认绑定规则，绑定到全局对象上。

**小结：默认规则下，决定this绑定对象的并不是调用位置是否处于严格模式，而是函数体是否处于严格模式。**

### 隐式绑定

不知道你有没有对下面代码中的this指向有过疑问？其实这就是最常见的隐式绑定规则。

```javascript
function foo() {
	console.log(this.a)
}
var obj = {
    a: 2,
    foo: foo
}
obj.foo() // 2

// 或者这么写，但结果其实都一样
var obj = {
    a: 2,
    foo: function() {
        console.log(this.a)
    }
}
obj.foo() // 2
```

了解过执行上下文的同学都知道，函数是存在单独开辟的内存中，变量只是指向了这个函数的引用地址。我们观察一下上面两种写法中foo函数的声明方式：无论foo函数是被当作引用属性添加到obj中，还是直接在obj中定义再添加为引用属性。实际上都是一回事：**函数在单独的内存中存放，obj的foo属性只是指向了它的引用地址。**

但是this的指向是由调用位置决定的，**当函数引用有上下文对象时，隐式绑定规则会把函数调用中的this绑定到这个上下文对象**。上面的代码中，当foo()被调用时，它的前面有对obj的引用，所以this会被绑定到obj上。

需要注意的是：**对象属性引用链中只有最后一层在调用位置中起作用**。比如下面的例子：

```javascript
function foo() {
    console.log(this.a)
}
var obj2 = {
    a: 42,
    foo: foo
}
var obj1 = {
    a: 2,
    obj2: obj2
}
obj1.obj2.foo() // 42
```

#### 隐式丢失

 隐式绑定规则下，最容易遇到的问题就是隐式丢失，这个问题也是面试当中经常考察的一个知识点。**被隐式绑定的函数会丢失绑定对象，也就是说它会应用默认绑定规则，把this绑定到全局对象或者undefined上（取决于是否是严格模式）**。

```javascript
function foo() {
    console.log(this.a)
}

var obj = {
    a: 2,
    foo: foo
}

var bar = obj.foo
var a = 'oops, global'
bar() // 'oops, global'
```

观察上面的代码，虽然bar是obj.foo的一个引用，但是实际上，它引用的是foo函数本身，所以此时的bar()其实是一个不带任何修饰的函数调用，因此它应用的还是默认绑定规则。

再来看另一种常见的隐式丢失现象，下面的代码在初学前端时，很容易做错：

```javascript
function foo() {
    console.log(this.a)
}
function doFoo(fn) {
    fn() // 调用位置
}
var obj = {
    a: 2,
    foo: foo
}
var a = 'oops,global'
doFoo(obj.foo) // 'oops,global'
```

参数的传递其实就是一种隐式赋值，fn其实就是foo函数的引用，跟上面一样，它引用的是foo函数本身。而fn()调用时依然是一个不带任何修饰的函数，所以应用的仍然是默认绑定规则。

另外如果把函数传入到内置函数中，例如定时器函数，也是一样的道理。下面的代码和上面的例子结果一样：

```javascript
function foo() {
    console.log(this.a)
}
var obj = {
    a: 2,
    foo: foo
}
var a = 'oops,global'
setTimeout(obj.foo, 100) // 'oops,global'
```

### 显示绑定

在上面的隐式绑定例子里，我们必须在一个对象（obj）内部包含一个指向函数的属性（foo），并通过这个属性间接引用函数，从而把this间接（隐式）绑定到这个对象上。那有没有一种办法可以不用在对象内部包含函数引用，又能在某个对象上强制调用函数呢？JavaScript给我们提供了call、apply、bind方法来实现。

这三个函数的**第一个参数是一个对象**，它指定了this的绑定对象。我们看下面的代码：

```javascript
function foo() {
    console.log(this.a)
}

var obj = {
    a: 2
}
foo.call(obj) // 2
// 或者使用apply
foo.apply(obj) // 2
// 或者使用bind
foo.bind(obj)() // 2
```

**通过call、apply、bind这种强制指定this的方式，叫做显示绑定**。通过上面的代码我们可以观察到一个明显的区别，就是bind函数后面有一对括号。在JavaScript当中，当我们调用一个函数时，我们习惯称之为**函数调用**，函数处于一个被动的状态。而call和apply让函数从被动变主动，函数能主动选择自己的上下文，这种写法我们称之为**函数应用**。

需要注意的是：**如果使用上面三种函数来改变this指向时，如果第一个参数为null或者undefined，那么this将指向全局对象**。

#### call、apply、bind的异同

|       | 是否立即执行                                       | 入参形式                   |
| ----- | -------------------------------------------------- | -------------------------- |
| call  | 是                                                 | (thisArg, arg1,arg2,...)   |
| apply | 是                                                 | (thisArg, [arg1,arg2,...]) |
| bind  | 否，返回一个全新的绑定函数，所以需要加（）才能调用 | (thisArg, arg1,arg2,...)   |

上面是call、apply、bind三种函数的异同点，也是面试时的高频考点，大家还是要牢记于心的。

### new绑定

this绑定规则的最后一条则是new绑定。new操作符，会把this指向构造函数所创建的实例对象上。在[《JavaScript new运算符做了什么》](https://www.xdxmblog.cn/posts/19802.html)这篇文章里，有讲过new的作用和实现原理。其中有一步就是绑定this的指向。应用的就是new绑定规则。感兴趣的小伙伴可以借此机会复习一下new相关的知识点。

## this绑定的优先级

如果一个函数调用存在多种绑定方式，this最终指向谁呢？先来看显示绑定和隐式绑定：

```javascript
function foo() {
    console.log(this.a)
}
var obj1 = {
    a: 2,
    foo: foo
}
var obj2 = {
    a: 3,
    foo: foo
}
obj1.foo() // 2
obj2.foo() // 3

obj1.foo.call(obj2) // 3
obj2.foo.call(obj1) // 2
```

结果很显然，显示绑定 > 隐式绑定。 再来看new绑定和隐式绑定的优先级谁高谁低：

```javascript
function foo(something) {
    this.a = something
}
var obj1 = {
    foo: foo
}
var obj2 = {}
obj1.foo(2)
console.log(obj1.a) // 2

obj1.foo.call(obj2, 3)
console.log(obj2.a) // 3

var bar = new obj1.foo(4)
console.log(obj1.a) // 2
console.log(bar.a) // 4
```

通过代码我们也能看到，new绑定 > 隐式绑定。最后我们来测试一下new绑定和显示绑定的优先级。由于call和apply的特性，new和call/apply无法一起使用，所以我们使用bind测试它俩的优先级：

```javascript
function foo(something) {
    this.a = something
}
var obj1 = {}
var bar = foo.bind(obj1)
bar(2)
console.log(obj1.a) // 2

var baz = new bar(3)
console.log(obj1.a) // 2
console.log(baz.a) // 3
```

通过代码我们发现，new操作符改变了通过bind函数显示绑定的this。所以new绑定 > 显示绑定。

**最终结论：new绑定 > 显示绑定 > 隐式绑定 > 默认绑定**。

## 特殊环境的this指向

上面的四条规则，可以判断所有正常的函数。但是ES6中出现了一个特殊的函数类型：**箭头函数**。**箭头函数中不使用this的四种标准规则**，而是**根据外层（函数或者全局）作用域来决定this**。最重要的一点：**箭头函数的this无法被修改**。

```javascript
function foo() {
    return (a) => { // 返回一个箭头函数
        console.log(this.a)  // this继承自foo()
    }
}
var obj1 = { a: 2 }
var obj2 = { a: 3 }
var bar = foo.call(obj1)
bar() // 2
bar.call(obj2) // 2
```

foo函数内部return了一个箭头函数。当foo被调用时，箭头函数会自动将this绑定到外层作用域foo上，由于foo函数的this通过显示绑定规则绑定到了obj1上，所以bar(引用箭头函数)的this也会绑定到obj1上，并且无法通过其他方式修改。

## 小结

有些文章会列举一大堆不同场景下this的指向，让人记得眼花缭乱，虽然能应付面试，但实际上并不能让人真正掌握this。其实this的指向，并没有想象中的那么复杂，也没有传说中的神乎其神，只要掌握绑定规则，就能在面试题的各种障眼法下，找到它的真身。全文总结成三条如下，希望能帮到正在学习JavaScript的你。

1. 全局执行上下文，this指向全局对象
2. 函数执行上下文，根据四条标准规则（new绑定>显示绑定>隐式绑定>默认绑定）判断
3. 箭头函数下，指向它的外层作用域

## 引用

本文内容参考了以下书籍，感兴趣的同学可以购买正版图书进行阅读。

《你不知道的JavaScript——上卷》——作者：KYLE SIMPSON
