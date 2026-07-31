import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CdkDropList, CdkDragDrop } from '@angular/cdk/drag-drop';
import { BlockRendererComponent } from './block-renderer.component';
import { PiCanvasPageComponent } from '../../../shared/ui/canvas/pi-canvas-page.component';
import { blockKey, type TemplateBlock } from '../../../shared/template-block/template-block.types';
import { moveItemInArray } from '../../../shared/util/move-item-in-array';
import { CANVAS_DROPLIST_ID, type AddBlockPayload } from './builder.types';
import {
  collapseAlignmentGuides,
  computeAlignmentGuides,
  overlayBlockToRect,
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
  imports: [CdkDropList, BlockRendererComponent, PiCanvasPageComponent],
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
              (select)="onSelect($event)"
              (multiSelect)="onMultiSelect($event)"
              (widthChange)="onBlockWidthChange(block, $event)"
              (deleteRequest)="deleteRequest.emit($event)"
            />
          }
        }
      </div>

      <!-- Overlay blocks layer (outside cdkDropList for free absolute positioning) -->
      <div class="canvas-overlay-layer">
        @for (block of overlayBlocks(); track blockKey(block)) {
          <app-block-renderer
            [block]="block"
            [selected]="blockKey(block) === selectedId()"
            [multiSelected]="selectedIds().has(blockKey(block))"
            (select)="onSelect($event)"
            (multiSelect)="onMultiSelect($event)"
            (widthChange)="onBlockWidthChange(block, $event)"
            (deleteRequest)="deleteRequest.emit($event)"
            (dragRectChange)="onChildDragRect($event)"
            (overlayMove)="onOverlayMove($event)"
            (overlayResize)="onOverlayResize($event)"
            [snapEnabled]="snapEnabled()"
            [gridSize]="gridSize()"
            [boundaryPadding]="boundaryPadding()"
          />
        }

        @if (snapEnabled()) {
          <!-- TZ-237.MAGNETIC-GRID-r0: visible magnetic grid dots overlay. -->
          <div
            class="canvas-builder__grid-layer"
            aria-hidden="true"
            [style.background-size.px]="gridSize()"
          ></div>
        }
        @if (currentGuides().length > 0) {
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
      .canvas-overlay-layer {
        position: absolute;
        inset: 0;
        z-index: 20;
        pointer-events: none;
      }

      .canvas-overlay-layer > app-block-renderer {
        pointer-events: auto;
      }
    `,

    /* ── TZ-237.MAGNETIC-GRID-r0: magnetic grid + alignment guides ── */
    `
      .canvas-builder__grid-layer {
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        background-image: radial-gradient(
          circle at 1px 1px,
          rgba(15, 23, 42, 0.18) 1px,
          transparent 0
        );
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
        .canvas-builder__guide { transition: none; }
      }
      @media print {
        .canvas-builder__grid-layer,
        .canvas-builder__guides-layer { display: none !important; }
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
  readonly blockWidthChange = output<{ block: TemplateBlock; width: number; marginLeft: number; imageWidth?: number; imageHeight?: number }>();
  /** Overlay move (X/Y position change via drag). */
  readonly overlayMove = output<{ block: TemplateBlock; overlayLeft: number; overlayTop: number }>();
  /** Overlay resize (corner handle proportional resize). */
  readonly overlayResize = output<{ block: TemplateBlock; imageWidth: number; imageHeight: number }>();
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
    const others: Rect[] = [];
    for (const b of blocks) {
      if (!this.isOverlayBlock(b)) continue;
      const r = overlayBlockToRect({
        blockId: blockKey(b),
        // `settings` on `TemplateBlock` is `Record<string, unknown> | undefined`;
        // the engine accepts `Readonly<Record<string, unknown>> | null` so the
        // contract lines up without `any` casts.
        settings: b.settings ?? null,
      });
      if (r) others.push(r);
    }      return collapseAlignmentGuides(computeAlignmentGuides(dragged, others));
    }

  /** Get only overlay blocks for absolute positioning. */
  protected readonly overlayBlocks = computed(() =>
    this.blocks().filter((b) => this.isOverlayBlock(b)),
  );

  /** Get only flow blocks (non-overlay) for the drop list. */
  protected readonly flowBlocks = computed(() =>
    this.blocks().filter((b) => !this.isOverlayBlock(b)),
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
    this.blockWidthChange.emit({ block, width: event.width, marginLeft: event.marginLeft, imageWidth: event.imageWidth, imageHeight: event.imageHeight });
  }

  protected onOverlayMove(event: { block: TemplateBlock; overlayLeft: number; overlayTop: number }): void {
    this.overlayMove.emit(event);
  }

  protected onOverlayResize(event: { block: TemplateBlock; imageWidth: number; imageHeight: number }): void {
    this.overlayResize.emit(event);
  }

  protected onCanvasClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.block-renderer')) {
      this.canvasClick.emit();
    }
  }

  protected onDrop(event: CdkDragDrop<TemplateBlock[]>): void {
    if (event.previousContainer === event.container) {
      if (event.previousIndex === event.currentIndex) return;
      const next = [...this.blocks()];
      moveItemInArray(next, event.previousIndex, event.currentIndex);
      this.reorder.emit(next);
    } else {
      const payload = event.item.data as AddBlockPayload | undefined;
      if (!payload) return;
      this.dropAdd.emit({ payload, insertIndex: event.currentIndex });
    }
  }
}
