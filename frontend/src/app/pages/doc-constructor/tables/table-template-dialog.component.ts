import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
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
import { extractErrorMessage } from '../../../core/silent-http';
import { SilentResult } from '../../../core/silent-http';
import { PiToastService } from '../../../shared/ui/toast';

/** Local FormGroup for one row of FormArray<TableColumnForm>. */
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

const ALIGN_OPTIONS: Array<{ key: 'left' | 'center' | 'right'; label: string }> = [
  { key: 'left', label: 'Слева' },
  { key: 'center', label: 'По центру' },
  { key: 'right', label: 'Справа' },
];

/**
 * TZ-86 Phase C.4 — TableTemplateFormDialog.
 *
 * Form:
 *   - name (required)
 *   - description (optional)
 *   - category (radio: 5 options)
 *   - columns[] FormArray — each row: key, label, type (select), width (number), align (radio), format (optional text)
 *   - sampleRows JSON textarea — JSON array of arrays; parsed on save
 *   - sortOrder, isActive
 *
 * Sample preview:
 *   - показывает server-side preview только ПОСЛЕ успешного first save — endpoint требует существующий id.
 *   - для unsaved конфига показывает placeholder «Сохраните, чтобы увидеть preview».
 */
@Component({
  selector: 'app-table-template-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PiDialogComponent, ButtonComponent],
  template: `
    <app-pi-dialog
      [title]="data ? 'Редактировать шаблон таблицы' : 'Новый шаблон таблицы'"
      [width]="'lg'"
      [showClose]="true"
    >
      <div body class="grid grid-cols-2 gap-6">
        <div class="space-y-4">
          <label class="block text-sm">
            <span class="eyebrow block mb-1.5 text-ink">Название</span>
            <input class="pi-input w-full" formControlName="name" name="name" placeholder="Спецификация товаров" data-test="name-input" />
          </label>

          <label class="block text-sm">
            <span class="eyebrow block mb-1.5 text-ink">Описание</span>
            <input class="pi-input w-full" formControlName="description" name="description" placeholder="Краткое описание назначения шаблона" />
          </label>

          <fieldset>
            <legend class="eyebrow block mb-1.5 text-ink">Категория</legend>
            <div class="grid grid-cols-2 gap-2">
              @for (c of categoryOptions; track c.key) {
                <label class="flex items-center gap-2 cursor-pointer hairline px-3 py-2 rounded-sm hover:bg-paper-2 transition-colors">
                  <input type="radio" [value]="c.key" formControlName="category" name="category" />
                  <span class="text-sm">{{ c.label }}</span>
                </label>
              }
            </div>
          </fieldset>

          <fieldset>
            <legend class="eyebrow block mb-1.5 text-ink">Колонки</legend>
            <div formArrayName="columns" class="space-y-2">
              @for (col of columnsArray.controls; track $index; let i = $index) {
                <div [formGroupName]="i" class="hairline rounded-sm p-3 space-y-2">
                  <div class="grid grid-cols-12 gap-2 items-end">
                    <label class="col-span-3 text-xs">
                      <span class="block mb-1 text-muted-foreground">Key</span>
                      <input class="pi-input w-full font-mono text-xs" formControlName="key" placeholder="name" />
                    </label>
                    <label class="col-span-4 text-xs">
                      <span class="block mb-1 text-muted-foreground">Заголовок</span>
                      <input class="pi-input w-full" formControlName="label" placeholder="Наименование" />
                    </label>
                    <label class="col-span-3 text-xs">
                      <span class="block mb-1 text-muted-foreground">Тип</span>
                      <select class="pi-input w-full" formControlName="type" [name]="'type-' + i">
                        @for (t of columnTypes; track t.key) {
                          <option [value]="t.key">{{ t.label }}</option>
                        }
                      </select>
                    </label>
                    <label class="col-span-2 text-xs">
                      <span class="block mb-1 text-muted-foreground">Ширина</span>
                      <input class="pi-input w-full font-mono text-xs" type="number" formControlName="width" min="20" max="800" />
                    </label>
                  </div>
                  <div class="grid grid-cols-12 gap-2 items-end">
                    <div class="col-span-10 flex items-center gap-4 text-xs">
                      <span class="eyebrow text-muted-foreground">Выравнивание:</span>
                      @for (a of alignOptions; track a.key) {
                        <label class="flex items-center gap-1 cursor-pointer">
                          <input type="radio" [value]="a.key" [name]="'align-' + i" formControlName="align" />
                          <span>{{ a.label }}</span>
                        </label>
                      }
                      <label class="flex items-center gap-2 ml-2 flex-1">
                        <span class="eyebrow text-muted-foreground">Формат:</span>
                        <input class="pi-input flex-1 font-mono text-xs" formControlName="format" placeholder="опционально (Intl pattern)" />
                      </label>
                    </div>
                    <div class="col-span-2 flex justify-end gap-1">
                      <button
                        type="button"
                        class="pi-button pi-button-ghost px-2 py-1 text-xs"
                        [disabled]="i === 0"
                        (click)="moveColumn(i, -1)"
                        [attr.aria-label]="'Переместить ' + col.controls.label.value + ' вверх'"
                      >↑</button>
                      <button
                        type="button"
                        class="pi-button pi-button-ghost px-2 py-1 text-xs"
                        [disabled]="i === columnsArray.controls.length - 1"
                        (click)="moveColumn(i, +1)"
                        [attr.aria-label]="'Переместить ' + col.controls.label.value + ' вниз'"
                      >↓</button>
                      <button
                        type="button"
                        class="pi-button pi-button-ghost px-2 py-1 text-xs text-destructive"
                        (click)="removeColumn(i)"
                        [attr.aria-label]="'Удалить колонку ' + col.controls.label.value"
                      >×</button>
                    </div>
                  </div>
                </div>
              }
            </div>
            <button
              type="button"
              class="mt-3 pi-button pi-button-ghost text-sm"
              (click)="addColumn()"
              data-test="add-column-button"
            >+ Добавить колонку</button>
          </fieldset>

          <label class="block text-sm">
            <span class="eyebrow block mb-1.5 text-ink">Образцы строк (JSON-массив массивов)</span>
            <textarea
              class="pi-input w-full font-mono text-xs"
              rows="6"
              formControlName="sampleRowsJson"
              name="sampleRowsJson"
              placeholder='[["А-001", 2, 1500], ["А-002", 1, 800]]'
              data-test="sample-rows-input"
            ></textarea>
            <span class="text-xs text-muted-foreground mt-1 block">каждая строка — массив значений в порядке колонок</span>
          </label>

          <div class="grid grid-cols-2 gap-4">
            <label class="block text-sm">
              <span class="eyebrow block mb-1.5 text-ink">Порядок</span>
              <input class="pi-input w-full" type="number" formControlName="sortOrder" name="sortOrder" />
            </label>
            <label class="flex items-center gap-2 mt-7 cursor-pointer">
              <input type="checkbox" formControlName="isActive" name="isActive" />
              <span class="text-sm">Активен</span>
            </label>
          </div>
        </div>

        <div class="space-y-2">
          <span class="eyebrow text-ink">Предпросмотр (server-side)</span>
          <div class="hairline rounded-sm bg-paper-2 px-5 py-4 text-sm min-h-[24rem] overflow-x-auto">
            @if (previewLoading()) {
              <p class="text-muted-foreground">Загрузка preview…</p>
            } @else if (previewHtml()) {
              <div [innerHTML]="previewHtml()"></div>
            } @else {
              <p class="text-muted-foreground text-xs">Сохраните шаблон, чтобы увидеть preview.</p>
            }
          </div>
          <button
            type="button"
            class="text-xs text-muted-foreground underline hover:text-ink"
            [disabled]="!data || previewLoading()"
            (click)="loadPreview()"
          >↻ Обновить preview</button>
        </div>
      </div>

      <div footer>
        @if (errorMessage()) {
          <span class="text-sm text-destructive mr-auto">{{ errorMessage() }}</span>
        }
        @if (validationError()) {
          <span class="text-sm text-destructive mr-auto">{{ validationError() }}</span>
        }
        <app-pi-button variant="ghost" (click)="onCancel()" data-test="cancel-button">Отмена</app-pi-button>
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
})
export class TableTemplateFormDialogComponent {
  protected readonly data: TableTemplate | null = inject(PI_DIALOG_DATA) as TableTemplate | null;
  private readonly ref = inject<DialogRef<TableTemplate | null>>(PI_DIALOG_REF);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(TableTemplatesService);
  private readonly toast = inject(PiToastService);

  protected readonly columnTypes = COLUMN_TYPES;
  protected readonly alignOptions = ALIGN_OPTIONS;
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

  protected readonly form = this.fb.group({
    name: this.fb.control(this.data?.name ?? '', [Validators.required, Validators.maxLength(200)]),
    description: this.fb.control(this.data?.description ?? '', []),
    category: this.fb.control<NonNullable<TableTemplate['category']>>(
      this.data?.category ?? 'custom',
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

  protected get columnsArray(): FormArray<TableColumnForm> {
    return this.form.controls.columns;
  }

  /** Edit mode bootstrap: load preview for existing template. */
  constructor() {
    queueMicrotask(() => {
      if (this.data) this.loadPreview();
    });
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
    const v = this.form.getRawValue();
    const vErr = this.validate();
    if (vErr) {
      this.validationError.set(vErr);
      return;
    }
    this.validationError.set(null);
    this.saving.set(true);
    this.errorMessage.set(null);

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
    if (json) {
      sampleRows = JSON.parse(json);
    }

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

  /** Trigger GET /api/table-templates/:id/preview — available only after first save. */
  protected loadPreview(): void {
    if (!this.data) return;
    this.previewLoading.set(true);
    this.service.preview(this.data._id).subscribe((res: SilentResult<string>) => {
      this.previewLoading.set(false);
      if (res.ok) {
        this.previewHtml.set(res.data);
      } else {
        this.previewHtml.set(null);
      }
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
