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

  it('convertToOrder() POSTs /quotations/:id/convert-to-order and returns the orderId', (done) => {
    service.convertToOrder('507f1f77bcf86cd799439013').subscribe((result) => {
      expect(result).toEqual({ ok: true, data: { orderId: '507f1f77bcf86cd799439099' } });
      done();
    });
    const req = httpMock.expectOne(`${baseUrl}/quotations/507f1f77bcf86cd799439013/convert-to-order`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush({ orderId: '507f1f77bcf86cd799439099' });
  });

  describe('KP family (TZ-NX-KP-FAMILY-S41-API-CLIENT)', () => {
    const id = '507f1f77bcf86cd799439013';
    const family = {
      master: {
        id,
        number: 'KP-001',
        organizationId: '507f1f77bcf86cd799439021',
        familyRole: 'master',
        familyVersion: 1,
        total: 1000,
        status: 'draft',
      },
      variants: [],
      familyVersion: 1,
    };

    it('getFamily() GETs /quotations/:id/family', (done) => {
      service.getFamily(id).subscribe((result) => {
        expect(result).toEqual({ ok: true, data: family });
        done();
      });
      const req = httpMock.expectOne(`${baseUrl}/quotations/${id}/family`);
      expect(req.request.method).toBe('GET');
      req.flush(family);
    });

    it('attachOrganizations() POSTs the attach payload to …/family/attach-organizations', (done) => {
      const payload = {
        items: [{ organizationId: '507f1f77bcf86cd799439022', orgMarkupPercent: 8 }],
      };
      service.attachOrganizations(id, payload).subscribe((result) => {
        expect(result).toEqual({ ok: true, data: family });
        done();
      });
      const req = httpMock.expectOne(`${baseUrl}/quotations/${id}/family/attach-organizations`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(family);
    });

    it('syncFromMaster() POSTs to …/family/sync-from-master and returns the updated family', (done) => {
      service.syncFromMaster(id).subscribe((result) => {
        expect(result).toEqual({ ok: true, data: { ...family, familyVersion: 2 } });
        done();
      });
      const req = httpMock.expectOne(`${baseUrl}/quotations/${id}/family/sync-from-master`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull();
      req.flush({ ...family, familyVersion: 2 });
    });
  });
});
