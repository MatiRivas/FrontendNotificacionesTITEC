// src/hooks/useNotifications.ts
import { useEffect, useState, useCallback, useMemo } from 'react';
import { notificationService } from '../db/services/notificationService';
import type { Notification } from '../types/notifications';
import type { ReadFilter } from '../db/services/notificationService';

type Options = {
  includeHistory?: boolean;
  onNew?: (n: Notification) => void;
};

export function useNotifications(userId: string | undefined, opts?: Options) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transport, setTransport] = useState<'polling'>('polling');

  // soporte de filtros: 'all' | 'read' | 'unread'
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const list = await notificationService.listNotifications(userId, {
        includeHistory: opts?.includeHistory,
        readFilter,
        page: 1,
        limit: 50,
      });
      setNotifications(list);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  }, [userId, opts?.includeHistory, readFilter]);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = notificationService.subscribePolling({
      userId,
      includeHistory: opts?.includeHistory,
      readFilter,
      onDiff: (nuevas) => {
        nuevas.forEach((n) => opts?.onNew?.(n)); // el listener global decide si hace pop-up
        setNotifications((prev) => [...nuevas, ...prev]);
      },
    });
    setTransport('polling');
    load();
    return () => unsubscribe();
  }, [userId, opts?.includeHistory, opts?.onNew, load, readFilter]);

  const refresh = useCallback(() => load(), [load]);

  const markAsRead = useCallback(
    async (id: string) => {
      if (!userId) return false;
      const ok = await notificationService.markAsRead(id, userId);
      if (ok) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      }
      return ok;
    },
    [userId],
  );

  // La vista puede usar 'notifications' ya filtradas por readFilter si lo prefiere:
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
    all: notifications,
  };
}