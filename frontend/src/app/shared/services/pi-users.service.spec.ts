import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { PiUsersService } from './pi-users.service';

describe('PiUsersService (TZ-278)', () => {
  let service: PiUsersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(PiUsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('sends page, limit, search, and role and returns the envelope', () => {
    let result: unknown;
    service.list({ page: 2, limit: 25, search: 'alice', role: 'admin' }).subscribe((res) => {
      result = res;
    });
    const request = httpMock.expectOne((req) => req.url === '/api/admin/users');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('limit')).toBe('25');
    expect(request.request.params.get('search')).toBe('alice');
    expect(request.request.params.get('role')).toBe('admin');
    request.flush({ items: [], total: 0, page: 2, limit: 25 });
    expect(result).toEqual({ ok: true, data: { items: [], total: 0, page: 2, limit: 25 } });
  });

  it('uses page one and the default limit when params are omitted', () => {
    service.list().subscribe();
    const request = httpMock.expectOne((req) => req.url === '/api/admin/users');
    expect(request.request.params.get('page')).toBe('1');
    expect(request.request.params.get('limit')).toBe('50');
    request.flush({ items: [], total: 0, page: 1, limit: 50 });
  });

  it('preserves create and reset-password URLs and payloads', () => {
    service
      .create({ username: 'alice', password: 'secret', role: 'admin', isActive: true })
      .subscribe();
    const create = httpMock.expectOne('/api/admin/users');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual({
      username: 'alice',
      password: 'secret',
      role: 'admin',
      isActive: true,
    });
    create.flush({ id: 'u1' });

    service.resetPassword('u1', 'new-secret').subscribe();
    const reset = httpMock.expectOne('/api/admin/users/u1/reset-password');
    expect(reset.request.method).toBe('POST');
    expect(reset.request.body).toEqual({ newPassword: 'new-secret' });
    reset.flush({ id: 'u1' });
  });

  it('preserves update, activate, deactivate, and delete endpoints', () => {
    service
      .update('u1', { username: 'alice', role: 'admin', isActive: false, email: 'a@example.com' })
      .subscribe();
    const update = httpMock.expectOne('/api/admin/users/u1');
    expect(update.request.method).toBe('PATCH');
    expect(update.request.body).toEqual({
      username: 'alice',
      role: 'admin',
      isActive: false,
      email: 'a@example.com',
    });
    update.flush({ id: 'u1' });

    service.activate('u1').subscribe();
    const activate = httpMock.expectOne('/api/admin/users/u1/activate');
    expect(activate.request.method).toBe('POST');
    expect(activate.request.body).toEqual({});
    activate.flush({ id: 'u1' });

    service.deactivate('u1').subscribe();
    const deactivate = httpMock.expectOne('/api/admin/users/u1/deactivate');
    expect(deactivate.request.method).toBe('POST');
    expect(deactivate.request.body).toEqual({});
    deactivate.flush({ id: 'u1' });

    service.remove('u1').subscribe();
    const remove = httpMock.expectOne('/api/admin/users/u1');
    expect(remove.request.method).toBe('DELETE');
    remove.flush({ id: 'u1' });
  });
});
