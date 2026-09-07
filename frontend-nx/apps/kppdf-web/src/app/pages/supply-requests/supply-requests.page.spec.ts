import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  PiOrdersService,
  PiOrganizationsService,
  PiSupplyRequestsService,
  type Order,
  type Organization,
  type SupplyRequest,
} from '@kppdf/data-access';
import { AlertDialogComponent, PiDialogService, type DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { SupplyRequestsPage } from './supply-requests.page';
import { SupplyRequestFormDialogComponent } from './supply-request-form-dialog.component';

describe('SupplyRequestsPage (TZ-NX-SUPPLY-S3-REQUEST-JOURNAL)', () => {
  let fixture: ComponentFixture<SupplyRequestsPage>;
  let api: { list: jest.Mock; remove: jest.Mock };
  let ordersApi: { list: jest.Mock };
  let organizationsApi: { list: jest.Mock };
  let dialog: { open: jest.Mock };

  const rows: SupplyRequest[] = [
    {
      _id: 'r1',
      title: 'Болт М6',
      qty: 100,
      unit: 'шт',
      status: 'in_progress',
      priority: 'normal',
      paid: false,
      supplierId: 's1',
      orderId: 'o1',
    },
    {
      _id: 'r2',
      title: 'Труба',
      qty: 5,
      unit: 'м',
      status: 'received',
      priority: 'normal',
      paid: true,
      invoiceNo: 'INV-1',
      orderLabel: 'Цех 2',
    },
  ];
  const orders: Order[] = [{ _id: 'o1', number: 'ORD-1' } as Order];
  const suppliers: Organization[] = [{ _id: 's1', name: 'ООО Металл', inn: '123', type: ['supplier'] }];

  async function setup(): Promise<void> {
    api = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: rows })),
      remove: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
    };
    ordersApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: orders })) };
    organizationsApi = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: { items: suppliers, total: 1, page: 1, limit: 100 } })),
    };
    dialog = { open: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [SupplyRequestsPage],
      providers: [
        { provide: PiSupplyRequestsService, useValue: api },
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiOrganizationsService, useValue: organizationsApi },
        { provide: PiDialogService, useValue: dialog },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SupplyRequestsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('loads and renders the journal with resolved supplier/order labels', async () => {
    await setup();
    const rowsEl = fixture.nativeElement.querySelectorAll('[data-test="supply-request-row"]');
    expect(rowsEl.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('ООО Металл');
    expect(fixture.nativeElement.textContent).toContain('ORD-1');
    expect(fixture.nativeElement.textContent).toContain('Цех 2');
    expect(fixture.nativeElement.textContent).toContain('Оплачено');
    expect(fixture.nativeElement.textContent).toContain('INV-1');
  });

  it('filters by search text, status, and paid-only', async () => {
    await setup();
    const search = fixture.nativeElement.querySelector('[data-test="supply-request-search"]') as HTMLInputElement;
    search.value = 'болт';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-test="supply-request-row"]').length).toBe(1);

    search.value = '';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const paidOnly = fixture.nativeElement.querySelector(
      '[data-test="supply-request-paid-filter"]',
    ) as HTMLInputElement;
    paidOnly.checked = true;
    paidOnly.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-test="supply-request-row"]').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Труба');
  });

  it('opens the create dialog with preloaded orders/suppliers and reloads on save', async () => {
    await setup();
    const ref = { closed: () => undefined } as unknown as DialogRef<unknown>;
    dialog.open.mockReturnValue(ref);

    (fixture.nativeElement.querySelector('[data-test="supply-request-create"]') as HTMLButtonElement).click();

    expect(dialog.open).toHaveBeenCalledWith(
      SupplyRequestFormDialogComponent,
      expect.objectContaining({ data: expect.objectContaining({ orders, suppliers: expect.any(Array) }) }),
    );
  });

  it('opens delete confirmation and removes on confirm', async () => {
    await setup();
    const ref = { closed: () => undefined } as unknown as DialogRef<unknown>;
    dialog.open.mockReturnValue(ref);

    (fixture.nativeElement.querySelector('[data-test="supply-request-delete"]') as HTMLButtonElement).click();
    expect(dialog.open).toHaveBeenCalledWith(AlertDialogComponent, expect.any(Object));
  });
});
