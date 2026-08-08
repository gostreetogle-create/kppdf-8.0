import { Injectable, computed, signal } from '@angular/core';
import {
  NOTIFICATION_RING_SIZE,
  type NotificationKind,
  type NotificationSeverity,
  type PiNotification,
} from './pi-notification.types';

export interface PushNotificationInput {
  title: string;
  body?: string;
  kind?: NotificationKind;
  severity?: NotificationSeverity;
  source?: string;
  /** Mark unread (default true). */
  unread?: boolean;
}

/**
 * Local notification inbox for the header bell.
 * FIFO ring of {@link NOTIFICATION_RING_SIZE}: oldest dropped when full.
 * Phase 1 = toast/system mirror. `kind: 'message'` reserved for manager mail.
 */
@Injectable({ providedIn: 'root' })
export class PiNotificationCenterService {
  private readonly _items = signal<PiNotification[]>([]);
  private readonly _panelOpen = signal(false);

  readonly items = this._items.asReadonly();
  readonly panelOpen = this._panelOpen.asReadonly();
  readonly unreadCount = computed(() => this._items().filter((n) => !n.read).length);

  push(input: PushNotificationInput): string {
    const id = `ntf-${Math.random().toString(36).slice(2, 10)}`;
    const next: PiNotification = {
      id,
      kind: input.kind ?? 'system',
      severity: input.severity ?? 'default',
      title: input.title,
      body: input.body,
      createdAt: Date.now(),
      read: input.unread === false,
      source: input.source,
    };
    this._items.update((list) => {
      const merged = [...list, next];
      if (merged.length <= NOTIFICATION_RING_SIZE) return merged;
      return merged.slice(merged.length - NOTIFICATION_RING_SIZE);
    });
    return id;
  }

  dismiss(id: string): void {
    this._items.update((list) => list.filter((n) => n.id !== id));
  }

  markRead(id: string): void {
    this._items.update((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  markAllRead(): void {
    this._items.update((list) => list.map((n) => ({ ...n, read: true })));
  }

  clear(): void {
    this._items.set([]);
  }

  togglePanel(open?: boolean): void {
    const next = open ?? !this._panelOpen();
    this._panelOpen.set(next);
    if (next) this.markAllRead();
  }

  closePanel(): void {
    this._panelOpen.set(false);
  }
}
