import { Injectable, inject } from '@angular/core';
import { PiNotificationCenterService } from '../notifications/pi-notification-center.service';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning';

export interface ToastOpts {
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  /** Skip mirroring into the header notification inbox (rare). */
  silentInbox?: boolean;
}

export interface QueuedToast {
  id: string;
  message: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

/**
 * Paper & Ink Toast service — Sonner-style singleton queue.
 *
 * - In-memory FIFO of `QueuedToast` items.
 * - Auto-dismiss via `setTimeout` when `duration > 0`.
 * - Mirrors into {@link PiNotificationCenterService} (bell inbox).
 * - `subscribe(cb)` fans out every enqueue/dismiss; returns unsubscribe fn.
 *
 * Service is `providedIn: 'root'`. The host component `<app-pi-toast-host>`
 * mounts once in `app.ts` and bridges the queue to the DOM.
 */
@Injectable({ providedIn: 'root' })
export class PiToastService {
  private queue: QueuedToast[] = [];
  private readonly listeners = new Set<(toasts: QueuedToast[]) => void>();
  private readonly inbox = inject(PiNotificationCenterService);

  // ---- Public dispatchers (Sonner-style API) ----

  show(message: string, opts: ToastOpts = {}): string {
    const id = this.genId();
    const variant = opts.variant ?? 'default';
    const toast: QueuedToast = {
      id,
      message,
      description: opts.description,
      variant,
      duration: opts.duration ?? (variant === 'error' || variant === 'warning' ? 8000 : 4000),
    };
    this.queue.push(toast);
    this.emit();
    if (!opts.silentInbox) {
      this.inbox.push({
        kind: 'toast',
        severity: variant,
        title: message,
        body: opts.description,
        source: 'система',
      });
    }
    if (toast.duration > 0) {
      setTimeout(() => this.dismiss(id), toast.duration);
    }
    return id;
  }

  success(message: string, opts: Omit<ToastOpts, 'variant'> = {}): string {
    return this.show(message, { ...opts, variant: 'success' });
  }

  error(message: string, opts: Omit<ToastOpts, 'variant'> = {}): string {
    return this.show(message, { ...opts, variant: 'error' });
  }

  warning(message: string, opts: Omit<ToastOpts, 'variant'> = {}): string {
    return this.show(message, { ...opts, variant: 'warning' });
  }

  /** Drop one toast by id, or all (id omitted) on Esc. */
  dismiss(id?: string): void {
    if (id === undefined) {
      this.queue = [];
    } else {
      this.queue = this.queue.filter((t) => t.id !== id);
    }
    this.emit();
  }

  subscribe(cb: (toasts: QueuedToast[]) => void): () => void {
    this.listeners.add(cb);
    cb([...this.queue]);
    return () => {
      this.listeners.delete(cb);
    };
  }

  // ---- Internals ----

  private emit(): void {
    for (const cb of this.listeners) {
      cb([...this.queue]);
    }
  }

  private genId(): string {
    return `toast-${Math.random().toString(36).slice(2, 10)}`;
  }
}
