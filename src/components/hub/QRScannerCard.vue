<script setup lang="ts">
import { ref, nextTick, defineProps, defineEmits } from 'vue'
import { useQrScanner } from '@/composables/hub/useQrScanner'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  scanned: [code: string]
}>()

const videoElement = ref<HTMLVideoElement>()

const {
  isScanning,
  isLoading: qrLoading,
  error: qrError,
  hasPermission,
  startContinuousScanning,
  stopScanning,
  requestCameraPermission
} = useQrScanner()

// Реальное QR-сканирование с камерой
const startRealQrScan = async () => {
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
        emit('scanned', scannedCode)
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
const stopQrScan = () => {
  stopScanning()
  emit('close')
}

// Повторная попытка подключения к камере
const retryCamera = async () => {
  await nextTick()
  if (videoElement.value) {
    startRealQrScan()
  }
}

// Запрос разрешений на камеру
const requestPermission = async () => {
  await requestCameraPermission()
  if (hasPermission.value && videoElement.value) {
    startRealQrScan()
  }
}

// Начинаем сканирование при показе компонента
const initScanner = async () => {
  if (props.show) {
    await nextTick()
    if (videoElement.value) {
      startRealQrScan()
    }
  }
}

// Слушаем изменения show пропа
import { watch } from 'vue'
watch(() => props.show, (newVal) => {
  if (newVal) {
    initScanner()
  } else {
    stopScanning()
  }
})
</script>

<template>
  <div
    v-if="show"
    class="qr-scanner-container"
    v-motion
    :initial="{
      opacity: 0,
      scale: 0.9,
      y: 30
    }"
    :enter="{
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 500,
        type: 'spring',
        stiffness: 200,
        damping: 25
      }
    }"
  >
    <div class="qr-scanner-display">
      <!-- Video элемент для камеры -->
      <div class="qr-video-container">
        <video
          ref="videoElement"
          class="qr-video"
          autoplay
          muted
          playsinline
        ></video>

        <!-- Оверлей с рамкой сканирования -->
        <div class="qr-scanner-overlay">
          <div class="qr-scanner-corners">
            <div class="corner top-left"></div>
            <div class="corner top-right"></div>
            <div class="corner bottom-left"></div>
            <div class="corner bottom-right"></div>
          </div>
          <div class="scanning-line" v-if="isScanning"></div>
        </div>
      </div>

      <!-- Информация и кнопки управления -->
      <div class="qr-scanner-controls mt-4">
        <div v-if="qrLoading" class="text-center mb-4">
          <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
          <p class="text-body-2 text-medium-emphasis mt-2">
            Инициализация камеры...
          </p>
        </div>

        <div v-else-if="isScanning" class="text-center mb-4">
          <v-icon size="32" color="success" class="mb-2">mdi-camera</v-icon>
          <h3 class="text-h6 mb-2">Сканирование активно</h3>
          <p class="text-body-2 text-medium-emphasis">
            Наведите камеру на QR-код документа
          </p>
        </div>

        <div v-else-if="qrError" class="text-center mb-4">
          <v-icon size="32" color="error" class="mb-2">mdi-camera-off</v-icon>
          <h3 class="text-h6 mb-2">Ошибка камеры</h3>
          <p class="text-body-2 text-medium-emphasis mb-3">
            {{ qrError }}
          </p>

          <!-- Кнопка повторной попытки -->
          <v-btn
            variant="outlined"
            color="primary"
            size="small"
            prepend-icon="mdi-refresh"
            class="mb-3"
            @click="retryCamera"
          >
            Попробовать снова
          </v-btn>
        </div>

        <div v-else-if="!hasPermission && !qrLoading" class="text-center mb-4">
          <v-icon size="32" color="warning" class="mb-2">mdi-camera-off</v-icon>
          <h3 class="text-h6 mb-2">Нет доступа к камере</h3>
          <p class="text-body-2 text-medium-emphasis mb-3">
            Для сканирования QR-кодов необходимо разрешить доступ к камере
          </p>

          <!-- Кнопка запроса разрешений -->
          <v-btn
            variant="outlined"
            color="primary"
            size="small"
            prepend-icon="mdi-camera"
            class="mb-3"
            @click="requestPermission"
          >
            Разрешить доступ
          </v-btn>
        </div>

        <!-- Кнопка закрытия -->
        <v-btn
          block
          variant="outlined"
          color="secondary"
          size="large"
          prepend-icon="mdi-close"
          class="glossy"
          style="border-radius: var(--radius-md);"
          @click="stopQrScan"
        >
          Закрыть сканер
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.qr-scanner-container {
  max-width: 400px;
  margin: 0 auto;
}

.qr-scanner-display {
  text-align: center;
}

/* Video container for camera */
.qr-video-container {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #000;
  border: 2px solid rgba(var(--v-theme-primary), 0.3);
}

.qr-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.qr-scanner-overlay {
  position: absolute;
  inset: 20px;
  border-radius: var(--radius-md);
  pointer-events: none;
}

.qr-scanner-corners {
  position: absolute;
  inset: 0;
}

.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 3px solid rgb(var(--v-theme-primary));
}

.corner.top-left {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: var(--radius-sm);
}

.corner.top-right {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: var(--radius-sm);
}

.corner.bottom-left {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
  border-bottom-left-radius: var(--radius-sm);
}

.corner.bottom-right {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: var(--radius-sm);
}

.scanning-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgb(var(--v-theme-primary)) 50%,
    transparent 100%);
  animation: scan 2s linear infinite;
  box-shadow: 0 0 10px rgba(var(--v-theme-primary), 0.6);
}

@keyframes scan {
  0% {
    top: 0;
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    top: calc(100% - 2px);
    opacity: 1;
  }
}

.qr-scanner-controls {
  max-width: 300px;
  margin: 0 auto;
}

.qr-scanner-text {
  animation: pulse-text 2s ease-in-out infinite;
}

@keyframes pulse-text {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Responsive adjustments for mobile */
@media (max-width: 480px) {
  .qr-video-container {
    width: 280px;
    height: 280px;
  }

  .qr-scanner-container {
    max-width: 320px;
  }
}
</style>
