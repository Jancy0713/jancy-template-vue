<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/features/theme/stores/theme'
import { useAuthStore } from '@/stores/auth'
import { ElDropdown } from 'element-plus'
import logo from '@/assets/logo.svg'
import AuthDialog from './auth/AuthDialog.vue'

const { t, locale } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()

const showLoginDialog = ref(false)
const isLoginMode = ref(true)
const isLoggedIn = computed(() => !!authStore.token)

const goHome = () => {
  router.push('/')
}

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const toggleLocale = () => {
  locale.value = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
}

const showLogin = () => {
  isLoginMode.value = true
  showLoginDialog.value = true
}

const showRegister = () => {
  isLoginMode.value = false
  showLoginDialog.value = true
}

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      // TODO: 实现个人资料功能
      break
    case 'language':
      toggleLocale()
      break
    case 'logout':
      authStore.logout()
      break
  }
}
</script>

<template>
  <header class="app-header">
    <div class="left" role="button" @click="goHome">
      <img :src="logo" alt="Logo" class="logo" />
      <h1 class="title">{{ t('app.title') }}</h1>
    </div>

    <div class="right">
      <slot></slot>

      <el-button :icon="themeStore.isDark ? 'Sunny' : 'Moon'" circle @click="toggleTheme" />

      <template v-if="!isLoggedIn">
        <el-button circle @click="toggleLocale">
          {{ locale === 'zh-CN' ? 'EN' : '中' }}
        </el-button>
        <el-button class="w-20" @click="showLogin">{{ t('auth.login.title') }}</el-button>
        <el-button class="w-20" type="primary" @click="showRegister">{{
          t('auth.register.title')
        }}</el-button>
      </template>

      <template v-else>
        <el-dropdown trigger="click" @command="handleCommand">
          <el-avatar :size="32" :src="authStore.userInfo?.avatar">
            {{ authStore.userInfo?.name?.charAt(0) }}
          </el-avatar>

          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                {{ t('user.profile') }}
              </el-dropdown-item>
              <el-dropdown-item command="language">
                {{ t('common.switchLanguage') }}
              </el-dropdown-item>
              <el-dropdown-item command="logout">
                {{ t('auth.logout') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </div>

    <auth-dialog v-model="showLoginDialog" :is-login-mode="isLoginMode" />
  </header>
</template>

<style scoped lang="scss">
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);

  .left {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    user-select: none;

    &:hover {
      opacity: 0.8;
    }

    .logo {
      height: 32px;
      width: 32px;
    }

    .title {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0;
    }
  }

  .right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
</style>
