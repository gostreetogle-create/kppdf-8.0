import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  DOCUMENT,
} from '@angular/core';
import {
  Overlay,
  OverlayRef,
  ConnectedPosition,
  HorizontalConnectionPos,
  VerticalConnectionPos,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TooltipComponent } from './pi-tooltip.component';

export type TooltipPos = 'top' | 'bottom' | 'left' | 'right';

const H: Record<'left' | 'right', HorizontalConnectionPos> = {
  left: 'start',
  right: 'end',
};
const V: Record<'top' | 'bottom', VerticalConnectionPos> = {
  top: 'top',
  bottom: 'bottom',
};

/**
 * Paper & Ink Tooltip directive — hover or focus trigger.
 * Auto-flip via withPositions array of two preferred positions.
 */
@Directive({
  selector: '[piTooltip]',
  standalone: true,
})
export class TooltipDirective {
  readonly piTooltip = input.required<string>();
  readonly position = input<TooltipPos>('top');
  readonly delay = input<number>(200);
  readonly closeDelay = input<number>(100);
  readonly ariaLabel = input<string>('');

  private readonly overlay = inject(Overlay);
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly doc = inject(DOCUMENT);

  private activeRef: OverlayRef | null = null;
  private openTimer: ReturnType<typeof setTimeout> | null = null;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  @HostListener('mouseenter') onEnter(): void { this.scheduleOpen(); }
  @HostListener('mouseleave') onLeave(): void { this.scheduleClose(); }
  @HostListener('focusin') onFocus(): void { this.openImmediate(); }
  @HostListener('focusout') onBlur(): void { this.closeNow(); }

  private scheduleOpen(): void {
    if (this.closeTimer) { clearTimeout(this.closeTimer); this.closeTimer = null; }
    if (this.openTimer) clearTimeout(this.openTimer);
    this.openTimer = setTimeout(() => this.show(), this.delay());
  }

  private openImmediate(): void {
    if (this.openTimer) { clearTimeout(this.openTimer); this.openTimer = null; }
    if (this.closeTimer) { clearTimeout(this.closeTimer); this.closeTimer = null; }
    this.show();
  }

  private scheduleClose(): void {
    if (this.openTimer) { clearTimeout(this.openTimer); this.openTimer = null; }
    if (this.closeTimer) clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => this.hide(), this.closeDelay());
  }

  private closeNow(): void { this.hide(); }

  private show(): void {
    if (this.activeRef) return;
    const positions: ConnectedPosition[] = this.buildPositions(this.position());

    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.hostEl)
        .withPositions(positions)
        .withPush(true)
        .withFlexibleDimensions(false),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    const portal = new ComponentPortal(TooltipComponent);
    overlayRef.attach(portal);

    const tooltipId = `pi-tt-${Math.random().toString(36).slice(2, 8)}`;
    queueMicrotask(() => {
      if (overlayRef === this.activeRef) {
        const panel = overlayRef.overlayElement;
        const tooltipEl = panel.querySelector('[role="tooltip"]') as HTMLElement | null;
        if (tooltipEl) {
          tooltipEl.id = tooltipId;
          this.hostEl.nativeElement.setAttribute('aria-describedby', tooltipId);
        }
      }
    });

    this.activeRef = overlayRef;
  }

  private buildPositions(pos: TooltipPos): ConnectedPosition[] {
    switch (pos) {
      case 'top':
        return [
          { originX: 'center', originY: V.top, overlayX: 'center', overlayY: V.bottom },
          { originX: 'center', originY: V.bottom, overlayX: 'center', overlayY: V.top },
        ];
      case 'bottom':
        return [
          { originX: 'center', originY: V.bottom, overlayX: 'center', overlayY: V.top },
          { originX: 'center', originY: V.top, overlayX: 'center', overlayY: V.bottom },
        ];
      case 'left':
        return [
          { originX: H.left, originY: 'center', overlayX: 'end', overlayY: 'center' },
          { originX: H.right, originY: 'center', overlayX: 'start', overlayY: 'center' },
        ];
      case 'right':
        return [
          { originX: H.right, originY: 'center', overlayX: 'start', overlayY: 'center' },
          { originX: H.left, originY: 'center', overlayX: 'end', overlayY: 'center' },
        ];
    }
  }

  private hide(): void {
    if (this.hostEl.nativeElement.hasAttribute('aria-describedby')) {
      this.hostEl.nativeElement.removeAttribute('aria-describedby');
    }
    if (this.activeRef) {
      this.activeRef.dispose();
      this.activeRef = null;
    }
  }
}
