<script setup lang="ts">
import { ElContainer, ElHeader, ElMain, ElCard, ElIcon, ElTag } from 'element-plus'
import { House, Calendar, DocumentAdd } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'

const router = useRouter()

const techStack = [
  { name: 'Vue 3', type: 'primary' },
  { name: 'TypeScript', type: 'success' },
  { name: 'Element Plus', type: 'warning' },
  { name: 'Pinia', type: 'danger' },
  { name: 'Vue Router', type: 'info' },
  { name: 'Vite', type: undefined },
] as const

const goToTodoList = () => {
  router.push('/todolist')
}
</script>

<template>
  <div class="index-view">
    <app-header />
    <div class="content">
      <el-container>
        <el-header class="index-header">
          <div class="index-header__content">
            <h1 class="index-header__title">
              <el-icon :size="32" color="#409EFF">
                <House />
              </el-icon>
              Jancy Template Vue
            </h1>
            <p class="index-header__subtitle">基于 Vue 3 + TypeScript + Element Plus 的项目模板</p>
          </div>
        </el-header>

        <el-main class="index-main">
          <div class="feature-grid">
            <el-card class="feature-card" shadow="hover" @click="goToTodoList">
              <div class="feature-card__content">
                <div class="feature-card__icon">
                  <el-icon :size="48" color="#409EFF">
                    <Calendar />
                  </el-icon>
                </div>
                <h3 class="feature-card__title">TODO List</h3>
                <p class="feature-card__description">
                  功能完整的待办事项管理系统，支持任务分类、优先级、标签管理、筛选排序等功能
                </p>
                <ul class="feature-card__features">
                  <li>✅ 任务增删改查</li>
                  <li>✅ 优先级和状态管理</li>
                  <li>✅ 标签分类</li>
                  <li>✅ 搜索和筛选</li>
                  <li>✅ 本地存储</li>
                </ul>
              </div>
            </el-card>

            <el-card class="feature-card feature-card--disabled" shadow="hover">
              <div class="feature-card__content">
                <div class="feature-card__icon">
                  <el-icon :size="48" color="#909399">
                    <DocumentAdd />
                  </el-icon>
                </div>
                <h3 class="feature-card__title">更多功能</h3>
                <p class="feature-card__description">更多功能模块正在开发中...</p>
                <el-tag type="info" size="small">敬请期待</el-tag>
              </div>
            </el-card>
          </div>

          <div class="tech-stack">
            <h2 class="tech-stack__title">技术栈</h2>
            <div class="tech-stack__items">
              <el-tag
                v-for="tech in techStack"
                :key="tech.name"
                :type="tech.type"
                effect="plain"
                size="large"
              >
                {{ tech.name }}
              </el-tag>
            </div>
          </div>
        </el-main>
      </el-container>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.index-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  @apply dark:bg-gray-900;

  .content {
    flex: 1;
    padding: 24px;
  }

  .index-header {
    background: transparent;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 60px 24px 40px;
  }

  .index-header__content {
    text-align: center;
  }

  .index-header__title {
    font-size: 36px;
    font-weight: 600;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    @apply dark:text-gray-200;
  }

  .index-header__subtitle {
    font-size: 18px;
    color: var(--el-text-color-secondary);
    @apply dark:text-gray-400;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 48px;
  }

  .feature-card {
    cursor: pointer;
    transition: transform 0.2s;
    background-color: var(--el-bg-color);
    @apply dark:bg-gray-800;

    &:hover {
      transform: translateY(-4px);
    }

    &--disabled {
      cursor: not-allowed;
      opacity: 0.7;

      &:hover {
        transform: none;
      }
    }
  }

  .feature-card__content {
    text-align: center;
    padding: 24px;
  }

  .feature-card__icon {
    margin-bottom: 16px;
  }

  .feature-card__title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 12px;
    @apply dark:text-gray-200;
  }

  .feature-card__description {
    color: var(--el-text-color-secondary);
    margin-bottom: 24px;
    @apply dark:text-gray-400;
  }

  .feature-card__features {
    text-align: left;
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: 8px;
      color: var(--el-text-color-regular);
      @apply dark:text-gray-300;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .tech-stack {
    text-align: center;
  }

  .tech-stack__title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 24px;
    @apply dark:text-gray-200;
  }

  .tech-stack__items {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
  }
}
</style>
