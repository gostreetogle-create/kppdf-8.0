import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { signal } from '@angular/core';
import {
  AuthService,
  CapabilitiesService,
  PiModulesService,
  PiOrdersService,
  PiPeopleService,
  PiProductsService,
  PiWorkTypesService,
} from '@kppdf/data-access';
import { PiToastService } from '@kppdf/ui/toast';
import { ShellToolRailService } from '../../layout/shell-tool-rail.service';
import { ProductionReadFacade } from './production-read.facade';
import { ProductionCockpitContext } from './production-cockpit.context';
import { ProductionCockpitPage } from './production-cockpit.page';

/**
 * TZ-NX-GANTT-G3 — page shell: Gantt bars render + flyouts + deep links.
 * The facade is faked; network is not touched (read path covered in facade spec).
 */
describe('ProductionCockpitPage (TZ-NX-GANTT-G3)', () => {
  async function setup(
    query: Record<string, string> = {},
    facadeOverride?: () => unknown,
  ): Promise<{
    fixture: ComponentFixture<ProductionCockpitPage>;
    rails: ShellToolRailService;
  }> {
    const rails = new ShellToolRailService();
    const user = signal<{ role?: string } | null>(null);
    await TestBed.configureTestingModule({
      imports: [ProductionCockpitPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap(query) },
            queryParamMap:
              query['from'] === 'desk'
                ? (import('rxjs').then((m) => m.of(convertToParamMap(query))) as never)
                : (require('rxjs') as typeof import('rxjs')).of(convertToParamMap(query)),
          },
        },
        { provide: ShellToolRailService, useValue: rails },
        { provide: PiOrdersService, useValue: {} },
        { provide: PiProductsService, useValue: {} },
        { provide: PiModulesService, useValue: {} },
        { provide: PiWorkTypesService, useValue: {} },
        { provide: PiPeopleService, useValue: {} },
        { provide: AuthService, useValue: { user } },
        { provide: CapabilitiesService, useValue: { hasAny: () => false } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn(), warning: jest.fn() } },
        {
          provide: ProductionReadFacade,
          useFactory: () => facadeOverride?.() ?? new FakeReadFacade(),
        },
        ProductionCockpitContext,
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    fixture.detectChanges();
    return { fixture, rails };
  }

  it('renders the Gantt root with scale toolbar after load', async () => {
    const { fixture } = await setup();
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="production-cockpit"]')).toBeTruthy();
    expect(el.querySelector('[data-test="gantt-bars-root"]')).toBeTruthy();
    expect(el.querySelector('[data-test="gantt-toolbar"]')).toBeTruthy();
    expect(el.textContent).toContain('По заказам');
    expect(el.textContent).toContain('По рабочим');
  });

  it('renders the order summary; ▸ expands the cascade with work bars', async () => {
    const { fixture } = await setup();
    await fixture.whenStable();
    fixture.detectChanges();
    let el = fixture.nativeElement as HTMLElement;
    // Collapsed tree: order summary row + chevron only.
    expect(el.querySelector('[data-test="gantt-bar-summary"]')).toBeTruthy();
    expect(el.textContent).toContain('ORD-1');
    const chevron = el.querySelector<HTMLButtonElement>('[data-test="gantt-expand-o1"]');
    expect(chevron).toBeTruthy();
    chevron!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    // Second level: product summary appears under the expanded order.
    el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="gantt-expand-product:o1:0"]')).toBeTruthy();
    // Expand product → module summary.
    el.querySelector<HTMLButtonElement>('[data-test="gantt-expand-product:o1:0"]')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="gantt-expand-module:o1:0:m1"]')).toBeTruthy();
    // Expand module → work bars finally render.
    el.querySelector<HTMLButtonElement>('[data-test="gantt-expand-module:o1:0:m1"]')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('[data-test="gantt-bar"]').length).toBe(2);
  });

  it('shows the empty-canvas hint when no bars built (empty placeholders + gantt-empty)', async () => {
    const { fixture } = await setup({}, () => new EmptyReadFacade());
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="gantt-empty"]')).toBeTruthy();
    expect(el.querySelectorAll('[data-test="gantt-placeholder-row"]').length).toBeGreaterThan(0);
  });

  it('registers left tools Заказы/Фильтры/Обновить and right Сегодня (enabled)', async () => {
    const { rails } = await setup();
    const left = rails.leftTools();
    const right = rails.rightTools();
    expect(left.map((t) => t.id)).toEqual(['orders', 'filters', 'refresh']);
    expect(right.map((t) => t.id)).toEqual(['today']);
    for (const tool of [...left, ...right]) {
      expect(tool.disabled).toBeUndefined();
      expect(tool.ariaLabel).toBeTruthy();
    }
    expect(right[0]!.title).toContain('Прокрутить к сегодня');
  });

  it('opens the orders flyout from the shell rail tool and closes on backdrop', async () => {
    const { rails, fixture } = await setup();
    const ordersTool = rails.leftTools().find((t) => t.id === 'orders');
    expect(ordersTool).toBeTruthy();
    ordersTool!.onClick();
    fixture.detectChanges();
    let el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="production-flyout-orders"]')).toBeTruthy();
    expect(el.querySelector('[data-test="production-flyout-backdrop"]')).toBeTruthy();

    el.querySelector<HTMLButtonElement>('[data-test="production-flyout-backdrop"]')?.click();
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="production-flyout-orders"]')).toBeFalsy();
  });

  it('selects an order from the rail → order meta strip appears under summary', async () => {
    const { rails, fixture } = await setup();
    await fixture.whenStable();
    fixture.detectChanges();
    const ordersTool = rails.leftTools().find((t) => t.id === 'orders');
    ordersTool!.onClick();
    fixture.detectChanges();
    const item = fixture.nativeElement.querySelector<HTMLButtonElement>(
      '[data-test="orders-rail-item-o1"]',
    );
    expect(item).toBeTruthy();
    item!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="gantt-order-meta-o1"]')).toBeTruthy();
    // Rail closes on select; meta priority/planned inputs render (disabled: caps false).
    expect(el.querySelector('[data-test="gantt-order-meta-priority"]')).toBeTruthy();
    expect(
      (el.querySelector('[data-test="gantt-order-meta-priority"]') as HTMLSelectElement).disabled,
    ).toBe(true);
  });

  it('deep-links ?orderId= → selects order and shows hint when order not found', async () => {
    const { fixture } = await setup({ orderId: 'nope' });
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="production-order-id-hint"]')?.textContent).toContain(
      'не найден',
    );
  });

  it('TZ-NX-GANTT-G2: shows error state when load fails', async () => {
    TestBed.resetTestingModule();
    const rails = new ShellToolRailService();
    const user = signal<{ role?: string } | null>(null);
    await TestBed.configureTestingModule({
      imports: [ProductionCockpitPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({}) },
            queryParamMap: (require('rxjs') as typeof import('rxjs')).of(convertToParamMap({})),
          },
        },
        { provide: ShellToolRailService, useValue: rails },
        { provide: PiOrdersService, useValue: {} },
        { provide: PiProductsService, useValue: {} },
        { provide: PiModulesService, useValue: {} },
        { provide: PiWorkTypesService, useValue: {} },
        { provide: PiPeopleService, useValue: {} },
        { provide: AuthService, useValue: { user } },
        { provide: CapabilitiesService, useValue: { hasAny: () => false } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn(), warning: jest.fn() } },
        { provide: ProductionReadFacade, useClass: FailingReadFacade },
        ProductionCockpitContext,
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="production-error"]')).toBeTruthy();
    expect(el.textContent).toContain('Не удалось загрузить заказы');
  });

  it('clears the rail tools on destroy (owner "production")', async () => {
    const { fixture, rails } = await setup();
    expect(rails.leftTools().length).toBeGreaterThan(0);
    fixture.destroy();
    expect(rails.leftTools().some((t) => t.id === 'orders')).toBe(false);
  });
});

/** One commercial order whose estimate builds two work bars (order o1, item 0, product p1, modules m1). */
export class FakeReadFacade {
  readonly state = signal({
    loading: false,
    error: null as string | null,
    warnings: [] as string[],
    orders: [
      {
        _id: 'o1',
        number: 'ORD-1',
        status: 'confirmed',
        date: '2026-09-01T00:00:00.000Z',
        items: [{ productId: 'p1', productName: 'Стол', quantity: 1 }],
      },
    ],
    bars: [
      {
        id: 'o1:0:m1:wt1',
        orderId: 'o1',
        orderNumber: 'ORD-1',
        orderStatus: 'confirmed' as const,
        orderItemIndex: 0,
        productId: 'p1',
        productName: 'Стол',
        moduleId: 'm1',
        moduleName: 'Корпус',
        workTypeId: 'wt1',
        workTypeName: 'Распил',
        days: 3,
        startDate: '2026-09-02',
        endDate: '2026-09-04',
        noTerm: false,
        kind: 'work' as const,
        quantity: 1,
        workerLabel: '—',
      },
      {
        id: 'o1:0:m1:wt2',
        orderId: 'o1',
        orderNumber: 'ORD-1',
        orderStatus: 'confirmed' as const,
        orderItemIndex: 0,
        productId: 'p1',
        productName: 'Стол',
        moduleId: 'm1',
        moduleName: 'Корпус',
        workTypeId: 'wt2',
        workTypeName: 'Кромка',
        days: 2,
        startDate: '2026-09-05',
        endDate: '2026-09-06',
        noTerm: false,
        kind: 'work' as const,
        quantity: 1,
        workerLabel: 'Иванов',
      },
    ],
    ineligible: [] as Array<{ orderId: string; orderNumber: string; productNames: string[] }>,
  });
  loadOrders(): Promise<unknown[]> {
    return Promise.resolve(this.state().orders);
  }
  loadBarsForOrders(): Promise<unknown[]> {
    return Promise.resolve(this.state().bars);
  }
  getWorkerLabelsMap(): Promise<Map<string, string>> {
    return Promise.resolve(new Map());
  }
  clearCaches(): void {
    /* noop */
  }
}

/** Facade that loads orders but builds no bars — empty Gantt state. */
class EmptyReadFacade {
  readonly state = signal({
    loading: false,
    error: null as string | null,
    warnings: [] as string[],
    orders: [] as unknown[],
    bars: [] as unknown[],
    ineligible: [] as unknown[],
  });
  loadOrders(): Promise<unknown[]> {
    return Promise.resolve([]);
  }
  loadBarsForOrders(): Promise<unknown[]> {
    return Promise.resolve([]);
  }
  getWorkerLabelsMap(): Promise<Map<string, string>> {
    return Promise.resolve(new Map());
  }
  clearCaches(): void {
    /* noop */
  }
}

class FailingReadFacade {
  readonly state = signal({
    loading: false,
    error: 'Не удалось загрузить заказы',
    warnings: [] as string[],
    orders: [] as unknown[],
    bars: [] as unknown[],
    ineligible: [] as unknown[],
  });
  loadOrders(): Promise<unknown[]> {
    return Promise.resolve([]);
  }
  loadBarsForOrders(): Promise<unknown[]> {
    return Promise.resolve([]);
  }
  getWorkerLabelsMap(): Promise<Map<string, string>> {
    return Promise.resolve(new Map());
  }
  clearCaches(): void {
    /* noop */
  }
}
