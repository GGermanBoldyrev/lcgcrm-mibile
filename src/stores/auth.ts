import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as {
      id?: number | string
      login?: string
      fullName?: string
      email?: string
      subdivisionName?: string
      additionalInfo?: string
      phone?: string
    } | null
  }),
  getters: {
    isAuthenticated: s => !!s.token,
    userFullName: s => s.user?.fullName || 'Пользователь'
  },
  actions: {
    setAuth(token: string, user: any) {
      this.token = token
      this.user = user
      localStorage.setItem('auth_state', JSON.stringify({ token, user }))
    },
    clearAuth() {
      this.token = null
      this.user = null
      localStorage.removeItem('auth_state')
    },
    restoreFromStorage() {
      const raw = localStorage.getItem('auth_state')
      if (!raw) return
      try {
        const p = JSON.parse(raw)
        this.token = p.token ?? null
        this.user = p.user ?? null
      } catch {
      }
    }
  }
})
