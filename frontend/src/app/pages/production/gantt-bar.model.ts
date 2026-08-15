/**
 * TZ-PRODUCTION-303 — pure Gantt estimate model (no Angular DI).
 *
 * Locks:
 *  A/C — 7 commercial Order statuses; ACTIVE = draft/confirmed/in_production/ready
 *  B   — visualAnchor = plannedDate ?? date ?? today; sequential pack by sortOrder
 *  D   — duration = WorkType.days only (never estimatedHours)
 *  E   — no ProductionOrder / OrderTask
 *  I   — quantity as ×N display only; do NOT multiply duration
 */

import type { OrderStatus } from '../orders/orders.service';

export const ACTIVE_COMMERCIAL_ORDER_STATUSES: readonly OrderStatus[] = [
  'draft',
  'confirmed',
  'in_production',
  'ready',
] as const;

export const NO_COUNTERPARTY_FILTER = '__none__';

export interface CounterpartyOrderRef {
  counterpartyId?: string | { _id: string; name?: string } | null;
}

export function counterpartyIdOf(order: CounterpartyOrderRef): string {
  const value = order.counterpartyId;
  if (!value) return '';
  return typeof value === 'string' ? value : value._id;
}

export function counterpartyNameOf(order: CounterpartyOrderRef): string {
  const value = order.counterpartyId;
  if (!value || typeof value === 'string' || !value.name?.trim()) return 'Без заказчика';
  return value.name.trim();
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Черновик',
  confirmed: 'Подтверждён',
  in_production: 'В производстве',
  ready: 'Готов',
  shipped: 'Отгружен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

export function isActiveCommercialOrderStatus(status: OrderStatus): boolean {
  return (ACTIVE_COMMERCIAL_ORDER_STATUSES as readonly string[]).includes(status);
}

/** TZ-PRODUCTION-331 — composition frozen; plan fields stay editable through ready. */
export function isHardFrozenOrderStatus(status: OrderStatus): boolean {
  return status === 'shipped' || status === 'delivered' || status === 'cancelled';
}

/** Parse YYYY-MM-DD or ISO date as local date-only (no TZ day-shift). */
export function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addCalendarDays(d: Date, days: number): Date {
  const out = startOfLocalDay(d);
  out.setDate(out.getDate() + days);
  return out;
}

export function formatDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface VisualAnchorResult {
  /** Local midnight of the visual start day. */
  anchor: Date;
  usedFallbackToday: boolean;
  source: 'plannedDate' | 'date' | 'today';
}

export function resolveVisualAnchor(
  order: { plannedDate?: string | null; date?: string | null },
  today: Date = new Date(),
): VisualAnchorResult {
  const planned = parseDateOnly(order.plannedDate ?? undefined);
  if (planned) {
    return { anchor: planned, usedFallbackToday: false, source: 'plannedDate' };
  }
  const orderDate = parseDateOnly(order.date ?? undefined);
  if (orderDate) {
    return { anchor: orderDate, usedFallbackToday: false, source: 'date' };
  }
  return {
    anchor: startOfLocalDay(today),
    usedFallbackToday: true,
    source: 'today',
  };
}

/** Valid positive calendar days; else null → no-term bar. */
export function normalizeWorkTypeDays(days: number | null | undefined): number | null {
  if (days == null) return null;
  if (!Number.isFinite(days) || days <= 0) return null;
  return Math.floor(days);
}

export interface ModuleWorkTypeRef {
  workTypeId: string;
  workTypeName: string;
  /** Intentionally unused for duration (lock D). */
  estimatedHours?: number | null;
  days: number | null | undefined;
  sortOrder: number;
  /** Optional catalog accent (0–359). Null → hash from id. */
  accentHue?: number | null;
}

export interface DirectModuleRef {
  moduleId: string;
  moduleName: string;
  sortOrder: number;
  workTypes: ModuleWorkTypeRef[];
  modulePhotoUrl?: string | null;
}

export interface OrderItemEstimateInput {
  orderItemIndex: number;
  productId: string;
  productName: string;
  quantity: number;
  modules: DirectModuleRef[];
  productPhotoUrl?: string | null;
}

export interface OrderEstimateInput {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  plannedDate?: string | null;
  date?: string | null;
  items: OrderItemEstimateInput[];
  /** TZ-PRODUCTION-309 — order-level days; applied in buildGanttBars. */
  estimateDayOverrides?: EstimateDayOverrideRef[];
  /** TZ-PRODUCTION-316 — per-bar start offset from visualAnchor. */
  estimateStartOffsets?: EstimateStartOffsetRef[];
}

/** TZ-PRODUCTION-309 composite key for order-level duration. */
export interface EstimateDayOverrideRef {
  orderItemIndex: number;
  moduleId: string;
  workTypeId: string;
  days: number;
}

/** TZ-PRODUCTION-316 composite key for start offset. */
export interface EstimateStartOffsetRef {
  orderItemIndex: number;
  moduleId: string;
  workTypeId: string;
  offsetDays: number;
}

export function estimateOverrideKey(
  orderItemIndex: number,
  moduleId: string,
  workTypeId: string,
): string {
  return `${orderItemIndex}|${moduleId}|${workTypeId}`;
}

/** Map overrides for O(1) lookup; invalid/empty rows skipped. */
export function indexEstimateDayOverrides(
  overrides: EstimateDayOverrideRef[] | null | undefined,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of overrides ?? []) {
    if (
      !Number.isInteger(row.orderItemIndex) ||
      row.orderItemIndex < 0 ||
      !row.moduleId ||
      !row.workTypeId
    ) {
      continue;
    }
    const days = normalizeWorkTypeDays(row.days);
    if (days == null) continue;
    map.set(estimateOverrideKey(row.orderItemIndex, row.moduleId, row.workTypeId), days);
  }
  return map;
}

/** Map start offsets; invalid rows skipped. offsetDays must be int ≥ 0. */
export function indexEstimateStartOffsets(
  offsets: EstimateStartOffsetRef[] | null | undefined,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of offsets ?? []) {
    if (
      !Number.isInteger(row.orderItemIndex) ||
      row.orderItemIndex < 0 ||
      !row.moduleId ||
      !row.workTypeId
    ) {
      continue;
    }
    if (!Number.isInteger(row.offsetDays) || row.offsetDays < 0) continue;
    map.set(estimateOverrideKey(row.orderItemIndex, row.moduleId, row.workTypeId), row.offsetDays);
  }
  return map;
}

/**
 * Resolve days for a bar: order override wins, else catalog WorkType.days.
 */
export function resolveEstimateDays(
  orderItemIndex: number,
  moduleId: string,
  workTypeId: string,
  catalogDays: number | null | undefined,
  overrideIndex: Map<string, number>,
): number | null {
  const hit = overrideIndex.get(estimateOverrideKey(orderItemIndex, moduleId, workTypeId));
  if (hit != null) return hit;
  return normalizeWorkTypeDays(catalogDays);
}

export type GanttBarKind = 'work' | 'summary';

export interface GanttBar {
  id: string;
  orderId: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  orderItemIndex: number;
  productId: string;
  productName: string;
  moduleId: string;
  moduleName: string;
  workTypeId: string;
  workTypeName: string;
  occurrence: number;
  quantity: number;
  quantityLabel: string | null;
  /** Calendar days when known; null → no-term. */
  days: number | null;
  noTerm: boolean;
  startDate: string;
  endDate: string;
  usedFallbackToday: boolean;
  workerLabel: string;
  accentHue?: number | null;
  /** TZ-PRODUCTION-314 — summary row vs work-type child. Default work. */
  kind?: GanttBarKind;
  /**
   * TZ-PRODUCTION-316 — explicit start offset from visualAnchor when set.
   * null/undefined = sequential pack (no override).
   */
  startOffsetDays?: number | null;
}

export function isSummaryBar(bar: GanttBar): boolean {
  return bar.kind === 'summary';
}

export function isWorkBar(bar: GanttBar): boolean {
  return bar.kind !== 'summary';
}

/**
 * Span days inclusive (end − start + 1). Returns null when dates invalid.
 */
export function calendarSpanDays(startDate: string, endDate: string): number | null {
  const a = parseDateOnly(startDate);
  const b = parseDateOnly(endDate);
  if (!a || !b) return null;
  const ms = startOfLocalDay(b).getTime() - startOfLocalDay(a).getTime();
  const days = Math.round(ms / 86400000) + 1;
  return days >= 1 ? days : null;
}

/**
 * Group work-type bars by orderId (stable order of first appearance).
 */
export function groupBarsByOrder(bars: readonly GanttBar[]): Array<{
  orderId: string;
  children: GanttBar[];
}> {
  const map = new Map<string, GanttBar[]>();
  const order: string[] = [];
  for (const bar of bars) {
    if (isSummaryBar(bar)) continue;
    const list = map.get(bar.orderId);
    if (!list) {
      map.set(bar.orderId, [bar]);
      order.push(bar.orderId);
    } else {
      list.push(bar);
    }
  }
  return order.map((orderId) => ({ orderId, children: map.get(orderId)! }));
}

/**
 * One summary bar for an order: span = min(child.start) … max(child.end).
 * Duration label = calendar span days (not sum of child days).
 */
export function buildOrderSummaryBar(children: readonly GanttBar[]): GanttBar | null {
  if (!children.length) return null;
  const first = children[0]!;
  let minStart = first.startDate;
  let maxEnd = first.endDate;
  let usedFallbackToday = first.usedFallbackToday;
  let allNoTerm = true;
  for (const c of children) {
    if (c.startDate < minStart) minStart = c.startDate;
    if (c.endDate > maxEnd) maxEnd = c.endDate;
    usedFallbackToday = usedFallbackToday || c.usedFallbackToday;
    if (!c.noTerm) allNoTerm = false;
  }
  const span = calendarSpanDays(minStart, maxEnd);
  const noTerm = allNoTerm || span == null;
  return {
    id: `summary:${first.orderId}`,
    orderId: first.orderId,
    orderNumber: first.orderNumber,
    orderStatus: first.orderStatus,
    orderItemIndex: -1,
    productId: '',
    productName: '',
    moduleId: '',
    moduleName: '',
    workTypeId: '__summary__',
    workTypeName: 'Сводно',
    occurrence: 0,
    quantity: 1,
    quantityLabel: null,
    days: noTerm ? null : span,
    noTerm,
    startDate: minStart,
    endDate: maxEnd,
    usedFallbackToday,
    workerLabel: '—',
    accentHue: null,
    kind: 'summary',
  };
}

/**
 * Collapsed tree: one summary per order.
 * Expanded orderIds also append work-type children under their summary.
 */
export function buildGanttTreeBars(
  workBars: readonly GanttBar[],
  expandedOrderIds: ReadonlySet<string>,
): GanttBar[] {
  const groups = groupBarsByOrder(workBars);
  // Keep groups sorted by orderNumber for stable rail.
  const sorted = [...groups].sort((a, b) => {
    const an = a.children[0]?.orderNumber ?? a.orderId;
    const bn = b.children[0]?.orderNumber ?? b.orderId;
    return an.localeCompare(bn);
  });
  const out: GanttBar[] = [];
  for (const g of sorted) {
    const summary = buildOrderSummaryBar(g.children);
    if (!summary) continue;
    out.push(summary);
    if (expandedOrderIds.has(g.orderId)) {
      const kids = [...g.children].sort((a, b) => {
        const s = a.startDate.localeCompare(b.startDate);
        if (s !== 0) return s;
        return a.occurrence - b.occurrence;
      });
      for (const kid of kids) {
        out.push({ ...kid, kind: kid.kind ?? 'work' });
      }
    }
  }
  return out;
}

function sortByOrderThenIndex<T extends { sortOrder: number }>(
  rows: T[],
  indexOf: (row: T) => number,
): T[] {
  return [...rows].sort((a, b) => {
    const so = a.sortOrder - b.sortOrder;
    if (so !== 0) return so;
    return indexOf(a) - indexOf(b);
  });
}

export function buildGanttBars(order: OrderEstimateInput, today: Date = new Date()): GanttBar[] {
  const { anchor, usedFallbackToday } = resolveVisualAnchor(order, today);
  const overrideIndex = indexEstimateDayOverrides(order.estimateDayOverrides);
  const startOffsetIndex = indexEstimateStartOffsets(order.estimateStartOffsets);
  const bars: GanttBar[] = [];
  let cursor = startOfLocalDay(anchor);
  let occurrence = 0;

  const items = [...order.items].sort((a, b) => a.orderItemIndex - b.orderItemIndex);

  for (const item of items) {
    const qty = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1;
    const quantityLabel = qty > 1 ? `×${qty}` : null;
    const modules = sortByOrderThenIndex(item.modules, (m) => item.modules.indexOf(m));

    for (const mod of modules) {
      const workTypes = sortByOrderThenIndex(mod.workTypes, (w) => mod.workTypes.indexOf(w));

      for (const wt of workTypes) {
        occurrence += 1;
        const days = resolveEstimateDays(
          item.orderItemIndex,
          mod.moduleId,
          wt.workTypeId,
          wt.days,
          overrideIndex,
        );
        const noTerm = days == null;
        const key = estimateOverrideKey(item.orderItemIndex, mod.moduleId, wt.workTypeId);
        const hasOffset = startOffsetIndex.has(key);
        const startOffsetDays = hasOffset ? startOffsetIndex.get(key)! : null;

        let start: Date;
        if (hasOffset && startOffsetDays != null) {
          // Parallel: absolute from visualAnchor; does not advance sequential cursor.
          start = addCalendarDays(startOfLocalDay(anchor), startOffsetDays);
        } else {
          start = startOfLocalDay(cursor);
        }
        const end = noTerm ? start : addCalendarDays(start, days - 1);

        bars.push({
          id: [
            order.orderId,
            String(item.orderItemIndex),
            item.productId,
            mod.moduleId,
            wt.workTypeId,
            String(occurrence),
          ].join(':'),
          orderId: order.orderId,
          orderNumber: order.orderNumber,
          orderStatus: order.status,
          orderItemIndex: item.orderItemIndex,
          productId: item.productId,
          productName: item.productName,
          moduleId: mod.moduleId,
          moduleName: mod.moduleName,
          workTypeId: wt.workTypeId,
          workTypeName: wt.workTypeName,
          occurrence,
          quantity: qty,
          quantityLabel,
          days,
          noTerm,
          startDate: formatDateOnly(start),
          endDate: formatDateOnly(end),
          usedFallbackToday,
          workerLabel: '—',
          accentHue: wt.accentHue ?? null,
          startOffsetDays,
        });

        // Sequential pack only for bars without explicit offset.
        if (!hasOffset && !noTerm && days != null) {
          cursor = addCalendarDays(start, days);
        }
      }
    }
  }

  return bars;
}

/**
 * Stable WorkType palette — max 7 hues (design note).
 * Hash / accentHue snap to nearest bucket so legend stays readable.
 */
export const WORK_TYPE_HUE_BUCKETS = [25, 75, 130, 185, 230, 285, 330] as const;

export function snapWorkTypeHue(raw: number): number {
  const h = ((Math.round(raw) % 360) + 360) % 360;
  let best: number = WORK_TYPE_HUE_BUCKETS[0]!;
  let bestDist = 360;
  for (const bucket of WORK_TYPE_HUE_BUCKETS) {
    const dist = Math.min(Math.abs(h - bucket), 360 - Math.abs(h - bucket));
    if (dist < bestDist) {
      bestDist = dist;
      best = bucket;
    }
  }
  return best;
}

/** Stable OKLCH fill from workTypeId. Optional catalog accentHue (snapped to 7 buckets). */
export function workTypeOklch(
  workTypeId: string,
  chroma = 0.12,
  lightness = 0.72,
  hueOverride?: number | null,
): string {
  let raw = 0;
  if (hueOverride != null && Number.isFinite(hueOverride)) {
    raw = hueOverride;
  } else {
    for (let i = 0; i < workTypeId.length; i++) {
      raw = (raw * 31 + workTypeId.charCodeAt(i)) >>> 0;
    }
  }
  const h = snapWorkTypeHue(raw);
  return `oklch(${lightness} ${chroma} ${h})`;
}

/** Soft wash for inspector cards (same hue family as bars). */
export function workTypeWash(workTypeId: string, hueOverride?: number | null): string {
  return workTypeOklch(workTypeId, 0.06, 0.94, hueOverride);
}

/** Shared RU hint: order-level days override (inspector WT leaf + Gantt work-detail). */
export const ESTIMATE_OVERRIDE_HINT_RU =
  'По умолчанию — только этот заказ (override). Цвет = вид работ.';

export function filterOrdersForRail<
  T extends {
    status: OrderStatus;
    isActive?: boolean;
    _id: string;
    number?: string;
    priority?: string;
    plannedDate?: string | null;
    date?: string | null;
    counterpartyId?: string | { _id: string; name?: string } | null;
  },
>(
  orders: T[],
  opts: {
    activeOnly: boolean;
    search: string;
    /** Keep selected even if filtered out (completed/cancelled stay visible). */
    selectedOrderId: string | null;
    priority?: string | 'all' | null;
    dateFrom?: string | null;
    dateTo?: string | null;
    counterpartyId?: string | null;
    searchByCounterparty?: boolean;
  },
): T[] {
  const q = opts.search.trim().toLowerCase();
  const priority = opts.priority && opts.priority !== 'all' ? opts.priority : null;
  const from = opts.dateFrom || null;
  const to = opts.dateTo || null;
  return orders.filter((o) => {
    if (opts.selectedOrderId && o._id === opts.selectedOrderId) return true;
    if (opts.activeOnly) {
      if (!isActiveCommercialOrderStatus(o.status)) return false;
      if (o.isActive === false) return false;
    }
    if (priority && (o.priority ?? 'normal') !== priority) return false;
    if (opts.counterpartyId) {
      const id = counterpartyIdOf(o);
      if (opts.counterpartyId === NO_COUNTERPARTY_FILTER ? id !== '' : id !== opts.counterpartyId) {
        return false;
      }
    }
    if (from || to) {
      const anchor = (o.plannedDate || o.date || '').slice(0, 10);
      if (!anchor) return false;
      if (from && anchor < from) return false;
      if (to && anchor > to) return false;
    }
    if (!q) return true;
    const hay = opts.searchByCounterparty
      ? `${counterpartyNameOf(o)}`.toLowerCase()
      : `${o._id} ${o.number ?? ''}`.toLowerCase();
    return hay.includes(q);
  });
}
