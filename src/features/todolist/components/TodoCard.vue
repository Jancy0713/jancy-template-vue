<template>
  <el-card
    class="todo-card"
    :class="`todo-card--${todo.status}`"
    shadow="hover"
    @dblclick="$emit('edit', todo)"
    @click="$emit('click', todo)"
    :data-todo-id="todo.id"
  >
    <div class="todo-card__content">
      <div class="todo-card__header">
        <div class="todo-card__title-section">
          <el-icon :color="priorityColor" :size="16" class="todo-card__priority-icon">
            <Warning v-if="todo.priority === 'high'" />
            <Clock v-else />
          </el-icon>
          <span
            class="todo-card__title"
            :class="{ 'todo-card__title--completed': todo.status === 'completed' }"
          >
            {{ todo.title }}
          </span>
        </div>

        <div class="todo-card__actions">
          <template v-if="showDragHandle">
            <el-button type="text" class="drag-handle" :icon="Operation" size="small" />
          </template>
          <template v-else>
            <template v-if="todo.status === 'pending'">
              <el-button
                type="text"
                size="small"
                :icon="ArrowRight"
                @click="$emit('toggle', todo.id)"
                class="status-action"
              />
            </template>
            <template v-else-if="todo.status === 'in-progress'">
              <el-button
                type="text"
                size="small"
                :icon="ArrowLeft"
                @click="handleStatusChange('pending')"
                class="status-action"
              />
              <el-button
                type="text"
                size="small"
                :icon="ArrowRight"
                @click="$emit('toggle', todo.id)"
                class="status-action"
              />
            </template>
            <template v-else>
              <el-button
                type="text"
                size="small"
                :icon="ArrowLeft"
                @click="handleStatusChange('in-progress')"
                class="status-action"
              />
            </template>
          </template>
          <el-dropdown trigger="click" @command="handleCommand">
            <el-button type="text" :icon="MoreFilled" size="small" class="more-action" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-dropdown-item>
                <el-dropdown-item command="toggle">
                  <el-icon>
                    <template v-if="todo.status === 'pending'">
                      <ArrowRight />
                    </template>
                    <template v-else-if="todo.status === 'in-progress'">
                      <CircleCheck />
                    </template>
                    <template v-else>
                      <ArrowRight />
                    </template>
                  </el-icon>
                  <template v-if="todo.status === 'pending'"> 标记为进行中 </template>
                  <template v-else-if="todo.status === 'in-progress'"> 标记为已完成 </template>
                  <template v-else> 标记为进行中 </template>
                </el-dropdown-item>
                <el-dropdown-item command="history">
                  <el-icon><Timer /></el-icon>
                  操作历史
                </el-dropdown-item>
                <el-dropdown-item command="delete" divided>
                  <el-icon><Delete /></el-icon>
                  删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div v-if="todo.description" class="todo-card__description">
        {{
          todo.description.length > 100
            ? todo.description.substring(0, 100) + '...'
            : todo.description
        }}
      </div>

      <div class="todo-card__footer">
        <div class="todo-card__tags">
          <el-tag
            v-for="tag in todoTags"
            :key="tag.id"
            :style="{
              color: tag.color,
              backgroundColor: getTagBackgroundColor(tag.color),
              borderColor: getTagBorderColor(tag.color),
            }"
            size="small"
            class="todo-card__tag"
          >
            {{ tag.name }}
          </el-tag>
        </div>

        <div class="todo-card__meta">
          <span class="todo-card__time"> 创建于 {{ formatDate(todo.createdAt) }} </span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ElCard,
  ElIcon,
  ElTag,
  ElButton,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
} from 'element-plus'
import {
  MoreFilled,
  Warning,
  Clock,
  Operation,
  ArrowRight,
  ArrowLeft,
  Timer,
  Edit,
  CircleCheck,
  Delete,
} from '@element-plus/icons-vue'
import type { Todo } from '../types/todo'
import { useTagStore } from '../stores/tag'
import { useTodoStore } from '../stores/todo'
import tinycolor from 'tinycolor2'

interface Props {
  todo: Todo
}

interface Emits {
  (e: 'edit', todo: Todo): void
  (e: 'delete', id: string): void
  (e: 'toggle', id: string): void
  (e: 'showHistory', todo: Todo): void
  (e: 'click', todo: Todo): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const tagStore = useTagStore()
const todoStore = useTodoStore()

const priorityColor = computed(() => {
  const colors = {
    high: '#F56C6C',
    medium: '#E6A23C',
    low: '#909399',
  }
  return colors[props.todo.priority]
})

const todoTags = computed(() => {
  return props.todo.tags
    .map((tagId) => tagStore.tags.find((tag) => tag.id === tagId))
    .filter((tag) => tag !== undefined)
})

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

const getTagBackgroundColor = (color: string) => {
  return tinycolor(color).setAlpha(0.1).toString()
}

const getTagBorderColor = (color: string) => {
  return tinycolor(color).setAlpha(0.2).toString()
}

const showDragHandle = computed(() => {
  return todoStore.sort.field === 'order'
})

const handleCommand = (command: string) => {
  switch (command) {
    case 'edit':
      emit('edit', props.todo)
      break
    case 'delete':
      emit('delete', props.todo.id)
      break
    case 'toggle':
      emit('toggle', props.todo.id)
      break
    case 'history':
      emit('showHistory', props.todo)
      break
  }
}

const handleStatusChange = (status: 'pending' | 'in-progress' | 'completed') => {
  todoStore.updateTodo(props.todo.id, { status })
}
</script>

<style scoped>
.todo-card {
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.todo-card:hover {
  transform: translateY(-2px);
}

.todo-card--pending {
  border-left: 4px solid rgba(144, 147, 153, 1);
}

.todo-card--in-progress {
  border-left: 4px solid rgba(64, 158, 255, 1);
}

.todo-card--completed {
  border-left: 4px solid rgba(103, 194, 58, 1);
  opacity: 0.8;
}

.todo-card__content {
  padding: 0;
}

.todo-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.todo-card__title-section {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.todo-card__priority-icon {
  margin-right: 8px;
}

.todo-card__title {
  font-weight: 500;
  font-size: 14px;
  word-break: break-word;
}

.todo-card__title--completed {
  text-decoration: line-through;
  opacity: 0.6;
}

.todo-card__description {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-bottom: 12px;
}

.todo-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}

.todo-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
  margin-top: 8px;
}

.todo-card__tag {
  font-size: 11px;
  border-width: 1px;
  border-style: solid;
  padding: 2px 8px;
  border-radius: 4px;
}

.todo-card__tag:hover {
  opacity: 0.9;
}

.todo-card__time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.todo-card__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-action {
  color: var(--el-text-color-secondary);
  transition: all 0.3s;
}

.status-action:hover {
  color: var(--el-color-primary);
  transform: scale(1.1);
}

.more-action {
  color: var(--el-text-color-placeholder);
  transition: all 0.3s;
}

.more-action:hover {
  color: var(--el-color-primary);
}

.drag-handle {
  cursor: move;
  color: var(--el-text-color-secondary);
}

.drag-handle:hover {
  color: var(--el-text-color-primary);
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;

  .el-icon {
    margin-right: 0;
  }
}
</style>
