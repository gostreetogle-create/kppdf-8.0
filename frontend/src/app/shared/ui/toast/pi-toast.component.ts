import { ChangeDetectionStrategy, Component, DestroyRef, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PiToastService, type QueuedToast } from './pi-toast.service';

const VARIANT_CLASS: Record<QueuedToast['variant'], string> = {
  default: 'border-rule',
  success: 'border-ink',
  error: 'border-destructive',
  warning: 'border-destructive',
};

/**
 * Paper & Ink Toast host (Sonner-style) — TZ-56.
 *
 * - Mounted once as `<app-pi-toast-host>` in app.ts root template.
 * - Subscribes to `PiToastService` (singleton, `providedIn: 'root'`);
 *   the service owns the queue, durations, dispatchers.
 * - A11y coverage (TZ-56 acceptance):
 *     · Host root: `role="region"`, `aria-label="Уведомления"`,
 *       `aria-live="polite"`, `aria-atomic="true"`.
 *     · Per-toast root: `role="status"` (default / success) OR
 *       `role="alert"` (error / warning). Screen-readers announce
 *       polite messages after current speech, assertively for faults.
 *     · `.tours` / `.guides` extra classes picked up by a11y
 *       auditing tools (axe-core tags, Storybook tour markers).
 * - `Escape` key dismisses ALL currently-queued toasts.
 *
 * Standalone + OnPush. Cleanup runs through `DestroyRef.onDestroy()`
 * with an `isPlatformBrowser` guard so SSR (TZ-80) won't crash on
 * a missing `document`.
 */
@Component({
  selector: 'app-pi-toast-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="region"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Уведомления"
      data-component="pi-toast-host"
      class="pi-toast-host tours guides fixed top-page-x right-page-x z-50 flex flex-col gap-3 outline-none"
      style="max-width: min(420px, calc(100vw - 24px));"
    >
      @for (t of toasts(); track t.id) {
        <div
          [attr.data-type]="t.variant"
          [attr.role]="t.variant === 'error' || t.variant === 'warning' ? 'alert' : 'status'"
          class="pi-toast bg-paper border rounded-sm px-5 py-4 flex items-start gap-3 tours guides"
          [class]="variantClasses(t.variant)"
        >
          <div class="flex-1 text-sm">
            <div class="pi-toast__message font-body text-ink">{{ t.message }}</div>
            @if (t.description) {
              <div class="pi-toast__description text-muted-foreground text-xs mt-1">
                {{ t.description }}
              </div>
            }
          </div>
          <button
            type="button"
            class="pi-toast__close inline-flex items-center justify-center w-8 h-8 shrink-0 text-muted-foreground hover:text-ink text-sm leading-none rounded-sm transition-colors"
            (click)="dismiss(t.id)"
            aria-label="Закрыть уведомление"
          >×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: contents; }

    .pi-toast {
      pointer-events: auto;
      animation: pi-toast-in 200ms ease-out;
    }

    @keyframes pi-toast-in {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @media (prefers-reduced-motion: reduce) {
      .pi-toast { animation-duration: 0.01ms; }
    }
  `],
})
export class PiToastComponent {
  private readonly service = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Currently queued toasts (mirrors the service's internal queue). */
  readonly toasts = signal<QueuedToast[]>([]);

  constructor() {
    // 1) Subscribe to the service so toasts appear/disappear reactively.
    const unsubscribe = this.service.subscribe((list) => this.toasts.set([...list]));

    // 2) Esc dismisses ALL queued toasts (browser-only, SSR-safe).
    if (!this.isBrowser) {
      // SSR: no `document` object. Still register cleanup for the service sub.
      this.destroyRef.onDestroy(() => unsubscribe());
      return;
    }

    const onKeydown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && this.toasts().length > 0) {
        event.preventDefault();
        this.service.dismiss(/* id omitted → drop all */);
      }
    };
    document.addEventListener('keydown', onKeydown);

    // 3) Cleanup on component teardown.
    this.destroyRef.onDestroy(() => {
      unsubscribe();
      document.removeEventListener('keydown', onKeydown);
    });
  }

  /** Resolve Tailwind border utility class for a given variant. */
  variantClasses(variant: QueuedToast['variant']): string {
    return VARIANT_CLASS[variant];
  }

  /** Close-button handler — dismiss a single toast by id. */
  dismiss(id: string): void {
    this.service.dismiss(id);
  }
}
