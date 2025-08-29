import { ref, nextTick, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHubSearch } from './useHubSearch'
import { useQrScannerUI } from './useQrScannerUI'

export function useHubUI() {
  const route = useRoute()
  const showSearch = ref(false)
  const searchField = ref()
  const searchId = ref('')

  const {
    data: documentData,
    loading,
    error,
    errorType,
    statusChanging,
    searchById,
    resetSearch,
    updateStatus,
  } = useHubSearch()

  const {
    showQrScanner,
    videoElement,
    isScanning,
    qrLoading,
    qrError,
    hasPermission,
    currentFacingMode,
    openQrScanner,
    closeQrScanner,
    reopenQrScanner,
    startRealQrScan,
    switchCamera
  } = useQrScannerUI()

  const isReady = computed(() =>
    searchId.value.trim().length > 0 && !loading.value
  )

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
    closeQrScanner()
  }

  // QR Scanner functions
  const onQrScanClick = async () => {
    if (showSearch.value) {
      showSearch.value = false
    }

    await openQrScanner(async (scannedCode: string) => {
      // Выполняем поиск с полученным кодом
      await searchById(scannedCode)
    })
  }

  // Остановка сканирования
  const stopQrScan = () => {
    closeQrScanner()
  }

  // Функция для повторного сканирования
  const handleScanAgain = () => {
    resetSearch()
    onQrScanClick()
  }

  // Переключение камеры
  const handleSwitchCamera = async () => {
    await switchCamera(async (scannedCode: string) => {
      await searchById(scannedCode)
    })
  }

  // Форматирование даты
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

  // Элементы для отображения
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

  // Проверяем query параметр при монтировании
  onMounted(() => {
    if (route.query.openQR === 'true') {
      // Небольшая задержка для того чтобы компоненты успели инициализироваться
      setTimeout(() => {
        onQrScanClick()
      }, 300)
    }
  })

  return {
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
    formattedDate,

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
  }
}
