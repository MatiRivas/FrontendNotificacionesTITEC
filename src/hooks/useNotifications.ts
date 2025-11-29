// src/hooks/useNotifications.ts
import { useEffect, useState, useCallback, useMemo } from 'react';
import { notificationService } from '../db/services/notificationService';
import type { Notification } from '../types/notifications';
import type { ReadFilter } from '../db/services/notificationService';

type Options = {
  includeHistory?: boolean;
  onNew?: (n: Notification) => void;
};

/**
 * Hook de notificaciones
 * - Mantiene SIEMPRE en memoria la lista completa (sin filtro)
 * - Aplica el filtro sólo en memoria para la vista (notifications)
 * - Expone contadores consistentes a partir de `all`
 */
export function useNotifications(userId: string | undefined, opts?: Options) {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transport, setTransport] = useState<'polling'>('polling');

  // Soporte de filtros: 'all' | 'read' | 'unread'
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');

  const load = useCallback(
    async () => {
      if (!userId) return;
      setLoading(true);
      try {
        // IMPORTANTE: pedimos SIEMPRE la lista completa (sin readFilter en el service)
        const list = await notificationService.listNotifications(userId, {
          includeHistory: opts?.includeHistory,
          page: 1,
          limit: 50,
          // readFilter: undefined  <-- clave: no usamos filtro del service
        });
        setAllNotifications(list);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? 'Error');
      } finally {
        setLoading(false);
      }
    },
    [userId, opts?.includeHistory],
  );

  useEffect(() => {
    if (!userId) return;

    // Suscripción por polling a la lista COMPLETA (sin filtro en service)
    const unsubscribe = notificationService.subscribePolling({
      userId,
      includeHistory: opts?.includeHistory,
      // readFilter: undefined,  <-- clave: no filtramos en el service
      onDiff: (nuevas) => {
        // El listener global decide si hace pop-up
        nuevas.forEach((n) => opts?.onNew?.(n));
        // Prepend de nuevas al estado completo, dedupe por id
        setAllNotifications((prev) => {
          const merged = [...nuevas, ...prev];
          const seen = new Set<string>();
          return merged.filter((n) => (seen.has(n.id) ? false : (seen.add(n.id), true)));
        });
      },
    });

    setTransport('polling');
    // Carga inicial
    load();

    return () => unsubscribe();
  }, [userId, opts?.includeHistory, opts?.onNew, load]);

  const refresh = useCallback(() => load(), [load]);

  const markAsRead = useCallback(
    async (id: string) => {
      const ok = await notificationService.markAsRead(id);
      if (ok) {
        setAllNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      }
      return ok;
    },
    [],
  );

  // La vista usa `notifications` ya filtradas en memoria
  const notifications = useMemo(() => {
    switch (readFilter) {
      case 'read':
        return allNotifications.filter((n) => n.isRead);
      case 'unread':
        return allNotifications.filter((n) => !n.isRead);
      default:
        return allNotifications;
    }
  }, [allNotifications, readFilter]);

  return {
    notifications,   // lista filtrada según readFilter
    loading,
    error,
    refresh,
    transport,
    markAsRead,
    readFilter,
    setReadFilter,
    all: allNotifications, // lista completa SIN filtrar (para contadores)
  };
}