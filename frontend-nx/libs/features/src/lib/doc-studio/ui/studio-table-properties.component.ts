import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PiTableTemplatesService, type TableTemplate } from '@kppdf/data-access';
import type { StudioBlock } from '@kppdf/data-access';
import { ButtonComponent } from '@kppdf/ui/button';
import { extractErrorMessage } from '@kppdf/util-http';
import { ArrowUpRight, LucideAngularModule } from 'lucide-angular';
import {
  buildTableSettingsFromTemplate,
  isStudioPhotoColumnKey,
  studioTableColumns,
  studioTableHiddenColumnKeys,
  studioTablePhotoDisplay,
  studioTableTemplateId,
  studioTableTransparentBackground,
  studioTableRows,
  studioTableRowSource,
  studioTableDisabledRowIndices,
  remapRowsForColumnChange,
  filterHiddenColumnKeysForColumns,
  createStudioTableColumn,
  createStandardStudioTableColumn,
  fitColumnWidthsByHeader,
  healStudioTableColumns,
  type StudioStandardColumnField,
  type StudioTableColumn,
} from '@kppdf/features/doc-studio';
import { StudioTableColumnsEditorComponent } from './studio-table-columns-editor.component';
import { StudioTableRowsEditorComponent } from './studio-table-rows-editor.component';

@Component({
  selector: 'pi-studio-table-properties',
  standalone: true,
  imports: [FormsModule, RouterLink, ButtonComponent, LucideAngularModule, StudioTableColumnsEditorComponent, StudioTableRowsEditorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-props" data-test="studio-table-properties">
      <pi-studio-table-columns-editor
        [block]="block"
        [disabled]="disabled"
        [templates]="templates()"
        [loading]="loading()"
        [loadError]="loadError()"
        [selectedTemplateId]="selectedTemplateId()"
        (templateSelect)="onTemplateSelect($event)"
        (columnToggle)="toggleColumn($event.key, $event.event)"
        (fitWidths)="fitColumnWidths()"
        (columnAdd)="addColumn()"
        (standardColumnAdd)="addStandardColumn($event)"
        (columnFieldUpdate)="updateColumnField($event.index, $event.field, $event.raw)"
        (columnMove)="moveColumn($event.index, $event.delta)"
        (columnRemove)="removeColumn($event)"
      />

      <pi-studio-table-rows-editor
        [block]="block"
        [disabled]="disabled"
        (rowAdd)="addTableRow()"
        (rowRemove)="removeTableRow($event)"
        (rowToggle)="toggleTableRow($event.rowIdx, $event.event)"
        (cellChange)="onTableCell($event.rowIdx, $event.colIdx, $event.value)"
        (liveQtyChange)="onLiveQtyCellChange($event.rowIndex, $event.value)"
      />

      @if (!isCatalogRowSource()) {
        <label class="table-props__field" data-test="studio-table-source-field">
          <span class="table-props__label">Источник строк</span>
          <select
            class="table-props__select"
            [ngModel]="rowSource()"
            (ngModelChange)="onSourceSelectChange($event)"
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
      }

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

      @if (hasPhotoColumn()) {
        <div class="table-props__photo-display" data-test="studio-table-photo-display">
          <span class="table-props__label">Фото в ячейке</span>
          <label class="table-props__field">
            <span class="table-props__label">Вписывание</span>
            <select
              class="table-props__select"
              [ngModel]="photoDisplay().fit ?? ''"
              (ngModelChange)="onPhotoFitChange($event)"
              [disabled]="disabled"
              data-test="studio-table-photo-fit"
            >
              <option value="">Как в РАМКЕ фото</option>
              <option value="contain">Вписать (contain)</option>
              <option value="cover">Заполнить (cover)</option>
            </select>
          </label>
          <label class="table-props__field">
            <span class="table-props__label">Макс. высота, px</span>
            <input
              type="number"
              class="table-props__select"
              [ngModel]="photoDisplay().maxHeightPx"
              (ngModelChange)="onPhotoMaxHeightChange($event)"
              [disabled]="disabled"
              min="16"
              max="96"
              step="4"
              data-test="studio-table-photo-max-height"
            />
          </label>
          <p class="table-props__hint">Кадр и панорама — в карточке изделия (кнопка «Рамка»).</p>
        </div>
      }

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
      <p class="table-props__hint">
        Создать, изменить или удалить вид можно только в реестре — здесь «Сохранить как вид таблицы» лишь копирует туда текущую структуру.
      </p>
      <a
        class="table-props__registry-link"
        routerLink="/registries/table-templates"
        target="_blank"
        data-test="studio-table-open-registry"
      >
        <lucide-angular [img]="externalLinkIcon" [size]="12" aria-hidden="true" />
        Реестры → Виды таблиц
      </a>
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
    .table-props__photo-display {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px;
      border: 1px solid var(--color-rule);
      background: var(--color-paper-2);
    }
    .table-props__toggle input {
      flex-shrink: 0;
      margin-top: 1px;
      accent-color: var(--color-gold-deep);
    }
    .table-props__hint {
      margin: 0;
      font-size: 11px;
      line-height: 1.4;
      color: var(--color-muted-foreground);
    }
    .table-props__registry-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 600;
      color: var(--color-gold-deep);
      text-decoration: none;
    }
    .table-props__registry-link:hover {
      text-decoration: underline;
    }
  `],
})
export class StudioTablePropertiesComponent implements OnInit, OnChanges {
  private readonly templatesService = inject(PiTableTemplatesService);

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
  /** TZ-NX-DOCSTUDIO-TABLE-LINE-QTY: qty edit on a live (catalog/КП/заказ) row — stored as a per-row override on the block, not a rows[] rewrite. */
  @Output() readonly liveQtyChange = new EventEmitter<{ rowIndex: number; value: string }>();

  protected readonly templates = signal<readonly TableTemplate[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly selectedTemplateId = signal('');
  protected readonly externalLinkIcon = ArrowUpRight;

  protected rowSource(): string {
    return studioTableRowSource(this.block);
  }

  /**
   * TZ-NX-DOCSTUDIO-TABLE-ROWS-SOURCE-CLEANUP — an already-wired catalog
   * table (normally via Выбрано → Insert) shows no source control at all
   * here: the necessity-cleanup wave's own status+«Обновить»/«Сменить…» was
   * itself a dup of the Insert button the operator already clicked
   * (`onCatalogSelectionChange` already re-`putDataSet`s on every buffer
   * change), and re-exposing the plain enum underneath it invited changing
   * `kind` outside the Insert flow it's bound to. Changing kind on a wired
   * catalog table means a fresh Insert (or deleting the layer), not this
   * select. КП/заказ/manual keep the plain select below — those are
   * genuinely the only way to reach that source.
   */
  protected isCatalogRowSource(): boolean {
    return this.rowSource().startsWith('catalog-');
  }

  protected onSourceSelectChange(
    source: 'manual' | 'quotation-items' | 'order-items' | 'catalog-products' | 'catalog-modules' | 'catalog-parts' | 'catalog-materials',
  ): void {
    this.sourceChange.emit(source);
  }

  /** TZ-NX-DOCSTUDIO-TABLE-LINE-QTY — live (catalog/КП/заказ) rows, separate from the manual rows-editor matrix. */
  protected onLiveQtyCellChange(rowIndex: number, value: string | number | null): void {
    this.liveQtyChange.emit({ rowIndex, value: value == null ? '' : String(value) });
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

  ngOnInit(): void {
    this.syncSelectedId();
    void this.loadTemplates();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['block'] && !changes['block'].firstChange) {
      this.syncSelectedId();
    }
  }

  protected transparentBackground(): boolean {
    return studioTableTransparentBackground(this.block);
  }

  protected toggleTransparentBackground(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.settingsChange.emit({ tableTransparentBackground: checked });
  }

  /** TZ-NX-PO-SWEEP-05 — only offer the «Фото в ячейке» section when a photo column exists. */
  protected hasPhotoColumn(): boolean {
    return studioTableColumns(this.block).some((col) => isStudioPhotoColumnKey(col.key));
  }

  protected photoDisplay(): { fit: 'contain' | 'cover' | null; maxHeightPx: number } {
    return studioTablePhotoDisplay(this.block);
  }

  protected onPhotoFitChange(value: string): void {
    const fit = value === 'contain' || value === 'cover' ? value : null;
    this.settingsChange.emit({
      tablePhotoDisplay: { ...this.photoDisplay(), fit },
    });
  }

  /** `type="number"`'s NumberValueAccessor emits a `number` (or `null` when cleared) — see the row-qty note below for the same reason. */
  protected onPhotoMaxHeightChange(value: number | null): void {
    if (value == null || !Number.isFinite(value)) return;
    const maxHeightPx = Math.min(96, Math.max(16, Math.round(value)));
    this.settingsChange.emit({
      tablePhotoDisplay: { ...this.photoDisplay(), maxHeightPx },
    });
  }

  protected onTemplateSelect(templateId: string): void {
    if (!templateId) return;
    const template = this.templates().find((t) => t._id === templateId);
    if (!template) return;
    this.selectedTemplateId.set(templateId);
    this.settingsChange.emit(buildTableSettingsFromTemplate(template));
  }

  protected addColumn(): void {
    const next = [...studioTableColumns(this.block), createStudioTableColumn(studioTableColumns(this.block))];
    this.emitColumnStructure(next);
  }

  protected fitColumnWidths(): void {
    this.emitColumnStructure(fitColumnWidthsByHeader(studioTableColumns(this.block)));
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
    const healedColumns = healStudioTableColumns(nextColumns);
    const rows = remapRowsForColumnChange(prevColumns, healedColumns, studioTableRows(this.block));
    const hidden = filterHiddenColumnKeysForColumns(studioTableHiddenColumnKeys(this.block), healedColumns);
    this.settingsChange.emit({
      tableTemplateColumns: healedColumns,
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
