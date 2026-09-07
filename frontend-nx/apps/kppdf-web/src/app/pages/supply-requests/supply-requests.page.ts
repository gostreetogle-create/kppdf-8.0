import { ChangeDetectionStrategy, Component, DestroyRef, Injector, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  PiOrdersService,
  PiOrganizationsService,
  PiSupplyRequestsService,
  PiWarehousesService,
  type Order,
  type Organization,
  type SupplyRequest,
  type SupplyRequestStatus,
  type Warehouse,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { AlertDialogComponent, PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import {
  formatSupplyRequestStatus,
  SUPPLY_REQUEST_STATUS_LABELS,
} from '../registries/data/supply-request-formatters';
import {
  SupplyRequestFormDialogComponent,
  type SupplyRequestFormDialogData,
} from './supply-request-form-dialog.component';
import {
  SupplyRequestReceiveDialogComponent,
  type SupplyRequestReceiveDialogData,
} from './supply-request-receive-dialog.component';

const RECEIVABLE_STATUSES: ReadonlySet<SupplyRequestStatus> = new Set(['in_progress', 'requested', 'ordered']);

/**
 * TZ-NX-SUPPLY-S3-REQUEST-JOURNAL — single SoT for `SupplyRequest` (журнал заявок
 * как Google Sheets). Replaces the truncated registries generic dialog (title+qty
 * only) — see `docs/audits/2026-09-06-supply-google-sheets-to-nx-audit.md`.
 * `SupplyTask` (заказ-based deficit) stays on `/supply` — separate entity, not this page.
 */
@Component({
  selector: 'pi-supply-requests-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiStatusBannerComponent, RouterLink],
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
        <button class="pi-button pi-button-primary" type="button" (click)="openCreate()" data-test="supply-request-create">
          + Заявка
        </button>
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
          <button class="text-xs underline underline-offset-2 text-muted-foreground" type="button" (click)="resetFilters()" data-test="supply-request-reset-filters">
            Сбросить фильтры
          </button>
        }
        <span class="text-sm text-muted-foreground">{{ filteredRows().length }} заявок</span>
        <span class="flex-1"></span>
        <button class="pi-button pi-button-secondary" type="button" (click)="load()" data-test="supply-request-refresh">
          Обновить
        </button>
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
            <button class="underline underline-offset-2" type="button" (click)="resetFilters()" data-test="supply-request-empty-reset">
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
              <div class="grid grid-cols-[minmax(0,1.6fr)_minmax(5rem,0.6fr)_minmax(9rem,0.9fr)_minmax(7rem,0.7fr)_minmax(5rem,0.5fr)_minmax(7rem,0.7fr)_minmax(7rem,0.7fr)_minmax(6rem,0.6fr)_minmax(9rem,0.8fr)] gap-3 items-center px-4 py-3 hairline-bottom last:border-b-0" role="row" data-test="supply-request-row">
                <div role="cell" class="min-w-0 truncate">{{ row.title || row.article || 'Без названия' }}</div>
                <div role="cell" class="text-right tabular-nums">{{ row.qty }} {{ row.unit }}</div>
                <div role="cell" class="truncate">{{ supplierLabel(row.supplierId) }}</div>
                <div role="cell" data-test="supply-request-status">{{ statusLabel(row.status) }}</div>
                <div role="cell" data-test="supply-request-paid-cell">{{ row.paid ? 'Оплачено' : '—' }}</div>
                <div role="cell" class="truncate">{{ row.invoiceNo || '—' }}</div>
                <div role="cell" class="truncate">
                  @if (linkedOrder(row); as order) {
                    <a class="underline underline-offset-2 hover:text-sunrise-warm" [routerLink]="['/orders', order._id]" data-test="supply-request-order-link">
                      {{ order.number }}
                    </a>
                  } @else {
                    {{ orderLabel(row) }}
                  }
                </div>
                <div role="cell" class="truncate" [attr.title]="row.createdBy">{{ createdByLabel(row.createdBy) }}</div>
                <div class="flex items-center gap-2 justify-end" role="cell">
                  @if (isReceivable(row)) {
                    <button class="pi-button pi-button-primary" type="button" (click)="openReceive(row)" data-test="supply-request-receive">Получено</button>
                  }
                  <button class="pi-button pi-button-secondary" type="button" (click)="openEdit(row)" data-test="supply-request-edit">Изменить</button>
                  <button class="pi-button pi-button-secondary" type="button" (click)="confirmDelete(row)" data-test="supply-request-delete">Удалить</button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </main>
  `,
})
export class SupplyRequestsPage {
  private readonly api = inject(PiSupplyRequestsService);
  private readonly ordersApi = inject(PiOrdersService);
  private readonly organizationsApi = inject(PiOrganizationsService);
  private readonly warehousesApi = inject(PiWarehousesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly statuses: readonly SupplyRequestStatus[] = ['in_progress', 'requested', 'ordered', 'received', 'cancelled'];
  protected readonly statusLabels = SUPPLY_REQUEST_STATUS_LABELS;

  protected readonly rows = signal<readonly SupplyRequest[]>([]);
  protected readonly orders = signal<readonly Order[]>([]);
  protected readonly suppliers = signal<readonly Organization[]>([]);
  protected readonly warehouses = signal<readonly Warehouse[]>([]);
  protected readonly status = signal<'loading' | 'success' | 'error'>('loading');
  protected readonly error = signal('Не удалось загрузить заявки.');
  protected readonly search = signal('');
  protected readonly statusFilter = signal<SupplyRequestStatus | ''>('');
  protected readonly paidOnly = signal(false);
  protected readonly dateFrom = signal('');
  protected readonly dateTo = signal('');

  protected readonly hasActiveFilters = computed(
    () =>
      this.search().trim() !== '' ||
      this.statusFilter() !== '' ||
      this.paidOnly() ||
      this.dateFrom() !== '' ||
      this.dateTo() !== '',
  );

  protected readonly filteredRows = computed(() => {
    const query = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    const paidOnly = this.paidOnly();
    const dateFrom = this.dateFrom();
    const dateTo = this.dateTo();
    return this.rows().filter((row) => {
      if (status && row.status !== status) return false;
      if (paidOnly && !row.paid) return false;
      if (dateFrom || dateTo) {
        const needed = row.neededBy?.slice(0, 10) ?? '';
        if (!needed) return false;
        if (dateFrom && needed < dateFrom) return false;
        if (dateTo && needed > dateTo) return false;
      }
      if (!query) return true;
      return (row.title ?? '').toLowerCase().includes(query) || (row.article ?? '').toLowerCase().includes(query);
    });
  });

  constructor() {
    this.load();
    void this.loadLookups();
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  onStatusFilterChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as SupplyRequestStatus | '');
  }

  onPaidOnlyChange(event: Event): void {
    this.paidOnly.set((event.target as HTMLInputElement).checked);
  }

  onDateFromChange(event: Event): void {
    this.dateFrom.set((event.target as HTMLInputElement).value);
  }

  onDateToChange(event: Event): void {
    this.dateTo.set((event.target as HTMLInputElement).value);
  }

  resetFilters(): void {
    this.search.set('');
    this.statusFilter.set('');
    this.paidOnly.set(false);
    this.dateFrom.set('');
    this.dateTo.set('');
  }

  load(): void {
    this.status.set('loading');
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

  protected statusLabel(status: SupplyRequestStatus): string {
    return formatSupplyRequestStatus(status);
  }

  protected supplierLabel(supplierId?: string): string {
    if (!supplierId) return '—';
    return this.suppliers().find((s) => s._id === supplierId)?.name ?? supplierId.slice(-6);
  }

  /** Resolved `Order` when `orderId` matches a known order — renders as a link; otherwise falls back to `orderLabel(row)` text. */
  protected linkedOrder(row: SupplyRequest): Order | undefined {
    if (!row.orderId) return undefined;
    return this.orders().find((o) => o._id === row.orderId);
  }

  protected orderLabel(row: SupplyRequest): string {
    if (row.orderId) {
      return this.orders().find((o) => o._id === row.orderId)?.number ?? row.orderId.slice(-6);
    }
    return row.orderLabel || '—';
  }

  /** known_limitation: no Users lookup service on NX yet — short id, not a display name. */
  protected createdByLabel(createdBy?: string): string {
    return createdBy ? createdBy.slice(-6) : '—';
  }

  openCreate(): void {
    this.openForm();
  }

  openEdit(row: SupplyRequest): void {
    this.openForm(row);
  }

  protected isReceivable(row: SupplyRequest): boolean {
    return RECEIVABLE_STATUSES.has(row.status) && Boolean(row.materialId);
  }

  openReceive(row: SupplyRequest): void {
    const ref = this.dialog.open<SupplyRequest | undefined, SupplyRequestReceiveDialogData>(
      SupplyRequestReceiveDialogComponent,
      {
        data: { request: row, warehouses: this.warehouses() },
        width: 'sm',
        ariaLabel: 'Подтвердить получение',
        parentDestroyRef: this.destroyRef,
      },
    );
    onDialogCloseOnce(ref, this.injector, (received) => {
      if (received) {
        this.toast.success('Получение проведено — остаток на складе обновлён');
        this.load();
      }
    });
  }

  confirmDelete(row: SupplyRequest): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Удалить заявку?',
        description: `«${row.title || row.article || 'Без названия'}» будет удалена.`,
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

  private openForm(request?: SupplyRequest): void {
    const ref = this.dialog.open<SupplyRequest | undefined, SupplyRequestFormDialogData>(
      SupplyRequestFormDialogComponent,
      {
        data: { request, orders: this.orders(), suppliers: this.suppliers() },
        width: 'md',
        ariaLabel: request ? 'Изменить заявку' : 'Создать заявку',
        parentDestroyRef: this.destroyRef,
      },
    );
    onDialogCloseOnce(ref, this.injector, (saved) => {
      if (saved) {
        this.toast.success(request ? 'Заявка сохранена' : 'Заявка создана');
        this.load();
      }
    });
  }

  private async remove(id: string): Promise<void> {
    const result = await firstValueFrom(this.api.remove(id));
    if (!result.ok) {
      this.toast.error('Не удалось удалить заявку', { description: extractErrorMessage(result.error) });
      return;
    }
    this.toast.success('Заявка удалена');
    this.load();
  }

  private async loadLookups(): Promise<void> {
    const [orders, suppliers, warehouses] = await Promise.all([
      firstValueFrom(this.ordersApi.list()),
      firstValueFrom(this.organizationsApi.list({ type: 'supplier', limit: 100 })),
      firstValueFrom(this.warehousesApi.list()),
    ]);
    if (orders.ok) this.orders.set(orders.data ?? []);
    if (suppliers.ok) this.suppliers.set(suppliers.data.items);
    if (warehouses.ok) this.warehouses.set(warehouses.data ?? []);
  }
}
