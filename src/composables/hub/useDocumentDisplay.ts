import { computed, type ComputedRef } from 'vue'
import type { DocumentData } from '@/types/hub'

export function useDocumentDisplay(documentData: ComputedRef<DocumentData | null>) {
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
        type: 'status' as const
      },
      {
        icon: 'mdi-calendar-clock',
        label: 'Дата создания',
        value: formattedDate.value,
        type: 'text' as const
      },
      {
        icon: 'mdi-information-outline',
        label: 'Наименование',
        value: documentData.value.info?.name,
        type: 'text' as const
      },
      {
        icon: 'mdi-comment-processing-outline',
        label: 'Особые условия',
        value: documentData.value.info?.comment,
        type: 'text' as const
      },
      {
        icon: 'mdi-map-marker-outline',
        label: 'Адрес доставки',
        value: documentData.value.address?.address,
        type: 'text' as const
      },
      {
        icon: 'mdi-comment-text-outline',
        label: 'Комментарий',
        value: documentData.value.address?.comment,
        type: 'text' as const
      },
      {
        icon: 'mdi-phone-outline',
        label: 'Контакты',
        value: documentData.value.address?.contact,
        type: 'text' as const
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

  return {
    formattedDate,
    displayItems,
    getStatusColor
  }
}
