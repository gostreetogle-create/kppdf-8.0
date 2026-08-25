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
import { Router, RouterLink } from '@angular/router';
import { ChevronDown, LucideAngularModule } from 'lucide-angular';

import {
  CompositionTreeComponent,
  type CompositionTreeEditEvent,
  type CompositionTreeExpandEvent,
  type CompositionTreeSelectEvent,
} from '../ui/composition/composition-tree.component';
import { CompositionTreeNode, ProductModulesService } from '../services/pi-product-modules.service';
import { ProductsService } from '../services/products.service';
import { MaterialsService } from '../services/materials.service';
import {
  SupplyTask,
  SupplyTaskService,
  type SupplyTaskStatus,
} from '../services/pi-supply.service';
import { Shipment, ShipmentsService } from '../services/shipments.service';
import { PiDialogService } from '../ui/dialog/pi-dialog.service';
import { PiToastService } from '../ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import { pluralize } from '../util/format';
import {
  loadOrderCompositionForest,
  ORDER_TREE_INITIAL_DEPTH,
  ORDER_TREE_MAX_DEPTH,
} from './order-composition-forest';
import {
  openCatalogEditFromTree,
  openCatalogViewFromTree,
  type CatalogCompositionEditDeps,
} from './open-catalog-composition-edit';
import type { BoardLane, Order, OrderItem, OrderStatus } from '../services/orders.service';

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

/** TZ-DESK-440: tray primary CTA is a live action only — confirm on draft.
 *  Statuses past draft rely on their badge + real controls (ship, etc.). */
const PRIMARY_CTA_LABELS: Partial<Record<OrderStatus, string>> = {
  draft: 'Подтвердить',
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
 * Shared order summary tray (TZ-DESK-412, extended by 403 and 413).
 *
 * 413 layout: a summary bar + two-column card grid (Состав left, stacked
 * execution/logistics cards right on wide screens). The tray owns the live
 * catalog composition forest (lazy on toggle; open-by-default on desk) and
 * the lazy supply counters (HUB-303 pattern). Reservations stay hub-hosted.
 *
 * Data-test contract: the `order-*` selectors mirror orders.page's former
 * `#expandedTpl` 1:1 so HUB-302/303/304 characterization specs keep passing.
 */
@Component({
  selector: 'app-order-hub-tray',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule, CompositionTreeComponent],
  template: `
    <div
      class="order-hub-tray"
      [class.order-hub-tray--desk]="mode() === 'desk'"
      data-test="order-hub-tray"
      [attr.id]="'order-hub-tray-' + order()._id"
      [attr.data-mode]="mode()"
    >
      <div
        class="bg-paper-2 border-t hairline relative"
        [class.p-4]="mode() === 'desk'"
        [class.px-4]="mode() !== 'desk'"
        [class.py-5]="mode() !== 'desk'"
        data-test="expanded-content"
        role="region"
        [attr.aria-label]="'Сводка заказа: ' + order().number"
      >
        <div class="absolute left-0 top-0 bottom-0 w-1 bg-gold" aria-hidden="true"></div>
        <div class="relative" data-test="expanded-content-body">
          <!-- ───── Summary bar ───── -->
          <div
            class="flex flex-wrap items-center gap-3 border-b hairline"
            [class.pb-3]="mode() === 'desk'"
            [class.mb-3]="mode() === 'desk'"
            [class.pb-4]="mode() !== 'desk'"
            [class.mb-4]="mode() !== 'desk'"
            data-test="order-summary-bar"
          >
            <span
              class="text-xs px-2 py-0.5 rounded-sm hairline bg-paper text-sunrise-warm whitespace-nowrap"
              data-test="order-summary-status"
              >{{ statusLabel(order().status) }}</span
            >
            @if (mode() === 'desk' && deskPrimaryCtaVisible()) {
              <span class="flex-1" aria-hidden="true"></span>
              <div class="flex flex-col items-end gap-1">
                <button
                  type="button"
                  class="min-h-touch px-3 py-1.5 border border-rule-strong rounded-sm text-sm pi-focus-ring"
                  [class.bg-gold]="canConfirm()"
                  [class.text-ink]="canConfirm()"
                  [class.bg-paper]="!canConfirm()"
                  [class.text-muted-foreground]="!canConfirm()"
                  [attr.aria-disabled]="!canConfirm()"
                  [title]="canConfirm() ? null : primaryCtaDisabledReason()"
                  data-test="desk-primary-cta"
                  [attr.aria-label]="primaryCtaLabel()"
                  (click)="onPrimaryCtaClick()"
                >
                  {{ primaryCtaLabel() }}
                </button>
                @if (primaryCtaHint()) {
                  <span
                    class="text-[11px] leading-4 text-muted-foreground text-right"
                    role="status"
                    data-test="desk-primary-cta-hint"
                  >
                    {{ primaryCtaHint() }}
                  </span>
                }
              </div>
            }
          </div>

          <!-- ───── Card grid ───── -->
          <div
            class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_min(22rem,40%)] items-start"
            [class.gap-5]="mode() !== 'desk'"
            [class.gap-0]="mode() === 'desk'"
            data-test="order-lifecycle-groups"
          >
            <!-- Left: Состав -->
            <section
              class="min-w-0 hairline rounded-sm p-4"
              [class.bg-paper-raised]="mode() === 'desk'"
              [class.bg-paper]="mode() !== 'desk'"
              data-test="order-group-order"
            >
              <section class="min-w-0 flex flex-col gap-1" data-test="order-composition-block">
                <button
                  type="button"
                  class="flex items-center gap-3 w-full min-h-touch text-left text-sm text-ink pi-focus-ring rounded-sm hover:bg-paper-2 px-2 -mx-2"
                  [attr.aria-expanded]="compositionExpanded()"
                  [attr.aria-controls]="'order-composition-' + order()._id"
                  (click)="toggleComposition()"
                  data-test="order-composition-toggle"
                >
                  <lucide-icon
                    [img]="chevronDownIcon"
                    [size]="16"
                    class="shrink-0 transition-transform"
                    [class.rotate-180]="compositionExpanded()"
                    aria-hidden="true"
                  ></lucide-icon>
                  <span class="font-medium">Состав заказа</span>
                  <span class="flex-1"></span>
                  <span class="text-xs text-muted-foreground">
                    {{ order().items?.length ?? 0 }}
                    {{ itemCountLabel(order().items?.length ?? 0) }}
                  </span>
                  <span class="border hairline px-2 py-0.5 text-xs rounded-sm" aria-hidden="true">
                    {{ compositionExpanded() ? 'свернуть' : 'раскрыть' }}
                  </span>
                </button>
                @if (compositionExpanded()) {
                  <div
                    class="border-t hairline pt-3 mt-1"
                    [id]="'order-composition-' + order()._id"
                    data-test="order-composition-panel"
                  >
                    @if ((order().items?.length ?? 0) === 0) {
                      @if (mode() === 'hub') {
                        <p class="text-xs text-muted-foreground m-0">Состав пуст.</p>
                      }
                    } @else if (compositionLoading()) {
                      <p
                        class="text-sm text-muted-foreground py-3 m-0"
                        data-test="order-composition-loading"
                      >
                        Загрузка состава…
                      </p>
                    } @else if (compositionForest().length > 0) {
                      <div class="space-y-3" data-test="order-composition-tree">
                        @for (root of compositionForest(); track $index) {
                          <div
                            class="text-xs text-muted-foreground mb-1"
                            data-test="order-item-fact"
                          >
                            {{
                              lineLabel(
                                order().items?.[$index] ?? {
                                  productId: root._id,
                                  quantity: 1,
                                  unitPrice: 0,
                                }
                              )
                            }}
                            ·
                            {{
                              boardLaneLabel(
                                order().items?.[$index] ?? {
                                  productId: root._id,
                                  quantity: 1,
                                  unitPrice: 0,
                                }
                              )
                            }}
                            ·
                            {{
                              order().items?.[$index]?.readyForWork === true
                                ? 'готово'
                                : 'не готово'
                            }}
                          </div>
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
                        class="m-0 mt-1 pl-5 space-y-1 text-sm"
                        data-test="order-composition-lines"
                      >
                        @for (line of order().items ?? []; track trackItem($index, line)) {
                          <li data-test="order-composition-line">{{ lineLabel(line) }}</li>
                        }
                      </ul>
                    }
                    @if (mode() === 'desk') {
                      <button
                        type="button"
                        class="min-h-touch px-3 py-1.5 mt-3 border border-rule-strong rounded-sm bg-transparent text-sm"
                        (click)="addLines.emit(order())"
                        data-test="desk-add-line-cta"
                      >
                        Добавить изделие
                      </button>
                    } @else {
                      <a
                        [routerLink]="['/orders', order()._id]"
                        class="min-h-touch px-3 py-1.5 mt-3 inline-flex items-center border border-rule-strong rounded-sm bg-transparent text-sm"
                        (click)="$event.stopPropagation()"
                        >Открыть карточку заказа</a
                      >
                    }
                  </div>
                }
              </section>
            </section>

            <!-- Right stack -->
            <div
              class="min-w-0"
              [class.space-y-4]="mode() !== 'desk'"
              [class.divide-y]="mode() === 'desk'"
              [class.hairline]="mode() === 'desk'"
              [class.xl:border-l]="mode() === 'desk'"
              [class.xl:pl-4]="mode() === 'desk'"
            >
              <!-- Исполнение -->
              <section
                class="min-w-0 hairline rounded-sm p-4"
                [class.bg-paper-raised]="mode() === 'desk'"
                [class.bg-paper]="mode() !== 'desk'"
                [class.border-0]="mode() === 'desk'"
                data-test="order-group-execution"
              >
                <h3 class="text-sm font-medium text-ink m-0 mb-2">Исполнение</h3>

                <div class="flex flex-wrap gap-1.5 mb-3" data-test="order-combine-strip">
                  @if ((order().items?.length ?? 0) === 0) {
                    <span class="text-xs text-muted-foreground">Готовность —</span>
                  } @else {
                    @for (item of order().items ?? []; track trackItem($index, item)) {
                      <span
                        class="text-xs px-2 py-0.5 rounded-sm hairline bg-paper-2 text-sunrise-warm whitespace-nowrap"
                        data-test="order-combine-line"
                        [attr.title]="lineLabel(item)"
                      >
                        {{ boardLaneLabel(item) }}
                      </span>
                    }
                  }
                </div>

                <section
                  class="min-w-0 flex flex-col gap-1 border-t hairline pt-3"
                  data-test="order-readiness-block"
                >
                  <div class="flex items-baseline gap-3 flex-wrap">
                    <span class="text-xs text-muted-foreground">Готовность</span>
                    <span class="text-sm m-0 font-medium" data-test="order-readiness-summary">
                      {{ readinessLabel() }}
                    </span>
                    @if (mode() === 'hub') {
                      <a
                        [routerLink]="['/orders', order()._id]"
                        class="min-h-touch px-2 py-1 ml-auto inline-flex items-center border border-rule-strong rounded-sm bg-transparent text-xs"
                        data-test="order-readiness-link"
                        (click)="$event.stopPropagation()"
                        >Открыть заказ</a
                      >
                    }
                  </div>
                  @if ((order().items?.length ?? 0) > 0) {
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
              </section>

              <!-- Снабжение + Производство -->
              <section
                class="min-w-0 hairline rounded-sm p-4"
                [class.bg-paper-raised]="mode() === 'desk'"
                [class.bg-paper]="mode() !== 'desk'"
                [class.border-0]="mode() === 'desk'"
                data-test="order-group-supply"
              >
                <button
                  type="button"
                  class="flex items-center gap-3 w-full min-h-touch text-left text-sm font-medium text-ink pi-focus-ring rounded-sm hover:bg-paper-2 px-2 -mx-2"
                  [attr.aria-expanded]="supplyExpanded()"
                  aria-controls="order-supply-content"
                  (click)="toggleSupply()"
                >
                  <lucide-icon
                    [img]="chevronDownIcon"
                    [size]="16"
                    class="shrink-0 transition-transform"
                    [class.rotate-180]="supplyExpanded()"
                    aria-hidden="true"
                  ></lucide-icon>
                  <span>Снабжение и производство</span>
                  <span class="flex-1"></span>
                  <span class="text-xs text-muted-foreground">{{ supplySummary() }}</span>
                  <span class="border hairline px-2 py-0.5 text-xs rounded-sm" aria-hidden="true">
                    {{ supplyExpanded() ? 'свернуть' : 'раскрыть' }}
                  </span>
                </button>
                @if (supplyExpanded()) {
                  <div id="order-supply-content" class="pt-3">
                    <section class="min-w-0 flex flex-col gap-1.5" data-test="order-supply-block">
                      <span class="text-xs text-muted-foreground">Снабжение</span>
                      @if (mode() === 'desk') {
                        <button
                          type="button"
                          class="w-full min-h-touch px-2 py-1.5 border border-rule-strong rounded-sm bg-transparent text-xs"
                          (click)="openSupply.emit(order())"
                          data-test="desk-supply-button"
                        >
                          Снабжение
                        </button>
                      } @else {
                        <a
                          routerLink="/supply"
                          [queryParams]="{ orderId: order()._id }"
                          class="w-full min-h-touch px-2 py-1.5 inline-flex items-center justify-center border border-rule-strong rounded-sm bg-transparent text-xs"
                          data-test="order-supply-link"
                          (click)="$event.stopPropagation()"
                          >Снабжение</a
                        >
                      }
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
                      } @else if (supplyCounters().total > 0) {
                        <p class="text-xs m-0 mt-1" data-test="order-supply-counters">
                          Заказано {{ supplyCounters().ordered }} · Получено
                          {{ supplyCounters().received }} · всего {{ supplyCounters().total }}
                        </p>
                      }
                    </section>
                    <section
                      class="min-w-0 flex flex-col gap-1.5 border-t hairline pt-3 mt-3"
                      data-test="order-production-block"
                    >
                      <span class="text-xs text-muted-foreground">Производство</span>
                      @if (mode() === 'desk') {
                        <p
                          class="text-xs text-muted-foreground m-0"
                          data-test="order-production-summary"
                        >
                          {{ readinessLabel() }} · подробнее — chip «Гант»
                        </p>
                      } @else {
                        <a
                          routerLink="/production"
                          [queryParams]="productionQueryParams()"
                          class="w-full min-h-touch px-2 py-1.5 inline-flex items-center justify-center border border-rule-strong rounded-sm bg-transparent text-xs"
                          data-test="order-production-link"
                          (click)="$event.stopPropagation()"
                          >Производство</a
                        >
                      }
                    </section>
                  </div>
                }
              </section>

              <!-- Логистика + Документы -->
              <section
                class="min-w-0 hairline rounded-sm p-4"
                [class.bg-paper-raised]="mode() === 'desk'"
                [class.bg-paper]="mode() !== 'desk'"
                [class.border-0]="mode() === 'desk'"
                data-test="order-group-logistics"
              >
                <button
                  type="button"
                  class="flex items-center gap-3 w-full min-h-touch text-left text-sm font-medium text-ink pi-focus-ring rounded-sm hover:bg-paper-2 px-2 -mx-2"
                  [attr.aria-expanded]="logisticsExpanded()"
                  aria-controls="order-logistics-content"
                  (click)="toggleLogistics()"
                >
                  <lucide-icon
                    [img]="chevronDownIcon"
                    [size]="16"
                    class="shrink-0 transition-transform"
                    [class.rotate-180]="logisticsExpanded()"
                    aria-hidden="true"
                  ></lucide-icon>
                  <span>Логистика и документы</span>
                  <span class="flex-1"></span>
                  <span class="text-xs text-muted-foreground">{{ logisticsSummary() }}</span>
                  <span class="border hairline px-2 py-0.5 text-xs rounded-sm" aria-hidden="true">
                    {{ logisticsExpanded() ? 'свернуть' : 'раскрыть' }}
                  </span>
                </button>
                @if (logisticsExpanded()) {
                  <div id="order-logistics-content" class="pt-3">
                    <section class="min-w-0 flex flex-col gap-1" data-test="order-warehouse-block">
                      <div class="flex items-baseline gap-3 flex-wrap">
                        <span class="text-xs text-muted-foreground">Склад</span>
                        @if (mode() !== 'desk') {
                          <a
                            routerLink="/storage-items"
                            class="min-h-touch px-2 py-1 border border-rule-strong rounded-sm bg-transparent text-xs ml-auto"
                            data-test="order-warehouse-link"
                            (click)="$event.stopPropagation()"
                            >Открыть</a
                          >
                        }
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

                    <section
                      class="min-w-0 flex flex-col gap-1 border-t hairline pt-2 mt-2"
                      data-test="order-shipping-block"
                    >
                      <div class="flex items-baseline gap-3 flex-wrap">
                        <span class="text-xs text-muted-foreground">Отгрузка</span>
                        @if (mode() !== 'desk') {
                          <a
                            routerLink="/shipping"
                            class="min-h-touch px-2 py-1 border border-rule-strong rounded-sm bg-transparent text-xs ml-auto"
                            data-test="order-shipping-link"
                            (click)="$event.stopPropagation()"
                            >Открыть раздел „Отгрузка“</a
                          >
                        }
                      </div>
                      @if (mode() === 'desk') {
                        @if (shipmentsLoading()) {
                          <p class="text-xs text-muted-foreground m-0 mt-1">Загрузка…</p>
                        } @else if (shipmentsError()) {
                          <p
                            class="text-xs text-destructive m-0 mt-1"
                            role="alert"
                            data-test="order-shipment-error"
                          >
                            {{ shipmentsError() }}
                          </p>
                        } @else if (hasShipment()) {
                          <div class="flex flex-col gap-0.5 mt-1" data-test="order-shipment-block">
                            <span class="text-xs" data-test="order-shipment-summary">
                              Отгружен: {{ shipmentNumber() }} · {{ shipmentDateLabel() }}
                            </span>
                            @if (!shipmentHasDocs()) {
                              <span
                                class="text-xs text-muted-foreground"
                                data-test="order-shipment-no-docs"
                              >
                                Документ не оформлен
                              </span>
                            }
                            @if (shipmentCancellable()) {
                              <button
                                type="button"
                                class="w-full min-h-touch px-2 py-1.5 mt-1 border border-rule-strong rounded-sm bg-transparent text-xs pi-focus-ring"
                                (click)="cancelShipment.emit(activeShipment()!)"
                                data-test="desk-cancel-shipment-button"
                              >
                                Отменить отгрузку
                              </button>
                            }
                          </div>
                        } @else if (canMarkShipped()) {
                          <button
                            type="button"
                            class="w-full min-h-touch px-2 py-1.5 mt-1 border border-rule-strong rounded-sm bg-transparent text-xs pi-focus-ring"
                            (click)="markShipped.emit(order())"
                            data-test="desk-ship-button"
                          >
                            Отгружено
                          </button>
                        } @else {
                          <span
                            class="text-xs text-muted-foreground mt-1"
                            data-test="order-shipping-summary"
                          >
                            {{ statusLabel(order().status) }}
                          </span>
                        }
                      }
                    </section>
                  </div>
                }

                <section
                  class="min-w-0 flex flex-col gap-1.5 border-t hairline pt-2 mt-2"
                  data-test="order-group-documents"
                >
                  <span class="text-xs text-muted-foreground">Документы</span>
                  @if (mode() === 'desk') {
                    <div class="flex flex-col gap-2">
                      <button
                        type="button"
                        class="w-full min-h-touch px-2 py-1.5 border border-rule-strong rounded-sm bg-transparent text-xs"
                        (click)="createDocument.emit(order())"
                        data-test="desk-create-document-button"
                      >
                        Создать документ
                      </button>
                      <button
                        type="button"
                        class="w-full min-h-touch px-2 py-1.5 border border-rule-strong rounded-sm bg-transparent text-xs"
                        (click)="openDocs.emit(order())"
                        data-test="desk-docs-button"
                      >
                        Шаблоны
                      </button>
                      <button
                        type="button"
                        class="w-full min-h-touch px-2 py-1.5 border border-rule-strong rounded-sm bg-transparent text-xs"
                        (click)="openNotebook.emit(order())"
                        data-test="desk-notebook-button"
                      >
                        Блокнот
                      </button>
                    </div>
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
                </section>
              </section>
            </div>
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
  /** TZ-DESK-428: disclosure chevron (rotate when expanded). */
  protected readonly chevronDownIcon = ChevronDown;

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
  readonly openNotebook = output<Order>();
  /** DESK-430: host opens the ship-confirm dialog and calls OrdersService.ship(). */
  readonly markShipped = output<Order>();
  /** TZ-SHIP-433: host opens the cancel confirm and calls ShipmentsService.cancelShipment(). */
  readonly cancelShipment = output<Shipment>();

  // ── Tray-owned composition forest (lazy on toggle; open-by-default desk) ──
  protected readonly compositionExpanded = signal(false);
  protected readonly compositionLoading = signal(false);
  protected readonly compositionForest = signal<CompositionTreeNode[]>([]);
  protected readonly compositionSelectedId = signal<string | null>(null);
  protected readonly compositionRequestedDepth = signal(ORDER_TREE_INITIAL_DEPTH);
  protected readonly catalogEditBusy = signal(false);
  private compositionLoadSeq = 0;

  // ── Tray-owned lazy supply (HUB-303 pattern, load on expand) ──
  protected readonly supplyLoading = signal(false);
  protected readonly supplyError = signal<string | null>(null);
  protected readonly supplyExpanded = signal(false);
  protected readonly logisticsExpanded = signal(false);
  protected readonly primaryCtaHint = signal('');
  private primaryCtaHintTimer: ReturnType<typeof setTimeout> | null = null;
  protected readonly supplyCounters = signal<Record<SupplyTaskStatus, number> & { total: number }>({
    ...EMPTY_SUPPLY_COUNTERS,
  });
  private supplyLoadSeq = 0;

  // ── Tray-owned lazy shipments (DESK-430, HUB-303 pattern, load on expand) ──
  protected readonly shipmentsLoading = signal(false);
  protected readonly shipmentsError = signal<string | null>(null);
  protected readonly shipments = signal<Shipment[]>([]);
  private shipmentsLoadSeq = 0;

  private readonly catalog = inject(ProductModulesService);
  private readonly router = inject(Router);
  private readonly products = inject(ProductsService);
  private readonly materials = inject(MaterialsService);
  private readonly supply = inject(SupplyTaskService);
  private readonly shipmentsService = inject(ShipmentsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    // The tray only exists while its row is expanded, so this is the
    // HUB-303 lazy-on-expand load. Runs after the required order input
    // is available (constructor cannot read signal inputs yet).
    this.loadSupply(this.order()._id);
    // 413: desk shows the composition as the primary surface by default.
    if (this.mode() === 'desk') {
      this.compositionExpanded.set(true);
      this.loadComposition();
      this.loadShipments(this.order()._id);
    }
    if (
      this.reservationError() ||
      this.supplyError() ||
      this.order().status === 'ready' ||
      this.order().status === 'shipped'
    ) {
      this.logisticsExpanded.set(true);
    }
    this.destroyRef.onDestroy(() => {
      if (this.primaryCtaHintTimer) clearTimeout(this.primaryCtaHintTimer);
    });
  }

  /** Desk host: `/production` shows «На стол». Hub stays `{ orderId }` only (HUB-303). */
  protected productionQueryParams(): { orderId: string; from?: 'desk' } {
    const orderId = this.order()._id;
    return this.mode() === 'desk' ? { orderId, from: 'desk' } : { orderId };
  }

  protected statusLabel(status: OrderStatus): string {
    return STATUS_LABELS[status];
  }

  protected primaryCtaLabel(): string {
    return PRIMARY_CTA_LABELS[this.order().status] ?? '';
  }

  /** TZ-DESK-440: desk primary CTA is live only — confirm on draft, hidden past draft. */
  protected deskPrimaryCtaVisible(): boolean {
    return this.order().status === 'draft';
  }

  protected canConfirm(): boolean {
    const order = this.order();
    return order.status === 'draft' && !!order.siteId && (order.items?.length ?? 0) > 0;
  }

  protected onPrimaryCtaClick(): void {
    if (this.canConfirm()) {
      this.primaryCta.emit(this.order());
      return;
    }
    this.primaryCtaHint.set(this.primaryCtaDisabledReason());
    if (this.primaryCtaHintTimer) clearTimeout(this.primaryCtaHintTimer);
    this.primaryCtaHintTimer = setTimeout(() => this.primaryCtaHint.set(''), 4000);
  }

  protected toggleSupply(): void {
    this.supplyExpanded.update((open) => !open);
  }

  protected toggleLogistics(): void {
    this.logisticsExpanded.update((open) => !open);
  }

  protected supplySummary(): string {
    const counters = this.supplyCounters();
    return counters.total > 0 ? `Задач ${counters.total}` : 'Задач —';
  }

  protected logisticsSummary(): string {
    const counters = this.reservationCounters();
    return counters.total > 0 ? `Бронь ${counters.total}` : 'Бронь —';
  }

  /** RU why-disabled copy for the desk primary CTA (411, narrowed to draft by 440). */
  protected primaryCtaDisabledReason(): string {
    const order = this.order();
    if (order.status !== 'draft') return '';
    if (!order.siteId) return 'Укажите площадку — без неё заказ нельзя подтвердить.';
    if (!(order.items?.length ?? 0)) return 'Добавьте изделия, чтобы подтвердить заказ.';
    return '';
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
    openCatalogViewFromTree(this.router, ev);
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

  // ── DESK-430: «Отгружено» без документа ──

  private loadShipments(orderId: string): void {
    const seq = ++this.shipmentsLoadSeq;
    this.shipmentsLoading.set(true);
    this.shipmentsError.set(null);
    this.shipmentsService.list({ orderId }).subscribe((res) => {
      if (seq !== this.shipmentsLoadSeq) return;
      this.shipmentsLoading.set(false);
      if (!res.ok) {
        this.shipmentsError.set(extractErrorMessage(res.error) || 'Не удалось загрузить отгрузку');
        this.shipments.set([]);
        return;
      }
      this.shipments.set(res.data ?? []);
    });
  }

  /** Reload after a successful ship() — host calls this once the POST resolves. */
  reloadShipments(): void {
    this.loadShipments(this.order()._id);
  }

  /**
   * TZ-SHIP-433 — «активная» отгрузка = не отменённая. Отменённые записи
   * остаются в реестре, но не должны держать блок «Отгружен» (AC 2).
   */
  protected activeShipment(): Shipment | null {
    return this.shipments().find((shipment) => shipment.status !== 'cancelled') ?? null;
  }

  protected hasShipment(): boolean {
    return (
      this.activeShipment() !== null ||
      this.order().status === 'shipped' ||
      this.order().status === 'delivered'
    );
  }

  protected canMarkShipped(): boolean {
    const status = this.order().status;
    return status !== 'shipped' && status !== 'delivered' && status !== 'cancelled';
  }

  /** Отмену показываем только до dispatch: draft/scheduled и без dispatchedAt. */
  protected shipmentCancellable(): boolean {
    const shipment = this.activeShipment();
    if (!shipment) return false;
    return (
      (shipment.status === 'draft' || shipment.status === 'scheduled') && !shipment.dispatchedAt
    );
  }

  protected shipmentNumber(): string {
    return this.activeShipment()?.number ?? '—';
  }

  protected shipmentDateLabel(): string {
    const raw = this.activeShipment()?.date ?? this.activeShipment()?.createdAt;
    if (!raw) return '—';
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('ru-RU');
  }

  protected shipmentHasDocs(): boolean {
    return (this.activeShipment()?.docs?.length ?? 0) > 0;
  }
}
