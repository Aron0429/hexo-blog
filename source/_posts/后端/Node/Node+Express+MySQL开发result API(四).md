---
title: Node + Express + MySQL 开发RESULT API(四)权限+日志
author: 小呆
cover: 'https://cover.xdxmblog.cn/cover/cover_9650.webp'
categories:
  - 后端探索
  - Node
tags:
  - Node
  - Express
abbrlink: 9650
date: 2025-04-26 16:30:36
updated: 2025-04-26 16:30:36
---

上一篇笔记我们实现了接口的参数校验功能、全局中间件的开发和错误处理、以及环境变量的配置。这个小项目已经趋于完善，这篇笔记主要实现接口的权限校验以及日志的接入和上传。最终达到麻雀虽小，五脏俱全的效果。

<!--more-->

## 权限认证

### 了解Token

Token表示令牌，也就是用户的登录凭证。我们做前端开发的时候，几乎可以说每个项目都会用到`Token`，并且需要把它存到`sessionStorage`里面，每次向后端请求接口的时候，都要把token放到请求头里，否则接口就会返回401。

token具有以下几个优点，这也使得它成为了目前主流的权限认证方式。

- 支持跨域访问：默认情况下cookie是无法跨域的。而token一般是放到请求头中，所以跨域后不存在信息丢失。
- 无状态：token机制在服务端不需要存储session信息，可以减轻服务端压力。
- 适用于移动端：APP端使用token认证会简单便捷。
- 无需考虑CSRF：由于不依赖cookie，所以使用token认证不会发CSRF，所以无需考虑CSRF防御。

### 了解JWT

`JWT`是`token`的一种具体实现方式，其全称是`JSON Web Token`。`JWT`由以下几方面组成：

- header(标头)：包含有关JWT编码方式的信息，例如用于签署令牌的算法。
- payload（有效负载）：包含声明（关于用户和附加元数据的声明）分为：注册声明、公共声明、私人声明。
- signature（签名）：用于验证JWT的发送者是否是其声称的身份，并确保消息在此发送过程中没有被更改。

#### 安装JWT

我们需要在项目中安装依赖：`jsonwebtoken`，它可以帮助我们在项目中生成token。

```shell
npm i jsonwebtoken express-jwt
```

#### 使用JWT生成Token

使用JWT生成token之前，我们需要在`.env`文件里添加一个配置，并将其加入`config`配置文件。

```env
# .env
JWT_SECRETKEY = '!@#$%^&*()'  # jwt密钥，随便定义一个，主要用于解密token
```

```javascript
const dotenv = require('dotenv')
dotenv.config()

module.exports = {
  ...,
  jwtSecretkey: process.env.JWT_SECRETKEY,
}
```

打开`utils.js`文件，编写以下代码，用于生成token。

```javascript
...
const jwt = require('jsonwebtoken')

// 生成token
exports.generateToken = (user, isRefresh = false) => {
  // jwt.sign接受3个参数，要加密的数据，jwt密钥，options
  const token = jwt.sign({ user }, config.jwtSecretkey, { expiresIn: isRefresh ? '7d' : '1h' }) // 有效期配置
  return `Bearer ${token}`
}
```

在这个方法中，我们预留一个`isRefresh`字段，用于后面生成`refreshToken`。

### 编写登录接口

通常我们会在登录的时候生成token并将其一起返回给前端，让前端存储token，并在调用接口时将token放在请求头中发给后端。

#### 新增登录路由

接下来我们编写一个登录接口，打开`user.routes.js`，新增登录路由。

```javascript
...
// 邮箱登录
router.post('/login', validator.body(userSchema.login), asyncHandler(userController.login))

...
```

登录接口我们选择使用邮箱+验证码的方式登录，也刚好可以利用上上一篇笔记中的发生验证码接口。

#### 编写登录校验

打开`user.schema.js`文件，增加登录接口需要校验的参数。由于之前在写注册接口时已经定义过`email、code`参数的校验规则，这里我们直接暴露即可。

```javascript
exports.login = Joi.object({ email, code })
```

#### 编写登录逻辑

打开`user.controller.js`文件，编写以下代码。

```javascript
exports.login = async (req, res) => {
  if (!req.body) throw createError(400, '缺少必要参数')
  const { email, code } = req.body
  const result = await User.login(email, code)
  res.success(result, '登录成功')
}
```

打开`user.model.js`文件，开始编写登录接口的核心逻辑。

```javascript
// 邮箱登录
exports.login = async (email, code) => {
  // 查询邮箱是否已被注册
  const users = await this.findUser('email', email)
  if (users.length == 0) {
    throw createError(400, '该用户不存在')
  }
  // 校验验证码
  const isLogin = true
  const isTrue = await this.verifyCode(email, code, isLogin)
  if (!isTrue) {
    throw createError(400, '验证码错误或已过期')
  }
  const accessToken = utils.generateToken({ email: users[0].email, id: users[0].id })
  return { ...users[0], accessToken }
}
```

#### 优化通用方法

登录过程与注册过程差不多，这里我们优化一下`verifyCode`方法，使其入参更加语义化。

```javascript
// 校验验证码
exports.verifyCode = async (email, code, isLogin = false) => {
  let sql = `select * from ${isLogin ? 'user' : 'temp_user_code'} where email = '${email}' and expires_at > NOW()`
  const [rows] = await pool.query(sql, [email])
	...
}
```

同时我们还利用到了之前写的查询用户的方法，但是我们返回用户的信息并不需要全部字段，所以我们需要改造一下，过滤掉我们不希望展示给前端的数据。

```javascript
// 查询用户
exports.findUser = async (findType, data) => {
  // 仅返回id,openid,email,typeId，并根据typeId查询typeName一并返回
  let sql = `select u.id, u.openid, u.email, u.type_id as typeId, t.name as typeName from user u join user_type t on u.type_id = t.id where ${findType} = ?`
  const [rows] = await pool.query(sql, [data])
  return rows
}
```

调用登录接口，输入邮箱和验证码，观察返回结果。我们可以看到token已经成功返回了。

```json
{
    "code": 200,
    "message": "登录成功",
    "data": {
        "id": 16,
        "openid": null,
        "email": "416681736@qq.com",
        "typeId": 1,
        "typeName": "妈妈",
        "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoiNDE2NjgxNzM2QHFxLmNvbSIsImlkIjoxNn0sImlhdCI6MTc0NTA0MzgyOSwiZXhwIjoxNzQ1MDUxMDI5fQ.2IpeNR6BFa0GprP-ahhlffPUg6ft_RnqhtuTDlSXA5o"
    }
}
```

### 校验Token

校验token通常有两种方式，一种是使用现成的express中间件，另一种是自己开发一个中间件。下面将两种方法都介绍一下,任选其中一个使用即可。

#### 一. 开发authTokenMiddleware中间件

在`middlewares`文件夹下新建`authTokenMiddleware.js`文件，编写校验token的代码。

```javascript
const jwt = require('jsonwebtoken')
const config = require('../config')
const createError = require('http-errors')

module.exports = (req, res, next) => {
  // 定义无需验证token的路由
  const unlessPath = ['/api/user/login', '/api/user/register', '/api/user/sendEmaliCode']
  // 遇到无需token的接口，直接放行
  if (unlessPath.includes(req.path)) {
    return next()
  }

  // 获取请求头中的accessToken
  let accessToken
  if (req.headers && req.headers.authorization) {
    // 给前端返回token时我们拼了Bearer ，这里需要处理
    const parts = req.headers.authorization.split(' ')
    if (parts.length == 2 && /^Bearer$/i.test(parts[0])) {
      accessToken = parts[1]
      // 验证accessToken
      try {
        jwt.verify(accessToken, config.jwtSecretkey)
        return next() // 校验token成功，放行
      } catch (error) {
        throw createError(401, '无效或过期的token') // 校验失败，抛出异常
      }
    }
    throw createError(401, '无效或过期的token') // token 格式校验失败
  }
  throw createError(401, '无效或过期的token') // 没有携带token，抛出异常
}
```

在`app.js`文件中，将刚才写好的中间件进行注册，注意中间件的执行顺序，要放在路由之前。

```javascript
...
const authTokenMiddleware = require('./middlewares/authTokenMiddleware')
...

app.use(authTokenMiddleware)
require('./routes')(app)

...
```

#### 二. 使用express-jwt中间件

`express-jwt`是一个自动校验`jwt`的中间件，使用之前需要先安装依赖。

```shell
npm i express-jwt
```

打开`utils.js`文件，编写以下代码。

```javascript
...
const { expressjwt } = require('express-jwt')
...

// 校验token
exports.jwtAuth = expressjwt({
  secret: config.jwtSecretkey,
  algorithms: ['HS256'],
}).unless({
  path: ['/api/user/login', '/api/user/register', '/api/user/sendEmaliCode'],
})
```

打开`errorMiddleware.js`，在全局错误中间件里添加错误处理。

```javascript
module.exports = (err, req, res, next) => {
 ...
 // 处理token验证错误
 if (err.name === 'UnauthorizedError') {
   err = createError(401, '无效或过期的token')
 }
 
 ...
}
```

在`app.js`中注册中间件。

```javascript
...
const utils = require('./utils')
...

app.use(utils.jwtAuth)
require('./routes')(app)

...
```

不管用上述哪种方式，现在我们调用之前写的`/api/user/type`接口，就会发现已经因为没有token被拦住了。

```json
{
    "code": 401,
    "message": "无效或过期的token",
    "data": null
}
```

我们在请求头中添加`Authorization`字段，将登录成功后返回的`token`值附加到上述接口的请求头中，再次调用接口，会发现已经能正常返回数据了。

### 使用双Token无感刷新

目前的使用场景中，`accessToken`的有效期通常比较短，大概也就十几分钟到1小时不等。这么做的原因主要是降低token被盗用的风险。但单token的场景也有一个弊端，就是因为失效快而需要频繁登录。

而一个产品能否长久的存活最重要的一个原因就是用户体验，所以自然而然的就进化到了双Token方案。这种方案的操作步骤如下：

1. 生成`accessToken`和`refreshToken`，其中`accessToken`不变，依旧是较短时效。而`refreshToken`通常具有较长的有效期（几天到几个月）。
2. `accessToken`依旧用于访问受保护的资源，当`accessToken`过期时，访问`refresh`接口，利用`refreshToken`重新生成新的`accessToken`返回到客户端。
3. 客户端拿着新的`accessToken`重新访问受保护的资源，实现token的无感刷新，提升用户的体验。

下面我们就来改造代码，将项目改造成双Token实现无感刷新。

打开`utils.js`，修改生成token的方法，通过添加字段来区别`accessToken`和`reFreshToken`，这么做的原因是为了防止拿`accessToken`来换取新的`accessToken`。

```javascript
... 
// 生成token
exports.generateToken = (user, isRefresh = false) => {
  const expiresIn = isRefresh ? '7d' : '2h'
  const tokenType = isRefresh ? 'refresh' : 'access'
  const token = jwt.sign({ user, tokenType }, config.jwtSecretkey, { expiresIn }) // 有效期配置
  return `Bearer ${token}`
}


// 校验refreshToken
exports.authRefreshToken = refreshToken => {
  let token
  const parts = refreshToken.split(' ')
  if (parts.length == 2 && /^Bearer$/i.test(parts[0])) {
    token = parts[1]

    try {
      const result = jwt.verify(token, config.jwtSecretkey)
      return result
    } catch (error) {
      return null
    }
  }
  return null
}
```

打开`user.routes.js`，添加刷新token的路由，注意要把这个路由添加到`unlessPath`的白名单里。

```javascript
...
// 刷新Token
router.get('/refresh', asyncHandler(userController.refresh))
...
```

打开`user.controller.js`，添加对应的controller方法。

```javascript
...
// 刷新token
exports.refresh = async (req, res) => {
  const refreshToken = req.headers.refreshtoken
  if (!refreshToken) {
    throw createError(403, 'Forbidden')
  }
  const result = await User.refresh()
  res.success(result)
}
...
```

打开`user.modele.js`，编写刷新token的方法，并对之前的login方法进行改造，返回双token。

```javascript
// 刷新token
exports.refresh = async refreshToken => {
  const jwtResult = utils.authRefreshToken(refreshToken)
  if (!jwtResult) {
    throw createError(403, 'Forbidden')
  } else {
    // 防止拿accessToken换取accessToken
    if (jwtResult.tokenType != 'refresh') {
      throw createError(403, 'Forbidden')
    }
    // 生成新的accessToken
    const accessToken = utils.generateToken(jwtResult.user)
    return accessToken
  }
}

// 邮箱登录
exports.login = async (email, code) => {
  // 查询邮箱是否已被注册
  const users = await this.findUser('email', email)
  if (users.length == 0) {
    throw createError(400, '该用户不存在')
  }
  // 校验验证码
  const isLogin = true
  const isTrue = await this.verifyCode(email, code, isLogin)
  if (!isTrue) {
    throw createError(400, '验证码错误或已过期')
  }
  const isRefresh = true
  const accessToken = utils.generateToken({ email: users[0].email, id: users[0].id })
  const refreshToken = utils.generateToken({ email: users[0].email, id: users[0].id }, isRefresh)

  return { ...users[0], accessToken, refreshToken }
}
```

至此，Token权限校验的部分就开发完了，下面开始开发日志部分。

## 日志

不管是前端开发还是后端开发，日志管理都是追踪错误和监控系统性能的关键。通过日志管理，我们能够更好的维护和问题排查。这里我们选用社区中使用广泛的`winston`来实现项目的日志管理。

### 安装winston、winston-daily-rotate-file

其中`winston-daily-rotate-file`

```javascript
npm i winston winston-daily-rotate-file
```

### 使用winston生成日志

通过`winston.createLogger()`方法，我们可以创建自己的`logger`日志器。

该方法接受以下参数呢：

| 名称          | 默认                        | 描述                                              |
| ------------- | --------------------------- | ------------------------------------------------- |
| `level`       | `'info'`                    | 仅当`info.level`小于或等于此级别时才记录          |
| `levels`      | `winston.config.npm.levels` | 表示日志优先级的级别（和颜色）                    |
| `format`      | `winston.format.json`       | `info`消息的格式                                  |
| `transports`  | `[]`（无传输）              | `info`消息的日志记录目标集                        |
| `exitOnError` | `true`                      | 如果为`false`，则处理的异常不会导致`process.exit` |
| `silent`      | `fasle`                     | 如果为true，则所有日志都将被抑制                  |

在`scr`目录下新建`logger`文件夹，并创建`index.js`文件，编写以下代码：

```javascript
const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')

const { combine, timestamp, printf, colorize, label } = winston.format
const env = process.env.NODE_ENV || 'development'

// 自定义日志格式
const logFormat = printf(info => {
  return `${info.timestamp} [${info.level}]: ${info.message}`
})

// 创建Logger实例
const logger = winston.createLogger({
  // 设置日志级别（error, warn, info, verbose, debug, silly）
  level: env === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // 添加时间戳
    logFormat, // 应用自定义格式
  ),
  transports: [
    // 控制台输出（带颜色）
    new winston.transports.Console({
      format: combine(colorize({ all: true }), logFormat),
    }),
    // 按日分割文件
    new DailyRotateFile({
      dirname: 'logs', // 日志目录
      filename: '%DATE%.log', // 文件名（%DATE% 自动替换为日期）
      datePattern: 'YYYY-MM-DD', // 日期格式
      zippedArchive: true, // 压缩旧日志
      maxSize: '20m', // 单个文件最大大小
      maxFiles: '7d', // 保留最近7天的日志
    }),
  ],
  // 异常处理（可选）
  exceptionHandlers: [new winston.transports.File({ filename: 'logs/exceptions.log' })],
  // Promise拒绝处理（可选）
  rejectionHandlers: [new winston.transports.File({ filename: 'logs/rejections.log' })],
})

module.exports = logger
```

### 开发loggerMiddleware中间件

在`middlewares`目录下创建`loggerMiddleware.js`文件，编写以下代码：

```javascript
const logger = require('../logger')

module.exports = (req, res, next) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`)
  })

  next()
}
```

我们在每个请求完成的时候，记录了一条日志，包含了该条请求的主要信息。例如`GET /api/user/type - 401 (14ms)`，配合下面的错误日志，可以快速定位到是哪个接口报错，从而方便我们排查问题。

### 记录错误日志

在`errorMiddleware.js`文件中，编写以下代码：

```javascript
...
const logger = require('../logger')

module.exports = (err, req, res, next) => {
	...
  if (!createError.isHttpError(err)) {
    err = createError(500, '服务器内部错误，请稍后重试')
  }
  // 记录错误到日志
  logger.error(`Error：' ${err.message}`)
  ...
}

```

### 在路由或服务中使用logger

以发送验证码为例，我们可以在任何路由或者服务中直接调用logger来记录日志。

```javascript
const logger = require('../logger')

// 发送邮箱验证码
exports.sendEmailCode = async email => {
  logger.debug('Fetching data from database...');
  // 生成验证码，过期时间
  const { code, expiresAt } = utils.generateCode()
  // 查询当前邮箱是否被注册
  const users = await this.findUser('email', email)

  if (users && users.length > 0) {
    // 保存登录验证码
    let updateSQL = `UPDATE user SET code=?, expires_at=? WHERE email='${email}'`
    await pool.query(updateSQL, [code, expiresAt, email])
  } else {
    // 每次发送之前先清空之前保存的临时验证码
    await this.deleteCode(email)
    // 保存注册验证码
    let saveSQL = `INSERT into temp_user_code(email, code, expires_at) VALUES(?,?,?)`
    await pool.query(saveSQL, [email, code, expiresAt])
  }
  
  // 发送邮件
  const mailOptin = utils.generateMailOptions(email, code, expiresAt)
  const transporter = utils.transporter()
  await transporter.sendMail(mailOptin)
  logger.info('Database info: %s', '验证码发送成功');
  return null
}
```

### 加载日志中间件

打开`app.js`，编写以下代码：

```javascript
...
const loggerMiddleware = require('./middlewares/loggerMiddleware')

...
// 加载日志中间件
app.use(loggerMiddleware)
app.use(responseMiddleware)
...
```

### 测试日志是否生成

随便调用一个接口，将请求头的token去掉，返回401后观察项目根目录是否生成logs文件夹和日志文件。还可以通过终端查看是否打印出日志：

```bash
2025-04-25 11:01:49 [info]: GET /api/user/type - 401 (2ms)
2025-04-25 11:01:49 [error]: Error：' Forbidden
2025-04-25 11:01:49 [info]: GET /api/user/refresh - 403 (1ms)
```

### 日志分割配置

| 参数          | 类型    | 说明                                                        |
| ------------- | ------- | ----------------------------------------------------------- |
| dirname       | string  | 日志文件存储在项目根目录的哪个文件夹                        |
| filename      | string  | 每日生成的文件名格式                                        |
| datePattern   | string  | 按什么格式分割，按日，按小时（`YYYY-MM-DD, YYYY-MM-DD-HH`） |
| zippedArchive | boolean | 旧日志是否自动压缩为 `.gz` 文件以节省空间                   |
| maxSize       | string  | 单个日志文件超过XX体积时触发分割（即使未到日期）            |
| maxFiles      | string  | 自动删除XX天前的日志文件                                    |

```javascript
const DailyRotateFile = require('winston-daily-rotate-file')

new DailyRotateFile({
  dirname: 'logs', 
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD', 
  zippedArchive: true, 
  maxSize: '20m', 
  maxFiles: '7d',
})
```

### 日志文件结构

```bash
-logs
  -2025-04-25.log     # 当日日志
  -2025-04-25.log.gz  # 压缩的旧日志
  -exceptions.log         # 异常日志
  -rejections.log         # Promise拒绝日志
```

### 高级配置（可选）

一. 多级别日志分割

为不同级别（如 `error` 和 `info`）创建独立文件：

```javascript
transports: [
  new winston.transports.DailyRotateFile({
    level: 'error', // 仅记录 error 级别
    filename: 'error-%DATE%.log',
    // 其他配置同上
  }),
  new winston.transports.DailyRotateFile({
    level: 'info', // 仅记录 info 级别
    filename: 'info-%DATE%.log',
    // 其他配置同上
  })
]
```

二. 自定义日志格式

添加更多上下文信息（如请求 IP）：

```javascript
const logFormat = printf(({ level, message, timestamp, meta }) => {
  return `${timestamp} [${level}] ${meta?.ip || '-'} - ${message}`;
});

// 在中间件中传递元数据
logger.info('Request received', { ip: req.ip });
```

更多配置可以参考[**winston开发文档**](https://winston.nodejs.cn/docs/)。

## 小结

到这里，这个小项目的所有配置基本上就已经差不多都搭建完了，从第一篇笔记的安装Express开始，我们一步一步的完成了：

1. 路由的配置与开发，数据库的配置与连接，编写接口。
2. 实现邮箱+验证码注册，配置全局`config、utils.js`。
3. 实现路由参数校验、完成全局错误中间件、响应中间件、异步异常处理中间件的开发。
4. 完成环境变量的配置，完成Token开发，实现路由鉴权，无感刷新token，完成日志记录。

整个开发过程对我来说是一次很不错的旅程，就目前来说，这些东西已经足够支撑一些小型项目的运行了。但细心的朋友也会发现，在与数据库的交互过程中，我几乎是全部使用了原生的SQL语句，没有用任何的ORM库。

这块的话其实也是我有意为之，主要还是强化一下自己的SQL语句和用法，因为很多语句都是一遍翻书一边写的。再一个就是目前的ORM库我也只是很久以前用过`Sequelize`，但当时的体验并不友好，所有这次也不给自己增加太大的难度。

后续我应该会把整个项目的框架整理一下，做个脚手架，方便大家能够快速搭建，省去一步一步操作的麻烦。
