---
title: Instanceof与原型链
author: 小呆
abbrlink: 2
tags:
  - 前端面试
categories: JavaScript
date: 2023-03-26 23:34:19 
updated: 2023-03-26 23:34:19
---

原型和原型链，是JavaScript中的一个重要知识点，也是面试中的高频考点，理解并掌握原型和原型链，对于前端开发者来说是重中之重。下面就通过Instanceof运算符来复习一下相关知识吧。

#### 知识点

- 理解JavaScript对象原型
- 原型链如何工作
- instanceof运算符的作用与实现

<!--more-->

##### 理解JavaScript对象原型与原型链

> JavaScript常被描述为一种**基于原型的语言**——每个对象拥有一个原型对象，对象以其原型为模板、从原型继承方法和属性。原型对象也可能拥有原型，并从中继承方法和属性，一层一层、以此类推。这种关系常被称为**原型链**。

JavaScript中规定，每个函数都有一个特殊的属性`prototype`，这个属性的值是一个对象，通常被称为这个函数的原型。通俗的讲，我们叫它**显示原型**。通过new一个函数，我们可以得到一个实例对象，在创建这个实例对象的过程中，会将实例对象内部的`__proto__`指向构造它的函数的显示原型上。通过`__proto__`我们可以获取对象内部的原型，我们叫它**隐式原型**。有点绕对不对，下面我们通过代码和图像来加深理解：

(**注：`__proto__`为浏览器提供的属性（新版浏览器已被废弃，改为`<prototype>`，这里为了方便还是以`__proto__`来表示），并非官方标准，ECMAScript标准用`[[prototype]]`来表示**)

对象的隐式原型可以通过`Object.getPrototypeOf(obj)`来获取。

```javascript
function Foo() {}  // 构造函数就是普通函数，通常把函数名首字母大写
var foo = new Foo
console.log(foo.__proto__ === Foo.prototype) // true
```

![原型对象、构造函数、实例的关系](http://img.xdxmblog.cn/images/image_20230328094744.png)

通过代码和图像，我们对原型对象、构造函数、实例之间的关系有了更深一步的了解。我们都知道，函数其实也是对象的一种，那函数是谁创建的呢？函数也有`__proto__`吗？答案是：函数是由**Function**来创建的，函数也有`__proto__`。我们来验证一下：

跟函数Foo是被Function创建的一样，obj本质是也是由**Object**创建而来的。

```javascript
function Foo() {} // 直接写function只是语法糖，本质上等于 var Foo = new Function()
console.log(Foo.__proto__ === Function.prototype) // true
var obj = {} // 同样也是语法糖，重点在理解与原型的关系
console.log(obj.__proto__ === Object.prototype) // true
```

![构造函数与Function的关系](http://img.xdxmblog.cn/images/image_20230328100557.png)

而Function和Object是函数，所以他们也是对象。那Function的隐式原型`__proto__`指向谁呢？我们通过控制台打印来观察一下：

![Function与Function.__proto__](http://img.xdxmblog.cn/images/image_20230328160252.png)

我们惊奇的发现，`Function.__proto__`与`Function.prototype`一抹一样，所以我创造了我自己？

```javascript
console.log(Function.__proto__ === Function.prototype) // true
```

那`Object.__proto__`应该指向`Object.prototype`吗？答案是与上面一样，指向`Function.prototype`。

```javascript
console.log(Object.__proto__ === Function.prototype) // true
// 所以
console.log(Object.__proto__ === Function.__proto__) // true
```

那`Object.prototype`跟`Function.prototype`是一个原型对象吗？答案是false，惊不惊喜，意不意外。

```javascript
console.log(Object.prototype === Function.prototype) // false
```

我们接着来看，因为`Function.prototype`是对象，所以他也有有隐式原型`__proto__`，那它指向谁呢？答案是`Object.prototype`，我们来验证一下：

```javascript
console.log(Function.prototype.__proto__ === Object.prototype) // true
```

越来越有趣了对不对，那我们好奇一下，`Object.prototype`的隐式原型指向谁呢？答案是null。

```javascript
console.log(Object.prototype.__proto__ === null) // true
```

通过上面的一系列小测验，我们得出：

- 所有的函数都有一个prototype属性，指向这个函数的原型对象（可以俗称显示原型、函数原型）
- 所有的实例对象，都有一个隐式原型`__proto__`，它指向这个对象的构造函数的原型对象（可以俗称隐式原型、对象原型）
- 对象的隐式原型可以通过`Object.getPrototypeOf(obj)`来获取
- 函数也是对象，所以函数也有隐式原型
- Function的隐式原型指向它自己的显示原型
- Object的隐式原型指向Function的显示原型
- Function.prototype的隐式原型指向Object的显示原型
- Object.prototype是顶级，所以它的隐式原型指向null

看完上面头还是晕晕的？来一张图给你标明它们之间的关系：

![原型之间的关系](http://img.xdxmblog.cn/images/image_20230328172513.png)

##### 原型链是如何工作的

通过上面的学习，我们已经掌握了什么是原型，而像上图这样把原型和对象一层一层链接起来，就叫做原型链。那它是如何工作的呢？我们还是通过代码来理解：

```javascript
function Foo() {}
Foo.prototype.name = 'XiaoDai'
var foo = new Foo
console.log(foo.name) // 'XiaoDai'
foo.name = 'XiaoMeng'
console.log(foo.name) // 'XiaoMeng'
foo.age = 18
foo.age.toString() // '18'
```

我们先是在Foo函数的原型对象上添加了一个name属性，然后通过new Foo生成foo对象，这时我们打印foo.name，我们明明没有给foo定义name属性，但是却能得到值XiaoDai。接着我们给foo定义name属性，再次打印，值变成了XiaoMeng。这是为什么呢？我们打印foo来观察：

![原型链](http://img.xdxmblog.cn/images/image_20230328180150.png)

我们发现，在foo对象上，有一个name属性，在foo的隐式原型上，也有一个name属性，当我们调用name属性时，会先从自身查找，如果自身有，直接返回查到的值。如果没有，就顺着`__proto__`去隐式原型上查，如果隐式原型上也没有（比如上面代码调用的toString方法，foo的隐式原型上并没有），就会顺着隐式原型的隐式原型上去查，直到查到`Object.prototype`，因为再往上查是null，就停止了。如下图：

```javascript
foo.toString() => foo.__proto__（Foo.prototype） => foo.__proto__.__proto__(Object.prototype)
```

需要注意的一点是：**原型链上的属性和方法并没有被复制到实例对象上**，通过上图也能观察到有2个name属性。

##### constructor属性

实际上，每个原型对象都有一个constructor属性，这个属性是在生成prototype时自动生成的，它指向构造函数本身。这里我们了解就好，所以上面的原型链图里没有标明，不然脑子会很乱。感兴趣的同学可以看着图写一下。

```javascript
console.log(Foo.prototype.constructor === Foo) // true
```

##### instanceof运算符的作用与实现

理解了原型与原型链，我们要如何判断一个构造函数的prototype属性是否出现在某个实例对象的原型链上呢？答案是instanceof运算符

```javascript
function Animal(name) {
    this.name = name
}
const cat = new Animal('cat')
const dog = new Animal('dog')
console.log(cat instanceof Animal) // true
console.log(cat instanceof Object) // true
console.log(cat instanceof Function) // false
console.log(cat instanceof dog) // Uncaught TypeError: dog is not a function
```

接下来我们实现一下instanceof:

```javascript
function myInstanceof(source, target) {
    // 如果第一个参数（实例对象）为基本类型和null，直接return false
    if(!['function', 'object'].includes(typeof source) || typeof source === null) return false
    // 如果第二个参数（构造函数）非函数类型，抛出异常
    if(typeof target !== 'function') throw new Error(`${target} is not a function`)
    
    let proto = Object.getPrototypeof(source)
    
    while(true) {
        // 找到尽头，return false
        if(proto === null) return false
        // 找到，return true
        if(proto === target.prototype) return true
        // 将proto的原型赋值给proto再次进入循环
        proto = Object.getPrototypeof(proto)
    }
}
// 测试一下上面的例子
console.log(myInstanceof(cat, Animal)) // true
console.log(myInstanceof(cat, Object)) // true
console.log(myInstanceof(cat, Function)) // false
console.log(myInstanceof(cat, dog)) // Uncaught TypeError: [object Object] is not a function
```

与typeof运算符的的区别

|            | 作用                                                         | 缺点                                                    |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| typeof     | 检测基本类型的值：string、boolean、number、null、undefined,以及引用类型中的function是精准的 | 对于object,array,null来说，都会返回object，无法精准区分 |
| instanceof | 判断一个构造函数的prototype属性是否出现在某个实例对象的原型链上，从原型的角度上可以判断某引用属于哪个构造函数，从而判定它的数据类型 |                                                         |

#### 小结

通过这篇文章，我们理解了什么是原型和原型链，以及原型链的工作原理。其次，我们学习到了instanceof运算符的作用以及如何实现，并与typeof做了对比，希望这篇文章能够帮助大家快速掌握相关知识。