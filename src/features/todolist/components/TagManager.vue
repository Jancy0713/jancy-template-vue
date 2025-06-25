<template>
  <el-dialog v-model="dialogVisible" title="标签管理" width="600px" @closed="resetForm">
    <div class="tag-manager">
      <!-- 添加新标签表单 -->
      <div class="tag-form">
        <h4>添加新标签</h4>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="标签名称" prop="name">
            <el-input
              v-model="form.name"
              placeholder="请输入标签名称"
              maxlength="20"
              show-word-limit
              @keyup.enter="handleSubmit"
            />
          </el-form-item>
          <el-form-item label="标签颜色" prop="color">
            <div class="color-selector">
              <div class="preset-colors">
                <div
                  v-for="color in presetColors"
                  :key="color"
                  class="color-item"
                  :class="{ active: form.color === color }"
                  :style="{ backgroundColor: color }"
                  @click="form.color = color"
                />
              </div>
              <el-color-picker v-model="form.color" />
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSubmit" :loading="submitting">
              {{ editingTag ? '更新' : '添加' }}
            </el-button>
            <el-button v-if="editingTag" @click="resetForm">取消编辑</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 标签列表 -->
      <div class="tag-list">
        <h4>已有标签</h4>
        <div v-if="tags.length === 0" class="empty-state">
          <el-empty description="暂无标签" :image-size="80" />
        </div>
        <div v-else class="tag-items">
          <div v-for="tag in tags" :key="tag.id" class="tag-item">
            <div class="tag-info">
              <el-tag :color="tag.color" :style="{ color: getTextColor(tag.color) }" size="large">
                {{ tag.name }}
              </el-tag>
              <span class="tag-count">{{ getTagUsageCount(tag.id) }} 个任务</span>
            </div>
            <div class="tag-actions">
              <el-button type="text" size="small" @click="handleEdit(tag)"> 编辑 </el-button>
              <el-button
                type="text"
                size="small"
                @click="handleDelete(tag)"
                :disabled="getTagUsageCount(tag.id) > 0"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import {
  ElDialog,
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElColorPicker,
  ElTag,
  ElEmpty,
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from 'element-plus'
import tinycolor from 'tinycolor2'

import { useTagStore } from '../stores/tag'
import { useTodoStore } from '../stores/todo'
import type { Tag, CreateTagData } from '../types/tag'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const tagStore = useTagStore()
const todoStore = useTodoStore()

// 表单相关
const formRef = ref<FormInstance>()
const editingTag = ref<Tag | null>(null)
const submitting = ref(false)

const form = reactive({
  name: '',
  color: '#409EFF',
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 20, message: '标签名称长度为 1-20 个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const existingTag = tags.value.find(
          (tag) => tag.name === value && tag.id !== editingTag.value?.id,
        )
        if (existingTag) {
          callback(new Error('标签名称已存在'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  color: [{ required: true, message: '请选择标签颜色', trigger: 'change' }],
}

// 预设颜色
const presetColors = [
  'rgb(64, 158, 255)', // 蓝色
  'rgb(103, 194, 58)', // 绿色
  'rgb(230, 162, 60)', // 橙色
  'rgb(245, 108, 108)', // 红色
  'rgb(144, 147, 153)', // 灰色
  'rgb(19, 206, 102)', // 青绿
  'rgb(255, 140, 0)', // 深橙
  'rgb(255, 105, 180)', // 粉红
  'rgb(147, 112, 219)', // 紫色
  'rgb(50, 205, 50)', // 亮绿
  'rgb(255, 215, 0)', // 金色
  'rgb(255, 99, 71)', // 珊瑚红
]

// 计算属性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const tags = computed(() => tagStore.tags)
const todos = computed(() => todoStore.todos)

// 方法
const resetForm = () => {
  form.name = ''
  form.color = '#409EFF'
  editingTag.value = null
  formRef.value?.clearValidate()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const tagData: CreateTagData = {
      name: form.name.trim(),
      color: form.color,
    }

    if (editingTag.value) {
      // 编辑模式
      tagStore.updateTag(editingTag.value.id, tagData)
      ElMessage.success('标签更新成功')
    } else {
      // 新增模式
      tagStore.addTag(tagData)
      ElMessage.success('标签创建成功')
    }

    resetForm()
  } catch (error) {
    console.error('Submit error:', error)
  } finally {
    submitting.value = false
  }
}

const handleEdit = (tag: Tag) => {
  editingTag.value = tag
  form.name = tag.name
  form.color = tag.color
}

const handleDelete = async (tag: Tag) => {
  try {
    await ElMessageBox.confirm(`确定要删除标签"${tag.name}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    if (tagStore.deleteTag(tag.id)) {
      ElMessage.success('标签删除成功')
    }
  } catch {
    // 用户取消删除
  }
}

const getTagUsageCount = (tagId: string): number => {
  return todos.value.filter((todo) => todo.tags.includes(tagId)).length
}

const getTextColor = (backgroundColor: string): string => {
  return tinycolor(backgroundColor).isDark() ? '#FFFFFF' : '#000000'
}
</script>

<style scoped>
.tag-manager {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-height: 500px;
}

.tag-form {
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.tag-form h4 {
  margin: 0 0 16px 0;
  color: var(--el-text-color-primary);
}

.color-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preset-colors {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-item {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.color-item:hover {
  transform: scale(1.1);
}

.color-item.active {
  border-color: var(--el-color-primary);
  transform: scale(1.1);
}

.tag-list {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tag-list h4 {
  margin: 0 0 16px 0;
  color: var(--el-text-color-primary);
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
}

.tag-items {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 250px;
}

.tag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: white;
  transition: all 0.2s;
}

.tag-item:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tag-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tag-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.tag-actions {
  display: flex;
  gap: 8px;
}
</style>
