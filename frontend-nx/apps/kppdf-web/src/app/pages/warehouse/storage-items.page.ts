import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  PiMaterialsService,
  PiStorageItemsService,
  PiWarehousesService,
  storageItemMaterialId,
  storageItemName,
  storageItemSku,
  storageItemUnit,
  storageItemWarehouseName,
  type StorageItem,
  type Warehouse,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiDialogService } from '@kppdf/ui/dialog';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiGroupWorkspaceComponent } from '@kppdf/features';
import { WAREHOUSE_TOC_CHIPS } from '../warehouse-group-chips';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import {
  StorageAdjustDialogComponent,
  type StorageAdjustDialogData,
} from './storage-adjust-dialog.component';
import {
  StoragePutOnStockDialogComponent,
  type StoragePutOnStockDialogData,
} from './storage-put-on-stock-dialog.component';
@Component({
  selector: 'pi-storage-items-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiStatusBannerComponent, ButtonComponent, PiGroupWorkspaceComponent],
  template: `
    <app-pi-group-workspace [toc]="toc" tocActiveId="storage-items" [chips]="[]" activeId="">
    <main class="py-6" data-test="storage-items-page">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div>
          <div class="eyebrow">Склад</div>
          <h1 class="font-display text-2xl m-0">Остатки</h1>
        </div>
        <app-pi-button
          variant="default"
          type="button"
          (click)="openPutOnStock()"
          data-test="put-on-stock"
        >
          Поставить на склад
        </app-pi-button>
      </div>

      <div class="flex flex-wrap items-center gap-3 mb-4">
        <label class="sr-only" for="warehouse-filter">Фильтр по складу</label>
        <select
          id="warehouse-filter"
          class="pi-input w-64 pi-focus-ring"
          [value]="warehouseId()"
          (change)="onWarehouseChange($event)"
          data-test="warehouse-filter"
        >
          <option value="">Все склады</option>
          @for (warehouse of warehouses(); track warehouse._id) {
            <option [value]="warehouse._id">{{ warehouse.name }}</option>
          }
        </select>

        <label
          class="inline-flex items-center gap-2 text-sm"
          for="low-stock-filter"
        >
          <input
            id="low-stock-filter"
            type="checkbox"
            [checked]="lowStock()"
            (change)="onLowStockChange($event)"
            data-test="low-stock-filter"
          />
          <span>Мало остатков</span>
        </label>

        @if (materialName()) {
          <span
            class="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-sm bg-paper-2 border hairline"
            data-test="material-filter-chip"
          >
            <span>Материал: {{ materialName() }}</span>
            <button
              type="button"
              class="pi-outline-btn"
              (click)="clearMaterialFilter()"
              data-test="material-filter-clear"
            >
              Сбросить
            </button>
          </span>
        }

        <span class="text-sm text-muted-foreground"
          >{{ rows().length }} позиций</span
        >
      </div>

      @if (status() === 'loading') {
        <div
          class="text-sm text-muted-foreground"
          data-test="storage-items-loading"
        >
          Загрузка…
        </div>
      }
      @if (status() === 'error') {
        <app-pi-status-banner
          tone="destructive"
          [message]="error()"
          actionLabel="Повторить"
          (action)="load()"
          data-test="storage-items-error"
        />
      }
      @if (status() === 'success' && rows().length === 0) {
        <div
          class="pi-dashed-panel p-8 text-center"
          data-test="storage-items-empty"
        >
          Нет остатков.
        </div>
      }
      @if (status() === 'success' && rows().length > 0) {
        <div
          class="pi-table-surface hairline rounded-sm overflow-x-auto bg-paper-raised"
          data-test="storage-items-table"
        >
          <div class="min-w-[72rem]" role="table" aria-label="Остатки">
            <div
              class="grid grid-cols-[minmax(0,1.7fr)_minmax(8rem,0.9fr)_minmax(5.5rem,0.55fr)_minmax(5.5rem,0.55fr)_minmax(5.5rem,0.55fr)_minmax(6rem,0.6fr)_minmax(10rem,0.8fr)] gap-4 px-4 py-2 text-xs text-muted-foreground hairline-bottom"
              role="row"
            >
              <span role="columnheader">Продукт / Материал</span>
              <span role="columnheader">Склад</span>
              <span role="columnheader" class="text-right">Количество</span>
              <span role="columnheader" class="text-right">Резерв</span>
              <span role="columnheader" class="text-right">Минимум</span>
              <span role="columnheader">Зона</span>
              <span role="columnheader" aria-label="Действия"></span>
            </div>
            @for (row of rows(); track row._id) {
              <div
                class="grid grid-cols-[minmax(0,1.7fr)_minmax(8rem,0.9fr)_minmax(5.5rem,0.55fr)_minmax(5.5rem,0.55fr)_minmax(5.5rem,0.55fr)_minmax(6rem,0.6fr)_minmax(10rem,0.8fr)] gap-4 items-center px-4 py-3 hairline-bottom last:border-b-0 cursor-pointer pi-focus-ring"
                role="row"
                data-test="storage-row"
                tabindex="0"
                [attr.aria-expanded]="expandedId() === row._id"
                (click)="toggleExpand(row._id)"
                (keydown.enter)="toggleExpand(row._id)"
                (keydown.space)="onRowSpace($event, row._id)"
              >
                <div role="cell" class="min-w-0">
                  <div class="font-medium truncate">{{ itemName(row) }}</div>
                  @if (itemMaterialId(row)) {
                    <div class="text-xs text-muted-foreground truncate">
                      Материал
                    </div>
                  } @else if (row.productId) {
                    <div class="text-xs text-muted-foreground truncate">
                      Продукт
                    </div>
                  }
                </div>
                <div class="text-sm truncate" role="cell">
                  {{ warehouseName(row) }}
                </div>
                <div
                  class="text-sm text-right tabular-nums"
                  [class.text-destructive]="row.quantity <= row.minQuantity"
                  role="cell"
                >
                  {{ row.quantity }}
                </div>
                <div class="text-sm text-right tabular-nums" role="cell">
                  {{ row.reservedQty }}
                </div>
                <div class="text-sm text-right tabular-nums" role="cell">
                  {{ row.minQuantity }}
                </div>
                <div class="text-sm truncate" role="cell">
                  {{ row.zoneName || '—' }}
                </div>
                <div
                  class="flex items-center gap-2 justify-end"
                  role="cell"
                  (click)="$event.stopPropagation()"
                >
                  <app-pi-button
                    variant="secondary"
                    type="button"
                    (click)="openAdjust(row)"
                    data-test="adjust-item"
                  >
                    Корректировать
                  </app-pi-button>
                </div>
              </div>
              @if (expandedId() === row._id) {
                <div
                  class="px-4 py-4 hairline-bottom last:border-b-0 bg-paper-2"
                  data-test="storage-row-expand"
                >
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <div class="pi-label text-muted-foreground">Единица</div>
                      <div class="text-sm">{{ itemUnit(row) }}</div>
                    </div>
                    <div>
                      <div class="pi-label text-muted-foreground">Артикул</div>
                      <div class="text-sm">{{ itemSku(row) }}</div>
                    </div>
                    <div>
                      <div class="pi-label text-muted-foreground">Статус</div>
                      <div class="text-sm">
                        {{ row.isActive ? 'Активна' : 'Неактивна' }}
                      </div>
                    </div>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      }
    </main>
    </app-pi-group-workspace>
  `,
})
export class StorageItemsPage {
  protected readonly toc = WAREHOUSE_TOC_CHIPS;

  private readonly storageApi = inject(PiStorageItemsService);
  private readonly warehousesApi = inject(PiWarehousesService);
  private readonly materialsApi = inject(PiMaterialsService);
  private readonly dialog = inject(PiDialogService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly warehouseId = signal('');
  readonly lowStock = signal(false);
  readonly materialId = signal('');
  readonly materialName = signal('');
  readonly expandedId = signal<string | null>(null);

  readonly warehouses = signal<readonly Warehouse[]>([]);
  private readonly allRows = signal<readonly StorageItem[]>([]);
  readonly rows = computed(() => {
    const items = this.allRows();
    return this.lowStock()
      ? items.filter((item) => item.quantity <= item.minQuantity)
      : items;
  });
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('');

  private loadVersion = 0;
  private materialLoadVersion = 0;

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const materialId = params.get('materialId') ?? '';
        this.materialId.set(materialId);
        this.warehouseId.set(params.get('warehouseId') ?? '');
        void this.loadMaterialName(materialId);
        void this.load();
      });
    void this.loadWarehouses();
  }

  onWarehouseChange(event: Event): void {
    this.warehouseId.set((event.target as HTMLSelectElement).value);
    void this.load();
  }

  onLowStockChange(event: Event): void {
    this.lowStock.set((event.target as HTMLInputElement).checked);
  }

  clearMaterialFilter(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { materialId: null },
      queryParamsHandling: 'merge',
    });
  }

  toggleExpand(id: string): void {
    this.expandedId.update((current) => (current === id ? null : id));
  }

  onRowSpace(event: Event, id: string): void {
    event.preventDefault();
    this.toggleExpand(id);
  }

  itemName(item: StorageItem): string {
    return storageItemName(item);
  }

  warehouseName(item: StorageItem): string {
    return storageItemWarehouseName(item);
  }

  itemMaterialId(item: StorageItem): string | null {
    return storageItemMaterialId(item);
  }

  itemUnit(item: StorageItem): string {
    return storageItemUnit(item);
  }

  itemSku(item: StorageItem): string {
    return storageItemSku(item);
  }

  openPutOnStock(): void {
    const ref = this.dialog.open<
      StorageItem | undefined,
      StoragePutOnStockDialogData
    >(StoragePutOnStockDialogComponent, {
      data: {
        warehouses: this.warehouses(),
        materialId: this.materialId() || undefined,
        materialName: this.materialName() || undefined,
      },
      width: 'sm',
      ariaLabel: 'Поставить на склад',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (created) => {
      if (created) void this.load();
    });
  }

  openAdjust(row: StorageItem): void {
    const ref = this.dialog.open<
      StorageItem | undefined,
      StorageAdjustDialogData
    >(StorageAdjustDialogComponent, {
      data: { item: row },
      width: 'sm',
      ariaLabel: 'Корректировка остатка',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (updated) => {
      if (updated) this.applyUpdatedItem(updated);
    });
  }

  async load(): Promise<void> {
    const version = ++this.loadVersion;
    this.status.set('loading');
    this.error.set('');
    this.expandedId.set(null);
    const result = await firstValueFrom(
      this.storageApi.list({
        warehouseId: this.warehouseId() || undefined,
        materialId: this.materialId() || undefined,
      }),
    );
    if (version !== this.loadVersion) return;
    if (!result.ok) {
      this.error.set(extractErrorMessage(result.error));
      this.status.set('error');
      return;
    }
    this.allRows.set(result.data.items);
    this.status.set('success');
  }

  private applyUpdatedItem(updated: StorageItem): void {
    this.allRows.update((items) =>
      items.map((item) =>
        item._id === updated._id
          ? {
              ...item,
              ...updated,
              material: updated.material ?? item.material,
              product: updated.product ?? item.product,
              warehouse: updated.warehouse ?? item.warehouse,
            }
          : item,
      ),
    );
  }

  private async loadWarehouses(): Promise<void> {
    const result = await firstValueFrom(this.warehousesApi.list());
    if (!result?.ok) return;
    this.warehouses.set(result.data ?? []);
  }

  private async loadMaterialName(id: string): Promise<void> {
    const version = ++this.materialLoadVersion;
    this.materialName.set('');
    if (!id) return;
    const result = await firstValueFrom(this.materialsApi.getById(id));
    if (version !== this.materialLoadVersion) return;
    if (result.ok) this.materialName.set(result.data.name);
  }
}
