import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { StockMovementsService } from './stock-movements.service';

describe('StockMovementsService', () => {
  let svc: StockMovementsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        StockMovementsService,
      ],
    });
    svc = TestBed.inject(StockMovementsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() GETs /api/stock-movements and returns envelope', () => {
    svc.list().subscribe((res) => {
      if (res.ok) {
        expect(res.data.items.length).toBe(2);
        expect(res.data.total).toBe(2);
      }
    });
    const req = httpMock.expectOne('http://test/api/stock-movements');
    expect(req.request.method).toBe('GET');
    req.flush({
      items: [
        { _id: 'sm1', type: 'in', qty: 10, date: '2026-01-01', productId: 'p1', warehouseId: 'w1' },
        { _id: 'sm2', type: 'out', qty: 5, date: '2026-01-02', productId: 'p1', warehouseId: 'w1' },
      ],
      total: 2,
    });
  });

  it('list({type}) passes type param', () => {
    svc.list({ type: 'in' }).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === 'http://test/api/stock-movements' && r.method === 'GET',
    );
    expect(req.request.params.get('type')).toBe('in');
    req.flush({ items: [], total: 0 });
  });

  it('create() POSTs body and returns movement', () => {
    svc.create({ type: 'in', qty: 10, productId: 'p1', warehouseId: 'w1' }).subscribe((res) => {
      if (res.ok) expect(res.data.type).toBe('in');
    });
    const req = httpMock.expectOne('http://test/api/stock-movements');
    expect(req.request.method).toBe('POST');
    req.flush({
      _id: 'sm3',
      type: 'in',
      qty: 10,
      productId: 'p1',
      warehouseId: 'w1',
      date: '2026-01-03',
    });
  });

  it('remove() DELETEs /api/stock-movements/:id', () => {
    svc.remove('sm1').subscribe((res) => {
      if (res.ok) expect(res.data).toBeUndefined();
    });
    const req = httpMock.expectOne('http://test/api/stock-movements/sm1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
