import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'tast',
      component: () => import('../views/SetTest.vue'),
    },
    {
      path: '/scene',
      name: 'scene',
      component: () => import('../views/Main.vue'),
    },
    {
      path: '/over',
      name: 'over',
      component: () => import('../views/Complete.vue'),
    },
  ],
})

export default router
