import { TestBed } from '@angular/core/testing';
import { OrdersRailComponent } from './orders-rail.component';
import { ProductionCockpitContext } from '../production-cockpit.context';
import type { Order } from '../../orders/orders.service';

describe('OrdersRailComponent', () => {
  let ctx: ProductionCockpitContext;

  const orders: Order[] = [
    { _id: '1', number: 'ORD-1', status: 'draft', items: [] },
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

    expect(fixture.nativeElement.textContent).toContain('Черновик');
    expect(fixture.nativeElement.textContent).toContain('В производстве');
    expect(fixture.nativeElement.querySelectorAll('.rounded-full').length).toBe(0);
  });

  it('switches to Заказчики and filters by counterparty, including no party', () => {
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

    const mode = fixture.nativeElement.querySelector(
      '[data-test="orders-rail-mode-counterparties"]',
    ) as HTMLButtonElement;
    mode.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('ООО Стол');
    expect(fixture.nativeElement.textContent).toContain('Без заказчика');

    const cpButton = fixture.nativeElement.querySelector(
      '[data-test="orders-rail-counterparty-cp1"]',
    ) as HTMLButtonElement;
    cpButton.click();
    fixture.detectChanges();
    expect(ctx.counterpartyFilter()).toBe('cp1');
    expect(fixture.componentInstance['visible']().map((o: Order) => o._id)).toEqual(['1', '2']);

    cpButton.click();
    expect(ctx.counterpartyFilter()).toBeNull();
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
});
