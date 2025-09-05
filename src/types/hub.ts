export interface DocumentStatus {
  id: string;
  name: string;
  presentation: string;
  style: 'primary' | 'success' | 'warning' | 'danger'; // Используем литеральные типы для стилей
  nextStatus?: DocumentStatus | null; // Следующий статус, если есть
}

export interface ShippingFlags {
  bdz: boolean;
  deliveryPriority: boolean;
  edi: boolean;
  isAR: boolean;
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

export interface DocumentCopy {
  url: string;
}

export interface DocumentMeta {
  createdAt: string; // ISO-строка даты
  express: boolean;
  documentId: string;
}

export interface DocumentData {
  documentId: string;
  meta: DocumentMeta;
  info: DocumentInfo;
  address: DocumentAddress;
  status: DocumentStatus;
  shippingFlags: ShippingFlags;
  copies: DocumentCopy[] | null;
}

// Элемент для отображения в UI
export interface DisplayItem {
  icon: string;
  label: string;
  value: string | null;
}

