import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiStorageItemsService } from './pi-storage-items.service';

describe('PiStorageItemsService (NX W2)', () => {
  let service: PiStorageItemsService;
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
    service = TestBed.inject(PiStorageItemsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists balances with warehouse, material, and low-stock params', () => {
    service
      .list({
        warehouseId: 'w1',
        materialId: 'm1',
        productId: 'p1',
        lowStock: true,
      })
      .subscribe();

    const request = httpMock.expectOne(
      (req) => req.url === `${baseUrl}/storage-items`,
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('warehouseId')).toBe('w1');
    expect(request.request.params.get('materialId')).toBe('m1');
    expect(request.request.params.get('productId')).toBe('p1');
    expect(request.request.params.get('lowStock')).toBe('true');
    request.flush({ items: [], total: 0 });
  });

  it('creates a material storage item through the existing endpoint', () => {
    const payload = {
      warehouseId: 'w1',
      quantity: 12,
      minQuantity: 5,
      zoneName: 'A-01',
    };
    service.createForMaterial('m1', payload).subscribe();

    const request = httpMock.expectOne(`${baseUrl}/materials/m1/storage-items`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({
      _id: 'si1',
      warehouseId: 'w1',
      materialId: 'm1',
      quantity: 12,
      reservedQty: 0,
      minQuantity: 5,
      isActive: true,
    });
  });

  it('posts a signed adjustment through the existing endpoint', () => {
    const payload = { delta: -2, reason: 'Инвентаризация' };
    service.adjust('si1', payload).subscribe();

    const request = httpMock.expectOne(`${baseUrl}/storage-items/si1/adjust`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({
      _id: 'si1',
      warehouseId: 'w1',
      materialId: 'm1',
      quantity: 10,
      reservedQty: 1,
      minQuantity: 5,
      isActive: true,
    });
  });
});
