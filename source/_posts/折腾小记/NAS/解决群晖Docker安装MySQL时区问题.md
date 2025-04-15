---
title: 解决群晖Docker安装MySQL时区问题
author: 小呆
cover: 'https://cover.xdxmblog.cn/cover/cover_58263.webp'
abbrlink: 58263
date: 2025-04-15 10:34:30
updated: 2025-04-15 10:34:30
tags:
  - NAS
  - MySQL
categories:
  - 折腾小记
  - NAS
---

前段时间在群晖NAS的Docker里安装了MySQL，方便自己折腾result API开发，最近在开发时遇到了一个问题，就是数据库的时间跟北京时间相差8小时，会导致时间判断出错，这里记录一下解决办法，供遇到同样问题的同学参考。

<!--more-->

## 问题描述

在做邮箱+验证码登录的功能时，我们将`javascript`生成的验证码和过期时间存到了数据库的表中。然而在利用过期时间做查询校验时，却发现不管验证码过没过期，都查不到任何数据。

```javascript
let sql = `select * from ${type == 'register' ? 'temp_user_code' : 'user'} where email = '${email}' and expires_at > NOW()`
const [rows] = await pool.query(sql, [email])
```

## 排查过程

一开始以为是生成验证码和过期时间的函数有问题，但是不管是`console.log()`，还是查看数据库表的存储，过期时间确实没啥问题。

```javascript
// 生成验证码
exports.generateCode = () => {
  const code = randomstring.generate({
    length: 6, // 验证码长度
    charset: 'numeric', //可以选择 'alphabetic', 'numeric', 'hexadecimal', 'binary' 或者自定义字符集
  })
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 验证码有效期为5分钟
  return { code, expiresAt }
}
```

于是我将怀疑对象转向了MySQL的`NOW()`方法，果断进入Docker容器，输入命令来验证我的猜想。

> 进入容器的方法：打开群晖Docker,点击**容器——MySQL——详情——终端机**,进入容器内部，输入用户名和密码，登录MySQL数据。

进入容器登录以后，输入`select now();`，查看打印的时间，通过打印结果观察，果然是数据库的时间不对。

```sql
select now();                                                                    
+---------------------+                                                                 
| now()               |                                                                 
+---------------------+                                                                 
| 2025-04-15 03:00:31 |                                                                 
+---------------------+                                                                 
1 row in set (0.00 sec) 
```

继续输入`show variables like '%time_zone%'; `来查看MySQL的时区。

```sql
show variables like '%time_zone%';                                               
+------------------+--------+                                                           
| Variable_name    | Value  |                                                           
+------------------+--------+                                                           
| system_time_zone | UTC    |                                                           
| time_zone        | SYSTEM |                                                           
+------------------+--------+                                                           
2 rows in set (0.00 sec)
```

观察可知，`time_zone`的值是`SYSTEM`，也就是取了群晖Docker的时区，我们继续查看Docker容器所属的时区。

```shell
# 先退出mysql
mysql > quit;
# 退出之后输入 date -R
date -R                                                                   
Tue, 15 Apr 2025 03:05:00 +0000
```

至此，真相大白了。

我们通过上面的排查，可以确定，**问题出在了安装MySQL时未指定时区，而MySQL会默认取Docker容器所属的时区，而Docker容器默认的时区又是+0000**，所以数据库的时间与中国时间相差了8个小时。

## 解决方案

既然知道了问题原因，自然而然的就可以列出解决方向：

1. 修改Docker系统所属的时区。
2. 修改MySQL所属的时区。

### 修改Docker容器（未验证成功）

网上很多文章都写了这个方案，然后我尝试了，很遗憾失败了。可能是因为我的Docker安装位置是群晖的NAS系统。不管是从上面的终端机还是使用putty连接NAS，输入该命令只会得到`docker: command not found`。

```shell
# 进入容器
docker exec -it mysql1 /bin/bash

# 下列方法 1~3 中任选其一即可：
# 1.强制生成 Asia/Shanghai 时区文件软链接
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
# 2.Asia/Shanghai 软链接实际指向 PRC 文件，将其复制为 localtime 时区文件
cp /usr/share/zoneinfo/PRC /etc/localtime
# 3.通过 tzselect 命令，可选择 Beijing、HongKong 城市时区
tzselect 
```

对Docker比较熟悉的小伙伴遇到这个问题可以尝试一下这个方案是否可行。

### 修改MySQL所属的时区（验证成功）

还是通过终端机登录MySQL，可以用以下命令来临时修改MySQL所属的时区。

```sql
# 设置全局会话时区
set global time_zone = '+08:00';

# 设置当前会话时区
set session time_zone = '+08:00';

# 设置后查看 Mysql 时区配置属性。
show variables like '%time_zone%';
+------------------+--------+
| Variable_name    | Value  |
+------------------+--------+
| system_time_zone | UTC    |
| time_zone        | +08:00 |
+------------------+--------+
```

但因为我们的MySQL安装在了Docker里，一旦Docker遇到意外发生故障或者重启，该配置就会失效，所以我们要想办法将它永久化。

在另一篇笔记[《群晖NAS使用指北-Docker安装MySQL》](https://www.xdxmblog.cn/posts/25614.html)中，为了使数据库的数据永久化，我们在宿主机创建了三个文件夹`logs、conf、data`来进行映射。

在电脑中新建一个`mycustom.txt`文件，写入以下配置：

```sql
[mysqld]
default-time-zone='+08:00'
```

上面的配置会指定MySQL的时区，另存为改文件或者直接重命名改后缀为`mycustom.cnf`，将该文件放入NAS中我们先前创建的conf文件夹中。

重新启动MySQL容器，进入终端机，登录数据库，会发现提示一个报错。

```sql
mysql: [Warning] World-writable config file '/etc/mysql/conf.d/mycustom.cnf
```

这个报错的意思是：`mycustom.cnf`这个文件的权限太大了，任何人都可以修改，不太安全，MySQL会忽略其中的配置。导致这个问题的原因是因为`conf`文件夹的权限我们设置为了任何人都可以读取/写入。

右键该文件夹，点击**属性——权限**，编辑**Everyone**的权限设置为读取，把写入都给勾掉。

如果权限列表都是灰色的，就点**高级选项——使继承权限显示化**，再继续上述步骤即可。

修改完后重启MySQL，登录终端机，查看修改效果，发现已经OK了。

```sql
show variables like '%time_zone%';
+------------------+--------+
| Variable_name    | Value  |
+------------------+--------+
| system_time_zone | UTC    |
| time_zone        | +08:00 |
+------------------+--------+

select now();                                                                    
+---------------------+                                                                 
| now()               |                                                                 
+---------------------+                                                                 
| 2025-04-15 11:00:31 |                                                                 
+---------------------+                                                                 
1 row in set (0.00 sec) 
```

## 小结

这篇笔记主要是对Docker中MySQL时区不正确的问题做一个复盘和记录。问题本身并不复杂，但是对于像我这种纯前端同学，初玩后端还不太熟练的话，解决起来也确实需要费一番功能。就像让纯后端同学去调试css样式一样难受，哈哈！

