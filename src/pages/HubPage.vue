<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import BaseOutlinedTextField from '@/components/base/BaseOutlinedTextField.vue'
import { api } from '@/shared/api'

const searchId = ref('')
const loading = ref(false)
const showSearch = ref(false)
const searchField = ref()
const error = ref('')
const errorType = ref('error')

// New state to hold the fetched document data
const documentData = ref<any>(null)

const isReady = () => searchId.value.trim().length > 0 && !loading.value

const searchById = async () => {
  const code = searchId.value.trim()
  if (!code) {
    return
  }

  try {
    loading.value = true
    error.value = ''
    documentData.value = null // Clear previous results on new search
    errorType.value = 'error'

    const { data } = await api.post('/mobile/barcode/info', { code })

    // --- THIS IS THE KEY CHANGE ---
    // On success, store the data to be displayed
    documentData.value = data
    console.log(data)

  } catch (e: any) {
    const status = e.response?.status
    const errorCode = e.response?.data?.code || e.response?.data?.error
    if (status === 404 || errorCode === 'not_found') {
      errorType.value = 'warning'
      error.value = e.response?.data?.message || 'Код не найден'
    } else if (status === 422 || status === 500 || errorCode === 'invalid_code') {
      errorType.value = 'error'
      error.value = e.response?.data?.message || e.response?.data?.error || 'Ошибка запроса'
    } else {
      errorType.value = 'error'
      error.value = e.response?.data?.message || e.response?.data?.error || e.message || 'Ошибка запроса'
    }
    console.log('[API] Error:', e.response?.data || e.message)
  } finally {
    loading.value = false
  }
}

// Function to reset the view and search again
const resetSearch = () => {
  documentData.value = null
  searchId.value = ''
  error.value = ''
  // Focus the input again for better UX
  nextTick(() => {
    searchField.value?.$el?.querySelector('input')?.focus()
  })
}

const onFindClick = async () => {
  if (!showSearch.value) {
    showSearch.value = true
    await nextTick()
    // Force focus to open keyboard
    searchField.value?.$el?.querySelector('input')?.focus()
    return
  }
  await searchById()
}

// Helper to format the date nicely
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
</script>

<template>
  <v-main>
    <v-container>
      <!-- Main Card -->
      <v-row>
        <v-col cols="12" md="8" lg="6">
          <v-card class="hub-card glossy" elevation="8" v-motion :initial="{ opacity: 0, y: 40, scale: 0.9 }"
            :enter="{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 250, damping: 20, duration: 500 } }">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-6">
                <v-avatar size="80" color="primary" class="mr-4">
                  <!-- Change icon if data is loaded -->
                  <v-icon size="40" color="white">{{ documentData ? 'mdi-file-check-outline' :
                    'mdi-file-document-outline' }}</v-icon>
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
              <div v-if="documentData" class="result-display" v-motion-fade>
                <v-list lines="8" class="bg-transparent">
                  <v-list-item>
                    <template #prepend><v-icon color="primary">mdi-list-status</v-icon></template>
                    <v-list-item-title>Текущий статус</v-list-item-title>
                    <v-list-item-subtitle>{{ documentData.status.name }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template #prepend><v-icon color="primary">mdi-calendar-clock</v-icon></template>
                    <v-list-item-title>Дата создания</v-list-item-title>
                    <v-list-item-subtitle>{{ formattedDate }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template #prepend><v-icon color="primary">mdi-information-outline</v-icon></template>
                    <v-list-item-title>Наименование</v-list-item-title>
                    <v-list-item-subtitle class="text-wrap">{{ documentData.info.name }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template #prepend><v-icon color="primary">mdi-comment-processing-outline</v-icon></template>
                    <v-list-item-title>Особые условия</v-list-item-title>
                    <v-list-item-subtitle class="text-wrap">{{ documentData.info.comment }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template #prepend><v-icon color="primary">mdi-map-marker-outline</v-icon></template>
                    <v-list-item-title>Адрес доставки</v-list-item-title>
                    <v-list-item-subtitle class="text-wrap">{{ documentData.address.address }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template #prepend><v-icon color="primary">mdi-comment-text-outline</v-icon></template>
                    <v-list-item-title>Комментарий</v-list-item-title>
                    <v-list-item-subtitle class="text-wrap">{{ documentData.address.comment }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template #prepend><v-icon color="primary">mdi-phone-outline</v-icon></template>
                    <v-list-item-title>Контакты</v-list-item-title>
                    <v-list-item-subtitle class="text-wrap">{{ documentData.address.contact }}</v-list-item-subtitle>
                  </v-list-item>

                </v-list>

                <v-divider class="my-4" />

                <v-btn block variant="outlined" color="secondary" size="large" prepend-icon="mdi-magnify" class="glossy"
                  style="border-radius: var(--radius-md);" @click="resetSearch">
                  Искать снова
                </v-btn>
              </div>

              <!-- SEARCH UI -->
              <div v-else class="hub-actions">
                <v-expand-x-transition>
                  <div v-if="showSearch" class="search-row" v-motion :initial="{ opacity: 0, x: -20 }"
                    :enter="{ opacity: 1, x: 0, transition: { duration: 350 } }">
                    <BaseOutlinedTextField ref="searchField" v-model="searchId" placeholder="Введите номер документа"
                      class="search-input mb-4" :disabled="loading" @keyup.enter="searchById" />
                    <div v-if="!loading" class="search-append-external mb-4 glossy"
                      :class="{ 'search-append-external--disabled': !isReady() }" role="button"
                      :aria-label="'Найти документ'" tabindex="0" @click.stop="isReady() && searchById()"
                      @keyup.enter.stop="isReady() && searchById()">
                      <v-icon size="22" :color="isReady() ? 'white' : 'grey'">mdi-magnify</v-icon>
                    </div>
                    <div v-else class="search-append-external mb-4 search-append-external--loading" aria-live="polite"
                      aria-busy="true">
                      <v-progress-circular indeterminate size="22" width="3" color="white" />
                    </div>
                  </div>
                </v-expand-x-transition>

                <!-- Error under search field -->
                <v-expand-transition>
                  <v-alert v-if="error" :type="errorType" variant="tonal" density="compact"
                    class="mb-4 glossy rounded-base-md">
                    {{ error }}
                  </v-alert>
                </v-expand-transition>

                <div v-if="!showSearch" v-motion :initial="{ opacity: 0 }"
                  :enter="{ opacity: 1, transition: { duration: 300 } }">
                  <v-btn block color="primary" size="large" prepend-icon="mdi-file-search" class="mb-4 glossy"
                    style="border-radius: var(--radius-md);" :loading="loading" :disabled="loading"
                    @click="onFindClick">
                    Найти документ
                  </v-btn>
                </div>

                <v-btn block variant="outlined" color="secondary" size="large" prepend-icon="mdi-qrcode-scan"
                  class="glossy" style="border-radius: var(--radius-md);" v-motion :initial="{ opacity: 0 }"
                  :enter="{ opacity: 1, transition: { duration: 400 } }">
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
  /* no right margin */
  border-radius: var(--radius-md);
  background: rgb(var(--v-theme-primary)) !important;
  /* color fix over glossy */
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

/* Styles for the new data display section */
.result-display {
  max-width: 450px;
}

.text-wrap {
  white-space: normal;
}
</style>
