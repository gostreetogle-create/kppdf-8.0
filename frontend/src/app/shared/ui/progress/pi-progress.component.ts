import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type PiProgressVariant = 'linear' | 'circular';
export type PiProgressSize = 'sm' | 'md' | 'lg';

/**
 * Paper & Ink editorial Progress indicator.
 *
 * Two variants:
 *  - `linear` — 1px hairline track (h-px) across full container width.
 *    Value is ink-filled solid block, animates width over 300 ms.
 *  - `circular` — inline-block square SVG with two concentric circles:
 *    one `--color-rule` track + one `--color-ink` arc. Stroke-width = 1
 *    (sharp, NOT 3-px pill blob). circumference = 2π·16 ≈ 100.53.
 *
 * Indeterminate mode (`indeterminate = true`):
 *  - linear: width snaps to 50% and `animate-pulse` pulses.
 *  - circular: the arc renders as 20/80 dasharray for visual hint of
 *    continuous motion WITHOUT shimmer (no scrubbing, no gradient).
 *
 * A11y (WAI-ARIA compliant):
 *  - `role="progressbar"` + `aria-valuenow/min/max/label`.
 *  - For indeterminate: `aria-valuenow` is OMITTED and `aria-valuetext`
 *    carries the textual state ("Загрузка"). WAI-ARIA says
 *    `aria-valuenow` should not advertise a value when progress is
 *    unknown.
 *
 * Motion: `motion-reduce:transition-none` honors global TZ-32
 * `prefers-reduced-motion` rule from styles.css.
 */
@Component({
  selector: 'app-pi-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (variant() === 'linear') {
      <div
        role="progressbar"
        [attr.aria-valuenow]="indeterminate() ? null : value()"
        [attr.aria-valuetext]="indeterminate() ? 'Загрузка' : null"
        [attr.aria-valuemin]="0"
        [attr.aria-valuemax]="max()"
        [attr.aria-label]="ariaLabel()"
        class="w-full h-px bg-rule/40 relative overflow-hidden"
      >
        <div
          class="h-full bg-ink motion-reduce:transition-none transition-all duration-300"
          [style.width.%]="indeterminate() ? 50 : percent()"
          [class.animate-pulse]="indeterminate()"
        ></div>
      </div>
    } @else {
      <div
        role="progressbar"
        [attr.aria-valuenow]="indeterminate() ? null : value()"
        [attr.aria-valuetext]="indeterminate() ? 'Загрузка' : null"
        [attr.aria-valuemin]="0"
        [attr.aria-valuemax]="max()"
        [attr.aria-label]="ariaLabel()"
        class="relative inline-block align-middle"
        [class.w-4]="size() === 'sm'"
        [class.h-4]="size() === 'sm'"
        [class.w-6]="size() === 'md'"
        [class.h-6]="size() === 'md'"
        [class.w-10]="size() === 'lg'"
        [class.h-10]="size() === 'lg'"
      >
        <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90" aria-hidden="true">
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="var(--color-rule)"
            stroke-width="1"
          />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="var(--color-ink)"
            stroke-width="1"
            stroke-linecap="butt"
            [attr.stroke-dasharray]="dashArray()"
          />
        </svg>
      </div>
    }
  `,
})
export class PiProgressComponent {
  readonly value = input.required<number>();
  readonly max = input<number>(100);
  readonly variant = input<PiProgressVariant>('linear');
  readonly size = input<PiProgressSize>('md');
  readonly indeterminate = input<boolean>(false);
  readonly ariaLabel = input<string>('Прогресс');

  /** Clamped [0..100] percentage, used by linear fill + circular dasharray. */
  readonly percent = computed(() => {
    const max = this.max();
    if (max <= 0) return 0;
    return Math.min(100, Math.max(0, (this.value() / max) * 100));
  });

  /** SVG arc dash array. circumference = 2π·16 ≈ 100.53.
   *  Indeterminate: 20/80 dash — visual hint of continuous motion
   *  without shimmer / gradient (Paper & Ink anti-bling). */
  readonly dashArray = computed(() => {
    const circumference = 2 * Math.PI * 16;
    if (this.indeterminate()) return '20 80';
    return `${(this.percent() / 100) * circumference} ${circumference}`;
  });
}
