<script setup lang="ts">
import { ref } from 'vue'
import type { DocumentData, DisplayItem } from '@/types/hub'
import DocumentPhotoGallery from './DocumentPhotoGallery.vue'
import FileUploadDialog from './FileUploadDialog.vue'

interface Props {
  documentData: DocumentData
  displayItems: DisplayItem[]
  statusChanging: boolean
  getStatusColor: (style: string) => string
}

interface Emits {
  (e: 'filesUploaded', files: any[]): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// Состояние диалога загрузки файлов
const showFileUploadDialog = ref(false)

// Обработчик загрузки файлов
const handleUploadFiles = () => {
  showFileUploadDialog.value = true
}

// Обработчик успешной загрузки файлов
const handleFilesUploaded = (files: any[]) => {
  emit('filesUploaded', files)
}
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

    <!-- Photo Gallery Component -->
    <DocumentPhotoGallery :copies="documentData.copies" />

    <!-- File Upload Section -->
    <div class="file-upload-section mt-6">
      <v-btn
        color="primary"
        variant="outlined"
        block
        size="large"
        prepend-icon="mdi-cloud-upload"
        @click="handleUploadFiles"
        class="upload-btn"
      >
        Загрузить файлы
      </v-btn>
    </div>

    <!-- File Upload Dialog -->
    <FileUploadDialog
      v-model="showFileUploadDialog"
      @uploaded="handleFilesUploaded"
    />

  </div>
</template>

<style scoped>
.file-upload-section {
  border-top: 1px solid rgba(var(--v-theme-outline), 0.2);
  padding-top: 16px;
}

.upload-btn {
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  letter-spacing: 0.025em;
}

.upload-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(var(--v-theme-success), 0.3);
}
</style>
