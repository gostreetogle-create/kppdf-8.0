import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PiOrdersService, type KitAvailability, type Order } from '@kppdf/data-access';
import { PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import {
  KitReserveConfirmDialogComponent,
  type KitReserveConfirmDialogData,
} from './kit-reserve-confirm-dialog.component';

describe('KitReserveConfirmDialogComponent (TZ-NX-SUPPLY-S2)', () => {
  let fixture: ComponentFixture<KitReserveConfirmDialogComponent>;
  let ordersApi: { getKitAvailability: jest.Mock; confirmKitReserve: jest.Mock };
  let ref: { closed: ReturnType<typeof signal>; close: jest.Mock };

  const order: Order = {
    _id: 'order-1',
    number: 'ORD-001',
    items: [
      { productId: 'p-1', productName: 'Дверь', quantity: 1 },
      { productId: 'p-2', productName: 'Окно', quantity: 2 },
    ],
  };

  const availability = (overrides: Partial<KitAvailability> = {}): KitAvailability => ({
    orderId: 'order-1',
    orderItemIndex: 0,
    lines: [
      {
        materialId: 'm1',
        materialName: 'Профиль 40x40',
        needQty: 10,
        availableQty: 4,
        warehouseId: 'w1',
        status: 'short',
      },
    ],
    summary: { canReserveAll: false },
    ...overrides,
  });

  async function setup(data: KitReserveConfirmDialogData = { order }): Promise<void> {
    ordersApi = {
      getKitAvailability: jest.fn().mockReturnValue(of({ ok: true, data: availability() })),
      confirmKitReserve: jest.fn().mockReturnValue(
        of({ ok: true, data: { reserved: [], supplyRequestIds: ['sr1'], warnings: ['короткая линия'] } }),
      ),
    };
    ref = { closed: signal(undefined), close: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [KitReserveConfirmDialogComponent],
      providers: [
        provideRouter([]),
        { provide: PI_DIALOG_DATA, useValue: data },
        { provide: PI_DIALOG_REF, useValue: ref as unknown as DialogRef<unknown> },
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KitReserveConfirmDialogComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    fixture?.destroy();
    TestBed.resetTestingModule();
  });

  it('loads availability for item 0 on init and shows a line picker for a multi-item order', async () => {
    await setup();
    expect(ordersApi.getKitAvailability).toHaveBeenCalledWith('order-1', 0);
    expect(
      fixture.nativeElement.querySelector('[data-test="kit-reserve-item-select"]'),
    ).toBeTruthy();
  });

  it('hides the line picker for a single-item order', async () => {
    await setup({ order: { ...order, items: order.items?.slice(0, 1) } });
    expect(
      fixture.nativeElement.querySelector('[data-test="kit-reserve-item-select"]'),
    ).toBeNull();
  });

  it('shows need/available/status per material line', async () => {
    await setup();
    const line = fixture.nativeElement.querySelector('[data-test="kit-reserve-line-m1"]');
    expect(line.textContent).toContain('Профиль 40x40');
    expect(line.textContent).toContain('нужно 10');
    expect(line.textContent).toContain('есть 4');
    expect(fixture.nativeElement.querySelector('[data-test="kit-reserve-status-m1"]').textContent).toContain(
      'нехватка',
    );
  });

  it('reloads availability for the selected item on line change', async () => {
    await setup();
    ordersApi.getKitAvailability.mockClear();
    const select = fixture.nativeElement.querySelector(
      '[data-test="kit-reserve-item-select"]',
    ) as HTMLSelectElement;
    select.value = '1';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(ordersApi.getKitAvailability).toHaveBeenCalledWith('order-1', 1);
  });

  it('shows an error banner (not a crash) when availability fails', async () => {
    ordersApi = {
      getKitAvailability: jest.fn().mockReturnValue(
        of({ ok: false, error: { status: 400, error: { message: 'Нет состава' } } }),
      ),
      confirmKitReserve: jest.fn(),
    };
    ref = { closed: signal(undefined), close: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [KitReserveConfirmDialogComponent],
      providers: [
        provideRouter([]),
        { provide: PI_DIALOG_DATA, useValue: { order } },
        { provide: PI_DIALOG_REF, useValue: ref as unknown as DialogRef<unknown> },
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(KitReserveConfirmDialogComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="kit-reserve-error"]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="kit-reserve-confirm-submit"] button')
        ?.disabled,
    ).toBe(true);
  });

  it('confirms and shows the reserved/supply-request result with a deep-link to /supply', async () => {
    await setup();
    (
      fixture.nativeElement.querySelector('[data-test="kit-reserve-confirm-submit"]') as HTMLButtonElement
    ).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(ordersApi.confirmKitReserve).toHaveBeenCalledWith('order-1', 0);
    const summary = fixture.nativeElement.querySelector('[data-test="kit-reserve-result-summary"]');
    expect(summary.textContent).toContain('создано заявок снабжения: 1');
    const link = fixture.nativeElement.querySelector(
      '[data-test="kit-reserve-open-supply"]',
    ) as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/supply?orderId=order-1');
  });

  it('close() returns the confirm result once confirmed, undefined before', async () => {
    await setup();
    (fixture.componentInstance as unknown as { close: () => void }).close();
    expect(ref.close).toHaveBeenCalledWith(undefined);

    (
      fixture.nativeElement.querySelector('[data-test="kit-reserve-confirm-submit"]') as HTMLButtonElement
    ).click();
    await fixture.whenStable();
    fixture.detectChanges();

    (
      fixture.nativeElement.querySelector('[data-test="kit-reserve-done"]') as HTMLButtonElement
    ).click();
    expect(ref.close).toHaveBeenLastCalledWith(
      expect.objectContaining({ supplyRequestIds: ['sr1'] }),
    );
  });
});
