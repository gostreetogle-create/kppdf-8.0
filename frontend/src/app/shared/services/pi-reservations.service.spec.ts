import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { ReservationsService } from './pi-reservations.service';

describe('ReservationsService (HUB-304)', () => {
  let svc: ReservationsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        ReservationsService,
      ],
    });
    svc = TestBed.inject(ReservationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() without orderId GETs /reservations', () => {
    svc.list().subscribe((res) => {
      if (res.ok) expect(res.data).toEqual([]);
    });
    const req = httpMock.expectOne(
      (r) =>
        r.url === 'http://test/api/reservations' && r.method === 'GET' && !r.params.has('orderId'),
    );
    req.flush([]);
  });

  it('list(orderNumber) GETs /reservations?orderId=<Order.number>', () => {
    svc.list('ORD-001').subscribe((res) => {
      if (res.ok) {
        expect(res.data).toEqual([
          {
            _id: 'r1',
            orderId: 'ORD-001',
            productId: 'p1',
            warehouseId: 'w1',
            qty: 2,
            status: 'active',
          },
        ]);
      }
    });
    const req = httpMock.expectOne(
      (r) =>
        r.url === 'http://test/api/reservations' &&
        r.method === 'GET' &&
        r.params.get('orderId') === 'ORD-001',
    );
    req.flush([
      {
        _id: 'r1',
        orderId: 'ORD-001',
        productId: 'p1',
        warehouseId: 'w1',
        qty: 2,
        status: 'active',
      },
    ]);
  });
});
