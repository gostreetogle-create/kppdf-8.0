import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '@kppdf/ui/button';
import type { StudioBlock } from '@kppdf/data-access';
import {
  studioTableColumns,
  studioTableDisabledRowIndices,
  studioTableHiddenColumnKeys,
} from './studio-table-defaults';

@Component({
  selector: 'pi-studio-table-editor',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-editor" data-test="studio-table-rows-editor">
      <table>
        <thead>
          <tr>
            <th class="col-enable" title="Включить строку">Вкл</th>
            @for (col of columns(block); track col.key) {
              <th
                [style.text-align]="col.align"
                [class.col-hidden]="!isColumnVisible(col.key)"
              >
                {{ col.label }}
              </th>
            }
            <th class="col-actions" aria-hidden="true"></th>
          </tr>
        </thead>
        <tbody>
          @for (row of rows; track $index; let rowIdx = $index) {
            <tr [class.row-disabled]="!isRowEnabled(rowIdx)">
              <td class="col-enable">
                <input
                  type="checkbox"
                  [checked]="isRowEnabled(rowIdx)"
                  [disabled]="disabled"
                  (change)="toggleRow(rowIdx, $event)"
                  [attr.aria-label]="'Строка ' + (rowIdx + 1)"
                  [attr.data-test]="'studio-table-row-toggle-' + rowIdx"
                />
              </td>
              @for (col of columns(block); track col.key; let colIdx = $index) {
                <td [class.col-hidden]="!isColumnVisible(col.key)">
                  <input
                    type="text"
                    class="cell-input"
                    [ngModel]="row[colIdx] ?? ''"
                    (ngModelChange)="onCell(rowIdx, colIdx, $event)"
                    [disabled]="disabled || !isRowEnabled(rowIdx)"
                    [attr.data-test]="'studio-table-cell-' + rowIdx + '-' + colIdx"
                  />
                </td>
              }
              <td class="col-actions">
                <button
                  type="button"
                  class="row-remove pi-focus-ring"
                  aria-label="Удалить строку"
                  [disabled]="disabled || rows.length <= 1"
                  (click)="removeRow(rowIdx)"
                >
                  ×
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
      <app-pi-button
        variant="secondary"
        size="sm"
        class="w-full"
        data-test="studio-table-add-row"
        [disabled]="disabled"
        (click)="addRow()"
      >
        + Строка
      </app-pi-button>
    </div>
  `,
  styles: [`
    .table-editor { display: flex; flex-direction: column; gap: 8px; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    th, td {
      border: 1px solid var(--color-rule);
      padding: 0;
      vertical-align: middle;
    }
    th {
      padding: 4px 6px;
      font-weight: 600;
      color: var(--color-muted-foreground);
      background: var(--color-paper-2);
    }
    .col-enable { width: 32px; text-align: center; padding: 4px; }
    .col-hidden { opacity: 0.45; }
    .row-disabled td:not(.col-enable) { opacity: 0.5; }
    .cell-input {
      width: 100%;
      min-width: 3rem;
      border: 1px solid var(--color-rule-strong);
      border-radius: var(--radius-sm);
      padding: 4px 6px;
      font-size: 12px;
      background: var(--color-paper-2);
      color: var(--color-ink);
      box-sizing: border-box;
      opacity: 1;
    }
    .cell-input:focus {
      outline: 2px solid var(--color-gold);
      outline-offset: -2px;
      background: var(--color-paper-raised);
    }
    .cell-input:disabled { opacity: 0.55; }
    .col-actions { width: 28px; text-align: center; }
    .row-remove {
      width: 24px; height: 24px; padding: 0;
      border: none; background: transparent;
      color: var(--color-destructive); cursor: pointer; font-size: 16px; line-height: 1;
    }
    .row-remove:disabled { opacity: 0.35; cursor: default; }
  `],
})
export class StudioTableEditorComponent {
  @Input({ required: true }) block!: StudioBlock;
  @Input() rows: string[][] = [];
  @Input() disabled = false;
  @Output() readonly rowsChange = new EventEmitter<string[][]>();
  @Output() readonly disabledRowIndicesChange = new EventEmitter<number[]>();

  protected columns(block: StudioBlock) {
    return studioTableColumns(block);
  }

  protected isColumnVisible(key: string): boolean {
    return !studioTableHiddenColumnKeys(this.block).includes(key);
  }

  protected isRowEnabled(rowIdx: number): boolean {
    return !studioTableDisabledRowIndices(this.block).includes(rowIdx);
  }

  protected toggleRow(rowIdx: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const disabled = new Set(studioTableDisabledRowIndices(this.block));
    if (checked) {
      disabled.delete(rowIdx);
    } else {
      disabled.add(rowIdx);
    }
    this.disabledRowIndicesChange.emit([...disabled].sort((a, b) => a - b));
  }

  protected onCell(rowIdx: number, colIdx: number, value: string): void {
    const next = this.rows.map((r, ri) =>
      ri === rowIdx ? r.map((c, ci) => (ci === colIdx ? value : c)) : [...r],
    );
    this.rowsChange.emit(next);
  }

  protected addRow(): void {
    const colCount = studioTableColumns(this.block).length;
    this.rowsChange.emit([...this.rows, Array(colCount).fill('')]);
  }

  protected removeRow(rowIdx: number): void {
    if (this.rows.length <= 1) return;
    const disabled = studioTableDisabledRowIndices(this.block)
      .filter((i) => i !== rowIdx)
      .map((i) => (i > rowIdx ? i - 1 : i));
    this.disabledRowIndicesChange.emit(disabled);
    this.rowsChange.emit(this.rows.filter((_, i) => i !== rowIdx));
  }
}
