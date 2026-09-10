import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  PiContractsService,
  PiOrdersService,
  PiQuotationsService,
  PiSitesService,
  type Contract,
  type Counterparty,
  type Order,
  type Quotation,
  type Site,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { orderStatusLabel } from '../orders/order-status';
import { contractStatusLabel } from '../contracts/contract-status';

/** Mirrors `proposals-list.page.ts` STATUS_LABELS — no shared export exists yet. */
const QUOTATION_STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик',
  sent: 'На проверке',
  accepted: 'Принято',
  rejected: 'Отклонено',
  converted: 'В заказе',
  cancelled: 'Отменено',
};
function quotationStatusLabel(status?: string): string {
  return status ? (QUOTATION_STATUS_LABELS[status] ?? status) : '—';
}

/** Hub summary lists stay short — full detail lives on the linked registry page. */
const HUB_LIST_LIMIT = 5;

/**
 * TZ-NX-HUB-01 — counterparty hub expand (mirrors `order-hub-tray.component.ts`
 * pattern). Summary + links only, no second write-path: Реквизиты (from the
 * already-loaded row, no fetch) · Объекты · Заказы · КП · Договоры, each
 * lazy-loaded on first expand (row-expand-lazy budget: sites=1 + orders=1 +
 * quotations=1 + contracts=1 = 4 HTTP, under the ≤5 canon budget).
 */
@Component({
  selector: 'app-counterparty-hub-tray',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div
      class="counterparty-hub-tray bg-paper-2 border-t hairline"
      data-test="counterparty-hub-tray"
      role="region"
      [attr.aria-label]="'Сводка заказчика: ' + counterparty().name"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
        <!-- Реквизиты -->
        <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="counterparty-hub-requisites">
          <h3 class="text-sm font-medium text-ink m-0 mb-3">Реквизиты</h3>
          <dl class="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
            <dt class="text-muted-foreground">Название</dt>
            <dd class="m-0 truncate">{{ counterparty().name }}</dd>
            <dt class="text-muted-foreground">ИНН</dt>
            <dd class="m-0" data-test="counterparty-hub-inn">{{ innLabel() }}</dd>
            <dt class="text-muted-foreground">Телефон</dt>
            <dd class="m-0">{{ counterparty().phone || '—' }}</dd>
            <dt class="text-muted-foreground">Email</dt>
            <dd class="m-0 truncate">{{ counterparty().email || '—' }}</dd>
          </dl>
        </section>

        <!-- Объекты -->
        <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="counterparty-hub-sites">
          <h3 class="text-sm font-medium text-ink m-0 mb-3">Объекты</h3>
          @if (sitesLoading()) {
            <p class="text-xs text-muted-foreground m-0">Загрузка…</p>
          } @else if (sitesError()) {
            <p class="text-xs text-destructive m-0" role="alert" data-test="counterparty-hub-sites-error">
              {{ sitesError() }}
            </p>
          } @else if (sites().length === 0) {
            <p class="text-xs text-muted-foreground m-0">Нет объектов</p>
          } @else {
            <ul class="m-0 p-0 list-none flex flex-col gap-1 text-xs">
              @for (site of sites().slice(0, listLimit); track site._id) {
                <li class="truncate" data-test="counterparty-hub-site-item">
                  {{ site.name }} <span class="text-muted-foreground">· {{ site.address }}</span>
                </li>
              }
            </ul>
            @if (sites().length > listLimit) {
              <p class="text-xs text-muted-foreground m-0 mt-1">и ещё {{ sites().length - listLimit }}</p>
            }
          }
        </section>

        <!-- Заказы -->
        <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="counterparty-hub-orders">
          <div class="flex items-baseline gap-2 mb-3">
            <h3 class="text-sm font-medium text-ink m-0">Заказы</h3>
            <a routerLink="/orders" class="pi-outline-btn ml-auto" data-test="counterparty-hub-orders-all">
              Все заказы
            </a>
          </div>
          @if (ordersLoading()) {
            <p class="text-xs text-muted-foreground m-0">Загрузка…</p>
          } @else if (ordersError()) {
            <p class="text-xs text-destructive m-0" role="alert" data-test="counterparty-hub-orders-error">
              {{ ordersError() }}
            </p>
          } @else if (orders().length === 0) {
            <p class="text-xs text-muted-foreground m-0">Нет заказов</p>
          } @else {
            <ul class="m-0 p-0 list-none flex flex-col gap-1 text-xs">
              @for (order of orders().slice(0, listLimit); track order._id) {
                <li>
                  <a
                    [routerLink]="['/orders', order._id]"
                    class="flex items-center justify-between gap-2 rounded-sm px-1 -mx-1 py-0.5 hover:bg-paper-2 pi-focus-ring"
                    data-test="counterparty-hub-order-link"
                  >
                    <span class="font-medium truncate">{{ order.number }}</span>
                    <span class="text-muted-foreground shrink-0">{{ statusLabel(order.status) }}</span>
                  </a>
                </li>
              }
            </ul>
            @if (orders().length > listLimit) {
              <p class="text-xs text-muted-foreground m-0 mt-1">и ещё {{ orders().length - listLimit }}</p>
            }
          }
        </section>

        <!-- КП -->
        <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="counterparty-hub-quotations">
          <div class="flex items-baseline gap-2 mb-3">
            <h3 class="text-sm font-medium text-ink m-0">КП</h3>
            <a routerLink="/proposals" class="pi-outline-btn ml-auto" data-test="counterparty-hub-quotations-all">
              Все КП
            </a>
          </div>
          @if (quotationsLoading()) {
            <p class="text-xs text-muted-foreground m-0">Загрузка…</p>
          } @else if (quotationsError()) {
            <p class="text-xs text-destructive m-0" role="alert" data-test="counterparty-hub-quotations-error">
              {{ quotationsError() }}
            </p>
          } @else if (quotations().length === 0) {
            <p class="text-xs text-muted-foreground m-0">Нет КП</p>
          } @else {
            <ul class="m-0 p-0 list-none flex flex-col gap-1 text-xs">
              @for (quotation of quotations().slice(0, listLimit); track quotation._id) {
                <li class="flex items-center justify-between gap-2" data-test="counterparty-hub-quotation-item">
                  <span class="font-medium truncate">{{ quotation.number }}</span>
                  <span class="text-muted-foreground shrink-0">{{ quotationStatus(quotation.status) }}</span>
                </li>
              }
            </ul>
            @if (quotations().length > listLimit) {
              <p class="text-xs text-muted-foreground m-0 mt-1">и ещё {{ quotations().length - listLimit }}</p>
            }
          }
        </section>

        <!-- Договоры -->
        <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="counterparty-hub-contracts">
          <div class="flex items-baseline gap-2 mb-3">
            <h3 class="text-sm font-medium text-ink m-0">Договоры</h3>
            <a routerLink="/contracts" class="pi-outline-btn ml-auto" data-test="counterparty-hub-contracts-all">
              Все договоры
            </a>
          </div>
          @if (contractsLoading()) {
            <p class="text-xs text-muted-foreground m-0">Загрузка…</p>
          } @else if (contractsError()) {
            <p class="text-xs text-destructive m-0" role="alert" data-test="counterparty-hub-contracts-error">
              {{ contractsError() }}
            </p>
          } @else if (contracts().length === 0) {
            <p class="text-xs text-muted-foreground m-0">Нет договоров</p>
          } @else {
            <ul class="m-0 p-0 list-none flex flex-col gap-1 text-xs">
              @for (contract of contracts().slice(0, listLimit); track contract._id) {
                <li>
                  <a
                    [routerLink]="['/contracts', contract._id]"
                    class="flex items-center justify-between gap-2 rounded-sm px-1 -mx-1 py-0.5 hover:bg-paper-2 pi-focus-ring"
                    data-test="counterparty-hub-contract-link"
                  >
                    <span class="font-medium truncate">{{ contract.number }}</span>
                    <span class="text-muted-foreground shrink-0">{{ contractStatus(contract.status) }}</span>
                  </a>
                </li>
              }
            </ul>
            @if (contracts().length > listLimit) {
              <p class="text-xs text-muted-foreground m-0 mt-1">и ещё {{ contracts().length - listLimit }}</p>
            }
          }
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class CounterpartyHubTrayComponent implements OnInit {
  readonly counterparty = input.required<Counterparty>();

  private readonly sitesApi = inject(PiSitesService);
  private readonly ordersApi = inject(PiOrdersService);
  private readonly quotationsApi = inject(PiQuotationsService);
  private readonly contractsApi = inject(PiContractsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly listLimit = HUB_LIST_LIMIT;
  protected readonly statusLabel = orderStatusLabel;
  protected readonly quotationStatus = quotationStatusLabel;
  protected readonly contractStatus = contractStatusLabel;

  protected readonly sitesLoading = signal(false);
  protected readonly sitesError = signal<string | null>(null);
  protected readonly sites = signal<readonly Site[]>([]);

  protected readonly ordersLoading = signal(false);
  protected readonly ordersError = signal<string | null>(null);
  protected readonly orders = signal<readonly Order[]>([]);

  protected readonly quotationsLoading = signal(false);
  protected readonly quotationsError = signal<string | null>(null);
  protected readonly quotations = signal<readonly Quotation[]>([]);

  protected readonly contractsLoading = signal(false);
  protected readonly contractsError = signal<string | null>(null);
  protected readonly contracts = signal<readonly Contract[]>([]);

  ngOnInit(): void {
    // Row-expand-lazy (canon budget ≤5 HTTP per expand: sites=1 + orders=1 + quotations=1 + contracts=1).
    this.loadSites();
    this.loadOrders();
    this.loadQuotations();
    this.loadContracts();
  }

  protected innLabel(): string {
    const cp = this.counterparty();
    return cp.inn + (cp.innIsStub ? ' (временный)' : '');
  }

  private loadSites(): void {
    this.sitesLoading.set(true);
    this.sitesError.set(null);
    this.sitesApi
      .list(this.counterparty()._id)
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

  private loadOrders(): void {
    this.ordersLoading.set(true);
    this.ordersError.set(null);
    this.ordersApi
      .list({ counterpartyId: this.counterparty()._id })
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

  private loadQuotations(): void {
    this.quotationsLoading.set(true);
    this.quotationsError.set(null);
    this.quotationsApi
      .list({ counterpartyId: this.counterparty()._id })
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

  private loadContracts(): void {
    this.contractsLoading.set(true);
    this.contractsError.set(null);
    this.contractsApi
      .list({ counterpartyId: this.counterparty()._id })
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
