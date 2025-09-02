<script setup lang="ts">
import type { DocumentData } from '@/types/hub'

interface Props {
  modelValue: boolean
  documentData: DocumentData | null
  statusChanging: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="400"
    persistent
  >
    <v-card class="glossy py-4 px-2" style="border-radius: var(--radius-lg);">
      <v-card-title class="text-h6 pb-2">
        <v-icon color="warning" class="mr-2">mdi-alert-circle-outline</v-icon>
        Подтверждение
      </v-card-title>

      <v-card-text class="pb-2">
        <p class="text-body-1 mb-2">
          Вы уверены, что хотите изменить статус документа?
        </p>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-btn
          color="primary"
          @click="handleCancel"
          :disabled="statusChanging"
          class="flex-grow-1 glossy"
        >
          Отмена
        </v-btn>
        <v-btn
          color="success"
          @click="handleConfirm"
          :loading="statusChanging"
          :disabled="statusChanging"
          class="flex-grow-1 ml-2 glossy"
        >
          Подтвердить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
