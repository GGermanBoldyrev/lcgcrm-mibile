<script setup lang="ts">
import BaseAppBar from '@/components/base/BaseAppBar.vue'
</script>

<template>
  <v-app class="bg-app">
    <v-main>
      <slot />
    </v-main>

    <BaseAppBar />
  </v-app>
</template>

<style scoped>
.bg-app {
  min-height: 100vh;
  background: var(--app-bg-gradient);
  background-size: cover;
}
</style>
