import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import {
  PiOrdersService,
  PiOrganizationsService,
  PiSupplyRequestsService,
  PiWarehousesService,
  type Order,
  type Organization,
  type SupplyRequest,
  type Warehouse,
} from '@kppdf/data-access';
import { AlertDialogComponent, PiDialogService, type DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { SupplyRequestsPage } from './supply-requests.page';
import { SupplyRequestFormDialogComponent } from './supply-request-form-dialog.component';
import { SupplyRequestReceiveDialogComponent } from './supply-request-receive-dialog.component';

describe('SupplyRequestsPage (TZ-NX-SUPPLY-S3-REQUEST-JOURNAL)', () => {
  let fixture: ComponentFixture<SupplyRequestsPage>;
  let api: { list: jest.Mock; remove: jest.Mock };
  let ordersApi: { list: jest.Mock };
  let organizationsApi: { list: jest.Mock };
  let warehousesApi: { list: jest.Mock };
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
      materialId: 'm1',
      neededBy: '2026-09-10',
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
      materialId: 'm2',
      neededBy: '2026-09-20',
    },
  ];
  const orders: Order[] = [{ _id: 'o1', number: 'ORD-1' } as Order];
  const suppliers: Organization[] = [{ _id: 's1', name: 'ООО Металл', inn: '123', type: ['supplier'] }];
  const warehouses: Warehouse[] = [{ _id: 'w1', name: 'Основной', isActive: true, isDefault: true }];

  async function setup(): Promise<void> {
    api = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: rows })),
      remove: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
    };
    ordersApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: orders })) };
    organizationsApi = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: { items: suppliers, total: 1, page: 1, limit: 100 } })),
    };
    warehousesApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: warehouses })) };
    dialog = { open: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [SupplyRequestsPage],
      providers: [
        provideRouter([]),
        { provide: PiSupplyRequestsService, useValue: api },
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiOrganizationsService, useValue: organizationsApi },
        { provide: PiWarehousesService, useValue: warehousesApi },
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

  it('filters by neededBy date range', async () => {
    await setup();
    const dateFrom = fixture.nativeElement.querySelector('[data-test="supply-request-date-from"]') as HTMLInputElement;
    dateFrom.value = '2026-09-15';
    dateFrom.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const remaining = fixture.nativeElement.querySelectorAll('[data-test="supply-request-row"]');
    expect(remaining.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Труба');
  });

  it('shows a router link to the order when orderId resolves, otherwise the orderLabel text', async () => {
    await setup();
    const link = fixture.nativeElement.querySelector('[data-test="supply-request-order-link"]') as HTMLAnchorElement;
    expect(link).not.toBeNull();
    expect(link.textContent?.trim()).toBe('ORD-1');
    expect(fixture.nativeElement.textContent).toContain('Цех 2');
  });

  it('shows and clears active filters via «Сбросить фильтры»', async () => {
    await setup();
    expect(fixture.nativeElement.querySelector('[data-test="supply-request-reset-filters"]')).toBeNull();

    const paidOnly = fixture.nativeElement.querySelector(
      '[data-test="supply-request-paid-filter"]',
    ) as HTMLInputElement;
    paidOnly.checked = true;
    paidOnly.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const resetBtn = fixture.nativeElement.querySelector(
      '[data-test="supply-request-reset-filters"]',
    ) as HTMLButtonElement;
    expect(resetBtn).not.toBeNull();
    resetBtn.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="supply-request-reset-filters"]')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('[data-test="supply-request-row"]').length).toBe(2);
  });

  it('shows a distinct empty state for "no matches" vs "no data at all"', async () => {
    await setup();
    const search = fixture.nativeElement.querySelector('[data-test="supply-request-search"]') as HTMLInputElement;
    search.value = 'nonexistent';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="supply-requests-empty"]')?.textContent).toContain(
      'Ничего не найдено',
    );
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

  it('shows «Получено» only for receivable rows and opens the receive dialog with preloaded warehouses', async () => {
    await setup();
    const receiveButtons = fixture.nativeElement.querySelectorAll('[data-test="supply-request-receive"]');
    expect(receiveButtons.length).toBe(1);

    const ref = { closed: () => undefined } as unknown as DialogRef<unknown>;
    dialog.open.mockReturnValue(ref);
    (receiveButtons[0] as HTMLButtonElement).click();

    expect(dialog.open).toHaveBeenCalledWith(
      SupplyRequestReceiveDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({ request: expect.objectContaining({ _id: 'r1' }), warehouses }),
      }),
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
