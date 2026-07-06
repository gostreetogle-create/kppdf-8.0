import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * TZ-68 PiSection — editorial page section.
 *
 * Used to group related content (primitives showcase, form examples, etc.)
 * with a clear H2 hierarchy. Optional:
 *  - indexRoman: lowercase Roman numeral (I, II, III) on the left for
 *    visual chapter markers.
 *  - hint: small mono uppercase text on the right (e.g. "0.1s · getting
 *    started") for context.
 *
 * Renders `<section>` with h2 + projected content. hairline border-b
 * separates section header from content.
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-pi-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pt-0 pb-section">
      <header
        class="mb-form-field flex items-end gap-3 border-b hairline border-rule pb-2"
      >
        @if (indexRoman()) {
          <span class="font-display text-2xl tracking-tight text-muted">
            {{ indexRoman() }}
          </span>
        }
        <h2 class="font-display text-2xl font-semibold tracking-tight">
          {{ title() }}
        </h2>
        @if (hint()) {
          <span
            class="ml-auto font-mono text-[11px] uppercase tracking-[0.18em] text-muted"
          >
            {{ hint() }}
          </span>
        }
      </header>
      <ng-content />
    </section>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class PiSectionComponent {
  readonly title = input.required<string>();
  readonly hint = input<string>('');
  readonly indexRoman = input<string>('');
}
