import { Card, CardContent, Stack, Typography, Box } from '@mui/material';
import type { ReactNode } from 'react';
import type { NotificationKind } from '../../../types/notifications';
import { kindToColor } from '../../../utils/helpers';
import { NotifIcon } from '../NotifIcon';

type Props = {
  kind: NotificationKind;
  title: string;
  subtitle?: string;          // ej: fecha/hora exacta o estado adicional
  metaRight?: ReactNode;      // ej: monto, StatusChip, etc.
  children?: ReactNode;       // contenido extra específico por HDU
  onClick?: () => void;
  disabled?: boolean;
  iconSize?: number;
};

export default function NotifCardBase({
  kind,
  title,
  subtitle,
  metaRight,
  children,
  onClick,
  disabled,
  iconSize = 24,
}: Props) {
  const color = kindToColor[kind] ?? '#6b7280';

  return (
    <Card
      variant="outlined"
      onClick={disabled ? undefined : onClick}
      sx={{
        borderLeft: `4px solid ${color}`,
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
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Typography variant="body1" fontWeight={600} sx={{ lineHeight: 1.25 }}>
                {title}
              </Typography>
              {metaRight ? <Box flexShrink={0}>{metaRight}</Box> : null}
            </Stack>

            {subtitle ? (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            ) : null}

            {children}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
``