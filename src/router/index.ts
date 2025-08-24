import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: () => import('@/pages/MainPage.vue'),
      meta: { requiresAuth: true }
    },

    { // Страница авторизации
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue')
    },

    { // 404 page
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/pages/NotFoundPage.vue')
    }
  ]
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  // первый заход — пробуем восстановить сессии
  if (auth.token === null) auth.restoreFromStorage()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'main' }
  }
})

export default router
