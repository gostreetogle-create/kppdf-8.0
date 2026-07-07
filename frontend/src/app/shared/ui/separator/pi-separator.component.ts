import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PiSeparatorOrientation = 'horizontal' | 'vertical';

/**
 * Paper & Ink editorial Separator.
 *
 * Three render modes (all hairline 1px, no shadow, no hex):
 *  - horizontal + no label  → bare `<hr>` with border-top hairline.
 *  - horizontal + label     → flex with two hairlines + eyebrow text centered
 *                             (Print-style bookmark, e.g. for section dividers
 *                             like "Foundations" between sections).
 *  - vertical               → inline-block w-px span (for sidebar / inline
 *                             separators in horizontal layouts).
 *
 * A11y (WAI-ARIA compliant):
 *  - `role="separator"` + `aria-orientation` on the rendered element.
 *  - For label mode: aria-label is the label text (screen-reader announces
 *    "section: Foundations").
 *  - For no-label / vertical modes: aria-label defaults to "Разделитель".
 *
 * Standalone + OnPush + signal-based. No `any`, no OnInit/OnDestroy.
 */
@Component({
  selector: 'app-pi-separator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (orientation() === 'horizontal') {
      @if (label()) {
        <div
          role="separator"
          aria-orientation="horizontal"
          [attr.aria-label]="label()"
          class="flex items-center gap-3 my-6"
        >
          <span class="h-px flex-1 bg-rule" aria-hidden="true"></span>
          <span class="eyebrow text-base">{{ label() }}</span>
          <span class="h-px flex-1 bg-rule" aria-hidden="true"></span>
        </div>
      } @else {
        <hr
          role="separator"
          aria-orientation="horizontal"
          [attr.aria-label]="ariaLabel()"
          class="hairline-t my-6"
        />
      }
    } @else {
      <span
        role="separator"
        aria-orientation="vertical"
        [attr.aria-label]="ariaLabel()"
        class="inline-block w-px h-full bg-rule mx-3"
      ></span>
    }
  `,
})
export class PiSeparatorComponent {
  readonly orientation = input<PiSeparatorOrientation>('horizontal');
  readonly label = input<string>('');
  readonly ariaLabel = input<string>('Разделитель');
}
