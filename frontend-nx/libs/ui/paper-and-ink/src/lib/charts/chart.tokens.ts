/**
 * TZ-66 Chart tokens — Paper & Ink editorial chart palette + dimensions.
 *
 * 5 OKLCH-derived colorScheme vars consumed by both bar + line charts.
 * All colors reference CSS custom properties from `styles.css` (`@theme inline`)
 * so TZ-77 Theme Editor can re-tint charts reactively at runtime — no JS listener
 * needed, CSS variable change → SVG fill/stroke picks it up automatically.
 *
 * NO shadow / NO gradient (default `gradient: false`) / NO rounded corners
 * beyond `BAR_RX = 1` (sharp, hairline-aligned).
 */

export const CHART_SCHEME = {
  domain: [
    'var(--color-accent-warm)',
    'var(--color-accent-cool)',
    'var(--color-ink)',
    'var(--color-rule)',
    'var(--color-muted)',
  ],
} as const;

export const CHART_PALETTES = {
  mono: ['var(--color-ink)', 'var(--color-rule)', 'var(--color-muted)'],
  'mono-warm': [
    'var(--color-accent-warm)',
    'var(--color-ink)',
    'var(--color-rule)',
    'var(--color-muted)',
  ],
  'mono-cool': [
    'var(--color-accent-cool)',
    'var(--color-ink)',
    'var(--color-rule)',
    'var(--color-muted)',
  ],
  'paper-ink': [
    'var(--color-ink)',
    'var(--color-rule)',
    'var(--color-accent-warm)',
    'var(--color-accent-cool)',
  ],
} as const;

export type PiChartPalette = keyof typeof CHART_PALETTES;

/** SVG dimensions (viewBox). Aspect 4:3 for editorial framing. */
export const CHART_VIEWBOX = { width: 480, height: 320 } as const;

/** Bar geometry. Sharp corners (rx=1) per spec: hairline-aligned, NOT pill. */
export const BAR_RX = 1;
export const BAR_GAP_RATIO = 0.25;

/** Line geometry. Hairline 1.5px stroke per spec — sharp, NOT 3px blob. */
export const LINE_STROKE_WIDTH = 1.5;
export const LINE_DOT_RADIUS = 2;

/** Axis padding (inside SVG viewBox). */
export const CHART_PADDING = { top: 16, right: 16, bottom: 32, left: 40 } as const;
