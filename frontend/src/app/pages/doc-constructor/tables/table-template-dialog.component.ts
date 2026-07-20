import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CdkDropList, CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { PiDialogComponent } from '../../../shared/ui/dialog/pi-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../../shared/ui/dialog/pi-dialog.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import {
  TableColumn,
  TableTemplate,
  TableTemplatesService,
  type ColumnType,
} from '../../../shared/services/pi-table-templates.service';
import {
  RegistryService,
  type DataSourceDescriptor,
  type FieldDescriptor,
} from '../../../shared/services/pi-registry.service';
import { extractErrorMessage, SilentResult } from '../../../core/silent-http';
import { PiToastService } from '../../../shared/ui/toast';

// ─── Types ────────────────────────────────────────────────────

type TableColumnForm = FormGroup<{
  key: FormControl<string>;
  label: FormControl<string>;
  type: FormControl<ColumnType>;
  width: FormControl<number>;
  align: FormControl<'left' | 'center' | 'right'>;
  format: FormControl<string>;
  required: FormControl<boolean>;
}>;

type DialogMode = 'new' | 'from-registry' | 'duplicate';

export interface TableTemplateDialogConfig {
  template?: TableTemplate | null;
  mode?: DialogMode;
}

// ─── Constants ────────────────────────────────────────────────

const COLUMN_TYPES: Array<{ key: ColumnType; label: string }> = [
  { key: 'text', label: 'Текст' },
  { key: 'number', label: 'Число' },
  { key: 'currency', label: 'Валюта (₽)' },
  { key: 'date', label: 'Дата' },
  { key: 'bool', label: 'Да / Нет' },
];

const GROUP_LABELS: Record<string, string> = {
  contacts: 'Контакты',
  catalog: 'Каталог',
  work: 'Работы',
};

interface ClientPreviewModel {
  name: string;
  description: string;
  columns: TableColumn[];
  rows: unknown[][];
}

// ─── Component ────────────────────────────────────────────────

@Component({
  selector: 'app-table-template-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CdkDropList, CdkDrag, PiDialogComponent, ButtonComponent],
  template: `
    <app-pi-dialog
      [title]="dialogTitle()"
      variant="form"
      [width]="'xl'"
      [maxWidth]="'100vw'"
      [showClose]="true"
    >
      <div body class="ttd-body" [formGroup]="form">
        <!-- ─── Settings (top) ─── -->
        <section class="ttd-settings">
          <div class="ttd-settings-row">
            <label class="ttd-field ttd-field--grow">
              <span class="eyebrow text-muted-foreground">Название *</span>
              <input class="ttd-input" formControlName="name" placeholder="Спецификация товаров" data-test="name-input" />
            </label>
            <label class="ttd-field ttd-field--grow">
              <span class="eyebrow text-muted-foreground">Описание</span>
              <input class="ttd-input" formControlName="description" placeholder="Краткое описание назначения" />
            </label>
            <div class="ttd-field">
              <span class="eyebrow text-muted-foreground">Категория</span>
              <div class="ttd-pills">
                @for (c of categoryOptions; track c.key) {
                  <button type="button" class="ttd-pill" [class.is-active]="form.controls.category.value === c.key" (click)="form.controls.category.setValue(c.key)">{{ c.label }}</button>
                }
              </div>
            </div>
          </div>

          @if (mode() === 'from-registry') {
            <div class="ttd-settings-row">
              <div class="ttd-field ttd-field--grow">
                <span class="eyebrow text-muted-foreground">Источник данных</span>
                @if (sourcesLoading()) {
                  <p class="text-xs text-muted-foreground">Загрузка…</p>
                } @else {
                  <select class="ttd-input" [value]="selectedSourceKey() ?? ''" (change)="onSourceChange($event)" data-test="source-select">
                    <option value="">— не выбран —</option>
                    @for (group of sourceGroups(); track group.label) {
                      <optgroup [label]="group.label">
                        @for (src of group.sources; track src.key) {
                          <option [value]="src.key">{{ src.label }}</option>
                        }
                      </optgroup>
                    }
                  </select>
                }
              </div>
              @if (selectedSource(); as src) {
                <div class="ttd-field ttd-field--grow">
                  <div class="ttd-field-header">
                    <span class="eyebrow text-muted-foreground">Поля источника</span>
                    <span class="text-[10px] text-muted-foreground">{{ selectedFields().length }}/{{ src.fields.length }} выбрано</span>
                  </div>
                  <div class="ttd-field-list">
                    @for (field of src.fields; track field.key) {
                      <label class="ttd-field-check">
                        <input type="checkbox" [checked]="selectedFieldKeys().has(field.key)" (change)="toggleField(field)" />
                        <span class="ttd-field-check-label">{{ field.label }}</span>
                        <span class="ttd-field-check-type">{{ field.type }}</span>
                      </label>
                    }
                  </div>
                </div>
              }
              <div class="ttd-settings-inline">
                <label class="ttd-meta-item">
                  <span class="eyebrow text-muted-foreground">Порядок</span>
                  <input class="ttd-order-input font-mono" type="number" formControlName="sortOrder" />
                </label>
                <label class="ttd-active-check">
                  <input type="checkbox" formControlName="isActive" />
                  <span class="text-sm">Активен</span>
                </label>
              </div>
            </div>
          } @else {
            <div class="ttd-settings-row ttd-settings-row--meta">
              <label class="ttd-meta-item">
                <span class="eyebrow text-muted-foreground">Порядок</span>
                <input class="ttd-order-input font-mono" type="number" formControlName="sortOrder" />
              </label>
              <label class="ttd-active-check">
                <input type="checkbox" formControlName="isActive" />
                <span class="text-sm">Активен</span>
              </label>
            </div>
          }
        </section>

        <!-- ─── Unified: columns + preview ─── -->
        <div class="ttd-main">
          <!-- Column definitions -->
          <section class="ttd-columns">
            <div class="ttd-columns-head">
              <h3 class="eyebrow m-0">Столбцы</h3>
              <button type="button" class="ttd-link" (click)="addColumn()" data-test="add-column-button">+ Добавить столбец</button>
            </div>
            <div class="ttd-columns-scroll">
              <table class="ttd-table">
                <thead>
                  <tr>
                    <th class="ttd-th ttd-th--num">#</th>
                    <th class="ttd-th ttd-th--key">Ключ</th>
                    <th class="ttd-th ttd-th--label">Заголовок</th>
                    @if (mode() !== 'from-registry') {
                      <th class="ttd-th ttd-th--type">Тип</th>
                    }
                    <th class="ttd-th ttd-th--width">Ширина</th>
                    <th class="ttd-th ttd-th--align">Выравнив.</th>
                    <th class="ttd-th ttd-th--format">Формат</th>
                    <th class="ttd-th ttd-th--req">Обяз.</th>
                    <th class="ttd-th ttd-th--actions"></th>
                  </tr>
                </thead>
                <tbody formArrayName="columns" cdkDropList (cdkDropListDropped)="onColumnDrop($event)">
                  @for (col of columnsArray.controls; track $index; let i = $index) {
                    <tr [formGroupName]="i" cdkDrag [cdkDragData]="col" class="ttd-tr">
                      <td class="ttd-td ttd-td--num">
                        <span class="ttd-drag" cdkDragHandle>&#x2630;</span>
                        <span class="text-muted-foreground">{{ i + 1 }}</span>
                      </td>
                      <td class="ttd-td"><input class="ttd-cell-input font-mono" formControlName="key" placeholder="article" /></td>
                      <td class="ttd-td"><input class="ttd-cell-input" formControlName="label" placeholder="Наименование" /></td>
                      @if (mode() !== 'from-registry') {
                        <td class="ttd-td">
                          <select class="ttd-cell-input" formControlName="type">
                            @for (t of columnTypes; track t.key) { <option [value]="t.key">{{ t.label }}</option> }
                          </select>
                        </td>
                      }
                      <td class="ttd-td"><input class="ttd-cell-input font-mono text-center" type="number" formControlName="width" min="20" max="800" /></td>
                      <td class="ttd-td">
                        <div class="ttd-align-group">
                          <button type="button" class="ttd-align-btn" [class.is-active]="col.controls.align.value === 'left'" (click)="col.controls.align.setValue('left')">&#x2261;</button>
                          <button type="button" class="ttd-align-btn" [class.is-active]="col.controls.align.value === 'center'" (click)="col.controls.align.setValue('center')">&#x2261;</button>
                          <button type="button" class="ttd-align-btn" [class.is-active]="col.controls.align.value === 'right'" (click)="col.controls.align.setValue('right')">&#x2261;</button>
                        </div>
                      </td>
                      <td class="ttd-td"><input class="ttd-cell-input font-mono" formControlName="format" placeholder="—" /></td>
                      <td class="ttd-td ttd-td--req"><input type="checkbox" formControlName="required" /></td>
                      <td class="ttd-td ttd-td--actions">
                        <div class="ttd-col-actions">
                          <button type="button" class="ttd-icon-btn" [disabled]="i === 0" (click)="moveColumn(i, -1)" title="Влево">&#x2190;</button>
                          <button type="button" class="ttd-icon-btn" [disabled]="i === columnsArray.controls.length - 1" (click)="moveColumn(i, 1)" title="Вправо">&#x2192;</button>
                          <button type="button" class="ttd-icon-btn ttd-icon-btn--danger" (click)="removeColumn(i)" title="Удалить">&#x00D7;</button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
              @if (columnsArray.controls.length === 0) {
                <p class="ttd-empty text-muted-foreground text-sm text-center py-6">
                  Нажмите «+ Добавить столбец» или выберите источник данных
                </p>
              }
            </div>
          </section>

          <!-- Preview (rendered table) -->
          @if (clientPreview(); as preview) {
            <section class="ttd-preview">
              <div class="ttd-preview-head">
                <span class="eyebrow">Предпросмотр</span>
              </div>
              <div class="ttd-preview-body">
                <div class="ttd-preview-doc">
                  <div class="ttd-preview-doc-head">
                    <h3 class="font-display text-center">{{ preview.name }}</h3>
                    @if (preview.description) { <p class="text-sm text-muted-foreground text-center">{{ preview.description }}</p> }
                    @if (mode() === 'from-registry' && selectedSource(); as src) {
                      <p class="text-[10px] text-muted-foreground text-center mt-1">Источник: {{ src.label }}</p>
                    }
                  </div>
                  <div class="ttd-preview-table">
                    <div class="ttd-preview-row ttd-preview-row--head" [style.grid-template-columns]="previewGrid(preview.columns)">
                      @for (col of preview.columns; track col.key) {
                        <div class="ttd-preview-cell eyebrow" [style.text-align]="col.align">{{ col.label }}</div>
                      }
                    </div>
                    @for (row of preview.rows; track $index) {
                      <div class="ttd-preview-row" [style.grid-template-columns]="previewGrid(preview.columns)">
                        @for (cell of row; track $index; let ci = $index) {
                          <div class="ttd-preview-cell" [style.text-align]="preview.columns[ci]?.align ?? 'left'">
                            {{ formatCell(cell, preview.columns[ci]?.type ?? 'text') }}
                          </div>
                        }
                      </div>
                    }
                    @if (preview.rows.length === 0) {
                      <p class="text-muted-foreground text-xs text-center py-4">
                        {{ mode() === 'from-registry' ? 'Данные будут подставлены при вставке в документ' : 'Заполните образцы строк' }}
                      </p>
                    }
                  </div>
                </div>
              </div>
            </section>
          }
        </div>
      </div>

      <div footer class="ttd-footer">
        @if (errorMessage()) { <span class="text-sm text-destructive mr-auto">{{ errorMessage() }}</span> }
        @if (validationError()) { <span class="text-sm text-destructive mr-auto">{{ validationError() }}</span> }
        <app-pi-button variant="ghost" (click)="ref.close(null)" data-test="cancel-button">Отмена</app-pi-button>
        <app-pi-button variant="default" [disabled]="form.invalid || saving()" (click)="onSave()" data-test="save-button">
          {{ saving() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
  styles: [`
    :host ::ng-deep app-pi-dialog { display: block; overflow: hidden; }
    :host ::ng-deep app-pi-dialog > div[role='dialog'] {
      border-radius: 0; border-width: 2px; border-color: var(--color-ink);
      width: calc(100vw - 48px); max-width: 1400px;
      max-height: min(calc(100vh - 48px), 88vh);
      margin: 24px auto; overflow: hidden;
    }
    :host ::ng-deep app-pi-dialog header { border-bottom: 2px solid var(--color-ink); flex-shrink: 0; }
    :host ::ng-deep app-pi-dialog > div[role='dialog'] > div:nth-child(2) { flex: 1; min-height: 0; overflow: hidden; }
    :host ::ng-deep app-pi-dialog footer { border-top: 2px solid var(--color-ink); flex-shrink: 0; }

    .ttd-body { display: flex; flex-direction: column; padding: 0; }

    /* ─── Settings ─── */
    .ttd-settings { padding: 10px 16px; border-bottom: 2px solid var(--color-ink); display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
    .ttd-settings-row { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
    .ttd-settings-row--meta { align-items: center; }
    .ttd-settings-inline { display: flex; align-items: center; gap: 12px; flex-shrink: 0; margin-left: auto; }

    /* ─── Main (scrollable, columns + preview stacked) ─── */
    .ttd-main { display: flex; flex-direction: column; }

    /* ─── Column definitions ─── */
    .ttd-columns { flex-shrink: 0; }
    .ttd-columns-head { display: flex; align-items: center; justify-content: space-between; padding: 6px 16px; border-bottom: 1px solid var(--color-rule); }
    .ttd-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .ttd-th { padding: 6px 5px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-muted-foreground-strong); background: var(--color-paper-2); border-bottom: 2px solid var(--color-ink); white-space: nowrap; }
    .ttd-th--num { width: 42px; text-align: center; }
    .ttd-th--key { width: 110px; }
    .ttd-th--label { width: 150px; }
    .ttd-th--type { width: 100px; }
    .ttd-th--width { width: 56px; }
    .ttd-th--align { width: 72px; }
    .ttd-th--format { width: 80px; }
    .ttd-th--req { width: 36px; text-align: center; }
    .ttd-th--actions { width: 64px; text-align: center; }
    .ttd-tr { border-bottom: 1px solid var(--color-rule); transition: background 100ms ease; }
    .ttd-tr:hover { background: var(--color-paper-2); }
    .ttd-td { padding: 3px 5px; vertical-align: middle; }
    .ttd-td--num { text-align: center; display: flex; align-items: center; justify-content: center; gap: 3px; }
    .ttd-td--req { text-align: center; }
    .ttd-td--actions { text-align: center; white-space: nowrap; }
    .ttd-cell-input { width: 100%; padding: 3px 5px; font-size: 12px; border: 1px solid transparent; border-radius: 3px; background: transparent; color: var(--color-ink); }
    .ttd-cell-input:hover { border-color: var(--color-rule); }
    .ttd-cell-input:focus { outline: none; border-color: var(--color-sunrise-warm); background: var(--color-paper); }
    .ttd-drag { cursor: grab; color: var(--color-muted-foreground-strong); font-size: 11px; }
    .ttd-drag:active { cursor: grabbing; }
    .ttd-align-group { display: flex; border: 1px solid var(--color-rule); border-radius: 3px; overflow: hidden; }
    .ttd-align-btn { padding: 2px 8px; border: none; border-right: 1px solid var(--color-rule); background: var(--color-paper); color: var(--color-muted-foreground-strong); cursor: pointer; font-size: 11px; min-width: 24px; text-align: center; }
    .ttd-align-btn:last-child { border-right: none; }
    .ttd-align-btn.is-active { background: var(--color-ink); color: var(--color-paper); }
    .ttd-col-actions { display: flex; align-items: center; justify-content: center; gap: 2px; }
    .ttd-icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; padding: 0; border: 1px solid transparent; border-radius: 3px; background: transparent; color: var(--color-muted-foreground-strong); cursor: pointer; font-size: 12px; transition: all 120ms ease; }
    .ttd-icon-btn:hover { background: var(--color-paper-2); color: var(--color-ink); border-color: var(--color-rule); }
    .ttd-icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .ttd-icon-btn:disabled:hover { background: transparent; color: var(--color-muted-foreground-strong); border-color: transparent; }
    .ttd-icon-btn--danger:hover { color: var(--color-destructive); background: color-mix(in oklch, var(--color-destructive) 8%, transparent); }
    .ttd-empty { padding: 24px; }

    /* ─── Preview (rendered table) ─── */
    .ttd-preview { flex-shrink: 0; border-top: 2px solid var(--color-ink); background: var(--color-paper-2); }
    .ttd-preview-head { display: flex; align-items: center; justify-content: space-between; padding: 4px 12px; background: var(--color-paper); border-bottom: 1px solid var(--color-rule); }
    .ttd-preview-body { padding: 8px 12px; max-height: 200px; overflow-y: auto; }
    .ttd-preview-doc { width: 100%; background: var(--color-paper); border: 1px solid var(--color-ink); font-size: 11px; }
    .ttd-preview-doc-head { padding: 6px; }
    .ttd-preview-doc-head h3 { margin: 0; font-size: 14px; }
    .ttd-preview-table { width: 100%; }
    .ttd-preview-row { display: grid; border-bottom: 1px solid var(--color-rule); }
    .ttd-preview-row--head { background: var(--color-paper-2); border-bottom: 1px solid var(--color-ink); }
    .ttd-preview-cell { padding: 3px 5px; font-size: 10px; border-right: 1px solid var(--color-rule); word-break: break-word; overflow: hidden; text-overflow: ellipsis; }
    .ttd-preview-cell:last-child { border-right: none; }

    /* ─── Shared form primitives ─── */
    .ttd-field { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .ttd-field--grow { flex: 1 1 180px; }
    .ttd-field-header { display: flex; align-items: center; justify-content: space-between; }
    .ttd-input { width: 100%; padding: 5px 8px; font-size: 13px; border: 1px solid var(--color-rule); border-radius: 4px; background: transparent; color: var(--color-ink); }
    .ttd-input:focus { outline: none; border-color: var(--color-sunrise-warm); outline: 2px solid var(--color-sunrise-warm); outline-offset: -1px; }
    .ttd-pills { display: flex; flex-wrap: wrap; gap: 4px; }
    .ttd-pill { padding: 3px 8px; font-size: 11px; font-weight: 500; border: 1px solid var(--color-rule); border-radius: 4px; background: var(--color-paper-2); color: var(--color-muted-foreground-strong); cursor: pointer; }
    .ttd-pill.is-active { background: var(--color-ink); border-color: var(--color-ink); color: var(--color-paper); }
    .ttd-link { padding: 0; border: none; background: transparent; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-sunrise-warm); cursor: pointer; }
    .ttd-link:hover { color: var(--color-ink); }
    .ttd-link:disabled { opacity: 0.4; cursor: not-allowed; }
    .ttd-meta-item { display: flex; align-items: center; gap: 6px; }
    .ttd-order-input { width: 56px; padding: 5px 6px; text-align: center; border: 1px solid var(--color-rule); border-radius: 4px; font-size: 13px; }
    .ttd-active-check { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px; }
    .ttd-field-list { max-height: 100px; overflow-y: auto; border: 1px solid var(--color-rule); border-radius: 4px; background: var(--color-paper); }
    .ttd-field-check { display: flex; align-items: center; gap: 6px; padding: 3px 8px; font-size: 11px; cursor: pointer; border-bottom: 1px solid var(--color-rule); }
    .ttd-field-check:last-child { border-bottom: none; }
    .ttd-field-check:hover { background: var(--color-paper-2); }
    .ttd-field-check input[type="checkbox"] { width: 12px; height: 12px; accent-color: var(--color-ink); }
    .ttd-field-check-label { flex: 1; color: var(--color-ink); }
    .ttd-field-check-type { font-size: 9px; font-family: monospace; color: var(--color-muted-foreground-strong); background: var(--color-paper-2); padding: 1px 4px; border-radius: 2px; }

    .cdk-drag-preview { background: var(--color-paper); border: 1px solid var(--color-ink); opacity: 0.9; }
    .cdk-drag-placeholder { opacity: 0.3; background: var(--color-sunrise-soft); }

    .ttd-footer { display: flex; align-items: center; justify-content: flex-end; gap: 12px; width: 100%; }
  `],
})
export class TableTemplateFormDialogComponent {
  // ─── Inject ────────────────────────────────────────────────
  private readonly rawConfig = inject(PI_DIALOG_DATA) as TableTemplateDialogConfig | TableTemplate | null;
  protected readonly ref = inject<DialogRef<TableTemplate | null>>(PI_DIALOG_REF);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(TableTemplatesService);
  private readonly registry = inject(RegistryService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);

  // ─── Data ──────────────────────────────────────────────────
  protected readonly data: TableTemplate | null =
    this.isConfig(this.rawConfig) ? (this.rawConfig.template ?? null) : (this.rawConfig as TableTemplate | null);

  // ─── Constants ─────────────────────────────────────────────
  protected readonly columnTypes = COLUMN_TYPES;
  protected readonly categoryOptions: Array<{ key: NonNullable<TableTemplate['category']>; label: string }> = [
    { key: 'product-spec', label: 'Спецификация' },
    { key: 'cost-calc', label: 'Калькуляция' },
    { key: 'order-summary', label: 'Сводка заказа' },
    { key: 'price-list', label: 'Прайс-лист' },
    { key: 'custom', label: 'Прочее' },
  ];

  // ─── Mode ──────────────────────────────────────────────────
  protected readonly mode = signal<DialogMode>(this.resolveInitialMode());
  protected readonly dialogTitle = computed(() => {
    if (this.data) return 'Редактировать шаблон таблицы';
    if (this.mode() === 'duplicate') return 'Дубликат шаблона таблицы';
    return 'Новый шаблон таблицы';
  });

  // ─── Registry state ────────────────────────────────────────
  protected readonly allSources = signal<DataSourceDescriptor[]>([]);
  protected readonly sourcesLoading = signal(false);
  protected readonly selectedSourceKey = signal<string | null>(this.data?.dataSource ?? null);
  protected readonly selectedFieldKeys = signal<Set<string>>(new Set(
    (this.data?.columns ?? []).map((c) => c.key),
  ));
  protected readonly selectedSource = computed(() =>
    this.allSources().find((s) => s.key === this.selectedSourceKey()) ?? null,
  );
  protected readonly selectedFields = computed(() =>
    this.selectedSource()?.fields.filter((f) => this.selectedFieldKeys().has(f.key)) ?? [],
  );
  protected readonly sourceGroups = computed(() => {
    const map = new Map<string, DataSourceDescriptor[]>();
    for (const src of this.allSources()) {
      const label = GROUP_LABELS[src.group] ?? src.group;
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(src);
    }
    return Array.from(map.entries()).map(([label, sources]) => ({ label, sources }));
  });

  // ─── Form ──────────────────────────────────────────────────
  protected readonly form = this.fb.group({
    name: this.fb.control(this.data?.name ?? '', [Validators.required, Validators.maxLength(200)]),
    description: this.fb.control(this.data?.description ?? '', []),
    category: this.fb.control<NonNullable<TableTemplate['category']>>(this.data?.category ?? 'product-spec', [Validators.required]),
    columns: this.fb.array<TableColumnForm>((this.data?.columns ?? []).map((c) => this.makeColumnControl(c))),
    sampleRowsJson: this.fb.control(this.data?.sampleRows ? JSON.stringify(this.data.sampleRows, null, 2) : '', []),
    sortOrder: this.fb.control(this.data?.sortOrder ?? 0, []),
    isActive: this.fb.control(this.data?.isActive ?? true, []),
  });
  protected get columnsArray(): FormArray<TableColumnForm> { return this.form.controls.columns; }

  // ─── Preview ───────────────────────────────────────────────
  protected readonly previewHtml = signal<string | null>(null);
  protected readonly previewLoading = signal(false);
  private readonly previewTick = signal(0);
  protected readonly clientPreview = computed<ClientPreviewModel | null>(() => {
    this.previewTick();
    const v = this.form.getRawValue();
    const columns = (v.columns ?? [])
      .filter((c) => c.label?.trim())
      .map((c) => ({
        key: (c.key ?? '').trim(),
        label: (c.label ?? '').trim(),
        type: (c.type ?? 'text') as ColumnType,
        width: Number(c.width ?? 100),
        align: (c.align ?? 'left') as 'left' | 'center' | 'right',
        ...(c.format?.trim() ? { format: c.format.trim() } : {}),
      }));
    if (columns.length === 0) return null;
    let rows: unknown[][] = [];
    const json = (v.sampleRowsJson ?? '').trim();
    if (json) {
      try {
        const parsed = JSON.parse(json) as unknown;
        if (Array.isArray(parsed)) rows = parsed.filter(Array.isArray) as unknown[][];
      } catch { return null; }
    }
    return { name: v.name?.trim() || 'Новый шаблон', description: v.description?.trim() ?? '', columns, rows };
  });

  // ─── Status ────────────────────────────────────────────────
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly validationError = signal<string | null>(null);

  // ─── Constructor ───────────────────────────────────────────
  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.previewTick.update((n) => n + 1));
    this.loadSources();
    queueMicrotask(() => { if (this.data) this.loadPreview(); });
  }

  // ─── Registry methods ──────────────────────────────────────
  protected onSourceChange(event: Event): void {
    const key = (event.target as HTMLSelectElement).value || null;
    this.selectedSourceKey.set(key);
    this.selectedFieldKeys.set(new Set());
    this.syncColumnsFromFields();
  }

  protected toggleField(field: FieldDescriptor): void {
    const keys = new Set(this.selectedFieldKeys());
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    keys.has(field.key) ? keys.delete(field.key) : keys.add(field.key);
    this.selectedFieldKeys.set(keys);
    this.syncColumnsFromFields();
  }

  // ─── Column methods ────────────────────────────────────────
  protected addColumn(): void { this.columnsArray.push(this.makeColumnControl()); }
  protected removeColumn(i: number): void { this.columnsArray.removeAt(i); }
  protected moveColumn(i: number, delta: -1 | 1): void {
    const t = i + delta;
    if (t < 0 || t >= this.columnsArray.length) return;
    const c = this.columnsArray.at(i);
    this.columnsArray.removeAt(i);
    this.columnsArray.insert(t, c);
  }
  protected onColumnDrop(event: CdkDragDrop<TableColumnForm[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    const c = this.columnsArray.at(event.previousIndex);
    this.columnsArray.removeAt(event.previousIndex);
    this.columnsArray.insert(event.currentIndex, c);
    this.previewTick.update((n) => n + 1);
  }

  // ─── Save ──────────────────────────────────────────────────
  protected onSave(): void {
    if (this.form.invalid || this.saving()) return;
    const vErr = this.validate();
    if (vErr) { this.validationError.set(vErr); return; }
    this.validationError.set(null);
    this.saving.set(true);
    this.errorMessage.set(null);

    const v = this.form.getRawValue();
    const columns: TableColumn[] = (v.columns as TableColumnForm['value'][]).map((c) => ({
      key: (c.key ?? '').trim(),
      label: (c.label ?? '').trim(),
      type: (c.type ?? 'text') as ColumnType,
      width: Number(c.width ?? 100),
      align: (c.align ?? 'left') as 'left' | 'center' | 'right',
      ...(c.format?.trim() ? { format: c.format.trim() } : {}),
    }));
    let sampleRows: unknown[][] | undefined;
    const json = v.sampleRowsJson.trim();
    if (json) sampleRows = JSON.parse(json);

    const payload: Partial<TableTemplate> = {
      name: v.name,
      ...(v.description ? { description: v.description } : {}),
      category: v.category,
      columns,
      ...(sampleRows ? { sampleRows } : {}),
      sortOrder: v.sortOrder,
      isActive: v.isActive,
      ...(this.mode() === 'from-registry' && this.selectedSourceKey() ? { dataSource: this.selectedSourceKey()! } : {}),
    };

    const obs = this.data ? this.service.update(this.data._id, payload) : this.service.create(payload);
    obs.subscribe((res: SilentResult<TableTemplate>) => {
      this.saving.set(false);
      if (res.ok) {
        this.toast.success(this.data ? 'Шаблон таблицы обновлён' : 'Шаблон таблицы создан');
        this.ref.close(res.data);
      } else {
        const msg = extractErrorMessage(res.error as HttpErrorResponse);
        this.errorMessage.set(msg);
        this.toast.error(msg);
      }
    });
  }

  // ─── Preview ───────────────────────────────────────────────
  protected loadPreview(): void {
    if (!this.data) return;
    this.previewLoading.set(true);
    this.service.preview(this.data._id).subscribe((res: SilentResult<string>) => {
      this.previewLoading.set(false);
      if (res.ok) this.previewHtml.set(res.data); else this.previewHtml.set(null);
    });
  }

  protected previewGrid(columns: TableColumn[]): string {
    const MAX = 680;
    const widths = columns.map((c) => Math.max(20, c.width));
    const total = widths.reduce((a, b) => a + b, 0);
    return total <= MAX
      ? widths.map((w) => `${w}px`).join(' ')
      : widths.map((w) => `${Math.round(w * (MAX / total))}px`).join(' ');
  }

  protected formatCell(value: unknown, type: ColumnType): string {
    if (value == null || value === '') return '—';
    if (type === 'bool') return value ? 'Да' : 'Нет';
    if (type === 'number') { const n = Number(value); return Number.isFinite(n) ? new Intl.NumberFormat('ru-RU').format(n) : String(value); }
    if (type === 'currency') { const n = Number(value); return Number.isFinite(n) ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(n) : String(value); }
    if (type === 'date') { const d = new Date(String(value)); return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('ru-RU'); }
    return String(value);
  }

  // ─── Private ───────────────────────────────────────────────
  private resolveInitialMode(): DialogMode {
    if (this.isConfig(this.rawConfig) && this.rawConfig.mode) return this.rawConfig.mode;
    if (this.data?.dataSource) return 'from-registry';
    return 'new';
  }

  private isConfig(v: unknown): v is TableTemplateDialogConfig {
    return v != null && typeof v === 'object' && !Array.isArray(v) && ('mode' in v || 'template' in v);
  }

  private loadSources(): void {
    this.sourcesLoading.set(true);
    this.registry.getDataSources().subscribe((res) => {
      this.sourcesLoading.set(false);
      if (res.ok) this.allSources.set(res.data.sources);
    });
  }

  private syncColumnsFromFields(): void {
    const fields = this.selectedFields();
    const prev = new Map<string, { width: number; align: 'left' | 'center' | 'right'; format: string }>();
    for (const ctrl of this.columnsArray.controls) {
      const v = ctrl.value;
      if (v.key) prev.set(v.key, { width: v.width ?? 100, align: v.align ?? 'left', format: v.format ?? '' });
    }
    while (this.columnsArray.length > 0) this.columnsArray.removeAt(0);
    for (const field of fields) {
      const saved = prev.get(field.key);
      this.columnsArray.push(this.makeColumnControl({
        key: field.key,
        label: field.label,
        type: field.type as ColumnType,
        width: saved?.width ?? 120,
        align: saved?.align ?? (field.type === 'number' || field.type === 'currency' ? 'right' : 'left'),
        format: saved?.format ?? '',
      }));
    }
    this.previewTick.update((n) => n + 1);
  }

  private validate(): string | null {
    const keys = this.columnsArray.controls.map((c) => c.controls.key.value.trim()).filter(Boolean);
    if (new Set(keys).size !== keys.length) return 'Ключи колонок должны быть уникальными.';
    const json = this.form.controls.sampleRowsJson.value.trim();
    if (json) {
      try {
        const parsed: unknown = JSON.parse(json);
        if (!Array.isArray(parsed)) return 'Образцы строк должны быть массивом массивов.';
        for (const row of parsed) { if (!Array.isArray(row)) return 'Каждая строка образца — массив значений.'; }
      } catch { return 'Некорректный JSON в образцах строк.'; }
    }
    return null;
  }

  private makeColumnControl(c?: TableColumn): TableColumnForm {
    const s = c ?? { key: '', label: '', type: 'text' as ColumnType, width: 100, align: 'left' as const };
    return this.fb.group({
      key: this.fb.control(s.key, [Validators.required, Validators.maxLength(50)]),
      label: this.fb.control(s.label, [Validators.required, Validators.maxLength(100)]),
      type: this.fb.control<ColumnType>(s.type, [Validators.required]),
      width: this.fb.control(s.width, [Validators.required, Validators.min(20), Validators.max(800)]),
      align: this.fb.control<'left' | 'center' | 'right'>(s.align, [Validators.required]),
      format: this.fb.control(s.format ?? '', []),
      required: this.fb.control(false, []),
    });
  }
}
