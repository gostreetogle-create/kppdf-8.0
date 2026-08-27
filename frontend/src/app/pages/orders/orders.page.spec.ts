import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { OrdersPage } from './orders.page';
import { OrdersService, Order } from './orders.service';
import { CounterpartyService } from '../../shared/services/pi-counterparty.service';
import { ProductModulesService } from '../../shared/services/pi-product-modules.service';
import { ProductsService } from '../../shared/services/products.service';
import { MaterialsService } from '../../shared/services/materials.service';
import { CatalogAppearanceService } from '../../shared/ui/catalog/catalog-appearance.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';

describe('OrdersPage', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/orders`;
  const dialogSpy = { open: jest.fn().mockReturnValue({}) };
  const getProductTree = jest.fn();
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
    getProductTree.mockReset();
    getProductTree.mockReturnValue(
      of({
        ok: true,
        data: {
          _id: 'p1',
          name: 'Изделие',
          kind: 'product',
          quantity: 2,
          children: [
            {
              _id: 'm1',
              name: 'Каркас',
              kind: 'module',
              quantity: 1,
              children: [
                {
                  _id: 'mat1',
                  name: 'Труба',
                  kind: 'material',
                  quantity: 1,
                  children: [],
                },
              ],
            },
          ],
        },
      }),
    );
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
        {
          provide: ProductModulesService,
          useValue: { getProductTree, findById: () => of({ ok: false }) },
        },
        { provide: ProductsService, useValue: { findById: () => of({ ok: false }) } },
        { provide: MaterialsService, useValue: { findById: () => of({ ok: false }) } },
        {
          provide: CatalogAppearanceService,
          useValue: { load: () => of(null), palette: () => undefined },
        },
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

  it('HUB-302 renders a concise order summary and expandable composition', async () => {
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
    const expandToggle = fixture.nativeElement.querySelector(
      '[data-test="table-expand-toggle"]',
    ) as HTMLButtonElement;
    expect(expandToggle).toBeTruthy();
    expect(expandToggle.classList).toContain('bg-gold');
    expect(expandToggle.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('[data-test="order-deal-block"]')).toBeFalsy();
    expect(
      fixture.nativeElement.querySelector('[data-test="order-composition-block"]'),
    ).toBeTruthy();
    const compositionToggle = fixture.nativeElement.querySelector(
      '[data-test="order-composition-toggle"]',
    ) as HTMLButtonElement;
    expect(compositionToggle.getAttribute('aria-expanded')).toBe('false');
    compositionToggle.click();
    fixture.detectChanges();
    expect(compositionToggle.getAttribute('aria-expanded')).toBe('true');
    expect(
      fixture.nativeElement.querySelector('[data-test="order-composition-panel"]'),
    ).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-group-order"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-group-execution"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-group-logistics"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-group-documents"]')).toBeTruthy();
    expect(fixture.nativeElement.textContent).not.toContain('Сделка');
    expect(fixture.nativeElement.textContent).toContain('Состав заказа');
    expect(
      fixture.nativeElement.querySelector('[data-test="order-composition-tree"]'),
    ).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="composition-tree"]')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('изд');
    // UX-445I: product root starts collapsed — expand to reveal modules.
    const productToggle = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-p1"] [data-test="composition-tree-toggle"]',
    ) as HTMLElement;
    productToggle.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('мод');
    // The material leaf sits under a collapsed module node; expand it to reveal
    // the 'мат' kind badge (lazy tree contract).
    const moduleToggle = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-m1"] [data-test="composition-tree-toggle"]',
    ) as HTMLElement;
    moduleToggle.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('мат');
    expect(
      fixture.nativeElement.querySelector('[data-test="order-composition-panel"] ul'),
    ).toBeFalsy();
    expect(getProductTree).toHaveBeenCalledWith('p1', 2);
    expect(dialogSpy.open).not.toHaveBeenCalled();

    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(row.getAttribute('aria-expanded')).toBe('false');
    expect(expandToggle.classList).not.toContain('bg-gold');
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

    // DESK-423: supply section is collapsed by default; expand it
    const supplyToggle = fixture.nativeElement.querySelector(
      '[aria-controls="order-supply-content"]',
    ) as HTMLButtonElement;
    supplyToggle.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="order-supply-block"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-supply-counters"]')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Заказано 1');
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
    };
    comp.onRowClick(fakeOrders[0]!);
    fixture.detectChanges();

    httpMock.expectOne(matchSupplyExpand('o1')).flush([]);
    httpMock.expectOne(matchReservationExpand('ORD-001')).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    // DESK-423: supply section collapsed by default; expand and verify no error
    const supplyToggle = fixture.nativeElement.querySelector(
      '[aria-controls="order-supply-content"]',
    ) as HTMLButtonElement;
    supplyToggle.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="order-supply-block"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-supply-error"]')).toBeFalsy();

    // Collapse row and re-expand → new tray component, supply section collapsed again
    comp.onRowClick(fakeOrders[0]!);
    fixture.detectChanges();
    comp.onRowClick(fakeOrders[0]!);
    fixture.detectChanges();
    httpMock.expectOne(matchSupplyExpand('o1')).flush('fail', { status: 500, statusText: 'Error' });
    httpMock.expectOne(matchReservationExpand('ORD-001')).flush([]);
    await tickMicrotask();
    await tickMicrotask();
    fixture.detectChanges();

    // Expand supply again to see the error
    const supplyToggle2 = fixture.nativeElement.querySelector(
      '[aria-controls="order-supply-content"]',
    ) as HTMLButtonElement;
    supplyToggle2.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="order-supply-error"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-group-order"]')).toBeTruthy();
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
    fixture.detectChanges();
    // Supply now lazy-loads inside the tray (not mounted for an empty list);
    // onRowClick still owns the HUB-304 reservation fetch.
    httpMock.expectOne(matchReservationExpand(row.number)).flush([]);
    await tickMicrotask();
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

    // DESK-423: logistics section collapsed by default; expand it
    const logisticsToggle = fixture.nativeElement.querySelector(
      '[aria-controls="order-logistics-content"]',
    ) as HTMLButtonElement;
    logisticsToggle.click();
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

    // DESK-423: logistics section collapsed by default; expand and verify no error
    const logisticsToggle = fixture.nativeElement.querySelector(
      '[aria-controls="order-logistics-content"]',
    ) as HTMLButtonElement;
    logisticsToggle.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="order-warehouse-block"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-warehouse-error"]')).toBeFalsy();

    // Collapse row and re-expand → new tray component, logistics collapsed again.
    // The reservation error arrives asynchronously after ngOnInit, so logistics
    // won't auto-expand — expand manually after the error flush.
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

    // DESK-423: error arrived after tray init; expand logistics manually
    const logisticsToggle2 = fixture.nativeElement.querySelector(
      '[aria-controls="order-logistics-content"]',
    ) as HTMLButtonElement;
    logisticsToggle2.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="order-warehouse-error"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-group-order"]')).toBeTruthy();
  });

  it('HUB-304 renders shipping section with link to /shipping and no shipment API', async () => {
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

    // DESK-423: logistics section collapsed by default; expand it
    const logisticsToggle = fixture.nativeElement.querySelector(
      '[aria-controls="order-logistics-content"]',
    ) as HTMLButtonElement;
    logisticsToggle.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="order-shipping-block"]')).toBeTruthy();
    const shippingLink = fixture.nativeElement.querySelector(
      '[data-test="order-shipping-link"]',
    ) as HTMLAnchorElement;
    expect(shippingLink.getAttribute('href')).toContain('/shipping');
    httpMock.expectNone((r) => r.url.includes('/shipments'));
  });
});
