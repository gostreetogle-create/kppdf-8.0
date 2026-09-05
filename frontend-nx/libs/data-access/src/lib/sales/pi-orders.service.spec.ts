import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiOrdersService } from './pi-orders.service';

describe('PiOrdersService (TZ-NX-SALES-S33-PI-ORDERS-CRUD)', () => {
  let service: PiOrdersService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const orderId = '507f1f77bcf86cd799439011';
  const counterpartyId = '507f1f77bcf86cd799439012';
  const siteId = '507f1f77bcf86cd799439013';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    }).compileComponents();

    service = TestBed.inject(PiOrdersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('list() GETs /orders', () => {
    service.list().subscribe();
    const request = httpMock.expectOne(`${baseUrl}/orders`);
    expect(request.request.method).toBe('GET');
    request.flush([{ _id: orderId, number: 'ORD-001' }]);
  });

  it('getById() GETs /orders/:id', () => {
    service.getById(orderId).subscribe();
    const request = httpMock.expectOne(`${baseUrl}/orders/${orderId}`);
    expect(request.request.method).toBe('GET');
    request.flush({ _id: orderId, number: 'ORD-001', status: 'draft' });
  });

  it('create() POSTs a direct-order payload with site and payment fields', () => {
    const payload = {
      counterpartyId,
      siteId,
      organizationId: '507f1f77bcf86cd799439014',
      isPaid: true,
      items: [{ productId: '507f1f77bcf86cd799439015', quantity: 2 }],
    };
    service.create(payload).subscribe();
    const request = httpMock.expectOne(`${baseUrl}/orders`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ _id: orderId, number: 'ORD-001', isPaid: true });
  });

  it('update() PATCHes /orders/:id', () => {
    const payload = { isPaid: false, notes: 'Уточнить дату' };
    service.update(orderId, payload).subscribe();
    const request = httpMock.expectOne(`${baseUrl}/orders/${orderId}`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    request.flush({ _id: orderId, number: 'ORD-001', isPaid: false });
  });

  it('patchEstimateDays() PATCHes /orders/:id/estimate-days (TZ-NX-GANTT-G2)', () => {
    const payload = {
      orderItemIndex: 0,
      moduleId: '507f1f77bcf86cd799439020',
      workTypeId: '507f1f77bcf86cd799439021',
      days: 3,
    };
    service.patchEstimateDays(orderId, payload).subscribe();
    const request = httpMock.expectOne(`${baseUrl}/orders/${orderId}/estimate-days`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    request.flush({ _id: orderId, number: 'ORD-001' });
  });

  it('patchEstimateStart() PATCHes /orders/:id/estimate-start (TZ-NX-GANTT-G2)', () => {
    const payload = {
      orderItemIndex: 1,
      moduleId: '507f1f77bcf86cd799439022',
      workTypeId: '507f1f77bcf86cd799439023',
      offsetDays: 4,
    };
    service.patchEstimateStart(orderId, payload).subscribe();
    const request = httpMock.expectOne(`${baseUrl}/orders/${orderId}/estimate-start`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    request.flush({ _id: orderId, number: 'ORD-001' });
  });

  it('patchEstimateWorker() PATCHes /orders/:id/estimate-worker (TZ-NX-GANTT-G14)', () => {
    const payload = {
      orderItemIndex: 0,
      moduleId: '507f1f77bcf86cd799439020',
      workTypeId: '507f1f77bcf86cd799439021',
      workerIds: ['507f1f77bcf86cd799439024', '507f1f77bcf86cd799439025'],
    };
    service.patchEstimateWorker(orderId, payload).subscribe();
    const request = httpMock.expectOne(`${baseUrl}/orders/${orderId}/estimate-worker`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    request.flush({ _id: orderId, number: 'ORD-001' });
  });
});
