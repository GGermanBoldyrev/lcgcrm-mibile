import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/Pages/LoginPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "login",
      component: LoginPage, // стартовая страница
    },
  ],
})

export default router
