import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { PiOrdersService, type Order } from '@kppdf/data-access';
import { PiToastService } from '@kppdf/ui/toast';
import type { SilentResult } from '@kppdf/util-http';
import { OrderDetailPage } from './order-detail.page';

describe('OrderDetailPage (TZ-NX-SALES-S35-ORDER-DETAIL)', () => {
  let fixture: ComponentFixture<OrderDetailPage>;
  let ordersApi: { getById: jest.Mock; update: jest.Mock };
  let toast: { error: jest.Mock };
  let router: { navigate: jest.Mock };

  const quotationOrder: Order = {
    _id: 'order-1',
    number: 'ORD-001',
    status: 'confirmed',
    isPaid: true,
    paidAt: '2026-09-01T10:00:00Z',
    quotationId: 'quotation-1',
    counterpartyId: { _id: 'cp-1', name: 'ООО Пример' },
    siteId: { _id: 'site-1', name: 'Склад №1', address: 'Москва' },
    items: [
      { productId: 'p-1', productName: 'Стол', quantity: 2, unit: 'шт' },
      { productId: 'p-2', productName: 'Стул', quantity: 8, unit: 'шт' },
    ],
  };

  const directOrder: Order = {
    _id: 'order-2',
    number: 'ORD-002',
    status: 'draft',
    isPaid: false,
  };

  async function setup(result: ReturnType<typeof of> | Subject<SilentResult<Order>>): Promise<void> {
    ordersApi = { getById: jest.fn().mockReturnValue(result), update: jest.fn() };
    toast = { error: jest.fn() };
    router = { navigate: jest.fn().mockResolvedValue(true) };
    await TestBed.configureTestingModule({
      imports: [OrderDetailPage],
      providers: [
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiToastService, useValue: toast },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'order-1' } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDetailPage);
    fixture.detectChanges();
  }

  async function settle(): Promise<void> {
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders the loading state while the detail request is pending', async () => {
    const pending = new Subject<SilentResult<Order>>();
    await setup(pending);

    expect(fixture.nativeElement.querySelector('[data-test="order-detail"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-loading"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-body"]')).toBeNull();
    expect(ordersApi.getById).toHaveBeenCalledWith('order-1');
  });

  it('renders a retryable error banner for a 404 and retries the request', async () => {
    const failure: SilentResult<Order> = {
      ok: false,
      error: new HttpErrorResponse({ status: 404, error: { message: 'Order not found' } }),
    };
    ordersApi = { getById: jest.fn(), update: jest.fn() };
    ordersApi.getById
      .mockReturnValueOnce(of(failure))
      .mockReturnValueOnce(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    toast = { error: jest.fn() };
    router = { navigate: jest.fn().mockResolvedValue(true) };
    await TestBed.configureTestingModule({
      imports: [OrderDetailPage],
      providers: [
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiToastService, useValue: toast },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'order-1' } } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OrderDetailPage);
    fixture.detectChanges();
    await settle();

    const error = fixture.nativeElement.querySelector('[data-test="order-error"]');
    expect(error).toBeTruthy();
    expect(error.textContent).toContain('Объект не найден');
    (error.querySelector('button') as HTMLButtonElement).click();
    await settle();

    expect(ordersApi.getById).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelector('[data-test="order-body"]')).toBeTruthy();
  });

  it('renders number, Russian status, counterparty, site, and items (name × qty)', async () => {
    await setup(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    await settle();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('ORD-001');
    expect(text).toContain('Подтверждён');
    expect(text).toContain('ООО Пример');
    expect(text).toContain('Склад №1');
    expect(text).toContain('Стол');
    expect(text).toContain('Стул');

    const itemRows = fixture.nativeElement.querySelectorAll('[data-test="order-item"]');
    expect(itemRows.length).toBe(2);
    expect(itemRows[0].textContent).toContain('×2');
  });

  it('shows an honest empty-items note when the payload has no lines', async () => {
    await setup(of({ ok: true, data: directOrder } satisfies SilentResult<Order>));
    await settle();

    expect(fixture.nativeElement.textContent).toContain('В заказе нет изделий');
  });

  it('renders «Без КП» without any stub-proposal CTA for a direct order', async () => {
    await setup(of({ ok: true, data: directOrder } satisfies SilentResult<Order>));
    await settle();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Без КП');
    expect(text).not.toContain('Создать черновик КП');
    expect(fixture.nativeElement.innerHTML).not.toContain('stub-proposal');
    expect(fixture.nativeElement.querySelector('[data-test="order-open-studio"]')).toBeNull();
  });

  it('offers «КП в студии» when quotationId exists and navigates via studio query', async () => {
    await setup(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    await settle();

    const open = fixture.nativeElement.querySelector('[data-test="order-open-studio"]');
    expect(open).toBeTruthy();
    open.click();
    await settle();

    expect(router.navigate).toHaveBeenCalledWith(['/studio'], { queryParams: { quotationId: 'quotation-1' } });
  });

  it('sends PATCH { isPaid } from the paid toggle and reflects the server answer', async () => {
    ordersApi = { getById: jest.fn(), update: jest.fn() };
    ordersApi.getById.mockReturnValue(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    ordersApi.update.mockReturnValue(
      of({ ok: true, data: { ...quotationOrder, isPaid: false } } satisfies SilentResult<Order>),
    );
    toast = { error: jest.fn() };
    router = { navigate: jest.fn().mockResolvedValue(true) };
    await TestBed.configureTestingModule({
      imports: [OrderDetailPage],
      providers: [
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiToastService, useValue: toast },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'order-1' } } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OrderDetailPage);
    fixture.detectChanges();
    await settle();

    const toggle = fixture.nativeElement.querySelector('[data-test="order-paid-toggle"]') as HTMLInputElement;
    expect(toggle.checked).toBe(true);
    toggle.click();
    await settle();

    expect(ordersApi.update).toHaveBeenCalledWith('order-1', { isPaid: false });
    const updated = fixture.nativeElement.querySelector('[data-test="order-paid-toggle"]') as HTMLInputElement;
    expect(updated.checked).toBe(false);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('does not lie about payment when the PATCH fails: toast + checkbox keeps the old fact', async () => {
    ordersApi = { getById: jest.fn(), update: jest.fn() };
    ordersApi.getById.mockReturnValue(of({ ok: true, data: quotationOrder } satisfies SilentResult<Order>));
    ordersApi.update.mockReturnValue(
      of({ ok: false, error: new HttpErrorResponse({ status: 500 }) } satisfies SilentResult<Order>),
    );
    toast = { error: jest.fn() };
    router = { navigate: jest.fn().mockResolvedValue(true) };
    await TestBed.configureTestingModule({
      imports: [OrderDetailPage],
      providers: [
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiToastService, useValue: toast },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'order-1' } } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OrderDetailPage);
    fixture.detectChanges();
    await settle();

    const toggle = fixture.nativeElement.querySelector('[data-test="order-paid-toggle"]') as HTMLInputElement;
    toggle.click();
    await settle();

    expect(ordersApi.update).toHaveBeenCalledWith('order-1', { isPaid: false });
    expect(toast.error).toHaveBeenCalled();
    const after = fixture.nativeElement.querySelector('[data-test="order-paid-toggle"]') as HTMLInputElement;
    expect(after.checked).toBe(true);
  });
});