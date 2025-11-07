// src/types/notifications.ts

export type Actor = 'buyer' | 'seller';

// Backend "type" (opcional) para enriquecer títulos/mensajes
export type EventType =
  | 'order_created'
  | 'order_canceled'
  | 'order_shipped'
  | 'order_status_changed'
  | 'payment_confirmed'
  | 'payment_status'      // aceptado / rechazado
  | 'payment_issue'       // rechazado / reembolso / disputa
  | 'payment_dispute'
  | 'delivery_tracking'
  | string;

// Canon UI
export type NotificationKind =
  | 'ORDER_CREATED'
  | 'ORDER_CANCELED'
  | 'ORDER_SHIPPED'
  | 'ORDER_STATUS_UPDATED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_STATUS_CHANGED'
  | 'PAYMENT_ISSUE'
  | 'PAYMENT_DISPUTE'
  | 'GENERIC';

export type Channel = 'internal' | 'email' | 'sms' | 'push' | string;
export type DeliveryStatus = 'sent' | 'failed' | 'queued' | string;

// Estados que entrega el backend actual
export type EstadoEntrega = 'pendiente' | 'enviado' | 'recibido' | 'leido' | 'fallido';

/**
 * Notificación "cruda" devuelta por:
 *  - GET /api/notifications/user/:userId
 *  - GET /api/notifications/user-history/:userId
 */
export interface RawUserNotification {
  id_notificacion: number | string;
  fecha_hora: string; // ISO
  id_emisor?: number | string;
  id_receptor?: number | string;
  id_plantilla?: number;
  channel_ids?: number[]; // [1=email, 2=sms, 3=push]
  channels_used?: string[]; // user-history puede traerlo
  estado: EstadoEntrega; // 'leido' => isRead=true
  // enriquecimiento opcional desde backend:
  title?: string;
  message?: string;
  type?: EventType;
  metadata?: Record<string, unknown>;
}

// ---- Tipos UI ----
export interface NotificationMeta {
  // negocio
  orderId?: string;
  buyerName?: string;
  vendorName?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  // shipping / tracking
  shippedAt?: string;
  estadoPedido?: string;
  // pago / issues
  rejectionReason?: string;
  issueType?: 'rechazado' | 'reembolso' | 'disputa';
  disputeId?: string;
  evidenceUrl?: string;
  responseDeadline?: string;
  urgentAction?: boolean;
  // canal / fallback / navegación
  wasPush?: boolean;
  originalChannel?: string;
  isInternalFallback?: boolean;
  actionUrl?: string;
  emailSent?: boolean;
  // RAW para trazabilidad
  channel_ids?: number[];
  estado?: string;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  channel?: Channel;
  status?: DeliveryStatus;
  createdAt: string;
  sentAt?: string;
  isRead?: boolean;
  meta?: NotificationMeta;
}