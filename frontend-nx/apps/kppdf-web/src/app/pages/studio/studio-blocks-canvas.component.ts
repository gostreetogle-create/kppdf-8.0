import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import type { StudioBlock, StudioBlockLayout } from '@kppdf/data-access';
import { studioCanvasBlocks, studioImageUrl } from './studio-block-helpers';
import { studioTableColumns, studioTableRows } from './studio-table-defaults';
import {
  clampStudioLayoutPosition,
  normalizeStudioBlockLayout,
  snapStudioLayoutToPageEdges,
} from './studio-layout';

@Component({
  selector: 'pi-studio-blocks-canvas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (block of visibleBlocks(); track block._id) {
      @if (block.layout; as layout) {
          @if (block.type === 'text') {
            <article
              class="studio-block studio-block--text"
              [class.selected]="selectedId === block._id"
              [class.locked]="block.locked"
              [class.snapping]="snappingId === block._id"
              [style.left.%]="layout.x * 100"
              [style.top.%]="layout.y * 100"
              [style.width.%]="layout.width * 100"
              [style.height.%]="(layout.height ?? 0.12) * 100"
              [style.z-index]="layout.zIndex"
              (click)="selectBlock($event, block)"
              (dblclick)="startTextEdit($event, block)"
              (pointerdown)="startDrag($event, block)"
            >
              @if (editingId === block._id) {
                <textarea
                  class="text-edit"
                  [value]="block.content || ''"
                  (blur)="commitTextEdit(block, $event)"
                  (keydown.escape)="cancelTextEdit($event)"
                  (click)="$event.stopPropagation()"
                  (pointerdown)="$event.stopPropagation()"
                  autofocus
                ></textarea>
              } @else {
                <span
                  [style.font-size]="(block.style?.fontSizePt ?? 14) + 'pt'"
                  [style.color]="block.style?.color ?? '#000'"
                  [style.text-align]="block.style?.align ?? 'left'"
                >{{ block.content || block.title || 'Текст' }}</span>
              }
              @if (selectedId === block._id && !block.locked) {
                <span class="selection-frame" aria-hidden="true"></span>
                <button class="resize-handle" type="button" aria-label="Изменить размер" (pointerdown)="startResize($event, block)"></button>
              }
            </article>
          } @else if (block.type === 'image') {
            <article
              class="studio-block studio-block--image"
              [class.selected]="selectedId === block._id"
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
              @if (selectedId === block._id && !block.locked) {
                <span class="selection-frame" aria-hidden="true"></span>
                <button class="resize-handle" type="button" aria-label="Изменить размер" (pointerdown)="startResize($event, block)"></button>
              }
            </article>
          } @else if (block.type === 'table') {
            <article
              class="studio-block studio-block--table"
              [class.selected]="selectedId === block._id"
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
              @if (selectedId === block._id && !block.locked) {
                <span class="selection-frame" aria-hidden="true"></span>
                <button class="resize-handle" type="button" aria-label="Изменить размер" (pointerdown)="startResize($event, block)"></button>
              }
            </article>
          }
      }
    }
  `,
  styles: [`
    :host { position:absolute; inset:0; pointer-events:none; }
    .studio-block {
      position:absolute; box-sizing:border-box; min-width:4%; min-height:3%;
      padding:4px; border:1px solid transparent; overflow:hidden;
      pointer-events:auto; cursor:move; user-select:none;
    }
    .studio-block--text {
      white-space:pre-wrap; background:rgba(255,255,255,.85);
    }
    .studio-block--image {
      background:rgba(255,255,255,.6);
    }
    .studio-block--table {
      background: #fff;
      border: 1px solid var(--color-rule);
      padding: 0;
    }
    .table-preview {
      width: 100%; height: 100%; overflow: auto; pointer-events: none;
    }
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
    .table-preview th {
      background: var(--color-paper-2);
      font-weight: 600;
      color: var(--color-muted-foreground);
    }
    .text-edit {
      width: 100%; height: 100%; min-height: 2em;
      border: none; resize: none; background: rgba(255,255,255,.95);
      font: inherit; color: inherit; text-align: inherit;
      padding: 2px; box-sizing: border-box; pointer-events: auto;
    }
    .text-edit:focus { outline: 2px solid #1c7c54; }
    .studio-block--image img {
      width:100%; height:100%; object-fit:contain; display:block; pointer-events:none;
    }
    .image-placeholder {
      display:flex; align-items:center; justify-content:center;
      width:100%; height:100%; font-size:12px; color:#666;
    }
    .studio-block.selected { border-color:#1c7c54; }
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
  @Input() blocks: readonly StudioBlock[] = [];
  @Input() selectedId: string | null = null;
  @Input() activeLayerId: string | null = null;
  @Input() currentPage = 1;
  @Input() sheetWidth = 800;
  @Input() sheetHeight = 900;
  @Output() selected = new EventEmitter<string>();
  @Output() layoutChanged = new EventEmitter<{ id: string; layout: StudioBlockLayout }>();
  @Output() contentChanged = new EventEmitter<{ id: string; content: string }>();

  snappingId: string | null = null;
  editingId: string | null = null;

  protected readonly imageUrl = studioImageUrl;

  visibleBlocks(): readonly StudioBlock[] {
    return studioCanvasBlocks(this.blocks, this.activeLayerId, this.currentPage);
  }

  tableColumns(block: StudioBlock) {
    return studioTableColumns(block);
  }

  tableRows(block: StudioBlock): string[][] {
    return studioTableRows(block);
  }

  selectBlock(event: MouseEvent, block: StudioBlock): void {
    event.stopPropagation();
    this.selected.emit(block._id);
  }

  startDrag(event: PointerEvent, block: StudioBlock): void {
    if (this.editingId === block._id) return;
    if (event.button !== 0 || block.locked || !block.layout) return;
    event.stopPropagation();
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    const parent = target.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const height = block.layout.height ?? (block.type === 'image' ? 0.28 : 0.12);
    const start = { x: event.clientX, y: event.clientY, layout: block.layout };
    const move = (e: PointerEvent) => {
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
      target.releasePointerCapture(event.pointerId);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end, { once: true });
    window.addEventListener('pointercancel', end, { once: true });
  }

  startResize(event: PointerEvent, block: StudioBlock): void {
    if (event.button !== 0 || block.locked || !block.layout) return;
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
    const move = (e: PointerEvent) => {
      const dw = (e.clientX - start.x) / rect.width;
      const dh = (e.clientY - start.y) / rect.height;
      let width = Math.max(0.06, Math.min(1 - start.layout.x, start.layout.width + dw));
      let height = Math.max(0.04, Math.min(1 - start.layout.y, startHeight + dh));
      const rightGap = 1 - (start.layout.x + width);
      const bottomGap = 1 - (start.layout.y + height);
      const tx = 8 / Math.max(1, this.sheetWidth);
      const ty = 8 / Math.max(1, this.sheetHeight);
      if (Math.abs(rightGap) <= tx) width = 1 - start.layout.x;
      if (Math.abs(bottomGap) <= ty) height = 1 - start.layout.y;
      this.layoutChanged.emit({
        id: block._id,
        layout: normalizeStudioBlockLayout({ ...start.layout, width, height }),
      });
    };
    const end = () => {
      handle.releasePointerCapture(event.pointerId);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end, { once: true });
    window.addEventListener('pointercancel', end, { once: true });
  }

  startTextEdit(event: MouseEvent, block: StudioBlock): void {
    if (block.locked || block.type !== 'text') return;
    event.stopPropagation();
    this.editingId = block._id;
  }

  commitTextEdit(block: StudioBlock, event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.editingId = null;
    if (value !== (block.content ?? '')) {
      this.contentChanged.emit({ id: block._id, content: value });
    }
  }

  cancelTextEdit(event: Event): void {
    event.stopPropagation();
    this.editingId = null;
  }
}
