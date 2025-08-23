<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import { useDisplay } from 'vuetify'
import BaseOutlinedTextField from '@/components/base/BaseOutlinedTextField.vue' // для брейкпоинтов

const login = ref('')
const password = ref('')
const visiblePassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const canSubmit = computed(
  () => login.value.trim() !== '' && password.value.trim() !== '' && !loading.value
)

const onLogin = async () => {
  if (!canSubmit.value) return
  errorMessage.value = ''
  loading.value = true
  try {
    const { data } = await axios.post('https://dev3.lc-rus.org/api/v1/mobile/login', {
      login: login.value,
      password: password.value
    })

    if (data?.token) {
      localStorage.setItem('auth_token', data.token)
      // TODO: роут на дашборд
    } else {
      throw new Error('Токен не получен')
    }
  } catch (error: any) {
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
      <v-container class="fill-height d-flex align-center justify-center py-8">
        <v-card v-show="true" width="300" class="rounded-lg py-6 px-7 fade-in" elevation="8">
          <v-card-text class="pa-0">
            <!-- Лого -->
            <div class="d-flex justify-center mb-5">
              <v-img src="/src/assets/images/ui/lcg-logo.png" class="my-5" />
            </div>

            <!-- Форма -->
            <v-form @submit.prevent="onLogin">
              <BaseOutlinedTextField
                v-model="login"
                label="Логин"
                class="mb-5"
                autofocus
                :prepend-inner-icon="'mdi-account'"
              />

              <BaseOutlinedTextField
                v-model="password"
                label="Пароль"
                class="mb-5"
                :type="visiblePassword ? 'text' : 'password'"
                :append-inner-icon="visiblePassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="visiblePassword = !visiblePassword"
              />

              <!-- Ошибка -->
              <v-alert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                density="compact"
                class="mb-5"
              >
                {{ errorMessage }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                :disabled="!canSubmit"
              >
                Войти
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.bg-auth {
  min-height: 100vh;
  background: url('/src/assets/images/ui/main-background.svg') no-repeat center center;
  background-size: cover;
}

.fade-in {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
