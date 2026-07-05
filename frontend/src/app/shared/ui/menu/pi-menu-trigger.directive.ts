import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  Overlay,
  OverlayRef,
  ConnectedPosition,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DropdownMenuComponent, DropdownMenuPosition } from './pi-dropdown-menu.component';

export type DropdownMenuRole = 'menuitem' | 'button';

/**
 * Paper & Ink DropdownMenu trigger directive — click opens menu.
 * ESC + outside-click close. Arrow nav: WAI-APG menu pattern.
 */
@Directive({
  selector: '[piDropdownTrigger]',
  standalone: true,
})
export class MenuTriggerDirective {
  readonly piDropdownTrigger = input.required<DropdownMenuComponent>();
  readonly position = input<DropdownMenuPosition>('bottom-start');

  private readonly overlay = inject(Overlay);
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  readonly isOpen = signal(false);
  private activeRef: OverlayRef | null = null;
  private outsideListener: ((e: MouseEvent) => void) | null = null;

  @HostListener('click') onClick(): void { this.toggle(); }
  @HostListener('keydown.enter', ['$event']) onEnter(e: KeyboardEvent): void {
    e.preventDefault();
    this.open();
  }
  @HostListener('keydown.space', ['$event']) onSpace(e: KeyboardEvent): void {
    e.preventDefault();
    this.open();
  }
  @HostListener('keydown.arrowdown', ['$event']) onArrow(e: KeyboardEvent): void {
    e.preventDefault();
    this.open();
    queueMicrotask(() => this.focusFirstItem());
  }

  toggle(): void { this.isOpen() ? this.close() : this.open(); }

  open(): void {
    if (this.activeRef) return;
    const positions: ConnectedPosition[] =
      this.position() === 'bottom-start'
        ? [{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }]
        : this.position() === 'bottom-end'
        ? [{ originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' }]
        : this.position() === 'top-start'
        ? [{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' }]
        : [{ originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' }];

    const overlayRef = this.overlay.create({
      hasBackdrop: false,
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.hostEl)
        .withPositions(positions)
        .withPush(true),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      panelClass: 'pi-dropdown-menu-panel',
    });

    const portal = new ComponentPortal(DropdownMenuComponent);
    overlayRef.attach(portal);

    overlayRef.keydownEvents().subscribe((e) => {
      if (e.key === 'Escape') {
        this.close();
        this.hostEl.nativeElement.focus();
      }
    });

    this.outsideListener = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (!this.hostEl.nativeElement.contains(target) &&
          !overlayRef.overlayElement.contains(target)) {
        this.close();
      }
    };
    document.addEventListener('pointerdown', this.outsideListener, true);

    this.activeRef = overlayRef;
    this.isOpen.set(true);
    this.hostEl.nativeElement.setAttribute('aria-expanded', 'true');
  }

  close(): void {
    if (this.outsideListener) {
      document.removeEventListener('pointerdown', this.outsideListener, true);
      this.outsideListener = null;
    }
    if (this.activeRef) {
      this.activeRef.dispose();
      this.activeRef = null;
    }
    this.isOpen.set(false);
    this.hostEl.nativeElement.setAttribute('aria-expanded', 'false');
  }

  private focusFirstItem(): void {
    if (!this.activeRef) return;
    const panel = this.activeRef.overlayElement;
    const first = panel.querySelector<HTMLButtonElement>('button[role="menuitem"]');
    first?.focus();
  }
}
