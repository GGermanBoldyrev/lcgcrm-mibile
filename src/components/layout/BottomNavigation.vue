<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <!-- Нижняя навигация (видна на мобилках) -->
  <v-bottom-navigation
    class="d-md-none"
    elevation="12"
    grow
  >
    <v-btn rounded-full @click="router.push({ name: 'main' })">
      <v-icon>mdi-home</v-icon>
      Главная
    </v-btn>
    <v-btn @click="router.push('/profile')">
      <v-icon>mdi-account</v-icon>
      Профиль
    </v-btn>
  </v-bottom-navigation>
</template>

<style scoped>
.v-bottom-navigation :deep(.v-btn__overlay) {
  display: none;
}
</style>
