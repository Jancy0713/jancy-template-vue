import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import IndexView from '../views/IndexView.vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

// 定义路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: IndexView,
    meta: {
      requiresAuth: false, // 首页不需要登录
    },
  },
  {
    path: '/todolist',
    name: 'todolist',
    component: () => import('../features/todolist/views/TodoView.vue'),
    meta: {
      requiresAuth: true, // 需要登录
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth ?? true // 默认需要登录

  // 如果页面需要登录且用户未登录
  if (requiresAuth && !authStore.token) {
    // 如果不是从首页来的，显示提示信息
    if (from.name !== 'home') {
      ElMessage.warning('请先登录')
    }
    // 重定向到首页
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
