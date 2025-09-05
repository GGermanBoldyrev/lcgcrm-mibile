import { ref, onMounted, onUnmounted } from 'vue'
import type { DocumentCopy } from '@/types/hub'
import { api } from '@/shared/api'

export function useDocumentPhotoGallery(copies: DocumentCopy[] | null) {
  // Состояние загруженных изображений
  const loadedImages = ref<Map<string, string>>(new Map())
  const loadingImages = ref<Set<string>>(new Set())
  const errorImages = ref<Set<string>>(new Set())

  // Состояние полноэкранного просмотра
  const showFullscreen = ref(false)
  const currentPhotoIndex = ref(0)

  // Функция для загрузки изображения с токеном
  const loadImageWithToken = async (photoPath: string): Promise<string> => {
    if (loadedImages.value.has(photoPath)) {
      return loadedImages.value.get(photoPath)!
    }

    if (loadingImages.value.has(photoPath)) {
      return ''
    }

    loadingImages.value.add(photoPath)

    try {
      const response = await api.get(`/mobile/hub/copy?path=${encodeURIComponent(photoPath)}`, {
        responseType: 'blob'
      })

      const blob = response.data
      const imageUrl = URL.createObjectURL(blob)

      loadedImages.value.set(photoPath, imageUrl)
      loadingImages.value.delete(photoPath)

      return imageUrl
    } catch (error) {
      console.warn('Ошибка загрузки изображения:', error)
      errorImages.value.add(photoPath)
      loadingImages.value.delete(photoPath)
      return ''
    }
  }

  // Загружаем все изображения при инициализации
  const loadAllImages = async () => {
    if (copies) {
      for (const copy of copies) {
        await loadImageWithToken(copy.url)
      }
    }
  }

  // Функция для получения URL изображения
  const getImageSrc = (photoPath: string): string => {
    return loadedImages.value.get(photoPath) || ''
  }

  // Проверка состояния загрузки
  const isImageLoading = (photoPath: string): boolean => {
    return loadingImages.value.has(photoPath)
  }

  // Проверка ошибки загрузки
  const isImageError = (photoPath: string): boolean => {
    return errorImages.value.has(photoPath)
  }

  // Функции полноэкранного просмотра
  const openFullscreen = (index: number) => {
    currentPhotoIndex.value = index
    showFullscreen.value = true
  }

  const closeFullscreen = () => {
    showFullscreen.value = false
  }

  const nextPhoto = () => {
    if (copies && currentPhotoIndex.value < copies.length - 1) {
      currentPhotoIndex.value++
    }
  }

  const previousPhoto = () => {
    if (currentPhotoIndex.value > 0) {
      currentPhotoIndex.value--
    }
  }

  const goToPhoto = (index: number) => {
    currentPhotoIndex.value = index
  }

  const getCurrentImageSrc = (): string => {
    if (!copies || !copies[currentPhotoIndex.value]) {
      return ''
    }
    return getImageSrc(copies[currentPhotoIndex.value].url)
  }

  const downloadImage = () => {
    const imageSrc = getCurrentImageSrc()
    if (imageSrc && copies) {
      const link = document.createElement('a')
      link.href = imageSrc
      link.download = `photo-${currentPhotoIndex.value + 1}.jpg`
      link.click()
    }
  }

  // Проверка наличия навигации
  const hasNavigation = (): boolean => {
    return Boolean(copies && copies.length > 1)
  }

  const canGoPrevious = (): boolean => {
    return currentPhotoIndex.value > 0
  }

  const canGoNext = (): boolean => {
    return Boolean(copies && currentPhotoIndex.value < copies.length - 1)
  }

  // Получение количества фотографий
  const getPhotosCount = (): number => {
    return copies?.length || 0
  }

  // Получение текущего индекса (1-based для UI)
  const getCurrentPhotoNumber = (): number => {
    return currentPhotoIndex.value + 1
  }

  // Проверка наличия фотографий
  const hasPhotos = (): boolean => {
    return Boolean(copies && copies.length > 0)
  }

  // Очистка объектных URL
  const cleanup = () => {
    loadedImages.value.forEach((url) => {
      URL.revokeObjectURL(url)
    })
    loadedImages.value.clear()
  }

  // Инициализация при монтировании
  onMounted(() => {
    loadAllImages()
  })

  // Очистка при размонтировании
  onUnmounted(() => {
    cleanup()
  })

  return {
    // Состояние изображений
    loadedImages,
    loadingImages,
    errorImages,

    // Состояние полноэкранного просмотра
    showFullscreen,
    currentPhotoIndex,

    // Функции загрузки
    loadImageWithToken,
    loadAllImages,
    getImageSrc,
    isImageLoading,
    isImageError,

    // Функции полноэкранного просмотра
    openFullscreen,
    closeFullscreen,
    nextPhoto,
    previousPhoto,
    goToPhoto,
    getCurrentImageSrc,
    downloadImage,

    // Утилиты навигации
    hasNavigation,
    canGoPrevious,
    canGoNext,

    // Утилиты данных
    getPhotosCount,
    getCurrentPhotoNumber,
    hasPhotos,

    // Очистка
    cleanup
  }
}
