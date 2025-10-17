// src/hooks/useNotifications.ts
import { useEffect, useState } from 'react';
import { notificationService } from '../db/services/notificationService';
import type { Notification } from '../types/notifications';

export function useNotifications(idUsuario: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transport, setTransport] = useState<'polling' | 'sse'>('polling');

  // Carga inicial
  useEffect(() => {
    if (!idUsuario) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await notificationService.getUserNotifications(idUsuario);
        if (!cancelled) setNotifications(list);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [idUsuario]);

  // Suscripción (polling)
  useEffect(() => {
    if (!idUsuario) return;
    const unsubscribe = notificationService.subscribePolling({
      idUsuario,
      onDiff: (nuevas) => setNotifications((prev) => [...nuevas, ...prev]),
    });
    setTransport('polling');
    return () => unsubscribe();
  }, [idUsuario]);

  const refresh = async () => {
    if (!idUsuario) return;
    try {
      const list = await notificationService.getUserNotifications(idUsuario);
      setNotifications(list);
    } catch (e: any) {
      setError(e?.message ?? 'Error');
    }
  };

  return { notifications, loading, error, refresh, transport };
}
