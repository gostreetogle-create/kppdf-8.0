import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiShipmentsService } from './pi-shipments.service';

describe('PiShipmentsService (TZ-NX-SHIP-S0)', () => {
  let service: PiShipmentsService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const shipmentId = '507f1f77bcf86cd799439040';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    });
    service = TestBed.inject(PiShipmentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() GETs /shipments with orderId/status/date params', () => {
    service.list({ orderId: 'order-1', status: 'scheduled', date: '2026-09-08' }).subscribe();

    const request = httpMock.expectOne((req) => req.url === `${baseUrl}/shipments`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('orderId')).toBe('order-1');
    expect(request.request.params.get('status')).toBe('scheduled');
    expect(request.request.params.get('date')).toBe('2026-09-08');
    request.flush([]);
  });

  it('list() omits empty filters', () => {
    service.list().subscribe();

    const request = httpMock.expectOne(`${baseUrl}/shipments`);
    expect(request.request.params.keys().length).toBe(0);
    request.flush([]);
  });

  it('findById() GETs /shipments/:id', () => {
    service.findById(shipmentId).subscribe();
    const request = httpMock.expectOne(`${baseUrl}/shipments/${shipmentId}`);
    expect(request.request.method).toBe('GET');
    request.flush({ _id: shipmentId, number: 'SHIP-001' });
  });

  it('update() PATCHes /shipments/:id', () => {
    const payload = { recipient: 'Иванов И.И.', notes: 'Уточнить адрес' };
    service.update(shipmentId, payload).subscribe();
    const request = httpMock.expectOne(`${baseUrl}/shipments/${shipmentId}`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    request.flush({ _id: shipmentId, number: 'SHIP-001' });
  });

  it('dispatch() POSTs /shipments/:id/dispatch with empty body', () => {
    service.dispatch(shipmentId).subscribe();
    const request = httpMock.expectOne(`${baseUrl}/shipments/${shipmentId}/dispatch`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    request.flush({ _id: shipmentId, status: 'in_transit' });
  });

  it('cancelShipment() POSTs /shipments/:id/cancel-shipment (TZ-SHIP-433)', () => {
    service.cancelShipment(shipmentId).subscribe();
    const request = httpMock.expectOne(`${baseUrl}/shipments/${shipmentId}/cancel-shipment`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    request.flush({ _id: shipmentId, status: 'cancelled' });
  });

  it('addDoc() POSTs /shipments/:id/add-doc', () => {
    const payload = { type: 'ttn', totalAmount: 15000, number: 'ТТН-1' };
    service.addDoc(shipmentId, payload).subscribe();
    const request = httpMock.expectOne(`${baseUrl}/shipments/${shipmentId}/add-doc`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ _id: shipmentId, docs: [payload] });
  });

  it('remove() DELETEs /shipments/:id', () => {
    service.remove(shipmentId).subscribe();
    const request = httpMock.expectOne(`${baseUrl}/shipments/${shipmentId}`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
