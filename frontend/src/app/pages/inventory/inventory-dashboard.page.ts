import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiEmptyStateComponent } from '../../shared/ui/pi-empty-state/pi-empty-state.component';
import { StorageItemsService, StorageItem } from './storage-items.service';
import { WarehousesService, Warehouse } from './warehouses.service';

/**
 * InventoryDashboard — overview of stock levels and low-stock alerts.
 */
@Component({
  selector: 'app-inventory-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    PiEmptyStateComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="07 · склад"
      title="Склад"
      description="Управление остатками, перемещениями и резервами."
    />

    <app-pi-section title="Сводка" eyebrow="I">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="hairline rounded-sm p-4">
          <span class="eyebrow text-muted-foreground">Складов</span>
          <p class="text-2xl font-mono mt-1">{{ warehouses().length }}</p>
        </div>
        <div class="hairline rounded-sm p-4">
          <span class="eyebrow text-muted-foreground">Позиций</span>
          <p class="text-2xl font-mono mt-1">{{ totalItems() }}</p>
        </div>
        <div class="hairline rounded-sm p-4">
          <span class="eyebrow text-muted-foreground">Мало остатков</span>
          <p class="text-2xl font-mono mt-1 text-destructive">{{ lowStockCount() }}</p>
        </div>
        <div class="hairline rounded-sm p-4">
          <span class="eyebrow text-muted-foreground">Зарезервировано</span>
          <p class="text-2xl font-mono mt-1">{{ totalReserved() }}</p>
        </div>
      </div>
    </app-pi-section>

    <app-pi-section title="Мало остатков" eyebrow="II">
      @if (loading()) {
        <p class="text-sm text-muted-foreground">Загрузка...</p>
      } @else if (lowStockItems().length === 0) {
        <app-pi-empty-state [colspan]="1" message="Все позиции в норме." eyebrow="OK" />
      } @else {
        <div class="hairline rounded-sm overflow-hidden">
          <table class="w-full text-sm">
            <thead class="hairline-b">
              <tr>
                <th class="eyebrow py-3 px-4 text-left">Продукт</th>
                <th class="eyebrow py-3 px-4 text-left">Склад</th>
                <th class="eyebrow py-3 px-4 text-right">Остаток</th>
                <th class="eyebrow py-3 px-4 text-right">Минимум</th>
              </tr>
            </thead>
            <tbody>
              @for (item of lowStockItems(); track item._id) {
                <tr class="hairline-b hover:bg-paper-2 transition-colors">
                  <td class="py-3 px-4">{{ item.product?.name ?? '—' }}</td>
                  <td class="py-3 px-4 text-muted-foreground">{{ item.warehouse?.name ?? '—' }}</td>
                  <td class="py-3 px-4 text-right font-mono text-destructive">{{ item.quantity }}</td>
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
export class InventoryDashboardPage implements OnInit {
  private readonly storageService = inject(StorageItemsService);
  private readonly warehousesService = inject(WarehousesService);

  protected readonly loading = signal(true);
  protected readonly allItems = signal<StorageItem[]>([]);
  protected readonly lowStockItems = signal<StorageItem[]>([]);
  protected readonly warehouses = signal<Warehouse[]>([]);

  protected readonly totalItems = computed(() => this.allItems().length);
  protected readonly lowStockCount = computed(() => this.lowStockItems().length);
  protected readonly totalReserved = computed(() =>
    this.allItems().reduce((sum, item) => sum + (item.reservedQty ?? 0), 0),
  );

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.storageService.list().subscribe((res) => {
      if (res.ok) {
        this.allItems.set(res.data.items);
      }
      this.loading.set(false);
    });

    this.storageService.lowStock().subscribe((res) => {
      if (res.ok) {
        this.lowStockItems.set(res.data.items);
      }
    });

    this.warehousesService.list().subscribe((res) => {
      if (res.ok) {
        this.warehouses.set(res.data);
      }
    });
  }
}
