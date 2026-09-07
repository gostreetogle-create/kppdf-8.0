import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { PiSupplyRequestsService, type SupplyRequest, type Warehouse } from '@kppdf/data-access';
import { PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import {
  SupplyRequestReceiveDialogComponent,
  type SupplyRequestReceiveDialogData,
} from './supply-request-receive-dialog.component';

describe('SupplyRequestReceiveDialogComponent (TZ-NX-SUPPLY-S4-RECEIVE-TO-STOCK)', () => {
  let fixture: ComponentFixture<SupplyRequestReceiveDialogComponent>;
  let ref: { close: jest.Mock };
  let api: { receive: jest.Mock };

  const request: SupplyRequest = {
    _id: 'r1',
    title: 'Болт М6',
    qty: 10,
    unit: 'шт',
    status: 'ordered',
    priority: 'normal',
    paid: false,
    materialId: 'm1',
  };
  const warehouses: Warehouse[] = [
    { _id: 'w1', name: 'Основной', isActive: true, isDefault: false },
    { _id: 'w2', name: 'Склад 2', isActive: true, isDefault: true },
  ];

  async function setup(data: Partial<SupplyRequestReceiveDialogData> = {}): Promise<void> {
    ref = { close: jest.fn() };
    api = { receive: jest.fn().mockReturnValue(of({ ok: true, data: { ...request, status: 'received' } })) };
    await TestBed.configureTestingModule({
      imports: [SupplyRequestReceiveDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: { request, warehouses, ...data } satisfies SupplyRequestReceiveDialogData },
        { provide: PI_DIALOG_REF, useValue: ref as unknown as DialogRef<unknown> },
        { provide: PiSupplyRequestsService, useValue: api },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SupplyRequestReceiveDialogComponent);
    fixture.detectChanges();
  }

  it('prefills the default warehouse and the planned qty', async () => {
    await setup();
    expect(fixture.componentInstance.warehouseId()).toBe('w2');
    expect(fixture.componentInstance.receivedQty()).toBe(10);
  });

  it('falls back to the first warehouse when none is marked default', async () => {
    await setup({ warehouses: [{ _id: 'w3', name: 'Только этот', isActive: true }] });
    expect(fixture.componentInstance.warehouseId()).toBe('w3');
  });

  it('submits warehouseId + receivedQty and closes with the received request', async () => {
    await setup();

    (fixture.nativeElement.querySelector('[data-test="supply-request-receive-submit"]') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(api.receive).toHaveBeenCalledWith('r1', { warehouseId: 'w2', receivedQty: 10 });
    expect(ref.close).toHaveBeenCalledWith(expect.objectContaining({ status: 'received' }));
  });

  it('rejects a zero/negative qty without calling the API', async () => {
    await setup();
    const qty = fixture.nativeElement.querySelector('[data-test="supply-request-receive-qty"]') as HTMLInputElement;
    qty.value = '0';
    qty.dispatchEvent(new Event('input'));

    (fixture.nativeElement.querySelector('[data-test="supply-request-receive-submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(api.receive).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[data-test="supply-request-receive-error"]')).not.toBeNull();
  });

  it('shows the server error on a repeat-receive 409 and keeps the dialog open', async () => {
    await setup();
    api.receive.mockReturnValue(
      of({ ok: false, error: new HttpErrorResponse({ status: 409, error: { message: 'Заявка уже отмечена как полученная' } }) }),
    );

    (fixture.nativeElement.querySelector('[data-test="supply-request-receive-submit"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(ref.close).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[data-test="supply-request-receive-error"]')?.textContent).toContain(
      'уже отмечена',
    );
  });
});
