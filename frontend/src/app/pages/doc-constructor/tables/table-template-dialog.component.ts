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
import { extractErrorMessage, SilentResult } from '../../../core/silent-http';
import { PiToastService } from '../../../shared/ui/toast';

type TableColumnForm = FormGroup<{
  key: FormControl<string>;
  label: FormControl<string>;
  type: FormControl<ColumnType>;
  width: FormControl<number>;
  align: FormControl<'left' | 'center' | 'right'>;
  format: FormControl<string>;
}>;

const COLUMN_TYPES: Array<{ key: ColumnType; label: string }> = [
  { key: 'text', label: 'Текст' },
  { key: 'number', label: 'Число' },
  { key: 'currency', label: 'Валюта (₽)' },
  { key: 'date', label: 'Дата' },
  { key: 'bool', label: 'Да / Нет' },
];

interface ClientPreviewModel {
  name: string;
  description: string;
  columns: TableColumn[];
  rows: unknown[][];
}

@Component({
  selector: 'app-table-template-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PiDialogComponent, ButtonComponent],
  template: `
    <app-pi-dialog
      [title]="data ? 'Редактировать шаблон таблицы' : 'Новый шаблон таблицы'"
      variant="content"
      [width]="'xl'"
      [maxWidth]="'1000px'"
      [showClose]="true"
    >
      <div body class="ttd-body" [formGroup]="form">
        <div class="ttd-left">
          <section class="ttd-section">
            <h3 class="ttd-section-title eyebrow">Основная информация</h3>
            <div class="ttd-fields">
              <label class="ttd-field">
                <span class="eyebrow text-muted-foreground">Название *</span>
                <input class="ttd-input" formControlName="name" placeholder="Спецификация товаров" data-test="name-input" />
              </label>
              <label class="ttd-field">
                <span class="eyebrow text-muted-foreground">Описание</span>
                <input class="ttd-input" formControlName="description" placeholder="Краткое описание назначения" />
              </label>
              <div class="ttd-field">
                <span class="eyebrow text-muted-foreground">Категория</span>
                <div class="ttd-pills">
                  @for (c of categoryOptions; track c.key) {
                    <button
                      type="button"
                      class="ttd-pill"
                      [class.is-active]="form.controls.category.value === c.key"
                      (click)="setCategory(c.key)"
                    >{{ c.label }}</button>
                  }
                </div>
              </div>
            </div>
          </section>

          <section class="ttd-section">
            <div class="ttd-section-title eyebrow">
              <span>Структура колонок</span>
              <button type="button" class="ttd-link" (click)="addColumn()" data-test="add-column-button">+ Добавить</button>
            </div>
            <div formArrayName="columns" class="ttd-columns">
              @for (col of columnsArray.controls; track $index; let i = $index) {
                <div [formGroupName]="i" class="ttd-col-card group">
                  <div class="ttd-col-actions">
                    <button type="button" class="ttd-icon-btn" [disabled]="i === 0" (click)="moveColumn(i, -1)" aria-label="Вверх">↑</button>
                    <button type="button" class="ttd-icon-btn" [disabled]="i === columnsArray.controls.length - 1" (click)="moveColumn(i, 1)" aria-label="Вниз">↓</button>
                    <button type="button" class="ttd-icon-btn ttd-icon-btn--danger" (click)="removeColumn(i)" aria-label="Удалить">×</button>
                  </div>
                  <div class="ttd-col-grid">
                    <label class="ttd-col-field">
                      <span class="ttd-col-label">Ключ</span>
                      <input class="ttd-col-input font-mono" formControlName="key" placeholder="article" />
                    </label>
                    <label class="ttd-col-field">
                      <span class="ttd-col-label">Заголовок</span>
                      <input class="ttd-col-input" formControlName="label" placeholder="Наименование" />
                    </label>
                  </div>
                  <div class="ttd-col-row">
                    <label class="ttd-col-field ttd-col-field--grow">
                      <span class="ttd-col-label">Тип</span>
                      <select class="ttd-col-input" formControlName="type">
                        @for (t of columnTypes; track t.key) {
                          <option [value]="t.key">{{ t.label }}</option>
                        }
                      </select>
                    </label>
                    <label class="ttd-col-field ttd-col-field--w">
                      <span class="ttd-col-label">Ширина</span>
                      <input class="ttd-col-input font-mono text-center" type="number" formControlName="width" min="20" max="800" />
                    </label>
                    <div class="ttd-col-field">
                      <span class="ttd-col-label">Выравн.</span>
                      <div class="ttd-align-group">
                        <button type="button" class="ttd-align-btn" [class.is-active]="col.controls.align.value === 'left'" (click)="setAlign(i, 'left')" title="Слева">≡</button>
                        <button type="button" class="ttd-align-btn" [class.is-active]="col.controls.align.value === 'center'" (click)="setAlign(i, 'center')" title="По центру">≡</button>
                        <button type="button" class="ttd-align-btn" [class.is-active]="col.controls.align.value === 'right'" (click)="setAlign(i, 'right')" title="Справа">≡</button>
                      </div>
                    </div>
                  </div>
                  <label class="ttd-col-field">
                    <span class="ttd-col-label">Формат (опционально)</span>
                    <input class="ttd-col-input font-mono" formControlName="format" placeholder="Intl pattern" />
                  </label>
                </div>
              }
            </div>
          </section>

          <section class="ttd-section">
            <h3 class="ttd-section-title eyebrow">Образцы строк</h3>
            <textarea
              class="ttd-textarea font-mono"
              rows="6"
              formControlName="sampleRowsJson"
              placeholder='[["А-001", "Стол", 2, 1500]]'
              data-test="sample-rows-input"
            ></textarea>
            <p class="ttd-hint">каждая строка — массив значений в порядке колонок</p>
          </section>

          <div class="ttd-meta-strip hairline-t">
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

        <div class="ttd-right">
          <div class="ttd-preview-head hairline-b">
            <span class="eyebrow">Предпросмотр</span>
            <button
              type="button"
              class="ttd-link"
              [disabled]="!data || previewLoading()"
              (click)="loadPreview()"
            >↻ Обновить preview</button>
          </div>
          <div class="ttd-preview-body">
            @if (previewLoading()) {
              <p class="text-muted-foreground text-sm">Загрузка preview…</p>
            } @else if (previewHtml()) {
              <div class="ttd-preview-html" [innerHTML]="previewHtml()"></div>
            } @else if (clientPreview(); as preview) {
              <div class="ttd-preview-doc">
                <div class="ttd-preview-doc-head hairline-b">
                  <h3 class="font-display text-lg text-center">{{ preview.name }}</h3>
                  @if (preview.description) {
                    <p class="text-sm text-muted-foreground text-center">{{ preview.description }}</p>
                  }
                </div>
                <div class="ttd-preview-table">
                  <div class="ttd-preview-row ttd-preview-row--head" [style.grid-template-columns]="previewGrid(preview.columns)">
                    @for (col of preview.columns; track col.key + col.label) {
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
                </div>
              </div>
            } @else {
              <p class="text-muted-foreground text-sm text-center">
                Заполните колонки и образцы строк — предпросмотр обновится автоматически.
              </p>
            }
          </div>
        </div>
      </div>

      <div footer class="ttd-footer">
        @if (errorMessage()) {
          <span class="text-sm text-destructive mr-auto">{{ errorMessage() }}</span>
        }
        @if (validationError()) {
          <span class="text-sm text-destructive mr-auto">{{ validationError() }}</span>
        }
        <app-pi-button variant="ghost" (click)="onCancel()" data-test="cancel-button">Отмена</app-pi-button>
        <app-pi-button variant="default" [disabled]="form.invalid || saving()" (click)="onSave()" data-test="save-button">
          {{ saving() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
  styles: [`
    :host ::ng-deep app-pi-dialog > div[role='dialog'] {
      border-radius: 0;
      border-width: 2px;
      border-color: var(--color-ink);
      max-height: min(920px, 92vh);
    }
    :host ::ng-deep app-pi-dialog header {
      border-bottom: 2px solid var(--color-ink);
    }
    :host ::ng-deep app-pi-dialog footer {
      border-top: 2px solid var(--color-ink);
    }

    .ttd-body {
      display: flex;
      min-height: 520px;
      max-height: min(720px, 70vh);
    }

    .ttd-left {
      width: 400px;
      flex-shrink: 0;
      padding: 24px 24px 16px 0;
      border-right: 2px solid var(--color-ink);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .ttd-section-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin: 0 0 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--color-rule);
      color: var(--color-ink);
    }

    .ttd-fields { display: flex; flex-direction: column; gap: 16px; }
    .ttd-field { display: flex; flex-direction: column; gap: 6px; }

    .ttd-input {
      width: 100%;
      padding: 10px 12px;
      font-size: 16px;
      border: 1px solid var(--color-rule);
      border-radius: 6px;
      background: transparent;
      color: var(--color-ink);
    }
    .ttd-input:focus {
      outline: none;
      border-color: var(--color-sunrise-warm);
      box-shadow: 0 0 0 1px var(--color-sunrise-warm);
    }

    .ttd-pills { display: flex; flex-wrap: wrap; gap: 8px; }
    .ttd-pill {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 500;
      border: 1px solid var(--color-rule);
      border-radius: 6px;
      background: var(--color-paper-2);
      color: var(--color-muted-foreground-strong);
      cursor: pointer;
    }
    .ttd-pill.is-active {
      background: var(--color-ink);
      border-color: var(--color-ink);
      color: var(--color-paper);
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
    .ttd-link:hover { color: var(--color-ink); }
    .ttd-link:disabled { opacity: 0.4; cursor: not-allowed; }

    .ttd-columns { display: flex; flex-direction: column; gap: 12px; }
    .ttd-col-card {
      position: relative;
      padding: 12px;
      border: 1px solid var(--color-rule);
      border-radius: 6px;
      background: var(--color-paper);
    }
    .ttd-col-card:hover { background: var(--color-paper-2); }

    .ttd-col-actions {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      opacity: 0;
      transition: opacity 100ms ease;
    }
    .ttd-col-card:hover .ttd-col-actions,
    .ttd-col-card:focus-within .ttd-col-actions { opacity: 1; }

    .ttd-icon-btn {
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      color: var(--color-muted-foreground-strong);
      cursor: pointer;
      font-size: 12px;
    }
    .ttd-icon-btn:hover:not(:disabled) { color: var(--color-ink); }
    .ttd-icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .ttd-icon-btn--danger:hover { color: var(--color-destructive); }

    .ttd-col-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      padding-right: 28px;
      margin-bottom: 8px;
    }
    .ttd-col-row {
      display: flex;
      gap: 8px;
      padding-right: 28px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }
    .ttd-col-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
    .ttd-col-field--grow { flex: 1 1 120px; }
    .ttd-col-field--w { width: 64px; flex-shrink: 0; }
    .ttd-col-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-muted-foreground-strong);
    }
    .ttd-col-input {
      width: 100%;
      padding: 6px 8px;
      font-size: 12px;
      border: 1px solid var(--color-rule);
      border-radius: 4px;
      background: var(--color-paper);
      color: var(--color-ink);
    }
    .ttd-col-input:focus {
      outline: none;
      border-color: var(--color-sunrise-warm);
    }

    .ttd-align-group {
      display: flex;
      border: 1px solid var(--color-rule);
      border-radius: 4px;
      overflow: hidden;
    }
    .ttd-align-btn {
      padding: 4px 8px;
      border: none;
      border-right: 1px solid var(--color-rule);
      background: var(--color-paper);
      color: var(--color-muted-foreground-strong);
      cursor: pointer;
      font-size: 12px;
    }
    .ttd-align-btn:last-child { border-right: none; }
    .ttd-align-btn.is-active {
      background: var(--color-ink);
      color: var(--color-paper);
    }

    .ttd-textarea {
      width: 100%;
      padding: 12px;
      font-size: 11px;
      border: 1px solid var(--color-rule);
      border-radius: 6px;
      background: var(--color-paper-2);
      color: var(--color-ink);
      resize: vertical;
    }
    .ttd-hint {
      margin: 8px 0 0;
      font-size: 10px;
      font-style: italic;
      color: var(--color-muted-foreground-strong);
    }

    .ttd-meta-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding-top: 16px;
      margin-top: auto;
    }
    .ttd-meta-item { display: flex; align-items: center; gap: 8px; }
    .ttd-order-input {
      width: 64px;
      padding: 6px 8px;
      text-align: center;
      border: 1px solid var(--color-rule);
      border-radius: 4px;
    }
    .ttd-active-check {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .ttd-right {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      background: var(--color-paper-2);
    }
    .ttd-preview-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      background: var(--color-paper);
    }
    .ttd-preview-body {
      flex: 1;
      padding: 24px;
      overflow: auto;
      display: flex;
      align-items: flex-start;
      justify-content: center;
    }
    .ttd-preview-doc {
      width: 100%;
      max-width: 560px;
      background: var(--color-paper);
      border: 2px solid var(--color-ink);
    }
    .ttd-preview-doc-head { padding: 16px; }
    .ttd-preview-table { width: 100%; }
    .ttd-preview-row {
      display: grid;
      border-bottom: 1px solid var(--color-rule);
    }
    .ttd-preview-row--head {
      background: var(--color-paper-2);
      border-bottom: 1px solid var(--color-ink);
    }
    .ttd-preview-cell {
      padding: 10px 12px;
      font-size: 13px;
      border-right: 1px solid var(--color-rule);
      word-break: break-word;
    }
    .ttd-preview-cell:last-child { border-right: none; }
    .ttd-preview-html :is(table) { width: 100%; border-collapse: collapse; }

    .ttd-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      width: 100%;
    }
  `],
})
export class TableTemplateFormDialogComponent {
  protected readonly data: TableTemplate | null = inject(PI_DIALOG_DATA) as TableTemplate | null;
  private readonly ref = inject<DialogRef<TableTemplate | null>>(PI_DIALOG_REF);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(TableTemplatesService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly columnTypes = COLUMN_TYPES;
  protected readonly categoryOptions: Array<{ key: NonNullable<TableTemplate['category']>; label: string }> = [
    { key: 'product-spec', label: 'Спецификация' },
    { key: 'cost-calc', label: 'Калькуляция' },
    { key: 'order-summary', label: 'Сводка заказа' },
    { key: 'price-list', label: 'Прайс-лист' },
    { key: 'custom', label: 'Прочее' },
  ];

  protected readonly saving = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly validationError = signal<string | null>(null);
  protected readonly previewHtml = signal<string | null>(null);
  protected readonly previewLoading = signal<boolean>(false);
  private readonly previewTick = signal(0);

  protected readonly form = this.fb.group({
    name: this.fb.control(this.data?.name ?? '', [Validators.required, Validators.maxLength(200)]),
    description: this.fb.control(this.data?.description ?? '', []),
    category: this.fb.control<NonNullable<TableTemplate['category']>>(
      this.data?.category ?? 'product-spec',
      [Validators.required],
    ),
    columns: this.fb.array<TableColumnForm>(
      (this.data?.columns ?? [this.makeColumn()]).map((c: TableColumn) => this.makeColumnControl(c)),
    ),
    sampleRowsJson: this.fb.control(
      this.data?.sampleRows ? JSON.stringify(this.data.sampleRows, null, 2) : '',
      [],
    ),
    sortOrder: this.fb.control(this.data?.sortOrder ?? 0, []),
    isActive: this.fb.control(this.data?.isActive ?? true, []),
  });

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

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.previewTick.update((n) => n + 1));

    queueMicrotask(() => {
      if (this.data) this.loadPreview();
    });
  }

  protected get columnsArray(): FormArray<TableColumnForm> {
    return this.form.controls.columns;
  }

  protected setCategory(key: NonNullable<TableTemplate['category']>): void {
    this.form.controls.category.setValue(key);
  }

  protected setAlign(index: number, align: 'left' | 'center' | 'right'): void {
    this.columnsArray.at(index).controls.align.setValue(align);
  }

  protected previewGrid(columns: TableColumn[]): string {
    return columns.map((c) => `${Math.max(20, c.width)}px`).join(' ');
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

  protected addColumn(): void {
    this.columnsArray.push(this.makeColumnControl());
  }

  protected removeColumn(index: number): void {
    this.columnsArray.removeAt(index);
  }

  protected moveColumn(index: number, delta: -1 | 1): void {
    const target = index + delta;
    if (target < 0 || target >= this.columnsArray.controls.length) return;
    const dir = this.columnsArray.controls[index];
    this.columnsArray.removeAt(index);
    this.columnsArray.insert(target, dir);
  }

  protected validate(): string | null {
    const keys = this.columnsArray.controls
      .map((c: TableColumnForm) => c.controls.key.value.trim())
      .filter(Boolean);
    if (new Set(keys).size !== keys.length) {
      return 'Ключи колонок должны быть уникальными.';
    }
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

  protected onCancel(): void {
    this.ref.close(null);
  }

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

  protected loadPreview(): void {
    if (!this.data) return;
    this.previewLoading.set(true);
    this.service.preview(this.data._id).subscribe((res: SilentResult<string>) => {
      this.previewLoading.set(false);
      if (res.ok) this.previewHtml.set(res.data);
      else this.previewHtml.set(null);
    });
  }

  private makeColumn(): TableColumn {
    return { key: '', label: '', type: 'text', width: 100, align: 'left' };
  }

  private makeColumnControl(c?: TableColumn): TableColumnForm {
    const seed = c ?? this.makeColumn();
    return this.fb.group({
      key: this.fb.control(seed.key, [Validators.required, Validators.maxLength(50)]),
      label: this.fb.control(seed.label, [Validators.required, Validators.maxLength(100)]),
      type: this.fb.control<ColumnType>(seed.type, [Validators.required]),
      width: this.fb.control(seed.width, [Validators.required, Validators.min(20), Validators.max(800)]),
      align: this.fb.control<'left' | 'center' | 'right'>(seed.align, [Validators.required]),
      format: this.fb.control(seed.format ?? '', []),
    });
  }
}
