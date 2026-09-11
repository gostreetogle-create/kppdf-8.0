import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  PiTableTemplatesService,
  TABLE_COLUMN_ALIGNS,
  TABLE_COLUMN_TYPES,
  type TableTemplate,
} from '@kppdf/data-access';
import type { StudioBlock } from '@kppdf/data-access';
import { ButtonComponent } from '@kppdf/ui/button';
import { extractErrorMessage } from '@kppdf/util-http';
import { ChevronDown, LucideAngularModule } from 'lucide-angular';
import {
  buildTableSettingsFromTemplate,
  studioTableColumns,
  studioTableHiddenColumnKeys,
  studioTableTemplateId,
  studioTableTransparentBackground,
  studioTableRows,
  studioTableRowSource,
  studioTableDisabledRowIndices,
  studioVisibleColumnIndices,
  studioVisibleTableColumns,
  remapRowsForColumnChange,
  filterHiddenColumnKeysForColumns,
  createStudioTableColumn,
  createStandardStudioTableColumn,
  missingStandardColumnFields,
  type StudioStandardColumnField,
  type StudioTableColumn,
} from './studio-table-defaults';

@Component({
  selector: 'pi-studio-table-properties',
  standalone: true,
  imports: [FormsModule, ButtonComponent, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-props" data-test="studio-table-properties">
      <label class="table-props__field">
        <span class="table-props__label">Вид таблицы</span>
        <select
          class="table-props__select"
          [ngModel]="selectedTemplateId()"
          (ngModelChange)="onTemplateSelect($event)"
          [disabled]="disabled || loading()"
          data-test="studio-table-template-select"
        >
          <option value="">— выберите вид —</option>
          @for (template of templates(); track template._id) {
            <option [value]="template._id">{{ template.name }}</option>
          }
        </select>
      </label>

      @if (loadError()) {
        <p class="table-props__error" role="alert">{{ loadError() }}</p>
      }

      @if (columns(block).length > 0) {
        <div class="table-props__columns" #columnPicker>
          <span class="table-props__label">Колонки</span>
          <button
            type="button"
            class="table-props__columns-trigger pi-focus-ring"
            [class.is-open]="columnsOpen()"
            [disabled]="disabled"
            [attr.aria-expanded]="columnsOpen()"
            aria-haspopup="listbox"
            data-test="studio-table-columns-trigger"
            (click)="toggleColumnsOpen($event)"
          >
            <span class="table-props__columns-summary">{{ columnsSummary(block) }}</span>
            <lucide-angular [img]="chevronDown" [size]="14" class="table-props__chevron" aria-hidden="true" />
          </button>
          @if (columnsOpen()) {
            <div
              class="table-props__columns-panel"
              role="listbox"
              aria-multiselectable="true"
              data-test="studio-table-column-toggles"
              (click)="$event.stopPropagation()"
            >
              @for (col of columns(block); track col.key) {
                <label class="table-props__toggle" role="option" [attr.aria-selected]="isColumnVisible(col.key)">
                  <input
                    type="checkbox"
                    [checked]="isColumnVisible(col.key)"
                    [disabled]="disabled"
                    (change)="toggleColumn(col.key, $event)"
                    [attr.data-test]="'studio-table-col-toggle-' + col.key"
                  />
                  <span>{{ col.label }}</span>
                </label>
              }
            </div>
          }
        </div>
      }


      @if (columnsEditable()) {
      <div class="table-props__column-editor" data-test="studio-table-column-editor">
        <div class="table-props__column-editor-head">
          <span class="table-props__label">Структура колонок</span>
          <app-pi-button
            type="button"
            variant="outline"
            size="sm"
            [disabled]="disabled || !columnsEditable()"
            data-test="studio-table-add-column"
            (click)="addColumn()"
          >
            + Колонка
          </app-pi-button>
        </div>
        @if (missingStandardFields(block).length > 0) {
          <div class="table-props__quick-add" data-test="studio-table-quick-add">
            @for (field of missingStandardFields(block); track field.key) {
              <button
                type="button"
                class="table-props__chip-btn pi-focus-ring"
                [disabled]="disabled"
                [attr.data-test]="'studio-table-quick-add-' + field.key"
                (click)="addStandardColumn(field)"
              >
                + {{ field.label }}
              </button>
            }
          </div>
        }
        @for (col of columns(block); track col.key; let i = $index) {
          <div class="table-props__column-row" [attr.data-test]="'studio-table-column-row-' + i">
            <input
              class="table-props__col-input table-props__col-input--key"
              type="text"
              [ngModel]="col.key"
              (ngModelChange)="updateColumnField(i, 'key', $event)"
              [disabled]="disabled || !columnsEditable()"
              placeholder="key"
              [attr.data-test]="'studio-table-col-key-' + i"
            />
            <input
              class="table-props__col-input"
              type="text"
              [ngModel]="col.label"
              (ngModelChange)="updateColumnField(i, 'label', $event)"
              [disabled]="disabled || !columnsEditable()"
              placeholder="Заголовок"
              [attr.data-test]="'studio-table-col-label-' + i"
            />
            <select
              class="table-props__select table-props__col-select"
              [ngModel]="col.type"
              (ngModelChange)="updateColumnField(i, 'type', $event)"
              [disabled]="disabled || !columnsEditable()"
              [attr.data-test]="'studio-table-col-type-' + i"
            >
              @for (t of columnTypes; track t) {
                <option [value]="t">{{ t }}</option>
              }
            </select>
            <input
              class="table-props__col-input table-props__col-input--width"
              type="number"
              min="1"
              max="100"
              [ngModel]="col.width"
              (ngModelChange)="updateColumnField(i, 'width', $event)"
              [disabled]="disabled || !columnsEditable()"
              [attr.data-test]="'studio-table-col-width-' + i"
            />
            <select
              class="table-props__select table-props__col-select"
              [ngModel]="col.align"
              (ngModelChange)="updateColumnField(i, 'align', $event)"
              [disabled]="disabled || !columnsEditable()"
              [attr.data-test]="'studio-table-col-align-' + i"
            >
              @for (a of columnAligns; track a) {
                <option [value]="a">{{ a }}</option>
              }
            </select>
            <div class="table-props__column-actions">
              <button
                type="button"
                class="table-props__icon-btn pi-focus-ring"
                [disabled]="disabled || !columnsEditable() || i === 0"
                aria-label="Выше"
                (click)="moveColumn(i, -1)"
              >
                ↑
              </button>
              <button
                type="button"
                class="table-props__icon-btn pi-focus-ring"
                [disabled]="disabled || !columnsEditable() || i === columns(block).length - 1"
                aria-label="Ниже"
                (click)="moveColumn(i, 1)"
              >
                ↓
              </button>
              <button
                type="button"
                class="table-props__icon-btn table-props__icon-btn--danger pi-focus-ring"
                [disabled]="disabled || !columnsEditable() || columns(block).length <= 1"
                aria-label="Удалить колонку"
                (click)="removeColumn(i)"
                [attr.data-test]="'studio-table-col-remove-' + i"
              >
                ×
              </button>
            </div>
          </div>
        }
      </div>
      } @else {
        <div class="table-props__locked-summary" data-test="studio-table-columns-locked">
          <span class="table-props__label">Структура колонок</span>
          <p>Структура колонок этой таблицы закрыта для правки («customColumns: false»).</p>
        </div>
      }

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
              (click)="addTableRow()"
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
                        (change)="toggleTableRow(rowIdx, $event)"
                        [attr.data-test]="'studio-table-row-toggle-' + rowIdx"
                      />
                    </td>
                    @for (colIdx of visibleColumnIndices(); track colIdx) {
                      <td>
                        <input
                          type="text"
                          class="cell-input"
                          [ngModel]="row[colIdx] ?? ''"
                          (ngModelChange)="onTableCell(rowIdx, colIdx, $event)"
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
                        (click)="removeTableRow(rowIdx)"
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
      } @else {
        <p class="table-props__hint" data-test="studio-table-rows-live-hint">Строки приходят из раздела «Данные» или КП — редактирование в источнике.</p>
      }

      <label class="table-props__field" data-test="studio-table-source-field">
        <span class="table-props__label">Источник строк</span>
        <select
          class="table-props__select"
          [ngModel]="rowSource()"
          (ngModelChange)="onRowSourceChange($event)"
          [disabled]="disabled"
          data-test="studio-table-source-select"
        >
          <option value="manual">Вручную</option>
          <option value="quotation-items">Из КП</option>
          <option value="order-items">Из заказа</option>
          <option value="catalog-products">Изделия</option>
          <option value="catalog-modules">Модули</option>
          <option value="catalog-parts">Детали</option>
          <option value="catalog-materials">Материалы</option>
        </select>
        @if (rowSource() === 'quotation-items' && !quotationId) {
          <span class="table-props__hint">Выберите КП в панели Данные</span>
        }
        @if (rowSource() === 'order-items' && !orderId) {
          <span class="table-props__hint">Выберите заказ в панели Данные</span>
        }
      </label>

      <label class="table-props__toggle">
        <input
          type="checkbox"
          [checked]="transparentBackground()"
          [disabled]="disabled"
          (change)="toggleTransparentBackground($event)"
          data-test="studio-table-transparent-bg"
        />
        <span>Прозрачный фон (не закрывает слои ниже)</span>
      </label>

      <app-pi-button
        variant="secondary"
        size="sm"
        class="w-full"
        data-test="studio-table-save-template"
        [disabled]="disabled"
        (click)="saveTemplate.emit()"
      >
        Сохранить как вид таблицы
      </app-pi-button>
      <p class="table-props__hint">Реестр видов — «Реестры → Документы → Виды таблиц».</p>
    </div>
  `,
  styles: [`
    .table-props { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
    .table-props__field { display: flex; flex-direction: column; gap: 4px; margin: 0; }
    .table-props__label {
      font-size: 11px;
      font-weight: 600;
      color: var(--color-muted-foreground);
    }
    .table-props__select {
      width: 100%;
      box-sizing: border-box;
      padding: 7px 9px;
      border: 1px solid var(--color-rule-strong);
      border-radius: var(--radius-sm);
      background: var(--color-paper-2);
      color: var(--color-ink);
      font-size: 13px;
    }
    .table-props__select:disabled { opacity: 0.55; cursor: not-allowed; }
    .table-props__columns { display: flex; flex-direction: column; gap: 4px; position: relative; }
    .table-props__columns-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      width: 100%;
      box-sizing: border-box;
      padding: 7px 9px;
      border: 1px solid var(--color-rule-strong);
      border-radius: var(--radius-sm);
      background: var(--color-paper-2);
      color: var(--color-ink);
      font-size: 12px;
      text-align: left;
      cursor: pointer;
    }
    .table-props__columns-trigger:hover:not(:disabled) {
      background: var(--color-paper-3);
      border-color: var(--color-gold-deep);
    }
    .table-props__columns-trigger.is-open {
      border-color: var(--color-gold-deep);
      background: var(--color-paper-raised);
    }
    .table-props__columns-trigger:disabled { opacity: 0.55; cursor: not-allowed; }
    .table-props__columns-summary {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .table-props__chevron {
      flex-shrink: 0;
      transition: transform 0.15s ease;
    }
    .table-props__columns-trigger.is-open .table-props__chevron {
      transform: rotate(180deg);
    }
    .table-props__columns-panel {
      position: absolute;
      z-index: 30;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 10px;
      padding: 8px;
      border: 1px solid var(--color-rule-strong);
      border-radius: var(--radius-sm);
      background: var(--color-paper-raised);
      box-shadow: 0 6px 18px color-mix(in oklch, var(--color-ink) 12%, transparent);
      max-height: 220px;
      overflow-y: auto;
    }
    .table-props__toggle {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 11px;
      line-height: 1.3;
      cursor: pointer;
      min-width: 0;
    }
    .table-props__toggle span {
      overflow-wrap: anywhere;
    }
    .table-props__toggle input {
      flex-shrink: 0;
      margin-top: 1px;
      accent-color: var(--color-gold-deep);
    }
    .table-props__error {
      margin: 0;
      font-size: 11px;
      color: var(--color-destructive);
    }

    .table-props__column-editor { display: flex; flex-direction: column; gap: 6px; }
    .table-props__column-editor-head {
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
    }
    .table-props__quick-add { display: flex; flex-wrap: wrap; gap: 4px; }
    .table-props__chip-btn {
      padding: 3px 8px; border: 1px dashed var(--color-rule-strong); border-radius: var(--radius-sm);
      background: var(--color-paper-2); color: var(--color-muted-foreground); font-size: 11px;
      cursor: pointer; white-space: nowrap;
    }
    .table-props__chip-btn:hover:not(:disabled) {
      border-style: solid; border-color: var(--color-gold-deep); color: var(--color-ink);
    }
    .table-props__chip-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .table-props__column-row {
      display: grid;
      grid-template-columns: minmax(3rem, 0.9fr) minmax(4rem, 1.2fr) 4.2rem 2.6rem 4.2rem auto;
      gap: 4px;
      align-items: center;
    }
    .table-props__col-input {
      width: 100%; box-sizing: border-box; padding: 5px 6px;
      border: 1px solid var(--color-rule-strong); border-radius: var(--radius-sm);
      background: var(--color-paper-2); color: var(--color-ink); font-size: 11px;
    }
    .table-props__col-input--width { min-width: 0; }
    .table-props__col-select { padding: 5px 4px; font-size: 10px; }
    .table-props__column-actions { display: inline-flex; gap: 2px; justify-content: flex-end; }
    .table-props__icon-btn {
      width: 22px; height: 22px; padding: 0; border: 1px solid var(--color-rule);
      border-radius: var(--radius-sm); background: var(--color-paper-2); cursor: pointer;
      font-size: 12px; line-height: 1; color: var(--color-ink);
    }
    .table-props__icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .table-props__icon-btn--danger { color: var(--color-destructive); }

    .table-props__locked-summary { padding: 8px; border: 1px solid var(--color-rule); background: var(--color-paper-2); }
    .table-props__locked-summary p { margin: 4px 0 0; font-size: 11px; color: var(--color-muted-foreground); }

    .table-props__hint {
      margin: 0;
      font-size: 11px;
      line-height: 1.4;
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
export class StudioTablePropertiesComponent implements OnInit, OnChanges {
  private readonly templatesService = inject(PiTableTemplatesService);
  private readonly columnPickerRef = viewChild<ElementRef<HTMLElement>>('columnPicker');

  @Input({ required: true }) block!: StudioBlock;
  @Input() disabled = false;
  @Input() quotationId = '';
  @Input() orderId = '';
  @Output() readonly settingsChange = new EventEmitter<Record<string, unknown>>();
  @Output() readonly sourceChange = new EventEmitter<'manual' | 'quotation-items' | 'order-items' | 'catalog-products' | 'catalog-modules' | 'catalog-parts' | 'catalog-materials'>();
  @Output() readonly saveTemplate = new EventEmitter<void>();
  @Output() readonly templatesLoaded = new EventEmitter<readonly TableTemplate[]>();
  /** TZ-NX-DOCSTUDIO-S45: row editing moved here from the canvas. */
  @Output() readonly rowsChange = new EventEmitter<string[][]>();
  @Output() readonly disabledRowsChange = new EventEmitter<number[]>();

  protected readonly templates = signal<readonly TableTemplate[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly selectedTemplateId = signal('');
  protected readonly columnsOpen = signal(false);
  protected readonly chevronDown = ChevronDown;

  protected readonly columns = studioTableColumns;

  /**
   * TZ-NX-DOCSTUDIO-TABLE-COL-STRUCTURE — a selected «Вид» (template) used to
   * lock structure entirely (rowSource==='manual' && !templateId). PO: reorder
   * and adding standard fields (e.g. «Количество») must work regardless of
   * template/rowSource — structure lives on the block (`tableTemplateColumns`
   * override), never requires PATCHing the shared template in the registry.
   * `customColumns: false` remains the one explicit opt-out.
   */
  protected columnsEditable(): boolean {
    return this.block.settings?.['customColumns'] !== false;
  }

  protected rowSource(): string {
    return studioTableRowSource(this.block);
  }

  /** Full row matrix (incl. disabled rows) for the editor grid. */
  protected rowsAll(): string[][] {
    return studioTableRows(this.block);
  }

  protected visibleColumns(): StudioTableColumn[] {
    return studioVisibleTableColumns(this.block);
  }

  protected visibleColumnIndices(): number[] {
    return studioVisibleColumnIndices(this.block);
  }

  protected isRowEnabled(rowIdx: number): boolean {
    return !studioTableDisabledRowIndices(this.block).includes(rowIdx);
  }

  protected onTableCell(rowIdx: number, colIdx: number, value: string): void {
    const rows = studioTableRows(this.block).map((r, ri) =>
      ri === rowIdx ? r.map((c, ci) => (ci === colIdx ? value : c)) : [...r],
    );
    this.rowsChange.emit(rows);
  }

  protected toggleTableRow(rowIdx: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const disabled = new Set(studioTableDisabledRowIndices(this.block));
    if (checked) {
      disabled.delete(rowIdx);
    } else {
      disabled.add(rowIdx);
    }
    this.disabledRowsChange.emit([...disabled].sort((a, b) => a - b));
  }

  protected addTableRow(): void {
    const colCount = studioTableColumns(this.block).length;
    this.rowsChange.emit([...studioTableRows(this.block), Array(colCount).fill('')]);
  }

  protected removeTableRow(rowIdx: number): void {
    const rows = studioTableRows(this.block);
    if (rows.length <= 1) return;
    const disabled = studioTableDisabledRowIndices(this.block)
      .filter((i) => i !== rowIdx)
      .map((i) => (i > rowIdx ? i - 1 : i));
    this.disabledRowsChange.emit(disabled);
    this.rowsChange.emit(rows.filter((_, i) => i !== rowIdx));
  }

  protected onRowSourceChange(source: 'manual' | 'quotation-items' | 'order-items' | 'catalog-products' | 'catalog-modules' | 'catalog-parts' | 'catalog-materials'): void {
    this.sourceChange.emit(source);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.columnsOpen()) return;
    const root = this.columnPickerRef()?.nativeElement;
    if (root && !root.contains(event.target as Node)) {
      this.columnsOpen.set(false);
    }
  }

  ngOnInit(): void {
    this.syncSelectedId();
    void this.loadTemplates();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['block'] && !changes['block'].firstChange) {
      this.syncSelectedId();
      this.columnsOpen.set(false);
    }
  }

  protected columnsSummary(block: StudioBlock): string {
    const cols = studioTableColumns(block);
    const hidden = new Set(studioTableHiddenColumnKeys(block));
    const visible = cols.filter((col) => !hidden.has(col.key));
    if (visible.length === 0) return 'Нет колонок';
    if (visible.length === cols.length) return `Все колонки (${cols.length})`;
    const preview = visible
      .slice(0, 2)
      .map((col) => col.label)
      .join(', ');
    const rest = visible.length - 2;
    return rest > 0 ? `${visible.length} из ${cols.length}: ${preview}…` : `${visible.length} из ${cols.length}: ${preview}`;
  }

  protected toggleColumnsOpen(event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;
    this.columnsOpen.update((open) => !open);
  }

  protected isColumnVisible(key: string): boolean {
    return !studioTableHiddenColumnKeys(this.block).includes(key);
  }

  protected transparentBackground(): boolean {
    return studioTableTransparentBackground(this.block);
  }

  protected toggleTransparentBackground(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.settingsChange.emit({ tableTransparentBackground: checked });
  }

  protected onTemplateSelect(templateId: string): void {
    if (!templateId) return;
    const template = this.templates().find((t) => t._id === templateId);
    if (!template) return;
    this.selectedTemplateId.set(templateId);
    this.settingsChange.emit(buildTableSettingsFromTemplate(template));
  }


  protected readonly columnTypes = TABLE_COLUMN_TYPES;
  protected readonly columnAligns = TABLE_COLUMN_ALIGNS;

  protected addColumn(): void {
    const next = [...studioTableColumns(this.block), createStudioTableColumn(studioTableColumns(this.block))];
    this.emitColumnStructure(next);
  }

  protected missingStandardFields(block: StudioBlock): readonly StudioStandardColumnField[] {
    return missingStandardColumnFields(block);
  }

  protected addStandardColumn(field: StudioStandardColumnField): void {
    const next = [...studioTableColumns(this.block), createStandardStudioTableColumn(field)];
    this.emitColumnStructure(next);
  }

  protected removeColumn(index: number): void {
    const cols = studioTableColumns(this.block);
    if (cols.length <= 1) return;
    const next = cols.filter((_, i) => i !== index);
    this.emitColumnStructure(next);
  }

  protected moveColumn(index: number, delta: number): void {
    const cols = [...studioTableColumns(this.block)];
    const target = index + delta;
    if (target < 0 || target >= cols.length) return;
    const tmp = cols[index];
    cols[index] = cols[target];
    cols[target] = tmp;
    this.emitColumnStructure(cols);
  }

  protected updateColumnField(
    index: number,
    field: keyof StudioTableColumn,
    raw: string | number,
  ): void {
    const cols = studioTableColumns(this.block).map((col) => ({ ...col }));
    const current = cols[index];
    if (!current) return;
    if (field === 'width') {
      const width = Math.min(100, Math.max(1, Number(raw) || 1));
      cols[index] = { ...current, width };
    } else if (field === 'key') {
      const key = String(raw).trim();
      if (!key || cols.some((c, i) => i !== index && c.key === key)) return;
      cols[index] = { ...current, key };
    } else if (field === 'label') {
      cols[index] = { ...current, label: String(raw) };
    } else if (field === 'type') {
      cols[index] = { ...current, type: raw as StudioTableColumn['type'] };
    } else if (field === 'align') {
      cols[index] = { ...current, align: raw as StudioTableColumn['align'] };
    } else {
      return;
    }
    this.emitColumnStructure(cols);
  }

  private emitColumnStructure(nextColumns: StudioTableColumn[]): void {
    const prevColumns = studioTableColumns(this.block);
    const rows = remapRowsForColumnChange(prevColumns, nextColumns, studioTableRows(this.block));
    const hidden = filterHiddenColumnKeysForColumns(studioTableHiddenColumnKeys(this.block), nextColumns);
    this.settingsChange.emit({
      tableTemplateColumns: nextColumns,
      tableTemplateSampleRows: rows,
      tableHiddenColumnKeys: hidden,
    });
  }


  protected toggleColumn(key: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const hidden = new Set(studioTableHiddenColumnKeys(this.block));
    if (checked) {
      hidden.delete(key);
    } else {
      hidden.add(key);
    }
    const visibleCount = studioTableColumns(this.block).length - hidden.size;
    if (visibleCount < 1) return;
    this.settingsChange.emit({ tableHiddenColumnKeys: [...hidden] });
  }

  async reloadTemplates(): Promise<void> {
    await this.loadTemplates();
  }

  private syncSelectedId(): void {
    this.selectedTemplateId.set(studioTableTemplateId(this.block) ?? '');
  }

  private async loadTemplates(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    const result = await firstValueFrom(this.templatesService.list());
    this.loading.set(false);
    if (!result.ok) {
      this.loadError.set(extractErrorMessage(result.error));
      return;
    }
    const active = result.data
      .filter((t) => t.isActive !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name, 'ru'));
    this.templates.set(active);
    this.templatesLoaded.emit(active);
    this.syncSelectedId();
  }
}
