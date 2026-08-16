import { TestBed } from '@angular/core/testing';
import { OrdersRailComponent } from './orders-rail.component';
import { ProductionCockpitContext } from '../production-cockpit.context';
import type { Order } from '../../orders/orders.service';
import { NO_COUNTERPARTY_FILTER } from '../gantt-bar.model';

describe('OrdersRailComponent', () => {
  let ctx: ProductionCockpitContext;

  const orders: Order[] = [
    { _id: '1', number: 'ORD-1', status: 'confirmed', items: [] },
    { _id: '2', number: 'ORD-2', status: 'shipped', items: [] },
    { _id: '3', number: 'ORD-3', status: 'in_production', items: [] },
    { _id: '4', number: 'ORD-4', status: 'cancelled', items: [] },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OrdersRailComponent],
      providers: [ProductionCockpitContext],
    });
    ctx = TestBed.inject(ProductionCockpitContext);
  });

  it('filters to active commercial statuses by default', () => {
    const fixture = TestBed.createComponent(OrdersRailComponent);
    fixture.componentRef.setInput('orders', orders);
    fixture.detectChanges();

    const visible = fixture.componentInstance['visible']();
    expect(visible.map((o: Order) => o._id)).toEqual(['1', '3']);
  });

  it('keeps selected cancelled order visible while activeOnly is on', () => {
    ctx.selectOrder('4');
    const fixture = TestBed.createComponent(OrdersRailComponent);
    fixture.componentRef.setInput('orders', orders);
    fixture.detectChanges();

    const visible = fixture.componentInstance['visible']();
    expect(visible.map((o: Order) => o._id).sort()).toEqual(['1', '3', '4']);
  });

  it('removes status pips while keeping textual statuses', () => {
    const fixture = TestBed.createComponent(OrdersRailComponent);
    fixture.componentRef.setInput('orders', orders);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Подтверждён');
    expect(fixture.nativeElement.textContent).toContain('В производстве');
    expect(fixture.nativeElement.querySelectorAll('.rounded-full').length).toBe(0);
  });

  it('TZ-PRODUCTION-329: Counterparty select filters orders and has no Заказчики tabs', () => {
    ctx.setActiveOnly(false);
    const fixture = TestBed.createComponent(OrdersRailComponent);
    fixture.componentRef.setInput('orders', [
      {
        _id: '1',
        number: 'ORD-1',
        status: 'confirmed',
        counterpartyId: { _id: 'cp1', name: 'ООО Стол' },
      },
      {
        _id: '2',
        number: 'ORD-2',
        status: 'confirmed',
        counterpartyId: { _id: 'cp1', name: 'ООО Стол' },
      },
      { _id: '3', number: 'ORD-3', status: 'confirmed' },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="orders-rail-mode-orders"]')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-test="orders-rail-mode-counterparties"]'),
    ).toBeNull();

    const select = fixture.nativeElement.querySelector(
      '[data-test="orders-rail-counterparty"]',
    ) as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.options[0]?.textContent).toContain('Все заказчики');
    expect([...select.options].map((o) => o.textContent?.trim())).toEqual(
      expect.arrayContaining(['ООО Стол', 'Без заказчика']),
    );

    select.value = 'cp1';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(ctx.counterpartyFilter()).toBe('cp1');
    expect(ctx.filtersDirty()).toBe(true);
    expect(fixture.componentInstance['visible']().map((o: Order) => o._id)).toEqual(['1', '2']);
    expect(
      fixture.nativeElement.querySelector('[data-test="production-reset-filters"]')?.classList,
    ).toContain('pi-btn-ink');

    select.value = NO_COUNTERPARTY_FILTER;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(ctx.counterpartyFilter()).toBe(NO_COUNTERPARTY_FILTER);
    expect(fixture.componentInstance['visible']().map((o: Order) => o._id)).toEqual(['3']);

    (
      fixture.nativeElement.querySelector(
        '[data-test="production-reset-filters"]',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(ctx.counterpartyFilter()).toBeNull();
    expect(ctx.filtersDirty()).toBe(false);
    expect(fixture.componentInstance['visible']().map((o: Order) => o._id)).toEqual([
      '1',
      '2',
      '3',
    ]);
  });

  it('date filters narrow the rail visible set', () => {
    ctx.setActiveOnly(false);
    ctx.setDateFrom('2026-08-10');
    ctx.setDateTo('2026-08-10');
    const fixture = TestBed.createComponent(OrdersRailComponent);
    fixture.componentRef.setInput('orders', [
      { _id: '1', number: 'ORD-1', status: 'confirmed', plannedDate: '2026-08-10' },
      { _id: '2', number: 'ORD-2', status: 'confirmed', plannedDate: '2026-08-11' },
    ]);
    fixture.detectChanges();
    expect(fixture.componentInstance['visible']().map((o: Order) => o._id)).toEqual(['1']);
  });

  it('emits select and selectAll', () => {
    const fixture = TestBed.createComponent(OrdersRailComponent);
    fixture.componentRef.setInput('orders', orders);
    const selected: string[] = [];
    let allClicks = 0;
    fixture.componentInstance.select.subscribe((id) => selected.push(id));
    fixture.componentInstance.selectAll.subscribe(() => {
      allClicks += 1;
    });
    fixture.detectChanges();

    const item = fixture.nativeElement.querySelector(
      '[data-test="orders-rail-item-3"]',
    ) as HTMLButtonElement;
    item.click();
    expect(selected).toEqual(['3']);

    const allBtn = fixture.nativeElement.querySelector(
      '[data-test="orders-rail-all"]',
    ) as HTMLButtonElement;
    allBtn.click();
    expect(allClicks).toBe(1);
  });

  it('TZ-PRODUCTION-336: ineligible orders stay listed with «нет плана» marker', () => {
    const fixture = TestBed.createComponent(OrdersRailComponent);
    fixture.componentRef.setInput('orders', orders);
    fixture.componentRef.setInput('noGanttOrderIds', new Set(['3']));
    fixture.detectChanges();

    const visible = fixture.componentInstance['visible']();
    expect(visible.map((o: Order) => o._id)).toContain('3');
    const marker = fixture.nativeElement.querySelector('[data-test="orders-rail-no-plan"]');
    expect(marker?.textContent).toContain('нет плана');
    expect(marker?.getAttribute('title')).toBe('Нет модулей для Ганта');
  });
});
