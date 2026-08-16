/**
 * TZ-PRODUCTION-303+ — shared cockpit signals (shell + blocks).
 * No domain fetch logic here — facade owns reads.
 */
import { Injectable, computed, signal } from '@angular/core';
import type { OrderPriority } from '../orders/orders.service';

export type GanttZoom = 'day' | 'month';

/** TZ-GANTT-401 — row grouping mode on the Gantt. */
export type GanttGroupBy = 'orders' | 'workers';

@Injectable()
export class ProductionCockpitContext {
  /** null = «Все активные» mode (multi-order estimate). */
  readonly selectedOrderId = signal<string | null>(null);
  readonly search = signal('');
  readonly activeOnly = signal(true);
  readonly zoom = signal<GanttZoom>('day');
  readonly workerIdFilter = signal<string | null>(null);
  /** `all` = no priority filter. */
  readonly priorityFilter = signal<OrderPriority | 'all'>('all');
  /** ISO date-only range on plannedDate ?? date. */
  readonly dateFrom = signal<string | null>(null);
  readonly dateTo = signal<string | null>(null);
  /** Counterparty id; `__none__` means orders without a populated party. */
  readonly counterpartyFilter = signal<string | null>(null);
  /**
   * Dirty vs defaults: activeOnly=true, priority=all, no dates, no Counterparty.
   * Search is list-only and does not light the Filters reset.
   */
  readonly filtersDirty = computed(
    () =>
      this.counterpartyFilter() !== null ||
      this.priorityFilter() !== 'all' ||
      this.dateFrom() !== null ||
      this.dateTo() !== null ||
      this.activeOnly() !== true,
  );
  /** Collapsed rail = icon strip for more calendar width. */
  readonly railCollapsed = signal(false);

  /**
   * TZ-PRODUCTION-314 — expanded Gantt order ids (session; F5 resets).
   * Survives filter toggles within the SPA session.
   */
  readonly expandedOrderIds = signal<ReadonlySet<string>>(new Set());

  /**
   * TZ-PRODUCTION-342 — product / module expand keys
   * (`product:{orderId}:{item}` / `module:{orderId}:{item}:{moduleId}`).
   */
  readonly expandedProductIds = signal<ReadonlySet<string>>(new Set());
  readonly expandedModuleIds = signal<ReadonlySet<string>>(new Set());

  /**
   * TZ-PRODUCTION-344 — worker lens expand keys
   * (worker label / `worker-module:{label}:{orderId}:{item}:{moduleId}`).
   * Default collapsed, same as orders.
   */
  readonly expandedWorkerIds = signal<ReadonlySet<string>>(new Set());
  readonly expandedWorkerModuleIds = signal<ReadonlySet<string>>(new Set());

  /**
   * TZ-PRODUCTION-321 — one open work-type detail bar id (session; not in URL).
   */
  readonly expandedWorkBarId = signal<string | null>(null);

  /**
   * TZ-PRODUCTION-322 — order-meta strip under summary (session; not in URL).
   * Highlight `gantt-order-active` follows this, not a bottom sheet.
   */
  readonly orderMetaOpen = signal(false);

  selectOrder(id: string | null): void {
    this.selectedOrderId.set(id);
  }

  setOrderMetaOpen(open: boolean): void {
    this.orderMetaOpen.set(open);
  }

  closeOrderMeta(): void {
    if (!this.orderMetaOpen()) return;
    this.orderMetaOpen.set(false);
  }

  isOrderExpanded(orderId: string): boolean {
    return this.expandedOrderIds().has(orderId);
  }

  isProductExpanded(productId: string): boolean {
    return this.expandedProductIds().has(productId);
  }

  isModuleExpanded(moduleId: string): boolean {
    return this.expandedModuleIds().has(moduleId);
  }

  isWorkerExpanded(workerLabel: string): boolean {
    return this.expandedWorkerIds().has(workerLabel);
  }

  isWorkerModuleExpanded(moduleSummaryId: string): boolean {
    return this.expandedWorkerModuleIds().has(moduleSummaryId);
  }

  toggleOrderExpanded(orderId: string): void {
    this.expandedOrderIds.update((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
        this.pruneExpandUnderOrder(orderId);
        const workId = this.expandedWorkBarId();
        if (workId && workId.startsWith(`${orderId}:`)) {
          this.expandedWorkBarId.set(null);
        }
      } else {
        next.add(orderId);
      }
      return next;
    });
  }

  toggleProductExpanded(productSummaryId: string): void {
    this.expandedProductIds.update((prev) => {
      const next = new Set(prev);
      if (next.has(productSummaryId)) {
        next.delete(productSummaryId);
        this.pruneModulesUnderProduct(productSummaryId);
      } else {
        next.add(productSummaryId);
      }
      return next;
    });
  }

  toggleModuleExpanded(moduleSummaryId: string): void {
    this.expandedModuleIds.update((prev) => {
      const next = new Set(prev);
      if (next.has(moduleSummaryId)) {
        next.delete(moduleSummaryId);
        const workId = this.expandedWorkBarId();
        // module:{orderId}:{item}:{moduleId} — clear work-detail under this module path
        if (workId) {
          const parts = moduleSummaryId.split(':');
          // ['module', orderId, item, moduleId...]
          if (parts.length >= 4) {
            const orderId = parts[1]!;
            const item = parts[2]!;
            const moduleId = parts.slice(3).join(':');
            const prefix = `${orderId}:${item}:`;
            if (workId.startsWith(prefix) && workId.includes(`:${moduleId}:`)) {
              this.expandedWorkBarId.set(null);
            }
          }
        }
      } else {
        next.add(moduleSummaryId);
      }
      return next;
    });
  }

  toggleWorkerExpanded(workerLabel: string): void {
    this.expandedWorkerIds.update((prev) => {
      const next = new Set(prev);
      if (next.has(workerLabel)) {
        next.delete(workerLabel);
        this.pruneWorkerModulesUnder(workerLabel);
        this.clearWorkDetailIfUnderWorkerModules(workerLabel);
      } else {
        next.add(workerLabel);
      }
      return next;
    });
  }

  toggleWorkerModuleExpanded(moduleSummaryId: string): void {
    this.expandedWorkerModuleIds.update((prev) => {
      const next = new Set(prev);
      if (next.has(moduleSummaryId)) {
        next.delete(moduleSummaryId);
        this.clearWorkDetailIfUnderWorkerModuleId(moduleSummaryId);
      } else {
        next.add(moduleSummaryId);
      }
      return next;
    });
  }

  toggleWorkDetail(barId: string): void {
    this.expandedWorkBarId.update((cur) => (cur === barId ? null : barId));
  }

  clearWorkDetail(): void {
    if (this.expandedWorkBarId() == null) return;
    this.expandedWorkBarId.set(null);
  }

  setOrderExpanded(orderId: string, expanded: boolean): void {
    this.expandedOrderIds.update((prev) => {
      const next = new Set(prev);
      if (expanded) next.add(orderId);
      else {
        next.delete(orderId);
        this.pruneExpandUnderOrder(orderId);
        const workId = this.expandedWorkBarId();
        if (workId && workId.startsWith(`${orderId}:`)) {
          this.expandedWorkBarId.set(null);
        }
      }
      return next;
    });
  }

  /** Collapse all Gantt trees + work-detail (backdrop / empty canvas). */
  clearExpandedOrders(): void {
    if (
      this.expandedOrderIds().size === 0 &&
      this.expandedProductIds().size === 0 &&
      this.expandedModuleIds().size === 0 &&
      this.expandedWorkerIds().size === 0 &&
      this.expandedWorkerModuleIds().size === 0 &&
      this.expandedWorkBarId() == null
    ) {
      return;
    }
    this.expandedOrderIds.set(new Set());
    this.expandedProductIds.set(new Set());
    this.expandedModuleIds.set(new Set());
    this.expandedWorkerIds.set(new Set());
    this.expandedWorkerModuleIds.set(new Set());
    this.expandedWorkBarId.set(null);
  }

  private pruneExpandUnderOrder(orderId: string): void {
    this.expandedProductIds.update((prev) => {
      const next = new Set(prev);
      for (const id of prev) {
        if (id.startsWith(`product:${orderId}:`)) next.delete(id);
      }
      return next;
    });
    this.expandedModuleIds.update((prev) => {
      const next = new Set(prev);
      for (const id of prev) {
        if (id.startsWith(`module:${orderId}:`)) next.delete(id);
      }
      return next;
    });
  }

  private pruneModulesUnderProduct(productSummaryId: string): void {
    // product:{orderId}:{item} → module:{orderId}:{item}:*
    const prefix = productSummaryId.replace(/^product:/, 'module:');
    this.expandedModuleIds.update((prev) => {
      const next = new Set(prev);
      for (const id of prev) {
        if (id.startsWith(`${prefix}:`)) next.delete(id);
      }
      return next;
    });
  }

  private pruneWorkerModulesUnder(workerLabel: string): void {
    const prefix = `worker-module:${workerLabel}:`;
    this.expandedWorkerModuleIds.update((prev) => {
      const next = new Set(prev);
      for (const id of prev) {
        if (id.startsWith(prefix)) next.delete(id);
      }
      return next;
    });
  }

  private clearWorkDetailIfUnderWorkerModules(_workerLabel: string): void {
    if (this.expandedWorkBarId() != null) this.expandedWorkBarId.set(null);
  }

  private clearWorkDetailIfUnderWorkerModuleId(moduleSummaryId: string): void {
    const workId = this.expandedWorkBarId();
    if (!workId) return;
    // worker-module:{label}:{orderId}:{item}:{moduleId}
    const parts = moduleSummaryId.split(':');
    if (parts.length < 5) return;
    const orderId = parts[2]!;
    const item = parts[3]!;
    const moduleId = parts.slice(4).join(':');
    const prefix = `${orderId}:${item}:`;
    if (workId.startsWith(prefix) && workId.includes(`:${moduleId}:`)) {
      this.expandedWorkBarId.set(null);
    }
  }

  setSearch(value: string): void {
    this.search.set(value);
  }

  setActiveOnly(value: boolean): void {
    this.activeOnly.set(value);
  }

  setZoom(zoom: GanttZoom): void {
    this.zoom.set(zoom);
  }

  setPriorityFilter(value: OrderPriority | 'all'): void {
    this.priorityFilter.set(value);
  }

  setDateFrom(value: string | null): void {
    this.dateFrom.set(value || null);
  }

  setDateTo(value: string | null): void {
    this.dateTo.set(value || null);
  }

  setCounterpartyFilter(value: string | null): void {
    this.counterpartyFilter.set(value || null);
  }

  toggleRailCollapsed(): void {
    this.railCollapsed.update((v) => !v);
  }

  setRailCollapsed(value: boolean): void {
    this.railCollapsed.set(value);
  }

  /** Reset rail filters (keeps selection / zoom). */
  resetFilters(): void {
    this.search.set('');
    this.activeOnly.set(true);
    this.priorityFilter.set('all');
    this.dateFrom.set(null);
    this.dateTo.set(null);
    this.counterpartyFilter.set(null);
  }
}
