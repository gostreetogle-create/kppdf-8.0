import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiReservationsService } from './pi-reservations.service';

describe('PiReservationsService (TZ-NX-DEALS-D2)', () => {
  let service: PiReservationsService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/reservations`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    }).compileComponents();

    service = TestBed.inject(PiReservationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('list() GETs /reservations with orderId (Order.number, not _id)', () => {
    service.list({ orderId: 'ORD-001' }).subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl && r.method === 'GET');
    expect(req.request.params.get('orderId')).toBe('ORD-001');
    req.flush([]);
  });

  it('list() without params sends no orderId filter', () => {
    service.list().subscribe();
    const req = httpMock.expectOne(listUrl);
    expect(req.request.params.has('orderId')).toBe(false);
    req.flush([]);
  });

  it('list() maps SilentResult error without throwing', () => {
    let result: { ok: boolean; error?: HttpErrorResponse } | undefined;
    service.list({ orderId: 'ORD-001' }).subscribe((res) => {
      result = res;
    });
    httpMock
      .expectOne((r) => r.url === listUrl && r.method === 'GET')
      .flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    expect(result?.ok).toBe(false);
    expect(result?.error?.status).toBe(403);
  });
});
