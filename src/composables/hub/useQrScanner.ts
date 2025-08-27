import { ref, onUnmounted } from 'vue'
import { BrowserQRCodeReader, NotFoundException, Result } from '@zxing/library'

export function useQrScanner() {
  const isScanning = ref(false)
  const isLoading = ref(false)
  const error = ref('')
  const hasPermission = ref(false)

  let codeReader: BrowserQRCodeReader | null = null
  let currentStream: MediaStream | null = null

  // Инициализация сканера
  const initScanner = async () => {
    try {
      codeReader = new BrowserQRCodeReader()
      console.log('QR Scanner initialized')
      return true
    } catch (err) {
      console.error('Failed to initialize QR scanner:', err)
      error.value = 'Не удалось инициализировать сканер'
      return false
    }
  }

  // Проверка наличия камер на устройстве
  const checkCameraAvailability = async (): Promise<boolean> => {
    try {
      // Сначала проверяем, есть ли вообще медиа-устройства
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        error.value = 'Ваш браузер не поддерживает доступ к камере'
        return false
      }

      // Получаем список всех медиа-устройств
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')

      if (videoDevices.length === 0) {
        error.value = 'На этом устройстве не найдено камер. Подключите камеру или используйте устройство с камерой.'
        return false
      }

      return true
    } catch (err) {
      console.error('Failed to check camera availability:', err)
      error.value = 'Ошибка при проверке доступности камеры'
      return false
    }
  }

  // Запрос разрешения на использование камеры
  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      // Сначала проверяем наличие камер
      const hasCamera = await checkCameraAvailability()
      if (!hasCamera) {
        return false
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Предпочитаем заднюю камеру
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      // Сразу останавливаем поток, так как мы только проверяем разрешение
      stream.getTracks().forEach(track => track.stop())

      hasPermission.value = true
      return true
    } catch (err: any) {
      console.error('Camera permission denied:', err)

      // Определяем тип ошибки
      if (err.name === 'NotFoundError') {
        error.value = 'Камера не найдена. Убедитесь, что камера подключена и доступна.'
      } else if (err.name === 'NotAllowedError') {
        error.value = 'Доступ к камере запрещен. Разрешите использование камеры в настройках браузера.'
      } else if (err.name === 'NotSupportedError') {
        error.value = 'Ваш браузер не поддерживает доступ к камере.'
      } else {
        error.value = 'Ошибка доступа к камере: ' + (err.message || 'Неизвестная ошибка')
      }

      hasPermission.value = false
      return false
    }
  }

  // Начать сканирование
  const startScanning = async (videoElement: HTMLVideoElement): Promise<string | undefined> => {
    if (!codeReader) {
      const initialized = await initScanner()
      if (!initialized) return
    }

    if (!hasPermission.value) {
      const permitted = await requestCameraPermission()
      if (!permitted) return
    }

    try {
      isLoading.value = true
      isScanning.value = true
      error.value = ''

      // Получаем список доступных устройств
      const videoInputDevices = await codeReader!.listVideoInputDevices()

      if (videoInputDevices.length === 0) {
        throw new Error('Камера не найдена')
      }

      // Ищем заднюю камеру или используем первую доступную
      const backCamera = videoInputDevices.find((device: any) =>
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      )

      const selectedDevice = backCamera || videoInputDevices[0]

      console.log('Selected camera:', selectedDevice.label)

      // Запускаем сканирование
      const result = await codeReader!.decodeOnceFromVideoDevice(
        selectedDevice.deviceId,
        videoElement
      )

      return result.getText()

    } catch (err) {
      console.error('Scanning error:', err)

      if (err instanceof NotFoundException) {
        // Это не ошибка - просто QR код не найден, продолжаем сканирование
        return
      }

      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Ошибка при сканировании'
      }

      stopScanning()
    } finally {
      isLoading.value = false
    }
  }

  // Непрерывное сканирование
  const startContinuousScanning = async (
    videoElement: HTMLVideoElement,
    onResult: (text: string) => void,
    onError?: (error: string) => void,
    facingMode: 'user' | 'environment' = 'environment'
  ): Promise<void> => {
    if (!codeReader) {
      const initialized = await initScanner()
      if (!initialized) return
    }

    // Автоматически запрашиваем разрешение, если его нет
    if (!hasPermission.value) {
      await requestCameraPermission()
      // Продолжаем даже если разрешение не получено - пусть браузер сам обработает
    }

    try {
      isLoading.value = true
      isScanning.value = true
      error.value = ''

      // Получаем список устройств
      const videoInputDevices = await codeReader!.listVideoInputDevices()

      if (videoInputDevices.length === 0) {
        throw new Error('На этом устройстве не найдено камер. Подключите камеру или используйте устройство с камерой.')
      }

      // Выбираем камеру в зависимости от facingMode
      let selectedDevice
      if (facingMode === 'environment') {
        // Ищем заднюю камеру
        selectedDevice = videoInputDevices.find((device: any) =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        ) || videoInputDevices[0]
      } else {
        // Ищем переднюю камеру
        selectedDevice = videoInputDevices.find((device: any) =>
          device.label.toLowerCase().includes('front') ||
          device.label.toLowerCase().includes('user') ||
          device.label.toLowerCase().includes('selfie')
        ) || videoInputDevices[videoInputDevices.length - 1]
      }

      // Запускаем непрерывное сканирование
      codeReader!.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoElement,
        (result: Result | null, error: any) => {
          if (result) {
            console.log('QR Code detected:', result.getText())
            onResult(result.getText())
          }

          if (error && !(error instanceof NotFoundException)) {
            console.error('Continuous scanning error:', error)
            onError?.(error.message || 'Ошибка сканирования')
          }
        }
      )

    } catch (err) {
      console.error('Failed to start continuous scanning:', err)
      error.value = err instanceof Error ? err.message : 'Ошибка запуска сканирования'
      onError?.(error.value)
      stopScanning()
    } finally {
      isLoading.value = false
    }
  }

  // Остановить сканирование
  const stopScanning = () => {
    if (codeReader) {
      codeReader.reset()
    }

    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop())
      currentStream = null
    }

    isScanning.value = false
    isLoading.value = false
  }

  // Очистка при размонтировании компонента
  onUnmounted(() => {
    stopScanning()
  })

  return {
    isScanning,
    isLoading,
    error,
    hasPermission,
    initScanner,
    checkCameraAvailability,
    requestCameraPermission,
    startScanning,
    startContinuousScanning,
    stopScanning
  }
}
