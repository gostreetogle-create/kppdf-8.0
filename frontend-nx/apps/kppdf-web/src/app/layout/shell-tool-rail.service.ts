import { Injectable, computed, signal } from '@angular/core';
import type { LucideIcon } from './nav-categories';
import { LEFT_TOOL_RAIL_ITEMS, RIGHT_TOOL_RAIL_ITEMS } from './tool-rail-definitions';

export interface ShellToolRailItem {
  readonly id: string;
  readonly side: 'left' | 'right';
  readonly ariaLabel: string;
  readonly title: string;
  readonly icon: LucideIcon;
  readonly active?: boolean;
  readonly disabled?: boolean;
  readonly badge?: number;
  readonly onClick: () => void;
}

interface ShellToolRailState {
  readonly owner: string | null;
  readonly left: readonly ShellToolRailItem[];
  readonly right: readonly ShellToolRailItem[];
}

/**
 * No page has registered real rail tools yet (or it just cleared its own) —
 * fall back to the same disabled demo placeholders every page used to show
 * (TZ-NX-SHELL-rail-layout-fix), not an empty rail. A page opts in by
 * calling setTools(); until/unless it does, this is what renders.
 */
const DEFAULT_LEFT: readonly ShellToolRailItem[] = LEFT_TOOL_RAIL_ITEMS.map((item) => ({
  id: item.id,
  side: 'left' as const,
  ariaLabel: item.ariaLabel,
  title: item.title,
  icon: item.icon,
  disabled: true,
  onClick: () => {
    // never invoked — invoke() short-circuits on tool.disabled before calling this
  },
}));

const DEFAULT_RIGHT: readonly ShellToolRailItem[] = RIGHT_TOOL_RAIL_ITEMS.map((item) => ({
  id: item.id,
  side: 'right' as const,
  ariaLabel: item.ariaLabel,
  title: item.title,
  icon: item.icon,
  disabled: true,
  onClick: () => {
    // never invoked — invoke() short-circuits on tool.disabled before calling this
  },
}));

const DEFAULT_STATE: ShellToolRailState = { owner: null, left: DEFAULT_LEFT, right: DEFAULT_RIGHT };

@Injectable({ providedIn: 'root' })
export class ShellToolRailService {
  private readonly state = signal<ShellToolRailState>(DEFAULT_STATE);

  readonly leftTools = computed(() => this.state().left);
  readonly rightTools = computed(() => this.state().right);
  readonly activeToolId = computed(() => {
    const active = [...this.leftTools(), ...this.rightTools()].find((t) => t.active);
    return active?.id ?? null;
  });

  setTools(owner: string, tools: { left: ShellToolRailItem[]; right: ShellToolRailItem[] }): void {
    this.state.set({ owner, left: tools.left, right: tools.right });
  }

  clear(owner: string): void {
    if (this.state().owner === owner) {
      this.state.set(DEFAULT_STATE);
    }
  }

  invoke(tool: ShellToolRailItem): void {
    if (tool.disabled) return;
    tool.onClick();
  }
}
