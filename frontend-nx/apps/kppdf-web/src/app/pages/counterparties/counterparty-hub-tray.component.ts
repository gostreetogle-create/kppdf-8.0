import { ChangeDetectionStrategy, Component, OnInit, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  type Counterparty,
} from '@kppdf/data-access';
import { CounterpartyHubFacade } from './counterparty-hub.facade';

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
  providers: [CounterpartyHubFacade],
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
            <dd class="m-0" data-test="counterparty-hub-inn">{{ facade.innLabel(counterparty()) }}</dd>
            <dt class="text-muted-foreground">Телефон</dt>
            <dd class="m-0">{{ counterparty().phone || '—' }}</dd>
            <dt class="text-muted-foreground">Email</dt>
            <dd class="m-0 truncate">{{ counterparty().email || '—' }}</dd>
          </dl>
        </section>

        <!-- Объекты -->
        <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="counterparty-hub-sites">
          <h3 class="text-sm font-medium text-ink m-0 mb-3">Объекты</h3>
          @if (facade.sitesLoading()) {
            <p class="text-xs text-muted-foreground m-0">Загрузка…</p>
          } @else if (facade.sitesError()) {
            <p class="text-xs text-destructive m-0" role="alert" data-test="counterparty-hub-sites-error">
              {{ facade.sitesError() }}
            </p>
          } @else if (facade.sites().length === 0) {
            <p class="text-xs text-muted-foreground m-0">Нет объектов</p>
          } @else {
            <ul class="m-0 p-0 list-none flex flex-col gap-1 text-xs">
              @for (site of facade.sites().slice(0, facade.listLimit); track site._id) {
                <li class="truncate" data-test="counterparty-hub-site-item">
                  {{ site.name }} <span class="text-muted-foreground">· {{ site.address }}</span>
                </li>
              }
            </ul>
            @if (facade.sites().length > facade.listLimit) {
              <p class="text-xs text-muted-foreground m-0 mt-1">и ещё {{ facade.sites().length - facade.listLimit }}</p>
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
          @if (facade.ordersLoading()) {
            <p class="text-xs text-muted-foreground m-0">Загрузка…</p>
          } @else if (facade.ordersError()) {
            <p class="text-xs text-destructive m-0" role="alert" data-test="counterparty-hub-orders-error">
              {{ facade.ordersError() }}
            </p>
          } @else if (facade.orders().length === 0) {
            <p class="text-xs text-muted-foreground m-0">Нет заказов</p>
          } @else {
            <ul class="m-0 p-0 list-none flex flex-col gap-1 text-xs">
              @for (order of facade.orders().slice(0, facade.listLimit); track order._id) {
                <li>
                  <a
                    [routerLink]="['/orders', order._id]"
                    class="flex items-center justify-between gap-2 rounded-sm px-1 -mx-1 py-0.5 hover:bg-paper-2 pi-focus-ring"
                    data-test="counterparty-hub-order-link"
                  >
                    <span class="font-medium truncate">{{ order.number }}</span>
                    <span class="text-muted-foreground shrink-0">{{ facade.statusLabel(order.status) }}</span>
                  </a>
                </li>
              }
            </ul>
            @if (facade.orders().length > facade.listLimit) {
              <p class="text-xs text-muted-foreground m-0 mt-1">и ещё {{ facade.orders().length - facade.listLimit }}</p>
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
          @if (facade.quotationsLoading()) {
            <p class="text-xs text-muted-foreground m-0">Загрузка…</p>
          } @else if (facade.quotationsError()) {
            <p class="text-xs text-destructive m-0" role="alert" data-test="counterparty-hub-quotations-error">
              {{ facade.quotationsError() }}
            </p>
          } @else if (facade.quotations().length === 0) {
            <p class="text-xs text-muted-foreground m-0">Нет КП</p>
          } @else {
            <ul class="m-0 p-0 list-none flex flex-col gap-1 text-xs">
              @for (quotation of facade.quotations().slice(0, facade.listLimit); track quotation._id) {
                <li class="flex items-center justify-between gap-2" data-test="counterparty-hub-quotation-item">
                  <span class="font-medium truncate">{{ quotation.number }}</span>
                  <span class="text-muted-foreground shrink-0">{{ facade.quotationStatus(quotation.status) }}</span>
                </li>
              }
            </ul>
            @if (facade.quotations().length > facade.listLimit) {
              <p class="text-xs text-muted-foreground m-0 mt-1">и ещё {{ facade.quotations().length - facade.listLimit }}</p>
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
          @if (facade.contractsLoading()) {
            <p class="text-xs text-muted-foreground m-0">Загрузка…</p>
          } @else if (facade.contractsError()) {
            <p class="text-xs text-destructive m-0" role="alert" data-test="counterparty-hub-contracts-error">
              {{ facade.contractsError() }}
            </p>
          } @else if (facade.contracts().length === 0) {
            <p class="text-xs text-muted-foreground m-0">Нет договоров</p>
          } @else {
            <ul class="m-0 p-0 list-none flex flex-col gap-1 text-xs">
              @for (contract of facade.contracts().slice(0, facade.listLimit); track contract._id) {
                <li>
                  <a
                    [routerLink]="['/contracts', contract._id]"
                    class="flex items-center justify-between gap-2 rounded-sm px-1 -mx-1 py-0.5 hover:bg-paper-2 pi-focus-ring"
                    data-test="counterparty-hub-contract-link"
                  >
                    <span class="font-medium truncate">{{ contract.number }}</span>
                    <span class="text-muted-foreground shrink-0">{{ facade.contractStatus(contract.status) }}</span>
                  </a>
                </li>
              }
            </ul>
            @if (facade.contracts().length > facade.listLimit) {
              <p class="text-xs text-muted-foreground m-0 mt-1">и ещё {{ facade.contracts().length - facade.listLimit }}</p>
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
  protected readonly facade = inject(CounterpartyHubFacade);

  ngOnInit(): void {
    // Row-expand-lazy (canon budget ≤5 HTTP per expand: sites=1 + orders=1 + quotations=1 + contracts=1).
    this.facade.load(this.counterparty()._id);
  }
}
