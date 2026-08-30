import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiModulesService } from './pi-modules.service';

describe('PiModulesService (TZ-NX-REGISTRIES-MODULES-PRODUCTS-READ)', () => {
  let service: PiModulesService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/modules`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    }).compileComponents();

    service = TestBed.inject(PiModulesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('list() GETs /modules without pagination params or organizationId', () => {
    service.list().subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl && r.method === 'GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush([]);
  });

  it('list() passes productId when scoped to a product', () => {
    service.list({ productId: '507f1f77bcf86cd799439011' }).subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl);
    expect(req.request.params.get('productId')).toBe('507f1f77bcf86cd799439011');
    expect(req.request.params.has('page')).toBe(false);
    expect(req.request.params.has('limit')).toBe(false);
    req.flush([]);
  });

  it('list() never sends organizationId or isComplex', () => {
    service.list().subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl);
    expect(req.request.params.has('organizationId')).toBe(false);
    expect(req.request.params.has('isComplex')).toBe(false);
    req.flush([{ _id: 'm1', name: 'Каркас', article: 'MOD-1' }]);
  });

  it('list() maps SilentResult ok on success', () => {
    let result: { ok: boolean; data?: unknown } | undefined;
    service.list().subscribe((res) => {
      result = res;
    });
    httpMock
      .expectOne((r) => r.url === listUrl)
      .flush([{ _id: 'm1', name: 'Каркас', article: 'MOD-1' }]);
    expect(result?.ok).toBe(true);
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

  it('getById() GETs /modules/:id', () => {
    service.getById('507f1f77bcf86cd799439012').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/modules/507f1f77bcf86cd799439012`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('organizationId')).toBe(false);
    req.flush({ _id: '507f1f77bcf86cd799439012', name: 'Каркас', article: 'MOD-1' });
  });
});
