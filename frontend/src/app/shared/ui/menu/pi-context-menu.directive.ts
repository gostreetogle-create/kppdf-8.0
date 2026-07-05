import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ContextMenuComponent } from './pi-context-menu.component';

/**
 * Paper & Ink ContextMenu directive — right-click or Shift+F10 opens
 * a Popover-styled menu at cursor coords via global PositionStrategy.
 * NO backdrop, NO focus trap (per spec for dropdown-style overlay).
 */
@Directive({
  selector: '[piContextMenu]',
  standalone: true,
})
export class ContextMenuDirective {
  readonly piContextMenu = input.required<ContextMenuComponent>();
  readonly disabled = input<boolean>(false);

  private readonly overlay = inject(Overlay);
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  readonly isOpen = signal(false);
  private activeRef: OverlayRef | null = null;
  private outsideListener: ((e: MouseEvent) => void) | null = null;

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
    this.openAt(event.clientX, event.clientY);
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    if (event.key === 'F10' && event.shiftKey) {
      event.preventDefault();
      const rect = this.hostEl.nativeElement.getBoundingClientRect();
      this.openAt(rect.left + rect.width / 2, rect.bottom);
    }
  }

  private openAt(x: number, y: number): void {
    if (this.activeRef) this.close();
    const overlayRef = this.overlay.create({
      hasBackdrop: false,
      positionStrategy: this.overlay
        .position()
        .global()
        .left(`${x}px`)
        .top(`${y}px`),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      panelClass: 'pi-context-menu-panel',
    });

    const portal = new ComponentPortal(ContextMenuComponent);
    overlayRef.attach(portal);

    this.outsideListener = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (!this.hostEl.nativeElement.contains(target) &&
          !overlayRef.overlayElement.contains(target)) {
        this.close();
      }
    };
    document.addEventListener('pointerdown', this.outsideListener, true);

    overlayRef.keydownEvents().subscribe((e) => {
      if (e.key === 'Escape') this.close();
    });

    this.activeRef = overlayRef;
    this.isOpen.set(true);
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
  }
}
