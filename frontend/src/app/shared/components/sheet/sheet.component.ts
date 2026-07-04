import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
  viewChild,
  effect,
} from '@angular/core';

export type SheetSide = 'right' | 'left' | 'top' | 'bottom';

/**
 * Sheet / Drawer (TZ-31) — backdrop + slide-in panel.
 * Usage:
 *   @if (open()) {
 *     <hlm-sheet side="right" (closed)="open.set(false)">
 *       <h2 slot="header">Settings</h2>
 *       ...content...
 *     </hlm-sheet>
 *   }
 */
@Component({
  selector: 'hlm-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      [class.animate-fade-in]="true"
      (click)="onBackdrop()"
      role="presentation"
    ></div>
    <div
      #panel
      [class]="'fixed z-50 gap-4 bg-background p-6 shadow-lg ' + panelClass()"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="ariaLabel() || 'Sheet'"
    >
      <ng-content select="[slot=header]"></ng-content>
      <div class="flex-1 overflow-y-auto">
        <ng-content></ng-content>
      </div>
      <button
        type="button"
        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        (click)="close()"
        aria-label="Close"
      >
        <span class="lucide-x h-4 w-4" aria-hidden="true"></span>
      </button>
    </div>
  `,
})
export class SheetComponent {
  readonly side = input<SheetSide>('right');
  readonly ariaLabel = input<string>('');
  readonly dismissable = input<boolean>(true);
  readonly widthClass = input<string>('w-3/4 sm:max-w-sm');

  readonly closed = output<void>();

  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  constructor() {
    // Apply side-specific positioning via inline style once panel is created
    effect(() => {
      const p = this.panel()?.nativeElement;
      if (!p) return;
      const side = this.side();
      const w = this.widthClass();
      const base: Record<string, string> = {};
      switch (side) {
        case 'right':
          Object.assign(base, { right: '0', top: '0', height: '100vh' });
          p.style.width = w;
          p.style.maxWidth = w;
          p.classList.add('animate-slide-in-right');
          break;
        case 'left':
          Object.assign(base, { left: '0', top: '0', height: '100vh' });
          p.style.width = w;
          p.style.maxWidth = w;
          p.classList.add('animate-slide-in-left');
          break;
        case 'top':
          Object.assign(base, { top: '0', left: '0', width: '100vw' });
          p.style.height = 'auto';
          p.classList.add('animate-slide-in-top');
          break;
        case 'bottom':
          Object.assign(base, { bottom: '0', left: '0', width: '100vw' });
          p.style.height = 'auto';
          p.classList.add('animate-slide-in-bottom');
          break;
      }
      Object.assign(p.style, base);
    });
  }

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

  protected panelClass(): string {
    const side = this.side();
    if (side === 'right' || side === 'left') return 'flex flex-col';
    return 'flex flex-col';
  }
}
