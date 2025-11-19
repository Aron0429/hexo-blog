---
title: 使用宝塔部署NodeJs+Express API接口保姆级教程
author: 小呆
cover: 'https://cover.xdxmblog.cn/cover/cover_53311.webp'
abbrlink: 53311
date: 2025-11-18 16:56:52
updated: 2025-11-18 16:56:52
keywords:
tags:
  - Node
  - Express
  - 宝塔面板
categories:
  - 后端探索
  - Node
---

给娃做了一个自律的小程序，刚好也涉及到了使用服务器去部署Node项目，这对于我来说还是一个挺有趣的事情，以前一直也没用过宝塔面板，刚好借着这次机会记录一下整个流程。

## 前置准备

- 一台服务器
- 完整的NodeJS项目（需要注意依赖包所需的最低NodeJS版本）

我这里全程以阿里云ESC服务器实例操作，**系统版本：Debian 12.12 64位**。很多人安装系统的时候喜欢选CentOS 7，包括网上有大量老旧资料也都在推荐这个系统，但是需要注意的是CentOS 7安装宝塔面板后，NodeJS版本最高只支持到16。比如我的项目最低需要NodeJS 18+，那就不能选CentOS 7，否则项目跑步起来。

### 安装宝塔面板

点击实例=>远程连接，进入服务器（阿里云选免密登录即可）。输入以下命令，执行安装。

![](https://img.xdxmblog.cn/images/article_53311_01.webp)

```shell
wget -O install_panel.sh https://download.bt.cn/install/install_panel.sh && bash install_panel.sh ed8484bec
```

中途会询问**Do you want to install Bt-Panel to the /ww directory now?(y/n)**，输入y回车。这里的意思是询问你宝塔面板的安装路径。

```shell
Do you want to install Bt-Panel to the /ww directory now?(y/n) y
```

然后大概等个1~2分钟，会提示以下信息，就表示安装好了。

```shell
=============注意：首次打开面板浏览器将提示不安全=================

 请选择以下其中一种方式解决不安全提醒
 1、下载证书，地址：https://dg2.bt.cn/ssl/baota_root.pfx，双击安装,密码【www.bt.cn】
 2、点击【高级】-【继续访问】或【接受风险并继续】访问
 教程：https://www.bt.cn/bbs/thread-117246-1-1.html
 mac用户请下载使用此证书：https://dg2.bt.cn/ssl/mac.crt

========================面板账户登录信息==========================

 【云服务器】请在安全组放行 45678 端口
 外网ipv4面板地址: https://1.1.1.1:45678/4b5ce23c
 内网面板地址:     https://172.22.103.99:45678/4b5ce23c
 username: ezxceqwe
 password: 350fjk53

 浏览器访问以下链接，添加宝塔客服
 https://www.bt.cn/new/wechat_customer
==================================================================
```

把面板账户登录信息保存好，给你电脑里建个文档存一份。一会儿会用到，这个时候可以关掉远程连接了，暂时用不到它了。

### 安全组策略

划重点，这玩意就是你服务器的防火墙，能不能访问服务器主要靠它来控制。**后续我们在宝塔配置的数据库，NodeJS等项目需要配置安全组策略时，除了在宝塔面板的安全里需要放行，还需要在云服务器的安全组策略里放行。**

![](https://img.xdxmblog.cn/images/article_53311_02.webp)

回到云服务器ESC实例面板=>网络与安全组。添加入方向规则，把刚才面板登录信息里的端口号填进去。

![](https://img.xdxmblog.cn/images/article_53311_03.webp)

这时我们在浏览器里输入外网ipv4面板地址，用保存好的用户名和密码，就可以登录宝塔面板了。

![](https://img.xdxmblog.cn/images/article_53311_04.webp)

## 宝塔面板配置

从这里开始，大部分的操作基本都是在我们的宝塔面板里进行了。大部分的操作都是图形化界面，对后端新手和纯前端同学也是比较友好的，不太需要向运维那样纯命令行操作。

### 安装基本环境

第一次登录进去会提示绑定宝塔账号，我没绑，直接点击左侧导航栏首页。这时会弹窗，推荐你一键安装环境，直接勾选LNMP一键安装即可。这里我没截图安装过程，点击左侧软件商店=>已安装，可以看到我们已经安装好的服务。

![](https://img.xdxmblog.cn/images/article_53311_05.webp)

### 安装数据库

左侧导航栏选择数据库，进入页面之后，最好是先点一下root密码，自定义或随机生成一个数据库密码。

![](https://img.xdxmblog.cn/images/article_53311_06.webp)

然后添加数据库，这里数据库名称，用户名和密码，就按照你自己的项目正常填就行。**然后访问权限一定要打开，否则之后我们在自己电脑用Navicat等工具是访问不到的。**

![](https://img.xdxmblog.cn/images/article_53311_07.webp)

### 导入SQL

导入SQL之前我们需要确定一下自己的SQL文件大小，如果超过50M，要在PHP配置一下上传参数。小于50M的忽略这一步。

左侧导航栏选择软件商店=>已安装，找到PHP，点击设置。在弹窗中选择：配置修改，在下图框选处调整参数大小。修改完之后，点击弹窗里的服务，重启一下PHP，否则配置不生效。

![](https://img.xdxmblog.cn/images/article_53311_08.webp)

SQL导入我们可以通过宝塔安装的phpMyAdmin，也可以用自己熟悉的SQL工具，比如Navicat Premium，这里两种方式我都讲一下。

#### 通过phpMyAdmin导入SQL

左侧导航栏选择数据库=>phpMyAdmin=>通过面板访问，进入phpMyAdmin管理页面。

![](https://img.xdxmblog.cn/images/article_53311_09.webp)

选择刚才已经添加好的数据，点导入。

![](https://img.xdxmblog.cn/images/article_53311_10.webp)

#### 通过Navicat Premium导入SQL

在安全组策略里，添加3306端口放行。忘了怎么操作的小伙伴回到前置准备的第二步。

之后打开Navicat Premium=>文件=>新建连接=>选择数据库，我这里是MySQL。

![](https://img.xdxmblog.cn/images/article_53311_11.webp)

连接名随便写，自己能分清是连的哪个环境的数据库就行。主机填宝塔面板左上角的IP地址。端口默认3306，用户名和密码就是你要连哪个数据库，就填哪个数据库的用户名和密码。在宝塔面板的数据库列表可以看到。最后点一下测试连接，提示：连接成功，就说明没问题了。

### Node项目部署

数据库配置完成以后，我们来配置NodeJS环境。

#### 环境配置

左侧导航栏选择网站=>Node项目，通常第一次进入会提示你安装Node版本管理器。点击安装，安装完成后点击Node版本管理器，切换为官方源，选择支持你的NodeJS版本进行安装。

![](https://img.xdxmblog.cn/images/article_53311_12.webp)

#### 文件上传

左侧导航栏选择文件，选择wwwroot目录，创建一个新文件夹，名字随意，用来存放你的Node项目代码。

![](https://img.xdxmblog.cn/images/article_53311_13.webp)

打开你电脑的Node项目代码，修改项目连接数据的配置，将数据的配置项，比如host、port、user、password、database等，改成刚才导入SQL时填写的那些值。

![](https://img.xdxmblog.cn/images/article_53311_14.webp)

接着将项目里除了node_module以外的全部文件，上传到刚才创建的文件夹里。

![](https://img.xdxmblog.cn/images/article_53311_15.webp)

#### 添加项目

上传完成之后，左侧导航栏选择网站=>Node项目=>添加项目。

![](https://img.xdxmblog.cn/images/article_53311_16.webp)

- 项目目录选择刚才上传的目录。
- 名称随便填
- 启动选项可以用它带出来的，也可以自己填，比如 Node app.js等。
- Node版本，包管理器根据项目自行选择。
- 项目端口，填你项目里的真实端口，比如项目在本地跑是127.0.0.1:8888，这里端口就填8888。

完成之后，启动项目，会自动安装依赖，运行。**然后去安全策略组把对应（对应例子里是8888）端口号放行，这点很重要！同时把ESC服务器的策略组放行80端口（http服务端口），这个只需要放行服务器安全策略组就行，宝塔的默认放行了。**

### Vue项目部署

我这里用的是axios，需要在配置文件里将baseURL改为服务端（也就是上面的Node项目）的地址。

```javascript
const axiosInstance = axios.create({
  baseURL: 'http://192.168.1.217:3000/api', //这里改为服务端地址，后面如果配了域名，再替换为域名
  timeout: 5000,
  adapter: adapter,
})
```

与Node项目一样，在宝塔的`wwwroot`目录下创建一个新文件夹，用来存放Vue项目的代码。之后将Vue项目打包生成dist文件夹。将dist文件夹里的全部文件上传到刚才新建的文件夹里。然后左侧导航栏选择网站=>HTML项目=>添加项目。

- 域名填宝塔左上角ip（后面域名备案好了过来替换）
- 根目录选择创建好的文件夹

由于之前我们已经放行了80端口，这里就不用再次操作了。

## 测试项目

在浏览器输入宝塔左上角的IP地址，验证vue项目是否正常展示，然后打开F12调试面板，观察接口请求是否正常。如果有问题，检查一下是不是哪一步漏掉了。至此，从宝塔面板的安装，环境配置，数据库的安装，到Node后端接口的部署，前端页面的部署这一整套的流程就全部结束了。
