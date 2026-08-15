/**
 * TZ-UX-322 — page-projected tools for app chrome rails.
 *
 * Lucide keeps `LucideIconData` private in lucide-angular@0.460; use the
 * structural shape of any exported icon (same pattern as app-layout).
 */
import { Package } from 'lucide-angular';

export type PiChromeLucideIcon = typeof Package;

export type PiChromeToolSide = 'left' | 'right';

export interface PiChromeToolItem {
  id: string;
  side: PiChromeToolSide;
  /** RU — screen reader + tooltip source. */
  ariaLabel: string;
  /** RU — native title tooltip. */
  title: string;
  icon: PiChromeLucideIcon;
  active?: boolean;
  ariaExpanded?: boolean | null;
  ariaControls?: string;
  onClick: (event?: Event) => void;
  /** Lower first; default 0. Stable sort by id when equal. */
  order?: number;
}
