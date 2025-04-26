---
title: Node + Express + MySQL 开发RESULT API(二)邮箱+验证码注册
author: 小呆
cover: 'https://cover.xdxmblog.cn/cover/cover_60030.webp'
categories:
  - 后端探索
  - Node
tags:
  - Node
  - Express
abbrlink: 60030
date: 2025-04-10 14:50:07
updated: 2025-04-10 14:50:07
---

上一篇笔记主要记录了如何快速搭建一个用`Node + Express + MySQL`开发的RESULT API小项目，并且编写并运行了一个GET接口。这篇笔记会继续完善这个小项目，将API开发中的CURD完整的写出来。

<!--more-->

上一篇笔记的最后我们实现了一个查询接口，用来查询用户的身份（分类），这篇笔记我们来实现通过邮件验证码来注册用户。

## 创建数据库表

在数据库中创建两个表`user，temp_user_code`表，用来存储用户数据和验证码数据，并设计以下结构。

| 名          | 类型     | 长度 | 小数点 | 不是null | 虚拟 | 键   | 注释                                          |
| ----------- | -------- | ---- | ------ | -------- | ---- | ---- | --------------------------------------------- |
| id          | int      | 10   | 0      | √        |      | √    | 用户id(无符号，自动递增)                      |
| openid      | varchar  | 255  | 0      |          |      |      | 微信openid                                    |
| email       | varchar  | 15   | 0      | √        |      |      | 邮箱（添加UNIQUE索引）                        |
| code        | varchar  | 6    | 0      |          |      |      | 邮箱验证码                                    |
| expires_at  | datetime | 0    | 0      |          |      |      | 验证码过期时间                                |
| type_id     | tinyint  | 2    | 0      |          |      |      | 用户身份id(添加外键指向user_type表中的id字段) |
| create_time | datetime | 0    | 0      |          |      |      | 创建时间（默认值CURRENT_TIMESTAMP）           |
| update_time | datetime | 0    | 0      |          |      |      | 更新时间（默认值CURRENT_TIMESTAMP，自动更新） |

| 名         | 类型     | 长度 | 小数点 | 不是null | 虚拟 | 键   | 注释                       |
| ---------- | -------- | ---- | ------ | -------- | ---- | ---- | -------------------------- |
| id         | int      | 10   | 0      | √        |      | √    | 验证码id(无符号，自动递增) |
| email      | varchar  | 15   | 0      |          |      |      | 邮箱（添加UNIQUE索引）     |
| code       | varchar  | 6    | 0      |          |      |      | 邮箱验证码                 |
| expires_at | datetime | 0    | 0      |          |      |      | 验证码过期时间             |

## 实现邮箱+验证码注册

创建好数据库表以后，我们就正式进入接口开发的环节了，这里我们选择使用邮箱+验证码登录的方式来实现用户的创建。

### 安装依赖

安装`nodemailer randomstring`依赖，其中`randomstring`库用来生成随机字符串（也就是我们要做的验证码），而`nodemailer`用来实现发送邮箱验证码。

```shell
npm i nodemailer randomstring
```

### 编写路由、控制器函数

安装好依赖以后，我们来编写路由函数，打开`user.routes.js`，添加以下路由。

```javascript
...
// 注册
router.post('/register', userController.register)
// 发送验证
router.post('/sendEmaliCode', userController.sendEmailCode)
...
```

接着我们来编写控制函数，打开`user.controller.js`，添加以下代码。

```javascript
// 发送验证码
exports.sendEmailCode = async (req, res, next) => {
  const { email } = req.body
  if (!email) {
    res.status(400).send({ code: -1, message: '请提供邮箱地址', data: null })
  }
  try {
    const result = await User.sendEmailCode(email)
    res.send({ code: 200, message: '验证码已发送，请查收邮件', data: result })
  } catch (error) {
    res.status(error.status || 500).send({
      code: error.code || -1,
      message: error.message || '服务器内部错误',
      data: null,
    })
  }
}
```

接着我们使用接口调试工具（我这里使用的是**Apifox**)，调用接口，我们发现不管参数email有没有值，接口都会报错，并且在命令也发现打印的`email`值也是`undefined`。

![接口调试](https://img.xdxmblog.cn/images/article_60030_01.webp)

### 解析req.body入参

其实这是因为express默认没有解析请求体中的数据导致的，现在我们来对它进行设置，打开`app.js`，添加以下代码：

```javascript
...
const app = express()
//添加以下代码
app.use(express.json()) // 解析json入参
app.use(express.urlencoded({ extended: false })) // 解析x-www-form-urlencoded入参

...
```

再次传入一个空的`email`，现在能正常返回错误信息了。

```json
{
    "code": -1,
    "message": "请提供邮箱地址",
    "data": null
}
```

### 配置邮件config、创建工具文件

打开`config.js`文件，写入以下配置。

```javascript
module.exports = {
  dbConfig: {
    ...
  },
  emailConfig: {
    host: 'smtp.163.com', // SMTP服务器地址
    port: 465, // 端口号
    secure: true, // 使用SSL
    auth: {
      user: 'youremail@163.com', // 发件人邮箱
      pass: '这里填你的授权码', // STMP授权码
    },
  },
}
```

在`src`目录下创建一个`utils.js`文件，用来开发工具函数,并写入以下代码。

```javascript
const nodemailer = require('nodemailer')
const randomstring = require('randomstring')
const config = require('./config')

// 创建nodemailer实例
exports.transporter = () => {
  return nodemailer.createTransport({
    ...config.emailConfig,
  })
}

// 生成验证码
exports.generateCode = () => {
  const code = randomstring.generate({
    length: 6, // 验证码长度
    charset: 'numeric', //可以选择 'alphabetic', 'numeric', 'hexadecimal', 'binary' 或者自定义字符集
  })
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 验证码有效期为5分钟
  return { code, expiresAt }
}

// 生成邮件模板
exports.generateMailOptions = (email, code, expiresAt) => {
  return {
    from: config.emailConfig.auth.user,
    to: email,
    subject: `您的验证码 ${code}`,
    text: `您好，您的验证码是：${code}。请不要告诉他人。验证码将在 ${expiresAt.toISOString()} 前有效。`,
    html: `<b>你的验证码是 ${code}，请勿告诉他人。</b>`, // HTML 内容
  }
}
```

### 编写发送验证码函数

打开`user.model.js`文件，编写发送验证码函数，这段函数的流程主要如下：

1. 通过`utils.generateCode()`方法生成验证码和过期时间
2. 通过辅助函数`findUser()`查询当前的邮箱是否已被注册，该函数做了通用化处理，可以根据`user`表的任意字段进行查询。
3. 根据查询结果判断当前发送的是登录验证码还是注册验证码，将`code,expiresAt`存入数据库中，以供后续验证比对。
4. 通过`utils.transporter()`方法发送邮件。

```javascript
const utils = require('../utils')

...

// 发送邮箱验证码
exports.sendEmailCode = async email => {
  try {
    // 生成验证码，过期时间
    const { code, expiresAt } = utils.generateCode()
    // 查询当前邮箱是否被注册
    const users = await this.findUser('email', email)

    if (users && users.length > 0) {
      // 保存登录验证码
      let updateSQL = `update user set code=?, expires_at=? where email='${email}'`
      await pool.query(updateSQL, [code, expiresAt, email])
    } else {
      // 每次发送之前先清空之前保存的临时验证码
      await this.deleteCode(email)
      // 保存注册验证码
      let saveSQL = `insert into temp_user_code(email, code, expires_at) values(?,?,?)`
      await pool.query(saveSQL, [email, code, expiresAt])
    }
    // 发送邮件
    const mailOptin = utils.generateMailOptions(email, code, expiresAt)
    const transporter = utils.transporter()
    await transporter.sendMail(mailOptin)
    return null
  } catch (error) {
    throw '验证码发送失败，请重新尝试'
  }
}

// 查询用户
exports.findUser = async (findType, data) => {
  try {
    let sql = `select * from user where ${findType} = ?`
    const [rows] = await pool.query(sql, [data])
    return rows
  } catch (error) {
    throw '服务器内部错误，请稍后重试'
  }
}

// 删除验证码
exports.deleteCode = async email => {
  try {
    let deleteSQL = `delete from temp_user_code where email='${email}'`
    await pool.query(deleteSQL, [email])
  } catch (error) {
    throw '服务器内部错误，请稍后重试'
  }
}
```

这时我们再次调用发送验证码的接口，可以观察到接口已经调用成功了，并且邮箱也收到了生成的验证码。

```javascript
{
    "code": 200,
    "message": "验证码已发送，请查收邮件",
    "data": null
}
```

### 编写校验验证码函数

这个过程比较简单，为了方便使用，该辅助函数也做了复用处理，通过`type`入参来决定校验的是注册code还是登录code。并将比对结果进行返回。

```javascript
// 校验验证码
exports.verifyCode = async (email, code, type = 'register') => {
  try {
    let sql = `select * from ${
      type == 'register' ? 'temp_user_code' : 'user'
    } where email = '${email}' and expires_at > NOW()`
    const [rows] = await pool.query(sql, [email])

    if (rows.length === 0) {
      return false
    }
    // 比较验证码
    const storeCode = rows[0].code
    if (storeCode === code) {
      return true
    }
    return false
  } catch (error) {
    throw '服务器内部错误，请稍后重试'
  }
}
```

### 编写注册函数

在`user.controller.js`文件内，编写注册控制器函数。

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
      res.status(500).send({
        code: 500,
        message: error || '服务器内部错误',
        data: null,
      })
    }
  }
}
```

在`user.model.js`文件内，编写注册函数。这个函数也比较简单，通过查询判断邮箱是否已注册，然后校验验证码，进行用户的创建即可。

```javascript
// 注册用户
exports.register = async (email, code, type_id) => {
  try {
    // 查询邮箱是否已被注册
    const users = await this.findUser('email', email)
    if (users.length > 0) {
      throw '该邮箱已被注册'
    } else {
      const isTrue = await this.verifyCode(email, code)

      if (!isTrue) {
        throw '验证码错误或已过期'
      }

      let createSQL = 'insert into user (email, type_id) value(?,?)'
      const [results] = await pool.query(createSQL, [email, type_id])
      if (results.affectedRows === 1) {
        // 注册成功，删除存储的验证码
        await this.deleteCode(email)
        return null
      }
    }
  } catch (error) {
    throw '注册失败，请稍后重试'
  }
}
```

## 小结

通过观察我们可以发现，仅仅实现一个发送验证码的函数，我们就用到了数据的增删改查四种能力。其实这四种sql语句单独使用的话，就对应了前端平时的接口调用**GET、POST、PUT、DELETE**，是不是很简单呢？

```javascript
// 增加
let saveSQL = `insert into temp_user_code(email, code, expires_at) values(?,?,?)`
await pool.query(saveSQL, [email, code, expiresAt])
// 更新
let updateSQL = `update user set code=?, expires_at=? where email='${email}'`
await pool.query(updateSQL, [code, expiresAt, email])
// 删除
let deleteSQL = `delete from temp_user_code where email='${email}'`
await pool.query(deleteSQL, [email])
// 查询
let sql = `select * from user where ${findType} = ?`
const [rows] = await pool.query(sql, [data])
```

但是我们观察代码也能发现有几个问题：

1. 入参校验需要写一大堆if else 很不美观，而且目前只做到了简单校验，对于入参的数据类型等等都没实现。
2. 错误捕获目前只能靠try catch，而且要重复写很多的`res.status().send()`，没有进行统一处理。
3. `config`文件保存很多敏感配置，比如数据库的用户名密码，邮件的授权码等，这种内容一旦传到github等，有暴露的风险。

下一篇笔记会针对这些错误进行优化配置，敬请期待吧！
