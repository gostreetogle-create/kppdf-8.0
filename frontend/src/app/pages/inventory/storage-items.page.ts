import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { ColumnDef } from '../../shared/ui/pi-table.component';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  DefaultListParams,
  ExternalParams,
  PiEntityListComponent,
} from '../../shared/dsl/entity-list/pi-entity-list.component';
import { toEntityService } from '../../shared/dsl/entity/entity-service';
import { StorageItem, StorageItemsService } from './storage-items.service';
import { Warehouse } from './warehouses.service';

/**
 * Params bag for `<pi-entity-list>` — extends `DefaultListParams` (page,
 * limit, search) with storage-items-specific filters (warehouseId,
 * productId, lowStock). The wrapper strips `DefaultListParams` keys
 * via `ExternalParams<P>` for the `[params]` input, so the page can
 * ONLY contribute the extra fields.
 */
export interface StorageItemsListParams extends DefaultListParams {
  warehouseId?: string;
  productId?: string;
  lowStock?: boolean;
}

/**
 * Полная документация страницы: docs/pages/storage-items.page.md
 *
 * TZ-232.C POC — migrated from raw `httpResource` to `<pi-entity-list>`
 * wrapper. Per TZ-232 §2.3, StorageItemsService stays hand-written
 * (custom `adjust` + `lowStock` endpoints + nested create path
 * `/products/${productId}/storage-items` are non-canonical). The
 * `toEntityService()` helper adapts it to the `EntityService<T, P>`
 * interface the wrapper expects — 1 LOC per page instead of the
 * 12-LOC inline adapter.
 *
 * Wrapper covers: debounced search, in-flight cancellation, loading
 * skeleton, error banner, empty state, create/rowEdit/rowDelete
 * outputs, reload button, initial sort passthrough. Page keeps:
 * warehouse select filter (page-level concern, NOT wrapper concern),
 * warehouses lookup (`httpResource` for the dropdown options — also
 * page-level concern).
 */
@Component({
  selector: 'app-storage-items-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    ButtonComponent,
    PiEntityListComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="07 · склад"
      title="Остатки на складе"
      description="Текущие остатки по всем складам и зонам."
    />

    <app-pi-section title="Фильтры" eyebrow="I">
      <app-pi-toolbar>
        <select
          class="pi-input"
          [value]="selectedWarehouse()"
          (change)="onWarehouseChange($event)"
          data-test="storage-warehouse-select"
        >
          <option value="">Все склады</option>
          @for (wh of warehouses(); track wh._id) {
            <option [value]="wh._id">{{ wh.name }}</option>
          }
        </select>
        <app-pi-button variant="ghost" size="sm" (click)="clearFilters()">
          Сбросить
        </app-pi-button>
      </app-pi-toolbar>
    </app-pi-section>

    <app-pi-section title="Остатки" eyebrow="II">
      <app-pi-entity-list
        #list
        [service]="listService"
        [params]="filterParams()"
        [cols]="columns"
        ariaLabel="Остатки на складе"
        [pageSize]="50"
        [showCreate]="false"
        [initialSortKey]="'product'"
        [initialSortDir]="'asc'"
        emptyMessage="Нет данных об остатках."
      />
    </app-pi-section>
  `,
})
export class StorageItemsPage {
  private readonly storageService = inject(StorageItemsService);
  private readonly baseUrl = inject(API_BASE_URL);

  protected readonly selectedWarehouse = signal<string>('');

  /**
   * 1-LOC adapter via `toEntityService` helper — wraps hand-written
   * StorageItemsService to the `EntityService<T, P>` interface
   * `<pi-entity-list>` expects. Helper handles the `{ items, total }`
   * → `PaginatedResponse<T>` mapping with synthetic page/limit
   * (non-paginated backend; see entity-service.ts docstring).
   */
  protected readonly listService = toEntityService<
    StorageItem,
    StorageItemsListParams
  >(this.storageService);

  /**
   * Warehouses for the filter dropdown — page-level concern, NOT
   * covered by `<pi-entity-list>`. Kept as `httpResource` because
   * it's a one-shot fetch (no pagination / mutation).
   */
  protected readonly warehousesRes = httpResource<Warehouse[]>(() => ({
    url: `${this.baseUrl}/warehouses`,
  }));
  protected readonly warehouses = computed<Warehouse[]>(
    () => this.warehousesRes.value() ?? [],
  );

  /**
   * Filter binding — `selectedWarehouse` signal projected into the
   * `ExternalParams<StorageItemsListParams>` shape. `Omit<P, keyof
   * DefaultListParams>` strips page/limit/search at the type level,
   * so this can ONLY contribute warehouseId/productId/lowStock.
   */
  protected readonly filterParams = computed<
    ExternalParams<StorageItemsListParams>
  >(() => (this.selectedWarehouse() ? { warehouseId: this.selectedWarehouse() } : {}));

  /** Reference to the wrapper for programmatic reload on filter change. */
  private readonly listRef = viewChild<
    PiEntityListComponent<StorageItem, StorageItemsListParams>
  >('list');

  /**
   * Re-fetch when filter params change. The wrapper's `[params]` input
   * is reactive (input signal), but the wrapper does NOT auto-react to
   * param changes (per TZ-232.C design — manual triggers only). The
   * page wires its own effect to call `wrapper.reload()` whenever
   * `filterParams()` changes.
   *
   * **Double-fetch guard:** the effect runs once on construction
   * (filterParams initial value), but `ngOnInit` already fired the
   * wrapper's initial fetch. Skip the first effect run via
   * `isFirstEffectRun` flag to avoid a redundant double-fetch on
   * initial mount.
   */
  private isFirstEffectRun = true;
  private readonly reloadOnFilterChange = effect(() => {
    this.filterParams();
    if (this.isFirstEffectRun) {
      this.isFirstEffectRun = false;
      return;
    }
    this.listRef()?.reload();
  });

  protected readonly columns: ColumnDef<StorageItem>[] = [
    {
      key: 'product',
      label: 'Продукт',
      sortable: true,
      accessor: (row) => row.product?.name ?? '—',
    },
    {
      key: 'warehouse',
      label: 'Склад',
      sortable: true,
      accessor: (row) => row.warehouse?.name ?? '—',
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

  protected onWarehouseChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedWarehouse.set(value);
  }

  protected clearFilters(): void {
    this.selectedWarehouse.set('');
  }
}