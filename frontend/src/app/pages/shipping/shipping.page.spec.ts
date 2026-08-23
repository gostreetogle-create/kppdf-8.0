import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { of } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { PiToastService } from '../../shared/ui/toast';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { OrdersService } from '../orders/orders.service';
import { ShipmentsService } from '../../shared/services/shipments.service';
import { ShippingPage } from './shipping.page';

async function tickMicrotask(): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 0));
}

describe('ShippingPage TZ-SUPPLY-312', () => {
  const order = {
    _id: 'order-1',
    number: 'ORD-001',
    status: 'ready',
    items: [
      { lineId: 'line-1', productId: 'product-1', productName: 'Стенд', quantity: 4, unit: 'шт' },
      { lineId: 'line-2', productId: 'product-2', productName: 'Полка', quantity: 2, unit: 'шт' },
    ],
  } as never;

  let dialogClosed: ReturnType<typeof signal<boolean | undefined>>;
  let dialogOpen: jest.Mock;

  function setup() {
    const orders = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: [order] })),
      ship: jest.fn().mockReturnValue(of({ ok: true, data: { order, shipmentId: 'shipment-1' } })),
    };
    const shipments = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      dispatch: jest.fn(),
      update: jest.fn(),
      addDoc: jest.fn(),
      cancelShipment: jest
        .fn()
        .mockReturnValue(of({ ok: true, data: { _id: 's1', status: 'cancelled' } })),
    };
    dialogClosed = signal<boolean | undefined>(undefined);
    dialogOpen = jest.fn(() => {
      dialogClosed = signal<boolean | undefined>(undefined);
      return { closed: dialogClosed, close: jest.fn() };
    });
    TestBed.configureTestingModule({
      imports: [ShippingPage],
      providers: [
        provideHttpClient(withInterceptors([])),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: OrdersService, useValue: orders },
        { provide: ShipmentsService, useValue: shipments },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
        { provide: PiDialogService, useValue: { open: dialogOpen } },
      ],
    });
    return { orders, shipments };
  }

  it('replaces the previous stub with an operational empty state', () => {
    setup();
    const fixture = TestBed.createComponent(ShippingPage);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="shipping-stub"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="shipping-empty"]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="shipping-create-toggle"]'),
    ).toBeTruthy();
  });

  it('426: orderId+from=desk query renders the filter chip and «На стол»', async () => {
    setup();
    const params$ = new BehaviorSubject(convertToParamMap({ orderId: 'order-1', from: 'desk' }));
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { queryParamMap: params$.asObservable() },
    });
    const fixture = TestBed.createComponent(ShippingPage);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('[data-test="shipping-order-filter-chip"]'),
    ).toBeTruthy();
    const ret = fixture.nativeElement.querySelector(
      '[data-test="shipping-desk-return"]',
    ) as HTMLAnchorElement | null;
    expect(ret).toBeTruthy();
    expect(ret?.getAttribute('href')).toContain('/desk');
    expect(ret?.getAttribute('href')).toContain('orderId=order-1');
  });

  it('426: no «На стол» bar without from=desk', async () => {
    setup();
    const params$ = new BehaviorSubject(convertToParamMap({ orderId: 'order-1' }));
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { queryParamMap: params$.asObservable() },
    });
    const fixture = TestBed.createComponent(ShippingPage);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="shipping-desk-return"]')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-test="shipping-order-filter-chip"]'),
    ).toBeTruthy();
  });

  it('433: «Отменить отгрузку» on a scheduled shipment confirms then calls cancelShipment', async () => {
    const { shipments } = setup();
    shipments.list.mockReturnValue(
      of({
        ok: true,
        data: [
          {
            _id: 's1',
            number: 'SHP-1',
            orderId: 'order-1',
            status: 'scheduled',
            date: '2026-08-20T10:00:00.000Z',
            items: [],
          },
        ],
      }),
    );
    const fixture = TestBed.createComponent(ShippingPage);
    fixture.detectChanges();
    await tickMicrotask();
    fixture.detectChanges();

    const cancel = fixture.nativeElement.querySelector(
      '[data-test="shipping-cancel-s1"]',
    ) as HTMLButtonElement;
    expect(cancel).toBeTruthy();
    cancel.click();
    fixture.detectChanges();

    expect(dialogOpen).toHaveBeenCalledWith(
      AlertDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({ title: 'Отменить отгрузку?', variant: 'destructive' }),
        width: 'sm',
      }),
    );
    expect(shipments.cancelShipment).not.toHaveBeenCalled();

    dialogClosed.set(true);
    await tickMicrotask();
    fixture.detectChanges();

    expect(shipments.cancelShipment).toHaveBeenCalledWith('s1');
    // reload после успеха + рефреш списка заказов (статус вернулся в ready).
    expect(shipments.list).toHaveBeenCalled();
  });

  it('433: no cancel button on in-transit shipment (phase 2 limitation)', async () => {
    const { shipments } = setup();
    shipments.list.mockReturnValue(
      of({
        ok: true,
        data: [
          {
            _id: 's1',
            number: 'SHP-1',
            orderId: 'order-1',
            status: 'in_transit',
            date: '2026-08-20T10:00:00.000Z',
            items: [],
          },
        ],
      }),
    );
    const fixture = TestBed.createComponent(ShippingPage);
    fixture.detectChanges();
    await tickMicrotask();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="shipping-cancel-s1"]')).toBeNull();
  });

  it('creates a partial shipment from selected order lines', () => {
    const { orders } = setup();
    const fixture = TestBed.createComponent(ShippingPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      openCreate: () => void;
      selectCreateOrder: (id: string) => void;
      setCreateQty: (
        line: { lineId?: string; quantity: number },
        index: number,
        value: number,
      ) => void;
      createShipment: (event: Event) => void;
    };

    comp.openCreate();
    comp.selectCreateOrder('order-1');
    comp.setCreateQty({ lineId: 'line-1', quantity: 4 }, 0, 2);
    comp.setCreateQty({ lineId: 'line-2', quantity: 2 }, 1, 0);
    comp.createShipment(new Event('submit'));

    expect(orders.ship).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({
        items: [{ lineId: 'line-1', quantity: 2 }],
      }),
    );
  });
});
