export interface DocumentStatus {
  id: string;
  name: string;
  presentation: string;
  style: 'primary' | 'success' | 'warning' | 'danger'; // Используем литеральные типы для стилей
  nextStatus?: DocumentStatus | null; // Следующий статус, если есть
}

export interface DocumentInfo {
  comment: string | null;
  name: string;
}

export interface DocumentAddress {
  address: string;
  comment: string | null;
  contact: string | null;
}

export interface DocumentMeta {
  createdAt: string; // ISO-строка даты
  express: boolean;
  photos: null;
  documentId: string;
}

// Главный интерфейс для всего документа
export interface DocumentData {
  documentId: string;
  meta: DocumentMeta;
  info: DocumentInfo;
  address: DocumentAddress;
  status: DocumentStatus;
  shipping: {
    bdz: boolean;
    deliveryPriority: boolean;
    edi: boolean;
    isAR: boolean;
  };
}
