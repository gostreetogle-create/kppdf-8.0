import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { httpResource } from '@angular/common/http';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { PiFormSectionComponent } from '../../shared/ui/form-section';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { API_BASE_URL } from '../../core/api.tokens';
import { Warehouse } from './warehouses.service';
import {
  CreateStockMovementPayload,
  StockMovement,
  StockMovementsService,
} from './stock-movements.service';

export type MovementDialogMode = 'in' | 'out';

export interface StockMovementDialogData {
  mode: MovementDialogMode;
}

type Result = StockMovement | null | undefined;

interface MaterialsEnvelope {
  items?: { _id: string; name: string }[];
}

/**
 * Create stock in/out movement. Adjust goes through storage-item adjust API.
 */
@Component({
  selector: 'app-stock-movement-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    PiFormSectionComponent,
  ],
  template: `
    <app-pi-dialog
      [title]="title()"
      [variant]="'content'"
      [maxWidth]="'min(560px, calc(100vw - 2rem))'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="stock-movement-form"
      >
        <app-pi-form-section title="Основные данные" headingId="movement-sec-basics" tone="gold">
          <app-pi-form-field
            label="Склад"
            htmlFor="mv-warehouse"
            [required]="true"
            [error]="errorFor('warehouseId')"
          >
            <select
              id="mv-warehouse"
              class="pi-input w-full"
              formControlName="warehouseId"
              data-test="mv-warehouse"
            >
              <option value="">Выберите склад…</option>
              @for (w of warehouses(); track w._id) {
                <option [value]="w._id">{{ w.name }}</option>
              }
            </select>
          </app-pi-form-field>

          <app-pi-form-field
            label="Материал"
            htmlFor="mv-material"
            [required]="true"
            [error]="errorFor('materialId')"
          >
            <select
              id="mv-material"
              class="pi-input w-full"
              formControlName="materialId"
              data-test="mv-material"
            >
              <option value="">Выберите материал…</option>
              @for (m of materials(); track m._id) {
                <option [value]="m._id">{{ m.name }}</option>
              }
            </select>
          </app-pi-form-field>

          @if (zones().length) {
            <app-pi-form-field label="Зона" htmlFor="mv-zone">
              <select id="mv-zone" class="pi-input w-full" formControlName="zoneName">
                <option value="">Без зоны</option>
                @for (z of zones(); track z) {
                  <option [value]="z">{{ z }}</option>
                }
              </select>
            </app-pi-form-field>
          }

          <app-pi-form-field
            label="Количество"
            htmlFor="mv-qty"
            [required]="true"
            [error]="errorFor('qty')"
          >
            <app-pi-input
              id="mv-qty"
              type="number"
              formControlName="qty"
              placeholder="0"
              [invalid]="hasError('qty')"
            />
          </app-pi-form-field>

          <app-pi-form-field label="Документ / примечание" htmlFor="mv-doc">
            <app-pi-input
              id="mv-doc"
              formControlName="documentRef"
              placeholder="Накладная, заказ…"
            />
          </app-pi-form-field>

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
          data-test="movement-save"
        >
          {{ submitting() ? 'Сохранение…' : 'Провести' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class StockMovementFormDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(StockMovementsService);
  private readonly toast = inject(PiToastService);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  private readonly data = inject<StockMovementDialogData>(PI_DIALOG_DATA);

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly title = computed(() =>
    this.data.mode === 'in' ? 'Приход на склад' : 'Расход со склада',
  );

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
    warehouseId: this.fb.control('', [Validators.required]),
    materialId: this.fb.control('', [Validators.required]),
    zoneName: this.fb.control(''),
    qty: this.fb.control(1, [Validators.required, Validators.min(0.0001)]),
    documentRef: this.fb.control(''),
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
    if (c.errors?.['min']) return 'Должно быть больше 0';
    return 'Некорректное значение';
  }

  protected onSubmit(): void {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const payload: CreateStockMovementPayload = {
      type: this.data.mode,
      warehouseId: v.warehouseId,
      materialId: v.materialId,
      qty: Number(v.qty),
      zoneName: v.zoneName || undefined,
      documentRef: v.documentRef.trim() || undefined,
    };

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.service.create(payload).subscribe((res) => {
      if (res.ok) {
        this.toast.success(this.data.mode === 'in' ? 'Приход проведён' : 'Расход проведён');
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
