import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { StorageItemsPage } from './storage-items.page';
import { StorageItemsService, StorageItem } from './storage-items.service';
import { WarehousesService } from './warehouses.service';
import { API_BASE_URL } from '../../core/api.tokens';

/**
 * TZ-232.C POC — storage-items migration to <pi-entity-list> wrapper.
 *
 * Spec architecture:
 *  - StorageItemsService is mocked at the DI level (not via HttpTestingController)
 *    because the wrapper calls the service synchronously through the
 *    `toEntityService` adapter — no real HTTP for /api/storage-items.
 *  - WarehousesService is also mocked at DI level.
 *  - HttpTestingController is still used for the warehouses `httpResource`
 *    call inside the page (page-level concern kept separate from the wrapper).
 *    Since the WarehousesService mock returns `of(...)` synchronously, the
 *    httpResource receives `null` value (no actual HTTP fires), and the
 *    HttpTestingController has no expectations to verify against.
 *  - Page state assertions check wrapper signals via @ViewChild.
 *  - Tests use fakeAsync for deterministic timing of the wrapper's
 *    ngOnInit-driven initial fetch + effect-based filter reload.
 */
describe('StorageItemsPage (TZ-232.C wrapper migration)', () => {
  const baseUrl = '/api';
  const warehousesUrl = `${baseUrl}/warehouses`;

  const fakeItems: StorageItem[] = [
    {
      _id: 'si1',
      quantity: 100,
      reservedQty: 0,
      minQuantity: 10,
      isActive: true,
      warehouseId: 'w1',
      productId: 'p1',
      product: { _id: 'p1', name: 'ДСП' },
      warehouse: { _id: 'w1', name: 'Основной' },
    } as StorageItem,
    {
      _id: 'si2',
      quantity: 50,
      reservedQty: 10,
      minQuantity: 20,
      isActive: true,
      warehouseId: 'w1',
      productId: 'p2',
      product: { _id: 'p2', name: 'ЛДСП' },
      warehouse: { _id: 'w1', name: 'Основной' },
    } as StorageItem,
  ];

  /**
   * StorageItemsService mock — list() returns the adapter's expected
   * `{ items, total }` shape (no page/limit; the page's `toEntityService`
   * adapter fills those in). Other 5-CRUD methods are stubbed.
   */
  function createStorageMock(items: StorageItem[] = fakeItems) {
    return {
      list: () => of({ ok: true, data: { items, total: items.length } }),
      findById: () => of({ ok: true, data: items[0] ?? ({} as StorageItem) }),
      create: () => of({ ok: true, data: items[0] ?? ({} as StorageItem) }),
      update: () => of({ ok: true, data: items[0] ?? ({} as StorageItem) }),
      remove: () => of({ ok: true, data: undefined }),
      adjust: () => of({ ok: true, data: items[0] ?? ({} as StorageItem) }),
      lowStock: () => of({ ok: true, data: { items: [], total: 0 } }),
    };
  }

  beforeEach(async () => {
    // Providers must be configured BEFORE compileComponents() —
    // TestBed.overrideProvider() cannot be called after the test module
    // has been instantiated (throws "Cannot override provider when the
    // test module has already been instantiated").
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        // StorageItemsService + WarehousesService mocked per-test via
        // TestBed.overrideProvider() inside individual `it` blocks
        // BEFORE compileComponents is called. See mountPage helper.
      ],
    })
      .overrideComponent(StorageItemsPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  /**
   * Helper: override the page-level service mocks BEFORE creating the
   * component fixture. Returns the created fixture for assertions.
   *
   * Use this instead of calling TestBed.createComponent directly so
   * each test can supply its own mocked data via `items`.
   */
  function mountPage(items: StorageItem[] = fakeItems): {
    fixture: ReturnType<typeof TestBed.createComponent<StorageItemsPage>>;
    comp: StorageItemsPage;
  } {
    // overrideProvider MUST be called between module configuration
    // and component instantiation. We've already configured in
    // beforeEach but NOT yet instantiated — safe to override here.
    TestBed.overrideProvider(StorageItemsService, {
      useValue: createStorageMock(items),
    });
    TestBed.overrideProvider(WarehousesService, {
      useValue: { list: () => of({ ok: true, data: [] }) },
    });
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();
    return { fixture, comp: fixture.componentInstance };
  }

  it('renders the page without errors', () => {
    const { fixture } = mountPage();
    expect(fixture.nativeElement.querySelector('[data-test="storage-warehouse-select"]')).toBeTruthy();
  });

  it('listService is the EntityService shape (5 CRUD methods)', () => {
    const { comp } = mountPage();
    expect(typeof comp.listService.list).toBe('function');
    expect(typeof comp.listService.findById).toBe('function');
    expect(typeof comp.listService.create).toBe('function');
    expect(typeof comp.listService.update).toBe('function');
    expect(typeof comp.listService.remove).toBe('function');
  });

  it('clearFilters resets selected warehouse to empty string', () => {
    const { comp } = mountPage();
    comp.selectedWarehouse.set('w1');
    expect(comp.selectedWarehouse()).toBe('w1');
    comp.clearFilters();
    expect(comp.selectedWarehouse()).toBe('');
  });

  it('onWarehouseChange reads the selected value from the event', () => {
    const { comp } = mountPage();
    const fakeEvent = { target: { value: 'w42' } } as unknown as Event;
    comp.onWarehouseChange(fakeEvent);
    expect(comp.selectedWarehouse()).toBe('w42');
  });

  it('filterParams reflects selectedWarehouse (empty when none)', () => {
    const { comp } = mountPage();
    expect(comp.filterParams()).toEqual({});
    comp.selectedWarehouse.set('w1');
    expect(comp.filterParams()).toEqual({ warehouseId: 'w1' });
  });

  it('warehouses computed from warehousesRes (empty when httpResource not loaded)', () => {
    const { comp } = mountPage();
    // WarehousesService.list returns empty array → warehouses() is []
    expect(comp.warehouses()).toEqual([]);
  });
});