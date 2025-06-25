<script setup lang="ts">
import { ElContainer, ElHeader, ElMain, ElCard, ElIcon, ElTag } from 'element-plus'
import { House, Calendar, DocumentAdd } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

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
</template>

<style scoped>
.index-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  color: white;
}

.index-header__title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin: 0 0 16px 0;
  font-size: 36px;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.index-header__subtitle {
  font-size: 18px;
  margin: 0;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.index-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 60px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 60px;
}

.feature-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 16px;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.feature-card--disabled {
  cursor: default;
  opacity: 0.7;
}

.feature-card--disabled:hover {
  transform: none;
  box-shadow: var(--el-card-shadow);
}

.feature-card__content {
  text-align: center;
  padding: 20px;
}

.feature-card__icon {
  margin-bottom: 20px;
}

.feature-card__title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--el-text-color-primary);
}

.feature-card__description {
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin: 0 0 20px 0;
}

.feature-card__features {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.feature-card__features li {
  padding: 4px 0;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.tech-stack {
  text-align: center;
  background: white;
  border-radius: 16px;
  padding: 40px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.tech-stack__title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 32px 0;
  color: var(--el-text-color-primary);
}

.tech-stack__items {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .index-header {
    padding: 40px 16px 20px;
  }

  .index-header__title {
    font-size: 28px;
    flex-direction: column;
    gap: 8px;
  }

  .index-header__subtitle {
    font-size: 16px;
  }

  .index-main {
    padding: 0 16px 40px;
  }

  .feature-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 40px;
  }

  .tech-stack {
    padding: 24px 16px;
  }

  .tech-stack__title {
    font-size: 24px;
    margin-bottom: 24px;
  }

  .tech-stack__items {
    gap: 12px;
  }
}

/* 深色模式适配 */
.dark .tech-stack {
  background: var(--el-bg-color);
}
</style>
