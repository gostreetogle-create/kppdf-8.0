import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { PiEntityListComponent } from '../../shared/dsl/entity-list/entity-list.component';
import { ColumnDef } from '../../shared/ui/pi-table.component';
import { API_BASE_URL } from '../../core/api.tokens';
import { StorageItem } from './storage-items.service';
import { Warehouse } from './warehouses.service';

/**
 * Полная документация страницы: docs/pages/storage-items.page.md
 *
 * Wave 3 (TZ-232.C) — мигрирована на PiEntityListComponent.
 * Warehouse filter через [filters] content projection + extraParams.
 * Страница read-only: hideCreate=true.
 */
@Component({
  selector: 'app-storage-items-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiEntityListComponent],
  template: `
    <app-pi-entity-list
      endpoint="storage-items"
      [columns]="columns"
      title="Остатки на складе"
      eyebrow="07 · склад"
      description="Текущие остатки по всем складам и зонам."
      [extraParams]="listParams()"
      [hideCreate]="true"
      [hideSearch]="true"
      emptyMessage="Нет данных об остатках."
    >
      <select
        filters
        class="pi-input"
        [value]="selectedWarehouse()"
        (change)="onWarehouseChange($event)"
        aria-label="Фильтр по складу"
      >
        <option value="">Все склады</option>
        @for (wh of warehouses(); track wh._id) {
          <option [value]="wh._id">{{ wh.name }}</option>
        }
      </select>
    </app-pi-entity-list>
  `,
})
export class StorageItemsPage {
  private readonly baseUrl = inject(API_BASE_URL);

  // ── Warehouse filter ──

  protected readonly selectedWarehouse = signal<string>('');

  protected readonly listParams = computed((): Record<string, string> => {
    const warehouseId = this.selectedWarehouse();
    return warehouseId ? { warehouseId } : {};
  });

  protected onWarehouseChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedWarehouse.set(value);
  }

  // ── Warehouses for dropdown ──

  protected readonly warehousesRes = httpResource<Warehouse[]>(() => ({
    url: `${this.baseUrl}/warehouses`,
  }));

  protected readonly warehouses = computed<Warehouse[]>(
    () => this.warehousesRes.value() ?? [],
  );

  // ── Column definitions ──

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
}
