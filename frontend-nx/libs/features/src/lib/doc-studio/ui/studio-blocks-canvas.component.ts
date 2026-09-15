import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import type { StudioBlock, StudioBlockLayout } from '@kppdf/data-access';
import { normalizePhotoFrame, photoFrameStyle, type PiPhotoFrame } from '@kppdf/ui/photo';
import {
  studioBlockIsEditable,
  studioCanvasBackgroundBlocks,
  studioCanvasForegroundBlocks,
  studioImageUrl,
  studioTextDisplayHtml,
  columnWidthPercents,
  isStudioPhotoColumnKey,
  studioTableDisabledRowIndices,
  studioTableEmptyStateLabel,
  studioTablePhotoDisplay,
  studioTableTransparentBackground,
  studioVisibleColumnIndices,
  studioVisibleTableColumns,
  studioVisibleTableRows,
  clampStudioLayoutPosition,
  normalizeStudioBlockLayout,
  snapStudioLayoutToPageEdges,
  studioImageResizeAspectRatio,
  studioProportionalImageResize,
} from '@kppdf/features/doc-studio';
import { StudioTextBlockPresenterComponent } from './studio-text-block-presenter.component';
import { StudioImageBlockPresenterComponent } from './studio-image-block-presenter.component';
import { StudioTableBlockPresenterComponent, type StudioTableColumnMeta } from './studio-table-block-presenter.component';

@Component({
  selector: 'pi-studio-blocks-canvas',
  standalone: true,
  imports: [StudioTextBlockPresenterComponent, StudioImageBlockPresenterComponent, StudioTableBlockPresenterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'studio-blocks-canvas',
    '[class.studio-canvas--readonly]': 'readOnly',
  },
  template: `
    <div class="studio-passport-bg" aria-hidden="true">
      @for (block of backgroundBlocks(); track block._id) {
        @if (block.layout; as layout) {
          @if (block.type === 'image') {
            <article
              class="studio-block studio-block--image studio-block--passport-bg"
              [style.left.%]="layout.x * 100"
              [style.top.%]="layout.y * 100"
              [style.width.%]="layout.width * 100"
              [style.height.%]="(layout.height ?? 1) * 100"
            >
              @if (imageUrl(block); as url) {
                <img [src]="url" alt="" draggable="false" />
              }
            </article>
          }
        }
      }
    </div>
    @for (block of foregroundBlocks(); track block._id) {
      @if (block.layout; as layout) {
        @if (block.type === 'text') {
          <pi-studio-text-block-presenter
            [block]="block"
            [layout]="layout"
            [selected]="selectedId === block._id"
            [snapping]="snappingId === block._id"
            [readOnly]="readOnly"
            [textHtml]="textHtml(block)"
            [lineHeight]="textLineHeight(block)"
            (select)="selectBlock($event, block)"
            (openText)="openTextBlock($event, block)"
            (dragStart)="startDrag($event, block)"
            (resizeStart)="startResize($event, block)"
          />
        } @else if (block.type === 'image') {
          <pi-studio-image-block-presenter
            [block]="block"
            [layout]="layout"
            [selected]="selectedId === block._id"
            [snapping]="snappingId === block._id"
            [readOnly]="readOnly"
            [imageUrl]="imageUrl(block)"
            (select)="selectBlock($event, block)"
            (dragStart)="startDrag($event, block)"
            (resizeStart)="startResize($event, block)"
          />
        } @else if (block.type === 'table') {
          <pi-studio-table-block-presenter
            [block]="block"
            [layout]="layout"
            [selected]="selectedId === block._id"
            [snapping]="snappingId === block._id"
            [readOnly]="readOnly"
            [transparent]="tableTransparent(block)"
            [columnMeta]="columnMetaFor(block)"
            [rows]="tableRows(block)"
            [emptyStateLabel]="tableEmptyStateLabel(block)"
            [photoCellStyles]="photoCellStylesFor(block)"
            [isPhotoLoadFailed]="isPhotoLoadFailed"
            (select)="selectBlock($event, block)"
            (openTable)="openTableBlock($event, block)"
            (dragStart)="startDrag($event, block)"
            (resizeStart)="startResize($event, block)"
            (photoLoadError)="onPhotoLoadError($event)"
          />
        }
      }
    }
  `,
  styles: [`
    :host { position:absolute; inset:0; pointer-events:none; z-index:1; }
    :host.studio-canvas--readonly { pointer-events: none; }
    .studio-passport-bg {
      position:absolute; inset:0; z-index:0; pointer-events:none; overflow:hidden;
    }
    .studio-block--passport-bg {
      pointer-events:none; cursor:default; padding:0; border:none; z-index:0;
    }
    /* TZ-NX-DOCSTUDIO-IMAGE-PASSPORT-FIT-WYSIWYG — compound selector (not
       just .studio-block--passport-bg img) so this always outranks
       .studio-block--image img below regardless of source order: the
       passport block carries BOTH classes, and two single-class selectors
       at equal specificity previously let source order silently flip which
       object-fit won (passport-bg's contain was defined first, so the
       later .studio-block--image img's cover always overrode it — canvas
       showed a stretched/cropped passport while the PDF letterboxed it).
       This rule only ever matches the background compositing loop above
       (kept inline on the host, never extracted into a presenter), so it
       stays here unscoped-safe. */
    .studio-block--passport-bg.studio-block--image img {
      width:100%; height:100%; object-fit:contain; display:block; pointer-events:none;
    }
    /* TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP — matches the RTE dialog's own
       .substitution-token chip (pi-rich-text-editor.component.ts) so a
       token looks the same whether it is being edited or just viewed on
       the canvas. Editor-only: this component is never used for
       Просмотр/PDF (those render fully server-side, see
       studio-output.service.ts), so this styling can't leak into the
       printed form. ::ng-deep deliberately un-scopes past :host so this
       still reaches .studio-block__text-body inside
       StudioTextBlockPresenterComponent's own template (Phase 5 split) —
       verified: :host ::ng-deep scopes only the :host anchor, not what
       follows it. */
    :host ::ng-deep .studio-block__text-body .substitution-token {
      display: inline-block;
      padding: 1px 6px;
      /* TZ-NX-DOCSTUDIO-S45: guaranteed gap token↔next text (no double spaces). */
      margin: 0 4px 0 1px;
      font-family: ui-monospace, monospace;
      font-size: 0.85em;
      font-weight: 600;
      color: oklch(var(--color-info));
      background: oklch(var(--color-paper-2));
      border: 1px solid oklch(var(--color-rule));
      border-radius: 2px;
    }
    /* TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON — «Значения» mode's unresolved token:
       deliberately NOT the solid «Токены»-mode chip above (dashed + muted
       instead of solid + info-color) so the two modes look different even
       when nothing in the bag resolves yet. */
    :host ::ng-deep .studio-block__text-body .substitution-token--unresolved {
      color: var(--color-muted-foreground);
      background: transparent;
      border-style: dashed;
      font-weight: 500;
    }
  `],
})
export class StudioBlocksCanvasComponent {
  private readonly sanitizer = inject(DomSanitizer);

  @Input() blocks: readonly StudioBlock[] = [];
  @Input() selectedId: string | null = null;
  @Input() activeLayerId: string | null = null;
  @Input() currentPage = 1;
  @Input() sheetWidth = 800;
  @Input() sheetHeight = 900;
  /** Read-only compositing (preview / print check) — no drag, resize, or table edit. */
  @Input() readOnly = false;
  /**
   * TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP — session-level (not per-block, not
   * persisted) display mode for `{{token}}` substitutions on the canvas.
   */
  @Input() tokenDisplayMode: 'tokens' | 'values' = 'tokens';
  /** Flat bag consulted only in `values` mode — see `resolveStudioTokenValue`. */
  @Input() substitutionBag: Record<string, unknown> = {};
  @Output() selected = new EventEmitter<string>();
  @Output() layoutChanged = new EventEmitter<{ id: string; layout: StudioBlockLayout }>();
  @Output() layoutCommit = new EventEmitter<void>();
  @Output() contentChanged = new EventEmitter<{ id: string; content: string }>();
  @Output() textDoubleClick = new EventEmitter<string>();
  /**
   * Canvas never edits rows; emit so the host can open Свойства.
   * TZ-NX-PO-SWEEP-02: fired on dblclick / rail action only — single click
   * just selects (S45's auto-open on click was reverted per PO-CANON).
   */
  @Output() tableEditRequest = new EventEmitter<string>();

  snappingId: string | null = null;
  private suppressNextClick = false;

  protected readonly imageUrl = studioImageUrl;

  backgroundBlocks(): readonly StudioBlock[] {
    return studioCanvasBackgroundBlocks(this.blocks, this.activeLayerId, this.currentPage);
  }

  foregroundBlocks(): readonly StudioBlock[] {
    return studioCanvasForegroundBlocks(this.blocks, this.activeLayerId, this.currentPage);
  }

  isEditable(block: StudioBlock): boolean {
    return studioBlockIsEditable(block, this.activeLayerId);
  }

  /**
   * TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT (Phase 5) — kept as a directly-callable
   * host method (not folded into the table presenter) because
   * `studio-blocks-canvas.component.spec.ts` calls `component.tableColumns(...)`
   * directly. The host's own template no longer calls this for rendering
   * (see `columnMetaFor`), but external callers (tests) still can.
   */
  tableColumns(block: StudioBlock) {
    return studioVisibleTableColumns(block);
  }

  /** TZ-NX-DOCSTUDIO-S48 — is the visible column at this cell index a photo column? */
  isPhotoColumnAt(block: StudioBlock, columnIndex: number): boolean {
    const column = this.tableColumns(block)[columnIndex];
    return column ? isStudioPhotoColumnKey(column.key) : false;
  }

  /**
   * TZ-NX-DOCSTUDIO-TABLE-COL-WIDTH-APPLY — `col.width` share, as a % of the
   * table, for the visible column at this index. Mirrors backend
   * `columnWidthPercents` (studio-data-resolver.ts) so canvas and PDF/preview
   * agree on layout.
   */
  colWidthPct(block: StudioBlock, columnIndex: number): number {
    return columnWidthPercents(this.tableColumns(block))[columnIndex] ?? 0;
  }

  /**
   * TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT (Phase 5) — precomputed per-column
   * metadata for `StudioTableBlockPresenterComponent`, combining
   * `tableColumns`/`colWidthPct`/`isPhotoColumnAt` (all unchanged) into one
   * array so the presenter needs no function-typed Inputs for column data.
   */
  columnMetaFor(block: StudioBlock): StudioTableColumnMeta[] {
    return this.tableColumns(block).map((col, i) => ({
      col,
      widthPct: this.colWidthPct(block, i),
      isPhoto: this.isPhotoColumnAt(block, i),
    }));
  }

  /**
   * TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG — last-resort client fallback:
   * the backend already drops a verified-missing file to `''` (S48/S-SMOKE),
   * but a URL that was valid when resolved can still fail to load (upload
   * mid-flight, dev-server restart) with no further re-render to catch it.
   * Once a URL 404s here it stays blank for this component instance —
   * matches the empty-cell state exactly, never a raw broken-image icon.
   */
  private readonly failedPhotoUrls = signal<ReadonlySet<string>>(new Set());

  /**
   * TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT (Phase 5) — arrow-function field (not a
   * regular method) so it stays correctly `this`-bound when passed as a
   * plain function reference into `StudioTableBlockPresenterComponent`'s
   * `[isPhotoLoadFailed]` Input; every table block shares this same
   * canvas-wide `failedPhotoUrls` set, same as before the split.
   */
  readonly isPhotoLoadFailed = (url: string): boolean => this.failedPhotoUrls().has(url);

  onPhotoLoadError(url: string): void {
    if (this.failedPhotoUrls().has(url)) return;
    this.failedPhotoUrls.update((prev) => new Set(prev).add(url));
  }

  /**
   * TZ-NX-PO-SWEEP-05 — cell photo style: fit/position come from the
   * catalog photo's own РАМКА (`Photo.frame`, resolved server-side into
   * `block.settings.livePhotoFrames` keyed by URL), the block's «Фото в
   * ячейке» setting can override `fit` only (pan/crop stay catalog-owned),
   * and `maxHeightPx` bounds the thumbnail regardless of frame.
   */
  photoCellStyle(block: StudioBlock, url: string): Record<string, string> {
    const display = studioTablePhotoDisplay(block);
    const frames = (block.settings?.['livePhotoFrames'] as
      | Record<string, Partial<PiPhotoFrame>>
      | undefined) ?? {};
    const frame = normalizePhotoFrame(frames[url]);
    const fit = display.fit ?? frame.fit;
    return {
      ...photoFrameStyle({ ...frame, fit }),
      'max-height': `${display.maxHeightPx}px`,
    };
  }

  /**
   * TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT (Phase 5) — every distinct photo URL
   * across this table's rows, pre-resolved to its style via the unchanged
   * `photoCellStyle`, so the presenter needs no function-typed Input for
   * per-cell styling.
   */
  photoCellStylesFor(block: StudioBlock): ReadonlyMap<string, Record<string, string>> {
    const urls = new Set<string>();
    const rows = this.tableRows(block);
    for (const row of rows) {
      for (let ci = 0; ci < row.length; ci++) {
        if (row[ci] && this.isPhotoColumnAt(block, ci)) urls.add(row[ci]!);
      }
    }
    const map = new Map<string, Record<string, string>>();
    for (const url of urls) map.set(url, this.photoCellStyle(block, url));
    return map;
  }

  tableRows(block: StudioBlock): string[][] {
    const liveRows = block.settings?.['liveRows'];
    if (Array.isArray(liveRows)) {
      const rows = liveRows.filter((row): row is string[] => Array.isArray(row)).map((row) => row.map((cell) => String(cell ?? '')));
      // TZ-NX-DOCSTUDIO-S47 (BUG-5) — liveRows bypassed hidden-column filtering; align with manual rows.
      const visibleColIdx = studioVisibleColumnIndices(block);
      return rows.map((row) => visibleColIdx.map((colIdx) => row[colIdx] ?? ''));
    }
    return studioVisibleTableRows(block);
  }

  tableEmptyStateLabel(block: StudioBlock): string {
    return studioTableEmptyStateLabel(block);
  }

  isTableRowEnabled(block: StudioBlock, rowIdx: number): boolean {
    return !studioTableDisabledRowIndices(block).includes(rowIdx);
  }

  tableTransparent(block: StudioBlock): boolean {
    return studioTableTransparentBackground(block);
  }

  textLineHeight(block: StudioBlock): string | null {
    const lh = block.style?.lineHeight;
    if (lh == null || !Number.isFinite(lh)) return null;
    return String(lh);
  }

  /**
   * TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP — was raw `bypassSecurityTrustHtml`
   * with no token handling at all: a plain-text `{{organization.shortName}}`
   * rendered as ordinary black text (S44's `.substitution-token` CSS below
   * had nothing to attach to, since nothing ever emitted that class here —
   * the RTE dialog already did via its own `migratePlainTokensToNodes` call,
   * this canvas view never did). Now chips by default; substitutes to plain
   * ink in «Значения» mode (`studioTextDisplayHtml`) — display-only, never
   * writes back to `block.content`.
   */
  textHtml(block: StudioBlock): SafeHtml {
    const raw = block.content?.trim() || block.title?.trim() || 'Текст';
    const html = studioTextDisplayHtml(raw, this.tokenDisplayMode, this.substitutionBag);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  openTextBlock(event: MouseEvent, block: StudioBlock): void {
    if (this.readOnly || block.type !== 'text' || block.locked) return;
    event.stopPropagation();
    this.selected.emit(block._id);
    this.textDoubleClick.emit(block._id);
  }

  selectBlock(event: MouseEvent, block: StudioBlock): void {
    if (this.readOnly) return;
    event.stopPropagation();
    if (this.suppressNextClick) {
      this.suppressNextClick = false;
      return;
    }
    // PO-CANON / TZ-NX-PO-SWEEP-02: single click = select + resize only, never
    // auto-opens Свойства (was S45 behaviour — panel used to cover the SE handle).
    this.selected.emit(block._id);
  }

  openTableBlock(event: MouseEvent, block: StudioBlock): void {
    if (this.readOnly || block.type !== 'table' || block.locked) return;
    event.stopPropagation();
    this.selected.emit(block._id);
    this.tableEditRequest.emit(block._id);
  }

  startDrag(event: PointerEvent, block: StudioBlock): void {
    if (this.readOnly) return;
    if (event.button !== 0 || !block.layout || block.locked) return;
    const target = event.target as HTMLElement;
    if (target.closest('input, button, textarea, select, .table-edit, .cell-input')) return;
    if (block._id !== this.selectedId) {
      this.selected.emit(block._id);
    }
    event.stopPropagation();
    event.preventDefault();
    const dragTarget = event.currentTarget as HTMLElement;
    dragTarget.setPointerCapture(event.pointerId);
    const parent = dragTarget.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const height = block.layout.height ?? (block.type === 'image' ? 0.28 : block.type === 'table' ? 0.25 : 0.12);
    const start = { x: event.clientX, y: event.clientY, layout: block.layout };
    let moved = false;
    const move = (e: PointerEvent) => {
      if (Math.abs(e.clientX - start.x) > 3 || Math.abs(e.clientY - start.y) > 3) {
        moved = true;
      }
      const dx = (e.clientX - start.x) / rect.width;
      const dy = (e.clientY - start.y) / rect.height;
      const raw = clampStudioLayoutPosition(
        start.layout.x + dx,
        start.layout.y + dy,
        start.layout.width,
        height,
      );
      const snapped = snapStudioLayoutToPageEdges(
        raw.x,
        raw.y,
        start.layout.width,
        height,
        this.sheetWidth,
        this.sheetHeight,
      );
      this.snappingId = snapped.x !== raw.x || snapped.y !== raw.y ? block._id : null;
      this.layoutChanged.emit({
        id: block._id,
        layout: normalizeStudioBlockLayout({ ...start.layout, x: snapped.x, y: snapped.y }),
      });
    };
    const end = () => {
      this.snappingId = null;
      if (moved) {
        this.suppressNextClick = true;
        this.layoutCommit.emit();
      }
      dragTarget.releasePointerCapture(event.pointerId);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end, { once: true });
    window.addEventListener('pointercancel', end, { once: true });
  }

  startResize(event: PointerEvent, block: StudioBlock): void {
    if (this.readOnly) return;
    if (event.button !== 0 || !block.layout || block.locked) return;
    event.stopPropagation();
    event.preventDefault();
    const handle = event.currentTarget as HTMLElement;
    handle.setPointerCapture(event.pointerId);
    const parent = handle.closest('.studio-block')?.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const defaultHeight = block.type === 'image' ? 0.28 : block.type === 'table' ? 0.25 : 0.12;
    const startHeight = block.layout.height ?? defaultHeight;
    const start = { x: event.clientX, y: event.clientY, layout: block.layout };
    const imageAspect =
      block.type === 'image' ? studioImageResizeAspectRatio(block.layout, defaultHeight) : null;
    let moved = false;
    const move = (e: PointerEvent) => {
      if (Math.abs(e.clientX - start.x) > 3 || Math.abs(e.clientY - start.y) > 3) {
        moved = true;
      }
      const dw = (e.clientX - start.x) / rect.width;
      let width: number;
      let height: number;
      if (block.type === 'image' && imageAspect != null) {
        ({ width, height } = studioProportionalImageResize(start.layout, dw, imageAspect));
      } else {
        const dh = (e.clientY - start.y) / rect.height;
        width = Math.max(0.06, Math.min(1 - start.layout.x, start.layout.width + dw));
        height = Math.max(0.04, Math.min(1 - start.layout.y, startHeight + dh));
      }
      const rightGap = 1 - (start.layout.x + width);
      const bottomGap = 1 - (start.layout.y + height);
      const tx = 8 / Math.max(1, this.sheetWidth);
      const ty = 8 / Math.max(1, this.sheetHeight);
      if (block.type === 'image' && imageAspect != null) {
        if (Math.abs(rightGap) <= tx) {
          width = 1 - start.layout.x;
          height = width * imageAspect;
        }
        if (start.layout.y + height > 1 - ty) {
          height = 1 - start.layout.y;
          width = Math.min(1 - start.layout.x, height / imageAspect);
          height = width * imageAspect;
        }
      } else {
        if (Math.abs(rightGap) <= tx) width = 1 - start.layout.x;
        if (Math.abs(bottomGap) <= ty) height = 1 - start.layout.y;
      }
      this.layoutChanged.emit({
        id: block._id,
        layout: normalizeStudioBlockLayout({ ...start.layout, width, height }),
      });
    };
    const end = () => {
      if (moved) this.layoutCommit.emit();
      handle.releasePointerCapture(event.pointerId);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end, { once: true });
    window.addEventListener('pointercancel', end, { once: true });
  }
}
