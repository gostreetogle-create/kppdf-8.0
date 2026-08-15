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
import {
  LucideAngularModule,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-angular';
import { PiDialogComponent } from '../../../shared/ui/dialog/pi-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../../shared/ui/dialog/pi-dialog.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { SwitchComponent } from '../../../shared/ui/switch/switch.component';
import {
  PiOverflowSelectComponent,
  type PiOverflowSelectItem,
} from '../../../shared/ui/overflow-select/pi-overflow-select.component';
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

const COLUMN_TYPE_ITEMS: PiOverflowSelectItem[] = COLUMN_TYPES.map((type) => ({
  id: type.key,
  label: type.label,
}));

/** Keep this mirror aligned with backend KP_LINE_ITEM_COLUMNS and TZ-SALES-325 aliases. */
const KP_LINE_ITEM_PRESET_COLUMNS: readonly TableColumn[] = [
  { key: 'index', label: '№', type: 'number', width: 56, align: 'center' },
  { key: 'productName', label: 'Наименование', type: 'text', width: 260, align: 'left' },
  { key: 'quantity', label: 'Кол-во', type: 'number', width: 88, align: 'right' },
  { key: 'unit', label: 'Ед.', type: 'text', width: 72, align: 'center' },
  { key: 'unitPrice', label: 'Цена', type: 'currency', width: 120, align: 'right' },
  { key: 'sum', label: 'Сумма', type: 'currency', width: 128, align: 'right' },
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
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    SwitchComponent,
    PiOverflowSelectComponent,
  ],
  template: `
    <app-pi-dialog
      [title]="dialogTitle()"
      variant="form"
      [width]="'xl'"
      [maxWidth]="'min(1400px, calc(100vw - 2rem))'"
      [showClose]="true"
    >
      <div body class="ttd-body" [formGroup]="form">
        <!-- ─── Settings (top) ─── -->
        <section class="ttd-settings">
          <!-- Dense settings row: name, description, type, order, active. -->
          <div class="ttd-settings-row ttd-settings-row--main">
            <app-pi-form-field
              class="ttd-field ttd-field--name"
              label="Название"
              htmlFor="ttd-name"
              [required]="true"
            >
              <app-pi-input
                id="ttd-name"
                formControlName="name"
                placeholder="Спецификация товаров"
                data-test="name-input"
              />
            </app-pi-form-field>
            <app-pi-form-field
              class="ttd-field ttd-field--desc"
              label="Описание"
              htmlFor="ttd-description"
            >
              <app-pi-input
                id="ttd-description"
                formControlName="description"
                placeholder="Краткое описание"
              />
            </app-pi-form-field>
            <div class="ttd-field ttd-field--category">
              <span class="eyebrow text-muted-foreground">Тип</span>
              <app-pi-overflow-select
                [items]="categoryItems"
                [value]="form.controls.category.value"
                (valueChange)="onCategoryChange($event)"
                placeholder="— выбрать тип —"
                ariaLabel="Тип шаблона таблицы"
                dataTest="category-select"
              />
            </div>
            <app-pi-form-field
              class="ttd-field ttd-field--order"
              label="Порядок"
              htmlFor="ttd-sort-order"
            >
              <input
                id="ttd-sort-order"
                class="pi-input w-20 font-mono"
                type="number"
                formControlName="sortOrder"
              />
            </app-pi-form-field>
            <div class="ttd-active-switch">
              <span class="eyebrow text-muted-foreground" id="ttd-active-label">Активен</span>
              <app-pi-switch
                [checked]="form.controls.isActive.value"
                (checkedChange)="form.controls.isActive.setValue($event)"
                ariaLabel="Активен"
                id="ttd-is-active"
              />
            </div>
          </div>

          @if (mode() === 'from-registry') {
            <!-- Source controls share a balanced baseline; field options use overlay. -->
            <div class="ttd-settings-row ttd-settings-row--source">
              <app-pi-form-field
                class="ttd-field ttd-field--source"
                label="Источник данных"
                htmlFor="ttd-source"
              >
                @if (sourcesLoading()) {
                  <p class="text-xs text-muted-foreground">Загрузка…</p>
                } @else {
                  <app-pi-overflow-select
                    [items]="sourceItems()"
                    [value]="selectedSourceKey() ?? ''"
                    (valueChange)="onSourceChange($event)"
                    searchable="auto"
                    placeholder="— не выбран —"
                    ariaLabel="Источник данных"
                    dataTest="source-select"
                  />
                }
              </app-pi-form-field>
              @if (selectedSource(); as src) {
                <div class="ttd-field ttd-field--fields">
                  <div class="ttd-field-header">
                    <span class="eyebrow text-muted-foreground">Поля источника</span>
                    <span class="text-[10px] text-muted-foreground"
                      >{{ selectedFields().length }}/{{ src.fields.length }} выбрано</span
                    >
                  </div>
                  @if (src.fields.length === 0) {
                    <p class="ttd-fields-empty text-sm text-muted-foreground">
                      Нет полей у источника
                    </p>
                  } @else {
                    <app-pi-overflow-select
                      [items]="sourceFieldItems()"
                      [selectedValues]="selectedFieldKeysArray()"
                      (selectedValuesChange)="onFieldSelectionChange($event)"
                      [multiple]="true"
                      searchable="auto"
                      placeholder="— выбрать поля —"
                      ariaLabel="Поля источника"
                      dataTest="source-fields-select"
                    />
                  }
                </div>
              }
            </div>
          }
        </section>

        <!-- ─── Unified interactive preview ─── -->
        <div class="ttd-main">
          <section class="ttd-interactive-preview">
            <!-- Global toolbar -->
            <div class="ttd-toolbar">
              <div class="ttd-toolbar-group">
                <button
                  type="button"
                  class="ttd-link"
                  (click)="addColumn()"
                  data-test="add-column-button"
                >
                  + Добавить столбец
                </button>
                <button
                  type="button"
                  class="ttd-link"
                  (click)="applyKpPreset()"
                  data-test="apply-kp-preset"
                >
                  Колонки как в КП
                </button>
              </div>
              <p class="ttd-column-help text-muted-foreground" data-test="add-column-help">
                Название — заголовок на бланке; ключ — техническое имя (для КП: productName,
                quantity, …); тип — как показывать значение. Свой ключ = колонка без автоподстановки
                из каталога.
              </p>
              @if (presetConfirm()) {
                <div class="ttd-preset-confirm" role="alert" data-test="kp-preset-confirm">
                  <span
                    >Заменить текущие столбцы на стандартные колонки КП (№, название, кол-во, ед.,
                    цена, сумма)?</span
                  >
                  <app-pi-button variant="default" size="sm" (click)="confirmKpPreset()"
                    >Заменить</app-pi-button
                  >
                  <app-pi-button variant="ghost" size="sm" (click)="cancelKpPreset()"
                    >Отмена</app-pi-button
                  >
                </div>
              }

              <!-- Context controls for selected column -->
              @if (selectedColumnIndex() !== null) {
                <div class="ttd-toolbar-context">
                  <span class="ttd-toolbar-sep"></span>

                  <!-- Move buttons -->
                  <div class="ttd-toolbar-group">
                    <button
                      type="button"
                      class="ttd-toolbar-btn"
                      [disabled]="selectedColumnIndex() === 0"
                      (click)="moveColumn(selectedColumnIndex()!, -1)"
                      title="Переместить влево"
                    >
                      <lucide-icon [img]="ChevronLeftIcon" [size]="14"></lucide-icon>
                    </button>
                    <button
                      type="button"
                      class="ttd-toolbar-btn"
                      [disabled]="selectedColumnIndex() === columnsArray.length - 1"
                      (click)="moveColumn(selectedColumnIndex()!, 1)"
                      title="Переместить вправо"
                    >
                      <lucide-icon [img]="ChevronRightIcon" [size]="14"></lucide-icon>
                    </button>
                  </div>

                  <span class="ttd-toolbar-sep"></span>

                  <!-- Alignment buttons -->
                  <div class="ttd-toolbar-group">
                    <button
                      type="button"
                      class="ttd-toolbar-btn"
                      [class.is-active]="
                        columnsArray.at(selectedColumnIndex()!).controls.align.value === 'left'
                      "
                      (click)="setColumnAlign(selectedColumnIndex()!, 'left')"
                      title="Выровнять влево"
                    >
                      <lucide-icon [img]="AlignLeftIcon" [size]="14"></lucide-icon>
                    </button>
                    <button
                      type="button"
                      class="ttd-toolbar-btn"
                      [class.is-active]="
                        columnsArray.at(selectedColumnIndex()!).controls.align.value === 'center'
                      "
                      (click)="setColumnAlign(selectedColumnIndex()!, 'center')"
                      title="Выровнять по центру"
                    >
                      <lucide-icon [img]="AlignCenterIcon" [size]="14"></lucide-icon>
                    </button>
                    <button
                      type="button"
                      class="ttd-toolbar-btn"
                      [class.is-active]="
                        columnsArray.at(selectedColumnIndex()!).controls.align.value === 'right'
                      "
                      (click)="setColumnAlign(selectedColumnIndex()!, 'right')"
                      title="Выровнять вправо"
                    >
                      <lucide-icon [img]="AlignRightIcon" [size]="14"></lucide-icon>
                    </button>
                  </div>

                  <span class="ttd-toolbar-sep"></span>

                  <!-- Width control -->
                  <div class="ttd-toolbar-group ttd-toolbar-width">
                    <span class="ttd-toolbar-label">Ширина:</span>
                    <input
                      class="ttd-toolbar-width-input"
                      type="number"
                      min="5"
                      max="800"
                      [value]="columnsArray.at(selectedColumnIndex()!).controls.width.value"
                      (input)="onWidthInput($event, selectedColumnIndex()!)"
                    />
                    <span class="ttd-toolbar-unit">px</span>
                    <input
                      type="range"
                      class="ttd-toolbar-slider"
                      min="5"
                      max="800"
                      step="5"
                      [value]="columnsArray.at(selectedColumnIndex()!).controls.width.value"
                      (input)="onWidthInput($event, selectedColumnIndex()!)"
                    />
                  </div>

                  <span class="ttd-toolbar-sep"></span>

                  <!-- Align all -->
                  <div class="ttd-toolbar-group">
                    <span class="ttd-toolbar-label">Все:</span>
                    <button
                      type="button"
                      class="ttd-toolbar-btn ttd-toolbar-btn--sm"
                      (click)="alignAll('left')"
                      title="Выровнять все влево"
                    >
                      <lucide-icon [img]="AlignLeftIcon" [size]="12"></lucide-icon>
                    </button>
                    <button
                      type="button"
                      class="ttd-toolbar-btn ttd-toolbar-btn--sm"
                      (click)="alignAll('center')"
                      title="Выровнять все по центру"
                    >
                      <lucide-icon [img]="AlignCenterIcon" [size]="12"></lucide-icon>
                    </button>
                    <button
                      type="button"
                      class="ttd-toolbar-btn ttd-toolbar-btn--sm"
                      (click)="alignAll('right')"
                      title="Выровнять все вправо"
                    >
                      <lucide-icon [img]="AlignRightIcon" [size]="12"></lucide-icon>
                    </button>
                  </div>
                </div>
              }
            </div>

            <!-- Interactive table (merged columns + preview) -->
            <div class="ttd-interactive-table-wrap">
              <table class="ttd-interactive-table">
                <colgroup>
                  @for (col of columnsArray.controls; track $index) {
                    <col [style.width.px]="col.controls.width.value" />
                  }
                </colgroup>
                <thead>
                  <tr>
                    @for (col of columnsArray.controls; track $index; let i = $index) {
                      <th
                        class="ttd-ih"
                        [class.is-selected]="selectedColumnIndex() === i"
                        (click)="selectedColumnIndex.set(i)"
                      >
                        <div class="ttd-ih-top">
                          <span class="ttd-ih-num">{{ i + 1 }}</span>
                          <span class="ttd-ih-label eyebrow">{{
                            col.controls.label.value || '—'
                          }}</span>
                          <button
                            type="button"
                            class="ttd-ih-del"
                            (click)="removeColumn(i); $event.stopPropagation()"
                            title="Удалить столбец"
                          >
                            &#x00D7;
                          </button>
                        </div>
                        <div class="ttd-ih-fields">
                          <input
                            class="ttd-cell-input font-mono ttd-cell-input--sm"
                            [formControl]="col.controls.key"
                            placeholder="ключ"
                            (click)="$event.stopPropagation()"
                          />
                          <input
                            class="ttd-cell-input ttd-cell-input--sm"
                            [formControl]="col.controls.label"
                            placeholder="название"
                            (click)="$event.stopPropagation()"
                          />
                          @if (mode() !== 'from-registry') {
                            <app-pi-overflow-select
                              class="ttd-column-type-select"
                              [items]="columnTypeItems"
                              [value]="col.controls.type.value"
                              (valueChange)="onColumnTypeChange(i, $event)"
                              ariaLabel="Тип столбца"
                              [dataTest]="'column-type-' + i"
                              (click)="$event.stopPropagation()"
                            />
                          }
                        </div>
                      </th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @if (columnsArray.controls.length === 0) {
                    <tr>
                      <td
                        [attr.colspan]="1"
                        class="ttd-empty text-muted-foreground text-sm text-center py-6"
                      >
                        Нажмите «+ Добавить столбец» или выберите источник данных
                      </td>
                    </tr>
                  } @else if (clientPreview(); as preview) {
                    @for (row of preview.rows; track $index) {
                      <tr>
                        @for (cell of row; track $index; let ci = $index) {
                          <td
                            [style.text-align]="preview.columns[ci]?.align ?? 'left'"
                            [class.is-selected]="selectedColumnIndex() === ci"
                          >
                            {{ formatCell(cell, preview.columns[ci]?.type ?? 'text') }}
                          </td>
                        }
                      </tr>
                    }
                    @if (preview.rows.length === 0) {
                      <tr class="ttd-preview-skeleton-row" aria-hidden="true">
                        @for (column of preview.columns; track column.key + ':' + $index) {
                          <td><span class="ttd-preview-skeleton"></span></td>
                        }
                      </tr>
                      <tr>
                        <td
                          [attr.colspan]="columnsArray.controls.length"
                          class="ttd-empty text-muted-foreground text-xs text-center py-4"
                        >
                          {{
                            mode() === 'from-registry'
                              ? 'Данные будут подставлены при вставке в документ'
                              : 'Заполните образцы строк'
                          }}
                        </td>
                      </tr>
                    }
                  } @else {
                    <tr>
                      <td
                        [attr.colspan]="columnsArray.controls.length"
                        class="ttd-empty text-muted-foreground text-sm text-center py-6"
                      >
                        Заполните заголовки столбцов для предпросмотра
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      <div footer class="ttd-footer">
        @if (errorMessage()) {
          <span class="text-sm text-destructive mr-auto">{{ errorMessage() }}</span>
        }
        @if (validationError()) {
          <span class="text-sm text-destructive mr-auto">{{ validationError() }}</span>
        }
        <app-pi-button variant="ghost" (click)="ref.close(null)" data-test="cancel-button"
          >Отмена</app-pi-button
        >
        <app-pi-button
          variant="default"
          [disabled]="form.invalid || saving()"
          (click)="onSave()"
          data-test="save-button"
        >
          {{ saving() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .ttd-body {
        display: flex;
        flex-direction: column;
        padding: 0;
        min-height: min(70vh, 720px);
      }

      /* ─── Settings ─── */
      .ttd-settings {
        padding: 8px 16px;
        border-bottom: 2px solid var(--color-ink);
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex-shrink: 0;
      }
      .ttd-settings-row {
        display: flex;
        gap: 8px;
        align-items: flex-end;
        flex-wrap: wrap;
      }
      .ttd-settings-row--main {
        align-items: flex-end;
      }
      .ttd-settings-row--source {
        align-items: center;
      }

      /* ─── Main ─── */
      .ttd-main {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      /* ─── Interactive Preview ─── */
      .ttd-interactive-preview {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      /* ─── Toolbar ─── */
      .ttd-toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 16px;
        border-bottom: 1px solid var(--color-rule);
        flex-shrink: 0;
        flex-wrap: wrap;
      }
      .ttd-toolbar-group {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .ttd-column-help {
        flex: 1 1 220px;
        margin: 0;
        max-width: 42rem;
        font-size: 11px;
        line-height: 1.35;
        color: var(--color-muted);
      }
      .ttd-preset-confirm {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        border: 1px solid var(--color-rule);
        border-radius: 3px;
        background: var(--color-paper-2);
        color: var(--color-ink);
        font-size: 11px;
      }
      .ttd-toolbar-context {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .ttd-toolbar-sep {
        width: 1px;
        height: 20px;
        background: var(--color-rule);
        flex-shrink: 0;
      }
      .ttd-toolbar-label {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--color-muted);
        margin-right: 4px;
      }
      .ttd-toolbar-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        padding: 0;
        border: 1px solid var(--color-rule);
        border-radius: 3px;
        background: var(--color-paper);
        color: var(--color-muted-foreground-strong);
        cursor: pointer;
        transition: all 120ms ease;
      }
      .ttd-toolbar-btn:hover:not(:disabled) {
        background: var(--color-ink);
        color: var(--color-paper);
        border-color: var(--color-ink);
      }
      .ttd-toolbar-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      .ttd-toolbar-btn.is-active {
        background: var(--color-ink);
        color: var(--color-paper);
        border-color: var(--color-ink);
      }
      .ttd-toolbar-btn--sm {
        width: 24px;
        height: 24px;
      }
      .ttd-toolbar-width {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .ttd-toolbar-width-input {
        width: 56px;
        padding: 4px 6px;
        font-size: 12px;
        font-family: ui-monospace, monospace;
        text-align: center;
        border: 1px solid var(--color-rule);
        border-radius: 3px;
        background: var(--color-paper);
        color: var(--color-ink);
      }
      .ttd-toolbar-width-input:focus {
        outline: none;
        border-color: var(--color-sunrise-warm);
      }
      .ttd-toolbar-unit {
        font-size: 10px;
        color: var(--color-muted);
      }
      .ttd-toolbar-slider {
        width: 100px;
        height: 4px;
        -webkit-appearance: none;
        appearance: none;
        background: var(--color-rule);
        border-radius: 2px;
        outline: none;
        cursor: pointer;
      }
      .ttd-toolbar-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--color-ink);
        cursor: pointer;
        border: 2px solid var(--color-paper);
      }
      .ttd-toolbar-slider::-moz-range-thumb {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--color-ink);
        cursor: pointer;
        border: 2px solid var(--color-paper);
      }

      /* ─── Interactive Table ─── */
      .ttd-interactive-table-wrap {
        flex: 1;
        overflow: auto;
        min-height: 0;
      }
      .ttd-interactive-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        font-size: 12px;
        min-width: max-content;
      }

      /* ─── Header Cell (inline editing per column) ─── */
      .ttd-ih {
        position: relative;
        min-height: 132px;
        padding: 14px 8px 16px;
        text-align: left;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--color-muted-foreground-strong);
        background: var(--color-paper-2);
        border-bottom: 2px solid var(--color-ink);
        border-right: 1px solid var(--color-rule);
        vertical-align: top;
        cursor: pointer;
        transition: background 100ms ease;
        user-select: none;
      }
      .ttd-ih:last-child {
        border-right: none;
      }
      .ttd-ih:hover {
        background: color-mix(in oklch, var(--color-paper) 60%, var(--color-paper-2));
      }
      .ttd-ih.is-selected {
        background: color-mix(in oklch, var(--color-sunrise-warm) 12%, var(--color-paper-2));
      }

      .ttd-ih-top {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 4px;
      }
      .ttd-ih-num {
        font-size: 10px;
        color: var(--color-muted-foreground-strong);
        min-width: 14px;
        text-align: center;
      }
      .ttd-ih-label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ttd-ih-del {
        padding: 0;
        border: none;
        background: transparent;
        color: var(--color-muted-foreground-strong);
        cursor: pointer;
        font-size: 14px;
        line-height: 1;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 3px;
        transition: all 120ms ease;
      }
      .ttd-ih-del:hover {
        color: var(--color-destructive);
        background: color-mix(in oklch, var(--color-destructive) 8%, transparent);
      }

      .ttd-ih-fields {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .ttd-cell-input--sm {
        padding: 7px 8px;
        font-size: 11px;
        min-height: 28px;
      }
      .ttd-cell-input--sm[type='number'] {
        width: 56px;
        text-align: center;
        padding: 7px 4px;
      }
      .ttd-cell-input--select {
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 4px center;
        padding-right: 18px;
      }

      /* ─── Data Cells ─── */
      .ttd-interactive-table td {
        padding: 3px 6px;
        font-size: 11px;
        border-bottom: 1px solid var(--color-rule);
        border-right: 1px solid var(--color-rule);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ttd-interactive-table td:last-child {
        border-right: none;
      }
      .ttd-interactive-table td.is-selected {
        background: color-mix(in oklch, var(--color-sunrise-warm) 5%, transparent);
      }
      .ttd-interactive-table tbody tr:hover td {
        background: var(--color-paper-2);
      }

      /* ─── Shared cell input ─── */
      .ttd-cell-input {
        width: 100%;
        padding: 7px 8px;
        font-size: 12px;
        min-height: 28px;
        border: 1px solid transparent;
        border-radius: 3px;
        background: transparent;
        color: var(--color-ink);
        box-sizing: border-box;
      }
      .ttd-cell-input:hover {
        border-color: var(--color-rule);
      }
      .ttd-cell-input:focus {
        outline: none;
        border-color: var(--color-sunrise-warm);
        background: var(--color-paper);
      }

      /* ─── Empty state ─── */
      .ttd-empty {
        padding: 24px;
      }

      .ttd-preview-skeleton-row td {
        padding-top: 8px;
        padding-bottom: 8px;
        background: color-mix(in oklch, var(--color-paper-2) 55%, var(--color-paper));
      }
      .ttd-preview-skeleton {
        display: block;
        height: 10px;
        width: 78%;
        border-radius: 2px;
        background: color-mix(in oklch, var(--color-muted) 28%, var(--color-paper));
      }
      .ttd-preview-skeleton-row td:nth-child(2n) .ttd-preview-skeleton {
        width: 56%;
      }

      /* ─── Shared form primitives ─── */
      .ttd-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }
      .ttd-field--name {
        flex: 2 1 200px;
      }
      .ttd-field--desc {
        flex: 3 1 250px;
      }
      .ttd-field--category {
        flex: 1.2 1 180px;
      }
      .ttd-field--order {
        flex: 0 0 80px;
      }
      .ttd-field--source,
      .ttd-field--fields {
        flex: 1 1 0;
        min-width: 220px;
      }
      .ttd-field-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
      }
      .ttd-input {
        width: 100%;
        padding: 5px 8px;
        font-size: 13px;
        border: 1px solid var(--color-rule);
        border-radius: 4px;
        background: transparent;
        color: var(--color-ink);
      }
      .ttd-input:focus {
        outline: none;
        border-color: var(--color-sunrise-warm);
        outline: 2px solid var(--color-sunrise-warm);
        outline-offset: -1px;
      }
      .ttd-input--select {
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 8px center;
        padding-right: 28px;
      }
      .ttd-link {
        padding: 0;
        border: none;
        background: transparent;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--color-sunrise-warm);
        cursor: pointer;
      }
      .ttd-link:hover {
        color: var(--color-ink);
      }
      .ttd-link:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .ttd-meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .ttd-order-input {
        width: 56px;
        padding: 5px 6px;
        text-align: center;
        border: 1px solid var(--color-rule);
        border-radius: 4px;
        font-size: 13px;
      }
      .ttd-active-switch {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .ttd-fields-empty {
        margin: 0;
        padding: 10px 8px;
      }

      .ttd-column-type-select {
        display: block;
        min-width: 0;
      }

      .ttd-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
        width: 100%;
      }
    `,
  ],
})
export class TableTemplateFormDialogComponent {
  // ─── Inject ────────────────────────────────────────────────
  private readonly rawConfig = inject(PI_DIALOG_DATA) as
    TableTemplateDialogConfig | TableTemplate | null;
  protected readonly ref = inject<DialogRef<TableTemplate | null>>(PI_DIALOG_REF);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(TableTemplatesService);
  private readonly registry = inject(RegistryService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);

  // ─── Data ──────────────────────────────────────────────────
  protected readonly data: TableTemplate | null = this.isConfig(this.rawConfig)
    ? (this.rawConfig.template ?? null)
    : (this.rawConfig as TableTemplate | null);

  // ─── Constants ─────────────────────────────────────────────
  protected readonly columnTypeItems = COLUMN_TYPE_ITEMS;

  // Icons
  protected readonly AlignLeftIcon = AlignLeft;
  protected readonly AlignCenterIcon = AlignCenter;
  protected readonly AlignRightIcon = AlignRight;
  protected readonly ChevronLeftIcon = ChevronLeft;
  protected readonly ChevronRightIcon = ChevronRight;
  protected readonly categoryItems: PiOverflowSelectItem[] = [
    { id: 'product-spec', label: 'Спецификация' },
    { id: 'cost-calc', label: 'Калькуляция' },
    { id: 'order-summary', label: 'Сводка заказа' },
    { id: 'price-list', label: 'Прайс-лист' },
    { id: 'custom', label: 'Прочее' },
    { id: 'kp', label: 'КП' },
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
  protected readonly selectedFieldKeys = signal<Set<string>>(
    new Set((this.data?.columns ?? []).map((c) => c.key)),
  );
  protected readonly selectedSource = computed(
    () => this.allSources().find((s) => s.key === this.selectedSourceKey()) ?? null,
  );
  protected readonly selectedFields = computed(
    () => this.selectedSource()?.fields.filter((f) => this.selectedFieldKeys().has(f.key)) ?? [],
  );
  protected readonly selectedFieldKeysArray = computed(() => [...this.selectedFieldKeys()]);
  protected readonly sourceFieldItems = computed<PiOverflowSelectItem[]>(() =>
    (this.selectedSource()?.fields ?? []).map((field) => ({
      id: field.key,
      label: field.label,
      meta: field.type,
    })),
  );
  protected readonly sourceItems = computed<PiOverflowSelectItem[]>(() =>
    this.allSources().map((src) => ({
      id: src.key,
      label: `${GROUP_LABELS[src.group] ?? src.group} · ${src.label}`,
    })),
  );

  // ─── Form ──────────────────────────────────────────────────
  protected readonly form = this.fb.group({
    name: this.fb.control(this.data?.name ?? '', [Validators.required, Validators.maxLength(200)]),
    description: this.fb.control(this.data?.description ?? '', []),
    category: this.fb.control<NonNullable<TableTemplate['category']>>(
      this.data?.category ?? 'product-spec',
      [Validators.required],
    ),
    columns: this.fb.array<TableColumnForm>(
      (this.data?.columns ?? []).map((c) => this.makeColumnControl(c)),
    ),
    sampleRowsJson: this.fb.control(
      this.data?.sampleRows ? JSON.stringify(this.data.sampleRows, null, 2) : '',
      [],
    ),
    sortOrder: this.fb.control(this.data?.sortOrder ?? 0, []),
    isActive: this.fb.control(this.data?.isActive ?? true, []),
  });
  protected get columnsArray(): FormArray<TableColumnForm> {
    return this.form.controls.columns;
  }

  // ─── Selection ─────────────────────────────────────────────
  protected readonly selectedColumnIndex = signal<number | null>(null);
  protected readonly presetConfirm = signal(false);

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
      } catch {
        return null;
      }
    }
    return {
      name: v.name?.trim() || 'Новый шаблон',
      description: v.description?.trim() ?? '',
      columns,
      rows,
    };
  });

  // ─── Status ────────────────────────────────────────────────
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly validationError = signal<string | null>(null);

  // ─── Constructor ───────────────────────────────────────────
  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.previewTick.update((n) => n + 1));
    this.loadSources();
    queueMicrotask(() => {
      if (this.data) this.loadPreview();
    });
  }

  // ─── Registry methods ──────────────────────────────────────
  protected onSourceChange(key: string): void {
    this.selectedSourceKey.set(key || null);
    this.selectedFieldKeys.set(new Set());
    this.syncColumnsFromFields();
  }

  protected onCategoryChange(category: string): void {
    if (this.categoryItems.some((item) => item.id === category)) {
      this.form.controls.category.setValue(category as NonNullable<TableTemplate['category']>);
    }
  }

  protected onFieldSelectionChange(keys: string[]): void {
    this.selectedFieldKeys.set(new Set(keys));
    this.syncColumnsFromFields();
  }

  protected onColumnTypeChange(columnIndex: number, type: string): void {
    const columnType = COLUMN_TYPES.some((item) => item.key === type)
      ? (type as ColumnType)
      : 'text';
    this.columnsArray.at(columnIndex).controls.type.setValue(columnType);
  }

  protected toggleField(field: FieldDescriptor): void {
    const keys = new Set(this.selectedFieldKeys());
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    keys.has(field.key) ? keys.delete(field.key) : keys.add(field.key);
    this.selectedFieldKeys.set(keys);
    this.syncColumnsFromFields();
  }

  // ─── Column methods ────────────────────────────────────────
  protected applyKpPreset(): void {
    if (this.columnsArray.length > 0) {
      this.presetConfirm.set(true);
      return;
    }
    this.replaceColumnsWithKpPreset();
  }

  protected confirmKpPreset(): void {
    this.presetConfirm.set(false);
    this.replaceColumnsWithKpPreset();
  }

  protected cancelKpPreset(): void {
    this.presetConfirm.set(false);
  }

  private replaceColumnsWithKpPreset(): void {
    while (this.columnsArray.length > 0) this.columnsArray.removeAt(0);
    for (const column of KP_LINE_ITEM_PRESET_COLUMNS) {
      this.columnsArray.push(this.makeColumnControl(column));
    }
    this.selectedColumnIndex.set(null);
    this.form.controls.sampleRowsJson.setValue('');
    this.previewTick.update((n) => n + 1);
  }

  protected addColumn(): void {
    this.columnsArray.push(this.makeColumnControl());
  }
  protected removeColumn(i: number): void {
    this.columnsArray.removeAt(i);
  }
  protected moveColumn(i: number, delta: -1 | 1): void {
    const t = i + delta;
    if (t < 0 || t >= this.columnsArray.length) return;
    const c = this.columnsArray.at(i);
    this.columnsArray.removeAt(i);
    this.columnsArray.insert(t, c);
    // Update selected index to follow the moved column
    this.selectedColumnIndex.set(t);
    this.previewTick.update((n) => n + 1);
  }

  protected alignAll(align: 'left' | 'center' | 'right'): void {
    for (const ctrl of this.columnsArray.controls) {
      ctrl.controls.align.setValue(align);
    }
    this.previewTick.update((n) => n + 1);
  }

  protected setColumnAlign(columnIndex: number, align: 'left' | 'center' | 'right'): void {
    this.columnsArray.at(columnIndex).controls.align.setValue(align);
    this.previewTick.update((n) => n + 1);
  }

  protected onWidthInput(event: Event, columnIndex: number): void {
    const v = Number((event.target as HTMLInputElement).value) || 100;
    const newWidth = Math.max(5, Math.min(800, v));
    const oldWidth = this.columnsArray.at(columnIndex).controls.width.value;
    const delta = newWidth - oldWidth;

    this.columnsArray.at(columnIndex).controls.width.setValue(newWidth, { emitEvent: false });

    // Compensate by adjusting ONLY the last column
    // This preserves all other columns' widths
    const lastIndex = this.columnsArray.length - 1;
    if (lastIndex > 0 && columnIndex !== lastIndex) {
      const lastCtrl = this.columnsArray.at(lastIndex);
      const lastOldWidth = lastCtrl.controls.width.value;
      const lastNewWidth = Math.max(5, lastOldWidth - delta);
      lastCtrl.controls.width.setValue(lastNewWidth, { emitEvent: false });
    }

    this.previewTick.update((n) => n + 1);
  }

  // ─── Save ──────────────────────────────────────────────────
  protected onSave(): void {
    if (this.form.invalid || this.saving()) return;
    const vErr = this.validate();
    if (vErr) {
      this.validationError.set(vErr);
      return;
    }
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
      ...(this.mode() === 'from-registry' && this.selectedSourceKey()
        ? { dataSource: this.selectedSourceKey()! }
        : {}),
    };

    const obs = this.data
      ? this.service.update(this.data._id, payload)
      : this.service.create(payload);
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
      if (res.ok) this.previewHtml.set(res.data);
      else this.previewHtml.set(null);
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
    if (type === 'number') {
      const n = Number(value);
      return Number.isFinite(n) ? new Intl.NumberFormat('ru-RU').format(n) : String(value);
    }
    if (type === 'currency') {
      const n = Number(value);
      return Number.isFinite(n)
        ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(n)
        : String(value);
    }
    if (type === 'date') {
      const d = new Date(String(value));
      return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('ru-RU');
    }
    return String(value);
  }

  // ─── Private ───────────────────────────────────────────────
  private resolveInitialMode(): DialogMode {
    if (this.isConfig(this.rawConfig) && this.rawConfig.mode) return this.rawConfig.mode;
    if (this.data?.dataSource) return 'from-registry';
    return 'new';
  }

  private isConfig(v: unknown): v is TableTemplateDialogConfig {
    return (
      v != null && typeof v === 'object' && !Array.isArray(v) && ('mode' in v || 'template' in v)
    );
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
    const prev = new Map<
      string,
      { width: number; align: 'left' | 'center' | 'right'; format: string }
    >();
    for (const ctrl of this.columnsArray.controls) {
      const v = ctrl.value;
      if (v.key)
        prev.set(v.key, {
          width: v.width ?? 100,
          align: v.align ?? 'left',
          format: v.format ?? '',
        });
    }
    while (this.columnsArray.length > 0) this.columnsArray.removeAt(0);
    for (const field of fields) {
      const saved = prev.get(field.key);
      this.columnsArray.push(
        this.makeColumnControl({
          key: field.key,
          label: field.label,
          type: field.type as ColumnType,
          width: saved?.width ?? 120,
          align:
            saved?.align ??
            (field.type === 'number' || field.type === 'currency' ? 'right' : 'left'),
          format: saved?.format ?? '',
        }),
      );
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
        for (const row of parsed) {
          if (!Array.isArray(row)) return 'Каждая строка образца — массив значений.';
        }
      } catch {
        return 'Некорректный JSON в образцах строк.';
      }
    }
    return null;
  }

  private makeColumnControl(c?: TableColumn): TableColumnForm {
    const s = c ?? {
      key: '',
      label: '',
      type: 'text' as ColumnType,
      width: 100,
      align: 'left' as const,
    };
    return this.fb.group({
      key: this.fb.control(s.key, [Validators.required, Validators.maxLength(50)]),
      label: this.fb.control(s.label, [Validators.required, Validators.maxLength(100)]),
      type: this.fb.control<ColumnType>(s.type, [Validators.required]),
      width: this.fb.control(s.width, [
        Validators.required,
        Validators.min(20),
        Validators.max(800),
      ]),
      align: this.fb.control<'left' | 'center' | 'right'>(s.align, [Validators.required]),
      format: this.fb.control(s.format ?? '', []),
      required: this.fb.control(false, []),
    });
  }
}
