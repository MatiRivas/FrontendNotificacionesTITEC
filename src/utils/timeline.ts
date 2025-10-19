import { formatDateTime } from './formatters';
import type { TimelineEvent } from '../components/ui/EventTimeline';
import type { Notification } from '../types/notifications';

export function notificationToTimelineEvents(notifs: Notification[]): TimelineEvent[] {
  // Ordena por fecha ascendente para timeline
  const sorted = [...notifs].sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
  return sorted.map((n) => ({
    at: n.createdAt,
    label: n.title,
    color: undefined,
    dotColor: undefined,
    right: formatDateTime(n.createdAt),
  }));
}
