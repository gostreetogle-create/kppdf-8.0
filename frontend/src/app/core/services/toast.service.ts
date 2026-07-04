import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'default' | 'info' | 'success' | 'warning' | 'destructive';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: number;
  type: ToastVariant;
  title?: string;
  message: string;
  duration: number; // ms, 0 = no auto-dismiss
  action?: ToastAction;
}

const MAX_VISIBLE = 5;
const DEFAULT_DURATION = 4000;

/**
 * Toast service (TZ-40 enhanced API).
 * - 4+1 types: success, error/warning, info, default
 * - title + message (2 lines)
 * - optional action button
 * - max 5 visible, older auto-queue (drop oldest)
 * - auto-dismiss via setTimeout (duration=0 disables)
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly items = signal<Toast[]>([]);
  readonly toasts = this.items.asReadonly();
  private seq = 0;

  show(
    message: string,
    type: ToastVariant = 'default',
    duration: number = DEFAULT_DURATION,
  ): number {
    return this.add({ type, message, duration });
  }

  info(message: string, title?: string): number {
    return this.add({ type: 'info', message, title, duration: DEFAULT_DURATION });
  }

  success(message: string, title?: string): number {
    return this.add({ type: 'success', message, title, duration: DEFAULT_DURATION });
  }

  warning(message: string, title?: string): number {
    return this.add({ type: 'warning', message, title, duration: DEFAULT_DURATION });
  }

  error(message: string, title?: string): number {
    return this.add({ type: 'destructive', message, title, duration: DEFAULT_DURATION });
  }

  withAction(
    message: string,
    action: ToastAction,
    type: ToastVariant = 'default',
  ): number {
    return this.add({ type, message, action, duration: DEFAULT_DURATION });
  }

  dismiss(id: number): void {
    this.items.update((arr) => arr.filter((t) => t.id !== id));
  }

  clear(): void {
    this.items.set([]);
  }

  private add(partial: Omit<Toast, 'id'>): number {
    const id = ++this.seq;
    this.items.update((arr) => {
      const next = [...arr, { ...partial, id }];
      // Cap visible toasts (drop oldest non-action toasts)
      if (next.length > MAX_VISIBLE) {
        return next.slice(next.length - MAX_VISIBLE);
      }
      return next;
    });
    if (partial.duration > 0) {
      setTimeout(() => this.dismiss(id), partial.duration);
    }
    return id;
  }
}
