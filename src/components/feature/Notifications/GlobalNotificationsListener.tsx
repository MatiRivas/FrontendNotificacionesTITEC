// src/components/feature/Notifications/GlobalNotificationsListener.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Chip, Snackbar, Stack, Button } from '@mui/material';
import { useNotifications } from '../../../hooks/useNotifications';
import { notificationService } from '../../../db/services/notificationService';
import type { Notification } from '../../../types/notifications';

// Hook fake mientras tanto
const useAuth = () => ({ user: { id: 'usuario123', name: 'Demo' } });

const POPUPS_ENABLED = import.meta.env.VITE_ENABLE_NOTIF_POPUPS === '1';

type QueueItem = {
  id: string;
  title: string;
  body?: string;
  wasPush?: boolean;
};

export default function GlobalNotificationsListener() {
  const { user } = useAuth();

  if (!user?.id || !POPUPS_ENABLED) {
    return null;
  }

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<QueueItem | null>(null);

  const queueRef = useRef<QueueItem[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());

  const enqueue = useCallback(
    (n: Notification) => {
      if (seenIdsRef.current.has(n.id)) return;
      seenIdsRef.current.add(n.id);

      const item: QueueItem = {
        id: n.id,
        title: n.title,
        body: n.body,
        wasPush: n.meta?.wasPush === true,
      };

      queueRef.current.push(item);
      if (!open && !current) {
        const next = queueRef.current.shift() ?? null;
        if (next) {
          setCurrent(next);
          setOpen(true);
        }
      }
    },
    [open, current]
  );

  const onNew = useMemo(
    () => (n: Notification) => {
      // Sólo pop-ups para internas (push normalizado a internal)
      if (n.channel === 'internal') {
        enqueue(n);
      }
    },
    [enqueue]
  );

  useNotifications(user.id, { includeHistory: true, onNew });

  const handleClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open && current) {
      const timer = window.setTimeout(() => {
        const next = queueRef.current.shift() ?? null;
        setCurrent(next);
        if (next) setOpen(true);
        else setCurrent(null);
      }, 100);
      return () => window.clearTimeout(timer);
    }
  }, [open, current]);

  useEffect(() => {
    let t: number | null = null;
    if (open) t = window.setTimeout(() => setOpen(false), 4000);
    return () => {
      if (t) window.clearTimeout(t);
    };
  }, [open]);

  return (
    <>
      {/* Botón para generar una notificación MOCK aleatoria */}
      <div style={{ position: 'fixed', bottom: 8, right: 8, zIndex: 99999 }}>
        <Button
          variant="contained"
          size="small"
          onClick={async () => {
            await notificationService.createMockNotification(user.id);
            // Tip: si quieres ver el popup instantáneamente sin esperar el polling de 3s,
            // puedes forzar un refresh del hook (si expusieras `refresh`), o bajar el POLL a 1000ms.
          }}
        >
          Generar notificación aleatoria
        </Button>
      </div>

      <Snackbar
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={4000}
        key={current?.id}
      >
        <Alert onClose={handleClose} severity="info" variant="filled" sx={{ width: '100%' }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: current?.body ? 0.5 : 0 }}>
            <strong>{current?.title}</strong>
            {current?.wasPush && (
              <Chip size="small" label="Vía push" color="primary" variant="outlined" />
            )}
          </Stack>
          {current?.body ? ` — ${current.body}` : null}
        </Alert>
      </Snackbar>
    </>
  );
}