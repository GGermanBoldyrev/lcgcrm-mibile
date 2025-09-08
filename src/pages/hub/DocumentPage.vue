<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HubDocumentCard from '@/components/hub/HubDocumentCard.vue'
import StatusConfirmDialog from '@/components/hub/StatusConfirmDialog.vue'
import FloatingActionBar from '@/components/common/FloatingActionBar.vue'
import { useHubUI } from '@/composables/hub/useHubUI'
import { useStatusConfirm } from '@/composables/hub/useStatusConfirm'
import { useHubFloatingBar } from '@/composables/hub/useHubFloatingBar'

const route = useRoute()
const router = useRouter()

// Получаем documentId из параметров маршрута
const documentId = computed(() => route.params.documentId as string)

const {
  // Состояние
  documentData,
  loading,
  error,
  errorType,
  statusChanging,

  // Computed
  displayItems,

  // Методы
  handleReset,
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

// Floating Action Bar конфигурация
const { buttonRows } = useHubFloatingBar(documentData, statusChanging)

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

// Обработчик успешной загрузки файлов
const handleFilesUploaded = (files: any[]) => {
  console.log('Загружено файлов:', files.length)
  files.forEach(file => {
    console.log(`Файл: ${file.name}, размер: ${file.size} байт`)
  })
}

// Загружаем документ при монтировании
watch(() => documentId.value, async (newDocumentId) => {
  if (newDocumentId) {
    await searchById(newDocumentId)
  }
}, { immediate: true })

// Если документ не найден, возвращаемся на поиск
watch(() => error.value, (newError) => {
  if (newError && errorType.value === 'error') {
    setTimeout(() => {
      router.push({ name: 'HubSearch' })
    }, 2000)
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
              <!-- LOADING STATE -->
              <div v-if="loading" class="text-center py-8">
                <v-progress-circular indeterminate size="64" color="primary" />
                <p class="text-body-1 mt-4 mb-0">Загрузка документа...</p>
              </div>

              <!-- ERROR STATE -->
              <div v-else-if="error" class="text-center py-8">
                <v-icon size="64" :color="errorType === 'error' ? 'error' : 'warning'" class="mb-4">
                  {{ errorType === 'error' ? 'mdi-alert-circle' : 'mdi-alert' }}
                </v-icon>
                <p class="text-body-1 mb-4">{{ error }}</p>
                <v-btn
                  color="primary"
                  @click="router.push({ name: 'HubSearch' })"
                >
                  Вернуться к поиску
                </v-btn>
              </div>

              <!-- DOCUMENT DATA -->
              <HubDocumentCard
                v-else-if="documentData"
                :document-data="documentData"
                :display-items="displayItems"
                :status-changing="statusChanging"
                :get-status-color="getStatusColor"
                @files-uploaded="handleFilesUploaded"
              />
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

    <!-- Floating Action Bar -->
    <FloatingActionBar
      :visible="!!documentData"
      :button-rows="buttonRows"
      @reset="handleReset"
      @scanAgain="router.push({ name: 'HubSearch' })"
      @nextStatus="handleNextStatus"
    />
  </v-main>
</template>

<style scoped>
.hub-card {
  border-radius: var(--radius-lg);
  border: 1px solid rgba(0, 0, 0, .06);
}
</style>
