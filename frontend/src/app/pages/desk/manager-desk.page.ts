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
  LucideAngularModule,
  Package,
  ShoppingCart,
  Users,
} from 'lucide-angular';
import { PiChromeToolsService } from '../../shared/chrome/pi-chrome-tools.service';
import type { PiChromeToolItem } from '../../shared/chrome/pi-chrome-tools.types';

type DeskStatus = 'draft' | 'in_production' | 'ready';

export type ManagerDeskPanel =
  'create' | 'filter' | 'summary' | 'client' | 'bom' | 'docs' | 'supply';

export interface ManagerDeskOrderFixture {
  readonly id: string;
  readonly number: string;
  readonly status: DeskStatus;
  readonly clientLabel: string;
  readonly composition: readonly [string, string];
}

/** TZ-DESK-401: exactly three local rows; no orders API or HTTP request. */
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
 * TZ-DESK-401 — clickable manager-desk layout only.
 *
 * This wave deliberately owns no order API or write path. DESK-402 can replace
 * the create panel with the existing order form after the PO approves the
 * spatial rhythm.
 */
@Component({
  selector: 'app-manager-desk-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <div class="manager-desk" data-test="manager-desk">
      <header class="manager-desk__header">
        <div>
          <p class="manager-desk__eyebrow">Ежедневная тетрадь менеджера</p>
          <h1 class="manager-desk__title">Рабочий стол</h1>
        </div>
        <p class="manager-desk__hint">Очередь заказов · fixture для проверки раскладки</p>
      </header>

      <div class="manager-desk__workspace">
        <main class="manager-desk__center" aria-labelledby="desk-queue-heading">
          <section class="manager-desk__queue" data-test="desk-order-queue">
            <div class="manager-desk__section-heading">
              <div>
                <p class="manager-desk__eyebrow">Центр работы</p>
                <h2 id="desk-queue-heading">Очередь заказов</h2>
              </div>
              <span class="manager-desk__count">{{ fixtureOrders.length }} заказа</span>
            </div>

            <div class="manager-desk__orders" role="list" aria-label="Заказы на столе">
              @for (order of fixtureOrders; track order.id) {
                <button
                  type="button"
                  class="manager-desk__order-row"
                  [class.manager-desk__order-row--selected]="selectedId() === order.id"
                  [attr.aria-pressed]="selectedId() === order.id"
                  [attr.data-status]="order.status"
                  data-test="desk-order-row"
                  (click)="selectOrder(order.id)"
                >
                  <span class="manager-desk__order-number">{{ order.number }}</span>
                  <span class="manager-desk__client">{{ order.clientLabel }}</span>
                  <span class="manager-desk__status">{{ statusLabel(order.status) }}</span>
                </button>
              }
            </div>
          </section>

          @if (selectedOrder(); as order) {
            <section
              class="manager-desk__innards"
              data-test="desk-center-innards"
              [attr.data-status]="order.status"
              aria-labelledby="desk-innards-heading"
            >
              <div class="manager-desk__innards-heading">
                <div>
                  <p class="manager-desk__eyebrow">Выбранный заказ</p>
                  <h2 id="desk-innards-heading">{{ order.number }}</h2>
                  <p class="manager-desk__client manager-desk__client--large">
                    {{ order.clientLabel }}
                  </p>
                </div>
                <span class="manager-desk__status manager-desk__status--large">
                  {{ statusLabel(order.status) }}
                </span>
              </div>

              <div class="manager-desk__composition" aria-label="Состав заказа">
                <p class="manager-desk__eyebrow">Состав</p>
                @for (line of order.composition; track $index) {
                  <div class="manager-desk__composition-row" data-test="desk-composition-row">
                    <span class="manager-desk__composition-mark" aria-hidden="true"></span>
                    <span>{{ line }}</span>
                  </div>
                }
              </div>

              <div class="manager-desk__primary-action">
                <button
                  type="button"
                  class="manager-desk__cta"
                  disabled
                  data-test="desk-primary-cta"
                  [attr.aria-label]="
                    primaryCta(order.status) + ' — действие появится после DESK-402'
                  "
                  title="Действие появится после DESK-402"
                >
                  {{ primaryCta(order.status) }}
                </button>
                <span class="manager-desk__disabled-note"
                  >Действия подключатся после одобрения каркаса.</span
                >
              </div>
            </section>
          } @else {
            <section class="manager-desk__empty" data-test="desk-empty-state" role="status">
              <p class="manager-desk__eyebrow">Нет выбранного заказа</p>
              <h2>Выберите строку в очереди</h2>
              <p>Или откройте форму создания — она выедет справа, не сдвигая центр.</p>
              <button
                type="button"
                class="manager-desk__cta manager-desk__cta--empty"
                data-test="desk-empty-create"
                (click)="openPanel('create')"
              >
                Создать заказ
              </button>
            </section>
          }

          @if (selectedOrder()) {
            <span class="manager-desk__right-tools-marker" data-test="desk-right-tools">
              Действия выбранного заказа
            </span>
          }
        </main>
      </div>

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
          [attr.id]="'desk-flyout-' + panel()"
          data-test="desk-flyout"
          [attr.data-panel]="panel()"
          [attr.aria-label]="panelTitle()"
          aria-modal="true"
          role="dialog"
        >
          <div class="manager-desk__flyout-heading">
            <div>
              <p class="manager-desk__eyebrow">Панель стола</p>
              <h1>{{ panelTitle() }}</h1>
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
            В 401 это только точка входа: данные и запись появятся в следующей волне.
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
        padding: 1.25rem clamp(1rem, 3vw, 3rem) 2rem;
        background: var(--color-paper);
      }
      .manager-desk__header,
      .manager-desk__section-heading,
      .manager-desk__innards-heading,
      .manager-desk__flyout-heading {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
      }
      .manager-desk__header {
        max-width: 96rem;
        margin: 0 auto 1.25rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--color-rule-strong);
      }
      .manager-desk__eyebrow {
        margin: 0 0 0.3rem;
        color: var(--color-muted-foreground);
        font-size: 0.68rem;
        letter-spacing: 0.08em;
        line-height: 1.1;
        text-transform: uppercase;
      }
      .manager-desk__title,
      .manager-desk h2,
      .manager-desk__flyout h1 {
        margin: 0;
        font-family: var(--font-display, inherit);
        font-weight: 650;
        letter-spacing: -0.025em;
      }
      .manager-desk__title {
        font-size: clamp(1.35rem, 2vw, 1.8rem);
      }
      .manager-desk h2 {
        font-size: 1.05rem;
      }
      .manager-desk__hint,
      .manager-desk__count,
      .manager-desk__disabled-note,
      .manager-desk__flyout-note {
        margin: 0;
        color: var(--color-muted-foreground);
        font-size: 0.78rem;
      }
      .manager-desk__workspace {
        max-width: 96rem;
        margin: 0 auto;
      }
      .manager-desk__center {
        display: flex;
        min-width: 0;
        flex-direction: column;
        gap: 1rem;
      }
      .manager-desk__queue,
      .manager-desk__innards,
      .manager-desk__empty {
        border: 1px solid var(--color-rule);
        background: var(--color-paper-raised, var(--color-paper));
      }
      .manager-desk__queue {
        padding: 1rem;
      }
      .manager-desk__section-heading {
        align-items: baseline;
        margin-bottom: 0.75rem;
      }
      .manager-desk__orders {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
      }
      .manager-desk__order-row {
        display: grid;
        grid-template-columns: minmax(5rem, 0.25fr) minmax(0, 1fr) auto;
        align-items: center;
        gap: 0.8rem;
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
      .manager-desk__order-row--selected {
        border-color: var(--color-sunrise-warm, #c79542);
        background: var(--color-sunrise-soft, #fff6df);
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
      .manager-desk__innards,
      .manager-desk__empty {
        padding: 1.25rem;
      }
      .manager-desk__client--large {
        margin: 0.35rem 0 0;
      }
      .manager-desk__status--large {
        padding: 0.35rem 0.55rem;
        border: 1px solid var(--color-rule);
        background: var(--color-sunrise-soft, #fff6df);
      }
      .manager-desk__composition {
        margin-top: 1.4rem;
        padding: 0.8rem;
        border: 1px solid var(--color-rule);
        background: var(--color-paper);
      }
      .manager-desk__composition-row {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        min-height: 2.25rem;
        border-top: 1px solid var(--color-rule);
        font-size: 0.88rem;
      }
      .manager-desk__composition-mark {
        width: 0.45rem;
        height: 0.45rem;
        flex: 0 0 auto;
        background: var(--color-sunrise-warm, #c79542);
      }
      .manager-desk__primary-action {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        margin-top: 1.25rem;
        flex-wrap: wrap;
      }
      .manager-desk__cta,
      .manager-desk__close {
        min-height: 2.25rem;
        padding: 0.45rem 0.8rem;
        border: 1px solid var(--color-rule-strong);
        border-radius: 2px;
        background: var(--color-ink);
        color: var(--color-paper);
        font: inherit;
        font-size: 0.82rem;
        cursor: pointer;
      }
      .manager-desk__cta:disabled {
        cursor: not-allowed;
        opacity: 0.48;
      }
      .manager-desk__cta--empty {
        background: var(--color-sunrise-warm, #c79542);
        color: var(--color-ink);
      }
      .manager-desk__empty {
        display: flex;
        min-height: 12rem;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 0.5rem;
      }
      .manager-desk__empty p:not(.manager-desk__eyebrow) {
        max-width: 34rem;
        margin: 0 0 0.5rem;
        color: var(--color-muted-foreground);
        font-size: 0.88rem;
      }
      .manager-desk__right-tools-marker {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
      }
      .manager-desk__backdrop {
        position: fixed;
        inset: 0;
        z-index: 40;
        border: 0;
        padding: 0;
        background: oklch(0.22 0.02 260 / 0.18);
        cursor: default;
      }
      .manager-desk__flyout {
        position: fixed;
        top: 3.5rem;
        right: 0;
        bottom: 0;
        z-index: 50;
        display: flex;
        width: min(25rem, calc(100vw - 1rem));
        flex-direction: column;
        gap: 1.25rem;
        overflow: auto;
        padding: 1.25rem;
        border-left: 1px solid var(--color-rule-strong);
        background: var(--color-paper-raised, var(--color-paper));
        box-shadow: -0.5rem 0 2rem oklch(0.2 0.02 260 / 0.12);
      }
      .manager-desk__flyout h1 {
        font-size: 1.2rem;
      }
      .manager-desk__close {
        background: transparent;
        color: var(--color-ink);
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
      @media (max-width: 640px) {
        .manager-desk {
          padding-inline: 0.75rem;
        }
        .manager-desk__header,
        .manager-desk__innards-heading {
          flex-direction: column;
        }
        .manager-desk__order-row {
          grid-template-columns: minmax(4.5rem, auto) minmax(0, 1fr);
        }
        .manager-desk__status {
          grid-column: 2;
        }
      }
    `,
  ],
})
export class ManagerDeskPage {
  protected readonly fixtureOrders = MANAGER_DESK_FIXTURE;
  protected readonly selectedId = signal<string | null>(null);
  protected readonly panel = signal<ManagerDeskPanel | null>(null);
  protected readonly selectedOrder = computed(
    () => this.fixtureOrders.find((order) => order.id === this.selectedId()) ?? null,
  );

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly chromeTools = inject(PiChromeToolsService);

  constructor() {
    // ActivatedRoute is the only state source needed for a harmless F5 restore.
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.applyQueryState(params.get('orderId'), params.get('panel'));
    });
    effect(() => {
      this.selectedOrder();
      this.panel();
      // setTools reads/writes the registry signal; keep it outside this effect's dependencies.
      untracked(() => this.syncChromeTools());
    });
  }

  // This page-owned registry needs an explicit cleanup hook (TZ-DESK-401).
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

  protected selectOrder(id: string): void {
    if (!this.fixtureOrders.some((order) => order.id === id)) return;
    this.selectedId.set(id);
    this.panel.set(null);
    this.navigateQuery(id, null);
  }

  /** Shared handler for the left rail «Создать» and the empty-state CTA. */
  protected openPanel(panel: ManagerDeskPanel): void {
    if (!this.canOpenPanel(panel)) return;
    this.panel.set(panel);
    this.navigateQuery(this.selectedId(), panel);
  }

  protected closePanel(): void {
    this.panel.set(null);
    this.navigateQuery(this.selectedId(), null);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.panel()) this.closePanel();
  }

  private applyQueryState(rawOrderId: string | null, rawPanel: string | null): void {
    const orderId = this.fixtureOrders.some((order) => order.id === rawOrderId) ? rawOrderId : null;
    this.selectedId.set(orderId);

    const panel = this.isPanel(rawPanel) ? rawPanel : null;
    this.panel.set(panel && this.canOpenPanel(panel) ? panel : null);
  }

  private canOpenPanel(panel: ManagerDeskPanel): boolean {
    if (LEFT_PANELS.has(panel)) return true;
    const order = this.selectedOrder();
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
    const selected = this.selectedOrder();
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

    const right: DeskChromeTool[] = selected
      ? [
          this.actionTool('client', 'Клиент', Users, open === 'client', 1),
          this.actionTool('bom', 'Состав', Package, open === 'bom', 2),
          this.actionTool('docs', 'Документы', FileText, open === 'docs', 3),
          ...(selected.status === 'in_production' || selected.status === 'ready'
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
