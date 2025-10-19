// src/types/notifications.ts

/** Actor (opcional por si lo necesitas en otras partes) */
export type Actor = 'buyer' | 'seller';

/** Tipos de evento que llegan desde el backend (histórico) contrato con backend*/
export type EventType =
  | 'order_created'
  | 'order_shipped'
  | 'order_status_updated'
  | 'payment_confirmed'
  | 'payment_status_changed'
  | 'payment_issue'
  | string; // abre para eventos nuevos


// === Canon frontend (UPPER_SNAKE_CASE) para UI/helpers ===
export type NotificationKind =
  | 'ORDER_CREATED'
  | 'ORDER_CANCELED'
  | 'ORDER_SHIPPED'
  | 'ORDER_STATUS_UPDATED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_STATUS_CHANGED'
  | 'PAYMENT_ISSUE'
  | 'GENERIC';


/** Canales posibles; abrimos a string por compatibilidad hacia adelante */
export type Channel = 'internal' | 'email' | 'push' | string;

/** Estado de entrega del canal */
export type DeliveryStatus = 'sent' | 'failed' | 'queued' | string;

/** Metadatos extendidos que usamos en el front */
export interface NotificationMeta {
  /** Marcamos si originalmente venía por push, pero lo normalizamos a internal */
  amount?: number;
  estadoEntrega?: string;
  wasPush?: boolean;
  /** Guardamos el canal original por trazabilidad (email/push/internal/...) */
  originalChannel?: string;

  /** Campos varios que vienen del backend en notificaciones internas */
  isInternalFallback?: boolean;
  originalChannelFailureReason?: string;
  rejectionReason?: string;
  orderId?: string;
  paymentId?: string;
  disputeId?: string;
  evidenceUrl?: string;
  responseDeadline?: string;
  retryUrl?: string;

  /** Abre la puerta a otros metadatos que aún no tipamos */
  [key: string]: unknown;
}

/** Tipo normalizado que usa toda la UI */
export interface Notification {
  id: string;

  // Equivalencias entre fuentes: eventType → kind
  kind: NotificationKind;

  // Texto principal/secundario
  title: string; // subject | title
  body?: string;  // content | subject

  // Canal y estado
  channel?: Channel;
  status?: DeliveryStatus;

  // Tiempos
  createdAt: string; // preferente
  sentAt?: string;

  // Lectura (aplica a internal)
  isRead?: boolean;

  // Metadatos
  meta?: NotificationMeta;
}

/** ================== Tipos CRUDOS del backend ================== */
/** Histórico por usuario: GET /notifications/user/:userId */

// === Tipos "raw" desde endpoints del backend ===
export interface RawUserNotification {
  id: string;
  eventType: EventType;
  subject: string;
  channel: Channel;         // puede ser 'push'
  status: DeliveryStatus;
  sentAt: string;           // ISO
}


/** Internas no leídas: GET /notifications/user/:userId/internal */

export interface RawInternalNotification {
  _id: string;
  title: string;
  content?: string;
  status: DeliveryStatus;
  createdAt: string;
  sentAt?: string;
  isRead: boolean;
  metadata?: Record<string, unknown>; // si ya tienes un shape, úsalo
}


/** Preferencias de usuario */
export interface UserPreferences {
  userId: string;
  preferredChannels: Channel[];     // ["email","push","internal"]...
  enableNotifications: boolean;
  channelSettings: Record<string, unknown>;
  notificationTypes: string[];      // ["order","payment","shipping"]
  lastUpdated: string;              // ISO
}