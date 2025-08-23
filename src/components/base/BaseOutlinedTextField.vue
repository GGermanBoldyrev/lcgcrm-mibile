<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  modelValue: string | number | null
}>()

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

</script>

<template>
  <v-text-field
    v-model="model"
    hide-details="auto"
    variant="outlined"
    color="primary"
    density="comfortable"
    class="custom-input"
    v-bind="$attrs"
  />
</template>

<style scoped>
.custom-input :deep(.v-field__outline) {
  --v-field-border-opacity: 0.3;
}

.custom-input :deep(.v-field__input) {
  background-color: rgba(74, 144, 226, 0.05) !important;
}

.custom-input :deep(.v-field--variant-outlined .v-field__overlay) {
  background-color: rgba(74, 144, 226, 0.05) !important;
}
</style>
