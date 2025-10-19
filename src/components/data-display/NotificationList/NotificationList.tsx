// src/components/data-display/NotificationList/NotificationList.tsx
import { Alert, Box, CircularProgress, Stack } from '@mui/material';
import type { Notification } from '../../../types/notifications';
import NotificationCard from '../NotificationCard';

type Props = {
  notifications: Notification[];
  loading?: boolean;
  error?: string | null;
};

export default function NotificationList({ notifications, loading, error }: Props) {
  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!notifications.length) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">Sin notificaciones</Alert>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      {notifications.map((n) => (
        <NotificationCard key={n.id} notif={n} />
      ))}
    </Stack>
  );
}