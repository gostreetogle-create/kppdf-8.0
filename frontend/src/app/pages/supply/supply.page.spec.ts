import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { SupplyPage } from './supply.page';
import { SupplyTaskService } from '../../shared/services/pi-supply.service';
import { OrdersService } from '../orders/orders.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';

describe('SupplyPage HUB-303 orderId filter', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const queryParamSubject = new BehaviorSubject<{ get: (key: string) => string | null }>({
    get: () => null,
  });

  beforeEach(async () => {
    queryParamSubject.next({ get: () => null });
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([])),
        provideHttpClientTesting(),
        provideRouter([{ path: 'supply', component: SupplyPage }]),
        { provide: API_BASE_URL, useValue: baseUrl },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: queryParamSubject.asObservable() },
        },
        {
          provide: OrdersService,
          useValue: { list: () => of({ ok: true, data: [{ _id: 'o1', number: 'ORD-1' }] }) },
        },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
        SupplyTaskService,
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('passes ?orderId= to GET /supply-tasks and shows filter chip', async () => {
    queryParamSubject.next({
      get: (key: string) => (key === 'orderId' ? 'o1' : null),
    });
    const fixture = TestBed.createComponent(SupplyPage);
    fixture.detectChanges();

    const req = httpMock.expectOne(
      (r) =>
        r.method === 'GET' &&
        r.url === `${baseUrl}/supply-tasks` &&
        r.params.get('orderId') === 'o1',
    );
    req.flush([{ _id: 't1', orderId: 'o1', qty: 1, status: 'draft' }]);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('[data-test="supply-order-filter-chip"]'),
    ).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Фильтр: заказ');
  });

  it('clearOrderFilter removes orderId query param', async () => {
    queryParamSubject.next({
      get: (key: string) => (key === 'orderId' ? 'o1' : null),
    });
    const fixture = TestBed.createComponent(SupplyPage);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === `${baseUrl}/supply-tasks` && r.method === 'GET').flush([]);
    fixture.detectChanges();

    const router = TestBed.inject(Router);
    const navSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    const comp = fixture.componentInstance as unknown as { clearOrderFilter: () => void };
    comp.clearOrderFilter();
    expect(navSpy).toHaveBeenCalled();
    const args = navSpy.mock.calls[0]!;
    expect(args[1]?.queryParams).toEqual({ orderId: null });
  });
});
