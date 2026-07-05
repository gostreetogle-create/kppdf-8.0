import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  BAR_GAP_RATIO,
  BAR_RX,
  CHART_PADDING,
  CHART_PALETTES,
  CHART_VIEWBOX,
  PiChartPalette,
} from './chart.tokens';
import { scaleBand, scaleLinear, type BandScale, type LinearScale } from './scales';

export interface PiBarDatum {
  name: string;
  value: number;
}

/**
 * Paper & Ink editorial Bar Chart — pure Angular SVG (NO external chart lib).
 *
 * Hand-rolled to match Paper & Ink anti-bling principle:
 *  - NO gradient (flat fill, per spec `gradient: false`).
 *  - Sharp 1px rx corners (NOT pill-rounded).
 *  - Hairline grid (--color-rule, 1px).
 *  - Mono font (var(--font-mono)) on axis labels.
 *  - Reactive colorScheme: each bar's `fill` is a CSS custom property,
 *    TZ-77 Theme Editor updates <html> --color-* vars → chart re-tints automatically.
 *
 * Scales (in `scales.ts`, pure TS):
 *  - xScale: `scaleBand` over category names (bandwidth = innerWidth / n).
 *  - yScale: `scaleLinear` from 0 to max(value) + 10% headroom.
 *  - Inner width/height = viewBox minus padding.
 *
 * Standalone + OnPush + signal-based. No `any`, no OnInit/OnDestroy.
 */
@Component({
  selector: 'app-pi-bar-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.viewBox]="'0 0 ' + viewBox.width + ' ' + viewBox.height"
      [attr.aria-label]="ariaLabel()"
      role="img"
      class="pi-bar-chart w-full h-full"
    >
      <!-- Grid lines (horizontal, hairline) -->
      @for (tick of yTicks(); track tick) {
        <line
          [attr.x1]="padding.left"
          [attr.x2]="viewBox.width - padding.right"
          [attr.y1]="yPosFor(tick)"
          [attr.y2]="yPosFor(tick)"
          stroke="var(--color-rule)"
          stroke-width="1"
          aria-hidden="true"
        />
        @if (yAxis()) {
          <text
            [attr.x]="padding.left - 6"
            [attr.y]="yPosFor(tick)"
            text-anchor="end"
            dominant-baseline="middle"
            class="pi-bar-chart__tick"
            aria-hidden="true"
          >{{ tick }}</text>
        }
      }

      <!-- Bars -->
      @for (d of results(); track $index) {
        <rect
          [attr.x]="barGeometry(d.value, $index).x"
          [attr.y]="barGeometry(d.value, $index).y"
          [attr.width]="bandScale().bandwidth()"
          [attr.height]="barGeometry(d.value, $index).height"
          [attr.fill]="paletteColors()[$index % paletteColors().length]"
          [attr.rx]="barRx"
          aria-hidden="true"
        />
      }

      <!-- X-axis labels -->
      @if (xAxis()) {
        @for (d of results(); track $index) {
          <text
            [attr.x]="(barGeometry(d.value, $index).x) + bandScale().bandwidth() / 2"
            [attr.y]="viewBox.height - padding.bottom + 16"
            text-anchor="middle"
            class="pi-bar-chart__tick"
            aria-hidden="true"
          >{{ d.name }}</text>
        }
      }

      <!-- X-axis baseline (follows data zero-line; for non-negative data, sits at viewBox bottom) -->
      <line
        [attr.x1]="padding.left"
        [attr.x2]="viewBox.width - padding.right"
        [attr.y1]="zeroY()"
        [attr.y2]="zeroY()"
        stroke="var(--color-ink)"
        stroke-width="1"
        aria-hidden="true"
      />
    </svg>
  `,
  styles: [`
    .pi-bar-chart { display: block; }
    .pi-bar-chart__tick {
      font-family: var(--font-mono);
      font-size: 10px;
      fill: var(--color-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
  `],
})
export class PiBarChartComponent {
  readonly results = input.required<PiBarDatum[]>();
  readonly xAxis = input<boolean>(true);
  readonly yAxis = input<boolean>(true);
  readonly gradient = input<boolean>(false);
  readonly palette = input<PiChartPalette>('mono-warm');
  readonly ariaLabel = input<string>('Bar chart');

  protected readonly viewBox = CHART_VIEWBOX;
  protected readonly padding = CHART_PADDING;
  protected readonly barRx = BAR_RX;

  protected readonly innerWidth = computed(
    () => this.viewBox.width - this.padding.left - this.padding.right,
  );
  protected readonly innerHeight = computed(
    () => this.viewBox.height - this.padding.top - this.padding.bottom,
  );

  protected readonly maxValue = computed(() => {
    const values = this.results().map((d) => d.value);
    return values.length === 0 ? 1 : Math.max(...values, 0);
  });

  /** Domain top = max(value) + 10% headroom (so bars don't kiss the ceiling). */
  protected readonly domainTop = computed(() => this.maxValue() * 1.1);

  /** 5 evenly-spaced y-axis ticks (0 → domainTop). Top tick aligns with headroom. */
  protected readonly yTicks = computed(() => {
    const top = this.domainTop();
    const step = top / 4;
    return [0, step, step * 2, step * 3, top].map((v) => Math.round(v * 10) / 10);
  });

  protected readonly bandScale = computed<BandScale>(() =>
    scaleBand(
      this.results().map((d) => d.name),
      [0, this.innerWidth()],
      BAR_GAP_RATIO,
    ),
  );

  protected readonly yScale = computed<LinearScale>(() =>
    scaleLinear([0, this.domainTop()], [this.innerHeight(), 0]),
  );

  protected readonly paletteColors = computed(() => CHART_PALETTES[this.palette()]);

  /** Zero-baseline Y position (used for negative-value bars). */
  protected readonly zeroY = computed(() => this.padding.top + this.yScale()(0));

  /**
   * Bar geometry per data point. Handles negative values correctly:
   * negative bars grow downward from the zero baseline; positive bars
   * grow upward from the zero baseline.
   */
  protected barGeometry(value: number, index: number): { x: number; y: number; height: number } {
    const x = this.padding.left + (this.bandScale().map(this.results()[index]!.name) ?? 0);
    const yVal = this.yScale()(value);
    const yZero = this.yScale()(0);
    const top = Math.min(yVal, yZero);
    const height = Math.abs(yZero - yVal);
    return { x, y: this.padding.top + top, height };
  }

  protected yPosFor(tick: number): number {
    return this.padding.top + this.yScale()(tick);
  }
}
