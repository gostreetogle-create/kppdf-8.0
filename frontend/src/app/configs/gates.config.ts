import { PAGES, PageConfig } from './pages.config';

/**
 * Gate manifest — single source of truth for UI visibility.
 *
 * Why this file exists
 * --------------------
 * `PAGES` in `pages.config.ts` is the master catalog (77 tables × 8 categories)
 * and is referenced from Sidebar, Topbar search, Dashboard, TaskPanel, and
 * PageRenderer. Compiling the project with all of them rendered produces
 * visual clutter — many tables are not yet wired up end-to-end.
 *
 * This file is the **entry point** the user asked for ("бэйс папе / точка
 * входа"). To stash a page, flip its `enabled` to `false` here; every consumer
 * drops it automatically through `getEnabledPages()` / `isPageEnabled()`.
 *
 * Defaults: ENABLED for all 77 entries — matches the operator decision
 * "все" (all). To disable a single page later, change one line:
 *
 * @example
 *   { id: 'counterparty',  enabled: false, phase: 1, reason: 'WIP' }
 *   { id: 'order',         enabled: false, phase: 6, reason: 'TZ-21 next' }
 */

export interface GateEntry {
  /** Same id as in PAGES. */
  id: string;
  /** Master switch consumed by Sidebar/Topbar/Dashboard/TaskPanel/PageRenderer. */
  enabled: boolean;
  /** Phase number (mirror of PageConfig.priority) for forward compatibility. */
  phase: number;
  /** Optional human note rendered in /admin/gates (future). */
  reason?: string;
}

/** Authority list — one row per known page id. */
export const GATES: ReadonlyArray<GateEntry> = PAGES.map((p) => ({
  id: p.id,
  enabled: true,
  phase: p.priority,
}));

/** Id-to-entry map for O(1) lookups. */
export const GATE_MAP: Readonly<Record<string, GateEntry>> = Object.fromEntries(
  GATES.map((e) => [e.id, e]),
);

/** True when the page id is known and its entry is enabled (default: true for unknown ids). */
export function isPageEnabled(id: string): boolean {
  return GATE_MAP[id]?.enabled ?? true;
}

/** Filter any PageConfig list through the gate. Usage: getEnabledPages(PAGES). */
export function getEnabledPages(all: PageConfig[]): PageConfig[] {
  return all.filter((p) => isPageEnabled(p.id));
}

/** Count of currently enabled pages — for dashboard stats / sanity. */
export function enabledCount(): number {
  return GATES.filter((g) => g.enabled).length;
}
