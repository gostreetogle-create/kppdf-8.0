import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import {
  LucideAngularModule,
  Pencil,
  ChevronDown,
  ChevronRight,
  GripVertical,
} from 'lucide-angular';
import { PiPageChromeComponent, PageCrumb } from '../../shared/page/pi-page-chrome.component';
import { BoardLane, ModuleLane, Order, OrderItem, OrdersService } from '../orders/orders.service';
import {
  ProductModule,
  ProductModulesService,
} from '../../shared/services/pi-product-modules.service';
import { DashboardDialogService } from '../../shared/services/dashboard-dialog.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { API_BASE_URL } from '../../core/api.tokens';
import { extractErrorMessage } from '../../core/silent-http';

/** Flat card on Комбайн: one OrderItem + order badge context. */
export interface CombineItemCard {
  key: string;
  orderId: string;
  orderNumber: string;
  lineId: string;
  itemIndex: number;
  productName: string;
  quantity: number;
  unit?: string;
  boardLane: BoardLane;
  order: Order;
  item: OrderItem;
}

export interface CombineColumn {
  id: BoardLane;
  title: string;
  helper: string;
}

/** TZ-COMBINE-407 — строка модуля внутри раскрытого изделия. */
export interface CombineModuleRow {
  moduleId: string;
  name: string;
  lane: BoardLane;
}

/** TZ-COMBINE-407 — payload перетаскиваемого модуля. */
export interface CombineModuleDrag {
  kind: 'module';
  orderId: string;
  lineId: string;
  moduleId: string;
  lane: BoardLane;
}

type LaneSnapshot = { orderId: string; lineId: string; boardLane: BoardLane };

/** TZ-COMBINE-406 — порядок колонок для «min» полосы модулей (prep = раньше всех). */
const LANE_ORDER: Record<BoardLane, number> = {
  prep: 0,
  design: 1,
  shop: 2,
  to_ship: 3,
  shipped: 4,
};

const LANE_TITLE: Record<BoardLane, string> = {
  prep: 'Комплектация',
  design: 'Проектирование',
  shop: 'В цехе',
  to_ship: 'К отгрузке',
  shipped: 'Отгружены',
};

/** TZ-COMBINE-413 — opaque CDK preview class for module / «целиком» chips. */
export const COMBINE_CHIP_DRAG_PREVIEW_CLASS = 'combine-chip-drag-preview';

/** TZ-COMBINE-402 legacy: OrderItem.status → boardLane when lane missing. */
const STATUS_TO_BOARD_LANE: Record<NonNullable<OrderItem['status']>, BoardLane> = {
  pending: 'prep',
  in_production: 'shop',
  ready: 'to_ship',
  shipped: 'shipped',
};

const SHIP_READY_LANES: ReadonlySet<BoardLane> = new Set(['to_ship', 'shipped']);
const SHOP_ENTERED_LANES: ReadonlySet<BoardLane> = new Set(['shop', 'to_ship', 'shipped']);

@Component({
  selector: 'app-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, PiPageChromeComponent, CdkDropList, CdkDrag],
  styles: `
    /* TZ-COMBINE-413 — solid grab feel; CDK always uses preview+placeholder */
    .combine-chip-drag-preview,
    .cdk-drag-preview {
      box-sizing: border-box;
      opacity: 1 !important;
      background: var(--color-paper, #fff);
      border: 1px solid var(--color-rule, #e5e5e5);
      border-radius: 2px;
      box-shadow: 0 6px 18px -6px rgba(0, 0, 0, 0.22);
    }

    /* TZ-COMBINE-415 — placeholder opacity only inside mini-kanban (not row labels) */
    :host [data-testid='combine-mini-kanban'] .cdk-drag-placeholder {
      opacity: 0;
      min-height: 2.25rem;
    }

    :host [data-testid='combine-mini-kanban'] .cdk-drag-animating {
      transition: transform 180ms cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    :host
      [data-testid='combine-mini-kanban']
      .cdk-drop-list-dragging
      .cdk-drag:not(.cdk-drag-placeholder) {
      transition: transform 180ms cubic-bezier(0.25, 0.8, 0.25, 1);
    }
  `,
  template: `
    <app-pi-page-chrome [crumbs]="crumbs" title="Комбайн заказов" />

    <!-- Analytics Panel -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div
        class="p-4 rounded-sm border hairline bg-paper flex flex-col gap-1 hover:border-[oklch(0.75_0.02_160)] transition-colors"
      >
        <span
          class="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2"
        >
          <span class="w-1.5 h-1.5 rounded-sm bg-[oklch(0.75_0.02_160)]"></span> Новые
        </span>
        <span class="text-2xl font-display">{{ stats().new }}</span>
      </div>
      <div
        class="p-4 rounded-sm border hairline bg-paper flex flex-col gap-1 hover:border-[oklch(0.65_0.02_160)] transition-colors"
      >
        <span
          class="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2"
        >
          <span class="w-1.5 h-1.5 rounded-sm bg-[oklch(0.65_0.02_160)]"></span> В работе
        </span>
        <span class="text-2xl font-display">{{ stats().inProgress }}</span>
      </div>
      <div
        class="p-4 rounded-sm border hairline bg-paper flex flex-col gap-1 hover:border-[oklch(0.55_0.02_160)] transition-colors"
      >
        <span
          class="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2"
        >
          <span class="w-1.5 h-1.5 rounded-sm bg-[oklch(0.55_0.02_160)]"></span> Готовы
        </span>
        <span class="text-2xl font-display">{{ stats().ready }}</span>
      </div>
      <div
        class="p-4 rounded-sm border hairline bg-paper flex flex-col gap-1 hover:border-destructive transition-colors"
      >
        <span
          class="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2"
        >
          <span class="w-1.5 h-1.5 rounded-sm bg-destructive"></span> Просрочены
        </span>
        <span class="text-2xl font-display">{{ stats().overdue }}</span>
      </div>
    </div>

    @if (error()) {
      <div
        class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
      >
        {{ error() }}
      </div>
    }

    <div class="mb-4 flex items-center gap-3">
      <label class="text-sm text-muted-foreground" for="combine-order-filter">Заказ</label>
      <select
        id="combine-order-filter"
        class="border hairline rounded-sm bg-paper px-3 py-1.5 text-sm min-w-[12rem]"
        [value]="filterOrderId()"
        (change)="onFilterChange($event)"
      >
        <option value="">Все заказы</option>
        @for (order of data(); track order._id) {
          <option [value]="order._id">№{{ order.number }}</option>
        }
      </select>
    </div>

    <!-- TZ-COMBINE-409: sticky stage headers + OrderItem rows (expand = mini-kanban). -->
    <div class="min-h-[60vh] pb-4">
      <div
        class="sticky top-0 z-10 grid grid-cols-5 gap-0 border hairline rounded-sm bg-paper-raised mb-3 shadow-sm"
        role="row"
        aria-label="Стадии комбайна"
      >
        @for (col of columns; track col.id) {
          <div class="px-3 py-2.5 border-r hairline last:border-r-0 min-w-0" [title]="col.helper">
            <div class="text-xs font-medium text-ink truncate flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-sm" [class]="laneDotClass(col.id)"></span>
              {{ col.title }}
            </div>
            <div class="text-[10px] text-muted-foreground truncate leading-snug mt-0.5">
              {{ col.helper }}
            </div>
          </div>
        }
      </div>

      <div class="flex flex-col gap-0" data-testid="combine-product-rows">
        @for (card of itemCards(); track card.key; let i = $index) {
          <div
            class="border border-rule-strong bg-paper overflow-hidden group hover:border-ink/40 transition-colors"
            [class.mt-3]="isOrderBoundary(card, i)"
            [class.rounded-t-sm]="isOrderGroupStart(card, i)"
            [class.rounded-b-sm]="isOrderGroupEnd(card, i)"
            [class.border-t-0]="!isOrderGroupStart(card, i)"
            [attr.data-order-boundary]="isOrderBoundary(card, i) ? 'true' : null"
            [attr.data-line-key]="card.key"
            [attr.data-testid]="'combine-product-row'"
          >
            <div class="flex items-center gap-3 px-3 py-2.5">
              <button
                type="button"
                class="text-muted-foreground hover:text-ink w-6 h-6 flex items-center justify-center shrink-0 pi-focus-ring rounded-sm hover:bg-paper-2 transition-colors"
                data-testid="combine-row-expand"
                [attr.aria-expanded]="isExpanded(card)"
                [attr.aria-controls]="expandPanelId(card)"
                [attr.aria-label]="isExpanded(card) ? 'Свернуть изделие' : 'Раскрыть изделие'"
                (click)="toggleExpand(card)"
              >
                <lucide-icon
                  [img]="isExpanded(card) ? ChevronDownIcon : ChevronRightIcon"
                  [size]="16"
                ></lucide-icon>
              </button>

              <button
                type="button"
                class="font-mono text-xs font-medium text-ink hover:underline shrink-0 pi-focus-ring rounded-sm px-1.5 py-0.5 bg-paper-2"
                data-testid="combine-row-order-number"
                (click)="openOrder(card.order); $event.stopPropagation()"
                title="Открыть заказ"
              >
                №{{ card.orderNumber }}
              </button>

              <button
                type="button"
                class="text-sm font-medium text-ink text-left flex-1 min-w-0 truncate hover:underline pi-focus-ring rounded-sm"
                data-testid="combine-row-product-name"
                [title]="card.productName"
                [attr.aria-expanded]="isExpanded(card)"
                [attr.aria-controls]="expandPanelId(card)"
                (click)="toggleExpand(card)"
              >
                {{ card.productName }}
              </button>

              <button
                type="button"
                class="text-xs text-muted-foreground shrink-0 bg-paper-2 px-1.5 py-0.5 rounded-sm pi-focus-ring"
                data-testid="combine-row-qty"
                [attr.aria-expanded]="isExpanded(card)"
                [attr.aria-controls]="expandPanelId(card)"
                [attr.aria-label]="
                  'Количество ' + card.quantity + ' ' + (card.unit || 'шт') + '. Раскрыть стадии'
                "
                (click)="toggleExpand(card)"
              >
                {{ card.quantity }} {{ card.unit || 'шт' }}
              </button>

              <button
                type="button"
                class="flex gap-1 shrink-0 w-32 pi-focus-ring rounded-sm"
                data-testid="combine-lane-indicators"
                [attr.aria-expanded]="isExpanded(card)"
                [attr.aria-controls]="expandPanelId(card)"
                [attr.aria-label]="'Стадии: ' + activeLaneSummary(card) + '. Раскрыть'"
                (click)="toggleExpand(card)"
              >
                @for (col of columns; track col.id) {
                  <span
                    class="h-1.5 flex-1 rounded-sm transition-colors"
                    [class]="laneIndicatorClass(card, col.id)"
                    [attr.data-lane]="col.id"
                    [attr.data-active]="laneIndicatorActive(card, col.id) ? 'true' : null"
                    [title]="col.title"
                  ></span>
                }
              </button>

              <button
                type="button"
                class="text-muted-foreground hover:text-gold-deep p-1.5 rounded-sm hover:bg-gold-soft shrink-0 pi-focus-ring opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all"
                data-testid="combine-row-product-edit"
                (click)="editProduct(card.item.productId); $event.stopPropagation()"
                title="Редактировать изделие"
              >
                <lucide-icon [img]="PencilIcon" [size]="14"></lucide-icon>
              </button>
            </div>

            @if (isExpanded(card)) {
              <div
                class="grid grid-cols-5 gap-0 border-t hairline min-h-[4.5rem]"
                role="region"
                [attr.id]="expandPanelId(card)"
                [attr.aria-label]="'Стадии изделия ' + card.productName"
                data-testid="combine-mini-kanban"
              >
                @for (col of columns; track col.id) {
                  <div
                    class="border-r hairline last:border-r-0 p-1.5 flex flex-col gap-1.5 min-h-[4.5rem] min-w-0 bg-paper-2/50"
                    cdkDropList
                    [id]="rowDropListId(card, col.id)"
                    [cdkDropListData]="col.id"
                    [cdkDropListConnectedTo]="rowConnectedLists(card)"
                    (cdkDropListDropped)="dropItem($event)"
                  >
                    @for (row of modulesInLane(card, col.id); track row.moduleId) {
                      <div
                        cdkDrag
                        [cdkDragData]="moduleDrag(card, row)"
                        [cdkDragPreviewClass]="chipDragPreviewClass"
                        class="text-[11px] border hairline rounded-sm px-2 py-2 bg-paper cursor-grab active:cursor-grabbing flex items-center gap-1.5 group/chip hover:border-gold-deep transition-colors shadow-sm"
                        data-testid="combine-module-chip"
                        [title]="row.name"
                      >
                        <lucide-icon
                          [img]="GripVerticalIcon"
                          [size]="12"
                          class="text-muted-foreground opacity-40 group-hover/chip:opacity-100 shrink-0"
                        ></lucide-icon>
                        <span class="truncate flex-1 min-w-0">{{ row.name }}</span>
                        <button
                          type="button"
                          class="text-muted-foreground hover:text-gold-deep p-0.5 rounded-sm hover:bg-gold-soft shrink-0 pi-focus-ring opacity-0 group-hover/chip:opacity-100 focus-visible:opacity-100 transition-opacity"
                          data-testid="combine-module-edit"
                          (click)="editModule(row.moduleId); $event.stopPropagation()"
                          (pointerdown)="$event.stopPropagation()"
                          title="Редактировать модуль"
                        >
                          <lucide-icon [img]="PencilIcon" [size]="12"></lucide-icon>
                        </button>
                      </div>
                    }
                    @if (showWholeProductChip(card, col.id)) {
                      <div
                        cdkDrag
                        [cdkDragData]="card"
                        [cdkDragPreviewClass]="chipDragPreviewClass"
                        data-testid="combine-whole-product-chip"
                        class="text-[11px] border hairline rounded-sm px-2 py-2 bg-paper cursor-grab active:cursor-grabbing font-medium flex items-center gap-1.5 group/chip hover:border-gold-deep transition-colors shadow-sm"
                        title="Изделие целиком — перетащите по стадиям"
                      >
                        <lucide-icon
                          [img]="GripVerticalIcon"
                          [size]="12"
                          class="text-muted-foreground opacity-40 group-hover/chip:opacity-100 shrink-0"
                        ></lucide-icon>
                        <span>целиком</span>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
        @if (itemCards().length === 0) {
          <div class="text-sm text-muted-foreground text-center py-10 border hairline rounded-sm">
            Нет изделий
          </div>
        }
      </div>
    </div>
  `,
})
export class DashboardPage {
  // TZ-NAV-303: Комбайн переехал под Проект — /design/combine.
  protected readonly crumbs: PageCrumb[] = [
    { label: 'Проектирование', link: '/design' },
    { label: 'Комбайн' },
  ];
  protected readonly PencilIcon = Pencil;
  protected readonly ChevronDownIcon = ChevronDown;
  protected readonly ChevronRightIcon = ChevronRight;
  protected readonly GripVerticalIcon = GripVertical;
  protected readonly chipDragPreviewClass = COMBINE_CHIP_DRAG_PREVIEW_CLASS;

  private readonly dashboardDialogs = inject(DashboardDialogService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly orders = inject(OrdersService);
  private readonly productModules = inject(ProductModulesService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
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

  /** TZ-COMBINE-404: колонки = boardLane + RU title + helper. */
  protected readonly columns: CombineColumn[] = [
    {
      id: 'prep',
      title: 'Комплектация',
      helper: 'Состав / модули / материалы — к чертежу',
    },
    {
      id: 'design',
      title: 'Проектирование',
      helper: 'Чертежи, виды работ, сроки',
    },
    {
      id: 'shop',
      title: 'В цехе',
      helper: 'План на Ганте; первый вход → freeze состава заказа',
    },
    {
      id: 'to_ship',
      title: 'К отгрузке',
      helper: 'Готово к документам',
    },
    {
      id: 'shipped',
      title: 'Отгружены',
      helper: 'Только отгрузка целого заказа (не PATCH lane)',
    },
  ];

  protected readonly filterOrderId = signal<string>('');
  /** TZ-COMBINE-407 — раскрытое изделие (card.key) или null. Accordion: один ряд. */
  protected readonly expandedKey = signal<string | null>(null);
  /** TZ-COMBINE-407 — модули изделия по productId (lazy / prefetch). */
  protected readonly modulesByProduct = signal<Record<string, ProductModule[]>>({});
  private readonly modulesLoadInflight = new Set<string>();

  /** TZ-COMBINE-409 — drop list id scoped to expanded line (не глобальный board). */
  protected rowDropListId(card: CombineItemCard, lane: BoardLane): string {
    return `${card.key}::${lane}`;
  }

  protected rowConnectedLists(card: CombineItemCard): string[] {
    return this.columns.map((c) => this.rowDropListId(card, c.id));
  }

  /** TZ-COMBINE-410 — a11y target for aria-controls. */
  protected expandPanelId(card: CombineItemCard): string {
    return `combine-expand-${card.key.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  }

  /**
   * TZ-COMBINE-411/412 — визуальная граница заказа без текста «Заказ №…»:
   * внутри заказа ряды слиты (gap-0 / border-t-0); смена orderId → mt-3.
   */
  protected isOrderBoundary(card: CombineItemCard, index: number): boolean {
    if (index === 0) return false;
    const prev = this.itemCards()[index - 1];
    return !!prev && prev.orderId !== card.orderId;
  }

  /** TZ-COMBINE-412 — первый ряд группы заказа (скругление сверху + полная верхняя рамка). */
  protected isOrderGroupStart(card: CombineItemCard, index: number): boolean {
    return index === 0 || this.isOrderBoundary(card, index);
  }

  /** TZ-COMBINE-412 — последний ряд группы заказа (скругление снизу). */
  protected isOrderGroupEnd(card: CombineItemCard, index: number): boolean {
    const next = this.itemCards()[index + 1];
    return !next || next.orderId !== card.orderId;
  }

  /**
   * Индикатор стадии (TZ-COMBINE-409/410):
   * — модуль в lane (после prefetch/expand или из moduleLanes);
   * — без модулей каталога — один сегмент = effective lane («целиком»).
   */
  protected laneIndicatorActive(card: CombineItemCard, lane: BoardLane): boolean {
    const loaded = this.modulesByProduct()[card.item.productId];
    if (loaded !== undefined) {
      if (loaded.length === 0) {
        return this.lineEffectiveLane(card.order, card.item) === lane;
      }
      return this.moduleRows(card).some((r) => r.lane === lane);
    }
    const mls = (card.order.moduleLanes ?? []).filter((ml) => ml.lineId === card.lineId);
    if (mls.length > 0) {
      return mls.some((ml) => ml.lane === lane);
    }
    return this.lineEffectiveLane(card.order, card.item) === lane;
  }

  protected activeLaneSummary(card: CombineItemCard): string {
    return (
      this.columns
        .filter((c) => this.laneIndicatorActive(card, c.id))
        .map((c) => c.title)
        .join(', ') || '—'
    );
  }

  protected modulesInLane(card: CombineItemCard, lane: BoardLane): CombineModuleRow[] {
    return this.moduleRows(card).filter((r) => r.lane === lane);
  }

  /**
   * TZ-COMBINE-410 — без модулей в каталоге: один чип «целиком» в effective lane.
   * Prefetch/expand заполняет modulesByProduct; до загрузки чип не рисуем.
   */
  protected showWholeProductChip(card: CombineItemCard, lane: BoardLane): boolean {
    const loaded = this.modulesByProduct()[card.item.productId];
    if (loaded === undefined) return false;
    if (loaded.length > 0) return false;
    return this.lineEffectiveLane(card.order, card.item) === lane;
  }

  constructor() {
    this.listRes.reload();
    /** TZ-COMBINE-410 — prefetch modules so collapsed indicators / whole-product path work without expand. */
    effect(() => {
      const productIds = [...new Set(this.itemCards().map((c) => c.item.productId))];
      untracked(() => {
        for (const productId of productIds) {
          if (!productId) continue;
          if (this.modulesByProduct()[productId] !== undefined) continue;
          this.loadModules(productId);
        }
      });
    });
  }

  protected stats = computed(() => {
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

  /** Flat OrderItems from all (filtered) orders. */
  protected readonly itemCards = computed<CombineItemCard[]>(() => {
    const filter = this.filterOrderId();
    const cards: CombineItemCard[] = [];
    for (const order of this.data()) {
      if (filter && order._id !== filter) continue;
      const items = order.items ?? [];
      items.forEach((item, index) => {
        const lineId = item.lineId || `legacy-${index}-${order._id}`;
        const boardLane = this.lineEffectiveLane(order, item);
        cards.push({
          key: `${order._id}:${lineId}`,
          orderId: order._id,
          orderNumber: order.number,
          lineId,
          itemIndex: index,
          productName: item.productName || `Изделие ${item.productId.slice(0, 8)}`,
          quantity: item.quantity,
          unit: item.unit,
          boardLane,
          order,
          item,
        });
      });
    }
    return cards;
  });

  protected columnCards(colId: BoardLane): CombineItemCard[] {
    return this.itemCards().filter((c) => c.boardLane === colId);
  }

  protected boardLaneOf(item: OrderItem): BoardLane {
    if (item.boardLane) return item.boardLane;
    return STATUS_TO_BOARD_LANE[item.status ?? 'pending'] ?? 'prep';
  }

  /** TZ-COMBINE-406/407 — эффективная полоса линии = min по её moduleLanes, иначе boardLane. */
  protected lineEffectiveLane(order: Order, item: OrderItem): BoardLane {
    if (item.lineId) {
      const lanes = (order.moduleLanes ?? [])
        .filter((ml) => ml.lineId === item.lineId)
        .map((ml) => ml.lane);
      if (lanes.length > 0) {
        return lanes.reduce<BoardLane>(
          (min, lane) => (LANE_ORDER[lane] < LANE_ORDER[min] ? lane : min),
          lanes[0],
        );
      }
    }
    return this.boardLaneOf(item);
  }

  protected laneTitle(lane: BoardLane): string {
    return LANE_TITLE[lane];
  }

  protected laneDotClass(lane: BoardLane): string {
    switch (lane) {
      case 'prep':
        return 'bg-paper-3';
      case 'design':
        return 'bg-[oklch(0.75_0.02_160)]';
      case 'shop':
        return 'bg-[oklch(0.65_0.02_160)]';
      case 'to_ship':
        return 'bg-[oklch(0.55_0.02_160)]';
      case 'shipped':
        return 'bg-[oklch(0.45_0.02_160)]';
    }
  }

  protected laneIndicatorClass(card: CombineItemCard, lane: BoardLane): string {
    const isActive = this.laneIndicatorActive(card, lane);
    if (!isActive) return 'bg-paper-2';

    switch (lane) {
      case 'prep':
        return 'bg-paper-3';
      case 'design':
        return 'bg-[oklch(0.75_0.02_160)]';
      case 'shop':
        return 'bg-[oklch(0.65_0.02_160)]';
      case 'to_ship':
        return 'bg-[oklch(0.55_0.02_160)]';
      case 'shipped':
        return 'bg-[oklch(0.45_0.02_160)]';
    }
  }

  /** Явная полоса модуля из moduleLanes; undefined → наследует линию. */
  protected moduleLaneOf(order: Order, lineId: string, moduleId: string): BoardLane | undefined {
    return (order.moduleLanes ?? []).find((ml) => ml.lineId === lineId && ml.moduleId === moduleId)
      ?.lane;
  }

  /** TZ-COMBINE-407 — модули, чья полоса уехала вперёд от эффективной полосы линии (ghost). */
  protected divergedModules(order: Order, item: OrderItem): ModuleLane[] {
    if (!item.lineId) return [];
    const effective = this.lineEffectiveLane(order, item);
    return (order.moduleLanes ?? []).filter(
      (ml) => ml.lineId === item.lineId && ml.lane !== effective,
    );
  }

  protected isExpanded(card: CombineItemCard): boolean {
    return this.expandedKey() === card.key;
  }

  protected toggleExpand(card: CombineItemCard): void {
    const next = this.isExpanded(card) ? null : card.key;
    this.expandedKey.set(next);
    if (next && !this.modulesByProduct()[card.item.productId]) {
      this.loadModules(card.item.productId);
    }
  }

  private loadModules(productId: string): void {
    if (this.modulesLoadInflight.has(productId)) return;
    if (this.modulesByProduct()[productId] !== undefined) return;
    this.modulesLoadInflight.add(productId);
    this.productModules.list(productId).subscribe({
      next: (res) => {
        this.modulesLoadInflight.delete(productId);
        if (res.ok) {
          this.modulesByProduct.update((map) => ({ ...map, [productId]: res.data }));
        }
      },
      error: () => {
        this.modulesLoadInflight.delete(productId);
      },
    });
  }

  protected moduleRows(card: CombineItemCard): CombineModuleRow[] {
    const modules = this.modulesByProduct()[card.item.productId] ?? [];
    const fallback = this.boardLaneOf(card.item);
    return modules.map((m) => ({
      moduleId: m._id,
      name: m.name,
      lane: this.moduleLaneOf(card.order, card.lineId, m._id) ?? fallback,
    }));
  }

  protected moduleDrag(card: CombineItemCard, row: CombineModuleRow): CombineModuleDrag {
    return {
      kind: 'module',
      orderId: card.orderId,
      lineId: card.lineId,
      moduleId: row.moduleId,
      lane: row.lane,
    };
  }

  protected onFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filterOrderId.set(select.value);
  }

  protected openOrder(order: Order): void {
    this.dashboardDialogs.openOrderEdit(order, this.injector, () => this.listRes.reload());
  }

  protected editProduct(productId: string): void {
    this.dashboardDialogs.openProductEdit(productId, this.injector, () => this.listRes.reload());
  }

  /** TZ-COMBINE-413 — карандаш модуля → диалог на Комбайне (без /modules/:id). */
  protected editModule(moduleId: string): void {
    this.dashboardDialogs.openModuleEdit(moduleId, this.injector, () => this.listRes.reload());
  }

  /**
   * TZ-COMBINE-405 — drop изделия между колонками boardLane.
   * «Отгружены» → ship-whole gate (не PATCH lane=shipped).
   * Первый вход в shop → freeze modal.
   */
  protected dropItem(event: CdkDragDrop<BoardLane>): void {
    if (event.previousContainer === event.container) return;

    const data = event.item.data;
    if (data && (data as CombineModuleDrag).kind === 'module') {
      this.dropModule(event, data as CombineModuleDrag);
      return;
    }

    const card = data as CombineItemCard | undefined;
    /** TZ-COMBINE-409: prefer cdkDropListData (lane); id may be `${key}::lane`. */
    const targetLane = (event.container.data ?? event.container.id) as BoardLane;
    if (!card || !targetLane) return;
    if (card.boardLane === targetLane) return;

    const order = this.data().find((o) => o._id === card.orderId);
    if (!order) return;

    if (targetLane === 'shipped') {
      this.handleShipDrop(order);
      return;
    }

    if (!card.item.lineId) {
      this.toast.error('У изделия нет lineId — обновите заказ и повторите.');
      return;
    }

    if (targetLane === 'shop' && this.isFirstShopEntry(order)) {
      this.confirmFreezeThenPatch(order, card.item.lineId, targetLane);
      return;
    }

    this.applyLanePatch(order, card.item.lineId, targetLane);
  }

  /** Все линии ещё не входили в shop/to_ship/shipped → первый вход в цех. */
  protected isFirstShopEntry(order: Order): boolean {
    return !(order.items ?? []).some((item) => SHOP_ENTERED_LANES.has(this.boardLaneOf(item)));
  }

  /** Линии не в to_ship/shipped — сколько «ещё не готовы» к отгрузке. */
  protected countNotShipReady(order: Order): number {
    return (order.items ?? []).filter((item) => !SHIP_READY_LANES.has(this.boardLaneOf(item)))
      .length;
  }

  private handleShipDrop(order: Order): void {
    const notReady = this.countNotShipReady(order);
    if (notReady > 0) {
      this.toast.error(`Ещё ${notReady} изделий не готовы`);
      return;
    }
    this.confirmShip(order);
  }

  private confirmFreezeThenPatch(order: Order, lineId: string, lane: BoardLane): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Состав заказа будет заморожен. Добавить изделия после этого нельзя.',
        confirmLabel: 'Продолжить',
        cancelLabel: 'Отмена',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.applyLanePatch(order, lineId, lane);
    });
  }

  /** TZ-SWEEP-401 pattern: confirm → POST /ship (не PATCH lane). */
  private confirmShip(order: Order): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: `Создать отгрузку по заказу №${order.number}?`,
        description: 'Появится документ отгрузки.',
        confirmLabel: 'Отгрузить',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      const snapshot = this.laneSnapshot();
      this.applyOptimisticShip(order);
      this.orders.ship(order._id, {}).subscribe((res) => {
        if (res.ok) {
          this.replaceOrder(res.data);
        } else {
          this.restoreLanes(snapshot);
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  private applyLanePatch(order: Order, lineId: string, lane: BoardLane): void {
    const snapshot = this.laneSnapshot();
    this.setItemLane(order._id, lineId, lane);

    this.orders.patchLane(order._id, lineId, lane).subscribe((res) => {
      if (res.ok) {
        this.replaceOrder(res.data);
      } else {
        this.restoreLanes(snapshot);
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  /** TZ-COMBINE-407/409 — DnD модуля по ячейкам ряда → PATCH module lane. */
  protected dropModule(event: CdkDragDrop<BoardLane>, drag: CombineModuleDrag): void {
    const targetLane = (event.container.data ?? event.container.id) as BoardLane;
    if (!targetLane || drag.lane === targetLane) return;
    if (targetLane === 'shipped') {
      this.toast.error('Модуль нельзя отправить в «Отгружены» — отгрузка целого заказа.');
      return;
    }
    const order = this.data().find((o) => o._id === drag.orderId);
    if (!order) return;
    this.applyModuleLanePatch(order, drag.lineId, drag.moduleId, targetLane);
  }

  private applyModuleLanePatch(
    order: Order,
    lineId: string,
    moduleId: string,
    lane: BoardLane,
  ): void {
    this.orders.patchModuleLane(order._id, lineId, moduleId, lane).subscribe((res) => {
      if (res.ok) {
        this.replaceOrder(res.data);
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  private laneSnapshot(): LaneSnapshot[] {
    const out: LaneSnapshot[] = [];
    for (const order of this.data()) {
      for (const item of order.items ?? []) {
        if (!item.lineId) continue;
        out.push({
          orderId: order._id,
          lineId: item.lineId,
          boardLane: this.boardLaneOf(item),
        });
      }
    }
    return out;
  }

  private restoreLanes(snapshot: LaneSnapshot[]): void {
    for (const s of snapshot) {
      this.setItemLane(s.orderId, s.lineId, s.boardLane);
    }
  }

  private setItemLane(orderId: string, lineId: string, lane: BoardLane): void {
    const order = this.data().find((o) => o._id === orderId);
    const item = order?.items?.find((i) => i.lineId === lineId);
    if (item) item.boardLane = lane;
  }

  private applyOptimisticShip(order: Order): void {
    order.status = 'shipped';
    for (const item of order.items ?? []) {
      item.boardLane = 'shipped';
      item.status = 'shipped';
    }
  }

  private replaceOrder(updated: Order): void {
    this.listRes.value.set(this.data().map((o) => (o._id === updated._id ? updated : o)));
  }

  /**
   * Kept for specs / rollup stats: «X из Y» by item.status ∈ {ready, shipped}.
   * НЕ OR-ит readyForWork (гейт /orders, HUB-304).
   */
  protected readinessLabel(order: Order): string {
    const items = order.items ?? [];
    if (items.length === 0) return '—';
    const ready = items.filter((item) => {
      const s = item.status;
      return s === 'ready' || s === 'shipped';
    }).length;
    return `${ready} из ${items.length}`;
  }
}
