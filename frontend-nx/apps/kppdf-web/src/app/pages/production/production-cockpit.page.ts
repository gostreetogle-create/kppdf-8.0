import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CalendarDays, Filter, List, LucideAngularModule, RefreshCw } from 'lucide-angular';
import { isActiveCommercialOrderStatus } from './gantt-bar.model';
import { ProductionCockpitContext } from './production-cockpit.context';
import { ProductionReadFacade } from './production-read.facade';
import { ShellToolRailService } from '../../layout/shell-tool-rail.service';

/**
 * NX Production Gantt shell — TZ-NX-GANTT-G1/G2.
 *
 * G2 wires the read path: `ProductionReadFacade` (orders → product → modules →
 * work-types → bars) + `ProductionCockpitContext` (UI state). The page shows
 * loading / error / active-order count; tools stay wired to context (Заказы /
 * Фильтры / Обновить / Сегодня) with real behavior landing in G3/G4.
 */
@Component({
  selector: 'pi-production-cockpit-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <main
      class="production-studio-body relative h-full min-h-0 overflow-hidden"
      data-test="production-page"
    >
      @if (facade.state().loading) {
        <div class="p-6 text-sm text-muted-foreground" data-test="production-loading">
          Загрузка заказов…
        </div>
      } @else if (facade.state().error; as error) {
        <div class="p-6 text-sm text-destructive" data-test="production-error">{{ error }}</div>
      } @else {
        <div
          class="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground"
          data-test="production-placeholder"
        >
          <p class="m-0 font-medium text-ink">Производство · Гант</p>
          <p class="m-0" data-test="production-orders-count">
            Активных заказов: {{ activeCount() }}
          </p>
          <p class="m-0">План-оценка появится в следующих шагах волны (G3–G6).</p>
          @if (orderId; as id) {
            <p class="m-0" data-test="production-deep-link">Выбран заказ: {{ id }}</p>
          }
        </div>
      }
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        height: calc(100dvh - var(--header-h, 3.5rem));
        min-height: 0;
      }
      .production-studio-body {
        background: var(--color-paper);
      }
    `,
  ],
})
export class ProductionCockpitPage {
  private readonly route = inject(ActivatedRoute);
  /** Deep-link contracts (legacy parity): `?orderId=` select, `?from=desk` desk-return. */
  protected readonly orderId: string | null = this.route.snapshot.queryParamMap.get('orderId');
  protected readonly fromDesk: boolean =
    this.route.snapshot.queryParamMap.get('from') === 'desk';

  protected readonly facade = inject(ProductionReadFacade);
  protected readonly ctx = inject(ProductionCockpitContext);
  protected readonly activeCount = signal(0);

  private readonly shellTools = inject(ShellToolRailService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.shellTools.setTools('production', {
      left: [
        {
          id: 'orders',
          side: 'left',
          ariaLabel: 'Заказы',
          title: 'Заказы',
          icon: List,
          onClick: () => undefined,
        },
        {
          id: 'filters',
          side: 'left',
          ariaLabel: 'Фильтры',
          title: 'Фильтры',
          icon: Filter,
          onClick: () => undefined,
        },
        {
          id: 'refresh',
          side: 'left',
          ariaLabel: 'Обновить',
          title: 'Обновить',
          icon: RefreshCw,
          onClick: () => void this.reload(),
        },
      ],
      right: [
        {
          id: 'today',
          side: 'right',
          ariaLabel: 'Сегодня',
          title: 'Прокрутить к сегодня',
          icon: CalendarDays,
          onClick: () => undefined,
        },
      ],
    });

    effect(() => {
      const orders = this.facade.state().orders;
      this.activeCount.set(
        orders.filter((o) => isActiveCommercialOrderStatus(o.status ?? 'draft')).length,
      );
    });

    this.destroyRef.onDestroy(() => {
      this.shellTools.clear('production');
    });

    void this.reload();
  }

  private async reload(): Promise<void> {
    const orders = await this.facade.loadOrders();
    await this.facade.loadBarsForOrders(orders);
    if (this.orderId && !this.ctx.selectedOrderId()) {
      this.ctx.selectOrder(this.orderId);
    }
  }
}