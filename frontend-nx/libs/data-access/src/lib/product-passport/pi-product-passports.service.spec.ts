import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiProductPassportsService } from './pi-product-passports.service';

describe('PiProductPassportsService (TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ)', () => {
  let service: PiProductPassportsService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/passports`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    }).compileComponents();

    service = TestBed.inject(PiProductPassportsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('list() GETs /passports without pagination params', () => {
    service.list().subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl && r.method === 'GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush([]);
  });

  it('list() passes productId when scoped', () => {
    service.list({ productId: '507f1f77bcf86cd799439011' }).subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl);
    expect(req.request.params.get('productId')).toBe('507f1f77bcf86cd799439011');
    expect(req.request.params.has('page')).toBe(false);
    req.flush([]);
  });

  it('getById() GETs /passports/:id', () => {
    service.getById('507f1f77bcf86cd799439012').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/passports/507f1f77bcf86cd799439012`);
    req.flush({
      _id: '507f1f77bcf86cd799439012',
      productId: '507f1f77bcf86cd799439011',
      passportNumber: 'P-1',
      isActive: true,
    });
  });

  it('getByProductId() GETs /products/:id/passport', () => {
    service.getByProductId('507f1f77bcf86cd799439011').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/products/507f1f77bcf86cd799439011/passport`);
    req.flush({
      _id: '507f1f77bcf86cd799439012',
      productId: '507f1f77bcf86cd799439011',
      passportNumber: 'P-1',
      isActive: true,
    });
  });
});
