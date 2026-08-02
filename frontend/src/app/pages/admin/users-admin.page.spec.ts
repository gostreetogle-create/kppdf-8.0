import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { API_BASE_URL } from '../../core/api.tokens';
import { CapabilitiesService } from '../../core/capabilities/capabilities.service';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { TableComponent } from '../../shared/ui/pi-table.component';
import { silentPost, silentDelete } from '../../core/silent-http';
import { PiToastService } from '../../shared/ui/toast';
import { UsersAdminPage } from './users-admin.page';

/**
 * TZ-257.A.1 §5 — UsersAdminPage unit spec.
 *
 * Covers initial load (via HttpTestingController through the real
 * silent-* helpers) and the mutation result handling — the
 * `LAST_ADMIN_INVARIANT` 403 mapping and the success/refresh path.
 *
 * Determinism note: mutation result handling is tested by invoking the
 * page's `silentRun` directly with real `silent-*` observables. The
 * HTTP request is created synchronously on subscribe and flushed
 * synchronously, so no fakeAsync / effect flushing is required. The
 * dialog-confirm machinery (`onDialogCloseOnce` → `toObservable`) is
 * deliberately out of scope here.
 */

const BASE_URL = '/api';

const CLIENT_USER = {
  id: 'u1',
  username: 'alice',
  email: 'a@example.com',
  displayName: 'Alice',
  role: 'admin',
  isActive: true,
  permissions: [],
};

interface PageHarness {
  silentRun: (obs: unknown, successMsg: string, rowId?: string) => void;
  resetPassword: (id: string, password: string) => import('rxjs').Observable<unknown>;
  loadingRowId: () => string | null;
  page: () => number;
  total: () => number;
  users: () => (typeof CLIENT_USER)[];
  onPageChange: (page: number) => void;
  onSearchInput: (event: Event) => void;
}

describe('UsersAdminPage', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let toastError: jest.Mock;
  let toastSuccess: jest.Mock;
  let hasAny: jest.Mock;

  beforeEach(async () => {
    toastError = jest.fn();
    toastSuccess = jest.fn();
    hasAny = jest.fn().mockReturnValue(false);
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
        { provide: PiToastService, useValue: { success: toastSuccess, error: toastError } },
        { provide: CapabilitiesService, useValue: { hasAny } },
      ],
    })
      .overrideComponent(UsersAdminPage, {
        set: { imports: [PiRowActionsComponent, TableComponent], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates successfully and issues the initial list request', () => {
    const fixture = TestBed.createComponent(UsersAdminPage);
    expect(fixture.componentInstance).toBeTruthy();
    const req = httpMock.expectOne(`${BASE_URL}/admin/users?page=1&limit=50`);
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], total: 0, page: 1, limit: 50 });
  });

  it('loads users on construction', async () => {
    const fixture = TestBed.createComponent(UsersAdminPage);
    const comp = fixture.componentInstance;
    const req = httpMock.expectOne(`${BASE_URL}/admin/users?page=1&limit=50`);
    req.flush({ items: [CLIENT_USER], total: 1, page: 1, limit: 50 });
    await fixture.whenStable();

    expect(comp.users().length).toBe(1);
    expect(comp.users()[0].username).toBe('alice');
    expect(comp.loading()).toBe(false);
  });

  it('renders loading and empty states from the paginated response', async () => {
    const fixture = TestBed.createComponent(UsersAdminPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-busy="true"]')).not.toBeNull();
    httpMock.expectOne(`${BASE_URL}/admin/users?page=1&limit=50`).flush({
      items: [],
      total: 0,
      page: 1,
      limit: 50,
    });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="empty-state-row"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Пользователи не найдены.');
  });

  it('requests the selected page exactly once and applies returned metadata', () => {
    const fixture = TestBed.createComponent(UsersAdminPage);
    const comp = fixture.componentInstance as unknown as PageHarness;
    httpMock.expectOne(`${BASE_URL}/admin/users?page=1&limit=50`).flush({
      items: [CLIENT_USER],
      total: 101,
      page: 1,
      limit: 50,
    });

    comp.onPageChange(2);
    const requests = httpMock.match(`${BASE_URL}/admin/users?page=2&limit=50`);
    expect(requests).toHaveLength(1);
    requests[0].flush({
      items: [{ ...CLIENT_USER, id: 'u2', username: 'bob' }],
      total: 101,
      page: 2,
      limit: 50,
    });

    expect(comp.page()).toBe(2);
    expect(comp.total()).toBe(101);
    expect(comp.users()[0].username).toBe('bob');
  });

  it('resets to page one and includes search in the next request', () => {
    const fixture = TestBed.createComponent(UsersAdminPage);
    const comp = fixture.componentInstance as unknown as PageHarness;
    httpMock.expectOne(`${BASE_URL}/admin/users?page=1&limit=50`).flush({
      items: [CLIENT_USER],
      total: 101,
      page: 1,
      limit: 50,
    });
    comp.onPageChange(2);
    httpMock.expectOne(`${BASE_URL}/admin/users?page=2&limit=50`).flush({
      items: [],
      total: 101,
      page: 2,
      limit: 50,
    });

    comp.onSearchInput({ target: { value: 'alice' } } as unknown as Event);
    const requests = httpMock.match(
      (req) => req.url === `${BASE_URL}/admin/users` && req.params.get('search') === 'alice',
    );
    expect(requests).toHaveLength(1);
    expect(requests[0].request.params.get('page')).toBe('1');
    requests[0].flush({ items: [CLIENT_USER], total: 1, page: 1, limit: 50 });
    expect(comp.page()).toBe(1);
  });

  it('ignores a stale earlier page response after a newer request wins', () => {
    const fixture = TestBed.createComponent(UsersAdminPage);
    const comp = fixture.componentInstance as unknown as PageHarness;
    const initial = httpMock.expectOne(`${BASE_URL}/admin/users?page=1&limit=50`);
    comp.onPageChange(2);
    const pageTwo = httpMock.expectOne(`${BASE_URL}/admin/users?page=2&limit=50`);
    pageTwo.flush({
      items: [{ ...CLIENT_USER, id: 'u2', username: 'page-two' }],
      total: 100,
      page: 2,
      limit: 50,
    });
    initial.flush({ items: [CLIENT_USER], total: 100, page: 1, limit: 50 });
    expect(comp.page()).toBe(2);
    expect(comp.users()[0].username).toBe('page-two');
  });

  it('maps LAST_ADMIN_INVARIANT 403 to the invariant toast', () => {
    const fixture = TestBed.createComponent(UsersAdminPage);
    const comp = fixture.componentInstance as unknown as PageHarness;
    httpMock.expectOne(`${BASE_URL}/admin/users?page=1&limit=50`).flush({
      items: [],
      total: 0,
      page: 1,
      limit: 50,
    });

    const obs = silentPost(http, `${BASE_URL}/admin/users/u1/deactivate`, {});
    comp.silentRun(obs, 'Пользователь деактивирован');

    httpMock
      .expectOne(`${BASE_URL}/admin/users/u1/deactivate`)
      .flush(
        { message: 'Last admin invariant violated', code: 'LAST_ADMIN_INVARIANT' },
        { status: 403, statusText: 'Forbidden' },
      );

    expect(toastError).toHaveBeenCalledWith('Нельзя удалить/понизить последнего админа');
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it('shows the raw error message for non-invariant failures', () => {
    const fixture = TestBed.createComponent(UsersAdminPage);
    const comp = fixture.componentInstance as unknown as PageHarness;
    httpMock.expectOne(`${BASE_URL}/admin/users?page=1&limit=50`).flush({
      items: [],
      total: 0,
      page: 1,
      limit: 50,
    });

    const obs = silentDelete(http, `${BASE_URL}/admin/users/u1`);
    comp.silentRun(obs, 'Пользователь удалён');

    httpMock
      .expectOne(`${BASE_URL}/admin/users/u1`)
      .flush({ message: 'Server exploded' }, { status: 500, statusText: 'Server Error' });

    expect(toastError).toHaveBeenCalledWith('Server exploded');
  });

  it('hides users action controls when capabilities are missing', async () => {
    const fixture = TestBed.createComponent(UsersAdminPage);
    httpMock.expectOne(`${BASE_URL}/admin/users?page=1&limit=50`).flush({
      items: [CLIENT_USER],
      total: 1,
      page: 1,
      limit: 50,
    });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="users-admin-create"]')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-test="users-admin-reset-password"]'),
    ).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-test="users-admin-toggle-active"]'),
    ).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="users-admin-edit"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="users-admin-delete"]')).toBeNull();
  });

  it('renders users actions only for their required capabilities', async () => {
    hasAny.mockImplementation((keys: readonly string[]) => keys.includes('user:write'));
    const writeFixture = TestBed.createComponent(UsersAdminPage);
    httpMock.expectOne(`${BASE_URL}/admin/users?page=1&limit=50`).flush({
      items: [CLIENT_USER],
      total: 1,
      page: 1,
      limit: 50,
    });
    await writeFixture.whenStable();
    writeFixture.detectChanges();

    expect(
      writeFixture.nativeElement.querySelector('[data-test="users-admin-create"]'),
    ).not.toBeNull();
    expect(
      writeFixture.nativeElement.querySelector('[data-test="users-admin-toggle-active"]'),
    ).not.toBeNull();
    expect(
      writeFixture.nativeElement.querySelector('[data-test="users-admin-edit"]'),
    ).not.toBeNull();
    expect(
      writeFixture.nativeElement.querySelector('[data-test="users-admin-reset-password"]'),
    ).toBeNull();
    expect(writeFixture.nativeElement.querySelector('[data-test="users-admin-delete"]')).toBeNull();
    writeFixture.destroy();

    hasAny.mockImplementation((keys: readonly string[]) => keys.includes('user:admin'));
    const adminFixture = TestBed.createComponent(UsersAdminPage);
    httpMock.expectOne(`${BASE_URL}/admin/users?page=1&limit=50`).flush({
      items: [CLIENT_USER],
      total: 1,
      page: 1,
      limit: 50,
    });
    await adminFixture.whenStable();
    adminFixture.detectChanges();

    expect(
      adminFixture.nativeElement.querySelector('[data-test="users-admin-reset-password"]'),
    ).not.toBeNull();
    expect(
      adminFixture.nativeElement.querySelector('[data-test="users-admin-delete"]'),
    ).not.toBeNull();
    expect(adminFixture.nativeElement.querySelector('[data-test="users-admin-create"]')).toBeNull();
    expect(
      adminFixture.nativeElement.querySelector('[data-test="users-admin-toggle-active"]'),
    ).toBeNull();
  });

  it('tracks row loading, blocks duplicate row mutation, and clears on error', () => {
    const fixture = TestBed.createComponent(UsersAdminPage);
    const comp = fixture.componentInstance as unknown as PageHarness;
    httpMock.expectOne(`${BASE_URL}/admin/users?page=1&limit=50`).flush({
      items: [],
      total: 0,
      page: 1,
      limit: 50,
    });

    const obs = silentPost(http, `${BASE_URL}/admin/users/u1/deactivate`, {});
    comp.silentRun(obs, 'Пользователь деактивирован', 'u1');
    expect(comp.loadingRowId()).toBe('u1');
    comp.silentRun(obs, 'Пользователь деактивирован', 'u1');

    const requests = httpMock.match(`${BASE_URL}/admin/users/u1/deactivate`);
    expect(requests).toHaveLength(1);
    requests[0].flush({ message: 'Server exploded' }, { status: 500, statusText: 'Server Error' });
    expect(comp.loadingRowId()).toBeNull();
    expect(toastError).toHaveBeenCalledWith('Server exploded');
  });

  it('wires reset-password POST and clears row loading on success and error', () => {
    const fixture = TestBed.createComponent(UsersAdminPage);
    const comp = fixture.componentInstance as unknown as PageHarness;
    httpMock.expectOne(`${BASE_URL}/admin/users?page=1&limit=50`).flush({
      items: [],
      total: 0,
      page: 1,
      limit: 50,
    });

    const success = comp.resetPassword('u1', '12345678');
    expect(comp.loadingRowId()).toBe('u1');
    success.subscribe((result) => expect(result).toEqual(expect.objectContaining({ ok: true })));
    httpMock.expectOne(`${BASE_URL}/admin/users/u1/reset-password`).flush(CLIENT_USER);
    expect(comp.loadingRowId()).toBeNull();

    const failure = comp.resetPassword('u1', '87654321');
    expect(comp.loadingRowId()).toBe('u1');
    failure.subscribe((result) => expect(result).toEqual(expect.objectContaining({ ok: false })));
    httpMock
      .expectOne(`${BASE_URL}/admin/users/u1/reset-password`)
      .flush({ message: 'Server exploded' }, { status: 500, statusText: 'Server Error' });
    expect(comp.loadingRowId()).toBeNull();
  });

  it('clears row loading after a successful mutation and refreshes', () => {
    const fixture = TestBed.createComponent(UsersAdminPage);
    const comp = fixture.componentInstance as unknown as PageHarness;
    httpMock.expectOne(`${BASE_URL}/admin/users?page=1&limit=50`).flush({
      items: [],
      total: 0,
      page: 1,
      limit: 50,
    });

    const obs = silentPost(http, `${BASE_URL}/admin/users/u1/activate`, {});
    comp.silentRun(obs, 'Пользователь активирован', 'u1');
    expect(comp.loadingRowId()).toBe('u1');
    httpMock.expectOne(`${BASE_URL}/admin/users/u1/activate`).flush(CLIENT_USER);
    expect(comp.loadingRowId()).toBeNull();
    httpMock.expectOne(`${BASE_URL}/admin/users?page=1&limit=50`).flush({
      items: [],
      total: 0,
      page: 1,
      limit: 50,
    });
  });

  it('shows the success toast and refreshes after a successful mutation', () => {
    const fixture = TestBed.createComponent(UsersAdminPage);
    const comp = fixture.componentInstance as unknown as PageHarness;
    httpMock.expectOne(`${BASE_URL}/admin/users?page=1&limit=50`).flush({
      items: [],
      total: 0,
      page: 1,
      limit: 50,
    });

    const obs = silentPost(http, `${BASE_URL}/admin/users/u1/activate`, {});
    comp.silentRun(obs, 'Пользователь активирован');

    httpMock.expectOne(`${BASE_URL}/admin/users/u1/activate`).flush(CLIENT_USER, {
      status: 200,
      statusText: 'OK',
    });

    expect(toastSuccess).toHaveBeenCalledWith('Пользователь активирован');
    // success → refresh() → second list request.
    httpMock.expectOne(`${BASE_URL}/admin/users?page=1&limit=50`).flush({
      items: [],
      total: 0,
      page: 1,
      limit: 50,
    });
  });
});
