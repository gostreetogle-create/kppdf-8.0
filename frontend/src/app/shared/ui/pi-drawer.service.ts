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
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      height: '85vh',
    });

    const closedSig = signal(false);
    const ref: DrawerRef = {
      closed: computed(() => closedSig()),
      close: () => {
        if (closedSig()) return;
        closedSig.set(true);
        this.cleanup();
      },
    };

    const childInjector = Injector.create({ providers: [], parent: this.injector });
    const portal = new ComponentPortal(DrawerComponent, null, childInjector);
    overlayRef.attach(portal);

    const panelEl = overlayRef.overlayElement.querySelector(
      '.cdk-overlay-pane',
    ) as HTMLElement | null;
    if (panelEl) {
      this.activeFocusTrap = this.focusTrapFactory.create(panelEl);
      this.activeFocusTrap.focusInitialElementWhenReady().catch(() => {});
    }

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
