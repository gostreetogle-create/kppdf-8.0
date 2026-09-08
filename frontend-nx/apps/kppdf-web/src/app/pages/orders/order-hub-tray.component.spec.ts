import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import {
  PiCompositionService,
  PiOrdersService,
  PiReservationsService,
  PiShipmentsService,
  PiSupplyRequestsService,
  type CompositionTreeNode,
  type KitReserveResult,
  type Order,
  type Shipment,
} from '@kppdf/data-access';
import type { DialogRef } from '@kppdf/ui/dialog';
import { PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { OrderHubTrayComponent } from './order-hub-tray.component';
import { KitReserveConfirmDialogComponent } from './kit-reserve-confirm-dialog.component';
import { ShipConfirmDialogComponent } from './ship-confirm-dialog.component';

describe('OrderHubTrayComponent (TZ-NX-DEALS-D2-HUB-TRAY)', () => {
  let fixture: ComponentFixture<OrderHubTrayComponent>;
  let compositionApi: { getProductTree: jest.Mock };
  let supplyApi: { list: jest.Mock };
  let reservationsApi: { list: jest.Mock };
  let shipmentsApi: { list: jest.Mock; cancelShipment: jest.Mock };
  let ordersApi: { ship: jest.Mock };
  let toast: { success: jest.Mock; error: jest.Mock };
  let dialog: { open: jest.Mock };

  const order: Order = {
    _id: 'order-1',
    number: 'ORD-001',
    status: 'confirmed',
    items: [
      { productId: 'p-1', productName: 'Дверь', quantity: 1, readyForWork: true },
      { productId: 'p-2', productName: 'Окно', quantity: 2, readyForWork: false },
    ],
  };

  async function setup(order_: Order = order, shipments: Shipment[] = []): Promise<void> {
    compositionApi = { getProductTree: jest.fn() };
    supplyApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    reservationsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    shipmentsApi = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: shipments })),
      cancelShipment: jest.fn().mockReturnValue(of({ ok: true, data: shipments[0] })),
    };
    ordersApi = { ship: jest.fn().mockReturnValue(of({ ok: true, data: { ...order_, status: 'shipped' } })) };
    toast = { success: jest.fn(), error: jest.fn() };
    dialog = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [OrderHubTrayComponent],
      providers: [
        provideRouter([]),
        { provide: PiCompositionService, useValue: compositionApi },
        { provide: PiSupplyRequestsService, useValue: supplyApi },
        { provide: PiReservationsService, useValue: reservationsApi },
        { provide: PiShipmentsService, useValue: shipmentsApi },
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiToastService, useValue: toast },
        { provide: PiDialogService, useValue: dialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', order_);
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders the four hub groups: Заказ, Исполнение, Логистика, Документы', async () => {
    await setup();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[data-test="order-group-order"]')).toBeTruthy();
    expect(root.querySelector('[data-test="order-group-execution"]')).toBeTruthy();
    expect(root.querySelector('[data-test="order-group-logistics"]')).toBeTruthy();
    expect(root.querySelector('[data-test="order-group-documents"]')).toBeTruthy();
  });

  it('loads supply, reservations, and shipments eagerly on init (row-expand budget, not behind a sub-toggle)', async () => {
    await setup();
    expect(supplyApi.list).toHaveBeenCalledWith({ orderId: 'order-1' });
    expect(reservationsApi.list).toHaveBeenCalledWith({ orderId: 'ORD-001' });
    expect(shipmentsApi.list).toHaveBeenCalledWith({ orderId: 'order-1' });
    expect(compositionApi.getProductTree).not.toHaveBeenCalled();
  });

  it('TZ-NX-SHIP-S3: shows the «Отгружено» button for a markable order with no shipment yet', async () => {
    await setup();
    expect(fixture.nativeElement.querySelector('[data-test="order-ship-button"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-shipment-block"]')).toBeFalsy();
  });

  it('TZ-NX-SHIP-S2/S3: shows an honest empty message (no button) once the order is cancelled with no shipment', async () => {
    await setup({ ...order, status: 'cancelled' });
    const summary = fixture.nativeElement.querySelector('[data-test="order-shipping-summary"]');
    expect(summary?.textContent).toContain('Отгрузка не оформлена');
    expect(fixture.nativeElement.querySelector('[data-test="order-ship-button"]')).toBeFalsy();
  });

  it('TZ-NX-SHIP-S2: shows the real shipment number/date and «Документ не оформлен» when there are no docs', async () => {
    await setup(order, [
      {
        _id: 'ship-1',
        number: 'SHIP-001',
        orderId: 'order-1',
        counterpartyId: 'c1',
        date: '2026-09-08T10:00:00.000Z',
        status: 'scheduled',
        items: [],
      },
    ]);
    const block = fixture.nativeElement.querySelector('[data-test="order-shipment-block"]');
    expect(block).toBeTruthy();
    expect(block.querySelector('[data-test="order-shipment-summary"]').textContent).toContain('SHIP-001');
    expect(block.querySelector('[data-test="order-shipment-no-docs"]')).toBeTruthy();
  });

  it('TZ-NX-SHIP-S2: hides «Документ не оформлен» once a doc is attached, and ignores cancelled shipments', async () => {
    await setup(order, [
      {
        _id: 'ship-0',
        number: 'SHIP-000',
        orderId: 'order-1',
        counterpartyId: 'c1',
        date: '2026-09-01T10:00:00.000Z',
        status: 'cancelled',
        items: [],
      },
      {
        _id: 'ship-1',
        number: 'SHIP-001',
        orderId: 'order-1',
        counterpartyId: 'c1',
        date: '2026-09-08T10:00:00.000Z',
        status: 'scheduled',
        items: [],
        docs: [{ number: 'TTN-1', date: '2026-09-08', type: 'ttn', totalAmount: 1000 }],
      },
    ]);
    const block = fixture.nativeElement.querySelector('[data-test="order-shipment-block"]');
    expect(block.querySelector('[data-test="order-shipment-summary"]').textContent).toContain('SHIP-001');
    expect(block.querySelector('[data-test="order-shipment-no-docs"]')).toBeFalsy();
  });

  const cancellableShipment: Shipment = {
    _id: 'ship-1',
    number: 'SHIP-001',
    orderId: 'order-1',
    counterpartyId: 'c1',
    date: '2026-09-08T10:00:00.000Z',
    status: 'scheduled',
    items: [],
  };

  it('TZ-NX-SHIP-S4: shows «Отменить отгрузку» for a scheduled shipment without dispatchedAt', async () => {
    await setup(order, [cancellableShipment]);
    expect(fixture.nativeElement.querySelector('[data-test="order-cancel-shipment-button"]')).toBeTruthy();
  });

  it('TZ-NX-SHIP-S4: hides the cancel button once the shipment has dispatchedAt', async () => {
    await setup(order, [{ ...cancellableShipment, status: 'in_transit', dispatchedAt: '2026-09-08T11:00:00.000Z' }]);
    expect(fixture.nativeElement.querySelector('[data-test="order-cancel-shipment-button"]')).toBeFalsy();
  });

  it('TZ-NX-SHIP-S4: hides the cancel button for a delivered shipment', async () => {
    await setup(order, [{ ...cancellableShipment, status: 'delivered' }]);
    expect(fixture.nativeElement.querySelector('[data-test="order-cancel-shipment-button"]')).toBeFalsy();
  });

  it('TZ-NX-SHIP-S4: opens a destructive confirm dialog before cancelling', async () => {
    await setup(order, [cancellableShipment]);
    dialog.open.mockReturnValue({ closed: () => undefined });
    (fixture.nativeElement.querySelector('[data-test="order-cancel-shipment-button"]') as HTMLButtonElement).click();
    expect(dialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: expect.objectContaining({ variant: 'destructive' }) }),
    );
    expect(shipmentsApi.cancelShipment).not.toHaveBeenCalled();
  });

  it('TZ-NX-SHIP-S4: cancels and reloads shipments on confirm', async () => {
    await setup(order, [cancellableShipment]);
    shipmentsApi.cancelShipment.mockReturnValue(
      of({ ok: true, data: { ...cancellableShipment, status: 'cancelled' } }),
    );
    const closed = signal<boolean | undefined>(undefined);
    const ref = { closed, close: (value?: boolean) => closed.set(value) } as unknown as DialogRef<boolean | undefined>;
    dialog.open.mockReturnValue(ref);
    shipmentsApi.list.mockClear();

    (fixture.nativeElement.querySelector('[data-test="order-cancel-shipment-button"]') as HTMLButtonElement).click();
    closed.set(true);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(shipmentsApi.cancelShipment).toHaveBeenCalledWith('ship-1');
    expect(toast.success).toHaveBeenCalled();
    expect(shipmentsApi.list).toHaveBeenCalledTimes(1);
  });

  it('TZ-NX-SHIP-S4: shows a toast error and does not reload when cancel fails', async () => {
    await setup(order, [cancellableShipment]);
    shipmentsApi.cancelShipment.mockReturnValue(
      of({ ok: false, error: new HttpErrorResponse({ status: 400 }) }),
    );
    const closed = signal<boolean | undefined>(undefined);
    const ref = { closed, close: (value?: boolean) => closed.set(value) } as unknown as DialogRef<boolean | undefined>;
    dialog.open.mockReturnValue(ref);
    shipmentsApi.list.mockClear();

    (fixture.nativeElement.querySelector('[data-test="order-cancel-shipment-button"]') as HTMLButtonElement).click();
    closed.set(true);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(toast.error).toHaveBeenCalled();
    expect(shipmentsApi.list).not.toHaveBeenCalled();
  });

  it('TZ-NX-SHIP-S2: surfaces the API error honestly instead of a fake summary', async () => {
    shipmentsApi = { list: jest.fn(), cancelShipment: jest.fn() };
    compositionApi = { getProductTree: jest.fn() };
    supplyApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    reservationsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    shipmentsApi.list.mockReturnValue(
      of({ ok: false, error: new HttpErrorResponse({ status: 500, error: { message: 'boom' } }) }),
    );
    ordersApi = { ship: jest.fn() };
    toast = { success: jest.fn(), error: jest.fn() };
    dialog = { open: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [OrderHubTrayComponent],
      providers: [
        provideRouter([]),
        { provide: PiCompositionService, useValue: compositionApi },
        { provide: PiSupplyRequestsService, useValue: supplyApi },
        { provide: PiReservationsService, useValue: reservationsApi },
        { provide: PiShipmentsService, useValue: shipmentsApi },
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiToastService, useValue: toast },
        { provide: PiDialogService, useValue: dialog },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', order);
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('[data-test="order-shipment-error"]');
    expect(error?.textContent).toBeTruthy();
  });

  it('shows readiness X из Y from items.readyForWork', async () => {
    await setup();
    const summary = fixture.nativeElement.querySelector('[data-test="order-readiness-summary"]');
    expect(summary.textContent.trim()).toBe('1 из 2');
  });

  it('shows «—» readiness and no composition http for an order without items', async () => {
    await setup({ ...order, items: [] });
    const summary = fixture.nativeElement.querySelector('[data-test="order-readiness-summary"]');
    expect(summary.textContent.trim()).toBe('—');
    fixture.nativeElement.querySelector('[data-test="order-composition-toggle"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="order-composition-panel"]').textContent).toContain(
      'Состав пуст',
    );
    expect(compositionApi.getProductTree).not.toHaveBeenCalled();
  });

  it('shows empty supply copy, not a crash, when there are no supply tasks', async () => {
    await setup();
    const block = fixture.nativeElement.querySelector('[data-test="order-supply-block"]');
    expect(block.textContent).toContain('Нет задач снабжения');
  });

  it('shows supply counters when tasks exist', async () => {
    supplyApi = {
      list: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: [
            { _id: 's1', qty: 1, status: 'ordered', priority: 'normal' },
            { _id: 's2', qty: 1, status: 'received', priority: 'normal' },
            { _id: 's3', qty: 1, status: 'requested', priority: 'normal' },
          ],
        }),
      ),
    };
    compositionApi = { getProductTree: jest.fn() };
    reservationsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    shipmentsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })), cancelShipment: jest.fn() };
    ordersApi = { ship: jest.fn() };
    toast = { success: jest.fn(), error: jest.fn() };
    dialog = { open: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [OrderHubTrayComponent],
      providers: [
        provideRouter([]),
        { provide: PiCompositionService, useValue: compositionApi },
        { provide: PiSupplyRequestsService, useValue: supplyApi },
        { provide: PiReservationsService, useValue: reservationsApi },
        { provide: PiShipmentsService, useValue: shipmentsApi },
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiToastService, useValue: toast },
        { provide: PiDialogService, useValue: dialog },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', order);
    fixture.detectChanges();

    const counters = fixture.nativeElement.querySelector('[data-test="order-supply-counters"]');
    expect(counters.textContent).toContain('Заказано 1');
    expect(counters.textContent).toContain('Получено 1');
    expect(counters.textContent).toContain('всего 3');
  });

  it('shows an inline error (not a crash) when the supply request fails', async () => {
    supplyApi = {
      list: jest
        .fn()
        .mockReturnValue(of({ ok: false, error: new HttpErrorResponse({ status: 500 }) })),
    };
    compositionApi = { getProductTree: jest.fn() };
    reservationsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    shipmentsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })), cancelShipment: jest.fn() };
    ordersApi = { ship: jest.fn() };
    toast = { success: jest.fn(), error: jest.fn() };
    dialog = { open: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [OrderHubTrayComponent],
      providers: [
        provideRouter([]),
        { provide: PiCompositionService, useValue: compositionApi },
        { provide: PiSupplyRequestsService, useValue: supplyApi },
        { provide: PiReservationsService, useValue: reservationsApi },
        { provide: PiShipmentsService, useValue: shipmentsApi },
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiToastService, useValue: toast },
        { provide: PiDialogService, useValue: dialog },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', order);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="order-supply-error"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-group-logistics"]')).toBeTruthy();
  });

  it('lazy-loads the composition tree per line only on first toggle, keyed by productId', async () => {
    const rootA: CompositionTreeNode = { _id: 'p-1', name: 'Дверь', kind: 'product', quantity: 1, children: [] };
    const rootB: CompositionTreeNode = { _id: 'p-2', name: 'Окно', kind: 'product', quantity: 1, children: [] };
    compositionApi = {
      getProductTree: jest.fn((id: string) => of({ ok: true, data: id === 'p-1' ? rootA : rootB })),
    };
    supplyApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    reservationsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    shipmentsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })), cancelShipment: jest.fn() };
    ordersApi = { ship: jest.fn() };
    toast = { success: jest.fn(), error: jest.fn() };
    dialog = { open: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [OrderHubTrayComponent],
      providers: [
        provideRouter([]),
        { provide: PiCompositionService, useValue: compositionApi },
        { provide: PiSupplyRequestsService, useValue: supplyApi },
        { provide: PiReservationsService, useValue: reservationsApi },
        { provide: PiShipmentsService, useValue: shipmentsApi },
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiToastService, useValue: toast },
        { provide: PiDialogService, useValue: dialog },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', order);
    fixture.detectChanges();

    expect(compositionApi.getProductTree).not.toHaveBeenCalled();
    fixture.nativeElement.querySelector('[data-test="order-composition-toggle"]').click();
    fixture.detectChanges();

    expect(compositionApi.getProductTree).toHaveBeenCalledWith('p-1');
    expect(compositionApi.getProductTree).toHaveBeenCalledWith('p-2');
    expect(compositionApi.getProductTree).toHaveBeenCalledTimes(2);
    const trees = fixture.nativeElement.querySelectorAll('pi-composition-tree');
    expect(trees.length).toBe(2);

    // Collapse + re-open must not refetch (cached).
    fixture.nativeElement.querySelector('[data-test="order-composition-toggle"]').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[data-test="order-composition-toggle"]').click();
    fixture.detectChanges();
    expect(compositionApi.getProductTree).toHaveBeenCalledTimes(2);
  });

  it('has no desk-write controls in the DOM (confirm/ship/add-line/notebook/cancel-shipment)', async () => {
    await setup();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[data-test="desk-primary-cta"]')).toBeFalsy();
    expect(root.querySelector('[data-test="desk-add-line-cta"]')).toBeFalsy();
    expect(root.querySelector('[data-test="desk-ship-button"]')).toBeFalsy();
    expect(root.querySelector('[data-test="desk-notebook-button"]')).toBeFalsy();
    expect(root.querySelector('[data-test="desk-cancel-shipment-button"]')).toBeFalsy();
    expect(root.querySelector('[data-test="desk-supply-button"]')).toBeFalsy();
    expect(root.querySelector('[data-test="desk-create-document-button"]')).toBeFalsy();
  });

  it('wires deep-links: supply/production/storage-items/shipping/documents', async () => {
    await setup();
    const root: HTMLElement = fixture.nativeElement;
    const supplyLink = root.querySelector('[data-test="order-supply-link"]') as HTMLAnchorElement;
    const productionLink = root.querySelector('[data-test="order-production-link"]') as HTMLAnchorElement;
    const warehouseLink = root.querySelector('[data-test="order-warehouse-link"]') as HTMLAnchorElement;
    const shippingLink = root.querySelector('[data-test="order-shipping-link"]') as HTMLAnchorElement;
    const documentsLink = root.querySelector('[data-test="order-documents-link"]') as HTMLAnchorElement;
    expect(supplyLink.getAttribute('href')).toBe('/supply?orderId=order-1');
    expect(productionLink.getAttribute('href')).toBe('/production?orderId=order-1');
    expect(warehouseLink.getAttribute('href')).toBe('/storage-items');
    expect(shippingLink.getAttribute('href')).toBe('/shipping?orderId=order-1');
    expect(documentsLink.getAttribute('href')).toBe('/doc-constructor/templates?source=order&sourceId=order-1');
  });

  it('opens the kit-reserve confirm dialog with the current order', async () => {
    await setup();
    const ref = {
      closed: signal<KitReserveResult | undefined>(undefined),
    } as unknown as DialogRef<KitReserveResult | undefined>;
    dialog.open.mockReturnValue(ref);

    (
      fixture.nativeElement.querySelector('[data-test="order-confirm-materials"]') as HTMLButtonElement
    ).click();

    expect(dialog.open).toHaveBeenCalledWith(
      KitReserveConfirmDialogComponent,
      expect.objectContaining({ data: { order } }),
    );
  });

  it('reloads supply and reservation counters after a kit-reserve confirm', async () => {
    await setup();
    const closed = signal<KitReserveResult | undefined>(undefined);
    const ref = {
      closed,
      close: (value?: KitReserveResult) => closed.set(value),
    } as unknown as DialogRef<KitReserveResult | undefined>;
    dialog.open.mockReturnValue(ref);
    supplyApi.list.mockClear();
    reservationsApi.list.mockClear();

    (
      fixture.nativeElement.querySelector('[data-test="order-confirm-materials"]') as HTMLButtonElement
    ).click();
    closed.set({ reserved: [], supplyRequestIds: ['sr1'], warnings: [] });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(supplyApi.list).toHaveBeenCalledTimes(1);
    expect(reservationsApi.list).toHaveBeenCalledTimes(1);
  });

  it('disables the confirm-materials button for an order without items', async () => {
    await setup({ ...order, items: [] });
    const button = fixture.nativeElement.querySelector(
      '[data-test="order-confirm-materials"]',
    ) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('TZ-NX-DEALS-ORDERS-HUB-TRAY-INSET: no negative margin on the composition toggle (no edge-flush text)', async () => {
    await setup();
    const toggle = fixture.nativeElement.querySelector('[data-test="order-composition-toggle"]');
    expect(toggle.className).not.toMatch(/-mx-/);
  });

  it('TZ-NX-DEALS-ORDERS-HUB-TRAY-INSET: outer group grid uses gap-5 air, not gap-4', async () => {
    await setup();
    const groups = fixture.nativeElement.querySelector('[data-test="order-lifecycle-groups"]');
    expect(groups.className).toMatch(/\bgap-5\b/);
    expect(groups.className).not.toMatch(/\bgap-4\b/);
  });

  it('TZ-NX-DEALS-ORDERS-HUB-TRAY-INSET: Исполнение/Логистика sub-blocks are separate inset tiles, not border-t stacking', async () => {
    await setup();
    const root: HTMLElement = fixture.nativeElement;
    for (const testId of [
      'order-supply-block',
      'order-production-block',
      'order-readiness-block',
      'order-warehouse-block',
      'order-shipping-block',
    ]) {
      const block = root.querySelector(`[data-test="${testId}"]`) as HTMLElement;
      expect(block).toBeTruthy();
      expect(block.className).toMatch(/\bbg-paper-2\b/);
      expect(block.className).toMatch(/\bp-3\b/);
      expect(block.className).not.toMatch(/border-t/);
    }
  });

  it('TZ-NX-SHIP-S3: opens the ship-confirm dialog with the current order', async () => {
    await setup();
    dialog.open.mockReturnValue({ closed: () => undefined });
    (fixture.nativeElement.querySelector('[data-test="order-ship-button"]') as HTMLButtonElement).click();
    expect(dialog.open).toHaveBeenCalledWith(
      ShipConfirmDialogComponent,
      expect.objectContaining({ data: { order } }),
    );
  });

  it('TZ-NX-SHIP-S3: ships the order and reloads shipments on confirm', async () => {
    await setup();
    const closed = signal<{ recipient?: string } | undefined>(undefined);
    const ref = { closed, close: (value?: { recipient?: string }) => closed.set(value) } as unknown as DialogRef<
      { recipient?: string } | undefined
    >;
    dialog.open.mockReturnValue(ref);
    shipmentsApi.list.mockClear();

    (fixture.nativeElement.querySelector('[data-test="order-ship-button"]') as HTMLButtonElement).click();
    closed.set({ recipient: 'Иванов И.И.' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(ordersApi.ship).toHaveBeenCalledWith('order-1', { recipient: 'Иванов И.И.' });
    expect(toast.success).toHaveBeenCalled();
    expect(shipmentsApi.list).toHaveBeenCalledTimes(1);
  });

  it('TZ-NX-SHIP-S3: shows a toast error and does not reload when ship() fails', async () => {
    await setup();
    ordersApi.ship.mockReturnValue(of({ ok: false, error: new HttpErrorResponse({ status: 500 }) }));
    const closed = signal<{ recipient?: string } | undefined>(undefined);
    const ref = { closed, close: (value?: { recipient?: string }) => closed.set(value) } as unknown as DialogRef<
      { recipient?: string } | undefined
    >;
    dialog.open.mockReturnValue(ref);
    shipmentsApi.list.mockClear();

    (fixture.nativeElement.querySelector('[data-test="order-ship-button"]') as HTMLButtonElement).click();
    closed.set({});
    await fixture.whenStable();
    fixture.detectChanges();

    expect(toast.error).toHaveBeenCalled();
    expect(shipmentsApi.list).not.toHaveBeenCalled();
  });
});
