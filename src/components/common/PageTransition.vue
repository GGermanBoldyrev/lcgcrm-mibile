<script setup lang="ts">
import { defineProps } from 'vue'

defineProps<{
  name?: string
}>()
</script>

<template>
  <div>
    <slot />
  </div>
</template>

<style scoped>
/* Дополнительные стили для анимаций */
</style>
