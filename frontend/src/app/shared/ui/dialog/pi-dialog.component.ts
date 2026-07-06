import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { PI_DIALOG_REF } from './dialog.tokens';
import type { DialogRef } from './pi-dialog.service';

/**
 * Paper & Ink Dialog component — reusable shell with title + body + footer slots.
 *
 * Always opened via PiDialogService.open() which provides PI_DIALOG_REF.
 * No standalone fallback: this component requires the dialog lifecycle.
 */
@Component({
  selector: 'app-pi-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="dialog"
      [attr.aria-label]="effectiveLabel()"
      [attr.aria-modal]="true"
      [class]="panelClass()"
    >
      @if (title() || showClose()) {
        <header class="flex items-center justify-between border-b hairline border-rule px-6 py-4">
          <h2 class="font-display text-lg tracking-tight text-ink">{{ title() }}</h2>
          @if (showClose()) {
            <button
              type="button"
              class="inline-flex items-center justify-center w-8 h-8 rounded-sm hairline border border-rule bg-paper hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              (click)="onUserClose()"
              aria-label="Закрыть"
            >
              <span aria-hidden="true" class="text-base leading-none">×</span>
            </button>
          }
        </header>
      }
      <div class="px-6 py-5 text-sm text-ink">
        <ng-content select="[body]" />
      </div>
      <footer
        class="border-t hairline border-rule px-6 py-4 flex justify-end gap-3 items-center"
      >
        <ng-content select="[footer]" />
      </footer>
    </div>
  `,
  host: {
    class: 'block',
  },
})
export class PiDialogComponent {
  /** Provided by PiDialogService.open() via child DI injector. */
  readonly ref = inject<DialogRef<unknown>>(PI_DIALOG_REF);

  readonly title = input<string>('');
  readonly showClose = input<boolean>(true);
  readonly ariaLabel = input<string | null>(null);
  readonly width = input<'sm' | 'md' | 'lg'>('md');

  /**
   * Emitted ONLY when the user explicitly closes via the X button.
   * Programmatic closes (ESC, backdrop, ref.close(v)) are observable via
   * `ref.closed` (a signal) — not this output.
   */
  readonly userClose = output<void>();

  panelClass(): string {
    const w = this.width();
    const dim =
      w === 'sm' ? 'w-[360px]' : w === 'lg' ? 'w-[640px]' : 'w-[480px]';
    return [
      'bg-paper',
      'border',
      'hairline',
      'border-rule',
      'rounded-sm',
      'overflow-hidden',
      'flex',
      'flex-col',
      dim,
    ].join(' ');
  }

  effectiveLabel(): string {
    return this.title() || this.ariaLabel() || 'Диалог';
  }

  onUserClose(): void {
    this.ref.close();
    this.userClose.emit();
  }
}
