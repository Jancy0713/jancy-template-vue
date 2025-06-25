<template>
  <el-dialog
    v-model="dialogVisible"
    :title="todo ? t('todo.form.editTitle') : t('todo.form.createTitle')"
    width="600px"
    @close="$emit('cancel')"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item :label="t('todo.form.title')" prop="title">
        <el-input
          v-model="form.title"
          :placeholder="t('todo.form.titlePlaceholder')"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item :label="t('todo.form.description')" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :placeholder="t('todo.form.descriptionPlaceholder')"
          :rows="3"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('todo.form.priority')" prop="priority">
            <el-select v-model="form.priority" style="width: 100%">
              <el-option :label="t('todo.form.priorities.high')" value="high" />
              <el-option :label="t('todo.form.priorities.medium')" value="medium" />
              <el-option :label="t('todo.form.priorities.low')" value="low" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('todo.form.dueDate')" prop="dueDate">
            <el-date-picker
              v-model="form.dueDate"
              type="date"
              :placeholder="t('todo.form.dueDatePlaceholder')"
              style="width: 100%"
              :disabled-date="disabledDate"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item :label="t('todo.form.tags')" prop="tags">
        <el-select
          v-model="form.tags"
          multiple
          :placeholder="t('todo.form.tagsPlaceholder')"
          style="width: 100%"
        >
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
    </el-form>

    <template #footer>
      <el-button @click="$emit('cancel')">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmit">
        {{ todo ? t('todo.form.actions.update') : t('todo.form.actions.create') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElButton,
  ElRow,
  ElCol,
  ElDatePicker,
  ElTag,
} from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { Todo, CreateTodoData, UpdateTodoData, TodoPriority } from '../types/todo'
import { useTagStore } from '../stores/tag'
import tinycolor from 'tinycolor2'

interface Props {
  visible: boolean
  todo?: Todo | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: CreateTodoData | UpdateTodoData): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const tagStore = useTagStore()

const formRef = ref<FormInstance>()

const form = reactive({
  title: props.todo?.title || '',
  description: props.todo?.description || '',
  priority: props.todo?.priority || ('medium' as TodoPriority),
  dueDate: props.todo?.dueDate,
  tags: props.todo?.tags || [],
})

const rules: FormRules = {
  title: [{ required: true, message: t('todo.form.validation.titleRequired'), trigger: 'blur' }],
}

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7 // 不能选择昨天之前的日期
}

const resetForm = () => {
  form.title = ''
  form.description = ''
  form.priority = 'medium'
  form.dueDate = undefined
  form.tags = []
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const fillForm = (todo: Todo) => {
  form.title = todo.title
  form.description = todo.description || ''
  form.priority = todo.priority
  form.dueDate = todo.dueDate || undefined
  form.tags = [...todo.tags]
}

const getTagBackgroundColor = (color: string) => {
  return tinycolor(color).setAlpha(0.1).toString()
}

const getTagBorderColor = (color: string) => {
  return tinycolor(color).setAlpha(0.2).toString()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      const todoData = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        dueDate: form.dueDate,
        tags: form.tags,
      }

      if (props.todo?.id) {
        emit('submit', { ...todoData, id: props.todo.id })
      } else {
        emit('submit', todoData)
      }
      resetForm()
    }
  })
}

// 监听 todo 变化
watch(
  () => props.todo,
  (todo) => {
    if (todo) {
      fillForm(todo)
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

// 监听对话框显示状态
watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      resetForm()
    }
  },
)
</script>

<style scoped>
.todo-form {
  padding: 20px;
}

.tag-option {
  display: flex;
  align-items: center;
  padding: 4px 0;
}

:deep(.el-tag) {
  margin: 0;
}

.el-select {
  width: 100%;
}
</style>
