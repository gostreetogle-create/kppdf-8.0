/**
 * DOM-contract jest spec for `BuilderCanvasComponent` magnetic grid +
 * alignment guides (TZ-237.MAGNETIC-GRID-r0 second slice \u2014 DOM coverage).
 *
 * Locks the user's \u00a710 acceptance criteria from the original brief:
 *   - grid layer rendered only when `gridVisible` is true (TZ-DOC-269:
 *     opt-in working mode — hidden by default, snap keeps working);
 *   - guide layer rendered only while a drag rect is being emitted;
 *   - `aria-hidden="true"` on both layers;
 *   - print-CSS hides both layers (no carry-over to PDF);
 *   - both layers have `pointer-events: none`;
 *   - guide `div`s carry axis/kind modifier classes, `data-edge`, AND
 *     `data-target`;
 *   - axis-style inline binding (`style.left.px` for X, `style.top.px`
 *     for Y) is wired correctly;
 *   - `gridSize` input reacts on the grid layer's `background-size`;
 *   - emitting `dragRectChange(null)` clears the guide layer.
 *
 * Engine math (`snap-engine.spec.ts`) and the existing builder-area
 * regression suite already cover drag-snap correctness. This file does
 * NOT re-test the engine; it locks the DOM wiring.
 *
 * TestBed strategy:
 *   - Stub `BlockRendererComponent` with a minimal `BlockRendererStub`
 *     that re-declares every input/output the canvas template binds to.
 *     This lets the spec emit `dragRectChange` directly from the stub to
 *     drive the parent's `onChildDragRect` handler without TS access
 *     tricks.
 *   - `NO_ERRORS_SCHEMA` swallows the unknown `<pi-canvas-page>` and
 *     `cdkDropList` reference once the canvas's imports are overridden
 *     to the stub-only list. The `.canvas-overlay-layer` subtree we care
 *     about still renders correctly inside the fallback DOM tree.
 *   - Component styles are read from the static `ɵcmp.styles` metadata
 *     on the component class rather than from `document.head`, because
 *     jest-preset-angular/jsdom does not reliably inject standalone
 *     inline styles into `<head>` the way the production browser does.
 */
import { Component, NO_ERRORS_SCHEMA, input, output } from '@angular/core';
import { CdkDropList } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PiCanvasPageComponent } from '../../../shared/ui/canvas/pi-canvas-page.component';
import { BuilderCanvasComponent } from './builder-canvas.component';
import type { Rect } from './snap-engine';
import type { TemplateBlock } from '../../../shared/template-block/template-block.types';

/**
 * Stand-in for `BlockRendererComponent`. Re-declares every input and
 * output the canvas template binds to so Angular's template type-check
 * is satisfied and the parent's `(dragRectChange)` wiring is exercised
 * (not bypassed via direct access to the canvas's protected members).
 */
@Component({
  selector: 'app-block-renderer',
  standalone: true,
  template: '<div data-testid="block-renderer-stub"></div>',
})
class BlockRendererStub {
  block = input.required<TemplateBlock>();
  selected = input<boolean>(false);
  multiSelected = input<boolean>(false);
  groupBlocks = input<TemplateBlock[]>([]);
  allBlocks = input<TemplateBlock[]>([]);
  layoutDragDelta = input<{ dx: number; dy: number } | null>(null);
  layoutDragBlockIds = input<ReadonlySet<string>>(new Set());
  snapEnabled = input<boolean>(true);
  gridSize = input<number>(20);
  boundaryPadding = input<number>(0);

  select = output<TemplateBlock>();
  multiSelect = output<TemplateBlock>();
  widthChange = output<{ width: number; marginLeft: number }>();
  deleteRequest = output<string>();
  layoutChanges =
    output<Array<{ block: TemplateBlock; layout: NonNullable<TemplateBlock['layout']> }>>();
  layoutDragPreview = output<{
    blockId: string;
    blockIds: ReadonlySet<string>;
    delta: { dx: number; dy: number } | null;
  }>();
  dragRectChange = output<Rect | null>();
  overlayMove = output<{
    block: TemplateBlock;
    overlayLeft: number;
    overlayTop: number;
  }>();
  overlayResize = output<{
    block: TemplateBlock;
    imageWidth: number;
    imageHeight: number;
  }>();
}

/**
 * Minimal realistic overlay block fixture. Cast through `unknown` because
 * `TemplateBlock.settings` is statically a typed (known-key) shape while
 * the runtime data we pass to the engine is `Record<string, unknown>`.
 * `blockKey(b)` reads `b._id ?? b.tempId ?? 'idx-' + b.order`.
 */
const TARGET_BLOCK = {
  _id: 'target-1',
  type: 'image' as const,
  settings: {
    overlay: true,
    imageWidth: 100,
    imageHeight: 100,
    overlayLeft: 200,
    overlayTop: 200,
  },
  order: 0,
} as unknown as TemplateBlock;

/**
 * Drag rect that perfectly aligns with TARGET_BLOCK on every axis, so the
 * engine produces a full fan of edge + center guides and the DOM test
 * can query every variant of `data-edge`.
 */
const DRAGGED_RECT: Rect = {
  blockId: 'dragged-1',
  left: 200,
  top: 200,
  width: 100,
  height: 100,
};

/**
 * Inline-styles introspection. Both approaches attempted in earlier
 * passes returned empty strings under jest-preset-angular + jsdom
 * (Angular's AOT/JIT transform does not pin `styles: [...]` to a
 * stable metadata slot for standalone components, and `document.head`
 * injection is unreliable in jsdom). The reliable, framework-agnostic
 * backstop is to read the source `.ts` file directly: Angular keeps
 * inline `styles: [\`...\`]` arrays as literal template strings in the
 * source, so substituting the source content here is equivalent to
 * verifying "the rule exists in the developer's authored CSS".
 */
import * as fs from 'fs';
import * as path from 'path';

const CANVAS_SOURCE_PATH = path.join(__dirname, 'builder-canvas.component.ts');
const CANVAS_SOURCE = fs.readFileSync(CANVAS_SOURCE_PATH, 'utf-8');

describe('BuilderCanvasComponent \u2014 Magnetic Grid + Guides (TZ-237.MAGNETIC-GRID-r0 DOM contract)', () => {
  let fixture: ComponentFixture<BuilderCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuilderCanvasComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(BuilderCanvasComponent, {
        set: { imports: [BlockRendererStub, PiCanvasPageComponent, CdkDropList] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(BuilderCanvasComponent);
    fixture.componentRef.setInput('blocks', [TARGET_BLOCK]);
    fixture.componentRef.setInput('snapEnabled', true);
    // TZ-DOC-269 (revoked 2026-08-02): the grid-dots overlay no longer exists
    // in DOM. We still set `gridVisible=true` here as a defensive back-compat
    // exercise — the layer must remain absent even at the legacy true value
    // (deprecated, but call sites elsewhere may still pipe it through). The
    // dedicated gating test below covers both true and false explicitly.
    fixture.componentRef.setInput('gridVisible', true);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    TestBed.resetTestingModule();
    // Defensive: even though we now read CSS from static metadata, remove
    // any leftover `<style>` elements other specs may have injected to
    // keep `document.head` clean for sibling specs that DO rely on it.
    document.head.querySelectorAll('style').forEach((s) => s.remove());
  });

  it('TZ-DOC-269-revoked: grid layer is NEVER rendered, regardless of gridVisible (input kept deprecated)', () => {
    // Toggle off: no grid even though snapEnabled stays true (snap is
    // independent of the decorative dots layer — TZ-DOC-269 was the
    // opposite: layer opt-in. After revocation there is no layer at all).
    fixture.componentRef.setInput('gridVisible', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.canvas-builder__grid-layer')).toBeFalsy();

    // Opt in (legacy): the layer must STILL be absent, even at the
    // backwards-compat true value. This guards against a regression where
    // someone re-introduces the decorative layer without re-amping the
    // inspector's snap-settings UI (which had the toggle removed).
    fixture.componentRef.setInput('gridVisible', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.canvas-builder__grid-layer')).toBeFalsy();

    // Preview-mode: still absent (layer is editor chrome-free already).
    fixture.componentRef.setInput('gridVisible', true);
    fixture.componentRef.setInput('viewMode', 'preview');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.canvas-builder__grid-layer')).toBeFalsy();
  });

  it('renders the guide layer only while a drag rect is being emitted', () => {
    expect(fixture.nativeElement.querySelector('.canvas-builder__guides-layer')).toBeFalsy();

    findOverlayStub(fixture).dragRectChange.emit(DRAGGED_RECT);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.canvas-builder__guides-layer')).toBeTruthy();

    // Cleanup: emitting null back collapses the layer again.
    findOverlayStub(fixture).dragRectChange.emit(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.canvas-builder__guides-layer')).toBeFalsy();
  });

  it('marks the guides layer aria-hidden="true" for screen readers', () => {
    findOverlayStub(fixture).dragRectChange.emit(DRAGGED_RECT);
    fixture.detectChanges();

    expect(
      fixture.nativeElement
        .querySelector('.canvas-builder__guides-layer')
        .getAttribute('aria-hidden'),
    ).toBe('true');
  });

  it('renders guide divs with axis + kind modifier classes, data-edge, and data-target', () => {
    findOverlayStub(fixture).dragRectChange.emit(DRAGGED_RECT);
    fixture.detectChanges();

    // An edge guide on the X axis carries `--x` but not `--center`,
    // carries `data-edge="left"`, and for the X-axis the inline
    // `style.left` is set to the coordinate while `style.top` is empty.
    const leftEl = fixture.nativeElement.querySelector('.canvas-builder__guide[data-edge="left"]');
    expect(leftEl).toBeTruthy();
    expect(leftEl.classList.contains('canvas-builder__guide--x')).toBe(true);
    expect(leftEl.classList.contains('canvas-builder__guide--center')).toBe(false);
    expect(leftEl.getAttribute('data-target')).toBe('target-1');
    expect(leftEl.style.left).toBe('200px');
    expect(leftEl.style.top).toBe('');

    // A centre guide on the Y axis carries `--y` AND `--center`,
    // `data-edge="cy"`, and for the Y-axis `style.top` is set while
    // `style.left` is empty. The Y-centre coordinate is `cy = top + h/2`,
    // i.e. `200 + 100/2 = 250` for this fixture (not 200 — that is the
    // top edge coordinate).
    const cyEl = fixture.nativeElement.querySelector('.canvas-builder__guide[data-edge="cy"]');
    expect(cyEl).toBeTruthy();
    expect(cyEl.classList.contains('canvas-builder__guide--y')).toBe(true);
    expect(cyEl.classList.contains('canvas-builder__guide--center')).toBe(true);
    expect(cyEl.getAttribute('data-target')).toBe('target-1');
    expect(cyEl.style.top).toBe('250px');
    expect(cyEl.style.left).toBe('');
  });

  it('declares @media print CSS that hides the guides layer (no PDF carry-over)', () => {
    // jsdom doesn't apply @media print styles, so we verify the rule
    // exists in the source authored CSS. This is the same string
    // Angular's `styles: [\`...\`]` array holds at runtime.
    // TZ-259.6: the print block also hides the floating alignment toolbar.
    expect(CANVAS_SOURCE).toMatch(
      /@media print\s*\{[^}]*\.canvas-builder__guides-layer,\s*\.canvas-align-toolbar\s*\{[^}]*display:\s*none\s*!important[^}]*\}/,
    );
    // TZ-DOC-269-revoked: the grid layer selector must NOT appear in the
    // print block — its layer has been removed from the canvas render.
    const printBlock = CANVAS_SOURCE.match(/@media print\s*\{[\s\S]*?\}/);
    expect(printBlock).toBeTruthy();
    expect(printBlock![0]).not.toMatch(/\.canvas-builder__grid-layer/);
  });

  it('applies pointer-events: none to the guides layer (no leftover grid-layer rule)', () => {
    expect(CANVAS_SOURCE).toMatch(/\.canvas-builder__guides-layer\s*\{[^}]*pointer-events:\s*none/);
    // Defensive: the grid-layer rule must no longer be present in source.
    expect(CANVAS_SOURCE).not.toMatch(
      /\.canvas-builder__grid-layer\s*\{[^}]*pointer-events:\s*none/,
    );
  });

  // ═══ TZ-DOC-272: marquee (rectangle) selection ═══

  /**
   * Give the dropzone real dimensions (jsdom getBoundingClientRect reads
   * offsetWidth/offsetHeight, which respect inline width/height) and
   * dispatch a marquee drag: mousedown on the empty dropzone → document
   * mousemove → document mouseup.
   */
  function dragMarquee(fromX: number, fromY: number, toX: number, toY: number): void {
    const zone = fixture.nativeElement.querySelector('.canvas-dropzone') as HTMLElement;
    zone.style.width = '720px';
    zone.style.height = '1018px';
    zone.dispatchEvent(
      new MouseEvent('mousedown', { clientX: fromX, clientY: fromY, bubbles: true }),
    );
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: toX, clientY: toY }));
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: toX, clientY: toY }));
  }

  it('TZ-DOC-272: marquee drag on empty canvas selects intersecting blocks', () => {
    const spy = jest.fn();
    fixture.componentInstance.marqueeSelect.subscribe(spy);

    dragMarquee(10, 10, 350, 350);

    // TARGET_BLOCK is an overlay image at (200,200) 100x100 → inside the
    // marquee (10,10)-(350,350) → selected (intersect policy).
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain('target-1');
  });

  it('TZ-DOC-272: marquee works in both directions (drag up-left)', () => {
    const spy = jest.fn();
    fixture.componentInstance.marqueeSelect.subscribe(spy);

    dragMarquee(350, 350, 10, 10);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain('target-1');
  });

  it('TZ-DOC-272: marquee that misses every block emits nothing', () => {
    const spy = jest.fn();
    fixture.componentInstance.marqueeSelect.subscribe(spy);

    dragMarquee(400, 400, 500, 500);

    expect(spy).not.toHaveBeenCalled();
  });

  it('TZ-DOC-272: mousedown on a block never starts a marquee', () => {
    const spy = jest.fn();
    fixture.componentInstance.marqueeSelect.subscribe(spy);
    const zone = fixture.nativeElement.querySelector('.canvas-dropzone') as HTMLElement;
    zone.style.width = '720px';
    zone.style.height = '1018px';

    // Stub a block-renderer element as the mousedown target.
    const blockEl = document.createElement('div');
    blockEl.className = 'block-renderer block-renderer--overlay';
    zone.appendChild(blockEl);
    blockEl.dispatchEvent(new MouseEvent('mousedown', { clientX: 10, clientY: 10, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 350, clientY: 350 }));
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 350, clientY: 350 }));

    expect(fixture.componentInstance['marqueeActive']()).toBe(false);
    expect(spy).not.toHaveBeenCalled();
    blockEl.remove();
  });

  it('TZ-DOC-272: Escape cancels the marquee without emitting a selection', () => {
    const spy = jest.fn();
    fixture.componentInstance.marqueeSelect.subscribe(spy);
    const zone = fixture.nativeElement.querySelector('.canvas-dropzone') as HTMLElement;
    zone.style.width = '720px';
    zone.style.height = '1018px';

    zone.dispatchEvent(new MouseEvent('mousedown', { clientX: 10, clientY: 10, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 350, clientY: 350 }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 350, clientY: 350 }));

    expect(fixture.componentInstance['marqueeActive']()).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  it('TZ-DOC-311: renders page-number indicator when pageNumbering=true; no header/footer text rendered', () => {
    fixture.componentRef.setInput('pageNumbering', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.canvas-page-number')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.canvas-header-text')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.canvas-footer-text')).toBeFalsy();
  });

  it('TZ-DOC-272: a plain click on empty canvas is not a marquee and keeps the default click', () => {
    const spy = jest.fn();
    fixture.componentInstance.marqueeSelect.subscribe(spy);
    const zone = fixture.nativeElement.querySelector('.canvas-dropzone') as HTMLElement;
    zone.style.width = '720px';
    zone.style.height = '1018px';

    zone.dispatchEvent(new MouseEvent('mousedown', { clientX: 50, clientY: 50, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 51, clientY: 51 }));

    expect(spy).not.toHaveBeenCalled();
    // suppressNextClick must be reset so the following click clears selection.
    expect(fixture.componentInstance['suppressNextClick']()).toBe(false);
  });
});

/**
 * Returns the LAST `<app-block-renderer>` instance in the DOM tree, which
 * corresponds to the OVERLAY call site (canvas renders flow blocks first,
 * then the separate overlay layer). The overlay stub is the one wired to
 * the parent's `(dragRectChange)` handler.
 */
function findOverlayStub(fixture: ComponentFixture<BuilderCanvasComponent>): BlockRendererStub {
  const stubEls = fixture.debugElement.queryAll((el) => el.name === 'app-block-renderer');
  if (stubEls.length === 0) {
    throw new Error('expected at least one <app-block-renderer> in the DOM');
  }
  return stubEls[stubEls.length - 1].componentInstance as BlockRendererStub;
}
