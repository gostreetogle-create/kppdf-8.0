import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  HostListener,
  TemplateRef,
  ViewContainerRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { Overlay, OverlayRef, ConnectedPosition } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Paper & Ink Popover directive — click-triggered positioned overlay.
 * NO backdrop, auto-flip via flexibleConnectedTo, aria-expanded toggled.
 */
@Directive({
  selector: '[piPopover]',
  standalone: true,
})
export class PopoverDirective {
  readonly piPopover = input.required<TemplateRef<unknown>>();
  readonly position = input<PopoverPosition>('bottom');
  readonly offset = input<number>(8);
  readonly showArrow = input<boolean>(false);
  readonly ariaLabel = input<string>('');
  readonly dismissOnOutside = input<boolean>(true);

  private readonly overlay = inject(Overlay);
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly viewContainerRef = inject(ViewContainerRef);

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

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
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
      panelClass: 'pi-popover-panel',
    });

    const portal = new TemplatePortal(this.piPopover(), this.viewContainerRef, {});
    overlayRef.attach(portal);

    if (this.dismissOnOutside()) {
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
    }

    overlayRef.keydownEvents().subscribe((e) => {
      if (e.key === 'Escape') this.close();
    });

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
}

@Component({
  selector: 'app-pi-popover',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="dialog"
      [attr.aria-label]="ariaLabel()"
      class="bg-paper hairline rounded-sm px-4 py-3 max-w-[360px] text-sm"
    >
      <ng-content />
    </div>
  `,
})
export class PopoverComponent {
  readonly ariaLabel = input<string>('');
}
