<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseOutlinedTextField from '@/components/base/BaseOutlinedTextField.vue'
import { api } from '@/shared/api.ts' // для брейкпоинтов
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const login = ref('')
const password = ref('')
const visiblePassword = ref<boolean>(false)
const loading = ref<boolean>(false)

const errors = ref({
  general: '',
  login: '',
  password: ''
})

const canSubmit = computed(
  () => login.value.trim() !== '' && password.value.trim() !== '' && !loading.value
)

// Функция для очистки всех ошибок
const clearErrors = () => {
  errors.value = { general: '', login: '', password: '' }
}

// Функция для обработки ошибок API
const handleApiError = (err: any) => {
  const baseErrorMessage = 'Ошибка авторизации'

  if (err.response?.status === 401) {
    const { error, message } = err.response.data

    const errorMap: Record<string, string> = {
      'user_not_found': 'login',
      'user_cold': 'login',
      'invalid_password': 'password'
    }

    const errorField = errorMap[error]
    if (errorField) {
      errors.value[errorField as keyof typeof errors.value] = message
    } else {
      errors.value.general = baseErrorMessage
    }
  } else {
    errors.value.general = baseErrorMessage
  }
}

const onLogin = async () => {
  if (!canSubmit.value) return

  clearErrors()
  loading.value = true

  try {
    const { data } = await api.post('/mobile/login', {
      login: login.value,
      password: password.value
    })

    if (data?.success && data?.token && data?.user) {
      auth.setAuth(data.token, data.user)
      const to = (route.query.redirect as string) || { name: 'main' }
      await router.replace(to)
    } else {
      throw new Error('Некорректный ответ авторизации')
    }

  } catch (err: any) {
    handleApiError(err)
  } finally {
    loading.value = false
  }
}

// Функция для тестирования с моковыми данными
const loginWithMockData = () => {
  const mockUser = {
    login: 'testuser',
    fullName: 'Иванов Иван Иванович',
    email: 'ivanov.ii@company.com',
    department: 'Отдел разработки',
    position: 'Старший разработчик',
    phone: '+7 (999) 123-45-67'
  }

  auth.setAuth('mock-token-123', mockUser)
  router.replace({ name: 'main' })
}
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center py-8">
    <v-card v-show="true" width="310" class="glossy pa-9" elevation="8" style="border-radius: var(--radius-lg);">
      <v-card-text class="pa-0">
        <!-- Лого -->
        <div class="d-flex justify-center mb-5">
          <v-img src="/src/assets/images/ui/lcg-logo.png" class="my-5" v-motion :initial="{
            opacity: 0,
            scale: 0.8,
            y: -20
          }" :enter="{
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              type: 'spring',
              stiffness: 150,
              damping: 15,
              duration: 1200
            }
          }" />
        </div>

        <!-- Форма -->
        <v-form autocomplete="on" @submit.prevent="onLogin">
          <BaseOutlinedTextField v-model="login" placeholder="Логин" class="mb-5" autocomplete="username"
            name="username" autofocus :prepend-inner-icon="'mdi-account'" :error-messages="errors.login" v-motion
            :initial="{
              opacity: 0
            }" :enter="{
              opacity: 1,
              transition: {
                duration: 600,
                delay: 200
              }
            }" />

          <BaseOutlinedTextField v-model="password" placeholder="Пароль" class="mb-5" name="current-password"
            autocomplete="current-password" :type="visiblePassword ? 'text' : 'password'"
            :append-inner-icon="visiblePassword ? 'mdi-eye-off' : 'mdi-eye'" :error-messages="errors.password"
            @click:append-inner="visiblePassword = !visiblePassword" v-motion :initial="{
              opacity: 0
            }" :enter="{
              opacity: 1,
              transition: {
                duration: 600,
                delay: 300
              }
            }" />

          <!-- Ошибка -->
          <v-alert v-if="errors.general" type="error" variant="tonal" density="compact" class="mb-5 glossy rounded-base-md" v-motion
            :initial="{
              opacity: 0,
              scale: 0.9
            }" :enter="{
              opacity: 1,
              scale: 1,
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 20,
                duration: 400
              }
            }">
            {{ errors.general }}
          </v-alert>

          <v-btn type="submit" color="primary" size="large" block class="glossy" :loading="loading"
            :disabled="!canSubmit" style="border-radius: var(--radius-md);" v-motion :initial="{
              opacity: 0
            }" :enter="{
              opacity: 1,
              transition: {
                duration: 400
              }
            }">
            Войти
          </v-btn>

          <!-- Кнопка для тестирования с моковыми данными -->
          <v-divider class="my-4" />
          <v-btn variant="outlined" color="secondary" size="large" block class="glossy" @click="loginWithMockData"
            style="border-radius: var(--radius-md);" v-motion :initial="{
              opacity: 0
            }" :enter="{
              opacity: 1,
              transition: {
                duration: 400
              }
            }">
            Войти (тест)
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped></style>
