import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { PiPageChromeComponent } from '../../shared/page/pi-page-chrome.component';
import { Order } from '../orders/orders.service';
import { API_BASE_URL } from '../../core/api.tokens';
import { extractErrorMessage } from '../../core/silent-http';

/**
 * TZ-NAV-303 — домашняя статистика (stub «Обзор»), НЕ канбан.
 *
 * Home = сводка по сайту. Полные виджеты (заказы по статусам, материалы/склад,
 * сделки) — TZ-DASHBOARD-401; здесь только дешёвые счётчики из уже доступного
 * GET /orders + быстрые ссылки в разделы. Не расползаться в BI.
 *
 * Комбайн заказов (канбан) живёт на /design/combine (DashboardPage) — раздел Проект.
 */
@Component({
  selector: 'app-dashboard-stats-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PiPageChromeComponent],
  template: `
    <app-pi-page-chrome
      title="Обзор"
      description="Сводка по сайту: движение заказов и быстрые переходы в разделы. Полные виджеты появятся в следующей итерации."
    />

    @if (error()) {
      <div
        class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        data-test="overview-error"
        role="alert"
      >
        {{ error() }}
      </div>
    }

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" data-test="overview-order-counters">
      @for (card of statCards; track card.key) {
        <a
          [routerLink]="card.link"
          class="p-4 rounded-sm border hairline bg-paper flex flex-col gap-1
                 hover:border-ink/30 transition-colors no-underline"
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

    <div class="pi-dashed-panel max-w-lg p-6 flex flex-col gap-3" data-test="overview-sections">
      <h2 class="font-display text-sm font-semibold m-0">Разделы</h2>
      <div class="flex flex-col gap-1">
        @for (link of sectionLinks; track link.href) {
          <a [routerLink]="link.href" class="text-sm underline-offset-2 hover:underline w-max">
            {{ link.label }}
          </a>
        }
      </div>
      <p class="text-xs text-muted-foreground m-0">Комбайн заказов — в разделе «Проект».</p>
    </div>
  `,
})
export class DashboardStatsPage {
  private readonly baseUrl = inject(API_BASE_URL);

  protected readonly listRes = httpResource<Order[]>(() => ({
    url: `${this.baseUrl}/orders`,
  }));

  protected readonly data = computed<Order[]>(() => this.listRes.value() ?? []);
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as
      import('@angular/common/http').HttpErrorResponse | undefined;
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

  protected readonly statCards = [
    { key: 'new', label: 'Новые', link: '/orders', destructive: false },
    { key: 'inProgress', label: 'В работе', link: '/orders', destructive: false },
    { key: 'ready', label: 'Готовы', link: '/orders', destructive: false },
    { key: 'overdue', label: 'Просрочены', link: '/orders', destructive: true },
  ] as const;

  protected readonly sectionLinks = [
    { label: 'Заказы', href: '/orders' },
    { label: 'Комбайн заказов', href: '/design/combine' },
    { label: 'КП', href: '/proposals/create' },
    { label: 'Остатки', href: '/storage-items' },
    { label: 'Движения', href: '/stock-movements' },
  ];
}
