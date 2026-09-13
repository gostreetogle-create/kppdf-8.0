import { Injectable, computed, signal } from '@angular/core';
import type { LucideIcon } from './nav-categories';

/**
 * TZ-NX-PO-SWEEP-07 — one action inside a rail category's popover menu
 * (`ShellToolRailItem.items`). Rail slots are categories, not one
 * icon = one action; a category with `items` opens a menu instead of
 * calling a single `onClick` directly.
 */
export interface ShellToolRailMenuItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: LucideIcon;
  readonly active?: boolean;
  readonly disabled?: boolean;
  readonly onClick: () => void;
}

export interface ShellToolRailItem {
  readonly id: string;
  readonly side: 'left' | 'right';
  readonly ariaLabel: string;
  readonly title: string;
  readonly icon: LucideIcon;
  readonly active?: boolean;
  readonly disabled?: boolean;
  readonly badge?: number;
  /** Non-empty → this rail slot is a category: clicking opens a popover of `items` instead of calling `onClick`. */
  readonly items?: readonly ShellToolRailMenuItem[];
  /** Required for a plain action slot (no `items`); ignored/omittable when `items` is set. */
  readonly onClick?: () => void;
}

interface ShellToolRailState {
  readonly owner: string | null;
  readonly left: readonly ShellToolRailItem[];
  readonly right: readonly ShellToolRailItem[];
}

/**
 * TZ-NX-SHELL-01-IDLE-RAILS / TZ-NX-SHELL-RAILS-ALWAYS — no page has
 * registered real rail tools yet (or it just cleared its own): empty, not a
 * disabled-placeholder fallback. `AppShellComponent`'s `<aside>`s are always
 * in the DOM regardless of this state; an idle side just shows its own
 * history button with no tools below it.
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
    tool.onClick?.();
  }
}
