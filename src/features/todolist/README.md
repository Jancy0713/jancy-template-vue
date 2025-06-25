# TODO List 功能模块

## 功能概述

本模块实现了一个完整的 TODO List 应用，支持任务管理、拖拽排序、标签系统等高级功能。

## 已实现功能

### ✅ 基础功能

- **任务 CRUD 操作**：创建、编辑、删除、查看任务
- **任务状态管理**：待办、进行中、已完成三种状态
- **优先级系统**：高、中、低三个优先级，带视觉区分
- **截止日期**：支持设置截止日期，自动显示逾期状态

### ✅ 拖拽功能

- **同状态内排序**：在同一状态列内通过拖拽重新排序任务
- **跨状态拖拽**：拖拽任务到不同状态区域来改变任务状态
- **拖拽视觉反馈**：
  - `todo-ghost`：拖拽时的占位样式
  - `todo-chosen`：选中时的旋转效果
  - `todo-drag`：拖拽中的缩放效果

### ✅ 标签系统

- **标签管理**：
  - 创建新标签（支持自定义名称和颜色）
  - 编辑现有标签
  - 删除标签（当标签未被使用时）
- **颜色系统**：
  - 12种预设颜色可快速选择
  - 支持自定义颜色选择器
  - 自动计算文字颜色以确保可读性
- **任务标签关联**：
  - 每个任务支持多个标签
  - 任务表单中可选择已有标签或创建新标签
  - 任务卡片上显示带颜色的标签
- **标签统计**：显示每个标签下的任务数量

### ✅ 高级功能

- **排序系统**：支持按优先级、创建时间、更新时间、截止时间排序
- **搜索功能**：支持按关键词搜索任务
- **数据持久化**：使用 localStorage 自动保存数据
- **示例数据**：首次使用时自动初始化示例数据

## 技术实现

### 拖拽功能实现

```typescript
// 使用 vuedraggable 库 (Sortable.js 的 Vue 3 封装)
import draggable from 'vuedraggable'

// 配置拖拽选项
<draggable
  v-model="dragTodos"     // 使用计算属性进行双向绑定
  group="todos"           // 允许跨列表拖拽
  :component-data="{
    class: 'todo-list__items'
  }"
  :animation="200"        // 动画时长
  ghost-class="todo-ghost"
  chosen-class="todo-chosen"
  drag-class="todo-drag"
  item-key="id"           // 唯一标识符
>
```

### 标签系统实现

```typescript
// 标签数据结构
interface Tag {
  id: string
  name: string
  color: string
  createdAt: Date
}

// 任务中的标签关联
interface Todo {
  // ... 其他字段
  tags: string[] // 存储标签ID数组
}
```

### 颜色计算

```typescript
// 根据背景色自动计算文字颜色
const getTextColor = (backgroundColor: string): string => {
  const hex = backgroundColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#000000' : '#FFFFFF'
}
```

## 文件结构

```
src/features/todolist/
├── components/
│   ├── TodoCard.vue       # 任务卡片（支持标签显示）
│   ├── TodoList.vue       # 任务列表（支持拖拽）
│   ├── TodoForm.vue       # 任务表单（支持标签选择）
│   ├── TagManager.vue     # 标签管理弹窗
│   └── FilterDialog.vue   # 筛选对话框
├── stores/
│   ├── todo.ts           # 任务状态管理
│   └── tag.ts            # 标签状态管理
├── types/
│   ├── todo.ts           # 任务类型定义
│   ├── tag.ts            # 标签类型定义
│   └── common.ts         # 通用类型定义
├── utils/
│   ├── date.ts           # 日期工具函数
│   ├── storage.ts        # 存储工具函数
│   └── sampleData.ts     # 示例数据
├── views/
│   └── TodoView.vue      # 主视图页面
└── README.md             # 功能说明文档
```

## 使用说明

### 基础操作

1. 点击"新增任务"按钮创建任务
2. 双击任务卡片可快速编辑
3. 右键点击任务卡片查看更多操作
4. 拖拽任务可调整顺序或改变状态

### 标签管理

1. 点击工具栏的"标签管理"按钮
2. 在弹窗中可以：
   - 添加新标签（输入名称，选择颜色）
   - 编辑现有标签
   - 删除未使用的标签
3. 在任务表单中选择标签或创建新标签

### 拖拽操作

1. **同状态内排序**：直接在列表内拖拽任务
2. **改变状态**：将任务拖拽到其他状态列
3. **视觉反馈**：拖拽时会显示动画和占位符

## 待实现功能

- [ ] **高级筛选功能**
  - [ ] 按标签筛选
  - [ ] 按时间范围筛选
  - [ ] 多条件组合筛选
- [ ] **任务详情弹窗**
  - [ ] 详细信息编辑
  - [ ] 操作历史记录

## 开发注意事项

1. **类型安全**：所有组件都使用 TypeScript 进行类型检查
2. **响应式设计**：支持移动端和桌面端适配
3. **性能优化**：使用计算属性和适当的数据结构优化性能
4. **用户体验**：提供丰富的交互反馈和动画效果

## 技术栈

- **Vue 3** + **TypeScript**
- **Element Plus** (UI组件库)
- **Pinia** (状态管理)
- **vuedraggable** (拖拽功能)
- **Day.js** (日期处理)
