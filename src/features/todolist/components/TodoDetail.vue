<template>
  <el-dialog
    v-model="dialogVisible"
    :title="todo ? '编辑任务' : '新建任务'"
    width="800px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="todo-detail-form"
    >
      <!-- 任务标题 -->
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入任务标题" />
      </el-form-item>

      <!-- 任务描述 -->
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请输入任务描述"
        />
      </el-form-item>

      <!-- 任务状态 -->
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" style="width: 100%">
          <el-option label="待办" value="pending" />
          <el-option label="进行中" value="in-progress" />
          <el-option label="已完成" value="completed" />
        </el-select>
      </el-form-item>

      <!-- 优先级 -->
      <el-form-item label="优先级" prop="priority">
        <el-select v-model="form.priority" style="width: 100%">
          <el-option label="高优先级" value="high" />
          <el-option label="中优先级" value="medium" />
          <el-option label="低优先级" value="low" />
        </el-select>
      </el-form-item>

      <!-- 标签 -->
      <el-form-item label="标签" prop="tags">
        <el-select v-model="form.tags" multiple style="width: 100%">
          <el-option v-for="tag in tagStore.tags" :key="tag.id" :label="tag.name" :value="tag.id">
            <div class="tag-option">
              <el-tag
                :style="{
                  color: tag.color,
                  backgroundColor: getTagBackgroundColor(tag.color),
                  borderColor: getTagBorderColor(tag.color),
                }"
                size="small"
              >
                {{ tag.name }}
              </el-tag>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 计划完成日期 -->
      <el-form-item label="计划完成" prop="dueDate">
        <el-date-picker
          v-model="form.dueDate"
          type="date"
          placeholder="选择计划完成日期"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>

    <!-- 操作历史记录 -->
    <div v-if="todo" class="history-section">
      <h3>操作历史</h3>
      <el-timeline>
        <el-timeline-item
          v-for="record in todo.history"
          :key="record.id"
          :timestamp="formatDate(record.timestamp)"
          :type="getHistoryItemType(record.actionType)"
        >
          {{ getHistoryItemText(record) }}
        </el-timeline-item>
      </el-timeline>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElButton,
  ElTag,
  ElTimeline,
  ElTimelineItem,
} from 'element-plus'
import type {
  Todo,
  TodoStatus,
  TodoPriority,
  HistoryRecord,
  HistoryActionType,
} from '../types/todo'
import { useTagStore } from '../stores/tag'
import tinycolor from 'tinycolor2'
import { formatDate } from '../utils/date'

interface Props {
  visible: boolean
  todo?: Todo
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'submit', todo: Partial<Todo>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const tagStore = useTagStore()
const formRef = ref<FormInstance>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const form = reactive({
  title: '',
  description: '',
  status: 'pending' as Todo['status'],
  priority: 'medium' as Todo['priority'],
  tags: [] as string[],
  dueDate: undefined as Date | undefined,
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
  status: [{ required: true, message: '请选择任务状态', trigger: 'change' }],
  priority: [{ required: true, message: '请选择任务优先级', trigger: 'change' }],
}

// 监听 todo 变化，更新表单
watch(
  () => props.todo,
  (todo: Todo | undefined) => {
    if (todo) {
      form.title = todo.title
      form.description = todo.description || ''
      form.status = todo.status
      form.priority = todo.priority
      form.tags = todo.tags
      form.dueDate = todo.dueDate
    } else {
      form.title = ''
      form.description = ''
      form.status = 'pending'
      form.priority = 'medium'
      form.tags = []
      form.dueDate = undefined
    }
  },
  { immediate: true },
)

const getTagBackgroundColor = (color: string) => {
  return tinycolor(color).setAlpha(0.1).toString()
}

const getTagBorderColor = (color: string) => {
  return tinycolor(color).setAlpha(0.2).toString()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid && props.todo?.id) {
      emit('submit', {
        ...form,
        id: props.todo.id,
      })
      dialogVisible.value = false
    }
  })
}

const getHistoryItemType = (
  actionType: HistoryActionType,
): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  switch (actionType) {
    case 'create':
      return 'primary'
    case 'complete':
      return 'success'
    case 'delete':
      return 'danger'
    default:
      return 'info'
  }
}

const getHistoryItemText = (record: HistoryRecord): string => {
  switch (record.actionType) {
    case 'create':
      return '创建任务'
    case 'complete':
      return '完成任务'
    case 'delete':
      return '删除任务'
    case 'update_title':
      return `修改标题: ${record.changes?.oldValue} → ${record.changes?.newValue}`
    case 'update_description':
      return '修改描述'
    case 'update_status':
      return `修改状态: ${getStatusText(record.changes?.oldValue as TodoStatus)} → ${getStatusText(record.changes?.newValue as TodoStatus)}`
    case 'update_priority':
      return `修改优先级: ${getPriorityText(record.changes?.oldValue as TodoPriority)} → ${getPriorityText(record.changes?.newValue as TodoPriority)}`
    case 'update_tags':
      return '修改标签'
    case 'update_due_date':
      return `修改截止日期: ${formatDate(record.changes?.oldValue as Date)} → ${formatDate(record.changes?.newValue as Date)}`
    default:
      return '更新任务'
  }
}

const getStatusText = (status: TodoStatus): string => {
  const statusMap: Record<TodoStatus, string> = {
    pending: '待办',
    'in-progress': '进行中',
    completed: '已完成',
  }
  return statusMap[status] || status
}

const getPriorityText = (priority: TodoPriority): string => {
  const priorityMap: Record<TodoPriority, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级',
  }
  return priorityMap[priority] || priority
}
</script>

<style scoped>
.todo-detail-form {
  margin-bottom: 24px;
}

.tag-option {
  display: flex;
  align-items: center;
}

.history-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.history-section h3 {
  margin: 0 0 16px;
  font-size: 16px;
  color: var(--el-text-color-primary);
}
</style>
