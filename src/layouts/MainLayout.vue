<script setup lang="ts">
import TopAppBar from '@/components/layout/TopAppBar.vue'
</script>

<template>
  <v-app class="bg-app">
    <TopAppBar />

    <v-main>
      <slot />
    </v-main>

  </v-app>
</template>

<style scoped>
.bg-app {
  min-height: 100vh;
  background: var(--app-bg-gradient);
  background-size: cover;
}
</style>
