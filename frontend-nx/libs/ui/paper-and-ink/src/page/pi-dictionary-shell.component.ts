import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * TZ-DICT-302 PiDictionaryShell — compact sticky dictionary chrome.
 *
 * Replaces the triple-chrome pattern (pi-page-header + pi-toolbar + pi-section)
 * across all dictionary pages. Projects:
 *   - title: compact H1 (no eyebrow, no description).
 *   - [tools]: sticky bar with search / filters / sort / primary CTA.
 *   - default content: table or tree below the sticky bar.
 *
 * Key behaviour:
 *   - Tools row is sticky directly under the app-layout header (top-header-h = --header-h).
 *   - Content scrolls under it.
 *   - Hairline bottom border separates tools from content.
 *   - bg-paper prevents content bleed-through on scroll.
 *
 * API stable for DICT-303…307 page cutovers.
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-pi-dictionary-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Title: compact H1 without eyebrow / description -->
    <div class="dictionary-header pb-4">
      <h1 class="font-display font-bold text-xl sm:text-2xl tracking-tight leading-tight">
        {{ title() }}
      </h1>
      @if (totalLabel()) {
        <span class="ml-3 text-sm text-muted-foreground font-body">
          {{ totalLabel() }}
        </span>
      }
    </div>

    <!-- Tools: sticky bar — search / filters / sort / CTA -->
    <div
      class="dictionary-tools sticky top-header-h z-20
             flex items-center gap-form-field flex-wrap
             hairline-b py-3 bg-paper"
    >
      <ng-content select="[tools]" />
    </div>

    <!-- Content: projected table / tree -->
    <div class="dictionary-content pt-4">
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
export class PiDictionaryShellComponent {
  /** Compact page title (no eyebrow, no description). */
  readonly title = input.required<string>();

  /** Optional muted total/label next to the title (e.g. «3 записи»). */
  readonly totalLabel = input<string>('');
}
