import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { httpResource } from '@angular/common/http';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { API_BASE_URL } from '../../core/api.tokens';
import { Warehouse } from './warehouses.service';
import { StorageItem, StorageItemsService } from './storage-items.service';

export interface PutOnStockDialogData {
  materialId?: string;
  warehouseId?: string;
}

type Result = StorageItem | null | undefined;

interface MaterialsEnvelope {
  items?: { _id: string; name: string }[];
}

/**
 * Put material on stock — POST /materials/:id/storage-items.
 */
@Component({
  selector: 'app-storage-put-on-stock-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
  ],
  template: `
    <app-pi-dialog
      title="Поставить на склад"
      [variant]="'content'"
      [maxWidth]="'min(560px, calc(100vw - 2rem))'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="put-on-stock-form"
      >
        <app-pi-form-field
          label="Склад"
          htmlFor="pos-warehouse"
          [required]="true"
          [error]="errorFor('warehouseId')"
        >
          <select
            id="pos-warehouse"
            class="pi-input w-full"
            formControlName="warehouseId"
            data-test="pos-warehouse"
          >
            <option value="">Выберите склад…</option>
            @for (w of warehouses(); track w._id) {
              <option [value]="w._id">{{ w.name }}</option>
            }
          </select>
        </app-pi-form-field>

        <app-pi-form-field
          label="Материал"
          htmlFor="pos-material"
          [required]="true"
          [error]="errorFor('materialId')"
        >
          <select
            id="pos-material"
            class="pi-input w-full"
            formControlName="materialId"
            data-test="pos-material"
          >
            <option value="">Выберите материал…</option>
            @for (m of materials(); track m._id) {
              <option [value]="m._id">{{ m.name }}</option>
            }
          </select>
        </app-pi-form-field>

        @if (zones().length) {
          <app-pi-form-field label="Зона" htmlFor="pos-zone">
            <select id="pos-zone" class="pi-input w-full" formControlName="zoneName">
              <option value="">Без зоны</option>
              @for (z of zones(); track z) {
                <option [value]="z">{{ z }}</option>
              }
            </select>
          </app-pi-form-field>
        }

        <div class="grid grid-cols-2 gap-form-field">
          <app-pi-form-field
            label="Количество"
            htmlFor="pos-qty"
            [required]="true"
            [error]="errorFor('quantity')"
          >
            <app-pi-input
              id="pos-qty"
              type="number"
              formControlName="quantity"
              [invalid]="hasError('quantity')"
            />
          </app-pi-form-field>
          <app-pi-form-field label="Минимум" htmlFor="pos-min">
            <app-pi-input id="pos-min" type="number" formControlName="minQuantity" />
          </app-pi-form-field>
        </div>

        @if (errorMessage()) {
          <p class="text-sm text-destructive" role="alert">{{ errorMessage() }}</p>
        }
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
          data-test="put-on-stock-save"
        >
          {{ submitting() ? 'Сохранение…' : 'Поставить' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class StoragePutOnStockDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(StorageItemsService);
  private readonly toast = inject(PiToastService);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  private readonly data = inject<PutOnStockDialogData | null>(PI_DIALOG_DATA, { optional: true });

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly warehousesRes = httpResource<Warehouse[]>(() => ({
    url: `${this.baseUrl}/warehouses`,
  }));
  protected readonly materialsRes = httpResource<MaterialsEnvelope>(() => ({
    url: `${this.baseUrl}/materials`,
    params: { limit: '300' },
  }));

  protected readonly warehouses = computed(() =>
    (this.warehousesRes.value() ?? []).filter((w) => w.isActive !== false),
  );
  protected readonly materials = computed(() => this.materialsRes.value()?.items ?? []);

  protected readonly form = this.fb.group({
    warehouseId: this.fb.control(this.data?.warehouseId ?? '', [Validators.required]),
    materialId: this.fb.control(this.data?.materialId ?? '', [Validators.required]),
    zoneName: this.fb.control(''),
    quantity: this.fb.control(0, [Validators.required, Validators.min(0)]),
    minQuantity: this.fb.control(0, [Validators.min(0)]),
  });

  protected zones(): string[] {
    const id = this.form.controls.warehouseId.value;
    const wh = this.warehouses().find((w) => w._id === id);
    return wh?.zoneNames ?? [];
  }

  protected hasError(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }

  protected errorFor(name: keyof typeof this.form.controls): string {
    const c = this.form.controls[name];
    if (!c.invalid || (!c.dirty && !c.touched)) return '';
    if (c.errors?.['required']) return 'Обязательное поле';
    if (c.errors?.['min']) return 'Не может быть отрицательным';
    return 'Некорректное значение';
  }

  protected onSubmit(): void {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.submitting.set(true);
    this.errorMessage.set(null);

    this.service
      .createForMaterial(v.materialId, {
        warehouseId: v.warehouseId,
        zoneName: v.zoneName || undefined,
        quantity: Number(v.quantity),
        minQuantity: Number(v.minQuantity) || 0,
      })
      .subscribe((res) => {
        if (res.ok) {
          this.toast.success('Позиция поставлена на склад');
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
