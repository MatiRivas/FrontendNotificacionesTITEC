// src/views/notifications/NotificationsInbox.tsx
import { Container, Typography } from '@mui/material';
import NotificationList from '../../components/data-display/NotificationList';
import { useNotifications } from '../../hooks/useNotifications';

// ⚠️ TEMP: reemplaza por tu hook real de autenticación cuando esté listo.
// Debe exponer al menos user.id (y ojalá user.role para filtros futuros).
const useAuth = () => ({ user: { id: 'usuario123', role: 'buyer' as 'buyer' | 'seller' } });

export default function NotificationsInbox() {
  const { user } = useAuth();

  // Incluimos histórico para que la bandeja cargue contexto al entrar,
  // pero los pop-ups se disparan sólo para "nuevas" (lo maneja GlobalNotificationsListener).
  const { notifications, loading, error, transport } = useNotifications(user.id, {
    includeHistory: true,
  });

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 1 }}>Notificaciones</Typography>

      {/* Opcional: mostrar el tipo de transporte activo (polling por ahora) */}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        Transporte: {transport.toUpperCase()}
      </Typography>

      <NotificationList notifications={notifications} loading={loading} error={error} />
    </Container>
  );
}