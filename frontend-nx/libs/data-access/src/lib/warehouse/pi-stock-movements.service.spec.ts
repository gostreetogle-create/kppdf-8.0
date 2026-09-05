import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiStockMovementsService } from './pi-stock-movements.service';

describe('PiStockMovementsService (NX W3)', () => {
  let service: PiStockMovementsService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    });
    service = TestBed.inject(PiStockMovementsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists movements with type and warehouse filters', () => {
    service.list({ type: 'in', warehouseId: 'w1' }).subscribe();

    const request = httpMock.expectOne(
      (req) => req.url === `${baseUrl}/stock-movements`,
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('type')).toBe('in');
    expect(request.request.params.get('warehouseId')).toBe('w1');
    request.flush({ items: [], total: 0 });
  });

  it('posts a material receipt with documentRef and orderId', () => {
    const payload = {
      type: 'in' as const,
      warehouseId: 'w1',
      materialId: 'm1',
      qty: 12,
      documentRef: 'Накладная 42',
      orderId: 'order-1',
    };
    service.create(payload).subscribe();

    const request = httpMock.expectOne(`${baseUrl}/stock-movements`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({
      _id: 'sm1',
      type: 'in',
      warehouseId: 'w1',
      materialId: 'm1',
      qty: 12,
      date: '2026-09-05T10:00:00.000Z',
    });
  });

  it('posts a product expense without a material target', () => {
    const payload = {
      type: 'out' as const,
      warehouseId: 'w1',
      productId: 'p1',
      qty: 2,
    };
    service.create(payload).subscribe();

    const request = httpMock.expectOne(`${baseUrl}/stock-movements`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({
      _id: 'sm2',
      type: 'out',
      warehouseId: 'w1',
      productId: 'p1',
      qty: 2,
      date: '2026-09-05T11:00:00.000Z',
    });
  });
});
