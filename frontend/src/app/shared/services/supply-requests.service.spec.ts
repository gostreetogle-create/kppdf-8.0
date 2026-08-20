import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { SupplyRequestsService } from './supply-requests.service';

describe('SupplyRequestsService (TZ-SUPPLY-311)', () => {
  let service: SupplyRequestsService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/supply-requests`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    }).compileComponents();

    service = TestBed.inject(SupplyRequestsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('list() builds /supply-requests with status/priority/search params', () => {
    service
      .list({ status: 'ordered', priority: 'urgent', search: 'фреза', orderId: 'order-1' })
      .subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl && r.method === 'GET');
    expect(req.request.params.get('status')).toBe('ordered');
    expect(req.request.params.get('priority')).toBe('urgent');
    expect(req.request.params.get('search')).toBe('фреза');
    expect(req.request.params.get('orderId')).toBe('order-1');
    req.flush([]);
  });

  it('list() omits empty filters', () => {
    service.list({}).subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl && r.method === 'GET');
    expect(req.request.params.has('status')).toBe(false);
    expect(req.request.params.has('priority')).toBe(false);
    expect(req.request.params.has('search')).toBe(false);
    expect(req.request.params.has('orderId')).toBe(false);
    req.flush([]);
  });

  it('create() POSTs the payload to /supply-requests', () => {
    const payload = { title: 'Труба 40×40', qty: 2, status: 'in_progress' as const };
    service.create(payload).subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl && r.method === 'POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ _id: 'sr-1', ...payload });
  });

  it('update() PATCHes the row', () => {
    service.update('sr-1', { color: 'чёрный', notes: 'срочно' }).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${listUrl}/sr-1` && r.method === 'PATCH');
    expect(req.request.body).toEqual({ color: 'чёрный', notes: 'срочно' });
    req.flush({ _id: 'sr-1' });
  });

  it('status actions hit the sub-resources', () => {
    const cases: Array<[keyof SupplyRequestsService, string, string]> = [
      ['markOrdered', '/ordered', 'ordered'],
      ['markReceived', '/received', 'received'],
      ['cancel', '/cancel', 'cancelled'],
    ];
    for (const [method, suffix, status] of cases) {
      (service[method] as (id: string) => ReturnType<SupplyRequestsService['markOrdered']>)(
        'sr-1',
      ).subscribe();
      const req = httpMock.expectOne(
        (r) => r.url === `${listUrl}/sr-1${suffix}` && r.method === 'POST',
      );
      req.flush({ _id: 'sr-1', status });
    }
  });

  it('remove() DELETEs the row', () => {
    service.remove('sr-1').subscribe();
    const req = httpMock.expectOne((r) => r.url === `${listUrl}/sr-1` && r.method === 'DELETE');
    req.flush(null);
  });
});
