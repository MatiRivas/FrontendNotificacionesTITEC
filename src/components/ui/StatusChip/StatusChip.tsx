import { Chip } from '@mui/material';
import type { Notification, NotificationKind } from '../../../types/notifications';

/**
 * Chip de estado/contexto para una notificación.
 * - Ajusta color/label según el kind y meta disponible.
 */
type Props = {
  kind: NotificationKind;
  notif?: Notification;
  size?: 'small' | 'medium';
  sx?: any;
};

export default function StatusChip({ kind, notif, size = 'small', sx }: Props) {
  let label = 'Notificación';
  let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';

  switch (kind) {
    case 'PAYMENT_CONFIRMED':
      label = 'Pago confirmado';
      color = 'success';
      break;

    case 'PAYMENT_STATUS_CHANGED': {
      const outcome = notif?.meta && (notif.meta as any).paymentOutcome as 'accepted' | 'rejected' | undefined;
      if (outcome === 'accepted') {
        label = 'Pago aceptado';
        color = 'success';
      } else if (outcome === 'rejected') {
        label = 'Pago rechazado';
        color = 'error';
      } else {
        label = 'Estado de pago';
        color = 'info';
      }
      break;
    }

    case 'PAYMENT_ISSUE':
      label = 'Problema con pago';
      color = 'warning';
      break;

    case 'ORDER_CANCELED':
      label = 'Compra cancelada';
      color = 'error';
      break;

    case 'ORDER_SHIPPED':
      label = 'Pedido enviado';
      color = 'info';
      break;

    case 'ORDER_STATUS_UPDATED': {
      const newStatus = notif?.meta && (notif.meta as any).newStatus as string | undefined;
      label = newStatus ? `Estado: ${newStatus}` : 'Estado actualizado';
      color = 'info';
      break;
    }

    case 'ORDER_CREATED':
      label = 'Nueva compra';
      color = 'primary';
      break;

    default:
      label = 'Notificación';
      color = 'default';
  }

  return <Chip label={label} color={color} size={size} sx={sx} />;
}