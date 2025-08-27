<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import BaseOutlinedTextField from '@/components/base/BaseOutlinedTextField.vue'
import { useHubSearch } from '@/composables/hub/useHubSearch'

const showSearch = ref(false)
const showQrScanner = ref(false)
const searchField = ref()

const {
  data: documentData,
  loading,
  error,
  errorType,
  searchById,
  resetSearch,
} = useHubSearch()

const searchId = ref('')

const isReady = () =>
  searchId.value.trim().length > 0 && !loading.value

const onFindClick = async () => {
  if (!showSearch.value) {
    showSearch.value = true
    await nextTick()
    searchField.value?.$el?.querySelector('input')?.focus()
    return
  }
  await searchById(searchId.value.trim())
}

// Reset с дополнительным UX-фокусом
const handleReset = () => {
  resetSearch()
  searchId.value = ''
  showSearch.value = false
  showQrScanner.value = false
}

// QR Scanner functions
const onQrScanClick = () => {
  if (showSearch.value) {
    showSearch.value = false
  }
  showQrScanner.value = true

  // TODO: Заменить на реальное QR-сканирование
  // Для интеграции с реальным QR-сканером:
  // 1. Подключить библиотеку, например: @zxing/browser или quagga2
  // 2. Инициализировать камеру и stream
  // 3. Заменить simulateQrScan() на реальную функцию сканирования
  // 4. Обработать результат сканирования и вызвать searchById с полученным кодом

  simulateQrScan() // Временная симуляция
}

// Симуляция сканирования QR-кода (для демонстрации)
// TODO: Заменить на реальную функцию QR-сканирования
const simulateQrScan = async () => {
  try {
    // Симулируем процесс сканирования (2 секунды)
    await new Promise(resolve => setTimeout(resolve, 2000))

        // Симулируем получение кода (в реальности это будет результат сканирования)
    const scannedCode = "DOC123456" // Замените на реальный код из QR-сканера

    // Выполняем поиск с полученным кодом
    await searchById(scannedCode)

    // Скрываем интерфейс сканера
    showQrScanner.value = false
  } catch (error) {
    console.error('QR scanning error:', error)
    showQrScanner.value = false
    // Здесь можно добавить обработку ошибок сканирования
  }
}

// Функция для повторного сканирования
const handleScanAgain = () => {
  resetSearch()
  onQrScanClick()
}

const formattedDate = computed(() => {
  if (!documentData.value?.meta?.createdAt) return ''
  return new Date(documentData.value.meta.createdAt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const displayItems = computed(() => {
  if (!documentData.value) return []

  return [
    {
      icon: 'mdi-list-status',
      label: 'Текущий статус',
      value: documentData.value.status?.name,
    },
    {
      icon: 'mdi-calendar-clock',
      label: 'Дата создания',
      value: formattedDate.value,
    },
    {
      icon: 'mdi-information-outline',
      label: 'Наименование',
      value: documentData.value.info?.name,
    },
    {
      icon: 'mdi-comment-processing-outline',
      label: 'Особые условия',
      value: documentData.value.info?.comment,
    },
    {
      icon: 'mdi-map-marker-outline',
      label: 'Адрес доставки',
      value: documentData.value.address?.address,
    },
    {
      icon: 'mdi-comment-text-outline',
      label: 'Комментарий',
      value: documentData.value.address?.comment,
    },
    {
      icon: 'mdi-phone-outline',
      label: 'Контакты',
      value: documentData.value.address?.contact,
    },
  ].filter(item => item.value)
})

const statusColorMap: Record<string, string> = {
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  danger: 'error',
}
const getStatusColor = (style: string) =>
  statusColorMap[style] || 'grey'

</script>

<template>
  <v-main>
    <v-container>
      <v-row>
        <v-col cols="12" md="8" lg="6">
          <v-card class="hub-card glossy" elevation="8" v-motion :initial="{ opacity: 0, y: 40, scale: 0.9 }"
            :enter="{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 250, damping: 20, duration: 500 } }">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-6">
                <v-avatar size="80" color="primary" class="mr-4">
                  <v-icon size="40" color="white">
                    {{ documentData ? 'mdi-file-check-outline' : 'mdi-file-document-outline' }}
                  </v-icon>
                </v-avatar>
                <div>
                  <h2 class="text-h5 font-weight-bold mb-1">Канцелярия</h2>
                  <p class="text-body-1 text-medium-emphasis mb-0">
                    {{ documentData ? `Информация по документу №${documentData.rosterNum}` : 'Центр управления документами' }}
                  </p>
                </div>
              </div>

              <v-divider class="mb-6" />

              <!-- DATA DISPLAY SECTION -->
              <div v-if="documentData" class="result-display" v-motion :initial="{
                opacity: 0,
                y: 20
              }" :enter="{
                opacity: 1,
                y: 0,
                transition: {
                  duration: 500,
                  delay: 200
                }
              }">
                <div
                  v-for="(item, index) in displayItems"
                  :key="item.label"
                  class="detail-item d-flex align-center mb-4"
                  v-motion
                  :initial="{
                    opacity: 0,
                    x: -20
                  }"
                  :enter="{
                    opacity: 1,
                    x: 0,
                    transition: {
                      duration: 400,
                      delay: index * 50 + 300
                    }
                  }"
                >
                  <v-icon color="primary" class="mr-3" size="24">{{ item.icon }}</v-icon>
                  <div>
                    <p class="text-caption text-medium-emphasis mb-0">{{ item.label }}</p>
                    <div v-if="item.label === 'Текущий статус'">
                      <v-chip
                        :color="getStatusColor(documentData.status.style)"
                        variant="tonal"
                        size="small"
                        class="mt-1"
                      >
                        {{ item.value }}
                      </v-chip>
                    </div>
                    <p v-else class="text-body-1 font-weight-medium text-wrap">{{ item.value }}</p>
                  </div>
                </div>

                                <v-divider class="mb-6" />

                <div class="repeat-actions">
                  <v-btn
                    block
                    variant="outlined"
                    color="secondary"
                    size="large"
                    prepend-icon="mdi-magnify"
                    class="glossy mb-3"
                    style="border-radius: var(--radius-md);"
                    @click="handleReset"
                    v-motion
                    :initial="{
                      opacity: 0,
                      y: 10
                    }"
                    :enter="{
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 400,
                        delay: 600
                      }
                    }"
                  >
                    Искать снова
                  </v-btn>

                  <v-btn
                    block
                    variant="outlined"
                    color="primary"
                    size="large"
                    prepend-icon="mdi-qrcode-scan"
                    class="glossy"
                    style="border-radius: var(--radius-md);"
                    @click="handleScanAgain"
                    v-motion
                    :initial="{
                      opacity: 0,
                      y: 10
                    }"
                    :enter="{
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 400,
                        delay: 700
                      }
                    }"
                  >
                    Сканировать заново
                  </v-btn>
                </div>
              </div>

              <!-- QR SCANNER UI -->
              <div v-else-if="showQrScanner" class="qr-scanner-container" v-motion :initial="{
                opacity: 0,
                scale: 0.9,
                y: 30
              }" :enter="{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: {
                  duration: 500,
                  type: 'spring',
                  stiffness: 200,
                  damping: 25
                }
              }">
                <div class="qr-scanner-display">
                  <div class="qr-scanner-frame">
                    <div class="qr-scanner-overlay">
                      <div class="qr-scanner-corners">
                        <div class="corner top-left"></div>
                        <div class="corner top-right"></div>
                        <div class="corner bottom-left"></div>
                        <div class="corner bottom-right"></div>
                      </div>
                      <div class="scanning-line"></div>
                    </div>
                  </div>

                  <div class="qr-scanner-text mt-4">
                    <v-icon size="32" color="primary" class="mb-2">mdi-qrcode-scan</v-icon>
                    <h3 class="text-h6 mb-2">Сканирование QR-кода</h3>
                    <p class="text-body-2 text-medium-emphasis">
                      Наведите камеру на QR-код документа
                    </p>
                    <v-progress-linear indeterminate color="primary" class="mt-4"></v-progress-linear>
                  </div>
                </div>
              </div>

              <!-- SEARCH UI -->
              <div v-else class="hub-actions">
                <v-expand-x-transition>
                  <div v-if="showSearch" class="search-row" v-motion :initial="{
                    opacity: 0,
                    x: -30,
                    scale: 0.95
                  }" :enter="{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    transition: {
                      duration: 400,
                      type: 'spring',
                      stiffness: 200,
                      damping: 25
                    }
                  }">
                    <BaseOutlinedTextField
                      ref="searchField"
                      v-model="searchId"
                      placeholder="Введите номер документа"
                      class="search-input mb-4"
                      :disabled="loading"
                      @keyup.enter="searchById(searchId.trim())"
                    />
                    <div v-if="!loading" class="search-append-external mb-4 glossy"
                      :class="{ 'search-append-external--disabled': !isReady() }" role="button"
                      :aria-label="'Найти документ'" tabindex="0"
                      @click.stop="isReady() && searchById(searchId.trim())"
                      @keyup.enter.stop="isReady() && searchById(searchId.trim())"
                      v-motion
                      :initial="{
                        opacity: 0,
                        scale: 0.8
                      }"
                      :enter="{
                        opacity: 1,
                        scale: 1,
                        transition: {
                          duration: 300,
                          delay: 150
                        }
                      }"
                    >
                      <v-icon size="22" :color="isReady() ? 'white' : 'grey'">mdi-magnify</v-icon>
                    </div>
                    <div v-else class="search-append-external mb-4 search-append-external--loading" aria-live="polite"
                      aria-busy="true"
                      v-motion
                      :initial="{
                        opacity: 0,
                        scale: 0.8
                      }"
                      :enter="{
                        opacity: 1,
                        scale: 1,
                        transition: {
                          duration: 300
                        }
                      }"
                    >
                      <v-progress-circular indeterminate size="22" width="3" color="white" />
                    </div>
                  </div>
                </v-expand-x-transition>

                <v-expand-transition>
                  <v-alert v-if="error" :type="errorType" variant="tonal" density="compact"
                    class="mb-4 glossy rounded-base-md"
                    v-motion
                    :initial="{
                      opacity: 0,
                      y: -10
                    }"
                    :enter="{
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 300
                      }
                    }"
                  >
                    {{ error }}
                  </v-alert>
                </v-expand-transition>

                <div v-if="!showSearch" v-motion :initial="{
                  opacity: 0,
                  y: 20
                }" :enter="{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 400,
                    type: 'spring',
                    stiffness: 200,
                    damping: 25
                  }
                }">
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
                  v-motion :initial="{
                    opacity: 0,
                    y: 20
                  }" :enter="{
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 400,
                      delay: 100,
                      type: 'spring',
                      stiffness: 200,
                      damping: 25
                    }
                  }">
                  Сканировать QR
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
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

/* Styles for the data display section - matching ProfilePage */
.result-display {
  max-width: 400px;
}

.repeat-actions {
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

/* Enhanced button interactions matching ProfilePage style */
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

.qr-scanner-frame {
  position: relative;
  width: 250px;
  height: 250px;
  margin: 0 auto;
  border-radius: var(--radius-lg);
  background: linear-gradient(45deg,
    rgba(var(--v-theme-primary), 0.1) 0%,
    rgba(var(--v-theme-primary), 0.05) 100%);
  border: 2px solid rgba(var(--v-theme-primary), 0.3);
  overflow: hidden;
}

.qr-scanner-overlay {
  position: absolute;
  inset: 20px;
  border-radius: var(--radius-md);
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
</style>
