import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * TZ-AUDIT-6 PiEmptyState — editorial empty-row for tables.
 *
 * Used inside `<tbody>` when a list has no rows OR a search yields
 * nothing. Before this component existed, every catalog page inlined
 * the same 9-line `<tr><td colspan=...>` pattern with subtle drift
 * (some had `loading` variant, some had `error` variant, the eyebrow
 * text was hardcoded "00" everywhere). One utility = one source.
 *
 * Visual contract (TZ-AUDIT-3 — em-dash + '00' eyebrow established):
 *  - `<tr><td colspan={colspan}>` with `py-12 px-4 text-center`
 *  - Inner flex column: `eyebrow text-sunrise-warm` ('00' by default)
 *    + `text-sm text-muted-foreground` message
 *  - Spans the entire table so empty data sets feel intentional, not
 *    like a missing render
 *
 * Inputs:
 *  - `colspan` (required) — number of columns to span
 *  - `message` (required) — primary message ("Нет материалов. …")
 *  - `eyebrow` (optional) — small mono label, defaults to `"00"`
 *  - `state` (optional) — `'empty' | 'loading' | 'error'` for semantic
 *    a11y labelling
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-pi-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <tr data-test="empty-state-row">
      <td
        [attr.colspan]="colspan()"
        [attr.role]="state() === 'error' ? 'alert' : 'status'"
        [attr.aria-live]="state() === 'loading' ? 'polite' : null"
        class="py-12 px-4 text-center text-muted-foreground"
      >
        <div class="flex flex-col items-center gap-1">
          <span class="eyebrow text-sunrise-warm">{{ eyebrow() }}</span>
          <span class="text-sm">{{ message() }}</span>
        </div>
      </td>
    </tr>
  `,
  styles: [
    `
      :host { display: contents; }
    `,
  ],
})
export class PiEmptyStateComponent {
  /** Number of columns this row should span. */
  readonly colspan = input.required<number>();

  /** Visible primary message. */
  readonly message = input.required<string>();

  /** Small mono uppercase label above the message. Defaults to `00`. */
  readonly eyebrow = input<string>('00');

  /**
   * Semantic state — drives `role` and `aria-live` attributes used
   * by screen-readers to politely announce progress (loading) or
   * flag errors (error). Defaults to `'empty'`.
   */
  readonly state = input<'empty' | 'loading' | 'error'>('empty');
}
