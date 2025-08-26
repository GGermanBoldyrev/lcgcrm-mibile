<script setup lang="ts">
import { defineProps } from 'vue'

defineProps<{
  name?: string
}>()
</script>

<template>
  <div
    v-motion
    :initial="{ 
      opacity: 0,
      y: 30,
      scale: 0.95
    }"
    :enter="{ 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 25,
        duration: 500
      }
    }"
    :leave="{ 
      opacity: 0,
      y: -20,
      scale: 0.98,
      transition: {
        duration: 300
      }
    }"
  >
    <slot />
  </div>
</template>

<style scoped>
/* Дополнительные стили для анимаций */
</style>
