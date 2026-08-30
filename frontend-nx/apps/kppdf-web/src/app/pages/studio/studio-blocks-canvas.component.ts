import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import type { StudioBlock, StudioBlockLayout } from '@kppdf/data-access';
import {
  studioBlockIsEditable,
  studioCanvasBackgroundBlocks,
  studioCanvasForegroundBlocks,
  studioImageUrl,
} from './studio-block-helpers';
import {
  studioTableColumns,
  studioTableDisabledRowIndices,
  studioTableRows,
  studioTableTransparentBackground,
  studioVisibleColumnIndices,
  studioVisibleTableColumns,
  studioVisibleTableRows,
} from './studio-table-defaults';
import {
  clampStudioLayoutPosition,
  normalizeStudioBlockLayout,
  snapStudioLayoutToPageEdges,
  studioImageResizeAspectRatio,
  studioProportionalImageResize,
} from './studio-layout';

@Component({
  selector: 'pi-studio-blocks-canvas',
  standalone: true,
  imports: [FormsModule],
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
              [class.studio-block--table-editing]="selectedId === block._id && !block.locked && !readOnly"
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
              (pointerdown)="startDrag($event, block)"
            >
              @if (selectedId === block._id && !block.locked && !readOnly) {
                <div
                  class="table-edit"
                  data-test="studio-table-rows-editor"
                  (pointerdown)="$event.stopPropagation()"
                  (click)="$event.stopPropagation()"
                >
                  <div class="table-edit__scroll">
                    <table>
                      <thead>
                        <tr>
                          <th class="col-enable" title="Включить строку">Вкл</th>
                          @for (col of tableColumns(block); track col.key) {
                            <th [style.text-align]="col.align">{{ col.label }}</th>
                          }
                          <th class="col-actions" aria-hidden="true"></th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (row of tableRowsAll(block); track $index; let rowIdx = $index) {
                          <tr [class.row-disabled]="!isTableRowEnabled(block, rowIdx)">
                            <td class="col-enable">
                              <input
                                type="checkbox"
                                [checked]="isTableRowEnabled(block, rowIdx)"
                                (change)="toggleTableRow(block, rowIdx, $event)"
                                [attr.data-test]="'studio-table-row-toggle-' + rowIdx"
                              />
                            </td>
                            @for (colIdx of visibleColumnIndices(block); track colIdx) {
                              <td>
                                <input
                                  type="text"
                                  class="cell-input"
                                  [ngModel]="row[colIdx] ?? ''"
                                  (ngModelChange)="onTableCell(block, rowIdx, colIdx, $event)"
                                  [disabled]="!isTableRowEnabled(block, rowIdx)"
                                  [attr.data-test]="'studio-table-cell-' + rowIdx + '-' + colIdx"
                                />
                              </td>
                            }
                            <td class="col-actions">
                              <button
                                type="button"
                                class="row-remove pi-focus-ring"
                                aria-label="Удалить строку"
                                [disabled]="tableRowsAll(block).length <= 1"
                                (click)="removeTableRow(block, rowIdx)"
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    class="table-edit__add pi-focus-ring"
                    data-test="studio-table-add-row"
                    (click)="addTableRow(block)"
                  >
                    + Строка
                  </button>
                </div>
              } @else {
                <div class="table-preview">
                  <table>
                    <thead>
                      <tr>
                        @for (col of tableColumns(block); track col.key) {
                          <th [style.text-align]="col.align">{{ col.label }}</th>
                        }
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of tableRows(block); track $index) {
                        <tr>
                          @for (cell of row; track $index) {
                            <td>{{ cell || ' ' }}</td>
                          }
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
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
    .studio-block--passport-bg img {
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
    .studio-block--text.studio-block--editable.selected {
      background: transparent;
    }
    .studio-block--image {
      background: transparent;
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
    .table-edit {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      width: 100%;
      pointer-events: auto;
    }
    .table-edit__scroll {
      flex: 1;
      min-height: 0;
      overflow: auto;
    }
    .table-edit table {
      width: 100%;
      border-collapse: collapse;
      font-size: clamp(7px, 1.1cqw, 11px);
    }
    .table-edit th, .table-edit td {
      border: 1px solid var(--color-rule);
      padding: 0;
      vertical-align: middle;
    }
    .table-edit th {
      padding: 2px 4px;
      font-weight: 600;
      background: var(--color-paper-2);
      color: var(--color-muted-foreground);
      white-space: nowrap;
    }
    .table-edit .col-enable { width: 22px; text-align: center; padding: 2px; }
    .table-edit .col-actions { width: 20px; text-align: center; }
    .table-edit .row-disabled .cell-input { opacity: 0.45; }
    .table-edit .cell-input {
      width: 100%;
      min-width: 0;
      border: none;
      padding: 2px 4px;
      font-size: inherit;
      background: transparent;
      color: var(--color-ink);
      box-sizing: border-box;
    }
    .table-edit .cell-input:focus {
      outline: 2px solid var(--color-gold);
      outline-offset: -2px;
      background: #fff;
    }
    .table-edit .row-remove {
      width: 18px; height: 18px; padding: 0; border: none; background: transparent;
      color: var(--color-destructive); cursor: pointer; font-size: 14px; line-height: 1;
    }
    .table-edit__add {
      flex-shrink: 0;
      margin-top: 2px;
      padding: 2px 6px;
      border: 1px solid var(--color-rule-strong);
      border-radius: var(--radius-sm);
      background: var(--color-paper-2);
      font-size: clamp(7px, 1cqw, 10px);
      cursor: pointer;
      align-self: flex-start;
    }
    .table-edit__add:hover { background: var(--color-paper-3); }
    .studio-block--table { container-type: inline-size; }
    .table-preview table {
      width: 100%; border-collapse: collapse; font-size: 9px;
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
  @Output() selected = new EventEmitter<string>();
  @Output() layoutChanged = new EventEmitter<{ id: string; layout: StudioBlockLayout }>();
  /** Fired after drag/resize ends so the editor can persist layout immediately. */
  @Output() layoutCommit = new EventEmitter<void>();
  @Output() contentChanged = new EventEmitter<{ id: string; content: string }>();
  @Output() tableRowsChange = new EventEmitter<string[][]>();
  @Output() tableDisabledRowsChange = new EventEmitter<number[]>();

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

  tableRows(block: StudioBlock): string[][] {
    return studioVisibleTableRows(block);
  }

  tableRowsAll(block: StudioBlock): string[][] {
    return studioTableRows(block);
  }

  visibleColumnIndices(block: StudioBlock): number[] {
    return studioVisibleColumnIndices(block);
  }

  isTableRowEnabled(block: StudioBlock, rowIdx: number): boolean {
    return !studioTableDisabledRowIndices(block).includes(rowIdx);
  }

  onTableCell(block: StudioBlock, rowIdx: number, colIdx: number, value: string): void {
    if (block._id !== this.selectedId) return;
    const rows = studioTableRows(block);
    const next = rows.map((r, ri) =>
      ri === rowIdx ? r.map((c, ci) => (ci === colIdx ? value : c)) : [...r],
    );
    this.tableRowsChange.emit(next);
  }

  toggleTableRow(block: StudioBlock, rowIdx: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const disabled = new Set(studioTableDisabledRowIndices(block));
    if (checked) {
      disabled.delete(rowIdx);
    } else {
      disabled.add(rowIdx);
    }
    this.tableDisabledRowsChange.emit([...disabled].sort((a, b) => a - b));
  }

  addTableRow(block: StudioBlock): void {
    const colCount = studioTableColumns(block).length;
    this.tableRowsChange.emit([...studioTableRows(block), Array(colCount).fill('')]);
  }

  removeTableRow(block: StudioBlock, rowIdx: number): void {
    const rows = studioTableRows(block);
    if (rows.length <= 1) return;
    const disabled = studioTableDisabledRowIndices(block)
      .filter((i) => i !== rowIdx)
      .map((i) => (i > rowIdx ? i - 1 : i));
    this.tableDisabledRowsChange.emit(disabled);
    this.tableRowsChange.emit(rows.filter((_, i) => i !== rowIdx));
  }

  tableTransparent(block: StudioBlock): boolean {
    return studioTableTransparentBackground(block);
  }

  textLineHeight(block: StudioBlock): string | null {
    const lh = block.style?.lineHeight;
    if (lh == null || !Number.isFinite(lh)) return null;
    return String(lh);
  }

  textHtml(block: StudioBlock): SafeHtml {
    const raw = block.content?.trim() || block.title?.trim() || 'Текст';
    return this.sanitizer.bypassSecurityTrustHtml(raw);
  }

  selectBlock(event: MouseEvent, block: StudioBlock): void {
    if (this.readOnly) return;
    event.stopPropagation();
    if (this.suppressNextClick) {
      this.suppressNextClick = false;
      return;
    }
    this.selected.emit(block._id);
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
