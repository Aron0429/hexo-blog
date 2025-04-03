---
title: Node + Express + MySQL 开发RESULT API(一)
author: 小呆
cover: 'https://cover.xdxmblog.cn/cover/cover_26719.webp'
categories:
  - 后端探索
  - Node
tags:
  - Node
  - Express
abbrlink: 26719
date: 2025-04-01 16:28:40
updated: 2025-04-01 16:28:40
---

最近在用`uni-app`给娃做一个日常习惯打卡的APP，后端接口打算用`Node+Express`去做，后续部署到Serverless，虽然近几年出了很多Node框架，但思虑再三，还是选择用比较成熟的Express来做，毕竟社区成熟度在这儿摆着。

## 初始化

这个系列的文章主要记录开发和后续部署到Serverless的过程。至于如何安装Node和MySQL网上有大量现成的教程，这里不再过多赘述。

本系列笔记选用Express 5.X版本开发，需要Node.js版本至少为18或更高。

### 安装Express

首先新建一个文件夹，并初始化项目，然后安装Express。

```shell
npm init -y
```

```shell
Wrote to C:\Users\Administrator\Desktop\express-api\package.json:

{
  "name": "express-api",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

```shell
npm i express
```

```shell
added 66 packages, and audited 67 packages in 4s

14 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

```

### 编写入口文件

接下来我们在根目录创建`src`文件夹，并在文件夹下创建`app.js`文件，也就是主入口文件。

```javascript
// 导入express
const express = require('express')
// 创建express实例
const app = express()

// 调用app.listen方法，指定端口号并启动web服务器
app.listen(3000, function () {
  console.log('server running at http://127.0.0.1:3000')
})
```

接着我们在命令行输入启动命令

```javascript
node src/app.js
```

这时候在浏览器输入`http://127.0.0.1:3000`,看到`Cannot GET/`，说明我们的服务器就启动好了。

## 添加路由

### 规划目录结构

在`src`文件夹下分别创建`controllers、models、routes`文件夹，具体作用如下：

- controllers：封装与前端进行的交互，如数据校验等。
- models：封装Node.js与数据库的交互逻辑。
- routes:存放路由文件。

### 创建路由文件

在`routes`目录下创建`index.js、user.routes.js`文件，具体作用如下：

- index.js：作为路由的入口文件，负责暴露所有的路由模块。
- user.routes.js：用户路由模块，用于存放用户相关的接口声明。
- xxx.routes.js：根据项目需求，存放不同的路由模块。

在`user.routes.js`文件里写入以下代码，其中的`router.get`表示我们要创建一个`GET`接口，第一个参数表示接口的地址，第二个参数是一个函数，表示访问该接口时执行的方法。具体的req,res等参数和方法，可以查阅express官方文档了解。

```javascript
const express = require('express')
// 创建路由对象
const router = express.Router()

// 获取用户分类
router.get('/type', (req, res) =>{
  res.send('ok')
})

module.exports = router
```

### 导入并注册写好的路由模块

在`index.js`文件里写入以下代码，这部分代码主要用于注册我们写好的路由模块，参数`/api/user`，表示为用户模块的接口添加统一的前缀，以刚才写的`/type`接口为例，访问时应该用`/api/user/type`。

```javascript
// 导入用户路由模块
const userRouter = require('./user.routes')

// 暴露一个方法，用来注册已经写好的路由模块
module.exports = app => {
  app.use('/api/user', userRouter)
}
```

回到`app.js`文件，写入以下代码来将所有的路由进行注册。

```javascript
const app = express()
// 添加以下代码
require('./routes')(app)
```

此时我们用浏览器访问`http://127.0.0.1:3000/api/user/type`并不会有任何反应，是因为我们每次修改文件都要重新启动服务器才能够得到最新的代码，那有什么办法可以不用一直手动重启服务器吗？答案是`Nodemon`。

### 自动监听并重启服务器

`Nodemon`是一个基于Node.js构建的开发工具，专为帮助开发者自动监控项目文件的更改而设计。每当文件发生变更时`Nodemon`会自动重启Node.js服务器，无需手动停止并重启。这对于提升开发速度、减少人工操作非常有帮助，尤其适用于构建后端服务或API接口时。

```shell
npm i -g nodemon
```

```shell
added 29 packages, and audited 30 packages in 4s

4 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

接下来打开`package.json`文件，进行以下改写：

```json
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1", 
    "start":"nodemon src/app.js"
  },
```

接着在命令行输入`npm start`，即可正常使用。

```shell
npm start

> express-api@1.0.0 start
> nodemon src/app.js

[nodemon] 3.1.9
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node src/app.js`
server running at http://127.0.0.1:3000
```

此时我们再次访问`http://127.0.0.1:3000/api/user/type`，就能看到返回的ok啦。

## 连接数据库

### 安装mysql2模块

在命令行输入以下代码来安装mysql2模块。

```shell
npm i mysql2

added 11 packages, and audited 78 packages in 2s

15 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

这里使用`mysql2`而不使用`mysql`的主要原因是`mysql2`增加了很多`mysql`没有的功能，比如Promise、Prepared Statements、更好的错误处理等。

### 数据库配置

在`src`目录下新建`config`文件夹，用于存放配置文件，同时在该文件夹下创建`config.js`文件，在该文件内添加以下代码：

```javascript
module.export = {
  dbConfig: {
    host: '127.0.0.1', // 数据库地址
    port: '8996', // 端口
    user: 'root', // 用户名
    password: '123456', //密码
    database: 'test', //数据库名称
  },
}
```

在刚才创建好的`models`文件夹里新建`db.js`，并在该文件内添加以下代码：

```javascript
// 由于能够更好的使用Promise,这里选择引入promise模块
const mysql = require('mysql2/promise')
const config = require('../config/config')

// 建立与mysql数据库的连接池
const pool = mysql.createPool({
  host: config.dbConfig.host,
  port: config.dbConfig.port,
  user: config.dbConfig.user,
  password: config.dbConfig.password,
  database: config.dbConfig.database,
})

module.exports = pool
```

### 创建本地数据

打开本地的MySQL数据库，创建一个名为`test`的数据库，并新建一个`user_type`的表，写入以下数据：（如何安装MySQL,创建数据库表等内容，由于不是本系列笔记的重点，这里不再赘述，网上找教程即可）

| id   | name | create_time         | update_time |
| ---- | ---- | ------------------- | ----------- |
| 1    | 妈妈 | 2025-03-28 10:20:55 | null        |
| 2    | 爸爸 | 2025-03-28 10:20:55 | null        |
| 3    | 爷爷 | 2025-03-28 10:20:55 | null        |
| 4    | 奶奶 | 2025-03-28 10:20:55 | null        |
| 5    | 姥爷 | 2025-03-28 10:20:55 | null        |
| 6    | 姥姥 | 2025-03-28 10:20:55 | null        |
| 7    | 亲人 | 2025-03-28 10:20:55 | null        |

## 编写接口

以上准备工作都做完以后，我们就可以进行正常的接口逻辑开发了。

### 与数据库的逻辑

在`models`文件夹里新建`user.model.js`，并写入以下代码：

```javascript
const pool = require('./db')
// 用户相关的数据库操作方法都挂载到User上，方便调用
const User = function (user) {}

// 查询
User.getAllType = async () => {
  let sql = 'SELECT * FROM user_type' // 要执行的SQL语句
  try {
    const [rows, fields] = await pool.query(sql) // rows返回查询结果，fields返回该表的字段名数组，一般用不到
    return Promise.resolve(rows) //执行成功，通过Promise返回
  } catch (error) {
    console.log('error:', error)
    return Promise.reject(error) //执行失败，返回错误信息
  }
}

module.exports = User
```

### 与前端的逻辑

在`controllers`文件夹里新建`user.controller.js`，并写入以下代码：

```javascript
const User = require('../models/user.model')

exports.findAllType = async (req, res) => {
  try {
    const result = await User.getAllType()
    res.send({ code: 200, message: '成功', data: result })
  } catch (error) {
    res.status(500).send({
      message: error.message || '服务器内部错误',
    })
  }
}
```

### 将接口逻辑与路由进行挂载

回到`user.routes.js`文件，将我们写好的逻辑挂载到路由上：

```javascript
const express = require('express')
const users = require('../controllers/user.controller')
// 创建路由对象
const router = express.Router()

// 获取用户分类
router.get('/type', users.findAllType)

module.exports = router
```

现在我们刷新浏览器`http://127.0.0.1:3000/api/user/type`,就能看到数据库返回的数据啦~

```json
{"code":200,"message":"成功","data":[{"id":1,"name":"妈妈","create_time":"2025-03-28T02:20:55.000Z","update_time":null},{"id":2,"name":"爸爸","create_time":"2025-03-28T02:20:55.000Z","update_time":null},{"id":3,"name":"爷爷","create_time":"2025-03-28T02:20:55.000Z","update_time":null},{"id":4,"name":"奶奶","create_time":"2025-03-28T02:20:55.000Z","update_time":null},{"id":5,"name":"姥爷","create_time":"2025-03-28T02:20:55.000Z","update_time":null},{"id":6,"name":"姥姥","create_time":"2025-03-28T02:20:55.000Z","update_time":null},{"id":7,"name":"亲人","create_time":"2025-03-28T02:20:55.000Z","update_time":null}]}
```

## 小结

这篇笔记主要记录了如何从零开始搭建一个`Node.js + Express + MySQL`为主的后端接口项目，包括如何规划目录结构，如何连接数据库，不同的处理逻辑应该如何解耦。目前的接口只实现了查的功能，后续的笔记会继续完善该项目，完成增删改，以及跨域、中间件等配置。





