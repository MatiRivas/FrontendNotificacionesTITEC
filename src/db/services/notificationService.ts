// src/db/services/notificationService.ts
import { api } from '../config/api.ts'; // del template; si no existe, crea este módulo.
import type { Notification, NotificationKind } from '../../types/notifications';

// Flags desde .env
const isMock = import.meta.env.VITE_MOCK_NOTIF === '1';
const POLL_EVERY_MS = Number(import.meta.env.VITE_POLL_INTERVAL_MS ?? 3000);

// ====== Tipos crudos del backend según tu OpenAPI ======
type RawNotifListItem = {
  idNotificacion: string;
  mensaje: string;
  estado: string;
};

type RawNotifDetail = {
  idNotificacion: string;
  destinatario?: string;
  mensaje: string;
  estado: string;
};

// ====== Normalizador defensivo → Notification ======
function normalize(raw: RawNotifListItem | RawNotifDetail): Notification {
  const inferredKind: NotificationKind = 'GENERIC';
  const nowIso = new Date().toISOString();

  return {
    id: raw.idNotificacion,
    kind: inferredKind,
    title: getTitleFromMensaje(raw.mensaje),
    body: raw.mensaje,
    createdAt: nowIso, // hasta que backend entregue un timestamp real
    meta: {
      estadoEntrega: raw.estado,
    },
  };
}

function getTitleFromMensaje(msg: string): string {
  const firstLine = msg.split(/\r?\n/)[0]?.trim();
  return firstLine.length > 80 ? firstLine.slice(0, 77) + '…' : firstLine;
}

// ====== Mock en memoria (mientras no hay backend) ======
let mockStore: Notification[] = [
  {
    id: 'N001',
    kind: 'ORDER_CREATED',
    title: 'Nueva compra recibida',
    body: 'El comprador Juan Pérez realizó una compra.',
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    meta: { estadoEntrega: 'enviada' },
  },
  {
    id: 'N002',
    kind: 'ORDER_SHIPPED',
    title: 'Pedido enviado',
    body: 'Tu pedido ORD-1001 fue despachado por Tienda Pulga.',
    createdAt: new Date(Date.now() - 1000 * 60).toISOString(),
    meta: { estadoEntrega: 'enviada' },
  },
];

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export const notificationService = {
  // Lista por usuario (bandeja in-app)
  async getUserNotifications(idUsuario: string): Promise<Notification[]> {
    if (isMock) {
      await sleep(250);
      // En mock no filtramos por usuario; en real, backend lo hará
      return [...mockStore].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }

    const { data } = await api.get<RawNotifListItem[]>(
      `/notificaciones/usuario/${encodeURIComponent(idUsuario)}`
    );
    return data.map(normalize).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },

  // Detalle por ID
  async getNotificationById(id: string): Promise<Notification> {
    if (isMock) {
      await sleep(150);
      const found = mockStore.find((n) => n.id === id);
      if (!found) throw new Error('Notificación no encontrada');
      return found;
    }

    const { data } = await api.get<RawNotifDetail>(`/notificaciones/${encodeURIComponent(id)}`);
    return normalize(data);
  },

  // Crear (no core para la bandeja, pero útil para pruebas)
  async createNotification(payload: { destinatario: string; tipo: string; mensaje: string }) {
    if (isMock) {
      await sleep(120);
      const n: Notification = {
        id: 'N' + Math.random().toString(36).slice(2, 8),
        kind: 'GENERIC',
        title: getTitleFromMensaje(payload.mensaje),
        body: payload.mensaje,
        createdAt: new Date().toISOString(),
        meta: { estadoEntrega: 'enviada' },
      };
      mockStore = [n, ...mockStore];
      return n;
    }

    const { data } = await api.post(`/notificaciones`, payload);
    return data; // { idNotificacion, estado } — podrías luego llamar a getNotificationById
  },

  // Suscripción por polling (retorna función para cancelar)
  subscribePolling(params: {
    idUsuario: string;
    onDiff: (nuevas: Notification[]) => void;
    intervalMs?: number;
  }) {
    const intervalMs = params.intervalMs ?? POLL_EVERY_MS;
    let stopped = false;
    let timer: number | null = null;
    let known = new Set<string>();

    const loop = async () => {
      try {
        const list = await this.getUserNotifications(params.idUsuario);
        const nuevas = list.filter((n) => !known.has(n.id));
        if (nuevas.length) {
          nuevas.forEach((n) => known.add(n.id));
          params.onDiff(nuevas);
        }
      } catch {
        // silenciar; siguiente tick reintenta
      } finally {
        if (!stopped) timer = window.setTimeout(loop, intervalMs);
      }
    };

    // Primera carga para seed del set
    this.getUserNotifications(params.idUsuario)
      .then((list) => {
        known = new Set(list.map((n) => n.id));
      })
      .finally(() => {
        if (!stopped) timer = window.setTimeout(loop, intervalMs);
      });

    return () => {
      stopped = true;
      if (timer) window.clearTimeout(timer);
    };
  },

  // Placeholder para cuando haya SSE real:
  // subscribeSSE({ idUsuario, onMessage }) { const es = new EventSource(...); return () => es.close(); }
};