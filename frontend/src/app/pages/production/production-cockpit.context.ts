/**
 * TZ-PRODUCTION-303 — shared cockpit signals (shell + blocks).
 * No domain fetch logic here — facade owns reads.
 */
import { Injectable, signal } from '@angular/core';

export type GanttZoom = 'day' | 'week';

@Injectable()
export class ProductionCockpitContext {
  /** null = «Все активные» mode (multi-order estimate). */
  readonly selectedOrderId = signal<string | null>(null);
  readonly search = signal('');
  readonly activeOnly = signal(true);
  readonly zoom = signal<GanttZoom>('day');
  readonly workerIdFilter = signal<string | null>(null);
  /** ISO date-only range hint for future filters (unused in 303 layout engine). */
  readonly dateRange = signal<{ from: string | null; to: string | null }>({
    from: null,
    to: null,
  });

  selectOrder(id: string | null): void {
    this.selectedOrderId.set(id);
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
}
