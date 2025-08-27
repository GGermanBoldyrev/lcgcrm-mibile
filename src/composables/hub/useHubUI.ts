import { ref, nextTick } from 'vue'

export function useHubUI() {
  const showSearch = ref(false)
  const showQrScanner = ref(false)
  const searchField = ref()

  const openSearch = async () => {
    showSearch.value = true
    await nextTick()
    searchField.value?.$el?.querySelector('input')?.focus()
  }

  const openQrScanner = () => {
    if (showSearch.value) {
      showSearch.value = false
    }
    showQrScanner.value = true
  }

  const closeAll = () => {
    showSearch.value = false
    showQrScanner.value = false
  }

  const resetToInitial = () => {
    closeAll()
  }

  return {
    showSearch,
    showQrScanner,
    searchField,
    openSearch,
    openQrScanner,
    closeAll,
    resetToInitial
  }
}
