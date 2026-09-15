import { effect, untracked, type Signal } from '@angular/core';
import { CalendarDays, List, RefreshCw, SlidersHorizontal } from 'lucide-angular';
import type { ProductionLeftTool } from '@kppdf/features/production';
import { ShellToolRailService } from '../../layout/shell-tool-rail.service';

export const PRODUCTION_TOOL_OWNER = 'production';

/**
 * TZ-NX-PRODUCTION-COCKPIT-RESIDUAL-THIN — chrome-rail wiring split out of
 * `ProductionCockpitPage` purely to shrink the page file. `ShellToolRailService`
 * is app-only, so this can't live in `@kppdf/features/production` next to the
 * facades. Must be called synchronously from the page constructor (injection
 * context for `effect()`).
 */
export interface ProductionShellToolsDeps {
  readonly leftTool: Signal<ProductionLeftTool>;
  readonly filtersDirty: Signal<boolean>;
  readonly toggleLeftTool: (tool: Exclude<ProductionLeftTool, null>) => void;
  readonly onRefresh: () => void;
  readonly onToday: () => void;
}

export function registerProductionShellTools(shellTools: ShellToolRailService, deps: ProductionShellToolsDeps): void {
  effect(() => {
    // Track active flyout state for shell tool .active / aria state.
    void deps.leftTool();
    void deps.filtersDirty();
    // setTools reads+writes rail state — must not be effect-tracked (infinite loop).
    untracked(() => syncProductionShellTools(shellTools, deps));
  });
}

function syncProductionShellTools(shellTools: ShellToolRailService, deps: ProductionShellToolsDeps): void {
  const left = deps.leftTool();
  const dirty = deps.filtersDirty();
  shellTools.setTools(PRODUCTION_TOOL_OWNER, {
    left: [
      {
        id: 'orders',
        side: 'left',
        ariaLabel: dirty ? 'Фильтры изменены' : 'Заказы',
        title: dirty ? 'Фильтры изменены' : 'Заказы',
        icon: List,
        active: left === 'orders',
        onClick: () => deps.toggleLeftTool('orders'),
      },
      {
        id: 'filters',
        side: 'left',
        ariaLabel: dirty ? 'Фильтры изменены' : 'Фильтры',
        title: dirty ? 'Фильтры изменены' : 'Фильтры',
        icon: SlidersHorizontal,
        active: left === 'filters' || dirty,
        onClick: () => deps.toggleLeftTool('filters'),
      },
      {
        id: 'refresh',
        side: 'left',
        ariaLabel: 'Обновить',
        title: 'Обновить',
        icon: RefreshCw,
        onClick: () => deps.onRefresh(),
      },
    ],
    right: [
      {
        id: 'today',
        side: 'right',
        ariaLabel: 'Прокрутить к сегодня',
        title: 'Прокрутить к сегодня',
        icon: CalendarDays,
        onClick: () => deps.onToday(),
      },
    ],
  });
}
