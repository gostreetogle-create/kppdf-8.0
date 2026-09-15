import type { OrderPriority, OrderStatus } from '@kppdf/data-access';
import type { GanttZoom } from '../production-cockpit.context';

/**
 * TZ-NX-GANTT-BARS-FACADE — pure, Angular-free constants/types/helpers shared
 * between `gantt-bars.component.ts` (still re-exports all of these — external
 * imports like the spec's `GANTT_PX_PER_DAY` and the cockpit page's `Gantt*Commit`
 * types keep resolving from there unchanged) and `gantt-bars.facade.ts`.
 * Split out to avoid a circular value-import between those two (component
 * needs the `GanttBarsFacade` class; facade needs these) — not a behavior
 * change, purely a relocation of what were already module-level, class-free
 * declarations. Will fold into `@kppdf/features/production/util` in the
 * successor `TZ-NX-GANTT-BARS-UTIL-UI`.
 */

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

/** Dense inline work-type detail (people / days / hint) — one horizontal row. */
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

export const ORDER_META_PRIORITIES: { value: OrderPriority; label: string }[] = [
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

/** Explicit order-scoped worker assignment from work-detail. */
export interface GanttWorkerAssignmentCommit {
  orderId: string;
  orderItemIndex: number;
  moduleId: string;
  workTypeId: string;
  workerIds: readonly string[];
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

export function isBarEstimateReadOnly(status: OrderStatus): boolean {
  return status === 'shipped' || status === 'delivered' || status === 'cancelled';
}
