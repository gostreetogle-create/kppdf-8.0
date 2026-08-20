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
      get: (key: string) => {
        if (key === 'orderId') return 'o1';
        if (key === 'view') return 'registry';
        return null;
      },
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
      get: (key: string) => {
        if (key === 'orderId') return 'o1';
        if (key === 'view') return 'registry';
        return null;
      },
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

describe('SupplyPage TZ-SUPPLY-304 quick order view', () => {
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
          useValue: { list: () => of({ ok: true, data: [] }) },
        },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
        SupplyTaskService,
      ],
    }).compileComponents();
  });

  it('defaults to quick order view without view query param', () => {
    const fixture = TestBed.createComponent(SupplyPage);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-test="supply-quick-order"]')).toBeTruthy();
    expect(root.querySelector('[data-test="supply-view-quick"]')).toBeTruthy();
    expect(root.querySelector('[data-test="supply-view-registry"]')).toBeTruthy();
    expect(root.querySelectorAll('[data-test^="supply-quick-tile-qo-"]').length).toBe(5);
    expect(root.textContent).toContain('5 заявок');
    expect(root.querySelector('[data-test="supply-create-toggle"]')).toBeFalsy();
  });

  it('create expands a new tile at the top via toolbar', () => {
    const fixture = TestBed.createComponent(SupplyPage);
    fixture.detectChanges();

    const createBtn = fixture.nativeElement.querySelector(
      '[data-test="supply-quick-create"]',
    ) as HTMLButtonElement;
    expect(createBtn).toBeTruthy();
    createBtn.click();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('[data-test="supply-quick-tile-expanded"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="supply-quick-material-select"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelectorAll('[data-test^="supply-quick-tile-qo-"]').length,
    ).toBe(6);
  });
});
