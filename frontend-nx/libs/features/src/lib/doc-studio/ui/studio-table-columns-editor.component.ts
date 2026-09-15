import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TABLE_COLUMN_ALIGNS, TABLE_COLUMN_TYPES, type TableTemplate } from '@kppdf/data-access';
import type { StudioBlock } from '@kppdf/data-access';
import { ButtonComponent } from '@kppdf/ui/button';
import { ChevronDown, LucideAngularModule } from 'lucide-angular';
import {
  isKnownStudioColumnKey,
  missingStandardColumnFields,
  studioTableColumns,
  studioTableHiddenColumnKeys,
  studioTableRowSource,
  type StudioStandardColumnField,
  type StudioTableColumn,
} from '@kppdf/features/doc-studio';

/**
 * TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT (Phase 5) — dumb presenter extracted from
 * `StudioTablePropertiesComponent`'s "Макет колонок / Колонки / Структура
 * колонок" sections, verbatim. All state mutation (`settingsChange`
 * emission, template loading) stays on the host — this component only
 * derives read-only display values from its own `block` Input (via the
 * same imported pure functions the host used) and re-emits raw user
 * actions for the host to interpret exactly as before.
 *
 * The columns-open/close dropdown state and its outside-click-to-close
 * `@HostListener` are the one piece of genuine UI-only state fully owned
 * here (not forwarded to the host) — nothing outside this component ever
 * read it.
 */
@Component({
  selector: 'pi-studio-table-columns-editor',
  standalone: true,
  imports: [FormsModule, RouterLink, ButtonComponent, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="table-props__field">
      <span class="table-props__label">Макет колонок</span>
      <select
        class="table-props__select"
        [ngModel]="selectedTemplateId"
        (ngModelChange)="templateSelect.emit($event)"
        [disabled]="disabled || loading"
        data-test="studio-table-template-select"
      >
        <option value="">— выберите вид —</option>
        @for (template of templates; track template._id) {
          <option [value]="template._id">{{ template.name }}</option>
        }
      </select>
    </label>

    @if (loadError) {
      <p class="table-props__error" role="alert">{{ loadError }}</p>
    }

    @if (!selectedTemplateId && isCatalogRowSource()) {
      <p class="table-props__hint table-props__hint--warn" data-test="studio-table-template-missing">
        Макет не выбран — выберите вид выше или
        <a routerLink="/registries/table-templates" target="_blank">создайте его в реестре</a>.
      </p>
    }

    @if (columns().length > 0) {
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
          <span class="table-props__columns-summary">{{ columnsSummary() }}</span>
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
            @for (col of columns(); track col.key) {
              <label class="table-props__toggle" role="option" [attr.aria-selected]="isColumnVisible(col.key)">
                <input
                  type="checkbox"
                  [checked]="isColumnVisible(col.key)"
                  [disabled]="disabled"
                  (change)="columnToggle.emit({ key: col.key, event: $event })"
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
          data-test="studio-table-widths-by-header"
          (click)="fitWidths.emit()"
        >
          По заголовкам
        </app-pi-button>
        <app-pi-button
          type="button"
          variant="outline"
          size="sm"
          [disabled]="disabled || !columnsEditable()"
          data-test="studio-table-add-column"
          (click)="columnAdd.emit()"
        >
          + Колонка
        </app-pi-button>
      </div>
      <p class="table-props__hint" data-test="studio-table-width-hint">Веса → % на листе, сумма ≈ 100%. «По заголовкам» — пропорционально длине подписи; потом можно править вручную.</p>
      @if (missingStandardFields().length > 0) {
        <div class="table-props__quick-add" data-test="studio-table-quick-add">
          @for (field of missingStandardFields(); track field.key) {
            <button
              type="button"
              class="table-props__chip-btn pi-focus-ring"
              [disabled]="disabled"
              [attr.data-test]="'studio-table-quick-add-' + field.key"
              (click)="standardColumnAdd.emit(field)"
            >
              + {{ field.label }}
            </button>
          }
        </div>
      }
      @for (col of columns(); track col.key; let i = $index) {
        <div class="table-props__column-row" [attr.data-test]="'studio-table-column-row-' + i">
          <input
            class="table-props__col-input table-props__col-input--key"
            type="text"
            [ngModel]="col.key"
            (ngModelChange)="columnFieldUpdate.emit({ index: i, field: 'key', raw: $event })"
            [disabled]="disabled || !columnsEditable()"
            placeholder="key"
            [attr.data-test]="'studio-table-col-key-' + i"
          />
          <input
            class="table-props__col-input"
            type="text"
            [ngModel]="col.label"
            (ngModelChange)="columnFieldUpdate.emit({ index: i, field: 'label', raw: $event })"
            [disabled]="disabled || !columnsEditable()"
            placeholder="Заголовок"
            [attr.data-test]="'studio-table-col-label-' + i"
          />
          <select
            class="table-props__select table-props__col-select"
            [ngModel]="col.type"
            (ngModelChange)="columnFieldUpdate.emit({ index: i, field: 'type', raw: $event })"
            [disabled]="disabled || !columnsEditable() || isKnownColumnKey(col.key)"
            title="Тип не влияет на подстановку из каталога — определяется по ключу колонки"
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
            placeholder="%"
            aria-label="Ширина, %"
            title="Ширина, %"
            [ngModel]="col.width"
            (ngModelChange)="columnFieldUpdate.emit({ index: i, field: 'width', raw: $event })"
            [disabled]="disabled || !columnsEditable()"
            [attr.data-test]="'studio-table-col-width-' + i"
          />
          <select
            class="table-props__select table-props__col-select"
            [ngModel]="col.align"
            (ngModelChange)="columnFieldUpdate.emit({ index: i, field: 'align', raw: $event })"
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
              (click)="columnMove.emit({ index: i, delta: -1 })"
            >
              ↑
            </button>
            <button
              type="button"
              class="table-props__icon-btn pi-focus-ring"
              [disabled]="disabled || !columnsEditable() || i === columns().length - 1"
              aria-label="Ниже"
              (click)="columnMove.emit({ index: i, delta: 1 })"
            >
              ↓
            </button>
            <button
              type="button"
              class="table-props__icon-btn table-props__icon-btn--danger pi-focus-ring"
              [disabled]="disabled || !columnsEditable() || columns().length <= 1"
              aria-label="Удалить колонку"
              (click)="columnRemove.emit(i)"
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
  `,
  styles: [`
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
    .table-props__hint--warn { color: var(--color-destructive); }
    .table-props__hint--warn a { color: inherit; }
  `],
})
export class StudioTableColumnsEditorComponent implements OnChanges {
  private readonly columnPickerRef = viewChild<ElementRef<HTMLElement>>('columnPicker');

  @Input({ required: true }) block!: StudioBlock;
  @Input() disabled = false;
  @Input() templates: readonly TableTemplate[] = [];
  @Input() loading = false;
  @Input() loadError: string | null = null;
  @Input() selectedTemplateId = '';

  @Output() readonly templateSelect = new EventEmitter<string>();
  @Output() readonly columnToggle = new EventEmitter<{ key: string; event: Event }>();
  @Output() readonly fitWidths = new EventEmitter<void>();
  @Output() readonly columnAdd = new EventEmitter<void>();
  @Output() readonly standardColumnAdd = new EventEmitter<StudioStandardColumnField>();
  @Output() readonly columnFieldUpdate = new EventEmitter<{
    index: number;
    field: keyof StudioTableColumn;
    raw: string | number;
  }>();
  @Output() readonly columnMove = new EventEmitter<{ index: number; delta: number }>();
  @Output() readonly columnRemove = new EventEmitter<number>();

  protected readonly columnsOpen = signal(false);
  protected readonly chevronDown = ChevronDown;
  protected readonly columnTypes = TABLE_COLUMN_TYPES;
  protected readonly columnAligns = TABLE_COLUMN_ALIGNS;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['block'] && !changes['block'].firstChange) {
      this.columnsOpen.set(false);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.columnsOpen()) return;
    const root = this.columnPickerRef()?.nativeElement;
    if (root && !root.contains(event.target as Node)) {
      this.columnsOpen.set(false);
    }
  }

  protected toggleColumnsOpen(event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;
    this.columnsOpen.update((open) => !open);
  }

  protected columns(): StudioTableColumn[] {
    return studioTableColumns(this.block);
  }

  protected columnsEditable(): boolean {
    return this.block.settings?.['customColumns'] !== false;
  }

  protected isCatalogRowSource(): boolean {
    return studioTableRowSource(this.block).startsWith('catalog-');
  }

  protected isColumnVisible(key: string): boolean {
    return !studioTableHiddenColumnKeys(this.block).includes(key);
  }

  protected columnsSummary(): string {
    const cols = studioTableColumns(this.block);
    const hidden = new Set(studioTableHiddenColumnKeys(this.block));
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

  protected missingStandardFields(): readonly StudioStandardColumnField[] {
    return missingStandardColumnFields(this.block);
  }

  protected isKnownColumnKey(key: string): boolean {
    return isKnownStudioColumnKey(key);
  }
}
