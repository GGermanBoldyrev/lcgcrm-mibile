<script setup lang="ts">
import { ref } from 'vue'
import BaseOutlinedTextField from '@/components/base/BaseOutlinedTextField.vue'
import StatusConfirmDialog from '@/components/hub/StatusConfirmDialog.vue'
import { useHubUI } from '@/composables/hub/useHubUI'
import { useStatusConfirm } from '@/composables/hub/useStatusConfirm'
import HubDocumentCard from '@/components/hub/HubDocumentCard.vue'

const {
  // Состояние
  showSearch,
  searchField,
  searchId,
  showQrScanner,
  videoElement,
  documentData,
  loading,
  error,
  errorType,
  isScanning,
  qrLoading,
  qrError,
  hasPermission,
  currentFacingMode,
  statusChanging,

  // Computed
  isReady,
  displayItems,

  // Методы
  onFindClick,
  handleReset,
  onQrScanClick,
  stopQrScan,
  handleScanAgain,
  handleSwitchCamera,
  getStatusColor,
  searchById,
  updateStatus
} = useHubUI()

// Логика подтверждения смены статуса
const {
  showConfirmDialog,
  requestStatusChange,
  confirmStatusChange,
  cancelStatusChange
} = useStatusConfirm()

// Обработчик клика на кнопку смены статуса
const handleNextStatus = () => {
  if (!documentData.value?.status?.nextStatus) return
  requestStatusChange()
}

// Подтверждение смены статуса
const handleConfirmStatusChange = async () => {
  if (!documentData.value?.status?.nextStatus) return
  await confirmStatusChange(async () => {
    await updateStatus(documentData.value!.status.nextStatus!.id)
  })
}
</script>

<template>
  <v-main>
    <v-container>
      <v-row>
        <v-col cols="12" md="8" lg="6">
                          <v-card class="hub-card glossy" elevation="8">
            <v-card-text class="pa-6">

              <!-- DATA DISPLAY SECTION -->
              <HubDocumentCard
                v-if="documentData"
                :document-data="documentData"
                :display-items="displayItems"
                :status-changing="statusChanging"
                :get-status-color="getStatusColor"
                @next-status="handleNextStatus"
                @reset="handleReset"
                @scan-again="handleScanAgain"
              />

              <!-- QR SCANNER UI -->
              <div v-else-if="showQrScanner" class="qr-scanner-container">
                <div class="qr-scanner-display">
                                    <!-- Video элемент для камеры -->
                  <div class="qr-video-container" :class="{ 'qr-video-container--error': qrError }">
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
                    </div>

                    <!-- Кнопка переключения камеры -->
                    <v-btn
                      v-if="isScanning"
                      block
                      variant="tonal"
                      color="primary"
                      size="large"
                      class="glossy mb-3"
                      style="border-radius: var(--radius-md);"
                      @click="handleSwitchCamera"
                    >
                      <v-icon class="mr-2">
                        {{ currentFacingMode === 'environment' ? 'mdi-camera-front' : 'mdi-camera-rear' }}
                      </v-icon>
                      {{ currentFacingMode === 'environment' ? 'Фронтальная' : 'Задняя' }} камера
                    </v-btn>

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

              <!-- SEARCH UI -->
              <div v-else class="hub-actions">
                <v-expand-x-transition>
                                  <div v-if="showSearch" class="search-row">
                    <BaseOutlinedTextField
                      ref="searchField"
                      v-model="searchId"
                      placeholder="Введите номер документа"
                      class="search-input mb-4"
                      :disabled="loading"
                      @keyup.enter="searchById(searchId.trim())"
                    />
                    <div v-if="!loading" class="search-append-external mb-4 glossy"
                      :class="{ 'search-append-external--disabled': !isReady }" role="button"
                      :aria-label="'Найти документ'" tabindex="0"
                      @click.stop="isReady && searchById(searchId.trim())"
                      @keyup.enter.stop="isReady && searchById(searchId.trim())"
                    >
                      <v-icon size="22" :color="isReady ? 'white' : 'grey'">mdi-magnify</v-icon>
                    </div>
                    <div v-else class="search-append-external mb-4 search-append-external--loading" aria-live="polite"
                      aria-busy="true"
                    >
                      <v-progress-circular indeterminate size="22" width="3" color="white" />
                    </div>
                  </div>
                </v-expand-x-transition>

                <v-expand-transition>
                  <v-alert v-if="error" :type="errorType" variant="tonal" density="compact"
                    class="mb-4 glossy rounded-base-md"
                  >
                    {{ error }}
                  </v-alert>
                </v-expand-transition>

                <div v-if="!showSearch">
                  <v-btn block color="primary" size="large" prepend-icon="mdi-file-search" class="mb-4 glossy search-btn"
                    style="border-radius: var(--radius-md);" :loading="loading" :disabled="loading"
                    @click="onFindClick"
                  >
                    Найти документ
                  </v-btn>
                </div>

                <v-btn block variant="outlined" color="secondary" size="large" prepend-icon="mdi-qrcode-scan"
                  class="glossy qr-btn" style="border-radius: var(--radius-md);"
                  @click="onQrScanClick"
                  :disabled="loading"
                >
                  Сканировать QR
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Диалог подтверждения смены статуса -->
    <StatusConfirmDialog
      v-model="showConfirmDialog"
      :document-data="documentData"
      :status-changing="statusChanging"
      @confirm="handleConfirmStatusChange"
      @cancel="cancelStatusChange"
    />
  </v-main>
</template>

<style scoped>
.hub-card {
  border-radius: var(--radius-lg);
  border: 1px solid rgba(0, 0, 0, .06);
}

.hub-actions {
  max-width: 400px;
}

.search-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.search-input {
  flex: 1;
}

/* External blue button to the right of the field */
.search-append-external {
  height: 48px;
  min-width: 48px;
  padding: 0 16px;
  margin-left: 10px;
  margin-right: 0;
  border-radius: var(--radius-md);
  background: rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 8px 18px rgba(0, 0, 0, .16);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform .12s ease, opacity .2s ease, background-color .2s ease, box-shadow .2s ease;
}

/* disable glossy wash for a stable blue */
.search-append-external::before,
.search-append-external::after {
  display: none !important;
}

.search-append-external:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, .2);
}

.search-append-external:active {
  transform: translateY(0);
  opacity: .94;
  background: rgb(var(--v-theme-primary)) !important;
}

/* icon is always white in active state */
.search-append-external :deep(.v-icon) {
  color: white !important;
}

.search-append-external--disabled {
  background: rgba(var(--v-theme-primary), 0.25);
  box-shadow: none;
  opacity: .6;
  pointer-events: none;
}

.search-append-external--loading {
  pointer-events: none;
  background: rgba(var(--v-theme-primary), 0.3) !important;
  box-shadow: none;
}

/* Styles for the data display section */
.result-display {
  max-width: 400px;
}

.text-wrap {
  white-space: normal;
  line-height: 1.5;
  word-break: break-word;
}

.detail-item {
  width: 100%;
  transition: all 0.2s ease;
}

.detail-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.02);
  border-radius: var(--radius-sm);
  padding: 8px;
  margin: -8px -8px 8px -8px;
}

/* Consistent spacing and typography */
.detail-item .v-icon {
  margin-top: 2px;
}

.detail-item p {
  margin-bottom: 0;
}

.detail-item .text-caption {
  font-size: 0.75rem;
  letter-spacing: 0.0333333333em;
}

.detail-item .text-body-1 {
  font-size: 1rem;
  line-height: 1.5;
}

/* Enhanced button interactions */
.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(var(--v-theme-primary), 0.3);
}

.qr-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(var(--v-theme-secondary), 0.2);
}

.search-btn:active,
.qr-btn:active {
  transform: translateY(0);
}

/* Chip improvements for status display */
.v-chip {
  font-weight: 500;
  letter-spacing: 0.025em;
}

/* Smooth transitions for all interactive elements */
.v-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.v-btn:active:not(:disabled) {
  transform: translateY(0);
  transition-duration: 0.1s;
}

/* QR Scanner Styles */
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
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

/* Black background with opacity when there's an error */
.qr-video-container--error {
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(var(--v-theme-error), 0.4);
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

