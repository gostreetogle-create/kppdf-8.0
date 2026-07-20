import { ChangeDetectionStrategy, Component, output, input } from '@angular/core';

/**
 * TZ-AUDIT-6 PiRowActions + TZ-86 Phase E.1 — right-aligned action cluster
 * for catalog rows.
 *
 * Previously (TZ-AUDIT-6) had two slots: edit (✎) + delete (×).
 * TZ-86 Phase E adds a 3rd OPTIONAL slot: `documentAction` (📄 / FileText).
 * The slot is rendered ONLY when `documentLabel()` is non-null, so the 5+
 * existing consumers (Materials/Organizations/Dictionaries/WorkTypes/Modules)
 * that don't pass `documentLabel` see no visual change.
 *
 * Slot order: **Document → Edit → Delete** (destructive action stays at the
 * outer edge per UX convention; document action is the least-mutative).
 *
 * Visual contract:
 *  - `flex items-center justify-end gap-2` cluster
 *  - Edit button: `pi-icon-btn` (neutral ink-on-paper hover) + ✎ glyph
 *  - Delete button: `pi-icon-btn pi-icon-btn-danger`
 *    (paper→destructive hover state) + × glyph
 *  - Document button: `pi-icon-btn` (neutral) + inline FileText SVG glyph
 *  - All focused via `.pi-focus-ring` for keyboard a11y
 *
 * Icon strategy: the existing edit/delete buttons use lightweight Unicode
 * glyphs (\u270E ✎ / \u00D7 ×). For the document action we use an inline
 * SVG mirroring the Lucide `FileText` shape used elsewhere in the app
 * (4th NAV_CATEGORY in app-layout.component.ts). Inline SVG keeps the
 * component standalone (no LucideAngularModule import) and avoids the
 * icon-font-weight mismatch with the unicode glyphs.
 *
 * A11y contract:
 *  - Each button emits its `aria-label` from inputs (`documentLabel`,
 *    `editLabel`, `deleteLabel`). Page passes the row-specific string.
 *  - `data-test` attributes emitted for e2e selectors.
 *
 * Outputs:
 *  - `document` — emit `<T>` on document-button click. New in Phase E.
 *  - `edit` — emit `<T>` so the page can identify the row.
 *  - `delete` — emit `<T>` on click.
 *
 * Standalone + OnPush + signal-based + generic.
 */
@Component({
  selector: 'app-pi-row-actions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-end gap-2">
      @if (documentLabel()) {
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

  // ─── Phase E.1: optional document action (3rd slot) ─────────────────
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

  // ─── Existing 2-slot contract (unchanged) ───────────────────────────
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
  /** E2E selector prefix for the edit button. Required when `showEdit=true`. */
  readonly dataTestEdit = input<string | null>(null);
  /** E2E selector prefix for the delete button. */
  readonly dataTestDelete = input<string | null>(null);

  /** Fires when the edit button is clicked. Page receives the row. */
  readonly edit = output<T>();
  /** Fires when the delete button is clicked. Page receives the row. */
  readonly delete = output<T>();
}
