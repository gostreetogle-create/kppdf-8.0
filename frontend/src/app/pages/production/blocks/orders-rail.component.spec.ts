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
