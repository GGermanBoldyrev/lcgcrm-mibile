<template>
  <div class="file-upload-section mt-6">
    <div class="d-flex align-center mb-4">
      <v-icon color="primary" class="mr-3" size="24">mdi-cloud-upload</v-icon>
      <div>
        <p class="text-caption text-medium-emphasis mb-0 user-select-none">Загрузка файлов</p>
        <p class="text-body-2 font-weight-medium user-select-none">
          {{ state.files.length }} файлов
        </p>
      </div>
    </div>

    <!-- Простая кнопка загрузки -->
    <v-btn
      color="primary"
      variant="outlined"
      prepend-icon="mdi-cloud-upload"
      :loading="state.uploading"
      :disabled="state.uploading"
      @click="openFileDialog"
      class="upload-btn"
    >
      {{ state.uploading ? `Загрузка... ${Math.round(state.progress)}%` : 'Загрузить файлы' }}
    </v-btn>

    <!-- Скрытый input для выбора файлов -->
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="image/*,.pdf,.doc,.docx,.txt"
      style="display: none"
      @change="handleFileSelection"
    />

    <!-- Прогресс загрузки -->
    <div v-if="state.uploading" class="upload-progress mt-3">
      <v-progress-linear
        :model-value="state.progress"
        color="primary"
        height="8"
        rounded
        class="mb-2"
      />
    </div>

    <!-- Ошибка загрузки -->
    <v-alert
      v-if="state.error"
      type="error"
      variant="tonal"
      density="compact"
      class="mt-3"
      closable
      @click:close="state.error = null"
    >
      {{ state.error }}
    </v-alert>

    <!-- Список загруженных файлов -->
    <div v-if="state.files.length > 0" class="uploaded-files mt-4">
      <div
        v-for="file in state.files"
        :key="file.id"
        class="file-item"
      >
        <div class="file-info">
          <div class="file-icon">
            <v-icon
              :color="getFileIconColor(file.type)"
              size="24"
            >
              {{ getFileIcon(file.type) }}
            </v-icon>
          </div>
          <div class="file-details">
            <p class="text-body-2 font-weight-medium mb-1">{{ file.name }}</p>
            <p class="text-caption text-medium-emphasis">
              {{ formatFileSize(file.size) }} • {{ formatDate(file.uploadedAt) }}
            </p>
          </div>
        </div>

        <div class="file-actions">
          <!-- Превью для изображений -->
          <v-btn
            v-if="isImageFile(file.type) && file.url"
            icon
            size="small"
            variant="text"
            color="primary"
            @click="showImagePreview(file)"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>

          <!-- Скачать файл -->
          <v-btn
            v-if="file.url"
            icon
            size="small"
            variant="text"
            color="primary"
            @click="downloadFile(file)"
          >
            <v-icon>mdi-download</v-icon>
          </v-btn>

          <!-- Удалить файл -->
          <v-btn
            icon
            size="small"
            variant="text"
            color="error"
            @click="removeFile(file.id)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Диалог превью изображения -->
    <v-dialog v-model="showPreview" max-width="600">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>{{ previewFile?.name }}</span>
          <v-btn icon variant="text" @click="showPreview = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-img
            v-if="previewFile?.url"
            :src="previewFile.url"
            :alt="previewFile.name"
            max-height="500"
            contain
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFileUpload } from '@/composables/hub/useFileUpload'
import type { UploadedFile } from '@/types/hub'

const {
  state,
  uploadFile,
  removeFile,
  isValidFileType,
  isValidFileSize,
  formatFileSize
} = useFileUpload()

const fileInput = ref<HTMLInputElement>()
const showPreview = ref(false)
const previewFile = ref<UploadedFile | null>(null)

// Открытие диалога выбора файлов
const openFileDialog = () => {
  fileInput.value?.click()
}

// Обработка выбора файлов
const handleFileSelection = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  if (!files || files.length === 0) return

  for (const file of files) {
    // Проверяем тип файла
    if (!isValidFileType(file)) {
      state.error = `Неподдерживаемый тип файла: ${file.type}`
      continue
    }

    // Проверяем размер файла
    if (!isValidFileSize(file)) {
      state.error = `Файл слишком большой: ${formatFileSize(file.size)}. Максимальный размер: 10MB`
      continue
    }

    try {
      await uploadFile(file)
    } catch (error) {
      console.error('Ошибка загрузки файла:', error)
    }
  }

  // Очищаем input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Получение иконки для типа файла
const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) return 'mdi-image'
  if (fileType === 'application/pdf') return 'mdi-file-pdf-box'
  if (fileType.includes('word')) return 'mdi-file-word-box'
  if (fileType === 'text/plain') return 'mdi-file-document-outline'
  return 'mdi-file'
}

// Получение цвета иконки для типа файла
const getFileIconColor = (fileType: string): string => {
  if (fileType.startsWith('image/')) return 'success'
  if (fileType === 'application/pdf') return 'error'
  if (fileType.includes('word')) return 'primary'
  if (fileType === 'text/plain') return 'info'
  return 'grey'
}

// Проверка, является ли файл изображением
const isImageFile = (fileType: string): boolean => {
  return fileType.startsWith('image/')
}

// Показ превью изображения
const showImagePreview = (file: UploadedFile) => {
  previewFile.value = file
  showPreview.value = true
}

// Скачивание файла
const downloadFile = (file: UploadedFile) => {
  if (!file.url) return

  const link = document.createElement('a')
  link.href = file.url
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Форматирование даты
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.file-upload-section {
  max-width: 100%;
}

.file-upload-area {
  border: 2px dashed rgba(var(--v-theme-primary), 0.3);
  border-radius: var(--radius-md);
  padding: 16px;
  transition: border-color 0.2s ease;
}

.file-upload-area:hover {
  border-color: rgba(var(--v-theme-primary), 0.6);
}

.file-input {
  width: 100%;
}

.upload-progress {
  padding: 0 8px;
}

.uploaded-files {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: var(--radius-md);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  transition: all 0.2s ease;
}

.file-item:hover {
  background: rgba(var(--v-theme-surface), 0.8);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.file-icon {
  margin-right: 12px;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-details p {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .file-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .file-actions {
    align-self: flex-end;
  }
}
</style>
