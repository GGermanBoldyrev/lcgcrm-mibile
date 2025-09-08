import { ref, reactive } from 'vue'
import { api } from '@/shared/api'
import type { UploadedFile } from '@/types/hub'

export interface FileUploadState {
  files: UploadedFile[]
  uploading: boolean
  error: string | null
  progress: number
}

export function useFileUpload() {
  const state = reactive<FileUploadState>({
    files: [],
    uploading: false,
    error: null,
    progress: 0
  })

  // Загрузка файлов на сервер
  const uploadFiles = async (files: File[], documentId: string, userId: number): Promise<void> => {
    state.uploading = true
    state.error = null
    state.progress = 0

    try {
      // Создаем FormData для загрузки
      const formData = new FormData()

      // Добавляем documentId
      formData.append('documentId', documentId)

      // Добавляем userId
      formData.append('userId', userId.toString())

      // Добавляем файлы
      files.forEach(file => {
        formData.append('files', file)
      })

      // Отправляем POST запрос
      await api.post('/mobile/hub/copy', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            state.progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          }
        }
      })

      state.uploading = false
      state.progress = 0
    } catch (error: any) {
      state.uploading = false
      state.progress = 0
      state.error = error.response?.data?.message || error.message || 'Ошибка загрузки файлов'
      throw error
    }
  }

  // Мок-функция для загрузки файла (для обратной совместимости)
  const uploadFile = async (file: File): Promise<UploadedFile> => {
    await uploadFiles([file], 'mock-document-id', 1)
    return {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString()
    }
  }

  // Удаление файла
  const removeFile = (fileId: string) => {
    const fileIndex = state.files.findIndex(f => f.id === fileId)
    if (fileIndex !== -1) {
      const file = state.files[fileIndex]
      // Освобождаем память от blob URL
      if (file.url && file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url)
      }
      state.files.splice(fileIndex, 1)
    }
  }

  // Очистка всех файлов
  const clearFiles = () => {
    state.files.forEach(file => {
      if (file.url && file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url)
      }
    })
    state.files = []
    state.error = null
  }

  // Проверка типа файла
  const isValidFileType = (file: File): boolean => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
    ]
    return allowedTypes.includes(file.type)
  }

  // Проверка размера файла (максимум 10MB)
  const isValidFileSize = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    return file.size <= maxSize
  }

  // Форматирование размера файла
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    state,
    uploadFiles,
    uploadFile,
    removeFile,
    clearFiles,
    isValidFileType,
    isValidFileSize,
    formatFileSize
  }
}

// Интерфейс для состояния выбора файлов
export interface FileSelectionState {
  selectedFiles: File[]
  isDragOver: boolean
  error: string | null
}

// Композабл для управления выбором файлов
export function useFileSelection() {
  const state = reactive<FileSelectionState>({
    selectedFiles: [],
    isDragOver: false,
    error: null
  })

  const fileInputRef = ref()

  // Плюрализация для русского языка
  const pluralizeFile = (count: number): string => {
    if (count === 1) {
      return 'файл'
    } else if ([2, 3, 4].includes(count)) {
      return 'файла'
    } else {
      return 'файлов'
    }
  }

  // Обработка выбора файлов
  const handleFileSelection = (event: Event) => {
    const target = event.target as HTMLInputElement
    const files = Array.from(target.files || [])

    if (files.length > 0) {
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
    state.isDragOver = true
  }

  const handleDragLeave = () => {
    state.isDragOver = false
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    state.isDragOver = false
    const files = Array.from(event.dataTransfer?.files || [])
    addFiles(files)
  }

  // Добавление файлов с валидацией
  const addFiles = (newFiles: File[]) => {
    if (newFiles.length === 0) return

    // Обрабатываем каждый файл отдельно
    for (const file of newFiles) {
      // Проверяем, не добавлен ли уже этот файл
      const isDuplicate = state.selectedFiles.some(existingFile =>
        existingFile.name === file.name && existingFile.size === file.size
      )

      if (isDuplicate) {
        state.error = `Файл "${file.name}" уже добавлен`
        continue
      }

      // Проверяем тип файла
      if (!isValidFileType(file)) {
        state.error = `Неподдерживаемый тип файла: ${file.type}`
        continue
      }

      // Добавляем файл к списку
      state.selectedFiles.push(file)
      state.error = null
    }
  }

  // Удаление файла из списка
  const removeFile = (index: number) => {
    state.selectedFiles.splice(index, 1)
  }

  // Очистка всех выбранных файлов
  const clearSelectedFiles = () => {
    state.selectedFiles = []
    state.error = null
    state.isDragOver = false

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

  // Проверка типа файла
  const isValidFileType = (file: File): boolean => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ]
    return allowedTypes.includes(file.type)
  }

  // Форматирование размера файла
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  return {
    state,
    fileInputRef,
    pluralizeFile,
    handleFileSelection,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    addFiles,
    removeFile,
    clearSelectedFiles,
    isValidFileType,
    formatFileSize,
    getFileIcon,
    getFileIconColor
  }
}
