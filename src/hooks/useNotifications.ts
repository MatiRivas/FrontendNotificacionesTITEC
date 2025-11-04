// src/hooks/useNotifications.ts
import { useEffect, useState, useCallback, useMemo } from 'react';
import { notificationService } from '../db/services/notificationService';
import type { Notification } from '../types/notifications';

type Options = {
  includeHistory?: boolean;
  onNew?: (n: Notification) => void;
};

export function useNotifications(userId: string | undefined, opts?: Options) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transport, setTransport] = useState<'polling'>('polling');
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');

  const unreadOnly = readFilter === 'unread';

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [internals, history] = await Promise.all([
        notificationService.getUserInternal(userId, { unreadOnly, limit: 50, offset: 0 }),
        opts?.includeHistory ? notificationService.getUserHistory(userId) : Promise.resolve<Notification[]>([]),
      ]);
      const merged = [...internals, ...history].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      setNotifications(merged);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  }, [userId, opts?.includeHistory, unreadOnly]);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = notificationService.subscribePolling({
      userId,
      includeHistory: opts?.includeHistory,
      unreadOnly,
      onDiff: (nuevas) => {
        nuevas.forEach((n) => opts?.onNew?.(n));
        setNotifications((prev) => [...nuevas, ...prev]);
      },
    });
    setTransport('polling');
    load();
    return () => unsubscribe();
  }, [userId, opts?.includeHistory, opts?.onNew, load, unreadOnly]);

  const refresh = useCallback(() => load(), [load]);

  const markAsRead = useCallback(async (id: string) => {
    if (!userId) return false;
    const ok = await notificationService.markAsRead(id, userId);
    if (ok) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    }
    return ok;
  }, [userId]);

  const filtered = useMemo(() => {
    switch (readFilter) {
      case 'read': return notifications.filter((n) => n.isRead);
      case 'unread': return notifications.filter((n) => !n.isRead);
      default: return notifications;
    }
  }, [notifications, readFilter]);

  return {
    notifications: filtered,
    loading,
    error,
    refresh,
    transport,
    markAsRead,
    readFilter,
    setReadFilter,
    // acceso raw si lo necesitas
    all: notifications,
  };
}
