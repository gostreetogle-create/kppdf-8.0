import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (error(); as e) {
      <div
        role="alert"
        aria-live="polite"
        class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive flex items-start gap-3"
      >
        <span class="shrink-0 mt-0.5">⚠</span>
        <span class="flex-1">{{ e.message }}</span>
        @if (e.canRetry) {
          <button
            type="button"
            class="text-xs underline underline-offset-2 hover:text-destructive/80 shrink-0"
            (click)="retry.emit()"
          >
            Повторить
          </button>
        }
      </div>
    }
  `,
})
export class ErrorBannerComponent {
  readonly error = input<{ message: string; canRetry?: boolean } | null>(null);
  readonly retry = output<void>();
}
