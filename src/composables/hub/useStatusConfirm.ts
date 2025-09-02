import { ref } from 'vue'

export function useStatusConfirm() {
  const showConfirmDialog = ref(false)

  // Обработчик клика на кнопку смены статуса
  const requestStatusChange = () => {
    showConfirmDialog.value = true
  }

  // Подтверждение смены статуса
  const confirmStatusChange = (callback: () => Promise<void>) => {
    showConfirmDialog.value = false
    return callback()
  }

  // Отмена смены статуса
  const cancelStatusChange = () => {
    showConfirmDialog.value = false
  }

  return {
    showConfirmDialog,
    requestStatusChange,
    confirmStatusChange,
    cancelStatusChange
  }
}
