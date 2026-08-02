import { Injectable, signal } from '@angular/core';

/**
 * TZ-DOC-317 — shared builder text-picker filter state.
 *
 * The builder has two «Тексты» surfaces that must stay in sync:
 *   1. `BuilderToolPaneComponent` (palette section «Тексты»);
 *   2. `BuilderPage` inline «Тексты» quick-add dropdown.
 *
 * Both drive the same `categoryId` so the `/api/text-blocks?isActive=true`
 * request is rebuilt with `&categoryId=<id>` when a category is selected
 * (server-side Mongo filter, backend TZ-DOC-315). `null` = «Все» → no
 * `categoryId` param.
 *
 * Single source of truth — one signal, two consumers; no event plumbing
 * between page and pane (TZ-DOC-317 §ШАГ 4, «выбрать простой путь»).
 */
@Injectable({ providedIn: 'root' })
export class BuilderTextFilterService {
  /** `null` = «Все» (no categoryId param); otherwise a TextBlockCategory id. */
  readonly categoryId = signal<string | null>(null);

  /** Clear the filter back to «Все». */
  reset(): void {
    this.categoryId.set(null);
  }
}
