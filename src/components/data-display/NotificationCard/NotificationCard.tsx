// src/components/data-display/NotificationCard/NotificationCard.tsx
import { NotifCardBase } from '../../ui/NotifCardBase';
import { StatusChip } from '../../ui/StatusChip';
import { InfoBanner } from '../../ui/InfoBanner';
import { formatAmount, formatDateTime } from '../../../utils/formatters';
import type { Notification } from '../../../types/notifications';

type Props = { notif: Notification };

export default function NotificationCard({ notif }: Props) {
  const subtitle = formatDateTime(notif.createdAt);
  const metaRight = <StatusChip kind={notif.kind} notif={notif} />;

  return (
    <NotifCardBase kind={notif.kind} title={notif.title} subtitle={subtitle} metaRight={metaRight}>
      {/* Ejemplo: mostrar monto si existe */}
      {notif.meta?.amount != null ? (
        <div style={{ marginTop: 4, fontSize: 13, color: 'var(--mui-palette-text-secondary)' }}>
          Monto: {formatAmount(notif.meta.amount)}
        </div>
      ) : null}

      {/* Banner para fallback email (HDU6) */}
      <InfoBanner
        show={notif.kind === 'PAYMENT_STATUS_CHANGED' && (notif.meta as any)?.emailSent === false}
        sx={{ mt: 1 }}
      />
    </NotifCardBase>
  );
}