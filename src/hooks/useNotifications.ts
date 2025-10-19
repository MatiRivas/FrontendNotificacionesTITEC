import { useEffect, useState, useCallback } from 'react';
import { notificationService } from '../db/services/notificationService';
import type { Notification } from '../types/notifications';

type Options = {
  includeHistory?: boolean;
  onNew?: (n: Notification) => void; // 👈 tipado
};

export function useNotifications(userId: string | undefined, opts?: Options) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transport, setTransport] = useState<'polling'>('polling');

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [internals, history] = await Promise.all([
        notificationService.getUserInternalUnread(userId),
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
  }, [userId, opts?.includeHistory]);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = notificationService.subscribePolling({
      userId,
      includeHistory: opts?.includeHistory,
      onDiff: (nuevas) => {
        // 👇 dispara pop-up por cada NUEVA
        nuevas.forEach((n) => opts?.onNew?.(n));
        // añade a la lista
        setNotifications((prev) => [...nuevas, ...prev]);
      },
    });
    setTransport('polling');
    load();
    return () => unsubscribe();
  }, [userId, opts?.includeHistory, opts?.onNew, load]);

  const refresh = useCallback(() => load(), [load]);

  const markAsRead = useCallback(async (id: string) => {
    if (!userId) return false;
    const ok = await notificationService.markAsRead(id, userId);
    if (ok) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    }
    return ok;
  }, [userId]);

  return { notifications, loading, error, refresh, transport, markAsRead };
}