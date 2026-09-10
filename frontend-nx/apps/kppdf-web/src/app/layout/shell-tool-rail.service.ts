import { Injectable, computed, signal } from '@angular/core';
import type { LucideIcon } from './nav-categories';

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
 * TZ-NX-SHELL-01-IDLE-RAILS — no page has registered real rail tools yet (or
 * it just cleared its own): empty, not a disabled-placeholder fallback. A
 * page opts in by calling setTools(); `AppShellComponent` only renders an
 * `<aside>` for a side that actually has tools.
 */
const DEFAULT_STATE: ShellToolRailState = { owner: null, left: [], right: [] };

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
