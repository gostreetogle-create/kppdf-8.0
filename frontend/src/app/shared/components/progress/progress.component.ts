import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/**
 * Progress (TZ-32) — linear + circular determinate + indeterminate.
 * Usage:
 *   <hlm-progress [value]="42" />
 *   <hlm-progress [value]="75" variant="circular" />
 *   <hlm-progress [indeterminate]="true" />
 */
@Component({
  selector: 'hlm-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (variant() === 'circular') {
      <div
        class="relative inline-flex items-center justify-center"
        [style.width.px]="size()"
        [style.height.px]="size()"
        role="progressbar"
        [attr.aria-valuenow]="clamped()"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <svg class="h-full w-full -rotate-90" [attr.viewBox]="'0 0 ' + size() + ' ' + size()">
          <circle
            [attr.cx]="size() / 2"
            [attr.cy]="size() / 2"
            [attr.r]="radius()"
            [attr.stroke-width]="stroke()"
            class="fill-transparent stroke-muted"
          />
          <circle
            [attr.cx]="size() / 2"
            [attr.cy]="size() / 2"
            [attr.r]="radius()"
            [attr.stroke-width]="stroke()"
            [attr.stroke-dasharray]="circumference()"
            [attr.stroke-dashoffset]="dashOffset()"
            [class.transition-all]="true"
            class="fill-transparent stroke-primary"
            stroke-linecap="round"
          />
        </svg>
        @if (showLabel()) {
          <span class="absolute text-xs font-medium">{{ clamped() }}%</span>
        }
      </div>
    } @else {
      <div
        class="relative h-2 w-full overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        [attr.aria-valuenow]="clamped()"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          [class]="'h-full transition-all ' + (indeterminate() ? 'animate-progress-indeterminate w-1/3' : '')"
          [style.width.%]="indeterminate() ? null : clamped()"
          [class]="indeterminate() ? 'bg-primary' : 'bg-primary'"
        ></div>
      </div>
    }
  `,
})
export class ProgressComponent {
  readonly value = input<number>(0);
  readonly max = input<number>(100);
  readonly variant = input<'linear' | 'circular'>('linear');
  readonly indeterminate = input<boolean>(false);
  readonly showLabel = input<boolean>(false);
  readonly size = input<number>(48);
  readonly stroke = input<number>(4);

  protected readonly clamped = computed(() => {
    const v = this.value();
    const m = this.max();
    return Math.max(0, Math.min(100, (v / m) * 100));
  });

  protected readonly radius = computed(() => (this.size() - this.stroke()) / 2);
  protected readonly circumference = computed(() => 2 * Math.PI * this.radius());
  protected readonly dashOffset = computed(() => this.circumference() * (1 - this.clamped() / 100));
}
