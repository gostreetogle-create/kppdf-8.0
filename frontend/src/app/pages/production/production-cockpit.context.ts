/**
 * TZ-PRODUCTION-303+ — shared cockpit signals (shell + blocks).
 * No domain fetch logic here — facade owns reads.
 */
import { Injectable, signal } from '@angular/core';
import type { OrderPriority } from '../orders/orders.service';

export type GanttZoom = 'day' | 'week';

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
  /** Collapsed rail = icon strip for more calendar width. */
  readonly railCollapsed = signal(false);

  /**
   * TZ-PRODUCTION-314 — expanded Gantt order ids (session; F5 resets).
   * Survives filter toggles within the SPA session.
   */
  readonly expandedOrderIds = signal<ReadonlySet<string>>(new Set());

  /**
   * TZ-PRODUCTION-321 — one open work-type detail bar id (session; not in URL).
   */
  readonly expandedWorkBarId = signal<string | null>(null);

  selectOrder(id: string | null): void {
    this.selectedOrderId.set(id);
  }

  isOrderExpanded(orderId: string): boolean {
    return this.expandedOrderIds().has(orderId);
  }

  toggleOrderExpanded(orderId: string): void {
    this.expandedOrderIds.update((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
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
        const workId = this.expandedWorkBarId();
        if (workId && workId.startsWith(`${orderId}:`)) {
          this.expandedWorkBarId.set(null);
        }
      }
      return next;
    });
  }

  /** Collapse all Gantt order trees + work-detail (backdrop / empty canvas). */
  clearExpandedOrders(): void {
    if (this.expandedOrderIds().size === 0 && this.expandedWorkBarId() == null) return;
    this.expandedOrderIds.set(new Set());
    this.expandedWorkBarId.set(null);
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
  }
}
