import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * TZ-AUDIT-5 PiToolbar — single source of truth for the toolbar row
 * that sits between PiPageHeader and the first PiSection on every
 * catalog page (Materials / Organizations / Dictionaries).
 *
 * Before this component existed, the toolbar markup was duplicated
 * verbatim across 3 pages:
 *   - <input … class="hairline rounded-sm px-control-x …">
 *   - <app-pi-button variant="default">+ Создать</app-pi-button>
 *   - <span class="eyebrow text-sunrise-warm">{{ total }} …</span>
 * Each copy drifted subtly (different w-64/w-72 widths, different gap-3/gap-form-field
 * spacings, different flex-wrap behavior). One utility = one source.
 *
 * Slots:
 *  - `<input>` (or any control) — search field on the left
 *  - `[actions]` — action buttons (typically a "+ Создать" PiButton)
 *  - `<span hint>` optional — total count badge, mono uppercase
 *
 * A11y: `role="toolbar"` with `aria-label="Действия"`; search input
 * should carry its own `aria-label`.
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-pi-toolbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="toolbar"
      aria-label="Действия"
      class="pi-toolbar pt-page-y pb-section
             flex items-baseline gap-form-field flex-wrap"
    >
      <ng-content />
      <span class="eyebrow text-sunrise-warm ml-auto">
        <ng-content select="[hint]" />
      </span>
    </div>
  `,
  styles: [
    `
      :host { display: block; }
    `,
  ],
})
export class PiToolbarComponent {
  /** Visible label for screen readers. Defaults to "Действия". */
  readonly ariaLabel = input<string>('Действия');
}
