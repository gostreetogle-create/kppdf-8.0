import { Injectable, Injector, inject, signal, computed } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ConfigurableFocusTrapFactory } from '@angular/cdk/a11y';
import { filter } from 'rxjs/operators';
import { DrawerComponent } from './pi-drawer.component';

export interface DrawerConfig {
  dismissOnBackdropClick?: boolean;
  dismissOnEscape?: boolean;
}

export interface DrawerRef {
  readonly closed: import('@angular/core').Signal<boolean>;
  close: () => void;
}

@Injectable({ providedIn: 'root' })
export class PiDrawerService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly focusTrapFactory = inject(ConfigurableFocusTrapFactory);

  private activeRef: OverlayRef | null = null;
  private activeFocusTrap: ReturnType<ConfigurableFocusTrapFactory['create']> | null = null;

  open(config: DrawerConfig = {}): DrawerRef {
    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'pi-overlay-backdrop',
      panelClass: 'pi-drawer-panel',
      positionStrategy: this.overlay.position().global().bottom('0').centerHorizontally(),
      // TZ-UI-WR-501: block page scroll like Dialog/Sheet (was reposition()).
      scrollStrategy: this.overlay.scrollStrategies.block(),
      height: '85vh',
    });

    // TZ-UI-WR-501: return-focus — remember the trigger before the drawer
    // takes focus, restore it in close().
    const previousActiveElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const closedSig = signal(false);
    const ref: DrawerRef = {
      closed: computed(() => closedSig()),
      close: () => {
        if (closedSig()) return;
        closedSig.set(true);
        this.cleanup();
        restoreFocus(previousActiveElement);
      },
    };

    const childInjector = Injector.create({ providers: [], parent: this.injector });
    const portal = new ComponentPortal(DrawerComponent, null, childInjector);
    overlayRef.attach(portal);

    // TZ-UI-WR-501: overlayElement IS the `.cdk-overlay-pane`; the old
    // querySelector('.cdk-overlay-pane') from inside the pane always returned
    // null, so the drawer never had a focus trap. Trap the pane itself, the
    // same way PiDialogService does.
    const panelEl = overlayRef.overlayElement as HTMLElement;
    this.activeFocusTrap = this.focusTrapFactory.create(panelEl);
    this.activeFocusTrap.focusInitialElementWhenReady().catch(() => {});

    overlayRef
      .keydownEvents()
      .pipe(filter((e) => e.key === 'Escape'))
      .subscribe(() => {
        if (config.dismissOnEscape !== false) ref.close();
      });
    overlayRef.backdropClick().subscribe(() => {
      if (config.dismissOnBackdropClick !== false) ref.close();
    });

    this.activeRef = overlayRef;
    return ref;
  }

  private cleanup(): void {
    if (this.activeFocusTrap) {
      try {
        this.activeFocusTrap.destroy();
      } catch {
        /* ignore */
      }
      this.activeFocusTrap = null;
    }
    if (this.activeRef) {
      this.activeRef.dispose();
      this.activeRef = null;
    }
  }
}

/**
 * TZ-UI-WR-501: focus the element that had focus before the overlay opened.
 * No-op when the element was removed from the DOM or already has focus.
 */
function restoreFocus(el: HTMLElement | null): void {
  if (!el || !el.isConnected) return;
  if (document.activeElement === el) return;
  try {
    el.focus({ preventScroll: true });
  } catch {
    /* ignore — element may not be focusable */
  }
}
