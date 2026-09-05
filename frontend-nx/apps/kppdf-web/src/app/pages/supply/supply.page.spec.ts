import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import {
  PiOrdersService,
  PiSupplyTasksService,
  type Order,
  type SupplyTask,
} from '@kppdf/data-access';
import { PiToastService } from '@kppdf/ui/toast';
import { SupplyPage } from './supply.page';

describe('SupplyPage (NX S1)', () => {
  let fixture: ComponentFixture<SupplyPage>;
  let supplyApi: {
    list: jest.Mock;
    create: jest.Mock;
    explode: jest.Mock;
    confirm: jest.Mock;
    markOrdered: jest.Mock;
    markReceived: jest.Mock;
  };
  let ordersApi: { list: jest.Mock };
  let navigateSpy: jest.SpyInstance;
  let queryParams$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const orders: Order[] = [
    { _id: 'o1', number: 'ORD-1' } as Order,
    { _id: 'o2', number: 'ORD-2' } as Order,
  ];

  const task = (overrides: Partial<SupplyTask> = {}): SupplyTask => ({
    _id: 't1',
    orderId: 'o1',
    qty: 5,
    status: 'draft',
    title: 'Профиль 40x40',
    ...overrides,
  });

  async function setup(
    query: Record<string, string> = {},
    rows: SupplyTask[] = [task()],
  ): Promise<void> {
    queryParams$ = new BehaviorSubject(convertToParamMap(query));
    supplyApi = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: rows })),
      create: jest.fn().mockReturnValue(of({ ok: true, data: task() })),
      explode: jest.fn().mockReturnValue(of({ ok: true, data: { created: [], skipped: 0 } })),
      confirm: jest.fn().mockReturnValue(of({ ok: true, data: task({ status: 'confirmed' }) })),
      markOrdered: jest.fn().mockReturnValue(of({ ok: true, data: task({ status: 'ordered' }) })),
      markReceived: jest.fn().mockReturnValue(of({ ok: true, data: task({ status: 'received' }) })),
    };
    ordersApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: orders })) };

    await TestBed.configureTestingModule({
      imports: [SupplyPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { queryParamMap: queryParams$ } },
        { provide: PiSupplyTasksService, useValue: supplyApi },
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    }).compileComponents();

    navigateSpy = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(SupplyPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    fixture?.destroy();
    TestBed.resetTestingModule();
  });

  it('applies the orderId query filter on load', async () => {
    await setup({ orderId: 'o1' });
    expect(supplyApi.list).toHaveBeenCalledWith({ orderId: 'o1', status: undefined });
    expect(
      fixture.nativeElement.querySelector('[data-test="supply-order-filter-chip"]')?.textContent,
    ).toContain('ORD-1');
  });

  it('reloads with the selected status filter', async () => {
    await setup();
    const select = fixture.nativeElement.querySelector(
      '[data-test="supply-status-filter"]',
    ) as HTMLSelectElement;
    select.value = 'confirmed';
    select.dispatchEvent(new Event('change'));

    expect(supplyApi.list).toHaveBeenLastCalledWith({ orderId: undefined, status: 'confirmed' });
  });

  it('renders the registry columns and no in-memory mock UI', async () => {
    await setup();
    const table = fixture.nativeElement.querySelector('[data-test="supply-tasks-table"]') as HTMLElement;
    expect(table.textContent).toContain('Профиль 40x40');
    expect(table.textContent).toContain('ORD-1');
    expect(table.textContent).toContain('5');
    expect(table.textContent).toContain('Черновик');
    // AC1: no quick-order mock mode ported to NX.
    expect(fixture.nativeElement.querySelector('[data-test="supply-view-quick"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="supply-view-registry"]')).toBeNull();
  });

  it('shows draft → confirm action only for draft rows', async () => {
    await setup({}, [task({ status: 'draft' })]);
    expect(fixture.nativeElement.querySelector('[data-test="supply-confirm-t1"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="supply-ordered-t1"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="supply-received-t1"]')).toBeNull();
  });

  it('confirms a task and reloads the registry', async () => {
    await setup({}, [task({ status: 'draft' })]);
    supplyApi.list.mockClear();

    (
      fixture.nativeElement.querySelector('[data-test="supply-confirm-t1"]') as HTMLButtonElement
    ).click();
    await fixture.whenStable();

    expect(supplyApi.confirm).toHaveBeenCalledWith('t1');
    expect(supplyApi.list).toHaveBeenCalledTimes(1);
  });

  it('marks ordered then received through the per-status action', async () => {
    await setup({}, [task({ status: 'ordered' })]);
    (
      fixture.nativeElement.querySelector('[data-test="supply-received-t1"]') as HTMLButtonElement
    ).click();
    await fixture.whenStable();
    expect(supplyApi.markReceived).toHaveBeenCalledWith('t1');
  });

  it('explodes tasks from an order composition', async () => {
    await setup();
    (
      fixture.nativeElement.querySelector('[data-test="supply-create-toggle"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as { explodeOrderId: string; onExplode: () => void };
    component.explodeOrderId = 'o2';
    component.onExplode();
    await fixture.whenStable();

    expect(supplyApi.explode).toHaveBeenCalledWith({ orderId: 'o2' });
  });

  it('creates a manual task', async () => {
    await setup();
    (
      fixture.nativeElement.querySelector('[data-test="supply-create-toggle"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      createOrderId: string;
      createTitle: string;
      createQty: number;
    };
    component.createOrderId = 'o1';
    component.createTitle = 'Труба 20x20';
    component.createQty = 3;
    fixture.detectChanges();

    (
      fixture.nativeElement.querySelector('[data-test="supply-create-submit"]') as HTMLButtonElement
    ).click();
    await fixture.whenStable();

    expect(supplyApi.create).toHaveBeenCalledWith({ orderId: 'o1', title: 'Труба 20x20', qty: 3 });
  });

  it('clears the orderId filter via the router', async () => {
    await setup({ orderId: 'o1' });
    (
      fixture.nativeElement.querySelector('[data-test="supply-order-filter-clear"]') as HTMLButtonElement
    ).click();

    expect(navigateSpy).toHaveBeenCalledWith([], expect.objectContaining({
      queryParams: { orderId: null },
      queryParamsHandling: 'merge',
    }));
  });
});
