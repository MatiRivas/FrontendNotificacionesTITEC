// src/views/notifications/NotificationsInbox.tsx
import { Container, Typography } from '@mui/material';
import NotificationList from '../../components/data-display/NotificationList';
import { useNotifications } from '../../hooks/useNotifications';

// TODO: integrar con useAuth() para obtener user.id
const FAKE_USER_ID = 'usuario123';

export default function NotificationsInbox() {
  const { notifications, loading, error, transport } = useNotifications(FAKE_USER_ID);

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 1 }}>Notificaciones</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        Transporte: {transport.toUpperCase()}
      </Typography>

      <NotificationList notifications={notifications} loading={loading} error={error} />
    </Container>
  );
}