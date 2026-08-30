import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterLink, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { signal } from '@angular/core';
import { AppShellComponent } from './app-shell.component';
import { AuthService } from '@kppdf/data-access/auth';
import { CapabilitiesService } from '@kppdf/data-access/capabilities';
import { NavHistoryService } from './nav-history.service';

@Component({ standalone: true, template: 'devices stub' })
class DevicesStubPage {}

@Component({ standalone: true, template: 'registries stub' })
class RegistriesStubPage {}

const TEST_ROUTES = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: 'admin/devices', loadComponent: () => Promise.resolve(DevicesStubPage) },
      { path: 'registries', loadComponent: () => Promise.resolve(RegistriesStubPage) },
    ],
  },
];

/**
 * Header chip navigation — needs a real Router + RouterLink (stripped in the
 * main AppShellComponent spec for isolation).
 */
describe('AppShellComponent registries header navigation (TZ-NX-REGISTRIES-NAV-VISIBILITY-FIX)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellComponent, RouterLink],
      providers: [
        provideRouter(TEST_ROUTES),
        {
          provide: AuthService,
          useValue: {
            user: signal({ role: 'manager', pages: ['orders'] }),
            isAuthenticated: signal(true),
            logout: jest.fn(),
          },
        },
        { provide: CapabilitiesService, useValue: { hasAny: () => true } },
        {
          provide: NavHistoryService,
          useValue: {
            canGoBack: signal(false),
            canGoForward: signal(false),
            back: jest.fn(),
            forward: jest.fn(),
          },
        },
      ],
    }).compileComponents();
  });

  it('clicking the Реестры header chip navigates to /registries', async () => {
    const harness = await RouterTestingHarness.create('/admin/devices');
    harness.detectChanges();
    await harness.fixture.whenStable();

    const link = harness.routeNativeElement?.querySelector(
      '[data-test="shell-quicknav-registries"]',
    ) as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/registries');

    link.click();
    harness.detectChanges();
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement?.textContent).toContain('registries stub');
  });
});
