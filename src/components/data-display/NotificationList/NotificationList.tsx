// src/components/data-display/NotificationList/NotificationList.tsx
import { Box, Stack } from '@mui/material';
import NotificationCard from '../NotificationCard';
import type { Notification } from '../../../types/notifications';
import { NotifCardSkeleton } from '../../ui/NotifCardSkeleton';
import { EmptyState } from '../../ui/EmptyState';

type Props = {
  notifications: Notification[];
  loading?: boolean;
  error?: string | null;
  onOpen?: (id: string, target?: string) => void;
  emptyHint?: string;
};

export default function NotificationList({ notifications, loading, error, onOpen, emptyHint }: Props) {
  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <NotifCardSkeleton />
          <NotifCardSkeleton />
        </Stack>
      </Box>
    );
  }
  if (error) return <EmptyState title="Error" description={error} />;
  if (!notifications.length) return <EmptyState description={emptyHint ?? 'Sin notificaciones'} />;

  return (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      {notifications.map((n) => (
        <div key={n.id} onClick={() => onOpen?.(n.id, n.meta?.actionUrl as string | undefined)} style={{ cursor: 'pointer' }}>
          <NotificationCard notif={n} />
        </div>
      ))}
    </Stack>
  );
}