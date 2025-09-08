<script setup lang="ts">
import { ref } from 'vue'
import type { DocumentData, DisplayItem, UploadedFile } from '@/types/hub'
import DocumentPhotoGallery from './DocumentPhotoGallery.vue'
import FileUploadDialog from './FileUploadDialog.vue'
import { useAuthStore } from '@/stores/auth'

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

// Получаем userId из стейта
const authStore = useAuthStore()

// Состояние диалога загрузки файлов
const showFileUploadDialog = ref(false)

// Загруженные файлы
const uploadedFiles = ref<UploadedFile[]>([])

// Обработчик загрузки файлов
const handleUploadFiles = () => {
  showFileUploadDialog.value = true
}

// Обработчик успешной загрузки файлов
const handleFilesUploaded = (files: UploadedFile[]) => {
  // Добавляем новые файлы к существующим
  uploadedFiles.value.push(...files)
  emit('filesUploaded', files)
}

// Функции для работы с файлами
const isImage = (type: string) => {
  return type.startsWith('image/')
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return 'mdi-image'
  if (type.includes('pdf')) return 'mdi-file-pdf-box'
  if (type.includes('word') || type.includes('document')) return 'mdi-file-word-box'
  if (type.includes('text')) return 'mdi-file-document'
  return 'mdi-file'
}

const getFileIconColor = (type: string) => {
  if (type.startsWith('image/')) return 'orange'
  if (type.includes('pdf')) return 'red'
  if (type.includes('word') || type.includes('document')) return 'blue'
  if (type.includes('text')) return 'green'
  return 'grey'
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const openImagePreview = (url: string, name: string) => {
  // Открываем изображение в новом окне/вкладке
  window.open(url, '_blank')
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

    <!-- Uploaded Files Section -->
    <div v-if="uploadedFiles.length > 0" class="uploaded-files-section mt-6">
      <div class="d-flex align-center mb-3">
        <v-icon color="success" class="mr-3" size="24">mdi-check-circle</v-icon>
        <div>
          <p class="text-caption text-medium-emphasis mb-0">Загруженные файлы</p>
          <p class="text-body-2 font-weight-medium mb-0">{{ uploadedFiles.length }} файл(ов)</p>
        </div>
      </div>
      <div class="uploaded-files-list">
        <div
          v-for="file in uploadedFiles"
          :key="file.id"
          class="uploaded-file-item mb-3 pa-3 rounded"
        >
          <div class="d-flex align-center">
            <!-- Превью изображения или иконка файла -->
            <div class="file-preview mr-3">
              <v-img
                v-if="isImage(file.type) && file.url"
                :src="file.url"
                :alt="file.name"
                width="48"
                height="48"
                class="rounded cursor-pointer"
                cover
                @click="openImagePreview(file.url, file.name)"
              />
              <v-icon
                v-else
                :color="getFileIconColor(file.type)"
                size="48"
                class="rounded"
              >
                {{ getFileIcon(file.type) }}
              </v-icon>
            </div>

            <!-- Информация о файле -->
            <div class="flex-grow-1">
              <p class="text-body-2 font-weight-medium mb-0">{{ file.name }}</p>
              <p class="text-caption text-medium-emphasis mb-0">{{ formatFileSize(file.size) }}</p>
            </div>

            <!-- Статус -->
            <v-chip size="small" color="success" variant="tonal">
              Загружен
            </v-chip>
          </div>
        </div>
      </div>
    </div>

    <!-- File Upload Section -->
    <div class="file-upload-section mt-6">
      <v-btn
        color="primary"
        variant="outlined"
        block
        size="large"
        prepend-icon="mdi-cloud-upload"
        @click="handleUploadFiles"
        class="upload-btn glossy"
      >
        Загрузить файлы
      </v-btn>
    </div>

    <!-- File Upload Dialog -->
    <FileUploadDialog
      v-model="showFileUploadDialog"
      :document-id="String(documentData.documentId)"
      :user-id="Number(authStore.user?.id) || 0"
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

.uploaded-files-section {
  border-top: 1px solid rgba(var(--v-theme-outline), 0.2);
  padding-top: 16px;
}

.uploaded-file-item {
  background-color: rgba(var(--v-theme-success), 0.05);
  border: 1px solid rgba(var(--v-theme-success), 0.2);
  transition: all 0.2s ease;
}

.uploaded-file-item:hover {
  background-color: rgba(var(--v-theme-success), 0.1);
  transform: translateY(-1px);
}

.file-preview {
  flex-shrink: 0;
}

.file-preview .v-img {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.file-preview .v-icon {
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.cursor-pointer {
  cursor: pointer;
}
</style>
