import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProductionReadFacade, extractDirectModuleIds } from './production-read.facade';
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

    // Second load hits caches (still one product/module/workTypes/workers call).
    await facade.loadBarsForOrders(orders);
    expect(productsApi.findById).toHaveBeenCalledTimes(1);
    expect(modulesApi.findById).toHaveBeenCalledTimes(1);
    expect(workTypesApi.list).toHaveBeenCalledTimes(1);
    expect(workersApi.list).toHaveBeenCalledTimes(1);
    expect(workersApi.list).toHaveBeenCalledWith({ limit: 100, isActive: true });
  });
});
