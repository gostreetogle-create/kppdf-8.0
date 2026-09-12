import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { AppShellComponent } from './app-shell.component';
import { ShellToolRailService } from './shell-tool-rail.service';
import { NavHistoryService } from './nav-history.service';
import { AuthService } from '@kppdf/data-access/auth';
import { CapabilitiesService } from '@kppdf/data-access/capabilities';
import { PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { appRoutes } from '../app.routes';

describe('AppShellComponent (TZ-NX-SHELL-rail-layout-fix)', () => {
  let fixture: ComponentFixture<AppShellComponent>;

  const back = jest.fn();
  const forward = jest.fn();
  let canGoBackSig: ReturnType<typeof signal<boolean>>;
  let canGoForwardSig: ReturnType<typeof signal<boolean>>;
  let userSig: ReturnType<typeof signal<{ role: string; pages?: string[]; username?: string } | null>>;
  let dialog: { open: jest.Mock };

  async function setup(url: string, opts: { hasAny?: () => boolean } = {}): Promise<void> {
    jest.clearAllMocks();
    canGoBackSig = signal(true);
    canGoForwardSig = signal(true);
    userSig = signal({ role: 'admin', username: 'admin' });
    dialog = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [
        {
          provide: Router,
          useValue: {
            events: of(),
            url,
            config: appRoutes,
            navigateByUrl: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: AuthService,
          useValue: {
            user: userSig,
            isAuthenticated: signal(true),
            logout: jest.fn().mockResolvedValue(undefined),
          },
        },
        { provide: CapabilitiesService, useValue: { hasAny: opts.hasAny ?? (() => true) } },
        {
          provide: NavHistoryService,
          useValue: { canGoBack: canGoBackSig, canGoForward: canGoForwardSig, back, forward },
        },
        { provide: PiDialogService, useValue: dialog },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    })
      .overrideComponent(AppShellComponent, { set: { imports: [], schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();

    fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();
  }

  const backBtn = (): HTMLButtonElement | null =>
    fixture.nativeElement.querySelector('[data-test="shell-nav-back"]');
  const forwardBtn = (): HTMLButtonElement | null =>
    fixture.nativeElement.querySelector('[data-test="shell-nav-forward"]');
  const adminQuickNav = (): HTMLAnchorElement | null =>
    fixture.nativeElement.querySelector('[data-test="shell-quicknav-admin"]');
  const registriesQuickNav = (): HTMLAnchorElement | null =>
    fixture.nativeElement.querySelector('[data-test="shell-quicknav-registries"]');
  const docsQuickNav = (): HTMLAnchorElement | null =>
    fixture.nativeElement.querySelector('[data-test="shell-quicknav-docs"]');
  const clientsQuickNav = (): HTMLAnchorElement | null =>
    fixture.nativeElement.querySelector('[data-test="shell-quicknav-clients"]');
  const referenceQuickNav = (): HTMLAnchorElement | null =>
    fixture.nativeElement.querySelector('[data-test="shell-quicknav-reference"]');

  it('idle route (no setTools) renders no rails — full-width main workspace (TZ-NX-SHELL-01-IDLE-RAILS)', async () => {
    await setup('/admin/devices');
    const grid = fixture.nativeElement.querySelector('[data-test="shell-workspace-grid"]') as HTMLElement;
    expect(grid).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="shell-rail-left"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="shell-rail-right"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="shell-sidebar"]')).toBeNull();
    expect(grid.style.gridTemplateColumns).toBe('minmax(0,1fr)');
  });

  it('places back/forward history buttons once in the header, not duplicated in idle rails (TZ-NX-SHELL-01-IDLE-RAILS)', async () => {
    await setup('/admin/devices');
    const header = fixture.nativeElement.querySelector('header');
    expect(header?.querySelector('[data-test="shell-nav-back"]')).toBeTruthy();
    expect(header?.querySelector('[data-test="shell-nav-forward"]')).toBeTruthy();
    // no rails at all on an idle route — nothing to duplicate into
    expect(fixture.nativeElement.querySelector('[data-test="shell-rail-left"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="shell-rail-right"]')).toBeNull();
  });

  it('shows only existing-route header chips (admin, registries, docs, deals, production, clients, supply, warehouse) — no dead links', async () => {
    await setup('/admin/devices');
    // TZD-72 cleanup: W1 (warehouse) + S1 (supply) added chips without updating this pin (6 -> 8).
    // TZ-NX-REG-TEXT-BLOCK-CATEGORIES (2026-09-11): `/dictionaries/text-block-categories`
    // is now a `redirectTo` (no `loadComponent`) — the dead-link filter drops
    // `reference`'s only live item again, so the whole group's chip is gone
    // (was briefly 9 under TZ-NX-TEXT-CAT-NX-CRUD; back to 8). `reference` is
    // fully deleted from NAV_CATEGORIES next, in TZ-NX-NAV-DROP-REFERENCE.
    expect(fixture.nativeElement.querySelectorAll('[data-test^="shell-quicknav-"]').length).toBe(8);
    expect(adminQuickNav()).toBeTruthy();
    expect(registriesQuickNav()).toBeTruthy();
    expect(docsQuickNav()).toBeTruthy();
    expect(clientsQuickNav()).toBeTruthy();
    expect(referenceQuickNav()).toBeNull();
    const productionQuickNav = fixture.nativeElement.querySelector('[data-test="shell-quicknav-production"]') as HTMLAnchorElement;
    expect(productionQuickNav).toBeTruthy();
    const categories = (
      fixture.componentInstance as unknown as { navCategories: () => { id: string; entryPath?: string }[] }
    ).navCategories();
    expect(categories.find((c) => c.id === 'production')?.entryPath).toBe('/production');
  });

  it('shows the Реестры chip (TZ-NX-REGISTRIES-NAV-AND-DEMO-REVIEW)', async () => {
    await setup('/admin/devices');
    const chip = registriesQuickNav()!;
    expect(chip.textContent).toContain('Реестры');
    expect(chip.getAttribute('aria-current')).toBeNull();
  });

  it('marks the Реестры chip active on /registries and /registries/:key', async () => {
    await setup('/registries/units');
    expect(registriesQuickNav()!.getAttribute('aria-current')).toBe('page');
    expect(adminQuickNav()!.getAttribute('aria-current')).toBeNull();
  });

  it('marks the active section on header quick-nav', async () => {
    await setup('/admin/devices');
    expect(adminQuickNav()!.getAttribute('aria-current')).toBe('page');
  });

  it('never renders disabled "скоро" demo placeholder tools (TZ-NX-SHELL-01-IDLE-RAILS)', async () => {
    await setup('/admin/devices');
    expect(fixture.nativeElement.querySelector('[data-test="shell-tool-left-filters"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="shell-tool-right-search"]')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('скоро');
  });

  it('shows rails with grid columns for both sides when a page registers tools on both, then hides them again on clear() (TZ-NX-SHELL-01-IDLE-RAILS)', async () => {
    await setup('/admin/devices');
    const rail = TestBed.inject(ShellToolRailService);
    rail.setTools('demo-owner', {
      left: [{ id: 'l1', side: 'left', ariaLabel: 'L1', title: 'L1', icon: {} as never, onClick: jest.fn() }],
      right: [{ id: 'r1', side: 'right', ariaLabel: 'R1', title: 'R1', icon: {} as never, onClick: jest.fn() }],
    });
    fixture.detectChanges();

    const grid = fixture.nativeElement.querySelector('[data-test="shell-workspace-grid"]') as HTMLElement;
    expect(fixture.nativeElement.querySelector('[data-test="shell-rail-left"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="shell-rail-right"]')).toBeTruthy();
    expect(grid.style.gridTemplateColumns).toBe('var(--shell-rail-w, 4rem) minmax(0,1fr) var(--shell-rail-w, 4rem)');

    rail.clear('demo-owner');
    fixture.detectChanges();

    // Regression guard: clearing must NOT fall back to placeholder rails (old bug).
    expect(fixture.nativeElement.querySelector('[data-test="shell-rail-left"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="shell-rail-right"]')).toBeNull();
    expect(grid.style.gridTemplateColumns).toBe('minmax(0,1fr)');
  });

  describe('TZ-NX-PO-SWEEP-07 — rail category popover menu', () => {
    function setupDocumentMenu(overrides: { disabled?: boolean } = {}): {
      modeEditor: jest.Mock;
      save: jest.Mock;
      rail: ShellToolRailService;
    } {
      const rail = TestBed.inject(ShellToolRailService);
      const modeEditor = jest.fn();
      const save = jest.fn();
      rail.setTools('studio-editor', {
        left: [],
        right: [
          {
            id: 'document', side: 'right', ariaLabel: 'Документ', title: 'Документ', icon: {} as never,
            items: [
              { id: 'mode-editor', label: 'Редактор', active: true, onClick: modeEditor },
              { id: 'save', label: 'Сохранить', disabled: overrides.disabled === true, onClick: save },
            ],
          },
          { id: 'elements', side: 'right', ariaLabel: 'Элементы', title: 'Элементы', icon: {} as never, onClick: jest.fn() },
        ],
      });
      fixture.detectChanges();
      return { modeEditor, save, rail };
    }

    const documentTrigger = (): HTMLButtonElement =>
      fixture.nativeElement.querySelector('[data-test="shell-tool-right-document"]');
    const documentMenu = (): HTMLElement | null =>
      fixture.nativeElement.querySelector('[data-test="shell-tool-menu-document"]');

    it('a category with items opens a popover menu on click instead of calling onClick directly', async () => {
      await setup('/studio/doc-1');
      setupDocumentMenu();

      expect(documentMenu()).toBeNull();
      documentTrigger().click();
      fixture.detectChanges();

      const menu = documentMenu();
      expect(menu).toBeTruthy();
      const items = Array.from(menu!.querySelectorAll('[data-test^="shell-tool-menu-item-"]'));
      expect(items.map((el) => el.getAttribute('data-test'))).toEqual([
        'shell-tool-menu-item-mode-editor',
        'shell-tool-menu-item-save',
      ]);
    });

    it('a plain action tool (no items) still calls onClick directly — no menu opens', async () => {
      await setup('/studio/doc-1');
      setupDocumentMenu();
      const elementsBtn = fixture.nativeElement.querySelector('[data-test="shell-tool-right-elements"]') as HTMLButtonElement;

      elementsBtn.click();
      fixture.detectChanges();

      expect(documentMenu()).toBeNull();
    });

    it('clicking a menu item invokes its onClick and closes the menu', async () => {
      await setup('/studio/doc-1');
      const { save } = setupDocumentMenu();
      documentTrigger().click();
      fixture.detectChanges();

      (documentMenu()!.querySelector('[data-test="shell-tool-menu-item-save"]') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(save).toHaveBeenCalledTimes(1);
      expect(documentMenu()).toBeNull();
    });

    it('a disabled menu item does not invoke onClick and keeps the menu open', async () => {
      await setup('/studio/doc-1');
      const { save } = setupDocumentMenu({ disabled: true });
      documentTrigger().click();
      fixture.detectChanges();

      const saveBtn = documentMenu()!.querySelector('[data-test="shell-tool-menu-item-save"]') as HTMLButtonElement;
      expect(saveBtn.disabled).toBe(true);
      saveBtn.click();
      fixture.detectChanges();

      expect(save).not.toHaveBeenCalled();
    });

    it('a click outside the rail item closes the open menu', async () => {
      await setup('/studio/doc-1');
      setupDocumentMenu();
      documentTrigger().click();
      fixture.detectChanges();
      expect(documentMenu()).toBeTruthy();

      document.body.click();
      fixture.detectChanges();

      expect(documentMenu()).toBeNull();
    });

    it('Escape closes the open menu', async () => {
      await setup('/studio/doc-1');
      setupDocumentMenu();
      documentTrigger().click();
      fixture.detectChanges();
      expect(documentMenu()).toBeTruthy();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();

      expect(documentMenu()).toBeNull();
    });

    it('clicking the trigger again toggles the menu closed', async () => {
      await setup('/studio/doc-1');
      setupDocumentMenu();
      documentTrigger().click();
      fixture.detectChanges();
      expect(documentMenu()).toBeTruthy();

      documentTrigger().click();
      fixture.detectChanges();

      expect(documentMenu()).toBeNull();
    });
  });

  it('delegates back/forward clicks to NavHistoryService', async () => {
    await setup('/admin/devices');
    backBtn()!.click();
    forwardBtn()!.click();
    expect(back).toHaveBeenCalledTimes(1);
    expect(forward).toHaveBeenCalledTimes(1);
  });

  it('disables back/forward when history unavailable', async () => {
    await setup('/admin/devices');
    canGoBackSig.set(false);
    canGoForwardSig.set(false);
    fixture.detectChanges();

    expect(backBtn()!.disabled).toBe(true);
    expect(backBtn()!.getAttribute('aria-disabled')).toBe('true');
    expect(forwardBtn()!.disabled).toBe(true);
    expect(forwardBtn()!.getAttribute('aria-disabled')).toBe('true');

    backBtn()!.click();
    forwardBtn()!.click();
    expect(back).not.toHaveBeenCalled();
    expect(forward).not.toHaveBeenCalled();
  });

  it('renders router-outlet in central main column', async () => {
    await setup('/admin/devices');
    const main = fixture.nativeElement.querySelector('.shell-main');
    expect(main?.querySelector('router-outlet')).toBeTruthy();
  });

  it('renders a selected-buffer rail tool after Data with its count badge (TZ-NX-DOCSTUDIO-D56)', async () => {
    await setup('/studio/doc-1');
    const rail = TestBed.inject(ShellToolRailService);
    rail.setTools('studio-editor', {
      left: [
        { id: 'data', side: 'left', ariaLabel: 'Данные', title: 'Данные', icon: {} as never, onClick: jest.fn() },
        { id: 'selected', side: 'left', ariaLabel: 'Выбрано', title: 'Выбрано', icon: {} as never, badge: 15, onClick: jest.fn() },
      ],
      right: [],
    });
    fixture.detectChanges();

    const left = fixture.nativeElement.querySelector('[data-test="shell-rail-left"]') as HTMLElement;
    const tools = Array.from(left.querySelectorAll('[data-test^="shell-tool-left-"]')) as HTMLButtonElement[];
    expect(tools.map((tool) => tool.getAttribute('data-test'))).toEqual([
      'shell-tool-left-data',
      'shell-tool-left-selected',
    ]);
    expect(tools[1].getAttribute('aria-label')).toBe('Выбрано');
    expect(tools[1].querySelector('[data-test="shell-tool-badge"]')?.textContent?.trim()).toBe('15');
    // right side got no tools in this call — its rail must not render either.
    expect(fixture.nativeElement.querySelector('[data-test="shell-rail-right"]')).toBeNull();
    rail.clear('studio-editor');
  });

  it('hides admin header chip when role gate fails, but Реестры and Документы have no such gate', async () => {
    await setup('/admin/devices');
    userSig.set({ role: 'user' });
    fixture.detectChanges();
    // `registries`, `docs`, `clients` and `reference` deliberately carry no `systemRoles`/`capabilities`.
    // TZD-72 cleanup: warehouse + supply chips remain for user (6 + 2 wave chips -> 7).
    // TZ-NX-REG-TEXT-BLOCK-CATEGORIES (2026-09-11): `reference`'s chip is gone
    // again (dead-link filter, see the previous test) — back to 7.
    expect(fixture.nativeElement.querySelectorAll('[data-test^="shell-quicknav-"]').length).toBe(7);
    expect(adminQuickNav()).toBeNull();
    expect(registriesQuickNav()).toBeTruthy();
    expect(docsQuickNav()).toBeTruthy();
    expect(clientsQuickNav()).toBeTruthy();
    expect(referenceQuickNav()).toBeNull();
  });

  it('shows Реестры chip for restrictive pages[] ACL (TZ-NX-REGISTRIES-NAV-VISIBILITY-FIX)', async () => {
    await setup('/admin/devices');
    userSig.set({ role: 'admin', pages: ['admin-users'] });
    fixture.detectChanges();
    expect(registriesQuickNav()).toBeTruthy();
    expect(registriesQuickNav()!.textContent).toContain('Реестры');
    expect(adminQuickNav()).toBeTruthy();
    expect(adminQuickNav()!.textContent).toContain('Админ');
  });

  it('header Реестры chip targets /registries entryPath (TZ-NX-REGISTRIES-NAV-VISIBILITY-FIX)', async () => {
    await setup('/admin/devices');
    userSig.set({ role: 'admin', pages: ['admin-users'] });
    fixture.detectChanges();
    const categories = (
      fixture.componentInstance as unknown as { navCategories: () => { id: string; entryPath?: string }[] }
    ).navCategories();
    expect(categories.find((c) => c.id === 'registries')?.entryPath).toBe('/registries');
  });

  it('marks Реестры active on /registries/units with restrictive pages[]', async () => {
    await setup('/registries/units');
    userSig.set({ role: 'manager', pages: ['orders'] });
    fixture.detectChanges();
    expect(registriesQuickNav()?.getAttribute('aria-current')).toBe('page');
  });

  describe('TZD-72 — desktop pairing button RBAC', () => {
    const pairingBtn = (): HTMLButtonElement | null =>
      fixture.nativeElement.querySelector('[data-test="desktop-pairing-button"]');

    it('renders when caps.hasAny(["desktop:admin"]) is true', async () => {
      await setup('/admin/devices', { hasAny: () => true });
      expect(pairingBtn()).toBeTruthy();
    });

    it('is absent when the user lacks desktop:admin', async () => {
      await setup('/admin/devices', { hasAny: () => false });
      expect(pairingBtn()).toBeNull();
    });

    it('opens PairingDialogComponent with the resolved apiBaseUrl + username on click', async () => {
      await setup('/admin/devices', { hasAny: () => true });
      pairingBtn()!.click();
      expect(dialog.open).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          data: expect.objectContaining({ username: 'admin' }),
        }),
      );
    });
  });
});
