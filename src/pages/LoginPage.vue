<script setup lang="ts">
import BaseOutlinedTextField from '@/components/base/BaseOutlinedTextField.vue'
import { useLoginForm } from '@/composables/login/useLoginForm'

// импорт ассета как модуль (Vite)
import logoUrl from '@/assets/images/ui/lcg-logo.png'

const {
  state,
  canSubmit,
  loginFieldRef,
  onLogin,
} = useLoginForm()
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center py-8">
    <v-card v-show="true" width="310" class="glossy pa-9" elevation="8" style="border-radius: var(--radius-lg);">
      <v-card-text class="pa-0">
        <div class="d-flex justify-center mb-5">
          <v-img :src="logoUrl" class="my-5" />
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
            @input="() => {}"
            @change="() => {}"

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
            @input="() => {}"
            @change="() => {}"
            @click:append-inner="state.visiblePassword = !state.visiblePassword"

          />

          <v-alert v-if="state.errors.general"
            type="error" variant="tonal" density="compact" class="mb-5 glossy rounded-base-md"
>
            {{ state.errors.general }}
          </v-alert>

          <v-btn type="submit" color="primary" size="large" block class="glossy"
            :loading="state.loading" :disabled="!canSubmit"
            style="border-radius: var(--radius-md);"
>
            Войти
          </v-btn>


        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped></style>
