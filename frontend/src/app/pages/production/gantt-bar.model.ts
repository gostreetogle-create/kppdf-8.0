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
}

export interface DirectModuleRef {
  moduleId: string;
  moduleName: string;
  sortOrder: number;
  workTypes: ModuleWorkTypeRef[];
}

export interface OrderItemEstimateInput {
  orderItemIndex: number;
  productId: string;
  productName: string;
  quantity: number;
  modules: DirectModuleRef[];
}

export interface OrderEstimateInput {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  plannedDate?: string | null;
  date?: string | null;
  items: OrderItemEstimateInput[];
}

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
        const days = normalizeWorkTypeDays(wt.days);
        const noTerm = days == null;
        const start = startOfLocalDay(cursor);
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
        });

        // Sequential visual pack: advance only when we have a positive day span.
        // Quantity does NOT multiply duration (lock I).
        if (!noTerm && days != null) {
          cursor = addCalendarDays(start, days);
        }
      }
    }
  }

  return bars;
}

/** Stable OKLCH fill from workTypeId (colorful bars — PO OK). */
export function workTypeOklch(workTypeId: string, chroma = 0.12, lightness = 0.72): string {
  let h = 0;
  for (let i = 0; i < workTypeId.length; i++) {
    h = (h * 31 + workTypeId.charCodeAt(i)) >>> 0;
  }
  const hue = h % 360;
  return `oklch(${lightness} ${chroma} ${hue})`;
}

export function filterOrdersForRail<
  T extends {
    status: OrderStatus;
    isActive?: boolean;
    _id: string;
    number?: string;
    priority?: string;
    plannedDate?: string | null;
    date?: string | null;
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
    if (from || to) {
      const anchor = (o.plannedDate || o.date || '').slice(0, 10);
      if (!anchor) return false;
      if (from && anchor < from) return false;
      if (to && anchor > to) return false;
    }
    if (!q) return true;
    const hay = `${o._id} ${o.number ?? ''}`.toLowerCase();
    return hay.includes(q);
  });
}
