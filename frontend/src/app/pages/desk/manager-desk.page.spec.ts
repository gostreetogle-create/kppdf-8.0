import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { EMPTY, BehaviorSubject, of } from 'rxjs';

import { AuthService, type AuthUser } from '../../core/auth.service';
import { API_BASE_URL } from '../../core/api.tokens';
import { PiChromeToolsService } from '../../shared/chrome/pi-chrome-tools.service';
import { PiToastService } from '../../shared/ui/toast';
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
  let navigate: jest.Mock;

  beforeEach(async () => {
    authUser.set(null);
    queryParams$ = new BehaviorSubject(convertToParamMap({}));
    navigate = jest.fn().mockResolvedValue(true);

    const routerMock = {
      navigate,
      createUrlTree: jest.fn().mockReturnValue({}),
      serializeUrl: jest.fn().mockReturnValue('/desk'),
      events: EMPTY,
      url: '/desk',
    } as unknown as Router;

    await TestBed.configureTestingModule({
      imports: [ManagerDeskPage],
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: queryParams$.asObservable() },
        },
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: { user: authUser } },
        {
          provide: PiToastService,
          useValue: { success: jest.fn(), error: jest.fn(), show: jest.fn() },
        },
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
    // 413: desk composition opens by default → tree requests fire on expand.
    flushProductTree(httpMock, 'p1', 'Стол переговорный');
    flushProductTree(httpMock, 'p2', 'Опоры металлические');
    await tickMicrotask();
    fixture.detectChanges();

    expect(page().expandedId()).toBe('o1');
    const item = rows[0]!.parentElement!;
    const tray = item.querySelector('[data-test="order-hub-tray"]');
    expect(tray).toBeTruthy();
    expect(tray?.getAttribute('data-mode')).toBe('desk');
    expect(tray?.querySelector('[data-test="order-summary-client"]')?.textContent).toContain(
      'Северный свет',
    );
    expect(tray?.querySelector('[data-test="order-summary-status"]')?.textContent).toContain(
      'Черновик',
    );
    expect(tray?.querySelector('[data-test="desk-primary-cta"]')).toBeTruthy();

    const compositionToggle = tray?.querySelector(
      '[data-test="order-composition-toggle"]',
    ) as HTMLButtonElement;
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

  it('410: default view shows only active orders (no draft/shipped/cancelled/delivered)', async () => {
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll(
      '[data-test="desk-order-row"]',
    ) as NodeListOf<HTMLButtonElement>;
    expect(rows).toHaveLength(2);
    expect([...rows].map((row) => row.getAttribute('data-status'))).toEqual([
      'in_production',
      'ready',
    ]);
    expect(fixture.nativeElement.textContent).not.toContain('Северный свет');
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

  it('410: filter flyout toggles statuses and persists ?status=', async () => {
    flushBase(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    // Default active hides the draft o1.
    expect(
      page()
        .visibleOrders()
        .map((o) => o._id),
    ).toEqual(['o2', 'o3']);

    page().openPanel('filter');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="desk-filter"]')).toBeTruthy();

    navigate.mockClear();
    page().toggleStatus('draft');
    fixture.detectChanges();

    expect(
      page()
        .visibleOrders()
        .map((o) => o._id),
    ).toEqual(['o1', 'o2', 'o3']);
    expect(page().statusFilter().has('draft')).toBe(true);
    expect(navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: expect.objectContaining({ status: expect.stringContaining('draft') }),
        queryParamsHandling: 'merge',
      }),
    );
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
    flushProductTree(httpMock, 'p1', 'Стол переговорный');
    flushProductTree(httpMock, 'p2', 'Опоры металлические');
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
    rows[0]!.click();
    fixture.detectChanges();
    flushSupply(httpMock, 'o2');
    await tickMicrotask();
    fixture.detectChanges();

    const rightIds = chromeTools.rightTools().map((t) => t.id);
    expect(rightIds).toContain('edit');
    expect(rightIds).toContain('combine');
    expect(rightIds).not.toContain('supply');
    expect(rightIds).not.toContain('gantt');
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

  it('404: rail tools deep-link into studios with orderId&from=desk', async () => {
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

    navigate.mockClear();
    const gantt = chromeTools.rightTools().find((t) => t.id === 'gantt');
    expect(gantt).toBeTruthy();
    gantt!.onClick();
    expect(navigate).toHaveBeenCalledWith(
      ['/production'],
      expect.objectContaining({
        queryParams: expect.objectContaining({ orderId: 'o2', from: 'desk' }),
      }),
    );

    navigate.mockClear();
    const combine = chromeTools.rightTools().find((t) => t.id === 'combine');
    expect(combine).toBeTruthy();
    combine!.onClick();
    expect(navigate).toHaveBeenCalledWith(
      ['/design/combine'],
      expect.objectContaining({
        queryParams: expect.objectContaining({ orderId: 'o2', from: 'desk' }),
      }),
    );
  });
});
