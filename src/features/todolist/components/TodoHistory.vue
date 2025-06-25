<template>
  <el-dialog
    v-model="dialogVisible"
    title="操作历史"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
  >
    <div class="todo-history-dialog">
      <el-timeline>
        <el-timeline-item
          v-for="record in sortedHistory"
          :key="record.id"
          :timestamp="formatTime(record.timestamp)"
          :type="getTimelineItemType(record.actionType)"
        >
          <div class="history-item">
            <div class="history-item__title">{{ getActionText(record.actionType) }}</div>
            <div v-if="record.changes" class="history-item__changes">
              <div class="history-item__change">
                <span class="history-item__field">{{ getFieldText(record.changes.field) }}：</span>
                <template v-if="record.changes.field === 'status'">
                  <el-tag size="small" type="info" class="history-item__old-value">
                    {{ getStatusText(String(record.changes.oldValue || '')) }}
                  </el-tag>
                  <el-icon class="history-item__arrow"><ArrowRight /></el-icon>
                  <el-tag size="small" type="success" class="history-item__new-value">
                    {{ getStatusText(String(record.changes.newValue || '')) }}
                  </el-tag>
                </template>
                <template v-else-if="record.changes.field === 'priority'">
                  <el-tag
                    size="small"
                    :type="getPriorityType(String(record.changes.oldValue || ''))"
                    class="history-item__old-value"
                  >
                    {{ getPriorityText(String(record.changes.oldValue || '')) }}
                  </el-tag>
                  <el-icon class="history-item__arrow"><ArrowRight /></el-icon>
                  <el-tag
                    size="small"
                    :type="getPriorityType(String(record.changes.newValue || ''))"
                    class="history-item__new-value"
                  >
                    {{ getPriorityText(String(record.changes.newValue || '')) }}
                  </el-tag>
                </template>
                <template v-else>
                  <span class="history-item__old-value">{{
                    formatValue(record.changes.oldValue, record.changes.field)
                  }}</span>
                  <el-icon class="history-item__arrow"><ArrowRight /></el-icon>
                  <span class="history-item__new-value">{{
                    formatValue(record.changes.newValue, record.changes.field)
                  }}</span>
                </template>
              </div>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElDialog, ElTimeline, ElTimelineItem, ElTag, ElIcon } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'
import type { Todo, HistoryActionType, HistoryChangeValue } from '../types/todo'
import { useTagStore } from '../stores/tag'

interface Props {
  visible: boolean
  todo: Todo | null | undefined
}

interface Emits {
  (e: 'update:visible', value: boolean): void
}

type FieldType =
  | 'status'
  | 'priority'
  | 'title'
  | 'description'
  | 'tags'
  | 'dueDate'
  | 'order'
  | string

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const tagStore = useTagStore()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const sortedHistory = computed(() => {
  if (!props.todo?.history) return []
  return [...props.todo.history]
    .map((record) => ({
      ...record,
      timestamp: new Date(record.timestamp), // 确保 timestamp 是 Date 对象
    }))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
})

const getFieldText = (field: FieldType): string => {
  const fieldMap: Record<FieldType, string> = {
    title: '标题',
    description: '描述',
    status: '状态',
    priority: '优先级',
    tags: '标签',
    dueDate: '截止日期',
    order: '排序',
  }
  return fieldMap[field] || String(field)
}

const getTimelineItemType = (
  actionType: HistoryActionType,
): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<HistoryActionType, 'primary' | 'success' | 'warning' | 'danger' | 'info'> =
    {
      create: 'primary',
      update_title: 'info',
      update_description: 'info',
      update_status: 'success',
      update_priority: 'warning',
      update_tags: 'info',
      update_due_date: 'warning',
      update_order: 'info',
      complete: 'success',
      delete: 'danger',
    }
  return typeMap[actionType] || 'info'
}

const getActionText = (actionType: HistoryActionType): string => {
  const textMap: Record<HistoryActionType, string> = {
    create: '创建任务',
    update_title: '更新标题',
    update_description: '更新描述',
    update_status: '更新状态',
    update_priority: '更新优先级',
    update_tags: '更新标签',
    update_due_date: '更新截止日期',
    update_order: '调整顺序',
    complete: '完成任务',
    delete: '删除任务',
  }
  return textMap[actionType] || actionType
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待办',
    'in-progress': '进行中',
    completed: '已完成',
  }
  return statusMap[status] || status
}

const getPriorityText = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低',
  }
  return priorityMap[priority] || priority
}

const getPriorityType = (priority: string): 'danger' | 'warning' | 'info' => {
  const typeMap: Record<string, 'danger' | 'warning' | 'info'> = {
    high: 'danger',
    medium: 'warning',
    low: 'info',
  }
  return typeMap[priority] || 'info'
}

const formatValue = (value: HistoryChangeValue, fieldName: string): string => {
  if (value === null || value === undefined) {
    return '无'
  }
  if (value instanceof Date) {
    return formatTime(value)
  }
  if (Array.isArray(value)) {
    // 如果是标签数组，转换标签ID为标签名称
    if (fieldName === 'tags') {
      const tagNames = value
        .map((tagId) => {
          const tag = tagStore.getTagById(tagId as string)
          return tag ? tag.name : '已删除的标签'
        })
        .filter(Boolean)
      return tagNames.length > 0 ? tagNames.join(', ') : '无标签'
    }
    return value.join(', ')
  }
  // 如果是数字且字段名包含 order，显示为"位置 X"
  if (typeof value === 'number' && fieldName.includes('order')) {
    return `位置 ${value + 1}`
  }
  return String(value)
}

const formatTime = (date: Date | string | number) => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date)
    if (isNaN(dateObj.getTime())) {
      return '无效时间'
    }
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(dateObj)
  } catch (error) {
    console.error('格式化时间错误:', error)
    return '无效时间'
  }
}
</script>

<style scoped>
.todo-history-dialog {
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
}

.history-item {
  margin-bottom: 8px;
}

.history-item__title {
  font-weight: bold;
  margin-bottom: 4px;
}

.history-item__changes {
  font-size: 14px;
}

.history-item__change {
  display: flex;
  align-items: center;
  margin: 4px 0;
}

.history-item__field {
  color: var(--el-text-color-secondary);
  margin-right: 8px;
}

.history-item__arrow {
  margin: 0 8px;
  color: var(--el-text-color-secondary);
}

.history-item__old-value,
.history-item__new-value {
  display: inline-flex;
  align-items: center;
}
</style>
