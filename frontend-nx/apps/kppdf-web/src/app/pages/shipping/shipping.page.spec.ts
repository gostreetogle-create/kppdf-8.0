import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import {
  PiOrdersService,
  PiShipmentsService,
  PiWarehousesService,
  type Order,
  type Shipment,
  type Warehouse,
} from '@kppdf/data-access';
import { PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { ShippingPage } from './shipping.page';

describe('ShippingPage (TZ-NX-SHIP-S1-REGISTRY)', () => {
  let fixture: ComponentFixture<ShippingPage>;
  let shipmentsApi: {
    list: jest.Mock;
    dispatch: jest.Mock;
    cancelShipment: jest.Mock;
    update: jest.Mock;
  };
  let ordersApi: { list: jest.Mock };
  let warehousesApi: { list: jest.Mock };
  let dialog: { open: jest.Mock };
  let navigateSpy: jest.SpyInstance;
  let queryParams$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const orders: Order[] = [{ _id: 'o1', number: 'ORD-1' } as Order];
  const warehouses: Warehouse[] = [{ _id: 'w1', name: 'Основной', isActive: true }];

  const shipment = (overrides: Partial<Shipment> = {}): Shipment => ({
    _id: 's1',
    number: 'SHIP-001',
    orderId: 'o1',
    counterpartyId: 'c1',
    date: '2026-09-08T00:00:00.000Z',
    status: 'scheduled',
    items: [{ productId: 'p1', quantity: 2 }],
    ...overrides,
  });

  async function setup(query: Record<string, string> = {}, rows: Shipment[] = [shipment()]): Promise<void> {
    queryParams$ = new BehaviorSubject(convertToParamMap(query));
    shipmentsApi = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: rows })),
      dispatch: jest.fn().mockReturnValue(of({ ok: true, data: shipment({ status: 'in_transit' }) })),
      cancelShipment: jest.fn().mockReturnValue(of({ ok: true, data: shipment({ status: 'cancelled' }) })),
      update: jest.fn().mockReturnValue(of({ ok: true, data: shipment({ status: 'delivered' }) })),
    };
    ordersApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: orders })) };
    warehousesApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: warehouses })) };
    dialog = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [ShippingPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { queryParamMap: queryParams$ } },
        { provide: PiShipmentsService, useValue: shipmentsApi },
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiWarehousesService, useValue: warehousesApi },
        { provide: PiDialogService, useValue: dialog },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    }).compileComponents();

    navigateSpy = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(ShippingPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    fixture?.destroy();
    TestBed.resetTestingModule();
  });

  it('loads shipments and renders the registry table', async () => {
    await setup();
    expect(shipmentsApi.list).toHaveBeenCalledWith({ status: undefined, orderId: undefined });
    const row = fixture.nativeElement.querySelector('[data-test="shipping-row"]');
    expect(row?.textContent).toContain('SHIP-001');
    expect(row?.textContent).toContain('ORD-1');
  });

  it('applies the orderId query filter and shows the clear chip', async () => {
    await setup({ orderId: 'o1' });
    expect(shipmentsApi.list).toHaveBeenCalledWith({ status: undefined, orderId: 'o1' });
    const chip = fixture.nativeElement.querySelector('[data-test="shipping-order-filter-chip"]');
    expect(chip?.textContent).toContain('ORD-1');

    (fixture.nativeElement.querySelector('[data-test="shipping-order-filter-clear"]') as HTMLButtonElement).click();
    expect(navigateSpy).toHaveBeenCalledWith(
      [],
      expect.objectContaining({ queryParams: { orderId: null }, queryParamsHandling: 'merge' }),
    );
  });

  it('reloads with the selected status filter', async () => {
    await setup();
    const select = fixture.nativeElement.querySelector('[data-test="shipping-status-filter"]') as HTMLSelectElement;
    select.value = 'cancelled';
    select.dispatchEvent(new Event('change'));
    expect(shipmentsApi.list).toHaveBeenLastCalledWith({ status: 'cancelled', orderId: undefined });
  });

  it('shows the empty state when there are no shipments', async () => {
    await setup({}, []);
    expect(fixture.nativeElement.querySelector('[data-test="shipping-empty"]')).toBeTruthy();
  });

  it('opens the create dialog with orders and warehouses', async () => {
    await setup();
    dialog.open.mockReturnValue({ closed: () => undefined });
    (fixture.nativeElement.querySelector('[data-test="shipping-create-toggle"]') as HTMLButtonElement).click();
    expect(dialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: { orders, warehouses } }),
    );
  });

  it('dispatches a scheduled shipment with a warehouse', async () => {
    await setup({}, [shipment({ warehouseId: 'w1' })]);
    (fixture.nativeElement.querySelector('[data-test="shipping-dispatch-s1"]') as HTMLButtonElement).click();
    expect(shipmentsApi.dispatch).toHaveBeenCalledWith('s1');
  });

  it('opens edit instead of dispatching when the shipment has no warehouse', async () => {
    await setup({}, [shipment({ warehouseId: undefined })]);
    dialog.open.mockReturnValue({ closed: () => undefined });
    (fixture.nativeElement.querySelector('[data-test="shipping-dispatch-s1"]') as HTMLButtonElement).click();
    expect(shipmentsApi.dispatch).not.toHaveBeenCalled();
    expect(dialog.open).toHaveBeenCalled();
  });

  it('opens the cancel-shipment confirm dialog (TZ-SHIP-433)', async () => {
    await setup();
    dialog.open.mockReturnValue({ closed: () => undefined });
    (fixture.nativeElement.querySelector('[data-test="shipping-cancel-s1"]') as HTMLButtonElement).click();
    expect(dialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: expect.objectContaining({ variant: 'destructive' }) }),
    );
    expect(shipmentsApi.cancelShipment).not.toHaveBeenCalled();
  });

  it('marks an in-transit shipment as delivered', async () => {
    await setup({}, [shipment({ status: 'in_transit' })]);
    (fixture.nativeElement.querySelector('[data-test="shipping-deliver"]') as HTMLButtonElement).click();
    expect(shipmentsApi.update).toHaveBeenCalledWith('s1', { status: 'delivered' });
  });

  it('expands a row on click to show recipient/address/items/docs, and collapses on second click', async () => {
    await setup(
      {},
      [
        shipment({
          recipient: 'ООО «Ромашка»',
          address: 'г. Москва, ул. Ленина, 1',
          driverInfo: 'Иванов И.И.',
          notes: 'Осторожно, стекло',
          items: [{ productId: 'p1', productName: 'Дверь входная', quantity: 2, unit: 'шт' }],
          docs: [{ number: 'ТТН-1', date: '2026-09-01T00:00:00.000Z', type: 'ttn', totalAmount: 1000 }],
        }),
      ],
    );
    const row = fixture.nativeElement.querySelector('[data-test="shipping-row"]') as HTMLElement;
    expect(row.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.querySelector('[data-test="shipping-row-expand"]')).toBeFalsy();

    row.click();
    fixture.detectChanges();
    expect(row.getAttribute('aria-expanded')).toBe('true');
    const expandEl = fixture.nativeElement.querySelector('[data-test="shipping-row-expand"]');
    expect(expandEl).toBeTruthy();
    expect(expandEl.textContent).toContain('ООО «Ромашка»');
    expect(expandEl.textContent).toContain('г. Москва, ул. Ленина, 1');
    expect(expandEl.textContent).toContain('Иванов И.И.');
    expect(expandEl.textContent).toContain('Осторожно, стекло');
    expect(expandEl.textContent).toContain('Дверь входная');
    expect(expandEl.textContent).toContain('ТТН-1');

    row.click();
    fixture.detectChanges();
    expect(row.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.querySelector('[data-test="shipping-row-expand"]')).toBeFalsy();
  });

  it('does not toggle expand when clicking a row action button', async () => {
    await setup({}, [shipment({ warehouseId: 'w1' })]);
    (fixture.nativeElement.querySelector('[data-test="shipping-dispatch-s1"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    const row = fixture.nativeElement.querySelector('[data-test="shipping-row"]') as HTMLElement;
    expect(row.getAttribute('aria-expanded')).toBe('false');
  });
});
