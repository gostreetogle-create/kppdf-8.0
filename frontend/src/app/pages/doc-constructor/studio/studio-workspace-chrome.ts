import {
  DestroyRef,
  effect,
  inject,
  untracked,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import {
  Database,
  FileText,
  Layers,
  LayoutTemplate,
  Settings2,
  TableProperties,
} from 'lucide-angular';
import { PiChromeToolsService } from '../../../shared/chrome/pi-chrome-tools.service';
import type {
  PiChromeLucideIcon,
  PiChromeToolItem,
} from '../../../shared/chrome/pi-chrome-tools.types';
import type { WsRailItem } from '../../../shared/document-workspace-shell/proposal-workspace-shell.component';

export const STUDIO_CHROME_OWNER = 'document-studio-editor';

export type StudioWorkspaceSection =
  'elements' | 'layers' | 'data' | 'template' | 'properties' | 'table';

export interface StudioSectionDef {
  id: StudioWorkspaceSection;
  title: string;
  short: string;
  icon: PiChromeLucideIcon;
  side: 'left' | 'right';
  order: number;
}

export const STUDIO_SECTION_DEFS: readonly StudioSectionDef[] = [
  { id: 'elements', title: 'Элементы', short: 'El', icon: FileText, side: 'left', order: 1 },
  { id: 'layers', title: 'Слои', short: 'Ly', icon: Layers, side: 'left', order: 2 },
  { id: 'data', title: 'Данные', short: 'Dt', icon: Database, side: 'left', order: 3 },
  { id: 'template', title: 'Шаблон', short: 'Tp', icon: LayoutTemplate, side: 'left', order: 4 },
  { id: 'properties', title: 'Свойства', short: 'Pr', icon: Settings2, side: 'right', order: 1 },
  { id: 'table', title: 'Таблица', short: 'Tb', icon: TableProperties, side: 'right', order: 2 },
];

export function buildStudioRailItems(): readonly WsRailItem[] {
  return STUDIO_SECTION_DEFS.map((def) => ({
    id: def.id,
    title: def.title,
    short: def.short,
    icon: def.icon,
  }));
}

export function studioPanelTitle(section: string | null): string {
  return STUDIO_SECTION_DEFS.find((d) => d.id === section)?.title ?? 'Элементы';
}

export function studioPanelSide(section: string | null): 'left' | 'right' {
  return section === 'properties' || section === 'table' ? 'right' : 'left';
}

export class StudioWorkspaceChrome {
  private readonly chromeTools = inject(PiChromeToolsService);

  readonly railItems = buildStudioRailItems();

  bind(
    destroyRef: DestroyRef,
    activeSection: Signal<string | null>,
    panelCollapsed: Signal<boolean>,
    onSectionChange: (id: StudioWorkspaceSection) => void,
  ): void {
    effect(() => {
      const section = activeSection();
      const collapsed = panelCollapsed();
      untracked(() => this.sync(section, collapsed, onSectionChange));
    });

    destroyRef.onDestroy(() => this.chromeTools.clear(STUDIO_CHROME_OWNER));
  }

  private sync(
    section: string | null,
    collapsed: boolean,
    onSectionChange: (id: StudioWorkspaceSection) => void,
  ): void {
    const items: PiChromeToolItem[] = STUDIO_SECTION_DEFS.map((def) => ({
      id: def.id,
      side: def.side,
      ariaLabel: def.title,
      title: def.title,
      icon: def.icon,
      active: !collapsed && section === def.id,
      ariaExpanded: !collapsed && section === def.id,
      ariaControls: 'kp-ws-tools-panel',
      order: def.order,
      onClick: () => {
        if (section === def.id && !collapsed) {
          return;
        }
        onSectionChange(def.id);
      },
    }));
    this.chromeTools.setTools(STUDIO_CHROME_OWNER, items);
  }
}

export function createStudioWorkspaceChrome(): StudioWorkspaceChrome {
  return new StudioWorkspaceChrome();
}

/** Toggle panel open for chrome rail (KP demo parity). */
export function onStudioSectionClick(
  id: StudioWorkspaceSection,
  activeSection: WritableSignal<string | null>,
  panelCollapsed: WritableSignal<boolean>,
): void {
  if (activeSection() === id && !panelCollapsed()) {
    panelCollapsed.set(true);
    return;
  }
  activeSection.set(id);
  panelCollapsed.set(false);
}
