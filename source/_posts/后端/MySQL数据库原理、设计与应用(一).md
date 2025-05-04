---
title: MySQL数据库原理、设计与应用(一)数据库的基本操作
author: 小呆
cover: 'https://cover.xdxmblog.cn/cover/cover_58637.webp'
categories:
  - 后端探索
tags:
  - MySQL
abbrlink: 58637
date: 2025-04-30 15:52:05
updated: 2025-04-30 15:52:05
series: MySQL
---

这个系列的笔记主要是读《MySQL数据库原理、设计与应用》一书过程中，整理的读书笔记和书中的练习作业。主要目的是解决因为MySQL数据库使用不熟练，导致在利用Node.js编写后端API时，知道逻辑却不知道对应的SQL语句怎么写的问题。

这篇笔记的内容对应书中的第二章部分。

## 学习目标

- 掌握数据库的创建、查看、选择与删除操作
- 掌握数据表的创建、查看、修改与删除操作
- 掌握数据的添加、查询、修改与删除操作

## 数据库操作

### 创建数据库

一个MySQL服务器可以有多个数据库，分别存储不同的数据。创建数据的基本语法格式如下：

> CREATE DATABASE 数据名称 [库选项];

```sql
mysql> CREATE DATABASE mydb;
Query OK, 1 row affected (0.00 sec)
```

如果创建的数据库已存在，则程序会报错如下。

```sql
mysql> CREATE DATABASE mydb;
ERROR 1007 (HY000): Can't create database 'mydb'; database exists
```

为了防止这种情况，在创建数据库时可以在“数据库名称”前添加`IF NOT EXISTS`,表示指定的数据库不存在时执行创建操作，否则忽略此操作。

```sql
mysql> CREATE DATABASE IF NOT EXISTS mydb;
Query OK, 1 row affected, 1 warning (0.00 sec)
```

在添加了`IF NOT EXISTS`后，执行结果并没有报错，但是可以观察到返回了一条警告信息。通过`SHOW WARNINGS`可以查看错误信息。

```sql
mysql> SHOW WARNINGS;
+-------+------+-----------------------------------------------+
| Level | Code | Message                                       |
+-------+------+-----------------------------------------------+
| Note  | 1007 | Can't create database 'mydb'; database exists |
+-------+------+-----------------------------------------------+
1 row in set (0.00 sec)
```

### 查看数据库

#### 查看MySQL服务器下的所有数据库

当需要查看MySQL服务器中已经存在的数据库时，基本语法格式如下：

> SHOW DATABASES;

```sql
mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mydb               |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
5 rows in set (0.00 sec)
```

上面的结果中，除了`mydb`是我们刚才创建的数据库以为，其他数据库都是MySQL安装时自动创建的。对于初学者来说，不建议去修改和删除这些数据库，以免造成服务器故障。

- information_schema和performance_schema数据库分别是MySQL服务器的数据字典（保存所有数据表和库的结构信息）和性能字典（保存全局变量等的设置）。
- mysql数据库主要负责MySQL服务器自己需要使用的控制和管理信息，如用户的权限关系等。
- sys是系统数据库，包括了存储过程、自定义函数等信息。

#### 查看指定数据库的创建信息

查看某个数据库的信息，基本语法格式如下。

> SHOW CREATE DATABASE 数据库名称;

```sql
mysql> SHOW CREATE DATABASE mydb;
+----------+-----------------------------------------------------------------+
| Database | Create Database                                                 |
+----------+-----------------------------------------------------------------+
| mydb     | CREATE DATABASE `mydb` /*!40100 DEFAULT CHARACTER SET latin1 */ |
+----------+-----------------------------------------------------------------+
1 row in set (0.00 sec)
```

上面的输出结果显示了创建mydb数据库的SQL语句，以及数据库的默认字符集。

### 选择数据库

MySQL服务器中的数据都是存储在数据表中，而数据表又需要存储到对应的数据库下，所以在对数据和数据表进行操作前，要先选择数据库。其基本语法格式如下。

> USE 数据库名称;

```sql
mysql> use mydb;
Database changed
```

数据库的选择除了使用`USE`关键字以外，在登录MySQL服务器时也可以直接选择要操作的数据库。

```sql
mysql -u 用户名 -p 密码 数据库名
```

### 删除数据库

删除数据库的基本语法格式如下。这命令一定谨慎在谨慎，毕竟“删库跑路”是犯法的。

> DROP DATABASE 数据库名称;

```sql
mysql> DROP DATABASE mydb;
Query OK, 0 rows affected (0.04 sec)
```

同样，在删除数据库时可以使用`IF EXISTS`来防止因为删除的数据库不存在而报错。

```sql
mysql> DROP DATABASE IF EXISTS mydb;
Query OK, 0 rows affected, 1 warning (0.00 sec)
```

## 数据表操作

### 创建数据表

创建数据表指的是在已存在的数据库中建立新表。基本语法格式如下。

> CREATE [TEMPORARY] TABLE [IF NOT EXISTS] 表名
>
> (字段名 字段类型 [字段属性]...) [表选项]

- 上述语法中，可选项`TEMPORARY`表示临时表，仅在当前会话中可见，并且在会话关闭时自动删除。

- “字段名”指的是数据表的列名；
- “字段类型”设置字段中保存的数据类型，如时间日期类型等；
- 可选项“字段属性”指的是字段的某些特殊约束条件。
- 可选的“表选项”用于设置表的相关特性，如存储引擎（ENGINE）、字符集（CHHARSET）和校对集（COLLATE）。

```sql
# 1. 创建mydb数据库
mysql> CREATE DATABASE mydb;
Query OK, 1 row affected (0.00 sec)
# 2. 选择mydb数据库
mysql> USE mydb;
Database changed
# 3. 创建goods数据表
mysql> CREATE TABLE goods(
    -> id INT COMMENT '编号',
    -> name VARCHAR(32) COMMENT '商品名',
    -> price INT COMMENT '价格',
    -> description VARCHAR(255) COMMENT '商品描述'
    -> );
Query OK, 0 rows affected (0.24 sec)
```

上述SQL语句中，`INT`用于设置字段数据类型是整形；`VARCHAR(L)`表示可变长度的字符串，L表示字符数，如VARCHAR(32)表示可变的字符数是32；`COMMENT`用于在创建表时添加注释内容，并将其保存到表结构中。

### 查看数据表

#### 查看数据表

选择数据库后，可以通过MySQL提供的SQL语句进行查看，基本语法格式如下。

> SHOW TABLES [LIKE 匹配模式];

上述语法中，若不添加可选项“`LIKE匹配模式`”，表示查看当前数据库中的所有数据表。其中匹配模式符有两种，分别为`“%”和“_”`。前者表示匹配一个或多个字符，代表任意长度的字符串，长度也可以为0，后者仅可以匹配一个字符。

先在数据库中一张新表new_goods。

```sql
mysql> CREATE TABLE new_goods(
    -> id INT COMMENT '编号',
    -> name VARCHAR(32) COMMENT '商品名',
    -> price INT COMMENT '价格',
    -> description VARCHAR(255) COMMENT '商品描述'
    -> );
Query OK, 0 rows affected (0.33 sec)
```

分别查看mydb数据库中的所有数据表和名称中含有new的数据表。

```sql
mysql> SHOW TABLES;
+----------------+
| Tables_in_mydb |
+----------------+
| goods          |
| new_goods      |
+----------------+
2 rows in set (0.00 sec)

mysql> SHOW TABLES LIKE '%new%';
+------------------------+
| Tables_in_mydb (%new%) |
+------------------------+
| new_goods              |
+------------------------+
1 row in set (0.00 sec)
```

#### 查看数据表的相关信息

利用MySQL提供的SQL语句查看数据表的相关信息，如数据表的名称、存储引擎、创建时间等，基本语法格式如下。

> SHOW TABLE STATUS [FROM 数据库名] [LIKE匹配模式];

```sql
mysql> SHOW TABLE STATUS FROM mydb LIKE '%new%'\G               
*************************** 1. row ***************************  
           Name: new_goods                                      
         Engine: InnoDB                                         
        Version: 10                                             
     Row_format: Dynamic                                        
           Rows: 0                                              
 Avg_row_length: 0                                              
    Data_length: 16384                                          
Max_data_length: 0                                              
   Index_length: 0                                              
      Data_free: 0                                              
 Auto_increment: NULL                                           
    Create_time: 2025-04-30 13:14:37                            
    Update_time: NULL                                           
     Check_time: NULL                                           
      Collation: latin1_swedish_ci                              
       Checksum: NULL                                           
 Create_options:                                                
        Comment:                                                
1 row in set (0.00 sec)                                         
```

上述SQL语句中，"\G"是MySQL客户端可以使用的结束符中的一种，用于将显示结果纵向排列，适合字段非常多的情况。

### 修改数据表

在实际开发时，若创建的数据表不符合当前项目的开发要求时，可以通过修改数据表来实现。如修改数据表的名称和表选项。

#### 修改数据表名称

在MySQL中，提供了两种修改数据表名称的方式，基本语法格式如下。

> #语法格式1
>
> ALTER TABLE 旧表名 RENAME [TO|AS] 新表名;
>
> #语法格式2
>
> RENAME TABLE 旧表名1 TO新表名1[,旧表名2 TO新表名2]...;

```sql
mysql> RENAME TABLE new_goods TO my_goods;
Query OK, 0 rows affected (0.09 sec)

mysql> SHOW TABLES;
+----------------+
| Tables_in_mydb |
+----------------+
| goods          |
| my_goods       |
+----------------+
3 rows in set (0.00 sec)
```

#### 修改表选项

数据表中的表选项字符集、存储引擎以及校对集也可以通过`ALTER TABLE`修改，基本语法格式如下。

> ALTER TABLE 表名 表选项 [=] 值;

```sql
mysql> ALTER TABLE my_goods CHARSET = utf8;
Query OK, 0 rows affected (0.06 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> SHOW CREATE TABLE my_goods \G
*************************** 1. row ***************************
       Table: my_goods
Create Table: CREATE TABLE `my_goods` (
  `id` int(11) DEFAULT NULL COMMENT '编号',
  `name` varchar(32) CHARACTER SET latin1 DEFAULT NULL COMMENT '商品名',
  `price` int(11) DEFAULT NULL COMMENT '价格',
  `description` varchar(255) CHARACTER SET latin1 DEFAULT NULL COMMENT '商品描述'
) ENGINE=InnoDB DEFAULT CHARSET=utf8
1 row in set (0.00 sec)
```

### 查看表结构

MySQL提供的`DESCRIBE`语句可以查看数据表中所有字段或指定字段的信息，包括字段名、字段类型等。其中，`DESCRIBE`语句可以简写成`DESC`。基本语法格式如下。

>#语法格式1：查看所有字段的信息
>
>{DESCRIBE | DESC } 数据表名；
>
>#语法格式2：查看指定字段的信息
>
>{DESCRIBE | DESC } 数据表名 字段名；

```sql
mysql> DESC my_goods;
+-------------+--------------+------+-----+---------+-------+
| Field       | Type         | Null | Key | Default | Extra |
+-------------+--------------+------+-----+---------+-------+
| id          | int(11)      | YES  |     | NULL    |       |
| name        | varchar(32)  | YES  |     | NULL    |       |
| price       | int(11)      | YES  |     | NULL    |       |
| description | varchar(255) | YES  |     | NULL    |       |
+-------------+--------------+------+-----+---------+-------+
4 rows in set (0.00 sec)

mysql> DESC my_goods name;
+-------+-------------+------+-----+---------+-------+
| Field | Type        | Null | Key | Default | Extra |
+-------+-------------+------+-----+---------+-------+
| name  | varchar(32) | YES  |     | NULL    |       |
+-------+-------------+------+-----+---------+-------+
1 row in set (0.00 sec)
```

其中，`Field`表示字段名，`Type`表示字段的数据类型，`Null`表示该字段是否可以为空，`Key`表示该字段是否已设置了索引，`Default`表示该字段是否有默认值，`Extra`表示获取到的与该字段相关的附件信息。

#### 查看数据表的创建语句

若想要查看创建数据表的具体SQL语句及表的字符编码，可以使用以下SQL语句，基本语法格式如下。

> SHOW CREATE TABLE 表名;

```sql
mysql> SHOW CREATE TABLE my_goods \G
*************************** 1. row ***************************
       Table: my_goods
Create Table: CREATE TABLE `my_goods` (
  `id` int(11) DEFAULT NULL COMMENT '编号',
  `name` varchar(32) CHARACTER SET latin1 DEFAULT NULL COMMENT '商品名',
  `price` int(11) DEFAULT NULL COMMENT '价格',
  `description` varchar(255) CHARACTER SET latin1 DEFAULT NULL COMMENT '商品描述'
) ENGINE=InnoDB DEFAULT CHARSET=utf8
1 row in set (0.00 sec)
```

#### 查看数据表结构

MySQL数据库中的`SHOW COLUMNS`语句也可以查看表结构，基本语法格式如下。

>#语法格式1
>
>SHOW [FULL] COLUMNS FROM 数据表名 [FROM数据库名]；
>
>#语法格式2
>
>SHOW [FULL] COLUMNS FROM 数据库名.数据表名；

上述语法格式中，可选项`FULL`表示显示详细内容，在不添加的情况下查询结果与`DESC`的结果相同；在添加`FULL`选项时此语句不仅可以查看到`DESC`语句查看的信息，还可以查看到字段的权限、`COMMENT`字段的注释信息等。

```sql
mysql> SHOW FULL COLUMNS FROM my_goods;
+-------------+--------------+-------------------+------+-----+
| Field       | Type         | Collation         | Null | Key | 
+-------------+--------------+-------------------+------+-----+
| id          | int(11)      | NULL              | YES  |     |
| name        | varchar(32)  | latin1_swedish_ci | YES  |     | 
| price       | int(11)      | NULL              | YES  |     | 
| description | varchar(255) | latin1_swedish_ci | YES  |     | 
+-------------+--------------+-------------------+------+-----+
+---------+-------+---------------------------------+----------+
| Default | Extra | Privileges                      | Comment  |
+---------+-------+---------------------------------+----------+
| NULL    |       | select,insert,update,references | 编号      |
| NULL    |       | select,insert,update,references | 商品名    |
| NULL    |       | select,insert,update,references | 价格      |
| NULL    |       | select,insert,update,references | 商品描述  |
+---------+-------+---------------------------------+----------+
4 rows in set (0.00 sec)
```

### 修改表结构

#### 修改字段名

在MySQL中仅修改数据表中的字段名称，使用`CHANGE`实现，基本语法格式如下。

> ALTER TABLE 数据表名 CHANGE [COLUMN] 旧字段名 新字段名 字段类型 [字段属性];

```sql
mysql> ALTER TABLE my_goods CHANGE description des VARCHAR(255);
Query OK, 0 rows affected (0.49 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> DESC my_goods;
+-------+--------------+------+-----+---------+-------+
| Field | Type         | Null | Key | Default | Extra |
+-------+--------------+------+-----+---------+-------+
| id    | int(11)      | YES  |     | NULL    |       |
| name  | varchar(32)  | YES  |     | NULL    |       |
| price | int(11)      | YES  |     | NULL    |       |
| des   | varchar(255) | YES  |     | NULL    |       |
+-------+--------------+------+-----+---------+-------+
4 rows in set (0.00 sec)
```

#### 修改字段类型

在MySQL中仅修改数据表中的字段类型，通常使用`MODIFY`实现，基本语法格式如下。

> ALTER TABLE 数据表名 MODIFY [COLUMN] 字段名 新类型 [字段属性];

```sql
mysql> ALTER TABLE my_goods MODIFY des CHAR(255);
Query OK, 0 rows affected (0.55 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> DESC my_goods;
+-------+-------------+------+-----+---------+-------+
| Field | Type        | Null | Key | Default | Extra |
+-------+-------------+------+-----+---------+-------+
| id    | int(11)     | YES  |     | NULL    |       |
| name  | varchar(32) | YES  |     | NULL    |       |
| price | int(11)     | YES  |     | NULL    |       |
| des   | char(255)   | YES  |     | NULL    |       |
+-------+-------------+------+-----+---------+-------+
4 rows in set (0.00 sec)
```

#### 修改字段的位置

数据表在创建时，字段编写的先后顺序就是其在数据库中存储的顺序，若需要调整某个字段的位置，也可以使用`MODIFY`实现，基本语法格式如下。

> ALTER TABLE 数据表名
>
> MODIFY [COLUMN] 字段名1 数据类型 [字段属性] [FIRST | AFTER 字段名2];

```sql
mysql> ALTER TABLE my_goods MODIFY des VARCHAR(255) AFTER name;
Query OK, 0 rows affected (0.52 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> DESC my_goods;
+-------+--------------+------+-----+---------+-------+
| Field | Type         | Null | Key | Default | Extra |
+-------+--------------+------+-----+---------+-------+
| id    | int(11)      | YES  |     | NULL    |       |
| name  | varchar(32)  | YES  |     | NULL    |       |
| des   | varchar(255) | YES  |     | NULL    |       |
| price | int(11)      | YES  |     | NULL    |       |
+-------+--------------+------+-----+---------+-------+
4 rows in set (0.01 sec)
```

#### 新增字段

对于已经创建好的数据表，也可以根据业务需求利用`ADD`新增字段，基本语法格式如下。

>#语法格式1：新增一个字段，并可指定其位置
>
>ADD [COLUMN] 新字段名 字段类型 [FIRST | AFTER 字段名]
>
>#语法格式2：同时新增多个字段
>
>ALTER TABLE 数据表名
>
>ADD [COLUMN] (新字段名1 字段类型1, 新字段名2 字段类型2,...)

```sql
mysql> ALTER TABLE my_goods ADD num INT AFTER name;
Query OK, 0 rows affected (0.37 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> DESC my_goods;
+-------+--------------+------+-----+---------+-------+
| Field | Type         | Null | Key | Default | Extra |
+-------+--------------+------+-----+---------+-------+
| id    | int(11)      | YES  |     | NULL    |       |
| name  | varchar(32)  | YES  |     | NULL    |       |
| num   | int(11)      | YES  |     | NULL    |       |
| des   | varchar(255) | YES  |     | NULL    |       |
| price | int(11)      | YES  |     | NULL    |       |
+-------+--------------+------+-----+---------+-------+
5 rows in set (0.00 sec)
```

#### 删除字段

MySQL中可以通过`DROP`完成将某个字段从数据表中删除。基本语法格式如下。

> ALTER TABLE 数据表名 DROP [COLUMN] 字段名;

```sql
mysql> ALTER TABLE my_goods DROP num;
Query OK, 0 rows affected (0.42 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> DESC my_goods;
+-------+--------------+------+-----+---------+-------+
| Field | Type         | Null | Key | Default | Extra |
+-------+--------------+------+-----+---------+-------+
| id    | int(11)      | YES  |     | NULL    |       |
| name  | varchar(32)  | YES  |     | NULL    |       |
| des   | varchar(255) | YES  |     | NULL    |       |
| price | int(11)      | YES  |     | NULL    |       |
+-------+--------------+------+-----+---------+-------+
4 rows in set (0.00 sec)

mysql>
```

### 删除数据表

删除数据表的同时，存储在数据表中的数据都将被删除，基本语法格式如下。

> DROP [TEMPORARY] TABLE [IF NOT EXISTS] 数据表1[,数据表2]...;

## 数据操作

在写API的时候，前面关于创建库、表的操作，基本上是不太能用得到的。一般都用`Navicat Premium`去操作，毕竟可视化的操作要比去一行行敲SQL简单容易。

但是从这里开始，基本就是我们要必须掌握的内容了，因为会实打实的在写代码的过程中用到。

### 添加数据

MySQL中使用INSERT语句向数据表中添加数据。根据操作的不同目的一般可分为两种：

#### 为所有字段添加数据

为所有字段插入记录时，可以省略字段名称，严格按照数据表结构（字段的位置）插入对应的值，基本语法格式如下。

> INSERT [INTO] 数据表名 {VALUES | VALUE}(值1[,值2]...);

```sql
mysql> INSERT INTO goods
    -> VALUES (1,'notebook',4998,'High cost performance');
Query OK, 1 row affected (0.04 sec)
```

通过上述语句，我们在goods表中添加了一条商品记录，并且在插入时我们严格按照数据与字段顺序对应的规则来操作。

我们尝试再加一条数据，会发现这次的添加出现了错误。造成这种错误的原因：**通常是创建的数据表未指定字符集，系统会默认为latinl。当插入含有中文的数据时，则会报错。**

```sql
mysql> INSERT INTO goods
    -> VALUES (2,'笔记本',9998,'续航时间超过10个小时');
ERROR 1366 (HY000): Incorrect string value: '\xB1\xCA\xBC\xC7\xB1\xBE' for column 'name' at row 1
```

解决方式也有两种，一种是创建表时添加表选项，设置数据表的字符集。

> CREATE [TEMPORARY] TABLE [IF NOT EXISTS] 表名
>
> (字段名 字段类型 [字段属性]...)[DEFAULT]{CHARACTER SET|CHARSET}[=] utf8;

另外一种是对于已经添加数据的数据表，可以通过`ALERT TABLE...CHANGE/MODIFY`完成对表字段字符集的设置。

```sql
mysql> ALTER TABLE goods
    -> MODIFY name VARCHAR(32) CHARACTER SET utf8,
    -> MODIFY description VARCHAR(255) CHARACTER SET utf8;
Query OK, 1 row affected (0.57 sec)
Records: 1  Duplicates: 0  Warnings: 0
```

之后我们再次插入含有中文的数据，已经成功了。

```sql
mysql> INSERT INTO goods
    -> VALUES (2,'笔记本',9998,'续航时间超过10个小时');
Query OK, 1 row affected (0.06 sec)
```

#### 为部分字段添加数据

为部分字段添加数据的基本格式如下。

> INSERT [INTO] 数据表名 (字段名1[,字段名2]...) {VALUES|VALUE}(值1[,值2]...);
>

```sql
mysql> INSERT INTO goods (id,name) VALUE(3, 'Mobile phone');
Query OK, 1 row affected (0.05 sec)
```

除此之外，MySQL还提供了另外一种使用`INSERT`语句来为指定字段添加数据的方式。

>INSERT [INTO] 数据表名 SET 字段名1=值1[, 字段名2=值2]...;
>

```sql
mysql> INSERT INTO goods SET id = 4, name = 'Camera';
Query OK, 1 row affected (0.05 sec)
```

#### 一次添加多行数据

在实际开发中，向一张数据表中同时插入多条记录时，我们肯定不能重复的写上面的`INSERT`指令，这么玩自己迟早得疯。因此，我们可以使用MySQL提供的另外一种插入数据的方式。基本语法格式如下。

>INSERT [INTO] 数据表名 [(字段列表)] {VALUES|VALUE}(值列表[,值列表]...);
>

当字段列表省略时，要严格按照数据表创建的的字段顺序插入，

```sql
mysql> INSERT INTO goods VALUES
    -> (5, 'keyBoard', 599, NULL),
    -> (6, 'radio', 299, NULL);
Query OK, 2 rows affected (0.04 sec)
Records: 2  Duplicates: 0  Warnings: 0
```

需要注意的是，在一次添加多行数据时，若一条数据插入失败，则整个插入语句都会失败。

### 查询数据

#### 查询表中全部数据

查询数据表中所有字段的数据，可以使用星号“*”通配符代替数据表中的所有字段名，基本语法格式如下。

> SELECT * FROM 数据表名;

```sql
mysql> SELECT * FROM goods;
+------+--------------+-------+-----------------------+
| id   | name         | price | description           |
+------+--------------+-------+-----------------------+
|    1 | notebook     |  4998 | High cost performance |
|    2 | 笔记本       |  9998 | 续航时间超过10个小时  |
|    3 | Mobile phone |  NULL | NULL                  |
|    4 | Camera       |  NULL | NULL                  |
|    5 | keyBoard     |   599 | NULL                  |
|    6 | radio        |   299 | NULL                  |
+------+--------------+-------+-----------------------+
6 rows in set (0.00 sec)
```

#### 查询表中的部分字段

查询数据时，可在`SELECT`语句的字段列表中指定要查询的字段。基本语法格式如下。

> SELECT {字段名1,字段名2,字段名3,...} FROM 数据表名;

```sql
mysql> SELECT id,name FROM goods;
+------+--------------+
| id   | name         |
+------+--------------+
|    1 | notebook     |
|    2 | 笔记本       |
|    3 | Mobile phone |
|    4 | Camera       |
|    5 | keyBoard     |
|    6 | radio        |
+------+--------------+
6 rows in set (0.00 sec)
```

#### 简单条件查询数据

在查询数据时，若想要查询出符合条件的相关数据记录时，可以使用`WHERE`实现。基本语法格式如下。

> SELECT * |{字段名1,字段名2,字段名3,...} FROM 数据表名 WHERE 字段名 = 值；

```sql
mysql> SELECT * FROM goods WHERE id = 1;
+------+----------+-------+-----------------------+
| id   | name     | price | description           |
+------+----------+-------+-----------------------+
|    1 | notebook |  4998 | High cost performance |
+------+----------+-------+-----------------------+
1 row in set (0.00 sec)
```

### 修改数据

MySQL提供了`UPDATE`语句修改数据。基本语法格式如下。

> UPDATE 数据表名 SET 字段名1 = 值1 [,字段名2 = 值2,...] [WHERE 条件表达式]

上述语法中，若实际使用时没有添加`WHERE`条件，那么表中所有对应的字段都会被修改成统一的值，因此在修改数据时，请谨慎操作。

```sql
mysql> UPDATE goods
    -> SET price = 5899
    -> WHERE id = 2;
Query OK, 1 row affected (0.03 sec)
Rows matched: 1  Changed: 1  Warnings: 0
mysql> SELECT * FROM goods WHERE id = 2;
+------+--------+-------+----------------------+
| id   | name   | price | description          |
+------+--------+-------+----------------------+
|    2 | 笔记本 |  5899 | 续航时间超过10个小时 |
+------+--------+-------+----------------------+
1 row in set (0.00 sec)
```

### 删除数据

删除数据是指对表中存在的记录进行删除。MySQL中使用`DELETE`语句删除表中的记录，基本语法格式如下。

> DELETE FROM 数据表名 [WHERE 条件表达式];

```sql
mysql> DELETE FROM goods WHERE id = 3;
Query OK, 1 row affected (0.06 sec)
mysql> SELECT * FROM goods;
+------+----------+-------+-----------------------+
| id   | name     | price | description           |
+------+----------+-------+-----------------------+
|    1 | notebook |  4998 | High cost performance |
|    2 | 笔记本   |  5899 | 续航时间超过10个小时  |
|    4 | Camera   |  NULL | NULL                  |
|    5 | keyBoard |   599 | NULL                  |
|    6 | radio    |   299 | NULL                  |
+------+----------+-------+-----------------------+
5 rows in set (0.00 sec)
```

上述语法中，若实际使用时没有添加WHERE条件，系统会自动删除该表中的所有记录，因此在操作时，请谨慎操作。

## 课后作业

1. mydb数据库中创建一张电子杂志订阅表(subscribe)。

2. 电子杂志订阅表中要包含4个字段，分别为编号(id)、订阅邮件的邮箱地址(email)、用户是否确认订阅(status,使用数字表示，1表示已确认，0表示未确认)、邮箱确认的验证码(code)。

3. 为电子杂志订阅表添加5条测试数据，如下表。

   | 编号 | 邮箱地址         | 是否确认的状态 | 邮箱确认验证码 |
   | ---- | ---------------- | -------------- | -------------- |
   | 1    | tom123@163.com   | 1              | TRBXPO         |
   | 2    | lucy123@163.com  | 1              | LOICPE         |
   | 3    | lily123@163.com  | 0              | JIXDAM         |
   | 4    | jimmy123@163.com | 0              | QKOLPH         |
   | 5    | joy123@163.com   | 1              | JSMWNL         |

4. 查看已经通过邮箱确认的电子杂志订阅信息。

5. 将编号等于4的订阅确认状态设置为“已确认”。

6. 删除编号等于5的电子杂志订阅信息。

```sql
mysql> CREATE TABLE subscribe (
    -> id INT COMMENT '编号',
    -> email VARCHAR(60) COMMENT '邮件订阅的邮箱地址',
    -> status INT COMMENT '是否确认,0未确认,1已确认',
    -> code VARCHAR(10) COMMENT '邮箱确认的验证码'
    -> ) DEFAULT CHARSET = utf8;
Query OK, 0 rows affected (0.22 sec)

mysql> INSERT INTO subscribe VALUES
    -> (1, 'tom123@163.com', 1, 'TRBXPO'),
    -> (2, 'lucy123@163.com', 1, 'LOICPE'),
    -> (3, 'lily123@163.com', 0, 'JIXDAM'),
    -> (4, 'jimmy123@163.com', 0, 'QKOLPH'),
    -> (5, 'joy123@163.com', 1, 'JSMWNL');
Query OK, 5 rows affected (0.15 sec)
Records: 5  Duplicates: 0  Warnings: 0

mysql> SELECT * FROM subscribe WHERE status = 1;
+------+-----------------+--------+--------+
| id   | email           | status | code   |
+------+-----------------+--------+--------+
|    1 | tom123@163.com  |      1 | TRBXPO |
|    2 | lucy123@163.com |      1 | LOICPE |
|    5 | joy123@163.com  |      1 | JSMWNL |
+------+-----------------+--------+--------+
3 rows in set (0.00 sec)

mysql> UPDATE subscribe SET status = 1 WHERE id = 4;
Query OK, 1 row affected (0.05 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> SELECT * FROM subscribe WHERE id = 4;
+------+------------------+--------+--------+
| id   | email            | status | code   |
+------+------------------+--------+--------+
|    4 | jimmy123@163.com |      1 | QKOLPH |
+------+------------------+--------+--------+
1 row in set (0.00 sec)

mysql> DELETE FROM subscribe WHERE id = 5;
Query OK, 1 row affected (0.06 sec)

mysql> SELECT * FROM subscribe;
+------+--------------------+--------+--------+
| id   | email              | status | code   |
+------+--------------------+--------+--------+
|    1 |  tom123@163.com    |      1 | TRBXPO |
|    2 |  lucy123@163.com   |      1 | LOICPE |
|    3 |  lily123@163.com   |      0 | JIXDAM |
|    4 |  jimmy123@163.com  |      1 | QKOLPH |
+------+--------------------+--------+--------+
4 rows in set (0.01 sec)
```

## 小结

目前来说，数据库的相关操作都可以通过`Navicat Premium`等相关工具直接通过UI界面生成，所以重点在于熟练掌握数据的相关操作，但总体还是要根据书中的例子实际去敲一遍代码，强化对MySQL语句的语感。













