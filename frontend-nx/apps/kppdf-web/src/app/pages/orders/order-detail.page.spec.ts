import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import {
  PiCompositionService,
  PiOrdersService,
  PiOrganizationsService,
  PiProductsService,
  PiReservationsService,
  PiShipmentsService,
  PiSupplyRequestsService,
  type Order,
  type ShipResult,
} from '@kppdf/data-access';
import { PiToastService } from '@kppdf/ui/toast';
import { PiDialogService } from '@kppdf/ui/dialog';
import type { SilentResult } from '@kppdf/util-http';
import { OrderDetailPage } from './order-detail.page';

describe('OrderDetailPage (TZ-NX-SALES-S35-ORDER-DETAIL)', () => {
  let fixture: ComponentFixture<OrderDetailPage>;
  let ordersApi: { getById: jest.Mock; update: jest.Mock; cancel: jest.Mock; setLineReady: jest.Mock; ship: jest.Mock };
  let toast: { error: jest.Mock; success: jest.Mock };
  let router: { navigate: jest.Mock };
  let organizationsApi: { getById: jest.Mock };
  let dialog: { open: jest.Mock };
  let productsApi: { list: jest.Mock };
  let compositionApi: { getProductTree: jest.Mock };
  let supplyApi: { list: jest.Mock };
  let reservationsApi: { list: jest.Mock };
  let shipmentsApi: { list: jest.Mock; cancelShipment: jest.Mock };

  const quotationOrder: Order = {
    _id: 'order-1',
    number: 'ORD-001',
    status: 'confirmed',
    isPaid: true,
    paidAt: '2026-09-01T10:00:00Z',
    quotationId: 'quotation-1',
    counterpartyId: { _id: 'cp-1', name: 'ООО Пример' },
    siteId: { _id: 'site-1', name: 'Склад №1', address: 'Москва' },
    items: [
      { productId: 'p-1', productName: 'Стол', quantity: 2, unit: 'шт' },
      { productId: 'p-2', productName: 'Стул', quantity: 8, unit: 'шт' },
    ],
  };

  const directOrder: Order = {
    _id: 'order-2',
    number: 'ORD-002',
    status: 'draft',
    isPaid: false,
  };

  /** `RouterLink` (back-to-list/home/counterparty links in the header) needs a real `Router` to compute hrefs — `provideRouter([])` + spy, not a plain `{navigate}` stub (same pattern as `order-create.page.spec.ts`). */
  async function configureRouterSpy(): Promise<void> {
    router = { navigate: jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) as jest.Mock };
  }

  async function setup(result: ReturnType<typeof of> | Subject<SilentResult<Order>>): Promise<void> {
    ordersApi = { getById: jest.fn().mockReturnValue(result), update: jest.fn(), cancel: jest.fn(), setLineReady: jest.fn(), ship: jest.fn() };
    toast = { error: jest.fn(), success: jest.fn() };
    organizationsApi = { getById: jest.fn().mockReturnValue(of({ ok: true, data: { name: 'Наша фирма' } })) };
    dialog = { open: jest.fn() };
    productsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [], total: 0, page: 1, limit: 50 } })) };
    compositionApi = { getProductTree: jest.fn() };
    supplyApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    reservationsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    shipmentsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })), cancelShipment: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [OrderDetailPage],
      providers: [
        provideRouter([]),
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiToastService, useValue: toast },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'order-1' } } } },
        { provide: PiOrganizationsService, useValue: organizationsApi },
        { provide: PiDialogService, useValue: dialog },
        { provide: PiProductsService, useValue: productsApi },
        { provide: PiCompositionService, useValue: compositionApi },
        { provide: PiSupplyRequestsService, useValue: supplyApi },
        { provide: PiReservationsService, useValue: reservationsApi },
        { provide: PiShipmentsService, useValue: shipmentsApi },
      ],
    }).compileComponents();

    await configureRouterSpy();
    fixture = TestBed.createComponent(OrderDetailPage);
    fixture.detectChanges();
  }

  async function settle(): Promise<void> {
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders the loading state while the detail request is pending', async () => {
    const pending = new Subject<SilentResult<Order>>();
    await setup(pending);

    expect(fixture.nativeElement.querySelector('[data-test="order-detail"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-loading"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-body"]')).toBeNull();
    expect(ordersApi.getById).toHaveBeenCalledWith('order-1');
  });

  it('renders a retryable error banner for a 404 and retries the request', async () => {
    const failure: SilentResult<Order> = {
      ok: false,
      error: new HttpErrorResponse({ status: 404, error: { message: 'Order not found' } }),
    };
    ordersApi = { getById: jest.fn(), update: jest.fn(), cancel: jest.fn(), setLineReady: jest.fn(), ship: jest.fn() };
    organizationsApi = { getById: jest.fn().mockReturnValue(of({ ok: true, data: { name: 'Наша фирма' } })) };
    dialog = { open: jest.fn() };
    productsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [], total: 0, page: 1, limit: 50 } })) };
    compositionApi = { getProductTree: jest.fn() };
    supplyApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    reservationsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    shipmentsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })), cancelShipment: jest.fn() };
    ordersApi.getById
      .mockReturnValueOnce(of(failure))
      .mockReturnValueOnce(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    toast = { error: jest.fn(), success: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [OrderDetailPage],
      providers: [
        provideRouter([]),
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiToastService, useValue: toast },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'order-1' } } } },
        { provide: PiOrganizationsService, useValue: organizationsApi },
        { provide: PiDialogService, useValue: dialog },
        { provide: PiProductsService, useValue: productsApi },
        { provide: PiCompositionService, useValue: compositionApi },
        { provide: PiSupplyRequestsService, useValue: supplyApi },
        { provide: PiReservationsService, useValue: reservationsApi },
        { provide: PiShipmentsService, useValue: shipmentsApi },
      ],
    }).compileComponents();
    await configureRouterSpy();
    fixture = TestBed.createComponent(OrderDetailPage);
    fixture.detectChanges();
    await settle();

    const error = fixture.nativeElement.querySelector('[data-test="order-error"]');
    expect(error).toBeTruthy();
    expect(error.textContent).toContain('Объект не найден');
    (error.querySelector('button') as HTMLButtonElement).click();
    await settle();

    expect(ordersApi.getById).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelector('[data-test="order-body"]')).toBeTruthy();
  });

  it('renders number, Russian status, counterparty, site, and items (name × qty)', async () => {
    await setup(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    await settle();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('ORD-001');
    expect(text).toContain('Подтверждён');
    expect(text).toContain('ООО Пример');
    expect(text).toContain('Склад №1');
    expect(text).toContain('Стол');
    expect(text).toContain('Стул');

    const itemRows = fixture.nativeElement.querySelectorAll('[data-test="composition-line"]');
    expect(itemRows.length).toBe(2);
    const firstQty = itemRows[0].querySelector('[data-test="composition-qty"]') as HTMLInputElement;
    expect(firstQty.value).toBe('2');
  });

  it('shows an honest empty-items note when the payload has no lines', async () => {
    await setup(of({ ok: true, data: directOrder } satisfies SilentResult<Order>));
    await settle();

    expect(fixture.nativeElement.textContent).toContain('В заказе нет изделий');
  });

  it('changes a line qty via the composition PATCH, preserving the other line untouched', async () => {
    await setup(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    await settle();
    const [line0, line1] = quotationOrder.items ?? [];
    ordersApi.update.mockReturnValue(
      of({
        ok: true,
        data: { ...quotationOrder, items: [{ ...line0, quantity: 5 }, line1] },
      } satisfies SilentResult<Order>),
    );

    const qtyInputs = fixture.nativeElement.querySelectorAll('[data-test="composition-qty"]') as NodeListOf<HTMLInputElement>;
    qtyInputs[0].value = '5';
    qtyInputs[0].dispatchEvent(new Event('change'));
    await settle();

    expect(ordersApi.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({
        items: [
          expect.objectContaining({ productId: 'p-1', quantity: 5 }),
          expect.objectContaining({ productId: 'p-2', productName: 'Стул', quantity: 8 }),
        ],
      }),
    );
  });

  it('toggles line readiness via the dedicated ready endpoint (not the general items PATCH)', async () => {
    await setup(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    await settle();
    ordersApi.setLineReady.mockReturnValue(
      of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>),
    );

    const readyToggle = fixture.nativeElement.querySelector('[data-test="composition-ready"]') as HTMLInputElement;
    readyToggle.click();
    await settle();

    expect(ordersApi.setLineReady).toHaveBeenCalledWith('order-1', 0, true);
    expect(ordersApi.update).not.toHaveBeenCalled();
  });

  it('removes a line via the destructive confirm dialog', async () => {
    await setup(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    await settle();
    const [firstLine] = quotationOrder.items ?? [];
    ordersApi.update.mockReturnValue(
      of({ ok: true, data: { ...quotationOrder, items: [firstLine] } } satisfies SilentResult<Order>),
    );
    const closed = signal<boolean | undefined>(undefined);
    dialog.open.mockReturnValue({ closed, close: (v?: boolean) => closed.set(v) });

    const removeButtons = fixture.nativeElement.querySelectorAll('[data-test="composition-remove"] button') as NodeListOf<HTMLButtonElement>;
    removeButtons[1].click();
    closed.set(true);
    await settle();

    expect(ordersApi.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({ items: [expect.objectContaining({ productId: 'p-1' })] }),
    );
  });

  it('freezes composition editing (disabled inputs + banner) once the order leaves draft/confirmed', async () => {
    await setup(
      of({ ok: true, data: { ...quotationOrder, status: 'in_production' } } satisfies SilentResult<Order>),
    );
    await settle();

    expect(fixture.nativeElement.querySelector('[data-test="composition-freeze-banner"]')).toBeTruthy();
    const qty = fixture.nativeElement.querySelector('[data-test="composition-qty"]') as HTMLInputElement;
    expect(qty.disabled).toBe(true);
  });

  it('lazily loads and caches the per-line composition tree on first expand', async () => {
    await setup(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    await settle();
    compositionApi.getProductTree.mockReturnValue(
      of({ ok: true, data: { _id: 'p-1', name: 'Стол', kind: 'product', quantity: 1, children: [] } }),
    );

    const expandBtn = fixture.nativeElement.querySelector('[data-test="composition-line-expand"]') as HTMLButtonElement;
    expandBtn.click();
    await settle();

    expect(compositionApi.getProductTree).toHaveBeenCalledWith('p-1');
    expect(fixture.nativeElement.querySelector('[data-test="composition-tree-panel"]')).toBeTruthy();

    expandBtn.click();
    expandBtn.click();
    await settle();
    expect(compositionApi.getProductTree).toHaveBeenCalledTimes(1);
  });

  it('adds a line via the composition PATCH with the picked product appended', async () => {
    await setup(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    await settle();
    (fixture.componentInstance as unknown as { facade: { products: { set: (v: unknown[]) => void } } }).facade.products.set([
      { _id: 'p-3', name: 'Полка', unit: 'шт', kind: 'product' },
    ]);
    fixture.detectChanges();
    ordersApi.update.mockReturnValue(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));

    const productSelect = fixture.nativeElement.querySelector('[data-test="composition-add-product"]') as HTMLSelectElement;
    productSelect.value = 'p-3';
    productSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    const qtyInput = fixture.nativeElement.querySelector('[data-test="composition-add-qty"]') as HTMLInputElement;
    qtyInput.value = '3';
    qtyInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('[data-test="composition-add-submit"] button') as HTMLButtonElement).click();
    await settle();

    expect(ordersApi.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({ productId: 'p-3', productName: 'Полка', quantity: 3 }),
        ]),
      }),
    );
  });

  it('renders live supply counters and a deficit short-list only when pending requests exist', async () => {
    await setup(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    await settle();
    supplyApi.list.mockReturnValue(
      of({
        ok: true,
        data: [
          { _id: 'sr-1', title: 'Петля', qty: 4, unit: 'шт', status: 'requested', priority: 'normal' },
          { _id: 'sr-2', title: 'Труба', qty: 2, unit: 'м', status: 'ordered', priority: 'normal' },
          { _id: 'sr-3', title: 'Лист', qty: 1, unit: 'шт', status: 'received', priority: 'normal' },
        ],
      }),
    );
    (fixture.componentInstance as unknown as { facade: { loadSupply: () => void } }).facade.loadSupply();
    await settle();

    expect(supplyApi.list).toHaveBeenCalledWith({ orderId: 'order-1' });
    expect(fixture.nativeElement.textContent).toContain('Заказано: 1');
    expect(fixture.nativeElement.textContent).toContain('Получено: 1');
    expect(fixture.nativeElement.textContent).toContain('Всего: 3');
    const deficit = fixture.nativeElement.querySelector('[data-test="execution-deficit"]');
    expect(deficit).toBeTruthy();
    expect(deficit?.textContent).toContain('Петля');
    expect(deficit?.textContent).not.toContain('Труба');
  });

  it('shows the honest empty state (no fake deficit) when there are no supply requests', async () => {
    await setup(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    await settle();

    expect(fixture.nativeElement.querySelector('[data-test="execution-supply-empty"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="execution-deficit"]')).toBeNull();
  });

  it('opens the shared kit-reserve confirm dialog and reloads supply counters on a truthy result', async () => {
    await setup(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    await settle();
    const closed = signal<{ reserved: number } | undefined>(undefined);
    dialog.open.mockReturnValue({ closed, close: (v?: unknown) => closed.set(v as { reserved: number } | undefined) });
    supplyApi.list.mockClear();

    (fixture.nativeElement.querySelector('[data-test="execution-confirm-materials"] button') as HTMLButtonElement).click();
    closed.set({ reserved: 1 });
    await settle();

    expect(dialog.open).toHaveBeenCalled();
    expect(supplyApi.list).toHaveBeenCalledTimes(1);
  });

  it('shows plannedDate + готовность X/Y and correct _id deep-links for supply/production', async () => {
    const [line0, line1] = quotationOrder.items ?? [];
    await setup(
      of({
        ok: true,
        data: {
          ...quotationOrder,
          plannedDate: '2026-09-20T00:00:00Z',
          items: [{ ...line0, readyForWork: true }, line1],
        },
      } satisfies SilentResult<Order>),
    );
    await settle();

    expect(fixture.nativeElement.querySelector('[data-test="execution-readiness"]').textContent).toContain('1 из 2');
    const supplyLink = fixture.nativeElement.querySelector('[data-test="execution-supply-link"]');
    const productionLink = fixture.nativeElement.querySelector('[data-test="execution-production-link"]');
    expect(supplyLink.getAttribute('href')).toContain('orderId=order-1');
    expect(productionLink.getAttribute('href')).toContain('orderId=order-1');
  });

  it('shows reservation counters keyed by order.number (not _id) and an honest empty warehouse state', async () => {
    await setup(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    await settle();

    expect(reservationsApi.list).toHaveBeenCalledWith({ orderId: 'ORD-001' });
    expect(fixture.nativeElement.querySelector('[data-test="logistics-warehouse-empty"]')).toBeTruthy();

    reservationsApi.list.mockReturnValue(
      of({ ok: true, data: [{ _id: 'r-1', status: 'active' }, { _id: 'r-2', status: 'released' }] }),
    );
    (fixture.componentInstance as unknown as { facade: { loadReservations: () => void } }).facade.loadReservations();
    await settle();

    expect(fixture.nativeElement.querySelector('[data-test="logistics-warehouse-counters"]')?.textContent).toContain(
      'Активных 1',
    );
  });

  it('marks the order shipped via ShipConfirmDialog — whole-order POST ship — reload', async () => {
    await setup(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    await settle();
    ordersApi.ship.mockReturnValue(
      of({ ok: true, data: { order: { ...quotationOrder, status: 'shipped' }, shipmentId: 'ship-1' } } satisfies SilentResult<ShipResult>),
    );
    shipmentsApi.list.mockClear();
    const closed = signal<{ recipient?: string } | undefined>(undefined);
    dialog.open.mockReturnValue({ closed, close: (v?: unknown) => closed.set(v as { recipient?: string } | undefined) });

    expect(fixture.nativeElement.querySelector('[data-test="logistics-shipment-none"]')).toBeFalsy();
    (fixture.nativeElement.querySelector('[data-test="logistics-ship-button"]') as HTMLButtonElement).click();
    closed.set({ recipient: 'Иванов' });
    await settle();

    expect(ordersApi.ship).toHaveBeenCalledWith('order-1', { recipient: 'Иванов' });
    expect(shipmentsApi.list).toHaveBeenCalledTimes(1);
  });

  it('cancels an active pre-dispatch shipment via the destructive confirm dialog', async () => {
    await setup(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    await settle();
    shipmentsApi.list.mockReturnValue(
      of({
        ok: true,
        data: [{ _id: 'ship-1', number: 'SHP-1', status: 'draft', date: '2026-09-10T00:00:00Z', docs: [] }],
      }),
    );
    shipmentsApi.cancelShipment.mockReturnValue(of({ ok: true, data: {} }));
    (fixture.componentInstance as unknown as { facade: { loadShipments: () => void } }).facade.loadShipments();
    await settle();

    expect(fixture.nativeElement.querySelector('[data-test="logistics-shipment-summary"]')?.textContent).toContain(
      'SHP-1',
    );
    expect(fixture.nativeElement.querySelector('[data-test="logistics-shipment-no-docs"]')).toBeTruthy();
    const closed = signal<boolean | undefined>(undefined);
    dialog.open.mockReturnValue({ closed, close: (v?: boolean) => closed.set(v) });

    (fixture.nativeElement.querySelector('[data-test="logistics-cancel-shipment"]') as HTMLButtonElement).click();
    closed.set(true);
    await settle();

    expect(shipmentsApi.cancelShipment).toHaveBeenCalledWith('ship-1');
  });

  it('hides the cancel button once a shipment is dispatched (honest disabled state, not a free toggle)', async () => {
    await setup(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    await settle();
    shipmentsApi.list.mockReturnValue(
      of({
        ok: true,
        data: [{ _id: 'ship-2', number: 'SHP-2', status: 'in_transit', date: '2026-09-10T00:00:00Z', docs: [] }],
      }),
    );
    (fixture.componentInstance as unknown as { facade: { loadShipments: () => void } }).facade.loadShipments();
    await settle();

    expect(fixture.nativeElement.querySelector('[data-test="logistics-shipment-summary"]')?.textContent).toContain(
      'SHP-2',
    );
    expect(fixture.nativeElement.querySelector('[data-test="logistics-cancel-shipment"]')).toBeNull();
  });

  it('renders workflow chips with correct hrefs (orderId on the ones that need it) and «Заказ» as current', async () => {
    await setup(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    await settle();

    const home = fixture.nativeElement.querySelector('[data-test="order-workflow-chip-home"]');
    const quotation = fixture.nativeElement.querySelector('[data-test="order-workflow-chip-quotation"]');
    const production = fixture.nativeElement.querySelector('[data-test="order-workflow-chip-production"]');
    const supply = fixture.nativeElement.querySelector('[data-test="order-workflow-chip-supply"]');
    const shipping = fixture.nativeElement.querySelector('[data-test="order-workflow-chip-shipping"]');
    const current = fixture.nativeElement.querySelector('[data-test="order-workflow-chip-order"]');

    expect(home?.getAttribute('href')).toBe('/home');
    expect(quotation?.getAttribute('href')).toBe('/studio');
    expect(production?.getAttribute('href')).toContain('orderId=order-1');
    expect(supply?.getAttribute('href')).toContain('orderId=order-1');
    expect(shipping?.getAttribute('href')).toContain('orderId=order-1');
    expect(current?.tagName).toBe('SPAN');
    expect(current?.getAttribute('aria-current')).toBe('page');
    expect(current?.textContent).toContain('Заказ');
  });

  it('renders an honest empty documents state (no fake list) with a working templates deep-link', async () => {
    await setup(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    await settle();

    expect(fixture.nativeElement.querySelector('[data-test="documents-empty"]')?.textContent).toContain(
      'Нет связанных документов',
    );
    const link = fixture.nativeElement.querySelector('[data-test="documents-templates-link"]');
    expect(link?.getAttribute('href')).toContain('source=order');
    expect(link?.getAttribute('href')).toContain('sourceId=order-1');
  });

  it('renders «Без КП» without any stub-proposal CTA for a direct order', async () => {
    await setup(of({ ok: true, data: directOrder } satisfies SilentResult<Order>));
    await settle();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Без КП');
    expect(text).not.toContain('Создать черновик КП');
    expect(fixture.nativeElement.innerHTML).not.toContain('stub-proposal');
    expect(fixture.nativeElement.querySelector('[data-test="order-open-studio"]')).toBeNull();
  });

  it('offers «КП в студии» when quotationId exists and navigates via studio query', async () => {
    await setup(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    await settle();

    const open = fixture.nativeElement.querySelector('[data-test="order-open-studio"]');
    expect(open).toBeTruthy();
    open.click();
    await settle();

    expect(router.navigate).toHaveBeenCalledWith(['/studio'], { queryParams: { quotationId: 'quotation-1' } });
  });

  it('sends PATCH { isPaid } from the paid toggle and reflects the server answer', async () => {
    ordersApi = { getById: jest.fn(), update: jest.fn(), cancel: jest.fn(), setLineReady: jest.fn(), ship: jest.fn() };
    organizationsApi = { getById: jest.fn().mockReturnValue(of({ ok: true, data: { name: 'Наша фирма' } })) };
    dialog = { open: jest.fn() };
    productsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [], total: 0, page: 1, limit: 50 } })) };
    compositionApi = { getProductTree: jest.fn() };
    supplyApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    reservationsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    shipmentsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })), cancelShipment: jest.fn() };
    ordersApi.getById.mockReturnValue(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    ordersApi.update.mockReturnValue(
      of({ ok: true, data: { ...quotationOrder, isPaid: false } } satisfies SilentResult<Order>),
    );
    toast = { error: jest.fn(), success: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [OrderDetailPage],
      providers: [
        provideRouter([]),
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiToastService, useValue: toast },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'order-1' } } } },
        { provide: PiOrganizationsService, useValue: organizationsApi },
        { provide: PiDialogService, useValue: dialog },
        { provide: PiProductsService, useValue: productsApi },
        { provide: PiCompositionService, useValue: compositionApi },
        { provide: PiSupplyRequestsService, useValue: supplyApi },
        { provide: PiReservationsService, useValue: reservationsApi },
        { provide: PiShipmentsService, useValue: shipmentsApi },
      ],
    }).compileComponents();
    await configureRouterSpy();
    fixture = TestBed.createComponent(OrderDetailPage);
    fixture.detectChanges();
    await settle();

    const toggle = fixture.nativeElement.querySelector('[data-test="order-paid-toggle"]') as HTMLInputElement;
    expect(toggle.checked).toBe(true);
    toggle.click();
    await settle();

    expect(ordersApi.update).toHaveBeenCalledWith('order-1', { isPaid: false });
    const updated = fixture.nativeElement.querySelector('[data-test="order-paid-toggle"]') as HTMLInputElement;
    expect(updated.checked).toBe(false);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows the org name resolved from organizationId and confirms a draft order via the confirm dialog', async () => {
    await setup(of({ ok: true, data: { ...directOrder, organizationId: 'org-1' } } satisfies SilentResult<Order>));
    await settle();

    expect(organizationsApi.getById).toHaveBeenCalledWith('org-1');
    await settle();
    expect(fixture.nativeElement.textContent).toContain('Наша фирма');

    ordersApi.update.mockReturnValue(
      of({ ok: true, data: { ...directOrder, status: 'confirmed' } } satisfies SilentResult<Order>),
    );
    const closed = signal<boolean | undefined>(undefined);
    dialog.open.mockReturnValue({ closed, close: (v?: boolean) => closed.set(v) });

    const confirmBtn = fixture.nativeElement.querySelector('[data-test="order-confirm"] button') as HTMLButtonElement;
    expect(confirmBtn).toBeTruthy();
    confirmBtn.click();
    closed.set(true);
    await settle();

    expect(ordersApi.update).toHaveBeenCalledWith('order-2', { status: 'confirmed' });
    expect(fixture.nativeElement.textContent).toContain('Подтверждён');
  });

  it('cancels an order via the destructive confirm dialog: POST /orders/:id/cancel, reflects server answer', async () => {
    await setup(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    await settle();

    ordersApi.cancel.mockReturnValue(
      of({ ok: true, data: { ...quotationOrder, status: 'cancelled' } } satisfies SilentResult<Order>),
    );
    const closed = signal<boolean | undefined>(undefined);
    dialog.open.mockReturnValue({ closed, close: (v?: boolean) => closed.set(v) });

    const cancelBtn = fixture.nativeElement.querySelector('[data-test="order-cancel"] button') as HTMLButtonElement;
    expect(cancelBtn).toBeTruthy();
    cancelBtn.click();
    closed.set(true);
    await settle();

    expect(ordersApi.cancel).toHaveBeenCalledWith('order-1');
    expect(fixture.nativeElement.textContent).toContain('Отменён');
  });

  it('does not lie about payment when the PATCH fails: toast + checkbox keeps the old fact', async () => {
    ordersApi = { getById: jest.fn(), update: jest.fn(), cancel: jest.fn(), setLineReady: jest.fn(), ship: jest.fn() };
    organizationsApi = { getById: jest.fn().mockReturnValue(of({ ok: true, data: { name: 'Наша фирма' } })) };
    dialog = { open: jest.fn() };
    productsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [], total: 0, page: 1, limit: 50 } })) };
    compositionApi = { getProductTree: jest.fn() };
    supplyApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    reservationsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    shipmentsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })), cancelShipment: jest.fn() };
    ordersApi.getById.mockReturnValue(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    ordersApi.update.mockReturnValue(
      of({ ok: false, error: new HttpErrorResponse({ status: 500 }) } satisfies SilentResult<Order>),
    );
    toast = { error: jest.fn(), success: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [OrderDetailPage],
      providers: [
        provideRouter([]),
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiToastService, useValue: toast },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'order-1' } } } },
        { provide: PiOrganizationsService, useValue: organizationsApi },
        { provide: PiDialogService, useValue: dialog },
        { provide: PiProductsService, useValue: productsApi },
        { provide: PiCompositionService, useValue: compositionApi },
        { provide: PiSupplyRequestsService, useValue: supplyApi },
        { provide: PiReservationsService, useValue: reservationsApi },
        { provide: PiShipmentsService, useValue: shipmentsApi },
      ],
    }).compileComponents();
    await configureRouterSpy();
    fixture = TestBed.createComponent(OrderDetailPage);
    fixture.detectChanges();
    await settle();

    const toggle = fixture.nativeElement.querySelector('[data-test="order-paid-toggle"]') as HTMLInputElement;
    toggle.click();
    await settle();

    expect(ordersApi.update).toHaveBeenCalledWith('order-1', { isPaid: false });
    expect(toast.error).toHaveBeenCalled();
    const after = fixture.nativeElement.querySelector('[data-test="order-paid-toggle"]') as HTMLInputElement;
    expect(after.checked).toBe(true);
  });
});
