import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { signal } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import {
  PiStockMovementsService,
  PiWarehousesService,
  type StockMovement,
  type Warehouse,
} from '@kppdf/data-access';
import { PiDialogService, type DialogRef } from '@kppdf/ui/dialog';
import { StockMovementFormDialogComponent } from './stock-movement-form-dialog.component';
import { StockMovementsPage } from './stock-movements.page';

describe('StockMovementsPage (NX W3)', () => {
  let fixture: ComponentFixture<StockMovementsPage>;
  let movementApi: { list: jest.Mock };
  let warehousesApi: { list: jest.Mock };
  let dialog: { open: jest.Mock };
  let router: { navigate: jest.Mock };
  let queryParams$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const warehouses: Warehouse[] = [
    { _id: 'w1', name: 'Металл', type: 'main', isActive: true },
    { _id: 'w2', name: 'Метизы', type: 'main', isActive: true },
  ];
  const rows: StockMovement[] = [
    {
      _id: 'sm1',
      type: 'in',
      date: '2026-09-05T10:00:00.000Z',
      materialId: { _id: 'm1', name: 'Лист стальной', unit: 'кг' },
      warehouseId: 'w1',
      warehouse: warehouses[0],
      qty: 12,
      documentRef: 'Накладная 42',
      orderId: 'order-1',
    },
  ];

  async function setup(query: Record<string, string> = {}): Promise<void> {
    queryParams$ = new BehaviorSubject(convertToParamMap(query));
    movementApi = {
      list: jest
        .fn()
        .mockReturnValue(
          of({ ok: true, data: { items: rows, total: rows.length } }),
        ),
    };
    warehousesApi = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: warehouses })),
    };
    dialog = { open: jest.fn() };
    router = { navigate: jest.fn().mockResolvedValue(true) };

    await TestBed.configureTestingModule({
      imports: [StockMovementsPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: queryParams$ },
        },
        { provide: Router, useValue: router },
        { provide: PiStockMovementsService, useValue: movementApi },
        { provide: PiWarehousesService, useValue: warehousesApi },
        { provide: PiDialogService, useValue: dialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StockMovementsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    fixture?.destroy();
    TestBed.resetTestingModule();
  });

  it('loads query filters and renders all journal columns', async () => {
    await setup({ type: 'in', warehouseId: 'w2' });

    expect(movementApi.list).toHaveBeenCalledWith({
      type: 'in',
      warehouseId: 'w2',
    });
    const table = fixture.nativeElement.querySelector(
      '[data-test="stock-movements-table"]',
    ) as HTMLElement;
    expect(table.textContent).toContain('Дата');
    expect(table.textContent).toContain('Тип');
    expect(table.textContent).toContain('Материал / продукт');
    expect(table.textContent).toContain('Склад');
    expect(table.textContent).toContain('Количество');
    expect(table.textContent).toContain('Документ / заказ');
    expect(table.textContent).toContain('Лист стальной');
    expect(table.textContent).toContain('Металл');
    expect(table.textContent).toContain('Накладная 42');
  });

  it('navigates with type and warehouse query filters and reloads on query changes', async () => {
    await setup({ type: 'in' });

    const typeFilter = fixture.nativeElement.querySelector(
      '[data-test="movement-type-filter"]',
    ) as HTMLSelectElement;
    typeFilter.value = 'out';
    typeFilter.dispatchEvent(new Event('change'));
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { type: 'out', warehouseId: null },
    });

    queryParams$.next(convertToParamMap({ type: 'out' }));
    await fixture.whenStable();
    expect(movementApi.list).toHaveBeenLastCalledWith({
      type: 'out',
      warehouseId: undefined,
    });

    const warehouseFilter = fixture.nativeElement.querySelector(
      '[data-test="movement-warehouse-filter"]',
    ) as HTMLSelectElement;
    warehouseFilter.value = 'w2';
    warehouseFilter.dispatchEvent(new Event('change'));
    expect(router.navigate).toHaveBeenLastCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { type: 'out', warehouseId: 'w2' },
    });

    queryParams$.next(convertToParamMap({ type: 'out', warehouseId: 'w2' }));
    await fixture.whenStable();
    expect(movementApi.list).toHaveBeenLastCalledWith({
      type: 'out',
      warehouseId: 'w2',
    });
  });

  it('offers only in/out create actions and refreshes after a dialog result', async () => {
    await setup();
    const closed = signal<StockMovement | undefined>(undefined);
    const ref = {
      closed,
    } as unknown as DialogRef<StockMovement | undefined>;
    dialog.open.mockReturnValue(ref);

    (
      fixture.nativeElement.querySelector(
        '[data-test="movement-in"]',
      ) as HTMLButtonElement
    ).click();
    expect(dialog.open).toHaveBeenCalledWith(
      StockMovementFormDialogComponent,
      expect.objectContaining({ data: { mode: 'in', warehouses } }),
    );
    expect(
      fixture.nativeElement.querySelector('[data-test="movement-transfer"]'),
    ).toBeNull();

    const callsBeforeClose = movementApi.list.mock.calls.length;
    closed.set(rows[0]);
    TestBed.flushEffects();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(movementApi.list.mock.calls.length).toBe(callsBeforeClose + 1);
  });
});
