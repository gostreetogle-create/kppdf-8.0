import {
  afterNextRender,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  Injector,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  buildGanttTreeBars,
  buildWorkerTreeBars,
  ESTIMATE_OVERRIDE_HINT_RU,
  formatDateOnly,
  ganttModuleSummaryId,
  ganttProductSummaryId,
  ganttWorkerModuleSummaryId,
  GANTT_UNASSIGNED_BAR_FILL,
  GANTT_UNASSIGNED_CHIP_FILL,
  GANTT_UNASSIGNED_WASH,
  isModuleSummaryBar,
  isOrderSummaryBar,
  isProductSummaryBar,
  isSummaryBar,
  isUnassignedWorkerSummaryBar,
  isWorkerSummaryBar,
  ORDER_STATUS_LABELS,
  summarizeUnassignedGanttWork,
  workerGroupKeyOf,
  workTypeOklch,
  workTypeWash,
  type GanttBar,
} from '../gantt-bar.model';
import type { OrderPriority, OrderStatus } from '@kppdf/data-access';
import type { GanttGroupBy, GanttZoom } from '../production-cockpit.context';
import { ProductionScaleControlsComponent } from './production-scale-controls.component';

/** Pixels per calendar day — day zoom is denser, month packs the same span. */
export const GANTT_PX_PER_DAY: Record<GanttZoom, number> = {
  day: 36,
  month: 12,
};

/** Month density never falls below this readable minimum when the range is wide. */
export const GANTT_MONTH_MIN_PX_PER_DAY = GANTT_PX_PER_DAY.month;

export const GANTT_MONTH_NAMES_RU = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
] as const;

/**
 * Fit month density to the visible timeline pane. Day mode stays readable and
 * intentionally does not shrink when the pane is narrow.
 */
export function calculateGanttPxPerDay(
  zoom: GanttZoom,
  totalDays: number,
  timelineWidthPx: number,
): number {
  if (zoom === 'day') return GANTT_PX_PER_DAY.day;
  if (!Number.isFinite(totalDays) || totalDays <= 0 || timelineWidthPx <= 0) {
    return GANTT_MONTH_MIN_PX_PER_DAY;
  }
  return Math.max(GANTT_MONTH_MIN_PX_PER_DAY, Math.floor(timelineWidthPx / totalDays));
}

export function ganttMonthTickLabel(dateOnly: string): string {
  const month = Number(dateOnly.slice(5, 7));
  return GANTT_MONTH_NAMES_RU[month - 1] ?? dateOnly;
}

/** Days remaining in the UTC month starting at dateOnly, capped by remaining range days. */
export function ganttDaysLeftInMonth(dateOnly: string, remaining: number): number {
  const [y, m, d] = dateOnly.split('-').map(Number);
  const lastDay = new Date(Date.UTC(y!, m!, 0)).getUTCDate();
  const leftInMonth = lastDay - (d ?? 1) + 1;
  return Math.max(1, Math.min(leftInMonth, remaining));
}

/** UTC weekday short RU: getUTCDay 0→ВС … 1→ПН … 6→СБ. */
export const GANTT_WEEKDAY_SHORT_RU = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'] as const;

export function ganttWeekdayShortRu(dateOnly: string): string {
  const [y, m, d] = dateOnly.split('-').map(Number);
  const dow = new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay();
  return GANTT_WEEKDAY_SHORT_RU[dow] ?? '';
}

/** Always recenter the marker in the scrollport (Сегодня is never a silent no-op). */
export function calculateCenteredMarkerScrollLeft(opts: {
  scrollLeft: number;
  scrollWidth: number;
  clientWidth: number;
  scrollLeftEdge: number;
  markerLeft: number;
  markerWidth: number;
}): number {
  const markerCenter =
    opts.scrollLeft + (opts.markerLeft - opts.scrollLeftEdge) + opts.markerWidth / 2;
  const target = markerCenter - opts.clientWidth / 2;
  const maxScroll = Math.max(0, opts.scrollWidth - opts.clientWidth);
  return Math.max(0, Math.min(maxScroll, target));
}

/** Fixed row height (px) — label column and timeline rows must match (no multi-line drift). */
export const GANTT_ROW_PX = 44;

/** Dense inline work-type detail (people / days / hint / catalog) — one horizontal row. */
export const GANTT_DETAIL_ROW_PX = 56;

/** Dense order-meta strip under summary (status / priority / plannedDate) — one horizontal row. */
export const GANTT_META_ROW_PX = 56;

/** Label column width (Tailwind `w-52` = 13rem @ 16px). */
export const GANTT_LABEL_COL_PX = 208;

/**
 * Nest indent step for label column only (~14–16px).
 * Depth: order|worker=0, product=1, module=2, work=3 → padding-left = depth × step.
 */
export const GANTT_NEST_INDENT_PX = 15;

/**
 * TZ-PRODUCTION-350 — mono milk summary bar fills (order / product / module).
 * One warm paper hue family (~82–90); denser L/C than row wash; WT = accentHue.
 */
export const GANTT_SUMMARY_BAR_FILL = {
  order: 'oklch(0.90 0.028 86)',
  product: 'oklch(0.925 0.022 84)',
  module: 'oklch(0.945 0.016 82)',
} as const;

export type GanttRowKind = 'order' | 'worker' | 'product' | 'module' | 'work';

/** Nest depth for cascade indent (labels only; timeline bars stay flush). */
export function ganttNestDepth(kind: GanttRowKind): number {
  switch (kind) {
    case 'order':
    case 'worker':
      return 0;
    case 'product':
      return 1;
    case 'module':
      return 2;
    case 'work':
      return 3;
  }
}

export function ganttRowKind(opts: {
  isOrderSummary: boolean;
  isWorkerSummary: boolean;
  isProductSummary: boolean;
  isModuleSummary: boolean;
}): GanttRowKind {
  if (opts.isWorkerSummary) return 'worker';
  if (opts.isOrderSummary) return 'order';
  if (opts.isProductSummary) return 'product';
  if (opts.isModuleSummary) return 'module';
  return 'work';
}

const ORDER_META_PRIORITIES: { value: OrderPriority; label: string }[] = [
  { value: 'low', label: 'Низкий' },
  { value: 'normal', label: 'Обычный' },
  { value: 'high', label: 'Высокий' },
  { value: 'urgent', label: 'Срочный' },
];

/** Order-meta strip payload (parent supplies live Order fields). */
export interface GanttOrderMetaView {
  orderId: string;
  number: string;
  status: OrderStatus;
  priority: OrderPriority;
  /** YYYY-MM-DD; empty if unset. */
  plannedDate: string;
}

/** Save order-meta → parent PATCHes orders/:id. */
export interface GanttOrderMetaCommit {
  orderId: string;
  priority: OrderPriority;
  plannedDate: string;
}

/** Payload for order-level estimate days PATCH (never WorkType catalog). */
export interface GanttEstimateDaysCommit {
  orderId: string;
  orderItemIndex: number;
  moduleId: string;
  workTypeId: string;
  days: number;
}

/** Payload for body-drag → order plannedDate shift (whole chain). */
export interface GanttPlannedDateMoveCommit {
  orderId: string;
  deltaDays: number;
}

/** Payload for child body-drag → per-bar start offset (TZ-PRODUCTION-316). */
export interface GanttStartOffsetCommit {
  orderId: string;
  orderItemIndex: number;
  moduleId: string;
  workTypeId: string;
  /** Bar startDate before drag (YYYY-MM-DD). */
  startDate: string;
  deltaDays: number;
}

/** Catalog days request from work-detail — parent prompts + PATCHes WorkType. */
export interface GanttCatalogDaysRequest {
  workTypeId: string;
  currentDays: number;
}

/**
 * Snap right-edge resize delta to calendar days (≥1).
 * Pure helper — unit-tested independently of DOM.
 */
export function snapEstimateDaysFromDelta(
  baseDays: number,
  deltaPx: number,
  pxPerDay: number,
): number {
  const base = Number.isFinite(baseDays) ? Math.floor(baseDays) : 1;
  if (!Number.isFinite(pxPerDay) || pxPerDay <= 0) return Math.max(1, base);
  const deltaDays = Math.round(deltaPx / pxPerDay);
  return Math.max(1, base + deltaDays);
}

/**
 * Snap body-drag px delta to calendar days (may be negative / zero).
 */
export function snapMoveDeltaDays(deltaPx: number, pxPerDay: number): number {
  if (!Number.isFinite(pxPerDay) || pxPerDay <= 0) return 0;
  if (!Number.isFinite(deltaPx)) return 0;
  return Math.round(deltaPx / pxPerDay);
}

function isBarEstimateReadOnly(status: OrderStatus): boolean {
  return status === 'shipped' || status === 'delivered' || status === 'cancelled';
}

@Component({
  selector: 'app-gantt-bars',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductionScaleControlsComponent],
  template: `
    <div
      class="flex flex-col h-full min-h-0 bg-paper"
      [attr.data-zoom]="zoom()"
      data-test="gantt-bars-root"
      (click)="onRootClick($event)"
    >
      <div
        class="shrink-0 px-3 py-1 flex flex-wrap items-center gap-x-3 gap-y-1 border-b hairline bg-paper"
      >
        <app-production-scale-controls
          class="min-w-0 flex-1"
          [zoom]="zoom()"
          [groupBy]="groupByWorkers() ? 'workers' : 'orders'"
          (zoomChange)="zoomChange.emit($event)"
          (groupByChange)="groupByChange.emit($event)"
          (fit)="fit.emit()"
        />
        @if (usedTodayFallback()) {
          <span
            class="text-[13px] text-amber-800 dark:text-amber-300"
            data-test="gantt-today-fallback"
            >Дата начала не задана — показано от сегодня</span
          >
        }
        @if (readOnly()) {
          <span class="text-[13px] text-amber-800 dark:text-amber-300"
            >Заказ завершён/отменён — только просмотр</span
          >
        }
      </div>

      @if (unassignedSummary().workTypeNames.length) {
        <div
          class="shrink-0 px-3 py-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-hint-warn border-b hairline bg-paper"
          data-test="gantt-unassigned-banner"
          role="status"
        >
          <span>
            Без исполнителя: {{ unassignedSummary().workTypeNames.length }} видов работ — назначьте
            в
          </span>
          <a
            routerLink="/registries/workers"
            class="font-medium text-hint-warn underline underline-offset-2 shrink-0"
            data-test="gantt-unassigned-people-link"
            >Люди</a
          >
          <span class="text-hint-warn/80 truncate min-w-0">
            — {{ unassignedWorkTypeNamesPreview() }}
          </span>
        </div>
      }

      @if (warnings().length) {
        <div
          class="shrink-0 px-3 py-1 text-[13px] text-hint-warn border-b hairline bg-paper"
          data-test="gantt-warnings"
        >
          @for (w of warnings(); track w) {
            <div>{{ w }}</div>
          }
        </div>
      }

      @if (legendItems().length) {
        <div
          class="shrink-0 px-3 py-1 flex flex-wrap gap-x-3 gap-y-1 border-b hairline bg-paper text-xs text-muted-foreground"
          data-test="gantt-worktype-legend"
        >
          @for (item of legendItems(); track item.id) {
            <span class="inline-flex items-center gap-1">
              <span
                class="w-2.5 h-2.5 rounded-sm border hairline shrink-0"
                [style.background]="item.color"
              ></span>
              {{ item.name }}
            </span>
          }
        </div>
      }

      @if (!bars().length) {
        <div
          class="shrink-0 px-3 py-1 text-[13px] text-muted-foreground border-b hairline bg-paper"
          data-test="gantt-empty"
          role="status"
        >
          Нет полос оценки — календарь всё равно показан. Выберите заказ слева или заведите состав
          изделия (модули → виды работ с днями).
        </div>
      }

      <div #ganttScroll class="flex-1 min-h-0 overflow-auto gantt-scroll">
        <div class="flex" [style.minWidth.px]="timelineMinWidth()">
          <div
            class="sticky left-0 z-[3] w-52 shrink-0 border-r hairline bg-paper overflow-visible"
          >
            <div
              class="h-10 border-b hairline flex items-center text-[11px] text-muted-foreground"
              data-test="gantt-label-header"
            >
              <span class="gantt-expand-col shrink-0" aria-hidden="true"></span>
              <span class="flex-1 min-w-0 px-2 truncate">{{
                groupByWorkers() ? 'Рабочий' : 'Заказ'
              }}</span>
            </div>
            @for (row of rows(); track row.bar.id) {
              <div
                class="gantt-row-h w-full text-left border-b hairline
                       flex items-stretch min-w-0 overflow-hidden"
                [class.bg-paper-2]="
                  row.alt && row.nestDepth === 0 && !isOrderEmphasized(row.bar.orderId)
                "
                [class.border-t-2]="row.orderBoundary"
                [class.gantt-work-detail-open]="isWorkDetailOpen(row.bar.id)"
                [class.gantt-order-active]="
                  isHighlightedOrder(row.bar.orderId) && !isWorkDetailOpen(row.bar.id)
                "
                [class.gantt-order-expanded]="
                  isTreeExpandedGroup(row.bar) &&
                  !isHighlightedOrder(row.bar.orderId) &&
                  !isWorkDetailOpen(row.bar.id)
                "
                [class.gantt-order-group-start]="row.orderGroupStart"
                [class.gantt-order-group-end]="row.orderGroupEnd"
                [class.gantt-product-group-start]="row.productGroupStart"
                [class.gantt-product-group-end]="row.productGroupEnd"
                [class.gantt-product-group-mid]="row.productGroupMid"
                [class.gantt-module-group-start]="row.moduleGroupStart"
                [class.gantt-module-group-end]="row.moduleGroupEnd"
                [class.gantt-module-group-mid]="row.moduleGroupMid"
                [class.gantt-level-order]="row.rowKind === 'order' || row.rowKind === 'worker'"
                [class.gantt-level-product]="row.rowKind === 'product'"
                [class.gantt-level-module]="row.rowKind === 'module'"
                [class.gantt-level-work]="row.rowKind === 'work'"
                [attr.data-test]="'gantt-label-' + row.bar.id"
                [attr.data-nest-depth]="row.nestDepth"
                [attr.data-row-kind]="row.rowKind"
                [attr.data-active-order]="isHighlightedOrder(row.bar.orderId) ? 'true' : null"
                [attr.data-expanded-order]="isTreeExpandedGroup(row.bar) ? 'true' : null"
                [attr.data-work-detail-open]="isWorkDetailOpen(row.bar.id) ? 'true' : null"
                [attr.data-order-group-start]="row.orderGroupStart ? 'true' : null"
                [attr.data-order-group-end]="row.orderGroupEnd ? 'true' : null"
                [attr.data-product-group-start]="row.productGroupStart ? 'true' : null"
                [attr.data-product-group-end]="row.productGroupEnd ? 'true' : null"
                [attr.data-module-group-start]="row.moduleGroupStart ? 'true' : null"
                [attr.data-module-group-end]="row.moduleGroupEnd ? 'true' : null"
                [attr.data-unassigned-worker]="isUnassignedWorkerSummary(row.bar) ? 'true' : null"
                [attr.data-label-overlay]="isLabelOverlayOpen(row) ? 'true' : null"
                [class.gantt-row-label-overlay]="isLabelOverlayOpen(row)"
              >
                @if (row.isSummary) {
                  <button
                    type="button"
                    class="gantt-expand-btn gantt-expand-col shrink-0 inline-flex items-center justify-center
                           text-ink/80 hover:text-ink hover:bg-paper-2/60"
                    [attr.data-test]="'gantt-expand-' + expandKey(row.bar)"
                    [attr.aria-expanded]="row.expanded"
                    [attr.title]="expandTitle(row.bar, row.expanded)"
                    [attr.aria-label]="expandTitle(row.bar, row.expanded)"
                    (click)="onToggleExpand($event, expandKey(row.bar), row.bar)"
                  >
                    <span aria-hidden="true" class="gantt-chevron font-mono leading-none">{{
                      row.expanded ? '▾' : '▸'
                    }}</span>
                  </button>
                } @else {
                  <button
                    type="button"
                    class="gantt-expand-btn gantt-expand-col shrink-0 inline-flex items-center justify-center
                           text-ink/80 hover:text-ink hover:bg-paper-2/60"
                    [attr.data-test]="'gantt-work-expand-' + row.bar.id"
                    [attr.aria-expanded]="isWorkDetailOpen(row.bar.id)"
                    [attr.title]="workDetailTitle(row.bar, isWorkDetailOpen(row.bar.id))"
                    [attr.aria-label]="workDetailTitle(row.bar, isWorkDetailOpen(row.bar.id))"
                    (click)="onChildWorkToggle($event, row.bar.id)"
                  >
                    <span aria-hidden="true" class="gantt-chevron font-mono leading-none">{{
                      isWorkDetailOpen(row.bar.id) ? '▾' : '▸'
                    }}</span>
                  </button>
                }
                <div
                  class="gantt-label-wrap flex-1 min-w-0 h-full relative"
                  [class.gantt-label-wrap--open]="isLabelOverlayOpen(row)"
                  (mouseenter)="onLabelPeekEnter($event, row)"
                  (mouseleave)="onLabelPeekLeave()"
                >
                  <button
                    type="button"
                    class="gantt-label-btn flex-1 min-w-0 w-full h-full px-1.5 flex items-center gap-1.5 text-left
                           hover:bg-paper-2"
                    [style.background]="workerLabelWash(row)"
                    (click)="onLabelClick($event, row)"
                    [attr.title]="row.isSummary ? summaryCardTitle(row.bar) : labelTitle(row.bar)"
                    [attr.aria-label]="
                      row.isSummary ? summaryCardTitle(row.bar) : labelTitle(row.bar)
                    "
                    [attr.data-worker-tint]="
                      row.isWorkerSummary && row.bar.accentHue != null
                        ? 'true'
                        : isUnassignedWorkerSummary(row.bar)
                          ? 'unassigned'
                          : null
                    "
                  >
                    @if (row.isOrderSummary && row.bar.productPhotoUrl; as src) {
                      <img
                        [src]="src"
                        alt=""
                        class="w-6 h-6 rounded-sm object-cover border hairline shrink-0"
                        data-test="gantt-photo-order"
                      />
                    } @else if (row.isProductSummary && row.bar.productPhotoUrl; as src) {
                      <img
                        [src]="src"
                        alt=""
                        class="w-6 h-6 rounded-sm object-cover border hairline shrink-0"
                        data-test="gantt-photo-product"
                      />
                    } @else if (row.isModuleSummary && row.bar.modulePhotoUrl; as src) {
                      <img
                        [src]="src"
                        alt=""
                        class="w-6 h-6 rounded-sm object-cover border hairline shrink-0"
                        data-test="gantt-photo-module"
                      />
                    }
                    @if (row.isWorkerSummary && row.bar.accentHue != null) {
                      <span
                        class="w-1.5 h-5 rounded-sm shrink-0"
                        [style.background]="workerChipFill(row.bar.accentHue)"
                        aria-hidden="true"
                      ></span>
                    } @else if (isUnassignedWorkerSummary(row.bar)) {
                      <span
                        class="w-1.5 h-5 rounded-sm shrink-0 border border-dashed border-amber-700/50 dark:border-amber-400/50"
                        [style.background]="GANTT_UNASSIGNED_CHIP_FILL"
                        aria-hidden="true"
                      ></span>
                    } @else if (!row.isSummary) {
                      <span
                        class="w-1.5 h-5 rounded-sm shrink-0"
                        [style.background]="
                          row.bar.noTerm
                            ? 'transparent'
                            : fill(row.bar.workTypeId, row.bar.accentHue)
                        "
                        [class.border]="row.bar.noTerm"
                        [class.border-dashed]="row.bar.noTerm"
                        [attr.title]="row.bar.workTypeName"
                        aria-hidden="true"
                      ></span>
                    }
                    <span class="gantt-label-text min-w-0 flex-1 truncate text-xs leading-none">
                      @if (row.isOrderSummary || row.isWorkerSummary) {
                        <span class="font-medium text-ink">{{ row.bar.orderNumber }}</span>
                      } @else if (row.isProductSummary) {
                        <span class="font-medium text-ink">{{ row.bar.productName }}</span>
                        @if (row.bar.quantityLabel) {
                          <span class="font-mono text-muted-foreground">
                            {{ row.bar.quantityLabel }}</span
                          >
                        }
                      } @else if (row.isModuleSummary) {
                        <span class="text-ink/85">{{ row.bar.moduleName }}</span>
                      } @else {
                        <span class="text-muted-foreground">{{ row.bar.workTypeName }}</span>
                        @if (row.bar.quantityLabel) {
                          <span class="font-mono text-muted-foreground">
                            {{ row.bar.quantityLabel }}</span
                          >
                        }
                      }
                    </span>
                  </button>
                  @if (isLabelOverlayOpen(row)) {
                    <div
                      class="gantt-label-overlay text-xs leading-none"
                      [class]="labelOverlayLevelClass(row)"
                      [attr.data-test]="'gantt-label-overlay-' + row.bar.id"
                      aria-hidden="true"
                    >
                      {{ labelOverlayText(row) }}
                    </div>
                  }
                </div>
              </div>
              @if (row.isOrderSummary && orderMetaFor(row.bar.orderId); as meta) {
                <div
                  class="gantt-row-h-meta gantt-cascade-panel border-b hairline px-3 py-1.5 flex flex-nowrap items-center gap-x-4 min-w-0"
                  [class.gantt-order-group-mid]="isTreeExpandedGroup(row.bar)"
                  [style.minWidth.px]="timelineMinWidth()"
                  [attr.data-test]="'gantt-order-meta-' + row.bar.orderId"
                  (click)="$event.stopPropagation()"
                >
                  <div
                    class="text-[10px] text-muted-foreground shrink-0"
                    data-test="gantt-order-meta-status"
                  >
                    Статус заказа: {{ statusLabel(meta.status) }}
                  </div>
                  <label class="flex items-center gap-1.5 text-[11px] shrink-0">
                    <span class="text-muted-foreground shrink-0">Важность</span>
                    <select
                      class="pi-input !py-0.5 !text-xs w-28"
                      [value]="priorityDraft()"
                      [disabled]="!canEditOrder()"
                      (change)="onMetaPriority($event)"
                      data-test="gantt-order-meta-priority"
                      [attr.aria-label]="'Важность заказа ' + meta.number"
                    >
                      @for (p of metaPriorities; track p.value) {
                        <option [value]="p.value">{{ p.label }}</option>
                      }
                    </select>
                  </label>
                  <label class="flex items-center gap-1.5 text-[11px] shrink-0">
                    <span class="text-muted-foreground shrink-0">Начало плана</span>
                    <input
                      type="date"
                      class="pi-input !py-0.5 !text-xs"
                      [value]="plannedDraft()"
                      [disabled]="!canEditOrder()"
                      (change)="onMetaPlanned($event)"
                      data-test="gantt-order-meta-planned"
                      [attr.aria-label]="'Начало плана заказа ' + meta.number"
                    />
                  </label>
                  @if (!canEditOrder()) {
                    <p class="text-[10px] text-muted-foreground shrink-0">
                      Правка заказа — роли admin / manager
                    </p>
                  }
                  <a
                    class="text-[10px] underline-offset-2 hover:underline text-ink shrink-0"
                    [routerLink]="['/orders']"
                    [queryParams]="{ q: meta.number }"
                    data-test="gantt-order-meta-open-order"
                    >Открыть в списке заказов</a
                  >
                </div>
              }
              @if (isWorkDetailOpen(row.bar.id)) {
                <div
                  class="gantt-row-h-detail gantt-cascade-panel border-b hairline px-3 py-1.5 flex flex-nowrap items-center gap-x-4 min-w-0"
                  [style.minWidth.px]="timelineMinWidth()"
                  [style.background]="workDetailWash(row.bar)"
                  [attr.data-test]="'gantt-work-detail-' + row.bar.id"
                  (click)="$event.stopPropagation()"
                >
                  <div
                    class="text-[10px] text-muted-foreground shrink-0"
                    [attr.data-test]="'gantt-work-detail-people-' + row.bar.id"
                  >
                    Люди: {{ row.bar.workerLabel }}
                  </div>
                  <label class="flex items-center gap-1.5 text-[11px] shrink-0">
                    <span class="text-muted-foreground shrink-0">Дни</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      class="pi-input !py-0.5 !text-xs w-14"
                      [value]="row.bar.days ?? ''"
                      [disabled]="!canEdit() || readOnly() || groupByWorkers()"
                      (change)="onWorkDaysChange(row.bar, $event)"
                      [attr.data-test]="'gantt-work-detail-days-' + row.bar.id"
                      [attr.aria-label]="'Дни оценки «' + row.bar.workTypeName + '»'"
                    />
                  </label>
                  <p
                    class="text-[10px] text-muted-foreground/80 leading-tight truncate min-w-0 flex-1"
                  >
                    {{ overrideHint }}
                  </p>
                  @if (canEdit() && !groupByWorkers()) {
                    <button
                      type="button"
                      class="text-[10px] underline-offset-2 hover:underline text-ink shrink-0 pi-focus-ring disabled:opacity-50"
                      [disabled]="readOnly()"
                      (click)="onCatalogDaysClick(row.bar, $event)"
                      [attr.data-test]="'gantt-work-detail-catalog-' + row.bar.id"
                    >
                      Изменить в справочнике
                    </button>
                  }
                </div>
              }
            } @empty {
              @for (ph of emptyPlaceholders; track ph) {
                <div
                  class="gantt-row-h px-2 text-xs border-b hairline text-muted-foreground/70
                         flex items-center"
                  [class.bg-paper-2]="ph % 2 === 1"
                  data-test="gantt-placeholder-row"
                >
                  <span class="truncate">—</span>
                </div>
              }
            }
          </div>

          <div class="gantt-calendar-pane relative flex-1 min-w-0 bg-paper-2">
            <div
              class="relative h-10 border-b hairline sticky top-0 bg-paper-2 z-10"
              data-test="gantt-scale"
            >
              @for (tick of scaleTicks(); track tick.key) {
                <div
                  class="absolute top-0 bottom-0 border-l hairline text-[10px] text-muted-foreground pl-0.5 overflow-hidden flex flex-col justify-center leading-tight"
                  [style.left.px]="tick.leftPx"
                  [style.width.px]="tick.widthPx"
                  [attr.data-test]="'gantt-tick-' + tick.key"
                >
                  @if (tick.weekdayLabel) {
                    <span class="block" data-test="gantt-tick-date">{{ tick.dateLabel }}</span>
                    <span class="block" data-test="gantt-tick-weekday">{{
                      tick.weekdayLabel
                    }}</span>
                  } @else {
                    {{ tick.label }}
                  }
                </div>
              }
              <div
                class="absolute top-0 bottom-0 w-px bg-destructive/70 z-[1]"
                #todayMarker
                [class.gantt-today-pulse]="todayPulse()"
                [attr.data-pulse]="todayPulse() ? 'true' : null"
                [style.left.px]="todayLeftPx()"
                title="Сегодня"
                data-test="gantt-today-marker"
              ></div>
            </div>

            @for (row of rows(); track row.bar.id) {
              <div
                class="relative gantt-row-h border-b hairline"
                [class.bg-paper-2]="
                  row.alt && row.nestDepth === 0 && !isOrderEmphasized(row.bar.orderId)
                "
                [class.border-t-2]="row.orderBoundary"
                [class.gantt-work-detail-open]="isWorkDetailOpen(row.bar.id)"
                [class.gantt-order-active]="
                  isHighlightedOrder(row.bar.orderId) && !isWorkDetailOpen(row.bar.id)
                "
                [class.gantt-order-expanded]="
                  isTreeExpandedGroup(row.bar) &&
                  !isHighlightedOrder(row.bar.orderId) &&
                  !isWorkDetailOpen(row.bar.id)
                "
                [class.gantt-order-group-start]="row.orderGroupStart"
                [class.gantt-order-group-end]="row.orderGroupEnd"
                [class.gantt-product-group-start]="row.productGroupStart"
                [class.gantt-product-group-end]="row.productGroupEnd"
                [class.gantt-product-group-mid]="row.productGroupMid"
                [class.gantt-module-group-start]="row.moduleGroupStart"
                [class.gantt-module-group-end]="row.moduleGroupEnd"
                [class.gantt-module-group-mid]="row.moduleGroupMid"
                [class.gantt-level-order]="row.rowKind === 'order' || row.rowKind === 'worker'"
                [class.gantt-level-product]="row.rowKind === 'product'"
                [class.gantt-level-module]="row.rowKind === 'module'"
                [class.gantt-level-work]="row.rowKind === 'work'"
                [attr.data-test]="'gantt-row-' + row.bar.id"
                [attr.data-row-kind]="row.rowKind"
                [attr.data-active-order]="isHighlightedOrder(row.bar.orderId) ? 'true' : null"
                [attr.data-expanded-order]="isTreeExpandedGroup(row.bar) ? 'true' : null"
                [attr.data-work-detail-open]="isWorkDetailOpen(row.bar.id) ? 'true' : null"
                [attr.data-order-group-start]="row.orderGroupStart ? 'true' : null"
                [attr.data-order-group-end]="row.orderGroupEnd ? 'true' : null"
                [attr.data-product-group-start]="row.productGroupStart ? 'true' : null"
                [attr.data-product-group-end]="row.productGroupEnd ? 'true' : null"
                [attr.data-module-group-start]="row.moduleGroupStart ? 'true' : null"
                [attr.data-module-group-end]="row.moduleGroupEnd ? 'true' : null"
              >
                @for (grid of dayGrid(); track grid.key) {
                  <div
                    class="absolute top-0 bottom-0 border-l hairline opacity-40"
                    [style.left.px]="grid.leftPx"
                  ></div>
                }
                <div
                  class="absolute top-1.5 bottom-1.5 rounded-sm text-[10px] px-1.5 flex items-center overflow-hidden text-ink/90 group/bar"
                  [class.border]="row.bar.noTerm || row.isSummary"
                  [class.border-dashed]="row.bar.noTerm"
                  [class.border-muted-foreground]="row.bar.noTerm || row.isSummary"
                  [class.ring-1]="
                    isResizingBar(row.bar.id) ||
                    isMovingOrder(row.bar.orderId) ||
                    isMovingBar(row.bar.id)
                  "
                  [class.ring-ink]="
                    isResizingBar(row.bar.id) ||
                    isMovingOrder(row.bar.orderId) ||
                    isMovingBar(row.bar.id)
                  "
                  [class.cursor-grab]="
                    canMoveBar(row.bar) &&
                    !isMovingOrder(row.bar.orderId) &&
                    !isMovingBar(row.bar.id)
                  "
                  [class.cursor-grabbing]="
                    isMovingOrder(row.bar.orderId) || isMovingBar(row.bar.id)
                  "
                  [style.left.px]="displayLeftPx(row)"
                  [style.width.px]="displayWidthPx(row)"
                  [style.background]="barFill(row)"
                  [style.backgroundImage]="
                    row.bar.noTerm
                      ? 'repeating-linear-gradient(135deg, transparent, transparent 4px, oklch(0.7 0.02 250 / 0.35) 4px, oklch(0.7 0.02 250 / 0.35) 8px)'
                      : null
                  "
                  [attr.title]="barTitle(row.bar)"
                  [attr.aria-label]="barAriaLabel(row.bar)"
                  [attr.data-test]="
                    row.isSummary
                      ? 'gantt-bar-summary'
                      : row.bar.noTerm
                        ? 'gantt-bar-no-term'
                        : 'gantt-bar'
                  "
                  (pointerdown)="onMovePointerDown($event, row.bar)"
                >
                  @if (!row.bar.noTerm) {
                    <span class="truncate" data-test="gantt-bar-days-label"
                      >{{ displayDays(row) }}д</span
                    >
                    @if (isResizingBar(row.bar.id)) {
                      <span
                        class="ml-1 shrink-0 text-[9px] opacity-80"
                        data-test="gantt-resize-hint"
                        >оценка · не факт</span
                      >
                    }
                  } @else {
                    <span class="truncate text-muted-foreground">без срока</span>
                  }
                  @if (canResizeBar(row.bar)) {
                    <button
                      type="button"
                      class="gantt-resize-handle absolute top-0 bottom-0 right-0 w-2.5 -mr-px
                             cursor-ew-resize border-0 p-0 bg-ink/25 hover:bg-ink/45
                             opacity-0 group-hover/bar:opacity-100 focus-visible:opacity-100
                             pi-focus-ring"
                      [class.opacity-100]="isResizingBar(row.bar.id)"
                      [attr.data-test]="'gantt-resize-handle-' + row.bar.id"
                      [attr.aria-label]="
                        'Изменить длительность «' + row.bar.workTypeName + '» (оценка · не факт)'
                      "
                      (pointerdown)="onResizePointerDown($event, row)"
                      (click)="$event.stopPropagation()"
                    ></button>
                  }
                </div>
              </div>
              @if (row.isOrderSummary && isOrderMetaOpen(row.bar.orderId)) {
                <div
                  class="relative gantt-row-h-meta gantt-cascade-spacer border-b hairline"
                  [class.gantt-order-group-mid]="isTreeExpandedGroup(row.bar)"
                  [attr.data-test]="'gantt-order-meta-timeline-' + row.bar.orderId"
                  aria-hidden="true"
                ></div>
              }
              @if (isWorkDetailOpen(row.bar.id)) {
                <div
                  class="relative gantt-row-h-detail gantt-cascade-spacer border-b hairline"
                  [attr.data-test]="'gantt-work-detail-timeline-' + row.bar.id"
                  aria-hidden="true"
                ></div>
              }
            } @empty {
              @for (ph of emptyPlaceholders; track ph) {
                <div
                  class="relative gantt-row-h border-b hairline"
                  [class.bg-paper-2]="ph % 2 === 1"
                >
                  @for (grid of dayGrid(); track grid.key) {
                    <div
                      class="absolute top-0 bottom-0 border-l hairline opacity-40"
                      [style.left.px]="grid.leftPx"
                    ></div>
                  }
                </div>
              }
            }
          </div>
        </div>
      </div>

      <div
        class="shrink-0 px-3 py-2 border-t hairline text-[10px] text-muted-foreground"
        data-test="gantt-legend"
      >
        Красная линия = сегодня · сводная полоса = срок заказа · ▸ = изделие / модуль / виды работ ·
        клик вида работ = дни и люди · номер заказа = статус и даты · цвет = вид работ · правый край
        состава = дни оценки · тело сводной = начало заказа · тело состава = сдвиг вида
      </div>
    </div>
  `,
  styles: `
    :host {
      /* TZ-PRODUCTION-350 — mono milk ladder (one hue family; L/C steps only). */
      --gantt-level-order: oklch(0.92 0.022 86);
      --gantt-level-product: oklch(0.945 0.016 84);
      --gantt-level-module: oklch(0.965 0.012 82);
      --gantt-level-work: oklch(0.985 0.006 85);
      --gantt-bar-order: ${GANTT_SUMMARY_BAR_FILL.order};
      --gantt-bar-product: ${GANTT_SUMMARY_BAR_FILL.product};
      --gantt-bar-module: ${GANTT_SUMMARY_BAR_FILL.module};
    }
    :host-context(.dark),
    :host-context([data-theme='dark']) {
      --gantt-level-order: oklch(0.26 0.03 86);
      --gantt-level-product: oklch(0.25 0.028 84);
      --gantt-level-module: oklch(0.24 0.024 82);
      --gantt-level-work: oklch(0.27 0.012 85);
      --gantt-bar-order: oklch(0.32 0.04 86);
      --gantt-bar-product: oklch(0.31 0.035 84);
      --gantt-bar-module: oklch(0.3 0.03 82);
    }
    .gantt-row-h {
      height: ${GANTT_ROW_PX}px;
      box-sizing: border-box;
    }
    .gantt-row-h-detail {
      height: ${GANTT_DETAIL_ROW_PX}px;
      box-sizing: border-box;
    }
    .gantt-row-h-meta {
      height: ${GANTT_META_ROW_PX}px;
      box-sizing: border-box;
    }
    .gantt-scroll {
      container-type: inline-size;
      container-name: gantt-scroll;
    }
    /* TZ-NX-GANTT-G8 — cool calendar wash separates timeline from label paper. */
    .gantt-calendar-pane {
      background: var(--color-paper-2);
    }
    :host-context(.dark) .gantt-calendar-pane,
    :host-context([data-theme='dark']) .gantt-calendar-pane {
      background: color-mix(in oklch, var(--color-paper-2) 76%, var(--color-ink));
    }
    /* QA-445E — visible ack when scrollLeft cannot move (short range / already centered). */
    .gantt-today-pulse {
      width: 3px;
      background: var(--color-destructive, oklch(0.55 0.2 25));
      outline: 2px solid
        color-mix(in oklch, var(--color-destructive, oklch(0.55 0.2 25)) 55%, transparent);
      outline-offset: 1px;
      animation: gantt-today-pulse 0.7s ease-out 1;
    }
    @keyframes gantt-today-pulse {
      0% {
        opacity: 1;
      }
      35% {
        opacity: 1;
        width: 4px;
      }
      100% {
        opacity: 0.7;
        width: 3px;
      }
    }
    /* Full-bleed cascade panel: lives in sticky label column, spans label+timeline. */
    .gantt-cascade-panel {
      position: relative;
      z-index: 4;
      box-sizing: border-box;
      width: 100cqw;
      background: oklch(0.97 0.008 95);
    }
    :host-context(.dark) .gantt-cascade-panel,
    :host-context([data-theme='dark']) .gantt-cascade-panel {
      background: oklch(0.27 0.02 260);
    }
    .gantt-cascade-spacer {
      pointer-events: none;
      background: transparent;
    }
    .gantt-expand-col {
      width: 36px; /* dedicated expand hit column ≥36px */
      box-sizing: border-box;
    }
    .gantt-chevron {
      font-size: 15px;
      font-weight: 700;
      line-height: 1;
      color: var(--color-ink, oklch(0.28 0.02 95));
      opacity: 0.88;
    }
    .gantt-expand-btn[aria-expanded='true'] .gantt-chevron {
      opacity: 1;
    }
    /* One row frame: only vertical split after ▸ — no boxed button chrome. */
    .gantt-expand-btn {
      margin: 0;
      padding: 0;
      border: 0;
      border-right: 1px solid var(--color-rule, oklch(0.88 0.01 95));
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      appearance: none;
      -webkit-appearance: none;
    }
    .gantt-expand-btn:focus {
      outline: none;
    }
    .gantt-expand-btn:focus-visible {
      background: color-mix(in oklch, var(--color-paper-2) 80%, transparent);
      color: var(--color-ink, inherit);
    }
    .gantt-label-btn {
      margin: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      appearance: none;
      -webkit-appearance: none;
    }
    .gantt-label-btn:focus {
      outline: none;
    }
    .gantt-label-btn:focus-visible {
      background: color-mix(in oklch, var(--color-paper-2) 80%, transparent);
    }
    /* truncated-label-peek — hover / cascade expand when text overflows (see docs/ui-rules.md). */
    .gantt-row-label-overlay.gantt-row-h {
      overflow: visible;
      position: relative;
      z-index: 50;
    }
    .gantt-label-wrap--open {
      z-index: 50;
    }
    .gantt-label-overlay {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      min-width: 100%;
      max-width: 420px;
      padding: 0 0.5rem 0 0.375rem;
      white-space: nowrap;
      border: 1px solid color-mix(in oklch, var(--color-sunrise-warm) 40%, transparent);
      border-left: 0;
      border-radius: 0 0.375rem 0.375rem 0;
      box-shadow:
        0 10px 15px -3px rgb(0 0 0 / 0.1),
        0 4px 6px -4px rgb(0 0 0 / 0.1);
      pointer-events: none;
      animation: gantt-label-overlay-in 140ms ease-out;
    }
    @keyframes gantt-label-overlay-in {
      from {
        opacity: 0;
        transform: translateX(-3px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .gantt-label-overlay--product {
      background: var(--gantt-level-product);
      color: var(--color-ink, inherit);
      font-weight: 500;
    }
    .gantt-label-overlay--module {
      background: var(--gantt-level-module);
      color: color-mix(in oklch, var(--color-ink, inherit) 85%, transparent);
    }
    [data-nest-depth='1'] .gantt-label-overlay {
      padding-left: calc(0.375rem + ${GANTT_NEST_INDENT_PX}px);
    }
    [data-nest-depth='2'] .gantt-label-overlay {
      padding-left: calc(0.375rem + ${GANTT_NEST_INDENT_PX * 2}px);
    }
    [data-nest-depth='3'] .gantt-label-overlay {
      padding-left: calc(0.375rem + ${GANTT_NEST_INDENT_PX * 3}px);
    }
    /* TZ-PRODUCTION-348: cascade indent — labels only (~15px per depth). */
    [data-nest-depth='1'] .gantt-label-btn {
      padding-left: ${GANTT_NEST_INDENT_PX}px;
    }
    [data-nest-depth='2'] .gantt-label-btn {
      padding-left: ${GANTT_NEST_INDENT_PX * 2}px;
    }
    [data-nest-depth='3'] .gantt-label-btn {
      padding-left: ${GANTT_NEST_INDENT_PX * 3}px;
    }
    /*
     * Level washes (paper milk). Order/product/module/work must stay distinct
     * even under expanded-order frame (no beige flatten via !important).
     */
    .gantt-level-order {
      background: var(--gantt-level-order);
    }
    .gantt-level-product {
      background: var(--gantt-level-product);
    }
    .gantt-level-module {
      background: var(--gantt-level-module);
    }
    .gantt-level-work {
      background: var(--gantt-level-work);
    }
    /* Active order while order-meta strip is open — lighter + bold frame. */
    .gantt-order-active {
      background: oklch(0.995 0.008 95) !important;
      box-shadow: inset 0 0 0 2px oklch(0.45 0.04 85);
      position: relative;
      z-index: 1;
    }
    /* Tree expanded via ▸ — frame only; level washes keep child colors. */
    .gantt-order-expanded {
      position: relative;
      z-index: 1;
    }
    /* Expanded order block frame (summary→children); weaker than meta-active.
       Summary header (group-start) = order cream wash. */
    .gantt-order-group-start {
      background: var(--gantt-level-order) !important;
      box-shadow:
        inset 0 2px 0 0 oklch(0.42 0.05 85),
        inset 2px 0 0 0 oklch(0.42 0.05 85),
        inset -2px 0 0 0 oklch(0.42 0.05 85);
    }
    .gantt-order-group-start.gantt-order-group-end {
      box-shadow: inset 0 0 0 2px oklch(0.42 0.05 85);
      margin-bottom: var(--space-1);
    }
    .gantt-order-group-mid,
    .gantt-order-expanded:not(.gantt-order-group-start):not(.gantt-order-group-end) {
      box-shadow:
        inset 2px 0 0 0 oklch(0.42 0.05 85),
        inset -2px 0 0 0 oklch(0.42 0.05 85);
    }
    .gantt-order-group-end:not(.gantt-order-group-start) {
      box-shadow:
        inset 0 -2px 0 0 oklch(0.42 0.05 85),
        inset 2px 0 0 0 oklch(0.42 0.05 85),
        inset -2px 0 0 0 oklch(0.42 0.05 85);
      margin-bottom: var(--space-1);
    }
    /* Nested product group — milk ladder (hue ~84). */
    .gantt-product-group-start {
      background: var(--gantt-level-product) !important;
      box-shadow:
        inset 0 1px 0 0 oklch(0.48 0.05 84),
        inset 3px 0 0 0 oklch(0.48 0.05 84),
        inset -1px 0 0 0 oklch(0.48 0.05 84);
    }
    .gantt-product-group-mid {
      background: var(--gantt-level-product) !important;
      box-shadow:
        inset 3px 0 0 0 oklch(0.48 0.05 84),
        inset -1px 0 0 0 oklch(0.48 0.05 84);
    }
    .gantt-product-group-end:not(.gantt-product-group-start) {
      background: var(--gantt-level-product) !important;
      box-shadow:
        inset 0 -1px 0 0 oklch(0.48 0.05 84),
        inset 3px 0 0 0 oklch(0.48 0.05 84),
        inset -1px 0 0 0 oklch(0.48 0.05 84);
    }
    .gantt-product-group-start.gantt-product-group-end {
      box-shadow:
        inset 0 0 0 1px oklch(0.48 0.05 84),
        inset 3px 0 0 0 oklch(0.48 0.05 84);
    }
    /* Nested module group — milk ladder (hue ~82). */
    .gantt-module-group-start {
      background: var(--gantt-level-module) !important;
      box-shadow:
        inset 0 1px 0 0 oklch(0.5 0.045 82),
        inset 5px 0 0 0 oklch(0.5 0.045 82),
        inset -1px 0 0 0 oklch(0.5 0.045 82);
    }
    .gantt-module-group-mid {
      background: var(--gantt-level-module) !important;
      box-shadow:
        inset 5px 0 0 0 oklch(0.5 0.045 82),
        inset -1px 0 0 0 oklch(0.5 0.045 82);
    }
    .gantt-module-group-end:not(.gantt-module-group-start) {
      background: var(--gantt-level-module) !important;
      box-shadow:
        inset 0 -1px 0 0 oklch(0.5 0.045 82),
        inset 5px 0 0 0 oklch(0.5 0.045 82),
        inset -1px 0 0 0 oklch(0.5 0.045 82);
    }
    .gantt-module-group-start.gantt-module-group-end {
      box-shadow:
        inset 0 0 0 1px oklch(0.5 0.045 82),
        inset 5px 0 0 0 oklch(0.5 0.045 82);
    }
    /* Work rows keep paper wash — group mid must not flatten WT. */
    .gantt-product-group-mid.gantt-level-work,
    .gantt-product-group-end.gantt-level-work,
    .gantt-module-group-mid.gantt-level-work,
    .gantt-module-group-end.gantt-level-work {
      background: var(--gantt-level-work) !important;
    }
    .gantt-product-group-mid.gantt-level-module,
    .gantt-product-group-end.gantt-level-module:not(.gantt-module-group-start) {
      background: var(--gantt-level-module) !important;
    }
    .gantt-order-active.gantt-order-group-start,
    .gantt-order-active.gantt-order-group-end,
    .gantt-order-active.gantt-order-group-mid {
      /* Meta-active wash + frame win over group chrome / header tint. */
      background: oklch(0.995 0.008 95) !important;
      box-shadow: inset 0 0 0 2px oklch(0.45 0.04 85);
    }
    :host-context(.dark) .gantt-order-active,
    :host-context([data-theme='dark']) .gantt-order-active {
      background: oklch(0.28 0.02 260) !important;
      box-shadow: inset 0 0 0 2px oklch(0.78 0.06 85);
    }
    :host-context(.dark) .gantt-order-group-start,
    :host-context([data-theme='dark']) .gantt-order-group-start {
      background: var(--gantt-level-order) !important;
      box-shadow:
        inset 0 2px 0 0 oklch(0.78 0.07 85),
        inset 2px 0 0 0 oklch(0.78 0.07 85),
        inset -2px 0 0 0 oklch(0.78 0.07 85);
    }
    :host-context(.dark) .gantt-order-active.gantt-order-group-start,
    :host-context(.dark) .gantt-order-active.gantt-order-group-end,
    :host-context(.dark) .gantt-order-active.gantt-order-group-mid,
    :host-context([data-theme='dark']) .gantt-order-active.gantt-order-group-start,
    :host-context([data-theme='dark']) .gantt-order-active.gantt-order-group-end,
    :host-context([data-theme='dark']) .gantt-order-active.gantt-order-group-mid {
      background: oklch(0.28 0.02 260) !important;
      box-shadow: inset 0 0 0 2px oklch(0.78 0.06 85);
    }
    :host-context(.dark) .gantt-order-group-start.gantt-order-group-end,
    :host-context([data-theme='dark']) .gantt-order-group-start.gantt-order-group-end {
      box-shadow: inset 0 0 0 2px oklch(0.78 0.07 85);
    }
    :host-context(.dark) .gantt-order-group-mid,
    :host-context(.dark)
      .gantt-order-expanded:not(.gantt-order-group-start):not(.gantt-order-group-end),
    :host-context([data-theme='dark']) .gantt-order-group-mid,
    :host-context([data-theme='dark'])
      .gantt-order-expanded:not(.gantt-order-group-start):not(.gantt-order-group-end) {
      box-shadow:
        inset 2px 0 0 0 oklch(0.78 0.07 85),
        inset -2px 0 0 0 oklch(0.78 0.07 85);
    }
    :host-context(.dark) .gantt-order-group-end:not(.gantt-order-group-start),
    :host-context([data-theme='dark']) .gantt-order-group-end:not(.gantt-order-group-start) {
      box-shadow:
        inset 0 -2px 0 0 oklch(0.78 0.07 85),
        inset 2px 0 0 0 oklch(0.78 0.07 85),
        inset -2px 0 0 0 oklch(0.78 0.07 85);
    }
    :host-context(.dark) .gantt-product-group-start,
    :host-context([data-theme='dark']) .gantt-product-group-start {
      background: var(--gantt-level-product) !important;
      box-shadow:
        inset 0 1px 0 0 oklch(0.72 0.06 84),
        inset 3px 0 0 0 oklch(0.72 0.06 84),
        inset -1px 0 0 0 oklch(0.72 0.06 84);
    }
    :host-context(.dark) .gantt-product-group-mid,
    :host-context(.dark) .gantt-product-group-end:not(.gantt-product-group-start),
    :host-context([data-theme='dark']) .gantt-product-group-mid,
    :host-context([data-theme='dark']) .gantt-product-group-end:not(.gantt-product-group-start) {
      background: var(--gantt-level-product) !important;
      box-shadow:
        inset 3px 0 0 0 oklch(0.72 0.06 84),
        inset -1px 0 0 0 oklch(0.72 0.06 84);
    }
    :host-context(.dark) .gantt-product-group-end:not(.gantt-product-group-start),
    :host-context([data-theme='dark']) .gantt-product-group-end:not(.gantt-product-group-start) {
      box-shadow:
        inset 0 -1px 0 0 oklch(0.72 0.06 84),
        inset 3px 0 0 0 oklch(0.72 0.06 84),
        inset -1px 0 0 0 oklch(0.72 0.06 84);
    }
    :host-context(.dark) .gantt-module-group-start,
    :host-context([data-theme='dark']) .gantt-module-group-start {
      background: var(--gantt-level-module) !important;
      box-shadow:
        inset 0 1px 0 0 oklch(0.75 0.055 82),
        inset 5px 0 0 0 oklch(0.75 0.055 82),
        inset -1px 0 0 0 oklch(0.75 0.055 82);
    }
    :host-context(.dark) .gantt-module-group-mid,
    :host-context(.dark) .gantt-module-group-end:not(.gantt-module-group-start),
    :host-context([data-theme='dark']) .gantt-module-group-mid,
    :host-context([data-theme='dark']) .gantt-module-group-end:not(.gantt-module-group-start) {
      background: var(--gantt-level-module) !important;
      box-shadow:
        inset 5px 0 0 0 oklch(0.75 0.055 82),
        inset -1px 0 0 0 oklch(0.75 0.055 82);
    }
    :host-context(.dark) .gantt-module-group-end:not(.gantt-module-group-start),
    :host-context([data-theme='dark']) .gantt-module-group-end:not(.gantt-module-group-start) {
      box-shadow:
        inset 0 -1px 0 0 oklch(0.75 0.055 82),
        inset 5px 0 0 0 oklch(0.75 0.055 82),
        inset -1px 0 0 0 oklch(0.75 0.055 82);
    }
    :host-context(.dark) .gantt-chevron,
    :host-context([data-theme='dark']) .gantt-chevron {
      color: oklch(0.92 0.02 95);
      opacity: 0.92;
    }
    /* Work-type detail open — distinct from meta-active / tree-expanded. */
    .gantt-work-detail-open {
      background: oklch(0.96 0.035 85) !important;
      box-shadow: inset 3px 0 0 oklch(0.62 0.12 85);
      position: relative;
      z-index: 2;
    }
    :host-context(.dark) .gantt-work-detail-open,
    :host-context([data-theme='dark']) .gantt-work-detail-open {
      background: oklch(0.3 0.04 85) !important;
      box-shadow: inset 3px 0 0 oklch(0.72 0.1 85);
    }
    .gantt-resize-handle {
      touch-action: none;
    }
  `,
})
export class GanttBarsComponent implements AfterViewInit {
  /** Work-type bars from buildGanttBars (not pre-built summaries). */
  readonly bars = input.required<GanttBar[]>();
  readonly rangeStart = input.required<string>();
  readonly rangeEnd = input.required<string>();
  readonly zoom = input<GanttZoom>('day');
  readonly warnings = input<string[]>([]);
  readonly usedTodayFallback = input(false);
  readonly readOnly = input(false);
  /** production:write (or equivalent) — required for resize handles. */
  readonly canEdit = input(false);
  readonly today = input(formatDateOnly(new Date()));
  /** Parent command after range changes: scroll marker, range start, or a bar id into view. */
  readonly scrollRequest = input<{
    target: 'today' | 'start' | 'bar';
    nonce: number;
    /** G4 — bar id to bring into view (plannedDate/startOffset commit). */
    barId?: string;
  } | null>(null);
  /** TZ-PRODUCTION-314 — which orders show product children. */
  readonly expandedOrderIds = input<ReadonlySet<string>>(new Set());
  /** TZ-PRODUCTION-342 — product / module expand keys. */
  readonly expandedProductIds = input<ReadonlySet<string>>(new Set());
  readonly expandedModuleIds = input<ReadonlySet<string>>(new Set());
  /** TZ-PRODUCTION-344 — worker / worker-module expand keys. */
  readonly expandedWorkerIds = input<ReadonlySet<string>>(new Set());
  readonly expandedWorkerModuleIds = input<ReadonlySet<string>>(new Set());
  /** TZ-PRODUCTION-321 — one open work-type detail (`bar.id`). */
  readonly expandedWorkBarId = input<string | null>(null);
  /** Order id with open order-meta strip — highlight label + timeline rows. */
  readonly highlightOrderId = input<string | null>(null);
  /** TZ-PRODUCTION-322 — live order fields for the meta strip under summary. */
  readonly orderMeta = input<GanttOrderMetaView | null>(null);
  /** Mirror BE @Roles(admin|manager) for order PATCH. */
  readonly canEditOrder = input(false);
  /** TZ-GANTT-401 — group rows by workerLabel instead of order (read-only view). */
  readonly groupByWorkers = input(false);
  /**
   * TZ-PRODUCTION-319/322 — left summary order label only (toggle meta in parent).
   * Child labels and timeline bars do not emit this.
   */
  readonly orderLabelClick = output<string>();
  /** Empty canvas / non-control click → parent collapses trees + meta + work-detail. */
  readonly dismissCanvas = output<void>();
  readonly toggleExpand = output<string>();
  /** TZ-PRODUCTION-348 — toolbar zoom / group / fit (parent owns state). */
  readonly zoomChange = output<GanttZoom>();
  readonly groupByChange = output<GanttGroupBy>();
  readonly fit = output<void>();
  /** Child work-type label / ▸ → parent toggles work-detail for this bar.id. */
  readonly toggleWorkDetail = output<string>();
  /** Catalog button in work-detail → parent prompts + PATCHes WorkType.days. */
  readonly catalogDaysRequest = output<GanttCatalogDaysRequest>();
  /** Commit snapped days → parent PATCHes order estimate-days only. */
  readonly estimateDaysCommit = output<GanttEstimateDaysCommit>();
  /** Body-drag on summary → parent PATCHes order plannedDate (whole chain). */
  readonly plannedDateMoveCommit = output<GanttPlannedDateMoveCommit>();
  /** Child body-drag → parent PATCHes estimate-start offset. */
  readonly startOffsetCommit = output<GanttStartOffsetCommit>();
  /** Order-meta change → parent PATCHes orders/:id (priority + plannedDate), silent. */
  readonly orderMetaCommit = output<GanttOrderMetaCommit>();

  protected readonly emptyPlaceholders = [0, 1, 2, 3, 4, 5] as const;
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly ganttScroll = viewChild<ElementRef<HTMLElement>>('ganttScroll');
  private readonly todayMarker = viewChild<ElementRef<HTMLElement>>('todayMarker');
  protected readonly overrideHint = ESTIMATE_OVERRIDE_HINT_RU;
  protected readonly metaPriorities = ORDER_META_PRIORITIES;
  protected readonly priorityDraft = signal<OrderPriority>('normal');
  protected readonly plannedDraft = signal('');
  /** QA-445E — flash red today line so «Сегодня» is never a silent no-op. */
  protected readonly todayPulse = signal(false);
  private todayPulseTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const m = this.orderMeta();
      if (!m) return;
      this.priorityDraft.set(m.priority);
      this.plannedDraft.set(m.plannedDate);
    });
    effect(() => {
      const request = this.scrollRequest();
      if (!request) return;
      afterNextRender(
        () => {
          if (request.target === 'today') this.scrollToToday();
          else if (request.target === 'bar') this.scrollToBar(request.barId ?? null);
          else this.scrollToStart();
        },
        { injector: this.injector },
      );
    });
    this.destroyRef.onDestroy(() => {
      this.clearLabelOverlayLeaveTimer();
      this.clearTodayPulseTimer();
    });
  }

  /** Live right-edge resize preview (null = idle). */
  private readonly resizeSession = signal<{
    barId: string;
    bar: GanttBar;
    baseDays: number;
    startClientX: number;
    previewDays: number;
    pointerId: number;
  } | null>(null);

  /** Live body-drag preview (null = idle). */
  private readonly moveSession = signal<{
    mode: 'plannedDate' | 'startOffset';
    orderId: string;
    barId: string;
    bar: GanttBar;
    startClientX: number;
    previewDeltaDays: number;
    pointerId: number;
  } | null>(null);

  protected readonly totalDays = computed(() =>
    Math.max(1, dayDiff(this.rangeStart(), this.rangeEnd())),
  );

  private readonly timelineViewportWidth = signal(0);
  /** Open floating label peek (`bar.id`) — hover or cascade expand when truncated. */
  private readonly labelOverlayKey = signal<string | null>(null);
  private labelOverlayLeaveTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly pxPerDay = computed(() =>
    calculateGanttPxPerDay(this.zoom(), this.totalDays(), this.timelineViewportWidth()),
  );

  protected readonly timelineMinWidth = computed(
    () => this.totalDays() * this.pxPerDay() + GANTT_LABEL_COL_PX,
  );

  protected readonly dayGrid = computed(() => {
    const total = this.totalDays();
    const px = this.pxPerDay();
    const out: Array<{ key: string; leftPx: number }> = [];
    for (let i = 0; i < total; i++) {
      out.push({ key: `g${i}`, leftPx: i * px });
    }
    return out;
  });

  protected readonly treeBars = computed(() =>
    this.groupByWorkers()
      ? buildWorkerTreeBars(this.bars(), this.expandedWorkerIds(), this.expandedWorkerModuleIds())
      : buildGanttTreeBars(
          this.bars(),
          this.expandedOrderIds(),
          this.expandedProductIds(),
          this.expandedModuleIds(),
        ),
  );

  protected readonly unassignedSummary = computed(() => summarizeUnassignedGanttWork(this.bars()));

  protected readonly GANTT_UNASSIGNED_CHIP_FILL = GANTT_UNASSIGNED_CHIP_FILL;

  protected readonly legendItems = computed(() => {
    const seen = new Map<string, { id: string; name: string; color: string }>();
    for (const b of this.bars()) {
      if (isSummaryBar(b) || b.workTypeId === '__summary__') continue;
      if (seen.has(b.workTypeId)) continue;
      seen.set(b.workTypeId, {
        id: b.workTypeId,
        name: b.workTypeName,
        color: workTypeOklch(b.workTypeId, 0.12, 0.72, b.accentHue),
      });
    }
    return [...seen.values()];
  });

  protected readonly scaleTicks = computed(() => {
    const start = this.rangeStart();
    const total = this.totalDays();
    const px = this.pxPerDay();
    const monthMode = this.zoom() === 'month';
    const ticks: Array<{
      key: string;
      label: string;
      dateLabel: string;
      weekdayLabel: string;
      leftPx: number;
      widthPx: number;
    }> = [];
    for (let i = 0; i < total; i++) {
      const date = addDays(start, i);
      const isMonthStart = date.slice(8, 10) === '01';
      if (monthMode && !isMonthStart && i !== 0) continue;
      const span = monthMode ? ganttDaysLeftInMonth(date, total - i) : 1;
      ticks.push({
        key: date,
        label: monthMode ? ganttMonthTickLabel(date) : shortDay(date),
        dateLabel: monthMode ? ganttMonthTickLabel(date) : shortDay(date),
        weekdayLabel: monthMode ? '' : ganttWeekdayShortRu(date),
        leftPx: i * px,
        widthPx: span * px,
      });
    }
    return ticks;
  });

  protected readonly rows = computed(() => {
    const start = this.rangeStart();
    const total = this.totalDays();
    const px = this.pxPerDay();
    const expandedOrders = this.expandedOrderIds();
    const expandedProducts = this.expandedProductIds();
    const expandedModules = this.expandedModuleIds();
    const expandedWorkers = this.expandedWorkerIds();
    const expandedWorkerModules = this.expandedWorkerModuleIds();
    const sorted = this.treeBars();
    const byWorkers = this.groupByWorkers();
    /** Last tree index per expanded order/worker — for group-end frame. */
    const lastIdxByGroup = new Map<string, number>();
    /** Last tree index per expanded product / module branch (nested frames). */
    const lastIdxByProduct = new Map<string, number>();
    const lastIdxByModule = new Map<string, number>();
    for (let i = 0; i < sorted.length; i++) {
      const bar = sorted[i]!;
      const key = byWorkers ? workerGroupKeyOf(bar) : bar.orderId;
      const expanded = byWorkers ? expandedWorkers.has(key) : expandedOrders.has(key);
      if (expanded) lastIdxByGroup.set(key, i);

      if (byWorkers) {
        if (isModuleSummaryBar(bar) && expandedWorkerModules.has(bar.id)) {
          lastIdxByModule.set(bar.id, i);
        } else if (!isSummaryBar(bar)) {
          const modId = ganttWorkerModuleSummaryId(
            workerGroupKeyOf(bar),
            bar.orderId,
            bar.orderItemIndex,
            bar.moduleId,
          );
          if (expandedWorkerModules.has(modId)) lastIdxByModule.set(modId, i);
        }
      } else {
        if (!isOrderSummaryBar(bar) && !isWorkerSummaryBar(bar)) {
          const productId = ganttProductSummaryId(bar.orderId, bar.orderItemIndex);
          if (expandedProducts.has(productId)) lastIdxByProduct.set(productId, i);
          if (!isProductSummaryBar(bar)) {
            const moduleId = ganttModuleSummaryId(bar.orderId, bar.orderItemIndex, bar.moduleId);
            if (expandedModules.has(moduleId)) lastIdxByModule.set(moduleId, i);
          }
        }
      }
    }
    return sorted.map((bar, idx) => {
      const left = dayDiff(start, bar.startDate);
      const span = bar.noTerm
        ? Math.max(1, Math.round(total * 0.04))
        : Math.max(1, dayDiff(bar.startDate, bar.endDate) + 1);
      const prev = idx > 0 ? sorted[idx - 1] : null;
      const isSummary = isSummaryBar(bar);
      const orderSummary = isOrderSummaryBar(bar);
      const productSummary = isProductSummaryBar(bar);
      const moduleSummary = isModuleSummaryBar(bar);
      const workerSummary = isWorkerSummaryBar(bar);
      const groupKey = byWorkers ? workerGroupKeyOf(bar) : bar.orderId;
      const treeExpanded = byWorkers
        ? expandedWorkers.has(groupKey)
        : expandedOrders.has(bar.orderId);
      const branchExpanded = byWorkers
        ? workerSummary
          ? expandedWorkers.has(groupKey)
          : moduleSummary
            ? expandedWorkerModules.has(bar.id)
            : false
        : orderSummary
          ? expandedOrders.has(bar.orderId)
          : productSummary
            ? expandedProducts.has(bar.id)
            : moduleSummary
              ? expandedModules.has(bar.id)
              : false;

      let productId = '';
      let moduleId = '';
      let inProductGroup = false;
      let inModuleGroup = false;
      if (byWorkers) {
        if (moduleSummary && expandedWorkerModules.has(bar.id)) {
          moduleId = bar.id;
          inModuleGroup = true;
        } else if (!isSummary) {
          moduleId = ganttWorkerModuleSummaryId(
            workerGroupKeyOf(bar),
            bar.orderId,
            bar.orderItemIndex,
            bar.moduleId,
          );
          inModuleGroup = expandedWorkerModules.has(moduleId);
        }
      } else if (!orderSummary && !workerSummary) {
        productId = ganttProductSummaryId(bar.orderId, bar.orderItemIndex);
        inProductGroup = expandedProducts.has(productId);
        if (!productSummary) {
          moduleId = ganttModuleSummaryId(bar.orderId, bar.orderItemIndex, bar.moduleId);
          inModuleGroup = expandedModules.has(moduleId);
        }
      }

      const productGroupStart = inProductGroup && productSummary;
      const productGroupEnd =
        inProductGroup && !!productId && lastIdxByProduct.get(productId) === idx;
      const productGroupMid = inProductGroup && !productGroupStart && !productGroupEnd;
      const moduleGroupStart = inModuleGroup && moduleSummary;
      const moduleGroupEnd = inModuleGroup && !!moduleId && lastIdxByModule.get(moduleId) === idx;
      const moduleGroupMid = inModuleGroup && !moduleGroupStart && !moduleGroupEnd;
      const rowKind = ganttRowKind({
        isOrderSummary: orderSummary,
        isWorkerSummary: workerSummary,
        isProductSummary: productSummary,
        isModuleSummary: moduleSummary,
      });
      const nestDepth = ganttNestDepth(rowKind);

      return {
        bar,
        alt: idx % 2 === 1,
        orderBoundary: !!prev && this.rowGroupKey(prev) !== this.rowGroupKey(bar),
        leftPx: left * px,
        widthPx: Math.max(px * 0.5, span * px),
        baseSpanDays: span,
        isSummary,
        isOrderSummary: orderSummary,
        isProductSummary: productSummary,
        isModuleSummary: moduleSummary,
        isWorkerSummary: workerSummary,
        rowKind,
        nestDepth,
        expanded: branchExpanded,
        orderGroupStart: treeExpanded && (byWorkers ? workerSummary : orderSummary),
        orderGroupEnd: treeExpanded && lastIdxByGroup.get(groupKey) === idx,
        productGroupStart,
        productGroupEnd,
        productGroupMid,
        moduleGroupStart,
        moduleGroupEnd,
        moduleGroupMid,
      };
    });
  });

  protected readonly todayLeftPx = computed(() => {
    const t = dayDiff(this.rangeStart(), this.today());
    return Math.max(0, Math.min(this.totalDays(), t)) * this.pxPerDay();
  });

  ngAfterViewInit(): void {
    const scroll = this.ganttScroll()?.nativeElement;
    if (!scroll) return;
    const onScroll = (): void => this.closeLabelOverlay();
    scroll.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => scroll.removeEventListener('scroll', onScroll));
    const updateViewportWidth = (): void => {
      this.timelineViewportWidth.set(Math.max(0, scroll.clientWidth - GANTT_LABEL_COL_PX));
    };
    if (typeof ResizeObserver === 'undefined') {
      updateViewportWidth();
      return;
    }
    const observer = new ResizeObserver(updateViewportWidth);
    observer.observe(scroll);
    updateViewportWidth();
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  /** Scroll the marker into the visible timeline viewport (Сегодня) + pulse ack. */
  scrollToToday(): void {
    this.scrollToMarker(this.todayMarker()?.nativeElement ?? null);
    this.pulseTodayMarker();
  }

  /** G4 — public re-anchor used by the page after optimistic shift commits. */
  scrollToBarId(barId: string | null): void {
    this.scrollToBar(barId);
  }

  /** Reveal the beginning of the fitted bars range. */
  scrollToStart(): void {
    const scroll = this.ganttScroll()?.nativeElement;
    if (!scroll) return;
    if (typeof scroll.scrollTo === 'function') scroll.scrollTo({ left: 0, behavior: 'auto' });
    else scroll.scrollLeft = 0;
  }

  private pulseTodayMarker(): void {
    this.clearTodayPulseTimer();
    // Force class off→on so CSS animation retriggers on repeated clicks.
    if (this.todayPulse()) {
      this.todayPulse.set(false);
      queueMicrotask(() => {
        this.todayPulse.set(true);
        this.scheduleTodayPulseClear();
      });
      return;
    }
    this.todayPulse.set(true);
    this.scheduleTodayPulseClear();
  }

  private scheduleTodayPulseClear(): void {
    this.todayPulseTimer = setTimeout(() => {
      this.todayPulse.set(false);
      this.todayPulseTimer = null;
    }, 700);
  }

  private clearTodayPulseTimer(): void {
    if (this.todayPulseTimer != null) {
      clearTimeout(this.todayPulseTimer);
      this.todayPulseTimer = null;
    }
  }

  /**
   * G4 — after an optimistic plannedDate/startOffset commit, bring the moved bar's
   * row into the horizontal viewport (clamped by calculateCenteredMarkerScrollLeft
   * semantics) so the timeline never «залипает» справа от ранних дат.
   */
  private scrollToBar(barId: string | null): void {
    const scroll = this.ganttScroll()?.nativeElement;
    if (!scroll || !barId) return;
    const marker = scroll.querySelector<HTMLElement>(`[data-test="gantt-row-${barId}"]`);
    if (!marker) return;
    const scrollRect = scroll.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();
    const left = calculateCenteredMarkerScrollLeft({
      scrollLeft: scroll.scrollLeft,
      scrollWidth: scroll.scrollWidth,
      clientWidth: scroll.clientWidth,
      scrollLeftEdge: scrollRect.left,
      markerLeft: markerRect.left,
      markerWidth: markerRect.width,
    });
    if (typeof scroll.scrollTo === 'function') scroll.scrollTo({ left, behavior: 'auto' });
    else scroll.scrollLeft = left;
  }

  private scrollToMarker(marker: HTMLElement | null): void {
    const scroll = this.ganttScroll()?.nativeElement;
    if (!scroll || !marker) return;
    const scrollRect = scroll.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();
    const left = calculateCenteredMarkerScrollLeft({
      scrollLeft: scroll.scrollLeft,
      scrollWidth: scroll.scrollWidth,
      clientWidth: scroll.clientWidth,
      scrollLeftEdge: scrollRect.left,
      markerLeft: markerRect.left,
      markerWidth: markerRect.width,
    });
    if (typeof scroll.scrollTo === 'function') scroll.scrollTo({ left, behavior: 'auto' });
    else scroll.scrollLeft = left;
  }

  /** Child work bars only — summary has no right-resize (duration derived). */
  protected canResizeBar(bar: GanttBar): boolean {
    if (this.groupByWorkers()) return false;
    if (isSummaryBar(bar)) return false;
    if (!this.canEdit() || this.readOnly()) return false;
    if (bar.noTerm || bar.days == null || bar.days < 1) return false;
    if (isBarEstimateReadOnly(bar.orderStatus)) return false;
    return true;
  }

  /**
   * Order summary → plannedDate; work bar → start offset (316).
   * Product/module summaries are derived spans — not movable.
   */
  protected canMoveBar(bar: GanttBar): boolean {
    if (this.groupByWorkers()) return false;
    if (isProductSummaryBar(bar) || isModuleSummaryBar(bar)) return false;
    const mayMove = isOrderSummaryBar(bar) ? this.canEditOrder() : this.canEdit();
    if (!mayMove || this.readOnly()) return false;
    if (isBarEstimateReadOnly(bar.orderStatus)) return false;
    return true;
  }

  protected isResizingBar(barId: string): boolean {
    return this.resizeSession()?.barId === barId;
  }

  protected isMovingOrder(orderId: string): boolean {
    const s = this.moveSession();
    return !!s && s.mode === 'plannedDate' && s.orderId === orderId;
  }

  protected isMovingBar(barId: string): boolean {
    const s = this.moveSession();
    return !!s && s.mode === 'startOffset' && s.barId === barId;
  }

  protected displayDays(row: { bar: GanttBar; baseSpanDays: number }): number {
    const session = this.resizeSession();
    if (session && session.barId === row.bar.id) return session.previewDays;
    return row.bar.days ?? row.baseSpanDays;
  }

  protected displayWidthPx(row: { bar: GanttBar; widthPx: number; baseSpanDays: number }): number {
    const session = this.resizeSession();
    if (session && session.barId === row.bar.id) {
      return Math.max(this.pxPerDay() * 0.5, session.previewDays * this.pxPerDay());
    }
    return row.widthPx;
  }

  protected displayLeftPx(row: { bar: GanttBar; leftPx: number }): number {
    const session = this.moveSession();
    if (!session) return row.leftPx;
    if (session.mode === 'plannedDate' && session.orderId === row.bar.orderId) {
      return row.leftPx + session.previewDeltaDays * this.pxPerDay();
    }
    if (session.mode === 'startOffset' && session.barId === row.bar.id) {
      return row.leftPx + session.previewDeltaDays * this.pxPerDay();
    }
    return row.leftPx;
  }

  protected barFill(row: { bar: GanttBar; isSummary: boolean; rowKind: GanttRowKind }): string {
    if (row.bar.noTerm) return 'transparent';
    if (row.isSummary) {
      switch (row.rowKind) {
        case 'product':
          return GANTT_SUMMARY_BAR_FILL.product;
        case 'module':
          return GANTT_SUMMARY_BAR_FILL.module;
        case 'worker':
          if (isUnassignedWorkerSummaryBar(row.bar)) {
            return GANTT_UNASSIGNED_BAR_FILL;
          }
          if (row.bar.accentHue != null) {
            return this.fill('worker-tint', row.bar.accentHue);
          }
          return GANTT_SUMMARY_BAR_FILL.order;
        case 'order':
        default:
          return GANTT_SUMMARY_BAR_FILL.order;
      }
    }
    return this.fill(row.bar.workTypeId, row.bar.accentHue);
  }

  /** TZ-PRODUCTION-351 — soft WT wash on worker FIO label when dominant hue known. */
  protected workerLabelWash(row: { isWorkerSummary: boolean; bar: GanttBar }): string | null {
    if (!row.isWorkerSummary) return null;
    if (isUnassignedWorkerSummaryBar(row.bar)) return GANTT_UNASSIGNED_WASH;
    if (row.bar.accentHue == null) return null;
    return workTypeWash('worker-tint', row.bar.accentHue);
  }

  protected isUnassignedWorkerSummary(bar: GanttBar): boolean {
    return isUnassignedWorkerSummaryBar(bar);
  }

  protected unassignedWorkTypeNamesPreview(): string {
    const names = this.unassignedSummary().workTypeNames;
    if (names.length <= 4) return names.join(', ');
    return `${names.slice(0, 4).join(', ')}…`;
  }

  protected onToggleExpand(event: Event, expandId: string, bar: GanttBar): void {
    event.stopPropagation();
    event.preventDefault();
    const expanding = !this.isExpandIdOpen(expandId, bar);
    this.closeLabelOverlay();
    this.toggleExpand.emit(expandId);
    if (!expanding) return;
    if (isProductSummaryBar(bar) || isModuleSummaryBar(bar)) {
      this.scheduleTruncatedLabelPeek(bar.id);
      return;
    }
    if (isOrderSummaryBar(bar)) {
      this.scheduleFirstTruncatedChildPeek(bar.orderId);
    }
  }

  /** Expand emit key: orderId | product:… | module:… | worker:… | worker-module:… */
  protected expandKey(bar: GanttBar): string {
    if (isWorkerSummaryBar(bar)) return `worker:${bar.orderNumber}`;
    if (isProductSummaryBar(bar) || isModuleSummaryBar(bar)) return bar.id;
    return bar.orderId;
  }

  protected treeLabel(bar: GanttBar): string {
    if (isWorkerSummaryBar(bar)) return bar.orderNumber;
    if (isProductSummaryBar(bar)) return bar.productName;
    if (isModuleSummaryBar(bar)) return bar.moduleName;
    return bar.orderNumber;
  }

  protected onChildWorkToggle(event: Event, barId: string): void {
    event.stopPropagation();
    event.preventDefault();
    this.closeLabelOverlay();
    this.toggleWorkDetail.emit(barId);
  }

  protected isWorkDetailOpen(barId: string): boolean {
    return this.expandedWorkBarId() === barId;
  }

  protected isOrderMetaOpen(orderId: string): boolean {
    return this.orderMeta()?.orderId === orderId;
  }

  protected orderMetaFor(orderId: string): GanttOrderMetaView | null {
    const m = this.orderMeta();
    return m && m.orderId === orderId ? m : null;
  }

  protected isHighlightedOrder(orderId: string): boolean {
    const id = this.highlightOrderId();
    return Boolean(id && id === orderId);
  }

  protected isTreeExpandedOrder(orderId: string): boolean {
    return this.expandedOrderIds().has(orderId);
  }

  /** Order or worker group currently expanded (frames / tint). */
  protected isTreeExpandedGroup(bar: GanttBar): boolean {
    if (this.groupByWorkers()) return this.expandedWorkerIds().has(workerGroupKeyOf(bar));
    return this.expandedOrderIds().has(bar.orderId);
  }

  /** Row group key for boundary borders: worker label in worker view, else orderId. */
  private rowGroupKey(bar: GanttBar): string {
    return this.groupByWorkers() ? workerGroupKeyOf(bar) : bar.orderId;
  }

  protected isOrderEmphasized(orderId: string): boolean {
    return this.isHighlightedOrder(orderId) || this.isTreeExpandedOrder(orderId);
  }

  /**
   * Empty Gantt chrome/grid (not labels, bars, handles) → dismiss expand trees.
   * stopPropagation so studio main does not double-handle inconsistently.
   */
  protected onRootClick(event: MouseEvent): void {
    event.stopPropagation();
    const t = event.target;
    if (!(t instanceof Element)) return;
    if (
      t.closest(
        [
          '[data-test^="gantt-label-"]',
          '[data-test^="gantt-expand-"]',
          '[data-test^="gantt-work-expand-"]',
          '[data-test^="gantt-work-detail"]',
          '[data-test^="gantt-order-meta"]',
          '[data-test^="gantt-bar"]',
          '[data-test^="gantt-row-"]',
          '[data-test^="gantt-resize"]',
          'button',
          'a',
          'input',
          'select',
          'textarea',
        ].join(','),
      )
    ) {
      if (!t.closest('button.gantt-label-btn')) {
        this.closeLabelOverlay();
      }
      return;
    }
    this.closeLabelOverlay();
    this.dismissCanvas.emit();
  }

  /** Product/module rows — truncated-label-peek (hover + cascade expand). */
  protected supportsLabelOverlay(row: {
    isProductSummary: boolean;
    isModuleSummary: boolean;
  }): boolean {
    return row.isProductSummary || row.isModuleSummary;
  }

  protected isLabelOverlayOpen(row: { bar: GanttBar }): boolean {
    return this.labelOverlayKey() === row.bar.id;
  }

  protected closeLabelOverlay(): void {
    this.clearLabelOverlayLeaveTimer();
    this.labelOverlayKey.set(null);
  }

  protected openLabelPeek(barId: string): void {
    this.clearLabelOverlayLeaveTimer();
    this.labelOverlayKey.set(barId);
  }

  protected onLabelPeekEnter(
    event: MouseEvent,
    row: { isProductSummary: boolean; isModuleSummary: boolean; bar: GanttBar },
  ): void {
    if (!this.supportsLabelOverlay(row)) return;
    const wrap = event.currentTarget;
    if (!(wrap instanceof HTMLElement)) return;
    const textEl = wrap.querySelector('.gantt-label-text');
    if (!(textEl instanceof HTMLElement) || !this.isTextTruncated(textEl)) return;
    this.openLabelPeek(row.bar.id);
  }

  protected onLabelPeekLeave(): void {
    this.clearLabelOverlayLeaveTimer();
    this.labelOverlayLeaveTimer = setTimeout(() => this.closeLabelOverlay(), 120);
  }

  private clearLabelOverlayLeaveTimer(): void {
    if (this.labelOverlayLeaveTimer == null) return;
    clearTimeout(this.labelOverlayLeaveTimer);
    this.labelOverlayLeaveTimer = null;
  }

  private isTextTruncated(el: HTMLElement): boolean {
    return el.scrollWidth > el.clientWidth + 1;
  }

  private isExpandIdOpen(expandId: string, bar: GanttBar): boolean {
    if (isWorkerSummaryBar(bar)) {
      return this.expandedWorkerIds().has(workerGroupKeyOf(bar));
    }
    if (isProductSummaryBar(bar)) {
      return this.expandedProductIds().has(expandId);
    }
    if (isModuleSummaryBar(bar)) {
      return this.expandedModuleIds().has(expandId);
    }
    return this.expandedOrderIds().has(expandId);
  }

  private tryOpenTruncatedLabelPeek(barId: string): void {
    const textEl = this.hostRef.nativeElement.querySelector(
      `[data-test="gantt-label-${barId}"] .gantt-label-text`,
    );
    if (textEl instanceof HTMLElement && this.isTextTruncated(textEl)) {
      this.openLabelPeek(barId);
    }
  }

  private scheduleTruncatedLabelPeek(barId: string): void {
    afterNextRender(() => this.tryOpenTruncatedLabelPeek(barId), { injector: this.injector });
  }

  private scheduleFirstTruncatedChildPeek(orderId: string): void {
    afterNextRender(
      () => {
        for (const row of this.rows()) {
          if (row.bar.orderId !== orderId) continue;
          if (!row.isProductSummary && !row.isModuleSummary) continue;
          this.tryOpenTruncatedLabelPeek(row.bar.id);
          return;
        }
      },
      { injector: this.injector },
    );
  }

  protected labelOverlayText(row: {
    isProductSummary: boolean;
    isModuleSummary: boolean;
    bar: GanttBar;
  }): string {
    const b = row.bar;
    if (row.isProductSummary) {
      return [b.productName, b.quantityLabel].filter(Boolean).join(' ');
    }
    if (row.isModuleSummary) {
      return b.moduleName ?? '';
    }
    return '';
  }

  protected labelOverlayLevelClass(row: { rowKind: string }): string {
    if (row.rowKind === 'product') return 'gantt-label-overlay--product';
    if (row.rowKind === 'module') return 'gantt-label-overlay--module';
    return '';
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.labelOverlayKey()) return;
    const t = event.target;
    if (!(t instanceof Element)) return;
    if (t.closest('.gantt-label-wrap')) return;
    this.closeLabelOverlay();
  }

  /**
   * Order summary → order-meta; worker → expand; product/module → peek via hover/▸ only; work → detail.
   */
  protected onLabelClick(
    event: Event,
    row: { isSummary: boolean; bar: GanttBar; isProductSummary: boolean; isModuleSummary: boolean },
  ): void {
    event.stopPropagation();
    event.preventDefault();
    if (isOrderSummaryBar(row.bar)) {
      this.closeLabelOverlay();
      if (!this.groupByWorkers()) this.orderLabelClick.emit(row.bar.orderId);
      return;
    }
    if (isProductSummaryBar(row.bar) || isModuleSummaryBar(row.bar)) {
      return;
    }
    if (isWorkerSummaryBar(row.bar)) {
      this.closeLabelOverlay();
      this.toggleExpand.emit(this.expandKey(row.bar));
      return;
    }
    this.closeLabelOverlay();
    this.toggleWorkDetail.emit(row.bar.id);
  }

  protected workDetailTitle(bar: GanttBar, open: boolean): string {
    return open
      ? `Скрыть дни и людей · ${bar.workTypeName}`
      : `Показать дни и людей · ${bar.workTypeName}`;
  }

  protected workDetailWash(bar: GanttBar): string {
    return workTypeWash(bar.workTypeId, bar.accentHue);
  }

  protected onWorkDaysChange(bar: GanttBar, ev: Event): void {
    if (!this.canEdit() || this.readOnly() || this.groupByWorkers()) return;
    const inputEl = ev.target as HTMLInputElement;
    const days = Math.floor(Number(inputEl.value));
    if (!Number.isFinite(days) || days < 1) {
      inputEl.value = String(bar.days ?? 1);
      return;
    }
    if (days === bar.days) return;
    this.estimateDaysCommit.emit({
      orderId: bar.orderId,
      orderItemIndex: bar.orderItemIndex,
      moduleId: bar.moduleId,
      workTypeId: bar.workTypeId,
      days,
    });
  }

  protected onCatalogDaysClick(bar: GanttBar, ev: Event): void {
    ev.stopPropagation();
    if (!this.canEdit() || this.readOnly() || this.groupByWorkers()) return;
    this.catalogDaysRequest.emit({
      workTypeId: bar.workTypeId,
      currentDays: bar.days ?? 1,
    });
  }

  protected onMetaPriority(ev: Event): void {
    ev.stopPropagation();
    const value = (ev.target as HTMLSelectElement).value as OrderPriority;
    this.priorityDraft.set(value);
    this.emitMetaIfChanged({ priority: value, plannedDate: this.plannedDraft() });
  }

  protected onMetaPlanned(ev: Event): void {
    ev.stopPropagation();
    const value = (ev.target as HTMLInputElement).value;
    this.plannedDraft.set(value);
    this.emitMetaIfChanged({ priority: this.priorityDraft(), plannedDate: value });
  }

  private emitMetaIfChanged(next: { priority: OrderPriority; plannedDate: string }): void {
    const m = this.orderMeta();
    if (!m || !this.canEditOrder()) return;
    if (next.priority === m.priority && next.plannedDate === m.plannedDate) return;
    this.orderMetaCommit.emit({
      orderId: m.orderId,
      priority: next.priority,
      plannedDate: next.plannedDate,
    });
  }

  protected onMovePointerDown(event: PointerEvent, bar: GanttBar): void {
    if (!this.canMoveBar(bar)) return;
    // Resize handle owns its pointerdown (stopPropagation); body starts move.
    if (this.resizeSession()) return;
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture?.(event.pointerId);
    this.moveSession.set({
      mode: isOrderSummaryBar(bar) ? 'plannedDate' : 'startOffset',
      orderId: bar.orderId,
      barId: bar.id,
      bar,
      startClientX: event.clientX,
      previewDeltaDays: 0,
      pointerId: event.pointerId,
    });
  }

  protected onResizePointerDown(
    event: PointerEvent,
    row: { bar: GanttBar; baseSpanDays: number },
  ): void {
    if (!this.canResizeBar(row.bar)) return;
    event.preventDefault();
    event.stopPropagation();
    this.moveSession.set(null);
    const baseDays = Math.max(1, row.bar.days ?? row.baseSpanDays);
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    this.resizeSession.set({
      barId: row.bar.id,
      bar: row.bar,
      baseDays,
      startClientX: event.clientX,
      previewDays: baseDays,
      pointerId: event.pointerId,
    });
  }

  @HostListener('document:pointermove', ['$event'])
  protected onDocumentPointerMove(event: PointerEvent): void {
    const move = this.moveSession();
    if (move && event.pointerId === move.pointerId) {
      const previewDeltaDays = snapMoveDeltaDays(
        event.clientX - move.startClientX,
        this.pxPerDay(),
      );
      if (previewDeltaDays === move.previewDeltaDays) return;
      this.moveSession.set({ ...move, previewDeltaDays });
      return;
    }
    const session = this.resizeSession();
    if (!session || event.pointerId !== session.pointerId) return;
    const deltaPx = event.clientX - session.startClientX;
    const previewDays = snapEstimateDaysFromDelta(session.baseDays, deltaPx, this.pxPerDay());
    if (previewDays === session.previewDays) return;
    this.resizeSession.set({ ...session, previewDays });
  }

  @HostListener('document:pointerup', ['$event'])
  @HostListener('document:pointercancel', ['$event'])
  protected onDocumentPointerUp(event: PointerEvent): void {
    const move = this.moveSession();
    if (move && event.pointerId === move.pointerId) {
      this.finishMove(move, /*commit*/ true);
      return;
    }
    const session = this.resizeSession();
    if (!session || event.pointerId !== session.pointerId) return;
    this.finishResize(session, /*commit*/ true);
  }

  @HostListener('document:keydown.escape')
  protected onEscapeCancel(): void {
    if (this.labelOverlayKey()) {
      this.closeLabelOverlay();
      return;
    }
    const move = this.moveSession();
    if (move) {
      this.finishMove(move, /*commit*/ false);
      return;
    }
    const session = this.resizeSession();
    if (!session) return;
    this.finishResize(session, /*commit*/ false);
  }

  private finishMove(
    session: {
      mode: 'plannedDate' | 'startOffset';
      orderId: string;
      barId: string;
      bar: GanttBar;
      previewDeltaDays: number;
      pointerId: number;
    },
    commit: boolean,
  ): void {
    this.moveSession.set(null);
    if (!commit) return;
    const deltaDays = session.previewDeltaDays;
    if (deltaDays === 0) return;
    if (session.mode === 'plannedDate') {
      this.plannedDateMoveCommit.emit({
        orderId: session.orderId,
        deltaDays,
      });
      return;
    }
    this.startOffsetCommit.emit({
      orderId: session.bar.orderId,
      orderItemIndex: session.bar.orderItemIndex,
      moduleId: session.bar.moduleId,
      workTypeId: session.bar.workTypeId,
      startDate: session.bar.startDate,
      deltaDays,
    });
  }

  private finishResize(
    session: {
      barId: string;
      bar: GanttBar;
      baseDays: number;
      previewDays: number;
      pointerId: number;
    },
    commit: boolean,
  ): void {
    this.resizeSession.set(null);
    if (!commit) return;
    const days = Math.max(1, session.previewDays);
    if (days === session.baseDays) return;
    this.estimateDaysCommit.emit({
      orderId: session.bar.orderId,
      orderItemIndex: session.bar.orderItemIndex,
      moduleId: session.bar.moduleId,
      workTypeId: session.bar.workTypeId,
      days,
    });
  }

  protected fill(workTypeId: string, hue?: number | null): string {
    return workTypeOklch(workTypeId, 0.12, 0.72, hue);
  }

  /** Denser WT chip on worker FIO row (TZ-PRODUCTION-351). */
  protected workerChipFill(hue: number | null | undefined): string {
    return workTypeOklch('worker-tint', 0.14, 0.76, hue);
  }

  protected statusLabel(s: OrderStatus): string {
    return ORDER_STATUS_LABELS[s] ?? s;
  }

  protected statusPip(s: OrderStatus): string {
    switch (s) {
      case 'draft':
        return 'oklch(0.65 0.02 250)';
      case 'confirmed':
        return 'oklch(0.62 0.14 230)';
      case 'in_production':
        return 'oklch(0.65 0.16 85)';
      case 'ready':
        return 'oklch(0.62 0.15 145)';
      case 'shipped':
        return 'oklch(0.55 0.08 280)';
      case 'delivered':
        return 'oklch(0.5 0.05 150)';
      case 'cancelled':
        return 'oklch(0.55 0.14 25)';
      default:
        return 'oklch(0.6 0.02 250)';
    }
  }

  /** Full detail for tooltip / a11y — visible label stays one line. */
  protected labelTitle(b: GanttBar): string {
    if (isUnassignedWorkerSummaryBar(b)) {
      return [
        `Рабочий: ${b.orderNumber}`,
        'нет исполнителя на видах работ',
        `${b.startDate}→${b.endDate}`,
      ].join(' · ');
    }
    if (isWorkerSummaryBar(b)) {
      return [`Рабочий: ${b.orderNumber}`, `${b.startDate}→${b.endDate}`].join(' · ');
    }
    if (isOrderSummaryBar(b)) {
      return [b.orderNumber, this.statusLabel(b.orderStatus), `${b.startDate}→${b.endDate}`]
        .filter(Boolean)
        .join(' · ');
    }
    if (isProductSummaryBar(b)) {
      return [b.orderNumber, b.productName, b.quantityLabel, `${b.startDate}→${b.endDate}`]
        .filter(Boolean)
        .join(' · ');
    }
    if (isModuleSummaryBar(b)) {
      return [b.orderNumber, b.productName, b.moduleName, `${b.startDate}→${b.endDate}`]
        .filter(Boolean)
        .join(' · ');
    }
    const parts = [
      b.orderNumber,
      this.statusLabel(b.orderStatus),
      b.productName,
      b.moduleName,
      b.workTypeName,
      b.quantityLabel,
      b.workerLabel && b.workerLabel !== '—' ? `исполн.: ${b.workerLabel}` : null,
    ].filter(Boolean);
    return parts.join(' · ');
  }

  /** TZ-PRODUCTION-320/343: chevron zone — kind-aware Gantt tree expand. */
  protected expandTitle(bar: GanttBar, expanded: boolean): string {
    const label = this.treeLabel(bar);
    if (isProductSummaryBar(bar)) {
      return expanded
        ? `Свернуть модули изделия · ${label}`
        : `Развернуть модули изделия · ${label}`;
    }
    if (isModuleSummaryBar(bar)) {
      return expanded ? `Свернуть виды работ · ${label}` : `Развернуть виды работ · ${label}`;
    }
    if (isWorkerSummaryBar(bar)) {
      return expanded
        ? `Свернуть модули рабочего · ${label}`
        : `Развернуть модули рабочего · ${label}`;
    }
    return expanded
      ? `Свернуть состав на Ганте · ${label}`
      : `Развернуть состав на Ганте · ${label}`;
  }

  /** TZ-PRODUCTION-322: order-number zone — order-meta strip only. */
  protected summaryCardTitle(b: GanttBar): string {
    if (isUnassignedWorkerSummaryBar(b)) {
      return `Нет исполнителя: ${b.orderNumber} — назначьте виды работ в Люди`;
    }
    if (isWorkerSummaryBar(b)) return `Группа рабочего: ${b.orderNumber}`;
    if (isProductSummaryBar(b)) return `Изделие · ${b.productName}`;
    if (isModuleSummaryBar(b)) return `Модуль · ${b.moduleName}`;
    return `Статус и даты заказа ${b.orderNumber}`;
  }

  protected barTitle(b: GanttBar): string {
    const head = this.labelTitle(b);
    if (b.noTerm) return `${head} — без срока`;
    if (isSummaryBar(b)) return `${head} · сводно ${b.days}д`.trim();
    return `${head} · ${b.startDate}→${b.endDate} · ${b.days}д`.trim();
  }

  protected barAriaLabel(b: GanttBar): string {
    const base = this.barTitle(b);
    if (!this.canMoveBar(b)) return base;
    if (isOrderSummaryBar(b)) return `${base} · Сдвинуть начало заказа`;
    return `${base} · Сдвинуть вид работ`;
  }
}

function dayDiff(a: string, b: string): number {
  const pa = a.split('-').map(Number);
  const pb = b.split('-').map(Number);
  const da = Date.UTC(pa[0]!, pa[1]! - 1, pa[2]!);
  const db = Date.UTC(pb[0]!, pb[1]! - 1, pb[2]!);
  return Math.round((db - da) / 86400000);
}

function addDays(dateOnly: string, days: number): string {
  const [y, m, d] = dateOnly.split('-').map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d!));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function shortDay(dateOnly: string): string {
  const [, m, d] = dateOnly.split('-');
  return `${d}.${m}`;
}
