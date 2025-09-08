import { ref, nextTick, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHubSearch } from './useHubSearch'
import { useQrScannerUI } from './useQrScannerUI'
import type { DisplayItem, ShippingFlags } from '@/types/hub'

// Импорты иконок
import diamondIcon from '@/assets/images/icons/hub/shippingStatuses/diamond.svg'
import emailIcon from '@/assets/images/icons/hub/shippingStatuses/email.png'
import gavelIcon from '@/assets/images/icons/hub/shippingStatuses/gavel.svg'
import gavelbIcon from '@/assets/images/icons/hub/shippingStatuses/gavelb.svg'

export function useHubUI(searchCardRef?: any) {
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
    searchByBarcode,
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
      // Используем ссылку на SearchCard если доступна
      const fieldRef = searchCardRef?.value?.searchField || searchField.value
      fieldRef?.$el?.querySelector('input')?.focus()
      return
    }
    await searchById(searchId.value.trim())
  }

  // Reset с дополнительным UX-фокусом
  const handleReset = async () => {
    resetSearch()
    searchId.value = ''
    closeQrScanner()

    // Показываем поле поиска и ставим фокус
    showSearch.value = true
    await nextTick()
    // Используем ссылку на SearchCard если доступна
    const fieldRef = searchCardRef?.value?.searchField || searchField.value
    fieldRef?.$el?.querySelector('input')?.focus()
  }

  // QR Scanner functions
  const onQrScanClick = async () => {
    if (showSearch.value) {
      showSearch.value = false
    }

    await openQrScanner(async (scannedCode: string) => {
      // Выполняем поиск по barcode endpoint
      await searchByBarcode(scannedCode)
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
      await searchByBarcode(scannedCode)
    })
  }

  // Генерация HTML строки для статусных иконок
  const generateShippingStatusHTML = (shipping: ShippingFlags): string => {
    const icons: string[] = []

    // Функция для создания иконки с CSS классами
    const createIcon = (src: string, isActive: boolean, alt: string) => {
      const className = isActive ? 'activeImg' : 'activeImg icon-inactive'
      return `<img src="${src}" class="${className}" alt="${alt}" style="width: 35px; height: 35px; margin-right: 8px;" />`
    }

    // Email icon (edi)
    if (shipping.edi !== null) {
      icons.push(createIcon(emailIcon, shipping.edi, 'EDI'))
    }

    // Diamond icon (deliveryPriority)
    if (shipping.deliveryPriority !== null) {
      icons.push(createIcon(diamondIcon, shipping.deliveryPriority, 'Priority'))
    }

    // Gavel icon (isAR/bdz logic)
    if (shipping.isAR !== null || shipping.bdz !== null) {
      let src = gavelIcon
      let isActive = false

      if (shipping.isAR) {
        src = gavelIcon
        isActive = true
      } else if (shipping.bdz) {
        src = gavelbIcon
        isActive = true
      }

      icons.push(createIcon(src, isActive, 'Legal'))
    }

    return `<div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">${icons.join('')}</div>`
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
  const displayItems = computed((): DisplayItem[] => {
    if (!documentData.value) return []

    const shippingFlags = documentData.value.shippingFlags

    const items: DisplayItem[] = [
      {
        icon: 'mdi-list-status',
        label: 'Текущий статус',
        value: documentData.value.status?.name || null,
      },
      {
        icon: 'mdi-calendar-clock',
        label: 'Дата создания',
        value: formattedDate.value,
      },
      {
        icon: 'mdi-information-outline',
        label: 'Наименование',
        value: documentData.value.info?.name || null,
      },
      {
        icon: 'mdi-comment-processing-outline',
        label: 'Особые условия',
        value: documentData.value.info?.comment || null,
      },
      {
        icon: 'mdi-map-marker-outline',
        label: 'Адрес доставки',
        value: documentData.value.address?.address || null,
      },
      {
        icon: 'mdi-comment-text-outline',
        label: 'Комментарий',
        value: documentData.value.address?.comment || null,
      },
      {
        icon: 'mdi-phone-outline',
        label: 'Контакты',
        value: documentData.value.address?.contact || null,
      },
    ]

    if (shippingFlags) {
      items.push({
        icon: 'mdi-truck-delivery-outline',
        label: 'Статусы доставки',
        value: generateShippingStatusHTML(shippingFlags)
      })
    }

    return items.filter(item => item.value)
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
