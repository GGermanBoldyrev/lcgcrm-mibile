<template>
  <v-dialog v-model="showDialog" max-width="500" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-cloud-upload</v-icon>
        Загрузка файлов
      </v-card-title>

      <v-card-text>
        <div class="upload-area mb-4">
          <v-file-input
            v-model="selectedFiles"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            placeholder="Выберите файлы для загрузки"
            prepend-icon="mdi-attachment"
            variant="outlined"
            density="comfortable"
            :disabled="uploading"
            @change="handleFileSelection"
            class="file-input"
          />
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
          <p class="text-body-2 font-weight-medium mb-2">Выбранные файлы:</p>
          <div
            v-for="(file, index) in selectedFiles"
            :key="index"
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

// Синхронизация с modelValue
watch(() => props.modelValue, (newValue) => {
  showDialog.value = newValue
})

watch(showDialog, (newValue) => {
  emit('update:modelValue', newValue)
})

// Обработка выбора файлов
const handleFileSelection = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  selectedFiles.value = files
  error.value = null
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
.upload-area {
  border: 2px dashed rgba(var(--v-theme-primary), 0.3);
  border-radius: var(--radius-md);
  padding: 16px;
  transition: border-color 0.2s ease;
}

.upload-area:hover {
  border-color: rgba(var(--v-theme-primary), 0.6);
}

.file-input {
  width: 100%;
}

.upload-progress {
  padding: 0 8px;
}

.selected-files {
  max-height: 200px;
  overflow-y: auto;
}

.file-item {
  padding: 8px;
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
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
