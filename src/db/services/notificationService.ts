// src/db/services/notificationService.ts
import { api } from '../config/api';
import {
  Notification,
  RawUserNotification,
  EventType,
  NotificationKind,
  Channel,
} from '../../types/notifications';

const isMock = import.meta.env.VITE_MOCK_NOTIF === '1';
const POLL_MS = Number(import.meta.env.VITE_POLL_INTERVAL_MS ?? 3000);

/* ──────────────────────────────────────────────────────────────────────────────
  Helpers de mapeo/normalización
────────────────────────────────────────────────────────────────────────────── */

function mapEventTypeToKind(e?: EventType): NotificationKind {
  switch (e) {
    case 'order_created': return 'ORDER_CREATED';
    case 'order_canceled': return 'ORDER_CANCELED';
    case 'order_shipped': return 'ORDER_SHIPPED';
    case 'order_status_changed': return 'ORDER_STATUS_UPDATED';
    case 'payment_confirmed': return 'PAYMENT_CONFIRMED';
    case 'payment_status': return 'PAYMENT_STATUS_CHANGED';
    case 'payment_issue': return 'PAYMENT_ISSUE';
    case 'payment_dispute': return 'PAYMENT_DISPUTE';
    default: return 'GENERIC';
  }
}

// ¿Incluye push (3)?
function hasPushChannel(raw: RawUserNotification): boolean {
  return Array.isArray(raw.channel_ids) && raw.channel_ids.includes(3);
}

// channel_ids -> nombre de canal principal (etiqueta visible en card)
function pickPrimaryChannelName(raw: RawUserNotification): Channel {
  if (hasPushChannel(raw)) return 'internal'; // push = internas/pop-up
  if (raw.channel_ids?.includes(1)) return 'email';
  if (raw.channel_ids?.includes(2)) return 'sms';
  return 'email';
}

function isReadFromEstado(estado?: string): boolean {
  return String(estado ?? '').toLowerCase() === 'leido';
}

function normalize(raw: RawUserNotification): Notification {
  const id = String(raw.id_notificacion);
  const createdAt = raw.fecha_hora;
  const wasPush = hasPushChannel(raw);
  const channel = pickPrimaryChannelName(raw);
  const kind = mapEventTypeToKind(raw.type as any);

  const fallbackTitle =
    raw.title ??
    (raw.type ? raw.type.replace(/_/g, ' ').toUpperCase() : 'Notificación');

  return {
    id,
    kind,
    title: fallbackTitle,
    body: raw.message ?? undefined,
    channel,
    status: undefined, // mantenemos "estado" crudo en meta
    createdAt,
    sentAt: createdAt,
    isRead: isReadFromEstado(raw.estado),
    meta: {
      ...(raw.metadata ?? {}),
      wasPush,
      originalChannel: wasPush ? 'push' : channel,
      channel_ids: raw.channel_ids,
      estado: raw.estado,
    },
  };
}

function sortDesc(a: Notification, b: Notification) {
  return a.createdAt < b.createdAt ? 1 : -1;
}

/* ──────────────────────────────────────────────────────────────────────────────
  MOCK en memoria
────────────────────────────────────────────────────────────────────────────── */

const mockStore: RawUserNotification[] = [];

function randomOf<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomOrderId() {
  return `#ORD-${Math.floor(Math.random() * 900 + 100)}`;
}
function randomEventType(): EventType {
  const pool = [
    'order_created',
    'order_canceled',
    'order_shipped',
    'order_status_changed',
    'payment_confirmed',
    'payment_status',
    'delivery_tracking',
    'payment_issue',
    'payment_dispute',
  ] as const;
  return randomOf(pool);
}
function randomChannels(): number[] {
  // mezcla simple con probabilidad de traer push (3)
  const pick = Math.random();
  if (pick < 0.33) return [3];
  if (pick < 0.66) return [1, 3];
  return [1];
}

/* ──────────────────────────────────────────────────────────────────────────────
  Fetchers (aceptan array directo o wrapper { notifications: [...] })
────────────────────────────────────────────────────────────────────────────── */

// ACEPTA array directo O wrapper con { notifications: [...] }
async function getUserPage(userId: string, page = 1, limit = 20): Promise<Notification[]> {
  if (isMock) {
    const pageStart = (page - 1) * limit;
    const slice = mockStore.slice().reverse().slice(pageStart, pageStart + limit);
    return slice.map(normalize).sort(sortDesc);
  }
  const { data } = await api.get(
    `/notifications/user/${encodeURIComponent(userId)}?page=${page}&limit=${limit}`,
  );
  // si data es array, úsalo; si es wrapper, toma .notifications
  const arr: RawUserNotification[] = Array.isArray(data) ? data : (data?.notifications ?? []);
  return arr.map(normalize).sort(sortDesc);
}

async function getUserHistory(userId: string, page = 1, limit = 50): Promise<Notification[]> {
  if (isMock) {
    const slice = mockStore.slice().reverse().slice(0, limit);
    return slice.map(normalize).sort(sortDesc);
  }
  const { data } = await api.get(
    `/notifications/user-history/${encodeURIComponent(userId)}?page=${page}&limit=${limit}`,
  );
  const arr: RawUserNotification[] = Array.isArray(data) ? data : (data?.notifications ?? []);
  return arr.map(normalize).sort(sortDesc);
}

/* ──────────────────────────────────────────────────────────────────────────────
  API pública del servicio
────────────────────────────────────────────────────────────────────────────── */

export type ReadFilter = 'all' | 'read' | 'unread';

export const notificationService = {
  async listNotifications(
    userId: string,
    opts?: { includeHistory?: boolean; page?: number; limit?: number; readFilter?: ReadFilter },
  ): Promise<Notification[]> {
    const page = opts?.page ?? 1;
    const limit = opts?.limit ?? 20;

    const [pageList, history] = await Promise.all([
      getUserPage(userId, page, limit),
      opts?.includeHistory ? getUserHistory(userId, 1, 50) : Promise.resolve<Notification[]>([]),
    ]);

    // Merge + sort
    let merged = [...pageList, ...history].sort(sortDesc);

    // DEDUPE por id (útil si el histórico trae items idénticos a la página actual)
    const seen = new Set<string>();
    merged = merged.filter((n) => (seen.has(n.id) ? false : (seen.add(n.id), true)));

    // Filtro de lectura en frontend
    switch (opts?.readFilter) {
      case 'read':
        merged = merged.filter((n) => n.isRead);
        break;
      case 'unread':
        merged = merged.filter((n) => !n.isRead);
        break;
      default:
        break;
    }

    return merged;
  },

  // Polling con diff por ID (para “nuevas” y pop-ups)
  subscribePolling(params: {
    userId: string;
    onDiff: (nuevas: Notification[]) => void;
    includeHistory?: boolean;
    intervalMs?: number;
    readFilter?: ReadFilter; // afecta la lista base; popups se disparan por ID nuevo
  }) {
    const interval = params.intervalMs ?? POLL_MS;
    let stopped = false;
    let timer: number | null = null;
    let known = new Set<string>();

    const tick = async () => {
      try {
        const list = await this.listNotifications(params.userId, {
          includeHistory: params.includeHistory,
          readFilter: params.readFilter,
          page: 1,
          limit: 50,
        });
        const nuevas = list.filter((n) => !known.has(n.id));
        if (nuevas.length) {
          nuevas.forEach((n) => known.add(n.id));
          params.onDiff(nuevas);
        }
      } finally {
        if (!stopped) timer = window.setTimeout(tick, interval);
      }
    };

    (async () => {
      const seed = await this.listNotifications(params.userId, {
        includeHistory: params.includeHistory,
        readFilter: params.readFilter,
        page: 1,
        limit: 50,
      });
      known = new Set(seed.map((n) => n.id));
      if (!stopped) timer = window.setTimeout(tick, interval);
    })();

    return () => {
      stopped = true;
      if (timer) {
        window.clearTimeout(timer);
        timer = null;
      }
    };
  },

  async markAsRead(id: string, userId: string, readAt?: string): Promise<boolean> {
    if (isMock) {
      // Simular lectura en mock
      const raw = mockStore.find((r) => String(r.id_notificacion) === id);
      if (raw) raw.estado = 'leido';
      return true;
    }
    // Ajusta la ruta/cuerpo si tu backend define otra especificación para "read"
    const { data } = await api.patch<{ success: boolean }>(
      `/notifications/${encodeURIComponent(id)}/read`,
      { userId, ...(readAt ? { readAt } : {}) },
    );
    return !!data?.success;
  },

  async createMockNotification(
    userId: string,
    seed?: Partial<RawUserNotification>,
  ) {
    if (!isMock) {
      console.warn('[notificationService] createMockNotification ignorado (no es mock).');
      return;
    }
    const now = new Date().toISOString();
    const id = seed?.id_notificacion ?? `mock-${Date.now()}`;
    const channel_ids = seed?.channel_ids ?? randomChannels();
    const type = seed?.type ?? randomEventType();
    const order = randomOrderId();
    const title =
      seed?.title ??
      (type === 'order_created'
        ? `Confirmación de compra - ${order}`
        : type === 'order_shipped'
        ? `¡Tu pedido fue enviado! - ${order}`
        : (type ?? 'Notificación'));

    const raw: RawUserNotification = {
      id_notificacion: id,
      fecha_hora: now,
      id_emisor: 'service',
      id_receptor: userId,
      id_plantilla: 1,
      channel_ids,
      estado: 'enviado',
      title,
      message: seed?.message ?? undefined,
      type,
      metadata: seed?.metadata ?? {
        orderId: order,
        amount: Math.floor(Math.random() * 90000) + 10000,
        currency: 'CLP',
      },
    };
    mockStore.push(raw);
  },
}