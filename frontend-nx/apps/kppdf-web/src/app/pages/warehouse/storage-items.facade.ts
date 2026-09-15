/**
 * TZ-NX-WAREHOUSE-PAGES-FACADE — domain facade for `StorageItemsPage`.
 *
 * Owns: filter/route-sync signals, the low-stock-filtered list, and every
 * load/put-on-stock/adjust method — moved as-is from the page. No warehouse
 * stock rule changes.
 */
import { DestroyRef, Injectable, Injector, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  PiMaterialsService,
  PiStorageItemsService,
  PiWarehousesService,
  type StorageItem,
  type Warehouse,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiDialogService } from '@kppdf/ui/dialog';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import { StorageAdjustDialogComponent, type StorageAdjustDialogData } from './storage-adjust-dialog.component';
import {
  StoragePutOnStockDialogComponent,
  type StoragePutOnStockDialogData,
} from './storage-put-on-stock-dialog.component';

@Injectable()
export class StorageItemsFacade {
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
    return this.lowStock() ? items.filter((item) => item.quantity <= item.minQuantity) : items;
  });
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('');

  private loadVersion = 0;
  private materialLoadVersion = 0;

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
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

  openPutOnStock(): void {
    const ref = this.dialog.open<StorageItem | undefined, StoragePutOnStockDialogData>(
      StoragePutOnStockDialogComponent,
      {
        data: {
          warehouses: this.warehouses(),
          materialId: this.materialId() || undefined,
          materialName: this.materialName() || undefined,
        },
        width: 'sm',
        ariaLabel: 'Поставить на склад',
        parentDestroyRef: this.destroyRef,
      },
    );
    onDialogCloseOnce(ref, this.injector, (created) => {
      if (created) void this.load();
    });
  }

  openAdjust(row: StorageItem): void {
    const ref = this.dialog.open<StorageItem | undefined, StorageAdjustDialogData>(StorageAdjustDialogComponent, {
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
