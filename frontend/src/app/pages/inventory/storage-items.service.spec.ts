import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { StorageItemsService } from './storage-items.service';

describe('StorageItemsService', () => {
  let svc: StorageItemsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        StorageItemsService,
      ],
    });
    svc = TestBed.inject(StorageItemsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() GETs /api/storage-items and returns envelope', () => {
    svc.list().subscribe((res) => {
      if (res.ok) {
        expect(res.data.items.length).toBe(2);
        expect(res.data.total).toBe(2);
      }
    });
    const req = httpMock.expectOne('http://test/api/storage-items');
    expect(req.request.method).toBe('GET');
    req.flush({
      items: [
        {
          _id: 'si1',
          quantity: 100,
          reservedQty: 0,
          minQuantity: 10,
          isActive: true,
          warehouseId: 'w1',
          productId: 'p1',
        },
        {
          _id: 'si2',
          quantity: 50,
          reservedQty: 10,
          minQuantity: 20,
          isActive: true,
          warehouseId: 'w1',
          productId: 'p2',
        },
      ],
      total: 2,
    });
  });

  it('list({warehouseId}) passes warehouseId param', () => {
    svc.list({ warehouseId: 'w1' }).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === 'http://test/api/storage-items' && r.method === 'GET',
    );
    expect(req.request.params.get('warehouseId')).toBe('w1');
    req.flush({ items: [], total: 0 });
  });

  it('findById() GETs /api/storage-items/:id', () => {
    svc.findById('si1').subscribe((res) => {
      if (res.ok) expect(res.data.quantity).toBe(100);
    });
    const req = httpMock.expectOne('http://test/api/storage-items/si1');
    expect(req.request.method).toBe('GET');
    req.flush({
      _id: 'si1',
      quantity: 100,
      reservedQty: 0,
      minQuantity: 10,
      isActive: true,
      warehouseId: 'w1',
      productId: 'p1',
    });
  });

  it('remove() DELETEs /api/storage-items/:id', () => {
    svc.remove('si1').subscribe((res) => {
      if (res.ok) expect(res.data).toBeUndefined();
    });
    const req = httpMock.expectOne('http://test/api/storage-items/si1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
