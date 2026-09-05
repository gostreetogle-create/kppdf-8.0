import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  PiMaterialsService,
  PiProductsService,
  PiStockMovementsService,
  type CreateStockMovementPayload,
  type Material,
  type Product,
  type StockMovement,
  type Warehouse,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { ButtonComponent } from '@kppdf/ui/button';
import {
  PiDialogComponent,
  PI_DIALOG_DATA,
  PI_DIALOG_REF,
  type DialogRef,
} from '@kppdf/ui/dialog';
import { PiFormSectionComponent } from '@kppdf/ui/form-section';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';
import { PiToastService } from '@kppdf/ui/toast';

export type MovementDialogMode = 'in' | 'out';
export type MovementTargetKind = 'material' | 'product';

export interface StockMovementDialogData {
  readonly mode: MovementDialogMode;
  readonly warehouses: readonly Warehouse[];
}

type MovementForm = {
  warehouseId: FormControl<string>;
  materialId: FormControl<string>;
  productId: FormControl<string>;
  zoneName: FormControl<string>;
  qty: FormControl<number>;
  note: FormControl<string>;
  orderId: FormControl<string>;
};

@Component({
  selector: 'pi-stock-movement-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    PiDialogComponent,
    PiFormSectionComponent,
    FormFieldComponent,
    InputComponent,
  ],
  template: `
    <app-pi-dialog
      [title]="title()"
      variant="content"
      width="md"
      [showClose]="true"
      (userClose)="cancel()"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="submit()"
        class="space-y-4"
        data-test="stock-movement-form"
      >
        <app-pi-form-section
          title="Основные данные"
          headingId="movement-form-basics"
          tone="gold"
        >
          <div class="space-y-form-field">
            <app-pi-form-field
              label="Склад"
              htmlFor="movement-warehouse"
              [required]="true"
            >
              <select
                id="movement-warehouse"
                class="pi-input w-full"
                formControlName="warehouseId"
                data-test="movement-form-warehouse"
              >
                <option value="">Выберите склад…</option>
                @for (warehouse of data.warehouses; track warehouse._id) {
                  <option [value]="warehouse._id">{{ warehouse.name }}</option>
                }
              </select>
            </app-pi-form-field>

            <app-pi-form-field
              label="Тип номенклатуры"
              htmlFor="movement-target-kind"
              [required]="true"
            >
              <select
                id="movement-target-kind"
                class="pi-input w-full"
                [value]="targetKind()"
                (change)="onTargetKindChange($event)"
                data-test="movement-form-target-kind"
              >
                <option value="material">Материал</option>
                <option value="product">Продукт</option>
              </select>
            </app-pi-form-field>

            @if (targetKind() === 'material') {
              <app-pi-form-field
                label="Материал"
                htmlFor="movement-material"
                [required]="true"
              >
                <select
                  id="movement-material"
                  class="pi-input w-full"
                  formControlName="materialId"
                  data-test="movement-form-material"
                >
                  <option value="">Выберите материал…</option>
                  @for (material of materials(); track material._id) {
                    <option [value]="material._id">{{ material.name }}</option>
                  }
                </select>
              </app-pi-form-field>
            } @else {
              <app-pi-form-field
                label="Продукт"
                htmlFor="movement-product"
                [required]="true"
              >
                <select
                  id="movement-product"
                  class="pi-input w-full"
                  formControlName="productId"
                  data-test="movement-form-product"
                >
                  <option value="">Выберите продукт…</option>
                  @for (product of products(); track product._id) {
                    <option [value]="product._id">{{ product.name }}</option>
                  }
                </select>
              </app-pi-form-field>
            }

            @if (zones().length > 0) {
              <app-pi-form-field label="Зона" htmlFor="movement-zone">
                <select
                  id="movement-zone"
                  class="pi-input w-full"
                  formControlName="zoneName"
                  data-test="movement-form-zone"
                >
                  <option value="">Без зоны</option>
                  @for (zone of zones(); track zone) {
                    <option [value]="zone">{{ zone }}</option>
                  }
                </select>
              </app-pi-form-field>
            }

            <app-pi-form-field
              [label]="quantityLabel()"
              htmlFor="movement-quantity"
              [required]="true"
            >
              <app-pi-input
                id="movement-quantity"
                type="number"
                formControlName="qty"
                data-test="movement-form-quantity"
              />
            </app-pi-form-field>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <app-pi-form-field label="Примечание" htmlFor="movement-note">
                <app-pi-input
                  id="movement-note"
                  formControlName="note"
                  placeholder="Накладная, комментарий…"
                  data-test="movement-form-note"
                />
              </app-pi-form-field>
              <app-pi-form-field label="ID заказа" htmlFor="movement-order">
                <app-pi-input
                  id="movement-order"
                  formControlName="orderId"
                  placeholder="Необязательно"
                  data-test="movement-form-order"
                />
              </app-pi-form-field>
            </div>
          </div>
        </app-pi-form-section>

        @if (error()) {
          <p
            class="text-sm text-destructive m-0"
            role="alert"
            data-test="movement-form-error"
          >
            {{ error() }}
          </p>
        }
      </form>

      <div footer class="flex justify-end gap-3">
        <app-pi-button
          type="button"
          variant="outline"
          [disabled]="saving()"
          (click)="cancel()"
        >
          Отмена
        </app-pi-button>
        <app-pi-button
          type="button"
          variant="default"
          [disabled]="saving()"
          (click)="submit()"
          data-test="movement-form-submit"
        >
          {{ saving() ? 'Проведение…' : 'Провести' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class StockMovementFormDialogComponent {
  readonly data = inject<StockMovementDialogData>(PI_DIALOG_DATA);
  readonly ref = inject<DialogRef<StockMovement | undefined>>(PI_DIALOG_REF);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly movementsApi = inject(PiStockMovementsService);
  private readonly materialsApi = inject(PiMaterialsService);
  private readonly productsApi = inject(PiProductsService);
  private readonly toast = inject(PiToastService);

  readonly targetKind = signal<MovementTargetKind>('material');
  readonly materials = signal<Material[]>([]);
  readonly products = signal<Product[]>([]);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly title = computed(() =>
    this.data.mode === 'in' ? 'Приход на склад' : 'Расход со склада',
  );
  readonly quantityLabel = computed(() => {
    const id =
      this.targetKind() === 'material'
        ? this.form.controls.materialId.value
        : this.form.controls.productId.value;
    const source =
      this.targetKind() === 'material' ? this.materials() : this.products();
    const unit = source.find((item) => item._id === id)?.unit?.trim();
    return unit ? `Количество (${unit})` : 'Количество';
  });

  readonly form = this.fb.group<MovementForm>({
    warehouseId: this.fb.control(
      this.data.warehouses.find((warehouse) => warehouse.isActive !== false)
        ?._id ?? '',
      Validators.required,
    ),
    materialId: this.fb.control(''),
    productId: this.fb.control(''),
    zoneName: this.fb.control(''),
    qty: this.fb.control(1, [Validators.required, Validators.min(0.0001)]),
    note: this.fb.control(''),
    orderId: this.fb.control(''),
  });

  constructor() {
    void this.loadCatalogs();
  }

  zones(): string[] {
    const warehouse = this.data.warehouses.find(
      (item) => item._id === this.form.controls.warehouseId.value,
    );
    return warehouse?.zoneNames ?? [];
  }

  onTargetKindChange(event: Event): void {
    const kind = (event.target as HTMLSelectElement)
      .value as MovementTargetKind;
    this.targetKind.set(kind === 'product' ? 'product' : 'material');
    if (this.targetKind() === 'material')
      this.form.controls.productId.setValue('');
    else this.form.controls.materialId.setValue('');
  }

  async submit(): Promise<void> {
    if (this.saving()) return;
    this.form.markAllAsTouched();
    const value = this.form.getRawValue();
    const qty = Number(value.qty);
    const materialId = value.materialId.trim() || undefined;
    const productId = value.productId.trim() || undefined;
    if (!value.warehouseId || !Number.isFinite(qty) || qty <= 0) {
      this.error.set('Выберите склад и укажите количество больше 0.');
      return;
    }
    if ((materialId ? 1 : 0) + (productId ? 1 : 0) !== 1) {
      this.error.set('Выберите ровно один материал или продукт.');
      return;
    }

    const payload: CreateStockMovementPayload = {
      type: this.data.mode,
      warehouseId: value.warehouseId,
      qty,
      ...(materialId ? { materialId } : {}),
      ...(productId ? { productId } : {}),
      ...(value.zoneName.trim() ? { zoneName: value.zoneName.trim() } : {}),
      ...(value.note.trim() ? { documentRef: value.note.trim() } : {}),
      ...(value.orderId.trim() ? { orderId: value.orderId.trim() } : {}),
    };

    this.saving.set(true);
    this.error.set('');
    const result = await firstValueFrom(this.movementsApi.create(payload));
    if (result.ok) {
      this.toast.success(
        this.data.mode === 'in' ? 'Приход проведён' : 'Расход проведён',
      );
      this.ref.close(result.data);
    } else {
      this.error.set(extractErrorMessage(result.error));
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.ref.close(undefined);
  }

  private async loadCatalogs(): Promise<void> {
    const [materials, products] = await Promise.all([
      firstValueFrom(this.materialsApi.list({ limit: 100 })),
      firstValueFrom(this.productsApi.list({ limit: 100, isActive: true })),
    ]);
    if (materials.ok) this.materials.set(materials.data.items);
    if (products.ok) this.products.set(products.data.items);
    if (!materials.ok && !products.ok) {
      this.error.set('Не удалось загрузить каталог номенклатуры.');
    }
  }
}
