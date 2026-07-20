import { DestroyRef, Injectable, Injector, Signal, Type, computed, inject, signal } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ConfigurableFocusTrapFactory } from '@angular/cdk/a11y';
import { filter } from 'rxjs/operators';
import { PI_DIALOG_CONFIG, PI_DIALOG_DATA, PI_DIALOG_REF } from './dialog.tokens';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- TResult is used in open() signature
export interface DialogConfig<TResult = unknown, TData = unknown> {
  width?: 'sm' | 'md' | 'lg' | string;
  height?: string;
  modal?: boolean;
  dismissOnBackdropClick?: boolean;
  dismissOnEscape?: boolean;
  data?: TData;
  ariaLabel?: string;
  /** Additional CSS class(es) added to the CDK overlay panel element. */
  panelClass?: string;
  /** TZ-103.2: caller's DestroyRef; service auto-closes dialog when caller is destroyed. */
  parentDestroyRef?: DestroyRef;
}

export interface DialogRef<T = unknown> {
  readonly closed: Signal<T | undefined>;
  close: (v?: T) => void;
}

/**
 * Paper & Ink Dialog service (TZ-103 refactored).
 *
 * TZ-103.1 — Replaced singleton `activeRef`/`activeFocusTrap` with closure-local
 * refs held by individual `DialogRef` instances. Each dialog owns its own overlay
 * and focus trap. No cross-dialog interference.
 *
 * TZ-103.2 — Added `parentDestroyRef?: DestroyRef` in `DialogConfig`. When the
 * caller is destroyed (e.g. tab-switch), the service programmatically closes the
 * dialog. Tracked via `onDestroy` callback attached to the caller's DestroyRef.
 *
 * TZ-103.3 — Added `requestAnimationFrame` after `attach()` to force CDK's
 * `updatePosition()` to recompute coordinates once layout settles. Fixes the
 * first-mount positioning race where the dialog renders at top-left because
 * the overlay pane had zero dimensions during initial positioning.
 */
@Injectable({ providedIn: 'root' })
export class PiDialogService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly focusTrapFactory = inject(ConfigurableFocusTrapFactory);

  open<TResult = unknown, TData = unknown>(
    component: Type<unknown>,
    config: DialogConfig<TResult, TData> = {},
  ): DialogRef<TResult> {
    // Every dialog gets its OWN overlay ref — no singleton overwrites.
    const overlayRef = this.overlay.create({
      hasBackdrop: config.modal !== false,
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

    // TZ-103.1: Create a FOCUS TRAP LOCAL to this dialog
    let localFocusTrap: ReturnType<ConfigurableFocusTrapFactory['create']> | null = null;

    const ref: DialogRef<TResult> = {
      closed: computed(() => (isClosed() ? closedSig() : undefined)),
      close: (v?: TResult) => {
        if (isClosed()) return;
        closedSig.set(v);
        isClosed.set(true);
        // TZ-103.1: Destroy THIS dialog's focus trap + overlay, not singleton
        if (localFocusTrap) {
          try { localFocusTrap.destroy(); } catch { /* ignore */ }
          localFocusTrap = null;
        }
        overlayRef.dispose();
      },
    };

    // TZ-103.2: Auto-close when caller is destroyed (tab-switch fix)
    if (config.parentDestroyRef) {
      config.parentDestroyRef.onDestroy(() => {
        ref.close();
      });
    }

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

    const panelEl = overlayRef.overlayElement as HTMLElement;

    panelEl.classList.add('pi-dialog-host-open');
    localFocusTrap = this.focusTrapFactory.create(panelEl);
    localFocusTrap.focusInitialElementWhenReady().catch(() => {});

    // TZ-103.3: RAF repositioning — fixes first-mount positioning race
    // where the dialog renders at top-left because CDK computed coordinates
    // against zero-width/zero-height pane. After RAF, layout has settled
    // and updatePosition() can correctly center the dialog.
    queueMicrotask(() => {
      requestAnimationFrame(() => {
        overlayRef.updatePosition();
      });
    });

    overlayRef
      .keydownEvents()
      .pipe(filter((e) => e.key === 'Escape'))
      .subscribe(() => {
        if (config.dismissOnEscape !== false) ref.close();
      });

    overlayRef.backdropClick().subscribe(() => {
      if (config.dismissOnBackdropClick !== false) ref.close();
    });

    return ref;
  }
}
