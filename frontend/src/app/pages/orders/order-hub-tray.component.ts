import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  CompositionTreeComponent,
  type CompositionTreeEditEvent,
  type CompositionTreeExpandEvent,
  type CompositionTreeSelectEvent,
} from '../../shared/ui/composition/composition-tree.component';
import {
  CompositionTreeNode,
  ProductModulesService,
} from '../../shared/services/pi-product-modules.service';
import { ProductsService } from '../../shared/services/products.service';
import { MaterialsService } from '../../shared/services/materials.service';
import {
  SupplyTask,
  SupplyTaskService,
  type SupplyTaskStatus,
} from '../../shared/services/pi-supply.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import { pluralize } from '../../shared/util/format';
import {
  loadOrderCompositionForest,
  ORDER_TREE_INITIAL_DEPTH,
  ORDER_TREE_MAX_DEPTH,
} from './order-composition-forest';
import {
  isEmptyCatalogBranch,
  openCatalogEditFromTree,
  type CatalogCompositionEditDeps,
} from './open-catalog-composition-edit';
import type { BoardLane, Order, OrderItem, OrderStatus } from './orders.service';

/** Counters for the lazy reservations summary (HUB-304 pattern, hub-hosted). */
export type ReservationExpandCounters = { active: number; total: number };

export const EMPTY_RESERVATION_COUNTERS: ReservationExpandCounters = { active: 0, total: 0 };

const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Черновик',
  confirmed: 'Подтверждён',
  in_production: 'В производстве',
  ready: 'Готов',
  shipped: 'Отгружен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

const PRIMARY_CTA_LABELS: Record<OrderStatus, string> = {
  draft: 'Подтвердить',
  confirmed: 'В производство',
  in_production: 'К отгрузке',
  ready: 'Отгрузить',
  shipped: 'Отгружен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

const BOARD_LANE_LABELS: Record<BoardLane, string> = {
  prep: 'Комплектация',
  design: 'Проектирование',
  shop: 'В цехе',
  to_ship: 'К отгрузке',
  shipped: 'Отгружены',
};

/** TZ-COMBINE-402 legacy: OrderItem.status → boardLane when lane missing. */
const STATUS_TO_BOARD_LANE: Record<NonNullable<OrderItem['status']>, BoardLane> = {
  pending: 'prep',
  in_production: 'shop',
  ready: 'to_ship',
  shipped: 'shipped',
};

const EMPTY_SUPPLY_COUNTERS: Record<SupplyTaskStatus, number> & { total: number } = {
  draft: 0,
  confirmed: 0,
  ordered: 0,
  received: 0,
  total: 0,
};

/**
 * Shared order summary tray (TZ-DESK-412, extended by TZ-DESK-403).
 *
 * One markup for `/orders` expand (`mode="hub"`) and `/desk` row expand
 * (`mode="desk"`). The tray owns the live catalog composition forest
 * (lazy on toggle) and the lazy supply counters (HUB-303 pattern, loaded on
 * expand) — no host copy-paste. Reservations stay hub-hosted via inputs.
 *
 * Data-test contract: the `order-*` selectors mirror orders.page's former
 * `#expandedTpl` 1:1 so HUB-302/303/304 characterization specs keep passing.
 * Desk-only affordances are gated by `mode() === 'desk'`.
 */
@Component({
  selector: 'app-order-hub-tray',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CompositionTreeComponent],
  template: `
    <div
      class="order-hub-tray"
      data-test="order-hub-tray"
      [attr.id]="'order-hub-tray-' + order()._id"
      [attr.data-mode]="mode()"
    >
      <div
        class="px-4 py-5 bg-paper-2 border-t hairline relative"
        data-test="expanded-content"
        role="region"
        [attr.aria-label]="'Сводка заказа: ' + order().number"
      >
        <div class="absolute left-0 top-0 bottom-0 w-1 bg-gold" aria-hidden="true"></div>
        <div class="relative" data-test="expanded-content-body">
          <div class="space-y-8" data-test="order-lifecycle-groups">
            <!-- ───── Заказ → состав ───── -->
            <section class="min-w-0" data-test="order-group-order">
              <div class="flex items-baseline gap-2 border-b hairline pb-2 mb-4">
                <p class="eyebrow m-0">Заказ</p>
                @if (mode() === 'desk') {
                  <span class="text-xs font-display font-semibold">{{ order().number }}</span>
                } @else {
                  <span class="text-xs text-muted-foreground">основной состав</span>
                }
              </div>

              @if (mode() === 'desk') {
                <dl class="grid gap-2 mb-4" data-test="order-client-facts">
                  <div class="flex items-baseline justify-between gap-3">
                    <dt class="text-xs text-muted-foreground">Клиент</dt>
                    <dd class="m-0 text-sm text-right truncate">{{ clientLabel() || '—' }}</dd>
                  </div>
                  <div class="flex items-baseline justify-between gap-3">
                    <dt class="text-xs text-muted-foreground">Статус</dt>
                    <dd class="m-0 text-sm text-right">{{ statusLabel(order().status) }}</dd>
                  </div>
                </dl>
              }

              <section class="min-w-0 flex flex-col gap-1" data-test="order-composition-block">
                <button
                  type="button"
                  class="flex items-center justify-between gap-3 w-full min-h-touch text-left text-sm text-ink pi-focus-ring rounded-sm"
                  [attr.aria-expanded]="compositionExpanded()"
                  [attr.aria-controls]="'order-composition-' + order()._id"
                  (click)="toggleComposition()"
                  data-test="order-composition-toggle"
                >
                  <span class="font-medium">Состав заказа</span>
                  <span class="text-xs text-muted-foreground">
                    {{ order().items?.length ?? 0 }}
                    {{ itemCountLabel(order().items?.length ?? 0) }}
                    <span aria-hidden="true">
                      · {{ compositionExpanded() ? 'свернуть' : 'раскрыть' }}</span
                    >
                  </span>
                </button>
                @if (compositionExpanded()) {
                  <div
                    class="border-t hairline pt-3 mt-1"
                    [id]="'order-composition-' + order()._id"
                    data-test="order-composition-panel"
                  >
                    @if ((order().items?.length ?? 0) === 0) {
                      @if (mode() === 'desk') {
                        <p class="text-xs text-muted-foreground m-0">Нет изделий.</p>
                        <button
                          type="button"
                          class="text-xs underline underline-offset-2 hover:text-sunrise-warm border-0 p-0 bg-transparent cursor-pointer font-inherit mt-2"
                          (click)="addLines.emit(order())"
                          data-test="desk-add-line-cta"
                        >
                          Добавить линию
                        </button>
                      } @else {
                        <p class="text-xs text-muted-foreground m-0">В заказе нет изделий.</p>
                      }
                    } @else if (compositionLoading()) {
                      <p
                        class="text-sm text-muted-foreground py-3 m-0"
                        data-test="order-composition-loading"
                      >
                        Загрузка состава…
                      </p>
                    } @else if (compositionForest().length > 0) {
                      <div
                        class="space-y-3 p-2 hairline rounded-sm bg-paper"
                        data-test="order-composition-tree"
                      >
                        @for (root of compositionForest(); track $index) {
                          <app-composition-tree
                            [root]="root"
                            [selectedId]="compositionSelectedId()"
                            [showEdit]="true"
                            ariaLabel="Состав изделия в заказе"
                            (expandedChange)="onCompositionExpand($event)"
                            (selectedChange)="onCompositionSelect($event)"
                            (editClick)="onCompositionEdit($event)"
                          />
                        }
                      </div>
                    } @else {
                      <ul
                        class="m-0 mt-1 pl-4 space-y-0.5 text-sm"
                        data-test="order-composition-lines"
                      >
                        @for (line of order().items ?? []; track trackItem($index, line)) {
                          <li data-test="order-composition-line">{{ lineLabel(line) }}</li>
                        }
                      </ul>
                    }
                    @if (mode() === 'hub') {
                      <a
                        [routerLink]="['/orders', order()._id]"
                        class="text-xs underline underline-offset-2 hover:text-sunrise-warm mt-3 inline-block"
                        (click)="$event.stopPropagation()"
                        >Открыть карточку заказа</a
                      >
                    }
                  </div>
                }
              </section>
            </section>

            <!-- ───── Исполнение ───── -->
            <section class="min-w-0" data-test="order-group-execution">
              <div class="flex items-baseline gap-2 border-b hairline pb-2 mb-4">
                <p class="eyebrow m-0">Исполнение</p>
                <span class="text-xs text-muted-foreground">цех и готовность</span>
              </div>

              @if (mode() === 'desk') {
                <div
                  class="flex items-center gap-2 flex-wrap mb-4"
                  data-test="desk-execution-actions"
                >
                  <button
                    type="button"
                    class="min-h-touch px-3 py-1.5 border border-rule-strong rounded-sm bg-ink text-paper text-sm cursor-pointer"
                    (click)="primaryCta.emit(order())"
                    data-test="desk-primary-cta"
                    [attr.aria-label]="primaryCtaLabel()"
                  >
                    {{ primaryCtaLabel() }}
                  </button>
                  <span class="text-xs text-muted-foreground"
                    >Действия подключатся в следующей волне.</span
                  >
                </div>
              }

              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
                <section class="min-w-0 flex flex-col gap-1" data-test="order-supply-block">
                  <div class="flex items-baseline gap-3 flex-wrap">
                    <p class="eyebrow m-0">Снабжение</p>
                    @if (mode() === 'desk') {
                      <button
                        type="button"
                        class="text-xs underline underline-offset-2 hover:text-sunrise-warm border-0 p-0 bg-transparent cursor-pointer font-inherit"
                        (click)="openSupply.emit(order())"
                        data-test="desk-supply-button"
                      >
                        Снабжение
                      </button>
                    } @else {
                      <a
                        routerLink="/supply"
                        [queryParams]="{ orderId: order()._id }"
                        class="text-xs underline underline-offset-2 hover:text-sunrise-warm"
                        data-test="order-supply-link"
                        (click)="$event.stopPropagation()"
                        >Открыть снабжение</a
                      >
                    }
                  </div>
                  @if (supplyLoading()) {
                    <p class="text-xs text-muted-foreground m-0 mt-1">Загрузка…</p>
                  } @else if (supplyError()) {
                    <p
                      class="text-xs text-destructive m-0 mt-1"
                      role="alert"
                      data-test="order-supply-error"
                    >
                      {{ supplyError() }}
                    </p>
                  } @else if (supplyCounters().total === 0) {
                    <p class="text-xs text-muted-foreground m-0 mt-1">Нет задач снабжения</p>
                  } @else {
                    <p class="text-xs m-0 mt-1" data-test="order-supply-counters">
                      Черновик {{ supplyCounters().draft }} · Подтверждено
                      {{ supplyCounters().confirmed }} · Заказано {{ supplyCounters().ordered }} ·
                      Получено
                      {{ supplyCounters().received }}
                      <span class="text-muted-foreground"
                        >· всего {{ supplyCounters().total }}</span
                      >
                    </p>
                  }
                </section>

                <section class="min-w-0 flex flex-col gap-1" data-test="order-production-block">
                  <p class="eyebrow m-0 mb-1">Производство</p>
                  <p class="text-sm m-0">Оценка в цехе</p>
                  <a
                    routerLink="/production"
                    [queryParams]="{ orderId: order()._id }"
                    class="text-xs underline underline-offset-2 hover:text-sunrise-warm mt-2 inline-block"
                    data-test="order-production-link"
                    (click)="$event.stopPropagation()"
                    >Открыть производство</a
                  >
                </section>

                <section class="min-w-0 flex flex-col gap-1" data-test="order-readiness-block">
                  <div class="flex items-baseline gap-3 flex-wrap">
                    <p class="eyebrow m-0">Готовность</p>
                    @if (mode() === 'hub') {
                      <a
                        [routerLink]="['/orders', order()._id]"
                        class="text-xs underline underline-offset-2 hover:text-sunrise-warm"
                        data-test="order-readiness-link"
                        (click)="$event.stopPropagation()"
                        >Открыть заказ</a
                      >
                    }
                  </div>
                  <p class="text-sm m-0 mt-1" data-test="order-readiness-summary">
                    {{ readinessLabel() }}
                  </p>
                  @if ((order().items?.length ?? 0) === 0) {
                    <p class="text-xs text-muted-foreground m-0 mt-1">Нет линий для готовности.</p>
                  } @else {
                    <ul class="m-0 mt-1 pl-4 space-y-0.5 text-sm" data-test="order-readiness-lines">
                      @for (item of order().items ?? []; track $index) {
                        <li>
                          {{ lineLabel(item) }}
                          ·
                          <span
                            [class.text-muted-foreground]="item.readyForWork !== true"
                            [attr.data-test]="
                              item.readyForWork === true
                                ? 'order-readiness-ready'
                                : 'order-readiness-not-ready'
                            "
                          >
                            {{ item.readyForWork === true ? 'готово' : 'не готово' }}
                          </span>
                        </li>
                      }
                    </ul>
                  }
                </section>
              </div>
            </section>

            <!-- ───── Комбайн-strip ───── -->
            <section class="min-w-0" data-test="order-group-combine">
              <div class="flex items-baseline gap-2 border-b hairline pb-2 mb-4">
                <p class="eyebrow m-0">Комбайн</p>
                <span class="text-xs text-muted-foreground">колонки линий</span>
              </div>
              @if ((order().items?.length ?? 0) === 0) {
                <p class="text-xs text-muted-foreground m-0">Нет линий.</p>
              } @else {
                <ul class="m-0 space-y-1" data-test="order-combine-strip">
                  @for (item of order().items ?? []; track trackItem($index, item)) {
                    <li
                      class="flex items-center justify-between gap-3 text-sm"
                      data-test="order-combine-line"
                    >
                      <span class="min-w-0 truncate">{{ lineLabel(item) }}</span>
                      <span class="text-xs text-sunrise-warm whitespace-nowrap">{{
                        boardLaneLabel(item)
                      }}</span>
                    </li>
                  }
                </ul>
              }
            </section>

            <!-- ───── Логистика ───── -->
            <section class="min-w-0" data-test="order-group-logistics">
              <div class="flex items-baseline gap-2 border-b hairline pb-2 mb-4">
                <p class="eyebrow m-0">Логистика</p>
                <span class="text-xs text-muted-foreground">склад и отгрузка</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <section class="min-w-0 flex flex-col gap-1" data-test="order-warehouse-block">
                  <div class="flex items-baseline gap-3 flex-wrap">
                    <p class="eyebrow m-0">Склад</p>
                    <a
                      routerLink="/storage-items"
                      class="text-xs underline underline-offset-2 hover:text-sunrise-warm"
                      data-test="order-warehouse-link"
                      (click)="$event.stopPropagation()"
                      >Склад</a
                    >
                  </div>
                  @if (reservationLoading() && reservationActive()) {
                    <p class="text-xs text-muted-foreground m-0 mt-1">Загрузка…</p>
                  } @else if (reservationError() && reservationActive()) {
                    <p
                      class="text-xs text-destructive m-0 mt-1"
                      role="alert"
                      data-test="order-warehouse-error"
                    >
                      {{ reservationError() }}
                    </p>
                  } @else if (reservationActive() && reservationCounters().total === 0) {
                    <p class="text-xs text-muted-foreground m-0 mt-1">Нет броней</p>
                  } @else if (reservationActive()) {
                    <p class="text-xs m-0 mt-1" data-test="order-warehouse-counters">
                      Активных {{ reservationCounters().active }} · всего
                      {{ reservationCounters().total }}
                    </p>
                  }
                </section>

                <section class="min-w-0 flex flex-col gap-1" data-test="order-shipping-block">
                  <p class="eyebrow m-0 mb-1">Отгрузка</p>
                  <p class="text-sm m-0" data-test="order-shipping-stub">
                    Отгрузка пока не ведётся в интерфейсе. Открыть раздел „Отгрузка“.
                  </p>
                  <a
                    routerLink="/shipping"
                    class="text-xs underline underline-offset-2 hover:text-sunrise-warm mt-2 inline-block"
                    data-test="order-shipping-link"
                    (click)="$event.stopPropagation()"
                    >Открыть раздел „Отгрузка“</a
                  >
                </section>
              </div>
            </section>

            <!-- ───── Документы ───── -->
            <section class="min-w-0" data-test="order-group-documents">
              <div class="flex items-baseline gap-2 border-b hairline pb-2 mb-4">
                <p class="eyebrow m-0">Документы</p>
                <span class="text-xs text-muted-foreground">печатные материалы и шаблоны</span>
              </div>
              <div class="text-sm flex items-center gap-4 flex-wrap">
                @if (mode() === 'desk') {
                  <button
                    type="button"
                    class="text-xs underline underline-offset-2 hover:text-sunrise-warm border-0 p-0 bg-transparent cursor-pointer font-inherit"
                    (click)="createDocument.emit(order())"
                    data-test="desk-create-document-button"
                  >
                    Создать документ
                  </button>
                  <button
                    type="button"
                    class="text-xs underline underline-offset-2 hover:text-sunrise-warm border-0 p-0 bg-transparent cursor-pointer font-inherit"
                    (click)="openDocs.emit(order())"
                    data-test="desk-docs-button"
                  >
                    Шаблоны документов
                  </button>
                } @else {
                  <a
                    routerLink="/doc-constructor/templates"
                    [queryParams]="{ source: 'order', sourceId: order()._id }"
                    class="text-xs underline underline-offset-2 hover:text-sunrise-warm"
                    data-test="order-documents-link"
                    (click)="$event.stopPropagation()"
                    >Шаблоны документов</a
                  >
                }
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .order-hub-tray {
        min-width: 0;
      }
    `,
  ],
})
export class OrderHubTrayComponent implements OnInit {
  readonly order = input.required<Order>();
  readonly mode = input<'hub' | 'desk'>('hub');
  /** Desk-only client fact; host owns the counterparty lookup. */
  readonly clientLabel = input<string>('');

  // ── Hub-hosted reservation state (HUB-304) ──
  readonly reservationLoading = input(false);
  readonly reservationError = input<string | null>(null);
  readonly reservationActive = input(false);
  readonly reservationCounters = input<ReservationExpandCounters>({
    ...EMPTY_RESERVATION_COUNTERS,
  });

  // ── Desk actions (wired by host) ──
  readonly primaryCta = output<Order>();
  readonly openSupply = output<Order>();
  readonly openDocs = output<Order>();
  readonly createDocument = output<Order>();
  readonly addLines = output<Order>();

  // ── Tray-owned composition forest (lazy on toggle) ──
  private readonly compositionExpanded = signal(false);
  private readonly compositionLoading = signal(false);
  private readonly compositionForest = signal<CompositionTreeNode[]>([]);
  private readonly compositionSelectedId = signal<string | null>(null);
  private readonly compositionRequestedDepth = signal(ORDER_TREE_INITIAL_DEPTH);
  private readonly catalogEditBusy = signal(false);
  private compositionLoadSeq = 0;

  // ── Tray-owned lazy supply (HUB-303 pattern, load on expand) ──
  private readonly supplyLoading = signal(false);
  private readonly supplyError = signal<string | null>(null);
  private readonly supplyCounters = signal<Record<SupplyTaskStatus, number> & { total: number }>({
    ...EMPTY_SUPPLY_COUNTERS,
  });
  private supplyLoadSeq = 0;

  private readonly catalog = inject(ProductModulesService);
  private readonly products = inject(ProductsService);
  private readonly materials = inject(MaterialsService);
  private readonly supply = inject(SupplyTaskService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    // The tray only exists while its row is expanded, so this is the
    // HUB-303 lazy-on-expand load. Runs after the required order input
    // is available (constructor cannot read signal inputs yet).
    this.loadSupply(this.order()._id);
  }

  protected statusLabel(status: OrderStatus): string {
    return STATUS_LABELS[status];
  }

  protected primaryCtaLabel(): string {
    return PRIMARY_CTA_LABELS[this.order().status];
  }

  protected itemCountLabel(count: number): string {
    return pluralize(count, ['позиция', 'позиции', 'позиций']);
  }

  protected readinessLabel(): string {
    const items = this.order().items ?? [];
    if (items.length === 0) return '—';
    const ready = items.filter((item) => item.readyForWork === true).length;
    return `${ready} из ${items.length}`;
  }

  protected lineLabel(line: OrderItem): string {
    return line.productName || `Изделие ${line.productId.slice(0, 8)}…`;
  }

  protected boardLaneLabel(item: OrderItem): string {
    const lane =
      item.boardLane ?? (item.status ? STATUS_TO_BOARD_LANE[item.status] : undefined) ?? 'prep';
    return BOARD_LANE_LABELS[lane];
  }

  protected trackItem(index: number, line: OrderItem): string {
    return `${index}:${line.productId}`;
  }

  protected toggleComposition(): void {
    const closing = this.compositionExpanded();
    this.compositionExpanded.set(!closing);
    if (closing) {
      this.clearComposition();
      return;
    }
    this.compositionRequestedDepth.set(ORDER_TREE_INITIAL_DEPTH);
    this.loadComposition();
  }

  protected onCompositionSelect(ev: CompositionTreeSelectEvent): void {
    this.compositionSelectedId.set(ev.node._id);
    if (isEmptyCatalogBranch(ev.node)) {
      openCatalogEditFromTree(this.catalogEditDeps(), ev);
    }
  }

  protected onCompositionEdit(ev: CompositionTreeEditEvent): void {
    this.compositionSelectedId.set(ev.node._id);
    openCatalogEditFromTree(this.catalogEditDeps(), ev);
  }

  protected onCompositionExpand(ev: CompositionTreeExpandEvent): void {
    if (!ev.expanded) return;
    const depth = this.depthOfComposition(ev.node);
    if (depth < 0) return;
    const need = Math.min(depth + 2, ORDER_TREE_MAX_DEPTH);
    if (need <= this.compositionRequestedDepth()) return;
    this.compositionRequestedDepth.set(need);
    this.loadComposition();
  }

  private catalogEditDeps(): CatalogCompositionEditDeps {
    return {
      dialog: this.dialog,
      products: this.products,
      modules: this.catalog,
      materials: this.materials,
      toast: this.toast,
      injector: this.injector,
      destroyRef: this.destroyRef,
      busy: this.catalogEditBusy,
      onSaved: () => this.loadComposition(),
    };
  }

  private loadComposition(): void {
    const items = this.order().items ?? [];
    if (items.length === 0) {
      this.compositionForest.set([]);
      this.compositionLoading.set(false);
      return;
    }
    const seq = ++this.compositionLoadSeq;
    this.compositionLoading.set(true);
    loadOrderCompositionForest(this.catalog, items, this.compositionRequestedDepth()).subscribe(
      (roots) => {
        if (seq !== this.compositionLoadSeq) return;
        this.compositionLoading.set(false);
        this.compositionForest.set(roots);
      },
    );
  }

  private clearComposition(): void {
    this.compositionForest.set([]);
    this.compositionLoading.set(false);
    this.compositionSelectedId.set(null);
    this.compositionRequestedDepth.set(ORDER_TREE_INITIAL_DEPTH);
  }

  private depthOfComposition(
    target: CompositionTreeNode,
    roots: CompositionTreeNode[] = this.compositionForest(),
  ): number {
    for (const root of roots) {
      const found = this.depthInComposition(target, root, 0);
      if (found !== -1) return found;
    }
    return -1;
  }

  private depthInComposition(
    target: CompositionTreeNode,
    node: CompositionTreeNode,
    depth: number,
  ): number {
    if (node._id === target._id) return depth;
    for (const child of node.children) {
      const found = this.depthInComposition(target, child, depth + 1);
      if (found !== -1) return found;
    }
    return -1;
  }

  private loadSupply(orderId: string): void {
    const seq = ++this.supplyLoadSeq;
    this.supplyLoading.set(true);
    this.supplyError.set(null);
    this.supplyCounters.set({ ...EMPTY_SUPPLY_COUNTERS });
    this.supply.list({ orderId }).subscribe((res) => {
      if (seq !== this.supplyLoadSeq) return;
      this.supplyLoading.set(false);
      if (!res.ok) {
        this.supplyError.set(
          extractErrorMessage(res.error) || 'Не удалось загрузить задачи снабжения',
        );
        this.supplyCounters.set({ ...EMPTY_SUPPLY_COUNTERS });
        return;
      }
      this.supplyCounters.set(this.countSupplyStatuses(res.data ?? []));
    });
  }

  private countSupplyStatuses(
    tasks: SupplyTask[],
  ): Record<SupplyTaskStatus, number> & { total: number } {
    const counters: Record<SupplyTaskStatus, number> & { total: number } = {
      ...EMPTY_SUPPLY_COUNTERS,
    };
    for (const task of tasks) {
      counters[task.status] = (counters[task.status] ?? 0) + 1;
      counters.total += 1;
    }
    return counters;
  }
}
