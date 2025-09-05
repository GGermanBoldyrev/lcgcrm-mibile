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

  // Мок-функция для загрузки файла
  const uploadFile = async (file: File): Promise<UploadedFile> => {
    state.uploading = true
    state.error = null
    state.progress = 0

    try {
      // Симуляция прогресса загрузки
      const progressInterval = setInterval(() => {
        if (state.progress < 90) {
          state.progress += Math.random() * 20
        }
      }, 200)

      // Создаем FormData для загрузки
      const formData = new FormData()
      formData.append('file', file)

      // Мок-запрос (в реальном приложении здесь будет настоящий API)
      const mockResponse = await new Promise<UploadedFile>((resolve) => {
        setTimeout(() => {
          clearInterval(progressInterval)
          state.progress = 100

          resolve({
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file), // Для демонстрации создаем локальный URL
            uploadedAt: new Date().toISOString()
          })
        }, 2000) // Симулируем загрузку в течение 2 секунд
      })

      // В реальном приложении здесь будет:
      // const response = await api.post('/mobile/hub/document/upload', formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' },
      //   onUploadProgress: (progressEvent) => {
      //     state.progress = Math.round((progressEvent.loaded * 100) / progressEvent.total!)
      //   }
      // })

      state.files.push(mockResponse)
      state.uploading = false
      state.progress = 0

      return mockResponse
    } catch (error: any) {
      state.uploading = false
      state.progress = 0
      state.error = error.message || 'Ошибка загрузки файла'
      throw error
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
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
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
    uploadFile,
    removeFile,
    clearFiles,
    isValidFileType,
    isValidFileSize,
    formatFileSize
  }
}
