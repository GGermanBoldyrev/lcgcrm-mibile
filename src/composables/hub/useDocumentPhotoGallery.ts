import { ref, onMounted, onUnmounted, nextTick } from 'vue'
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

  // Управление историей браузера для Android back button
  const PHOTO_GALLERY_STATE = 'photo-gallery-open'
  let isHistoryPushed = false

  // Touch события для swipe навигации
  const touchStartX = ref(0)
  const touchStartY = ref(0)
  const touchEndX = ref(0)
  const touchEndY = ref(0)
  const isSwipeEnabled = ref(true)
  const isSwipeInProgress = ref(false)
  const swipeDirection = ref<'left' | 'right' | null>(null)
  const SWIPE_THRESHOLD = 50 // Минимальное расстояние для swipe

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

  // Функция для программного закрытия без изменения истории
  const closeFullscreenProgrammatically = () => {
    showFullscreen.value = false
    isHistoryPushed = false
  }

  // Обработчик события popstate (кнопка назад)
  const handlePopState = (event: PopStateEvent) => {
    // Если галерея открыта и произошел переход назад
    if (showFullscreen.value && isHistoryPushed) {
      // Закрываем галерею программно (без изменения истории)
      closeFullscreenProgrammatically()
    }
  }

  // Функции полноэкранного просмотра
  const openFullscreen = (index: number) => {
    currentPhotoIndex.value = index
    showFullscreen.value = true

    // Добавляем состояние в историю для Android back button
    if (!isHistoryPushed) {
      window.history.pushState(PHOTO_GALLERY_STATE, '', window.location.href)
      isHistoryPushed = true
    }
  }

  const closeFullscreen = () => {
    if (isHistoryPushed) {
      // Если состояние добавлено в историю, используем history.back()
      // Это автоматически вызовет handlePopState
      window.history.back()
    } else {
      // Если состояния в истории нет, просто закрываем
      showFullscreen.value = false
    }
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

  // Touch события для swipe навигации
  const handleTouchStart = (event: TouchEvent) => {
    if (!isSwipeEnabled.value || !showFullscreen.value) return

    const touch = event.touches[0]
    touchStartX.value = touch.clientX
    touchStartY.value = touch.clientY
    isSwipeInProgress.value = true
    swipeDirection.value = null
  }

  const handleTouchMove = (event: TouchEvent) => {
    if (!isSwipeEnabled.value || !showFullscreen.value || !isSwipeInProgress.value) return

    const touch = event.touches[0]
    const deltaX = touch.clientX - touchStartX.value
    const deltaY = touch.clientY - touchStartY.value

    // Определяем направление swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
      // Предотвращаем скролл только при горизонтальном swipe
      event.preventDefault()
      swipeDirection.value = deltaX > 0 ? 'right' : 'left'
    }
  }

  const handleTouchEnd = (event: TouchEvent) => {
    if (!isSwipeEnabled.value || !showFullscreen.value) return

    const touch = event.changedTouches[0]
    touchEndX.value = touch.clientX
    touchEndY.value = touch.clientY

    handleSwipeGesture()

    // Сбрасываем состояние swipe
    isSwipeInProgress.value = false
    swipeDirection.value = null
  }

  const handleSwipeGesture = () => {
    const deltaX = touchEndX.value - touchStartX.value
    const deltaY = touchEndY.value - touchStartY.value

    // Проверяем, что это горизонтальный swipe (а не вертикальный)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX > 0) {
        // Swipe вправо - предыдущее фото
        if (canGoPrevious()) {
          previousPhoto()
        }
      } else {
        // Swipe влево - следующее фото
        if (canGoNext()) {
          nextPhoto()
        }
      }
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
    // Подписываемся на событие popstate для обработки кнопки назад
    window.addEventListener('popstate', handlePopState)
  })

  // Очистка при размонтировании
  onUnmounted(() => {
    cleanup()
    // Отписываемся от события popstate
    window.removeEventListener('popstate', handlePopState)

    // Очищаем историю если галерея была открыта
    if (isHistoryPushed && showFullscreen.value) {
      // Программно закрываем без вызова history.back() для избежания проблем
      closeFullscreenProgrammatically()
    }
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

    // Touch события
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isSwipeEnabled,
    isSwipeInProgress,
    swipeDirection,

    // Очистка
    cleanup
  }
}
