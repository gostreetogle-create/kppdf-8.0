import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import {
  AuthService,
  CapabilitiesService,
  PiModulesService,
  PiOrdersService,
  PiPeopleService,
  PiProductsService,
  PiWorkTypesService,
  type Order,
} from '@kppdf/data-access';
import { PiToastService } from '@kppdf/ui/toast';
import { ShellToolRailService } from '../../layout/shell-tool-rail.service';
import { ProductionCockpitPage } from './production-cockpit.page';
import { ProductionReadFacade } from './production-read.facade';
import { ProductionCockpitContext } from './production-cockpit.context';

/**
 * TZ-NX-GANTT-G5 — write path:
 * - child resize → PATCH orders/:id/estimate-days (order override, optimistic);
 * - bar resize NEVER PATCHes the WorkType catalog;
 * - summary drag → PATCH orders/:id plannedDate;
 * - failure → revert bars (no silent crooked bar).
 */
describe('ProductionCockpitPage write path (TZ-NX-GANTT-G5)', () => {
  let ordersApi: {
    update: jest.Mock;
    patchEstimateDays: jest.Mock;
    patchEstimateStart: jest.Mock;
  };
  let workTypesApi: { update: jest.Mock };

  const okOrder = (id: string): { ok: true; data: Order } =>
    ({
      ok: true,
      data: {
        _id: id,
        number: 'ORD-1',
        status: 'confirmed',
        date: '2026-09-01T00:00:00.000Z',
      },
    }) as never;

  async function setup(capsWrite = true): Promise<ComponentFixture<ProductionCockpitPage>> {
    ordersApi = {
      update: jest.fn(() => of(okOrder('o1'))),
      patchEstimateDays: jest.fn(() => of(okOrder('o1'))),
      patchEstimateStart: jest.fn(() => of(okOrder('o1'))),
    };
    workTypesApi = { update: jest.fn(() => of({ ok: true, data: { _id: 'wt1', days: 5 } })) };

    const user = signal<{ role?: string } | null>({ role: 'manager' });
    await TestBed.configureTestingModule({
      imports: [ProductionCockpitPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({}) },
            queryParamMap: of(convertToParamMap({})),
          },
        },
        { provide: ShellToolRailService, useValue: new ShellToolRailService() },
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiProductsService, useValue: {} },
        { provide: PiModulesService, useValue: {} },
        { provide: PiWorkTypesService, useValue: workTypesApi },
        { provide: PiPeopleService, useValue: {} },
        { provide: AuthService, useValue: { user } },
        { provide: CapabilitiesService, useValue: { hasAny: () => capsWrite } },
        {
          provide: PiToastService,
          useValue: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
        },
        { provide: ProductionReadFacade, useClass: FakeWriteFacade },
        ProductionCockpitContext,
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProductionCockpitPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  function page(fixture: ComponentFixture<ProductionCockpitPage>): ProductionCockpitPage & {
    onEstimateDaysCommit(ev: unknown): Promise<void>;
    onPlannedDateMoveCommit(ev: unknown): Promise<void>;
    onStartOffsetCommit(ev: unknown): Promise<void>;
    onCatalogDaysRequest(ev: unknown): Promise<void>;
  } {
    return fixture.componentInstance as never;
  }

  function bars(fixture: ComponentFixture<ProductionCockpitPage>): Array<{ id: string; days: number | null }> {
    return (
      fixture.componentInstance as unknown as { bars: { (): Array<{ id: string; days: number | null }> } }
    ).bars();
  }

  it('child resize → optimistic days + PATCH estimate-days (order override shape)', async () => {
    const fixture = await setup();
    await page(fixture).onEstimateDaysCommit({
      orderId: 'o1',
      orderItemIndex: 0,
      moduleId: 'm1',
      workTypeId: 'wt1',
      days: 5,
    });
    expect(ordersApi.patchEstimateDays).toHaveBeenCalledWith('o1', {
      orderItemIndex: 0,
      moduleId: 'm1',
      workTypeId: 'wt1',
      days: 5,
    });
    expect(ordersApi.update).not.toHaveBeenCalled();
    expect(workTypesApi.update).not.toHaveBeenCalled(); // no catalog PATCH from resize
    const resized = bars(fixture).find((b) => b.id === 'o1:0:m1:wt1');
    expect(resized?.days).toBe(5);
  });

  it('summary drag → PATCH orders/:id with plannedDate ISO (whole chain move)', async () => {
    const fixture = await setup();
    await page(fixture).onPlannedDateMoveCommit({ orderId: 'o1', deltaDays: -3 });
    expect(ordersApi.update).toHaveBeenCalledTimes(1);
    const [id, payload] = ordersApi.update.mock.calls[0] as [string, { plannedDate?: string }];
    expect(id).toBe('o1');
    // ISO instant of local noon on 2026-08-29 (order date 2026-09-01, −3 days).
    expect(payload.plannedDate).toMatch(/^2026-08-29T/);
    expect(ordersApi.patchEstimateDays).not.toHaveBeenCalled();
  });

  it('forward summary drag widens rangeEnd so the moved bar stays inside the grid', async () => {
    const fixture = await setup();
    const instance = fixture.componentInstance as unknown as {
      rangeEnd(): string;
      scrollRequest(): { target: string; barId?: string } | null;
    };
    const beforeEnd = instance.rangeEnd();

    await page(fixture).onPlannedDateMoveCommit({ orderId: 'o1', deltaDays: 30 });

    expect(instance.rangeEnd() > beforeEnd).toBe(true);
    expect(instance.rangeEnd() >= '2026-10-05').toBe(true);
    expect(instance.scrollRequest()?.target).toBe('bar');
    expect(instance.scrollRequest()?.barId).toBe('o1:0:m1:wt1');
    expect(ordersApi.update).toHaveBeenCalledWith('o1', {
      plannedDate: expect.stringMatching(/^2026-10-01T/),
    });
  });

  it('child body-drag → PATCH estimate-start with clamped offsetDays ≥ 0', async () => {
    const fixture = await setup();
    await page(fixture).onStartOffsetCommit({
      orderId: 'o1',
      orderItemIndex: 0,
      moduleId: 'm1',
      workTypeId: 'wt2',
      startDate: '2026-09-05',
      deltaDays: -7,
    });
    expect(ordersApi.patchEstimateStart).toHaveBeenCalledTimes(1);
    const [, payload] = ordersApi.patchEstimateStart.mock.calls[0] as [
      string,
      { offsetDays: number },
    ];
    expect(payload.offsetDays).toBeGreaterThanOrEqual(0);
  });

  it('PATCH failure → bars reverted (no silent crooked bar)', async () => {
    const fixture = await setup();
    ordersApi.patchEstimateDays.mockReturnValue(
      of({ ok: false, error: { status: 409, message: 'conflict' } }) as never,
    );
    const before = bars(fixture).map((b) => b.days);
    await page(fixture).onEstimateDaysCommit({
      orderId: 'o1',
      orderItemIndex: 0,
      moduleId: 'm1',
      workTypeId: 'wt1',
      days: 9,
    });
    expect(bars(fixture).map((b) => b.days)).toEqual(before);
  });

  it('catalog button → confirm prompt → PATCH work-types (global, confirm-gated)', async () => {
    const fixture = await setup();
    const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('4');
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    await page(fixture).onCatalogDaysRequest({ workTypeId: 'wt1', currentDays: 3 });
    expect(workTypesApi.update).toHaveBeenCalledWith('wt1', { days: 4 });
    expect(ordersApi.patchEstimateDays).not.toHaveBeenCalled();
    promptSpy.mockRestore();
    confirmSpy.mockRestore();
  });

  it('resize blocked without production:write (caps false → no API call)', async () => {
    const fixture = await setup(false);
    await page(fixture).onEstimateDaysCommit({
      orderId: 'o1',
      orderItemIndex: 0,
      moduleId: 'm1',
      workTypeId: 'wt1',
      days: 5,
    });
    expect(ordersApi.patchEstimateDays).not.toHaveBeenCalled();
  });
});

/** Same shape as the G3 page-spec facade (orders o1 + two work bars). */
class FakeWriteFacade {
  readonly state = signal({
    loading: false,
    error: null as string | null,
    warnings: [] as string[],
    orders: [
      {
        _id: 'o1',
        number: 'ORD-1',
        status: 'confirmed',
        date: '2026-09-01T00:00:00.000Z',
        items: [{ productId: 'p1', productName: 'Стол', quantity: 1 }],
      },
    ],
    bars: [
      {
        id: 'o1:0:m1:wt1',
        orderId: 'o1',
        orderNumber: 'ORD-1',
        orderStatus: 'confirmed' as const,
        orderItemIndex: 0,
        productId: 'p1',
        productName: 'Стол',
        moduleId: 'm1',
        moduleName: 'Корпус',
        workTypeId: 'wt1',
        workTypeName: 'Распил',
        days: 3,
        startDate: '2026-09-02',
        endDate: '2026-09-04',
        noTerm: false,
        kind: 'work' as const,
        quantity: 1,
        workerLabel: '—',
      },
      {
        id: 'o1:0:m1:wt2',
        orderId: 'o1',
        orderNumber: 'ORD-1',
        orderStatus: 'confirmed' as const,
        orderItemIndex: 0,
        productId: 'p1',
        productName: 'Стол',
        moduleId: 'm1',
        moduleName: 'Корпус',
        workTypeId: 'wt2',
        workTypeName: 'Кромка',
        days: 2,
        startDate: '2026-09-05',
        endDate: '2026-09-06',
        noTerm: false,
        kind: 'work' as const,
        quantity: 1,
        workerLabel: 'Иванов',
      },
    ],
    ineligible: [] as Array<{ orderId: string; orderNumber: string; productNames: string[] }>,
  });
  loadOrders(): Promise<unknown[]> {
    return Promise.resolve(this.state().orders);
  }
  loadBarsForOrders(): Promise<unknown[]> {
    return Promise.resolve(this.state().bars);
  }
  getWorkerLabelsMap(): Promise<Map<string, string>> {
    return Promise.resolve(new Map());
  }
  clearCaches(): void {
    /* noop */
  }
}
