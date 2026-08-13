import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { API_BASE_URL } from '../../core/api.tokens';
import { AuthService } from '../../core/auth.service';
import { CapabilitiesService } from '../../core/capabilities/capabilities.service';
import { PiToastService } from '../../shared/ui/toast';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { TableComponent } from '../../shared/ui/pi-table.component';
import { DevicesAdminPage } from './devices-admin.page';

/**
 * TZ-AUTH-304 — DevicesAdminPage unit spec.
 *
 * Covers the devices list contract: initial GET /admin/devices on
 * construction, RU status copy («Работает» / «Отключён»), owner-only
 * «Добавить мой компьютер» button visibility, and error surfacing.
 * Dialog-confirm machinery (revoke / edit dialogs) is exercised through
 * the service endpoints in the enrollment e2e spec — out of scope here
 * (same split as users-admin.page.spec).
 */
const BASE_URL = '/api';

const DEVICE = {
  id: 'd1',
  deviceName: 'Цеховой ПК №1',
  status: 'active' as const,
  inviteKind: 'regular' as const,
  role: 'manager',
  expiresAt: '2027-08-13T00:00:00.000Z',
  lastUsedAt: '2026-08-13T09:00:00.000Z',
  activatedAt: '2026-08-13T08:00:00.000Z',
  revokedAt: null,
  userId: 'u1',
};

const REVOKED_DEVICE = { ...DEVICE, id: 'd2', deviceName: 'Старый ПК', status: 'revoked' as const };

describe('DevicesAdminPage', () => {
  let httpMock: HttpTestingController;
  let toastError: jest.Mock;
  let toastSuccess: jest.Mock;
  let hasAny: jest.Mock;
  let isOwner: jest.Mock;

  beforeEach(async () => {
    toastError = jest.fn();
    toastSuccess = jest.fn();
    hasAny = jest.fn().mockReturnValue(true);
    isOwner = jest.fn().mockReturnValue(false);
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
        { provide: PiToastService, useValue: { success: toastSuccess, error: toastError } },
        { provide: CapabilitiesService, useValue: { hasAny } },
        {
          provide: AuthService,
          useValue: {
            isOwner,
            user: jest.fn().mockReturnValue({ pages: ['admin-users', 'admin-devices'] }),
          } as unknown as AuthService,
        },
      ],
    })
      .overrideComponent(DevicesAdminPage, {
        set: { imports: [PiRowActionsComponent, TableComponent], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('issues the initial devices list request on construction', () => {
    const fixture = TestBed.createComponent(DevicesAdminPage);
    expect(fixture.componentInstance).toBeTruthy();
    const req = httpMock.expectOne(`${BASE_URL}/admin/devices`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('loads devices and renders RU status copy', async () => {
    const fixture = TestBed.createComponent(DevicesAdminPage);
    const req = httpMock.expectOne(`${BASE_URL}/admin/devices`);
    req.flush([DEVICE, REVOKED_DEVICE]);
    await fixture.whenStable();
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    expect(comp.devicesList().length).toBe(2);
    expect(comp.loading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Цеховой ПК №1');
    expect(fixture.nativeElement.textContent).toContain('Работает');
    expect(fixture.nativeElement.textContent).toContain('Отключён');
  });

  it('shows the revoke/edit actions only for active devices', async () => {
    const fixture = TestBed.createComponent(DevicesAdminPage);
    httpMock.expectOne(`${BASE_URL}/admin/devices`).flush([DEVICE, REVOKED_DEVICE]);
    await fixture.whenStable();
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('[data-test="devices-revoke"]');
    expect(buttons.length).toBe(1);
  });

  it('hides the owner-only button for ordinary admins', async () => {
    const fixture = TestBed.createComponent(DevicesAdminPage);
    httpMock.expectOne(`${BASE_URL}/admin/devices`).flush([DEVICE]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="devices-owner-invite"]')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-test="devices-create-invite"]'),
    ).not.toBeNull();
  });

  it('shows the owner-only «Добавить мой компьютер» button for the owner', async () => {
    isOwner.mockReturnValue(true);
    const fixture = TestBed.createComponent(DevicesAdminPage);
    httpMock.expectOne(`${BASE_URL}/admin/devices`).flush([DEVICE]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('[data-test="devices-owner-invite"]'),
    ).not.toBeNull();
  });

  it('surfaces a list error instead of the table', async () => {
    const fixture = TestBed.createComponent(DevicesAdminPage);
    httpMock
      .expectOne(`${BASE_URL}/admin/devices`)
      .flush({ message: 'Server exploded' }, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="devices-admin-error"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Server exploded');
  });
});
