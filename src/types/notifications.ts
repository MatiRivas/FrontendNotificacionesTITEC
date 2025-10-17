// src/types/notifications.ts
export type Actor = 'buyer' | 'seller';

export type NotificationKind =
  | 'ORDER_CREATED'
  | 'ORDER_CANCELED'
  | 'ORDER_SHIPPED'
  | 'ORDER_STATUS_UPDATED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_STATUS_CHANGED'
  | 'PAYMENT_ISSUE'
  | 'GENERIC'; // fallback si backend no envía tipo
export type PaymentIssueSubtype = 'REJECTED' | 'REFUND' | 'DISPUTE';
export type DeliverySubtype = 'DELIVERED' | 'IN_TRANSIT' | 'READY_FOR_PICKUP';

export interface Notification {
  id: string;
  kind: NotificationKind;
  subtype?: PaymentIssueSubtype | DeliverySubtype;
  actor?: Actor;                 // opcional si no viene del backend
  orderId?: string;
  paymentId?: string;
  shipmentId?: string;
  sellerId?: string;
  buyerId?: string;
  title: string;
  body: string;
  createdAt: string;             // ISO
  meta?: {
    amount?: number;
    vendorName?: string;
    emailSent?: boolean;
    deadlineAt?: string;
    actions?: string[];
    estadoEntrega?: string;      // estado de la notificación (ej. enviada/leída)
  };
}