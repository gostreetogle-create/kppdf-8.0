import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * PiGroupWorkspace — group chip workspace shell (DICT-308+).
 *
 * Chrome (sticky under app header):
 *   1) Optional TOC row — dictionary groups (Классификация / Измерения / …)
 *   2) Section chips — siblings inside the active group
 *   3) Tools slot — search / filters / CTA
 *   4) Body — table / tree
 *
 * Both chip rows are dense (compact height). TOC is slightly smaller than section chips.
 */
@Component({
  selector: 'app-pi-group-workspace',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="group-chrome sticky top-0 z-20 bg-paper">
      @if (pathLabel()) {
        <p class="eyebrow pt-1.5 pb-0 text-muted-foreground m-0" data-test="group-path-label">
          {{ pathLabel() }}
        </p>
      }
      @if (toc().length > 0) {
        <nav
          class="group-toc flex items-center gap-1 flex-wrap pt-1.5 pb-0.5 min-w-0"
          aria-label="Группы справочников"
          data-test="group-toc"
        >
          @for (chip of toc(); track chip.id) {
            <a
              [routerLink]="chip.route"
              class="group-toc-chip inline-flex items-center px-2 py-0.5
                     text-[11px] leading-4 font-medium tracking-wide rounded-sm
                     transition-colors pi-focus-ring cursor-pointer no-underline"
              [class.bg-ink]="tocActiveId() === chip.id"
              [class.text-paper]="tocActiveId() === chip.id"
              [class.text-muted-foreground]="tocActiveId() !== chip.id"
              [class.hover:text-ink]="tocActiveId() !== chip.id"
              [class.hover:bg-paper-2]="tocActiveId() !== chip.id"
              [attr.aria-current]="tocActiveId() === chip.id ? 'page' : undefined"
              (click)="tocClick.emit(chip.id)"
            >
              {{ chip.label }}
            </a>
          }
        </nav>
      }

      <div
        class="group-chips flex items-center gap-1 flex-wrap
               pt-0.5 pb-1.5 min-w-0"
        [class.pt-1.5]="toc().length === 0"
        data-test="group-chips"
      >
        @for (chip of chips(); track chip.id) {
          <a
            [routerLink]="chip.route"
            class="group-chip inline-flex items-center gap-1 px-2.5 py-0.5
                   text-xs leading-5 rounded-sm transition-colors
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

      <div
        class="group-tools flex items-center gap-form-field flex-wrap
               hairline-b py-2 min-w-0"
      >
        <ng-content select="[tools]" />
      </div>
    </div>

    <div class="group-body pt-3">
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
  /**
   * Optional section path label above chips (e.g. «Каталог», «Справочники»).
   * Complements chips; not a deep path-breadcrumb tree.
   */
  readonly pathLabel = input<string>('');

  /** Top TOC: sibling groups (optional). Empty = hide row. */
  readonly toc = input<readonly GroupChip[]>([]);

  /** Active TOC group id. */
  readonly tocActiveId = input<string | null>(null);

  /** Section chips inside the current group. */
  readonly chips = input.required<readonly GroupChip[]>();

  /** Currently active section chip id (yellow). */
  readonly activeId = input.required<string>();

  readonly tocClick = output<string>();
  readonly chipClick = output<string>();
}

/** Chip configuration for TOC or section row. */
export interface GroupChip {
  id: string;
  label: string;
  route: string;
}
