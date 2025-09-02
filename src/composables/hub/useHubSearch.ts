import { reactive, toRefs } from 'vue';
import { api } from '@/shared/api';
import { useAuthStore } from '@/stores/auth';
import type { DocumentData } from '@/types/hub';

// Создаем интерфейс для состояния нашего composable
interface SearchState {
  data: DocumentData | null;
  loading: boolean;
  error: string;
  errorType: 'error' | 'warning';
  statusChanging: boolean;
  searchMethod: 'manual' | 'barcode' | null; // Способ получения данных
}

export function useHubSearch() {
  // Используем reactive для группировки связанного состояния
  const state = reactive<SearchState>({
    data: null,
    loading: false,
    error: '',
    errorType: 'error',
    statusChanging: false,
    searchMethod: null,
  });

  // Функция для поиска документа по коду (универсальная)
  const searchDocument = async (code: string, endpoint: string, method: 'manual' | 'barcode') => {
    if (!code) return;

    state.loading = true;
    state.error = '';
    state.data = null;
    state.searchMethod = method;

    try {
      // Ожидаем, что сам `response.data` будет типа DocumentData
      const response = await api.get<DocumentData>(`${endpoint}?code=${code}`);
      // Присваиваем данные и добавляем originalCode
      state.data = {
        ...response.data,
        originalCode: code
      };
    } catch (e: any) {
      const status = e.response?.status;
      const responseData = e.response?.data;
      const errorCode = responseData?.code || responseData?.error;

      if (status === 404 || errorCode === 'not_found') {
        state.errorType = 'warning';
        state.error = responseData?.message || 'Документ не найден';
      } else {
        state.errorType = 'error';
        state.error = responseData?.message || responseData?.error || e.message || 'Ошибка запроса';
      }
      console.log('[API] Error:', responseData || e.message);
    } finally {
      state.loading = false;
    }
  };

  // Ручной поиск документа по ID
  const searchById = async (code: string) => {
    await searchDocument(code, '/mobile/hub/document/manual/info', 'manual');
  };

  // Поиск документа по QR-коду (barcode)
  const searchByBarcode = async (code: string) => {
    await searchDocument(code, '/mobile/hub/document/barcode/info', 'barcode');
  };

  const resetSearch = () => {
    state.data = null;
    state.error = '';
    state.searchMethod = null;
  };

  // Функция изменения статуса документа
  const updateStatus = async (statusId: string) => {
    if (!state.data?.status?.nextStatus || state.statusChanging || !state.searchMethod) return;

    const authStore = useAuthStore();
    const userId = authStore.user?.id;

    if (!userId) {
      state.error = 'Не удалось получить ID пользователя';
      state.errorType = 'error';
      return;
    }

    state.statusChanging = true;

    try {
      // Определяем эндпоинт в зависимости от способа получения данных
      const endpoint = state.searchMethod === 'manual'
        ? '/hub/document/manual/status'
        : '/hub/document/barcode/status';

      // Подготавливаем тело запроса
      const requestBody = {
        code: state.data.originalCode,
        status: statusId,
        userId: userId.toString()
      };

      console.log(`Изменение статуса документа ${state.data.documentId} на ${statusId} через ${endpoint}`, requestBody);

      // Отправляем запрос на сервер
      await api.patch(endpoint, requestBody);

      // Обновляем статус документа локально
      if (state.data) {
        state.data.status = state.data.status.nextStatus!;
      }

      console.log('Статус успешно изменен');

    } catch (error: any) {
      console.error('Ошибка при изменении статуса:', error);
      const responseData = error.response?.data;
      state.error = responseData?.message || responseData?.error || 'Ошибка при изменении статуса';
      state.errorType = 'error';
    } finally {
      state.statusChanging = false;
    }
  };

  // Возвращаем состояние (через toRefs) и методы
  return {
    ...toRefs(state),
    searchById,
    searchByBarcode,
    resetSearch,
    updateStatus,
  };
}
