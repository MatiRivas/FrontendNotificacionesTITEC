// src/db/services/notificationService.ts
import { api } from '../config/api';
import {
  Notification,
  RawUserNotification,
  RawInternalNotification,
  UserPreferences,
  EventType,
  NotificationKind,
} from '../../types/notifications';

const isMock = import.meta.env.VITE_MOCK_NOTIF === '1';
const POLL_MS = Number(import.meta.env.VITE_POLL_INTERVAL_MS ?? 3000);

// --- Mapper mínimo EventType -> NotificationKind ---
function mapEventTypeToKind(e: EventType): NotificationKind {
  switch (e) {
    case 'order_created':        return 'ORDER_CREATED';
    case 'order_canceled':       return 'ORDER_CANCELED';
    case 'order_shipped':        return 'ORDER_SHIPPED';
    case 'order_status_changed': return 'ORDER_STATUS_UPDATED';
    case 'payment_confirmed':    return 'PAYMENT_CONFIRMED';
    case 'payment_status':       return 'PAYMENT_STATUS_CHANGED';
    case 'delivery_tracking':    return 'GENERIC';
    case 'payment_issue':        return 'PAYMENT_ISSUE';
    default:                     return 'GENERIC';
  }
}

// --- Normalizadores ---
function normalizeUserNotification(raw: RawUserNotification): Notification {
  const mappedChannel = raw.channel === 'push' ? 'internal' : raw.channel;
  return {
    id: raw.id,
    kind: mapEventTypeToKind(raw.eventType),
    title: raw.subject,
    body: raw.subject,
    channel: mappedChannel,
    status: raw.status,
    createdAt: raw.sentAt,
    sentAt: raw.sentAt,
    isRead: mappedChannel === 'internal' ? false : true,
    meta: {
      wasPush: raw.channel === 'push',
      originalChannel: raw.channel,
    },
  };
}

function normalizeInternal(raw: RawInternalNotification): Notification {
  const rawEvent = raw.metadata?.['eventType'] as EventType | undefined;
  const kind: NotificationKind = rawEvent ? mapEventTypeToKind(rawEvent) : 'GENERIC';
  return {
    id: raw._id,
    kind,
    title: raw.title,
    body: raw.content,
    channel: 'internal',
    status: raw.status,
    createdAt: raw.createdAt,
    sentAt: raw.sentAt,
    isRead: raw.isRead,
    meta: {
      ...(raw.metadata ?? {}),
      wasPush: false,
      originalChannel: 'internal',
    },
  };
}

function sortDesc(a: Notification, b: Notification) {
  return a.createdAt < b.createdAt ? 1 : -1;
}

/* ===========================
   MOCK dinámico en memoria
   =========================== */
const mockDynamic: RawUserNotification[] = []; // buffer donde el botón "inyecta" nuevas

// Generador de notificación aleatoria coherente con tus HDU
function randomEventType(): EventType {
  const pool: EventType[] = [
    'order_created',
    'order_canceled',
    'order_shipped',
    'order_status_changed',
    'payment_confirmed',
    'payment_status',
    'delivery_tracking',
    'payment_issue',
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}
function randomChannel(): 'push' | 'email' | 'internal' {
  // preferimos 'push' para que se vea el popup (normalize -> internal)
  const pool: Array<'push' | 'email' | 'internal'> = ['push', 'email', 'internal'];
  return pool[Math.floor(Math.random() * pool.length)];
}
function subjectFor(e: EventType, order = `#ORD-${Math.floor(Math.random() * 900 + 100)}`) {
  switch (e) {
    case 'order_created':        return `Confirmación de compra - ${order}`;
    case 'order_canceled':       return `Compra cancelada - ${order}`;
    case 'order_shipped':        return `¡Tu pedido fue enviado! - ${order}`;
    case 'order_status_changed': return `Estado de pedido actualizado - ${order}`;
    case 'payment_confirmed':    return `Pago confirmado - ${order}`;
    case 'payment_status':       return `Estado de pago actualizado - ${order}`;
    case 'delivery_tracking':    return `Seguimiento de entrega - ${order}`;
    case 'payment_issue':        return `Problema con pago - ${order}`;
    default:                     return `Notificación - ${order}`;
  }
}

/* ============================================
   API pública del servicio (tu objeto exportado)
   ============================================ */
export const notificationService = {
  async getUserHistory(userId: string): Promise<Notification[]> {
    if (isMock) {
      const base: RawUserNotification[] = [
        {
          id: 'h1',
          eventType: 'order_created',
          subject: 'Confirmación de compra - #ORD-123',
          channel: 'email',
          status: 'sent',
          sentAt: new Date(Date.now() - 60_000 * 5).toISOString(),
        },
        {
          id: 'h2',
          eventType: 'order_shipped',
          subject: '¡Tu pedido fue enviado! - #ORD-123',
          channel: 'push', // mock push → se verá como internal
          status: 'sent',
          sentAt: new Date(Date.now() - 60_000 * 3).toISOString(),
        },
      ];
      // 👇 unimos el mock "estático" con el buffer dinámico
      return [...base, ...mockDynamic].map(normalizeUserNotification).sort(sortDesc);
    }
    const { data } = await api.get<RawUserNotification[]>(
      `/notifications/user/${encodeURIComponent(userId)}`
    );
    return data.map(normalizeUserNotification).sort(sortDesc);
  },

  async getUserInternalUnread(userId: string): Promise<Notification[]> {
    if (isMock) {
      // Si tuvieras mock interno separado, podrías sumarlo acá.
      return [];
    }
    const { data } = await api.get<RawInternalNotification[]>(
      `/notifications/user/${encodeURIComponent(userId)}/internal`
    );
    return data.map(normalizeInternal).sort(sortDesc);
  },

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    if (isMock) { /* ... */ }
    const { data } = await api.get<UserPreferences>(
      `/notifications/user/${encodeURIComponent(userId)}/preferences`
    );
    return data;
  },

  async updateUserPreferences(userId: string, body: Partial<UserPreferences>): Promise<UserPreferences> {
    if (isMock) { /* ... */ }
    const { data } = await api.put<UserPreferences>(
      `/notifications/user/${encodeURIComponent(userId)}/preferences`,
      body
    );
    return data;
  },

  async markAsRead(id: string, userId: string, readAt?: string): Promise<boolean> {
    if (isMock) return true;
    const { data } = await api.patch<{ success: boolean }>(
      `/notifications/${encodeURIComponent(id)}/read`,
      { userId, ...(readAt ? { readAt } : {}) }
    );
    return !!data?.success;
  },

  // 👉 NUEVO: crear mock dinámico para probar pop-ups sin tocar UI
  async createMockNotification(userId: string, seed?: Partial<RawUserNotification>) {
    if (!isMock) {
      // Si quisieras, aquí podrías hacer un POST real:
      // await api.post('/notifications', { ...payload });
      console.warn('[notificationService] createMockNotification ignorado (no es mock).');
      return;
    }
    const eventType = seed?.eventType ?? randomEventType();
    const channel = seed?.channel ?? randomChannel();
    const id = seed?.id ?? `mock-${Date.now()}`;
    const subject = seed?.subject ?? subjectFor(eventType);

    const raw: RawUserNotification = {
      id,
      eventType,
      subject,
      channel,
      status: 'sent',
      sentAt: new Date().toISOString(),
    };
    mockDynamic.push(raw);
  },

  // Polling combinado
  subscribePolling(params: {
    userId: string;
    onDiff: (nuevas: Notification[]) => void;
    includeHistory?: boolean;
    intervalMs?: number;
  }) {
    const interval = params.intervalMs ?? POLL_MS;
    let stopped = false;
    let timer: number | null = null;
    let known = new Set<string>();

    const tick = async () => {
      try {
        const [internals, history] = await Promise.all([
          this.getUserInternalUnread(params.userId),
          params.includeHistory ? this.getUserHistory(params.userId) : Promise.resolve<Notification[]>([]),
        ]);
        const list = [...internals, ...history].sort(sortDesc);
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
      const [internalsSeed, historySeed] = await Promise.all([
        this.getUserInternalUnread(params.userId),
        params.includeHistory ? this.getUserHistory(params.userId) : Promise.resolve<Notification[]>([]),
      ]);
      known = new Set([...internalsSeed, ...historySeed].map((n) => n.id));
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
};
