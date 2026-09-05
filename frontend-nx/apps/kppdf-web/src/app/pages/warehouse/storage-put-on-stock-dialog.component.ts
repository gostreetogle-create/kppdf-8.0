import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  PiMaterialsService,
  PiStorageItemsService,
  type Material,
  type PutOnStockPayload,
  type Warehouse,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import {
  PiDialogComponent,
  PI_DIALOG_DATA,
  PI_DIALOG_REF,
  type DialogRef,
} from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { firstValueFrom } from 'rxjs';

export interface StoragePutOnStockDialogData {
  readonly warehouses: readonly Warehouse[];
  readonly materialId?: string;
  readonly materialName?: string;
}

@Component({
  selector: 'pi-storage-put-on-stock-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiDialogComponent],
  template: `
    <app-pi-dialog
      title="Поставить на склад"
      variant="content"
      width="sm"
      [showClose]="true"
      (userClose)="ref.close(undefined)"
    >
      <div body class="space-y-form-field">
        <label class="flex flex-col gap-1 text-sm" for="put-material">
          <span>Материал *</span>
          <select
            id="put-material"
            class="pi-input pi-focus-ring"
            [value]="materialId()"
            (change)="materialId.set(selectValue($event))"
            [disabled]="materialsLoading()"
            data-test="put-material"
          >
            <option value="">Выберите материал…</option>
            @for (material of materialOptions(); track material._id) {
              <option [value]="material._id">{{ material.name }}</option>
            }
          </select>
          @if (data.materialName && materialId()) {
            <span class="text-xs text-muted-foreground">{{
              data.materialName
            }}</span>
          }
        </label>
        <label class="flex flex-col gap-1 text-sm" for="put-warehouse">
          <span>Склад *</span>
          <select
            id="put-warehouse"
            class="pi-input pi-focus-ring"
            [value]="warehouseId()"
            (change)="warehouseId.set(selectValue($event))"
            data-test="put-warehouse"
          >
            <option value="">Выберите склад…</option>
            @for (warehouse of data.warehouses; track warehouse._id) {
              <option [value]="warehouse._id">{{ warehouse.name }}</option>
            }
          </select>
        </label>
        <label class="flex flex-col gap-1 text-sm" for="put-quantity">
          <span>Количество *</span>
          <input
            id="put-quantity"
            class="pi-input pi-focus-ring"
            type="number"
            min="0"
            [value]="quantity()"
            (input)="quantity.set(numberValue($event))"
            data-test="put-quantity"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm" for="put-minimum">
          <span>Минимум</span>
          <input
            id="put-minimum"
            class="pi-input pi-focus-ring"
            type="number"
            min="0"
            [value]="minimum()"
            (input)="minimum.set(numberValue($event))"
            data-test="put-minimum"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm" for="put-zone">
          <span>Зона (необязательно)</span>
          <input
            id="put-zone"
            class="pi-input pi-focus-ring"
            type="text"
            [value]="zoneName()"
            (input)="zoneName.set(inputValue($event))"
            data-test="put-zone"
          />
        </label>
        @if (error()) {
          <p
            class="text-sm text-destructive m-0"
            role="alert"
            data-test="put-error"
          >
            {{ error() }}
          </p>
        }
      </div>
      <div footer class="flex justify-end gap-3">
        <button
          type="button"
          class="pi-button pi-button-outline"
          (click)="ref.close(undefined)"
        >
          Отмена
        </button>
        <button
          type="button"
          class="pi-button pi-button-primary"
          [disabled]="saving()"
          (click)="submit()"
          data-test="put-submit"
        >
          Поставить
        </button>
      </div>
    </app-pi-dialog>
  `,
})
export class StoragePutOnStockDialogComponent {
  readonly data = inject<StoragePutOnStockDialogData>(PI_DIALOG_DATA);
  readonly ref = inject<DialogRef<unknown>>(PI_DIALOG_REF);
  private readonly api = inject(PiStorageItemsService);
  private readonly materialsApi = inject(PiMaterialsService);
  private readonly toast = inject(PiToastService);

  readonly warehouseId = signal('');
  readonly materialId = signal('');
  readonly materials = signal<readonly Material[]>([]);
  readonly materialsLoading = signal(false);
  readonly materialOptions = computed<readonly Material[]>(() => {
    const items = this.materials();
    const selectedId = this.materialId();
    if (
      !selectedId ||
      items.some((material) => material._id === selectedId) ||
      !this.data.materialName
    ) {
      return items;
    }
    return [
      { _id: selectedId, name: this.data.materialName, unit: '' },
      ...items,
    ];
  });
  readonly quantity = signal(0);
  readonly minimum = signal(0);
  readonly zoneName = signal('');
  readonly saving = signal(false);
  readonly error = signal('');

  constructor() {
    this.materialId.set(this.data.materialId ?? '');
    this.warehouseId.set(
      this.data.warehouses.find((warehouse) => warehouse.isActive !== false)
        ?._id ?? '',
    );
    void this.loadMaterials();
  }

  inputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  selectValue(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }

  numberValue(event: Event): number {
    return Number((event.target as HTMLInputElement).value) || 0;
  }

  async submit(): Promise<void> {
    if (this.saving()) return;
    if (
      !this.materialId() ||
      !this.warehouseId() ||
      this.quantity() < 0 ||
      this.minimum() < 0
    ) {
      this.error.set(
        'Выберите материал и склад и укажите неотрицательное количество.',
      );
      return;
    }
    const payload: PutOnStockPayload = {
      warehouseId: this.warehouseId(),
      quantity: this.quantity(),
      minQuantity: this.minimum(),
      zoneName: this.zoneName().trim() || undefined,
    };
    this.saving.set(true);
    this.error.set('');
    const result = await firstValueFrom(
      this.api.createForMaterial(this.materialId(), payload),
    );
    if (result.ok) {
      this.toast.success('Позиция поставлена на склад');
      this.ref.close(result.data);
    } else {
      this.error.set(extractErrorMessage(result.error));
      this.saving.set(false);
    }
  }

  private async loadMaterials(): Promise<void> {
    this.materialsLoading.set(true);
    const result = await firstValueFrom(this.materialsApi.list({ limit: 100 }));
    if (result.ok) {
      this.materials.set(result.data.items);
    } else if (!this.materialId()) {
      this.error.set(extractErrorMessage(result.error));
    }
    this.materialsLoading.set(false);
  }
}
