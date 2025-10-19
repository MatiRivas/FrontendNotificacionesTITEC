// src/utils/helpers.ts
import { NotificationKind } from '../types/notifications';

export const kindToIcon: Record<NotificationKind, string> = {
  ORDER_CREATED: '/assets/icons/order-created.svg',
  ORDER_CANCELED: '/assets/icons/order-canceled.svg',
  ORDER_SHIPPED: '/assets/icons/order-shipped.svg',
  ORDER_STATUS_UPDATED: '/assets/icons/order-status.svg',
  PAYMENT_CONFIRMED: '/assets/icons/payment-ok.svg',
  PAYMENT_STATUS_CHANGED: '/assets/icons/payment-status.svg',
  PAYMENT_ISSUE: '/assets/icons/payment-issue.svg',
  GENERIC: '/assets/icons/notification.svg',
};

export const kindToColor: Record<NotificationKind, string> = {
  ORDER_CREATED: 'var(--color-turquesa)',
  ORDER_CANCELED: '#d32f2f',
  ORDER_SHIPPED: 'var(--color-blue)',
  ORDER_STATUS_UPDATED: 'var(--color-darkgreen)',
  PAYMENT_CONFIRMED: '#2e7d32',
  PAYMENT_STATUS_CHANGED: 'var(--color-blue)',
  PAYMENT_ISSUE: '#ed6c02',
  GENERIC: '#6b7280',
};

export const kindToLabel: Record<NotificationKind, string> = {
  ORDER_CREATED: 'Nueva compra',
  ORDER_CANCELED: 'Compra cancelada',
  ORDER_SHIPPED: 'Pedido enviado',
  ORDER_STATUS_UPDATED: 'Cambio de estado del pedido',
  PAYMENT_CONFIRMED: 'Pago confirmado',
  PAYMENT_STATUS_CHANGED: 'Estado de pago',
  PAYMENT_ISSUE: 'Problema con pago',
  GENERIC: 'Notificación',
};
