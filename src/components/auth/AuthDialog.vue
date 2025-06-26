<template>
  <el-dialog
    :title="t(`auth.${isLogin ? 'login' : 'register'}.title`)"
    v-model="visible"
    width="400px"
    :close-on-click-modal="false"
    class="auth-dialog"
    destroy-on-close
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="formRules"
      label-position="top"
      @keyup.enter="handleSubmit"
    >
      <el-form-item :label="t('auth.email')" prop="email">
        <el-input
          v-model="form.email"
          type="email"
          :placeholder="t('auth.emailPlaceholder')"
          prefix-icon="Message"
        />
      </el-form-item>
      <el-form-item :label="t('auth.password')" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          :placeholder="t('auth.passwordPlaceholder')"
          prefix-icon="Lock"
          show-password
        />
      </el-form-item>
      <template v-if="!isLogin">
        <el-form-item :label="t('auth.confirmPassword')" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            :placeholder="t('auth.confirmPasswordPlaceholder')"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
      </template>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <div class="switch-mode">
          <el-link type="primary" @click="switchMode">
            {{ t(`auth.${!isLogin ? 'register' : 'login'}.switch`) }}
          </el-link>
        </div>
        <div class="buttons">
          <el-button @click="handleClose">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            {{ t(`auth.${isLogin ? 'login' : 'register'}.submit`) }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()

const props = defineProps<{
  modelValue: boolean
  isLoginMode: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const visible = ref(props.modelValue)
const isLogin = ref(props.isLoginMode)
const loading = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
})

// 邮箱验证正则
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// 表单校验规则
const formRules = computed<FormRules>(() => ({
  email: [
    { required: true, message: t('auth.validation.emailRequired'), trigger: 'blur' },
    {
      pattern: emailPattern,
      message: t('auth.validation.emailInvalid'),
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: t('auth.validation.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('auth.validation.passwordLength'), trigger: 'blur' },
  ],
  confirmPassword: [
    {
      required: !isLogin.value,
      message: t('auth.validation.confirmPasswordRequired'),
      trigger: 'blur',
    },
    {
      validator: (rule, value, callback) => {
        if (!isLogin.value && value !== form.password) {
          callback(new Error(t('auth.validation.passwordMismatch')))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}))

// 监听 isLoginMode 变化
watch(
  () => props.isLoginMode,
  (val) => {
    isLogin.value = val
    if (formRef.value) {
      formRef.value.resetFields()
    }
  },
)

// 监听visible变化
watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
  },
)

// 切换登录/注册模式
const switchMode = () => {
  isLogin.value = !isLogin.value
  formRef.value?.resetFields()
}

// 关闭对话框
const handleClose = async () => {
  visible.value = false
  emit('update:modelValue', false)
  await nextTick()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    if (isLogin.value) {
      // 登录
      await authStore.login({
        email: form.email,
        password: form.password,
      })
      emit('success')
      await handleClose()
    } else {
      // 注册
      await authStore.register({
        email: form.email,
        password: form.password,
        confirm_password: form.password,
      })
      emit('success')
      await handleClose()
    }
  } catch (error: any) {
    console.error('Form submission error:', error)
    throw error
  } finally {
    loading.value = false
  }
}

// 对话框完全关闭后的回调
const handleClosed = () => {
  formRef.value?.resetFields()
}
</script>

<style lang="scss" scoped>
.auth-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 30px;
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

// 暗黑模式适配
:deep(.el-dialog) {
  @apply dark:bg-gray-800;

  .el-dialog__title {
    @apply dark:text-gray-200;
  }

  .el-form-item__label {
    @apply dark:text-gray-300;
  }

  .el-input__wrapper {
    @apply dark:bg-gray-700 dark:text-gray-200;
  }

  .el-input__inner {
    @apply dark:text-gray-200;
  }
}
</style>
