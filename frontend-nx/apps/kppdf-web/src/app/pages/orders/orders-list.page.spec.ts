import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { PiOrdersService, type Order } from '@kppdf/data-access';
import type { SilentResult } from '@kppdf/util-http';
import { OrdersListPage } from './orders-list.page';

describe('OrdersListPage (TZ-NX-SALES-S34-ORDERS-LIST)', () => {
  let fixture: ComponentFixture<OrdersListPage>;
  let service: { list: jest.Mock };

  const orders: Order[] = [
    {
      _id: 'order-1',
      number: 'ORD-001',
      status: 'confirmed',
      isPaid: true,
      quotationId: 'quotation-1',
    },
    {
      _id: 'order-2',
      number: 'ORD-002',
      status: 'draft',
      isPaid: false,
    },
  ];

  async function setup(result: ReturnType<typeof of> | Subject<SilentResult<Order[]>>): Promise<void> {
    service = { list: jest.fn().mockReturnValue(result) };
    await TestBed.configureTestingModule({
      imports: [OrdersListPage],
      providers: [provideRouter([]), { provide: PiOrdersService, useValue: service }],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersListPage);
    fixture.detectChanges();
  }

  async function settle(): Promise<void> {
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders the loading state while the list request is pending', async () => {
    const pending = new Subject<SilentResult<Order[]>>();
    await setup(pending);

    expect(fixture.nativeElement.querySelector('[data-test="orders-list"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="orders-loading"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="orders-table"]')).toBeNull();
  });

  it('renders a retryable error state and retries the list request', async () => {
    const failure: SilentResult<Order[]> = {
      ok: false,
      error: new HttpErrorResponse({ status: 503, statusText: 'Unavailable' }),
    };
    service = { list: jest.fn() };
    service.list
      .mockReturnValueOnce(of(failure))
      .mockReturnValueOnce(of({ ok: true, data: orders } satisfies SilentResult<Order[]>));
    await TestBed.configureTestingModule({
      imports: [OrdersListPage],
      providers: [provideRouter([]), { provide: PiOrdersService, useValue: service }],
    }).compileComponents();
    fixture = TestBed.createComponent(OrdersListPage);
    fixture.detectChanges();
    await settle();

    const error = fixture.nativeElement.querySelector('[data-test="orders-error"]');
    expect(error).toBeTruthy();
    expect(error.textContent).toContain('Ошибка запроса к серверу');
    (error.querySelector('button') as HTMLButtonElement).click();
    await settle();

    expect(service.list).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelector('[data-test="orders-table"]')).toBeTruthy();
  });

  it('renders an honest empty state for a successful empty response', async () => {
    await setup(of({ ok: true, data: [] } satisfies SilentResult<Order[]>));
    await settle();

    expect(fixture.nativeElement.querySelector('[data-test="orders-empty"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="orders-table"]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Заказов пока нет');
  });

  it('renders Russian status, payment, and direct-order markers with a detail link per row', async () => {
    await setup(of({ ok: true, data: orders } satisfies SilentResult<Order[]>));
    await settle();

    const rows = fixture.nativeElement.querySelectorAll('[data-test="orders-row"]');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('ORD-001');
    expect(rows[0].textContent).toContain('Подтверждён');
    expect(rows[0].textContent).toContain('Оплачен');
    expect(rows[0].textContent).toContain('Есть КП');
    expect(rows[1].textContent).toContain('Черновик');
    expect(rows[1].textContent).toContain('Не оплачен');
    expect(rows[1].textContent).toContain('Без КП');
    const link = rows[0].querySelector('[data-test="orders-row-link"]') as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/orders/order-1');
  });
});
