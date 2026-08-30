import { Filter, LayoutGrid, PanelRight, Search, SlidersHorizontal } from 'lucide-angular';
import type { LucideIcon } from './nav-categories';

/** Presentation-only tool button on a chrome rail (no domain services). */
export interface ToolRailItem {
  id: string;
  ariaLabel: string;
  title: string;
  icon: LucideIcon;
  /** Demo / not wired — button renders disabled. */
  placeholder?: boolean;
}

/** Left rail tools below the back button (workspace context). */
export const LEFT_TOOL_RAIL_ITEMS: readonly ToolRailItem[] = [
  {
    id: 'filters',
    ariaLabel: 'Фильтры (скоро)',
    title: 'Фильтры (скоро)',
    icon: Filter,
    placeholder: true,
  },
  {
    id: 'view-grid',
    ariaLabel: 'Вид сеткой (скоро)',
    title: 'Вид сеткой (скоро)',
    icon: LayoutGrid,
    placeholder: true,
  },
  {
    id: 'density',
    ariaLabel: 'Плотность (скоро)',
    title: 'Плотность (скоро)',
    icon: SlidersHorizontal,
    placeholder: true,
  },
] as const;

/** Right rail tools below the forward button. */
export const RIGHT_TOOL_RAIL_ITEMS: readonly ToolRailItem[] = [
  {
    id: 'search',
    ariaLabel: 'Поиск (скоро)',
    title: 'Поиск (скоро)',
    icon: Search,
    placeholder: true,
  },
  {
    id: 'panel',
    ariaLabel: 'Боковая панель (скоро)',
    title: 'Боковая панель (скоро)',
    icon: PanelRight,
    placeholder: true,
  },
] as const;

export function isToolRailItemDisabled(item: ToolRailItem): boolean {
  return item.placeholder === true;
}
