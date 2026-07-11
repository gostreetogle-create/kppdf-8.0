import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { ProductModulesService } from './pi-product-modules.service';

/**
 * TZ-83 Phase E.2: ProductModulesService smoke tests.
 * Verifies CRUD endpoints + atomic attach/detach helpers (TZ-83 § D.3).
 */
describe('ProductModulesService', () => {
  let svc: ProductModulesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        ProductModulesService,
      ],
    });
    svc = TestBed.inject(ProductModulesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list(productId) forwards ?productId as query param', () => {
    svc.list('prod123').subscribe();
    const req = httpMock.expectOne((r) => r.url === 'http://test/api/product-modules');
    expect(req.request.params.get('productId')).toBe('prod123');
    req.flush([]);
  });

  it('findById() GETs /product-modules/:id', () => {
    svc.findById('mod1').subscribe((res) => {
      if (res.ok) expect(res.data.name).toBe('Module A');
    });
    const req = httpMock.expectOne('http://test/api/product-modules/mod1');
    req.flush({ _id: 'mod1', name: 'Module A', materials: [], workTypes: [] });
  });

  it('attachToProduct POSTs { moduleId } to /products/:id/modules', () => {
    svc.attachToProduct('prod1', 'mod1').subscribe();
    const req = httpMock.expectOne('http://test/api/products/prod1/modules');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ moduleId: 'mod1' });
    req.flush({ ok: true });
  });

  it('detachFromProduct DELETEs /products/:id/modules/:moduleId', () => {
    svc.detachFromProduct('prod1', 'mod1').subscribe();
    const req = httpMock.expectOne('http://test/api/products/prod1/modules/mod1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
