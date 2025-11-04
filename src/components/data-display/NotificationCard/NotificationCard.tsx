// src/components/data-display/NotificationCard/NotificationCard.tsx
import { NotifCardBase } from '../../ui/NotifCardBase';
import { StatusChip } from '../../ui/StatusChip';
import { InfoBanner } from '../../ui/InfoBanner';
import { ActionBar } from '../../ui/ActionBar';
import { formatAmount, formatDateTime } from '../../../utils/formatters';
import type { Notification } from '../../../types/notifications';
import { Button, Stack, Typography } from '@mui/material';

type Props = { notif: Notification };

export default function NotificationCard({ notif }: Props) {
  const subtitle = formatDateTime(notif.createdAt);
  const metaRight = <StatusChip kind={notif.kind} notif={notif} />;

  const ActionLink = (props: { href?: string; label?: string }) =>
    props.href ? (
      <Button size="small" variant="outlined" color="primary" href={props.href}>
        {props.label ?? 'Ver detalle'}
      </Button>
    ) : null;

  switch (notif.kind) {
    case 'ORDER_CREATED': {
      return (
        <NotifCardBase kind={notif.kind} title={notif.title} subtitle={subtitle} metaRight={metaRight}>
          <Stack direction="row" spacing={1} alignItems="center">
            {notif.meta?.amount != null ? (
              <Typography variant="body2" color="text.secondary">
                Monto: {formatAmount(notif.meta.amount, notif.meta.currency ?? 'CLP')}
              </Typography>
            ) : null}
            <ActionLink href={notif.meta?.actionUrl} />
          </Stack>
        </NotifCardBase>
      );
    }

    case 'ORDER_SHIPPED': {
      return (
        <NotifCardBase kind={notif.kind} title={notif.title} subtitle={subtitle} metaRight={metaRight}>
          <Typography variant="body2" color="text.secondary">
            Vendedor: {notif.meta?.vendorName ?? '—'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enviado: {formatDateTime(notif.meta?.shippedAt ?? notif.createdAt)}
          </Typography>
          <ActionLink href={notif.meta?.actionUrl} />
        </NotifCardBase>
      );
    }

    case 'ORDER_STATUS_UPDATED': {
      return (
        <NotifCardBase kind={notif.kind} title={notif.title} subtitle={subtitle} metaRight={metaRight}>
          <Typography variant="body2" color="text.secondary">
            Estado: {notif.meta?.estadoPedido ?? 'Actualizado'}
          </Typography>
          <ActionLink href={notif.meta?.actionUrl} />
        </NotifCardBase>
      );
    }

    case 'PAYMENT_CONFIRMED': {
      return (
        <NotifCardBase kind={notif.kind} title={notif.title} subtitle={subtitle} metaRight={metaRight}>
          <Stack direction="row" spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Orden: {notif.meta?.orderId ?? '—'}
            </Typography>
            {notif.meta?.amount != null && (
              <Typography variant="body2" color="text.secondary">
                Monto: {formatAmount(notif.meta.amount, notif.meta.currency ?? 'CLP')}
              </Typography>
            )}
            {notif.meta?.buyerName && (
              <Typography variant="body2" color="text.secondary">
                Comprador: {notif.meta.buyerName}
              </Typography>
            )}
          </Stack>
          <ActionLink href={notif.meta?.actionUrl} />
        </NotifCardBase>
      );
    }

    case 'PAYMENT_STATUS_CHANGED': {
      const showFallback = notif.meta?.emailSent === false;
      return (
        <NotifCardBase kind={notif.kind} title={notif.title} subtitle={subtitle} metaRight={metaRight}>
          {showFallback && (
            <InfoBanner
              title="No se pudo enviar el correo"
              description="Te avisamos por aquí para que no dependas del email."
              severity="warning"
            />
          )}
          <Stack direction="row" spacing={2}>
            {notif.meta?.amount != null && (
              <Typography variant="body2" color="text.secondary">
                Monto: {formatAmount(notif.meta.amount, notif.meta.currency ?? 'CLP')}
              </Typography>
            )}
            {notif.meta?.rejectionReason && (
              <Typography variant="body2" color="error">
                Motivo: {notif.meta.rejectionReason}
              </Typography>
            )}
          </Stack>
          <ActionLink href={notif.meta?.actionUrl} />
        </NotifCardBase>
      );
    }

    case 'PAYMENT_ISSUE':
    case 'PAYMENT_DISPUTE': {
      return (
        <NotifCardBase kind={notif.kind} title={notif.title} subtitle={subtitle} metaRight={metaRight}>
          <Stack spacing={1}>
            {notif.meta?.issueType && (
              <Typography variant="body2" color="text.secondary">
                Tipo de problema: {String(notif.meta.issueType)}
              </Typography>
            )}
            {notif.meta?.amount != null && (
              <Typography variant="body2" color="text.secondary">
                Monto afectado: {formatAmount(notif.meta.amount, notif.meta.currency ?? 'CLP')}
              </Typography>
            )}
            {notif.meta?.responseDeadline && (
              <Typography variant="body2" color={notif.meta?.urgentAction ? 'error' : 'text.secondary'}>
                Plazo límite: {formatDateTime(notif.meta.responseDeadline)}
              </Typography>
            )}
            <ActionBar
              actions={[
                notif.meta?.evidenceUrl ? { label: 'Subir evidencia', href: notif.meta.evidenceUrl } : null,
                notif.meta?.actionUrl ? { label: 'Ver disputa', href: notif.meta.actionUrl } : null,
              ].filter(Boolean) as any}
            />
          </Stack>
        </NotifCardBase>
      );
    }

    default:
      return <NotifCardBase kind={notif.kind} title={notif.title} subtitle={subtitle} metaRight={metaRight} />;
  }
}