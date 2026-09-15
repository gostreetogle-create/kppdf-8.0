/**
 * TZ-NX-WAREHOUSE-PAGES-FACADE — domain facade for `StockMovementsPage`.
 *
 * Owns: filter/route-sync signals, the table column defs, and every
 * load/in/out method — moved as-is from the page. No movement rule
 * changes.
 */
import { DestroyRef, Injectable, Injector, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  PiStockMovementsService,
  PiWarehousesService,
  stockMovementDocument,
  stockMovementSku,
  stockMovementTargetName,
  stockMovementToWarehouseName,
  stockMovementUnit,
  stockMovementWarehouseName,
  type MovementType,
  type StockMovement,
  type Warehouse,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiDialogService } from '@kppdf/ui/dialog';
import { type ColumnDef } from '@kppdf/ui/table';
import { onDialogCloseOnce } from './ui/on-dialog-close-once';
import {
  StockMovementFormDialogComponent,
  type StockMovementDialogData,
} from './ui/stock-movement-form-dialog.component';

const MOVEMENT_TYPES: readonly (MovementType | '')[] = ['', 'in', 'out', 'adjust', 'transfer'];

@Injectable()
export class StockMovementsFacade {
  private readonly movementsApi = inject(PiStockMovementsService);
  private readonly warehousesApi = inject(PiWarehousesService);
  private readonly dialog = inject(PiDialogService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly selectedType = signal<MovementType | ''>('');
  readonly selectedWarehouse = signal('');
  readonly warehouses = signal<Warehouse[]>([]);
  readonly items = signal<StockMovement[]>([]);
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('');
  private readonly expandedId = signal<string | null>(null);

  private loadVersion = 0;

  readonly columns: ColumnDef<StockMovement>[] = [
    {
      key: 'date',
      label: 'Дата',
      sortable: true,
      width: '9rem',
      accessor: (row) => row.date,
      format: (row) => this.formatDate(row.date),
    },
    {
      key: 'type',
      label: 'Тип',
      sortable: true,
      width: '9rem',
      accessor: (row) => this.typeLabel(row.type),
    },
    {
      key: 'product',
      label: 'Материал / продукт',
      accessor: (row) => stockMovementTargetName(row),
    },
    {
      key: 'warehouse',
      label: 'Склад',
      accessor: (row) => stockMovementWarehouseName(row),
    },
    {
      key: 'qty',
      label: 'Количество',
      align: 'right',
      numeric: true,
      width: '8rem',
    },
    {
      key: 'documentRef',
      label: 'Документ / заказ',
      width: '12rem',
      accessor: (row) => stockMovementDocument(row),
    },
  ];

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const type = params.get('type') ?? '';
      this.selectedType.set(MOVEMENT_TYPES.includes(type as MovementType | '') ? (type as MovementType | '') : '');
      this.selectedWarehouse.set(params.get('warehouseId') ?? '');
      void this.load();
    });
    void this.loadWarehouses();
  }

  onTypeChange(event: Event): void {
    const type = (event.target as HTMLSelectElement).value as MovementType | '';
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        type: type || null,
        warehouseId: this.selectedWarehouse() || null,
      },
    });
  }

  onWarehouseChange(event: Event): void {
    const warehouseId = (event.target as HTMLSelectElement).value;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        type: this.selectedType() || null,
        warehouseId: warehouseId || null,
      },
    });
  }

  load(): void {
    const version = ++this.loadVersion;
    this.status.set('loading');
    this.error.set('');
    this.expandedId.set(null);
    void firstValueFrom(
      this.movementsApi.list({
        type: this.selectedType() || undefined,
        warehouseId: this.selectedWarehouse() || undefined,
      }),
    ).then((result) => {
      if (version !== this.loadVersion) return;
      if (!result.ok) {
        this.error.set(extractErrorMessage(result.error));
        this.status.set('error');
        return;
      }
      this.items.set(result.data.items);
      this.status.set('success');
    });
  }

  openIn(): void {
    this.openMovement('in');
  }

  openOut(): void {
    this.openMovement('out');
  }

  readonly isRowExpanded = (row: StockMovement): boolean => row._id === this.expandedId();

  toggleRow(row: StockMovement): void {
    this.expandedId.update((id) => (id === row._id ? null : row._id));
  }

  itemUnit(row: StockMovement): string {
    return stockMovementUnit(row);
  }

  itemSku(row: StockMovement): string {
    return stockMovementSku(row);
  }

  toWarehouseName(row: StockMovement): string | null {
    return stockMovementToWarehouseName(row);
  }

  typeLabel(type: MovementType): string {
    return {
      in: 'Приход',
      out: 'Расход',
      adjust: 'Корректировка',
      transfer: 'Перемещение',
    }[type];
  }

  formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? '—'
      : date.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
  }

  private openMovement(mode: 'in' | 'out'): void {
    const ref = this.dialog.open<StockMovement | undefined, StockMovementDialogData>(StockMovementFormDialogComponent, {
      data: { mode, warehouses: this.warehouses() },
      width: 'md',
      ariaLabel: mode === 'in' ? 'Приход на склад' : 'Расход со склада',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (created) => {
      if (created) this.load();
    });
  }

  private async loadWarehouses(): Promise<void> {
    const result = await firstValueFrom(this.warehousesApi.list());
    if (result.ok) this.warehouses.set(result.data ?? []);
  }
}
