---
title: 群晖NAS使用指北-Docker安装Gitea
author: 小呆
cover: 'https://cover.xdxmblog.cn/cover/cover_26220.webp'
tags:
  - NAS
categories:
  - 折腾小记
  - NAS
abbrlink: 26220
date: 2026-09-18 16:09:56
updated: 2026-09-18 16:09:56
---

搬新家有段时间了，新家的宽带无法访问GitHub，虽然windows系统想了个办法能访问了，但是小萌的macBook却怎么也弄不好。索性研究了一下在NAS里装一个git仓库，把GitHub的项目迁移过来。

## 为什么选择Gitea

基于这么多年的从业习惯，我首先想到的是GitLab，毕竟在之前的公司都是用的这玩意。所以我一开始安装的也是GitLab，也确实跑起来了，但是当我看到NAS的CPU和内存使用率，我沉默了。8G的内存单单Docker跑一个GitLab就用了5.6G，哪怕做了各种优化，内存使用率也居高不下。

这让我不得不寻找一个既简洁，内存和CPU占用又小，启动又快的替代品，最终选择了Gitea。下面是二者的对比：

|            | GitLab   | Gitea  |
| ---------- | -------- | ------ |
| CPU占用率  | 20%      | 0.01%  |
| 内存占用率 | 5.6G     | 212M   |
| 启动速度   | 5~10分钟 | 几秒钟 |

单从Git的功能上，二者几乎没有区别：

| 功能                         | GitLab | Gitea |
| ---------------------------- | ------ | ----- |
| 仓库管理                     | ✅      | ✅     |
| 分支保护                     | ✅      | ✅     |
| Pull Request / Merge Request | ✅      | ✅     |
| Web 编辑                     | ✅      | ✅     |
| 代码评审                     | ✅      | ✅     |
| Webhook                      | ✅      | ✅     |

并且我只是需要一个github的本地替代品，大而全的GitLab很多功能我用不到，反而小而精的Gitea一下子就让我爱上了。

## 安装教程

### 配置Docker注册表镜像加速

如图所示，添加1ms镜像并使用。

![配置docker注册表加速](https://img.xdxmblog.cn/images/article_26220_01.webp)

### 安装映像

在docker文件夹下创建gitea文件夹，用于存储相关数据。

![创建文件夹](https://img.xdxmblog.cn/images/article_26220_04.webp)

注册表搜索Gitea，选择`gitea/gitea`进行下载。

![搜索并下载gitea](https://img.xdxmblog.cn/images/article_26220_02.webp)

双击gitea映像启动，输入容器名称（我这里直接用gitea），并点击高级设置。

![启动映像](https://img.xdxmblog.cn/images/article_26220_03.webp)

分别切换到存储空间和端口设置，配置data存储路径和端口，端口号可以随便填，这里记好，后面会用到。

- 22端口是用于ssh拉取。
- 3000端口是gitea运行时的。

![配置端口和目录](https://img.xdxmblog.cn/images/article_26220_05.webp)

配置完成后点击应用，等待容器运行。

### 配置Gitea

容器运行完成以后，我们打开浏览器输入`192.168.0.124:10300`,进行安装。

> 这里的192.168.0.124换成你NAS的IP，后面的端口号换成刚才在Docker里填写的对应3000端口的本地映射。

![安装Gitea](https://img.xdxmblog.cn/images/article_26220_06.webp)

这里我用的MySQL数据库，你可以根据自己的需要选择其他对应的数据库。选好之后填写数据库主机地址和用户名密码。其他的安装默认即可，完成之后点击立即安装，完成初始化。

如果你也想在群晖NAS里使用MySQL，可以参考我的这篇笔记进行安装。[群晖NAS使用指北-Docker安装MySQL](https://www.xdxmblog.cn/posts/25614.html)

文章里的拉取映像过程，可以忽略PuTTY连接Docker，直接参考本文的注册表搜索MySQL下载安装即可。

### 注册登录

安装完成后，会自动跳转到首页，如下图，如果没跳转，输入你刚才的URL`192.168.0.124:10300`，就可以看到以下界面了。

![首页](https://img.xdxmblog.cn/images/article_26220_07.webp)

接着就是注册登录了，默认注册的第一个账号为管理员账号。

![注册](https://img.xdxmblog.cn/images/article_26220_08.webp)

登录之后的页面如下，只不过你没有任何仓库。

![登录](https://img.xdxmblog.cn/images/article_26220_09.webp)

## 迁移GitHub项目

这一步很重要，本文的初衷是由于GitHub访问不了，需要把GitHub的项目迁移到NAS里本地化，以GitHub为例：

1. 点击右上角的＋号，选择迁移外部仓库。
2. 选择从任意Git服务迁移仓库。
3. 确保你的GitHub项目为Public公开属性，否则会迁移失败。
4. URL填写镜像地址：`https://ghproxy.net/你GitHub的项目地址`例如：`https://ghproxy.net/https://github.com/Aron0429/baby-score-api`
5. 用户名密码为空不用填，输入仓库名称，点击迁移仓库。

![选择迁移选项](https://img.xdxmblog.cn/images/article_26220_10.webp)

![填写迁移配置](https://img.xdxmblog.cn/images/article_26220_11.webp)

等待迁移成功后，就可以看到完整的项目了，包含你之前的所有commit信息都会存在。

## 总结

这世上办法总比困难多，有时候越是禁锢人们的思想，反而越能逼着人们思想的爆发。
