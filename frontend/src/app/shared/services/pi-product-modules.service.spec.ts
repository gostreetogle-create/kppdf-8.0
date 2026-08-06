import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  isValidProductUnitPriceOverride,
  ProductModulesService,
} from './pi-product-modules.service';

/**
 * TZ-83 Phase E.2 + TZ-CATALOG-317: ProductModulesService smoke tests.
 * Verifies CRUD endpoints + composition CRUD (TZ-CATALOG-302/317) and the
 * deprecated throwing stubs of legacy attach/detach.
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
    const req = httpMock.expectOne((r) => r.url === 'http://test/api/modules');
    expect(req.request.params.get('productId')).toBe('prod123');
    req.flush([]);
  });

  it('findById() GETs /modules/:id', () => {
    svc.findById('mod1').subscribe((res) => {
      if (res.ok) expect(res.data.name).toBe('Module A');
    });
    const req = httpMock.expectOne('http://test/api/modules/mod1');
    req.flush({ _id: 'mod1', name: 'Module A', materials: [], workTypes: [] });
  });

  it('attachToProduct is deprecated and THROWS (TZ-CATALOG-317)', () => {
    expect(() => svc.attachToProduct('prod1', 'mod1')).toThrow(/attachToProduct is deprecated/);
  });

  it('detachFromProduct is deprecated and THROWS (TZ-CATALOG-317)', () => {
    expect(() => svc.detachFromProduct('prod1', 'mod1')).toThrow(/detachFromProduct is deprecated/);
  });

  it('getProductComposition GETs /products/:id/composition', () => {
    svc.getProductComposition('prod1').subscribe((res) => {
      if (res.ok) expect(res.data.length).toBe(1);
    });
    const req = httpMock.expectOne('http://test/api/products/prod1/composition');
    expect(req.request.method).toBe('GET');
    req.flush([{ _id: 'l1', lineType: 'module', refId: 'mod1', quantity: 2, sortOrder: 0 }]);
  });

  it('addProductCompositionLine POSTs line to /products/:id/composition', () => {
    svc
      .addProductCompositionLine('prod1', {
        lineType: 'module',
        refId: 'mod1',
        quantity: 2,
      })
      .subscribe();
    const req = httpMock.expectOne('http://test/api/products/prod1/composition');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ lineType: 'module', refId: 'mod1', quantity: 2 });
    req.flush([]);
  });

  it('accepts only finite non-negative product unit price overrides', () => {
    expect(isValidProductUnitPriceOverride(undefined)).toBe(true);
    expect(isValidProductUnitPriceOverride(0)).toBe(true);
    expect(isValidProductUnitPriceOverride(1250)).toBe(true);
    expect(isValidProductUnitPriceOverride(-1)).toBe(false);
    expect(isValidProductUnitPriceOverride(Number.NaN)).toBe(false);
  });

  it('rejects invalid product price overrides before sending HTTP', () => {
    expect(() =>
      svc.addProductCompositionLine('prod1', {
        lineType: 'product',
        refId: 'child-product',
        quantity: 1,
        unitPriceOverride: -1,
      }),
    ).toThrow(/unitPriceOverride/);
    expect(() =>
      svc.updateProductCompositionLine('prod1', 'line-1', {
        quantity: 1,
        unitPriceOverride: -1,
      }),
    ).toThrow(/unitPriceOverride/);
  });

  it('addProductCompositionLine supports product lines and unit price override', () => {
    svc
      .addProductCompositionLine('prod1', {
        lineType: 'product',
        refId: 'child-product',
        quantity: 2,
        unitPriceOverride: 1250,
      })
      .subscribe();
    const req = httpMock.expectOne('http://test/api/products/prod1/composition');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      lineType: 'product',
      refId: 'child-product',
      quantity: 2,
      unitPriceOverride: 1250,
    });
    req.flush([]);
  });

  it('updateProductCompositionLine PATCHes /products/:id/composition/:lineId', () => {
    svc.updateProductCompositionLine('prod1', 'l1', { quantity: 3 }).subscribe();
    const req = httpMock.expectOne('http://test/api/products/prod1/composition/l1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ quantity: 3 });
    req.flush([]);
  });

  it('removeProductCompositionLine DELETEs /products/:id/composition/:lineId', () => {
    svc.removeProductCompositionLine('prod1', 'l1').subscribe();
    const req = httpMock.expectOne('http://test/api/products/prod1/composition/l1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('module composition: add/remove routes go to /modules/:id/composition', () => {
    svc
      .addModuleCompositionLine('mod1', { lineType: 'material', refId: 'mat1', quantity: 1 })
      .subscribe();
    const post = httpMock.expectOne('http://test/api/modules/mod1/composition');
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({ lineType: 'material', refId: 'mat1', quantity: 1 });
    post.flush([]);

    svc.removeModuleCompositionLine('mod1', 'l9').subscribe();
    const del = httpMock.expectOne('http://test/api/modules/mod1/composition/l9');
    expect(del.request.method).toBe('DELETE');
    del.flush(null, { status: 204, statusText: 'No Content' });
  });
});
