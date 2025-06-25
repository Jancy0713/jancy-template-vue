<template>
  <div class="todo-view">
    <app-header> </app-header>

    <!-- 工具栏 -->
    <div class="todo-toolbar">
      <div class="todo-toolbar__content">
        <div class="todo-toolbar__left">
          <el-input
            v-model="searchKeyword"
            :placeholder="t('todo.search.placeholder')"
            clearable
            style="width: 300px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-button @click="showFilterDialog = true">
            <el-icon><Filter /></el-icon>
            {{ t('todo.filter.title') }}
          </el-button>

          <el-select v-model="currentSort" style="width: 150px" @change="handleSortChange">
            <el-option :label="t('todo.sort.custom')" value="order:asc" />
            <el-option :label="t('todo.sort.priority')" value="priority:desc" />
            <el-option :label="t('todo.sort.createdAt')" value="createdAt:desc" />
            <el-option :label="t('todo.sort.updatedAt')" value="updatedAt:desc" />
            <el-option :label="t('todo.sort.dueDate')" value="dueDate:asc" />
          </el-select>
        </div>

        <div class="todo-toolbar__right">
          <el-button @click="showTagManager = true">
            <el-icon><Collection /></el-icon>
            {{ t('todo.tag.manager.title') }}
          </el-button>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            {{ t('todo.addTask') }}
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
import { useI18n } from 'vue-i18n'
import {
  ElMain,
  ElButton,
  ElInput,
  ElSelect,
  ElOption,
  ElIcon,
  ElMessage,
  ElMessageBox,
} from 'element-plus'
import { Plus, Search, Filter, Collection } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'

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
const { t } = useI18n()

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
    await ElMessageBox.confirm(t('todo.dialog.deleteConfirm'), t('todo.dialog.deleteTitle'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning',
    })

    if (todoStore.deleteTodo(id)) {
      ElMessage.success(t('todo.dialog.deleteSuccess'))
    }
  } catch {
    // 用户取消删除
  }
}

const handleToggle = (id: string) => {
  const result = todoStore.toggleTodoStatus(id)
  if (result) {
    const statusText = {
      pending: t('todo.status.pending'),
      'in-progress': t('todo.status.inProgress'),
      completed: t('todo.status.completed'),
    }
    ElMessage.success(`${t('common.success')}：${statusText[result.status]}`)
  }
}

const handleReorder = (status: string, ids: string[]) => {
  todoStore.reorderTodos(status as Todo['status'], ids)
}

const handleSubmit = (data: CreateTodoData | UpdateTodoData) => {
  if ('id' in data) {
    // 更新任务
    const result = todoStore.updateTodo(data.id, data)
    if (result) {
      ElMessage.success(t('todo.dialog.updateSuccess'))
      showAddDialog.value = false
      editingTodo.value = null
    }
  } else {
    // 创建任务
    const result = todoStore.addTodo(data)
    if (result) {
      ElMessage.success(t('todo.dialog.createSuccess'))
      showAddDialog.value = false
    }
  }
}

const handleCancel = () => {
  showAddDialog.value = false
  editingTodo.value = null
}

const handleSortChange = (value: string) => {
  const [field, order] = value.split(':') as [keyof SortOptions, 'asc' | 'desc']
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

const handleTodoDetailUpdate = (data: UpdateTodoData) => {
  if (todoStore.updateTodo(data)) {
    ElMessage.success(t('todo.dialog.updateSuccess'))
    showTodoDetail.value = false
  }
}

// 监听搜索关键词变化
watch(searchKeyword, (value) => {
  todoStore.setSearchKeyword(value)
})

// 初始化
onMounted(() => {
  // 如果没有任何数据，初始化示例数据
  if (todoStore.todos.length === 0 && tagStore.tags.length === 0) {
    initializeSampleData(todoStore, tagStore)
  }
})
</script>

<style lang="scss" scoped>
.todo-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color-page);

  .todo-toolbar {
    padding: 16px 24px;
    border-bottom: 1px solid var(--el-border-color-light);
    background-color: var(--el-bg-color);

    &__content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    &__left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    &__right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  }

  .todo-main {
    flex: 1;
    padding: 24px;
    overflow: auto;
  }

  .todo-boards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    height: 100%;
  }

  .todo-board {
    min-height: 200px;
  }
}
</style>
