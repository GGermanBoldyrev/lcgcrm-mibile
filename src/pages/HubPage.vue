<script setup lang="ts">
import { ref, nextTick } from 'vue'
import BaseOutlinedTextField from '@/components/base/BaseOutlinedTextField.vue'

const searchId = ref('')
const loading = ref(false)
const showSearch = ref(false)
const searchField = ref()

const isReady = () => searchId.value.trim().length > 0 && !loading.value

const mockSearchById = async () => {
  const id = searchId.value.trim()
  if (!id) {
    console.log('[Mock API] searchById: empty id, skip')
    return
  }
  try {
    loading.value = true
    console.log(`[Mock API] GET /mobile/registry/${id}`)
    await new Promise(resolve => setTimeout(resolve, 600))
    console.log('[Mock API] Response:', { success: true, id, title: `Реестр #${id}` })
  } catch (e) {
    console.log('[Mock API] Error:', e)
  } finally {
    loading.value = false
  }
}

const onFindClick = async () => {
  if (!showSearch.value) {
    showSearch.value = true
    await nextTick()
    searchField.value?.focus?.()
    return
  }
  await mockSearchById()
}
</script>

<template>
  <v-main>
    <v-container>
      <!-- Основная карточка -->
      <v-row>
        <v-col cols="12" md="8" lg="6">
          <v-card class="hub-card glossy" elevation="8" v-motion :initial="{
            opacity: 0,
            y: 40,
            scale: 0.9
          }" :enter="{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              type: 'spring',
              stiffness: 250,
              damping: 20,
              duration: 500
            }
          }">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-6">
                <v-avatar size="80" color="primary" class="mr-4">
                  <v-icon size="40" color="white">mdi-file-document-outline</v-icon>
                </v-avatar>
                <div>
                  <h2 class="text-h5 font-weight-bold mb-1">Канцелярия</h2>
                  <p class="text-body-1 text-medium-emphasis mb-0">Центр управления документами</p>
                </div>
              </div>

              <v-divider class="mb-6" />

              <div class="hub-actions">
                <v-expand-x-transition>
                  <div v-if="showSearch" class="search-row" v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0, transition: { duration: 350 } }">
                    <BaseOutlinedTextField
                      ref="searchField"
                      v-model="searchId"
                      placeholder="Введите номер реестра"
                      class="search-input mb-4"
                      :disabled="loading"
                      @keyup.enter="mockSearchById"
                    />
                    <div v-if="!loading" class="search-append-external mb-4 glossy"
                      :class="{ 'search-append-external--disabled': !isReady() }"
                      role="button"
                      :aria-label="'Найти реестр'"
                      tabindex="0"
                      @click.stop="isReady() && mockSearchById()"
                      @keyup.enter.stop="isReady() && mockSearchById()"
                    >
                      <v-icon size="22" :color="isReady() ? 'white' : 'grey'">mdi-magnify</v-icon>
                    </div>
                    <div v-else class="search-append-external mb-4 search-append-external--loading" aria-live="polite" aria-busy="true">
                      <v-progress-circular indeterminate size="22" width="3" color="white" />
                    </div>
                  </div>
                </v-expand-x-transition>

                <div v-if="!showSearch" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 300 } }">
                  <v-btn block color="primary" size="large" prepend-icon="mdi-file-search" class="mb-4 glossy"
                    style="border-radius: var(--radius-md);" :loading="loading" :disabled="loading" @click="onFindClick">
                    Найти реестр
                  </v-btn>
                </div>

                <v-btn block variant="outlined" color="secondary" size="large" prepend-icon="mdi-qrcode-scan"
                  class="glossy" style="border-radius: var(--radius-md);" v-motion :initial="{
                    opacity: 0
                  }" :enter="{
                    opacity: 1,
                    transition: {
                      duration: 400
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

/* Внешняя синяя кнопка справа от поля, не до самого края */
.search-append-external {
  height: 48px;
  min-width: 48px;
  padding: 0 16px;
  margin-left: 10px;
  margin-right: 0; /* без правого отступа */
  border-radius: var(--radius-md);
  background: rgb(var(--v-theme-primary)) !important; /* фикс цвета поверх glossy */
  box-shadow: 0 8px 18px rgba(0, 0, 0, .16);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform .12s ease, opacity .2s ease, background-color .2s ease, box-shadow .2s ease;
}

/* отключаем glossy wash для стабильного синего */
.search-append-external::before,
.search-append-external::after { display: none !important; }

.search-append-external:hover { transform: translateY(-1px); }
.search-append-external:active { transform: translateY(0); opacity: .94; background: rgb(var(--v-theme-primary)) !important; }

/* иконка всегда белая в активном состоянии */
.search-append-external :deep(.v-icon) { color: white !important; }

.search-append-external--disabled { background: rgba(var(--v-theme-primary), 0.25); box-shadow: none; opacity: .6; pointer-events: none; }

.search-append-external--loading {
  pointer-events: none;
  background: rgba(var(--v-theme-primary), 0.3) !important;
  box-shadow: none;
}
</style>
