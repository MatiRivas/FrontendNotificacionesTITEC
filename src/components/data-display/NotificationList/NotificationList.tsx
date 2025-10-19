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
};

export default function NotificationList({ notifications, loading, error }: Props) {
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
  if (error) {
    return <EmptyState title="Error" description={error} />;
  }
  if (!notifications.length) {
    return <EmptyState />;
  }
  return (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      {notifications.map((n) => (
        <NotificationCard key={n.id} notif={n} />
      ))}
    </Stack>
  );
}
``