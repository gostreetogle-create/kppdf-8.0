import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
  provideRouter,
  convertToParamMap,
} from '@angular/router';
import { signal } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import {
  AuthService,
  PiMaterialsService,
  PiStorageItemsService,
  PiWarehousesService,
  type StorageItem,
  type Warehouse,
} from '@kppdf/data-access';
import type { DialogRef } from '@kppdf/ui/dialog';
import { PiDialogService } from '@kppdf/ui/dialog';
import type { SilentResult } from '@kppdf/util-http';
import { StorageItemsPage } from './storage-items.page';
import { StorageAdjustDialogComponent } from './storage-adjust-dialog.component';
import { StoragePutOnStockDialogComponent } from './storage-put-on-stock-dialog.component';

describe('StorageItemsPage (NX W2)', () => {
  let fixture: ComponentFixture<StorageItemsPage>;
  let storageApi: { list: jest.Mock };
  let warehousesApi: { list: jest.Mock };
  let materialsApi: { getById: jest.Mock };
  let dialog: { open: jest.Mock };
  let queryParams$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let navigateSpy: jest.SpyInstance;

  const warehouses: Warehouse[] = [
    { _id: 'w1', name: 'Металл', type: 'main', isActive: true },
    { _id: 'w2', name: 'Метизы', type: 'main', isActive: true },
  ];

  const item = (overrides: Partial<StorageItem> = {}): StorageItem => ({
    _id: 'si1',
    warehouseId: 'w1',
    warehouse: warehouses[0],
    materialId: { _id: 'm1', name: 'Лист стальной' },
    quantity: 10,
    reservedQty: 2,
    minQuantity: 5,
    zoneName: 'A-01',
    isActive: true,
    ...overrides,
  });

  async function setup(
    query: Record<string, string> = {},
    rows: StorageItem[] = [item()],
  ): Promise<void> {
    queryParams$ = new BehaviorSubject(convertToParamMap(query));
    storageApi = {
      list: jest
        .fn()
        .mockReturnValue(
          of({
            ok: true,
            data: { items: rows, total: rows.length },
          } satisfies SilentResult<{ items: StorageItem[]; total: number }>),
        ),
    };
    warehousesApi = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: warehouses })),
    };
    materialsApi = {
      getById: jest
        .fn()
        .mockReturnValue(
          of({
            ok: true,
            data: { _id: 'm1', name: 'Лист стальной', unit: 'кг' },
          }),
        ),
    };
    dialog = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [StorageItemsPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { queryParamMap: queryParams$ } },
        { provide: PiStorageItemsService, useValue: storageApi },
        { provide: PiWarehousesService, useValue: warehousesApi },
        { provide: PiMaterialsService, useValue: materialsApi },
        { provide: PiDialogService, useValue: dialog },
        { provide: AuthService, useValue: { user: () => null } },
      ],
    }).compileComponents();

    navigateSpy = jest
      .spyOn(TestBed.inject(Router), 'navigate')
      .mockResolvedValue(true);

    fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    fixture?.destroy();
    TestBed.resetTestingModule();
  });

  it('applies materialId and warehouseId from the route query', async () => {
    await setup({ materialId: 'm1', warehouseId: 'w2' });

    expect(storageApi.list).toHaveBeenCalledWith({
      warehouseId: 'w2',
      materialId: 'm1',
    });
    expect(materialsApi.getById).toHaveBeenCalledWith('m1');
    expect(
      fixture.nativeElement.querySelector('[data-test="material-filter-chip"]')
        ?.textContent,
    ).toContain('Лист стальной');
  });

  it('clears the material filter via the chip reset button', async () => {
    await setup({ materialId: 'm1' });

    (
      fixture.nativeElement.querySelector(
        '[data-test="material-filter-clear"]',
      ) as HTMLButtonElement
    ).click();

    expect(navigateSpy).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { materialId: null },
        queryParamsHandling: 'merge',
      }),
    );
  });

  it('renders all balance columns and populated product data', async () => {
    await setup({}, [
      item({
        materialId: undefined,
        material: undefined,
        productId: { _id: 'p1', name: 'Столешница' },
        warehouse: warehouses[1],
        warehouseId: 'w2',
      }),
    ]);

    const table = fixture.nativeElement.querySelector(
      '[data-test="storage-items-table"]',
    ) as HTMLElement;
    expect(table.textContent).toContain('Количество');
    expect(table.textContent).toContain('Резерв');
    expect(table.textContent).toContain('Минимум');
    expect(table.textContent).toContain('Зона');
    expect(table.textContent).toContain('Столешница');
    expect(table.textContent).toContain('Метизы');
    expect(table.textContent).toContain('10');
    expect(table.textContent).toContain('2');
    expect(table.textContent).toContain('5');
    expect(table.textContent).toContain('A-01');
  });

  it('filters inclusively when quantity equals minimum', async () => {
    await setup({}, [
      item({ _id: 'low', quantity: 5, minQuantity: 5 }),
      item({ _id: 'ok', quantity: 6, minQuantity: 5 }),
    ]);

    const checkbox = fixture.nativeElement.querySelector(
      '[data-test="low-stock-filter"]',
    ) as HTMLInputElement;
    checkbox.click();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelectorAll('[data-test="storage-row"]')
        .length,
    ).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('5');
  });

  it('reloads with the selected warehouse', async () => {
    await setup();
    const select = fixture.nativeElement.querySelector(
      '[data-test="warehouse-filter"]',
    ) as HTMLSelectElement;
    select.value = 'w2';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(storageApi.list).toHaveBeenLastCalledWith({
      warehouseId: 'w2',
      materialId: undefined,
    });
  });

  it('merges a negative adjustment result into the displayed quantity', async () => {
    await setup();
    const closed = signal<StorageItem | undefined>(undefined);
    const ref = {
      closed,
      close: (value?: StorageItem) => closed.set(value),
    } as unknown as DialogRef<StorageItem | undefined>;
    dialog.open.mockReturnValue(ref);

    (
      fixture.nativeElement.querySelector(
        '[data-test="adjust-item"]',
      ) as HTMLButtonElement
    ).click();
    expect(dialog.open).toHaveBeenCalledWith(
      StorageAdjustDialogComponent,
      expect.objectContaining({ data: { item: item() } }),
    );

    closed.set(item({ quantity: 8 }));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('[data-test="storage-row"]')
        ?.textContent,
    ).toContain('8');
  });

  it('opens put-on-stock with the material deep-link and warehouse options', async () => {
    await setup({ materialId: 'm1' });
    const ref = {
      closed: signal<StorageItem | undefined>(undefined),
    } as unknown as DialogRef<StorageItem | undefined>;
    dialog.open.mockReturnValue(ref);

    (
      fixture.nativeElement.querySelector(
        '[data-test="put-on-stock"]',
      ) as HTMLButtonElement
    ).click();

    expect(dialog.open).toHaveBeenCalledWith(
      StoragePutOnStockDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({ materialId: 'm1', warehouses }),
      }),
    );
  });

  it('expands a row to show unit/sku/status and collapses on second click', async () => {
    await setup({}, [
      item({
        materialId: { _id: 'm1', name: 'Лист стальной', sku: 'SKU-1', unit: 'кг' },
      }),
    ]);
    const row = fixture.nativeElement.querySelector(
      '[data-test="storage-row"]',
    ) as HTMLElement;

    row.click();
    fixture.detectChanges();
    let expand = fixture.nativeElement.querySelector(
      '[data-test="storage-row-expand"]',
    );
    expect(expand?.textContent).toContain('кг');
    expect(expand?.textContent).toContain('SKU-1');
    expect(expand?.textContent).toContain('Активна');

    row.click();
    fixture.detectChanges();
    expand = fixture.nativeElement.querySelector(
      '[data-test="storage-row-expand"]',
    );
    expect(expand).toBeNull();
  });

  it('does not toggle expand when clicking the row action', async () => {
    await setup();
    const ref = {
      closed: signal<StorageItem | undefined>(undefined),
    } as unknown as DialogRef<StorageItem | undefined>;
    dialog.open.mockReturnValue(ref);

    (
      fixture.nativeElement.querySelector(
        '[data-test="adjust-item"]',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('[data-test="storage-row-expand"]'),
    ).toBeNull();
  });
});
