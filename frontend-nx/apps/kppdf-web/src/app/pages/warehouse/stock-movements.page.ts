import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { StockMovement } from '@kppdf/data-access';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { TableComponent } from '@kppdf/ui/table';
import { PiGroupWorkspaceComponent } from '@kppdf/features';
import { WAREHOUSE_TOC_CHIPS } from '../warehouse-group-chips';
import { StockMovementsFacade } from '@kppdf/features/warehouse';

/**
 * TZ-NX-WAREHOUSE-PAGES-FACADE — filter/route-sync signals, the table
 * column defs, and every load/in/out method moved to
 * `StockMovementsFacade`; this page stays a thin host.
 */
@Component({
  selector: 'pi-stock-movements-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StockMovementsFacade],
  imports: [ButtonComponent, PiStatusBannerComponent, TableComponent, PiGroupWorkspaceComponent],
  template: `
    <app-pi-group-workspace [toc]="toc" tocActiveId="stock-movements" [chips]="[]" activeId="">
    <main class="py-6" data-test="stock-movements-page">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div>
          <div class="eyebrow">Склад</div>
          <h1 class="font-display text-2xl m-0">Движения</h1>
          <p class="text-sm text-muted-foreground m-0 mt-1">
            Журнал приходов, расходов и корректировок.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <app-pi-button
            variant="outline"
            size="sm"
            (click)="openIn()"
            data-test="movement-in"
          >
            + Приход
          </app-pi-button>
          <app-pi-button
            variant="default"
            size="sm"
            (click)="openOut()"
            data-test="movement-out"
          >
            + Расход
          </app-pi-button>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3 mb-4">
        <label class="sr-only" for="movement-type-filter">Фильтр по типу</label>
        <select
          id="movement-type-filter"
          class="pi-input w-56 pi-focus-ring"
          [value]="selectedType()"
          (change)="onTypeChange($event)"
          data-test="movement-type-filter"
        >
          <option value="">Все типы</option>
          <option value="in">Приход</option>
          <option value="out">Расход</option>
          <option value="adjust">Корректировка</option>
          <option value="transfer">Перемещение (просмотр)</option>
        </select>

        <label class="sr-only" for="movement-warehouse-filter"
          >Фильтр по складу</label
        >
        <select
          id="movement-warehouse-filter"
          class="pi-input w-56 pi-focus-ring"
          [value]="selectedWarehouse()"
          (change)="onWarehouseChange($event)"
          data-test="movement-warehouse-filter"
        >
          <option value="">Все склады</option>
          @for (warehouse of warehouses(); track warehouse._id) {
            <option [value]="warehouse._id">{{ warehouse.name }}</option>
          }
        </select>

        <span class="text-sm text-muted-foreground">
          {{ items().length }} записей
        </span>
      </div>

      @if (status() === 'error') {
        <app-pi-status-banner
          tone="destructive"
          [message]="error()"
          actionLabel="Повторить"
          (action)="load()"
          data-test="stock-movements-error"
        />
      }

      @if (status() !== 'error') {
        <div
          class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised"
          data-test="stock-movements-table"
        >
          <app-pi-table
            [data]="items()"
            [columns]="columns"
            [loading]="status() === 'loading'"
            [emptyMessage]="'Нет движений. Проведите приход или расход.'"
            [initialSortKey]="'date'"
            [initialSortDir]="'desc'"
            [ariaLabel]="'Движения на складе'"
            [expandedRow]="detailTpl"
            [expandedRowWhen]="isRowExpanded"
            (rowClick)="toggleRow($event)"
          />
        </div>
      }

      <ng-template #detailTpl let-row>
        <div
          class="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3"
          data-test="movement-row-expand"
        >
          <div>
            <div class="pi-label text-muted-foreground">Зона</div>
            <div class="text-sm">{{ row.zoneName || '—' }}</div>
          </div>
          <div>
            <div class="pi-label text-muted-foreground">Единица</div>
            <div class="text-sm">{{ itemUnit(row) }}</div>
          </div>
          <div>
            <div class="pi-label text-muted-foreground">Артикул</div>
            <div class="text-sm">{{ itemSku(row) }}</div>
          </div>
          @if (toWarehouseName(row)) {
            <div>
              <div class="pi-label text-muted-foreground">Склад назначения</div>
              <div class="text-sm">{{ toWarehouseName(row) }}</div>
            </div>
            <div>
              <div class="pi-label text-muted-foreground">Зона назначения</div>
              <div class="text-sm">{{ row.toZoneName || '—' }}</div>
            </div>
          }
          <div>
            <div class="pi-label text-muted-foreground">ID заказа</div>
            <div class="text-sm">{{ row.orderId || '—' }}</div>
          </div>
        </div>
      </ng-template>
    </main>
    </app-pi-group-workspace>
  `,
})
export class StockMovementsPage {
  protected readonly toc = WAREHOUSE_TOC_CHIPS;
  protected readonly facade = inject(StockMovementsFacade);

  protected readonly selectedType = this.facade.selectedType;
  protected readonly selectedWarehouse = this.facade.selectedWarehouse;
  protected readonly warehouses = this.facade.warehouses;
  protected readonly items = this.facade.items;
  protected readonly status = this.facade.status;
  protected readonly error = this.facade.error;
  protected readonly columns = this.facade.columns;
  protected readonly isRowExpanded = this.facade.isRowExpanded;

  onTypeChange(event: Event): void {
    this.facade.onTypeChange(event);
  }

  onWarehouseChange(event: Event): void {
    this.facade.onWarehouseChange(event);
  }

  load(): void {
    this.facade.load();
  }

  openIn(): void {
    this.facade.openIn();
  }

  openOut(): void {
    this.facade.openOut();
  }

  toggleRow(row: StockMovement): void {
    this.facade.toggleRow(row);
  }

  itemUnit(row: StockMovement): string {
    return this.facade.itemUnit(row);
  }

  itemSku(row: StockMovement): string {
    return this.facade.itemSku(row);
  }

  toWarehouseName(row: StockMovement): string | null {
    return this.facade.toWarehouseName(row);
  }
}
