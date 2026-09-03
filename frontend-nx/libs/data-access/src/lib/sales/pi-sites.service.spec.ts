import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiSitesService } from './pi-sites.service';

describe('PiSitesService (TZ-NX-SALES-S32-SITES-ENSURE)', () => {
  let service: PiSitesService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const counterpartyId = '507f1f77bcf86cd799439011';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    }).compileComponents();

    service = TestBed.inject(PiSitesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('list() GETs sites for the selected counterparty', () => {
    service.list(counterpartyId).subscribe();

    const request = httpMock.expectOne((req) => req.url === `${baseUrl}/sites`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('counterpartyId')).toBe(counterpartyId);
    request.flush([
      { _id: 'site-1', counterpartyId, name: 'Цех', address: 'ул. 1' },
    ]);
  });

  it('ensureDefault() POSTs the counterparty id to the existing endpoint', () => {
    service.ensureDefault(counterpartyId).subscribe();

    const request = httpMock.expectOne(`${baseUrl}/sites/ensure-default`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ counterpartyId });
    request.flush({
      _id: 'site-1',
      counterpartyId,
      name: 'Объект по умолчанию',
      address: 'Адрес не указан',
    });
  });
});
