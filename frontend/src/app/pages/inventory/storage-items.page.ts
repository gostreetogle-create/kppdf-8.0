import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import {
  WAREHOUSE_CHIP_MAX,
  WAREHOUSE_TOC_CHIPS,
  buildWarehouseFilterChips,
} from './warehouse-group-chips';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ColumnDef, TableComponent } from '../../shared/ui/pi-table.component';
import { PiToastService } from '../../shared/ui/toast';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  StorageItem,
  storageItemName,
  storageItemWarehouseName,
  type StorageItemsListResponse,
} from './storage-items.service';
import { Warehouse } from './warehouses.service';
import { StoragePutOnStockDialogComponent } from './storage-put-on-stock-dialog.component';
import { StorageAdjustDialogComponent } from './storage-adjust-dialog.component';

/**
 * Полная документация страницы: docs/pages/storage-items.page.md
 *
 * Warehouse filter chips (≤8) or select. Put-on-stock + row adjust.
 */
@Component({
  selector: 'app-storage-items-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiGroupWorkspaceComponent, TableComponent, ButtonComponent, PiRowActionsComponent],
  template: `
    <app-pi-group-workspace
      [toc]="toc"
      tocActiveId="storage-items"
      [chips]="sectionChips()"
      [activeId]="activeChipId()"
    >
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        @if (useWarehouseSelect()) {
          <select
            class="pi-input"
            [value]="selectedWarehouse()"
            (change)="onWarehouseChange($event)"
            aria-label="Фильтр по складу"
            data-test="warehouse-select"
          >
            <option value="">Все склады</option>
            @for (wh of warehouses(); track wh._id) {
              <option [value]="wh._id">{{ wh.name }}</option>
            }
          </select>
        }
        @if (materialName()) {
          <span class="text-sm text-muted-foreground">Материал: {{ materialName() }}</span>
        }
        <span class="text-sm text-muted-foreground">{{ totalItems() }} позиций</span>
        <span class="flex-1"></span>
        <app-pi-button
          variant="default"
          size="sm"
          (click)="openPutOnStock()"
          data-test="put-on-stock"
        >
          + Поставить на склад
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
          [rowActions]="rowActionsTpl"
          [loading]="loading()"
          [emptyMessage]="'Нет остатков. Нажмите «+ Поставить на склад».'"
          ariaLabel="Остатки на складе"
          data-test="storage-items-table"
        />
      </div>

      <ng-template #rowActionsTpl let-row>
        <app-pi-row-actions
          [row]="row"
          editLabel="Корректировать"
          deleteLabel="Удалить"
          [showDelete]="false"
          [dataTestEdit]="'adjust-item-' + row._id"
          (edit)="openAdjust($event)"
        />
      </ng-template>
    </app-pi-group-workspace>
  `,
})
export class StorageItemsPage {
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly injector = inject(Injector);

  protected readonly toc = WAREHOUSE_TOC_CHIPS;

  protected readonly materialId = signal<string>('');
  protected readonly selectedWarehouse = signal<string>('');

  protected readonly warehousesRes = httpResource<Warehouse[]>(() => ({
    url: `${this.baseUrl}/warehouses`,
  }));

  protected readonly warehouses = computed<Warehouse[]>(() => this.warehousesRes.value() ?? []);

  protected readonly useWarehouseSelect = computed(
    () => this.warehouses().length > WAREHOUSE_CHIP_MAX,
  );

  protected readonly sectionChips = computed(() => {
    if (this.useWarehouseSelect()) return [];
    return buildWarehouseFilterChips(this.warehouses(), this.materialId());
  });

  protected readonly activeChipId = computed(() => this.selectedWarehouse() || 'all');

  protected readonly listParams = computed((): Record<string, string> => {
    const params: Record<string, string> = {};
    const warehouseId = this.selectedWarehouse();
    if (warehouseId) params['warehouseId'] = warehouseId;
    const materialId = this.materialId();
    if (materialId) params['materialId'] = materialId;
    return params;
  });

  protected readonly materialName = computed<string>(() => {
    const materialId = this.materialId();
    return materialId ? (this.materialsLookup()[materialId] ?? '') : '';
  });

  protected readonly listRes = httpResource<StorageItemsListResponse>(() => ({
    url: `${this.baseUrl}/storage-items`,
    params: this.listParams(),
  }));

  protected readonly items = computed<StorageItem[]>(() => this.listRes.value()?.items ?? []);
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly totalItems = computed(() => this.items().length);
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as
      import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly materialsRes = httpResource<MaterialsListEnvelope>(() => ({
    url: `${this.baseUrl}/materials`,
    params: { limit: '200' },
  }));

  protected readonly materialsLookup = computed<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const m of this.materialsRes.value()?.items ?? []) map[m._id] = m.name;
    return map;
  });

  @ViewChild('rowActionsTpl', { static: true })
  protected readonly rowActionsTpl!: TemplateRef<{ $implicit: StorageItem }>;

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.materialId.set(params.get('materialId') ?? '');
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

  protected onWarehouseChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        warehouseId: value || null,
        materialId: this.materialId() || null,
      },
    });
  }

  protected openPutOnStock(): void {
    const ref = this.dialog.open(StoragePutOnStockDialogComponent, {
      data: {
        materialId: this.materialId() || undefined,
        warehouseId: this.selectedWarehouse() || undefined,
      },
      width: 'md',
    });
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }

  protected openAdjust(item: StorageItem): void {
    const ref = this.dialog.open(StorageAdjustDialogComponent, {
      data: { item },
      width: 'md',
    });
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }

  protected readonly columns: ColumnDef<StorageItem>[] = [
    {
      key: 'product',
      label: 'Продукт/Материал',
      sortable: true,
      accessor: (row) => storageItemName(row),
    },
    {
      key: 'warehouse',
      label: 'Склад',
      sortable: true,
      accessor: (row) => storageItemWarehouseName(row),
    },
    {
      key: 'zoneName',
      label: 'Зона',
      width: '8rem',
      accessor: (row) => row.zoneName ?? '—',
    },
    {
      key: 'quantity',
      label: 'Кол-во',
      align: 'right',
      numeric: true,
      width: '6rem',
    },
    {
      key: 'reservedQty',
      label: 'Резерв',
      align: 'right',
      numeric: true,
      width: '6rem',
    },
    {
      key: 'minQuantity',
      label: 'Минимум',
      align: 'right',
      numeric: true,
      width: '6rem',
    },
  ];
}

interface MaterialsListEnvelope {
  items?: { _id: string; name: string }[];
}
