import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiContractsService } from './pi-contracts.service';

describe('PiContractsService (TZ-NX-DEALS-D4-CONTRACTS-THIN)', () => {
  let service: PiContractsService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/contracts`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    }).compileComponents();

    service = TestBed.inject(PiContractsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('list() GETs /contracts with only the provided filters', () => {
    service.list({ status: 'active', counterpartyId: 'cp-1' }).subscribe();
    const req = httpMock.expectOne((r) => r.url === listUrl && r.method === 'GET');
    expect(req.request.params.get('status')).toBe('active');
    expect(req.request.params.get('counterpartyId')).toBe('cp-1');
    expect(req.request.params.has('from')).toBe(false);
    expect(req.request.params.has('to')).toBe(false);
    req.flush([]);
  });

  it('list() without params sends no filters', () => {
    service.list().subscribe();
    const req = httpMock.expectOne(listUrl);
    expect(req.request.params.keys().length).toBe(0);
    req.flush([]);
  });

  it('getById() GETs /contracts/:id', () => {
    service.getById('c-1').subscribe();
    const req = httpMock.expectOne(`${baseUrl}/contracts/c-1`);
    expect(req.request.method).toBe('GET');
    req.flush({ _id: 'c-1', number: 'DOG-001', status: 'draft', contractStatus: 'none', items: [], totalAmount: 0 });
  });
});
