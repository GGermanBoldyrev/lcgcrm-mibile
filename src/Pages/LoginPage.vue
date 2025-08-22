<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const login = ref('')
const password = ref('')
const visiblePassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const onLogin = async () => {
  errorMessage.value = ''
  loading.value = true
  try {
    const { data } = await axios.post('https://dev3.lc-rus.org/api/v1/mobile/login', {
      login: login.value,
      password: password.value,
    })

    console.log('Ответ API:', data)

    if (data.tokens) {
      localStorage.setItem('auth_token', data.token)
    }
  } catch (error) {
    console.log(error)
    errorMessage.value = 'Ошибка авторизации'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-app>
    <v-main class="bg-auth">
      <v-container class="fill-height d-flex align-center justify-center">
        <v-card width="320" class="pa-4" elevation="6">
          <!-- Картинка сверху -->
          <v-card-title class="mb-4 mt-4">
            <v-img src="/src/assets/images/ui/lcg-logo.png" />
          </v-card-title>

          <!-- Форма авторизации -->
          <v-card-text>
            <v-text-field
              variant="solo"
              color="primary"
              density="comfortable"
              v-model="login"
              label="Логин"
              type="text"
            />
            <v-text-field
              :append-inner-icon="visiblePassword ? 'mdi-eye-off' : 'mdi-eye'"
              :type="visiblePassword ? 'text' : 'password'"
              variant="solo"
              color="primary"
              density="comfortable"
              v-model="password"
              label="Пароль"
              @click:append-inner="visiblePassword = !visiblePassword"
            />

            <!-- Сообщение об ошибке -->
            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-4"
            >
              {{ errorMessage }}
            </v-alert>

            <v-btn
              color="primary"
              size="large"
              block
              :loading="loading"
              :disabled="loading"
              @click="onLogin"
              >Войти</v-btn
            >
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.bg-auth {
  background: url('/src/assets/images/ui/main-background.svg') no-repeat center center;
  background-size: cover;
}
</style>
