<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <!-- Нижняя навигация (видна на мобилках) -->
  <v-bottom-navigation class="d-md-none mobile-bottom-nav" elevation="0" grow height="70">
    <v-btn class="nav-btn" variant="text" @click="router.push({ name: 'main' })">
      <v-icon size="24">mdi-home</v-icon>
      <span class="nav-text">Главная</span>
    </v-btn>

    <v-btn class="nav-btn" variant="text" @click="router.push('/profile')">
      <v-icon size="24">mdi-account</v-icon>
      <span class="nav-text">Профиль</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<style scoped>
.mobile-bottom-nav {
  position: fixed !important;
  bottom: 16px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: calc(100% - 32px) !important;
  max-width: 400px !important;
  border-radius: 24px !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
}

/* Отключить bg подсветку при клике */
.nav-btn {
  max-width: none !important;
}

.nav-btn :deep(.v-btn__overlay) {
  display: none !important;
}

.nav-text {
  font-size: 11px !important;
  font-weight: 500 !important;
}

/* Анимация появления */
.mobile-bottom-nav {
  animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(100%);
    opacity: 0;
  }

  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}
</style>