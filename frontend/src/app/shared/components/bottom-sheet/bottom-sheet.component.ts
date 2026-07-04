import { ChangeDetectionStrategy, Component, HostListener, input, output, signal } from '@angular/core';

/**
 * BottomSheet (TZ-38) — mobile-style sheet, slides up from bottom.
 * Usage:
 *   @if (open()) {
 *     <hlm-bottom-sheet (closed)="open.set(false)">...</hlm-bottom-sheet>
 *   }
 */
@Component({
  selector: 'hlm-bottom-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in"
      (click)="onBackdrop()"
      role="presentation"
    ></div>
    <div
      class="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg rounded-t-2xl border-t border-border bg-background p-6 shadow-lg animate-slide-in-bottom"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="ariaLabel() || 'Bottom sheet'"
    >
      <div class="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted"></div>
      <ng-content select="[slot=header]"></ng-content>
      <div class="max-h-[70vh] overflow-y-auto">
        <ng-content></ng-content>
      </div>
      <button
        type="button"
        class="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
        (click)="close()"
        aria-label="Close"
      >
        <span class="lucide-x h-4 w-4"></span>
      </button>
    </div>
  `,
})
export class BottomSheetComponent {
  readonly ariaLabel = input<string>('');
  readonly dismissable = input<boolean>(true);
  readonly closed = output<void>();

  protected onBackdrop(): void {
    if (this.dismissable()) this.close();
  }

  close(): void {
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.dismissable()) this.close();
  }
}
