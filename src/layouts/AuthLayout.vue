<script setup lang="ts">

</script>

<template>
  <v-app>
    <v-main class="bg-auth">
      <slot />
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
