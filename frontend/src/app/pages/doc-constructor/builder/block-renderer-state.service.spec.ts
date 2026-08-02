/**
 * TZ-DOC-270 — `BlockRendererStateService` resize-math unit spec.
 *
 * Locks the acceptance criteria for image containment sizing:
 *   - the image size never becomes zero, negative, or NaN;
 *   - `computeCornerResize` survives a 0/NaN natural size (the state is
 *     that of an image that has not finished loading) and a corrupted
 *     `startWidth`;
 *   - width/height minima (50px / 20px) are preserved with the aspect
 *     ratio intact.
 *
 * Pure math — no TestBed required (the service only needs `new`).
 */
import {
  BlockRendererStateService,
  blockBackgroundCss,
  clampOpacity,
} from './block-renderer-state.service';
import type { TemplateBlock } from '../../../shared/template-block/template-block.types';

function eventAt(clientX: number, clientY: number): MouseEvent {
  return { clientX, clientY } as MouseEvent;
}

function block(settings?: Record<string, unknown>): TemplateBlock {
  return {
    templateId: 't1',
    type: 'text',
    order: 0,
    showLine: false,
    settings,
  };
}

describe('BlockRendererStateService — corner resize (TZ-DOC-270)', () => {
  let svc: BlockRendererStateService;

  beforeEach(() => {
    svc = new BlockRendererStateService();
  });

  it('returns finite positive dimensions for a normal resize', () => {
    const result = svc.computeCornerResize(
      eventAt(140, 100), // +40px, +0px from start
      100,
      100,
      200,
      400,
      300,
    );
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
    expect(Number.isFinite(result.width)).toBe(true);
    expect(Number.isFinite(result.height)).toBe(true);
  });

  it('never returns zero, negative, or NaN when startWidth is NaN', () => {
    const result = svc.computeCornerResize(eventAt(120, 120), 100, 100, NaN, 400, 300);
    expect(Number.isFinite(result.width)).toBe(true);
    expect(Number.isFinite(result.height)).toBe(true);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  it('never returns zero, negative, or NaN when startWidth is negative', () => {
    const result = svc.computeCornerResize(eventAt(120, 120), 100, 100, -50, 400, 300);
    expect(Number.isFinite(result.width)).toBe(true);
    expect(Number.isFinite(result.height)).toBe(true);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  it('falls back to the default aspect when natural size is 0 (image not loaded)', () => {
    const result = svc.computeCornerResize(eventAt(140, 100), 100, 100, 200, 0, 0);
    // Defaults are OVERLAY_DEFAULT_WIDTH=300 / OVERLAY_DEFAULT_HEIGHT=200 → 1.5.
    expect(Number.isFinite(result.width)).toBe(true);
    expect(Number.isFinite(result.height)).toBe(true);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
    expect(result.height).toBeCloseTo(result.width / 1.5, 0);
  });

  it('falls back to the default aspect when natural size is NaN', () => {
    const result = svc.computeCornerResize(eventAt(140, 100), 100, 100, 200, NaN, NaN);
    expect(Number.isFinite(result.width)).toBe(true);
    expect(Number.isFinite(result.height)).toBe(true);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  it('clamps the width to the 50px minimum on a shrinking drag', () => {
    const result = svc.computeCornerResize(
      eventAt(0, 0), // far-negative delta from start
      100,
      100,
      200,
      400,
      300,
    );
    expect(result.width).toBeGreaterThanOrEqual(50);
    expect(result.height).toBeGreaterThanOrEqual(20);
    expect(Number.isFinite(result.width)).toBe(true);
    expect(Number.isFinite(result.height)).toBe(true);
  });

  it('preserves the aspect ratio after the height minimum clamp', () => {
    // Extreme aspect (very wide) forces the height < 20 branch.
    const result = svc.computeCornerResize(eventAt(0, 0), 100, 100, 200, 4000, 10);
    expect(result.height).toBeGreaterThanOrEqual(20);
    expect(result.width).toBeGreaterThanOrEqual(50);
    expect(result.height).toBeCloseTo(result.width / 400, 0);
  });
});

describe('blockBackgroundCss / clampOpacity (TZ-DOC-273)', () => {
  it('clamps opacity to [0,1] and rejects non-finite values', () => {
    expect(clampOpacity(0.5)).toBe(0.5);
    expect(clampOpacity(1.7)).toBe(1);
    expect(clampOpacity(-0.3)).toBe(0);
    expect(clampOpacity(Number.NaN)).toBe(0);
    expect(clampOpacity('0.5' as unknown as number)).toBe(0);
  });

  it('renders a 6-digit hex to rgba with the given opacity', () => {
    expect(blockBackgroundCss('#ff0080', 0.5)).toBe('rgba(255, 0, 128, 0.5)');
    expect(blockBackgroundCss('ff0080', 0.5)).toBe('rgba(255, 0, 128, 0.5)');
  });

  it('expands a 3-digit hex', () => {
    expect(blockBackgroundCss('#0af', 1)).toBe('rgba(0, 170, 255, 1)');
  });

  it('returns transparent (empty) when no color is set', () => {
    expect(blockBackgroundCss(undefined, undefined)).toBe('');
    expect(blockBackgroundCss('', 0.5)).toBe('');
  });

  it('rejects CSS injection, gradients, urls, named colors, and non-hex', () => {
    expect(blockBackgroundCss('url(https://evil.example/x.png)', 0.5)).toBe('');
    expect(blockBackgroundCss('linear-gradient(red, blue)', 0.5)).toBe('');
    expect(blockBackgroundCss('red', 0.5)).toBe('');
    expect(blockBackgroundCss('#zzzzzz', 0.5)).toBe('');
    expect(blockBackgroundCss('#12345', 0.5)).toBe(''); // 5-digit is invalid
    expect(blockBackgroundCss('1234567', 0.5)).toBe('');
    expect(blockBackgroundCss('12; background: red', 0.5)).toBe('');
  });

  it('clamps out-of-range opacity inside the css helper', () => {
    expect(blockBackgroundCss('#000000', 5)).toBe('rgba(0, 0, 0, 1)');
    expect(blockBackgroundCss('#000000', -2)).toBe('rgba(0, 0, 0, 0)');
    expect(blockBackgroundCss('#000000', Number.NaN)).toBe('rgba(0, 0, 0, 0)');
  });

  it('blockBgColor computed is transparent by default', () => {
    const svc = new BlockRendererStateService();
    svc.block.set(block());
    expect(svc.blockBgColor()).toBe('');
  });

  it('blockBgColor computed reflects settings and clamps opacity', () => {
    const svc = new BlockRendererStateService();
    svc.block.set(block({ blockBackgroundColor: '#0af', blockOpacity: 2 }));
    expect(svc.blockBgColor()).toBe('rgba(0, 170, 255, 1)');
  });

  it('blockBgColor computed returns transparent for invalid color values', () => {
    const svc = new BlockRendererStateService();
    svc.block.set(block({ blockBackgroundColor: 'url(x)', blockOpacity: 0.5 }));
    expect(svc.blockBgColor()).toBe('');
    svc.block.set(block({ blockBackgroundColor: 'red', blockOpacity: 0.5 }));
    expect(svc.blockBgColor()).toBe('');
  });

  it('reset semantics: empty color yields transparent regardless of opacity', () => {
    const svc = new BlockRendererStateService();
    svc.block.set(block({ blockBackgroundColor: '', blockOpacity: 0.5 }));
    expect(svc.blockBgColor()).toBe('');
  });
});
