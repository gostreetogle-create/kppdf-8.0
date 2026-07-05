import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Paper & Ink editorial Chart configurator wrapper.
 *
 * Provides the structural frame (eyebrow + title + subtitle + content slot)
 * for embedding `<app-pi-bar-chart>` / `<app-pi-line-chart>` (or any custom SVG).
 *
 * Hairline border, no shadow, no gradient — matches Paper & Ink anti-bling principle.
 *
 * A11y: `role="figure"` + `aria-label` on the outer container; the actual
 * chart inside should set its own `role="img"` + `aria-label` (handled by
 * PiBarChartComponent / PiLineChartComponent).
 *
 * Standalone + OnPush + signal-based. No `any`, no OnInit/OnDestroy.
 */
@Component({
  selector: 'app-pi-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure
      role="figure"
      [attr.aria-label]="ariaLabel()"
      class="pi-chart border hairline border-rule rounded-sm p-4 bg-paper"
    >
      @if (eyebrow() || title() || subtitle()) {
        <figcaption class="pi-chart__caption mb-3">
          @if (eyebrow()) {
            <span class="eyebrow block">{{ eyebrow() }}</span>
          }
          @if (title()) {
            <h3 class="font-display text-lg tracking-tight mt-1 text-ink">{{ title() }}</h3>
          }
          @if (subtitle()) {
            <p class="text-sm text-muted mt-1">{{ subtitle() }}</p>
          }
        </figcaption>
      }
      <div class="pi-chart__canvas w-full">
        <ng-content />
      </div>
    </figure>
  `,
  styles: [`
    :host { display: block; }
    .pi-chart { transition: none; }
  `],
})
export class PiChartComponent {
  readonly eyebrow = input<string>('');
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly ariaLabel = input<string>('График');
}
