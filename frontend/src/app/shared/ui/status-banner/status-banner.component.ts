import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

export type PiStatusBannerTone = 'warning' | 'info' | 'destructive' | 'neutral';

const TONE_CLASS: Record<PiStatusBannerTone, string> = {
  warning: 'bg-warning/10 border-warning/30 text-warning',
  info: 'bg-info/10 border-info/30 text-info',
  destructive: 'bg-destructive/10 border-destructive/30 text-destructive',
  neutral: 'bg-paper-2 border-rule text-ink',
};

/**
 * Persistent lifecycle/status emphasis for a page record.
 *
 * This is intentionally separate from ErrorBanner (load failures), Toast
 * (transient feedback), and Dialog (modal interaction).
 */
@Component({
  selector: 'app-pi-status-banner',
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="computedClass()"
      data-test="pi-status-banner"
      [attr.data-tone]="tone()"
      role="status"
    >
      <div class="flex items-center justify-between gap-form-field">
        <p class="m-0 flex-1 leading-snug">{{ message() }}</p>
        @if (actionLabel()) {
          <app-pi-button
            variant="link"
            size="sm"
            [ariaLabel]="actionLabel()"
            (click)="action.emit()"
          >
            {{ actionLabel() }}
          </app-pi-button>
        }
      </div>
    </div>
  `,
})
export class PiStatusBannerComponent {
  readonly tone = input<PiStatusBannerTone>('neutral');
  readonly message = input.required<string>();
  readonly actionLabel = input<string>('');
  readonly action = output<void>();

  protected readonly computedClass = computed(() =>
    [
      'w-full',
      'rounded-none',
      'hairline',
      'px-panel-inset',
      'py-control-y',
      'text-sm',
      TONE_CLASS[this.tone()],
    ].join(' '),
  );
}
