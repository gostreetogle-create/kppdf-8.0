import { TestBed } from '@angular/core/testing';
import { PiDrawerService, DrawerRef } from './pi-drawer.service';
import { Overlay } from '@angular/cdk/overlay';
import { ConfigurableFocusTrapFactory } from '@angular/cdk/a11y';

/**
 * TZ-UI-WR-501 — PiDrawerService overlay-platform contract:
 *  - scroll lock = block() like Dialog/Sheet (was reposition());
 *  - focus trap actually engages (overlayElement IS the pane; the old
 *    querySelector('.cdk-overlay-pane') from inside the pane was a no-op);
 *  - close() returns focus to the trigger (return-focus).
 */
describe('PiDrawerService', () => {
  let service: PiDrawerService;
  let openRefs: DrawerRef[] = [];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PiDrawerService);
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

  function openDrawer(): DrawerRef {
    const ref = service.open();
    openRefs.push(ref);
    return ref;
  }

  it('open() returns a ref and renders the drawer panel', () => {
    const ref = openDrawer();
    expect(ref).toBeTruthy();
    expect(ref.closed()).toBe(false);
    expect(document.querySelector('.pi-drawer-panel')).toBeTruthy();
  });

  it('uses scrollStrategies.block() — scroll lock like Dialog/Sheet, not reposition() (TZ-UI-WR-501)', () => {
    const overlay = TestBed.inject(Overlay);
    const createSpy = jest.spyOn(overlay, 'create');
    openDrawer();
    expect(createSpy).toHaveBeenCalled();
    const config = createSpy.mock.calls[0][0] as {
      scrollStrategy?: { constructor: { name: string } };
    };
    expect(config.scrollStrategy?.constructor.name).toBe('BlockScrollStrategy');
  });

  it('engages the focus trap on the pane and returns focus to the trigger on close (TZ-UI-WR-501)', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Open';
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const ref = openDrawer();
    const panel = document.querySelector('.pi-drawer-panel');
    expect(panel).toBeTruthy();
    // cdk-focus-trap-anchor proves ConfigurableFocusTrap engaged on the pane
    // (before WR-501 the drawer trapped a null element — no trap at all).
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
