import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { ProductModulePhotosService } from './pi-product-module-photos.service';

/**
 * TZ-83 Phase E.2: ProductModulePhotoService smoke tests.
 * Verifies module-gallery CRUD + atomic setMain endpoint.
 */
describe('ProductModulePhotosService', () => {
  let svc: ProductModulePhotosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        ProductModulePhotosService,
      ],
    });
    svc = TestBed.inject(ProductModulePhotosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list(productModuleId) forwards productModuleId query', () => {
    svc.list('mod1').subscribe();
    const req = httpMock.expectOne(
      (r) =>
        r.url === 'http://test/api/product-module-photos' &&
        r.params.get('productModuleId') === 'mod1',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('attach() POSTs DTO as-is', () => {
    svc
      .attach({
        productModuleId: 'mod1',
        url: 'https://x.test/p.jpg',
        sortOrder: 1,
        isMain: true,
      })
      .subscribe();
    const req = httpMock.expectOne('http://test/api/product-module-photos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      productModuleId: 'mod1',
      url: 'https://x.test/p.jpg',
      sortOrder: 1,
      isMain: true,
    });
    req.flush({ _id: 'p1' });
  });

  it('setMain POSTs to /:id/main (atomic endpoint, no body)', () => {
    svc.setMain('photo1').subscribe((res) => {
      if (res.ok) expect(res.data.ok).toBe(true);
    });
    const req = httpMock.expectOne('http://test/api/product-module-photos/photo1/main');
    expect(req.request.method).toBe('POST');
    req.flush({ ok: true });
  });

  it("update() PATCHes /:id (server strips isMain, client also doesn't send it)", () => {
    svc.update('photo1', { caption: 'новое', sortOrder: 5 }).subscribe();
    const req = httpMock.expectOne('http://test/api/product-module-photos/photo1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ caption: 'новое', sortOrder: 5 });
    req.flush({ _id: 'photo1' });
  });
});
