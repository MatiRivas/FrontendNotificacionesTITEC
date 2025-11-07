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
  PAYMENT_DISPUTE: '/assets/icons/payment-issue.svg',
  GENERIC: '/assets/icons/notification.svg',
};

// Paleta compacta
const GREEN_MAIN = '#386641';
const GREEN_LIGHT = '#6A994E';
const BLUE_TEAL = '#2A9D8F';
const ORANGE = '#E76F51';
const ERROR = '#D64545';
const NEUTRAL = '#6B7280';

export const kindToColor: Record<NotificationKind, string> = {
  ORDER_CREATED: GREEN_LIGHT,
  ORDER_CANCELED: ERROR,
  ORDER_SHIPPED: BLUE_TEAL,
  ORDER_STATUS_UPDATED: GREEN_MAIN,
  PAYMENT_CONFIRMED: GREEN_MAIN,
  PAYMENT_STATUS_CHANGED: BLUE_TEAL,
  PAYMENT_ISSUE: ORANGE,
  PAYMENT_DISPUTE: ORANGE,
  GENERIC: NEUTRAL,
};

export const kindToLabel: Record<NotificationKind, string> = {
  ORDER_CREATED: 'Nueva compra',
  ORDER_CANCELED: 'Compra cancelada',
  ORDER_SHIPPED: 'Pedido enviado',
  ORDER_STATUS_UPDATED: 'Cambio de estado del pedido',
  PAYMENT_CONFIRMED: 'Pago confirmado',
  PAYMENT_STATUS_CHANGED: 'Estado de pago',
  PAYMENT_ISSUE: 'Problema con pago',
  PAYMENT_DISPUTE: 'Disputa de pago',
  GENERIC: 'Notificación',
};