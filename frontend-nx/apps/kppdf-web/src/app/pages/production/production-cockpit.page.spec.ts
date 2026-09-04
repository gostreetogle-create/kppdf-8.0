import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { signal } from '@angular/core';
import { ShellToolRailService } from '../../layout/shell-tool-rail.service';
import { ProductionReadFacade } from './production-read.facade';
import { ProductionCockpitContext } from './production-cockpit.context';
import { ProductionCockpitPage } from './production-cockpit.page';

describe('ProductionCockpitPage (TZ-NX-GANTT-G1/G2)', () => {
  async function setup(query: Record<string, string> = {}): Promise<{
    fixture: ComponentFixture<ProductionCockpitPage>;
    rails: ShellToolRailService;
  }> {
    const rails = new ShellToolRailService();
    await TestBed.configureTestingModule({
      imports: [ProductionCockpitPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(query) } },
        },
        { provide: ShellToolRailService, useValue: rails },
        {
          provide: ProductionReadFacade,
          useClass: FakeReadFacade,
        },
        ProductionCockpitContext,
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    fixture.detectChanges();
    return { fixture, rails };
  }

  it('renders the RU shell placeholder with title', async () => {
    const { fixture } = await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="production-page"]')).toBeTruthy();
    expect(el.textContent).toContain('Производство');
    expect(el.textContent).toContain('Гант');
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
    expect(left[0]!.title).toBe('Заказы');
    expect(right[0]!.title).toContain('Прокрутить к сегодня');
  });

  it('reads ?orderId= and ?from=desk deep-link params', async () => {
    const { fixture } = await setup({ orderId: 'order-42', from: 'desk' });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="production-deep-link"]')?.textContent).toContain('order-42');
  });

  it('TZ-NX-GANTT-G2: shows active orders count after load', async () => {
    const { fixture } = await setup();
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="production-orders-count"]')?.textContent).toContain('2');
  });

  it('TZ-NX-GANTT-G2: shows error state when load fails', async () => {
    TestBed.resetTestingModule();
    const rails = new ShellToolRailService();
    await TestBed.configureTestingModule({
      imports: [ProductionCockpitPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({}) } },
        },
        { provide: ShellToolRailService, useValue: rails },
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

/** Two active orders: ORD-1 confirmed, ORD-3 in_production (draft excluded). */
class FakeReadFacade {
  readonly state = signal({
    loading: false,
    error: null,
    orders: [
      { _id: 'o1', number: 'ORD-1', status: 'confirmed' },
      { _id: 'o2', number: 'ORD-2', status: 'draft' },
      { _id: 'o3', number: 'ORD-3', status: 'in_production' },
    ],
    bars: [],
    ineligible: [],
  });
  loadOrders(): Promise<unknown[]> {
    return Promise.resolve(this.state().orders);
  }
  loadBarsForOrders(): Promise<unknown[]> {
    return Promise.resolve([]);
  }
}

class FailingReadFacade {
  readonly state = signal({
    loading: false,
    error: 'Не удалось загрузить заказы',
    orders: [],
    bars: [],
    ineligible: [],
  });
  loadOrders(): Promise<unknown[]> {
    return Promise.resolve([]);
  }
  loadBarsForOrders(): Promise<unknown[]> {
    return Promise.resolve([]);
  }
}