import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import { WAREHOUSE_ENTITY_SECTION_CHIPS, WAREHOUSE_TOC_CHIPS } from './warehouse-group-chips';
import { PiEmptyStateComponent } from '../../shared/ui/pi-empty-state/pi-empty-state.component';
import { ColumnDef, TableComponent } from '../../shared/ui/pi-table.component';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  StorageItem,
  storageItemName,
  storageItemWarehouseName,
  type StorageItemsListResponse,
} from './storage-items.service';
import { Warehouse } from './warehouses.service';

/**
 * Полная документация страницы: docs/pages/inventory-dashboard.page.md
 */
@Component({
  selector: 'app-inventory-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiGroupWorkspaceComponent,
    PiEmptyStateComponent,
    TableComponent,
    RouterLink,
  ],
  template: `
    <app-pi-group-workspace [toc]="toc" tocActiveId="inventory" [chips]="chips">
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        <span class="text-sm text-muted-foreground">
          {{ warehouses().length }} складов · {{ totalItems() }} позиций
        </span>
      </div>

      @if (error()) {
        <div
          role="alert"
          class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          {{ error() }}
        </div>
      }

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <a
          routerLink="/warehouses"
          class="hairline rounded-sm p-4 block hover:bg-muted/40 transition-colors no-underline text-inherit"
          data-test="kpi-warehouses"
        >
          <span class="eyebrow text-muted-foreground">Складов</span>
          <p class="text-2xl font-mono mt-1">{{ warehouses().length }}</p>
        </a>
        <a
          routerLink="/storage-items"
          class="hairline rounded-sm p-4 block hover:bg-muted/40 transition-colors no-underline text-inherit"
          data-test="kpi-positions"
        >
          <span class="eyebrow text-muted-foreground">Позиций</span>
          <p class="text-2xl font-mono mt-1">{{ totalItems() }}</p>
        </a>
        <a
          routerLink="/storage-items"
          class="hairline rounded-sm p-4 block hover:bg-muted/40 transition-colors no-underline text-inherit"
          data-test="kpi-low-stock"
        >
          <span class="eyebrow text-muted-foreground">Мало остатков</span>
          <p class="text-2xl font-mono mt-1 text-destructive">{{ lowStockCount() }}</p>
        </a>
        <div class="hairline rounded-sm p-4">
          <span class="eyebrow text-muted-foreground">Зарезервировано</span>
          <p class="text-2xl font-mono mt-1">{{ totalReserved() }}</p>
        </div>
      </div>

      <h2 class="eyebrow text-muted-foreground mb-3">Мало остатков</h2>
      @if (lowStockLoading()) {
        <p class="text-sm text-muted-foreground">Загрузка...</p>
      } @else if (lowStockItems().length === 0) {
        <app-pi-empty-state [colspan]="1" message="Все позиции в норме." eyebrow="OK" />
      } @else {
        <div class="pi-table-surface overflow-x-auto">
          <app-pi-table
            [data]="lowStockItems()"
            [columns]="columns"
            [loading]="lowStockLoading()"
            [total]="lowStockItems().length"
            [localSort]="false"
            ariaLabel="Позиции с низким остатком"
            data-test="inventory-low-stock-table"
          />
        </div>
      }
    </app-pi-group-workspace>
  `,
})
export class InventoryDashboardPage {
  private readonly toast = inject(PiToastService);
  private readonly baseUrl = inject(API_BASE_URL);

  protected readonly toc = WAREHOUSE_TOC_CHIPS;
  protected readonly chips = WAREHOUSE_ENTITY_SECTION_CHIPS;

  protected readonly storageItemName = storageItemName;

  protected readonly allItemsRes = httpResource<StorageItemsListResponse>(() => ({
    url: `${this.baseUrl}/storage-items`,
  }));

  protected readonly lowStockRes = httpResource<StorageItemsListResponse>(() => ({
    url: `${this.baseUrl}/inventory/low-stock`,
  }));

  protected readonly warehousesRes = httpResource<Warehouse[]>(() => ({
    url: `${this.baseUrl}/warehouses`,
  }));

  protected readonly columns: ColumnDef<StorageItem>[] = [
    { key: '_id', label: 'Продукт/Материал', accessor: (item) => this.storageItemName(item) },
    { key: 'warehouse', label: 'Склад', accessor: (item) => storageItemWarehouseName(item) },
    {
      key: 'quantity',
      label: 'Остаток',
      numeric: true,
      align: 'right',
      cellClass: 'text-destructive',
    },
    { key: 'minQuantity', label: 'Минимум', numeric: true, align: 'right' },
  ];

  protected readonly allItems = computed<StorageItem[]>(
    () => this.allItemsRes.value()?.items ?? [],
  );
  protected readonly lowStockItems = computed<StorageItem[]>(
    () => this.lowStockRes.value()?.items ?? [],
  );
  protected readonly warehouses = computed<Warehouse[]>(() => this.warehousesRes.value() ?? []);
  protected readonly lowStockLoading = computed<boolean>(() => this.lowStockRes.isLoading());
  protected readonly totalItems = computed(() => this.allItems().length);
  protected readonly lowStockCount = computed(() => this.lowStockItems().length);
  protected readonly totalReserved = computed(() =>
    this.allItems().reduce((sum, item) => sum + (item.reservedQty ?? 0), 0),
  );
  protected readonly error = computed<string | null>(() => {
    const err =
      (this.allItemsRes.error() as import('@angular/common/http').HttpErrorResponse | undefined) ??
      (this.lowStockRes.error() as import('@angular/common/http').HttpErrorResponse | undefined) ??
      (this.warehousesRes.error() as import('@angular/common/http').HttpErrorResponse | undefined);
    return err ? extractErrorMessage(err) : null;
  });

  private readonly errorEffect = effect(() => {
    const msg = this.error();
    if (msg) {
      this.toast.error(msg);
    }
  });
}
