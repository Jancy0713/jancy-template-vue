<template>
  <el-dialog
    v-model="dialogVisible"
    :title="todo ? t('todo.detail.editTitle') : t('todo.detail.createTitle')"
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
      <el-form-item :label="t('todo.detail.title')" prop="title">
        <el-input v-model="form.title" :placeholder="t('todo.detail.titlePlaceholder')" />
      </el-form-item>

      <!-- 任务描述 -->
      <el-form-item :label="t('todo.detail.description')" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          :placeholder="t('todo.detail.descriptionPlaceholder')"
        />
      </el-form-item>

      <!-- 任务状态 -->
      <el-form-item :label="t('todo.detail.status')" prop="status">
        <el-select v-model="form.status" style="width: 100%">
          <el-option :label="t('todo.status.pending')" value="pending" />
          <el-option :label="t('todo.status.inProgress')" value="in-progress" />
          <el-option :label="t('todo.status.completed')" value="completed" />
        </el-select>
      </el-form-item>

      <!-- 优先级 -->
      <el-form-item :label="t('todo.detail.priority')" prop="priority">
        <el-select v-model="form.priority" style="width: 100%">
          <el-option :label="t('todo.form.priorities.high')" value="high" />
          <el-option :label="t('todo.form.priorities.medium')" value="medium" />
          <el-option :label="t('todo.form.priorities.low')" value="low" />
        </el-select>
      </el-form-item>

      <!-- 标签 -->
      <el-form-item :label="t('todo.detail.tags')" prop="tags">
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
      <el-form-item :label="t('todo.detail.dueDate')" prop="dueDate">
        <el-date-picker
          v-model="form.dueDate"
          type="date"
          :placeholder="t('todo.detail.dueDatePlaceholder')"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>

    <!-- 操作历史记录 -->
    <div v-if="todo" class="history-section">
      <h3>{{ t('todo.detail.history') }}</h3>
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
      <el-button @click="dialogVisible = false">{{ t('todo.detail.actions.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmit">{{
        t('todo.detail.actions.confirm')
      }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
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
import type { Todo, HistoryRecord, HistoryActionType } from '../types/todo'
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

const { t } = useI18n()

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
  title: [{ required: true, message: t('todo.detail.validation.titleRequired'), trigger: 'blur' }],
  status: [
    { required: true, message: t('todo.detail.validation.statusRequired'), trigger: 'change' },
  ],
  priority: [
    { required: true, message: t('todo.detail.validation.priorityRequired'), trigger: 'change' },
  ],
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

const getHistoryItemText = (record: HistoryRecord): string => {
  return t(`todo.history.actions.${record.actionType}`)
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
