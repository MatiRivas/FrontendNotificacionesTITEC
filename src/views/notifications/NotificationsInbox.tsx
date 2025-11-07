// src/views/notifications/NotificationsInbox.tsx
import { Container, Typography, Tabs, Tab, Box, Stack, Chip } from '@mui/material';
import NotificationList from '../../components/data-display/NotificationList';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth.fake';
import type { ReadFilter } from '../../db/services/notificationService';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotificationsInbox() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    notifications,
    loading,
    error,
    transport,
    readFilter,
    setReadFilter,
    all,
    markAsRead,
  } = useNotifications(user.id, { includeHistory: true });

  const total = all.length;
  const readCount = all.filter(n => n.isRead).length;
  const unreadCount = total - readCount;

  const emptyHint =
    readFilter === 'all'
      ? 'Sin notificaciones'
      : readFilter === 'read'
      ? 'Aún no tienes notificaciones leídas'
      : 'No tienes no leídas';

  const handleChange = (_: React.SyntheticEvent, value: ReadFilter) => {
    setReadFilter(value);
  };

  const labelWithCount = (label: string, count: number) => (
    <Stack direction="row" spacing={1} alignItems="center">
      <span>{label}</span>
      <Chip size="small" label={count} />
    </Stack>
  );

  // Navegación segura: externa vs. interna
  const goTo = useCallback(
    (target?: string) => {
      if (!target) return;
      const isAbsolute = /^https?:\/\//i.test(target);
      if (isAbsolute) window.location.href = target;
      else navigate(target);
    },
    [navigate]
  );

  // Al abrir: marcar leída y navegar si corresponde
  const handleOpen = useCallback(
    async (id: string, target?: string) => {
      await markAsRead(id);
      goTo(target);
    },
    [markAsRead, goTo]
  );

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Notificaciones
      </Typography>

      {/* Informativo: transporte actual */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mb: 2 }}
      >
        Transporte: {transport.toUpperCase()}
      </Typography>

      {/* Filtros: Todas / No leídas / Leídas */}
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
        onOpen={handleOpen}
      />
    </Container>
  );
}