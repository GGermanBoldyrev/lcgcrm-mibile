<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useHubSearch } from '@/composables/hub/useHubSearch'
import { useHubUI } from '@/composables/hub/useHubUI'
import DocumentInfoCard from '@/components/hub/DocumentInfoCard.vue'
import QRScannerCard from '@/components/hub/QRScannerCard.vue'
import SearchCard from '@/components/hub/SearchCard.vue'

const {
  data: documentData,
  loading,
  error,
  errorType,
  searchById,
  resetSearch,
} = useHubSearch()

const {
  showSearch,
  showQrScanner,
  searchField,
  openSearch,
  openQrScanner,
  closeAll,
  resetToInitial
} = useHubUI()

const searchCardRef = ref()

// Обработка поиска документов
const handleSearch = async (searchId: string) => {
  await searchById(searchId)
}

// Обработка переключения поиска
const handleToggleSearch = async () => {
  await openSearch()
  // Фокусируемся на поле ввода через ref дочернего компонента
  await nextTick()
  searchCardRef.value?.searchField?.$el?.querySelector('input')?.focus()
}

// Обработка открытия QR сканера
const handleOpenQr = () => {
  openQrScanner()
}

// Полный сброс состояния
const handleReset = () => {
  resetSearch()
  resetToInitial()
  // Очищаем поле поиска в дочернем компоненте
  if (searchCardRef.value) {
    searchCardRef.value.searchId = ''
  }
}

// Обработка сканирования QR кода
const handleQrScanned = async (scannedCode: string) => {
  closeAll()
  await searchById(scannedCode)
}

// Закрытие QR сканера
const handleQrClose = () => {
  closeAll()
}

// Функция для повторного сканирования
const handleScanAgain = () => {
  resetSearch()
  openQrScanner()
}
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
              <DocumentInfoCard
                v-if="documentData"
                :document-data="documentData"
                @reset="handleReset"
                @scan-again="handleScanAgain"
              />

              <!-- QR SCANNER UI -->
              <QRScannerCard
                v-else-if="showQrScanner"
                :show="true"
                @close="handleQrClose"
                @scanned="handleQrScanned"
              />

              <!-- SEARCH UI -->
              <SearchCard
                v-else
                ref="searchCardRef"
                :show-search="showSearch"
                :loading="loading"
                :error="error"
                :error-type="errorType"
                @search="handleSearch"
                @toggle-search="handleToggleSearch"
                @open-qr="handleOpenQr"
              />
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
</style>

