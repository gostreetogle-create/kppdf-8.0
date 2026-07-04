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
} from '@angular/core';

export type PopoverPlacement = 'top' | 'right' | 'bottom' | 'left' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';

/**
 * Popover (TZ-38) — floating panel anchored to a trigger.
 * Usage:
 *   <hlm-popover placement="bottom-start">
 *     <button trigger>Open</button>
 *     <div content>Popover content</div>
 *   </hlm-popover>
 */
@Component({
  selector: 'hlm-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content select="[trigger]"></ng-content>
    @if (open()) {
      <div
        #content
        [class]="'absolute z-50 w-72 rounded-md border border-border bg-popover p-4 text-sm text-popover-foreground shadow-md outline-none animate-fade-in ' + positionClass()"
        role="dialog"
        (click)="$event.stopPropagation()"
      >
        <ng-content select="[content]"></ng-content>
        <button
          type="button"
          class="absolute right-2 top-2 rounded-sm opacity-70 hover:opacity-100"
          (click)="close()"
          aria-label="Close"
        >
          <span class="lucide-x h-3.5 w-3.5"></span>
        </button>
      </div>
    }
  `,
  host: {
    class: 'relative inline-block',
  },
})
export class PopoverComponent {
  readonly placement = input<PopoverPlacement>('bottom');
  readonly openChange = output<boolean>();

  protected readonly open = signal(false);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly content = viewChild<ElementRef<HTMLElement>>('content');

  toggle(): void {
    this.open() ? this.close() : this.show();
  }

  show(): void {
    this.open.set(true);
    this.openChange.emit(true);
  }

  close(): void {
    this.open.set(false);
    this.openChange.emit(false);
  }

  @HostListener('document:click', ['$event'])
  onDoc(e: Event): void {
    if (!this.host.nativeElement.contains(e.target as Node)) this.close();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.close();
  }

  protected positionClass(): string {
    switch (this.placement()) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'top-start':
        return 'bottom-full left-0 mb-2';
      case 'top-end':
        return 'bottom-full right-0 mb-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'bottom-start':
        return 'top-full left-0 mt-2';
      case 'bottom-end':
        return 'top-full right-0 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
    }
  }
}
