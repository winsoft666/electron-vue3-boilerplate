# 1. Electron Vue3模板
本项目是一个基于**Vue3** + **Electron** + **TypeScript**的应用模板，包含**ViteJS**和**Electron Forge**。

## 1.1 关于
本模板使用[ViteJS](https://vitejs.dev)构建和驱动前端页面，支持热加载（HMR），可以使开发和调试变得更加高效 ⚡

使用Electron官方推荐的[Electron Forge](https://www.electronforge.io/)进行客户端的构建和打包，该模板还支持使用NSIS进行打包 😎

模板包含如下功能和特性：
- 主进程和渲染进程热加载
- 集成AntDesign Vue、FontAwesome图标组件
- 日志文件（主进程和渲染进程均可使用）
- 配置文件（主进程和渲染进程均可使用）
- 文件下载（支持哈希校验、进度反馈）
- 功能完善的无边框窗口
- 托盘图标和右键菜单
- 关闭窗口时最小化到托盘
- 客户端程序单实例
- 主进程和渲染进程间的同步/异步调用
- 基于ESLint的代码规范和自动格式化
- 使用Electron Forge进行客户端构建和打包
- 支持NSIS安装包

## 1.2 快速开始

点击右上角绿色的**Use this template**按钮，使用该模板创建一个新的仓库并克隆到本地。

**或者..**

直接克隆该项目: `git clone https://github.com/winsoft666/electron-vue3-template.git`

### 1.2.1 Visual Studio Code
推荐使用`Visual Studio Code`进行项目开发，并安装如下插件：
- ESLint
- Vue Language Features (Volar)

### 1.2.2 安装依赖 ⏬

```bash
yarn install
```

### 1.2.3 开发 ⚒️

```bash
yarn run dev
```

### 1.2.4 其他命令

```bash
yarn run dev # 启动应用并支持热加载
yarn run build # 构建应用，可发布的包位于"out\make"目录

# OR
yarn run build:win32 # 构建Windows平台 32位应用
yarn run build:win64 # 构建Windows平台 64位应用
yarn run build:mac # 构建macOS平台应用
yarn run build:linux # 构建Linux平台应用
```

更多的可选配置项可以参考 [Electron Forge CLI docs](https://www.electronforge.io/cli)。

# 2. 项目介绍
## 2.1 工程结构

```bash
- scripts/ # 该目录中的脚本用构建应用程序和驱动前端页面
- src/
  - main/       # 主进程的代码 (Electron)
  - renderer/  # 渲染进程的代码 (VueJS)
  - shared/    # 可以同时在主进程和渲染进程使用的代码
  - setup/     # 存储编译和构建相关文件
    - setup/NSIS/  # NSIS安装包脚本
```

## 2.2 使用静态文件

- `src/main/static`目录存放主进程使用的静态文件。
- `src/renderer/public`目录存放渲染进程使用的静态文件。

#### 2.2.1 在主进程中引用静态文件

```ts
// 假设 src/main/static/tray.ico 文件存在
// 使用 appState.mainStaticPath 属性获取主进程的静态文件存储目录
import path from "path";
import { appState } from "./app-state";

const iconPath = path.join(appState.mainStaticPath, "tray.ico");
```

## 2.3 AppState对象
为了方便在主进程中跨模块访问某些对象（如`mainWindow`、`tray`、`cfgStore`等）和应用配置（如`onlyAllowSingleInstance`等），我们定义了单实例对象AppState来存储这些对象。

使用方法如下：
```javascript
import { appState } from "./app-state";

appState.mainWindow?.show();
```

# 3. 代码规范
本项目使用ESLint进行代码规范的检查和自动格式化，没有使用Prettier进行代码格式化。

具体原因大体如下：
1. 需要额外的配置来避免ESLint和Prettier的部分规则冲突。

2. Prettier的`printWidth`配置项会损害代码和Git Diff的可读性。
![Why not use prettier](./screenshot/why-not-prettier-1.jpg)

![Why not use prettier](./screenshot/why-not-prettier-2.jpg)

[在线演示](https://prettier.io/playground/#N4Igxg9gdgLgprEAuc0DOMAEBXNcBOamAvJgNoA6UmmwOe+AkgCZKYCMANPQVAIYBbOGwogAggBsAZgEs4mAMJ98QiTJh9RmAL6cqNOrgIs2AJm5H8-ISJABxGf0wAlCGgAWfKFt37aPJlZMAGYLBmthTFEAZXdsAHNMADk+ACNsHz1qf0sTTAAWMN5BSNFnPncBL0wAMXw+Bky-QwY8gFYiqxLbABU3d3kAGQBPbFSEJuyW4yCANk6I22iCeJkIZJkJCCllSYBdAG4qEE4QCAAHGDWoNGRQZXwIAHcABWUEW5Q+CSe+YdvTql6mAANZwGDREqDRxwZA7CR4QHAsEQ858MCOeLIGD4bBwU5wATjZjMODMQZeeLYPjxOA1CAqPgwK5QLFfbAwCAnEDuGACCQAdXc6jgaDRYDgyxu6hkADd1MNkOA0ACQI4GDAXvV4lU4d9ESAAFZoAAe0UxEjgAEVsBB4HqEfiQGjCAQlak0nAJNzzvhHDABTJmDB3Mh8uZnY88AL6uclb7RQRZbDTgBHW3wLUXT4gBoAWigcDJZO5+Dg6ZkZa1NN1SHhBrwAhk2NxTrQFutGdhdf1To0qUDwdDSAjOL4m0xCggAlrIFFbW5Rh6aU+9adsrxjCgpNg0TAfsuYm30Rgw0tDrw2m0QA)

# 4. dependencies和devDependencies的区别
由于Electron Forge会将`dependencies`中的所有依赖项都进行打包，因此为了减少安装包的体积，我们只将主进程需要使用的依赖安装到`dependencies`项下，而其他的依赖均安装到`devDependencies`。

如将vue作为开发依赖进行安装：

```bash
yarn add -D vue
```

# 5. 依赖包说明
## 5.1 unplugin-vue-components
使用`unplugin-vue-components`包实现自动按需引入AntDesign-Vue组件。

## 5.2 electron-log
`electron-log`包提供本地日志文件的打印和输出。

## 5.3 electron-store
`electron-store`包提供本地配置文件的读取和写入功能。

## 5.4 @fortawesome-*
`@fortawesome-*`等包提供对FontAwesome图标字体的支持。

