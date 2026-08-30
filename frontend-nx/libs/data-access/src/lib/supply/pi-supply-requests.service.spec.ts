import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiSupplyRequestsService } from './pi-supply-requests.service';

describe('PiSupplyRequestsService (TZ-NX-SUPPLY-REQUEST-REGISTRY-READ)', () => {
  let service: PiSupplyRequestsService;
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

    service = TestBed.inject(PiSupplyRequestsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('list() GETs /supply-requests with status/priority/search/orderId only', () => {
    service
      .list({
        status: 'ordered',
        priority: 'urgent',
        search: 'болт',
        orderId: '507f1f77bcf86cd799439011',
      })
      .subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl && r.method === 'GET');
    expect(req.request.params.get('status')).toBe('ordered');
    expect(req.request.params.get('priority')).toBe('urgent');
    expect(req.request.params.get('search')).toBe('болт');
    expect(req.request.params.get('orderId')).toBe('507f1f77bcf86cd799439011');
    expect(req.request.params.has('page')).toBe(false);
    expect(req.request.params.has('limit')).toBe(false);
    req.flush([]);
  });

  it('list() never sends organizationId', () => {
    service.list().subscribe();
    const req = httpMock.expectOne(listUrl);
    expect(req.request.params.has('organizationId')).toBe(false);
    req.flush([]);
  });

  it('getById() GETs /supply-requests/:id', () => {
    service.getById('507f1f77bcf86cd799439012').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/supply-requests/507f1f77bcf86cd799439012`);
    expect(req.request.method).toBe('GET');
    req.flush({ _id: '507f1f77bcf86cd799439012', qty: 1, status: 'in_progress', priority: 'normal' });
  });

  it('list() maps SilentResult error without throwing', () => {
    let result: { ok: boolean; error?: HttpErrorResponse } | undefined;
    service.list().subscribe((res) => {
      result = res;
    });
    httpMock.expectOne(listUrl).flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    expect(result?.ok).toBe(false);
    expect(result?.error?.status).toBe(403);
  });
});
