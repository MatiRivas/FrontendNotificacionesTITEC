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

// Map tipos -> kind UI
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

// Normalizadores
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
  const id = raw.id ?? raw._id ?? crypto.randomUUID();
  const kind = mapEventTypeToKind(raw.type);
  const body = raw.message ?? raw.content;
  return {
    id,
    kind,
    title: raw.title,
    body,
    channel: 'internal',
    status: raw.status,
    createdAt: raw.createdAt,
    sentAt: raw.sentAt,
    isRead: raw.isRead,
    meta: {
      ...(raw.metadata ?? {}),
      priority: raw.priority,
      wasPush: false,
      originalChannel: raw.channel,
    },
  };
}

function sortDesc(a: Notification, b: Notification) {
  return a.createdAt < b.createdAt ? 1 : -1;
}

/* ===========================
   MOCK en memoria
   =========================== */
const mockDynamic: RawUserNotification[] = [];

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
    'payment_dispute',
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}
function randomChannel(): 'push' | 'email' | 'internal' {
  const channels = ['push', 'email', 'internal'] as const; // <- tuple literal
  return channels[Math.floor(Math.random() * channels.length)];
}
function subjectFor(e: EventType, order = `#ORD-${Math.floor(Math.random() * 900 + 100)}`) {
  switch (e) {
    case 'order_created': return `Confirmación de compra - ${order}`;
    case 'order_canceled': return `Compra cancelada - ${order}`;
    case 'order_shipped': return `¡Tu pedido fue enviado! - ${order}`;
    case 'order_status_changed': return `Estado de pedido actualizado - ${order}`;
    case 'payment_confirmed': return `Pago confirmado - ${order}`;
    case 'payment_status': return `Estado de pago actualizado - ${order}`;
    case 'delivery_tracking': return `Seguimiento de entrega - ${order}`;
    case 'payment_issue': return `Problema con pago - ${order}`;
    case 'payment_dispute': return `Disputa de pago - ${order}`;
    default: return `Notificación - ${order}`;
  }
}

/* ===========================
   API pública
   =========================== */
export const notificationService = {
  async getUserHistory(userId: string): Promise<Notification[]> {
    if (isMock) {
      const base: RawUserNotification[] = [
        {
          id: 'h1',
          eventType: 'order_created',
          subject: 'Confirmación de compra - #ORD-123',
          channel: 'push',
          status: 'sent',
          sentAt: new Date(Date.now() - 60_000 * 5).toISOString(),
        },
        {
          id: 'h2',
          eventType: 'order_shipped',
          subject: '¡Tu pedido fue enviado! - #ORD-123',
          channel: 'push',
          status: 'sent',
          sentAt: new Date(Date.now() - 60_000 * 3).toISOString(),
        },
      ];
      return [...base, ...mockDynamic].map(normalizeUserNotification).sort(sortDesc);
    }
    // PENDIENTE: este endpoint no está en Endpoints.txt → desactivado
    // Mantener para futuro; por ahora retornamos []
    console.warn('[notificationService] getUserHistory: endpoint no documentado; usando []');
    return [];
  },

  async getUserInternal(userId: string, opts?: { limit?: number; offset?: number; unreadOnly?: boolean }): Promise<Notification[]> {
    const q = new URLSearchParams();
    if (opts?.limit != null) q.set('limit', String(opts.limit));
    if (opts?.offset != null) q.set('offset', String(opts.offset));
    if (opts?.unreadOnly != null) q.set('unreadOnly', String(!!opts.unreadOnly));

    if (isMock) {
      // Mock vacío por ahora; puedes inyectar con createMockNotification (histórico se mezcla)
      return [];
    }

    const { data } = await api.get<RawInternalNotification[]>(
      `/notifications/user/${encodeURIComponent(userId)}/internal${q.toString() ? `?${q.toString()}` : ''}`,
    );
    return data.map(normalizeInternal).sort(sortDesc);
  },

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    if (isMock) {
      return {
        userId,
        preferredChannels: ['internal', 'email'],
        enableNotifications: true,
        channelSettings: {},
        notificationTypes: ['order', 'payment', 'shipping'],
        lastUpdated: new Date().toISOString(),
      };
    }
    // PENDIENTE: no documentado
    console.warn('[notificationService] getUserPreferences: endpoint no documentado; mock only');
    return {
      userId,
      preferredChannels: ['internal', 'email'],
      enableNotifications: true,
      channelSettings: {},
      notificationTypes: ['order', 'payment', 'shipping'],
      lastUpdated: new Date().toISOString(),
    };
  },

  async updateUserPreferences(userId: string, body: Partial<UserPreferences>): Promise<UserPreferences> {
    if (isMock) {
      return {
        userId,
        preferredChannels: (body.preferredChannels ?? ['internal', 'email']) as any,
        enableNotifications: body.enableNotifications ?? true,
        channelSettings: body.channelSettings ?? {},
        notificationTypes: (body.notificationTypes ?? ['order', 'payment', 'shipping']) as any,
        lastUpdated: new Date().toISOString(),
      };
    }
    // PENDIENTE: no documentado
    console.warn('[notificationService] updateUserPreferences: endpoint no documentado; mock only');
    return this.getUserPreferences(userId);
  },

  async markAsRead(id: string, userId: string, readAt?: string): Promise<boolean> {
    if (isMock) return true;
    const { data } = await api.patch<{ success: boolean }>(
      `/notifications/${encodeURIComponent(id)}/read`,
      { userId, ...(readAt ? { readAt } : {}) },
    );
    return !!data?.success;
  },

  async createMockNotification(userId: string, seed?: Partial<RawUserNotification>) {
    if (!isMock) {
      console.warn('[notificationService] createMockNotification ignorado (no es mock).');
      return;
    }
    const eventType = seed?.eventType ?? randomEventType();
    const channel = seed?.channel ?? randomChannel();
    const id = seed?.id ?? `mock-${Date.now()}`;
    const subject = seed?.subject ?? subjectFor(eventType);
    const raw: RawUserNotification = { id, eventType, subject, channel, status: 'sent', sentAt: new Date().toISOString() };
    mockDynamic.push(raw);
  },

  // Polling unificado
  subscribePolling(params: {
    userId: string;
    onDiff: (nuevas: Notification[]) => void;
    includeHistory?: boolean;
    intervalMs?: number;
    unreadOnly?: boolean;
  }) {
    const interval = params.intervalMs ?? POLL_MS;
    let stopped = false;
    let timer: number | null = null;
    let known = new Set<string>();

    const tick = async () => {
      try {
        const [internals, history] = await Promise.all([
          this.getUserInternal(params.userId, { unreadOnly: params.unreadOnly, limit: 50, offset: 0 }),
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
        this.getUserInternal(params.userId, { unreadOnly: params.unreadOnly, limit: 50, offset: 0 }),
        params.includeHistory ? this.getUserHistory(params.userId) : Promise.resolve<Notification[]>([]),
      ]);
      known = new Set([...internalsSeed, ...historySeed].map((n) => n.id));
      if (!stopped) timer = window.setTimeout(tick, interval);
    })();

    return () => {
      stopped = true;
      if (timer) { window.clearTimeout(timer); timer = null; }
    };
  },
};
``