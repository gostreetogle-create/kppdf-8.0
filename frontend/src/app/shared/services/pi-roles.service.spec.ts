import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { PiRolesService } from './pi-roles.service';

describe('PiRolesService (TZ-278)', () => {
  let service: PiRolesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(PiRolesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('sends page, limit, and search and returns the envelope', () => {
    let result: unknown;
    service.list({ page: 2, limit: 10, search: 'manager' }).subscribe((res) => {
      result = res;
    });
    const request = httpMock.expectOne((req) => req.url === '/api/admin/roles');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('limit')).toBe('10');
    expect(request.request.params.get('search')).toBe('manager');
    request.flush({ items: [], total: 0, page: 2, limit: 10 });
    expect(result).toEqual({ ok: true, data: { items: [], total: 0, page: 2, limit: 10 } });
  });

  it('uses page one and the default limit when params are omitted', () => {
    service.list().subscribe();
    const request = httpMock.expectOne((req) => req.url === '/api/admin/roles');
    expect(request.request.params.get('page')).toBe('1');
    expect(request.request.params.get('limit')).toBe('50');
    request.flush({ items: [], total: 0, page: 1, limit: 50 });
  });
});
