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
 *   - Chips row is sticky under app header (top-14).
 *   - Active chip = sunrise-warm (yellow), inactive = muted.
 *   - Chips wrap to multiple rows; body shifts down.
 *   - Tools row is sticky below chips.
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
    <!-- Chips: sticky row under app header -->
    <div
      class="group-chips sticky top-14 z-20
             flex items-center gap-1.5 flex-wrap
             py-2 bg-paper"
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

    <!-- Tools: sticky bar below chips (top-14 + ~1 chip row = 6.25rem) -->
    <div
      class="group-tools sticky z-10
             flex items-center gap-form-field flex-wrap
             hairline-b py-3 bg-paper"
      style="top: 6.25rem"
    >
      <ng-content select="[tools]" />
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
