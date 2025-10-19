// src/components/data-display/NotificationCard/NotificationCard.tsx
import { Card, CardContent, Stack, Typography } from '@mui/material';
import { kindToColor, kindToIcon, kindToLabel } from '../../../utils/helpers';
import { formatAmount, formatDateTime } from '../../../utils/formatters';
import type { Notification } from '../../../types/notifications';

type Props = { notif: Notification };

export default function NotificationCard({ notif }: Props) {
  const color = kindToColor[notif.kind];
  const icon = kindToIcon[notif.kind];
  const label = kindToLabel[notif.kind];

  return (
    <Card variant="outlined" sx={{ borderLeft: `4px solid ${color}` }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <img src={icon} alt="" width={24} height={24} />
          <Stack spacing={0.5} flex={1}>
            <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
            <Typography variant="body1">{notif.title}</Typography>
            {notif.meta?.amount && (
              <Typography variant="body2" color="text.secondary">
                Monto: {formatAmount(notif.meta.amount)}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {formatDateTime(notif.createdAt)}
              {notif.meta?.estadoEntrega ? ` · ${notif.meta.estadoEntrega}` : ''}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}