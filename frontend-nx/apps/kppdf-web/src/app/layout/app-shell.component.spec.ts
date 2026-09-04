import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { AppShellComponent } from './app-shell.component';
import { NavHistoryService } from './nav-history.service';
import { AuthService } from '@kppdf/data-access/auth';
import { CapabilitiesService } from '@kppdf/data-access/capabilities';
import { appRoutes } from '../app.routes';

describe('AppShellComponent (TZ-NX-SHELL-rail-layout-fix)', () => {
  let fixture: ComponentFixture<AppShellComponent>;

  const back = jest.fn();
  const forward = jest.fn();
  let canGoBackSig: ReturnType<typeof signal<boolean>>;
  let canGoForwardSig: ReturnType<typeof signal<boolean>>;
  let userSig: ReturnType<typeof signal<{ role: string; pages?: string[] } | null>>;

  async function setup(url: string): Promise<void> {
    jest.clearAllMocks();
    canGoBackSig = signal(true);
    canGoForwardSig = signal(true);
    userSig = signal({ role: 'admin' });

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
        { provide: CapabilitiesService, useValue: { hasAny: () => true } },
        {
          provide: NavHistoryService,
          useValue: { canGoBack: canGoBackSig, canGoForward: canGoForwardSig, back, forward },
        },
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

  it('uses grid workspace with left rail, main, right rail — no sidebar', async () => {
    await setup('/admin/devices');
    expect(fixture.nativeElement.querySelector('[data-test="shell-workspace-grid"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="shell-rail-left"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="shell-rail-right"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="shell-sidebar"]')).toBeNull();
  });

  it('places back only on left rail and forward only on right rail', async () => {
    await setup('/admin/devices');
    const left = fixture.nativeElement.querySelector('[data-test="shell-rail-left"]');
    const right = fixture.nativeElement.querySelector('[data-test="shell-rail-right"]');
    const header = fixture.nativeElement.querySelector('header');

    expect(left?.querySelector('[data-test="shell-nav-back"]')).toBeTruthy();
    expect(left?.querySelector('[data-test="shell-nav-forward"]')).toBeNull();
    expect(right?.querySelector('[data-test="shell-nav-forward"]')).toBeTruthy();
    expect(right?.querySelector('[data-test="shell-nav-back"]')).toBeNull();
    expect(header?.querySelector('[data-test="shell-nav-back"]')).toBeNull();
    expect(header?.querySelector('[data-test="shell-nav-forward"]')).toBeNull();
  });

  it('shows only existing-route header chips (admin, registries, docs, deals, production) — no dead links', async () => {
    await setup('/admin/devices');
    expect(fixture.nativeElement.querySelectorAll('[data-test^="shell-quicknav-"]').length).toBe(5);
    expect(adminQuickNav()).toBeTruthy();
    expect(registriesQuickNav()).toBeTruthy();
    expect(docsQuickNav()).toBeTruthy();
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

  it('renders demo tool buttons as disabled placeholders on rails', async () => {
    await setup('/admin/devices');
    const leftTool = fixture.nativeElement.querySelector('[data-test="shell-tool-left-filters"]') as HTMLButtonElement;
    const rightTool = fixture.nativeElement.querySelector('[data-test="shell-tool-right-search"]') as HTMLButtonElement;
    expect(leftTool).toBeTruthy();
    expect(rightTool).toBeTruthy();
    expect(leftTool.disabled).toBe(true);
    expect(rightTool.disabled).toBe(true);
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

  it('hides admin header chip when role gate fails, but Реестры and Документы have no such gate', async () => {
    await setup('/admin/devices');
    userSig.set({ role: 'user' });
    fixture.detectChanges();
    // `registries` and `docs` deliberately carry no `systemRoles`/`capabilities`.
    expect(fixture.nativeElement.querySelectorAll('[data-test^="shell-quicknav-"]').length).toBe(4);
    expect(adminQuickNav()).toBeNull();
    expect(registriesQuickNav()).toBeTruthy();
    expect(docsQuickNav()).toBeTruthy();
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
});
