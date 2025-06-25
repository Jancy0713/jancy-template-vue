<template>
  <div class="todo-list">
    <div class="todo-list__header">
      <h3 class="todo-list__title">
        <el-icon :color="statusConfig.color" :size="18">
          <component :is="statusConfig.icon" />
        </el-icon>
        {{ t(`todo.status.${status}`) }}
        <span class="todo-count">{{ t('todo.list.taskCount', { count: todos.length }) }}</span>
      </h3>

      <el-button v-if="status === 'completed'" type="text" size="small" @click="toggleShowAll">
        {{ t(showAllCompleted ? 'todo.list.showToday' : 'todo.list.showAll') }}
      </el-button>
    </div>

    <div class="todo-list__content" :class="`todo-list__content--${status}`">
      <div v-if="displayTodos.length === 0" class="todo-list__empty">
        <el-empty :description="emptyText" :image-size="60" />
      </div>

      <div v-else>
        <draggable
          v-model="dragTodos"
          group="todos"
          :component-data="{
            class: 'todo-list__items',
          }"
          :animation="200"
          ghost-class="todo-ghost"
          chosen-class="todo-chosen"
          drag-class="todo-drag"
          item-key="id"
          handle=".drag-handle"
          @change="handleDragChange"
        >
          <template #item="{ element: todo }">
            <TodoCard
              :key="todo.id"
              :todo="todo"
              @edit="$emit('edit', $event)"
              @delete="$emit('delete', $event)"
              @toggle="$emit('toggle', $event)"
              @show-history="$emit('show-history', $event)"
            />
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElButton, ElIcon, ElEmpty } from 'element-plus'
import { Clock, Loading, Check } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'

import TodoCard from './TodoCard.vue'
import type { Todo, TodoStatus } from '../types/todo'
import { useTodoStore } from '../stores/todo'

interface Props {
  todos: Todo[]
  status: TodoStatus
}

interface Emits {
  (e: 'edit', todo: Todo): void
  (e: 'delete', id: string): void
  (e: 'toggle', id: string): void
  (e: 'reorder', todos: Todo[]): void
  (e: 'show-history', todo: Todo): void
}

interface DragChangeEvent {
  added?: {
    element: Todo
    newIndex: number
  }
  moved?: {
    element: Todo
    newIndex: number
    oldIndex: number
  }
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const todoStore = useTodoStore()
const { t } = useI18n()

const showAllCompleted = ref(false)

const statusConfig = computed(() => {
  const configs = {
    pending: {
      color: '#909399',
      icon: Clock,
    },
    'in-progress': {
      color: '#409EFF',
      icon: Loading,
    },
    completed: {
      color: '#67C23A',
      icon: Check,
    },
  }
  return configs[props.status]
})

const displayTodos = computed(() => {
  if (props.status === 'completed' && !showAllCompleted.value) {
    // 只显示今天完成的任务
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return props.todos.filter((todo) => {
      if (!todo.completedAt) return false
      const completedDate = new Date(todo.completedAt)
      completedDate.setHours(0, 0, 0, 0)
      return completedDate.getTime() === today.getTime()
    })
  }
  return props.todos
})

const emptyText = computed(() => {
  switch (props.status) {
    case 'pending':
      return t('todo.list.empty.pending')
    case 'in-progress':
      return t('todo.list.empty.inProgress')
    case 'completed':
      return t(
        showAllCompleted.value
          ? 'todo.list.empty.completed.all'
          : 'todo.list.empty.completed.today',
      )
    default:
      return t('common.noData')
  }
})

const toggleShowAll = () => {
  showAllCompleted.value = !showAllCompleted.value
}

const handleDragChange = (evt: DragChangeEvent) => {
  if (evt.added) {
    // 处理从其他列表添加的情况
    const { element: todo, newIndex } = evt.added
    const updatedTodo = {
      ...todo,
      status: props.status,
      order: newIndex,
    }
    todoStore.updateTodo(todo.id, updatedTodo)
  } else if (evt.moved) {
    // 处理同一列表内的排序
    const todos = dragTodos.value.map((todo, index) => ({
      ...todo,
      order: index,
    }))
    emit('reorder', todos)
  }
}

const dragTodos = computed({
  get() {
    return displayTodos.value
  },
  set(newTodos: Todo[]) {
    // 仅在没有 added 事件时处理重排序
    if (!newTodos.some((todo) => todo.status !== props.status)) {
      const updatedTodos = newTodos.map((todo, index) => ({
        ...todo,
        order: index,
      }))
      emit('reorder', updatedTodos)
    }
  },
})
</script>

<style scoped>
.todo-list {
  background: var(--el-bg-color-page);
  border-radius: 8px;
  padding: 16px;
  height: fit-content;
  min-height: 200px;
}

.todo-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.todo-list__title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.todo-count {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  font-weight: normal;
  background-color: var(--el-fill-color-light);
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 72px;
  text-align: center;
}

.todo-list__content {
  min-height: 120px;
}

.todo-list__content--pending {
  background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
  border-radius: 6px;
  padding: 12px;
}

.todo-list__content--in-progress {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 6px;
  padding: 12px;
}

.todo-list__content--completed {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  border-radius: 6px;
  padding: 12px;
}

.todo-list__empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
}

.todo-list__items {
  min-height: 60px;
}

/* 拖拽样式 */
.todo-ghost {
  opacity: 0.5;
  background: var(--el-bg-color-page);
  border: 2px dashed var(--el-color-primary);
  border-radius: 8px;
}

.todo-chosen {
  opacity: 0.8;
}

.todo-drag {
  opacity: 0.9;
}
</style>
