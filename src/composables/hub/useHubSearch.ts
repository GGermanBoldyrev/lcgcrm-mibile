import { reactive, toRefs } from 'vue';
import { api } from '@/shared/api';
import type { DocumentData } from '@/types/hub';

// Создаем интерфейс для состояния нашего composable
interface SearchState {
  data: DocumentData | null;
  loading: boolean;
  error: string;
  errorType: 'error' | 'warning';
  statusChanging: boolean;
}

export function useHubSearch() {
  // Используем reactive для группировки связанного состояния
  const state = reactive<SearchState>({
    data: null,
    loading: false,
    error: '',
    errorType: 'error',
    statusChanging: false,
  });

  const searchById = async (code: string) => {
    if (!code) return;

    state.loading = true;
    state.error = '';
    state.data = null;

    try {
      // Ожидаем, что сам `response.data` будет типа DocumentData
      const response = await api.post<DocumentData>('/mobile/barcode/info', { code });
      // Присваиваем данные напрямую из response.data
      state.data = response.data;
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

  const resetSearch = () => {
    state.data = null;
    state.error = '';
  };

  // Функция изменения статуса документа
  const updateStatus = async (statusId: string) => {
    if (!state.data?.status?.nextStatus || state.statusChanging) return;

    state.statusChanging = true;

    try {
      // Пока моковый запрос - имитируем API вызов
      console.log(`Изменение статуса документа ${state.data.rosterNum} на ${statusId}`);

      // Имитация задержки API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Обновляем статус документа локально
      if (state.data) {
        state.data.status = state.data.status.nextStatus!;
      }

      console.log('Статус успешно изменен');

      // В будущем здесь будет реальный API вызов:
      // await api.post('/mobile/document/status', {
      //   documentId: state.data.rosterNum,
      //   statusId
      // });

    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
      state.error = 'Ошибка при изменении статуса';
      state.errorType = 'error';
    } finally {
      state.statusChanging = false;
    }
  };

  // Возвращаем состояние (через toRefs) и методы
  return {
    ...toRefs(state),
    searchById,
    resetSearch,
    updateStatus,
  };
}
