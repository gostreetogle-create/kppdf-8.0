import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiCounterpartiesService } from './pi-counterparties.service';

describe('PiCounterpartiesService (TZ-NX-DEALS-D3-COUNTERPARTIES)', () => {
  let service: PiCounterpartiesService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/counterparties`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    }).compileComponents();

    service = TestBed.inject(PiCounterpartiesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('list() GETs /counterparties with page/limit defaults + optional search/role', () => {
    service.list({ search: 'Альфа', role: 'customer' }).subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl && r.method === 'GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('200');
    expect(req.request.params.get('search')).toBe('Альфа');
    expect(req.request.params.get('role')).toBe('customer');
    req.flush({ items: [], total: 0, page: 1, limit: 200 });
  });

  it('getById() GETs /counterparties/:id', () => {
    service.getById('cp-1').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/counterparties/cp-1`);
    expect(req.request.method).toBe('GET');
    req.flush({ _id: 'cp-1', name: 'ООО Альфа', inn: '7707083893', roles: ['customer'], isActive: true });
  });

  it('create() POSTs the thin payload to /counterparties', () => {
    service.create({ name: 'ООО Альфа', inn: '7707083893', roles: ['customer'] }).subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl && r.method === 'POST');
    expect(req.request.body).toEqual({ name: 'ООО Альфа', inn: '7707083893', roles: ['customer'] });
    req.flush({ _id: 'cp-1', name: 'ООО Альфа', inn: '7707083893', roles: ['customer'], isActive: true });
  });

  it('update() PATCHes /counterparties/:id', () => {
    service.update('cp-1', { phone: '+7 999 000-00-00' }).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/counterparties/cp-1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ phone: '+7 999 000-00-00' });
    req.flush({ _id: 'cp-1', name: 'ООО Альфа', inn: '7707083893', roles: ['customer'], isActive: true });
  });

  it('remove() DELETEs /counterparties/:id', () => {
    service.remove('cp-1').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/counterparties/cp-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
