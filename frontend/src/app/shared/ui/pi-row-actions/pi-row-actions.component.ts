import {
  ChangeDetectionStrategy,
  Component,
  output,
  input,
} from '@angular/core';

/**
 * TZ-AUDIT-6 PiRowActions — right-aligned action cluster for catalog rows.
 *
 * Previously duplicated across Materials / Organizations / Dictionaries
 * pages as:
 *
 *   <div class="flex items-center justify-end gap-2">
 *     <button class="pi-icon-btn pi-focus-ring"
 *             [attr.aria-label]="'Редактировать ' + row.name"
 *             (click)="openEdit(row)">✎</button>
 *     <button class="pi-icon-btn pi-icon-btn-danger pi-focus-ring"
 *             [attr.aria-label]="'Удалить ' + row.name"
 *             [disabled]="…"
 *             (click)="onDelete(row)">×</button>
 *   </div>
 *
 * One component = one source for both visual + a11y contract.
 *
 * Visual contract:
 *  - `flex items-center justify-end gap-2` cluster
 *  - Edit button: `pi-icon-btn` (neutral ink-on-paper hover) + ✎ glyph
 *  - Delete button: `pi-icon-btn pi-icon-btn-danger`
 *    (paper→destructive hover state) + × glyph
 *  - Both focused via `.pi-focus-ring` for keyboard a11y
 *  - Delete accepts `deleteDisabled` + `deleteTitle` for system-row
 *    protection (Dictionaries' isSystem flag)
 *
 * A11y contract:
 *  - Both buttons emit their `aria-label` from inputs (`editLabel`,
 *    `deleteLabel`). Page passes the row-specific localised string.
 *  - `data-test` attributes emitted for e2e selectors.
 *
 * Outputs:
 *  - `edit` — emit `<T>` so the page can identify the row in its
 *    watcher. Generic over `T` so it works with Material, Organization,
 *    Unit, … without per-page wrappers.
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
      @if (showEdit()) {
        <button
          type="button"
          class="pi-icon-btn pi-focus-ring"
          [attr.aria-label]="editLabel()"
          [attr.data-test]="dataTestEdit()"
          (click)="edit.emit(row())"
        >
          <span aria-hidden="true">\u270E</span>
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
        <span aria-hidden="true">\u00D7</span>
      </button>
    </div>
  `,
  styles: [
    `
      :host { display: inline-flex; }
    `,
  ],
})
export class PiRowActionsComponent<T> {
  /** The row this action cluster belongs to. Emitted with clicks. */
  readonly row = input.required<T>();
  /**
   * Aria label for the edit button — page-localised.
   * Required when `showEdit=true`; ignored when `showEdit=false`.
   * A runtime guard logs a warning in dev mode if missing under
   * `showEdit=true` so a11y regressions are caught early.
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
   * are managed via a different flow (e.g. Dictionaries' units are
   * toggled/deactivated, not edited through a dialog). Default `true`.
   * When `false`, `editLabel` is ignored and the `edit` output will
   * never fire.
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
