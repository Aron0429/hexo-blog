---
title: 基于Vue3和Element Plus实现Tab导航栏
author: 小呆
cover: 'https://cover.xdxmblog.cn/cover/cover_47739.webp'
abbrlink: 47739
date: 2025-11-27 12:17:33
updated: 2025-11-27 12:17:33
tags:
  - JavaScript
  - Vue
categories:
  - 前端积累
  - JavaScript
---

在开发后台管理系统的时候，我们通常会在脚手架的基础上，利用UI框架快速搭建起Layout模板，而导航栏便是Layout里最常用的一个组件之一了。这篇文章主要用**Vue + Vue Router + Pinia + Element Plus**来快速实现一套Tab导航栏。

![效果预览]https://img.xdxmblog.cn/images/article_47739_01.webp)

## 前置准备

首先要保证你的项目中已经安装了以下依赖，它们是实现Tab导航栏必不可缺的一部分。

```json
{
  "dependencies": {
    "@element-plus/icons-vue": "^2.3.2",
    "element-plus": "^2.11.8",
    "pinia": "^3.0.4",
    "vue": "^3.5.24",
    "vue-router": "^4.6.3"
  }
}
```

如果你是从头创建一个后台管理系统，你可以使用以下命令来初始化项目。

```shell
pnpm create vite@latest
```

然后你会得到以下的项目结构：

```text
vite-project/
├── public/                 # 静态资源目录
├── src/                    # 源代码目录
│   ├── assets/            	# 项目资源文件
│   ├── components/        	# 公共组件
│   ├── App.vue 	         	# 根组件
│   ├── style.css         	# 全局样式文件
│   └── main.js            	# 入口文件
├── .gitignore             	# Git忽略文件
├── index.html            	# HTML模板
├── package.json           	# 项目配置
├── vite.config.js         	# Vite配置
└── README.md             	# 项目说明
```

接着安装上述依赖

```shell
pnpm install vue vue-router pinia element-plus @element-plus/icons-vue
```

## 开发Tab导航栏

### 框架基本改造

首先我们对脚手架生成的项目进行基本的改造，引入我们安装好的依赖。

```javascript
/* src/main.js */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

import ElementPlus from 'element-plus'

import './style.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
const pinia = createPinia()

// 全局注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus, { size: 'small', zIndex: 3000 })
app.mount('#app')
```

```css
// src/style.css
body {
  margin: 0; 
}
```

```html
<!-- src/App.vue -->
<template>
  <router-view></router-view>
</template>
```

### 编写路由

接着我们在src目录下新建router文件夹，用来存放我们的路由文件。这里我们通过`meta`对象的`hidden`属性来决定该路由是否在菜单栏中隐藏。通过`isShow`属性来决定该路由是否为一级菜单。

```javascript
// src/router/index.js
import { createWebHashHistory, createRouter } from 'vue-router'
import { useNavStore } from '@/stores/nav'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      hidden: true, // 不在菜单中显示
    },
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/home',
    meta: {
      title: '根目录',
      hidden: true, // 不在菜单中显示
    },
    children: [
      {
        path: '/home',
        name: 'home',
        component: () => import('@/views/home/index.vue'),
        meta: {
          title: '首页',
          icon: 'HomeFilled',
          isShow: true,
        },
      },
      {
        path: '/system',
        name: 'system',
        meta: {
          title: '系统管理',
          icon: 'Setting',
          isShow: true,
        },
        children: [
          {
            path: '/system/user',
            name: 'user',
            component: () => import('@/views/system/user/index.vue'),
            meta: {
              title: '用户管理',
              icon: 'User',
            },
          },
          {
            path: '/system/role',
            name: 'role',
            component: () => import('@/views/system/role/index.vue'),
            meta: {
              title: '角色管理',
              icon: 'UserFilled',
            },
          },
        ],
      },
    ],
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/404/index.vue'),
    meta: {
      title: '404',
      hidden: true,
    },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
```

### 编写Layout组件

在`src`目录下新建`layout`文件夹，用来存放后台管理系统的框架。同时在`layout`目录下新建`components`文件夹，用来存放layout相关的组件。这里我们的layout组件的布局采用较为常见的上，下（左右）结构。

> 我的项目用了sass，所以style lang="scss"，没用sass的话把lang属性去掉，然后把层级嵌套去掉即可。

```html
<!-- src/layout/index.vue -->
<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <el-aside class="layout-aside" :width="isCollapse ? '64px' : '200px'">
        <Sidebar :is-collapse="isCollapse" />
      </el-aside>
      <el-container>
        <el-header class="layout-header">
          <HeaderBar :is-collapse="isCollapse" @change-collapse="updateIsCollapse" />
        </el-header>
        <el-main class="layout-main">
          <NavTabs />
          <el-container class="layout-content">
            <router-view />
          </el-container>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HeaderBar from './components/HeaderBar/index.vue'
import Sidebar from './components/Sidebar/index.vue'
import NavTabs from './components/NavTabs/index.vue'

// 侧边栏折叠状态
const isCollapse = ref(false)

const updateIsCollapse = value => {
  isCollapse.value = value
}
</script>

<style lang="scss" scoped>
.common-layout {
  height: 100vh;

  .layout-container {
    height: 100%;

    .layout-header {
      background-color: #fff;
      border-bottom: 1px solid #e6e6e6;
    }

    .layout-aside {
      transition: width 0.3s ease;
      overflow: hidden;
      overflow-y: auto;
    }

    .layout-main {
      padding: 10px 20px;
      background-color: #f5f7f9;
      overflow: hidden;

      .layout-content {
        padding: 15px;
        background-color: #fff;
        height: 100%;
        overflow-y: auto;
      }
    }
  }
}
</style>
```

### 编写Store数据

Layout组件编写好以后，我们来编写Store数据，这里我们没有用`Vuex`，而是选用`pinia`，毕竟使用起来比`Vuex`顺手多了，而且不需要再写那么多的冗余操作。这里的Store主要用于菜单栏和Tab导航栏之间的数据通信。

```javascript
// src/stores/nav.js
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useNavStore = defineStore('nav', () => {
  const tabList = ref([{ meta: { title: '首页', icon: 'HomeFilled' }, path: '/home' }])
  const tabActivePath = ref('/home')

  function addTab(tabItem) {
    const hasTab = tabList.value.find(item => item.path == tabItem.path)

    if (!hasTab) {
      tabList.value.push(tabItem)
    }

    tabActivePath.value = tabItem.path
  }

  function removeTab(path) {
    if (path == '/home') return

    const curTabIndex = tabList.value.findIndex(item => item.path == path)
    tabList.value.splice(curTabIndex, 1)
  }

  return { tabList, tabActivePath, addTab, removeTab }
})

```

### 编写菜单栏组件

菜单栏主要用到element-plus的`el-menu`组件，子菜单我们通过编写`SidebarItme`组件递归调用，将路由文件里的children数据传递到子组件里。 

```html
<!-- src/layout/components/Sidebar/index.vue -->
<template>
  <div class="sidebar-container">
    <div class="sidebar-logo">
      <!-- <img src="@/assets/logo.png" alt="logo" class="logo-icon" /> -->
      <span class="sidebar-title" v-if="!isCollapse">后台管理系统</span>
    </div>

    <el-menu :default-active="activeMenu" :unique-opened="true" :collapse="props.isCollapse" router>
      <sidebar-item :router-list="menuRoutes" :base-path="'/'" />
    </el-menu>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SidebarItem from './SidebarItem.vue'

const props = defineProps({
  isCollapse: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute()
const router = useRouter()

// 获取当前激活的菜单路径
const activeMenu = computed(() => {
  const { path } = route
  return path
})

// 获取过滤后的菜单路由
const menuRoutes = computed(() => {
  const routes = router.getRoutes()
  return routes.filter(route => route.meta && route.meta.isShow && !route.meta.hidden)
})
</script>

<style lang="scss" scoped>
.sidebar-container {
  height: 100%;

  .sidebar-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 59px;
    border-bottom: 1px solid #e6e6e6;

    .sidebar-title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .el-menu {
    height: calc(100% - 60px);
    border-right: none;
    overflow-y: auto;

    &:not(.el-menu--collapse) {
      width: 200px;
    }
  }
}

// 滚动条样式
.el-menu::-webkit-scrollbar {
  width: 3px;
}

.el-menu::-webkit-scrollbar-thumb {
  background: #324157;
  border-radius: 3px;
}

.el-menu::-webkit-scrollbar-track {
  background: #001529;
}
</style>

```

```html
<!-- src/layout/components/SidebarItem/index.vue -->
<template>
  <template v-for="item in props.routerList" :key="item.path">
    <el-sub-menu v-if="item.children && item.children.length > 0 && !item.meta?.hidden" :index="item.path">
      <template #title>
        <el-icon v-if="item.meta?.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>

      <!-- 递归调用 -->
      <sidebar-item :router-list="item.children" :base-path="item.path" />
    </el-sub-menu>

    <el-menu-item v-else-if="!item.meta?.hidden" :index="item.path" @click="handleClickMenuItem(item.path, item.meta)">
      <el-icon v-if="item.meta?.icon">
        <component :is="item.meta.icon" />
      </el-icon>
      <template #title>
        <span>{{ item.meta?.title }}</span>
      </template>
    </el-menu-item>
  </template>
</template>

<script setup>
import { defineProps } from 'vue'
import { useNavStore } from '@/stores/nav'

const store = useNavStore()

const props = defineProps({
  routerList: {
    type: Array,
    required: true,
  },
  basePath: {
    type: String,
    default: '',
  },
})

const handleClickMenuItem = (path, meta) => {
  store.addTab({ path, meta })
}
</script>

<style scoped>
.el-menu-item.is-active {
  background-color: var(--el-menu-hover-bg-color);
  font-weight: 500;
}
</style>

```

### 编写Tab导航组件

依旧在`layout/components`目录下创建好对应的文件，编写以下代码。

```javascript
<!-- src/layout/components/NavTabs/index.vue -->
<template>
  <div class="navtabs-container">
    <keep-alive>
      <el-tabs
        type="card"
        v-model="store.tabActivePath"
        closable
        @tab-click="handleSwitchTab"
        @tab-remove="handleRemoveTab"
      >
        <el-tab-pane v-for="(item, index) in store.tabList" :key="index" :name="item.path">
          <template #label>
            <div class="nav-tab-label">
              <el-icon v-if="item.meta?.icon">
                <component :is="item.meta.icon" />
              </el-icon>
              <span>{{ item.meta?.title }}</span>
            </div>
          </template>
        </el-tab-pane>
      </el-tabs>
    </keep-alive>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useNavStore } from '@/stores/nav'

const router = useRouter()
const store = useNavStore()

const handleSwitchTab = tabItem => {
  const path = tabItem.props.name
  store.tabActivePath = path

  router.push(path)
}

const handleRemoveTab = path => {
  if (path == '/home') return

  store.removeTab(path)

  const lastTab = store.tabList[store.tabList.length - 1]
  store.tabActivePath = lastTab.path

  router.push(lastTab.path)
}
</script>

<style lang="scss" scoped>
.nav-tab-label {
  display: flex;
  align-items: center;
  > .el-icon {
    font-size: 16px;
    margin-right: 5px;
  }
}
:deep(.el-tabs--card > .el-tabs__header .el-tabs__item) {
  border-bottom-color: var(--el-border-color-light);
}
:deep(.el-tabs--card > .el-tabs__header .el-tabs__item.is-active) {
  border-bottom-color: transparent;
}
:deep(.el-tabs--card > .el-tabs__header) {
  margin-bottom: 0;
}
:deep(.el-tabs--card > .el-tabs__header .el-tabs__nav) {
  background-color: #fff;
}
</style>

```

通过上面的代码，我们已经能够实现点击左侧菜单，跳转对应页面，并实现Tab导航栏自动联动的功能。

### 编写路由守护

但整体来说，还是有一点小小的缺陷在里面，当我们手动在`url`输入页面地址的时候，Tab导航栏并没有响应，下面我们通过编写路由守护来完善它。

```javascript
// src/router/index.js
...
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// 添加以下代码
router.beforeEach((to, from) => {
  const routes = router.getRoutes()
  const hasRoute = routes.find(route => route.path == to.path)

  if (hasRoute) {
    const navStore = useNavStore()
    navStore.addTab({ path: to.path, meta: to.meta })
  }
})

export default router
```

## 小结

整个功能实现起来并不复杂，其实就是对数据的操作和组件的响应。对于很多前端同行来说，也就是看个热闹，但是对于一些初入前端的同学来说，也能给他们提供一些思路和经验。最后希望这篇笔记能帮助到屏幕前的你。
