import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  ProductionReadFacade,
  PREFETCH_CONCURRENCY,
  extractDirectModuleIds,
} from './production-read.facade';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../../shared/services/products.service';
import { ProductModulesService } from '../../shared/services/pi-product-modules.service';
import { WorkTypesService } from '../../shared/services/pi-work-types.service';
import { PiWorkersService } from '../../shared/services/pi-workers.service';

describe('ProductionReadFacade', () => {
  it('extractDirectModuleIds prefers non-empty composition over legacy', () => {
    const fromComposition = extractDirectModuleIds({
      _id: 'p1',
      name: 'P',
      kind: 'good',
      unit: 'шт',
      composition: [
        {
          _id: 'l2',
          lineType: 'module',
          refId: 'm2',
          quantity: 1,
          sortOrder: 2,
        },
        {
          _id: 'l1',
          lineType: 'module',
          refId: 'm1',
          quantity: 1,
          sortOrder: 1,
        },
        {
          _id: 'lm',
          lineType: 'material',
          refId: 'mat1',
          quantity: 1,
          sortOrder: 0,
        },
      ],
      productModuleIds: ['legacy'],
    });
    expect(fromComposition.usedLegacy).toBe(false);
    expect(fromComposition.moduleIds).toEqual(['m1', 'm2']);

    const legacy = extractDirectModuleIds({
      _id: 'p2',
      name: 'P2',
      kind: 'good',
      unit: 'шт',
      composition: [],
      productModuleIds: ['m9', { _id: 'm8', name: 'X', workTypes: [], materials: [] }],
    });
    expect(legacy.usedLegacy).toBe(true);
    expect(legacy.moduleIds).toEqual(['m9', 'm8']);
  });

  it('loads orders then builds bars with cache/dedupe happy path', async () => {
    const ordersApi = {
      list: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: [
            {
              _id: 'o1',
              number: 'ORD-1',
              status: 'confirmed',
              plannedDate: '2026-08-01',
              items: [{ productId: 'p1', productName: 'Стол', quantity: 2 }],
            },
          ],
        }),
      ),
    };
    const productsApi = {
      findById: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: {
            _id: 'p1',
            name: 'Стол',
            kind: 'good',
            unit: 'шт',
            composition: [
              {
                _id: 'l1',
                lineType: 'module',
                refId: 'm1',
                quantity: 1,
                sortOrder: 0,
              },
            ],
          },
        }),
      ),
      findByIds: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: [
            {
              _id: 'p1',
              name: 'Стол',
              kind: 'good',
              unit: 'шт',
              composition: [
                {
                  _id: 'l1',
                  lineType: 'module',
                  refId: 'm1',
                  quantity: 1,
                  sortOrder: 0,
                },
              ],
            },
          ],
        }),
      ),
    };
    const modulesApi = {
      findById: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: {
            _id: 'm1',
            name: 'Каркас',
            workTypes: [{ workTypeId: 'wt1', estimatedHours: 8, sortOrder: 0 }],
            materials: [],
          },
        }),
      ),
      findByIds: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: [
            {
              _id: 'm1',
              name: 'Каркас',
              workTypes: [{ workTypeId: 'wt1', estimatedHours: 8, sortOrder: 0 }],
              materials: [],
            },
          ],
        }),
      ),
    };
    const workTypesApi = {
      list: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: {
            items: [{ _id: 'wt1', name: 'Сварка', isActive: true, days: 2 }],
            total: 1,
          },
        }),
      ),
    };
    const workersApi = {
      list: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: {
            items: [
              {
                _id: 'w1',
                lastName: 'Иванов',
                firstName: 'Иван',
                isActive: true,
                workTypeIds: ['wt1'],
              },
            ],
            total: 1,
            page: 1,
            limit: 100,
          },
        }),
      ),
    };

    TestBed.configureTestingModule({
      providers: [
        ProductionReadFacade,
        { provide: OrdersService, useValue: ordersApi },
        { provide: ProductsService, useValue: productsApi },
        { provide: ProductModulesService, useValue: modulesApi },
        { provide: WorkTypesService, useValue: workTypesApi },
        { provide: PiWorkersService, useValue: workersApi },
      ],
    });

    const facade = TestBed.inject(ProductionReadFacade);
    const orders = await facade.loadOrders();
    expect(orders).toHaveLength(1);

    const bars = await facade.loadBarsForOrders(orders);
    expect(bars).toHaveLength(1);
    expect(bars[0].days).toBe(2);
    expect(bars[0].quantityLabel).toBe('×2');
    expect(bars[0].noTerm).toBe(false);
    expect(bars[0].workerLabel).toContain('Иванов');

    // Second load hits caches (findByIds not called again for products/modules).
    await facade.loadBarsForOrders(orders);
    expect(productsApi.findByIds).toHaveBeenCalledTimes(1);
    expect(modulesApi.findByIds).toHaveBeenCalledTimes(1);
    expect(workTypesApi.list).toHaveBeenCalledTimes(1);
    expect(workersApi.list).toHaveBeenCalledTimes(1);
    expect(workersApi.list).toHaveBeenCalledWith({ limit: 100, isActive: true });
  });

  it('TZ-PRODUCTION-336: skips ineligible orders and does not persist «нет прямых модулей»', async () => {
    const ordersApi = { list: jest.fn() };
    const productsApi = {
      findById: jest.fn((id: string) =>
        of({
          ok: true,
          data:
            id === 'p-ok'
              ? {
                  _id: 'p-ok',
                  name: 'Стол',
                  kind: 'good',
                  unit: 'шт',
                  composition: [
                    { _id: 'l1', lineType: 'module', refId: 'm1', quantity: 1, sortOrder: 0 },
                  ],
                }
              : {
                  _id: 'p-empty',
                  name: 'Пустышка',
                  kind: 'good',
                  unit: 'шт',
                  composition: [],
                },
        }),
      ),
      findByIds: jest.fn((ids: string[]) =>
        of({
          ok: true,
          data: ids.map((id) =>
            id === 'p-ok'
              ? {
                  _id: 'p-ok',
                  name: 'Стол',
                  kind: 'good',
                  unit: 'шт',
                  composition: [
                    { _id: 'l1', lineType: 'module', refId: 'm1', quantity: 1, sortOrder: 0 },
                  ],
                }
              : {
                  _id: 'p-empty',
                  name: 'Пустышка',
                  kind: 'good',
                  unit: 'шт',
                  composition: [],
                },
          ),
        }),
      ),
    };
    const modulesApi = {
      findById: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: {
            _id: 'm1',
            name: 'Каркас',
            workTypes: [{ workTypeId: 'wt1', estimatedHours: 8, sortOrder: 0 }],
            materials: [],
          },
        }),
      ),
      findByIds: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: [
            {
              _id: 'm1',
              name: 'Каркас',
              workTypes: [{ workTypeId: 'wt1', estimatedHours: 8, sortOrder: 0 }],
              materials: [],
            },
          ],
        }),
      ),
    };
    const workTypesApi = {
      list: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: { items: [{ _id: 'wt1', name: 'Сварка', isActive: true, days: 2 }], total: 1 },
        }),
      ),
    };
    const workersApi = {
      list: jest
        .fn()
        .mockReturnValue(of({ ok: true, data: { items: [], total: 0, page: 1, limit: 100 } })),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ProductionReadFacade,
        { provide: OrdersService, useValue: ordersApi },
        { provide: ProductsService, useValue: productsApi },
        { provide: ProductModulesService, useValue: modulesApi },
        { provide: WorkTypesService, useValue: workTypesApi },
        { provide: PiWorkersService, useValue: workersApi },
      ],
    });

    const facade = TestBed.inject(ProductionReadFacade);
    const bars = await facade.loadBarsForOrders([
      {
        _id: 'o-ok',
        number: 'ORD-OK',
        status: 'confirmed',
        plannedDate: '2026-08-01',
        items: [{ productId: 'p-ok', productName: 'Стол', quantity: 1 }],
      } as never,
      {
        _id: 'o-skip',
        number: 'ORD-SKIP',
        status: 'confirmed',
        items: [{ productId: 'p-empty', productName: 'Пустышка', quantity: 1 }],
      } as never,
    ]);

    expect(bars.map((b) => b.orderId)).toEqual(['o-ok']);
    expect(facade.state().warnings.join(' ')).not.toContain('нет прямых модулей');
    expect(facade.state().ineligible).toEqual([
      { orderId: 'o-skip', orderNumber: 'ORD-SKIP', productNames: ['Пустышка'] },
    ]);
  });

  it('TZ-PRODUCTION-338: prefetches distinct products/modules via batch findByIds', async () => {
    const productsApi = {
      findById: jest.fn(),
      findByIds: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: [specProduct('p1', 'Стол', 'm1'), specProduct('p2', 'Шкаф', 'm2')],
        }),
      ),
    };
    const modulesApi = {
      findById: jest.fn(),
      findByIds: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: [specModule('m1', 'Каркас', 'wt1'), specModule('m2', 'Корпус', 'wt2')],
        }),
      ),
    };
    const workTypesApi = {
      list: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: {
            items: [
              { _id: 'wt1', name: 'Сварка', isActive: true, days: 2 },
              { _id: 'wt2', name: 'Сборка', isActive: true, days: 3 },
            ],
            total: 2,
          },
        }),
      ),
    };
    const workersApi = {
      list: jest
        .fn()
        .mockReturnValue(of({ ok: true, data: { items: [], total: 0, page: 1, limit: 100 } })),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ProductionReadFacade,
        { provide: OrdersService, useValue: { list: jest.fn() } },
        { provide: ProductsService, useValue: productsApi },
        { provide: ProductModulesService, useValue: modulesApi },
        { provide: WorkTypesService, useValue: workTypesApi },
        { provide: PiWorkersService, useValue: workersApi },
      ],
    });

    const facade = TestBed.inject(ProductionReadFacade);
    const orders = [
      {
        _id: 'o1',
        number: 'ORD-1',
        status: 'confirmed',
        plannedDate: '2026-08-01',
        items: [{ productId: 'p1', productName: 'Стол', quantity: 1 }],
      },
      {
        _id: 'o2',
        number: 'ORD-2',
        status: 'confirmed',
        plannedDate: '2026-08-01',
        items: [{ productId: 'p2', productName: 'Шкаф', quantity: 1 }],
      },
    ] as never;

    const bars = await facade.loadBarsForOrders(orders);
    // Batch: products and modules fetched via findByIds, not individual findById.
    expect(productsApi.findByIds).toHaveBeenCalledTimes(1);
    expect(productsApi.findByIds.mock.calls[0][0]).toEqual(['p1', 'p2']);
    expect(modulesApi.findByIds).toHaveBeenCalledTimes(1);
    expect(modulesApi.findByIds.mock.calls[0][0]).toEqual(['m1', 'm2']);
    expect(productsApi.findById).not.toHaveBeenCalled();
    expect(modulesApi.findById).not.toHaveBeenCalled();
    // Bars produced (at least o1).
    expect(bars.length).toBeGreaterThanOrEqual(1);
    expect(bars[0].id).toBe('o1:0:p1:m1:wt1:1');
    expect(facade.state().loading).toBe(false);
  });

  it('TZ-PRODUCTION-341: PREFETCH_CONCURRENCY stays in 2–3 (Nest short throttle budget)', () => {
    expect(PREFETCH_CONCURRENCY).toBeGreaterThanOrEqual(2);
    expect(PREFETCH_CONCURRENCY).toBeLessThanOrEqual(3);
  });

  it('TZ-PRODUCTION-341: retries getProduct once on 429 then succeeds; no retry on 404', async () => {
    jest.useFakeTimers();
    const productOk = {
      _id: 'p1',
      name: 'Стол',
      kind: 'good',
      unit: 'шт',
      composition: [{ _id: 'l1', lineType: 'module', refId: 'm1', quantity: 1, sortOrder: 0 }],
    };
    const productsApi = {
      findById: jest
        .fn()
        .mockReturnValueOnce(
          of({ ok: false, error: { status: 429, message: 'ThrottlerException' } }),
        )
        .mockReturnValueOnce(of({ ok: true, data: productOk }))
        .mockReturnValue(of({ ok: false, error: { status: 404, message: 'Not found' } })),
      findByIds: jest.fn((ids: string[]) => {
        const data = ids.map((id) => (id === 'p1' ? productOk : null)).filter(Boolean);
        return of(
          data.length > 0
            ? { ok: true, data }
            : { ok: false, error: { status: 404, message: 'Not found' } },
        );
      }),
    };
    const modulesApi = {
      findById: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: {
            _id: 'm1',
            name: 'Каркас',
            workTypes: [{ workTypeId: 'wt1', estimatedHours: 8, sortOrder: 0 }],
            materials: [],
          },
        }),
      ),
      findByIds: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: [
            {
              _id: 'm1',
              name: 'Каркас',
              workTypes: [{ workTypeId: 'wt1', estimatedHours: 8, sortOrder: 0 }],
              materials: [],
            },
          ],
        }),
      ),
    };
    const workTypesApi = {
      list: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: { items: [{ _id: 'wt1', name: 'Сварка', isActive: true, days: 2 }], total: 1 },
        }),
      ),
    };
    const workersApi = {
      list: jest
        .fn()
        .mockReturnValue(of({ ok: true, data: { items: [], total: 0, page: 1, limit: 100 } })),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ProductionReadFacade,
        { provide: OrdersService, useValue: { list: jest.fn() } },
        { provide: ProductsService, useValue: productsApi },
        { provide: ProductModulesService, useValue: modulesApi },
        { provide: WorkTypesService, useValue: workTypesApi },
        { provide: PiWorkersService, useValue: workersApi },
      ],
    });

    const facade = TestBed.inject(ProductionReadFacade);
    const barsPromise = facade.loadBarsForOrders([
      {
        _id: 'o1',
        number: 'ORD-1',
        status: 'confirmed',
        plannedDate: '2026-08-01',
        items: [{ productId: 'p1', productName: 'Стол', quantity: 1 }],
      } as never,
    ]);
    await jest.advanceTimersByTimeAsync(300);
    const bars = await barsPromise;
    expect(bars.map((b) => b.id)).toEqual(['o1:0:p1:m1:wt1:1']);
    expect(productsApi.findByIds).toHaveBeenCalledTimes(1);

    facade.clearCaches();
    const missingPromise = facade.loadBarsForOrders([
      {
        _id: 'o2',
        number: 'ORD-2',
        status: 'confirmed',
        plannedDate: '2026-08-01',
        items: [{ productId: 'p-missing', productName: 'Gone', quantity: 1 }],
      } as never,
    ]);
    await jest.advanceTimersByTimeAsync(5000);
    const missingBars = await missingPromise;
    expect(missingBars).toEqual([]);
    // findByIds called for 'p-missing' which returns 404 (not in mock data).
    expect(productsApi.findByIds.mock.calls.filter((c) => c[0].includes('p-missing'))).toHaveLength(
      1,
    );
    jest.useRealTimers();
  });
});

function specProduct(id: string, name: string, moduleRefId: string): unknown {
  return {
    _id: id,
    name,
    kind: 'good',
    unit: 'шт',
    composition: [
      {
        _id: `${moduleRefId}-l`,
        lineType: 'module',
        refId: moduleRefId,
        quantity: 1,
        sortOrder: 0,
      },
    ],
  };
}

function specModule(id: string, name: string, workTypeId: string): unknown {
  return {
    _id: id,
    name,
    workTypes: [{ workTypeId, estimatedHours: 8, sortOrder: 0 }],
    materials: [],
  };
}
