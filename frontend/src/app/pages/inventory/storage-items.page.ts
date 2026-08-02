import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PiEntityListComponent } from '../../shared/dsl/entity-list/entity-list.component';
import { ColumnDef } from '../../shared/ui/pi-table.component';
import { API_BASE_URL } from '../../core/api.tokens';
import { StorageItem, storageItemName } from './storage-items.service';
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
      @if (materialName()) {
        <span hint>Материал: {{ materialName() }}</span>
      }

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
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  // ── Material filter (TZ-MATERIALS-308) ──
  // Переход со страницы материалов: /storage-items?materialId=<id>.
  // Read-only фильтр — количество меняется только в складе.
  protected readonly materialId = signal<string>('');

  // ── Warehouse filter ──

  protected readonly selectedWarehouse = signal<string>('');

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

  // ── Materials lookup (для подписи фильтра) ──
  // Небольшой lookup по /materials для подписи фильтра (TZ-MATERIALS-308).
  protected readonly materialsRes = httpResource<MaterialsListEnvelope>(() => ({
    url: `${this.baseUrl}/materials`,
    params: { limit: '200' },
  }));

  protected readonly materialsLookup = computed<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const m of this.materialsRes.value()?.items ?? []) map[m._id] = m.name;
    return map;
  });

  constructor() {
    // TZ-MATERIALS-308: поддержка перехода со страницы материалов
    // (/storage-items?materialId=<id>). Read-only — только фильтрация.
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.materialId.set(params.get('materialId') ?? '');
    });
  }

  protected onWarehouseChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedWarehouse.set(value);
  }

  // ── Warehouses for dropdown ──

  protected readonly warehousesRes = httpResource<Warehouse[]>(() => ({
    url: `${this.baseUrl}/warehouses`,
  }));

  protected readonly warehouses = computed<Warehouse[]>(() => this.warehousesRes.value() ?? []);

  // ── Column definitions ──

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

/** Малый срез /materials для подписи фильтра по материалу (TZ-MATERIALS-308). */
interface MaterialsListEnvelope {
  items?: { _id: string; name: string }[];
}
