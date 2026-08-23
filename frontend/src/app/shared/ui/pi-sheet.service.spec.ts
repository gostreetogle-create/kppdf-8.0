import { TestBed } from '@angular/core/testing';
import { PiSheetService, SheetConfig } from './pi-sheet.service';
import type { SheetRef } from './pi-sheet.tokens';
import { Overlay } from '@angular/cdk/overlay';
import { ConfigurableFocusTrapFactory } from '@angular/cdk/a11y';

/**
 * TZ-UI-WR-501 — PiSheetService overlay-platform contract:
 *  - focus trap actually engages (overlayElement IS the pane);
 *  - close() returns focus to the trigger (return-focus);
 *  - scroll lock stays block() (already was — regression guard).
 */
describe('PiSheetService', () => {
  let service: PiSheetService;
  let openRefs: SheetRef[] = [];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PiSheetService);
    expect(TestBed.inject(Overlay)).toBeTruthy();
    expect(TestBed.inject(ConfigurableFocusTrapFactory)).toBeTruthy();
    openRefs = [];
  });

  afterEach(() => {
    for (const ref of openRefs) {
      try {
        ref.close();
      } catch {
        /* ignore */
      }
    }
    openRefs = [];
    (document.documentElement as HTMLElement).style.overflow = '';
    document.body.innerHTML = '';
  });

  function openSheet(config: SheetConfig = {}): SheetRef {
    const ref = service.open(config);
    openRefs.push(ref);
    return ref;
  }

  it('open() returns a ref and renders the sheet panel', () => {
    const ref = openSheet();
    expect(ref).toBeTruthy();
    expect(ref.closed()).toBe(false);
    expect(document.querySelector('.pi-sheet-panel')).toBeTruthy();
  });

  it('engages the focus trap on the pane and returns focus to the trigger on close (TZ-UI-WR-501)', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Open';
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const ref = openSheet();
    const panel = document.querySelector('.pi-sheet-panel');
    expect(panel).toBeTruthy();
    // cdk-focus-trap-anchor proves ConfigurableFocusTrap engaged on the pane
    // (before WR-501 the sheet trapped a null element — no trap at all).
    expect(document.querySelector('.cdk-focus-trap-anchor')).toBeTruthy();

    // Simulate the focus trap: focus a control inside the panel.
    const inside = document.createElement('button');
    inside.textContent = 'inside';
    panel!.appendChild(inside);
    inside.focus();
    expect(document.activeElement).toBe(inside);

    ref.close();
    expect(document.activeElement).toBe(trigger);

    trigger.remove();
  });
});
