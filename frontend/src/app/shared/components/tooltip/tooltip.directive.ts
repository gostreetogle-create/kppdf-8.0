import {
  Directive,
  ElementRef,
  HostListener,
  Renderer2,
  inject,
  input,
  signal,
} from '@angular/core';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

/**
 * Tooltip directive (lightweight, no CDK Overlay).
 * Usage: <button [hlmTooltip]="'Save'" [hlmTooltipPosition]="'top'">...</button>
 */
@Directive({
  selector: '[hlmTooltip]',
  standalone: true,
  host: {
    '[attr.aria-describedby]': 'shown() ? "hlm-tooltip-" + uid : null',
  },
})
export class TooltipDirective {
  readonly hlmTooltip = input.required<string>();
  readonly hlmTooltipPosition = input<TooltipPosition>('top');
  readonly hlmTooltipDelay = input<number>(200);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private tooltipEl: HTMLElement | null = null;
  private showTimeout: ReturnType<typeof setTimeout> | null = null;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  protected readonly shown = signal(false);
  protected readonly uid = Math.random().toString(36).slice(2);

  @HostListener('mouseenter')
  onEnter(): void {
    this.cancelHide();
    this.showTimeout = setTimeout(() => this.show(), this.hlmTooltipDelay());
  }

  @HostListener('mouseleave')
  onLeave(): void {
    this.cancelShow();
    this.hideTimeout = setTimeout(() => this.hide(), 100);
  }

  @HostListener('focus')
  onFocus(): void {
    this.show();
  }

  @HostListener('blur')
  onBlur(): void {
    this.hide();
  }

  private show(): void {
    if (this.tooltipEl) return;
    const el = this.renderer.createElement('div');
    el.id = `hlm-tooltip-${this.uid}`;
    el.setAttribute('role', 'tooltip');
    el.textContent = this.hlmTooltip();
    el.className = this.tooltipClass();
    document.body.appendChild(el);
    this.tooltipEl = el;
    this.position();
    this.shown.set(true);
  }

  private hide(): void {
    if (this.tooltipEl) {
      this.renderer.removeChild(document.body, this.tooltipEl);
      this.tooltipEl = null;
    }
    this.shown.set(false);
  }

  private position(): void {
    if (!this.tooltipEl) return;
    const trigger = this.host.nativeElement.getBoundingClientRect();
    const tip = this.tooltipEl.getBoundingClientRect();
    const offset = 8;
    let top = 0;
    let left = 0;
    switch (this.hlmTooltipPosition()) {
      case 'top':
        top = trigger.top - tip.height - offset;
        left = trigger.left + (trigger.width - tip.width) / 2;
        break;
      case 'right':
        top = trigger.top + (trigger.height - tip.height) / 2;
        left = trigger.left + trigger.width + offset;
        break;
      case 'bottom':
        top = trigger.top + trigger.height + offset;
        left = trigger.left + (trigger.width - tip.width) / 2;
        break;
      case 'left':
        top = trigger.top + (trigger.height - tip.height) / 2;
        left = trigger.left - tip.width - offset;
        break;
    }
    // Clamp to viewport
    left = Math.max(4, Math.min(window.innerWidth - tip.width - 4, left));
    top = Math.max(4, Math.min(window.innerHeight - tip.height - 4, top));
    this.tooltipEl.style.position = 'fixed';
    this.tooltipEl.style.top = `${top}px`;
    this.tooltipEl.style.left = `${left}px`;
  }

  private tooltipClass(): string {
    return [
      'z-50 px-2.5 py-1 rounded-md text-xs font-medium shadow-md',
      'bg-foreground text-background',
      'animate-scale-in',
      'pointer-events-none',
    ].join(' ');
  }

  private cancelShow(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
  }

  private cancelHide(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }
}
