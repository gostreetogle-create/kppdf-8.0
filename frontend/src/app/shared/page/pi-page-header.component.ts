import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * TZ-68 PiPageHeader — editorial page header.
 *
 * One per page (single H1). Hierarchy:
 *  - eyebrow (mono, uppercase) — short section number + label.
 *  - h1 (font-display, 5xl, tracking-tight) — the page title.
 *  - subtitle (font-display, xl, muted) — optional subtitle.
 *  - description (max-w 58ch, leading-relaxed) — optional descriptive paragraph.
 *  - version (eyebrow with hairline border, rounded-sm) — optional badge.
 *
 * A11y: single H1 per page (SEO + screen-reader navigation).
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-pi-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="pt-header-y pb-header-y hairline-b">
      <p class="eyebrow mb-4">{{ eyebrow() }}</p>
      <h1 class="font-display font-bold text-5xl tracking-tight leading-[1.05]">
        {{ title() }}
      </h1>
      @if (subtitle()) {
        <p class="mt-4 font-display text-xl text-muted-foreground tracking-tight">
          {{ subtitle() }}
        </p>
      }
      @if (description()) {
        <p class="mt-6 max-w-[58ch] text-base text-muted-foreground font-body leading-relaxed">
          {{ description() }}
        </p>
      }
      @if (version()) {
        <span class="mt-6 inline-block eyebrow hairline rounded-sm px-2 py-1">
          {{ version() }}
        </span>
      }
    </header>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class PiPageHeaderComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly description = input<string>('');
  readonly version = input<string>('');
}
