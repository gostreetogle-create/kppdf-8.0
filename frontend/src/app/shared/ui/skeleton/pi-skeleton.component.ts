import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type PiSkeletonVariant = 'text' | 'circle' | 'rect';

/**
 * Paper & Ink editorial Skeleton placeholder.
 *
 * Renders N static `--color-rule` blocks (40% opacity) for loading states.
 * NO shimmer, NO pulse, NO shadow — Paper & Ink anti-bling principle.
 * The `last:w-3/5` Tailwind variant targets `:last-child` so only the final
 * line in a `text` group gets 60% width (visual hint of paragraph tail).
 *
 * A11y (WAI-ARIA compliant):
 *  - `role="status"` + `aria-live="polite"` → screen reader announces
 *    "Загрузка" without interrupting current speech.
 *  - `aria-busy="true"` signals loading state to assistive tech.
 *
 * Variants:
 *  - `text` — line-block(s). With `count > 1`, mb-2 spacing between lines
 *    and the last line is 60% width (paragraph-tail look).
 *  - `circle` — width = height, fully rounded (avatar placeholder).
 *  - `rect` — block at width × height (card/media placeholder).
 *
 * Reduced-motion: no animation used, so `prefers-reduced-motion` is
 * automatically satisfied (no media query needed in component).
 */
@Component({
  selector: 'app-pi-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="status"
      [attr.aria-label]="ariaLabel()"
      aria-live="polite"
      aria-busy="true"
      class="block"
    >
      @for (i of lines(); track i) {
        <span
          [class.block]="true"
          [class.bg-rule]="true"
          [class.opacity-40]="true"
          [class.last:w-3\\/5]="variant() === 'text'"
          [style.width]="width()"
          [style.height]="height()"
          [class.rounded-full]="variant() === 'circle'"
          [class.rounded-none]="variant() !== 'circle'"
          [class.mb-2]="variant() === 'text' && i < lines().length - 1"
        ></span>
      }
    </div>
  `,
})
export class PiSkeletonComponent {
  readonly width = input<string>('100%');
  readonly height = input<string>('1rem');
  readonly variant = input<PiSkeletonVariant>('text');
  readonly count = input<number>(1);
  readonly ariaLabel = input<string>('Загрузка');

  /** Index array for @for iteration. Materializes once per `count()` change. */
  readonly lines = computed(() => Array.from({ length: Math.max(0, this.count()) }, (_, i) => i));
}
