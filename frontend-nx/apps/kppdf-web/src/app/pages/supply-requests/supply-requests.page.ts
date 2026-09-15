import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { SupplyRequest, SupplyRequestStatus } from '@kppdf/data-access';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { ButtonComponent } from '@kppdf/ui/button';
import { SUPPLY_REQUEST_STATUS_LABELS } from '../registries/data/supply-request-formatters';
import { SupplyRequestsFacade } from '@kppdf/features/supply';

/**
 * TZ-NX-SUPPLY-S3-REQUEST-JOURNAL — single SoT for `SupplyRequest` (журнал заявок
 * как Google Sheets). Replaces the truncated registries generic dialog (title+qty
 * only) — see `docs/audits/2026-09-06-supply-google-sheets-to-nx-audit.md`.
 * `SupplyTask` (заказ-based deficit) stays on `/supply` — separate entity, not this page.
 *
 * TZ-NX-SUPPLY-REQUESTS-FACADE — lookups, filtered list, and CRUD/receive/
 * delete orchestration moved to `SupplyRequestsFacade`; this page stays a
 * thin host.
 */
@Component({
  selector: 'pi-supply-requests-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SupplyRequestsFacade],
  imports: [PiStatusBannerComponent, RouterLink, ButtonComponent],
  template: `
    <main class="px-panel-inset py-6" data-test="supply-requests-page">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div>
          <div class="eyebrow">Снабжение</div>
          <h1 class="font-display text-2xl m-0">Заявки</h1>
          <p class="text-sm text-muted-foreground m-0 mt-1">
            Журнал закупок: материал/наименование, поставщик, счёт, оплата, статус.
          </p>
        </div>
        <app-pi-button variant="default" type="button" (click)="openCreate()" data-test="supply-request-create">
          + Заявка
        </app-pi-button>
      </div>

      <div class="flex flex-wrap items-center gap-3 mb-4">
        <label class="sr-only" for="supply-request-search">Поиск</label>
        <input
          id="supply-request-search"
          type="search"
          class="pi-input w-56 pi-focus-ring"
          placeholder="Поиск по наименованию/артикулу…"
          [value]="search()"
          (input)="onSearch($event)"
          data-test="supply-request-search"
        />
        <label class="sr-only" for="supply-request-status-filter">Фильтр по статусу</label>
        <select
          id="supply-request-status-filter"
          class="pi-input w-48 pi-focus-ring"
          [value]="statusFilter()"
          (change)="onStatusFilterChange($event)"
          data-test="supply-request-status-filter"
        >
          <option value="">Все статусы</option>
          @for (s of statuses; track s) {
            <option [value]="s">{{ statusLabels[s] }}</option>
          }
        </select>
        <label class="inline-flex items-center gap-2 text-sm" for="supply-request-paid-filter">
          <input
            id="supply-request-paid-filter"
            type="checkbox"
            [checked]="paidOnly()"
            (change)="onPaidOnlyChange($event)"
            data-test="supply-request-paid-filter"
          />
          <span>Только оплаченные</span>
        </label>
        <label class="flex items-center gap-1 text-xs text-muted-foreground" for="supply-request-date-from">
          Нужно к: с
          <input
            id="supply-request-date-from"
            type="date"
            class="pi-input !h-8 !text-[13px] !py-0"
            [value]="dateFrom()"
            (change)="onDateFromChange($event)"
            data-test="supply-request-date-from"
          />
        </label>
        <label class="flex items-center gap-1 text-xs text-muted-foreground" for="supply-request-date-to">
          по
          <input
            id="supply-request-date-to"
            type="date"
            class="pi-input !h-8 !text-[13px] !py-0"
            [value]="dateTo()"
            (change)="onDateToChange($event)"
            data-test="supply-request-date-to"
          />
        </label>
        @if (hasActiveFilters()) {
          <button class="pi-outline-btn" type="button" (click)="resetFilters()" data-test="supply-request-reset-filters">
            Сбросить фильтры
          </button>
        }
        <span class="text-sm text-muted-foreground">{{ filteredRows().length }} заявок</span>
        <span class="flex-1"></span>
        <app-pi-button variant="secondary" type="button" (click)="load()" data-test="supply-request-refresh">
          Обновить
        </app-pi-button>
      </div>

      @if (status() === 'loading') {
        <div class="text-sm text-muted-foreground" data-test="supply-requests-loading">Загрузка…</div>
      }
      @if (status() === 'error') {
        <app-pi-status-banner
          tone="destructive"
          [message]="error()"
          actionLabel="Повторить"
          (action)="load()"
          data-test="supply-requests-error"
        />
      }
      @if (status() === 'success' && filteredRows().length === 0) {
        <div class="pi-dashed-panel p-8 text-center" data-test="supply-requests-empty">
          @if (rows().length === 0) {
            Заявок пока нет. Создайте первую — «+ Заявка».
          } @else {
            Ничего не найдено по текущим фильтрам.
            <button class="pi-outline-btn" type="button" (click)="resetFilters()" data-test="supply-request-empty-reset">
              Сбросить фильтры
            </button>
          }
        </div>
      }
      @if (status() === 'success' && filteredRows().length > 0) {
        <div class="pi-table-surface hairline rounded-sm overflow-x-auto bg-paper-raised" data-test="supply-requests-table">
          <div class="min-w-[70rem]" role="table" aria-label="Заявки снабжения">
            <div class="grid grid-cols-[minmax(0,1.6fr)_minmax(5rem,0.6fr)_minmax(9rem,0.9fr)_minmax(7rem,0.7fr)_minmax(5rem,0.5fr)_minmax(7rem,0.7fr)_minmax(7rem,0.7fr)_minmax(6rem,0.6fr)_minmax(9rem,0.8fr)] gap-3 px-4 py-2 text-xs text-muted-foreground hairline-bottom" role="row">
              <span role="columnheader">Наименование</span>
              <span role="columnheader" class="text-right">Кол-во</span>
              <span role="columnheader">Поставщик</span>
              <span role="columnheader">Статус</span>
              <span role="columnheader">Оплата</span>
              <span role="columnheader">Счёт</span>
              <span role="columnheader">Заказ</span>
              <span role="columnheader">Создал</span>
              <span role="columnheader" aria-label="Действия"></span>
            </div>
            @for (row of filteredRows(); track row._id) {
              <div
                class="grid grid-cols-[minmax(0,1.6fr)_minmax(5rem,0.6fr)_minmax(9rem,0.9fr)_minmax(7rem,0.7fr)_minmax(5rem,0.5fr)_minmax(7rem,0.7fr)_minmax(7rem,0.7fr)_minmax(6rem,0.6fr)_minmax(9rem,0.8fr)] gap-3 items-center px-4 py-3 hairline-bottom last:border-b-0 cursor-pointer pi-focus-ring"
                role="row"
                data-test="supply-request-row"
                tabindex="0"
                [attr.aria-expanded]="expandedId() === row._id"
                (click)="toggleExpand(row._id)"
                (keydown.enter)="toggleExpand(row._id)"
                (keydown.space)="onRowSpace($event, row._id)"
              >
                <div role="cell" class="min-w-0 truncate">{{ row.title || row.article || 'Без названия' }}</div>
                <div role="cell" class="text-right tabular-nums">{{ row.qty }} {{ row.unit }}</div>
                <div role="cell" class="truncate">{{ supplierLabel(row.supplierId) }}</div>
                <div role="cell" data-test="supply-request-status">{{ statusLabel(row.status) }}</div>
                <div role="cell" data-test="supply-request-paid-cell">{{ row.paid ? 'Оплачено' : '—' }}</div>
                <div role="cell" class="truncate">{{ row.invoiceNo || '—' }}</div>
                <div role="cell" class="truncate" (click)="$event.stopPropagation()">
                  @if (linkedOrder(row); as order) {
                    <a class="underline underline-offset-2 hover:text-sunrise-warm" [routerLink]="['/orders', order._id]" data-test="supply-request-order-link">
                      {{ order.number }}
                    </a>
                  } @else {
                    {{ orderLabel(row) }}
                  }
                </div>
                <div role="cell" class="truncate" [attr.title]="row.createdBy">{{ createdByLabel(row.createdBy) }}</div>
                <div class="flex items-center gap-2 justify-end" role="cell" (click)="$event.stopPropagation()">
                  @if (isReceivable(row)) {
                    <app-pi-button variant="default" type="button" (click)="openReceive(row)" data-test="supply-request-receive">Получено</app-pi-button>
                  }
                  <app-pi-button variant="secondary" type="button" (click)="openEdit(row)" data-test="supply-request-edit">Изменить</app-pi-button>
                  <app-pi-button variant="secondary" type="button" (click)="confirmDelete(row)" data-test="supply-request-delete">Удалить</app-pi-button>
                </div>
              </div>
              @if (expandedId() === row._id) {
                <div class="px-4 py-4 hairline-bottom last:border-b-0 bg-paper-2" data-test="supply-request-row-expand">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div class="pi-label text-muted-foreground">Приоритет</div>
                      <div class="text-sm">{{ priorityLabel(row.priority) }}</div>
                    </div>
                    <div>
                      <div class="pi-label text-muted-foreground">Нужно к дате</div>
                      <div class="text-sm">{{ row.neededBy ? fmtDate(row.neededBy) : '—' }}</div>
                    </div>
                    <div>
                      <div class="pi-label text-muted-foreground">Дата оплаты</div>
                      <div class="text-sm">{{ row.paidAt ? fmtDate(row.paidAt) : '—' }}</div>
                    </div>
                    <div>
                      <div class="pi-label text-muted-foreground">Получено (факт)</div>
                      <div class="text-sm">{{ row.receivedQty != null ? row.receivedQty + ' ' + (row.unit || '') : '—' }}</div>
                    </div>
                    <div>
                      <div class="pi-label text-muted-foreground">Доставка</div>
                      <div class="text-sm">{{ row.deliveryNote || '—' }}</div>
                    </div>
                    <div class="sm:col-span-2">
                      <div class="pi-label text-muted-foreground">Примечание</div>
                      <div class="text-sm">{{ row.notes || '—' }}</div>
                    </div>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      }
    </main>
  `,
})
export class SupplyRequestsPage {
  protected readonly facade = inject(SupplyRequestsFacade);

  protected readonly statuses: readonly SupplyRequestStatus[] = ['in_progress', 'requested', 'ordered', 'received', 'cancelled'];
  protected readonly statusLabels = SUPPLY_REQUEST_STATUS_LABELS;

  protected readonly rows = this.facade.rows;
  protected readonly orders = this.facade.orders;
  protected readonly suppliers = this.facade.suppliers;
  protected readonly warehouses = this.facade.warehouses;
  protected readonly status = this.facade.status;
  protected readonly error = this.facade.error;
  protected readonly search = this.facade.search;
  protected readonly statusFilter = this.facade.statusFilter;
  protected readonly paidOnly = this.facade.paidOnly;
  protected readonly dateFrom = this.facade.dateFrom;
  protected readonly dateTo = this.facade.dateTo;
  protected readonly expandedId = this.facade.expandedId;
  protected readonly hasActiveFilters = this.facade.hasActiveFilters;
  protected readonly filteredRows = this.facade.filteredRows;

  onSearch(event: Event): void {
    this.facade.onSearch(event);
  }

  onStatusFilterChange(event: Event): void {
    this.facade.onStatusFilterChange(event);
  }

  onPaidOnlyChange(event: Event): void {
    this.facade.onPaidOnlyChange(event);
  }

  onDateFromChange(event: Event): void {
    this.facade.onDateFromChange(event);
  }

  onDateToChange(event: Event): void {
    this.facade.onDateToChange(event);
  }

  resetFilters(): void {
    this.facade.resetFilters();
  }

  load(): void {
    this.facade.load();
  }

  protected statusLabel(status: SupplyRequestStatus): string {
    return this.facade.statusLabel(status);
  }

  protected priorityLabel(priority: SupplyRequest['priority']): string {
    return this.facade.priorityLabel(priority);
  }

  protected fmtDate(value: string): string {
    return this.facade.fmtDate(value);
  }

  protected toggleExpand(requestId: string): void {
    this.facade.toggleExpand(requestId);
  }

  protected onRowSpace(event: Event, requestId: string): void {
    this.facade.onRowSpace(event, requestId);
  }

  protected supplierLabel(supplierId?: string): string {
    return this.facade.supplierLabel(supplierId);
  }

  protected linkedOrder(row: SupplyRequest) {
    return this.facade.linkedOrder(row);
  }

  protected orderLabel(row: SupplyRequest): string {
    return this.facade.orderLabel(row);
  }

  protected createdByLabel(createdBy?: string): string {
    return this.facade.createdByLabel(createdBy);
  }

  openCreate(): void {
    this.facade.openCreate();
  }

  openEdit(row: SupplyRequest): void {
    this.facade.openEdit(row);
  }

  protected isReceivable(row: SupplyRequest): boolean {
    return this.facade.isReceivable(row);
  }

  openReceive(row: SupplyRequest): void {
    this.facade.openReceive(row);
  }

  confirmDelete(row: SupplyRequest): void {
    this.facade.confirmDelete(row);
  }
}
