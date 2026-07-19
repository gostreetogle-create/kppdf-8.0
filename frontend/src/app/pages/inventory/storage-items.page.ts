import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { TableComponent, ColumnDef } from '../../shared/ui/pi-table.component';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { StorageItem, type StorageItemsListResponse } from './storage-items.service';
import { Warehouse } from './warehouses.service';

/**
 * Полная документация страницы: docs/pages/storage-items.page.md
 */
@Component({
  selector: 'app-storage-items-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    ButtonComponent,
    TableComponent,
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
        >
          <option value="">Все склады</option>
          @for (wh of warehouses(); track wh._id) {
            <option [value]="wh._id">{{ wh.name }}</option>
          }
        </select>
        <app-pi-button variant="ghost" size="sm" (click)="clearFilters()">Сбросить</app-pi-button>
      </app-pi-toolbar>
    </app-pi-section>

    <app-pi-section title="Остатки" [hint]="totalItems() + ' позиций'" eyebrow="II">
      @if (error()) {
        <div
          role="alert"
          class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          {{ error() }}
        </div>
      }
      <div class="overflow-x-auto hairline rounded-sm">
        <app-pi-table
          [data]="items()"
          [columns]="columns"
          [loading]="loading()"
          [total]="items().length"
          [pageSize]="50"
          [emptyMessage]="'Нет данных об остатках.'"
          [initialSortKey]="'product'"
          [initialSortDir]="'asc'"
          ariaLabel="Остатки на складе"
          data-test="storage-items-table"
        />
      </div>
    </app-pi-section>
  `,
})
export class StorageItemsPage {
  private readonly toast = inject(PiToastService);
  private readonly baseUrl = inject(API_BASE_URL);

  protected readonly selectedWarehouse = signal<string>('');

  private readonly listParams = computed((): Record<string, string> => {
    const warehouseId = this.selectedWarehouse();
    return warehouseId ? { warehouseId } : {};
  });

  protected readonly listRes = httpResource<StorageItemsListResponse>(() => ({
    url: `${this.baseUrl}/storage-items`,
    params: this.listParams(),
  }));

  protected readonly warehousesRes = httpResource<Warehouse[]>(() => ({
    url: `${this.baseUrl}/warehouses`,
  }));

  protected readonly items = computed<StorageItem[]>(() => this.listRes.value()?.items ?? []);
  protected readonly warehouses = computed<Warehouse[]>(() => this.warehousesRes.value() ?? []);
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly totalItems = computed(() => this.items().length);
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  private readonly errorEffect = effect(() => {
    const err = this.listRes.error() as import('@angular/common/http').HttpErrorResponse | undefined;
    if (err) {
      this.toast.error(extractErrorMessage(err));
    }
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
    { key: 'zoneName', label: 'Зона', width: '8rem', accessor: (row) => row.zoneName ?? '—' },
    { key: 'quantity', label: 'Кол-во', align: 'right', numeric: true, width: '6rem' },
    { key: 'reservedQty', label: 'Резерв', align: 'right', numeric: true, width: '6rem' },
    { key: 'minQuantity', label: 'Минимум', align: 'right', numeric: true, width: '6rem' },
  ];

  protected onWarehouseChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedWarehouse.set(value);
  }

  protected clearFilters(): void {
    this.selectedWarehouse.set('');
  }
}
