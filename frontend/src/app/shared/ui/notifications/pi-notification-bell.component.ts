import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { Bell, LucideAngularModule, X } from 'lucide-angular';
import { PiNotificationCenterService } from './pi-notification-center.service';
import type { NotificationSeverity, PiNotification } from './pi-notification.types';

const SEVERITY_DOT: Record<NotificationSeverity, string> = {
  default: 'bg-muted-foreground',
  success: 'bg-ink',
  error: 'bg-destructive',
  warning: 'bg-sunrise-warm',
};

/**
 * Header bell + dropdown inbox. Local ring only (no server yet).
 */
@Component({
  selector: 'app-pi-notification-bell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, DatePipe],
  template: `
    <div class="relative" data-test="notification-bell-root">
      <button
        type="button"
        class="pi-icon-btn relative pi-focus-ring"
        [attr.aria-expanded]="center.panelOpen()"
        aria-haspopup="dialog"
        aria-controls="pi-notification-panel"
        aria-label="Уведомления"
        title="Уведомления"
        data-test="notification-bell-button"
        (click)="onToggle($event)"
      >
        <lucide-angular [img]="bellIcon" [size]="14" aria-hidden="true" />
        @if (center.unreadCount() > 0) {
          <span
            class="absolute -top-0.5 -right-0.5 min-w-[1rem] h-4 px-0.5 rounded-sm
                   bg-sunrise-warm text-paper text-[9px] font-mono leading-4 text-center"
            data-test="notification-bell-badge"
            aria-hidden="true"
            >{{ center.unreadCount() > 9 ? '9+' : center.unreadCount() }}</span
          >
        }
      </button>

      @if (center.panelOpen()) {
        <div
          id="pi-notification-panel"
          role="dialog"
          aria-label="Список уведомлений"
          data-test="notification-panel"
          class="absolute right-0 top-full mt-2 z-40 w-[min(22rem,calc(100vw-1.5rem))]
                 max-h-[min(28rem,70vh)] flex flex-col hairline rounded-sm bg-paper shadow-md
                 overflow-hidden"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between gap-2 px-3 py-2 hairline-b bg-paper-2/60">
            <p class="m-0 text-sm font-medium">Уведомления</p>
            <div class="flex items-center gap-1">
              @if (center.items().length > 0) {
                <button
                  type="button"
                  class="eyebrow text-muted-foreground hover:text-ink px-1.5 py-0.5 rounded-sm"
                  data-test="notification-clear"
                  (click)="center.clear()"
                >
                  Очистить
                </button>
              }
            </div>
          </div>

          <ul
            class="m-0 p-0 list-none overflow-y-auto flex-1 min-h-0"
            data-test="notification-list"
          >
            @for (n of reversed(); track n.id) {
              <li
                class="hairline-b last:border-0 px-3 py-2.5 flex gap-2 items-start"
                [class.bg-paper-2]="!n.read"
                [attr.data-test]="'notification-item-' + n.id"
                [attr.data-severity]="n.severity"
              >
                <span
                  class="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                  [class]="dotClass(n.severity)"
                  aria-hidden="true"
                ></span>
                <div class="min-w-0 flex-1 space-y-0.5">
                  <p class="m-0 text-sm text-ink break-words">{{ n.title }}</p>
                  @if (n.body) {
                    <p class="m-0 text-xs text-muted-foreground break-words">{{ n.body }}</p>
                  }
                  <p class="m-0 text-[10px] font-mono text-muted-foreground tabular-nums">
                    {{ n.createdAt | date: 'HH:mm:ss' }}
                    @if (n.source) {
                      <span> · {{ n.source }}</span>
                    }
                  </p>
                </div>
                <button
                  type="button"
                  class="shrink-0 w-7 h-7 inline-flex items-center justify-center rounded-sm
                         text-muted-foreground hover:text-ink pi-focus-ring"
                  [attr.aria-label]="'Удалить: ' + n.title"
                  data-test="notification-dismiss"
                  (click)="center.dismiss(n.id)"
                >
                  <lucide-angular [img]="closeIcon" [size]="12" aria-hidden="true" />
                </button>
              </li>
            } @empty {
              <li
                class="px-3 py-8 text-center text-sm text-muted-foreground"
                data-test="notification-empty"
              >
                Пока тихо — ошибки и важные события появятся здесь
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `,
})
export class PiNotificationBellComponent {
  protected readonly center = inject(PiNotificationCenterService);
  protected readonly bellIcon = Bell;
  protected readonly closeIcon = X;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    const destroyRef = inject(DestroyRef);
    if (!this.isBrowser) return;
    const onDocClick = (): void => this.center.closePanel();
    // Defer so the opening click does not immediately close.
    queueMicrotask(() => document.addEventListener('click', onDocClick));
    destroyRef.onDestroy(() => document.removeEventListener('click', onDocClick));
  }

  protected reversed(): PiNotification[] {
    return [...this.center.items()].reverse();
  }

  protected dotClass(severity: NotificationSeverity): string {
    return SEVERITY_DOT[severity];
  }

  protected onToggle(event: MouseEvent): void {
    event.stopPropagation();
    this.center.togglePanel();
  }

  @HostListener('document:keydown.escape')
  protected onEsc(): void {
    if (this.center.panelOpen()) this.center.closePanel();
  }
}
