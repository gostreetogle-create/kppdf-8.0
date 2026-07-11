import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { PiEmptyStateComponent } from '../../shared/ui/pi-empty-state/pi-empty-state.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { StorageItemsService, StorageItem } from './storage-items.service';
import { WarehousesService, Warehouse } from './warehouses.service';

/**
 * StorageItemsPage — list of all storage items with filters.
 */
@Component({
  selector: 'app-storage-items-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiEmptyStateComponent,
    ButtonComponent,
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
      @if (loading()) {
        <p class="text-sm text-muted-foreground">Загрузка...</p>
      } @else if (items().length === 0) {
        <app-pi-empty-state [colspan]="1" message="Нет данных об остатках." eyebrow="00" />
      } @else {
        <div class="hairline rounded-sm overflow-hidden">
          <table class="w-full text-sm">
            <thead class="hairline-b">
              <tr>
                <th class="eyebrow py-3 px-4 text-left">Продукт</th>
                <th class="eyebrow py-3 px-4 text-left">Склад</th>
                <th class="eyebrow py-3 px-4 text-left">Зона</th>
                <th class="eyebrow py-3 px-4 text-right">Кол-во</th>
                <th class="eyebrow py-3 px-4 text-right">Резерв</th>
                <th class="eyebrow py-3 px-4 text-right">Минимум</th>
              </tr>
            </thead>
            <tbody>
              @for (item of items(); track item._id) {
                <tr class="hairline-b hover:bg-paper-2 transition-colors">
                  <td class="py-3 px-4">
                    <span class="font-medium">{{ item.product?.name ?? '—' }}</span>
                    @if (item.product?.sku; as sku) {
                      <span class="ml-2 text-muted-foreground font-mono text-xs">{{ sku }}</span>
                    }
                  </td>
                  <td class="py-3 px-4 text-muted-foreground">{{ item.warehouse?.name ?? '—' }}</td>
                  <td class="py-3 px-4 text-muted-foreground">{{ item.zoneName ?? '—' }}</td>
                  <td class="py-3 px-4 text-right font-mono" [class.text-destructive]="item.quantity < item.minQuantity">
                    {{ item.quantity }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono">{{ item.reservedQty }}</td>
                  <td class="py-3 px-4 text-right font-mono">{{ item.minQuantity }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
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

  ngOnInit(): void {
    this.loadData();
    this.loadWarehouses();
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

  private loadData(): void {
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
