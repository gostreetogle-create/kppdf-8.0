import { FileText, Layers, Settings2 } from 'lucide-angular';
import type { StudioWsRailItem } from './studio-workspace-shell.component';

export type StudioWorkspaceSection = 'elements' | 'layers' | 'properties';

export const STUDIO_RAIL_ITEMS: readonly StudioWsRailItem[] = [
  { id: 'elements', title: 'Элементы', short: 'El', icon: FileText },
  { id: 'layers', title: 'Слои', short: 'Ly', icon: Layers },
  { id: 'properties', title: 'Свойства', short: 'Pr', icon: Settings2 },
] as const;

export function studioPanelTitle(section: string | null): string {
  return STUDIO_RAIL_ITEMS.find((d) => d.id === section)?.title ?? 'Элементы';
}

export function studioPanelSide(section: string | null): 'left' | 'right' {
  return section === 'properties' ? 'right' : 'left';
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
