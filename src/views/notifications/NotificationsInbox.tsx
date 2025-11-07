// src/views/notifications/NotificationsInbox.tsx
import { Container, Typography, Tabs, Tab, Box, Stack, Chip } from '@mui/material';
import NotificationList from '../../components/data-display/NotificationList';
import { useNotifications } from '../../hooks/useNotifications';
// Hook fake de auth (reemplazar cuando tengas el real)
import { useAuth } from '../../hooks/useAuth.fake';
import type { ReadFilter } from '../../db/services/notificationService';

export default function NotificationsInbox() {
  const { user } = useAuth();
  const {
    notifications,         // lista ya filtrada según readFilter
    loading,
    error,
    transport,
    readFilter,
    setReadFilter,
    all,                   // lista sin filtrar (para contar)
  } = useNotifications(user.id, { includeHistory: true });

  // Contadores para chips en tabs
  const total = all.length;
  const readCount = all.filter(n => n.isRead).length;
  const unreadCount = total - readCount;

  // Mensaje vacío contextual según filtro activo
  const emptyHint =
    readFilter === 'all'
      ? 'Sin notificaciones'
      : readFilter === 'read'
      ? 'Aún no tienes notificaciones leídas'
      : 'No tienes notificaciones nuevas';

  // Handler de cambio de pestaña
  const handleChange = (_: React.SyntheticEvent, value: ReadFilter) => {
    setReadFilter(value);
  };

  // Labels con chips de conteo
  const labelWithCount = (label: string, count: number) => (
    <Stack direction="row" spacing={1} alignItems="center">
      <span>{label}</span>
      <Chip size="small" label={count} />
    </Stack>
  );

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Notificaciones
      </Typography>

      {/* Transporte activo (informativo) */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mb: 2 }}
      >
        Transporte: {transport.toUpperCase()}
      </Typography>

      {/* Selector de filtros: Todas, No leídas, Leídas */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1.5 }}>
        <Tabs
          value={readFilter}
          onChange={handleChange}
          variant="scrollable"
          allowScrollButtonsMobile
        >
          <Tab value="all" label={labelWithCount('Todas', total)} />
          <Tab value="unread" label={labelWithCount('No leídas', unreadCount)} />
          <Tab value="read" label={labelWithCount('Leídas', readCount)} />
        </Tabs>
      </Box>

      <NotificationList
        notifications={notifications}
        loading={loading}
        error={error}
        emptyHint={emptyHint}
      />
    </Container>
  );
}