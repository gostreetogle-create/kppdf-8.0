import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import {
  AuthService,
  PiCompositionService,
  PiOrdersService,
  PiReservationsService,
  PiShipmentsService,
  PiSupplyRequestsService,
  type Order,
} from '@kppdf/data-access';
import { PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import type { SilentResult } from '@kppdf/util-http';
import { HomePage } from './home.page';

describe('HomePage (TZ-NX-HOME-HUB-QUEUE)', () => {
  let fixture: ComponentFixture<HomePage>;
  let ordersApi: { list: jest.Mock };

  const orders: Order[] = [
    { _id: 'order-1', number: 'ORD-001', status: 'confirmed', isPaid: true },
    { _id: 'order-2', number: 'ORD-002', status: 'draft', isPaid: false },
  ];

  async function setup(result: SilentResult<Order[]> = { ok: true, data: orders }): Promise<void> {
    ordersApi = { list: jest.fn().mockReturnValue(of(result)) };
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { user: () => null } },
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiCompositionService, useValue: { getProductTree: jest.fn() } },
        { provide: PiSupplyRequestsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiReservationsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiShipmentsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => TestBed.resetTestingModule());

  it('loads live orders and renders the dense queue without mock rows', async () => {
    await setup();

    const rows = fixture.nativeElement.querySelectorAll('[data-test="home-row"]');
    expect(ordersApi.list).toHaveBeenCalledTimes(1);
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('ORD-001');
    expect(rows[0].textContent).toContain('Подтверждён');
    expect(rows[1].textContent).toContain('Черновик');
    expect(fixture.nativeElement.querySelector('.eyebrow')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('h1').length).toBe(1);
    expect(fixture.nativeElement.querySelector('[data-test="home-queue-placeholder"]')).toBeNull();
  });

  it('filters by search and active status without refetching', async () => {
    await setup();

    const search = fixture.nativeElement.querySelector('[data-test="home-search"]') as HTMLInputElement;
    search.value = '002';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-test="home-row"]').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('ORD-002');

    search.value = '';
    search.dispatchEvent(new Event('input'));
    const filter = fixture.nativeElement.querySelector('[data-test="home-status-filter"]') as HTMLSelectElement;
    filter.value = 'active';
    filter.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-test="home-row"]').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('ORD-001');
    expect(fixture.nativeElement.textContent).not.toContain('ORD-002');
    expect(ordersApi.list).toHaveBeenCalledTimes(1);
  });

  it('uses an honest retryable error state', async () => {
    const failure: SilentResult<Order[]> = {
      ok: false,
      error: new HttpErrorResponse({ status: 503, statusText: 'Unavailable' }),
    };
    ordersApi = { list: jest.fn() };
    ordersApi.list
      .mockReturnValueOnce(of(failure))
      .mockReturnValueOnce(of({ ok: true, data: orders } satisfies SilentResult<Order[]>));
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { user: () => null } },
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiCompositionService, useValue: { getProductTree: jest.fn() } },
        { provide: PiSupplyRequestsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiReservationsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiShipmentsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="home-error"]')).toBeTruthy();
    (fixture.nativeElement.querySelector('[data-test="home-error"] button') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(ordersApi.list).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelectorAll('[data-test="home-row"]').length).toBe(2);
  });

  it('single-expands and reuses the shared order hub tray', async () => {
    await setup();
    const rows = fixture.nativeElement.querySelectorAll('[data-test="home-row"]');
    (rows[0] as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-test="home-row-expand"]').length).toBe(1);
    expect(fixture.nativeElement.querySelector('[data-test="order-hub-edit-cta"]')?.textContent).toContain('Редактировать заказ');
    expect(fixture.nativeElement.querySelector('[data-test="order-composition-panel"]')).toBeNull();

    (fixture.nativeElement.querySelectorAll('[data-test="home-row"]')[1] as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-test="home-row-expand"]').length).toBe(1);
    expect(fixture.nativeElement.querySelector('[data-test="home-row"]')?.textContent).toContain('ORD-001');
  });

  it('renders only live workflow routes and omits dead Combine/Admin/Registries links', async () => {
    await setup();
    const chips = fixture.nativeElement.querySelectorAll('[data-test^="home-workflow-chip-"]');
    expect(chips.length).toBe(5);
    expect(fixture.nativeElement.querySelector('[data-test="home-workflow-chip-home"]')).toBeTruthy();
    expect((fixture.nativeElement.querySelector('[data-test="home-workflow-chip-quotation"]') as HTMLAnchorElement).getAttribute('href')).toBe('/studio');
    expect((fixture.nativeElement.querySelector('[data-test="home-workflow-chip-production"]') as HTMLAnchorElement).getAttribute('href')).toBe('/production');
    expect(fixture.nativeElement.querySelector('[data-test="home-workflow-chip-combine"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="home-workflow-chip-admin"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="home-workflow-chip-registries"]')).toBeNull();
  });

  it('renders the workflow chips inside the sticky group chrome, not a body-level nav (TZ-NX-HOME-CHROME-TOP)', async () => {
    await setup();
    const chromeChips = fixture.nativeElement.querySelector('[data-test="group-chips"] [data-test="home-workflow-chip-home"]');
    expect(chromeChips).toBeTruthy();
    expect(chromeChips.getAttribute('aria-current')).toBe('page');
    expect(fixture.nativeElement.querySelector('[data-test="home-workflow-chips"]')).toBeNull();
  });

  it('adds orderId only to operational chips while a row is expanded', async () => {
    await setup();
    const row = fixture.nativeElement.querySelector('[data-test="home-row"]') as HTMLElement;
    row.click();
    fixture.detectChanges();

    expect((fixture.nativeElement.querySelector('[data-test="home-workflow-chip-production"]') as HTMLAnchorElement).getAttribute('href')).toBe('/production?orderId=order-1');
    expect((fixture.nativeElement.querySelector('[data-test="home-workflow-chip-supply"]') as HTMLAnchorElement).getAttribute('href')).toBe('/supply?orderId=order-1');
    expect((fixture.nativeElement.querySelector('[data-test="home-workflow-chip-shipping"]') as HTMLAnchorElement).getAttribute('href')).toBe('/shipping?orderId=order-1');
    expect((fixture.nativeElement.querySelector('[data-test="home-workflow-chip-quotation"]') as HTMLAnchorElement).getAttribute('href')).toBe('/studio');
  });

  it('provides full registry and order-card deep links', async () => {
    await setup();
    expect((fixture.nativeElement.querySelector('[data-test="home-orders-link"]') as HTMLAnchorElement).getAttribute('href')).toBe('/orders');
    const rowLink = fixture.nativeElement.querySelector('[data-test="home-row-link"]') as HTMLAnchorElement;
    expect(rowLink.getAttribute('href')).toBe('/orders/order-1');
    expect(rowLink.getAttribute('aria-label')).toBe('Редактировать заказ');
  });
});
