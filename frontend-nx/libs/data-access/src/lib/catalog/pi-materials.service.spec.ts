import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { MATERIAL_KINDS } from './material.types';
import { MATERIALS_MAX_PAGE_SIZE, PiMaterialsService } from './pi-materials.service';

describe('PiMaterialsService (TZ-NX-CATALOG-DATA-ACCESS-READ)', () => {
  let service: PiMaterialsService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/materials`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    }).compileComponents();

    service = TestBed.inject(PiMaterialsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('exports canonical MATERIAL_KINDS', () => {
    expect([...MATERIAL_KINDS]).toEqual(['raw', 'part', 'fastener', 'purchased', 'other']);
  });

  it('list() defaults page=1 limit=50 and never sends organizationId', () => {
    service.list().subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl && r.method === 'GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('50');
    expect(req.request.params.has('organizationId')).toBe(false);
    req.flush({ items: [], total: 0, page: 1, limit: 50 });
  });

  it('list() clamps limit to MATERIALS_MAX_PAGE_SIZE', () => {
    service.list({ limit: 500 }).subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl);
    expect(req.request.params.get('limit')).toBe(String(MATERIALS_MAX_PAGE_SIZE));
    req.flush({ items: [], total: 0, page: 1, limit: MATERIALS_MAX_PAGE_SIZE });
  });

  it('list() attaches search, categoryId and materialKind when set', () => {
    service.list({ search: 'steel', categoryId: 'cat-1', materialKind: 'part', page: 2 }).subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl);
    expect(req.request.params.get('search')).toBe('steel');
    expect(req.request.params.get('categoryId')).toBe('cat-1');
    expect(req.request.params.get('materialKind')).toBe('part');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.has('materialKind')).toBe(true);
    req.flush({ items: [], total: 0, page: 2, limit: 50 });
  });

  it('list() omits optional filters when unset', () => {
    service.list({}).subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl);
    expect(req.request.params.has('search')).toBe(false);
    expect(req.request.params.has('categoryId')).toBe(false);
    expect(req.request.params.has('materialKind')).toBe(false);
    req.flush({ items: [], total: 0, page: 1, limit: 50 });
  });

  it('list() maps SilentResult ok on success', () => {
    let result: { ok: boolean; data?: unknown } | undefined;
    service.list().subscribe((res) => {
      result = res;
    });
    httpMock.expectOne((r) => r.url === listUrl).flush({ items: [{ _id: 'm1', name: 'Steel', unit: 'кг' }], total: 1, page: 1, limit: 50 });
    expect(result?.ok).toBe(true);
    expect((result as { ok: true; data: { items: unknown[] } }).data.items).toHaveLength(1);
  });

  it('list() maps SilentResult error without throwing', () => {
    let result: { ok: boolean; error?: HttpErrorResponse } | undefined;
    service.list().subscribe((res) => {
      result = res;
    });
    httpMock.expectOne((r) => r.url === listUrl).flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    expect(result?.ok).toBe(false);
    expect(result?.error?.status).toBe(403);
  });

  it('getById() GETs /materials/:id without org query param', () => {
    service.getById('507f1f77bcf86cd799439011').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/materials/507f1f77bcf86cd799439011`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('organizationId')).toBe(false);
    req.flush({ _id: '507f1f77bcf86cd799439011', name: 'Glass', unit: 'м2' });
  });

  it('create() POSTs /materials with payload', () => {
    const payload = { name: 'Steel', article: 'S-1', unit: 'кг', materialKind: 'raw' as const };
    service.create(payload).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/materials`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ _id: 'm-new', ...payload });
  });

  it('update() PATCHes /materials/:id', () => {
    const payload = { name: 'Steel v2' };
    service.update('m1', payload).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/materials/m1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush({ _id: 'm1', name: 'Steel v2', article: 'S-1', unit: 'кг', materialKind: 'raw' });
  });

  it('duplicate() POSTs /materials/:id/duplicate', () => {
    service.duplicate('m1').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/materials/m1/duplicate`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ _id: 'm-copy', name: 'Steel (копия)', article: 'S-1-copy', unit: 'кг', materialKind: 'raw' });
  });

  it('archive() DELETEs /materials/:id', () => {
    service.archive('m1').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/materials/m1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
