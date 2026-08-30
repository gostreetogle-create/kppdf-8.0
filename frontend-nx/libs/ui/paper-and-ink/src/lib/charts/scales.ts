/**
 * TZ-66 Pure-Angular scale helpers (no d3 dependency).
 *
 * Inline minimal implementations of d3-scale's `scaleBand`/`scaleLinear`
 * and d3-shape's `line()` path generator. ~50 lines total, no external
 * runtime deps. d3 install failed (pnpm ERR_PNPM_PUBLIC_HOIST_PATTERN_DIFF
 * in TZ-66), so we ship pure-Angular — also gives full Paper & Ink
 * control over the SVG output (no library quirks).
 *
 * Used by pi-bar-chart.component.ts and pi-line-chart.component.ts.
 */

export interface BandScale {
  bandwidth: () => number;
  /** Returns the left-edge X position for the given category, or undefined. */
  map: (name: string) => number | undefined;
}

/** Band scale: maps ordinal names to band positions (left-edge + bandwidth). */
export function scaleBand(
  domain: readonly string[],
  range: readonly [number, number],
  padding: number,
): BandScale {
  const n = domain.length;
  const totalSpan = range[1] - range[0];
  const step = n === 0 ? 0 : totalSpan / n;
  const bandwidth = step * (1 - padding);
  const offset = (step - bandwidth) / 2;
  const index = new Map<string, number>();
  domain.forEach((d, i) => index.set(d, i));
  return {
    bandwidth: () => bandwidth,
    map: (name: string): number | undefined => {
      const i = index.get(name);
      if (i === undefined || step === 0) return undefined;
      return range[0] + i * step + offset;
    },
  };
}

export type LinearScale = (v: number) => number;

/** Linear scale: maps [domainStart..domainEnd] to [rangeStart..rangeEnd]. */
export function scaleLinear(
  domain: readonly [number, number],
  range: readonly [number, number],
): LinearScale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const slope = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
  const intercept = r0 - slope * d0;
  return (v: number) => slope * v + intercept;
}

/** Builds an SVG path `d` string from data points (M/L commands). */
export function linePath<T>(data: readonly T[], x: (d: T) => number, y: (d: T) => number): string {
  if (data.length === 0) return '';
  return data
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${x(d).toFixed(2)},${y(d).toFixed(2)}`)
    .join(' ');
}
