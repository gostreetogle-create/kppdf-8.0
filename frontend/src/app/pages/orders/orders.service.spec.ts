import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let svc: OrdersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        OrdersService,
      ],
    });
    svc = TestBed.inject(OrdersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() GETs /api/orders and returns flat array', () => {
    svc.list().subscribe((res) => {
      if (res.ok) {
        expect(res.data.length).toBe(2);
        expect(res.data[0].number).toBe('ORD-001');
      }
    });
    const req = httpMock.expectOne('http://test/api/orders');
    expect(req.request.method).toBe('GET');
    req.flush([
      { _id: 'o1', number: 'ORD-001', status: 'draft', items: [] },
      { _id: 'o2', number: 'ORD-002', status: 'confirmed', items: [] },
    ]);
  });

  it('findById() GETs /api/orders/:id', () => {
    svc.findById('o1').subscribe((res) => {
      if (res.ok) expect(res.data.number).toBe('ORD-001');
    });
    const req = httpMock.expectOne('http://test/api/orders/o1');
    expect(req.request.method).toBe('GET');
    req.flush({ _id: 'o1', number: 'ORD-001', status: 'draft', items: [] });
  });

  it('create() POSTs body and returns order', () => {
    svc.create({ number: 'ORD-003', status: 'draft' } as never).subscribe((res) => {
      if (res.ok) expect(res.data.number).toBe('ORD-003');
    });
    const req = httpMock.expectOne('http://test/api/orders');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ number: 'ORD-003', status: 'draft' });
    req.flush({ _id: 'o3', number: 'ORD-003', status: 'draft', items: [] });
  });

  it('update() PATCHes /api/orders/:id', () => {
    svc.update('o1', { status: 'confirmed' }).subscribe((res) => {
      if (res.ok) expect(res.data.status).toBe('confirmed');
    });
    const req = httpMock.expectOne('http://test/api/orders/o1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'confirmed' });
    req.flush({ _id: 'o1', number: 'ORD-001', status: 'confirmed', items: [] });
  });

  it('remove() DELETEs /api/orders/:id', () => {
    svc.remove('o1').subscribe((res) => {
      if (res.ok) expect(res.data).toBeUndefined();
    });
    const req = httpMock.expectOne('http://test/api/orders/o1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
