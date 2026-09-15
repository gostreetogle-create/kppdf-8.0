/**
 * TZ-NX-WAREHOUSE-PAGES-FACADE — domain facade for `WarehousesPage`.
 *
 * Owns: list/filter/expand signals and every load/create/update/delete/
 * set-default method — moved as-is from the page. No warehouse rule
 * changes.
 */
import { DestroyRef, Injectable, Injector, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import {
  PiStorageItemsService,
  PiWarehousesService,
  type StorageItem,
  type Warehouse,
  type WarehouseWritePayload,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { AlertDialogComponent, PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import { WarehouseFormDialogComponent, type WarehouseFormDialogData } from './warehouse-form-dialog.component';

/** Hub expand preview stays short — full balances live on `/storage-items`. */
const EXPAND_ITEMS_LIMIT = 8;

@Injectable()
export class WarehousesFacade {
  private readonly api = inject(PiWarehousesService);
  private readonly storageItemsApi = inject(PiStorageItemsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  readonly rows = signal<readonly Warehouse[]>([]);
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('Не удалось загрузить склады.');
  readonly search = signal('');
  readonly filteredRows = computed(() => {
    const query = this.search().trim().toLowerCase();
    return query ? this.rows().filter((row) => row.name.toLowerCase().includes(query)) : this.rows();
  });

  /** Single expand (HUB pattern) — mirrors counterparties/orders/supply. */
  readonly expandedId = signal<string | null>(null);
  readonly items = signal<readonly StorageItem[]>([]);
  readonly itemsLoading = signal(false);
  readonly itemsError = signal<string | null>(null);

  constructor() {
    this.load();
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  toggleExpand(warehouseId: string): void {
    if (this.expandedId() === warehouseId) {
      this.expandedId.set(null);
      return;
    }
    this.expandedId.set(warehouseId);
    this.loadItems(warehouseId);
  }

  onRowSpace(event: Event, warehouseId: string): void {
    event.preventDefault();
    this.toggleExpand(warehouseId);
  }

  private loadItems(warehouseId: string): void {
    this.itemsLoading.set(true);
    this.itemsError.set(null);
    this.items.set([]);
    this.storageItemsApi
      .list({ warehouseId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (this.expandedId() !== warehouseId) return; // stale guard — collapsed/switched while loading
        this.itemsLoading.set(false);
        if (!res.ok) {
          this.itemsError.set(extractErrorMessage(res.error) || 'Не удалось загрузить остатки');
          return;
        }
        this.items.set((res.data?.items ?? []).slice(0, EXPAND_ITEMS_LIMIT));
      });
  }

  load(): void {
    this.status.set('loading');
    this.expandedId.set(null);
    void firstValueFrom(this.api.list()).then((result) => {
      if (!result.ok) {
        this.error.set(extractErrorMessage(result.error));
        this.status.set('error');
        return;
      }
      this.rows.set(result.data ?? []);
      this.status.set('success');
    });
  }

  openCreate(): void {
    const ref = this.dialog.open<WarehouseWritePayload | undefined>(WarehouseFormDialogComponent, {
      data: {} satisfies WarehouseFormDialogData,
      width: 'sm',
      ariaLabel: 'Создать склад',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (payload) => {
      if (payload) void this.create(payload);
    });
  }

  openEdit(row: Warehouse): void {
    const ref = this.dialog.open<WarehouseWritePayload | undefined>(WarehouseFormDialogComponent, {
      data: { warehouse: row } satisfies WarehouseFormDialogData,
      width: 'sm',
      ariaLabel: 'Изменить склад',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (payload) => {
      if (payload) void this.update(row._id, payload);
    });
  }

  confirmDelete(row: Warehouse): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Удалить склад?',
        description: `«${row.name}» будет удалён.`,
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed) => {
      if (confirmed) void this.remove(row._id);
    });
  }

  private async create(payload: WarehouseWritePayload): Promise<void> {
    const result = await firstValueFrom(this.api.create(payload));
    if (!result.ok) {
      this.toast.error('Не удалось создать склад', { description: extractErrorMessage(result.error) });
      return;
    }
    this.toast.success('Склад создан');
    this.load();
  }

  private async update(id: string, payload: WarehouseWritePayload): Promise<void> {
    const result = await firstValueFrom(this.api.update(id, payload));
    if (!result.ok) {
      this.toast.error('Не удалось сохранить склад', { description: extractErrorMessage(result.error) });
      return;
    }
    this.toast.success('Склад сохранён');
    this.load();
  }

  private async remove(id: string): Promise<void> {
    const result = await firstValueFrom(this.api.remove(id));
    if (!result.ok) {
      this.toast.error('Не удалось удалить склад', { description: extractErrorMessage(result.error) });
      return;
    }
    this.toast.success('Склад удалён');
    this.load();
  }

  async makeDefault(row: Warehouse): Promise<void> {
    const result = await firstValueFrom(this.api.setDefault(row._id));
    if (!result.ok) {
      this.toast.error('Не удалось назначить склад по умолчанию', {
        description: extractErrorMessage(result.error),
      });
      return;
    }
    this.toast.success(`«${row.name}» — склад по умолчанию`);
    this.load();
  }
}
