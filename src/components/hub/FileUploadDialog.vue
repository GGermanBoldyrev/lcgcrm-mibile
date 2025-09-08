<template>
  <v-dialog v-model="showDialog" max-width="500" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-cloud-upload</v-icon>
        Загрузка файлов
      </v-card-title>

      <v-card-text>
                <div
          class="upload-area mb-4"
          :class="{ 'drag-over': selectionState.isDragOver }"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <v-file-input
            ref="fileInputRef"
            multiple
            accept="image/*,.pdf"
            placeholder="Выберите файлы или перетащите их сюда"
            prepend-icon="mdi-attachment"
            variant="outlined"
            density="comfortable"
            :disabled="uploading"
            @change="handleFileSelection"
            class="file-input"
          />
          <div class="upload-hint mt-2">
            <p class="text-caption text-center text-medium-emphasis">
              Загрузите файлы
            </p>
          </div>
        </div>

        <!-- Прогресс загрузки -->
        <div v-if="uploading" class="upload-progress mb-4">
          <v-progress-linear
            :model-value="progress"
            color="primary"
            height="8"
            rounded
            class="mb-2"
          />
          <p class="text-caption text-center text-medium-emphasis">
            Загрузка... {{ Math.round(progress) }}%
          </p>
        </div>

        <!-- Ошибка загрузки -->
        <v-alert
          v-if="selectionState.error"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-4"
          closable
          @click:close="selectionState.error = null"
        >
          {{ selectionState.error }}
        </v-alert>

        <!-- Список выбранных файлов -->
        <div v-if="selectionState.selectedFiles.length > 0" class="selected-files">
          <div class="d-flex align-center justify-space-between mb-3">
            <p class="text-body-2 font-weight-medium mb-0">Выбранные файлы:</p>
            <v-chip size="small" color="primary" variant="tonal">
              {{ selectionState.selectedFiles.length }} {{ pluralizeFile(selectionState.selectedFiles.length) }}
            </v-chip>
          </div>
          <div class="files-list">
            <div
              v-for="(file, index) in selectionState.selectedFiles"
              :key="`${file.name}-${index}`"
              class="file-item mb-2"
            >
              <div class="d-flex align-center">
                <v-icon
                  :color="getFileIconColor(file.type)"
                  size="20"
                  class="mr-2"
                >
                  {{ getFileIcon(file.type) }}
                </v-icon>
                <div class="flex-grow-1">
                  <p class="text-body-2 mb-0">{{ file.name }}</p>
                  <p class="text-caption text-medium-emphasis mb-0">
                    {{ formatFileSize(file.size) }}
                  </p>
                </div>
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="error"
                  @click="removeFile(index)"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-btn
          variant="outlined"
          color="secondary"
          size="large"
          @click="closeDialog"
          :disabled="uploading"
          class="glossy cancel-btn"
          style="border-radius: var(--radius-md); flex: 1; margin-right: 8px;"
        >
          Отмена
        </v-btn>
        <v-btn
          color="primary"
          size="large"
          @click="handleUploadFiles"
          :loading="uploading"
          :disabled="selectionState.selectedFiles.length === 0"
          class="glossy upload-btn"
          style="border-radius: var(--radius-md); flex: 1; margin-left: 8px;"
        >
          Загрузить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFileUpload, useFileSelection } from '@/composables/hub/useFileUpload'

interface Props {
  modelValue: boolean
  documentId: string
  userId: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'uploaded', files: any[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Используем композаблы
const { state: uploadState, uploadFiles } = useFileUpload()
const {
  state: selectionState,
  fileInputRef,
  pluralizeFile,
  handleFileSelection,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  removeFile,
  clearSelectedFiles,
  formatFileSize,
  getFileIcon,
  getFileIconColor
} = useFileSelection()

const showDialog = ref(false)
const uploading = ref(false)
const progress = ref(0)

// Синхронизация с modelValue
watch(() => props.modelValue, (newValue) => {
  showDialog.value = newValue
})

watch(showDialog, (newValue) => {
  emit('update:modelValue', newValue)
})

// Загрузка файлов
const handleUploadFiles = async () => {
  if (selectionState.selectedFiles.length === 0) return

  uploading.value = true
  selectionState.error = null
  progress.value = 0

  try {
    // Отправляем файлы на сервер
    await uploadFiles(selectionState.selectedFiles, props.documentId, props.userId)

    // Уведомляем о успешной загрузке
    emit('uploaded', selectionState.selectedFiles)
    closeDialog()
  } catch (error: any) {
    console.error('Ошибка загрузки файлов:', error)
    selectionState.error = error.response?.data?.message || error.message || 'Ошибка загрузки файлов'
  } finally {
    uploading.value = false
    progress.value = 0
  }
}

// Закрытие диалога
const closeDialog = () => {
  showDialog.value = false
  uploading.value = false
  progress.value = 0
  clearSelectedFiles()
}
</script>

<style scoped>
.v-card {
  padding: 12px 6px;
  border-radius: var(--radius-md) !important;
}

.upload-area {
  border: 2px dashed rgba(var(--v-theme-primary), 0.3);
  border-radius: var(--radius-md);
  padding: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: rgba(var(--v-theme-primary), 0.6);
  background: rgba(var(--v-theme-primary), 0.02);
}

.upload-area.drag-over {
  border-color: rgba(var(--v-theme-primary), 0.8);
  background: rgba(var(--v-theme-primary), 0.05);
  transform: scale(1.02);
}

.upload-hint {
  opacity: 0.7;
}

.file-input {
  width: 100%;
}

.upload-progress {
  padding: 0 8px;
}

.selected-files {
  margin-top: 16px;
}

.files-list {
  max-height: 250px;
  overflow-y: auto;
  padding-right: 4px;
}

.file-item {
  padding: 12px;
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: var(--radius-md);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  transition: all 0.2s ease;
}

.file-item:hover {
  background: rgba(var(--v-theme-surface), 0.7);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.file-item:last-child {
  margin-bottom: 0;
}

/* Стили кнопок в стиле приложения */
.cancel-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(var(--v-theme-secondary), 0.2);
}

.upload-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(var(--v-theme-primary), 0.3);
}

.cancel-btn:active,
.upload-btn:active {
  transform: translateY(0);
  transition-duration: 0.1s;
}
</style>
