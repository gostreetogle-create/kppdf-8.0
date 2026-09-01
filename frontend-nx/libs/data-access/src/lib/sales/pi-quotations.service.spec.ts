import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiQuotationsService } from './pi-quotations.service';

describe('PiQuotationsService (TZ-NX-SALES-PI-QUOTATIONS-CRUD)', () => {
  let service: PiQuotationsService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/quotations`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    }).compileComponents();

    service = TestBed.inject(PiQuotationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('create() POSTs /quotations', () => {
    const payload = {
      organizationId: '507f1f77bcf86cd799439011',
      counterpartyId: '507f1f77bcf86cd799439012',
      status: 'draft' as const,
      items: [{ quantity: 1, unitPrice: 100 }],
    };
    service.create(payload).subscribe();
    const req = httpMock.expectOne(listUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ _id: '507f1f77bcf86cd799439013', number: 'KP-001' });
  });

  it('update() PATCHes /quotations/:id', () => {
    const payload = { status: 'sent' as const };
    service.update('507f1f77bcf86cd799439013', payload).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/quotations/507f1f77bcf86cd799439013`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush({ _id: '507f1f77bcf86cd799439013', number: 'KP-001' });
  });
});
