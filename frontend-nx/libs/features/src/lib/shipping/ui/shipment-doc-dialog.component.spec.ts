import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { PiShipmentsService, type Shipment } from '@kppdf/data-access';
import { PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { ShipmentDocDialogComponent, type ShipmentDocDialogData } from './shipment-doc-dialog.component';

describe('ShipmentDocDialogComponent (TZ-NX-SHIP-S1)', () => {
  let fixture: ComponentFixture<ShipmentDocDialogComponent>;
  let shipmentsApi: { addDoc: jest.Mock };
  let ref: { close: jest.Mock };

  const shipment: Shipment = {
    _id: 's1',
    number: 'SHIP-001',
    orderId: 'o1',
    counterpartyId: 'c1',
    date: '2026-09-08T00:00:00.000Z',
    status: 'scheduled',
    items: [],
  };

  async function setup(): Promise<void> {
    shipmentsApi = { addDoc: jest.fn().mockReturnValue(of({ ok: true, data: shipment })) };
    ref = { close: jest.fn() };
    const data: ShipmentDocDialogData = { shipment };

    await TestBed.configureTestingModule({
      imports: [ShipmentDocDialogComponent],
      providers: [
        { provide: PiShipmentsService, useValue: shipmentsApi },
        { provide: PI_DIALOG_DATA, useValue: data },
        { provide: PI_DIALOG_REF, useValue: ref as unknown as DialogRef<boolean> },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentDocDialogComponent);
    fixture.detectChanges();
  }

  it('defaults to type ttn and adds the document on submit', async () => {
    await setup();
    const component = fixture.componentInstance;
    expect(component.type()).toBe('ttn');
    component.number.set('ТТН-1');
    component.amount.set(15000);

    await component.submit();

    expect(shipmentsApi.addDoc).toHaveBeenCalledWith('s1', {
      type: 'ttn',
      number: 'ТТН-1',
      totalAmount: 15000,
      notes: undefined,
    });
    expect(ref.close).toHaveBeenCalledWith(true);
  });

  it('surfaces the API error and keeps the dialog open on failure', async () => {
    await setup();
    shipmentsApi.addDoc.mockReturnValue(
      of({ ok: false, error: new HttpErrorResponse({ status: 500, error: { message: 'boom' } }) }),
    );
    await fixture.componentInstance.submit();
    expect(ref.close).not.toHaveBeenCalled();
    expect(fixture.componentInstance.error()).toBeTruthy();
  });
});
