import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiEmptyStateComponent } from '../../shared/ui/pi-empty-state/pi-empty-state.component';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { StorageItem, type StorageItemsListResponse } from './storage-items.service';
import { Warehouse } from './warehouses.service';

/**
 * Полная документация страницы: docs/pages/inventory-dashboard.page.md
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
      @if (error()) {
        <div
          role="alert"
          class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          {{ error() }}
        </div>
      }
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
      @if (lowStockLoading()) {
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
export class InventoryDashboardPage {
  private readonly toast = inject(PiToastService);
  private readonly baseUrl = inject(API_BASE_URL);

  protected readonly allItemsRes = httpResource<StorageItemsListResponse>(() => ({
    url: `${this.baseUrl}/storage-items`,
  }));

  protected readonly lowStockRes = httpResource<StorageItemsListResponse>(() => ({
    url: `${this.baseUrl}/inventory/low-stock`,
  }));

  protected readonly warehousesRes = httpResource<Warehouse[]>(() => ({
    url: `${this.baseUrl}/warehouses`,
  }));

  protected readonly allItems = computed<StorageItem[]>(() => this.allItemsRes.value()?.items ?? []);
  protected readonly lowStockItems = computed<StorageItem[]>(() => this.lowStockRes.value()?.items ?? []);
  protected readonly warehouses = computed<Warehouse[]>(() => this.warehousesRes.value() ?? []);
  protected readonly loading = computed<boolean>(() => this.allItemsRes.isLoading() || this.warehousesRes.isLoading());
  protected readonly lowStockLoading = computed<boolean>(() => this.lowStockRes.isLoading());
  protected readonly totalItems = computed(() => this.allItems().length);
  protected readonly lowStockCount = computed(() => this.lowStockItems().length);
  protected readonly totalReserved = computed(() =>
    this.allItems().reduce((sum, item) => sum + (item.reservedQty ?? 0), 0),
  );
  protected readonly error = computed<string | null>(() => {
    const err = this.allItemsRes.error() as import('@angular/common/http').HttpErrorResponse | undefined
      ?? this.lowStockRes.error() as import('@angular/common/http').HttpErrorResponse | undefined
      ?? this.warehousesRes.error() as import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  private readonly errorEffect = effect(() => {
    const err = this.allItemsRes.error() as import('@angular/common/http').HttpErrorResponse | undefined;
    if (err) {
      this.toast.error(extractErrorMessage(err));
    }
  });

  private readonly lowStockErrorEffect = effect(() => {
    const err = this.lowStockRes.error() as import('@angular/common/http').HttpErrorResponse | undefined;
    if (err) {
      this.toast.error(extractErrorMessage(err));
    }
  });

  private readonly warehousesErrorEffect = effect(() => {
    const err = this.warehousesRes.error() as import('@angular/common/http').HttpErrorResponse | undefined;
    if (err) {
      this.toast.error(extractErrorMessage(err));
    }
  });
}
