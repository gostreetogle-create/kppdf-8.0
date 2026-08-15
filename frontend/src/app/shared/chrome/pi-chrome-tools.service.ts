import { Injectable, computed, signal } from '@angular/core';
import type { PiChromeToolItem, PiChromeToolSide } from './pi-chrome-tools.types';

/**
 * TZ-UX-322 — root registry for page tools projected into app chrome rails.
 *
 * One write-path: `setTools(ownerId, items)` replaces that owner's list;
 * `clear(ownerId)` removes it. Layout reads merged `leftTools` / `rightTools`.
 * Callers must clear on destroy. Flyouts stay on the page — only buttons here.
 */
@Injectable({ providedIn: 'root' })
export class PiChromeToolsService {
  private readonly byOwner = signal<ReadonlyMap<string, readonly PiChromeToolItem[]>>(new Map());

  readonly leftTools = computed(() => this.mergeSide('left'));
  readonly rightTools = computed(() => this.mergeSide('right'));

  setTools(ownerId: string, items: readonly PiChromeToolItem[]): void {
    const id = ownerId.trim();
    if (!id) return;
    const prev = this.byOwner();
    const frozen = Object.freeze([...items]) as readonly PiChromeToolItem[];
    const existing = prev.get(id);
    if (existing === frozen) return;
    const next = new Map(prev);
    next.set(id, frozen);
    this.byOwner.set(next);
  }

  clear(ownerId: string): void {
    const id = ownerId.trim();
    if (!id) return;
    const prev = this.byOwner();
    if (!prev.has(id)) return;
    const next = new Map(prev);
    next.delete(id);
    this.byOwner.set(next);
  }

  private mergeSide(side: PiChromeToolSide): readonly PiChromeToolItem[] {
    const out: PiChromeToolItem[] = [];
    for (const items of this.byOwner().values()) {
      for (const item of items) {
        if (item.side === side) out.push(item);
      }
    }
    out.sort((a, b) => {
      const ao = a.order ?? 0;
      const bo = b.order ?? 0;
      if (ao !== bo) return ao - bo;
      return a.id.localeCompare(b.id);
    });
    return out;
  }
}
