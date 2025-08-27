<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue'
import BaseOutlinedTextField from '@/components/base/BaseOutlinedTextField.vue'

const props = defineProps<{
  showSearch: boolean
  loading: boolean
  error: string | null
  errorType: string
}>()

const emit = defineEmits<{
  search: [id: string]
  'toggle-search': []
  'open-qr': []
}>()

const searchId = ref('')
const searchField = ref()

const isReady = computed(() =>
  searchId.value.trim().length > 0 && !props.loading
)

const handleSearch = () => {
  if (isReady.value) {
    emit('search', searchId.value.trim())
  }
}

const handleFindClick = () => {
  if (!props.showSearch) {
    emit('toggle-search')
    return
  }
  handleSearch()
}

const handleQrClick = () => {
  emit('open-qr')
}

defineExpose({
  searchField,
  searchId
})
</script>

<template>
  <div class="hub-actions">
    <v-expand-x-transition>
      <div
        v-if="showSearch"
        class="search-row"
        v-motion
        :initial="{
          opacity: 0,
          x: -30,
          scale: 0.95
        }"
        :enter="{
          opacity: 1,
          x: 0,
          scale: 1,
          transition: {
            duration: 400,
            type: 'spring',
            stiffness: 200,
            damping: 25
          }
        }"
      >
        <BaseOutlinedTextField
          ref="searchField"
          v-model="searchId"
          placeholder="Введите номер документа"
          class="search-input mb-4"
          :disabled="loading"
          @keyup.enter="handleSearch"
        />
        <div
          v-if="!loading"
          class="search-append-external mb-4 glossy"
          :class="{ 'search-append-external--disabled': !isReady }"
          role="button"
          :aria-label="'Найти документ'"
          tabindex="0"
          @click.stop="handleSearch"
          @keyup.enter.stop="handleSearch"
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
          <v-icon size="22" :color="isReady ? 'white' : 'grey'">mdi-magnify</v-icon>
        </div>
        <div
          v-else
          class="search-append-external mb-4 search-append-external--loading"
          aria-live="polite"
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
      <v-alert
        v-if="error"
        :type="errorType"
        variant="tonal"
        density="compact"
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

    <div
      v-if="!showSearch"
      v-motion
      :initial="{
        opacity: 0,
        y: 20
      }"
      :enter="{
        opacity: 1,
        y: 0,
        transition: {
          duration: 400,
          type: 'spring',
          stiffness: 200,
          damping: 25
        }
      }"
    >
      <v-btn
        block
        color="primary"
        size="large"
        prepend-icon="mdi-file-search"
        class="mb-4 glossy search-btn"
        style="border-radius: var(--radius-md);"
        :loading="loading"
        :disabled="loading"
        @click="handleFindClick"
      >
        Найти документ
      </v-btn>
    </div>

    <v-btn
      block
      variant="outlined"
      color="secondary"
      size="large"
      prepend-icon="mdi-qrcode-scan"
      class="glossy qr-btn"
      style="border-radius: var(--radius-md);"
      @click="handleQrClick"
      :disabled="loading"
      v-motion
      :initial="{
        opacity: 0,
        y: 20
      }"
      :enter="{
        opacity: 1,
        y: 0,
        transition: {
          duration: 400,
          delay: 100,
          type: 'spring',
          stiffness: 200,
          damping: 25
        }
      }"
    >
      Сканировать QR
    </v-btn>
  </div>
</template>

<style scoped>
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
