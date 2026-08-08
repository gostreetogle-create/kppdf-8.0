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
import { TableComponent } from '../../shared/ui/pi-table.component';
import { silentDelete } from '../../core/silent-http';
import { RolesAdminPage } from './roles-admin.page';

const BASE_URL = '/api';

interface PageHarness {
  silentRun: (obs: unknown, successMsg: string, rowId?: string) => void;
  loadingRowId: () => string | null;
  page: () => number;
  total: () => number;
  roles: () => (typeof CLIENT_ROLE)[];
  onPageChange: (page: number) => void;
  onSearchInput: (event: Event) => void;
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
        set: { imports: [PiRowActionsComponent, TableComponent], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  async function createPage() {
    const fixture = TestBed.createComponent(RolesAdminPage);
    httpMock.expectOne(`${BASE_URL}/admin/roles?page=1&limit=50`).flush({
      items: [CLIENT_ROLE],
      total: 1,
      page: 1,
      limit: 50,
    });
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('renders loading and empty states from the paginated response', async () => {
    const fixture = TestBed.createComponent(RolesAdminPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-busy="true"]')).not.toBeNull();
    httpMock.expectOne(`${BASE_URL}/admin/roles?page=1&limit=50`).flush({
      items: [],
      total: 0,
      page: 1,
      limit: 50,
    });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="empty-state-row"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Роли не найдены.');
  });

  it('requests the selected page once and applies returned metadata', () => {
    const fixture = TestBed.createComponent(RolesAdminPage);
    const comp = fixture.componentInstance as unknown as PageHarness;
    httpMock.expectOne(`${BASE_URL}/admin/roles?page=1&limit=50`).flush({
      items: [CLIENT_ROLE],
      total: 101,
      page: 1,
      limit: 50,
    });
    comp.onPageChange(2);
    const requests = httpMock.match(`${BASE_URL}/admin/roles?page=2&limit=50`);
    expect(requests).toHaveLength(1);
    requests[0].flush({
      items: [{ ...CLIENT_ROLE, id: 'r2', name: 'manager' }],
      total: 101,
      page: 2,
      limit: 50,
    });
    expect(comp.page()).toBe(2);
    expect(comp.total()).toBe(101);
    expect(comp.roles()[0].name).toBe('manager');
  });

  it('resets to page one and includes search in the next request', () => {
    const fixture = TestBed.createComponent(RolesAdminPage);
    const comp = fixture.componentInstance as unknown as PageHarness;
    httpMock.expectOne(`${BASE_URL}/admin/roles?page=1&limit=50`).flush({
      items: [CLIENT_ROLE],
      total: 101,
      page: 1,
      limit: 50,
    });
    comp.onPageChange(2);
    httpMock.expectOne(`${BASE_URL}/admin/roles?page=2&limit=50`).flush({
      items: [],
      total: 101,
      page: 2,
      limit: 50,
    });
    comp.onSearchInput({ target: { value: 'manager' } } as unknown as Event);
    const requests = httpMock.match(
      (req) => req.url === `${BASE_URL}/admin/roles` && req.params.get('search') === 'manager',
    );
    expect(requests).toHaveLength(1);
    expect(requests[0].request.params.get('page')).toBe('1');
    requests[0].flush({ items: [CLIENT_ROLE], total: 1, page: 1, limit: 50 });
    expect(comp.page()).toBe(1);
  });

  it('ignores a stale earlier page response after a newer request wins', () => {
    const fixture = TestBed.createComponent(RolesAdminPage);
    const comp = fixture.componentInstance as unknown as PageHarness;
    const initial = httpMock.expectOne(`${BASE_URL}/admin/roles?page=1&limit=50`);
    comp.onPageChange(2);
    const pageTwo = httpMock.expectOne(`${BASE_URL}/admin/roles?page=2&limit=50`);
    pageTwo.flush({
      items: [{ ...CLIENT_ROLE, id: 'r2', name: 'page-two' }],
      total: 100,
      page: 2,
      limit: 50,
    });
    initial.flush({ items: [CLIENT_ROLE], total: 100, page: 1, limit: 50 });
    expect(comp.page()).toBe(2);
    expect(comp.roles()[0].name).toBe('page-two');
  });

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

  it('shows system badge + view for frozen system roles (TZ-ADMIN-301)', async () => {
    hasAny.mockImplementation(() => true);
    const fixture = TestBed.createComponent(RolesAdminPage);
    httpMock.expectOne(`${BASE_URL}/admin/roles?page=1&limit=50`).flush({
      items: [
        {
          id: 'sys-admin',
          name: 'admin',
          label: 'Administrator',
          permissions: ['*'],
          pages: ['products'],
          isSystem: true,
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
    });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[data-test="roles-admin-system-badge"]'),
    ).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Системная');
    expect(fixture.nativeElement.querySelector('[data-test="roles-admin-view"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="roles-admin-edit"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="roles-admin-delete"]')).toBeNull();
  });

  it('shows Edit for non-system director/manager (TZ-ADMIN-302)', async () => {
    hasAny.mockImplementation((keys: readonly string[]) => keys.includes('role:write'));
    const fixture = TestBed.createComponent(RolesAdminPage);
    httpMock.expectOne(`${BASE_URL}/admin/roles?page=1&limit=50`).flush({
      items: [
        {
          id: 'r-dir',
          name: 'director',
          label: 'Директор',
          permissions: ['product:read'],
          pages: ['products'],
          isSystem: false,
        },
        {
          id: 'r-mgr',
          name: 'manager',
          label: 'Менеджер',
          permissions: ['sales:read'],
          pages: ['proposals'],
          isSystem: false,
        },
      ],
      total: 2,
      page: 1,
      limit: 50,
    });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-test="roles-admin-edit"]').length).toBe(2);
    expect(fixture.nativeElement.querySelector('[data-test="roles-admin-view"]')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-test="roles-admin-system-badge"]'),
    ).toBeNull();
  });

  it('tracks row loading and clears it after an error', () => {
    const fixture = TestBed.createComponent(RolesAdminPage);
    const comp = fixture.componentInstance as unknown as PageHarness;
    httpMock.expectOne(`${BASE_URL}/admin/roles?page=1&limit=50`).flush({
      items: [],
      total: 0,
      page: 1,
      limit: 50,
    });

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
