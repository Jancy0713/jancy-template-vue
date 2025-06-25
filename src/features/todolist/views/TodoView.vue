<template>
  <div class="todo-view">
    <!-- 头部 -->
    <el-header class="todo-header">
      <div class="todo-header__content">
        <h1 class="todo-header__title">
          <el-icon :size="24" color="#409EFF">
            <Calendar />
          </el-icon>
          待办清单
        </h1>

        <div class="todo-header__actions">
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            新增任务
          </el-button>
        </div>
      </div>
    </el-header>

    <!-- 工具栏 -->
    <div class="todo-toolbar">
      <div class="todo-toolbar__content">
        <div class="todo-toolbar__left">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索任务..."
            clearable
            style="width: 300px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-button @click="showFilterDialog = true">
            <el-icon><Filter /></el-icon>
            筛选
          </el-button>

          <el-select v-model="currentSort" style="width: 150px" @change="handleSortChange">
            <el-option label="自定义排序" value="order:asc" />
            <el-option label="优先级排序" value="priority:desc" />
            <el-option label="创建时间" value="createdAt:desc" />
            <el-option label="更新时间" value="updatedAt:desc" />
            <el-option label="截止时间" value="dueDate:asc" />
          </el-select>
        </div>

        <div class="todo-toolbar__right">
          <el-button @click="showTagManager = true">
            <el-icon><Collection /></el-icon>
            标签管理
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <el-main class="todo-main">
      <div class="todo-boards">
        <!-- 待办列表 -->
        <div class="todo-board">
          <TodoList
            :todos="todosByStatus.pending"
            status="pending"
            @edit="handleEdit"
            @delete="handleDelete"
            @toggle="handleToggle"
            @reorder="handleReorder"
            @show-history="handleShowHistory"
          />
        </div>

        <!-- 进行中列表 -->
        <div class="todo-board">
          <TodoList
            :todos="todosByStatus.inProgress"
            status="in-progress"
            @edit="handleEdit"
            @delete="handleDelete"
            @toggle="handleToggle"
            @reorder="handleReorder"
            @show-history="handleShowHistory"
          />
        </div>

        <!-- 已完成列表 -->
        <div class="todo-board">
          <TodoList
            :todos="todosByStatus.completed.all"
            status="completed"
            @edit="handleEdit"
            @delete="handleDelete"
            @toggle="handleToggle"
            @reorder="handleReorder"
            @show-history="handleShowHistory"
          />
        </div>
      </div>
    </el-main>

    <!-- 添加/编辑任务对话框 -->
    <TodoForm
      v-model:visible="showAddDialog"
      :todo="editingTodo"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />

    <!-- 筛选对话框 -->
    <FilterDialog
      v-model:visible="showFilterDialog"
      :filters="filters"
      @apply="handleApplyFilters"
      @clear="handleClearFilters"
    />

    <!-- 标签管理对话框 -->
    <TagManager v-model:visible="showTagManager" />

    <!-- 历史记录对话框 -->
    <TodoHistory v-model:visible="showHistoryDialog" :todo="selectedTodo" />

    <!-- 任务详情弹窗 -->
    <TodoDetail
      v-model:visible="showTodoDetail"
      :todo="selectedTodo"
      @submit="handleTodoDetailUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  ElHeader,
  ElMain,
  ElButton,
  ElInput,
  ElSelect,
  ElOption,
  ElIcon,
  ElMessage,
  ElMessageBox,
} from 'element-plus'
import { Calendar, Plus, Search, Filter, Collection } from '@element-plus/icons-vue'

import TodoList from '../components/TodoList.vue'
import TodoForm from '../components/TodoForm.vue'
import FilterDialog from '../components/FilterDialog.vue'
import TagManager from '../components/TagManager.vue'
import TodoHistory from '../components/TodoHistory.vue'
import TodoDetail from '../components/TodoDetail.vue'

import { useTodoStore } from '../stores/todo'
import { useTagStore } from '../stores/tag'
import { initializeSampleData } from '../utils/sampleData'
import type { Todo, CreateTodoData, UpdateTodoData } from '../types/todo'
import type { FilterOptions, SortOptions } from '../types/common'

const todoStore = useTodoStore()
const tagStore = useTagStore()

// 响应式状态
const showAddDialog = ref(false)
const showFilterDialog = ref(false)
const showTagManager = ref(false)
const showHistoryDialog = ref(false)
const showTodoDetail = ref(false)
const editingTodo = ref<Todo | null>(null)
const selectedTodo = ref<Todo | undefined>(undefined)
const searchKeyword = ref('')
const currentSort = ref('order:asc')

// 计算属性
const todosByStatus = computed(() => todoStore.todosByStatus)
const filters = computed(() => todoStore.filters)

// 方法
const handleEdit = (todo: Todo) => {
  editingTodo.value = todo
  showAddDialog.value = true
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个任务吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    if (todoStore.deleteTodo(id)) {
      ElMessage.success('任务删除成功')
    }
  } catch {
    // 用户取消删除
  }
}

const handleToggle = (id: string) => {
  const result = todoStore.toggleTodoStatus(id)
  if (result) {
    const statusText = {
      pending: '待办',
      'in-progress': '进行中',
      completed: '已完成',
    }
    ElMessage.success(`任务状态已更新为：${statusText[result.status]}`)
  }
}

const handleReorder = (todos: Todo[]) => {
  // 更新所有相关任务的顺序
  const status = todos[0]?.status
  if (!status) return

  // 获取相同状态的所有任务
  const statusTodos = todoStore.todos.filter((t) => t.status === status)

  // 更新顺序
  statusTodos.forEach((todo) => {
    const newTodo = todos.find((t) => t.id === todo.id)
    if (newTodo) {
      todoStore.updateTodo(todo.id, {
        order: todos.findIndex((t) => t.id === todo.id),
        status: newTodo.status,
      })
    } else {
      // 如果任务不在新列表中，将其顺序设置为最后
      todoStore.updateTodo(todo.id, {
        order: todos.length + statusTodos.length,
      })
    }
  })
}

const handleSubmit = (data: CreateTodoData | UpdateTodoData) => {
  try {
    if (editingTodo.value) {
      // 编辑模式
      todoStore.updateTodo(editingTodo.value.id, data as UpdateTodoData)
      ElMessage.success('任务更新成功')
    } else {
      // 新增模式
      todoStore.addTodo(data as CreateTodoData)
      ElMessage.success('任务创建成功')
    }
    handleCancel()
  } catch (error) {
    ElMessage.error('操作失败，请重试')
    console.error('Submit error:', error)
  }
}

const handleCancel = () => {
  showAddDialog.value = false
  editingTodo.value = null
}

const handleSortChange = (value: string) => {
  const [field, order] = value.split(':') as [SortOptions['field'], SortOptions['order']]
  todoStore.setSort({ field, order })
}

const handleApplyFilters = (newFilters: FilterOptions) => {
  todoStore.setFilters(newFilters)
  showFilterDialog.value = false
}

const handleClearFilters = () => {
  todoStore.clearFilters()
  showFilterDialog.value = false
}

const handleShowHistory = (todo: Todo) => {
  selectedTodo.value = todo
  showHistoryDialog.value = true
}

const handleTodoDetailUpdate = (todo: Partial<Todo>) => {
  if (todo.id) {
    todoStore.updateTodo(todo.id, todo)
  }
}

// 监听搜索关键词变化
watch(searchKeyword, (keyword) => {
  todoStore.setFilters({ ...filters.value, keyword })
})

// 初始化
onMounted(() => {
  todoStore.loadData()
  tagStore.loadData()

  // 如果是首次使用，初始化示例数据
  initializeSampleData(todoStore, tagStore)
})
</script>

<style scoped>
.todo-view {
  min-height: 100vh;
  background: var(--el-bg-color-page);
}

.todo-header {
  background: white;
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 0;
  height: auto;
}

.todo-header__content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.todo-header__title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.todo-toolbar {
  background: white;
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 16px 0;
}

.todo-toolbar__content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.todo-toolbar__left,
.todo-toolbar__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.todo-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.todo-boards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  align-items: start;
}

.todo-board {
  min-height: 400px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .todo-header__content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .todo-toolbar__content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .todo-toolbar__left,
  .todo-toolbar__right {
    flex-direction: column;
    align-items: stretch;
  }

  .todo-boards {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .todo-main {
    padding: 16px;
  }
}

/* 深色模式适配 */
.dark .todo-header {
  background: var(--el-bg-color);
  border-bottom-color: var(--el-border-color);
}

.dark .todo-toolbar {
  background: var(--el-bg-color);
  border-bottom-color: var(--el-border-color);
}
</style>
