import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PRODUCTS_MAX_PAGE_SIZE, PiProductsService } from './pi-products.service';

describe('PiProductsService (TZ-NX-CATALOG-DATA-ACCESS-READ)', () => {
  let service: PiProductsService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/products`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    }).compileComponents();

    service = TestBed.inject(PiProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('list() defaults page=1 limit=50 and never sends organizationId', () => {
    service.list().subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl && r.method === 'GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('50');
    expect(req.request.params.has('organizationId')).toBe(false);
    req.flush({ items: [], total: 0, page: 1, limit: 50 });
  });

  it('list() clamps limit to PRODUCTS_MAX_PAGE_SIZE', () => {
    service.list({ limit: 250 }).subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl);
    expect(req.request.params.get('limit')).toBe(String(PRODUCTS_MAX_PAGE_SIZE));
    req.flush({ items: [], total: 0, page: 1, limit: PRODUCTS_MAX_PAGE_SIZE });
  });

  it('list() attaches supported filters and sort params', () => {
    service
      .list({
        search: 'окно',
        categoryId: 'cat-9',
        status: 'active',
        isActive: true,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 3,
      })
      .subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl);
    expect(req.request.params.get('search')).toBe('окно');
    expect(req.request.params.get('categoryId')).toBe('cat-9');
    expect(req.request.params.get('status')).toBe('active');
    expect(req.request.params.get('isActive')).toBe('true');
    expect(req.request.params.get('sortBy')).toBe('createdAt');
    expect(req.request.params.get('sortOrder')).toBe('desc');
    expect(req.request.params.get('page')).toBe('3');
    req.flush({ items: [], total: 0, page: 3, limit: 50 });
  });

  it('list() omits isActive when undefined and omits isComplex when undefined', () => {
    service.list({}).subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl);
    expect(req.request.params.has('isActive')).toBe(false);
    expect(req.request.params.has('isComplex')).toBe(false);
    req.flush({ items: [], total: 0, page: 1, limit: 50 });
  });

  it('list() sends isComplex when provided', () => {
    service.list({ isComplex: true }).subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl);
    expect(req.request.params.get('isComplex')).toBe('true');
    req.flush({ items: [], total: 0, page: 1, limit: 50 });
  });

  it('list() maps SilentResult ok on success', () => {
    let result: { ok: boolean; data?: unknown } | undefined;
    service.list().subscribe((res) => {
      result = res;
    });
    httpMock
      .expectOne((r) => r.url === listUrl)
      .flush({ items: [{ _id: 'p1', name: 'Window', kind: 'good', unit: 'шт' }], total: 1, page: 1, limit: 50 });
    expect(result?.ok).toBe(true);
  });

  it('list() maps SilentResult error without throwing', () => {
    let result: { ok: boolean; error?: HttpErrorResponse } | undefined;
    service.list().subscribe((res) => {
      result = res;
    });
    httpMock.expectOne((r) => r.url === listUrl).flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    expect(result?.ok).toBe(false);
    expect(result?.error?.status).toBe(401);
  });

  it('getById() GETs /products/:id and accepts detail enrichments', () => {
    let result: { ok: boolean; data?: { isComplex?: boolean } } | undefined;
    service.getById('507f1f77bcf86cd799439012').subscribe((res) => {
      result = res;
    });
    const req = httpMock.expectOne(`${baseUrl}/products/507f1f77bcf86cd799439012`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('organizationId')).toBe(false);
    req.flush({
      _id: '507f1f77bcf86cd799439012',
      name: 'Complex kit',
      sku: 'KIT-1',
      kind: 'good',
      unit: 'шт',
      isComplex: true,
    });
    expect(result?.ok).toBe(true);
    expect(result?.data?.isComplex).toBe(true);
  });

  it('getByIds() GETs /products/bulk with ids param (TZ-NX-GANTT-G2)', () => {
    service.getByIds(['p1', 'p2']).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/products/bulk` && r.method === 'GET');
    expect(req.request.params.get('ids')).toBe('p1,p2');
    req.flush([{ _id: 'p1', name: 'Окно', sku: 'W-1', kind: 'good', unit: 'шт' }]);
  });

  it('getByIds() resolves immediately with empty data for empty ids (TZ-NX-GANTT-G2)', () => {
    let result: { ok: boolean; data?: unknown } | undefined;
    service.getByIds([]).subscribe((res) => {
      result = res;
    });
    expect(result?.ok).toBe(true);
    expect(result?.data).toEqual([]);
  });
});
