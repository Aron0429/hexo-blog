---
title: hexo + butterfly 实现根据作者进行文章分类查询
author: 小呆
cover: 'https://cover.xdxmblog.cn/cover/cover_21905.webp'
categories: 折腾小记
tags:
  - hexo
abbrlink: 21905
date: 2024-09-08 02:28:40
updated: 2024-09-08 02:28:40
---

## 前言

由于hexo自身并未实现多作者，包括butterfly主题也没有相关方面的设置。所以一直也无法根据作者进行文章分类。

今天抽空看了看hexo的插件开发教程，简单写了一个插件，搭配任意主题都可以实现根据作者进行文章分类查询（多人博客）效果。

<!--more-->

## 安装

整个安装步骤分为三步：1.插件安装、2.主题文件修改、3.指定作者。

### 插件安装

在博客根目录打开`git bash`，输入以下命令安装`hexo-generator-author3`插件。

```bash
npm install hexo-generator-author3 --save
```

然后在博客的`source`目录下新建`authors`文件夹，进入`authors`文件，新建`index.md`文件并输入以下内容：

```markdown
---
title: 作者
date: 2024-09-08 02:18:32
type: 'authors'
comments: false
---
```

### 主题文件修改

安装好插件以后，需要在对应的主题文件下面创建模板，便于根据模板生成对应的文件。

以butterfly主题为例：

在主题`themes\butterfly\scripts\helpers\`文件夹下，修改`page.js`文件，在文件末尾添加以下内容：

```javascript
hexo.extend.helper.register('authors', function (source = []) {
  let result = ''
  let authors = []
  if (source.length) {
    source.map(post => {
      if (post.author && !authors.includes(post.author)) {
        authors.push(post.author)
      }
    })
  }
  if (authors.length) {
    result += '<ul class="category-list">'
    authors.map(author => {
      let count = source.filter(post => post.author == author).length
      result += `<li class="category-list-item"><a class="category-list-link" href="/authors/${author}/">${author}</a><span class="category-list-count">${count}</span></li>`
    })
  }
  return result
})
```

在主题`themes\butterfly\layout\`文件夹下，修改`page.pug`文件，添加以下内容：

```javascript
extends includes/layout.pug

block content
  #page
    if top_img === false
      h1.page-title= page.title

    case page.type
      when 'tags'
        include includes/page/tags.pug
      when 'link'
        include includes/page/flink.pug
      when 'categories'
        include includes/page/categories.pug
      //- 添加下面这句
      when 'authors'
        include includes/page/authors.pug
      //- 添加上面这句
      default
        include includes/page/default-page.pug

    if page.comments !== false && theme.comments && theme.comments.use
      - var commentsJsLoad = true
      !=partial('includes/third-party/comments/index', {}, {cache: true})
```

在主题`themes\butterfly\layout\includes\page\`文件夹下，新建`authors.pug`文件并输入以下内容：

```javascript
.authors-list
  !=authors(site.posts)
```

在主题`themes\butterfly\source\css\_page\`文件夹下，修改`categories.styl`文件，第1行修改为以下内容：

```css
.category-lists,.authors-list
```

### 指定作者

这一步就比较简单了，我们只需要在文章的信息里面，添加`author`字段，即可为该文章指定作者：

```markdown
---
title: JavaScript this到底指向谁
author: 小呆
abbrlink: 45186
tags:
  - 前端面试
categories: JavaScript
date: 2023-04-07 17:36:44
updated: 2023-04-07 17:36:44
---
```

## 测试

在博客目录下，运行以下命令：

```bash
hexo clean & hexo g & hexo s
```

打开`localhost:4000/authors/`，就能查看到效果了。

![效果图1](https://img.xdxmblog.cn/images/image-20240908033429398.png)

点击不同的作者，就能查看到该作者下的全部文章，不同的主题展示效果有差异，非butterfly主题自行写对应的模板及css即可。

**PS:插件会默认根据`['author','archive','index']`的顺序查找对应模板，下图为`archive`的效果。**

![效果图2](https://img.xdxmblog.cn/images/image-20240908033945343.png)

## 美化

同样以butterfly主题为例：

在主题`themes\butterfly\layout\`文件夹下，新建`author.pug`文件，并添加以下内容：

```javascript
extends includes/layout.pug

block content
  if theme.author_ui == 'index'
    include ./includes/mixins/post-ui.pug
    #recent-posts.recent-posts.authors_ui
      +postUI
      include includes/pagination.pug
  else
    include ./includes/mixins/article-sort.pug
    #author
      .article-sort-title= _p('page.authors') + ' - ' + page.author
      +articleSort(page.posts)
      include includes/pagination.pug
```

在主题`themes\butterfly\layout\includes\header\`文件夹下，修改`index.pug`文件，第22行添加以下内容：

```javascript
var site_title = page.title || page.tag || page.category || page.author || config.title
```

在主题`themes\butterfly\languages\`文件夹下，修改每个文件，添加对应的多语言文字：

```yaml
# default.yml  en.yml
page:
  articles: Articles
  tag: Tag
  category: Category
  archives: Archives
  authors: Authors
# zh-CN.yml
page:
  articles: 文章总览
  tag: 标签
  category: 分类
  archives: 归档
  authors: 作者
# zh-TW.yml
page:
  articles: 文章總覽
  tag: 標籤
  category: 分類
  archives: 歸檔
  authors: 作者
```

重新执行测试命令，查看美化后的效果：

![效果图3](https://img.xdxmblog.cn/images/image-20240908042433521.png)

在主题配置文件`_config.butterfly.yml`中，还可以添加`author_ui`字段来决定是否使用主页模板来展示作者文章页。

若需使用主页模板，请使用`author_ui: index`

```yaml
author_ui: # 留空或 index
```

最后我们在文章页内添加作者的快捷跳转入口：

修改主题`themes\butterfly\layout\includes\header`文件夹下，`post-info.pug`文件，在第28行加入以下代码：

```javascript
if (page.author)
        span.post-meta-author
          span.post-meta-separator |
          i.far.fa-solid.fa-user-pen.post-meta-icon
          span.post-meta-label= _p('post.copyright.author')
          a.post-meta-categories(href="/authors" + url_for(page.author))= page.author
```

修改主题`themes\butterfly\layout\includes\post`文件夹下，`post-copyright.pug`文件，修改第3行代码：

```javascript
let authorHref = page.copyright_author_href || '/authors/' + author || theme.post_copyright.author_href || config.url
```

![效果图4](https://img.xdxmblog.cn/images/image-20240908044215010.png)

这样就可以通过文章顶部的小标识直接跳转到作者栏目下。

## 小结

总体实现步骤不难，主要是美化过程中主题文件比较分散，需要美化的小点比较多。但最终实现了多作者的展示效果，第一次写hexo的插件，感觉还是挺简单的。
