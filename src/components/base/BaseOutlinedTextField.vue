<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  modelValue: string | number | null,
}>()

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<template>
  <v-text-field v-model="model" hide-details="auto" variant="solo" color="primary" density="comfortable"
    class="custom-input glossy-input" v-bind="{ ...$attrs }">
    <template #prepend-inner>
      <slot name="prepend-inner" />
    </template>
    <template #append-inner>
      <slot name="append-inner" />
    </template>
  </v-text-field>
</template>

<style scoped>
/* Применяем glossy стили к внутреннему полю */
.glossy-input :deep(.v-field) {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-md) !important;

  background: var(--glass-background) !important;
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation)) !important;
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation)) !important;

  border: 1px solid var(--glass-border) !important;
  box-shadow: 0 5px 15px var(--glass-shadow), inset 0 1px 0 var(--glass-highlight) !important;
}

/* Убираем стандартные стили Vuetify */
.glossy-input :deep(.v-field__overlay) {
  display: none !important;
}

.glossy-input :deep(.v-field__outline) {
  display: none !important;
}

/* Псевдоэлементы для glass эффекта */
.glossy-input :deep(.v-field)::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  box-shadow: inset 0 0 0 0.5px var(--glass-inner-stroke);
}

.glossy-input :deep(.v-field)::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(180deg,
      rgba(255, 255, 255, 0.6) 0%,
      rgba(255, 255, 255, 0.35) 14%,
      rgba(255, 255, 255, 0.1) 55%,
      rgba(255, 255, 255, 0.02) 100%);
  mix-blend-mode: soft-light;
  opacity: 0.9;
}

/* Состояния */
.glossy-input:hover :deep(.v-field) {
  --glass-bg-opacity: calc(var(--glass-bg-opacity) + 0.04);
}

.glossy-input:active :deep(.v-field) {
  box-shadow: 0 4px 11px var(--glass-shadow), inset 0 1px 0 var(--glass-highlight);
}

/* Фокус */
.glossy-input :deep(.v-field--focused) {
  --glass-bg-opacity: calc(var(--glass-bg-opacity) + 0.02);
  box-shadow:
    0 10px 30px var(--glass-shadow),
    inset 0 1px 0 var(--glass-highlight),
    0 0 0 2px rgba(var(--v-theme-primary), 0.3) !important;
  transition: 200ms;
}

/* Отключаем синий фон автозаполнения браузера */
.glossy-input :deep(input:-webkit-autofill),
.glossy-input :deep(input:-webkit-autofill:hover),
.glossy-input :deep(input:-webkit-autofill:focus),
.glossy-input :deep(input:-webkit-autofill:active) {
  -webkit-box-shadow: 0 0 0 30px transparent inset !important;
  -webkit-text-fill-color: inherit !important;
  background-color: transparent !important;
  background-image: none !important;
  transition: background-color 5000s ease-in-out 0s !important;
}

/* Для Mozilla Firefox */
.glossy-input :deep(input:-moz-autofill) {
  background-color: transparent !important;
  background-image: none !important;
}

/* Fallback для браузеров без backdrop-filter */
@supports not (backdrop-filter: blur(1px)) {
  .glossy-input :deep(.v-field) {
    background: rgb(255 255 255 / 0.88) !important;
  }

  .glossy-input :deep(.v-field)::before,
  .glossy-input :deep(.v-field)::after {
    display: none;
  }
}
</style>
