<template>
  <el-dialog v-model="dialogVisible" title="筛选条件" width="600px">
    <el-form :model="form" label-width="100px">
      <!-- 优先级筛选 -->
      <el-form-item label="优先级">
        <el-select v-model="form.priority" multiple placeholder="选择优先级" style="width: 100%">
          <el-option label="高优先级" value="high" />
          <el-option label="中优先级" value="medium" />
          <el-option label="低优先级" value="low" />
        </el-select>
      </el-form-item>

      <!-- 状态筛选 -->
      <el-form-item label="状态">
        <el-select v-model="form.status" multiple placeholder="选择状态" style="width: 100%">
          <el-option label="待办" value="pending" />
          <el-option label="进行中" value="in-progress" />
          <el-option label="已完成" value="completed" />
        </el-select>
      </el-form-item>

      <!-- 标签筛选 -->
      <el-form-item label="标签">
        <el-select v-model="form.tags" multiple placeholder="选择标签" style="width: 100%">
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
              <div class="tag-count-wrapper">
                <span class="tag-count">{{ getTagCount(tag.id) }} 个任务</span>
              </div>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 日期范围筛选 -->
      <el-form-item label="日期范围">
        <div class="date-range-filter">
          <el-select v-model="form.dateRange.type" style="width: 120px">
            <el-option label="创建时间" value="created" />
            <el-option label="更新时间" value="updated" />
            <el-option label="完成时间" value="completed" />
          </el-select>
          <el-date-picker
            v-model="form.dateRange.range"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 340px"
            value-format="YYYY-MM-DD"
          />
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClear">清空</el-button>
      <el-button type="primary" @click="handleApply">应用</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import {
  ElDialog,
  ElForm,
  ElFormItem,
  ElButton,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElTag,
} from 'element-plus'
import type { DateModelType } from 'element-plus'
import type { FilterOptions } from '../types/common'
import type { TodoPriority, TodoStatus } from '../types/todo'
import { useTagStore } from '../stores/tag'
import { useTodoStore } from '../stores/todo'
import tinycolor from 'tinycolor2'

interface Props {
  visible: boolean
  filters: FilterOptions
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'apply', filters: FilterOptions): void
  (e: 'clear'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const tagStore = useTagStore()
const todoStore = useTodoStore()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

interface FormState {
  priority: TodoPriority[]
  status: TodoStatus[]
  tags: string[]
  dateRange: {
    type: 'created' | 'updated' | 'completed'
    range: [DateModelType, DateModelType] | undefined
  }
}

const form = reactive<FormState>({
  priority: [],
  status: [],
  tags: [],
  dateRange: {
    type: 'created',
    range: undefined,
  },
})

// 监听 filters 变化，更新表单
watch(
  () => props.filters,
  (filters) => {
    form.priority = filters.priority || []
    form.status = filters.status || []
    form.tags = filters.tags || []
    if (filters.dateRange) {
      form.dateRange.type = filters.dateRange.type
      form.dateRange.range =
        filters.dateRange.start && filters.dateRange.end
          ? [filters.dateRange.start, filters.dateRange.end]
          : undefined
    } else {
      form.dateRange.range = undefined
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

const getTagCount = (tagId: string) => {
  return todoStore.todos.filter((todo) => todo.tags.includes(tagId)).length
}

const handleClear = () => {
  form.priority = []
  form.status = []
  form.tags = []
  form.dateRange.range = undefined
  emit('clear')
}

const handleApply = () => {
  const filters: FilterOptions = {
    priority: form.priority.length > 0 ? form.priority : undefined,
    status: form.status.length > 0 ? form.status : undefined,
    tags: form.tags.length > 0 ? form.tags : undefined,
  }

  if (form.dateRange.range) {
    filters.dateRange = {
      type: form.dateRange.type,
      start: new Date(form.dateRange.range[0]),
      end: new Date(form.dateRange.range[1]),
    }
  }

  emit('apply', filters)
  dialogVisible.value = false
}
</script>

<style scoped>
.date-range-filter {
  display: flex;
  gap: 12px;
  align-items: center;
}

.tag-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 8px;
}

.tag-count-wrapper {
  display: flex;
  align-items: center;
  min-width: 80px;
  justify-content: flex-end;
  margin-left: 12px;
}

.tag-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 添加 icon + 文字按钮的间距 */
:deep(.el-button .el-icon) {
  margin-right: 6px;
}

:deep(.el-button.is-text .el-icon) {
  margin-right: 4px;
}
</style>
