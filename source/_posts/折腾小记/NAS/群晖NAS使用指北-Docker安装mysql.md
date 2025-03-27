---
title: 群晖NAS使用指北-Docker安装MySQL
author: 小呆
cover: 'https://cover.xdxmblog.cn/cover/cover_25614.webp'
abbrlink: 25614
date: 2025-03-24 17:31:32
updated: 2025-03-24 17:31:32
keywords:
tags:
  - NAS
  - MySQL
categories: 
  - 折腾小记
  - NAS
---

玩 NAS 有一段时间了，最近准备试试在 NAS 上面安装 MySQL 数据库，用来存放一些自己折腾的数据，由于对 Docker 搭建 MySQL 还不是特别熟悉，特通过此笔记进行记录，方便后续查看。

<!--more-->

## 安装教程

### 拉取映像

先使用`PuTTY`通过 ssh 连接 NAS，登录之后输入以下命令进行拉取 MySQL 的映像。

```shell
 docker pull dockerpull.cn/mysql:8.0.4
```

如图所示，说明映像已经拉取成功，否则请检查 docker 的镜像是否可用，并替换`dockerpull.cn`字段重试。或者进行科学上网，使用官方镜像拉取。

![docker拉取映像](https://img.xdxmblog.cn/images/article_25614_01.jpg)

### 安装映像

在 docker 文件夹下创建 mysql 文件夹，并创建 conf、data、logs 三个子文件夹，用于存储配置文件、数据、错误日志。

![创建文件夹](https://img.xdxmblog.cn/images/article_25614_02.png)

右键我们创建的mysql文件夹，选择属性，选择权限，勾选应用到子文件夹。

![设置文件夹权限](https://img.xdxmblog.cn/images/article_25614_02_01.png)

双击 mysql 映像并启动，输入容器名称，并点击高级设置，勾选“启用自动重新启动”。

![启动映像](https://img.xdxmblog.cn/images/article_25614_03.png)

![输入容器信息](https://img.xdxmblog.cn/images/article_25614_04.jpg)

切换到存储空间，添加文件夹，选择上面创建的三个文件夹，并填写相应的装在路径。

![添加文件夹](https://img.xdxmblog.cn/images/article_25614_05.png)

切换到端口设置，填写本地端口（随便写，后面要用到），容器端口和类型默认即可。

![填写端口](https://img.xdxmblog.cn/images/article_25614_06.png)

切换到环境，添加一个变量`MYSQL_ROOT_PASSWORD`，值就是你的数据库密码，这一步很重要，否则后续会失败，无法进行连接。

![配置密码](https://img.xdxmblog.cn/images/article_25614_07.png)

### 远程配置

点击 docker 的容器选项，右键 mysql 容器，点击详情。接着点击终端机，点击新增，我们需要通过这种方式与容器进行连接。

输入以下代码来安装 vim：

```shell
apt-get update #同步最近的软件包列表到本地缓存
apt-get install net-tools #安装网络管理工具
apt-get install vim  #安装vim
```

![安装vim](https://img.xdxmblog.cn/images/article_25614_08.jpg)

安装完成之后输入以下命令来登录 mysql：

```shell
mysql -u root -p
```

![登录mysql](https://img.xdxmblog.cn/images/article_25614_09.jpg)

输入密码（刚才在环境变量设置的密码）以后，授权用户从任何主机连接到 MySQL 服务器。

- grant：是 MySQL 的关键字，用于执行授权操作，给用户赋予特定的数据库权限。
- all privileges：表示授予所有可用的权限，包括 SELECT、INSERT、UPDATE、DELETE、CREATE、DROP 等操作权限，涵盖了对数据库对象的各种操作能力。
- on：第一个代表数据库名，这里的表示所有数据库；第二个代表表名，这里表示所有表。整体表示对所有数据库中的所有表进行授权。
- to 'root'@'%'：root 是要授予权限的用户名，@是分隔符，用于分隔用户名和主机名。%表示允许该用户从任何主机连接到 MySQL 服务器。

```shell
grant all privileges on *.* to 'root'@'%';
```

接着执行以下命令：

这一步通过查询资料得知是修改密码，但是不执行的话，用 native 无法连接数据库。待后续了解以后再做补充。

```shell
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '密码';
```

![通过native连接](https://img.xdxmblog.cn/images/article_25614_10.png)

### 常见错误

Q:挂载的data文件夹一直是空的，容器重启后，数据全部消失。

A:检查文件的挂载路径是否跟本教程的图片内容一致，网上有的教程配置如下，下面的挂载路径是错的，虽然能正常运行，但数据只会存在容器内。

- /logs
- /data
- /conf



Q:在终端连接数据库报错：Can 't connect to local MySQL server through socket '/tmp/mysql.sock '(2) ";

A：文件夹权限问题，确保按步骤给docker文件夹下创建的mysql文件夹设置了足够的权限且应用于子文件和子文件夹。



Q:native连接报错：1045 - Access denied for user 'root'@'xxx.xxx.xxx.xxx'(using password:YES)

A:没执行文中远程授权的步骤。

## 总结

总体来说，用 Docker 安装 MySQL 还是挺方便的，配置项也基本都是图文的方式，接下来准备复习一下 SQL 知识，尝试写一套 API。
