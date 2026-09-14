import { Database, FileStack, FileText, Layers, LayoutTemplate, Settings2, ClipboardList } from 'lucide-angular';

export type StudioWorkspaceSection = 'elements' | 'layers' | 'pages' | 'data' | 'selected' | 'template' | 'properties';

/**
 * TZ-NX-DOCSTUDIO-EDITOR-UTIL-MOVE (Phase 2) — relocated here from
 * `studio-workspace-shell.component.ts` (still in `apps/kppdf-web`, dumb UI,
 * Phase 3 territory): a lib under `libs/features` cannot import an app file,
 * so `STUDIO_RAIL_ITEMS` below now owns the type instead of borrowing it.
 * `studio-workspace-shell.component.ts` imports both back from
 * `@kppdf/features/doc-studio` — same shape, single definition, just
 * relocated to break the app→lib import direction.
 */
export type StudioWsLucideIcon = typeof FileText;

export interface StudioWsRailItem {
  id: string;
  title: string;
  short?: string;
  icon: StudioWsLucideIcon;
}

// studio-editor.page.ts renders its own rail (showDesktopRail=false, railItems=[]);
// this list only backs studioPanelTitle() below for the panel header text.
export const STUDIO_RAIL_ITEMS: readonly StudioWsRailItem[] = [
  { id: 'data', title: 'Данные', short: 'Dt', icon: Database },
  { id: 'selected', title: 'Выбрано', short: 'Sel', icon: ClipboardList },
  { id: 'elements', title: 'Элементы', short: 'El', icon: FileText },
  { id: 'layers', title: 'Слои', short: 'Ly', icon: Layers },
  { id: 'pages', title: 'Страницы', short: 'Pg', icon: FileStack },
  { id: 'properties', title: 'Свойства', short: 'Pr', icon: Settings2 },
  { id: 'template', title: 'Шаблон', short: 'Tp', icon: LayoutTemplate },
] as const;

export function studioPanelTitle(section: string | null): string {
  return STUDIO_RAIL_ITEMS.find((d) => d.id === section)?.title ?? 'Элементы';
}

export function studioPanelSide(section: string | null): 'left' | 'right' {
  return section === 'data' || section === 'selected' ? 'left' : 'right';
}

/** TZ-NX-DOCSTUDIO-PROPS-PANEL-WIDTH — wide `kp-ws-panel--table` only for the table properties editor, not text/image properties. */
export function studioPanelIsTable(section: string | null, blockType: string | null | undefined): boolean {
  return section === 'properties' && blockType === 'table';
}

export function onStudioSectionClick(
  id: StudioWorkspaceSection,
  activeSection: { (): string | null; set(v: string | null): void },
  panelCollapsed: { (): boolean; set(v: boolean): void },
): void {
  if (activeSection() === id && !panelCollapsed()) {
    panelCollapsed.set(true);
    return;
  }
  activeSection.set(id);
  panelCollapsed.set(false);
}