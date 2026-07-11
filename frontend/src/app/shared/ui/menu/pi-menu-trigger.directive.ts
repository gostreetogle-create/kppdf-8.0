import {
  Directive,
  ElementRef,
  HostListener,
  TemplateRef,
  ViewContainerRef,
  contentChild,
  inject,
  signal,
} from '@angular/core';
import {
  Overlay,
  OverlayRef,
  ConnectedPosition,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

/**
 * Paper & Ink DropdownMenu trigger directive — click opens parent-projected
 * menu content inside a CDK overlay.
 *
 * Pattern (TZ-CategoriesNav):
 *   <button piDropdownTrigger>trigger text</button>
 *   <ng-template #piDropdownContent>
 *     <app-pi-dropdown-menu>
 *       <a role="menuitem" ...>link</a>
 *     </app-pi-dropdown-menu>
 *   </ng-template>
 *
 * Bumps the original directive (which attached a fresh DropdownMenuComponent
 * and never rendered projected content) to a TemplatePortal pattern that
 * actually shows whatever the parent template provides.
 *
 * Keyboard: Click / Enter / Space / ArrowDown open; Escape closes + returns
 * focus to the trigger. Outside-pointer close (capture phase, ignores clicks
 * inside the trigger host or the overlay panel).
 */
@Directive({
  selector: '[piDropdownTrigger]',
  standalone: true,
})
export class MenuTriggerDirective {
  /**
   * Required `<ng-template piDropdownContent>` project INSIDE the trigger
   * host element. The directive is applied on the host, and Angular's
   * contentChild() pulls the projected template from the host's content.
   *
   * (One prior retry went off-piste: switched to `input<TemplateRef|null>`
   * bound from consumer via `[menuTemplate]="menuTpl()"`. That approach
   * failed at runtime because Angular's `viewChild<TemplateRef>('name')`
   * signal API doesn't resolve string template-ref variables the way the
   * old `@ViewChild('name')` decorator did — it kept returning undefined,
   * so the directive's `open()` always early-exited on `if (!tpl) return;`.
   * Reverting to the canonical contentChild pattern + restructuring the
   * consumer template to nest the <ng-template> INSIDE the trigger
   * <button> restores correctness without losing any UX.)
   */
  private readonly menuTpl = contentChild<TemplateRef<unknown>>('piDropdownContent');

  private readonly overlay = inject(Overlay);
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly viewContainer = inject(ViewContainerRef);

  readonly isOpen = signal(false);
  private activeRef: OverlayRef | null = null;
  private outsideListener: ((e: MouseEvent) => void) | null = null;

  @HostListener('click') onClick(): void {
    this.toggle();
  }
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

  toggle(): void {
    this.isOpen() ? this.close() : this.open();
  }

  open(): void {
    if (this.activeRef) return;
    const tpl = this.menuTpl();
    if (!tpl) {
      // No projected content — nothing to show. Defensive: do not open.
      return;
    }

    const positions: ConnectedPosition[] = [
      { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
    ];

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

    const portal = new TemplatePortal(tpl, this.viewContainer);
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
      if (
        !this.hostEl.nativeElement.contains(target) &&
        !overlayRef.overlayElement.contains(target)
      ) {
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
    // Skip disabled items (aria-disabled="true"); a disabled <span> is
    // not natively tabbable so .focus() is a no-op but screen readers
    // and keyboard navigation get inconsistent behaviour.
    const first = panel.querySelector<HTMLElement>(
      '[role="menuitem"]:not([aria-disabled="true"])',
    );
    first?.focus();
  }
}
