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
import { httpResource } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BookOpen,
  Factory,
  FileText,
  Filter,
  LayoutGrid,
  Package,
  Pencil,
  ShoppingCart,
  Users,
} from 'lucide-angular';
import { PiChromeToolsService } from '../../shared/chrome/pi-chrome-tools.service';
import type { PiChromeToolItem } from '../../shared/chrome/pi-chrome-tools.types';
import {
  PiGroupWorkspaceComponent,
  type GroupChip,
} from '../../shared/page/pi-group-workspace.component';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { pluralize } from '../../shared/util/format';
import { createLookupTable } from '../../shared/util/lookup-table';
import { Counterparty, CounterpartyService } from '../../shared/services/pi-counterparty.service';
import { Order, OrderStatus } from '../orders/orders.service';
import { OrderFormPanelComponent } from '../orders/order-form-panel.component';
import { DeskOrderTrayComponent } from './desk-order-tray.component';
import { DESK_WORKFLOW_CHIPS } from './desk-workflow-chips';

type DeskPanelSide = 'left' | 'right';

export type ManagerDeskPanel =
  'create' | 'edit' | 'filter' | 'summary' | 'client' | 'bom' | 'docs' | 'supply';

const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Черновик',
  confirmed: 'Подтверждён',
  in_production: 'В производстве',
  ready: 'Готов',
  shipped: 'Отгружен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

const PANEL_LABELS: Record<ManagerDeskPanel, string> = {
  create: 'Создать заказ',
  edit: 'Редактировать заказ',
  filter: 'Фильтр заказов',
  summary: 'Сводка',
  client: 'Клиент',
  bom: 'Состав',
  docs: 'Документы',
  supply: 'Снабжение',
};

const LEFT_PANELS = new Set<ManagerDeskPanel>(['create', 'filter', 'summary']);
const RIGHT_PANELS = new Set<ManagerDeskPanel>(['edit', 'client', 'bom', 'docs', 'supply']);
const CHROME_OWNER = 'manager-desk';

type DeskChromeTool = PiChromeToolItem & { disabled?: boolean };

/**
 * Manager desk — live order queue (TZ-DESK-402).
 *
 * The queue reads `GET /orders` (flat array, same source as `/orders`). Create
 * and edit reuse `OrderFormPanelComponent` + `OrdersService` — one write-path.
 * Invalid `?orderId=` shows a RU toast, clears the query, and never crashes.
 */
@Component({
  selector: 'app-manager-desk-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DeskOrderTrayComponent, OrderFormPanelComponent, PiGroupWorkspaceComponent],
  template: `
    <div class="manager-desk" data-test="manager-desk">
      <app-pi-group-workspace [chips]="workflowChips()" activeId="desk">
        <div tools class="flex items-center gap-2 flex-wrap w-full">
          <span class="text-xs text-muted-foreground" data-test="desk-order-count">
            {{ orders().length }} {{ totalLabel(orders().length) }}
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

            @if (listError()) {
              <p role="alert" class="manager-desk__queue-error" data-test="desk-queue-error">
                {{ listError() }}
              </p>
            }

            <div class="manager-desk__orders" role="list" aria-label="Заказы на столе">
              @if (loading() && orders().length === 0) {
                <p class="manager-desk__empty">Загрузка заказов…</p>
              } @else if (orders().length === 0) {
                <p class="manager-desk__empty" data-test="desk-queue-empty">Нет заказов.</p>
              }
              @for (order of orders(); track order._id) {
                <div
                  class="manager-desk__order-item"
                  role="listitem"
                  [attr.id]="'desk-order-' + order._id"
                >
                  <button
                    type="button"
                    class="manager-desk__order-row"
                    [class.manager-desk__order-row--expanded]="expandedId() === order._id"
                    [attr.aria-expanded]="expandedId() === order._id"
                    [attr.aria-controls]="'desk-order-tray-' + order._id"
                    [attr.data-status]="order.status"
                    data-test="desk-order-row"
                    (click)="toggleOrder(order._id)"
                  >
                    <span class="manager-desk__order-disclosure" aria-hidden="true">
                      {{ expandedId() === order._id ? '▾' : '▸' }}
                    </span>
                    <span class="manager-desk__order-number">{{ order.number }}</span>
                    <span class="manager-desk__client">{{ clientLabel(order) }}</span>
                    <span class="manager-desk__status">{{ statusLabel(order.status) }}</span>
                  </button>

                  @if (expandedId() === order._id) {
                    <app-desk-order-tray [order]="order" [clientLabel]="clientLabel(order)" />
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
          [class.manager-desk__flyout--wide]="panel() === 'create' || panel() === 'edit'"
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

          @if (panel() === 'create') {
            <app-order-form-panel (saved)="onOrderSaved($event)" (cancelled)="closePanel()" />
          } @else if (panel() === 'edit') {
            <app-order-form-panel
              [order]="expandedOrder()"
              (saved)="onOrderSaved($event)"
              (cancelled)="closePanel()"
            />
          } @else {
            <p class="manager-desk__flyout-copy">Здесь будет панель (в следующей волне)</p>
            <p class="manager-desk__flyout-note">
              Каркас готов; данные и действия подключаются дальше.
            </p>
          }
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
      .manager-desk__queue-error {
        margin: 0;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--color-rule);
        background: var(--color-destructive-soft, oklch(0.93 0.04 25));
        color: var(--color-destructive);
        font-size: 0.82rem;
      }
      .manager-desk__orders {
        display: flex;
        max-height: min(60vh, calc(100dvh - 8rem));
        flex-direction: column;
        gap: 0.45rem;
        overflow-y: auto;
        padding: 1rem;
      }
      .manager-desk__empty {
        margin: 0;
        padding: 0.75rem 0;
        color: var(--color-muted-foreground);
        font-size: 0.85rem;
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
      .manager-desk__flyout--wide {
        width: min(48rem, calc(100vw - 4.5rem));
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
        .manager-desk__flyout--wide {
          width: min(46rem, calc(100vw - 1rem));
        }
        .manager-desk__flyout--left {
          left: 0.5rem;
        }
      }
    `,
  ],
})
export class ManagerDeskPage {
  protected readonly expandedId = signal<string | null>(null);
  protected readonly panel = signal<ManagerDeskPanel | null>(null);

  protected readonly listRes = httpResource<Order[]>(() => ({ url: `${this.baseUrl}/orders` }));
  protected readonly orders = computed<Order[]>(() => this.listRes.value() ?? []);
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly listError = computed<string | null>(() => {
    const err = this.listRes.error() as
      import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly expandedOrder = computed(
    () => this.orders().find((order) => order._id === this.expandedId()) ?? null,
  );

  /**
   * Daily workflow chips. The combine studio keeps its orderId query when a
   * row is expanded; everything else is the static constant.
   */
  protected readonly workflowChips = computed<readonly GroupChip[]>(() => {
    const order = this.expandedOrder();
    if (!order) return DESK_WORKFLOW_CHIPS;
    return DESK_WORKFLOW_CHIPS.map((chip) =>
      chip.id === 'combine' ? { ...chip, queryParams: { orderId: order._id } } : chip,
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
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly chromeTools = inject(PiChromeToolsService);
  private readonly toast = inject(PiToastService);
  private readonly counterpartyService = inject(CounterpartyService);
  private readonly counterpartiesLookup = createLookupTable<Counterparty>(
    this.counterpartyService.list({ limit: 200 }),
  );

  private readonly rawOrderId = signal<string | null>(null);
  private readonly rawPanel = signal<string | null>(null);
  private readonly pendingScrollId = signal<string | null>(null);

  constructor() {
    this.counterpartiesLookup.load();

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.rawOrderId.set(params.get('orderId'));
      this.rawPanel.set(params.get('panel'));
      this.reconcile();
    });

    // When orders finish loading, reconcile the pending query state.
    effect(() => {
      this.orders();
      untracked(() => this.reconcile());
    });

    // Scroll the freshly created/expanded row into view once the list has it.
    effect(() => {
      const id = this.pendingScrollId();
      const orders = this.orders();
      if (id && orders.some((order) => order._id === id)) {
        untracked(() => {
          this.pendingScrollId.set(null);
          this.scrollToOrder(id);
        });
      }
    });

    effect(() => {
      this.expandedOrder();
      this.panel();
      untracked(() => this.syncChromeTools());
    });
  }

  // Page-owned registry cleanup for app chrome rails.
  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy(): void {
    this.chromeTools.clear(CHROME_OWNER);
  }

  protected statusLabel(status: OrderStatus): string {
    return STATUS_LABELS[status];
  }

  protected totalLabel(n: number): string {
    return pluralize(n, ['заказ', 'заказа', 'заказов']);
  }

  protected clientLabel(order: Order): string {
    const value = order.counterpartyId;
    if (value && typeof value !== 'string' && value.name) {
      return value.name.trim() || '—';
    }
    const id = this.counterpartyIdOf(order);
    if (!id) return '—';
    const cp = this.counterpartiesLookup.byId()[id];
    return cp?.shortName ?? cp?.name ?? '—';
  }

  protected panelTitle(): string {
    const panel = this.panel();
    return panel ? PANEL_LABELS[panel] : '';
  }

  protected toggleOrder(id: string): void {
    if (!this.orders().some((order) => order._id === id)) return;
    const nextId = this.expandedId() === id ? null : id;
    this.expandedId.set(nextId);
    this.panel.set(null);
    this.navigateQuery(nextId, null);
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

  protected onOrderSaved(order: Order): void {
    this.panel.set(null);
    this.expandedId.set(order._id);
    this.pendingScrollId.set(order._id);
    this.navigateQuery(order._id, null);
    this.listRes.reload();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    // Escape closes a flyout, never the expanded row.
    if (this.panel()) this.closePanel();
  }

  private reconcile(): void {
    const orders = this.orders();
    const rawId = this.rawOrderId();
    const rawPanel = this.rawPanel();

    // While loading/reloading, keep the requested expansion and defer
    // validation — a freshly created order may not be in the list yet.
    if (this.loading()) {
      if (rawId) this.expandedId.set(rawId);
      return;
    }

    const validId = rawId && orders.some((order) => order._id === rawId) ? rawId : null;
    if (rawId && !validId) {
      this.toast.error('Заказ не найден');
      this.expandedId.set(null);
      this.panel.set(null);
      this.clearOrderIdQuery();
      return;
    }

    this.expandedId.set(validId);
    const panel = this.isPanel(rawPanel) ? rawPanel : null;
    this.panel.set(panel && this.canOpenPanel(panel) ? panel : null);
  }

  private clearOrderIdQuery(): void {
    void Promise.resolve(
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { orderId: null, panel: null },
        queryParamsHandling: 'merge',
      }),
    ).catch(() => undefined);
  }

  private canOpenPanel(panel: ManagerDeskPanel): boolean {
    if (LEFT_PANELS.has(panel)) return true;
    const order = this.expandedOrder();
    if (!order || !RIGHT_PANELS.has(panel)) return false;
    if (panel === 'supply') {
      return order.status === 'in_production' || order.status === 'ready';
    }
    return true;
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

  private counterpartyIdOf(order: Order): string {
    const value = order.counterpartyId;
    if (!value) return '';
    return typeof value === 'string' ? value : (value._id ?? '');
  }

  private scrollToOrder(id: string): void {
    const el = document.getElementById(`desk-order-${id}`);
    if (!el || typeof el.scrollIntoView !== 'function') return;
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
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
          this.actionTool('edit', 'Редактировать', Pencil, open === 'edit', 1),
          this.actionTool('client', 'Клиент', Users, open === 'client', 2),
          this.actionTool('bom', 'Состав', Package, open === 'bom', 3),
          this.actionTool('docs', 'Документы', FileText, open === 'docs', 4),
          ...(expanded.status === 'in_production' || expanded.status === 'ready'
            ? [this.actionTool('supply', 'Снабжение', ShoppingCart, open === 'supply', 5)]
            : []),
          this.actionTool('gantt', 'На Ганте', Factory, false, 6, true),
          this.actionTool('combine', 'В комбайне', LayoutGrid, false, 7, true),
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
