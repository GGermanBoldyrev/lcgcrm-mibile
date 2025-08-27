import { ref, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/shared/api.ts'

export type AuthErrorKeys = 'general' | 'login' | 'password'

export interface LoginFormState {
  login: string
  password: string
  visiblePassword: boolean
  loading: boolean
  errors: Record<AuthErrorKeys, string>
}

export interface User {
  login: string
  fullName: string
  email: string
  department: string
  position: string
  phone: string
}

export interface LoginResponse {
  success: boolean
  token: string
  user: User
}

export function useLoginForm() {
  const router = useRouter()
  const route = useRoute()
  const { setAuth } = useAuthStore()

  const state = ref<LoginFormState>({
    login: '',
    password: '',
    visiblePassword: false,
    loading: false,
    errors: { general: '', login: '', password: '' }
  })

  const canSubmit = computed(() =>
    !!state.value.login.trim() &&
    !!state.value.password.trim() &&
    !state.value.loading
  )

  const clearErrors = () => {
    state.value.errors.general = ''
    state.value.errors.login = ''
    state.value.errors.password = ''
  }

  const loginFieldRef = ref()
  const focusLogin = () =>
    nextTick(() => {
      loginFieldRef.value?.$el?.querySelector('input')?.focus()
    })

  const handleApiError = (err: any) => {
    const resp = err.response
    const baseError = 'Ошибка авторизации'

    if (resp?.status === 401 && resp.data?.error) {
      const { error, message } = resp.data
      if (['user_not_found', 'user_cold'].includes(error)) {
        state.value.errors.login = message || baseError
        focusLogin()
      } else if (error === 'invalid_password') {
        state.value.errors.password = message || baseError
      } else {
        state.value.errors.general = baseError
      }
    } else {
      state.value.errors.general = baseError
    }
  }

  const onLogin = async () => {
    if (!canSubmit.value) return

    clearErrors()
    state.value.loading = true

    try {
      const { data } = await api.post<LoginResponse>('/mobile/login', {
        login: state.value.login.trim(),
        password: state.value.password.trim()
      })

      if (data?.success && data?.token && data?.user) {
        setAuth(data.token, data.user)
        const to = (route.query.redirect as string) || { name: 'main' }
        await router.replace(to)
      } else {
        throw new Error('Некорректный ответ авторизации')
      }
    } catch (err: any) {
      handleApiError(err)
    } finally {
      state.value.loading = false
    }
  }

  // Тестовый логин
  const loginWithMockData = () => {
    setAuth('mock-token-123', {
      login: 'testuser',
      fullName: 'Иванов Иван Иванович',
      email: 'ivanov.ii@company.com',
      department: 'Отдел разработки',
      position: 'Старший разработчик',
      phone: '+7 (999) 123-45-67'
    })
    router.replace({ name: 'main' })
  }

  return {
    state,
    canSubmit,
    loginFieldRef,
    onLogin,
    loginWithMockData,
    focusLogin
  }
}
