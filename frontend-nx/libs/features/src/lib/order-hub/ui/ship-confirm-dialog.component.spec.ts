import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Order } from '@kppdf/data-access';
import { PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { ShipConfirmDialogComponent, type ShipConfirmDialogData, type ShipConfirmResult } from './ship-confirm-dialog.component';

describe('ShipConfirmDialogComponent (TZ-NX-SHIP-S3)', () => {
  let fixture: ComponentFixture<ShipConfirmDialogComponent>;
  let ref: { close: jest.Mock };

  const order: Order = {
    _id: 'o1',
    number: 'ORD-001',
    status: 'ready',
    counterpartyId: { _id: 'c1', name: 'ООО Ромашка' },
    siteId: { _id: 'site1', name: 'Склад №2', address: 'ул. Ленина 1' },
  } as Order;

  async function setup(): Promise<void> {
    ref = { close: jest.fn() };
    const data: ShipConfirmDialogData = { order };
    await TestBed.configureTestingModule({
      imports: [ShipConfirmDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: data },
        { provide: PI_DIALOG_REF, useValue: ref as unknown as DialogRef<ShipConfirmResult | undefined> },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ShipConfirmDialogComponent);
    fixture.detectChanges();
  }

  it('prefills recipient and address from the order counterparty/site', async () => {
    await setup();
    const recipient = fixture.nativeElement.querySelector('[data-test="ship-confirm-recipient"]') as HTMLInputElement;
    const address = fixture.nativeElement.querySelector('[data-test="ship-confirm-address"]') as HTMLInputElement;
    expect(recipient.value).toBe('ООО Ромашка');
    expect(address.value).toBe('ул. Ленина 1');
  });

  it('closes with the trimmed result on confirm', async () => {
    await setup();
    fixture.componentInstance.note.set('  Хрупкое  ');
    fixture.componentInstance.confirm();
    expect(ref.close).toHaveBeenCalledWith({
      recipient: 'ООО Ромашка',
      address: 'ул. Ленина 1',
      driverInfo: 'Хрупкое',
    });
  });

  it('closes with undefined on cancel', async () => {
    await setup();
    fixture.componentInstance.cancel();
    expect(ref.close).toHaveBeenCalledWith(undefined);
  });
});
