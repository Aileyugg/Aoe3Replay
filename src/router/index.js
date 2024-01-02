import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('@/views/index/index.vue')
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
    component: () => import('@/views/test/index.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router