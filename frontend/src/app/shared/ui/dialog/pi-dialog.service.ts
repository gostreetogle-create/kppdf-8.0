import { Injectable, Injector, Signal, computed, inject, signal } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ConfigurableFocusTrapFactory } from '@angular/cdk/a11y';
import { filter } from 'rxjs/operators';
import { PiDialogComponent } from './pi-dialog.component';
import { PI_DIALOG_CONFIG, PI_DIALOG_DATA, PI_DIALOG_REF } from './dialog.tokens';

export interface DialogConfig<TResult = unknown, TData = unknown> {
  width?: 'sm' | 'md' | 'lg' | string;
  height?: string;
  dismissOnBackdropClick?: boolean;
  dismissOnEscape?: boolean;
  data?: TData;
  ariaLabel?: string;
}

export interface DialogRef<T = unknown> {
  readonly closed: Signal<T | undefined>;
  close: (v?: T) => void;
}

/**
 * Paper & Ink Dialog service.
 *
 * Opens Angular CDK Overlay with backdrop, position strategy 'global center',
 * focus trap from @angular/cdk/a11y, ESC handler, backdrop-click dismiss.
 * NO Material, NO shadows, NO rounded-md/3xl.
 */
@Injectable({ providedIn: 'root' })
export class PiDialogService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly focusTrapFactory = inject(ConfigurableFocusTrapFactory);

  private activeRef: OverlayRef | null = null;
  private activeFocusTrap: ReturnType<ConfigurableFocusTrapFactory['create']> | null = null;

  open<TResult = unknown, TData = unknown>(
    component: typeof PiDialogComponent,
    config: DialogConfig<TResult, TData> = {},
  ): DialogRef<TResult> {
    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'pi-overlay-backdrop',
      panelClass: 'pi-overlay-panel',
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    const closedSig = signal<TResult | undefined>(undefined);
    const isClosed = signal(false);

    const ref: DialogRef<TResult> = {
      closed: computed(() => (isClosed() ? closedSig() : undefined)),
      close: (v?: TResult) => {
        if (isClosed()) return;
        closedSig.set(v);
        isClosed.set(true);
        this.cleanup();
      },
    };

    // Child injector carries per-dialog tokens (PI_DIALOG_DATA/REF/CONFIG).
    const childInjector = Injector.create({
      providers: [
        { provide: PI_DIALOG_DATA, useValue: config.data },
        { provide: PI_DIALOG_REF, useValue: ref },
        { provide: PI_DIALOG_CONFIG, useValue: config },
      ],
      parent: this.injector,
    });

    const portal = new ComponentPortal(component, null, childInjector);
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
