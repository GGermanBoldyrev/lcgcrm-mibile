import axios, { type AxiosInstance } from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

function requireEnv(name: keyof ImportMetaEnv): string {
  const v = import.meta.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

function createApi(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' }
  })

  instance.interceptors.request.use((config) => {
    const auth = useAuthStore()
    if (auth.token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${auth.token}`
    }
    return config
  })

  // глобальная обработка 401
  instance.interceptors.response.use(
    r => r,
    err => {
      if (err.response?.status === 401) {
        const auth = useAuthStore()
        auth.clearAuth()
        if (router.currentRoute.value.name !== 'login') router.replace({ name: 'login' })
      }
      return Promise.reject(err)
    }
  )

  return instance
}

export const api = createApi(requireEnv('VITE_API_URL'))
