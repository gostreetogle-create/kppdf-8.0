import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'default' | 'success' | 'warning' | 'destructive';

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly items = signal<Toast[]>([]);
  readonly toasts = this.items.asReadonly();
  private seq = 0;

  show(message: string, variant: ToastVariant = 'default', duration = 4000): void {
    const id = ++this.seq;
    this.items.update((arr) => [...arr, { id, message, variant, duration }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string): void {
    this.show(message, 'success');
  }
  error(message: string): void {
    this.show(message, 'destructive');
  }
  warning(message: string): void {
    this.show(message, 'warning');
  }

  dismiss(id: number): void {
    this.items.update((arr) => arr.filter((t) => t.id !== id));
  }
}
