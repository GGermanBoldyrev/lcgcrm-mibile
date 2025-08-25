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
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center py-8">
    <v-card v-show="true" width="310" class="glossy rounded-base-lg pa-9" elevation="8">
      <v-card-text class="pa-0">
        <!-- Лого -->
        <div class="d-flex justify-center mb-5">
          <v-img src="/src/assets/images/ui/lcg-logo.png" class="my-5" />
        </div>

        <!-- Форма -->
        <v-form autocomplete="on" @submit.prevent="onLogin">
          <BaseOutlinedTextField v-model="login" placeholder="Логин" class="mb-5" autocomplete="username"
            name="username" autofocus :prepend-inner-icon="'mdi-account'" :error-messages="errors.login" />

          <BaseOutlinedTextField v-model="password" placeholder="Пароль" class="mb-5" name="current-password"
            autocomplete="current-password" :type="visiblePassword ? 'text' : 'password'"
            :append-inner-icon="visiblePassword ? 'mdi-eye-off' : 'mdi-eye'" :error-messages="errors.password"
            @click:append-inner="visiblePassword = !visiblePassword" />

          <!-- Ошибка -->
          <v-alert v-if="errors.general" type="error" variant="tonal" density="compact" class="mb-5">
            {{ errors.general }}
          </v-alert>

          <v-btn type="submit" color="primary" size="large" block class="glossy rounded-base-md" :loading="loading"
            :disabled="!canSubmit">
            Войти
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped></style>
