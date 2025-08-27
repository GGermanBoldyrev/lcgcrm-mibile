<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'
import { useDocumentDisplay } from '@/composables/hub/useDocumentDisplay'
import type { DocumentData } from '@/types/hub'

const props = defineProps<{
  documentData: DocumentData
}>()

const emit = defineEmits<{
  reset: []
  scanAgain: []
}>()

const { displayItems, getStatusColor } = useDocumentDisplay(computed(() => props.documentData))

const handleReset = () => {
  emit('reset')
}

const handleScanAgain = () => {
  emit('scanAgain')
}
</script>

<template>
  <div
    class="result-display"
    v-motion
    :initial="{
      opacity: 0,
      y: 20
    }"
    :enter="{
      opacity: 1,
      y: 0,
      transition: {
        duration: 500,
        delay: 200
      }
    }"
  >
    <div
      v-for="(item, index) in displayItems"
      :key="item.label"
      class="detail-item d-flex align-center mb-4"
      v-motion
      :initial="{
        opacity: 0,
        x: -20
      }"
      :enter="{
        opacity: 1,
        x: 0,
        transition: {
          duration: 400,
          delay: index * 50 + 300
        }
      }"
    >
      <v-icon color="primary" class="mr-3" size="24">{{ item.icon }}</v-icon>
      <div>
        <p class="text-caption text-medium-emphasis mb-0">{{ item.label }}</p>
        <div v-if="item.type === 'status'">
          <v-chip
            :color="getStatusColor(documentData.status.style)"
            variant="tonal"
            size="small"
            class="mt-1"
          >
            {{ item.value }}
          </v-chip>
        </div>
        <p v-else class="text-body-1 font-weight-medium text-wrap">{{ item.value }}</p>
      </div>
    </div>

    <v-divider class="mb-6" />

    <div class="repeat-actions">
      <v-btn
        block
        variant="outlined"
        color="secondary"
        size="large"
        prepend-icon="mdi-magnify"
        class="glossy mb-3"
        style="border-radius: var(--radius-md);"
        @click="handleReset"
        v-motion
        :initial="{
          opacity: 0,
          y: 10
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            duration: 400,
            delay: 600
          }
        }"
      >
        Искать снова
      </v-btn>

      <v-btn
        block
        variant="outlined"
        color="primary"
        size="large"
        prepend-icon="mdi-qrcode-scan"
        class="glossy"
        style="border-radius: var(--radius-md);"
        @click="handleScanAgain"
        v-motion
        :initial="{
          opacity: 0,
          y: 10
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            duration: 400,
            delay: 700
          }
        }"
      >
        Сканировать заново
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.result-display {
  max-width: 400px;
}

.repeat-actions {
  max-width: 400px;
}

.text-wrap {
  white-space: normal;
  line-height: 1.5;
  word-break: break-word;
}

.detail-item {
  width: 100%;
  transition: all 0.2s ease;
}

.detail-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.02);
  border-radius: var(--radius-sm);
  padding: 8px;
  margin: -8px -8px 8px -8px;
}

.detail-item .v-icon {
  margin-top: 2px;
}

.detail-item p {
  margin-bottom: 0;
}

.detail-item .text-caption {
  font-size: 0.75rem;
  letter-spacing: 0.0333333333em;
}

.detail-item .text-body-1 {
  font-size: 1rem;
  line-height: 1.5;
}

.v-chip {
  font-weight: 500;
  letter-spacing: 0.025em;
}

.v-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.v-btn:active:not(:disabled) {
  transform: translateY(0);
  transition-duration: 0.1s;
}
</style>
