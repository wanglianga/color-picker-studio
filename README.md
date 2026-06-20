# ColorPicker Studio - 桌面色彩取样与品牌规范工具

一款专为设计师、品牌负责人和前端开发打造的桌面色彩工具。支持从任意窗口吸取颜色，整理品牌色板，检查色彩规范。

## 原始需求

> 请实现桌面色彩取样与品牌规范工具，Electron 应用给设计师、品牌负责人和前端开发在本机取色、整理色板和检查规范。工具调用屏幕取色、剪贴板、全局快捷键和本地文件保存，用户可以从任意窗口吸取颜色，记录 HEX、RGB、HSL、透明度、命名和来源截图，组合成品牌色板并导出 CSS 变量或设计说明。界面提供放大镜、历史色、对比度检查、收藏分组、最近项目和导出记录，取色动作要轻快，不打断用户正在看的设计稿。

## 功能特性

- 🎨 **屏幕取色** - 全局快捷键唤起，从任意窗口精确取色
- 🔍 **放大镜预览** - 像素级放大，精准定位颜色
- 🎯 **多格式显示** - HEX、RGB、HSL 多种格式一键切换复制
- 📋 **剪贴板集成** - 点击即复制，高效流畅
- ⌨️ **全局快捷键** - Alt + Shift + C 快速取色，不打断工作流
- 🎨 **色板管理** - 创建多个色板，整理品牌色彩系统
- ⭐ **收藏夹** - 收藏常用颜色，快速访问
- 📜 **历史记录** - 自动记录取色历史，最多保存100条
- 🔬 **对比度检查** - WCAG 标准对比度检测，确保可访问性
- 📤 **多格式导出** - 支持 CSS 变量、SCSS、JSON、Tailwind 配置导出
- 💾 **本地存储** - 所有数据本地持久化保存

## 启动方式

### 前置要求

- Node.js >= 16.0.0
- npm 或 yarn 或 pnpm
- Windows / macOS / Linux 桌面环境

### 启动步骤

#### 1. 安装依赖

```bash
npm install
```

#### 2. 启动开发模式

```bash
npm run electron:dev
```

开发模式会同时启动 Vite 开发服务器和 Electron 窗口，支持热更新。

#### 3. 生产构建

```bash
npm run electron:build
```

构建后会在 `dist` 目录生成安装包。

### 快捷键

- `Alt + Shift + C` - 全局取色
- `Escape` - 取消取色
- 点击颜色卡片 - 复制 HEX 值

## Docker 启动方式

> **注意**：Electron 是桌面 GUI 应用，Docker 中运行需要 X11 显示服务器支持。Docker 方式主要用于开发环境统一和构建，不建议用于日常使用。

### 前置要求

- Docker >= 20.10
- Docker Compose >= 2.0
- Linux 环境下需要 X11 显示服务器
- Windows/macOS 下需要额外配置显示转发（如 X410、XQuartz）

### Docker 启动步骤

#### 1. 构建并启动开发容器

```bash
docker compose up --build
```

#### 2. 访问开发服务器

开发服务器地址：http://localhost:5173

> 注意：Docker 容器内无法直接启动 Electron 桌面窗口，只能访问 Web 版前端界面。完整的桌面应用体验请在本地环境运行。

#### 3. 停止服务

```bash
docker compose down
```

### Docker 构建生产版本

```bash
docker compose run --rm app npm run electron:build
```

## 项目结构

```
.
├── electron/              # Electron 主进程代码
│   ├── main.js           # 主进程入口
│   ├── mainWindow.js     # 主窗口管理
│   ├── colorPicker.js    # 取色器窗口管理
│   ├── preload.js        # 预加载脚本
│   └── store.js          # 本地存储
├── src/                   # 前端代码
│   ├── components/       # React 组件
│   │   ├── MainApp.jsx       # 主应用
│   │   ├── ColorPicker.jsx   # 取色器
│   │   ├── TitleBar.jsx      # 标题栏
│   │   ├── Sidebar.jsx       # 侧边栏
│   │   ├── PaletteView.jsx   # 色板视图
│   │   ├── ColorCard.jsx     # 颜色卡片
│   │   ├── HistoryView.jsx   # 历史记录
│   │   ├── FavoritesView.jsx # 收藏夹
│   │   ├── ContrastChecker.jsx # 对比度检查
│   │   └── ExportPanel.jsx   # 导出面板
│   ├── utils/
│   │   └── colorUtils.js # 颜色工具函数
│   ├── main.jsx          # React 入口
│   ├── App.jsx           # 应用根组件
│   └── index.css         # 全局样式
├── index.html            # HTML 入口
├── vite.config.js        # Vite 配置
├── package.json          # 项目配置
├── Dockerfile            # Docker 镜像配置
├── docker-compose.yml    # Docker Compose 配置
├── .dockerignore         # Docker 忽略文件
└── README.md             # 项目说明
```

## 技术栈

- **Electron** - 跨平台桌面应用框架
- **React 18** - 用户界面构建库
- **Vite** - 下一代前端构建工具
- **Node.js** - 运行时环境

## 使用说明

### 取色操作

1. 按下 `Alt + Shift + C` 或点击界面上的"开始取色"按钮
2. 移动鼠标到目标颜色上，放大镜会显示放大预览
3. 点击鼠标左键确认取色
4. 颜色会自动添加到当前色板和历史记录中

### 色板管理

1. 在"色板"页面点击"+ 新建"创建新色板
2. 点击色板标签切换不同色板
3. 双击颜色名称可以重命名
4. 点击颜色卡片的更多按钮可以进行更多操作

### 对比度检查

1. 切换到"对比度"页面
2. 输入或选择前景色和背景色
3. 实时查看对比度比值和 WCAG 等级
4. 参考预览区域评估可读性

### 导出色板

1. 切换到"导出"页面
2. 选择要导出的色板
3. 选择导出格式（CSS/SCSS/JSON/Tailwind）
4. 点击"复制代码"或"下载文件"

## 注意事项

- 首次启动可能需要几秒钟加载
- 取色功能需要屏幕录制权限（macOS）
- 所有数据保存在本地，不上传云端
- Docker 方式仅用于开发和构建，完整功能需本地运行

## 许可证

MIT License
