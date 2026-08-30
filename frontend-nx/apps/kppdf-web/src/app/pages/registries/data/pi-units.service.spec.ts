import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiUnitsService, UNITS_MAX_PAGE_SIZE } from '@kppdf/data-access';

describe('PiUnitsService (TZ-NX-REGISTRY-UNITS-READ-SLICE)', () => {
  let service: PiUnitsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(PiUnitsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('maps list params to GET /units with page, limit, search, and isActive', () => {
    let result: unknown;
    service
      .list({ page: 2, limit: 25, search: 'kg', isActive: true })
      .subscribe((res) => {
        result = res;
      });
    const request = httpMock.expectOne((req) => req.url === '/api/units');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('limit')).toBe('25');
    expect(request.request.params.get('search')).toBe('kg');
    expect(request.request.params.get('isActive')).toBe('true');
    request.flush({
      items: [{ key: 'kg', label: 'Килограмм', isActive: true, isSystem: true, sortOrder: 0 }],
      total: 1,
      page: 2,
      limit: 25,
    });
    expect(result).toEqual({
      ok: true,
      data: {
        items: [{ key: 'kg', label: 'Килограмм', isActive: true, isSystem: true, sortOrder: 0 }],
        total: 1,
        page: 2,
        limit: 25,
      },
    });
  });

  it('defaults page to 1 and limit to 50 when params are omitted', () => {
    service.list().subscribe();
    const request = httpMock.expectOne((req) => req.url === '/api/units');
    expect(request.request.params.get('page')).toBe('1');
    expect(request.request.params.get('limit')).toBe('50');
    request.flush({ items: [], total: 0, page: 1, limit: 50 });
  });

  it(`clamps limit to ${UNITS_MAX_PAGE_SIZE} before sending the request`, () => {
    service.list({ limit: 500 }).subscribe();
    const request = httpMock.expectOne((req) => req.url === '/api/units');
    expect(request.request.params.get('limit')).toBe(String(UNITS_MAX_PAGE_SIZE));
    request.flush({ items: [], total: 0, page: 1, limit: UNITS_MAX_PAGE_SIZE });
  });

  it('omits search and isActive params when not provided', () => {
    service.list({ page: 1, limit: 10 }).subscribe();
    const request = httpMock.expectOne((req) => req.url === '/api/units');
    expect(request.request.params.has('search')).toBe(false);
    expect(request.request.params.has('isActive')).toBe(false);
    request.flush({ items: [], total: 0, page: 1, limit: 10 });
  });

  it('PATCHes /units/:key for toggle-active updates', () => {
    let result: unknown;
    service.update('kg', { isActive: false }).subscribe((res) => {
      result = res;
    });
    const request = httpMock.expectOne('/api/units/kg');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ isActive: false });
    request.flush({ key: 'kg', label: 'Килограмм', isActive: false, isSystem: true, sortOrder: 0 });
    expect(result).toEqual({
      ok: true,
      data: { key: 'kg', label: 'Килограмм', isActive: false, isSystem: true, sortOrder: 0 },
    });
  });

  it('does not expose a remove/delete method', () => {
    expect('remove' in service).toBe(false);
    expect('delete' in service).toBe(false);
  });

  it('returns SilentResult error envelope on HTTP failure without throwing', () => {
    let result: unknown;
    service.list().subscribe((res) => {
      result = res;
    });
    const request = httpMock.expectOne((req) => req.url === '/api/units');
    request.flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
    expect(result).toEqual(expect.objectContaining({ ok: false }));
  });
});
