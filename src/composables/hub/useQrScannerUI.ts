import { ref, nextTick } from 'vue'
import { useQrScanner } from './useQrScanner'

export function useQrScannerUI() {
  const showQrScanner = ref(false)
  const videoElement = ref<HTMLVideoElement>()

  const {
    isScanning,
    isLoading: qrLoading,
    error: qrError,
    hasPermission,
    currentFacingMode,
    startContinuousScanning,
    stopScanning,
    requestCameraPermission,
    toggleCamera
  } = useQrScanner()

  // QR Scanner functions
  const openQrScanner = async (onScanned?: (code: string) => Promise<void>) => {
    showQrScanner.value = true

    // Ждем следующий тик для рендеринга video элемента
    await nextTick()

    if (videoElement.value) {
      startRealQrScan(onScanned)
    }
  }

  // Реальное QR-сканирование с камерой
  const startRealQrScan = async (onScanned?: (code: string) => Promise<void>) => {
    if (!videoElement.value) return

    try {
      // Запускаем непрерывное сканирование
      await startContinuousScanning(
        videoElement.value,
        // Callback при успешном сканировании
        async (scannedCode: string) => {
          console.log('QR Code scanned:', scannedCode)

          // Останавливаем сканирование
          stopScanning()
          showQrScanner.value = false

          // Вызываем callback если передан
          if (onScanned) {
            await onScanned(scannedCode)
          }
        },
        // Callback при ошибке
        (error: string) => {
          console.error('QR scanning error:', error)
        }
      )
    } catch (error) {
      console.error('Failed to start QR scanning:', error)
    }
  }

  // Остановка сканирования
  const closeQrScanner = () => {
    stopScanning()
    showQrScanner.value = false
  }

  // Функция для повторного сканирования
  const reopenQrScanner = () => {
    openQrScanner()
  }

  // Переключение камеры с перезапуском сканирования
  const switchCamera = async (onScanned?: (code: string) => Promise<void>) => {
    // Останавливаем текущее сканирование
    stopScanning()

    // Переключаем камеру
    toggleCamera()

    // Перезапускаем сканирование если видео элемент доступен
    if (videoElement.value && showQrScanner.value) {
      await nextTick() // Ждем обновления реактивного состояния
      startRealQrScan(onScanned)
    }
  }

  return {
    // Состояние
    showQrScanner,
    videoElement,
    isScanning,
    qrLoading,
    qrError,
    hasPermission,
    currentFacingMode,

    // Методы
    openQrScanner,
    closeQrScanner,
    reopenQrScanner,
    startRealQrScan,
    switchCamera
  }
}
