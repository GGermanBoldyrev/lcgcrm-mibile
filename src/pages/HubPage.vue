<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import BaseOutlinedTextField from '@/components/base/BaseOutlinedTextField.vue'
import { useHubSearch } from '@/composables/hub/useHubSearch'

const showSearch = ref(false)
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
  nextTick(() => {
    searchField.value?.$el?.querySelector('input')?.focus()
  })
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

                <v-btn
                  block
                  variant="outlined"
                  color="secondary"
                  size="large"
                  prepend-icon="mdi-magnify"
                  class="glossy"
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
                  class="glossy qr-btn" style="border-radius: var(--radius-md);" v-motion :initial="{
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
</style>
