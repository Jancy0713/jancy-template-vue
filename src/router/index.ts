import { createRouter, createWebHistory } from 'vue-router'
import IndexView from '../views/IndexView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: IndexView,
    },
    {
      path: '/todolist',
      name: 'todolist',
      component: () => import('../features/todolist/views/TodoView.vue'),
    },
  ],
})

export default router
