import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'pi-studio-blocks-canvas',
  standalone: true,
  imports: [FormsModule, NgStyle],
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
            <article
              class="studio-block studio-block--text"
              [class.selected]="selectedId === block._id"
              [class.studio-block--editable]="selectedId === block._id && !block.locked"
              [class.studio-block--passive]="selectedId !== block._id || block.locked"
              [class.locked]="block.locked"
              [class.snapping]="snappingId === block._id"
              [style.left.%]="layout.x * 100"
              [style.top.%]="layout.y * 100"
              [style.width.%]="layout.width * 100"
              [style.height.%]="(layout.height ?? 0.12) * 100"
              [style.z-index]="layout.zIndex"
              [style.font-size.pt]="block.style?.fontSizePt ?? 14"
              [style.color]="block.style?.color ?? '#000'"
              [style.text-align]="block.style?.align ?? 'left'"
              [style.font-family]="block.style?.fontFamily ?? 'Times New Roman'"
              [style.line-height]="textLineHeight(block)"
              (click)="selectBlock($event, block)"
              (dblclick)="openTextBlock($event, block)"
              (pointerdown)="startDrag($event, block)"
            >
              <div class="studio-block__text-body" [innerHTML]="textHtml(block)"></div>
              @if (selectedId === block._id && !block.locked && !readOnly) {
                <span class="selection-frame" aria-hidden="true"></span>
                <button class="resize-handle" type="button" aria-label="Изменить размер" (pointerdown)="startResize($event, block)"></button>
              }
            </article>
          } @else if (block.type === 'image') {
            <article
              class="studio-block studio-block--image"
              [class.selected]="selectedId === block._id"
              [class.studio-block--editable]="selectedId === block._id && !block.locked"
              [class.studio-block--passive]="selectedId !== block._id || block.locked"
              [class.locked]="block.locked"
              [class.snapping]="snappingId === block._id"
              [style.left.%]="layout.x * 100"
              [style.top.%]="layout.y * 100"
              [style.width.%]="layout.width * 100"
              [style.height.%]="(layout.height ?? 0.28) * 100"
              [style.z-index]="layout.zIndex"
              (click)="selectBlock($event, block)"
              (pointerdown)="startDrag($event, block)"
            >
              @if (imageUrl(block); as url) {
                <img [src]="url" alt="" draggable="false" />
              } @else {
                <span class="image-placeholder">Фото</span>
              }
              @if (selectedId === block._id && !block.locked && !readOnly) {
                <span class="selection-frame" aria-hidden="true"></span>
                <button class="resize-handle" type="button" aria-label="Изменить размер" (pointerdown)="startResize($event, block)"></button>
              }
            </article>
          } @else if (block.type === 'table') {
            <article
              class="studio-block studio-block--table"
              [class.studio-block--table-transparent]="tableTransparent(block)"
              [class.selected]="selectedId === block._id"
              [class.studio-block--editable]="selectedId === block._id && !block.locked"
              [class.studio-block--passive]="selectedId !== block._id || block.locked"
              [class.locked]="block.locked"
              [class.snapping]="snappingId === block._id"
              [style.left.%]="layout.x * 100"
              [style.top.%]="layout.y * 100"
              [style.width.%]="layout.width * 100"
              [style.height.%]="(layout.height ?? 0.25) * 100"
              [style.z-index]="layout.zIndex"
              (click)="selectBlock($event, block)"
              (dblclick)="openTableBlock($event, block)"
              (pointerdown)="startDrag($event, block)"
            >
              <div class="table-preview">
                  <table>
                    <thead>
                      <tr>
                        @for (col of tableColumns(block); track col.key; let ci = $index) {
                          <th [style.text-align]="col.align" [style.width.%]="colWidthPct(block, ci)">{{ col.label }}</th>
                        }
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of tableRows(block); track $index) {
                        <tr>
                          @for (cell of row; track $index; let ci = $index) {
                            @if (isPhotoColumnAt(block, ci)) {
                              <td class="table-preview__photo-cell" [style.width.%]="colWidthPct(block, ci)">
                                <!-- TZ-NX-DOCSTUDIO-TABLE-PHOTO-EMPTY-BLANK: no photo / broken load = blank cell,
                                     no "Нет фото" text and no browser broken-image icon. Row height comes from
                                     the shared td padding (line 304), not from this cell's own content. -->
                                @if (cell && !isPhotoLoadFailed(cell)) {
                                  <img [src]="cell" alt="" class="table-preview__photo" [ngStyle]="photoCellStyle(block, cell)" (error)="onPhotoLoadError(cell)" />
                                }
                              </td>
                            } @else {
                              <td [style.width.%]="colWidthPct(block, ci)">{{ cell || ' ' }}</td>
                            }
                          }
                        </tr>
                      } @empty {
                        <!-- TZ-NX-DOCSTUDIO-S45: empty table = placeholder row, not a bare thead.
                             TZ-NX-DOCSTUDIO-TABLE-UNWIRED-EMPTY-STATE: text differs for a table with
                             no live source (points at Properties/Insert) vs. a wired one with no rows
                             yet (points at Selected/КП/order — Properties can't manually add live rows). -->
                        <tr class="table-preview__empty">
                          <td [attr.colspan]="tableColumns(block).length || 1">{{ tableEmptyStateLabel(block) }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              @if (selectedId === block._id && !block.locked && !readOnly) {
                <span class="selection-frame" aria-hidden="true"></span>
                <button class="resize-handle" type="button" aria-label="Изменить размер" (pointerdown)="startResize($event, block)"></button>
              }
            </article>
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
       showed a stretched/cropped passport while the PDF letterboxed it). */
    .studio-block--passport-bg.studio-block--image img {
      width:100%; height:100%; object-fit:contain; display:block; pointer-events:none;
    }
    .studio-block {
      position:absolute; box-sizing:border-box; min-width:4%; min-height:3%;
      padding:4px; border:1px solid transparent; overflow:hidden;
      pointer-events:auto; cursor:move; user-select:none;
    }
    .studio-block--text {
      white-space: normal;
      background: transparent;
      display: flex;
      flex-direction: column;
    }
    .studio-block__text-body {
      flex: 1;
      width: 100%;
      min-height: 0;
      overflow: hidden;
      pointer-events: none;
      line-height: 1.35;
    }
    .studio-block__text-body :where(p) {
      margin: 0;
    }
    /* TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP — matches the RTE dialog's own
       .substitution-token chip (pi-rich-text-editor.component.ts) so a
       token looks the same whether it is being edited or just viewed on
       the canvas. Editor-only: this component is never used for
       Просмотр/PDF (those render fully server-side, see
       studio-output.service.ts), so this styling can't leak into the
       printed form. */
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
    .studio-block--text.studio-block--editable.selected {
      background: transparent;
    }
    .studio-block--image {
      background: transparent;
      /* TZ-NX-DOCSTUDIO-IMAGE-PASSPORT-FIT-WYSIWYG — padding parity with the
         PDF's image box (no padding) and with the passport rule above
         (already padding:0): without this, .studio-block's generic 4px
         padding shrank a regular (non-passport) photo block's img on the
         canvas relative to the PDF, which renders the image edge-to-edge. */
      padding: 0;
    }
    .studio-block--table {
      background: #fff;
      border: 1px solid var(--color-rule);
      padding: 0;
    }
    .studio-block--table.studio-block--table-transparent {
      background: transparent;
      border-color: transparent;
    }
    .studio-block--table-transparent .table-preview th,
    .studio-block--table-transparent .table-preview td {
      background: transparent;
    }
    .table-preview {
      width: 100%; height: 100%; overflow: auto; pointer-events: none;
    }
    .studio-block--table-editing {
      cursor: default;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .table-preview__empty td {
      text-align: center;
      color: var(--color-muted-foreground);
      font-style: italic;
      background: var(--color-paper-2);
    }
    .studio-block--table { container-type: inline-size; }
    .table-preview table {
      /* TZ-NX-DOCSTUDIO-TABLE-COL-WIDTH-APPLY — fixed layout so th/td [style.width.%]
         actually determines column share instead of being overridden by content
         auto-sizing; matches renderStudioTableHtml's own inline table-layout:fixed. */
      width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 9px;
    }
    .table-preview th, .table-preview td {
      border: 1px solid var(--color-rule);
      padding: 2px 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .table-preview td {
      background: #fff;
    }
    .table-preview th {
      background: var(--color-paper-2);
      font-weight: 600;
      color: var(--color-muted-foreground);
    }
    .table-preview__photo-cell {
      text-align: center;
      white-space: normal;
    }
    .table-preview__photo {
      /* TZ-NX-PO-SWEEP-05 — object-fit/object-position/max-height come from
         [ngStyle]="photoCellStyle(...)" (per-photo РАМКА + block override),
         not a hardcoded contain/28px. */
      display: block;
      max-width: 100%;
      margin: 0 auto;
    }
    .studio-block--image img {
      width:100%; height:100%; object-fit:cover; display:block; pointer-events:none;
    }
    .image-placeholder {
      display:flex; align-items:center; justify-content:center;
      width:100%; height:100%; font-size:12px; color:#666;
    }
    .studio-block.selected { border-color:#1c7c54; }
    .studio-block--passive {
      cursor: pointer;
      border-color: transparent;
    }
    .studio-block--passive:hover {
      outline: 1px dashed color-mix(in oklch, var(--color-gold) 55%, transparent);
      outline-offset: 1px;
    }
    .studio-block.snapping .selection-frame { border-color:#c9a227; }
    .studio-block.locked { cursor:not-allowed; opacity:.65; }
    .selection-frame {
      position:absolute; inset:-3px; pointer-events:none;
      border:2px solid #1c7c54; box-shadow:0 0 0 1px rgba(28,124,84,.25);
    }
    .resize-handle {
      position:absolute; right:-5px; bottom:-5px; width:12px; height:12px;
      padding:0; border:2px solid #1c7c54; background:#fff; cursor:nwse-resize;
      pointer-events:auto; z-index:1;
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
   * TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG — last-resort client fallback:
   * the backend already drops a verified-missing file to `''` (S48/S-SMOKE),
   * but a URL that was valid when resolved can still fail to load (upload
   * mid-flight, dev-server restart) with no further re-render to catch it.
   * Once a URL 404s here it stays blank for this component instance —
   * matches the empty-cell state exactly, never a raw broken-image icon.
   */
  private readonly failedPhotoUrls = signal<ReadonlySet<string>>(new Set());

  isPhotoLoadFailed(url: string): boolean {
    return this.failedPhotoUrls().has(url);
  }

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
