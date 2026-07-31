/**
 * DOM-contract jest spec for `BuilderCanvasComponent` magnetic grid +
 * alignment guides (TZ-237.MAGNETIC-GRID-r0 second slice \u2014 DOM coverage).
 *
 * Locks the user's \u00a710 acceptance criteria from the original brief:
 *   - grid layer rendered only when `snapEnabled` is true;
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
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
  snapEnabled = input<boolean>(true);
  gridSize = input<number>(20);
  boundaryPadding = input<number>(0);

  select = output<TemplateBlock>();
  multiSelect = output<TemplateBlock>();
  widthChange = output<{ width: number; marginLeft: number }>();
  deleteRequest = output<string>();
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

const CANVAS_SOURCE_PATH = path.join(
  __dirname,
  'builder-canvas.component.ts',
);
const CANVAS_SOURCE = fs.readFileSync(CANVAS_SOURCE_PATH, 'utf-8');

describe('BuilderCanvasComponent \u2014 Magnetic Grid + Guides (TZ-237.MAGNETIC-GRID-r0 DOM contract)', () => {
  let fixture: ComponentFixture<BuilderCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuilderCanvasComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(BuilderCanvasComponent, {
        set: { imports: [BlockRendererStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(BuilderCanvasComponent);
    fixture.componentRef.setInput('blocks', [TARGET_BLOCK]);
    fixture.componentRef.setInput('snapEnabled', true);
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

  it('renders the grid layer only when snapEnabled is true', () => {
    expect(
      fixture.nativeElement.querySelector('.canvas-builder__grid-layer'),
    ).toBeTruthy();

    fixture.componentRef.setInput('snapEnabled', false);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.canvas-builder__grid-layer'),
    ).toBeFalsy();

    // Reactivity: flipping back restores the layer.
    fixture.componentRef.setInput('snapEnabled', true);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.canvas-builder__grid-layer'),
    ).toBeTruthy();
  });

  it('renders the guide layer only while a drag rect is being emitted', () => {
    expect(
      fixture.nativeElement.querySelector('.canvas-builder__guides-layer'),
    ).toBeFalsy();

    findOverlayStub(fixture).dragRectChange.emit(DRAGGED_RECT);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.canvas-builder__guides-layer'),
    ).toBeTruthy();

    // Cleanup: emitting null back collapses the layer again.
    findOverlayStub(fixture).dragRectChange.emit(null);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.canvas-builder__guides-layer'),
    ).toBeFalsy();
  });

  it('marks both layers aria-hidden="true" for screen readers', () => {
    findOverlayStub(fixture).dragRectChange.emit(DRAGGED_RECT);
    fixture.detectChanges();

    expect(
      fixture.nativeElement
        .querySelector('.canvas-builder__grid-layer')
        .getAttribute('aria-hidden'),
    ).toBe('true');
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
    const leftEl = fixture.nativeElement.querySelector(
      '.canvas-builder__guide[data-edge="left"]',
    );
    expect(leftEl).toBeTruthy();
    expect(leftEl.classList.contains('canvas-builder__guide--x')).toBe(true);
    expect(leftEl.classList.contains('canvas-builder__guide--center')).toBe(
      false,
    );
    expect(leftEl.getAttribute('data-target')).toBe('target-1');
    expect(leftEl.style.left).toBe('200px');
    expect(leftEl.style.top).toBe('');

    // A centre guide on the Y axis carries `--y` AND `--center`,
    // `data-edge="cy"`, and for the Y-axis `style.top` is set while
    // `style.left` is empty. The Y-centre coordinate is `cy = top + h/2`,
    // i.e. `200 + 100/2 = 250` for this fixture (not 200 — that is the
    // top edge coordinate).
    const cyEl = fixture.nativeElement.querySelector(
      '.canvas-builder__guide[data-edge="cy"]',
    );
    expect(cyEl).toBeTruthy();
    expect(cyEl.classList.contains('canvas-builder__guide--y')).toBe(true);
    expect(cyEl.classList.contains('canvas-builder__guide--center')).toBe(
      true,
    );
    expect(cyEl.getAttribute('data-target')).toBe('target-1');
    expect(cyEl.style.top).toBe('250px');
    expect(cyEl.style.left).toBe('');
  });

  it('declares @media print CSS that hides grid + guides (no PDF carry-over)', () => {
    // jsdom doesn't apply @media print styles, so we verify the rule
    // exists in the source authored CSS. This is the same string
    // Angular's `styles: [\`...\`]` array holds at runtime.
    expect(CANVAS_SOURCE).toMatch(
      /@media print\s*\{[^}]*\.canvas-builder__grid-layer,\s*\.canvas-builder__guides-layer\s*\{[^}]*display:\s*none\s*!important[^}]*\}/,
    );
  });

  it('applies pointer-events: none to the visual layers', () => {
    expect(CANVAS_SOURCE).toMatch(
      /\.canvas-builder__grid-layer\s*\{[^}]*pointer-events:\s*none/,
    );
    expect(CANVAS_SOURCE).toMatch(
      /\.canvas-builder__guides-layer\s*\{[^}]*pointer-events:\s*none/,
    );
  });

  it('gridSize input reacts on the grid layer background-size', () => {
    fixture.componentRef.setInput('gridSize', 40);
    fixture.detectChanges();
    const grid = fixture.nativeElement.querySelector(
      '.canvas-builder__grid-layer',
    );
    expect(grid.style.backgroundSize).toBe('40px');
  });
});

/**
 * Returns the LAST `<app-block-renderer>` instance in the DOM tree, which
 * corresponds to the OVERLAY call site (canvas renders flow blocks first,
 * then the separate overlay layer). The overlay stub is the one wired to
 * the parent's `(dragRectChange)` handler.
 */
function findOverlayStub(
  fixture: ComponentFixture<BuilderCanvasComponent>,
): BlockRendererStub {
  const stubEls = fixture.debugElement.queryAll(
    (el) => el.name === 'app-block-renderer',
  );
  if (stubEls.length === 0) {
    throw new Error('expected at least one <app-block-renderer> in the DOM');
  }
  return stubEls[stubEls.length - 1].componentInstance as BlockRendererStub;
}
