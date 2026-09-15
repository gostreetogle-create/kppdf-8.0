import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PiOrdersService, type Order, type Warehouse } from '@kppdf/data-access';
import { PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { ShipmentCreateDialogComponent, type ShipmentCreateDialogData } from './shipment-create-dialog.component';

describe('ShipmentCreateDialogComponent (TZ-NX-SHIP-S1)', () => {
  let fixture: ComponentFixture<ShipmentCreateDialogComponent>;
  let ordersApi: { ship: jest.Mock };
  let ref: { close: jest.Mock };

  const orders: Order[] = [
    {
      _id: 'o1',
      number: 'ORD-1',
      status: 'ready',
      items: [{ productId: 'p1', productName: 'Модуль А', quantity: 4, unit: 'шт' }],
    } as Order,
    { _id: 'o2', number: 'ORD-2', status: 'shipped', items: [] } as Order,
  ];
  const warehouses: Warehouse[] = [{ _id: 'w1', name: 'Основной', isActive: true }];

  async function setup(): Promise<void> {
    ordersApi = { ship: jest.fn().mockReturnValue(of({ ok: true, data: { _id: 'o1', status: 'shipped' } })) };
    ref = { close: jest.fn() };
    const data: ShipmentCreateDialogData = { orders, warehouses };

    await TestBed.configureTestingModule({
      imports: [ShipmentCreateDialogComponent],
      providers: [
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PI_DIALOG_DATA, useValue: data },
        { provide: PI_DIALOG_REF, useValue: ref as unknown as DialogRef<boolean> },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentCreateDialogComponent);
    fixture.detectChanges();
  }

  it('only lists shippable orders (excludes shipped/delivered/cancelled)', async () => {
    await setup();
    const options = fixture.nativeElement.querySelectorAll('[data-test="shipping-create-order"] option');
    const values = Array.from(options as NodeListOf<HTMLOptionElement>).map((o) => o.value);
    expect(values).toContain('o1');
    expect(values).not.toContain('o2');
  });

  it('rejects submit without a known warehouse', async () => {
    await setup();
    const select = fixture.nativeElement.querySelector('[data-test="shipping-create-order"]') as HTMLSelectElement;
    select.value = 'o1';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    await (fixture.componentInstance as ShipmentCreateDialogComponent).submit();
    expect(ordersApi.ship).not.toHaveBeenCalled();
    expect(fixture.componentInstance.error()).toContain('склад');
  });

  it('ships the order with recipient/warehouse/items on submit', async () => {
    await setup();
    const component = fixture.componentInstance;
    const orderSelect = fixture.nativeElement.querySelector('[data-test="shipping-create-order"]') as HTMLSelectElement;
    orderSelect.value = 'o1';
    orderSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    component.warehouseId.set('w1');
    component.recipient.set('Иванов И.И.');

    await component.submit();

    expect(ordersApi.ship).toHaveBeenCalledWith('o1', {
      recipient: 'Иванов И.И.',
      address: undefined,
      warehouseId: 'w1',
      items: [{ lineId: '0', quantity: 4 }],
    });
    expect(ref.close).toHaveBeenCalledWith(true);
  });
});
