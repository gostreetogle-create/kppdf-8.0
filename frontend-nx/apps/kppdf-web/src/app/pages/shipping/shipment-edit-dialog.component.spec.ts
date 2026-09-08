import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PiShipmentsService, type Shipment, type Warehouse } from '@kppdf/data-access';
import { PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { ShipmentEditDialogComponent, type ShipmentEditDialogData } from './shipment-edit-dialog.component';

describe('ShipmentEditDialogComponent (TZ-NX-SHIP-S1)', () => {
  let fixture: ComponentFixture<ShipmentEditDialogComponent>;
  let shipmentsApi: { update: jest.Mock };
  let ref: { close: jest.Mock };

  const shipment: Shipment = {
    _id: 's1',
    number: 'SHIP-001',
    orderId: 'o1',
    counterpartyId: 'c1',
    date: '2026-09-08T00:00:00.000Z',
    status: 'scheduled',
    items: [],
    warehouseId: 'w1',
  };
  const warehouses: Warehouse[] = [{ _id: 'w1', name: 'Основной', isActive: true }];

  async function setup(): Promise<void> {
    shipmentsApi = { update: jest.fn().mockReturnValue(of({ ok: true, data: shipment })) };
    ref = { close: jest.fn() };
    const data: ShipmentEditDialogData = { shipment, warehouses };

    await TestBed.configureTestingModule({
      imports: [ShipmentEditDialogComponent],
      providers: [
        { provide: PiShipmentsService, useValue: shipmentsApi },
        { provide: PI_DIALOG_DATA, useValue: data },
        { provide: PI_DIALOG_REF, useValue: ref as unknown as DialogRef<boolean> },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentEditDialogComponent);
    fixture.detectChanges();
  }

  it('prefills fields from the shipment', async () => {
    await setup();
    const warehouseSelect = fixture.nativeElement.querySelector('[data-test="shipping-edit-warehouse"]') as HTMLSelectElement;
    expect(warehouseSelect.value).toBe('w1');
  });

  it('rejects save when the warehouse is cleared', async () => {
    await setup();
    fixture.componentInstance.warehouseId.set('');
    await fixture.componentInstance.submit();
    expect(shipmentsApi.update).not.toHaveBeenCalled();
    expect(fixture.componentInstance.error()).toContain('склад');
  });

  it('saves recipient/address/driver/notes and closes true', async () => {
    await setup();
    const component = fixture.componentInstance;
    component.recipient.set('Иванов И.И.');
    component.address.set('ул. Ленина 1');
    component.driverInfo.set('Петров, а123бв');
    component.notes.set('Хрупкое');

    await component.submit();

    expect(shipmentsApi.update).toHaveBeenCalledWith('s1', {
      recipient: 'Иванов И.И.',
      address: 'ул. Ленина 1',
      driverInfo: 'Петров, а123бв',
      notes: 'Хрупкое',
      warehouseId: 'w1',
    });
    expect(ref.close).toHaveBeenCalledWith(true);
  });
});
