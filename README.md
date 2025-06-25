# Jancy Template Vue

基于 Vue 3 + TypeScript + Element Plus 的现代化项目模板，提供完整的功能模块示例。

## 🚀 项目特性

- ✅ Vue 3 + Composition API
- ✅ TypeScript 完整类型支持
- ✅ Element Plus UI 组件库
- ✅ Pinia 状态管理
- ✅ Vue Router 路由管理
- ✅ Vite 构建工具
- ✅ ESLint + Prettier 代码规范
- ✅ 功能模块化架构

## 📦 功能模块

### TODO List 模块

完整的待办事项管理系统，包含以下功能：

- 📝 任务增删改查操作
- 🏷️ 三种状态管理（待办、进行中、已完成）
- ⭐ 优先级系统（高、中、低）
- 🏷️ 标签分类管理
- 📅 截止日期管理
- 🔍 搜索和筛选功能
- 📊 多种排序方式
- 💾 本地存储持久化
- 📱 响应式设计
- 🎨 现代化 UI 界面

## 📁 项目结构

```
src/
├── features/                    # 功能模块
│   └── todolist/               # TODO List 功能模块
│       ├── components/         # 组件
│       │   ├── TodoCard.vue    # 任务卡片
│       │   ├── TodoForm.vue    # 任务表单
│       │   ├── TodoList.vue    # 任务列表
│       │   ├── FilterDialog.vue # 筛选对话框
│       │   └── TagManager.vue  # 标签管理
│       ├── stores/             # 状态管理
│       │   ├── todo.ts         # 任务状态
│       │   └── tag.ts          # 标签状态
│       ├── types/              # 类型定义
│       │   ├── todo.ts         # 任务类型
│       │   ├── tag.ts          # 标签类型
│       │   └── common.ts       # 通用类型
│       ├── utils/              # 工具函数
│       │   ├── date.ts         # 日期处理
│       │   ├── storage.ts      # 本地存储
│       │   └── sampleData.ts   # 示例数据
│       ├── views/              # 页面组件
│       │   └── TodoView.vue    # 主页面
│       └── TODO_LIST_REQUIREMENTS.md # 需求文档
├── views/                      # 全局页面
│   └── IndexView.vue          # 首页
├── router/                     # 路由配置
│   └── index.ts
├── components/                 # 全局组件
├── assets/                     # 静态资源
└── main.ts                     # 应用入口
```

## 🛠️ 开发

### 环境要求

- Node.js >= 16
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 类型检查

```bash
npm run type-check
```

### 代码检查

```bash
npm run lint
```

## 🌐 页面路由

- `/` - 首页，展示项目功能模块
- `/todolist` - TODO List 功能页面

## 🔧 技术架构

### 状态管理

使用 Pinia 进行状态管理，每个功能模块都有独立的 store：

- `useTodoStore` - 管理任务相关状态
- `useTagStore` - 管理标签相关状态

### 类型系统

完整的 TypeScript 类型定义，包括：

- 业务实体类型（Todo, Tag）
- 操作数据类型（CreateTodoData, UpdateTodoData）
- 通用类型（FilterOptions, SortOptions）

### 数据持久化

使用 localStorage 进行数据持久化，自动保存和恢复用户数据。

### 组件设计

采用组合式 API 和单文件组件，每个组件职责单一，便于维护和复用。

## 📝 开发指南

### 添加新功能模块

1. 在 `src/features/` 下创建新的功能目录
2. 按照 todolist 模块的结构组织文件
3. 在主页面添加功能入口
4. 在路由中配置页面路径

### 代码规范

- 使用 ESLint + Prettier 进行代码格式化
- 组件命名使用 PascalCase
- 文件命名使用 camelCase
- 类型定义使用 TypeScript interface

### 样式规范

- 使用 Element Plus 设计语言
- 采用 CSS 变量进行主题定制
- 响应式设计适配移动端

## 🚀 部署

项目构建后可部署到任何静态文件服务器，如：

- Vercel
- Netlify
- GitHub Pages
- 服务器静态目录

## �� 许可证

MIT License
