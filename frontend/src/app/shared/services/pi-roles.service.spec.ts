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

  it('preserves create and update URLs and payloads', () => {
    service
      .create({
        name: 'manager',
        label: 'Manager',
        permissions: ['role:read'],
        pages: ['products'],
      })
      .subscribe();
    const create = httpMock.expectOne('/api/admin/roles');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual({
      name: 'manager',
      label: 'Manager',
      permissions: ['role:read'],
      pages: ['products'],
    });
    create.flush({ id: 'r1' });

    service
      .update('r1', {
        label: 'Updated manager',
        description: 'Updated',
        permissions: ['role:read', 'role:write'],
        pages: ['products'],
      })
      .subscribe();
    const update = httpMock.expectOne('/api/admin/roles/r1');
    expect(update.request.method).toBe('PATCH');
    expect(update.request.body).toEqual({
      label: 'Updated manager',
      description: 'Updated',
      permissions: ['role:read', 'role:write'],
      pages: ['products'],
    });
    update.flush({ id: 'r1' });
  });

  it('preserves delete endpoint', () => {
    service.remove('r1').subscribe();
    const remove = httpMock.expectOne('/api/admin/roles/r1');
    expect(remove.request.method).toBe('DELETE');
    remove.flush({ success: true });
  });
});
