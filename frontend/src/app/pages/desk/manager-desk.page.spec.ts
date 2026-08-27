import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { AuthService, type AuthUser } from '../../core/auth.service';
import { API_BASE_URL } from '../../core/api.tokens';
import { PiChromeToolsService } from '../../shared/chrome/pi-chrome-tools.service';
import { PiToastService } from '../../shared/ui/toast';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { CatalogAppearanceService } from '../../shared/ui/catalog/catalog-appearance.service';
import { Order } from '../orders/orders.service';
import { ManagerDeskPage, type ManagerDeskPanel } from './manager-desk.page';

const ORDERS: Order[] = [
  {
    _id: 'o1',
    number: 'З-1001',
    status: 'draft',
    counterpartyId: 'cp1',
    items: [
      { productId: 'p1', productName: 'Стол переговорный', quantity: 1, unitPrice: 100 },
      { productId: 'p2', productName: 'Опоры металлические', quantity: 2, unitPrice: 50 },
    ],
  },
  {
    _id: 'o2',
    number: 'З-1002',
    status: 'in_production',
    counterpartyId: 'cp2',
    items: [],
  },
  {
    _id: 'o3',
    number: 'З-1003',
    status: 'ready',
    counterpartyId: { _id: 'cp3', name: 'ООО Белый дуб' },
    items: [],
  },
];

const COUNTERPARTIES = [
  { _id: 'cp1', name: 'ООО Северный свет', shortName: 'Северный свет', inn: '1' },
  { _id: 'cp2', name: 'ИП Марина Волкова', inn: '2' },
];

const authUser = signal<AuthUser | null>(null);

const STATUS_FILTER_KEY = (userId: string | null | undefined) =>
  `kppdf.desk.statusFilter.v1:${userId ?? 'anonymous'}`;

function flushBase(httpMock: HttpTestingController): void {
  httpMock.expectOne((req) => req.url === '/api/orders' && req.method === 'GET').flush(ORDERS);
  httpMock
    .expectOne((req) => req.url === '/api/counterparties' && req.method === 'GET')
    .flush({ items: COUNTERPARTIES, total: COUNTERPARTIES.length, page: 1, limit: 200 });
}

function flushPanelLookups(httpMock: HttpTestingController, opts: { sites?: boolean } = {}): void {
  httpMock
    .expectOne((req) => req.url === '/api/counterparties' && req.method === 'GET')
    .flush({ items: COUNTERPARTIES, total: COUNTERPARTIES.length, page: 1, limit: 200 });
  httpMock
    .expectOne((req) => req.url === '/api/products' && req.method === 'GET')
    .flush({ items: [], total: 0, page: 1, limit: 200 });
  httpMock
    .expectOne((req) => req.url === '/api/users' && req.method === 'GET')
    .flush({ items: [], total: 0, page: 1, limit: 100 });
  httpMock
    .expectOne((req) => req.url === '/api/organizations' && req.method === 'GET')
    .flush({ items: [], total: 0, page: 1, limit: 200 });
  if (opts.sites) {
    httpMock
      .expectOne((req) => req.url === '/api/sites' && req.method === 'GET')
      .flush([{ _id: 'site-x', counterpartyId: 'cp2', name: 'Объект' }]);
  }
}

function flushSupply(httpMock: HttpTestingController, orderId: string): void {
  httpMock
    .match(
      (req) =>
        req.method === 'GET' &&
        req.url === '/api/supply-tasks' &&
        req.params.get('orderId') === orderId,
    )
    .forEach((req) => req.flush([]));
  // DESK-430: expand also lazy-loads shipments (order-hub-tray ngOnInit,
  // mode="desk"). `.match()` is a safe no-op when nothing matches yet.
  httpMock
    .match(
      (req) =>
        req.method === 'GET' &&
        req.url === '/api/shipments' &&
        req.params.get('orderId') === orderId,
    )
    .forEach((req) => req.flush([]));
}

function flushProductTree(httpMock: HttpTestingController, productId: string, name: string): void {
  httpMock
    .match((req) => req.method === 'GET' && req.url === `/api/products/${productId}/tree`)
    .forEach((req) =>
      req.flush({ _id: productId, name, kind: 'product', quantity: 1, children: [] }),
    );
}

async function tickMicrotask(): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 0));
}

describe('ManagerDeskPage (TZ-DESK-402)', () => {
  let fixture: ComponentFixture<ManagerDeskPage>;
  let httpMock: HttpTestingController;
  let chromeTools: PiChromeToolsService;
  let toast: PiToastService;
  let queryParams$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let navigate: jest.SpyInstance;
  let dialogClosed: ReturnType<typeof signal<boolean | undefined>>;
  let dialogOpen: jest.Mock;

  beforeEach(async () => {
    authUser.set(null);
    localStorage.clear();
    queryParams$ = new BehaviorSubject(convertToParamMap({}));
    dialogClosed = signal<boolean | undefined>(undefined);
    dialogOpen = jest.fn(() => {
      dialogClosed = signal<boolean | undefined>(undefined);
      return { closed: dialogClosed, close: jest.fn() };
    });

    await TestBed.configureTestingModule({
      imports: [ManagerDeskPage],
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'production', children: [] },
          { path: 'design', children: [{ path: 'combine', children: [] }] },
          { path: 'desk', children: [] },
          { path: 'doc-constructor/templates', children: [] },
        ]),
        { provide: API_BASE_URL, useValue: '/api' },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: queryParams$.asObservable() },
        },
        { provide: AuthService, useValue: { user: authUser } },
        {
          provide: PiToastService,
          useValue: { success: jest.fn(), error: jest.fn(), show: jest.fn() },
        },
        { provide: PiDialogService, useValue: { open: dialogOpen } },
        {
          provide: CatalogAppearanceService,
          useValue: { load: () => of(null), palette: () => undefined },
        },
        PiChromeToolsService,
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    chromeTools = TestBed.inject(PiChromeToolsService);
    toast = TestBed.inject(PiToastService);
    navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    chromeTools.clear('manager-desk');
    fixture = TestBed.createComponent(ManagerDeskPage);
    fixture.detectChanges();
  });

  afterEach(() => {
    chromeTools.clear('manager-desk');
    fixture.destroy();
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  function page(): ManagerDeskPage & {
    expandedId: () => string | null;
    panel: () => ManagerDeskPanel | null;
    toggleOrder: (id: string) => void;
    openPanel: (panel: ManagerDeskPanel) => void;
    closePanel: () => void;
    onOrderSaved: (order: Order) => void;
    onEscape: () => void;
    onSearchInput: (event: Event) => void;
    toggleStatus: (status: Order['status']) => void;
    setStatusPreset: (preset: 'active' | 'all') => void;
    refresh: () => void;
    showMore: () => void;
    statusFilter: () => Set<Order['status']>;
    visibleOrders: () => Order[];
    summaryCounts: () => Record<Order['status'], number>;
    view: () => 'desk' | 'gantt' | 'combine';
    viewStudioRoute: () => string;
    onAddLines: (order?: Order) => void;
    onPrimaryCta: (order: Order) => void;
    onCancelShipment: (shipment: Record<string, unknown>) => void;
  } {
    return fixture.componentInstance as unknown as ManagerDeskPage & {
      expandedId: () => string | null;
      panel: () => ManagerDeskPanel | null;
      toggleOrder: (id: string) => void;
      openPanel: (panel: ManagerDeskPanel) => void;
      closePanel: () => void;
      onOrderSaved: (order: Order) => void;
      onEscape: () => void;
      onSearchInput: (event: Event) => void;
      toggleStatus: (status: Order['status']) => void;
      setStatusPreset: (preset: 'active' | 'all') => void;
      refresh: () => void;
      showMore: () => void;
      statusFilter: () => Set<Order['status']>;
      visibleOrders: () => Order[];
      summaryCounts: () => Record<Order['status'], number>;
      view: () => 'desk' | 'gantt' | 'combine';
      viewStudioRoute: () => string;
      onAddLines: (order?: Order) => void;
      onPrimaryCta: (order: Order) => void;
      onCancelShipment: (shipment: Record<string, unknown>) => void;
    };
  }

  it('renders live orders in one group-workspace chip row without page-chrome', async () => {
    queryParams$.next(convertToParamMap({ status: 'all' }));
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="group-chips"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="desk-page-chrome"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="desk-workflow-crumbs"]')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Рабочий стол');

    const rows = fixture.nativeElement.querySelectorAll(
      '[data-test="desk-order-row"]',
    ) as NodeListOf<HTMLButtonElement>;
    expect(rows).toHaveLength(3);
    expect([...rows].map((row) => row.getAttribute('data-status'))).toEqual([
      'draft',
      'in_production',
      'ready',
    ]);
    expect(fixture.nativeElement.textContent).toContain('З-1001');
    expect(fixture.nativeElement.textContent).toContain('Северный свет');
    expect(fixture.nativeElement.textContent).toContain('ИП Марина Волкова');
    expect(fixture.nativeElement.textContent).toContain('ООО Белый дуб');
  });

  it('deletes an order only after confirmation and does not toggle the row', async () => {
    queryParams$.next(convertToParamMap({ status: 'all' }));
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll(
      '[data-test="desk-order-row"]',
    ) as NodeListOf<HTMLButtonElement>;
    const deleteButton = fixture.nativeElement.querySelector(
      '[data-test="desk-order-delete"]',
    ) as HTMLButtonElement;
    deleteButton.click();
    fixture.detectChanges();

    expect(page().expandedId()).toBeNull();
    expect(dialogOpen).toHaveBeenCalledWith(
      AlertDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({ title: 'Удалить заказ?', variant: 'destructive' }),
      }),
    );
    dialogClosed.set(false);
    await tickMicrotask();
    httpMock.expectNone((req) => req.url === '/api/orders/o1' && req.method === 'DELETE');

    rows[0]!.click();
    fixture.detectChanges();
    flushSupply(httpMock, 'o1');
    // UX-445I: composition stays collapsed — no tree HTTP until toggle.
    await tickMicrotask();
    fixture.detectChanges();
    const expandedDelete = fixture.nativeElement.querySelector(
      '[data-test="desk-order-delete"]',
    ) as HTMLButtonElement;
    expandedDelete.click();
    dialogClosed.set(true);
    fixture.detectChanges();
    await tickMicrotask();
    const remove = httpMock.expectOne(
      (req) => req.url === '/api/orders/o1' && req.method === 'DELETE',
    );
    remove.flush(null);
    await tickMicrotask();
    fixture.detectChanges();
    const reload = httpMock.expectOne((req) => req.url === '/api/orders' && req.method === 'GET');
    reload.flush(ORDERS.filter((order) => order._id !== 'o1'));
    await tickMicrotask();
    fixture.detectChanges();

    expect(page().expandedId()).toBeNull();
    expect(toast.success).toHaveBeenCalledWith('Заказ удалён');
  });

  it('TZ-DESK-424: delete sits in the same grid row as the order row, not a separate flex column', async () => {
    queryParams$.next(convertToParamMap({ status: 'all' }));
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    // `.manager-desk__order-actions` is `display: grid` (see component styles) with
    // `grid-template-columns: 1fr auto` — row fills the row, delete is the last
    // column, both direct children of the same grid, not a separate flex strip.
    const actions = fixture.nativeElement.querySelector(
      '.manager-desk__order-actions',
    ) as HTMLElement;
    const row = actions.querySelector('[data-test="desk-order-row"]') as HTMLElement;
    const deleteButton = actions.querySelector('[data-test="desk-order-delete"]') as HTMLElement;
    expect(row.parentElement).toBe(actions);
    expect(deleteButton.parentElement).toBe(actions);
    expect(Array.from(actions.children)).toEqual([row, deleteButton]);
  });

  it('expands a live order into the tray and toggles closed with crumb suffix', async () => {
    queryParams$.next(convertToParamMap({ status: 'all' }));
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll(
      '[data-test="desk-order-row"]',
    ) as NodeListOf<HTMLButtonElement>;
    rows[0]!.click();
    fixture.detectChanges();
    flushSupply(httpMock, 'o1');
    // UX-445I: composition collapsed by default — no tree HTTP yet.
    await tickMicrotask();
    fixture.detectChanges();

    expect(page().expandedId()).toBe('o1');
    const item = rows[0]!.parentElement!.parentElement!;
    const tray = item.querySelector('[data-test="order-hub-tray"]');
    expect(tray).toBeTruthy();
    expect(tray?.getAttribute('data-mode')).toBe('desk');
    // TZ-DESK-424: the tray summary bar no longer repeats "Клиент: …" — the
    // name is already shown once in the queue row/group separator above it.
    expect(tray?.querySelector('[data-test="order-summary-client"]')).toBeNull();
    expect(item.textContent).toContain('Северный свет');
    expect(tray?.querySelector('[data-test="order-summary-status"]')?.textContent).toContain(
      'Черновик',
    );
    expect(tray?.querySelector('[data-test="desk-primary-cta"]')).toBeTruthy();

    const compositionToggle = tray?.querySelector(
      '[data-test="order-composition-toggle"]',
    ) as HTMLButtonElement;
    expect(compositionToggle.getAttribute('aria-expanded')).toBe('false');
    expect(tray?.querySelector('[data-test="order-composition-tree"]')).toBeNull();

    compositionToggle.click();
    fixture.detectChanges();
    flushProductTree(httpMock, 'p1', 'Стол переговорный');
    flushProductTree(httpMock, 'p2', 'Опоры металлические');
    await tickMicrotask();
    fixture.detectChanges();

    expect(compositionToggle.getAttribute('aria-expanded')).toBe('true');
    expect(tray?.querySelector('[data-test="order-composition-tree"]')).toBeTruthy();
    expect(tray?.querySelectorAll('[data-test="composition-tree"]')).toHaveLength(2);

    const crumb = fixture.nativeElement.querySelector('[data-test="desk-order-crumb"]');
    expect(crumb?.textContent).toContain('З-1001');
    expect(crumb?.getAttribute('aria-current')).toBe('page');

    rows[0]!.click();
    fixture.detectChanges();
    expect(page().expandedId()).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="order-hub-tray"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="desk-order-crumb"]')).toBeNull();
  });

  it('keeps one write-path: desk hosts the shared order-form-panel, no fixture', async () => {
    flushBase(httpMock);
    await tickMicrotask();

    const source = require('fs').readFileSync(
      require('path').join(__dirname, 'manager-desk.page.ts'),
      'utf8',
    );
    expect(source).toContain('app-order-form-panel');
    expect(source).toContain('app-pi-group-workspace');
    expect(source).toContain('app-order-hub-tray');
    expect(source).not.toContain('app-desk-order-tray');
    expect(source).not.toContain('MANAGER_DESK_FIXTURE');
    expect(source).not.toContain('manager-desk__workflow');
  });

  it('shows RU toast and clears an invalid orderId without crashing', async () => {
    queryParams$.next(convertToParamMap({ orderId: 'missing', panel: null, status: 'all' }));
    fixture.detectChanges();

    expect(toast.error).not.toHaveBeenCalled();

    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    expect(toast.error).toHaveBeenCalledWith('Заказ не найден');
    expect(page().expandedId()).toBeNull();
    expect(navigate).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[data-test="manager-desk"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('[data-test="desk-order-row"]')).toHaveLength(3);
  });

  it('create flyout hosts the shared order form panel', async () => {
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    page().openPanel('create');
    fixture.detectChanges();
    flushPanelLookups(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    const flyout = fixture.nativeElement.querySelector('[data-test="desk-flyout"]');
    expect(flyout?.getAttribute('data-panel')).toBe('create');
    expect(flyout?.getAttribute('data-side')).toBe('left');
    expect(flyout?.querySelector('[data-test="order-form"]')).toBeTruthy();
    expect(flyout?.querySelector('[data-test="order-form-actions"]')).toBeTruthy();
  });

  it('431: supply flyout is wide (48rem) so the quick-order strips fit', async () => {
    queryParams$.next(convertToParamMap({ orderId: 'o2', status: 'all' }));
    fixture.detectChanges();
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();
    flushSupply(httpMock, 'o2');
    await tickMicrotask();
    fixture.detectChanges();

    page().openPanel('supply');
    fixture.detectChanges();
    await tickMicrotask();
    // SupplyQuickOrderComponent (hosted in the flyout) loads its lookups.
    // res.data — plain arrays for categories/materials/persons/supply-requests.
    httpMock
      .match((req) => req.url.startsWith('/api/categories') && req.method === 'GET')
      .forEach((req) => req.flush([]));
    httpMock
      .match((req) => req.url.startsWith('/api/materials') && req.method === 'GET')
      .forEach((req) => req.flush([]));
    httpMock
      .match((req) => req.url.startsWith('/api/organizations') && req.method === 'GET')
      .forEach((req) => req.flush({ items: [], total: 0 }));
    httpMock
      .match((req) => req.url.startsWith('/api/persons') && req.method === 'GET')
      .forEach((req) => req.flush([]));
    httpMock
      .match((req) => req.url === '/api/supply-requests' && req.method === 'GET')
      .forEach((req) => req.flush([]));
    fixture.detectChanges();

    const flyout = fixture.nativeElement.querySelector('[data-test="desk-flyout"]');
    expect(flyout?.getAttribute('data-panel')).toBe('supply');
    expect(flyout?.className).toContain('manager-desk__flyout--wide');
    expect(flyout?.querySelector('[data-test="supply-quick-order"]')).toBeTruthy();
  });

  it('after create selects and expands the new order', async () => {
    flushBase(httpMock);
    await fixture.whenStable();
    fixture.detectChanges();

    navigate.mockClear();
    const created: Order = { _id: 'o4', number: 'З-1004', status: 'draft', items: [] };
    page().onOrderSaved(created);
    // Simulate the router writing ?orderId= after navigateQuery.
    queryParams$.next(convertToParamMap({ orderId: 'o4', panel: null }));

    expect(page().panel()).toBeNull();
    expect(page().expandedId()).toBe('o4');
    expect(navigate).toHaveBeenCalled();

    fixture.detectChanges();
    // Reload returns the new order; the expanded row/crumb resolves.
    const reloads = httpMock.match((req) => req.url === '/api/orders' && req.method === 'GET');
    expect(reloads).toHaveLength(1);
    reloads[0].flush([...ORDERS, created]);
    await tickMicrotask();
    fixture.detectChanges();
    flushSupply(httpMock, 'o4');

    expect(
      fixture.nativeElement.querySelector('[data-test="desk-order-crumb"]')?.textContent,
    ).toContain('З-1004');
  });

  it('DESK-423 opens the shared items form in bom panel and confirms only from desk', async () => {
    queryParams$.next(convertToParamMap({ status: 'all' }));
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    const emptyOrder = ORDERS[1]!;
    page().onAddLines(emptyOrder);
    fixture.detectChanges();
    expect(page().panel()).toBe('bom');
    expect(
      fixture.nativeElement.querySelector('[data-test="desk-flyout"]')?.getAttribute('data-panel'),
    ).toBe('bom');
    expect(fixture.nativeElement.querySelector('[data-test="order-form"]')).toBeTruthy();
    flushPanelLookups(httpMock);
    await tickMicrotask();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#order-sec-basics')).toBeNull();

    const confirmable = { ...ORDERS[0]!, siteId: 'site1' };
    page().onAddLines(confirmable);
    fixture.detectChanges();
    page().onPrimaryCta(confirmable);
    const request = httpMock.expectOne(
      (req) => req.url === '/api/orders/o1' && req.method === 'PATCH',
    );
    expect(request.request.body).toEqual({ status: 'confirmed' });
    request.flush({ ...confirmable, status: 'confirmed' });
    expect(toast.success).toHaveBeenCalledWith('Заказ подтверждён');
    httpMock.match((req) => req.url === '/api/supply-tasks').forEach((req) => req.flush([]));
    httpMock.match((req) => req.url === '/api/shipments').forEach((req) => req.flush([]));
    httpMock.match((req) => req.url === '/api/sites').forEach((req) => req.flush([]));
    httpMock
      .match((req) => req.url.includes('/api/products/') && req.url.endsWith('/tree'))
      .forEach((req) =>
        req.flush({ _id: 'p1', name: 'Изделие', kind: 'product', quantity: 1, children: [] }),
      );
    httpMock
      .match((req) => req.url === '/api/sites/ensure-default')
      .forEach((req) => req.flush({ _id: 'site-default', counterpartyId: 'cp1', name: 'Объект' }));
  });

  it('opens right panels only for an expanded order and Escape closes only the flyout', async () => {
    queryParams$.next(convertToParamMap({ status: 'all' }));
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll(
      '[data-test="desk-order-row"]',
    ) as NodeListOf<HTMLButtonElement>;
    rows[1]!.click();
    fixture.detectChanges();
    flushSupply(httpMock, 'o2');

    page().openPanel('edit');
    fixture.detectChanges();
    flushPanelLookups(httpMock, { sites: true });
    await tickMicrotask();
    fixture.detectChanges();

    const flyout = fixture.nativeElement.querySelector('[data-test="desk-flyout"]');
    expect(flyout?.getAttribute('data-panel')).toBe('edit');
    expect(flyout?.getAttribute('data-side')).toBe('right');

    page().onEscape();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="desk-flyout"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="order-hub-tray"]')).toBeTruthy();
    expect(page().expandedId()).toBe('o2');
  });

  it('ROI-523: dirty create form asks discard confirm on Escape; cancel keeps panel, confirm closes + restores focus', async () => {
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    const trigger = document.createElement('button');
    trigger.textContent = 'trigger';
    document.body.appendChild(trigger);
    trigger.focus();

    page().openPanel('create');
    fixture.detectChanges();
    flushPanelLookups(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    // Make the order form dirty through the real CVA input path.
    const numberInput = fixture.nativeElement.querySelector(
      '#ord-number input',
    ) as HTMLInputElement;
    numberInput.value = 'З-9999';
    numberInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Escape on a dirty form → discard confirm via the same PiDialogService as delete.
    page().onEscape();
    fixture.detectChanges();
    expect(dialogOpen).toHaveBeenCalledWith(
      AlertDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Закрыть без сохранения?',
          description: 'Есть несохранённые данные.',
          confirmLabel: 'Закрыть',
          cancelLabel: 'Остаться',
        }),
        width: 'sm',
      }),
    );
    expect(page().panel()).toBe('create');
    expect(fixture.nativeElement.querySelector('[data-test="desk-flyout"]')).toBeTruthy();

    // «Остаться» keeps the panel open (no close, no navigation).
    dialogClosed.set(false);
    await tickMicrotask();
    fixture.detectChanges();
    expect(page().panel()).toBe('create');

    // Confirm «Закрыть» closes the panel and return-focus goes to the trigger (WR-509).
    dialogOpen.mockClear();
    page().onEscape();
    fixture.detectChanges();
    expect(dialogOpen).toHaveBeenCalledTimes(1);
    dialogClosed.set(true);
    await tickMicrotask();
    fixture.detectChanges();

    expect(page().panel()).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="desk-flyout"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);

    trigger.remove();
  });

  it('433: cancel shipment from tray confirms, POSTs cancel-shipment and reloads desk', async () => {
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    page().onCancelShipment({
      _id: 's1',
      number: 'SHP-1',
      status: 'scheduled',
      date: '2026-08-20T10:00:00.000Z',
      items: [],
    });
    fixture.detectChanges();

    expect(dialogOpen).toHaveBeenCalledWith(
      AlertDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({ title: 'Отменить отгрузку?', variant: 'destructive' }),
        width: 'sm',
      }),
    );
    expect(
      httpMock.match((req) => req.url.endsWith('/cancel-shipment') && req.method === 'POST'),
    ).toHaveLength(0);

    dialogClosed.set(true);
    await tickMicrotask();
    fixture.detectChanges();

    const post = httpMock.expectOne(
      (req) => req.url === '/api/shipments/s1/cancel-shipment' && req.method === 'POST',
    );
    post.flush({ _id: 's1', number: 'SHP-1', status: 'cancelled' });
    await tickMicrotask();
    fixture.detectChanges();

    expect(toast.success).toHaveBeenCalledWith('Отгрузка отменена — заказ снова «Готов»');
    // listRes.reload() после успеха.
    const reload = httpMock.expectOne((req) => req.url === '/api/orders' && req.method === 'GET');
    reload.flush(ORDERS);
    await tickMicrotask();
    fixture.detectChanges();
  });

  it('ROI-523: clean create form closes on Escape without a confirm dialog', async () => {
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    page().openPanel('create');
    fixture.detectChanges();
    flushPanelLookups(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    page().onEscape();
    fixture.detectChanges();

    expect(dialogOpen).not.toHaveBeenCalled();
    expect(page().panel()).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="desk-flyout"]')).toBeNull();
  });

  it('417: default view shows all orders when no ?status= or localStorage', async () => {
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll(
      '[data-test="desk-order-row"]',
    ) as NodeListOf<HTMLButtonElement>;
    expect(rows).toHaveLength(3);
    expect([...rows].map((row) => row.getAttribute('data-status'))).toEqual([
      'draft',
      'in_production',
      'ready',
    ]);
    expect(fixture.nativeElement.textContent).toContain('Северный свет');
    expect(fixture.nativeElement.textContent).toContain('ИП Марина Волкова');
    expect(fixture.nativeElement.textContent).toContain('ООО Белый дуб');
  });

  it('410: search filters the queue by client', async () => {
    queryParams$.next(convertToParamMap({ status: 'all' }));
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      '[data-test="desk-search-input"]',
    ) as HTMLInputElement;
    input.value = 'Северный';
    input.dispatchEvent(new Event('input'));
    await new Promise((r) => setTimeout(r, 320));
    fixture.detectChanges();

    expect(
      page()
        .visibleOrders()
        .map((o) => o.number),
    ).toEqual(['З-1001']);
  });

  it('417: filter flyout toggles statuses, persists ?status= and localStorage', async () => {
    authUser.set({
      id: 'u1',
      username: 'manager',
      email: 'm@kppdf.local',
      displayName: 'Менеджер',
      role: 'manager',
      permissions: [],
    });
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    // Default all shows every order.
    expect(
      page()
        .visibleOrders()
        .map((o) => o._id),
    ).toEqual(['o1', 'o2', 'o3']);

    page().openPanel('filter');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="desk-filter"]')).toBeTruthy();

    navigate.mockClear();
    page().setStatusPreset('active');
    fixture.detectChanges();

    expect(
      page()
        .visibleOrders()
        .map((o) => o._id),
    ).toEqual(['o2', 'o3']);
    expect(page().statusFilter().has('draft')).toBe(false);
    expect(navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: expect.objectContaining({ status: 'confirmed,in_production,ready' }),
        queryParamsHandling: 'merge',
      }),
    );
    expect(localStorage.getItem(STATUS_FILTER_KEY('u1'))).toBe('confirmed,in_production,ready');
  });

  it('417: status filter survives remount via localStorage per user', async () => {
    authUser.set({
      id: 'u1',
      username: 'manager',
      email: 'm@kppdf.local',
      displayName: 'Менеджер',
      role: 'manager',
      permissions: [],
    });
    localStorage.setItem(STATUS_FILTER_KEY('u1'), 'confirmed,in_production,ready');

    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    expect(
      page()
        .visibleOrders()
        .map((o) => o._id),
    ).toEqual(['o2', 'o3']);

    fixture.destroy();
    chromeTools.clear('manager-desk');
    httpMock.verify();

    fixture = TestBed.createComponent(ManagerDeskPage);
    fixture.detectChanges();
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    expect(
      page()
        .visibleOrders()
        .map((o) => o._id),
    ).toEqual(['o2', 'o3']);
  });

  it('417: ?status= in URL wins over localStorage (deep-link)', async () => {
    authUser.set({
      id: 'u1',
      username: 'manager',
      email: 'm@kppdf.local',
      displayName: 'Менеджер',
      role: 'manager',
      permissions: [],
    });
    localStorage.setItem(STATUS_FILTER_KEY('u1'), 'confirmed,in_production,ready');
    queryParams$.next(convertToParamMap({ status: 'all' }));

    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    expect(
      page()
        .visibleOrders()
        .map((o) => o._id),
    ).toEqual(['o1', 'o2', 'o3']);
  });

  it('410: summary flyout shows read-only status counts for the search set', async () => {
    queryParams$.next(convertToParamMap({ status: 'all' }));
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    page().openPanel('summary');
    fixture.detectChanges();

    const summary = fixture.nativeElement.querySelector('[data-test="desk-summary"]');
    expect(summary).toBeTruthy();
    const count = (status: string): string | undefined =>
      summary.querySelector(`[data-test="desk-summary-count-${status}"]`)?.textContent?.trim();
    expect(count('draft')).toBe('1');
    expect(count('in_production')).toBe('1');
    expect(count('ready')).toBe('1');
    expect(count('shipped')).toBe('0');
  });

  it('410: refresh re-fetches orders and preserves the expanded order', async () => {
    queryParams$.next(convertToParamMap({ orderId: 'o1', status: 'all' }));
    fixture.detectChanges();
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();
    flushSupply(httpMock, 'o1');
    await tickMicrotask();
    fixture.detectChanges();
    expect(page().expandedId()).toBe('o1');

    page().refresh();
    fixture.detectChanges();
    const reloads = httpMock.match((req) => req.url === '/api/orders' && req.method === 'GET');
    expect(reloads).toHaveLength(1);
    reloads[0].flush(ORDERS);
    await tickMicrotask();
    fixture.detectChanges();
    flushSupply(httpMock, 'o1');
    // UX-445I: composition not auto-loaded on refresh either.
    await tickMicrotask();
    fixture.detectChanges();

    expect(page().expandedId()).toBe('o1');
    expect(
      fixture.nativeElement.querySelector('[data-test="desk-order-crumb"]')?.textContent,
    ).toContain('З-1001');
  });

  it('411: workflow strip and rail tools respect page ACL', async () => {
    authUser.set({
      id: 'u1',
      username: 'manager',
      email: 'm@kppdf.local',
      displayName: 'Менеджер',
      role: 'manager',
      permissions: [],
      pages: ['orders'],
    });
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    const chips = fixture.nativeElement.querySelector('[data-test="group-chips"]')!;
    expect(chips.querySelector('[data-test="desk-workflow-desk"]')).toBeTruthy();
    expect(chips.querySelector('[data-test="desk-workflow-combine"]')).toBeTruthy();
    expect(chips.querySelector('[data-test="desk-workflow-proposal"]')).toBeNull();
    expect(chips.querySelector('[data-test="desk-workflow-gantt"]')).toBeNull();
    expect(chips.querySelector('[data-test="desk-workflow-supply"]')).toBeNull();
    expect(chips.querySelector('[data-test="desk-workflow-shipping"]')).toBeNull();

    const rows = fixture.nativeElement.querySelectorAll(
      '[data-test="desk-order-row"]',
    ) as NodeListOf<HTMLButtonElement>;
    // o2 (in_production) — default shows all statuses, so draft o1 is rows[0].
    rows[1]!.click();
    fixture.detectChanges();
    flushSupply(httpMock, 'o2');
    await tickMicrotask();
    fixture.detectChanges();

    // DESK-427: правый rail пуст при expand — дубли tray/chips убраны.
    expect(chromeTools.rightTools()).toHaveLength(0);
  });

  it('407: ?view=gantt&orderId= renders the gantt studio-link view with crumbs', async () => {
    queryParams$.next(convertToParamMap({ view: 'gantt', orderId: 'o1' }));
    fixture.detectChanges();
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="desk-gantt-view"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="desk-order-queue"]')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-test="desk-order-crumb"]')?.textContent,
    ).toContain('З-1001');
    expect(
      fixture.nativeElement.querySelector('[data-test="desk-view-crumb"]')?.textContent,
    ).toContain('Гант');
    const link = fixture.nativeElement.querySelector(
      '[data-test="desk-view-open-studio"]',
    ) as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.textContent).toContain('Гант');
    expect(page().view()).toBe('gantt');
    expect(page().viewStudioRoute()).toBe('/production');
    expect(fixture.nativeElement.textContent).not.toContain('Рабочий стол');
    expect(link.getAttribute('href')).toContain('/production');
    expect(link.getAttribute('href')).toContain('from=desk');
  });

  it('426: expanded order merges orderId+from=desk into workflow chips (deep-links)', async () => {
    authUser.set({
      id: 'u1',
      username: 'manager',
      email: 'm@kppdf.local',
      displayName: 'Менеджер',
      role: 'manager',
      permissions: [],
      pages: ['orders', 'proposals', 'supply', 'shipping', 'production'],
    });
    queryParams$.next(convertToParamMap({ orderId: 'o1', status: 'all' }));
    fixture.detectChanges();
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();
    flushSupply(httpMock, 'o1');
    // UX-445I: composition collapsed — no tree preload for deep-link expand.
    await tickMicrotask();
    fixture.detectChanges();
    expect(page().expandedId()).toBe('o1');

    const href = (testId: string): string =>
      (
        fixture.nativeElement.querySelector(`[data-test="${testId}"]`) as HTMLAnchorElement | null
      )?.getAttribute('href') ?? '';

    // Стол сохраняет expand.
    expect(href('desk-workflow-desk')).toContain('/desk');
    expect(href('desk-workflow-desk')).toContain('orderId=o1');
    expect(href('desk-workflow-desk')).toContain('view=desk');
    // КП — source=order.
    expect(href('desk-workflow-proposal')).toContain('/proposals/create');
    expect(href('desk-workflow-proposal')).toContain('source=order');
    expect(href('desk-workflow-proposal')).toContain('sourceId=o1');
    // Снабжение — фильтр заказа + from=desk.
    expect(href('desk-workflow-supply')).toContain('/supply');
    expect(href('desk-workflow-supply')).toContain('orderId=o1');
    expect(href('desk-workflow-supply')).toContain('from=desk');
    // Отгрузка — фильтр заказа + from=desk.
    expect(href('desk-workflow-shipping')).toContain('/shipping');
    expect(href('desk-workflow-shipping')).toContain('orderId=o1');
    expect(href('desk-workflow-shipping')).toContain('from=desk');
    // Комбайн/Гант сохраняют desk-stub view + orderId.
    expect(href('desk-workflow-combine')).toContain('view=combine');
    expect(href('desk-workflow-combine')).toContain('orderId=o1');
    expect(href('desk-workflow-gantt')).toContain('view=gantt');
    expect(href('desk-workflow-gantt')).toContain('orderId=o1');
  });

  it('426: workflow chips stay static without an expanded order', async () => {
    authUser.set({
      id: 'u1',
      username: 'manager',
      email: 'm@kppdf.local',
      displayName: 'Менеджер',
      role: 'manager',
      permissions: [],
      pages: ['orders', 'proposals', 'supply', 'shipping', 'production'],
    });
    queryParams$.next(convertToParamMap({ status: 'all' }));
    fixture.detectChanges();
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    const href = (testId: string): string =>
      (
        fixture.nativeElement.querySelector(`[data-test="${testId}"]`) as HTMLAnchorElement | null
      )?.getAttribute('href') ?? '';
    expect(href('desk-workflow-desk')).not.toContain('orderId');
    expect(href('desk-workflow-proposal')).not.toContain('source=order');
    expect(href('desk-workflow-supply')).not.toContain('orderId');
    expect(href('desk-workflow-supply')).not.toContain('from=desk');
    expect(href('desk-workflow-shipping')).not.toContain('orderId');
  });

  it('407: view=combine renders the combine studio-link view', async () => {
    queryParams$.next(convertToParamMap({ view: 'combine', orderId: 'o2' }));
    fixture.detectChanges();
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="desk-combine-view"]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="desk-view-crumb"]')?.textContent,
    ).toContain('Комбайн');
    expect(page().view()).toBe('combine');
    expect(page().viewStudioRoute()).toBe('/design/combine');
  });

  it('427: right rail is empty on expand — cross-page lives in chips, actions in tray', async () => {
    queryParams$.next(convertToParamMap({ status: 'all' }));
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll(
      '[data-test="desk-order-row"]',
    ) as NodeListOf<HTMLButtonElement>;
    // o2 (in_production) — supply page default-open, no tree needed.
    rows[1]!.click();
    fixture.detectChanges();
    flushSupply(httpMock, 'o2');
    await tickMicrotask();
    fixture.detectChanges();

    expect(chromeTools.rightTools()).toHaveLength(0);
    // Левый rail — create/filter/summary/notebook — остаётся.
    const leftIds = chromeTools.leftTools().map((t) => t.id);
    expect(leftIds).toEqual(['create', 'filter', 'summary', 'notebook']);
    // Cross-page остаётся в chips (426): Снабжение/Гант/Комбайн — ссылки, не rail.
    const chips = fixture.nativeElement.querySelector('[data-test="group-chips"]');
    expect(chips?.querySelector('[data-test="desk-workflow-supply"]')).toBeTruthy();
    expect(chips?.querySelector('[data-test="desk-workflow-gantt"]')).toBeTruthy();
    expect(chips?.querySelector('[data-test="desk-workflow-combine"]')).toBeTruthy();
  });

  it('408: notebook without expanded order shows a hint', async () => {
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    page().openPanel('notebook');
    fixture.detectChanges();

    const notebook = fixture.nativeElement.querySelector('[data-test="desk-notebook"]');
    expect(notebook).toBeTruthy();
    expect(notebook.textContent).toContain('Раскройте заказ');
    expect(fixture.nativeElement.querySelector('[data-test="desk-note-form"]')).toBeNull();
  });

  it('408: notebook lists, creates and deletes notes for the expanded order', async () => {
    queryParams$.next(convertToParamMap({ status: 'all' }));
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll(
      '[data-test="desk-order-row"]',
    ) as NodeListOf<HTMLButtonElement>;
    rows[1]!.click(); // o2 (in_production, no items → no tree requests)
    fixture.detectChanges();
    flushSupply(httpMock, 'o2');
    await tickMicrotask();
    fixture.detectChanges();

    page().openPanel('notebook');
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url === '/api/desk-notes' && req.method === 'GET').flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const notebook = fixture.nativeElement.querySelector('[data-test="desk-notebook"]');
    expect(notebook).toBeTruthy();
    expect(notebook.textContent).toContain('Заметок у заказа пока нет.');

    const textarea = fixture.nativeElement.querySelector(
      '[data-test="desk-note-text"]',
    ) as HTMLTextAreaElement;
    textarea.value = 'Позвонить клиенту';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const submit = fixture.nativeElement.querySelector(
      '[data-test="desk-note-submit"]',
    ) as HTMLButtonElement;
    submit.click();
    fixture.detectChanges();

    const post = httpMock.expectOne(
      (req) => req.url === '/api/desk-notes' && req.method === 'POST',
    );
    expect(post.request.body).toEqual(
      expect.objectContaining({ text: 'Позвонить клиенту', kind: 'note', anchorOrderId: 'o2' }),
    );
    post.flush({
      _id: 'n1',
      text: 'Позвонить клиенту',
      kind: 'note',
      anchorOrderId: 'o2',
      authorId: 'u1',
      createdAt: '2026-08-18T12:00:00.000Z',
    });
    await tickMicrotask();
    fixture.detectChanges();
    httpMock
      .expectOne((req) => req.url === '/api/desk-notes' && req.method === 'GET')
      .flush([
        {
          _id: 'n1',
          text: 'Позвонить клиенту',
          kind: 'note',
          anchorOrderId: 'o2',
          authorId: 'u1',
          createdAt: '2026-08-18T12:00:00.000Z',
        },
      ]);
    await tickMicrotask();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('[data-test="desk-note"]')).toHaveLength(1);
    expect(
      fixture.nativeElement.querySelector('[data-test="desk-note-anchor"]')?.textContent,
    ).toContain('Заказ');

    const del = fixture.nativeElement.querySelector(
      '[data-test="desk-note-delete"]',
    ) as HTMLButtonElement;
    del.click();
    fixture.detectChanges();
    httpMock
      .expectOne((req) => req.url === '/api/desk-notes/n1' && req.method === 'DELETE')
      .flush(null);
    await tickMicrotask();
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url === '/api/desk-notes' && req.method === 'GET').flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('[data-test="desk-note"]')).toHaveLength(0);
  });

  it('414: ?view=gantt with expanded order compiles studio link and highlights gantt chip', async () => {
    expect(() => {
      queryParams$.next(convertToParamMap({ view: 'gantt', orderId: 'o1' }));
      fixture.detectChanges();
    }).not.toThrow();
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector(
      '[data-test="desk-view-open-studio"]',
    ) as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toContain('/production');
    expect(link.getAttribute('href')).toContain('from=desk');
    expect(
      fixture.nativeElement
        .querySelector('[data-test="desk-workflow-gantt"]')
        ?.getAttribute('aria-current'),
    ).toBe('page');
    expect(
      fixture.nativeElement
        .querySelector('[data-test="desk-workflow-desk"]')
        ?.getAttribute('aria-current'),
    ).toBeNull();
  });

  it('414: switching expanded order with notebook open drops stale notes', async () => {
    queryParams$.next(convertToParamMap({ status: 'all', orderId: 'o2', panel: 'notebook' }));
    fixture.detectChanges();
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();
    flushSupply(httpMock, 'o2');

    const first = httpMock.expectOne(
      (req) =>
        req.url === '/api/desk-notes' && req.method === 'GET' && req.params.get('orderId') === 'o2',
    );

    queryParams$.next(convertToParamMap({ status: 'all', orderId: 'o3', panel: 'notebook' }));
    fixture.detectChanges();
    flushSupply(httpMock, 'o3');
    await tickMicrotask();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('[data-test="desk-note"]')).toHaveLength(0);

    const second = httpMock.expectOne(
      (req) =>
        req.url === '/api/desk-notes' && req.method === 'GET' && req.params.get('orderId') === 'o3',
    );

    first.flush([
      {
        _id: 'n-old',
        text: 'Старая заметка o2',
        kind: 'note',
        anchorOrderId: 'o2',
        authorId: 'u1',
        createdAt: '2026-08-18T12:00:00.000Z',
      },
    ]);
    await tickMicrotask();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Старая заметка o2');
    expect(fixture.nativeElement.querySelectorAll('[data-test="desk-note"]')).toHaveLength(0);

    second.flush([
      {
        _id: 'n-new',
        text: 'Новая заметка o3',
        kind: 'note',
        anchorOrderId: 'o3',
        authorId: 'u1',
        createdAt: '2026-08-18T12:00:00.000Z',
      },
    ]);
    await tickMicrotask();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Новая заметка o3');
    expect(fixture.nativeElement.textContent).not.toContain('Старая заметка o2');
    expect(fixture.nativeElement.querySelectorAll('[data-test="desk-note"]')).toHaveLength(1);
  });

  it('422: groups orders by customer with separator labels', async () => {
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    const seps = fixture.nativeElement.querySelectorAll(
      '[data-test="desk-queue-customer-sep"]',
    ) as NodeListOf<HTMLElement>;
    expect(seps).toHaveLength(3);
    expect(seps[0]!.textContent!.trim()).toBe('Северный свет');
    expect(seps[1]!.textContent!.trim()).toBe('ИП Марина Волкова');
    expect(seps[2]!.textContent!.trim()).toBe('ООО Белый дуб');
  });

  it('422: consecutive orders from same customer appear under one separator', async () => {
    const MIXED = [
      { ...ORDERS[0]!, _id: 'o1', number: 'З-1001', counterpartyId: 'cp1' },
      { ...ORDERS[1]!, _id: 'o2', number: 'З-1002', counterpartyId: 'cp2' },
      { ...ORDERS[0]!, _id: 'o4', number: 'З-1004', counterpartyId: 'cp1' },
    ];
    httpMock.expectOne((req) => req.url === '/api/orders' && req.method === 'GET').flush(MIXED);
    httpMock
      .expectOne((req) => req.url === '/api/counterparties' && req.method === 'GET')
      .flush({ items: COUNTERPARTIES, total: COUNTERPARTIES.length, page: 1, limit: 200 });
    await tickMicrotask();
    fixture.detectChanges();

    const seps = fixture.nativeElement.querySelectorAll('[data-test="desk-queue-customer-sep"]');
    expect(seps).toHaveLength(2);
    expect(seps[0]!.textContent!.trim()).toBe('Северный свет');
    expect(seps[1]!.textContent!.trim()).toBe('ИП Марина Волкова');

    const rows = fixture.nativeElement.querySelectorAll(
      '[data-test="desk-order-row"]',
    ) as NodeListOf<HTMLButtonElement>;
    expect(rows).toHaveLength(3);
    expect(rows[0]!.getAttribute('data-status')).toBe('draft');
    expect(rows[1]!.getAttribute('data-status')).toBe('draft');
    expect(rows[2]!.getAttribute('data-status')).toBe('in_production');

    // Verify group order: cp1 orders (o1, o4) come before cp2 (o2).
    const numbers = [...rows].map((r) => r.textContent!.match(/З-\d+/)![0]);
    expect(numbers).toEqual(['З-1001', 'З-1004', 'З-1002']);
  });

  it('TZ-UI-DEN-505: queue empty/loading messages align with panel content inset', async () => {
    const loading = fixture.nativeElement.querySelector(
      '.manager-desk__empty',
    ) as HTMLElement | null;
    expect(loading).toBeTruthy();
    expect(loading!.textContent).toContain('Загрузка');

    const source = require('fs').readFileSync(
      require('path').join(__dirname, 'manager-desk.page.ts'),
      'utf8',
    );
    expect(source).toMatch(
      /\.manager-desk__empty[\s\S]*padding:\s*0\.75rem\s+var\(--panel-content-inset\)/,
    );
    expect(source).not.toMatch(/\.manager-desk__empty[\s\S]*padding:\s*0\.75rem\s+0/);

    queryParams$.next(convertToParamMap({ status: 'all' }));
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      '[data-test="desk-search-input"]',
    ) as HTMLInputElement;
    input.value = '___no-match___';
    input.dispatchEvent(new Event('input'));
    await new Promise((r) => setTimeout(r, 320));
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector(
      '[data-test="desk-queue-empty"]',
    ) as HTMLElement;
    expect(empty).toBeTruthy();
    expect(empty.classList.contains('manager-desk__empty')).toBe(true);
  });

  it('TZ-UI-DEN-512: queue rows use hairline separators and 13px meta', async () => {
    queryParams$.next(convertToParamMap({ status: 'all' }));
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.manager-desk__order-item')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.manager-desk__client')).toBeTruthy();

    const source = require('fs').readFileSync(
      require('path').join(__dirname, 'manager-desk.page.ts'),
      'utf8',
    );
    expect(source).toContain('gap: 0');
    expect(source).toContain('font-size: 0.8125rem');
    expect(source).toContain('border-bottom: 1px solid var(--color-rule)');
    expect(source).not.toMatch(/desk-refresh[\s\S]*bg-ink text-paper/);
  });

  it('509: flyout is labelled by its visible heading (aria-labelledby, not only aria-label)', async () => {
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    page().openPanel('filter');
    fixture.detectChanges();

    const flyout = fixture.nativeElement.querySelector('[data-test="desk-flyout"]');
    expect(flyout).toBeTruthy();
    expect(flyout!.getAttribute('aria-label')).toBeNull();
    const labelledby = flyout!.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    const h2 = flyout!.querySelector(`#${labelledby}`);
    expect(h2?.tagName).toBe('H2');
    expect(flyout!.getAttribute('role')).toBe('dialog');
    expect(flyout!.getAttribute('aria-modal')).toBe('true');
  });

  it('509: flyout traps focus inside and returns it to the trigger on close', async () => {
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    const trigger = document.createElement('button');
    trigger.textContent = 'Open panel';
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    page().openPanel('filter');
    fixture.detectChanges();
    await tickMicrotask(); // effect → queueMicrotask → focus trap creation
    fixture.detectChanges();

    const flyout = fixture.nativeElement.querySelector('[data-test="desk-flyout"]') as HTMLElement;
    expect(flyout).toBeTruthy();
    // CDK focus trap engaged on the flyout shell (anchors are created in the
    // trap constructor; before WR-509 the flyout had no trap at all).
    expect(document.querySelector('.cdk-focus-trap-anchor')).toBeTruthy();

    // Simulate the trap: focus a control inside the flyout.
    const inside = document.createElement('button');
    inside.textContent = 'inside';
    flyout.appendChild(inside);
    inside.focus();
    expect(document.activeElement).toBe(inside);

    page().closePanel();
    fixture.detectChanges();
    expect(document.activeElement).toBe(trigger);

    trigger.remove();
  });
});
