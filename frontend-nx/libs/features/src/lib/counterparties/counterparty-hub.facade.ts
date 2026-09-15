import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  PiContractsService,
  PiOrdersService,
  PiQuotationsService,
  PiSitesService,
  type Contract,
  type ContractStatus,
  type Counterparty,
  type Order,
  type OrderStatus,
  type Quotation,
  type Site,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';

const QUOTATION_STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик',
  sent: 'На проверке',
  accepted: 'Принято',
  rejected: 'Отклонено',
  converted: 'В заказе',
  cancelled: 'Отменено',
};

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Черновик',
  confirmed: 'Подтверждён',
  in_production: 'В производстве',
  ready: 'Готов',
  shipped: 'Отгружен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: 'Черновик',
  sent: 'Отправлен',
  signed: 'Подписан',
  active: 'Действует',
  completed: 'Завершён',
  cancelled: 'Отменён',
  expired: 'Истёк',
};

const HUB_LIST_LIMIT = 5;

/** Tray-scoped read model for a Counterparty hub; it never represents our Organization. */
@Injectable()
export class CounterpartyHubFacade {
  private readonly sitesApi = inject(PiSitesService);
  private readonly ordersApi = inject(PiOrdersService);
  private readonly quotationsApi = inject(PiQuotationsService);
  private readonly contractsApi = inject(PiContractsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly listLimit = HUB_LIST_LIMIT;
  readonly sitesLoading = signal(false);
  readonly sitesError = signal<string | null>(null);
  readonly sites = signal<readonly Site[]>([]);
  readonly ordersLoading = signal(false);
  readonly ordersError = signal<string | null>(null);
  readonly orders = signal<readonly Order[]>([]);
  readonly quotationsLoading = signal(false);
  readonly quotationsError = signal<string | null>(null);
  readonly quotations = signal<readonly Quotation[]>([]);
  readonly contractsLoading = signal(false);
  readonly contractsError = signal<string | null>(null);
  readonly contracts = signal<readonly Contract[]>([]);

  load(counterpartyId: string): void {
    this.loadSites(counterpartyId);
    this.loadOrders(counterpartyId);
    this.loadQuotations(counterpartyId);
    this.loadContracts(counterpartyId);
  }

  innLabel(counterparty: Counterparty): string {
    return counterparty.inn + (counterparty.innIsStub ? ' (временный)' : '');
  }

  statusLabel(status?: OrderStatus): string {
    return status ? (ORDER_STATUS_LABELS[status] ?? status) : '—';
  }

  quotationStatus(status?: string): string {
    return status ? (QUOTATION_STATUS_LABELS[status] ?? status) : '—';
  }

  contractStatus(status?: ContractStatus): string {
    return status ? (CONTRACT_STATUS_LABELS[status] ?? status) : '—';
  }

  private loadSites(counterpartyId: string): void {
    this.sitesLoading.set(true);
    this.sitesError.set(null);
    this.sitesApi
      .list(counterpartyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.sitesLoading.set(false);
        if (!res.ok) {
          this.sitesError.set(extractErrorMessage(res.error) || 'Не удалось загрузить объекты');
          return;
        }
        this.sites.set(res.data ?? []);
      });
  }

  private loadOrders(counterpartyId: string): void {
    this.ordersLoading.set(true);
    this.ordersError.set(null);
    this.ordersApi
      .list({ counterpartyId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.ordersLoading.set(false);
        if (!res.ok) {
          this.ordersError.set(extractErrorMessage(res.error) || 'Не удалось загрузить заказы');
          return;
        }
        this.orders.set(res.data ?? []);
      });
  }

  private loadQuotations(counterpartyId: string): void {
    this.quotationsLoading.set(true);
    this.quotationsError.set(null);
    this.quotationsApi
      .list({ counterpartyId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.quotationsLoading.set(false);
        if (!res.ok) {
          this.quotationsError.set(extractErrorMessage(res.error) || 'Не удалось загрузить КП');
          return;
        }
        this.quotations.set(res.data ?? []);
      });
  }

  private loadContracts(counterpartyId: string): void {
    this.contractsLoading.set(true);
    this.contractsError.set(null);
    this.contractsApi
      .list({ counterpartyId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.contractsLoading.set(false);
        if (!res.ok) {
          this.contractsError.set(extractErrorMessage(res.error) || 'Не удалось загрузить договоры');
          return;
        }
        this.contracts.set(res.data ?? []);
      });
  }
}
