import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgStyle } from '@angular/common';
import type { StudioBlock, StudioBlockLayout } from '@kppdf/data-access';
import type { StudioTableColumn } from '@kppdf/features/doc-studio';

export interface StudioTableColumnMeta {
  readonly col: StudioTableColumn;
  readonly widthPct: number;
  readonly isPhoto: boolean;
}

/**
 * TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT (Phase 5) — dumb presenter extracted from
 * `StudioBlocksCanvasComponent`'s table-block `@if` branch, verbatim. Every
 * derived value (`columnMeta`, `rows`, `emptyStateLabel`, `transparent`,
 * `photoCellStyles`) is precomputed by the host from its own unchanged
 * `tableColumns`/`tableRows`/`colWidthPct`/`isPhotoColumnAt`/`photoCellStyle`/
 * `tableEmptyStateLabel`/`tableTransparent` methods (kept on the host —
 * `studio-blocks-canvas.component.spec.ts` calls `tableColumns`/`tableRows`
 * directly on the host instance) — this component only renders and
 * re-emits raw DOM events.
 */
@Component({
  selector: 'pi-studio-table-block-presenter',
  standalone: true,
  imports: [NgStyle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="studio-block studio-block--table"
      [class.studio-block--table-transparent]="transparent"
      [class.selected]="selected"
      [class.studio-block--editable]="selected && !block.locked"
      [class.studio-block--passive]="!selected || block.locked"
      [class.locked]="block.locked"
      [class.snapping]="snapping"
      [style.left.%]="layout.x * 100"
      [style.top.%]="layout.y * 100"
      [style.width.%]="layout.width * 100"
      [style.height.%]="(layout.height ?? 0.25) * 100"
      [style.z-index]="layout.zIndex"
      (click)="select.emit($event)"
      (dblclick)="openTable.emit($event)"
      (pointerdown)="dragStart.emit($event)"
    >
      <div class="table-preview">
        <table>
          <thead>
            <tr>
              @for (cm of columnMeta; track cm.col.key) {
                <th [style.text-align]="cm.col.align" [style.width.%]="cm.widthPct">{{ cm.col.label }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of rows; track $index) {
              <tr>
                @for (cell of row; track $index; let ci = $index) {
                  @if (columnMeta[ci]?.isPhoto) {
                    <td class="table-preview__photo-cell" [style.width.%]="columnMeta[ci]?.widthPct">
                      <!-- TZ-NX-DOCSTUDIO-TABLE-PHOTO-EMPTY-BLANK: no photo / broken load = blank cell,
                           no "Нет фото" text and no browser broken-image icon. Row height comes from
                           the shared td padding, not from this cell's own content. -->
                      @if (cell && !isPhotoLoadFailed(cell)) {
                        <img [src]="cell" alt="" class="table-preview__photo" [ngStyle]="photoCellStyles.get(cell)" (error)="photoLoadError.emit(cell)" />
                      }
                    </td>
                  } @else {
                    <td [style.width.%]="columnMeta[ci]?.widthPct">{{ cell || ' ' }}</td>
                  }
                }
              </tr>
            } @empty {
              <!-- TZ-NX-DOCSTUDIO-S45: empty table = placeholder row, not a bare thead.
                   TZ-NX-DOCSTUDIO-TABLE-UNWIRED-EMPTY-STATE: text differs for a table with
                   no live source (points at Properties/Insert) vs. a wired one with no rows
                   yet (points at Selected/КП/order — Properties can't manually add live rows). -->
              <tr class="table-preview__empty">
                <td [attr.colspan]="columnMeta.length || 1">{{ emptyStateLabel }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      @if (selected && !block.locked && !readOnly) {
        <span class="selection-frame" aria-hidden="true"></span>
        <button class="resize-handle" type="button" aria-label="Изменить размер" (pointerdown)="resizeStart.emit($event)"></button>
      }
    </article>
  `,
  styles: [`
    /* Shared block scaffolding — duplicated identically across all 3 block
       presenters (view-encapsulated per component; see the host's own
       comment for why). */
    .studio-block {
      position:absolute; box-sizing:border-box; min-width:4%; min-height:3%;
      padding:4px; border:1px solid transparent; overflow:hidden;
      pointer-events:auto; cursor:move; user-select:none;
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
         [ngStyle]="photoCellStyles.get(cell)" (per-photo РАМКА + block override),
         not a hardcoded contain/28px. */
      display: block;
      max-width: 100%;
      margin: 0 auto;
    }
  `],
})
export class StudioTableBlockPresenterComponent {
  @Input({ required: true }) block!: StudioBlock;
  @Input({ required: true }) layout!: StudioBlockLayout;
  @Input() selected = false;
  @Input() snapping = false;
  @Input() readOnly = false;
  @Input() transparent = false;
  @Input() columnMeta: readonly StudioTableColumnMeta[] = [];
  @Input() rows: readonly string[][] = [];
  @Input() emptyStateLabel = '';
  @Input() photoCellStyles: ReadonlyMap<string, Record<string, string>> = new Map();
  /** Stable bound reference from the host (shared `failedPhotoUrls` state across every table block). */
  @Input() isPhotoLoadFailed: (url: string) => boolean = () => false;

  @Output() select = new EventEmitter<MouseEvent>();
  @Output() openTable = new EventEmitter<MouseEvent>();
  @Output() dragStart = new EventEmitter<PointerEvent>();
  @Output() resizeStart = new EventEmitter<PointerEvent>();
  @Output() photoLoadError = new EventEmitter<string>();
}
