import { ChangeDetectionStrategy, Component, output, input } from '@angular/core';

/**
 * TZ-AUDIT-6 PiRowActions + TZ-86 Phase E.1 + TZ-MATERIALS-310 — right-aligned
 * action cluster for catalog rows.
 *
 * Slot history:
 *  - Phase A (TZ-AUDIT-6): edit (✎) + delete (×).
 *  - Phase E.1 (TZ-86): added OPTIONAL `document` slot (📄 / FileText SVG).
 *  - Phase F (TZ-MATERIALS-310): added OPTIONAL `copy` slot (⧉ / Copy SVG),
 *    enabling per-row server-side clone (e.g. MaterialsPage «Копировать»).
 *
 * Slot order: **Copy → Document → Edit → Delete** (destructive action stays
 * at the outer edge per UX convention; copy is the least-mutative action
 * and is shown first so it is the most ergonomic pick for the common
 * "I want a near-duplicate" flow).
 *
 * Visual contract:
 *  - `flex items-center justify-end gap-2` cluster
 *  - Copy button: `pi-icon-btn` (neutral ink-on-paper hover) + Copy SVG glyph
 *  - Document button: `pi-icon-btn` (neutral) + inline FileText SVG glyph
 *  - Edit button: `pi-icon-btn` (neutral) + ✎ glyph
 *  - Delete button: `pi-icon-btn pi-icon-btn-danger`
 *    (paper→destructive hover state) + × glyph
 *  - All focused via `.pi-focus-ring` for keyboard a11y
 *
 * Icon strategy: edit/delete buttons use lightweight Unicode glyphs
 * (\u270E ✎ / \u00D7 ×). Copy and document glyphs are inline SVGs mirroring
 * the Lucide `Copy` / `FileText` shapes used elsewhere in the app, so we
 * stay standalone (no LucideAngularModule import) and avoid icon-font-weight
 * mismatch with the unicode glyphs.
 *
 * A11y contract:
 *  - Each button emits its `aria-label` from inputs (`copyLabel`,
 *    `documentLabel`, `editLabel`, `deleteLabel`). Page passes the row-specific
 *    string. Buttons absent by convention (input `null`/disabled) are NOT
 *    rendered → DOM stays in sync with the contract, screen readers don't
 *    see ghosts.
 *  - `data-test` attributes emitted for e2e selectors.
 *
 * Outputs:
 *  - `copy` — emit `<T>` on copy-button click. New in Phase F.
 *  - `document` — emit `<T>` on document-button click. New in Phase E.
 *  - `edit` — emit `<T>` so the page can identify the row.
 *  - `delete` — emit `<T>` on click.
 *
 * Backwards compatibility: existing consumers that don't pass `copyLabel`
 * see no visual change (Phase F slot is rendered only when `copyLabel()`
 * is non-null, mirroring the same opt-in pattern as `documentLabel`).
 *
 * Standalone + OnPush + signal-based + generic.
 */
@Component({
  selector: 'app-pi-row-actions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-end gap-2">
      @if (copyLabel() && !loading()) {
        <button
          type="button"
          class="pi-icon-btn pi-focus-ring"
          [attr.aria-label]="copyLabel()"
          [attr.data-test]="dataTestCopy()"
          (click)="copy.emit(row())"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
      }
      @if (documentLabel() && !loading()) {
        <button
          type="button"
          class="pi-icon-btn pi-focus-ring"
          [attr.aria-label]="documentLabel()"
          [attr.data-test]="dataTestDocument()"
          (click)="document.emit(row())"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="8" y1="13" x2="16" y2="13" />
            <line x1="8" y1="17" x2="13" y2="17" />
          </svg>
        </button>
      }
      @if (loading()) {
        <span
          class="inline-flex items-center justify-center w-8 h-8 text-xs text-muted-foreground"
          role="status"
          aria-label="Загрузка"
          data-test="row-actions-loading"
        >
          …
        </span>
      } @else {
        @if (showEdit()) {
          <button
            type="button"
            class="pi-icon-btn pi-focus-ring"
            [attr.aria-label]="editLabel()"
            [attr.data-test]="dataTestEdit()"
            (click)="edit.emit(row())"
          >
            <span aria-hidden="true">✎</span>
          </button>
        }
        @if (showDelete()) {
          <button
            type="button"
            class="pi-icon-btn pi-icon-btn-danger pi-focus-ring
                   disabled:opacity-30 disabled:cursor-not-allowed"
            [attr.aria-label]="deleteLabel()"
            [attr.data-test]="dataTestDelete()"
            [attr.title]="deleteTitle()"
            [disabled]="deleteDisabled()"
            (click)="delete.emit(row())"
          >
            <span aria-hidden="true">×</span>
          </button>
        }
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
    `,
  ],
})
export class PiRowActionsComponent<T> {
  /** The row this action cluster belongs to. Emitted with clicks. */
  readonly row = input.required<T>();

  // ─── Phase F (TZ-MATERIALS-310): optional copy action (1st slot) ─────────
  /**
   * Aria label for the copy action button — page-localised.
   * When `null` (default), the copy button is NOT rendered, so existing
   * consumers that don't pass `copyLabel` see no layout change. Set this
   * to a row-specific string in pages that want a «Копировать» per-row
   * shortcut, e.g. MaterialsPage where the row has many required fields
   * and duplicating is faster than re-creating from scratch.
   */
  readonly copyLabel = input<string | null>(null);
  /** E2E selector for the copy action button. */
  readonly dataTestCopy = input<string | null>(null);
  /** Fires when the copy button is clicked. Page receives the row. */
  readonly copy = output<T>();

  // ─── Phase E.1: optional document action (3rd slot, becomes 2nd) ─────
  /**
   * Aria label for the document action button — page-localised.
   * When `null` (default), the document button is NOT rendered, so the
   * existing 2-slot layout is preserved. Set to a string in pages that
   * want a «Создать документ» per-row shortcut (OrdersPage, ContractsPage).
   */
  readonly documentLabel = input<string | null>(null);
  /** E2E selector for the document action button. */
  readonly dataTestDocument = input<string | null>(null);
  /** Fires when the document button is clicked. Page receives the row. */
  readonly document = output<T>();

  // ─── Existing 2-slot contract (unchanged) ───────────────────────
  /**
   * Aria label for the edit button — page-localised.
   * Required when `showEdit=true`; ignored when `showEdit=false`.
   */
  readonly editLabel = input<string | null>(null);
  /** Aria label for the delete button — page-localised. */
  readonly deleteLabel = input.required<string>();
  /** Optional tooltip on the delete button (e.g. "Системный юнит — нельзя удалить"). */
  readonly deleteTitle = input<string | null>(null);
  /** Whether the delete button is disabled. */
  readonly deleteDisabled = input<boolean>(false);
  /**
   * Whether to render the edit button. Set to `false` for rows that
   * are managed via a different flow. Default `true`.
   */
  readonly showEdit = input<boolean>(true);
  /** Whether to render the delete button. Default `true` for backwards compatibility. */
  readonly showDelete = input<boolean>(true);
  /** Replaces mutating row actions with a status indicator while a request is in flight. */
  readonly loading = input<boolean>(false);
  /** E2E selector prefix for the edit button. Required when `showEdit=true`. */
  readonly dataTestEdit = input<string | null>(null);
  /** E2E selector prefix for the delete button. */
  readonly dataTestDelete = input<string | null>(null);

  /** Fires when the edit button is clicked. Page receives the row. */
  readonly edit = output<T>();
  /** Fires when the delete button is clicked. Page receives the row. */
  readonly delete = output<T>();
}
