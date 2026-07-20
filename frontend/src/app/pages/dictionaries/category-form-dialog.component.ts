import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { TextareaComponent } from '../../shared/ui/textarea/textarea.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { Category, CategoriesService } from '../../shared/services/categories.service';

type Result = Category | null | undefined;

const CATEGORY_TYPES: { value: Category['type']; label: string }[] = [
  { value: 'material', label: 'Материал' },
  { value: 'product', label: 'Продукция' },
  { value: 'general', label: 'Общая' },
];

@Component({
  selector: 'app-category-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
  ],
  template: `
    <app-pi-dialog
      [title]="isEdit() ? 'Редактировать категорию' : 'Создать категорию'"
      [width]="'md'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="category-form"
      >
        <app-pi-form-field
          label="Название"
          htmlFor="cat-name"
          [required]="true"
          [error]="errorFor('name')"
        >
          <app-pi-input
            id="cat-name"
            formControlName="name"
            placeholder="Название категории"
            [invalid]="hasError('name')"
          />
        </app-pi-form-field>

        <app-pi-form-field
          label="Slug (URL-ключ)"
          htmlFor="cat-slug"
          [required]="true"
          hint="Строчные латинские буквы, цифры, дефис. Например: metals, wood"
          [error]="errorFor('slug')"
        >
          <app-pi-input
            id="cat-slug"
            formControlName="slug"
            placeholder="category-slug"
            [invalid]="hasError('slug')"
          />
        </app-pi-form-field>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
          <app-pi-form-field label="Тип" htmlFor="cat-type" [required]="true">
            <select id="cat-type" formControlName="type" class="pi-input w-full">
              @for (opt of CATEGORY_TYPES; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </app-pi-form-field>

          <app-pi-form-field
            label="Префикс SKU"
            htmlFor="cat-skuPrefix"
            [required]="true"
            hint="Заглавные A-Z, 0-9, дефис"
            [error]="errorFor('skuPrefix')"
          >
            <app-pi-input
              id="cat-skuPrefix"
              formControlName="skuPrefix"
              placeholder="MAT"
              [invalid]="hasError('skuPrefix')"
            />
          </app-pi-form-field>
        </div>

        <app-pi-form-field label="Описание" htmlFor="cat-description">
          <app-pi-textarea
            id="cat-description"
            formControlName="description"
            [rows]="2"
            [maxLength]="512"
            ariaLabel="Описание категории"
          />
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
          [disabled]="submitting()"
          (click)="onSubmit()"
        >
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
        <app-pi-button type="button" variant="ghost" (click)="onCancel()"> Отмена </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class CategoryFormDialogComponent {
  protected readonly CATEGORY_TYPES = CATEGORY_TYPES;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(CategoriesService);
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  private readonly data = inject<Category | null>(PI_DIALOG_DATA);

  protected readonly isEdit = signal(this.data != null);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: this.fb.control(this.data?.name ?? '', [Validators.required, Validators.maxLength(128)]),
    slug: this.fb.control(this.data?.slug ?? '', [
      Validators.required,
      Validators.maxLength(64),
      Validators.pattern(/^[a-z0-9-]+$/),
    ]),
    type: this.fb.control<Category['type']>(this.data?.type ?? 'material'),
    skuPrefix: this.fb.control(this.data?.skuPrefix ?? '', [
      Validators.required,
      Validators.maxLength(16),
      Validators.pattern(/^[A-Z0-9-]+$/),
    ]),
    description: this.fb.control(this.data?.description ?? '', [Validators.maxLength(512)]),
  });

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
    if (c.errors?.['pattern']) {
      if (name === 'slug') return 'Только строчные латинские, цифры, дефис';
      if (name === 'skuPrefix') return 'Только заглавные A-Z, 0-9, дефис';
      return 'Некорректный формат';
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
    const payload: Partial<Category> = {
      name: v.name,
      slug: v.slug,
      type: v.type,
      skuPrefix: v.skuPrefix,
    };
    if (v.description) payload.description = v.description;

    this.submitting.set(true);
    this.errorMessage.set(null);

    const obs = this.data
      ? this.service.update(this.data._id, payload)
      : this.service.create(payload);

    obs.subscribe((res) => {
      if (res.ok) {
        this.toast.success(this.isEdit() ? 'Категория обновлена' : 'Категория создана');
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
