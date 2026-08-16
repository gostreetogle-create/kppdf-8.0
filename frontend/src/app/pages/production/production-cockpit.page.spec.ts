import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { ProductionCockpitPage } from './production-cockpit.page';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import { LucideAngularModule } from 'lucide-angular';
import { ProductionCockpitContext } from './production-cockpit.context';
import { ProductionReadFacade } from './production-read.facade';
import { AuthService } from '../../core/auth.service';
import { CapabilitiesService } from '../../core/capabilities/capabilities.service';
import { PiChromeToolsService } from '../../shared/chrome/pi-chrome-tools.service';
import { OrdersRailComponent } from './blocks/orders-rail.component';
import { ProductionScaleControlsComponent } from './blocks/production-scale-controls.component';
import { GanttBarsComponent } from './blocks/gantt-bars.component';
import { OrdersService } from '../orders/orders.service';
import type { Order } from '../orders/orders.service';
import { WorkTypesService } from '../../shared/services/pi-work-types.service';
import { PiToastService } from '../../shared/ui/toast';
import { of } from 'rxjs';
import type { GanttBar } from './gantt-bar.model';

describe('ProductionCockpitPage HUB-303 orderId', () => {
  const queryParamSubject = new BehaviorSubject<{ get: (key: string) => string | null }>({
    get: () => null,
  });

  const orders: Order[] = [
    { _id: 'o1', number: 'ORD-1', status: 'confirmed', items: [] },
    { _id: 'o2', number: 'ORD-2', status: 'draft', items: [] },
  ];

  const facade = {
    state: signal({
      loading: false,
      error: null,
      warnings: [],
      orders: [],
      bars: [],
      ineligible: [] as Array<{ orderId: string; orderNumber: string; productNames: string[] }>,
    }),
    loadOrders: jest.fn(async () => orders),
    getWorkerLabelsMap: jest.fn(async () => new Map()),
    getOrderThumbMap: jest.fn(async () => new Map()),
    loadBarsForOrders: jest.fn(async () => []),
    clearCaches: jest.fn(),
  };

  beforeEach(async () => {
    queryParamSubject.next({ get: () => null });
    facade.loadOrders.mockReset();
    facade.loadOrders.mockImplementation(async () => orders);
    facade.loadBarsForOrders.mockReset();
    facade.loadBarsForOrders.mockImplementation(async () => []);
    facade.state.set({
      loading: false,
      error: null,
      warnings: [],
      orders: [],
      bars: [],
      ineligible: [],
    });
    facade.getWorkerLabelsMap.mockClear();
    facade.getOrderThumbMap.mockClear();
    facade.clearCaches.mockClear();
    await TestBed.configureTestingModule({
      imports: [ProductionCockpitPage],
      providers: [
        ProductionCockpitContext,
        { provide: ProductionReadFacade, useValue: facade },
        { provide: AuthService, useValue: { user: () => ({ role: 'admin' }) } },
        { provide: CapabilitiesService, useValue: { hasAny: () => true } },
        {
          provide: OrdersService,
          useValue: {
            patchEstimateDays: jest.fn(() => of({ ok: true, data: orders[0] })),
            patchEstimateStart: jest.fn(() => of({ ok: true, data: orders[0] })),
            update: jest.fn(() => of({ ok: true, data: orders[0] })),
          },
        },
        {
          provide: WorkTypesService,
          useValue: {
            update: jest.fn(() => of({ ok: true, data: { _id: 'wt1', days: 4 } })),
          },
        },
        {
          provide: PiToastService,
          useValue: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
        },
        PiChromeToolsService,
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: queryParamSubject.asObservable() },
        },
      ],
    })
      .overrideComponent(ProductionCockpitPage, {
        set: {
          imports: [
            PiGroupWorkspaceComponent,
            LucideAngularModule,
            OrdersRailComponent,
            ProductionScaleControlsComponent,
            GanttBarsComponent,
          ],
          providers: [
            ProductionCockpitContext,
            { provide: ProductionReadFacade, useValue: facade },
          ],
        },
      })
      .compileComponents();
  });

  afterEach(() => {
    TestBed.inject(PiChromeToolsService).clear('production-cockpit');
  });

  async function waitUntil(
    fixture: import('@angular/core/testing').ComponentFixture<ProductionCockpitPage>,
    predicate: (page: ProductionCockpitPage, ctx: ProductionCockpitContext) => boolean,
  ): Promise<{ page: ProductionCockpitPage; ctx: ProductionCockpitContext }> {
    for (let i = 0; i < 80; i++) {
      fixture.detectChanges();
      await fixture.whenStable();
      const page = fixture.componentInstance;
      const ctx = (page as unknown as { ctx: ProductionCockpitContext }).ctx;
      if (predicate(page, ctx)) return { page, ctx };
      await new Promise((r) => setTimeout(r, 10));
    }
    const page = fixture.componentInstance;
    return { page, ctx: (page as unknown as { ctx: ProductionCockpitContext }).ctx };
  }

  it('selects order from ?orderId= after orders load', async () => {
    queryParamSubject.next({
      get: (key: string) => (key === 'orderId' ? 'o1' : null),
    });
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    const { page, ctx } = await waitUntil(fixture, (_p, c) => c.selectedOrderId() === 'o1');
    expect(ctx.selectedOrderId()).toBe('o1');
    expect(ctx.orderMetaOpen()).toBe(true);
    expect((page as unknown as { orderIdHint: () => string | null }).orderIdHint()).toBeNull();
  });

  it('unknown orderId stays safe and shows hint', async () => {
    queryParamSubject.next({
      get: (key: string) => (key === 'orderId' ? 'missing' : null),
    });
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    const { page, ctx } = await waitUntil(fixture, (p) =>
      Boolean((p as unknown as { orderIdHint: () => string | null }).orderIdHint()),
    );
    expect(ctx.selectedOrderId()).toBeNull();
    expect((page as unknown as { orderIdHint: () => string | null }).orderIdHint()).toContain(
      'не найден',
    );
  });

  it('TZ-UX-323: full-width studio body; no local rails; tools in chrome service', () => {
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    fixture.detectChanges();
    const chrome = TestBed.inject(PiChromeToolsService);

    expect(fixture.nativeElement.querySelector('.production-studio-body')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.production-studio-rail-left')).toBeNull();
    expect(fixture.nativeElement.querySelector('.production-studio-rail-right')).toBeNull();
    expect(fixture.nativeElement.querySelector('.production-studio-rail')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="gantt-refresh"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('.production-studio-center')).not.toBeNull();

    expect(chrome.leftTools().map((t) => t.id)).toEqual(['orders', 'filters', 'refresh']);
    expect(chrome.rightTools().map((t) => t.id)).toEqual(['today']);
    expect(chrome.leftTools()[0]!.ariaLabel).toBe('Заказы');
    expect(chrome.rightTools().map((t) => t.ariaLabel)).toEqual(['Прокрутить к сегодня']);
    expect(chrome.rightTools().some((t) => t.id === 'scale' || t.ariaLabel === 'Масштаб')).toBe(
      false,
    );
    expect(chrome.rightTools().some((t) => t.id === 'card' || t.ariaLabel === 'Карточка')).toBe(
      false,
    );
  });

  it('keeps the hard Orders/Filters split in the flyouts', () => {
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    const page = fixture.componentInstance as unknown as {
      toggleLeftTool: (tool: 'orders' | 'filters') => void;
    };

    page.toggleLeftTool('orders');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector(
        '[data-test="production-flyout-orders"] [data-test="orders-rail-search"]',
      ),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector(
        '[data-test="production-flyout-orders"] [data-test="orders-rail-active-only"]',
      ),
    ).toBeNull();

    page.toggleLeftTool('filters');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector(
        '[data-test="production-flyout-filters"] [data-test="orders-rail-search"]',
      ),
    ).toBeNull();
    expect(
      fixture.nativeElement.querySelector(
        '[data-test="production-flyout-filters"] [data-test="orders-rail-active-only"]',
      ),
    ).not.toBeNull();
  });

  it('TZ-PRODUCTION-330: toolbar shows Месяц; fit uses month; Today always requests scroll', () => {
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    const page = fixture.componentInstance as unknown as {
      onToday: () => void;
      onFitHorizon: () => Promise<void>;
      scrollRequest: () => { target: string; nonce: number } | null;
    };
    const ctx = (fixture.componentInstance as unknown as { ctx: ProductionCockpitContext }).ctx;
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('[data-test="gantt-zoom-month"]')?.textContent,
    ).toContain('Месяц');
    expect(fixture.nativeElement.querySelector('[data-test="gantt-zoom-week"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="production-flyout-scale"]')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Неделя');

    const chrome = TestBed.inject(PiChromeToolsService);
    expect(chrome.rightTools().find((t) => t.id === 'today')!.title).toBe('Прокрутить к сегодня');
    expect(chrome.rightTools().some((t) => t.id === 'scale')).toBe(false);

    page.onToday();
    const first = page.scrollRequest();
    expect(first).toEqual(expect.objectContaining({ target: 'today' }));
    page.onToday();
    const second = page.scrollRequest();
    expect(second?.target).toBe('today');
    expect(second?.nonce).toBeGreaterThan(first!.nonce);

    void page.onFitHorizon();
    expect(ctx.zoom()).toBe('month');
  });

  it('TZ-PRODUCTION-348: gantt toolbar toggles По заказам / По рабочим', () => {
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    const page = fixture.componentInstance as unknown as {
      groupBy: () => 'orders' | 'workers';
    };
    fixture.detectChanges();

    const ordersBtn = fixture.nativeElement.querySelector(
      '[data-test="gantt-group-orders"]',
    ) as HTMLElement;
    const workersBtn = fixture.nativeElement.querySelector(
      '[data-test="gantt-group-workers"]',
    ) as HTMLElement;
    expect(ordersBtn?.textContent).toContain('По заказам');
    expect(workersBtn?.textContent).toContain('По рабочим');
    expect(page.groupBy()).toBe('orders');

    workersBtn.click();
    fixture.detectChanges();
    expect(page.groupBy()).toBe('workers');

    ordersBtn.click();
    fixture.detectChanges();
    expect(page.groupBy()).toBe('orders');
  });

  it('TZ-PRODUCTION-325: counterparty and date filters reach Gantt reload', async () => {
    const filteredOrders: Order[] = [
      {
        _id: 'o1',
        number: 'ORD-1',
        status: 'confirmed',
        plannedDate: '2026-08-10',
        counterpartyId: { _id: 'cp1', name: 'ООО Стол' },
        items: [],
      },
      {
        _id: 'o2',
        number: 'ORD-2',
        status: 'confirmed',
        plannedDate: '2026-08-11',
        counterpartyId: { _id: 'cp2', name: 'ИП Лес' },
        items: [],
      },
    ];
    facade.loadOrders.mockImplementation(async () => filteredOrders);
    facade.loadBarsForOrders.mockImplementation(async (_target: Order[]) => []);

    const fixture = TestBed.createComponent(ProductionCockpitPage);
    const { ctx } = await waitUntil(fixture, (_p, c) => c.selectedOrderId() === null);
    const page = fixture.componentInstance as unknown as {
      onFiltersChanged: () => Promise<void>;
    };

    ctx.setDateFrom('2026-08-10');
    ctx.setDateTo('2026-08-10');
    await page.onFiltersChanged();
    expect((facade.loadBarsForOrders.mock.calls.at(-1)![0] as Order[]).map((o) => o._id)).toEqual([
      'o1',
    ]);

    ctx.setDateFrom(null);
    ctx.setDateTo(null);
    ctx.setCounterpartyFilter('cp2');
    await page.onFiltersChanged();
    expect((facade.loadBarsForOrders.mock.calls.at(-1)![0] as Order[]).map((o) => o._id)).toEqual([
      'o2',
    ]);
  });

  it('TZ-PRODUCTION-329: Counterparty select filters Gantt and reset clears', async () => {
    const filteredOrders: Order[] = [
      {
        _id: 'o1',
        number: 'ORD-1',
        status: 'confirmed',
        plannedDate: '2026-08-10',
        counterpartyId: { _id: 'cp1', name: 'ООО Стол' },
        items: [],
      },
      {
        _id: 'o2',
        number: 'ORD-2',
        status: 'confirmed',
        plannedDate: '2026-08-11',
        counterpartyId: { _id: 'cp2', name: 'ИП Лес' },
        items: [],
      },
    ];
    facade.loadOrders.mockImplementation(async () => filteredOrders);
    facade.loadBarsForOrders.mockImplementation(async (_target: Order[]) => []);

    const fixture = TestBed.createComponent(ProductionCockpitPage);
    const { ctx } = await waitUntil(fixture, (_p, c) => c.selectedOrderId() === null);
    const page = fixture.componentInstance as unknown as {
      onFiltersChanged: () => Promise<void>;
      onResetFilters: () => Promise<void>;
      toggleLeftTool: (tool: 'filters') => void;
    };

    page.toggleLeftTool('filters');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[data-test="orders-rail-mode-counterparties"]'),
    ).toBeNull();
    const select = fixture.nativeElement.querySelector(
      '[data-test="orders-rail-counterparty"]',
    ) as HTMLSelectElement;
    expect(select).toBeTruthy();
    select.value = 'cp1';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await page.onFiltersChanged();
    expect(ctx.counterpartyFilter()).toBe('cp1');
    expect(ctx.filtersDirty()).toBe(true);
    expect((facade.loadBarsForOrders.mock.calls.at(-1)![0] as Order[]).map((o) => o._id)).toEqual([
      'o1',
    ]);

    const chrome = TestBed.inject(PiChromeToolsService);
    expect(chrome.leftTools().find((t) => t.id === 'filters')!.active).toBe(true);
    expect(chrome.leftTools().find((t) => t.id === 'filters')!.title).toBe('Фильтры изменены');

    await page.onResetFilters();
    fixture.detectChanges();
    expect(ctx.counterpartyFilter()).toBeNull();
    expect(ctx.filtersDirty()).toBe(false);
    expect(
      (facade.loadBarsForOrders.mock.calls.at(-1)![0] as Order[]).map((o) => o._id).sort(),
    ).toEqual(['o1', 'o2']);
  });

  it('keeps chrome-projected tools mutually exclusive', () => {
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    fixture.detectChanges();
    const chrome = TestBed.inject(PiChromeToolsService);
    const page = fixture.componentInstance as unknown as {
      leftTool: () => string | null;
      toggleLeftTool: (tool: 'orders' | 'filters') => void;
      closeFlyouts: () => void;
    };

    page.toggleLeftTool('orders');
    fixture.detectChanges();
    expect(page.leftTool()).toBe('orders');
    expect(chrome.leftTools().find((t) => t.id === 'orders')!.active).toBe(true);

    page.toggleLeftTool('filters');
    fixture.detectChanges();
    expect(page.leftTool()).toBe('filters');
    expect(chrome.leftTools().find((t) => t.id === 'filters')!.active).toBe(true);
    expect(chrome.leftTools().find((t) => t.id === 'orders')!.active).toBe(false);

    page.toggleLeftTool('filters');
    expect(page.leftTool()).toBeNull();

    page.toggleLeftTool('filters');
    page.closeFlyouts();
    expect(page.leftTool()).toBeNull();
  });

  it('TZ-PRODUCTION-317: select keeps multi-order bars and expands that order', async () => {
    const barO1 = {
      id: 'o1:0:p1:m1:wt1:1',
      orderId: 'o1',
      orderNumber: 'ORD-1',
      orderStatus: 'confirmed',
      orderItemIndex: 0,
      productId: 'p1',
      productName: 'A',
      moduleId: 'm1',
      moduleName: 'M',
      workTypeId: 'wt1',
      workTypeName: 'Сварка',
      occurrence: 1,
      quantity: 1,
      quantityLabel: null,
      days: 2,
      noTerm: false,
      startDate: '2026-08-01',
      endDate: '2026-08-02',
      usedFallbackToday: false,
      workerLabel: '—',
    };
    const barO2 = {
      ...barO1,
      id: 'o2:0:p1:m1:wt1:1',
      orderId: 'o2',
      orderNumber: 'ORD-2',
      orderStatus: 'confirmed',
    };
    const multiOrders: Order[] = [
      { _id: 'o1', number: 'ORD-1', status: 'confirmed', items: [] },
      { _id: 'o2', number: 'ORD-2', status: 'confirmed', items: [] },
    ];
    facade.loadOrders.mockImplementation(async () => multiOrders);
    facade.loadBarsForOrders.mockImplementation(async (target: Order[]) => {
      const ids = new Set(target.map((o) => o._id));
      return [barO1, barO2].filter((b) => ids.has(b.orderId));
    });

    const fixture = TestBed.createComponent(ProductionCockpitPage);
    await waitUntil(fixture, (_p, c) => c.selectedOrderId() === null);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(facade.loadBarsForOrders).toHaveBeenCalled();
    const lastBefore = facade.loadBarsForOrders.mock.calls.at(-1)![0] as Order[];
    expect(lastBefore.map((o) => o._id).sort()).toEqual(['o1', 'o2']);

    const page = fixture.componentInstance as unknown as {
      onSelect: (id: string) => Promise<void>;
      bars: () => Array<{ orderId: string }>;
    };
    const ctx = (fixture.componentInstance as unknown as { ctx: ProductionCockpitContext }).ctx;

    await page.onSelect('o1');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(ctx.selectedOrderId()).toBe('o1');
    expect(ctx.isOrderExpanded('o1')).toBe(false);
    expect(ctx.orderMetaOpen()).toBe(true);
    const lastAfter = facade.loadBarsForOrders.mock.calls.at(-1)![0] as Order[];
    expect(lastAfter.map((o) => o._id).sort()).toEqual(['o1', 'o2']);
    const orderIds = new Set(page.bars().map((b) => b.orderId));
    expect(orderIds.has('o1')).toBe(true);
    expect(orderIds.has('o2')).toBe(true);
  });

  it('TZ-PRODUCTION-322: no bottom sheet and no chrome Карточка', () => {
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="production-flyout-card"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-order-inspector')).toBeNull();
    const source = require('fs').readFileSync(
      require('path').join(__dirname, 'production-cockpit.page.ts'),
      'utf8',
    );
    expect(source).not.toContain('production-studio-sheet-card');
    expect(source).not.toContain("rightTool() === 'card'");
    expect(source).not.toContain("id: 'card'");
    expect(source).not.toContain("ariaLabel: 'Карточка'");
  });

  it('TZ-PRODUCTION-322: label toggles order-meta only; chevron toggles tree only', async () => {
    facade.loadOrders.mockImplementation(async () => [
      { _id: 'o1', number: 'ORD-1', status: 'confirmed', items: [] },
    ]);
    facade.loadBarsForOrders.mockImplementation(async () => [
      {
        id: 'o1:0:p1:m1:wt1:1',
        orderId: 'o1',
        orderNumber: 'ORD-1',
        orderStatus: 'confirmed',
        orderItemIndex: 0,
        productId: 'p1',
        productName: 'A',
        moduleId: 'm1',
        moduleName: 'M',
        workTypeId: 'wt1',
        workTypeName: 'Сварка',
        occurrence: 1,
        quantity: 1,
        quantityLabel: null,
        days: 2,
        noTerm: false,
        startDate: '2026-08-01',
        endDate: '2026-08-02',
        usedFallbackToday: false,
        workerLabel: '—',
      },
    ]);

    const fixture = TestBed.createComponent(ProductionCockpitPage);
    await waitUntil(fixture, (_p, c) => c.selectedOrderId() === null);
    fixture.detectChanges();
    await fixture.whenStable();

    const page = fixture.componentInstance as unknown as {
      onOrderLabelClick: (id: string) => Promise<void>;
      onToggleExpand: (id: string) => void;
      onDismissCanvas: () => void;
    };
    const ctx = (fixture.componentInstance as unknown as { ctx: ProductionCockpitContext }).ctx;

    page.onToggleExpand('o1');
    expect(ctx.isOrderExpanded('o1')).toBe(true);
    expect(ctx.orderMetaOpen()).toBe(false);

    page.onToggleExpand('o1');
    expect(ctx.isOrderExpanded('o1')).toBe(false);
    expect(ctx.orderMetaOpen()).toBe(false);

    await page.onOrderLabelClick('o1');
    fixture.detectChanges();
    expect(ctx.selectedOrderId()).toBe('o1');
    expect(ctx.orderMetaOpen()).toBe(true);
    expect(ctx.isOrderExpanded('o1')).toBe(false);
    expect(fixture.nativeElement.querySelector('[data-test="gantt-order-meta-o1"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="production-flyout-card"]')).toBeNull();

    page.onToggleExpand('o1');
    expect(ctx.isOrderExpanded('o1')).toBe(true);
    expect(ctx.orderMetaOpen()).toBe(true);

    await page.onOrderLabelClick('o1');
    fixture.detectChanges();
    expect(ctx.orderMetaOpen()).toBe(false);
    expect(ctx.isOrderExpanded('o1')).toBe(true);
    expect(fixture.nativeElement.querySelector('[data-test="gantt-order-meta-o1"]')).toBeNull();

    page.onDismissCanvas();
    expect(ctx.isOrderExpanded('o1')).toBe(false);
    expect(ctx.orderMetaOpen()).toBe(false);
  });

  it('TZ-PRODUCTION-321/322: dismiss and Esc clear meta + work-detail + trees', async () => {
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    await waitUntil(fixture, (_p, c) => c.selectedOrderId() === null);
    const page = fixture.componentInstance as unknown as {
      onDismissCanvas: () => void;
      onEscape: () => void;
    };
    const ctx = (fixture.componentInstance as unknown as { ctx: ProductionCockpitContext }).ctx;

    ctx.setOrderExpanded('o1', true);
    ctx.toggleWorkDetail('o1:0:p1:m1:wt1:1');
    ctx.setOrderMetaOpen(true);
    expect(ctx.expandedWorkBarId()).toBe('o1:0:p1:m1:wt1:1');
    page.onDismissCanvas();
    expect(ctx.expandedWorkBarId()).toBeNull();
    expect(ctx.isOrderExpanded('o1')).toBe(false);
    expect(ctx.orderMetaOpen()).toBe(false);

    ctx.setOrderExpanded('o1', true);
    ctx.toggleWorkDetail('o1:0:p1:m1:wt1:1');
    ctx.setOrderMetaOpen(true);
    page.onEscape();
    expect(ctx.expandedWorkBarId()).toBeNull();
    expect(ctx.isOrderExpanded('o1')).toBe(false);
    expect(ctx.orderMetaOpen()).toBe(false);
  });

  it('TZ-PRODUCTION-335: order-meta commit is silent optimistic PATCH without reload', async () => {
    const ordersApi = TestBed.inject(OrdersService) as unknown as {
      update: jest.Mock;
    };
    const toast = TestBed.inject(PiToastService) as unknown as {
      success: jest.Mock;
      error: jest.Mock;
    };
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    await waitUntilBootstrapped(fixture);
    const page = fixture.componentInstance as unknown as DragPage & {
      onOrderMetaCommit: (ev: {
        orderId: string;
        priority: string;
        plannedDate: string;
      }) => Promise<void>;
    };
    page.orders.set([
      {
        _id: 'o1',
        number: 'ORD-1',
        status: 'confirmed',
        plannedDate: '2026-08-10',
        priority: 'normal',
      },
    ]);
    page.bars.set([sampleWorkBar()]);
    const barCallsBefore = facade.loadBarsForOrders.mock.calls.length;
    ordersApi.update.mockReturnValue(
      of({
        ok: true,
        data: {
          _id: 'o1',
          number: 'ORD-1',
          status: 'confirmed',
          plannedDate: '2026-08-20',
          priority: 'urgent',
        },
      }),
    );
    await page.onOrderMetaCommit({
      orderId: 'o1',
      priority: 'urgent',
      plannedDate: '2026-08-20',
    });
    expect(ordersApi.update).toHaveBeenCalledWith('o1', {
      priority: 'urgent',
      plannedDate: new Date('2026-08-20T12:00:00').toISOString(),
    });
    expect(page.orders()[0]!.priority).toBe('urgent');
    expect(page.bars()[0]!.startDate).toBe('2026-08-20');
    expect(facade.loadBarsForOrders.mock.calls.length).toBe(barCallsBefore);
    expect(toast.success).not.toHaveBeenCalled();
  });

  async function waitUntilBootstrapped(
    fixture: import('@angular/core/testing').ComponentFixture<ProductionCockpitPage>,
  ): Promise<{ page: ProductionCockpitPage; ctx: ProductionCockpitContext }> {
    const result = await waitUntil(
      fixture,
      (_p, c) => c.selectedOrderId() === null && facade.loadBarsForOrders.mock.calls.length > 0,
    );
    fixture.detectChanges();
    await fixture.whenStable();
    return result;
  }

  function sampleWorkBar(overrides: Partial<GanttBar> = {}): GanttBar {
    return {
      id: 'o1:0:p1:m1:wt1:1',
      orderId: 'o1',
      orderNumber: 'ORD-1',
      orderStatus: 'confirmed',
      orderItemIndex: 0,
      productId: 'p1',
      productName: 'Стол',
      moduleId: 'm1',
      moduleName: 'Каркас',
      workTypeId: 'wt1',
      workTypeName: 'Сварка',
      occurrence: 1,
      quantity: 1,
      quantityLabel: null,
      days: 3,
      noTerm: false,
      startDate: '2026-08-10',
      endDate: '2026-08-12',
      usedFallbackToday: false,
      workerLabel: '—',
      kind: 'work',
      ...overrides,
    };
  }

  type DragPage = {
    bars: { (): GanttBar[]; set: (v: GanttBar[]) => void };
    orders: { (): Order[]; set: (v: Order[]) => void };
    onEstimateDaysCommit: (ev: {
      orderId: string;
      orderItemIndex: number;
      moduleId: string;
      workTypeId: string;
      days: number;
    }) => Promise<void>;
    onPlannedDateMoveCommit: (event: { orderId: string; deltaDays: number }) => Promise<void>;
    onStartOffsetCommit: (ev: {
      orderId: string;
      orderItemIndex: number;
      moduleId: string;
      workTypeId: string;
      startDate: string;
      deltaDays: number;
    }) => Promise<void>;
    onRefresh: () => Promise<void>;
  };

  it('TZ-PRODUCTION-333: estimate-days commit is silent and does not reload bars', async () => {
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    await waitUntilBootstrapped(fixture);
    const ordersApi = TestBed.inject(OrdersService) as unknown as { patchEstimateDays: jest.Mock };
    const toast = TestBed.inject(PiToastService) as unknown as {
      success: jest.Mock;
      error: jest.Mock;
    };
    const page = fixture.componentInstance as unknown as DragPage;
    page.bars.set([sampleWorkBar()]);
    const barCallsBefore = facade.loadBarsForOrders.mock.calls.length;

    await page.onEstimateDaysCommit({
      orderId: 'o1',
      orderItemIndex: 0,
      moduleId: 'm1',
      workTypeId: 'wt1',
      days: 5,
    });

    expect(ordersApi.patchEstimateDays).toHaveBeenCalledWith('o1', {
      orderItemIndex: 0,
      moduleId: 'm1',
      workTypeId: 'wt1',
      days: 5,
    });
    expect(page.bars()[0]!.days).toBe(5);
    expect(page.bars()[0]!.endDate).toBe('2026-08-14');
    expect(facade.loadBarsForOrders.mock.calls.length).toBe(barCallsBefore);
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('TZ-PRODUCTION-333: planned-date drag is silent and does not reload bars', async () => {
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    await waitUntilBootstrapped(fixture);
    const ordersApi = TestBed.inject(OrdersService) as unknown as { update: jest.Mock };
    const toast = TestBed.inject(PiToastService) as unknown as {
      success: jest.Mock;
      error: jest.Mock;
    };
    const page = fixture.componentInstance as unknown as DragPage;
    page.orders.set([
      { _id: 'o1', number: 'ORD-1', status: 'confirmed', plannedDate: '2026-08-10' },
    ]);
    page.bars.set([sampleWorkBar()]);
    const barCallsBefore = facade.loadBarsForOrders.mock.calls.length;

    await page.onPlannedDateMoveCommit({ orderId: 'o1', deltaDays: 1 });

    expect(ordersApi.update).toHaveBeenCalledWith(
      'o1',
      expect.objectContaining({ plannedDate: expect.any(String) }),
    );
    expect(page.bars()[0]!.startDate).toBe('2026-08-11');
    expect(page.bars()[0]!.endDate).toBe('2026-08-13');
    expect(facade.loadBarsForOrders.mock.calls.length).toBe(barCallsBefore);
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('TZ-PRODUCTION-333: start-offset commit is silent and does not reload bars', async () => {
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    await waitUntilBootstrapped(fixture);
    const ordersApi = TestBed.inject(OrdersService) as unknown as {
      patchEstimateStart: jest.Mock;
    };
    const toast = TestBed.inject(PiToastService) as unknown as {
      success: jest.Mock;
      error: jest.Mock;
    };
    const page = fixture.componentInstance as unknown as DragPage;
    page.orders.set([
      { _id: 'o1', number: 'ORD-1', status: 'confirmed', plannedDate: '2026-08-10' },
    ]);
    page.bars.set([sampleWorkBar()]);
    const barCallsBefore = facade.loadBarsForOrders.mock.calls.length;

    await page.onStartOffsetCommit({
      orderId: 'o1',
      orderItemIndex: 0,
      moduleId: 'm1',
      workTypeId: 'wt1',
      startDate: '2026-08-10',
      deltaDays: 2,
    });

    expect(ordersApi.patchEstimateStart).toHaveBeenCalledWith('o1', {
      orderItemIndex: 0,
      moduleId: 'm1',
      workTypeId: 'wt1',
      offsetDays: 2,
    });
    expect(page.bars()[0]!.startDate).toBe('2026-08-12');
    expect(page.bars()[0]!.startOffsetDays).toBe(2);
    expect(facade.loadBarsForOrders.mock.calls.length).toBe(barCallsBefore);
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('TZ-PRODUCTION-333: failed estimate-days PATCH reverts bars and toasts error', async () => {
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    await waitUntilBootstrapped(fixture);
    const ordersApi = TestBed.inject(OrdersService) as unknown as { patchEstimateDays: jest.Mock };
    const toast = TestBed.inject(PiToastService) as unknown as {
      success: jest.Mock;
      error: jest.Mock;
    };
    ordersApi.patchEstimateDays.mockReturnValueOnce(
      of({ ok: false, error: { message: 'Сеть недоступна' } }),
    );
    const page = fixture.componentInstance as unknown as DragPage;
    page.bars.set([sampleWorkBar()]);

    await page.onEstimateDaysCommit({
      orderId: 'o1',
      orderItemIndex: 0,
      moduleId: 'm1',
      workTypeId: 'wt1',
      days: 5,
    });

    expect(page.bars()[0]!.days).toBe(3);
    expect(page.bars()[0]!.endDate).toBe('2026-08-12');
    expect(toast.error).toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('TZ-PRODUCTION-333: explicit refresh still full-reloads orders and bars', async () => {
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    await waitUntilBootstrapped(fixture);
    const page = fixture.componentInstance as unknown as DragPage;
    const loadCallsBefore = facade.loadOrders.mock.calls.length;
    const barCallsBefore = facade.loadBarsForOrders.mock.calls.length;

    await page.onRefresh();

    expect(facade.clearCaches).toHaveBeenCalled();
    expect(facade.loadOrders.mock.calls.length).toBeGreaterThan(loadCallsBefore);
    expect(facade.loadBarsForOrders.mock.calls.length).toBeGreaterThan(barCallsBefore);
  });

  it('TZ-UX-323: flyouts anchor at studio edges (no 48px rail inset)', () => {
    const source = require('fs').readFileSync(
      require('path').join(__dirname, 'production-cockpit.page.ts'),
      'utf8',
    );
    expect(source).not.toContain('production-studio-rail');
    expect(source).toContain('left: 0');
    expect(source).not.toContain('left: 48px');
    expect(source).not.toContain('right: 48px');
    expect(source).not.toContain('grid-template-columns: 48px');
    expect(source).toContain('clear(CHROME_OWNER)');
    expect(source).not.toContain('production-studio-sheet-card');
    expect(source).not.toContain('bottom: 1.75rem');
    expect(source).not.toContain('production-flyout-scale');
  });

  it('TZ-PRODUCTION-336: selecting ineligible order toasts RU reason; Gantt stays without its bars', async () => {
    facade.loadBarsForOrders.mockImplementation(async () => {
      facade.state.update((s) => ({
        ...s,
        warnings: [],
        ineligible: [{ orderId: 'o1', orderNumber: 'ORD-1', productNames: ['Пустышка'] }],
      }));
      return [];
    });
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    await waitUntilBootstrapped(fixture);
    const page = fixture.componentInstance as unknown as {
      onSelect: (id: string) => Promise<void>;
      bars: () => GanttBar[];
    };
    const toast = TestBed.inject(PiToastService) as unknown as {
      warning: jest.Mock;
    };

    await page.onSelect('o1');

    expect(toast.warning).toHaveBeenCalled();
    expect(String(toast.warning.mock.calls[0]![0])).toContain('нет прямых модулей');
    expect(String(toast.warning.mock.calls[0]![0])).toContain('ORD-1');
    expect(page.bars().some((b) => b.orderId === 'o1')).toBe(false);
  });

  it('TZ-PRODUCTION-336: deep-link to ineligible order toasts and shows hint', async () => {
    facade.loadBarsForOrders.mockImplementation(async () => {
      facade.state.update((s) => ({
        ...s,
        warnings: [],
        ineligible: [{ orderId: 'o1', orderNumber: 'ORD-1', productNames: ['Пустышка'] }],
      }));
      return [];
    });
    queryParamSubject.next({
      get: (key: string) => (key === 'orderId' ? 'o1' : null),
    });
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    const toast = TestBed.inject(PiToastService) as unknown as { warning: jest.Mock };
    const { page, ctx } = await waitUntil(fixture, (p) =>
      Boolean(
        (p as unknown as { orderIdHint: () => string | null })
          .orderIdHint()
          ?.includes('нет прямых модулей'),
      ),
    );
    expect(ctx.selectedOrderId()).toBe('o1');
    expect((page as unknown as { orderIdHint: () => string | null }).orderIdHint()).toContain(
      'нет прямых модулей',
    );
    expect(toast.warning).toHaveBeenCalled();
  });

  it('TZ-PRODUCTION-338: bars load without waiting for the thumb map (thumbs non-blocking)', async () => {
    let resolveThumbs!: (v: Map<string, string>) => void;
    const thumbsGate = new Promise<Map<string, string>>((r) => (resolveThumbs = r));
    facade.getOrderThumbMap.mockImplementation(() => thumbsGate);

    const fixture = TestBed.createComponent(ProductionCockpitPage);
    await waitUntil(fixture, () => facade.loadBarsForOrders.mock.calls.length > 0);

    // Bars path was reached while the thumb map is still pending — thumbs did not block.
    expect(facade.loadBarsForOrders).toHaveBeenCalled();
    expect(facade.getOrderThumbMap).toHaveBeenCalled();
    expect(
      (
        fixture.componentInstance as unknown as { orderThumbs: () => ReadonlyMap<string, string> }
      ).orderThumbs().size,
    ).toBe(0);

    resolveThumbs(new Map([['o1', 'http://example.test/thumb-1']]));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(
      (fixture.componentInstance as unknown as { orderThumbs: () => ReadonlyMap<string, string> })
        .orderThumbs()
        .get('o1'),
    ).toBe('http://example.test/thumb-1');
  });

  it('TZ-PRODUCTION-353: unassigned bars show Gantt banner with WT name; assigned-only hides it', async () => {
    const unassignedBar: GanttBar = {
      id: 'o1:0:p1:m1:wt1:1',
      orderId: 'o1',
      orderNumber: 'ORD-1',
      orderStatus: 'confirmed',
      orderItemIndex: 0,
      productId: 'p1',
      productName: 'Стол',
      moduleId: 'm1',
      moduleName: 'Каркас',
      workTypeId: 'wt1',
      workTypeName: 'Сварка',
      occurrence: 1,
      quantity: 1,
      quantityLabel: null,
      days: 2,
      noTerm: false,
      startDate: '2026-08-01',
      endDate: '2026-08-02',
      usedFallbackToday: false,
      workerLabel: '—',
    };
    const assignedBar: GanttBar = { ...unassignedBar, workerLabel: 'Иванов Иван' };
    facade.loadBarsForOrders.mockImplementation(async () => [unassignedBar, assignedBar]);

    const fixture = TestBed.createComponent(ProductionCockpitPage);
    await waitUntil(fixture, () => facade.loadBarsForOrders.mock.calls.length > 0);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const banner = el.querySelector('[data-test="gantt-unassigned-banner"]');
    expect(banner).toBeTruthy();
    expect(banner!.textContent).toContain('Сварка');
    expect(
      el.querySelector('[data-test="gantt-unassigned-people-link"]')?.getAttribute('href'),
    ).toBe('/people');

    const page = fixture.componentInstance as unknown as {
      bars: { set: (v: GanttBar[]) => void };
    };
    page.bars.set([assignedBar]);
    fixture.detectChanges();
    expect(el.querySelector('[data-test="gantt-unassigned-banner"]')).toBeNull();
  });
});
