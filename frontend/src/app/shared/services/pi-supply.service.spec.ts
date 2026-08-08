import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { SupplyTaskService } from './pi-supply.service';

describe('SupplyTaskService (TZ-SUPPLY-301)', () => {
  let svc: SupplyTaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://test/api' },
        SupplyTaskService,
      ],
    });
    svc = TestBed.inject(SupplyTaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() GETs /supply-tasks', () => {
    svc.list().subscribe((res) => {
      if (res.ok) expect(res.data).toEqual([]);
    });
    const req = httpMock.expectOne(
      (r) => r.url === 'http://test/api/supply-tasks' && r.method === 'GET',
    );
    req.flush([]);
  });

  it('confirm() POSTs /supply-tasks/:id/confirm', () => {
    svc.confirm('t1').subscribe((res) => {
      if (res.ok) expect(res.data.status).toBe('confirmed');
    });
    const req = httpMock.expectOne('http://test/api/supply-tasks/t1/confirm');
    expect(req.request.method).toBe('POST');
    req.flush({
      _id: 't1',
      orderId: 'o1',
      qty: 1,
      status: 'confirmed',
      confirmedBy: 'u1',
      confirmedAt: '2026-08-08T07:00:00.000Z',
    });
  });
});
