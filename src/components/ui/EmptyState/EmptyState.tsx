import { Alert, Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type Props = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  sx?: any;
};

export default function EmptyState({
  title = 'Sin notificaciones',
  description = 'No hay nada que mostrar por ahora.',
  icon,
  sx,
}: Props) {
  return (
    <Box sx={{ p: 2, ...sx }}>
      <Alert severity="info" icon={icon ?? undefined}>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Alert>
    </Box>
  );
}
``