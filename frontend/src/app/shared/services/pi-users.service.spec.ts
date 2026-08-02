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
});
