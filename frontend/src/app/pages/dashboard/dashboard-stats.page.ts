import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { PiPageChromeComponent } from '../../shared/page/pi-page-chrome.component';
import { Order } from '../orders/orders.service';
import { API_BASE_URL } from '../../core/api.tokens';
import { extractErrorMessage } from '../../core/silent-http';

/** Aggregate pulse from GET /inventory — no unbounded list fan-out. */
interface InventoryPulse {
  totalWarehouses: number;
  totalActiveItems: number;
  outOfStockCount: number;
  lowStockCount: number;
  totalMovementsLast30d: number;
}

/**
 * TZ-DASHBOARD-401 — домашняя сводка «Обзор» (не канбан).
 *
 * Заказы: KPI из уже доступного GET /orders (те же формулы, что на Комбайне).
 * Склад: pulse через aggregate GET /inventory (не N×list без лимита).
 * КП open count не считаем без aggregate API → отдельный TZ-DASHBOARD-402 при необходимости.
 *
 * Комбайн заказов живёт на /design/combine (DashboardPage) — раздел Проект.
 */
@Component({
  selector: 'app-dashboard-stats-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PiPageChromeComponent],
  template: `
    <app-pi-page-chrome
      title="Обзор"
      description="Сводка по сайту: заказы и склад. Канбан — в разделе «Проект» → Комбайн заказов."
    />

    @if (loading()) {
      <p class="text-sm text-muted-foreground mb-6" data-test="overview-loading">
        Загрузка сводки…
      </p>
    } @else if (error()) {
      <div
        class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        data-test="overview-error"
        role="alert"
      >
        {{ error() }}
      </div>
    } @else if (isEmpty()) {
      <div
        class="pi-dashed-panel max-w-lg p-6 mb-6 flex flex-col gap-1"
        data-test="overview-empty"
        role="status"
      >
        <span class="eyebrow text-muted-foreground">Пусто</span>
        <p class="text-sm text-muted-foreground m-0">
          Пока нет заказов и складских позиций для сводки. Создайте заказ или откройте разделы ниже.
        </p>
      </div>
    }

    @if (!loading() && !error() && !isEmpty()) {
      <section
        class="mb-8"
        data-test="overview-orders-section"
        aria-labelledby="overview-orders-heading"
      >
        <div class="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <h2 id="overview-orders-heading" class="font-display text-sm font-semibold m-0">
            Заказы
          </h2>
          <div class="flex flex-wrap gap-3 text-sm">
            <a
              routerLink="/orders"
              class="underline-offset-2 hover:underline"
              data-test="overview-link-orders"
              >Все заказы</a
            >
            <a
              routerLink="/design/combine"
              class="underline-offset-2 hover:underline"
              data-test="overview-link-combine"
              >Комбайн заказов</a
            >
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4" data-test="overview-order-counters">
          @for (card of statCards; track card.key) {
            <a
              [routerLink]="card.link"
              class="p-4 rounded-sm border hairline bg-paper flex flex-col gap-1
                     hover:border-ink/30 transition-colors no-underline text-inherit"
              [attr.data-test]="'overview-counter-' + card.key"
            >
              <span class="text-xs text-muted-foreground uppercase tracking-wider">
                {{ card.label }}
              </span>
              <span class="text-2xl font-display" [class.text-destructive]="card.destructive">
                {{ stats()[card.key] }}
              </span>
            </a>
          }
        </div>
      </section>

      <section
        class="mb-8"
        data-test="overview-warehouse-section"
        aria-labelledby="overview-wh-heading"
      >
        <div class="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <h2 id="overview-wh-heading" class="font-display text-sm font-semibold m-0">Склад</h2>
          <div class="flex flex-wrap gap-3 text-sm">
            <a
              routerLink="/storage-items"
              class="underline-offset-2 hover:underline"
              data-test="overview-link-storage"
              >Остатки</a
            >
            <a
              routerLink="/stock-movements"
              class="underline-offset-2 hover:underline"
              data-test="overview-link-movements"
              >Движения</a
            >
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4" data-test="overview-warehouse-pulse">
          @for (card of warehouseCards; track card.key) {
            <a
              [routerLink]="card.link"
              class="p-4 rounded-sm border hairline bg-paper flex flex-col gap-1
                     hover:border-ink/30 transition-colors no-underline text-inherit"
              [attr.data-test]="'overview-wh-' + card.key"
            >
              <span class="text-xs text-muted-foreground uppercase tracking-wider">
                {{ card.label }}
              </span>
              <span class="text-2xl font-display" [class.text-destructive]="card.destructive">
                {{ warehousePulse()[card.key] }}
              </span>
            </a>
          }
        </div>
      </section>
    }

    <div class="pi-dashed-panel max-w-lg p-6 flex flex-col gap-3" data-test="overview-sections">
      <h2 class="font-display text-sm font-semibold m-0">Разделы</h2>
      <div class="flex flex-col gap-1">
        @for (link of sectionLinks; track link.href) {
          <a
            [routerLink]="link.href"
            class="text-sm underline-offset-2 hover:underline w-max"
            [attr.data-test]="'overview-section-' + link.key"
          >
            {{ link.label }}
          </a>
        }
      </div>
      <p class="text-xs text-muted-foreground m-0">
        Комбайн заказов (канбан) — только в разделе «Проект», не на этой странице.
      </p>
    </div>
  `,
})
export class DashboardStatsPage {
  private readonly baseUrl = inject(API_BASE_URL);

  protected readonly listRes = httpResource<Order[]>(() => ({
    url: `${this.baseUrl}/orders`,
  }));

  /** Aggregate warehouse pulse — one call, not unbounded storage/movements lists. */
  protected readonly inventoryRes = httpResource<InventoryPulse>(() => ({
    url: `${this.baseUrl}/inventory`,
  }));

  protected readonly data = computed<Order[]>(() => this.listRes.value() ?? []);

  protected readonly loading = computed(
    () => this.listRes.isLoading() || this.inventoryRes.isLoading(),
  );

  protected readonly error = computed<string | null>(() => {
    const err =
      (this.listRes.error() as import('@angular/common/http').HttpErrorResponse | undefined) ??
      (this.inventoryRes.error() as import('@angular/common/http').HttpErrorResponse | undefined);
    return err ? extractErrorMessage(err) : null;
  });

  /** Те же счётчики, что на Канбане (dashboard.page.ts) — дёшево из GET /orders. */
  protected readonly stats = computed(() => {
    const orders = this.data();
    const now = new Date();
    let newOrders = 0;
    let inProgress = 0;
    let ready = 0;
    let overdue = 0;

    for (const o of orders) {
      if (o.status === 'draft' || o.status === 'confirmed') newOrders++;
      if (o.status === 'in_production') inProgress++;
      if (o.status === 'ready') ready++;

      const deadline = o.plannedDate ? new Date(o.plannedDate) : null;
      if (deadline && deadline < now && !['shipped', 'delivered', 'cancelled'].includes(o.status)) {
        overdue++;
      }
    }

    return { new: newOrders, inProgress, ready, overdue };
  });

  protected readonly warehousePulse = computed(() => {
    const p = this.inventoryRes.value();
    return {
      warehouses: p?.totalWarehouses ?? 0,
      positions: p?.totalActiveItems ?? 0,
      lowStock: p?.lowStockCount ?? 0,
      movements: p?.totalMovementsLast30d ?? 0,
    };
  });

  protected readonly isEmpty = computed(() => {
    if (this.loading() || this.error()) return false;
    const ordersEmpty = this.data().length === 0;
    const wh = this.warehousePulse();
    const warehouseQuiet = wh.warehouses === 0 && wh.positions === 0 && wh.movements === 0;
    return ordersEmpty && warehouseQuiet;
  });

  protected readonly statCards = [
    { key: 'new', label: 'Новые', link: '/orders', destructive: false },
    { key: 'inProgress', label: 'В работе', link: '/orders', destructive: false },
    { key: 'ready', label: 'Готовы', link: '/orders', destructive: false },
    { key: 'overdue', label: 'Просрочены', link: '/orders', destructive: true },
  ] as const;

  protected readonly warehouseCards = [
    { key: 'warehouses', label: 'Складов', link: '/warehouses', destructive: false },
    { key: 'positions', label: 'Позиций', link: '/storage-items', destructive: false },
    { key: 'lowStock', label: 'Мало остатков', link: '/storage-items', destructive: true },
    { key: 'movements', label: 'Движения 30д', link: '/stock-movements', destructive: false },
  ] as const;

  protected readonly sectionLinks = [
    { key: 'orders', label: 'Заказы', href: '/orders' },
    { key: 'combine', label: 'Комбайн заказов', href: '/design/combine' },
    { key: 'proposals', label: 'КП', href: '/proposals' },
    { key: 'storage', label: 'Остатки', href: '/storage-items' },
    { key: 'movements', label: 'Движения', href: '/stock-movements' },
    { key: 'inventory', label: 'Сводка склада', href: '/inventory' },
  ] as const;
}
