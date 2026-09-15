import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { StudioBlock } from '@kppdf/data-access';
import { ButtonComponent } from '@kppdf/ui/button';
import {
  isStudioPhotoColumnKey,
  isStudioQtyColumnKey,
  studioLiveTableRows,
  studioTableColumns,
  studioTableDisabledRowIndices,
  studioTableRowSource,
  studioTableRows,
  studioVisibleColumnIndices,
  studioVisibleTableColumns,
  type StudioTableColumn,
} from '@kppdf/features/doc-studio';

/**
 * TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT (Phase 5) — dumb presenter extracted from
 * `StudioTablePropertiesComponent`'s "Строки таблицы" sections (manual
 * editor + live-rows viewer + empty-source hint), verbatim. All state
 * mutation stays on the host (`rowsChange`/`disabledRowsChange`/
 * `liveQtyChange` are the same public Output names as before, just now
 * declared here and forwarded 1:1 by the host's template) — this
 * component only derives read-only display values from its own `block`
 * Input via the same imported pure functions the host used.
 */
@Component({
  selector: 'pi-studio-table-rows-editor',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- TZ-NX-DOCSTUDIO-S45: row editing moved off the A4 canvas into Свойства. -->
    @if (rowSource() === 'manual') {
      <div class="table-props__rows" data-test="studio-table-rows-editor">
        <div class="table-props__rows-head">
          <span class="table-props__label">Строки таблицы</span>
          <app-pi-button
            type="button"
            variant="outline"
            size="sm"
            [disabled]="disabled"
            data-test="studio-table-add-row"
            (click)="rowAdd.emit()"
          >
            + Строка
          </app-pi-button>
        </div>
        <div class="table-props__rows-scroll">
          <table>
            <thead>
              <tr>
                <th class="col-enable" title="Включить строку">Вкл</th>
                @for (col of visibleColumns(); track col.key) {
                  <th [style.text-align]="col.align">{{ col.label }}</th>
                }
                <th class="col-actions" aria-hidden="true"></th>
              </tr>
            </thead>
            <tbody>
              @for (row of rowsAll(); track $index; let rowIdx = $index) {
                <tr [class.row-disabled]="!isRowEnabled(rowIdx)">
                  <td class="col-enable">
                    <input
                      type="checkbox"
                      [checked]="isRowEnabled(rowIdx)"
                      (change)="rowToggle.emit({ rowIdx, event: $event })"
                      [attr.data-test]="'studio-table-row-toggle-' + rowIdx"
                    />
                  </td>
                  @for (colIdx of visibleColumnIndices(); track colIdx) {
                    <td>
                      <input
                        type="text"
                        class="cell-input"
                        [ngModel]="row[colIdx] ?? ''"
                        (ngModelChange)="cellChange.emit({ rowIdx, colIdx, value: $event })"
                        [disabled]="!isRowEnabled(rowIdx)"
                        [attr.data-test]="'studio-table-cell-' + rowIdx + '-' + colIdx"
                      />
                    </td>
                  }
                  <td class="col-actions">
                    <button
                      type="button"
                      class="row-remove pi-focus-ring"
                      aria-label="Удалить строку"
                      [disabled]="rowsAll().length <= 1"
                      (click)="rowRemove.emit(rowIdx)"
                      [attr.data-test]="'studio-table-row-remove-' + rowIdx"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    } @else if (liveRowsAll().length > 0) {
      <!-- TZ-NX-DOCSTUDIO-TABLE-LINE-QTY: name/price/photo stay read-only (live from catalog/КП/заказ); only «Количество» is editable — persists as a per-row override on the block, survives refetch. -->
      <div class="table-props__rows" data-test="studio-table-live-rows-editor">
        <div class="table-props__rows-head">
          <span class="table-props__label">Строки таблицы</span>
          <span class="table-props__hint">Из каталога/КП/заказа — редактируется только «Количество»</span>
        </div>
        <div class="table-props__rows-scroll">
          <table>
            <thead>
              <tr>
                @for (col of visibleColumns(); track col.key) {
                  <th [style.text-align]="col.align">{{ col.label }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (row of liveRowsAll(); track $index; let rowIdx = $index) {
                <tr>
                  @for (colIdx of visibleColumnIndices(); track colIdx) {
                    <td [style.text-align]="columns()[colIdx]?.align">
                      @if (isQtyColumnAt(colIdx)) {
                        <input
                          type="number"
                          min="0"
                          class="cell-input"
                          [ngModel]="row[colIdx] ?? ''"
                          (ngModelChange)="liveQtyChange.emit({ rowIndex: rowIdx, value: $event })"
                          [disabled]="disabled"
                          [attr.data-test]="'studio-table-live-qty-' + rowIdx"
                        />
                      } @else if (isPhotoColumnAt(colIdx) && !row[colIdx]) {
                        <span class="table-props__photo-hint" [attr.data-test]="'studio-table-live-photo-hint-' + rowIdx">Загрузите фото в карточке изделия</span>
                      } @else {
                        {{ row[colIdx] || '—' }}
                      }
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    } @else {
      <p class="table-props__hint" data-test="studio-table-rows-live-hint">Строки приходят из раздела «Данные» или КП — редактирование в источнике.</p>
    }
  `,
  styles: [`
    .table-props__label {
      font-size: 11px;
      font-weight: 600;
      color: var(--color-muted-foreground);
    }
    .table-props__hint {
      margin: 0;
      font-size: 11px;
      line-height: 1.4;
      color: var(--color-muted-foreground);
    }
    .table-props__photo-hint {
      font-size: 10px;
      font-style: italic;
      color: var(--color-muted-foreground);
    }
    /* TZ-NX-DOCSTUDIO-S45 — rows editor (moved from the A4 canvas) */
    .table-props__rows { display: flex; flex-direction: column; gap: 6px; }
    .table-props__rows-head {
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
    }
    .table-props__rows-scroll {
      max-height: 240px;
      overflow: auto;
      border: 1px solid var(--color-rule);
      border-radius: var(--radius-sm);
    }
    .table-props__rows table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .table-props__rows th,
    .table-props__rows td {
      border-bottom: 1px solid var(--color-rule);
      padding: 3px 6px;
      vertical-align: middle;
    }
    .table-props__rows th {
      position: sticky;
      top: 0;
      background: var(--color-paper-2);
      font-weight: 600;
      color: var(--color-muted-foreground);
      white-space: nowrap;
      text-align: left;
    }
    .table-props__rows .col-enable { width: 32px; text-align: center; }
    .table-props__rows .col-actions { width: 28px; text-align: center; }
    .table-props__rows .row-disabled .cell-input { opacity: 0.45; }
    .table-props__rows .cell-input {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      border: 1px solid transparent;
      padding: 3px 5px;
      font-size: inherit;
      background: transparent;
      color: var(--color-ink);
    }
    .table-props__rows .cell-input:hover:not(:disabled) { border-color: var(--color-rule); }
    .table-props__rows .cell-input:focus {
      outline: 2px solid var(--color-gold);
      outline-offset: -2px;
      background: var(--color-paper-raised);
    }
    .table-props__rows .row-remove {
      width: 20px; height: 20px; padding: 0; border: none; background: transparent;
      color: var(--color-destructive); cursor: pointer; font-size: 14px; line-height: 1;
    }
    .table-props__rows input[type='checkbox'] { accent-color: var(--color-gold-deep); }
  `],
})
export class StudioTableRowsEditorComponent {
  @Input({ required: true }) block!: StudioBlock;
  @Input() disabled = false;

  @Output() readonly rowAdd = new EventEmitter<void>();
  @Output() readonly rowRemove = new EventEmitter<number>();
  @Output() readonly rowToggle = new EventEmitter<{ rowIdx: number; event: Event }>();
  @Output() readonly cellChange = new EventEmitter<{ rowIdx: number; colIdx: number; value: string }>();
  @Output() readonly liveQtyChange = new EventEmitter<{ rowIndex: number; value: string | number | null }>();

  protected rowSource(): string {
    return studioTableRowSource(this.block);
  }

  protected columns(): StudioTableColumn[] {
    return studioTableColumns(this.block);
  }

  protected rowsAll(): string[][] {
    return studioTableRows(this.block);
  }

  protected visibleColumns(): StudioTableColumn[] {
    return studioVisibleTableColumns(this.block);
  }

  protected visibleColumnIndices(): number[] {
    return studioVisibleColumnIndices(this.block);
  }

  protected liveRowsAll(): string[][] {
    return studioLiveTableRows(this.block);
  }

  protected isQtyColumnAt(colIdx: number): boolean {
    const col = this.columns()[colIdx];
    return col ? isStudioQtyColumnKey(col.key) : false;
  }

  protected isPhotoColumnAt(colIdx: number): boolean {
    const col = this.columns()[colIdx];
    return col ? isStudioPhotoColumnKey(col.key) : false;
  }

  protected isRowEnabled(rowIdx: number): boolean {
    return !studioTableDisabledRowIndices(this.block).includes(rowIdx);
  }
}
