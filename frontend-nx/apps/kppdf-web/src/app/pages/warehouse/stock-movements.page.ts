import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  PiStockMovementsService,
  PiWarehousesService,
  stockMovementDocument,
  stockMovementTargetName,
  stockMovementWarehouseName,
  type MovementType,
  type StockMovement,
  type Warehouse,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogService } from '@kppdf/ui/dialog';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { TableComponent, type ColumnDef } from '@kppdf/ui/table';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import {
  StockMovementFormDialogComponent,
  type StockMovementDialogData,
} from './stock-movement-form-dialog.component';

const MOVEMENT_TYPES: readonly (MovementType | '')[] = [
  '',
  'in',
  'out',
  'adjust',
  'transfer',
];

@Component({
  selector: 'pi-stock-movements-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiStatusBannerComponent, TableComponent],
  template: `
    <main class="px-panel-inset py-6" data-test="stock-movements-page">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div>
          <div class="eyebrow">Склад</div>
          <h1 class="font-display text-2xl m-0">Движения</h1>
          <p class="text-sm text-muted-foreground m-0 mt-1">
            Журнал приходов, расходов и корректировок.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <app-pi-button
            variant="outline"
            size="sm"
            (click)="openIn()"
            data-test="movement-in"
          >
            + Приход
          </app-pi-button>
          <app-pi-button
            variant="default"
            size="sm"
            (click)="openOut()"
            data-test="movement-out"
          >
            + Расход
          </app-pi-button>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3 mb-4">
        <label class="sr-only" for="movement-type-filter">Фильтр по типу</label>
        <select
          id="movement-type-filter"
          class="pi-input w-56 pi-focus-ring"
          [value]="selectedType()"
          (change)="onTypeChange($event)"
          data-test="movement-type-filter"
        >
          <option value="">Все типы</option>
          <option value="in">Приход</option>
          <option value="out">Расход</option>
          <option value="adjust">Корректировка</option>
          <option value="transfer">Перемещение (просмотр)</option>
        </select>

        <label class="sr-only" for="movement-warehouse-filter"
          >Фильтр по складу</label
        >
        <select
          id="movement-warehouse-filter"
          class="pi-input w-56 pi-focus-ring"
          [value]="selectedWarehouse()"
          (change)="onWarehouseChange($event)"
          data-test="movement-warehouse-filter"
        >
          <option value="">Все склады</option>
          @for (warehouse of warehouses(); track warehouse._id) {
            <option [value]="warehouse._id">{{ warehouse.name }}</option>
          }
        </select>

        <span class="text-sm text-muted-foreground">
          {{ items().length }} записей
        </span>
      </div>

      @if (status() === 'error') {
        <app-pi-status-banner
          tone="destructive"
          [message]="error()"
          actionLabel="Повторить"
          (action)="load()"
          data-test="stock-movements-error"
        />
      }

      @if (status() !== 'error') {
        <div
          class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised"
          data-test="stock-movements-table"
        >
          <app-pi-table
            [data]="items()"
            [columns]="columns"
            [loading]="status() === 'loading'"
            [emptyMessage]="'Нет движений. Проведите приход или расход.'"
            [initialSortKey]="'date'"
            [initialSortDir]="'desc'"
            [ariaLabel]="'Движения на складе'"
          />
        </div>
      }
    </main>
  `,
})
export class StockMovementsPage {
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
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const type = params.get('type') ?? '';
        this.selectedType.set(
          MOVEMENT_TYPES.includes(type as MovementType | '')
            ? (type as MovementType | '')
            : '',
        );
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
    const ref = this.dialog.open<
      StockMovement | undefined,
      StockMovementDialogData
    >(StockMovementFormDialogComponent, {
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
