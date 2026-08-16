import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import {
  WAREHOUSE_CHIP_MAX,
  WAREHOUSE_TOC_CHIPS,
  STOCK_MOVEMENT_TYPE_CHIPS,
  buildMovementWarehouseFilterChips,
  type QueryGroupChip,
} from './warehouse-group-chips';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { TableComponent, ColumnDef } from '../../shared/ui/pi-table.component';
import { PiToastService } from '../../shared/ui/toast';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  StockMovement,
  MovementType,
  type StockMovementsListResponse,
} from './stock-movements.service';
import { StockMovementFormDialogComponent } from './stock-movement-form-dialog.component';
import { StorageAdjustPickDialogComponent } from './storage-adjust-pick-dialog.component';
import { Warehouse } from './warehouses.service';

/** Normalize BE array or envelope into list items. */
export function normalizeMovementsList(
  value: StockMovementsListResponse | StockMovement[] | null | undefined,
): StockMovement[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.items ?? [];
}

function populatedName(
  idOrDoc: string | { _id?: string; name?: string } | undefined,
  nested?: { name?: string },
): string {
  if (nested?.name) return nested.name;
  if (idOrDoc && typeof idOrDoc === 'object' && idOrDoc.name) return idOrDoc.name;
  return '—';
}

/**
 * Полная документация страницы: docs/pages/stock-movements.page.md
 *
 * Type filter on section chips (?type=). Create: +Приход / +Расход / +Корр.
 */
@Component({
  selector: 'app-stock-movements-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiGroupWorkspaceComponent, TableComponent, ButtonComponent, RouterLink],
  template: `
    <app-pi-group-workspace
      [toc]="toc"
      tocActiveId="stock-movements"
      [chips]="chips"
      [activeId]="activeChipId()"
      (chipClick)="onTypeChip($event)"
    >
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        @if (useWarehouseSelect()) {
          <select
            class="pi-input"
            [value]="selectedWarehouse()"
            (change)="onWarehouseChange($event)"
            aria-label="Фильтр по складу"
            data-test="movement-warehouse-select"
          >
            <option value="">Все склады</option>
            @for (wh of warehouses(); track wh._id) {
              <option [value]="wh._id">{{ wh.name }}</option>
            }
          </select>
        } @else {
          <nav
            class="flex items-center gap-1 flex-wrap"
            aria-label="Фильтр по складу"
            data-test="movement-warehouse-chips"
          >
            @for (chip of warehouseChips(); track chip.id) {
              <a
                [routerLink]="chip.route"
                [queryParams]="chip.queryParams"
                class="group-chip inline-flex items-center gap-1 px-2.5 py-0.5 text-xs leading-5 rounded-sm transition-colors pi-focus-ring cursor-pointer no-underline"
                [class.bg-sunrise-warm]="activeWarehouseChipId() === chip.id"
                [class.text-on-gold]="activeWarehouseChipId() === chip.id"
                [class.text-paper]="activeWarehouseChipId() === chip.id"
                [class.text-ink]="activeWarehouseChipId() !== chip.id"
                [class.hover:bg-paper-2]="activeWarehouseChipId() !== chip.id"
                [attr.aria-current]="activeWarehouseChipId() === chip.id ? 'page' : undefined"
              >
                {{ chip.label }}
              </a>
            }
          </nav>
        }
        <span class="text-sm text-muted-foreground">{{ totalItems() }} записей</span>
        <span class="flex-1"></span>
        <app-pi-button variant="outline" size="sm" (click)="openIn()" data-test="movement-in">
          + Приход
        </app-pi-button>
        <app-pi-button variant="outline" size="sm" (click)="openOut()" data-test="movement-out">
          + Расход
        </app-pi-button>
        <app-pi-button
          variant="outline"
          size="sm"
          (click)="openAdjust()"
          data-test="movement-adjust"
        >
          + Корр.
        </app-pi-button>
      </div>

      @if (error()) {
        <div
          role="alert"
          class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          {{ error() }}
        </div>
      }

      <div class="pi-table-surface overflow-x-auto">
        <app-pi-table
          [data]="items()"
          [columns]="columns"
          [loading]="loading()"
          [emptyMessage]="'Нет движений. Проведите приход или расход.'"
          [initialSortKey]="'date'"
          [initialSortDir]="'desc'"
          ariaLabel="Движения на складе"
          data-test="stock-movements-table"
        />
      </div>
    </app-pi-group-workspace>
  `,
})
export class StockMovementsPage {
  private readonly toast = inject(PiToastService);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(PiDialogService);
  private readonly injector = inject(Injector);

  protected readonly toc = WAREHOUSE_TOC_CHIPS;
  protected readonly chips = STOCK_MOVEMENT_TYPE_CHIPS;

  protected readonly selectedType = signal<string>('');
  protected readonly selectedWarehouse = signal<string>('');
  protected readonly activeChipId = computed(() => this.selectedType() || 'all');
  protected readonly activeWarehouseChipId = computed(() => this.selectedWarehouse() || 'all');

  protected readonly warehousesRes = httpResource<Warehouse[]>(() => ({
    url: `${this.baseUrl}/warehouses`,
  }));

  protected readonly warehouses = computed<Warehouse[]>(() => this.warehousesRes.value() ?? []);

  protected readonly useWarehouseSelect = computed(
    () => this.warehouses().length > WAREHOUSE_CHIP_MAX,
  );

  protected readonly warehouseChips = computed<readonly QueryGroupChip[]>(() =>
    this.useWarehouseSelect()
      ? []
      : buildMovementWarehouseFilterChips(this.warehouses(), this.selectedType()),
  );

  private readonly listParams = computed((): Record<string, string> => {
    const params: Record<string, string> = {};
    const type = this.selectedType();
    if (type) params['type'] = type;
    const warehouseId = this.selectedWarehouse();
    if (warehouseId) params['warehouseId'] = warehouseId;
    return params;
  });

  protected readonly listRes = httpResource<StockMovementsListResponse | StockMovement[]>(() => ({
    url: `${this.baseUrl}/stock-movements`,
    params: this.listParams(),
  }));

  protected readonly items = computed(() => normalizeMovementsList(this.listRes.value()));
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly totalItems = computed(() => this.items().length);
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as
      import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const type = params.get('type') ?? '';
      const allowed = new Set(['', 'in', 'out', 'adjust', 'transfer']);
      this.selectedType.set(allowed.has(type) ? type : '');
      this.selectedWarehouse.set(params.get('warehouseId') ?? '');
    });

    effect(() => {
      const err = this.listRes.error() as
        import('@angular/common/http').HttpErrorResponse | undefined;
      if (err) {
        this.toast.error(extractErrorMessage(err));
      }
    });
  }

  protected readonly columns: ColumnDef<StockMovement>[] = [
    {
      key: 'date',
      label: 'Дата',
      sortable: true,
      width: '10rem',
      accessor: (row) => row.date,
      format: (row) => this.formatDate(row.date),
    },
    {
      key: 'type',
      label: 'Тип',
      sortable: true,
      width: '7rem',
      accessor: (row) => this.typeLabel(row.type),
    },
    {
      key: 'product',
      label: 'Номенклатура',
      accessor: (row) => {
        const material = populatedName(row.materialId, row.material);
        if (material !== '—') return material;
        return populatedName(row.productId, row.product);
      },
    },
    {
      key: 'warehouse',
      label: 'Склад',
      accessor: (row) => populatedName(row.warehouseId, row.warehouse),
    },
    { key: 'qty', label: 'Кол-во', align: 'right', numeric: true, width: '6rem' },
    {
      key: 'documentRef',
      label: 'Документ',
      width: '8rem',
      accessor: (row) => row.documentRef ?? '—',
    },
  ];

  /**
   * Type chips are rendered by the shared workspace (route-only links), so
   * the click is handled here to set ?type= and preserve the warehouse filter.
   */
  protected onTypeChip(id: string): void {
    const allowed = new Set(['', 'in', 'out', 'adjust', 'transfer']);
    if (!allowed.has(id)) return;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        type: id === 'all' ? null : id,
        warehouseId: this.selectedWarehouse() || null,
      },
    });
  }

  protected onWarehouseChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        warehouseId: value || null,
        type: this.selectedType() || null,
      },
    });
  }

  protected openIn(): void {
    const ref = this.dialog.open(StockMovementFormDialogComponent, {
      data: { mode: 'in' },
      width: 'md',
    });
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }

  protected openOut(): void {
    const ref = this.dialog.open(StockMovementFormDialogComponent, {
      data: { mode: 'out' },
      width: 'md',
    });
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }

  protected openAdjust(): void {
    const ref = this.dialog.open(StorageAdjustPickDialogComponent, {
      data: null,
      width: 'md',
    });
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }

  protected typeLabel(type: MovementType): string {
    const labels: Record<MovementType, string> = {
      in: 'Приход',
      out: 'Расход',
      adjust: 'Корр.',
      transfer: 'Перемещ.',
    };
    return labels[type] ?? type;
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
