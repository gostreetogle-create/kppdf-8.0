import { Component, input, output, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
import { GanttBarsComponent } from './blocks/gantt-bars.component';
import { OrdersService } from '../orders/orders.service';
import type { Order } from '../orders/orders.service';
import { PiToastService } from '../../shared/ui/toast';
import { of } from 'rxjs';

@Component({
  selector: 'app-order-inspector',
  standalone: true,
  template: '',
})
class OrderInspectorStub {
  readonly order = input.required<Order>();
  readonly estimateReadOnly = input(false);
  readonly canEditOrder = input(false);
  readonly canEditCatalog = input(false);
  readonly workerLabels = input<ReadonlyMap<string, string>>(new Map());
  readonly closed = output<void>();
  readonly changed = output<void>();
}

describe('ProductionCockpitPage HUB-303 orderId', () => {
  const queryParamSubject = new BehaviorSubject<{ get: (key: string) => string | null }>({
    get: () => null,
  });

  const orders: Order[] = [
    { _id: 'o1', number: 'ORD-1', status: 'confirmed', items: [] },
    { _id: 'o2', number: 'ORD-2', status: 'draft', items: [] },
  ];

  const facade = {
    state: signal({ loading: false, error: null, warnings: [], orders: [], bars: [] }),
    loadOrders: jest.fn(async () => orders),
    getWorkerLabelsMap: jest.fn(async () => new Map()),
    getOrderThumbMap: jest.fn(async () => new Map()),
    loadBarsForOrders: jest.fn(async () => []),
    clearCaches: jest.fn(),
  };

  beforeEach(async () => {
    queryParamSubject.next({ get: () => null });
    facade.loadOrders.mockClear();
    facade.loadBarsForOrders.mockClear();
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
            update: jest.fn(() => of({ ok: true, data: orders[0] })),
          },
        },
        {
          provide: PiToastService,
          useValue: { success: jest.fn(), error: jest.fn() },
        },
        PiChromeToolsService,
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
            GanttBarsComponent,
            OrderInspectorStub,
            RouterLink,
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
    expect(chrome.rightTools().map((t) => t.id)).toEqual(['card', 'today', 'scale']);
    expect(chrome.leftTools()[0]!.ariaLabel).toBe('Заказы');
    expect(chrome.rightTools()[0]!.ariaLabel).toBe('Карточка');
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

  it('keeps chrome-projected tools mutually exclusive', () => {
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    fixture.detectChanges();
    const chrome = TestBed.inject(PiChromeToolsService);
    const page = fixture.componentInstance as unknown as {
      leftTool: () => string | null;
      rightTool: () => string | null;
      toggleLeftTool: (tool: 'orders' | 'filters') => void;
      toggleRightTool: (tool: 'card' | 'scale') => void;
      closeFlyouts: () => void;
    };

    page.toggleLeftTool('orders');
    fixture.detectChanges();
    expect(page.leftTool()).toBe('orders');
    expect(page.rightTool()).toBeNull();
    expect(chrome.leftTools().find((t) => t.id === 'orders')!.active).toBe(true);

    page.toggleRightTool('card');
    fixture.detectChanges();
    expect(page.leftTool()).toBeNull();
    expect(page.rightTool()).toBe('card');
    expect(chrome.rightTools().find((t) => t.id === 'card')!.active).toBe(true);
    expect(chrome.leftTools().find((t) => t.id === 'orders')!.active).toBe(false);

    page.toggleRightTool('card');
    expect(page.rightTool()).toBeNull();

    page.toggleLeftTool('filters');
    page.closeFlyouts();
    expect(page.leftTool()).toBeNull();
    expect(page.rightTool()).toBeNull();
  });

  it('TZ-PRODUCTION-315: Карточка is bottom sheet, not right flyout', () => {
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    const page = fixture.componentInstance as unknown as {
      toggleRightTool: (tool: 'card' | 'scale') => void;
    };
    page.toggleRightTool('card');
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector(
      '[data-test="production-flyout-card"]',
    ) as HTMLElement;
    expect(card).not.toBeNull();
    expect(card.classList.contains('production-studio-sheet-card')).toBe(true);
    expect(card.classList.contains('production-studio-flyout-right')).toBe(false);
    expect(card.classList.contains('production-studio-flyout-card')).toBe(false);
  });

  it('TZ-UX-323: flyouts anchor at studio edges (no 48px rail inset)', () => {
    const source = require('fs').readFileSync(
      require('path').join(__dirname, 'production-cockpit.page.ts'),
      'utf8',
    );
    expect(source).not.toContain('production-studio-rail');
    expect(source).toContain('left: 0');
    expect(source).toContain('right: 0');
    expect(source).not.toContain('left: 48px');
    expect(source).not.toContain('right: 48px');
    expect(source).not.toContain('grid-template-columns: 48px');
    expect(source).toContain('clear(CHROME_OWNER)');
    expect(source).toContain('production-studio-sheet-card');
  });
});
