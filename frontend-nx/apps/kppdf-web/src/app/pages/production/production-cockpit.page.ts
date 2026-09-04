import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CalendarDays,
  Filter,
  List,
  LucideAngularModule,
  RefreshCw,
} from 'lucide-angular';
import { ShellToolRailService } from '../../layout/shell-tool-rail.service';

/**
 * NX Production Gantt shell — TZ-NX-GANTT-G1-SHELL-ROUTE.
 *
 * Route under the app shell is the only requirement of this stage: the nav chip
 * «Гант» (/production, pageKey `production`) becomes clickable once the route
 * exists (`collectPageRoutePaths` feeds `filterNavCategories`).
 *
 * Chrome tools are registered through `ShellToolRailService` (NX equivalent of
 * legacy `PiChromeToolsService`, same registration pattern as studio-editor):
 * left = Заказы · Фильтры · Обновить, right = Сегодня. Handlers are no-ops
 * until G3/G4 wire the real flyouts/today behaviour, but the buttons render
 * active (not disabled placeholders).
 *
 * Query params `?orderId=` / `?from=desk` are read here per the legacy deep-link
 * contract; the select logic itself lands in G2/G3.
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
      <div
        class="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground"
        data-test="production-placeholder"
      >
        <p class="m-0 font-medium text-ink">Производство · Гант</p>
        <p class="m-0">План-оценка загружается в следующих шагах волны (G2–G6).</p>
        @if (orderId; as id) {
          <p class="m-0" data-test="production-deep-link">Выбран заказ: {{ id }}</p>
        }
      </div>
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
  /** Deep-link contracts (legacy parity): `?orderId=` select, `?from=desk` desk-return. */
  protected readonly orderId: string | null = inject(ActivatedRoute).snapshot.queryParamMap.get('orderId');
  protected readonly fromDesk: boolean = inject(ActivatedRoute).snapshot.queryParamMap.get('from') === 'desk';

  private readonly shellTools = inject(ShellToolRailService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // TZ-NX-GANTT-G1 — real (enabled) tools, handlers wire in G3/G4.
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
          onClick: () => undefined,
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

    // Keep the page's tools only while this page owns the rail.
    this.destroyRef.onDestroy(() => {
      this.shellTools.clear('production');
    });
  }
}