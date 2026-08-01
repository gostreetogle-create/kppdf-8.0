import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { API_BASE_URL } from '../../core/api.tokens';
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
  silentRun: (obs: unknown, successMsg: string) => void;
}

describe('UsersAdminPage', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let toastError: jest.Mock;
  let toastSuccess: jest.Mock;

  beforeEach(async () => {
    toastError = jest.fn();
    toastSuccess = jest.fn();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
        { provide: PiToastService, useValue: { success: toastSuccess, error: toastError } },
      ],
    })
      .overrideComponent(UsersAdminPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
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
    const req = httpMock.expectOne(`${BASE_URL}/admin/users?limit=200`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('loads users on construction', async () => {
    const fixture = TestBed.createComponent(UsersAdminPage);
    const comp = fixture.componentInstance;
    const req = httpMock.expectOne(`${BASE_URL}/admin/users?limit=200`);
    req.flush([CLIENT_USER]);
    await fixture.whenStable();

    expect(comp.users().length).toBe(1);
    expect(comp.users()[0].username).toBe('alice');
    expect(comp.loading()).toBe(false);
  });

  it('maps LAST_ADMIN_INVARIANT 403 to the invariant toast', () => {
    const fixture = TestBed.createComponent(UsersAdminPage);
    const comp = fixture.componentInstance as unknown as PageHarness;
    httpMock.expectOne(`${BASE_URL}/admin/users?limit=200`).flush([]);

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
    httpMock.expectOne(`${BASE_URL}/admin/users?limit=200`).flush([]);

    const obs = silentDelete(http, `${BASE_URL}/admin/users/u1`);
    comp.silentRun(obs, 'Пользователь удалён');

    httpMock
      .expectOne(`${BASE_URL}/admin/users/u1`)
      .flush({ message: 'Server exploded' }, { status: 500, statusText: 'Server Error' });

    expect(toastError).toHaveBeenCalledWith('Server exploded');
  });

  it('shows the success toast and refreshes after a successful mutation', () => {
    const fixture = TestBed.createComponent(UsersAdminPage);
    const comp = fixture.componentInstance as unknown as PageHarness;
    httpMock.expectOne(`${BASE_URL}/admin/users?limit=200`).flush([]);

    const obs = silentPost(http, `${BASE_URL}/admin/users/u1/activate`, {});
    comp.silentRun(obs, 'Пользователь активирован');

    httpMock.expectOne(`${BASE_URL}/admin/users/u1/activate`).flush(CLIENT_USER, {
      status: 200,
      statusText: 'OK',
    });

    expect(toastSuccess).toHaveBeenCalledWith('Пользователь активирован');
    // success → refresh() → second list request.
    httpMock.expectOne(`${BASE_URL}/admin/users?limit=200`).flush([]);
  });
});
