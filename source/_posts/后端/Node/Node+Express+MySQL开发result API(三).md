---
title: Node + Express + MySQL 开发RESULT API(三)配置优化
author: 小呆
cover: 'https://cover.xdxmblog.cn/cover/cover_57037.webp'
abbrlink: 57037
date: 2025-04-17 01:03:45
updated: 2025-04-17 01:03:45
tags:
  - Node
  - Express
categories:
  - 后端探索
  - Node
---

上一篇笔记我们实现了邮箱+验证码注册的功能，并且在小结的时候也发现了几个问题。如果这些问题放到项目最后在解决，会存在代码改动量过大，容易出错。所以这篇笔记主要针对这几个问题进行优化、解决，使得项目更加健康。

<!--more-->

## 参数校验

以上一篇笔记中的代码为例，我们仅仅判断3个入参是否为空就已经写了一堆`if...else if...else`来判断，那如果加上参数类型，或者入参更多一些，恐怕这种方式就难以为继了。

```javascript
// 通过邮箱注册用户
exports.register = async (req, res, next) => {
  const { email, code, type_id } = req.body
  if (!email || !code) {
    res.status(400).send({ code: -1, message: '邮箱或验证码不能为空', data: null })
  } else if (!type_id) {
    res.status(400).send({ code: -1, message: '请选择身份', data: null })
  } else if (type_id && (type_id < 1 || type_id > 7)) {
    res.status(400).send({ code: -1, message: '身份值有误', data: null })
  } else {
    try {
      const result = await User.register(email, code, type_id)
      res.send({ code: 200, message: '注册成功', data: result })
    } catch (error) {
      res.status(error.status || 500).send({
        code: -1,
        message: error.message || '服务器内部错误',
        data: error.data || null,
      })
    }
  }
}
```

那有没有什么方式可以不用写一堆判断来校验参数呢？答案是有的，那就是使用**Joi和express-joi-validation**。

**Joi**是一个强大的对象模式描述语言和验证器，而**express-joi-validation**是Joi的一个中间件，用于将Joi的验证功能集成到Express应用中。

### 安装Joi

```shell
npm i joi
```

### 使用Joi进行数据验证

以上述代码为例进行改造，我们通过创建一个Schema对象，来决定每个参数的类型，是否为必填项，是否为某个特定的格式等。然后通过`validate`方法去进行校验。

```javascript
const Joi = require('joi');

// 通过邮箱注册用户
exports.register = async (req, res, next) => {
  const userSchema = Joi.object({
    email: Joi.string().email().required(), // 字符串类型，email格式，必填项
    code: Joi.string().required(), // 字符串类型，必填项
    type_id: Joi.number().integer().valid(1, 2, 3, 4, 5, 6, 7).required(), // 数字类型，整数，必须为1-7的其中一个，必填项
  })
  const { error, value } = userSchema.validate(req.body)

  if (error) { // 验证错误，抛出异常
    res.status(400).send({ code: 400, message: error.details[0].message, data: null })
  } else {  // 验证通过
    console.log(value) 
    try {
      const result = await User.register(email, code, type_id)
      res.send({ code: 200, message: '注册成功', data: result })
    } catch (error) {
      res.status(500).send({
        code: 500,
        message: error || '服务器内部错误',
        data: null,
      })
    }
  }
}
```

### Joi核心验证规则速查表

下面列举一些Joi的验证规则，方便快速上手。更全的规则请查看[**《Joi API v17.13.3》**](https://joi.dev/api/?v=17.13.3)

#### 通用规则

| 规则类型     | 示例代码                         | 说明                   |
| ------------ | -------------------------------- | ---------------------- |
| **必填项**   | `.required()`                    | 强制字段存在           |
| **类型验证** | `.string() .number() .boolean()` | 基础类型验证           |
| **范围限制** | `.min(5) .max(100)`              | 数值/字符串长度限制    |
| **正则验证** | `.pattern(/^1[3-9]\d{9}$/)`      | 正则表达式匹配         |
| **枚举值**   | `.valid('admin', 'user')`        | 限定允许的枚举值       |
| **默认值**   | `.default('guest')`              | 未传值时自动填充默认值 |

#### 字符串专用

```javascript
Joi.string()
	.alphanum() // 仅允许字母数字
  .trim()             // 自动去除两端空格
  .lowercase()        // 转换为小写
  .uppercase()        // 转换为大写
  .replace(/ /g, '_') // 替换字符
```

#### 数字专用

```javascript
Joi.number()
  .integer()          // 必须为整数
  .positive()         // 正数
  .precision(2)       // 小数点后保留2位
```

#### 复杂结构

```javascript
// 数组验证
Joi.array().items(Joi.string().valid('A', 'B', 'C'))

// 对象嵌套
Joi.object({
  address: Joi.object({
    city: Joi.string(),
    street: Joi.string()
  })
})

// 条件验证
Joi.when('role', {
  is: 'admin',
  then: Joi.object({ accessLevel: Joi.number().min(3) })
})
```

看上去比我们之前写很多`if...else`校验要好了很多，那能不能继续优化呢？比如在路由层面？答案是当然可以，利用`express-joi-validation`中间件就可以实现。

### 安装express-joi-validation

```shell
npm i express-joi-validation
```

在`src`目录下创建`schemas`文件，用来存放接口所需要校验的字段和规则。并在该目录下创建`user.schemas.js`文件。

```javascript
const Joi = require('joi')

const email = Joi.string().email().required().messages({
  'any.required': '缺少email',
  'string.email': 'email格式不正确',
})

const code = Joi.string().required().messages({
  'any.required': '缺少code',
})

const type_id = Joi.number().integer().required().valid(1, 2, 3, 4, 5, 6, 7).messages({
  'any.required': '缺少type_id',
  'any.only': 'type_id校验失败',
})

exports.registerSchema = Joi.object({ email, code, type_id })
```

修改`user.routes.js`文件，利用中间件将校验放到路由上。

```javascript
...
const validator = require('express-joi-validation').createValidator({ passError: true })
const userSchema = require('../schemas/user.schema')

router.post('/register', validator.body(userSchema.registerSchema), userController.register)
```

`express-joi-validation`可以针对以下几种情况来进行校验。

```javascript
const validator = require('express-joi-validation').createValidator({ passError: true })

validator.query(options)
validator.body(options)
validator.headers(options)
validator.params(options)
validator.response(options)
validator.fields(options)
```

修改`user.controller.js`文件，精简后的代码如下。

```javascript
// 通过邮箱注册用户
exports.register = async (req, res, next) => {
  if (!req.body) throw new Error('参数不能为空')
  try {
    const { email, code, type_id } = req.body
    const result = await User.register(email, code, type_id)
    res.send({ code: 200, message: '注册成功', data: result })
  } catch (error) {
    next(error)
  }
}
```

虽然代码精简了，但是我们调用接口发现，如果传入错误的参数，express默认会返回一个html文件来展示error。这显然不是我们想要的，所以我们需要一个全局的错误处理中间件。

## 开发中间件

### 全局错误中间件

在`src`目录下新建`middlewares`文件夹，用来存放我们所有的中间件。在该文件夹下创建`errorMiddleware.js`文件，这个就是我们的全局错误中间件。

```javascript
module.exports = (err, req, res, next) => {
  // 处理Joi验证错误
  if (err.error && err.error.name && err.error.name === 'ValidationError') {
    const details = err.error.details.map(d => ({
      message: d.message.replace(/"/g, ''),
    }))

    return res.status(err.status || 400).json({
      code: 400,
      message: details && details.length > 0 ? details[0].message : '参数校验失败！',
      data: null,
    })
  }
  // 其他错误
  const errorMsg = err instanceof Error ? err.message : err
  return res.status(err.status || 500).json({
    code: 500,
    message: errorMsg,
    data: null,
  })
}
```

目前我们针对Joi的错误进行了特殊处理，使其更加贴近于日常开发的格式。并且对其他错误进行了一个暂时的兜底。后续做其他功能时会继续完善该中间件。

打开`app.js`，将刚才写好的中间件进行注册。

```javascript
...
const errorMiddleware = require('./middlewares/errorMiddleware')

require('./routes')(app) // 注册路由
app.use(errorMiddleware) // 错误中间件一定要放到路由后面注册才能正常捕捉
```

但有时候，我们可能会需要在`model`文件中处理一些异常，但这些异常又不一定全部都要返回500状态码。

```javascript
exports.register = async (email, code, type_id) => {
  try {
    ...
    if (users.length > 0) {
      // 这里应该返回400状态
    	throw '该邮箱已被注册'
    } else {
     ...
      if (!isTrue) {
        // 同理，这里也应该返回400状态
        throw '验证码错误或已过期'
      }
			...
    }
  } catch (error) {
    throw error
  }
}
```

这时我们需要一个能快速创建不同错误状态的工具，也就是**http-errors**。

### http-errors

**http-errors**是一个Node.js模块，通过简单的API，让您可以方便地创建和扩展与HTTP状态码关联的错误对象。它提供了丰富的构造函数来直接创建不同类型的HTTP错误，并且可以自定义错误信息以及附加属性。

#### 安装http-errors

```
npm i http-errors
```

#### 使用http-errors创建HTTP错误

修改`user.model.js`，修改上述例子的代码。

```javascript
const createError = require('http-errors')

exports.register = async (email, code, type_id) => {
  try {
    ...
    if (users.length > 0) {
      // 这里应该返回400状态
    	throw createError(400, '该邮箱已被注册')
    } else {
     ...
      if (!isTrue) {
        // 同理，这里也应该返回400状态
        throw createError(400, '验证码错误或已过期')
      }
			...
    }
  } catch (error) {
    throw error
  }
}
```

修改`errorMiddleware.js`，形成统一的错误返回。

```javascript
const createError = require('http-errors')

module.exports = (err, req, res, next) => {
  // 处理Joi验证错误
  if (err.error && err.error.name && err.error.name === 'ValidationError') {
    const details = err.error.details.map(d => ({
      message: d.message.replace(/"/g, ''),
    }))
    const message = details && details.length > 0 ? details[0].message : '参数校验失败！'
    err = createError(400, message)
  }

  // 对其他异常进行兜底，转换成通用的错误对象
  if (!createError.isHttpError(err)) {
    err = createError(500, '服务器内部错误，请稍后重试')
  }

  return res.status(err.status).json({
    code: err.status,
    message: err.message,
    data: null,
  })
}
```

### 全局响应中间件

返回成功响应的时候，我们每次都要写如下代码，这个地方能不能简化呢？答案是当然能，我们编写一个中间件来对res对象进行扩展。

```javascript
res.send({ code: 200, message: '注册成功', data: result })
```

在`middlewares`文件夹下创建`responseMiddleware`文件，编写以下代码。

```javascript
module.exports = (req, res, next) => {
  res.success = (data = null, message = '请求成功') => {
    res.status(200).json({
      code: 200,
      message,
      data,
    })
  }
  next()
}
```

打开`app.js`，将刚才写好的中间件进行注册。

```javascript
...
const responseMiddleware = require('./middlewares/responseMiddleware')

app.use(responseMiddleware) // 要放到路由前面注册，否则路由里拿不到success方法
require('./routes')(app) // 注册路由
```

修改`user.controller.js`文件，现在代码看起来清爽多啦！

```javascript
// 通过邮箱注册用户
exports.register = async (req, res, next) => {
  if (!req.body) throw new Error('缺少必要参数')
  try {
    const result = await User.register(email, code, type_id)
    res.success(result, '注册成功')
  } catch (error) {
    next(error)
  }
}
```

### 异步异常处理中间件

但我们的代码还有一个小问题，就是`try...catch`太多了，原因就是Epxress可以很好的处理同步的异常，因为同步的异常`throw err`，会自动转化为

```javascript
next(err)
```

但是异步的异常，就必须要手动`next(err)`，就像上面的代码一样。然而，`try...catch`并非唯一可以手动`next(err)`的途径，`Promise`的`catch`也行。

```javascript
// 官网提供的示例
app.get('/', (req, res, next) => {
  Promise.resolve().then(() => {
    throw new Error('BROKEN')
  }).catch(next) // Errors will be passed to Express.
})
```

在`middlewares`文件夹下创建`asyncMiddleware`文件，编写以下代码。

```javascript
module.exports = fn => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next)
}
```

修改`user.routes.js`文件，在路由层面添加中间件处理。

```javascript
const asyncHandler = require('../middlewares/asyncMiddleware')

// 查询用户身份列表
router.get('/type', asyncHandler(userController.findAllType))
// 注册
router.post('/register', validator.body(userSchema.register), asyncHandler(userController.register))
// 发送验证
router.post('/sendEmaliCode', validator.body(userSchema.sendEmailCode), asyncHandler(userController.sendEmailCode))
```

好了，可以愉快的把`controller`和`model`文件里的`try...catch`统统干掉啦！

```javascript
// 通过邮箱注册用户
exports.register = async (req, res, next) => {
  if (!req.body) throw '缺少必要参数'
  const { email, code, type_id } = req.body
  const result = await User.register(email, code, type_id)
  res.success(result, '注册成功')
}
```

```javascript
// 注册用户
exports.register = async (email, code, type_id) => {
  // 查询邮箱是否已被注册
  const users = await this.findUser('email', email)
  if (users.length > 0) {
    throw createError(400, '该邮箱已被注册')
  } else {
    const isTrue = await this.verifyCode(email, code)

    if (!isTrue) {
      throw createError(400, '验证码错误或已过期')
    }

    let createSQL = 'insert into user (email, type_id) value(?,?)'
    const [results] = await pool.query(createSQL, [email, type_id])
    if (results.affectedRows === 1) {
      // 注册成功，删除临时保存的验证码
      await this.deleteCode(email)
      return null
    }
  }
}
```

## 环境变量配置

上一篇笔记也提到了目前很多敏感数据在config文件下明文存储，对于项目不是很友好。所以我们需要一个管理环境变量的工具，帮助我们管理开发、测试、生产的配置。

上一篇笔记也提到了目前很多敏感数据在`config`文件下明文存储，对于项目不是很友好。所以我们需要一个管理环境变量的工具，帮助我们管理开发、测试、生产的配置。

### 安装dotenv

```shell
npm i dotenv
```

### 创建.env文件

在根目录创建`.env`文件，将`config`文件下的配置写入。

```env
#DB_CONFIG
DB_HOST= "127.0.0.1" #数据库地址
DB_PORT= "3306" #数据库端口
DB_USER= "root" #数据库用户名
DB_PASSWORD= "123456" #数据库密码
DB_DATABASE= "test" #数据库名称

#EMAIL_CONFIG
EMAIL_HOST= "smtp.163.com" #SMTP服务器地址
EMAIL_PORT= 465 #端口号
EMAIL_SECURE= true #使用SSL
EMAIL_USER="abc@163.com" #发件人邮箱
EMAIL_PASS= "xxxxxx" #邮箱授权码
```

### 引入dotenv

修改`config`配置文件，引入`dotenv`，`dotenv`会将`.env`文件内的变量都挂载到`process.env`上面。

```javascript
const dotenv = require('dotenv')
dotenv.config()

module.exports = {
  dbConfig: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  emailConfig: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  },
}
```

### 确保.env不被提交

在`.gitignore` 文件中添加`.env`文件，以确保它不会被提交到版本控制系统当中。

```gitignore
/node_modules
npm-debug.log
package-lock.json
.env
```

### 在不同的环境中设置环境变量

- **开发环境**：通常 `.env` 文件会包含开发环境的配置。
- **测试环境**：可以创建一个 `.env.test` 文件，并在测试脚本中加载它，或者通过命令行设置环境变量。
- **生产环境**：环境变量通常通过操作系统的环境变量设置，或者通过像 Heroku、AWS 等平台的环境变量管理工具来管理。

## 小结

这篇笔记没有加新的功能，主要是针对上一篇笔记末尾总结的三个问题进行优化和改良。同时也学习了中间件的开发与使用，并且通过使用社区成熟的库来减少重复造轮子的行为。希望这篇笔记能帮到同样在用`Node+Express`学习接口开发的你吧！
