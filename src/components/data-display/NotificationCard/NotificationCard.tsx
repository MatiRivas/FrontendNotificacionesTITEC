// src/components/data-display/NotificationCard/NotificationCard.tsx
import { NotifCardBase } from '../../ui/NotifCardBase';
import { StatusChip } from '../../ui/StatusChip';
import { InfoBanner } from '../../ui/InfoBanner';
import { ActionBar } from '../../ui/ActionBar';
import { formatAmount, formatDateTime } from '../../../utils/formatters';
import type { Notification } from '../../../types/notifications';
import { Button, Stack, Typography } from '@mui/material';

type Props = { 
  notif: Notification;
  onOpen?: (id: string, target?: string) => void;
};

export default function NotificationCard({ notif, onOpen }: Props) {
  const subtitle = formatDateTime(notif.createdAt);
  const metaRight = <StatusChip kind={notif.kind} notif={notif} />;
  const ActionLink = (props: { href?: string; label?: string }) =>
    props.href ? (
      <Button 
        size="small" 
        variant="outlined" 
        color="primary"
        onClick={(e) => {
          e.stopPropagation();
          onOpen?.(notif.id, props.href);
        }}
      >
        {props.label ?? 'Ver detalle'}
      </Button>
    ) : null;

  const baseProps = {
    kind: notif.kind,
    title: notif.title,
    subtitle,
    body: notif.body,
    metaRight,
    unread: !notif.isRead, // <— importante
  } as const;

  switch (notif.kind) {
    case 'ORDER_CREATED': {
      return (
        <NotifCardBase {...baseProps}>
          <Stack spacing={1}>
            {notif.meta?.productName && (
              <Typography variant="body2" color="text.secondary">
                Producto: {notif.meta.productName}
              </Typography>
            )}
            <Stack direction="row" spacing={2}>
              {notif.meta?.buyerName && (
                <Typography variant="body2" color="text.secondary">
                  Comprador: {notif.meta.buyerName}
                </Typography>
              )}
              {notif.meta?.sellerName && (
                <Typography variant="body2" color="text.secondary">
                  Vendedor: {notif.meta.sellerName}
                </Typography>
              )}
              {notif.meta?.amount != null && (
                <Typography variant="body2" color="text.secondary">
                  Monto: {formatAmount(notif.meta.amount, notif.meta.currency ?? 'CLP')}
                </Typography>
              )}
            </Stack>
            <ActionLink href={notif.meta?.actionUrl} />
          </Stack>
        </NotifCardBase>
      );
    }
    case 'ORDER_SHIPPED': {
      return (
        <NotifCardBase {...baseProps}>
          <Stack spacing={1}>
            {notif.meta?.productName && (
              <Typography variant="body2" color="text.secondary">
                Producto: {notif.meta.productName}
              </Typography>
            )}
            {(notif.meta?.sellerName || notif.meta?.vendorName) && (
              <Typography variant="body2" color="text.secondary">
                Vendedor: {notif.meta.sellerName ?? notif.meta.vendorName}
              </Typography>
            )}
            {notif.meta?.trackingNumber && (
              <Typography variant="body2" color="text.secondary">
                Seguimiento: {notif.meta.trackingNumber}
              </Typography>
            )}
            {notif.meta?.carrier && (
              <Typography variant="body2" color="text.secondary">
                Transportista: {notif.meta.carrier}
              </Typography>
            )}
            <Stack direction="row" spacing={2}>
              {notif.meta?.shippedAt && (
                <Typography variant="body2" color="text.secondary">
                  Enviado: {formatDateTime(notif.meta.shippedAt)}
                </Typography>
              )}
              {notif.meta?.estimatedDelivery && (
                <Typography variant="body2" color="text.secondary">
                  Entrega estimada: {formatDateTime(notif.meta.estimatedDelivery)}
                </Typography>
              )}
            </Stack>
            <ActionLink href={notif.meta?.actionUrl} />
          </Stack>
        </NotifCardBase>
      );
    }
    case 'ORDER_STATUS_UPDATED': {
      return (
        <NotifCardBase {...baseProps}>
          <Stack spacing={1}>
            {notif.meta?.orderId && (
              <Typography variant="body2" color="text.secondary">
                Orden: {notif.meta.orderId}
              </Typography>
            )}
            {notif.meta?.productName && (
              <Typography variant="body2" color="text.secondary">
                Producto: {notif.meta.productName}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              Estado: {notif.meta?.estadoPedido ?? 'Actualizado'}
            </Typography>
            <ActionLink href={notif.meta?.actionUrl} />
          </Stack>
        </NotifCardBase>
      );
    }
    case 'PAYMENT_CONFIRMED': {
      return (
        <NotifCardBase {...baseProps}>
          <Stack spacing={1}>
            {notif.meta?.productName && (
              <Typography variant="body2" color="text.secondary">
                Producto: {notif.meta.productName}
              </Typography>
            )}
            <Stack direction="row" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Orden: {notif.meta?.orderId ?? '—'}
              </Typography>
              {notif.meta?.amount != null && (
                <Typography variant="body2" color="text.secondary">
                  Monto: {formatAmount(notif.meta.amount, notif.meta.currency ?? 'CLP')}
                </Typography>
              )}
            </Stack>
            <Stack direction="row" spacing={2}>
              {notif.meta?.buyerName && (
                <Typography variant="body2" color="text.secondary">
                  Comprador: {notif.meta.buyerName}
                </Typography>
              )}
              {notif.meta?.paymentMethod && (
                <Typography variant="body2" color="text.secondary">
                  Método: {notif.meta.paymentMethod}
                </Typography>
              )}
            </Stack>
            <ActionLink href={notif.meta?.actionUrl} />
          </Stack>
        </NotifCardBase>
      );
    }
    case 'PAYMENT_STATUS_CHANGED': {
      const showFallback = notif.meta?.emailSent === false;
      const reason = notif.meta?.razon ?? notif.meta?.rejectionReason;
      return (
        <NotifCardBase {...baseProps}>
          {showFallback && (
            <InfoBanner
              title="No se pudo enviar el correo"
              description="Te avisamos por aquí para que no dependas del email."
              severity="warning"
            />
          )}
          <Stack spacing={1}>
            {notif.meta?.productName && (
              <Typography variant="body2" color="text.secondary">
                Producto: {notif.meta.productName}
              </Typography>
            )}
            <Stack direction="row" spacing={2}>
              {notif.meta?.orderId && (
                <Typography variant="body2" color="text.secondary">
                  Orden: {notif.meta.orderId}
                </Typography>
              )}
              {notif.meta?.amount != null && (
                <Typography variant="body2" color="text.secondary">
                  Monto: {formatAmount(notif.meta.amount, notif.meta.currency ?? 'CLP')}
                </Typography>
              )}
              {notif.meta?.paymentMethod && (
                <Typography variant="body2" color="text.secondary">
                  Método: {notif.meta.paymentMethod}
                </Typography>
              )}
            </Stack>
            {reason && (
              <Typography variant="body2" color="error">
                Motivo: {reason}
              </Typography>
            )}
          </Stack>
          <ActionLink href={notif.meta?.actionUrl} />
        </NotifCardBase>
      );
    }
    case 'ORDER_READY_TO_SHIP': {
      return (
        <NotifCardBase {...baseProps}>
          <Stack spacing={1}>
            {notif.meta?.productName && (
              <Typography variant="body2" color="text.secondary">
                Producto: {notif.meta.productName}
              </Typography>
            )}
            {notif.meta?.buyerName && (
              <Typography variant="body2" color="text.secondary">
                Cliente: {notif.meta.buyerName}
              </Typography>
            )}
            {notif.meta?.deliveryAddress && (
              <Typography variant="body2" color="text.secondary">
                Dirección: {notif.meta.deliveryAddress}
              </Typography>
            )}
            {notif.meta?.buyerPhone && (
              <Typography variant="body2" color="text.secondary">
                Teléfono: {notif.meta.buyerPhone}
              </Typography>
            )}
            {notif.meta?.amount != null && (
              <Typography variant="body2" color="text.secondary">
                Monto: {formatAmount(notif.meta.amount, notif.meta.currency ?? 'CLP')}
              </Typography>
            )}
            <ActionLink href={notif.meta?.actionUrl} label="Ver pedido" />
          </Stack>
        </NotifCardBase>
      );
    }
    case 'ORDER_CANCELED': {
      return (
        <NotifCardBase {...baseProps}>
          <Stack spacing={1}>
            {notif.meta?.orderId && (
              <Typography variant="body2" color="text.secondary">
                Orden: {notif.meta.orderId}
              </Typography>
            )}
            {notif.meta?.amount != null && (
              <Typography variant="body2" color="text.secondary">
                Monto: {formatAmount(notif.meta.amount, notif.meta.currency ?? 'CLP')}
              </Typography>
            )}
            {notif.meta?.cancellationReason && (
              <Typography variant="body2" color="error">
                Motivo: {notif.meta.cancellationReason}
              </Typography>
            )}
            <Stack direction="row" spacing={1}>
              <ActionLink href={notif.meta?.actionUrl} label="Ver orden" />
              {notif.meta?.link_soporte && (
                <Button 
                  size="small" 
                  variant="text" 
                  color="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen?.(notif.id, notif.meta.link_soporte);
                  }}
                >
                  Ayuda
                </Button>
              )}
            </Stack>
          </Stack>
        </NotifCardBase>
      );
    }
    case 'MESSAGE_RECEIVED': {
      return (
        <NotifCardBase {...baseProps}>
          <Stack spacing={1}>
            {notif.meta?.senderName && (
              <Typography variant="body2" color="text.secondary">
                De: {notif.meta.senderName}
              </Typography>
            )}
            {notif.meta?.messagePreview && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                "{notif.meta.messagePreview}"
              </Typography>
            )}
            {notif.meta?.orderId && (
              <Typography variant="body2" color="text.secondary">
                Orden: {notif.meta.orderId}
              </Typography>
            )}
            <ActionLink href={notif.meta?.actionUrl} label="Responder" />
          </Stack>
        </NotifCardBase>
      );
    }
    case 'PRODUCT_EDITED': {
      return (
        <NotifCardBase {...baseProps}>
          <Stack spacing={1}>
            {notif.meta?.productName && (
              <Typography variant="body2" color="text.secondary">
                Producto: {notif.meta.productName}
              </Typography>
            )}
            {notif.meta?.changedFields && Array.isArray(notif.meta.changedFields) && (
              <Typography variant="body2" color="text.secondary">
                Cambios: {notif.meta.changedFields.join(', ')}
              </Typography>
            )}
            <Stack direction="row" spacing={2}>
              {notif.meta?.oldPrice != null && notif.meta?.newPrice != null && (
                <Typography variant="body2" color="text.secondary">
                  Precio: {formatAmount(notif.meta.oldPrice, notif.meta.currency ?? 'CLP')} → {formatAmount(notif.meta.newPrice, notif.meta.currency ?? 'CLP')}
                </Typography>
              )}
              {notif.meta?.oldStock != null && notif.meta?.newStock != null && (
                <Typography variant="body2" color="text.secondary">
                  Stock: {notif.meta.oldStock} → {notif.meta.newStock}
                </Typography>
              )}
            </Stack>
            <ActionLink href={notif.meta?.actionUrl} label="Ver producto" />
          </Stack>
        </NotifCardBase>
      );
    }
    case 'PAYMENT_ISSUE':
    case 'PAYMENT_DISPUTE': {
      return (
        <NotifCardBase {...baseProps}>
          <Stack spacing={1}>
            {notif.meta?.productName && (
              <Typography variant="body2" color="text.secondary">
                Producto: {notif.meta.productName}
              </Typography>
            )}
            {notif.meta?.orderId && (
              <Typography variant="body2" color="text.secondary">
                Orden: {notif.meta.orderId}
              </Typography>
            )}
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
            {notif.meta?.rejectionReason && (
              <Typography variant="body2" color="error">
                Motivo: {notif.meta.rejectionReason}
              </Typography>
            )}
            {notif.meta?.responseDeadline && (
              <Typography
                variant="body2"
                color={notif.meta?.urgentAction ? 'error' : 'text.secondary'}
              >
                Plazo límite: {formatDateTime(notif.meta.responseDeadline)}
              </Typography>
            )}
            <ActionBar
              actions={[
                notif.meta?.evidenceUrl ? { 
                  label: 'Subir evidencia',
                  onClick: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    onOpen?.(notif.id, notif.meta!.evidenceUrl!);
                  },
                  variant: 'outlined' 
                } : null,
                notif.meta?.actionUrl ? { 
                  label: 'Ver disputa',
                  onClick: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    onOpen?.(notif.id, notif.meta!.actionUrl!);
                  },
                  variant: 'contained',
                  color: 'primary' 
                } : null,
              ].filter(Boolean) as any}
            />
          </Stack>
        </NotifCardBase>
      );
    }
    default:
      return <NotifCardBase {...baseProps} />;
  }
}