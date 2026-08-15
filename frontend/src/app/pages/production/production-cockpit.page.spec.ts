import { Component, input, output, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { ProductionCockpitPage } from './production-cockpit.page';
import { ProductionCockpitContext } from './production-cockpit.context';
import { ProductionReadFacade } from './production-read.facade';
import { AuthService } from '../../core/auth.service';
import { CapabilitiesService } from '../../core/capabilities/capabilities.service';
import { OrdersRailComponent } from './blocks/orders-rail.component';
import { GanttBarsComponent } from './blocks/gantt-bars.component';
import type { Order } from '../orders/orders.service';

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
          provide: ActivatedRoute,
          useValue: { queryParamMap: queryParamSubject.asObservable() },
        },
      ],
    })
      .overrideComponent(ProductionCockpitPage, {
        set: {
          imports: [OrdersRailComponent, GanttBarsComponent, OrderInspectorStub, RouterLink],
          providers: [
            ProductionCockpitContext,
            { provide: ProductionReadFacade, useValue: facade },
          ],
        },
      })
      .compileComponents();
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
});
