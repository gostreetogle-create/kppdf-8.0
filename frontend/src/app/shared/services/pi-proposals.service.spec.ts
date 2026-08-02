import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { ProposalsService, Proposal } from './pi-proposals.service';

function proposal(overrides: Partial<Proposal> = {}): Proposal {
  return {
    _id: 'prop-1',
    number: 'QTN-0001',
    counterpartyId: { _id: 'cp-1', name: 'ООО Ромашка' },
    date: '2026-08-02T00:00:00.000Z',
    status: 'draft',
    total: 10000,
    items: [
      {
        productId: 'prod-1',
        productName: 'Стенд напольный',
        quantity: 2,
        unitPrice: 5000,
        total: 10000,
      },
    ],
    ...overrides,
  };
}

describe('ProposalsService (TZ-SALES-301)', () => {
  let service: ProposalsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        ProposalsService,
      ],
    });
    service = TestBed.inject(ProposalsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list GETs the flat /quotations array', () => {
    const rows = [proposal(), proposal({ _id: 'prop-2', number: 'QTN-0002' })];
    service.list().subscribe((res) => expect(res).toEqual({ ok: true, data: rows }));

    const req = httpMock.expectOne('http://test/api/quotations');
    expect(req.request.method).toBe('GET');
    req.flush(rows);
  });

  it('findById GETs a single quotation', () => {
    const row = proposal({ status: 'accepted' });
    service.findById('prop-1').subscribe((res) => expect(res.ok).toBe(true));

    const req = httpMock.expectOne('http://test/api/quotations/prop-1');
    expect(req.request.method).toBe('GET');
    req.flush(row);
  });

  it('create POSTs the payload and returns ok:true', () => {
    const created = proposal({ number: 'QTN-0009' });
    service
      .create({ counterpartyId: 'cp-1', items: [] } as never)
      .subscribe((res) => expect(res).toEqual({ ok: true, data: created }));

    const req = httpMock.expectOne('http://test/api/quotations');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ counterpartyId: 'cp-1', items: [] });
    req.flush(created);
  });

  it('update PATCHes /quotations/:id', () => {
    const updated = proposal({ status: 'sent' });
    service
      .update('prop-1', { status: 'sent' })
      .subscribe((res) => expect(res.ok).toBe(true));

    const req = httpMock.expectOne('http://test/api/quotations/prop-1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'sent' });
    req.flush(updated);
  });

  it('remove DELETEs /quotations/:id', () => {
    service.remove('prop-1').subscribe((res) => expect(res.ok).toBe(true));

    const req = httpMock.expectOne('http://test/api/quotations/prop-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('duplicate POSTs to /quotations/:id/duplicate', () => {
    service.duplicate('prop-1').subscribe((res) => expect(res.ok).toBe(true));

    const req = httpMock.expectOne('http://test/api/quotations/prop-1/duplicate');
    expect(req.request.method).toBe('POST');
    req.flush(proposal({ number: 'QTN-0002' }));
  });

  it('convertToOrder POSTs to /quotations/:id/convert-to-order with deliveryAddress', () => {
    service
      .convertToOrder('prop-1', { deliveryAddress: 'ул. Ленина, 1' })
      .subscribe((res) => {
        expect(res.ok).toBe(true);
        expect(res.data?.orderId).toBe('ord-77');
      });

    const req = httpMock.expectOne('http://test/api/quotations/prop-1/convert-to-order');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ deliveryAddress: 'ул. Ленина, 1' });
    req.flush({ quotation: proposal(), orderId: 'ord-77' });
  });

  it('surfaces a backend error as ok:false with the error payload', () => {
    service.convertToOrder('prop-1').subscribe((res) => {
      expect(res.ok).toBe(false);
      expect((res as { error: { message: string } }).error.message).toBe(
        'КП не принято покупателем',
      );
    });

    const req = httpMock.expectOne('http://test/api/quotations/prop-1/convert-to-order');
    req.flush({ message: 'КП не принято покупателем' }, { status: 400, statusText: 'Bad Request' });
  });
});
