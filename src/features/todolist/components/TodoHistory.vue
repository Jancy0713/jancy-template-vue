<template>
  <el-dialog
    v-model="dialogVisible"
    :title="t('todo.history.title')"
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
            <div class="history-item__title">
              {{ t(`todo.history.actions.${record.actionType}`) }}
            </div>
            <div v-if="record.changes" class="history-item__changes">
              <div class="history-item__change">
                <span class="history-item__field"
                  >{{ t(`todo.history.fields.${record.changes.field}`) }}：</span
                >
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
import { useI18n } from 'vue-i18n'
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

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const tagStore = useTagStore()
const { t } = useI18n()

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

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: t('todo.history.status.pending'),
    'in-progress': t('todo.history.status.inProgress'),
    completed: t('todo.history.status.completed'),
  }
  return statusMap[status] || status
}

const getPriorityText = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    high: t('todo.history.priority.high'),
    medium: t('todo.history.priority.medium'),
    low: t('todo.history.priority.low'),
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
    return t('todo.history.noValue')
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
          return tag ? tag.name : t('todo.history.deletedTag')
        })
        .join(', ')
      return tagNames || t('todo.history.noValue')
    }
    return value.join(', ') || t('todo.history.noValue')
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
