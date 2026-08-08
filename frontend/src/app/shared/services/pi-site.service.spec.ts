import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { SiteService } from './pi-site.service';

describe('SiteService (TZ-ORDERS-303)', () => {
  let svc: SiteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        SiteService,
      ],
    });
    svc = TestBed.inject(SiteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('listByCounterparty() GETs /sites?counterpartyId=', () => {
    svc.listByCounterparty('cp1').subscribe((res) => {
      if (res.ok) {
        expect(res.data.length).toBe(1);
        expect(res.data[0].name).toBe('Основной');
      }
    });
    const req = httpMock.expectOne((r) => r.url === 'http://test/api/sites' && r.method === 'GET');
    expect(req.request.params.get('counterpartyId')).toBe('cp1');
    req.flush([{ _id: 's1', counterpartyId: 'cp1', name: 'Основной', address: 'ул. 1' }]);
  });

  it('create() POSTs /sites', () => {
    svc.create({ counterpartyId: 'cp1', name: 'Склад', address: 'пр. 2' }).subscribe((res) => {
      if (res.ok) expect(res.data._id).toBe('s2');
    });
    const req = httpMock.expectOne('http://test/api/sites');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      counterpartyId: 'cp1',
      name: 'Склад',
      address: 'пр. 2',
    });
    req.flush({ _id: 's2', counterpartyId: 'cp1', name: 'Склад', address: 'пр. 2' });
  });
});
