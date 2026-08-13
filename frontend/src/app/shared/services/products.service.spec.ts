import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { ProductsService } from './products.service';

describe('ProductsService (TZ-CATALOG-371)', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
      ],
    });
    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('duplicate POSTs only whitelisted identity overrides', () => {
    service.duplicate('product-1', { name: 'Новая копия', sku: 'SKU-COPY' }).subscribe();

    const req = httpMock.expectOne('http://test/api/products/product-1/duplicate');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Новая копия', sku: 'SKU-COPY' });
    req.flush({ _id: 'product-2', sku: 'SKU-COPY', __v: 0, copiedFromProductId: 'product-1' });
  });

  it('update carries expectedVersion for an explicit conflict-safe decision', () => {
    service.update('product-1', { description: 'Вариант', expectedVersion: 7 }).subscribe();

    const req = httpMock.expectOne('http://test/api/products/product-1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ description: 'Вариант', expectedVersion: 7 });
    req.flush({ _id: 'product-1', description: 'Вариант', __v: 8 });
  });
});
