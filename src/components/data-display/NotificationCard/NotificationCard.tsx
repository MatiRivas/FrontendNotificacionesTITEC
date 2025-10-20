// src/components/data-display/NotificationCard/NotificationCard.tsx
import { NotifCardBase } from '../../ui/NotifCardBase';
import { StatusChip } from '../../ui/StatusChip';
import { formatAmount, formatDateTime } from '../../../utils/formatters';
import type { Notification } from '../../../types/notifications';

type Props = { notif: Notification };

/**
 * Tarjeta de notificación.
 * En esta feature (buyer-confirmacion-compra) nos enfocamos en ORDER_CREATED.
 */
export default function NotificationCard({ notif }: Props) {
  const subtitle = formatDateTime(notif.createdAt);
  const metaRight = <StatusChip kind={notif.kind} notif={notif} />;

  switch (notif.kind) {
    case 'ORDER_CREATED': {
      // Tarjeta para “Confirmación de compra” (buyer).
      // Mostramos monto si viene en meta (opcional).
      return (
        <NotifCardBase
          kind={notif.kind}
          title={notif.title}
          subtitle={subtitle}
          metaRight={metaRight}
        >
          {notif.meta?.amount != null ? (
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: 'var(--mui-palette-text-secondary)',
              }}
            >
              Monto: {formatAmount(notif.meta.amount)}
            </div>
          ) : null}
        </NotifCardBase>
      );
    }

    default: {
      // Fallback genérico para otros tipos mientras avanzas con las siguientes features.
      return (
        <NotifCardBase
          kind={notif.kind}
          title={notif.title}
          subtitle={subtitle}
          metaRight={metaRight}
        />
      );
    }
  }
}