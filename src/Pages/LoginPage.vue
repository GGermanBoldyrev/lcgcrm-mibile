<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import { useDisplay } from 'vuetify' // для брейкпоинтов

const login = ref('')
const password = ref('')
const visiblePassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const { xs, sm, mdAndUp } = useDisplay()

const cardWidth = computed(() => {
  if (mdAndUp.value) return 330
  if (sm.value) return 320
  return 280
})

const fieldDensity = computed(() => (xs.value ? 'compact' : 'comfortable'))

const canSubmit = computed(
  () => login.value.trim() !== '' && password.value.trim() !== '' && !loading.value,
)

const onLogin = async () => {
  if (!canSubmit.value) return
  errorMessage.value = ''
  loading.value = true
  try {
    const { data } = await axios.post('https://dev3.lc-rus.org/api/v1/mobile/login', {
      login: login.value,
      password: password.value,
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
        <v-card :width="cardWidth" class="rounded-lg py-6 px-7" elevation="8">
          <v-card-text class="pa-0">
            <!-- Лого -->
            <div class="d-flex justify-center mb-5">
              <v-img src="/src/assets/images/ui/lcg-logo.png" class="my-4" />
            </div>

            <!-- Форма -->
            <v-form @submit.prevent="onLogin">
              <v-text-field
                v-model="login"
                label="Логин"
                variant="solo"
                :density="fieldDensity"
                hide-details="auto"
                class="mb-4"
                autofocus
              />

              <v-text-field
                v-model="password"
                :type="visiblePassword ? 'text' : 'password'"
                label="Пароль"
                variant="solo"
                :density="fieldDensity"
                hide-details="auto"
                :append-inner-icon="visiblePassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="visiblePassword = !visiblePassword"
                class="mb-4"
              />

              <!-- Ошибка -->
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
</style>
