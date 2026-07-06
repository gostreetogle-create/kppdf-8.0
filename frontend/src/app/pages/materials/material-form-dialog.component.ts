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
import {
  PI_DIALOG_DATA,
  PI_DIALOG_REF,
} from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { Material, MaterialsService } from './materials.service';

type Result = Material | null | undefined;

/**
 * TZ-NEW MaterialFormDialogComponent — modal form for create + edit.
 *
 * Opened via `PiDialogService.open(MaterialFormDialogComponent, { data, width: 'lg' })`.
 * - `data: null`            → CREATE mode
 * - `data: Material`        → EDIT mode (form pre-populated)
 *
 * Closes with the saved material on success, or `null` on cancel/error.
 * Parent (MaterialsPage) listens to `ref.closed` to refresh the list.
 *
 * Standalone, OnPush, signal-based. Reactive form (class-validator) for
 * required/optional field enforcement matching `CreateMaterialDto`.
 */
@Component({
  selector: 'app-material-form-dialog',
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
      [title]="isEdit() ? 'Редактировать материал' : 'Создать материал'"
      [width]="'lg'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-4"
        data-test="material-form"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <app-pi-form-field
            label="Название"
            htmlFor="mat-name"
            [required]="true"
            [error]="errorFor('name')"
          >
            <input
              id="mat-name"
              type="text"
              formControlName="name"
              maxlength="256"
              autocomplete="off"
              class="w-full border hairline rounded-sm px-3 py-2 bg-paper text-sm font-body focus:outline-none transition-colors"
              [class.border-rule]="!hasError('name')"
              [class.border-destructive]="hasError('name')"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="Артикул"
            htmlFor="mat-article"
            [error]="errorFor('article')"
          >
            <input
              id="mat-article"
              type="text"
              formControlName="article"
              maxlength="64"
              autocomplete="off"
              class="w-full border hairline rounded-sm px-3 py-2 bg-paper text-sm font-body focus:outline-none transition-colors"
              [class.border-rule]="!hasError('article')"
              [class.border-destructive]="hasError('article')"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="Единица измерения"
            htmlFor="mat-unit"
            [required]="true"
            [error]="errorFor('unit')"
          >
            <select
              id="mat-unit"
              formControlName="unit"
              class="w-full border hairline rounded-sm px-3 py-2 bg-paper text-sm font-body focus:outline-none transition-colors"
              [class.border-rule]="!hasError('unit')"
              [class.border-destructive]="hasError('unit')"
            >
              <option value="" disabled>— выберите —</option>
              <option value="m2">м² (площадь)</option>
              <option value="m3">м³ (объём)</option>
              <option value="kg">кг (масса)</option>
              <option value="sheet">лист</option>
              <option value="pcs">штука</option>
            </select>
          </app-pi-form-field>

          <app-pi-form-field
            label="Код"
            htmlFor="mat-sku"
            [error]="errorFor('sku')"
          >
            <input
              id="mat-sku"
              type="text"
              formControlName="sku"
              autocomplete="off"
              class="w-full border hairline rounded-sm px-3 py-2 bg-paper text-sm font-body focus:outline-none transition-colors"
              [class.border-rule]="!hasError('sku')"
              [class.border-destructive]="hasError('sku')"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="Цена за единицу"
            htmlFor="mat-price"
            [error]="errorFor('pricePerUnit')"
          >
            <input
              id="mat-price"
              type="number"
              step="0.01"
              min="0"
              formControlName="pricePerUnit"
              class="w-full border hairline rounded-sm px-3 py-2 bg-paper text-sm font-body focus:outline-none transition-colors text-right"
              [class.border-rule]="!hasError('pricePerUnit')"
              [class.border-destructive]="hasError('pricePerUnit')"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="Валюта"
            htmlFor="mat-currency"
            [error]="errorFor('priceCurrency')"
          >
            <input
              id="mat-currency"
              type="text"
              formControlName="priceCurrency"
              maxlength="8"
              autocomplete="off"
              class="w-full border hairline rounded-sm px-3 py-2 bg-paper text-sm font-body focus:outline-none transition-colors"
              [class.border-rule]="!hasError('priceCurrency')"
              [class.border-destructive]="hasError('priceCurrency')"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="Остаток на складе"
            htmlFor="mat-stock"
            [error]="errorFor('stockQty')"
          >
            <input
              id="mat-stock"
              type="number"
              step="1"
              min="0"
              formControlName="stockQty"
              class="w-full border hairline rounded-sm px-3 py-2 bg-paper text-sm font-body focus:outline-none transition-colors text-right"
              [class.border-rule]="!hasError('stockQty')"
              [class.border-destructive]="hasError('stockQty')"
            />
          </app-pi-form-field>
        </div>

        <app-pi-form-field
          label="Описание"
          htmlFor="mat-description"
          [error]="errorFor('description')"
        >
          <textarea
            id="mat-description"
            formControlName="description"
            rows="2"
            maxlength="2000"
            class="w-full border hairline rounded-sm px-3 py-2 bg-paper text-sm font-body focus:outline-none transition-colors resize-none"
            [class.border-rule]="!hasError('description')"
            [class.border-destructive]="hasError('description')"
          ></textarea>
        </app-pi-form-field>

        <app-pi-form-field
          label="Заметки"
          htmlFor="mat-notes"
          [error]="errorFor('notes')"
        >
          <textarea
            id="mat-notes"
            formControlName="notes"
            rows="2"
            maxlength="2000"
            class="w-full border hairline rounded-sm px-3 py-2 bg-paper text-sm font-body focus:outline-none transition-colors resize-none"
            [class.border-rule]="!hasError('notes')"
            [class.border-destructive]="hasError('notes')"
          ></textarea>
        </app-pi-form-field>

        @if (errorMessage()) {
          <p role="alert" class="text-xs text-destructive">
            {{ errorMessage() }}
          </p>
        }
      </form>

      <div footer class="flex gap-2">
        <app-pi-button
          type="button"
          variant="default"
          [disabled]="form.invalid || submitting()"
          (click)="onSubmit()"
        >
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
        <app-pi-button
          type="button"
          variant="ghost"
          (click)="onCancel()"
        >
          Отмена
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class MaterialFormDialogComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(MaterialsService);
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  private readonly data = inject<Material | null>(PI_DIALOG_DATA);

  protected readonly isEdit = signal<boolean>(this.data != null);
  protected readonly submitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.minLength(1), Validators.maxLength(256)]),
    article: this.fb.control<string | null>(null, [Validators.maxLength(64)]),
    unit: this.fb.control('', [Validators.required, Validators.maxLength(32)]),
    sku: this.fb.control<string | null>(null),
    pricePerUnit: this.fb.control<number | null>(null, [Validators.min(0)]),
    priceCurrency: this.fb.control('RUB', [Validators.minLength(3), Validators.maxLength(8)]),
    stockQty: this.fb.control<number>(0, [Validators.min(0)]),
    description: this.fb.control<string | null>(null, [Validators.maxLength(2000)]),
    notes: this.fb.control<string | null>(null, [Validators.maxLength(2000)]),
  });

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        name: this.data.name,
        article: this.data.article ?? null,
        unit: this.data.unit,
        sku: this.data.sku ?? null,
        pricePerUnit: this.data.pricePerUnit ?? null,
        priceCurrency: this.data.priceCurrency ?? 'RUB',
        stockQty: this.data.stockQty ?? 0,
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
    if (c.errors?.['minlength']) {
      return `Минимум ${c.errors['minlength'].requiredLength} символа`;
    }
    if (c.errors?.['maxlength']) {
      return `Максимум ${c.errors['maxlength'].requiredLength} символов`;
    }
    if (c.errors?.['min']) {
      return `Минимум ${c.errors['min'].min}`;
    }
    return 'Некорректное значение';
  }

  protected onSubmit(): void {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    // Build payload: drop nulls/empty strings to avoid backend validation
    // noise ("priceCurrency minLength 3" when we send '').
    const payload: Partial<Material> = {
      name: v.name,
      unit: v.unit,
    };
    if (v.article) payload.article = v.article;
    if (v.sku) payload.sku = v.sku;
    if (v.pricePerUnit != null) payload.pricePerUnit = v.pricePerUnit;
    if (v.priceCurrency) payload.priceCurrency = v.priceCurrency;
    if (v.stockQty != null) payload.stockQty = v.stockQty;
    if (v.description) payload.description = v.description;
    if (v.notes) payload.notes = v.notes;

    this.submitting.set(true);
    this.errorMessage.set(null);
    const obs = this.data
      ? this.service.update(this.data._id, payload)
      : this.service.create(payload);
    obs.subscribe({
      next: (saved) => {
        this.toast.success(
          this.isEdit() ? 'Материал обновлён' : 'Материал создан',
        );
        this.ref.close(saved);
      },
      error: (err: unknown) => {
        const e = err as { error?: { message?: string }; message?: string };
        this.errorMessage.set(
          e?.error?.message ?? e?.message ?? 'Не удалось сохранить.',
        );
        this.submitting.set(false);
      },
    });
  }

  protected onCancel(): void {
    this.ref.close(null);
  }
}
