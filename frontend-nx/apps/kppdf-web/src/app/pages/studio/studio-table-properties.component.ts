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
  remapRowsForColumnChange,
  filterHiddenColumnKeysForColumns,
  createStudioTableColumn,
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


      <div class="table-props__column-editor" data-test="studio-table-column-editor">
        <div class="table-props__column-editor-head">
          <span class="table-props__label">Структура колонок</span>
          <app-pi-button
            type="button"
            variant="outline"
            size="sm"
            [disabled]="disabled"
            data-test="studio-table-add-column"
            (click)="addColumn()"
          >
            + Колонка
          </app-pi-button>
        </div>
        @for (col of columns(block); track col.key; let i = $index) {
          <div class="table-props__column-row" [attr.data-test]="'studio-table-column-row-' + i">
            <input
              class="table-props__col-input table-props__col-input--key"
              type="text"
              [ngModel]="col.key"
              (ngModelChange)="updateColumnField(i, 'key', $event)"
              [disabled]="disabled"
              placeholder="key"
              [attr.data-test]="'studio-table-col-key-' + i"
            />
            <input
              class="table-props__col-input"
              type="text"
              [ngModel]="col.label"
              (ngModelChange)="updateColumnField(i, 'label', $event)"
              [disabled]="disabled"
              placeholder="Заголовок"
              [attr.data-test]="'studio-table-col-label-' + i"
            />
            <select
              class="table-props__select table-props__col-select"
              [ngModel]="col.type"
              (ngModelChange)="updateColumnField(i, 'type', $event)"
              [disabled]="disabled"
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
              [disabled]="disabled"
              [attr.data-test]="'studio-table-col-width-' + i"
            />
            <select
              class="table-props__select table-props__col-select"
              [ngModel]="col.align"
              (ngModelChange)="updateColumnField(i, 'align', $event)"
              [disabled]="disabled"
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
                [disabled]="disabled || i === 0"
                aria-label="Выше"
                (click)="moveColumn(i, -1)"
              >
                ↑
              </button>
              <button
                type="button"
                class="table-props__icon-btn pi-focus-ring"
                [disabled]="disabled || i === columns(block).length - 1"
                aria-label="Ниже"
                (click)="moveColumn(i, 1)"
              >
                ↓
              </button>
              <button
                type="button"
                class="table-props__icon-btn table-props__icon-btn--danger pi-focus-ring"
                [disabled]="disabled || columns(block).length <= 1"
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
      <p class="table-props__hint">Строки редактируйте на листе A4. Реестр видов — «Справочники → Виды таблиц».</p>
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

    .table-props__hint {
      margin: 0;
      font-size: 11px;
      line-height: 1.4;
      color: var(--color-muted-foreground);
    }
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

  protected readonly templates = signal<readonly TableTemplate[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly selectedTemplateId = signal('');
  protected readonly columnsOpen = signal(false);
  protected readonly chevronDown = ChevronDown;

  protected readonly columns = studioTableColumns;

  protected rowSource(): string {
    const source = (this.block.settings?.['dataSource'] as { type?: unknown } | undefined)?.type
      ?? this.block.settings?.['tableDataSource'];
    return source === 'quotation-items' || source === 'order-items' ? source : 'manual';
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
