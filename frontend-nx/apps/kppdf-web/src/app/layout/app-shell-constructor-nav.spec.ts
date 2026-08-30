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

@Component({ standalone: true, template: 'constructor stub' })
class ConstructorStubPage {}

const TEST_ROUTES = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: 'admin/devices', loadComponent: () => Promise.resolve(DevicesStubPage) },
      { path: 'registries', loadComponent: () => Promise.resolve(RegistriesStubPage) },
      { path: 'constructor', loadComponent: () => Promise.resolve(ConstructorStubPage) },
    ],
  },
];

describe('AppShellComponent constructor header navigation (TZ-NX-CONSTRUCTOR-SHELL)', () => {
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

  it('shows the Конструктор header chip alongside Реестры', async () => {
    const harness = await RouterTestingHarness.create('/admin/devices');
    harness.detectChanges();
    await harness.fixture.whenStable();

    const link = harness.routeNativeElement?.querySelector(
      '[data-test="shell-quicknav-constructor"]',
    ) as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.textContent).toContain('Констр');
    expect(link.getAttribute('href')).toBe('/constructor');
  });

  it('clicking the Конструктор chip navigates to /constructor', async () => {
    const harness = await RouterTestingHarness.create('/admin/devices');
    harness.detectChanges();
    await harness.fixture.whenStable();

    const link = harness.routeNativeElement?.querySelector(
      '[data-test="shell-quicknav-constructor"]',
    ) as HTMLAnchorElement;
    link.click();
    harness.detectChanges();
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement?.textContent).toContain('constructor stub');
  });
});
