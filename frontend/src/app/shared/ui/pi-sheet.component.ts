import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { PI_SHEET_REF } from './pi-sheet.tokens';

export type SheetAnchor = 'right' | 'left' | 'top' | 'bottom';
export type SheetSize = 'sm' | 'md' | 'lg';

/**
 * Paper & Ink Sheet — side drawer from viewport edge.
 * Width/height is set by PiSheetService.open() via overlay.create config.
 * Hairline border only on the side touching the viewport.
 */
@Component({
  selector: 'app-pi-sheet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="dialog"
      [attr.aria-label]="title()"
      [attr.aria-modal]="true"
      [class]="containerClass()"
    >
      @if (title()) {
        <header class="px-5 py-3 border-b hairline border-rule flex items-center justify-between">
          <h2 class="font-display text-lg tracking-tight text-ink">{{ title() }}</h2>
          @if (showClose()) {
            <button
              type="button"
              class="inline-flex items-center justify-center w-7 h-7 rounded-sm hairline border border-rule bg-paper hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              (click)="close.emit()"
              aria-label="Закрыть"
            >
              <span aria-hidden="true" class="text-base leading-none">×</span>
            </button>
          }
        </header>
      }
      <div class="flex-1 overflow-auto px-5 py-4 text-sm">
        <ng-content />
      </div>
    </div>
  `,
  host: {
    class: 'block h-full',
  },
})
export class SheetComponent {
  /** Provided by PiSheetService.open() via child injector. */
  readonly ref = inject(PI_SHEET_REF, { optional: true });

  readonly title = input<string>('');
  readonly anchor = input<SheetAnchor>('right');
  readonly size = input<SheetSize>('md');
  readonly showClose = input<boolean>(true);

  readonly close = output<void>();

  containerClass(): string {
    const anchor = this.anchor();
    if (anchor === 'right') return 'bg-paper flex flex-col h-full border-l hairline border-rule';
    if (anchor === 'left') return 'bg-paper flex flex-col h-full border-r hairline border-rule';
    if (anchor === 'top') return 'bg-paper flex flex-col w-full border-b hairline border-rule';
    return 'bg-paper flex flex-col w-full hairline-t';
  }
}
