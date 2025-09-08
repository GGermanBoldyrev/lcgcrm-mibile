import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'main',
    component: () => import('@/pages/MainPage.vue')
  },
  {
    path: '/hub',
    redirect: '/hub/search'
  },
  {
    path: '/hub/search',
    name: 'HubSearch',
    component: () => import('@/pages/hub/SearchPage.vue')
  },
  {
    path: '/hub/document/:documentId',
    name: 'HubDocument',
    component: () => import('@/pages/hub/DocumentPage.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/pages/ProfilePage.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { layout: 'auth' } // public route
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFoundPage.vue')
  }
]

const routesWithAuth = routes.map(route => {
  if (route.name !== 'login') {
    return {
      ...route,
      meta: { ...(route.meta || {}), requiresAuth: true }
    }
  }
  return route
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routesWithAuth
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  //auth.clearAuth()

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
