<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import SearchCard from '@/components/hub/SearchCard.vue'
import { useHubUI } from '@/composables/hub/useHubUI'

const router = useRouter()

// Ссылка на SearchCard для управления фокусом
const searchCardRef = ref()

const {
  // Состояние
  showSearch,
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

  // Методы
  onFindClick,
  onQrScanClick,
  stopQrScan,
  handleScanAgain,
  handleSwitchCamera,
  searchById,
} = useHubUI(searchCardRef)

// Обработчик успешного поиска - переходим на страницу документа
const handleSearchSuccess = () => {
  if (documentData.value) {
    router.push({
      name: 'Document',
      params: { documentId: documentData.value.documentId }
    })
  }
}

// Следим за изменениями documentData
watch(() => documentData.value, (newData) => {
  if (newData) {
    handleSearchSuccess()
  }
})
</script>

<template>
  <v-main>
    <v-container>
      <v-row>
        <v-col cols="12" md="8" lg="6">
          <v-card class="hub-card glossy" elevation="8">
            <v-card-text class="pa-6">
              <!-- QR SCANNER UI -->
              <div v-if="showQrScanner" class="qr-scanner-container">
                <div class="qr-scanner-header mb-4">
                  <div class="d-flex align-center justify-space-between">
                    <h3 class="text-h6 font-weight-bold mb-0">Сканирование QR-кода</h3>
                    <v-btn
                      icon="mdi-close"
                      variant="text"
                      size="small"
                      @click="stopQrScan"
                    />
                  </div>
                </div>

                <div class="qr-scanner-content">
                  <div v-if="qrLoading" class="qr-loading text-center py-8">
                    <v-progress-circular indeterminate size="64" color="primary" />
                    <p class="text-body-1 mt-4 mb-0">Загрузка камеры...</p>
                  </div>

                  <div v-else-if="qrError" class="qr-error text-center py-8">
                    <v-icon size="64" color="error" class="mb-4">mdi-camera-off</v-icon>
                    <p class="text-body-1 mb-4">{{ qrError }}</p>
                    <v-btn
                      v-if="!hasPermission"
                      color="primary"
                      @click="handleScanAgain"
                    >
                      Разрешить доступ к камере
                    </v-btn>
                    <v-btn
                      v-else
                      color="primary"
                      @click="handleScanAgain"
                    >
                      Попробовать снова
                    </v-btn>
                  </div>

                  <div v-else-if="isScanning" class="qr-video-container">
                    <video
                      ref="videoElement"
                      autoplay
                      playsinline
                      muted
                      class="qr-video"
                    />
                    <div class="qr-overlay">
                      <div class="qr-frame"></div>
                      <p class="text-body-2 text-center mt-4 mb-0 text-white">
                        Наведите камеру на QR-код
                      </p>
                    </div>
                  </div>

                  <div class="qr-controls mt-4">
                    <v-btn
                      v-if="hasPermission && currentFacingMode === 'environment'"
                      block
                      variant="outlined"
                      color="secondary"
                      prepend-icon="mdi-camera-flip"
                      @click="handleSwitchCamera"
                    >
                      Переключить камеру
                    </v-btn>
                  </div>
                </div>
              </div>

              <!-- SEARCH UI -->
              <SearchCard
                v-else
                ref="searchCardRef"
                :show-search="showSearch"
                :loading="loading"
                :error="error"
                :error-type="errorType"
                @search="searchById"
                @toggle-search="onFindClick"
                @open-qr="onQrScanClick"
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

.qr-scanner-container {
  max-width: 400px;
}

.qr-video-container {
  position: relative;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}

.qr-video {
  width: 100%;
  height: auto;
  border-radius: var(--radius-md);
}

.qr-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.qr-frame {
  width: 200px;
  height: 200px;
  border: 2px solid rgba(var(--v-theme-primary), 0.8);
  border-radius: var(--radius-md);
  background: transparent;
}
</style>
