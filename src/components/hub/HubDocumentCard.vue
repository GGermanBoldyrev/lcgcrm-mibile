<script setup lang="ts">
import type { DocumentData, DisplayItem } from '@/types/hub'

interface Props {
  documentData: DocumentData
  displayItems: DisplayItem[]
  statusChanging: boolean
  getStatusColor: (style: string) => string
}

interface Emits {
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <div class="result-display">
    <!-- Document Number Section -->
    <div class="document-number-section mb-4">
      <div class="d-flex align-center mb-2">
        <v-icon color="primary" class="mr-3" size="24">mdi-identifier</v-icon>
        <div class="flex-grow-1">
          <div class="d-flex align-center justify-space-between">
            <div>
              <p class="text-caption text-medium-emphasis mb-0 user-select-none">Номер документа</p>
              <p class="text-h6 font-weight-bold text-primary mb-0 user-select-none">{{ documentData.documentId }}</p>
            </div>
            <!-- Индикатор срочности -->
            <v-chip
              v-if="documentData.meta?.express"
              color="error"
              variant="tonal"
              size="small"
              class="ml-2"
            >
              <v-icon size="16" class="mr-1">mdi-clock-fast</v-icon>
              Срочно
            </v-chip>
          </div>
        </div>
      </div>
      <v-divider class="my-4"></v-divider>
    </div>

    <div
      v-for="(item, index) in displayItems"
      :key="item.label"
      class="detail-item d-flex align-center mb-4"
    >
      <v-icon color="primary" class="mr-3" size="24">{{ item.icon }}</v-icon>
      <div>
        <p class="text-caption text-medium-emphasis mb-0 user-select-none">{{ item.label }}</p>
        <div v-if="item.label === 'Текущий статус'">
          <v-chip
            :color="getStatusColor(documentData.status.style)"
            variant="tonal"
            size="small"
            class="mt-1"
          >
            {{ item.value }}
          </v-chip>
        </div>
        <div v-else-if="item.label === 'Статусы доставки'" v-html="item.value" class="shipping-status-container"></div>
        <p v-else class="text-body-1 font-weight-medium text-wrap user-select-none">{{ item.value }}</p>
      </div>
    </div>


  </div>
</template>

<style scoped>
</style>
