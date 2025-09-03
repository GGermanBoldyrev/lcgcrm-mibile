import { computed } from 'vue'
import type { DocumentData } from '@/types/hub'

interface ButtonConfig {
  text: string
  event: string
  payload?: any
  props?: Record<string, any>
  class?: string
  style?: string
}

export function useHubFloatingBar(documentData: any, statusChanging: any) {
  // Конфигурация кнопок для Hub страницы
  const buttonRows = computed((): ButtonConfig[][] => {
    if (!documentData.value) return []

    const rows: ButtonConfig[][] = []

         // Первый ряд: Сменить статус (если есть следующий статус)
     if (documentData.value?.status?.nextStatus) {
       rows.push([
         {
           text: documentData.value.status.nextStatus.name,
           event: 'nextStatus',
           props: {
             block: true,
             color: 'success',
             size: 'large',
             'prepend-icon': 'mdi-arrow-right',
             loading: statusChanging.value,
             disabled: statusChanging.value,
           },
         },
       ])
     }

         // Второй ряд: Искать снова + Сканировать
     rows.push([
       {
         text: 'Искать снова',
         event: 'reset',
         props: {
           variant: 'outlined',
           color: 'secondary',
           size: 'large',
           'prepend-icon': 'mdi-magnify',
         },
       },
       {
         text: 'Сканировать',
         event: 'scanAgain',
         props: {
           variant: 'outlined',
           color: 'primary',
           size: 'large',
           'prepend-icon': 'mdi-qrcode-scan',
         },
       },
     ])

    return rows
  })

  return {
    buttonRows,
  }
}
