import { ChangeDetectionStrategy, Component, OnInit, TemplateRef, ViewChild, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { PiEmptyStateComponent } from '../../shared/ui/pi-empty-state/pi-empty-state.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { TableComponent, ColumnDef } from '../../shared/ui/pi-table.component';
import { StorageItemsService, StorageItem } from './storage-items.service';
import { WarehousesService, Warehouse } from './warehouses.service';

/**
 * StorageItemsPage — list of all storage items with filters.
 */
@Component({
  selector: 'app-storage-items-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiEmptyStateComponent,
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
    </app-pi-section>
  `,
})
export class StorageItemsPage implements OnInit {
  private readonly storageService = inject(StorageItemsService);
  private readonly warehousesService = inject(WarehousesService);

  protected readonly loading = signal(true);
  protected readonly items = signal<StorageItem[]>([]);
  protected readonly warehouses = signal<Warehouse[]>([]);
  protected readonly selectedWarehouse = signal<string>('');

  protected readonly totalItems = computed(() => this.items().length);

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

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadItems();
  }

  onWarehouseChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedWarehouse.set(value);
    this.loadItems();
  }

  clearFilters(): void {
    this.selectedWarehouse.set('');
    this.loadItems();
  }

  private loadItems(): void {
    this.loading.set(true);
    const params: { warehouseId?: string } = {};
    if (this.selectedWarehouse()) {
      params.warehouseId = this.selectedWarehouse();
    }
    this.storageService.list(params).subscribe((res) => {
      if (res.ok) {
        this.items.set(res.data.items);
      }
      this.loading.set(false);
    });
  }

  private loadWarehouses(): void {
    this.warehousesService.list().subscribe((res) => {
      if (res.ok) {
        this.warehouses.set(res.data);
      }
    });
  }
}
