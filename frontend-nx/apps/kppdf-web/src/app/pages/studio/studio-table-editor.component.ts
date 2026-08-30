import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '@kppdf/ui/button';
import type { StudioBlock } from '@kppdf/data-access';
import { studioTableColumns, studioTableRows } from './studio-table-defaults';

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
            @for (col of columns(block); track col.key) {
              <th [style.text-align]="col.align">{{ col.label }}</th>
            }
            <th class="col-actions" aria-hidden="true"></th>
          </tr>
        </thead>
        <tbody>
          @for (row of rows; track $index; let rowIdx = $index) {
            <tr>
              @for (col of columns(block); track col.key; let colIdx = $index) {
                <td>
                  <input
                    type="text"
                    class="cell-input"
                    [ngModel]="row[colIdx] ?? ''"
                    (ngModelChange)="onCell(rowIdx, colIdx, $event)"
                    [disabled]="disabled"
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
    .cell-input {
      width: 100%;
      min-width: 3rem;
      border: none;
      padding: 4px 6px;
      font-size: 12px;
      background: transparent;
      box-sizing: border-box;
    }
    .cell-input:focus {
      outline: 2px solid var(--color-gold);
      outline-offset: -2px;
      background: var(--color-paper-raised);
    }
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

  protected columns(block: StudioBlock) {
    return studioTableColumns(block);
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
    this.rowsChange.emit(this.rows.filter((_, i) => i !== rowIdx));
  }
}
