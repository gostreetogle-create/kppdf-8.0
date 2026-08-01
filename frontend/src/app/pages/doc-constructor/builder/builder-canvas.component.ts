import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CdkDropList, CdkDragDrop } from '@angular/cdk/drag-drop';
import { LucideAngularModule, AlignLeft, AlignRight, AlignCenterHorizontal, AlignStartVertical, AlignCenterVertical, AlignEndVertical, AlignHorizontalSpaceBetween, AlignVerticalSpaceBetween, MoveHorizontal, MoveVertical } from 'lucide-angular';
import { BlockRendererComponent } from './block-renderer.component';
import { PiCanvasPageComponent } from '../../../shared/ui/canvas/pi-canvas-page.component';
import { blockKey, type TemplateBlock } from '../../../shared/template-block/template-block.types';
import { moveItemInArray } from '../../../shared/util/move-item-in-array';
import { CANVAS_DROPLIST_ID, type AddBlockPayload } from './builder.types';
import {
  collapseAlignmentGuides,
  computeAlignmentGuides,
  computeAlignLayouts,
  layoutBlockToRect,
  overlayBlockToRect,
  type AlignEntry,
  type AlignMode,
  type Rect,
  type SnapGuide,
} from './snap-engine';

/**
 * BuilderCanvas — center pane of the document constructor.
 *
 * The canvas wrapper (pi-canvas-page) fills the available height. The
 * dropzone inside fills the wrapper via flex:1 so clicking anywhere on
 * the paper (between blocks, above/below blocks, on empty canvas) opens
 * the template properties panel.
 */
@Component({
  selector: 'app-builder-canvas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropList, BlockRendererComponent, PiCanvasPageComponent, LucideAngularModule],
  template: `
    <pi-canvas-page
      [pageSize]="pageSize()"
      [maxWidthPx]="maxWidthPx()"
      [orientation]="orientation()"
    >
      <!-- Background layers (z-index 0, pointer-events none). -->
      @if (backgroundImages().length > 0) {
        <div class="canvas-bg-stack" aria-hidden="true">
          @for (url of backgroundImages(); track url) {
            <div
              class="canvas-bg"
              [style.background-image]="'url(' + url + ')'"
              [style.opacity]="backgroundOpacity()"
            ></div>
          }
        </div>
      }

      <!-- Header text indicator -->
      @if (headerText()) {
        <div class="canvas-header-text">{{ headerText() }}</div>
      }

      <div
        cdkDropList
        [id]="CANVAS_DROPLIST_ID"
        [cdkDropListData]="flowBlocks()"
        class="canvas-dropzone"
        [class.is-empty]="blocks().length === 0"
        role="list"
        aria-label="Блоки документа"
        (cdkDropListDropped)="onDrop($event)"
        (click)="onCanvasClick($event)"
      >
        @if (blocks().length === 0) {
          <div class="canvas-dropzone__empty" aria-live="polite">
            <p class="canvas-dropzone__empty-title">Холст пуст</p>
            <p class="canvas-dropzone__empty-hint">
              Добавьте блоки из выпадающих списков выше. Кликните в любое место холста для свойств
              шаблона.
            </p>
          </div>
        } @else {
          @for (block of flowBlocks(); track blockKey(block)) {
            <app-block-renderer
              [block]="block"
              [selected]="blockKey(block) === selectedId()"
              [multiSelected]="selectedIds().has(blockKey(block))"
              [groupBlocks]="selectedBlocks()"
              [layoutDragDelta]="layoutDragDelta()"
              [layoutDragBlockIds]="layoutDragBlockIds()"
              [preview]="isPreview()"
              (select)="onSelect($event)"
              (multiSelect)="onMultiSelect($event)"
              (widthChange)="onBlockWidthChange(block, $event)"
              (deleteRequest)="deleteRequest.emit($event)"
              (layoutChanges)="onLayoutChanges($event)"
              (layoutDragPreview)="onLayoutDragPreview($event)"
            />
          }
        }
      </div>

      <!-- Canonical positioned blocks share the paper coordinate system. -->
      <div class="canvas-layout-layer" (click)="onCanvasClick($event)">
        @for (block of positionedBlocks(); track blockKey(block)) {
          <app-block-renderer
            [block]="block"
            [selected]="blockKey(block) === selectedId()"
            [multiSelected]="selectedIds().has(blockKey(block))"
            [groupBlocks]="selectedBlocks()"
            [layoutDragDelta]="layoutDragDelta()"
            [layoutDragBlockIds]="layoutDragBlockIds()"
            [preview]="isPreview()"
            (select)="onSelect($event)"
            (multiSelect)="onMultiSelect($event)"
            (deleteRequest)="deleteRequest.emit($event)"
            (layoutChanges)="onLayoutChanges($event)"
            (layoutDragPreview)="onLayoutDragPreview($event)"
            (dragRectChange)="onChildDragRect($event)"
          />
        }
      </div>

      <!-- TZ-259.6: floating alignment toolbar for multi-select (2+ blocks). -->
      @if (alignToolbarVisible()) {
        <div
          class="canvas-align-toolbar"
          role="toolbar"
          aria-label="Выравнивание блоков"
          (mousedown)="$event.stopPropagation()"
          (click)="$event.stopPropagation()"
        >
          <button
            type="button"
            class="canvas-align-toolbar__btn"
            (click)="onAlign('left')"
            title="Выровнять по левому краю"
          >
            <lucide-icon [img]="AlignLeftIcon" [size]="14"></lucide-icon>
          </button>
          <button
            type="button"
            class="canvas-align-toolbar__btn"
            (click)="onAlign('center-x')"
            title="Выровнять по центру по горизонтали"
          >
            <lucide-icon [img]="AlignCenterHorizontalIcon" [size]="14"></lucide-icon>
          </button>
          <button
            type="button"
            class="canvas-align-toolbar__btn"
            (click)="onAlign('right')"
            title="Выровнять по правому краю"
          >
            <lucide-icon [img]="AlignRightIcon" [size]="14"></lucide-icon>
          </button>
          <span class="canvas-align-toolbar__sep" aria-hidden="true"></span>
          <button
            type="button"
            class="canvas-align-toolbar__btn"
            (click)="onAlign('top')"
            title="Выровнять по верху"
          >
            <lucide-icon [img]="AlignStartVerticalIcon" [size]="14"></lucide-icon>
          </button>
          <button
            type="button"
            class="canvas-align-toolbar__btn"
            (click)="onAlign('middle-y')"
            title="Выровнять по центру по вертикали"
          >
            <lucide-icon [img]="AlignCenterVerticalIcon" [size]="14"></lucide-icon>
          </button>
          <button
            type="button"
            class="canvas-align-toolbar__btn"
            (click)="onAlign('bottom')"
            title="Выровнять по низу"
          >
            <lucide-icon [img]="AlignEndVerticalIcon" [size]="14"></lucide-icon>
          </button>
          <span class="canvas-align-toolbar__sep" aria-hidden="true"></span>
          <button
            type="button"
            class="canvas-align-toolbar__btn"
            (click)="onAlign('distribute-h')"
            title="Распределить по горизонтали"
          >
            <lucide-icon [img]="AlignHorizontalSpaceBetweenIcon" [size]="14"></lucide-icon>
          </button>
          <button
            type="button"
            class="canvas-align-toolbar__btn"
            (click)="onAlign('distribute-v')"
            title="Распределить по вертикали"
          >
            <lucide-icon [img]="AlignVerticalSpaceBetweenIcon" [size]="14"></lucide-icon>
          </button>
          <span class="canvas-align-toolbar__sep" aria-hidden="true"></span>
          <button
            type="button"
            class="canvas-align-toolbar__btn"
            (click)="onAlign('same-width')"
            title="Сделать одинаковую ширину"
          >
            <lucide-icon [img]="MoveHorizontalIcon" [size]="14"></lucide-icon>
          </button>
          <button
            type="button"
            class="canvas-align-toolbar__btn"
            (click)="onAlign('same-height')"
            title="Сделать одинаковую высоту"
          >
            <lucide-icon [img]="MoveVerticalIcon" [size]="14"></lucide-icon>
          </button>
        </div>
      }

      <!-- Overlay blocks layer (outside cdkDropList for free absolute positioning) -->
      <div class="canvas-overlay-layer">
        @for (block of overlayBlocks(); track blockKey(block)) {
          <app-block-renderer
            [block]="block"
            [selected]="blockKey(block) === selectedId()"
            [multiSelected]="selectedIds().has(blockKey(block))"
            [groupBlocks]="selectedBlocks()"
            [layoutDragDelta]="layoutDragDelta()"
            [layoutDragBlockIds]="layoutDragBlockIds()"
            (select)="onSelect($event)"
            (multiSelect)="onMultiSelect($event)"
            (widthChange)="onBlockWidthChange(block, $event)"
            (deleteRequest)="deleteRequest.emit($event)"
            (dragRectChange)="onChildDragRect($event)"
            (overlayMove)="onOverlayMove($event)"
            (overlayResize)="onOverlayResize($event)"
            (layoutChanges)="onLayoutChanges($event)"
            (layoutDragPreview)="onLayoutDragPreview($event)"
            [snapEnabled]="snapEnabled()"
            [gridSize]="gridSize()"
            [boundaryPadding]="boundaryPadding()"
          />
        }

        @if (snapEnabled() && !isPreview()) {
          <!-- TZ-237.MAGNETIC-GRID-r0: visible magnetic grid dots overlay. -->
          <div
            class="canvas-builder__grid-layer"
            aria-hidden="true"
            [style.background-size.px]="gridSize()"
          ></div>
        }
        @if (currentGuides().length > 0 && !isPreview()) {
          <!-- TZ-237.MAGNETIC-GRID-r0: alignment guides for the active overlay drag. -->
          <div class="canvas-builder__guides-layer" aria-hidden="true">
            @for (g of currentGuides(); track g.edge + ':' + g.targetBlockId) {
              <div
                class="canvas-builder__guide"
                [class.canvas-builder__guide--center]="g.kind === 'center'"
                [class.canvas-builder__guide--x]="g.axis === 'x'"
                [class.canvas-builder__guide--y]="g.axis === 'y'"
                [style.left.px]="g.axis === 'x' ? g.coordinate : null"
                [style.top.px]="g.axis === 'y' ? g.coordinate : null"
                [attr.data-edge]="g.edge"
                [attr.data-target]="g.targetBlockId"
              ></div>
            }
          </div>
        }
      </div>

      <!-- Footer text indicator -->
      @if (footerText()) {
        <div class="canvas-footer-text">{{ footerText() }}</div>
      }

      <!-- Page number indicator -->
      @if (pageNumbering()) {
        <div class="canvas-page-number">1</div>
      }
    </pi-canvas-page>
  `,
  styles: [
    `
      /* TZ-211: Executive shadow on canvas wrapper */
      :host {
        display: block;
        flex: 1;
        min-width: 0;
        height: 100%;
        box-shadow: var(--shadow-executive);
        border-radius: 4px;
        overflow: hidden;
      }

      .canvas-bg-stack {
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .canvas-bg {
        flex: 1;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        background-color: var(--color-paper);
      }

      /* Dropzone fills the entire paper height — click anywhere = template props */
      .canvas-dropzone {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0;
        position: relative;
        z-index: 1;
        min-height: 100%;
      }

      .canvas-dropzone.is-empty {
        align-items: center;
        justify-content: center;
        border: 1px dashed var(--color-rule);
        margin: 16px;
        padding: 48px 24px;
        text-align: center;
        border-radius: 4px;
      }

      .canvas-dropzone__empty-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-muted);
        margin: 0 0 4px;
      }

      .canvas-dropzone__empty-hint {
        font-size: 12px;
        color: var(--color-muted);
        margin: 0;
        max-width: 320px;
      }

      /* Header text on canvas */
      .canvas-header-text {
        position: relative;
        z-index: 2;
        padding: 12px 16px 8px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-muted);
        border-bottom: 1px dashed var(--color-rule);
        text-align: center;
      }

      /* Footer text on canvas */
      .canvas-footer-text {
        position: relative;
        z-index: 2;
        padding: 8px 16px 12px;
        font-size: 12px;
        font-weight: 500;
        color: var(--color-muted);
        border-top: 1px dashed var(--color-rule);
        text-align: center;
      }

      /* Page number on canvas */
      .canvas-page-number {
        position: relative;
        z-index: 2;
        padding: 4px 16px 12px;
        font-size: 11px;
        color: var(--color-muted);
        text-align: right;
        font-family: ui-monospace, monospace;
      }

      /* ═══ CDK drag-drop — TZ-211: Design System ═══ */
      .cdk-drag-preview {
        box-sizing: border-box;
        border: 1px solid var(--color-gold);
        background: var(--color-paper);
        opacity: 0.92;
        box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.15);
        border-radius: 2px;
      }

      .cdk-drag-placeholder {
        opacity: 0.25;
        border: 1px dashed var(--color-gold);
        border-radius: 2px;
        background: var(--color-gold-soft);
      }

      .cdk-drop-list-dragging .canvas-dropzone:not(.is-empty) {
        background: var(--color-paper-3);
      }

      /* ═══ Overlay Layer — absolute positioned blocks rendered above flow ═══ */
      .canvas-layout-layer,
      .canvas-overlay-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .canvas-layout-layer {
        z-index: 10;
      }

      .canvas-overlay-layer {
        z-index: 20;
      }

      .canvas-layout-layer > app-block-renderer,
      .canvas-overlay-layer > app-block-renderer {
        pointer-events: auto;
      }

      /* ═══ TZ-259.6: floating multi-select alignment toolbar ═══ */
      .canvas-align-toolbar {
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 200;
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 4px 6px;
        background: var(--color-paper);
        border: 1px solid var(--color-rule);
        border-radius: 4px;
        box-shadow: var(--shadow-executive);
        pointer-events: auto;
      }

      .canvas-align-toolbar__btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        padding: 0;
        color: var(--color-muted);
        background: transparent;
        border: none;
        border-radius: 2px;
        cursor: pointer;
        transition:
          color 100ms ease,
          background 100ms ease;
      }

      .canvas-align-toolbar__btn:hover {
        color: var(--color-ink);
        background: var(--color-paper-3);
      }

      .canvas-align-toolbar__btn:focus-visible {
        outline: 2px solid var(--color-gold);
        outline-offset: -1px;
      }

      .canvas-align-toolbar__sep {
        width: 1px;
        height: 16px;
        margin: 0 3px;
        background: var(--color-rule);
      }
    `,

    /* ── TZ-237.MAGNETIC-GRID-r0: magnetic grid + alignment guides ── */
    `
      .canvas-builder__grid-layer {
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        /* TZ-259.3: contrast raised from 0.18 → 0.42 and dot size 1px → 2px
           so the snap grid is actually visible on white paper. Hidden in
           preview via the isPreview() guard in the template. */
        background-image: radial-gradient(
          circle at 1px 1px,
          rgba(15, 23, 42, 0.42) 2px,
          transparent 0
        );
        background-size: var(--grid-size, 20px) var(--grid-size, 20px);
      }
      .canvas-builder__guides-layer {
        position: absolute;
        inset: 0;
        z-index: 100;
        pointer-events: none;
      }
      .canvas-builder__guide {
        position: absolute;
        pointer-events: none;
        background: rgba(220, 38, 38, 0.85);
      }
      .canvas-builder__guide--x {
        top: 0;
        bottom: 0;
        width: 1px;
        transform: translateX(-0.5px);
      }
      .canvas-builder__guide--y {
        left: 0;
        right: 0;
        height: 1px;
        transform: translateY(-0.5px);
      }
      .canvas-builder__guide--center {
        background: rgba(37, 99, 235, 0.85);
      }
      @media (prefers-reduced-motion: reduce) {
        .canvas-builder__guide {
          transition: none;
        }
      }
      @media print {
        .canvas-builder__grid-layer,
        .canvas-builder__guides-layer,
        .canvas-align-toolbar {
          display: none !important;
        }
      }
    `,
  ],
})
export class BuilderCanvasComponent {
  readonly blocks = input.required<TemplateBlock[]>();
  readonly selectedId = input<string | null>(null);
  readonly selectedIds = input<Set<string>>(new Set());
  readonly backgroundImages = input<string[]>([]);
  readonly orientation = input<'portrait' | 'landscape'>('portrait');
  readonly backgroundOpacity = input<number>(0.3);
  readonly headerText = input<string>('');
  readonly footerText = input<string>('');
  readonly pageNumbering = input<boolean>(false);
  readonly pageSize = input<'A3' | 'A4' | 'A5'>('A4');
  /** TZ-259.2: 'editor' | 'preview' — preview hides editor chrome and locks drag. */
  readonly viewMode = input<'editor' | 'preview'>('editor');

  protected readonly maxWidthPx = computed<number>(() => {
    const isLandscape = this.orientation() === 'landscape';
    const ps = this.pageSize();
    if (ps === 'A3') return isLandscape ? 1100 : 900;
    if (ps === 'A5') return isLandscape ? 680 : 520;
    return isLandscape ? 900 : 720;
  });

  readonly select = output<TemplateBlock>();
  readonly multiSelect = output<TemplateBlock>();
  readonly reorder = output<TemplateBlock[]>();
  readonly dropAdd = output<{ payload: AddBlockPayload; insertIndex: number }>();
  readonly blockWidthChange = output<{
    block: TemplateBlock;
    width: number;
    marginLeft: number;
    imageWidth?: number;
    imageHeight?: number;
  }>();
  /** Overlay move (X/Y position change via drag). */
  readonly overlayMove = output<{
    block: TemplateBlock;
    overlayLeft: number;
    overlayTop: number;
  }>();
  /** Overlay resize (corner handle proportional resize). */
  readonly overlayResize = output<{
    block: TemplateBlock;
    imageWidth: number;
    imageHeight: number;
  }>();
  readonly layoutChanges =
    output<Array<{ block: TemplateBlock; layout: NonNullable<TemplateBlock['layout']> }>>();
  readonly canvasClick = output<void>();
  /** TZ-211: Emitted when user clicks delete button on a block. */
  readonly deleteRequest = output<string>();
  /** Enable snap-to-grid for overlay blocks. */
  readonly snapEnabled = input<boolean>(true);
  /** Grid size for snapping (px). */
  readonly gridSize = input<number>(20);
  /** Padding from paper edges that overlay blocks cannot cross (px). */
  readonly boundaryPadding = input<number>(0);

  protected readonly CANVAS_DROPLIST_ID: string = CANVAS_DROPLIST_ID;
  protected readonly blockKey = blockKey;

  // TZ-259.6: lucide icons for the floating alignment toolbar.
  protected readonly AlignLeftIcon = AlignLeft;
  protected readonly AlignRightIcon = AlignRight;
  protected readonly AlignCenterHorizontalIcon = AlignCenterHorizontal;
  protected readonly AlignStartVerticalIcon = AlignStartVertical;
  protected readonly AlignCenterVerticalIcon = AlignCenterVertical;
  protected readonly AlignEndVerticalIcon = AlignEndVertical;
  protected readonly AlignHorizontalSpaceBetweenIcon = AlignHorizontalSpaceBetween;
  protected readonly AlignVerticalSpaceBetweenIcon = AlignVerticalSpaceBetween;
  protected readonly MoveHorizontalIcon = MoveHorizontal;
  protected readonly MoveVerticalIcon = MoveVertical;

  /** TZ-259.2: true when the canvas is in print-preview mode. */
  protected readonly isPreview = computed<boolean>(() => this.viewMode() === 'preview');

  /**
   * TZ-259.6: show the floating alignment toolbar only when 2+ positioned
   * (layout) blocks are multi-selected and we are NOT in preview mode.
   * Gate on positioned count so the toolbar never appears for a selection
   * of flow-only blocks, where `onAlign` would silently no-op.
   */
  protected readonly alignToolbarVisible = computed<boolean>(() => {
    if (this.selectedIds().size < 2 || this.isPreview()) return false;
    const positioned = this.selectedBlocks().filter((b) => !!b.layout);
    return positioned.length >= 2;
  });

  /**
   * Paper pixel size used to convert normalized layout coordinates into
   * paper-relative px for the guide engine (mirrors pi-canvas-page CSS).
   */
  protected readonly paperSizePx = computed<{ width: number; height: number }>(() => {
    const w = this.maxWidthPx();
    const landscape = this.orientation() === 'landscape';
    const h = landscape ? w / 1.414 : w * 1.414;
    return { width: w, height: h };
  });

  /** Check if a block is in overlay mode. */
  protected isOverlayBlock(block: TemplateBlock): boolean {
    if (block.type !== 'image') return false;
    const settings = block.settings as Record<string, unknown> | undefined;
    return (settings?.['overlay'] as boolean) ?? false;
  }

  // ═══ TZ-237.MAGNETIC-GRID-r0: magnetic grid + alignment guides ═══

  /**
   * Live drag rectangle of the overlay block currently being dragged.
   * `null` while no drag is in progress. Set by child renderers via
   * `onChildDragRect()` bound to the `dragRectChange` output.
   *
   * Single-block drag only. When multi-select drag ships (TZ-237.E /
   * builder follow-up), this signal becomes a `Map<blockId, Rect>`
   * and `currentGuides` aggregates guides against every active drag
   * rect. Keep this TODO marker in sync with that future contract.
   */
  protected readonly currentDragRect = signal<Rect | null>(null);
  protected readonly layoutDragDelta = signal<{ dx: number; dy: number } | null>(null);
  protected readonly layoutDragBlockIds = signal<ReadonlySet<string>>(new Set());

  /**
   * Reactive alignment guides computed from `currentDragRect` and all
   * other overlay blocks on the canvas. Re-emits whenever the active
   * drag rect or the block list changes.
   */
  protected readonly currentGuides = computed<readonly SnapGuide[]>(() =>
    this.computeGuidesForCurrentDrag(),
  );

  /**
   * Handler bound to each child renderer's `dragRectChange` output.
   * Replaces any previous drag (only one overlay drag is supported per
   * slice). `null` clears the guides on drag end / cancel / destroy.
   *
   * Defensive guard: a redundant `null → null` write is skipped so
   * downstream computeds don't see a spurious re-evaluation. Also
   * short-circuits when this is the very first emission and the
   * caller is asking us to clear while we were already empty.
   */
  protected onChildDragRect(rect: Rect | null): void {
    if (rect === null && this.currentDragRect() === null) return;
    this.currentDragRect.set(rect);
  }

  /**
   * Compute deterministic, threshold-filtered alignment guides for the
   * currently active drag against all overlay neighbours. Self-exclusion
   * is enforced both here AND inside `computeAlignmentGuides` (defence
   * in depth, because the engine never trusts the caller).
   *
   * Block identity uses the project's `blockKey(block)` helper — R1
   * `TemplateBlock` does NOT carry a `block.id` field; identity is
   * computed via `(block._id ?? block.tempId ?? "idx-${order}")`.
   */
  private computeGuidesForCurrentDrag(): readonly SnapGuide[] {
    const dragged = this.currentDragRect();
    if (!dragged) return [];
    const blocks = this.blocks() ?? [];
    const paper = this.paperSizePx();
    const others: Rect[] = [];
    for (const b of blocks) {
      if (blockKey(b) === dragged.blockId) continue;
      // TZ-259.5: alignment candidates are BOTH overlay images and
      // canonical positioned (layout) blocks — not just overlay.
      if (this.isOverlayBlock(b)) {
        const r = overlayBlockToRect({
          blockId: blockKey(b),
          // `settings` on `TemplateBlock` is `Record<string, unknown> | undefined`;
          // the engine accepts `Readonly<Record<string, unknown>> | null` so the
          // contract lines up without `any` casts.
          settings: b.settings ?? null,
        });
        if (r) others.push(r);
      } else {
        const r = layoutBlockToRect(
          { blockId: blockKey(b), layout: b.layout },
          paper.width,
          paper.height,
        );
        if (r) others.push(r);
      }
    }
    return collapseAlignmentGuides(computeAlignmentGuides(dragged, others));
  }

  /**
   * TZ-259.6: apply an alignment/distribution mode to all multi-selected
   * positioned blocks and emit the batch layout update.
   */
  protected onAlign(mode: AlignMode): void {
    const selected = this.selectedBlocks().filter((b) => b.layout);
    if (selected.length < 2) return;
    const entries: AlignEntry[] = selected.map((b) => ({
      blockId: blockKey(b),
      layout: b.layout!,
    }));
    const next = computeAlignLayouts(entries, mode);
    const byId = new Map(next.map((e) => [e.blockId, e.layout]));
    const changes = selected
      .map((b) => ({ block: b, layout: byId.get(blockKey(b))! }))
      .filter((c) => c.layout);
    if (changes.length > 0) this.layoutChanges.emit(changes);
  }

  /** Legacy pixel-positioned image blocks stay in the overlay layer. */
  protected readonly overlayBlocks = computed(() =>
    this.blocks().filter((b) => !b.layout && this.isOverlayBlock(b)),
  );

  protected readonly selectedBlocks = computed(() => {
    const ids = this.selectedIds();
    return this.blocks().filter((b) => ids.has(blockKey(b)));
  });

  /** Canonical positioned blocks render in the paper-level layout layer. */
  protected readonly positionedBlocks = computed(() => this.blocks().filter((b) => !!b.layout));

  /** Legacy flow blocks remain in the sortable drop list. */
  protected readonly flowBlocks = computed(() =>
    this.blocks().filter((b) => !b.layout && !this.isOverlayBlock(b)),
  );

  protected onSelect(block: TemplateBlock): void {
    this.select.emit(block);
  }

  protected onMultiSelect(block: TemplateBlock): void {
    this.multiSelect.emit(block);
  }

  protected onBlockWidthChange(
    block: TemplateBlock,
    event: { width: number; marginLeft: number; imageWidth?: number; imageHeight?: number },
  ): void {
    this.blockWidthChange.emit({
      block,
      width: event.width,
      marginLeft: event.marginLeft,
      imageWidth: event.imageWidth,
      imageHeight: event.imageHeight,
    });
  }

  protected onOverlayMove(event: {
    block: TemplateBlock;
    overlayLeft: number;
    overlayTop: number;
  }): void {
    this.overlayMove.emit(event);
  }

  protected onOverlayResize(event: {
    block: TemplateBlock;
    imageWidth: number;
    imageHeight: number;
  }): void {
    this.overlayResize.emit(event);
  }

  protected onLayoutChanges(
    changes: Array<{ block: TemplateBlock; layout: NonNullable<TemplateBlock['layout']> }>,
  ): void {
    this.layoutDragDelta.set(null);
    this.layoutDragBlockIds.set(new Set());
    this.layoutChanges.emit(changes);
  }

  protected onLayoutDragPreview(event: {
    blockId: string;
    blockIds: ReadonlySet<string>;
    delta: { dx: number; dy: number } | null;
  }): void {
    this.layoutDragDelta.set(event.delta);
    this.layoutDragBlockIds.set(event.blockIds);
  }

  protected onCanvasClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.block-renderer')) {
      this.canvasClick.emit();
    }
  }

  protected onDrop(event: CdkDragDrop<TemplateBlock[]>): void {
    if (event.previousContainer === event.container) {
      const flow = [...this.flowBlocks()];
      if (event.previousIndex === event.currentIndex) return;
      moveItemInArray(flow, event.previousIndex, event.currentIndex);

      // CDK indexes are relative to the flow-only drop list. Rebuild the
      // complete order without moving positioned/overlay blocks accidentally.
      let flowIndex = 0;
      const next = this.blocks().map((block) =>
        !block.layout && !this.isOverlayBlock(block) ? flow[flowIndex++] : block,
      );
      this.reorder.emit(next);
    } else {
      const payload = event.item.data as AddBlockPayload | undefined;
      if (!payload) return;
      this.dropAdd.emit({ payload, insertIndex: event.currentIndex });
    }
  }
}
