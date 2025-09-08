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
    name: 'hub',
    component: () => import('@/pages/HubPage.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/pages/SearchPage.vue')
  },
  {
    path: '/document/:documentId',
    name: 'Document',
    component: () => import('@/pages/DocumentPage.vue')
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
