import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  CHART_PADDING,
  CHART_PALETTES,
  CHART_VIEWBOX,
  LINE_DOT_RADIUS,
  LINE_STROKE_WIDTH,
  PiChartPalette,
} from './chart.tokens';
import { scaleLinear, linePath, type LinearScale } from './scales';

export interface PiLinePoint {
  name: string;
  value: number;
}
export interface PiLineSeries {
  name: string;
  series: PiLinePoint[];
}

/**
 * Paper & Ink editorial Line Chart — pure Angular SVG (NO external chart lib).
 *
 * Hand-rolled to match Paper & Ink anti-bling principle:
 *  - Hairline 1.5px stroke (sharp, NOT 3px blob per spec).
 *  - Mono font on axis labels.
 *  - Reactive colorScheme: each line's `stroke` is a CSS custom property,
 *    TZ-77 Theme Editor updates <html> --color-* vars → chart re-tints automatically.
 *
 * Path generation: `linePath()` helper in `scales.ts` builds the SVG `d`
 * string from data + x/y accessors (pure TS, no d3-shape dep).
 *
 * Standalone + OnPush + signal-based. No `any`, no OnInit/OnDestroy.
 */
@Component({
  selector: 'app-pi-line-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.viewBox]="'0 0 ' + viewBox.width + ' ' + viewBox.height"
      [attr.aria-label]="ariaLabel()"
      role="img"
      class="pi-line-chart w-full h-full"
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
            class="pi-line-chart__tick"
            aria-hidden="true"
          >{{ tick }}</text>
        }
      }

      <!-- Lines (one path per series) -->
      @for (s of results(); track s.name; let seriesIndex = $index) {
        <path
          [attr.d]="pathFor(s.series)"
          fill="none"
          [attr.stroke]="colorFor(seriesIndex)"
          [attr.stroke-width]="strokeWidth"
          stroke-linejoin="round"
          stroke-linecap="round"
          aria-hidden="true"
        />
        <!-- Dots (small, mono-warm/cool per palette) -->
        @for (p of s.series; track p.name) {
          <circle
            [attr.cx]="xPosFor(p.name)"
            [attr.cy]="yPosForValue(p.value)"
            [attr.r]="dotRadius"
            [attr.fill]="colorFor(seriesIndex)"
            aria-hidden="true"
          />
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

      <!-- X-axis labels -->
      @if (xAxis()) {
        @for (label of xLabels(); track label) {
          <text
            [attr.x]="xPosFor(label)"
            [attr.y]="viewBox.height - padding.bottom + 16"
            text-anchor="middle"
            class="pi-line-chart__tick"
            aria-hidden="true"
          >{{ label }}</text>
        }
      }
    </svg>

    <!-- Legend -->
    @if (legend()) {
      <ul class="pi-line-chart__legend flex gap-4 mt-2 text-xs" aria-hidden="true">
        @for (s of results(); track s.name; let seriesIndex = $index) {
          <li class="flex items-center gap-2">
            <span
              class="inline-block w-3 h-px"
              [style.background-color]="colorFor(seriesIndex)"
            ></span>
            <span class="pi-line-chart__legend-label">{{ s.name }}</span>
          </li>
        }
      </ul>
    }
  `,
  styles: [`
    .pi-line-chart { display: block; }
    .pi-line-chart__tick {
      font-family: var(--font-mono);
      font-size: 10px;
      fill: var(--color-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .pi-line-chart__legend-label {
      font-family: var(--font-mono);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-muted);
    }
  `],
})
export class PiLineChartComponent {
  readonly results = input.required<PiLineSeries[]>();
  readonly xAxis = input<boolean>(true);
  readonly yAxis = input<boolean>(true);
  readonly legend = input<boolean>(true);
  readonly autoScale = input<boolean>(true);
  readonly palette = input<PiChartPalette>('mono-warm');
  readonly ariaLabel = input<string>('Line chart');

  protected readonly viewBox = CHART_VIEWBOX;
  protected readonly padding = CHART_PADDING;
  protected readonly strokeWidth = LINE_STROKE_WIDTH;
  protected readonly dotRadius = LINE_DOT_RADIUS;

  protected readonly innerWidth = computed(
    () => this.viewBox.width - this.padding.left - this.padding.right,
  );
  protected readonly innerHeight = computed(
    () => this.viewBox.height - this.padding.top - this.padding.bottom,
  );

  protected readonly allValues = computed(() =>
    this.results().flatMap((s) => s.series.map((p) => p.value)),
  );

  protected readonly rawMax = computed(() => {
    const values = this.allValues();
    return values.length === 0 ? 1 : Math.max(...values, 0);
  });

  /** Domain top = raw max + 10% headroom (if autoScale) — keeps tallest point below the ceiling. */
  protected readonly domainTop = computed(() =>
    this.autoScale() ? this.rawMax() * 1.1 : this.rawMax(),
  );

  protected readonly xLabels = computed(() => {
    const first = this.results()[0];
    if (!first) return [];
    return first.series.map((p) => p.name);
  });

  /** 5 evenly-spaced y-axis ticks (0 → domainTop). Top tick aligns with headroom. */
  protected readonly yTicks = computed(() => {
    const top = this.domainTop();
    const step = top / 4;
    return [0, step, step * 2, step * 3, top].map((v) => Math.round(v * 10) / 10);
  });

  /** X positions (precomputed, evenly-spaced within innerWidth for each label). */
  protected readonly xPositions = computed<number[]>(() => {
    const labels = this.xLabels();
    if (labels.length === 0) return [];
    if (labels.length === 1) return [this.innerWidth() / 2];
    const step = this.innerWidth() / (labels.length - 1);
    return labels.map((_, i) => i * step);
  });

  protected readonly yScale = computed<LinearScale>(() =>
    scaleLinear([0, this.domainTop()], [this.innerHeight(), 0]),
  );

  /** Y position of the data zero-line (used for X-axis baseline placement; for non-negative data, equals viewBox bottom). */
  protected readonly zeroY = computed(() => this.padding.top + this.yScale()(0));

  protected readonly paletteColors = computed(() => CHART_PALETTES[this.palette()]);

  protected colorFor(seriesIndex: number): string {
    return this.paletteColors()[seriesIndex % this.paletteColors().length];
  }

  protected xPosFor(name: string): number {
    const labels = this.xLabels();
    const i = labels.indexOf(name);
    if (i < 0) return this.padding.left;
    return this.padding.left + (this.xPositions()[i] ?? 0);
  }

  protected yPosForValue(v: number): number {
    return this.padding.top + this.yScale()(v);
  }

  protected yPosFor(tick: number): number {
    return this.padding.top + this.yScale()(tick);
  }

  protected pathFor(series: PiLinePoint[]): string {
    return linePath(
      series,
      (p) => this.xPosFor(p.name) - this.padding.left,
      (p) => this.yScale()(p.value),
    );
  }
}
