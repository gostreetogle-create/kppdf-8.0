import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal } from '@angular/core';

/**
 * HoverCard (TZ-38) — show on mouse enter with delay.
 * Usage:
 *   <hlm-hover-card>
 *     <a trigger>@username</a>
 *     <div content>User profile preview</div>
 *   </hlm-hover-card>
 */
@Component({
  selector: 'hlm-hover-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content select="[trigger]"></ng-content>
    @if (open()) {
      <div
        [class]="'absolute z-50 w-72 rounded-md border border-border bg-popover p-4 text-sm text-popover-foreground shadow-md animate-fade-in ' + positionClass()"
        role="tooltip"
        (mouseenter)="cancel()"
        (mouseleave)="close()"
      >
        <ng-content select="[content]"></ng-content>
      </div>
    }
  `,
  host: {
    class: 'relative inline-block',
  },
})
export class HoverCardComponent {
  readonly placement = input<'top' | 'right' | 'bottom' | 'left'>('bottom');
  readonly delay = input<number>(300);

  protected readonly open = signal(false);
  private readonly host = inject(ElementRef<HTMLElement>);
  private showTimer?: ReturnType<typeof setTimeout>;

  onEnter(): void {
    this.cancel();
    this.showTimer = setTimeout(() => this.open.set(true), this.delay());
  }

  onLeave(): void {
    this.cancel();
    setTimeout(() => {
      // Only close if user moved off popover too (handled by mouseenter on popover)
      // Use a slight delay so the cursor can travel to the popover
      if (!this.host.nativeElement.matches(':hover')) this.open.set(false);
    }, 150);
  }

  close(): void {
    this.open.set(false);
  }

  protected cancel(): void {
    if (this.showTimer) clearTimeout(this.showTimer);
  }

  protected positionClass(): string {
    switch (this.placement()) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
    }
  }
}
