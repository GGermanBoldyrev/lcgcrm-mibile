<script setup lang="ts">
import BaseOutlinedTextField from '@/components/base/BaseOutlinedTextField.vue'
import { useLoginForm } from '@/composables/login/useLoginForm'

const {
  state,
  canSubmit,
  loginFieldRef,
  onLogin,
  loginWithMockData,
} = useLoginForm()
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center py-8">
    <v-card v-show="true" width="310" class="glossy pa-9" elevation="8" style="border-radius: var(--radius-lg);">
      <v-card-text class="pa-0">
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
        <v-form autocomplete="on" @submit.prevent="onLogin">
          <BaseOutlinedTextField
            ref="loginFieldRef"
            v-model="state.login"
            placeholder="Логин"
            class="mb-5"
            autocomplete="username"
            name="username"
            autofocus
            :prepend-inner-icon="'mdi-account'"
            :error-messages="state.errors.login"
            v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 600, delay: 200 } }"
          />

          <BaseOutlinedTextField
            v-model="state.password"
            placeholder="Пароль"
            class="mb-5"
            name="current-password"
            autocomplete="current-password"
            :type="state.visiblePassword ? 'text' : 'password'"
            :append-inner-icon="state.visiblePassword ? 'mdi-eye-off' : 'mdi-eye'"
            :error-messages="state.errors.password"
            @click:append-inner="state.visiblePassword = !state.visiblePassword"
            v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 600, delay: 300 } }"
          />

          <v-alert v-if="state.errors.general"
            type="error" variant="tonal" density="compact" class="mb-5 glossy rounded-base-md"
            v-motion :initial="{ opacity: 0, scale: 0.9 }" :enter="{
              opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20, duration: 400 }
            }">
            {{ state.errors.general }}
          </v-alert>

          <v-btn type="submit" color="primary" size="large" block class="glossy"
            :loading="state.loading" :disabled="!canSubmit"
            style="border-radius: var(--radius-md);"
            v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 400 } }">
            Войти
          </v-btn>

          <v-divider class="my-4" />
          <v-btn variant="outlined" color="secondary" size="large" block class="glossy"
            @click="loginWithMockData"
            style="border-radius: var(--radius-md);"
            v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 400 } }">
            Войти (тест)
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped></style>
