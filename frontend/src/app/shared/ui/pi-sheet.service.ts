import { Injectable, Injector, inject, signal, computed } from '@angular/core';
import { Overlay, OverlayRef, GlobalPositionStrategy } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ConfigurableFocusTrapFactory } from '@angular/cdk/a11y';
import { filter } from 'rxjs/operators';
import { SheetComponent, SheetAnchor, SheetSize } from './pi-sheet.component';
import { PI_SHEET_REF, SheetRef } from './pi-sheet.tokens';

export interface SheetConfig {
  anchor?: SheetAnchor;
  size?: SheetSize;
  dismissOnBackdropClick?: boolean;
  dismissOnEscape?: boolean;
}

const SIZE_PX: Record<SheetSize, { w: number; h: number }> = {
  sm: { w: 320, h: 320 },
  md: { w: 480, h: 480 },
  lg: { w: 640, h: 640 },
};

@Injectable({ providedIn: 'root' })
export class PiSheetService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly focusTrapFactory = inject(ConfigurableFocusTrapFactory);

  private activeRef: OverlayRef | null = null;
  private activeFocusTrap: ReturnType<ConfigurableFocusTrapFactory['create']> | null = null;

  open(config: SheetConfig = {}): SheetRef {
    const anchor = config.anchor ?? 'right';
    const sizeKey = config.size ?? 'md';
    const dims = SIZE_PX[sizeKey];
    const isHorizontal = anchor === 'right' || anchor === 'left';

    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'pi-overlay-backdrop',
      panelClass: 'pi-sheet-panel',
      positionStrategy: this.buildPositionStrategy(anchor),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      width: isHorizontal ? dims.w : undefined,
      height: !isHorizontal ? dims.h : undefined,
    });

    const closedSig = signal(false);

    const ref: SheetRef = {
      closed: computed(() => closedSig()),
      close: () => {
        if (closedSig()) return;
        closedSig.set(true);
        this.cleanup();
      },
    };

    const childInjector = Injector.create({
      providers: [{ provide: PI_SHEET_REF, useValue: ref }],
      parent: this.injector,
    });

    const portal = new ComponentPortal(SheetComponent, null, childInjector);
    overlayRef.attach(portal);
    overlayRef.overlayElement.setAttribute('data-anchor', anchor);
    overlayRef.overlayElement.setAttribute('data-size', sizeKey);

    const panelEl = overlayRef.overlayElement.querySelector(
      '.cdk-overlay-pane',
    ) as HTMLElement | null;
    if (panelEl) {
      this.activeFocusTrap = this.focusTrapFactory.create(panelEl);
      this.activeFocusTrap.focusInitialElementWhenReady().catch(() => {});
    }

    overlayRef.keydownEvents().pipe(filter((e) => e.key === 'Escape')).subscribe(() => {
      if (config.dismissOnEscape !== false) ref.close();
    });
    overlayRef.backdropClick().subscribe(() => {
      if (config.dismissOnBackdropClick !== false) ref.close();
    });

    this.activeRef = overlayRef;
    return ref;
  }

  private buildPositionStrategy(anchor: SheetAnchor): GlobalPositionStrategy {
    const strategy = this.overlay.position().global();
    switch (anchor) {
      case 'right':
        return strategy.right('0').centerVertically();
      case 'left':
        return strategy.left('0').centerVertically();
      case 'top':
        return strategy.top('0').centerHorizontally();
      case 'bottom':
        return strategy.bottom('0').centerHorizontally();
    }
  }

  private cleanup(): void {
    if (this.activeFocusTrap) {
      try { this.activeFocusTrap.destroy(); } catch { /* ignore */ }
      this.activeFocusTrap = null;
    }
    if (this.activeRef) {
      this.activeRef.dispose();
      this.activeRef = null;
    }
  }
}
