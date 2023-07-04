import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/components/Index.vue')
  },
  {
    path: '/replay',
    component: () => import('@/components/Replay.vue')
  },
  {
    path: '/login',
    component: () => import('@/components/Login.vue')
  },
  {
    path: '/test',
    component: () => import('@/components/Test.vue')
  }
]
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router