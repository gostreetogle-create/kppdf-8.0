/**
 * TZ-NX-SUPPLY-REQUESTS-FACADE — domain facade for `SupplyRequestsPage`.
 *
 * Owns: lookups (orders/suppliers/warehouses), the filtered list, and every
 * CRUD/receive/delete orchestration method — moved as-is from the page. No
 * receive/stock side-effect rule changes.
 */
import { DestroyRef, Injectable, Injector, computed, inject, signal } from '@angular/core';
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
import { AlertDialogComponent, PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import { formatSupplyRequestPriority, formatSupplyRequestStatus } from '../registries/data/supply-request-formatters';
import {
  SupplyRequestFormDialogComponent,
  type SupplyRequestFormDialogData,
} from './supply-request-form-dialog.component';
import {
  SupplyRequestReceiveDialogComponent,
  type SupplyRequestReceiveDialogData,
} from '@kppdf/features/supply';

const RECEIVABLE_STATUSES: ReadonlySet<SupplyRequestStatus> = new Set(['in_progress', 'requested', 'ordered']);

@Injectable()
export class SupplyRequestsFacade {
  private readonly api = inject(PiSupplyRequestsService);
  private readonly ordersApi = inject(PiOrdersService);
  private readonly organizationsApi = inject(PiOrganizationsService);
  private readonly warehousesApi = inject(PiWarehousesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  readonly rows = signal<readonly SupplyRequest[]>([]);
  readonly orders = signal<readonly Order[]>([]);
  readonly suppliers = signal<readonly Organization[]>([]);
  readonly warehouses = signal<readonly Warehouse[]>([]);
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('Не удалось загрузить заявки.');
  readonly search = signal('');
  readonly statusFilter = signal<SupplyRequestStatus | ''>('');
  readonly paidOnly = signal(false);
  readonly dateFrom = signal('');
  readonly dateTo = signal('');
  /** Single expand (registry pattern) — reloading the list collapses it. */
  readonly expandedId = signal<string | null>(null);

  readonly hasActiveFilters = computed(
    () =>
      this.search().trim() !== '' ||
      this.statusFilter() !== '' ||
      this.paidOnly() ||
      this.dateFrom() !== '' ||
      this.dateTo() !== '',
  );

  readonly filteredRows = computed(() => {
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
    this.expandedId.set(null);
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

  statusLabel(status: SupplyRequestStatus): string {
    return formatSupplyRequestStatus(status);
  }

  priorityLabel(priority: SupplyRequest['priority']): string {
    return formatSupplyRequestPriority(priority);
  }

  fmtDate(value: string): string {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('ru-RU');
  }

  toggleExpand(requestId: string): void {
    this.expandedId.update((current) => (current === requestId ? null : requestId));
  }

  onRowSpace(event: Event, requestId: string): void {
    event.preventDefault();
    this.toggleExpand(requestId);
  }

  supplierLabel(supplierId?: string): string {
    if (!supplierId) return '—';
    return this.suppliers().find((s) => s._id === supplierId)?.name ?? supplierId.slice(-6);
  }

  /** Resolved `Order` when `orderId` matches a known order — renders as a link; otherwise falls back to `orderLabel(row)` text. */
  linkedOrder(row: SupplyRequest): Order | undefined {
    if (!row.orderId) return undefined;
    return this.orders().find((o) => o._id === row.orderId);
  }

  orderLabel(row: SupplyRequest): string {
    if (row.orderId) {
      return this.orders().find((o) => o._id === row.orderId)?.number ?? row.orderId.slice(-6);
    }
    return row.orderLabel || '—';
  }

  /** known_limitation: no Users lookup service on NX yet — short id, not a display name. */
  createdByLabel(createdBy?: string): string {
    return createdBy ? createdBy.slice(-6) : '—';
  }

  openCreate(): void {
    this.openForm();
  }

  openEdit(row: SupplyRequest): void {
    this.openForm(row);
  }

  isReceivable(row: SupplyRequest): boolean {
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
