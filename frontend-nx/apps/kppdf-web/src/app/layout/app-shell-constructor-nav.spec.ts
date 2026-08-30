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

@Component({ standalone: true, template: 'studio stub' })
class StudioStubPage {}

const TEST_ROUTES = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: 'admin/devices', loadComponent: () => Promise.resolve(DevicesStubPage) },
      { path: 'registries', loadComponent: () => Promise.resolve(RegistriesStubPage) },
      { path: 'studio', loadComponent: () => Promise.resolve(StudioStubPage) },
    ],
  },
];

describe('AppShellComponent studio quicknav (TZ-NX-DOCSTUDIO-S2-SHELL)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellComponent, RouterLink],
      providers: [
        provideRouter(TEST_ROUTES),
        {
          provide: AuthService,
          useValue: {
            user: signal({ role: 'admin', pages: ['doc-studio', 'orders'] }),
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

  it('shows the docs quicknav chip whose entry path falls back to /studio', async () => {
    const harness = await RouterTestingHarness.create('/admin/devices');
    harness.detectChanges();
    await harness.fixture.whenStable();

    const link = harness.routeNativeElement?.querySelector(
      '[data-test="shell-quicknav-docs"]',
    ) as HTMLAnchorElement;
    expect(link).toBeTruthy();
    // Default docs entryPath (/doc-constructor/templates) has no NX route, so the
    // filter falls back to the first surviving item — the studio shell (/studio).
    expect(link.getAttribute('href')).toBe('/studio');
  });

  it('survives navigating to /studio (constructor stub replaced by studio)', async () => {
    const harness = await RouterTestingHarness.create('/studio');
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement?.textContent).toContain('studio stub');
  });
});