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
          :class="{ 'drag-over': isDragOver }"
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
              Поддерживаются: изображения, PDF, Word документы, текстовые файлы
            </p>
            <p class="text-caption text-center text-medium-emphasis">
              Максимум 10 файлов, до 10MB каждый
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
          v-if="error"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-4"
          closable
          @click:close="error = null"
        >
          {{ error }}
        </v-alert>

        <!-- Список выбранных файлов -->
        <div v-if="selectedFiles.length > 0" class="selected-files">
          <div class="d-flex align-center justify-space-between mb-3">
            <p class="text-body-2 font-weight-medium mb-0">Выбранные файлы:</p>
            <v-chip size="small" color="primary" variant="tonal">
              {{ selectedFiles.length }} {{ pluralizeFile(selectedFiles.length) }}
            </v-chip>
          </div>
          <div class="files-list">
            <div
              v-for="(file, index) in selectedFiles"
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
          @click="uploadFiles"
          :loading="uploading"
          :disabled="selectedFiles.length === 0"
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
import { useFileUpload } from '@/composables/hub/useFileUpload'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'uploaded', files: any[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const {
  state,
  uploadFile,
  isValidFileType,
  isValidFileSize,
  formatFileSize
} = useFileUpload()

const showDialog = ref(false)
const selectedFiles = ref<File[]>([])
const uploading = ref(false)
const progress = ref(0)
const error = ref<string | null>(null)
const isDragOver = ref(false)
const fileInputRef = ref()

// Синхронизация с modelValue
watch(() => props.modelValue, (newValue) => {
  showDialog.value = newValue
})

watch(showDialog, (newValue) => {
  emit('update:modelValue', newValue)
})

function pluralizeFile(count: number): string {
  if (count === 1)  {
    return 'файл';
  } else if (
    [2, 3, 4].includes(count )
  ) {
    return 'файла';
  } else {
    return 'файлов';
  }
}

// Обработка выбора файлов
const handleFileSelection = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])

  if (files.length > 0) {
    // Добавляем файлы
    addFiles(files)

    // Очищаем input для следующего выбора
    setTimeout(() => {
      if (fileInputRef.value) {
        fileInputRef.value.$el.querySelector('input').value = ''
      }
    }, 100)
  }
}

// Обработка drag & drop
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  const files = Array.from(event.dataTransfer?.files || [])
  addFiles(files)
}

// Добавление файлов с валидацией
const addFiles = (newFiles: File[]) => {
  if (newFiles.length === 0) return

  // Обрабатываем каждый файл отдельно
  for (const file of newFiles) {
    // Проверяем, не добавлен ли уже этот файл
    const isDuplicate = selectedFiles.value.some(existingFile =>
      existingFile.name === file.name && existingFile.size === file.size
    )

    if (isDuplicate) {
      error.value = `Файл "${file.name}" уже добавлен`
      continue
    }

    // Проверяем тип файла
    if (!isValidFileType(file)) {
      error.value = `Неподдерживаемый тип файла: ${file.type}`
      continue
    }

    // Добавляем файл к списку
    selectedFiles.value.push(file)
    error.value = null
  }
}

// Удаление файла из списка
const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

// Загрузка файлов
const uploadFiles = async () => {
  if (selectedFiles.value.length === 0) return

  uploading.value = true
  error.value = null
  progress.value = 0

  const uploadedFiles = []

  try {
    for (let i = 0; i < selectedFiles.value.length; i++) {
      const file = selectedFiles.value[i]

      // Проверяем тип файла
      if (!isValidFileType(file)) {
        error.value = `Неподдерживаемый тип файла: ${file.type}`
        continue
      }

      // Проверяем размер файла
      if (!isValidFileSize(file)) {
        error.value = `Файл слишком большой: ${formatFileSize(file.size)}. Максимальный размер: 10MB`
        continue
      }

      // Симулируем прогресс
      const fileProgress = (i / selectedFiles.value.length) * 100
      progress.value = fileProgress

      try {
        const uploadedFile = await uploadFile(file)
        uploadedFiles.push(uploadedFile)
      } catch (uploadError) {
        console.error('Ошибка загрузки файла:', uploadError)
        error.value = `Ошибка загрузки файла: ${file.name}`
      }
    }

    progress.value = 100

    if (uploadedFiles.length > 0) {
      emit('uploaded', uploadedFiles)
      closeDialog()
    }
  } finally {
    uploading.value = false
    progress.value = 0
  }
}

// Закрытие диалога
const closeDialog = () => {
  showDialog.value = false
  selectedFiles.value = []
  error.value = null
  uploading.value = false
  progress.value = 0
  isDragOver.value = false

  // Очищаем input
  if (fileInputRef.value) {
    setTimeout(() => {
      const input = fileInputRef.value.$el.querySelector('input')
      if (input) {
        input.value = ''
      }
    }, 100)
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
