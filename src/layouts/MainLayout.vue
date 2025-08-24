<script setup lang="ts">
import BottomNavigation from '@/components/layout/BottomNavigation.vue'
</script>

<template>
  <v-app class="bg-app">
    <v-main>
      <slot />
    </v-main>

    <BottomNavigation />
  </v-app>
</template>

<style scoped>
.bg-app {
  min-height: 100vh;
  background: var(--app-bg-gradient);
  background-size: cover;
}
</style>
