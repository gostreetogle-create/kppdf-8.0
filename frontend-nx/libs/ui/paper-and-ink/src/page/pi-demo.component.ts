import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * TZ-68 PiDemo — editorial demo card.
 *
 * Two content slots:
 *  - `[preview]` — the actual component/sample being showcased
 *  - `[info]` — optional supplemental content (rendered below title/desc)
 *
 * Visual structure:
 *  - Top: hairline border-b header with "Preview" eyebrow (left) +
 *    optional source-toggle button (right, future TZ-78).
 *  - Middle: `grid-paper` canvas (24px × 24px subtle rule grid) with
 *    centered preview content.
 *  - Bottom: hairline border-t footer with title (h3, font-display) +
 *    description + projected `[info]` slot.
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-pi-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="hairline rounded-sm overflow-hidden bg-paper">
      <div
        class="flex items-center justify-between hairline-b
               px-4 py-2 bg-paper-2"
      >
        <span class="eyebrow">Preview</span>
        @if (showSource()) {
          <button
            type="button"
            class="inline-flex items-center justify-center
                   w-7 h-7 hairline rounded-sm
                   hover:bg-paper transition-colors"
            aria-label="Показать исходник"
            title="Показать исходник (TZ-78)"
          >
            <span class="font-mono text-[10px]">{{ sourceGlyph }}</span>
          </button>
        }
      </div>
      <div class="grid-paper p-6 min-h-[120px] flex items-center justify-center">
        <ng-content select="[preview]" />
      </div>
      @if (title() || description()) {
        <div class="hairline-t px-4 py-3">
          <h3 class="font-display text-base font-semibold tracking-tight">
            {{ title() }}
          </h3>
          @if (description()) {
            <p class="text-sm text-muted-foreground mt-1">{{ description() }}</p>
          }
          <ng-content select="[info]" />
        </div>
      }
    </article>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class PiDemoComponent {
  /** Literal `</>` source glyph — bound via interpolation to avoid template parser ambiguity
   *  on a bare `{` character. */
  protected readonly sourceGlyph = '</>';

  readonly title = input<string>('');
  readonly description = input<string>('');
  /** TZ-78 live-code preview delayed implementation. */
  readonly showSource = input<boolean>(false);
}
