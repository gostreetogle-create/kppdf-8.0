import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { OrdersPage } from './orders.page';
import { OrdersService, Order } from './orders.service';
import { CounterpartyService } from '../../shared/services/pi-counterparty.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';

describe('OrdersPage', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/orders`;
  const dialogSpy = { open: jest.fn().mockReturnValue({}) };
  const queryParamSubject = new BehaviorSubject<{ get: (key: string) => string | null }>({
    get: () => null,
  });

  const fakeOrders: Order[] = [
    {
      _id: 'o1',
      number: 'ORD-001',
      status: 'draft',
      priority: 'normal',
      items: [],
      createdAt: '2026-01-01',
    } as Order,
    {
      _id: 'o2',
      number: 'ORD-002',
      status: 'confirmed',
      priority: 'high',
      items: [],
      createdAt: '2026-01-02',
    } as Order,
  ];

  const matchListGet = (r: { url: string; method: string }): boolean =>
    r.url === listUrl && r.method === 'GET';

  const matchSupplyExpand =
    (orderMongoId: string) =>
    (r: { url: string; method: string; params: { get: (k: string) => string | null } }): boolean =>
      r.method === 'GET' &&
      r.url === `${baseUrl}/supply-tasks` &&
      r.params.get('orderId') === orderMongoId;

  const matchReservationExpand =
    (orderNumber: string) =>
    (r: { url: string; method: string; params: { get: (k: string) => string | null } }): boolean =>
      r.method === 'GET' &&
      r.url === `${baseUrl}/reservations` &&
      r.params.get('orderId') === orderNumber;

  async function flushExpandLoads(
    http: HttpTestingController,
    order: Pick<Order, '_id' | 'number'>,
    supply: unknown[] = [],
    reservations: unknown[] = [],
  ): Promise<void> {
    http.expectOne(matchSupplyExpand(order._id)).flush(supply);
    http.expectOne(matchReservationExpand(order.number)).flush(reservations);
    await tickMicrotask();
  }

  async function tickMicrotask(): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  beforeEach(async () => {
    dialogSpy.open.mockClear();
    queryParamSubject.next({ get: () => null });
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        provideRouter([{ path: 'orders/:id', children: [] }]),
        { provide: API_BASE_URL, useValue: baseUrl },
        { provide: ActivatedRoute, useValue: { queryParamMap: queryParamSubject.asObservable() } },
        {
          provide: OrdersService,
          useValue: {
            list: () => of({ ok: true, data: [] }),
            findById: () => of({ ok: true, data: {} as never }),
            create: () => of({ ok: true, data: {} as never }),
            update: () => of({ ok: true, data: {} as never }),
            remove: () => of({ ok: true, data: undefined }),
          },
        },
        {
          provide: CounterpartyService,
          useValue: { list: () => of({ ok: true, data: { items: [], total: 0 } }) },
        },
        { provide: PiDialogService, useValue: dialogSpy },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fires an initial GET /api/orders on creation', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush(fakeOrders);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      data: () => Order[];
      total: () => number;
      loading: () => boolean;
    };

    expect(comp.data().length).toBe(2);
    expect(comp.total()).toBe(2);
    expect(comp.loading()).toBe(false);
  });

  it('shows loading state before response', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { loading: () => boolean };
    expect(comp.loading()).toBe(true);

    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    expect(comp.loading()).toBe(false);
  });

  it('shows empty state when no orders', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      data: () => Order[];
      total: () => number;
    };
    expect(comp.data().length).toBe(0);
    expect(comp.total()).toBe(0);
  });

  it('handles error response gracefully', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();

    httpMock
      .expectOne(matchListGet)
      .flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    await tickMicrotask();

    const comp = fixture.componentInstance as unknown as { error: () => string | null };
    expect(() => comp.error()).not.toThrow();
  });

  it('applies an initial ?q= to the existing search filter', async () => {
    queryParamSubject.next({ get: (key) => (key === 'q' ? 'ORD-002' : null) });
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush(fakeOrders);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      searchQuery: () => string;
      filteredRows: () => Order[];
    };
    expect(comp.searchQuery()).toBe('ORD-002');
    expect(comp.filteredRows().map((row) => row.number)).toEqual(['ORD-002']);
  });

  it('clears the deep-link filter when q is removed', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush(fakeOrders);
    await tickMicrotask();
    fixture.detectChanges();

    queryParamSubject.next({ get: (key) => (key === 'q' ? 'ORD-002' : null) });
    fixture.detectChanges();
    queryParamSubject.next({ get: () => null });
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      searchQuery: () => string;
      filteredRows: () => Order[];
    };
    expect(comp.searchQuery()).toBe('');
    expect(comp.filteredRows()).toHaveLength(2);
  });

  it('create button triggers openCreate', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { openCreate: () => void };
    comp.openCreate();
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('HUB-302 defines operational columns without commercial total', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      cols: { key: string; label: string }[];
    };
    expect(comp.cols.map((col) => col.key)).toEqual([
      'number',
      'date',
      'counterpartyId',
      'siteId',
      'status',
      'priority',
      'items',
      'quotationId',
      'readyForWork',
    ]);
    expect(comp.cols.map((col) => col.label)).not.toContain('Сумма');
  });

  it('HUB-302 calculates X/Y readiness and honest empty state', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      readinessLabel: (row: Order) => string;
    };
    expect(
      comp.readinessLabel({
        _id: 'o1',
        number: 'ORD-1',
        status: 'draft',
        items: [
          { productId: 'p1', quantity: 1, unitPrice: 0, readyForWork: true },
          { productId: 'p2', quantity: 1, unitPrice: 0 },
        ],
      }),
    ).toBe('1 из 2');
    expect(comp.readinessLabel({ _id: 'o2', number: 'ORD-2', status: 'draft', items: [] })).toBe(
      '—',
    );
  });

  it('HUB-302 renders read-only Deal/Composition expand and supports keyboard toggle', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush([
      {
        ...fakeOrders[0],
        counterpartyId: { _id: 'cp1', name: 'ООО Заказчик' },
        siteId: { _id: 'site1', name: 'Цех', address: 'ул. Мира, 1' },
        quotationId: { _id: 'q1', number: 'QTN-1', isStub: true },
        items: [{ productId: 'p1', productName: 'Изделие', quantity: 2, unitPrice: 0 }],
      },
    ]);
    await tickMicrotask();
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector('[data-test="table-row-o1"]') as HTMLElement;
    expect(row).toBeTruthy();
    expect(row.getAttribute('aria-expanded')).toBe('false');

    const link = fixture.nativeElement.querySelector('[data-test="order-link-o1"]') as HTMLElement;
    link.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="expanded-content"]')).toBeFalsy();

    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    await flushExpandLoads(httpMock, { _id: 'o1', number: 'ORD-001' });
    fixture.detectChanges();
    expect(row.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('[data-test="expanded-content"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-deal-block"]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="order-composition-block"]'),
    ).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('ООО Заказчик');
    expect(fixture.nativeElement.textContent).toContain('Изделие');
    expect(dialogSpy.open).not.toHaveBeenCalled();

    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(row.getAttribute('aria-expanded')).toBe('false');
  });

  it('HUB-303 lazy-loads supply counters on expand and links supply/production/docs', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush([fakeOrders[0]]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { onRowClick: (row: Order) => void };
    comp.onRowClick(fakeOrders[0]!);
    fixture.detectChanges();

    const supplyReq = httpMock.expectOne(matchSupplyExpand('o1'));
    supplyReq.flush([
      { _id: 't1', orderId: 'o1', qty: 1, status: 'draft' },
      { _id: 't2', orderId: 'o1', qty: 2, status: 'confirmed' },
      { _id: 't3', orderId: 'o1', qty: 1, status: 'ordered' },
      { _id: 't4', orderId: 'o1', qty: 3, status: 'received' },
    ]);
    httpMock.expectOne(matchReservationExpand('ORD-001')).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="order-supply-block"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-supply-counters"]')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Черновик 1');
    expect(fixture.nativeElement.textContent).toContain('всего 4');

    const supplyLink = fixture.nativeElement.querySelector(
      '[data-test="order-supply-link"]',
    ) as HTMLAnchorElement;
    expect(supplyLink.getAttribute('href')).toContain('/supply');
    expect(supplyLink.getAttribute('href')).toContain('orderId=o1');

    const productionLink = fixture.nativeElement.querySelector(
      '[data-test="order-production-link"]',
    ) as HTMLAnchorElement;
    expect(productionLink.getAttribute('href')).toContain('/production');
    expect(productionLink.getAttribute('href')).toContain('orderId=o1');

    const docsLink = fixture.nativeElement.querySelector(
      '[data-test="order-documents-link"]',
    ) as HTMLAnchorElement;
    expect(docsLink.getAttribute('href')).toContain('/doc-constructor/templates');
    expect(docsLink.getAttribute('href')).toContain('source=order');
    expect(docsLink.getAttribute('href')).toContain('sourceId=o1');
  });

  it('HUB-303 shows empty supply state and isolates supply errors in expand', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush([fakeOrders[0]]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      onRowClick: (row: Order) => void;
      supplyExpandError: () => string | null;
    };
    comp.onRowClick(fakeOrders[0]!);
    fixture.detectChanges();

    httpMock.expectOne(matchSupplyExpand('o1')).flush([]);
    httpMock.expectOne(matchReservationExpand('ORD-001')).flush([]);
    await tickMicrotask();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Нет задач снабжения');

    comp.onRowClick(fakeOrders[0]!);
    fixture.detectChanges();
    comp.onRowClick(fakeOrders[0]!);
    fixture.detectChanges();
    httpMock.expectOne(matchSupplyExpand('o1')).flush('fail', { status: 500, statusText: 'Error' });
    httpMock.expectOne(matchReservationExpand('ORD-001')).flush([]);
    await tickMicrotask();
    await tickMicrotask();
    fixture.detectChanges();
    expect(comp.supplyExpandError()).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-supply-error"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-deal-block"]')).toBeTruthy();
  });

  it('HUB-302 toggles one read-only expansion and does not call write services', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      expandedId: () => string | null;
      onRowClick: (row: Order) => void;
      proposalLabelOf: (row: Order) => string;
    };
    const row: Order = {
      _id: 'o1',
      number: 'ORD-1',
      status: 'draft',
      quotationId: { _id: 'q1', number: 'QTN-1', isStub: true },
      items: [{ productId: 'p1', productName: 'Изделие', quantity: 2, unitPrice: 0 }],
    };

    comp.onRowClick(row);
    await flushExpandLoads(httpMock, row);
    expect(comp.expandedId()).toBe('o1');
    expect(comp.proposalLabelOf(row)).toBe('№QTN-1 · заглушка');
    comp.onRowClick(row);
    expect(comp.expandedId()).toBeNull();
    expect(dialogSpy.open).not.toHaveBeenCalled();
  });

  it('HUB-304 renders readiness block without extra HTTP and links to order detail', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush([
      {
        ...fakeOrders[0],
        items: [
          { productId: 'p1', productName: 'Дверь', quantity: 1, unitPrice: 0, readyForWork: true },
          { productId: 'p2', productName: 'Рама', quantity: 1, unitPrice: 0 },
        ],
      },
    ]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { onRowClick: (row: Order) => void };
    comp.onRowClick(fakeOrders[0]!);
    fixture.detectChanges();
    httpMock.expectOne(matchSupplyExpand('o1')).flush([]);
    httpMock.expectOne(matchReservationExpand('ORD-001')).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="order-readiness-block"]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="order-readiness-summary"]')?.textContent,
    ).toContain('1 из 2');
    expect(fixture.nativeElement.querySelector('[data-test="order-readiness-ready"]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="order-readiness-not-ready"]'),
    ).toBeTruthy();
    const readinessLink = fixture.nativeElement.querySelector(
      '[data-test="order-readiness-link"]',
    ) as HTMLAnchorElement;
    expect(readinessLink.getAttribute('href')).toContain('/orders/o1');
  });

  it('HUB-304 lazy-loads reservations by Order.number and shows active/total counters', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush([fakeOrders[0]]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { onRowClick: (row: Order) => void };
    comp.onRowClick(fakeOrders[0]!);
    fixture.detectChanges();

    httpMock.expectOne(matchSupplyExpand('o1')).flush([]);
    const reservationsReq = httpMock.expectOne(matchReservationExpand('ORD-001'));
    expect(reservationsReq.request.params.get('orderId')).toBe('ORD-001');
    reservationsReq.flush([
      {
        _id: 'r1',
        orderId: 'ORD-001',
        productId: 'p1',
        warehouseId: 'w1',
        qty: 2,
        status: 'active',
      },
      {
        _id: 'r2',
        orderId: 'ORD-001',
        productId: 'p2',
        warehouseId: 'w1',
        qty: 1,
        status: 'released',
      },
    ]);
    await tickMicrotask();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="order-warehouse-block"]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="order-warehouse-counters"]')?.textContent,
    ).toContain('Активных 1');
    expect(fixture.nativeElement.textContent).toContain('всего 2');
    const warehouseLink = fixture.nativeElement.querySelector(
      '[data-test="order-warehouse-link"]',
    ) as HTMLAnchorElement;
    expect(warehouseLink.getAttribute('href')).toContain('/storage-items');
  });

  it('HUB-304 shows empty warehouse state and isolates reservation errors', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush([fakeOrders[0]]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      onRowClick: (row: Order) => void;
      reservationExpandError: () => string | null;
    };
    comp.onRowClick(fakeOrders[0]!);
    fixture.detectChanges();
    httpMock.expectOne(matchSupplyExpand('o1')).flush([]);
    httpMock.expectOne(matchReservationExpand('ORD-001')).flush([]);
    await tickMicrotask();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Нет броней');

    comp.onRowClick(fakeOrders[0]!);
    fixture.detectChanges();
    comp.onRowClick(fakeOrders[0]!);
    fixture.detectChanges();
    httpMock.expectOne(matchSupplyExpand('o1')).flush([]);
    httpMock
      .expectOne(matchReservationExpand('ORD-001'))
      .flush('fail', { status: 500, statusText: 'Error' });
    await tickMicrotask();
    await tickMicrotask();
    fixture.detectChanges();
    expect(comp.reservationExpandError()).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-warehouse-error"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-deal-block"]')).toBeTruthy();
  });

  it('HUB-304 renders shipping stub with link to /shipping and no shipment API', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush([fakeOrders[0]]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { onRowClick: (row: Order) => void };
    comp.onRowClick(fakeOrders[0]!);
    fixture.detectChanges();
    await flushExpandLoads(httpMock, fakeOrders[0]!);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="order-shipping-block"]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="order-shipping-stub"]')?.textContent,
    ).toContain('Отгрузка пока не ведётся');
    const shippingLink = fixture.nativeElement.querySelector(
      '[data-test="order-shipping-link"]',
    ) as HTMLAnchorElement;
    expect(shippingLink.getAttribute('href')).toContain('/shipping');
    httpMock.expectNone((r) => r.url.includes('/shipments'));
  });
});
