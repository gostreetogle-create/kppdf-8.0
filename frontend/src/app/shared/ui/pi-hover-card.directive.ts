import {
  Directive,
  ElementRef,
  HostListener,
  TemplateRef,
  ViewContainerRef,
  inject,
  input,
} from '@angular/core';
import {
  Overlay,
  OverlayRef,
  ConnectedPosition,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { HoverCardComponent } from './pi-hover-card.component';

export type HoverCardPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Paper & Ink HoverCard directive — hover or keyboard focus preview.
 * Trigger open on hover (after delay) or focus (immediate for a11y).
 */
@Directive({
  selector: '[piHoverCard]',
  standalone: true,
})
export class HoverCardDirective {
  readonly piHoverCard = input.required<TemplateRef<unknown>>();
  readonly position = input<HoverCardPosition>('top');
  readonly openDelay = input<number>(250);
  readonly closeDelay = input<number>(200);
  readonly ariaLabel = input<string>('');

  private readonly overlay = inject(Overlay);
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly viewContainerRef = inject(ViewContainerRef);

  private activeRef: OverlayRef | null = null;
  private openTimer: ReturnType<typeof setTimeout> | null = null;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  @HostListener('mouseenter') onEnter(): void {
    if (this.openTimer) clearTimeout(this.openTimer);
    this.openTimer = setTimeout(() => this.show(), this.openDelay());
  }
  @HostListener('mouseleave') onLeave(): void {
    if (this.openTimer) clearTimeout(this.openTimer);
    if (this.closeTimer) clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => this.hide(), this.closeDelay());
  }
  @HostListener('focusin') onFocus(): void { this.show(); }
  @HostListener('focusout') onBlur(): void { this.hide(); }

  private show(): void {
    if (this.activeRef) return;
    const positions: ConnectedPosition[] =
      this.position() === 'top'
        ? [{ originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom' }]
        : this.position() === 'bottom'
        ? [{ originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' }]
        : this.position() === 'left'
        ? [{ originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center' }]
        : [{ originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center' }];

    const overlayRef = this.overlay.create({
      hasBackdrop: false,
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.hostEl)
        .withPositions(positions)
        .withPush(true),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      panelClass: 'pi-hover-card-panel',
    });

    const portal = new TemplatePortal(this.piHoverCard(), this.viewContainerRef, {});
    overlayRef.attach(portal);

    this.activeRef = overlayRef;
  }

  private hide(): void {
    if (this.activeRef) {
      this.activeRef.dispose();
      this.activeRef = null;
    }
  }
}
