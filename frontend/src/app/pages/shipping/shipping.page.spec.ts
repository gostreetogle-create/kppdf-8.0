import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { of } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { PiToastService } from '../../shared/ui/toast';
import { OrdersService } from '../orders/orders.service';
import { ShipmentsService } from '../../shared/services/shipments.service';
import { ShippingPage } from './shipping.page';

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
    };
    TestBed.configureTestingModule({
      imports: [ShippingPage],
      providers: [
        provideHttpClient(withInterceptors([])),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: OrdersService, useValue: orders },
        { provide: ShipmentsService, useValue: shipments },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
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
