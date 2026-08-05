import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * TZ-DICT-308 PiGroupWorkspace — group chip workspace shell.
 *
 * Replaces PiDictionaryShell for multi-section group pages (e.g. Справочники).
 *
 * API:
 *   - chips: group chip configs (id, label, route)
 *   - activeId: which chip is currently active (yellow highlight)
 *   - chipClick: emitted when a chip is clicked
 *   - [tools] slot: sticky toolbar (search, filters, CTA)
 *   - default slot: body content (table, tree)
 *
 * Key behaviour:
 *   - Chips + tools form one sticky stack under the app header (top-0 inside main).
 *   - Active chip = sunrise-warm (yellow), inactive = muted.
 *   - Chips wrap to multiple rows; the stack grows with the wrapped row.
 *   - Tools never needs a hand-maintained offset below chips.
 *   - NO H1 title, NO path breadcrumbs.
 *   - Border (hairline-b) separates chips+tools from body.
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-pi-group-workspace',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <!-- One adaptive sticky stack: its height follows chip wrapping. -->
    <div class="group-chrome sticky top-0 z-20 bg-paper">
      <div
        class="group-chips flex items-center gap-1.5 flex-wrap
               py-2 min-w-0"
      >
        @for (chip of chips(); track chip.id) {
          <a
            [routerLink]="chip.route"
            class="group-chip inline-flex items-center gap-1 px-3 py-1.5
                   text-sm rounded-sm transition-colors
                   pi-focus-ring cursor-pointer no-underline"
            [class.bg-sunrise-warm]="activeId() === chip.id"
            [class.text-paper]="activeId() === chip.id"
            [class.text-ink]="activeId() !== chip.id"
            [class.hover:bg-paper-2]="activeId() !== chip.id"
            [attr.aria-current]="activeId() === chip.id ? 'page' : undefined"
            (click)="chipClick.emit(chip.id)"
          >
            {{ chip.label }}
          </a>
        }
      </div>

      <!-- Tools stays in the same sticky stack; no chip-row offset can drift. -->
      <div
        class="group-tools flex items-center gap-form-field flex-wrap
               hairline-b py-3 min-w-0"
      >
        <ng-content select="[tools]" />
      </div>
    </div>

    <!-- Body content -->
    <div class="group-body pt-4">
      <ng-content />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-width: 0;
      }

      .group-tools > * {
        min-width: 0;
      }
    `,
  ],
})
export class PiGroupWorkspaceComponent {
  /** Group chip configs. */
  readonly chips = input.required<readonly GroupChip[]>();

  /** Currently active chip id (yellow highlight). */
  readonly activeId = input.required<string>();

  /** Emitted when a chip is clicked. Used for analytics or side effects. */
  readonly chipClick = output<string>();
}

/** Chip configuration for a group section. */
export interface GroupChip {
  /** Unique chip id (e.g. 'units'). */
  id: string;
  /** Display label (e.g. 'Единицы'). */
  label: string;
  /** RouterLink path for the chip. */
  route: string;
}
