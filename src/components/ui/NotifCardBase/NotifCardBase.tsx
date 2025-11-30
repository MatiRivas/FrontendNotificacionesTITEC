// src/components/ui/NotifCardBase/NotifCardBase.tsx
import { Card, CardContent, Stack, Typography, Box } from '@mui/material';
import type { ReactNode } from 'react';
import type { NotificationKind } from '../../../types/notifications';
import { kindToColor } from '../../../utils/helpers';
import { NotifIcon } from '../NotifIcon';

type Props = {
  kind: NotificationKind;
  title: string;
  subtitle?: string;     // ej: fecha/hora exacta o estado adicional
  body?: string;         // mensaje principal de la notificación
  metaRight?: ReactNode; // ej: monto, StatusChip, etc.
  children?: ReactNode;  // contenido extra específico por HDU
  onClick?: () => void;
  disabled?: boolean;
  iconSize?: number;
  unread?: boolean;      // <— NUEVO
};

export default function NotifCardBase({
  kind,
  title,
  subtitle,
  body,
  metaRight,
  children,
  onClick,
  disabled,
  iconSize = 24,
  unread = false,
}: Props) {
  const accent = kindToColor[kind] ?? '#6b7280';
  const borderLeft = unread ? '#386641' : '#E5E5E5';

  return (
    <Card
      variant="outlined"
      onClick={disabled ? undefined : onClick}
      sx={{
        borderLeft: `4px solid ${borderLeft}`,
        opacity: disabled ? 0.6 : 1,
        cursor: onClick && !disabled ? 'pointer' : 'default',
      }}
    >
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box mt={0.25}>
            <NotifIcon kind={kind} size={iconSize} />
          </Box>

          <Stack spacing={0.5} flex={1}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Typography
                variant="body1"
                fontWeight={600}
                sx={{ lineHeight: 1.25, color: '#1B4332', fontFamily: 'Inter, sans-serif' }}
              >
                {title}
              </Typography>
              {metaRight ? <Box flexShrink={0}>{metaRight}</Box> : null}
            </Stack>

            {subtitle ? (
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'Roboto, sans-serif' }}>
                {subtitle}
              </Typography>
            ) : null}

            {body ? (
              <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                {body}
              </Typography>
            ) : null}

            {children}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}