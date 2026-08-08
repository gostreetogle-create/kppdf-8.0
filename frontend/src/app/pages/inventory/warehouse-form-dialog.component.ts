import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { TextareaComponent } from '../../shared/ui/textarea/textarea.component';
import { SwitchComponent } from '../../shared/ui/switch/switch.component';
import { PiFormSectionComponent } from '../../shared/ui/form-section';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { Warehouse, WarehouseType, WarehousesService } from './warehouses.service';

type Result = Warehouse | null | undefined;

const WAREHOUSE_TYPES: { value: WarehouseType; label: string }[] = [
  { value: 'production', label: 'Производство / цех' },
  { value: 'main', label: 'Основной' },
  { value: 'branch', label: 'Филиал' },
  { value: 'transit', label: 'Транзит' },
  { value: 'other', label: 'Другой' },
];

/**
 * Create/edit warehouse dialog — live API to POST/PATCH /warehouses.
 */
@Component({
  selector: 'app-warehouse-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    SwitchComponent,
    PiFormSectionComponent,
  ],
  template: `
    <app-pi-dialog
      [title]="isEdit() ? 'Редактировать склад' : 'Создать склад'"
      [variant]="'content'"
      [maxWidth]="'min(640px, calc(100vw - 2rem))'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="warehouse-form"
      >
        <app-pi-form-section title="Основные данные" headingId="warehouse-sec-basics" tone="gold">
          <app-pi-form-field
            label="Название"
            htmlFor="wh-name"
            [required]="true"
            [error]="errorFor('name')"
          >
            <app-pi-input
              id="wh-name"
              formControlName="name"
              placeholder="Цех окраски"
              [invalid]="hasError('name')"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="Тип"
            htmlFor="wh-type"
            hint="Классификация для отчётов и подписей: Основной — главный склад; Производство/цех — запасы в цехе; Транзит — перевалочная точка; Филиал — удалённый склад; Другой — прочее. На движения не влияет."
          >
            <select id="wh-type" class="pi-input w-full" formControlName="type" data-test="wh-type">
              @for (t of types; track t.value) {
                <option [value]="t.value">{{ t.label }}</option>
              }
            </select>
          </app-pi-form-field>

          <app-pi-form-field label="Адрес" htmlFor="wh-address">
            <app-pi-input id="wh-address" formControlName="address" placeholder="Опционально" />
          </app-pi-form-field>

          <app-pi-form-field label="Зоны" htmlFor="wh-zones" hint="Через запятую: А, Б, Стеллаж 1">
            <app-pi-input id="wh-zones" formControlName="zonesText" placeholder="А, Б" />
          </app-pi-form-field>

          <app-pi-form-field label="Описание" htmlFor="wh-description">
            <app-pi-textarea
              id="wh-description"
              formControlName="description"
              [rows]="2"
              [maxLength]="512"
              ariaLabel="Описание склада"
            />
          </app-pi-form-field>

          <div class="flex items-center gap-3">
            <app-pi-switch
              id="wh-active"
              [checked]="form.controls.isActive.value"
              (checkedChange)="onActiveChange($event)"
              ariaLabel="Склад активен"
            />
            <label for="wh-active" class="text-sm cursor-pointer">Активен</label>
          </div>

          @if (errorMessage()) {
            <p class="text-sm text-destructive" role="alert">{{ errorMessage() }}</p>
          }
        </app-pi-form-section>
      </form>

      <div footer class="flex justify-end gap-2">
        <app-pi-button
          type="button"
          variant="outline"
          (click)="onCancel()"
          [disabled]="submitting()"
        >
          Отмена
        </app-pi-button>
        <app-pi-button
          type="button"
          variant="default"
          (click)="onSubmit()"
          [disabled]="submitting()"
          data-test="warehouse-save"
        >
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class WarehouseFormDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(WarehousesService);
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  private readonly data = inject<Warehouse | null>(PI_DIALOG_DATA);

  protected readonly types = WAREHOUSE_TYPES;
  protected readonly isEdit = signal(!!this.data?._id);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: this.fb.control(this.data?.name ?? '', [Validators.required, Validators.maxLength(128)]),
    type: this.fb.control<WarehouseType>((this.data?.type as WarehouseType) || 'main'),
    address: this.fb.control(this.data?.address ?? ''),
    zonesText: this.fb.control((this.data?.zoneNames ?? []).join(', ')),
    description: this.fb.control(this.data?.description ?? '', [Validators.maxLength(512)]),
    isActive: this.fb.control(this.data?.isActive ?? true),
  });

  protected onActiveChange(value: boolean): void {
    this.form.controls.isActive.setValue(value);
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
    return 'Некорректное значение';
  }

  protected onSubmit(): void {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const zoneNames = v.zonesText
      .split(',')
      .map((z) => z.trim())
      .filter(Boolean);
    const payload = {
      name: v.name.trim(),
      type: v.type,
      address: v.address.trim() || undefined,
      description: v.description.trim() || undefined,
      zoneNames,
      isActive: v.isActive,
    };

    this.submitting.set(true);
    this.errorMessage.set(null);

    const obs = this.data?._id
      ? this.service.update(this.data._id, payload)
      : this.service.create(payload);

    obs.subscribe((res) => {
      if (res.ok) {
        this.toast.success(this.isEdit() ? 'Склад обновлён' : 'Склад создан');
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
