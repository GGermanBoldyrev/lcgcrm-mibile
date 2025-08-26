<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <!-- Нижняя навигация (видна на мобилках) -->
  <v-bottom-navigation 
    class="d-md-none mobile-bottom-nav glossy" 
    elevation="8" 
    grow 
    height="70"
  >
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
  border-radius: var(--radius-lg) !important;
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
  margin-top: 3px;
}

/* Убираем старую анимацию, так как теперь используем @vueuse/motion */
</style>
