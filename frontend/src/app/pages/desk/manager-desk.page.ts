import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BookOpen,
  Factory,
  FileText,
  Filter,
  LayoutGrid,
  Package,
  ShoppingCart,
  Users,
} from 'lucide-angular';
import { PiChromeToolsService } from '../../shared/chrome/pi-chrome-tools.service';
import type { PiChromeToolItem } from '../../shared/chrome/pi-chrome-tools.types';
import {
  PiGroupWorkspaceComponent,
  type GroupChip,
} from '../../shared/page/pi-group-workspace.component';
import { DeskOrderTrayComponent } from './desk-order-tray.component';
import { DESK_WORKFLOW_CHIPS } from './desk-workflow-chips';

type DeskStatus = 'draft' | 'in_production' | 'ready';
type DeskPanelSide = 'left' | 'right';

export type ManagerDeskPanel =
  'create' | 'filter' | 'summary' | 'client' | 'bom' | 'docs' | 'supply';

export interface ManagerDeskOrderFixture {
  readonly id: string;
  readonly number: string;
  readonly status: DeskStatus;
  readonly clientLabel: string;
  readonly composition: readonly [string, string];
}

/** TZ-DESK-405: local fixture rows only; no orders API or HTTP request. */
export const MANAGER_DESK_FIXTURE: readonly ManagerDeskOrderFixture[] = [
  {
    id: 'desk-order-1001',
    number: 'З-1001',
    status: 'draft',
    clientLabel: 'ООО Северный свет',
    composition: ['Стол переговорный — строка состава', 'Опоры металлические — строка состава'],
  },
  {
    id: 'desk-order-1002',
    number: 'З-1002',
    status: 'in_production',
    clientLabel: 'ИП Марина Волкова',
    composition: ['Шкаф архивный — строка состава', 'Фасады окрашенные — строка состава'],
  },
  {
    id: 'desk-order-1003',
    number: 'З-1003',
    status: 'ready',
    clientLabel: 'ООО Белый дуб',
    composition: ['Ресепшен — строка состава', 'Столешница каменная — строка состава'],
  },
] as const;

const STATUS_LABELS: Record<DeskStatus, string> = {
  draft: 'Черновик',
  in_production: 'В производстве',
  ready: 'Готов',
};

const PRIMARY_CTA_LABELS: Record<DeskStatus, string> = {
  draft: 'Подтвердить',
  in_production: 'К отгрузке',
  ready: 'Отгрузить',
};

const PANEL_LABELS: Record<ManagerDeskPanel, string> = {
  create: 'Создать заказ',
  filter: 'Фильтр заказов',
  summary: 'Сводка',
  client: 'Клиент',
  bom: 'Состав',
  docs: 'Документы',
  supply: 'Снабжение',
};

const LEFT_PANELS = new Set<ManagerDeskPanel>(['create', 'filter', 'summary']);
const RIGHT_PANELS = new Set<ManagerDeskPanel>(['client', 'bom', 'docs', 'supply']);
const CHROME_OWNER = 'manager-desk';

type DeskChromeTool = PiChromeToolItem & { disabled?: boolean };

/**
 * Manager desk layout fixture. This wave owns no order API or write path:
 * DESK-402 can replace the create stub with the existing order form later.
 *
 * TZ-DESK-406: one sticky `app-pi-group-workspace` chip row replaces the old
 * `app-pi-page-chrome` + custom `<nav>` double chrome. The expanded order
 * number is a suffix in the workspace tools slot — no «Рабочий стол» label.
 */
@Component({
  selector: 'app-manager-desk-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DeskOrderTrayComponent, PiGroupWorkspaceComponent],
  template: `
    <div class="manager-desk" data-test="manager-desk">
      <app-pi-group-workspace [chips]="workflowChips()" activeId="desk">
        <div tools class="flex items-center gap-2 flex-wrap w-full">
          <span class="text-xs text-muted-foreground" data-test="desk-order-count">
            {{ fixtureOrders.length }} заказа
          </span>
          @if (expandedOrder(); as order) {
            <span class="text-muted-foreground" aria-hidden="true">/</span>
            <span
              class="font-display text-base tracking-tight text-ink truncate max-w-[min(40rem,70vw)]"
              aria-current="page"
              data-test="desk-order-crumb"
            >
              {{ order.number }}
            </span>
          }
        </div>

        <main class="manager-desk__center" aria-labelledby="desk-queue-heading">
          <section class="manager-desk__queue" data-test="desk-order-queue">
            <h1 id="desk-queue-heading" class="sr-only">Очередь заказов</h1>

            <div class="manager-desk__orders" role="list" aria-label="Заказы на столе">
              @for (order of fixtureOrders; track order.id) {
                <div class="manager-desk__order-item" role="listitem">
                  <button
                    type="button"
                    class="manager-desk__order-row"
                    [class.manager-desk__order-row--expanded]="expandedId() === order.id"
                    [attr.aria-expanded]="expandedId() === order.id"
                    [attr.aria-controls]="'desk-order-tray-' + order.id"
                    [attr.data-status]="order.status"
                    data-test="desk-order-row"
                    (click)="toggleOrder(order.id)"
                  >
                    <span class="manager-desk__order-disclosure" aria-hidden="true">
                      {{ expandedId() === order.id ? '▾' : '▸' }}
                    </span>
                    <span class="manager-desk__order-number">{{ order.number }}</span>
                    <span class="manager-desk__client">{{ order.clientLabel }}</span>
                    <span class="manager-desk__status">{{ statusLabel(order.status) }}</span>
                  </button>

                  @if (expandedId() === order.id) {
                    <app-desk-order-tray [order]="order" />
                  }
                </div>
              }
            </div>
          </section>
        </main>
      </app-pi-group-workspace>

      @if (panel()) {
        <button
          type="button"
          class="manager-desk__backdrop"
          data-test="desk-flyout-backdrop"
          aria-label="Закрыть панель"
          (click)="closePanel()"
        ></button>
        <aside
          class="manager-desk__flyout"
          [class.manager-desk__flyout--left]="panelSide() === 'left'"
          [class.manager-desk__flyout--right]="panelSide() === 'right'"
          [attr.id]="'desk-flyout-' + panel()"
          data-test="desk-flyout"
          [attr.data-panel]="panel()"
          [attr.data-side]="panelSide()"
          [attr.aria-label]="panelTitle()"
          aria-modal="true"
          role="dialog"
        >
          <div class="manager-desk__flyout-heading">
            <div>
              <p class="manager-desk__eyebrow">Панель стола</p>
              <h2>{{ panelTitle() }}</h2>
            </div>
            <button
              type="button"
              class="manager-desk__close"
              data-test="desk-flyout-close"
              aria-label="Закрыть"
              title="Закрыть"
              (click)="closePanel()"
            >
              Закрыть
            </button>
          </div>
          <p class="manager-desk__flyout-copy">Здесь будет форма (после одобрения раскладки)</p>
          <p class="manager-desk__flyout-note">
            В 405 это только fixture-точка входа: данные и запись появятся в следующей волне.
          </p>
        </aside>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100%;
        color: var(--color-ink);
      }
      .manager-desk {
        position: relative;
        min-height: calc(100dvh - 3.5rem);
      }
      .manager-desk__center {
        min-width: 0;
      }
      .manager-desk__queue {
        border: 1px solid var(--color-rule);
        background: var(--color-paper-raised, var(--color-paper));
      }
      .manager-desk__orders {
        display: flex;
        max-height: min(60vh, calc(100dvh - 8rem));
        flex-direction: column;
        gap: 0.45rem;
        overflow-y: auto;
        padding: 1rem;
      }
      .manager-desk__order-item {
        min-width: 0;
      }
      .manager-desk__order-row {
        display: grid;
        grid-template-columns: auto minmax(5rem, 0.25fr) minmax(0, 1fr) auto;
        align-items: center;
        gap: 0.7rem;
        width: 100%;
        min-height: 3.25rem;
        padding: 0.65rem 0.8rem;
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        background: var(--color-paper);
        color: inherit;
        cursor: pointer;
        text-align: left;
        transition:
          border-color 120ms ease,
          background-color 120ms ease;
      }
      .manager-desk__order-row:hover,
      .manager-desk__order-row--expanded {
        border-color: var(--color-sunrise-warm, #c79542);
        background: var(--color-sunrise-soft, #fff6df);
      }
      .manager-desk__order-row--expanded {
        border-bottom-color: transparent;
      }
      .manager-desk__order-disclosure {
        display: inline-flex;
        width: 1.2rem;
        align-items: center;
        justify-content: center;
        color: var(--color-sunrise-warm, #9b6b1e);
        font-size: 0.9rem;
      }
      .manager-desk__order-number {
        font-family: var(--font-display, inherit);
        font-weight: 700;
      }
      .manager-desk__client {
        min-width: 0;
        overflow: hidden;
        color: var(--color-muted-foreground);
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .manager-desk__status {
        color: var(--color-sunrise-warm, #9b6b1e);
        font-size: 0.78rem;
        white-space: nowrap;
      }
      .manager-desk__flyout-heading {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 1rem;
      }
      .manager-desk__flyout h2 {
        margin: 0;
        font-family: var(--font-display, inherit);
        font-size: 1.2rem;
        font-weight: 650;
        letter-spacing: -0.025em;
      }
      .manager-desk__flyout-note {
        margin: 0;
        color: var(--color-muted-foreground);
        font-size: 0.78rem;
      }
      .manager-desk__eyebrow {
        margin: 0 0 0.3rem;
        color: var(--color-muted-foreground);
        font-size: 0.68rem;
        letter-spacing: 0.08em;
        line-height: 1.1;
        text-transform: uppercase;
      }
      .manager-desk__backdrop {
        position: fixed;
        inset: 0 0 0 3.5rem;
        z-index: 40;
        border: 0;
        padding: 0;
        background: oklch(0.22 0.02 260 / 0.18);
        cursor: default;
      }
      .manager-desk__flyout {
        position: fixed;
        top: 3.5rem;
        bottom: 0;
        z-index: 50;
        display: flex;
        width: min(25rem, calc(100vw - 4.5rem));
        flex-direction: column;
        gap: 1.25rem;
        overflow: auto;
        padding: 1.25rem;
        border: 1px solid var(--color-rule-strong);
        background: var(--color-paper-raised, var(--color-paper));
      }
      .manager-desk__flyout--right {
        right: 0;
        border-right: 0;
      }
      .manager-desk__flyout--left {
        left: 4rem;
        border-left: 0;
      }
      .manager-desk__close {
        min-height: 2.25rem;
        padding: 0.45rem 0.8rem;
        border: 1px solid var(--color-rule-strong);
        border-radius: 2px;
        background: transparent;
        color: var(--color-ink);
        font: inherit;
        font-size: 0.82rem;
        cursor: pointer;
        white-space: nowrap;
      }
      .manager-desk__close:hover {
        background: var(--color-paper-2, #f2f0ea);
      }
      .manager-desk__flyout-copy {
        margin: 0;
        padding: 1rem;
        border: 1px dashed var(--color-rule-strong);
        color: var(--color-muted-foreground);
        font-size: 0.9rem;
        line-height: 1.5;
      }
      @media (max-width: 900px) {
        .manager-desk__order-row {
          grid-template-columns: auto minmax(4.5rem, auto) minmax(0, 1fr);
        }
        .manager-desk__status {
          grid-column: 3;
        }
        .manager-desk__flyout {
          width: min(25rem, calc(100vw - 1rem));
        }
        .manager-desk__flyout--left {
          left: 0.5rem;
        }
      }
    `,
  ],
})
export class ManagerDeskPage {
  protected readonly fixtureOrders = MANAGER_DESK_FIXTURE;
  protected readonly expandedId = signal<string | null>(null);
  /** Compatibility alias for the 401 harness; 405 semantics are expanded-row semantics. */
  protected readonly selectedId = this.expandedId;
  protected readonly panel = signal<ManagerDeskPanel | null>(null);
  protected readonly expandedOrder = computed(
    () => this.fixtureOrders.find((order) => order.id === this.expandedId()) ?? null,
  );
  protected readonly selectedOrder = this.expandedOrder;
  /**
   * Daily workflow chips. The combine studio keeps its orderId query when a
   * row is expanded (same deep-link contract as DESK-405); everything else is
   * the static constant from `desk-workflow-chips.ts`.
   */
  protected readonly workflowChips = computed<readonly GroupChip[]>(() => {
    const order = this.expandedOrder();
    if (!order) return DESK_WORKFLOW_CHIPS;
    return DESK_WORKFLOW_CHIPS.map((chip) =>
      chip.id === 'combine' ? { ...chip, queryParams: { orderId: order.id } } : chip,
    );
  });
  protected readonly panelSide = computed<DeskPanelSide | null>(() => {
    const panel = this.panel();
    if (!panel) return null;
    return LEFT_PANELS.has(panel) ? 'left' : 'right';
  });

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly chromeTools = inject(PiChromeToolsService);

  constructor() {
    // Query params are the only state source needed for a harmless F5 restore.
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.applyQueryState(params.get('orderId'), params.get('panel'));
    });
    effect(() => {
      this.expandedOrder();
      this.panel();
      // Keep registry writes outside the effect's dependencies.
      untracked(() => this.syncChromeTools());
    });
  }

  // Page-owned registry cleanup for app chrome rails.
  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy(): void {
    this.chromeTools.clear(CHROME_OWNER);
  }

  protected statusLabel(status: DeskStatus): string {
    return STATUS_LABELS[status];
  }

  protected primaryCta(status: DeskStatus): string {
    return PRIMARY_CTA_LABELS[status];
  }

  protected panelTitle(): string {
    const panel = this.panel();
    return panel ? PANEL_LABELS[panel] : '';
  }

  protected toggleOrder(id: string): void {
    if (!this.fixtureOrders.some((order) => order.id === id)) return;
    const nextId = this.expandedId() === id ? null : id;
    this.expandedId.set(nextId);
    this.panel.set(null);
    this.navigateQuery(nextId, null);
  }

  /** Compatibility handler for callers from the 401 fixture harness. */
  protected selectOrder(id: string): void {
    this.toggleOrder(id);
  }

  /** Shared handler for left-rail tools and any future empty-state CTA. */
  protected openPanel(panel: ManagerDeskPanel): void {
    if (!this.canOpenPanel(panel)) return;
    this.panel.set(panel);
    this.navigateQuery(this.expandedId(), panel);
  }

  protected closePanel(): void {
    this.panel.set(null);
    this.navigateQuery(this.expandedId(), null);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    // Escape closes a flyout, never the expanded row.
    if (this.panel()) this.closePanel();
  }

  private applyQueryState(rawOrderId: string | null, rawPanel: string | null): void {
    const orderId = this.fixtureOrders.some((order) => order.id === rawOrderId) ? rawOrderId : null;
    this.expandedId.set(orderId);

    const panel = this.isPanel(rawPanel) ? rawPanel : null;
    this.panel.set(panel && this.canOpenPanel(panel) ? panel : null);
  }

  private canOpenPanel(panel: ManagerDeskPanel): boolean {
    if (LEFT_PANELS.has(panel)) return true;
    const order = this.expandedOrder();
    if (!order || !RIGHT_PANELS.has(panel)) return false;
    return panel !== 'supply' || order.status === 'in_production' || order.status === 'ready';
  }

  private isPanel(value: string | null): value is ManagerDeskPanel {
    return value !== null && Object.prototype.hasOwnProperty.call(PANEL_LABELS, value);
  }

  private navigateQuery(orderId: string | null, panel: ManagerDeskPanel | null): void {
    void Promise.resolve(
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { orderId: orderId ?? null, panel: panel ?? null },
        queryParamsHandling: 'merge',
      }),
    ).catch(() => undefined);
  }

  private syncChromeTools(): void {
    const expanded = this.expandedOrder();
    const open = this.panel();
    const left: DeskChromeTool[] = [
      {
        id: 'create',
        side: 'left',
        ariaLabel: 'Создать заказ',
        title: 'Создать заказ',
        icon: Package,
        active: open === 'create',
        ariaExpanded: open === 'create',
        ariaControls: 'desk-flyout-create',
        order: 1,
        onClick: () => this.openPanel('create'),
      },
      {
        id: 'filter',
        side: 'left',
        ariaLabel: 'Фильтр',
        title: 'Фильтр',
        icon: Filter,
        active: open === 'filter',
        ariaExpanded: open === 'filter',
        ariaControls: 'desk-flyout-filter',
        order: 2,
        onClick: () => this.openPanel('filter'),
      },
      {
        id: 'summary',
        side: 'left',
        ariaLabel: 'Сводка',
        title: 'Сводка',
        icon: BookOpen,
        active: open === 'summary',
        ariaExpanded: open === 'summary',
        ariaControls: 'desk-flyout-summary',
        order: 3,
        onClick: () => this.openPanel('summary'),
      },
    ];

    const right: DeskChromeTool[] = expanded
      ? [
          this.actionTool('client', 'Клиент', Users, open === 'client', 1),
          this.actionTool('bom', 'Состав', Package, open === 'bom', 2),
          this.actionTool('docs', 'Документы', FileText, open === 'docs', 3),
          ...(expanded.status === 'in_production' || expanded.status === 'ready'
            ? [this.actionTool('supply', 'Снабжение', ShoppingCart, open === 'supply', 4)]
            : []),
          this.actionTool('gantt', 'На Ганте', Factory, false, 5, true),
          this.actionTool('combine', 'В комбайне', LayoutGrid, false, 6, true),
        ]
      : [];

    this.chromeTools.setTools(CHROME_OWNER, [...left, ...right]);
  }

  private actionTool(
    id: string,
    label: string,
    icon: PiChromeToolItem['icon'],
    active: boolean,
    order: number,
    disabled = false,
  ): DeskChromeTool {
    const disabledTitle = `${label} — подключится в DESK-404`;
    return {
      id,
      side: 'right',
      ariaLabel: label,
      title: disabled ? disabledTitle : label,
      icon,
      active,
      disabled,
      ariaExpanded: !disabled && active,
      ariaControls: `desk-flyout-${id}`,
      order,
      onClick: disabled ? () => undefined : () => this.openPanel(id as ManagerDeskPanel),
    };
  }
}
