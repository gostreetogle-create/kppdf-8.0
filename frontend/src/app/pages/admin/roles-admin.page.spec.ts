import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { API_BASE_URL } from '../../core/api.tokens';
import { CapabilitiesService } from '../../core/capabilities/capabilities.service';
import { PiToastService } from '../../shared/ui/toast';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { silentDelete } from '../../core/silent-http';
import { RolesAdminPage } from './roles-admin.page';

const BASE_URL = '/api';

interface PageHarness {
  silentRun: (obs: unknown, successMsg: string, rowId?: string) => void;
  loadingRowId: () => string | null;
}

const CLIENT_ROLE = {
  id: 'r1',
  name: 'custom',
  label: 'Пользовательская роль',
  description: 'Описание',
  permissions: ['role:read'],
  isSystem: false,
};

describe('RolesAdminPage capability gating', () => {
  let httpMock: HttpTestingController;
  let hasAny: jest.Mock;

  beforeEach(async () => {
    hasAny = jest.fn().mockReturnValue(false);
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
        { provide: CapabilitiesService, useValue: { hasAny } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
      ],
    })
      .overrideComponent(RolesAdminPage, {
        set: { imports: [PiRowActionsComponent], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  async function createPage() {
    const fixture = TestBed.createComponent(RolesAdminPage);
    httpMock.expectOne(`${BASE_URL}/admin/roles`).flush([CLIENT_ROLE]);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('omits create, edit, and delete controls without role write/admin capabilities', async () => {
    const fixture = await createPage();

    expect(fixture.nativeElement.querySelector('[data-test="roles-admin-create"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="roles-admin-edit"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="roles-admin-delete"]')).toBeNull();
  });

  it('renders edit/create for role:write but keeps delete absent', async () => {
    hasAny.mockImplementation((keys: readonly string[]) => keys.includes('role:write'));
    const fixture = await createPage();

    expect(fixture.nativeElement.querySelector('[data-test="roles-admin-create"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="roles-admin-edit"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="roles-admin-delete"]')).toBeNull();
  });

  it('renders delete when role:admin is granted', async () => {
    hasAny.mockImplementation((keys: readonly string[]) => keys.includes('role:admin'));
    const fixture = await createPage();

    expect(fixture.nativeElement.querySelector('[data-test="roles-admin-create"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="roles-admin-edit"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="roles-admin-delete"]')).not.toBeNull();
  });

  it('tracks row loading and clears it after an error', () => {
    const fixture = TestBed.createComponent(RolesAdminPage);
    const comp = fixture.componentInstance as unknown as PageHarness;
    httpMock.expectOne(`${BASE_URL}/admin/roles`).flush([]);

    const http = TestBed.inject(HttpClient);
    const obs = silentDelete(http, `${BASE_URL}/admin/roles/r1`);
    comp.silentRun(obs, 'Роль удалена', 'r1');
    expect(comp.loadingRowId()).toBe('r1');
    httpMock
      .expectOne(`${BASE_URL}/admin/roles/r1`)
      .flush({ message: 'Server exploded' }, { status: 500, statusText: 'Server Error' });
    expect(comp.loadingRowId()).toBeNull();
  });
});
