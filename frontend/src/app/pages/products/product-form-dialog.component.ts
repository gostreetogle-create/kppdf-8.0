import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { extractErrorMessage } from '../../core/silent-http';
import {
  Product,
  ProductKind,
  ProductsService,
  ProductStatus,
} from './products.service';

type Result = Product | null | undefined;

const KIND_OPTIONS: { value: ProductKind; label: string }[] = [
  { value: 'good', label: 'Товар' },
  { value: 'service', label: 'Услуга' },
  { value: 'work', label: 'Работа' },
];

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'draft', label: 'Черновик' },
  { value: 'new', label: 'Новый' },
  { value: 'active', label: 'Активный' },
  { value: 'archived', label: 'Архив' },
];

const DIMENSION_UNIT_OPTIONS = ['mm', 'cm', 'm'] as const;

/**
 * ProductFormDialogComponent — create/edit product.
 *
 * Sections:
 *  1. Basics: name, sku, kind, unit, subcategory, status
 *  2. Pricing: listPrice, isActive
 *  3. Dimensions: L/W/H + unit (4 inputs)
 *  4. Metadata: weightKg, ralCode
 *  5. Notes: description, notes (textareas)
 *
 * Out of scope (v1): photoIds upload (would mirror materials.service
 * with PhotosService), EAV dynamic attributes (Phase 5 follow-up),
 * categoryId picker (no good lookup endpoint exposed yet).
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
  ],
  template: `
    <app-pi-dialog
      [title]="isEdit() ? 'Редактировать продукт' : 'Создать продукт'"
      [width]="'lg'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="product-form"
      >
        <!-- ─── Basics ─── -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
          <app-pi-form-field
            label="Название"
            htmlFor="prod-name"
            [required]="true"
            [error]="errorFor('name')"
          >
            <input
              id="prod-name"
              type="text"
              formControlName="name"
              maxlength="256"
              autocomplete="off"
              class="w-full h-10 px-control-x text-sm hairline rounded-sm bg-paper text-ink font-body pi-focus-ring transition-colors"
              [class.border-destructive]="hasError('name')"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="SKU"
            htmlFor="prod-sku"
            hint="Если не задан — генерируется автоматически"
            [error]="errorFor('sku')"
          >
            <input
              id="prod-sku"
              type="text"
              formControlName="sku"
              maxlength="64"
              autocomplete="off"
              class="w-full h-10 px-control-x text-sm hairline rounded-sm bg-paper text-ink font-body pi-focus-ring transition-colors mono"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="Вид"
            htmlFor="prod-kind"
            [required]="true"
            [error]="errorFor('kind')"
          >
            <select
              id="prod-kind"
              formControlName="kind"
              class="w-full h-10 px-control-x text-sm hairline rounded-sm bg-paper text-ink font-body pi-focus-ring transition-colors"
            >
              @for (opt of KIND_OPTIONS; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </app-pi-form-field>

          <app-pi-form-field
            label="Единица"
            htmlFor="prod-unit"
            [required]="true"
            [error]="errorFor('unit')"
          >
            <input
              id="prod-unit"
              type="text"
              formControlName="unit"
              maxlength="16"
              autocomplete="off"
              class="w-full h-10 px-control-x text-sm hairline rounded-sm bg-paper text-ink font-body pi-focus-ring transition-colors"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="Подкатегория"
            htmlFor="prod-subcategory"
          >
            <input
              id="prod-subcategory"
              type="text"
              formControlName="subcategory"
              maxlength="64"
              autocomplete="off"
              class="w-full h-10 px-control-x text-sm hairline rounded-sm bg-paper text-ink font-body pi-focus-ring transition-colors"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="Статус"
            htmlFor="prod-status"
          >
            <select
              id="prod-status"
              formControlName="status"
              class="w-full h-10 px-control-x text-sm hairline rounded-sm bg-paper text-ink font-body pi-focus-ring transition-colors"
            >
              @for (opt of STATUS_OPTIONS; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </app-pi-form-field>
        </div>

        <!-- ─── Pricing ─── -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
          <app-pi-form-field
            label="Цена (прайс), ₽"
            htmlFor="prod-price"
            [error]="errorFor('listPrice')"
          >
            <input
              id="prod-price"
              type="number"
              step="0.01"
              min="0"
              formControlName="listPrice"
              class="w-full h-10 px-control-x text-sm hairline rounded-sm bg-paper text-ink font-body pi-focus-ring transition-colors text-right"
            />
          </app-pi-form-field>

          <app-pi-form-field label="Активен" htmlFor="prod-isActive">
            <label
              class="inline-flex items-center gap-2 min-h-touch px-control-x py-control-y hairline rounded-sm cursor-pointer"
            >
              <input
                id="prod-isActive"
                type="checkbox"
                formControlName="isActive"
                class="w-4 h-4"
              />
              <span class="text-sm">Доступен для заказов</span>
            </label>
          </app-pi-form-field>
        </div>

        <!-- ─── Dimensions ─── -->
        <div>
          <p class="eyebrow mb-form-row">Габариты</p>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-form-field items-end">
            <app-pi-form-field label="Длина" htmlFor="prod-len">
              <input
                id="prod-len"
                type="number"
                step="0.01"
                min="0"
                formControlName="dimLength"
                class="w-full h-10 px-control-x text-sm hairline rounded-sm bg-paper text-ink pi-focus-ring transition-colors text-right"
                aria-label="Длина"
              />
            </app-pi-form-field>
            <app-pi-form-field label="Ширина" htmlFor="prod-width">
              <input
                id="prod-width"
                type="number"
                step="0.01"
                min="0"
                formControlName="dimWidth"
                class="w-full h-10 px-control-x text-sm hairline rounded-sm bg-paper text-ink pi-focus-ring transition-colors text-right"
                aria-label="Ширина"
              />
            </app-pi-form-field>
            <app-pi-form-field label="Высота" htmlFor="prod-height">
              <input
                id="prod-height"
                type="number"
                step="0.01"
                min="0"
                formControlName="dimHeight"
                class="w-full h-10 px-control-x text-sm hairline rounded-sm bg-paper text-ink pi-focus-ring transition-colors text-right"
                aria-label="Высота"
              />
            </app-pi-form-field>
            <app-pi-form-field label="Единица" htmlFor="prod-dimUnit">
              <select
                id="prod-dimUnit"
                formControlName="dimUnit"
                class="w-full h-10 px-control-x text-sm hairline rounded-sm bg-paper text-ink pi-focus-ring transition-colors"
              >
                @for (u of DIMENSION_UNIT_OPTIONS; track u) {
                  <option [value]="u">{{ u }}</option>
                }
              </select>
            </app-pi-form-field>
          </div>
        </div>

        <!-- ─── Metadata ─── -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
          <app-pi-form-field label="Вес, кг" htmlFor="prod-weight">
            <input
              id="prod-weight"
              type="number"
              step="0.01"
              min="0"
              formControlName="weightKg"
              class="w-full h-10 px-control-x text-sm hairline rounded-sm bg-paper text-ink pi-focus-ring transition-colors text-right"
            />
          </app-pi-form-field>

          <app-pi-form-field label="RAL (цвет)" htmlFor="prod-ral">
            <input
              id="prod-ral"
              type="text"
              formControlName="ralCode"
              maxlength="16"
              autocomplete="off"
              class="w-full h-10 px-control-x text-sm hairline rounded-sm bg-paper text-ink pi-focus-ring transition-colors mono"
            />
          </app-pi-form-field>
        </div>

        <!-- ─── Notes ─── -->
        <app-pi-form-field
          label="Описание"
          htmlFor="prod-description"
          [error]="errorFor('description')"
        >
          <textarea
            id="prod-description"
            formControlName="description"
            rows="2"
            maxlength="4000"
            class="w-full min-h-20 px-control-x py-control-y text-sm hairline rounded-sm bg-paper text-ink pi-focus-ring transition-colors resize-none"
          ></textarea>
        </app-pi-form-field>

        <app-pi-form-field
          label="Заметки"
          htmlFor="prod-notes"
          [error]="errorFor('notes')"
        >
          <textarea
            id="prod-notes"
            formControlName="notes"
            rows="2"
            maxlength="4000"
            class="w-full min-h-20 px-control-x py-control-y text-sm hairline rounded-sm bg-paper text-ink pi-focus-ring transition-colors resize-none"
          ></textarea>
        </app-pi-form-field>

        @if (errorMessage()) {
          <p role="alert" class="text-xs text-destructive">
            {{ errorMessage() }}
          </p>
        }
      </form>

      <div footer class="flex gap-3">
        <app-pi-button
          type="button"
          variant="default"
          [disabled]="form.invalid || submitting()"
          (click)="onSubmit()"
        >
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
        <app-pi-button type="button" variant="ghost" (click)="onCancel()">
          Отмена
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class ProductFormDialogComponent implements OnInit {
  protected readonly KIND_OPTIONS = KIND_OPTIONS;
  protected readonly STATUS_OPTIONS = STATUS_OPTIONS;
  protected readonly DIMENSION_UNIT_OPTIONS = DIMENSION_UNIT_OPTIONS;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(ProductsService);
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  private readonly data = inject<Product | null>(PI_DIALOG_DATA);

  protected readonly isEdit = signal<boolean>(this.data != null);
  protected readonly submitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: this.fb.control('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(256),
    ]),
    sku: this.fb.control<string | null>(null, [Validators.maxLength(64)]),
    kind: this.fb.control<ProductKind>('good', Validators.required),
    unit: this.fb.control('', [Validators.required, Validators.maxLength(16)]),
    subcategory: this.fb.control<string | null>(null, [Validators.maxLength(64)]),
    status: this.fb.control<ProductStatus>('new'),
    listPrice: this.fb.control<number | null>(null, [Validators.min(0)]),
    isActive: this.fb.control<boolean>(true),
    dimLength: this.fb.control<number | null>(null, [Validators.min(0)]),
    dimWidth: this.fb.control<number | null>(null, [Validators.min(0)]),
    dimHeight: this.fb.control<number | null>(null, [Validators.min(0)]),
    dimUnit: this.fb.control<string>('mm'),
    weightKg: this.fb.control<number | null>(null, [Validators.min(0)]),
    ralCode: this.fb.control<string | null>(null, [Validators.maxLength(16)]),
    description: this.fb.control<string | null>(null, [Validators.maxLength(4000)]),
    notes: this.fb.control<string | null>(null, [Validators.maxLength(4000)]),
  });

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        name: this.data.name,
        sku: this.data.sku ?? null,
        kind: this.data.kind,
        unit: this.data.unit,
        subcategory: this.data.subcategory ?? null,
        status: this.data.status ?? 'new',
        listPrice: this.data.listPrice ?? null,
        isActive: this.data.isActive ?? true,
        dimLength: this.data.dimensions?.length ?? null,
        dimWidth: this.data.dimensions?.width ?? null,
        dimHeight: this.data.dimensions?.height ?? null,
        dimUnit: this.data.dimensions?.unit ?? 'mm',
        weightKg: this.data.weightKg ?? null,
        ralCode: this.data.ralCode ?? null,
        description: this.data.description ?? null,
        notes: this.data.notes ?? null,
      });
    }
  }

  protected hasError(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }

  protected errorFor(name: keyof typeof this.form.controls): string {
    const c = this.form.controls[name];
    if (!c.invalid || (!c.dirty && !c.touched)) return '';
    if (c.errors?.['required']) return 'Обязательное поле';
    if (c.errors?.['maxlength']) {
      return `Максимум ${c.errors['maxlength'].requiredLength} символов`;
    }
    if (c.errors?.['min']) return `Минимум ${c.errors['min'].min}`;
    return 'Некорректное значение';
  }

  protected onSubmit(): void {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const dimensions =
      v.dimLength != null || v.dimWidth != null || v.dimHeight != null
        ? {
            ...(v.dimLength != null ? { length: v.dimLength } : {}),
            ...(v.dimWidth != null ? { width: v.dimWidth } : {}),
            ...(v.dimHeight != null ? { height: v.dimHeight } : {}),
            unit: v.dimUnit,
          }
        : undefined;

    const payload: Partial<Product> = {
      name: v.name,
      kind: v.kind,
      unit: v.unit,
      status: v.status,
      isActive: v.isActive,
    };
    if (v.sku) payload.sku = v.sku;
    if (v.subcategory) payload.subcategory = v.subcategory;
    if (v.listPrice != null) payload.listPrice = v.listPrice;
    if (dimensions) payload.dimensions = dimensions;
    if (v.weightKg != null) payload.weightKg = v.weightKg;
    if (v.ralCode) payload.ralCode = v.ralCode;
    if (v.description) payload.description = v.description;
    if (v.notes) payload.notes = v.notes;

    this.submitting.set(true);
    this.errorMessage.set(null);
    const obs = this.data
      ? this.service.update(this.data._id, payload)
      : this.service.create(payload);
    obs.subscribe((res) => {
      if (res.ok) {
        this.toast.success(
          this.isEdit() ? 'Продукт обновлён' : 'Продукт создан',
        );
        this.ref.close(res.data);
      } else {
        this.errorMessage.set(extractErrorMessage(res.error));
        this.submitting.set(false);
      }
    });
  }

  protected onCancel(): void {
    this.ref.close(null);
  }
}
