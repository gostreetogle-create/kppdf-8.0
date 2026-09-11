import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
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
  PiDialogService,
  PI_DIALOG_DATA,
  PI_DIALOG_REF,
  type DialogRef,
} from '@kppdf/ui/dialog';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiToastService } from '@kppdf/ui/toast';
import { firstValueFrom } from 'rxjs';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import { RegistryCreateButtonComponent } from '../registries/registry-create-button.component';
import {
  MaterialFormDialogComponent,
  type MaterialFormDialogData,
} from '../registries/dialogs/material-form-dialog.component';

/** Mirrors `supply-request-form-dialog.component.ts`'s material typeahead. */
const MIN_MATERIAL_QUERY = 2;
const MATERIAL_SEARCH_DEBOUNCE_MS = 300;

export interface StoragePutOnStockDialogData {
  readonly warehouses: readonly Warehouse[];
  readonly materialId?: string;
  readonly materialName?: string;
}

@Component({
  selector: 'pi-storage-put-on-stock-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiDialogComponent, ButtonComponent, RegistryCreateButtonComponent],
  template: `
    <app-pi-dialog
      title="Поставить на склад"
      variant="content"
      width="sm"
      [showClose]="true"
      (userClose)="ref.close(undefined)"
    >
      <div body class="space-y-form-field">
        <div class="flex flex-col gap-1 text-sm">
          <span>Материал *</span>
          @if (materialId(); as id) {
            <div
              class="flex items-center justify-between gap-2 pi-input"
              data-test="put-material-chip"
            >
              <span class="truncate">{{ materialLabel() }}</span>
              <button
                type="button"
                class="pi-outline-btn shrink-0"
                (click)="clearMaterial()"
                data-test="put-material-clear"
              >
                Очистить
              </button>
            </div>
          } @else {
            <div class="flex items-end gap-2">
              <input
                id="put-material-search"
                class="pi-input pi-focus-ring flex-1"
                type="text"
                [value]="materialQuery()"
                (input)="onMaterialQuery(inputValue($event))"
                placeholder="Название или артикул…"
                aria-label="Найти материал"
                data-test="put-material-search"
              />
              <pi-registry-create-button
                label="Создать материал"
                dataTest="put-material-create"
                (createClick)="openCreateMaterial()"
              />
            </div>
            @if (materialResults().length > 0) {
              <ul
                class="pi-dashed-panel divide-y divide-border"
                data-test="put-material-results"
              >
                @for (m of materialResults(); track m._id) {
                  <li>
                    <button
                      type="button"
                      class="w-full text-left px-2 py-1.5 text-sm hover:bg-paper-2"
                      (click)="pickMaterial(m)"
                      [attr.data-test]="'put-material-pick-' + m._id"
                    >
                      {{ m.name }}
                      @if (m.article) {
                        <span class="text-muted-foreground">· {{ m.article }}</span>
                      }
                    </button>
                  </li>
                }
              </ul>
            } @else if (materialQuery().trim().length >= minMaterialQuery) {
              <p class="text-xs text-muted-foreground m-0" data-test="put-material-empty">
                Ничего не найдено.
              </p>
            }
          }
        </div>
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
        <app-pi-button
          type="button"
          variant="outline"
          (click)="ref.close(undefined)"
          data-test="put-cancel"
        >
          Отмена
        </app-pi-button>
        <app-pi-button
          type="button"
          variant="default"
          [disabled]="saving()"
          (click)="submit()"
          data-test="put-submit"
        >
          Поставить
        </app-pi-button>
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
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly minMaterialQuery = MIN_MATERIAL_QUERY;

  readonly warehouseId = signal('');
  readonly materialId = signal<string | null>(null);
  readonly materialLabel = signal('');
  readonly materialQuery = signal('');
  readonly materialResults = signal<Material[]>([]);
  private materialSearchTimer: ReturnType<typeof setTimeout> | null = null;
  private materialSearchVersion = 0;

  readonly quantity = signal(0);
  readonly minimum = signal(0);
  readonly zoneName = signal('');
  readonly saving = signal(false);
  readonly error = signal('');

  constructor() {
    this.materialId.set(this.data.materialId ?? null);
    this.materialLabel.set(this.data.materialName ?? '');
    this.warehouseId.set(
      this.data.warehouses.find((warehouse) => warehouse.isActive !== false)
        ?._id ?? '',
    );
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

  onMaterialQuery(value: string): void {
    this.materialQuery.set(value);
    if (this.materialSearchTimer) clearTimeout(this.materialSearchTimer);
    const query = value.trim();
    if (query.length < MIN_MATERIAL_QUERY) {
      this.materialResults.set([]);
      return;
    }
    const version = ++this.materialSearchVersion;
    this.materialSearchTimer = setTimeout(() => {
      void firstValueFrom(this.materialsApi.list({ search: query, limit: 10 })).then((res) => {
        if (version !== this.materialSearchVersion) return;
        this.materialResults.set(res.ok ? res.data.items : []);
      });
    }, MATERIAL_SEARCH_DEBOUNCE_MS);
  }

  pickMaterial(material: Material): void {
    this.materialId.set(material._id);
    this.materialLabel.set(
      material.article ? `${material.name} · ${material.article}` : material.name,
    );
    this.materialQuery.set('');
    this.materialResults.set([]);
  }

  clearMaterial(): void {
    this.materialId.set(null);
    this.materialLabel.set('');
  }

  openCreateMaterial(): void {
    const ref = this.dialog.open<Material | null | undefined>(MaterialFormDialogComponent, {
      data: { mode: 'create', allowKindSelect: true } satisfies MaterialFormDialogData,
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (material) => {
      if (material) this.pickMaterial(material);
    });
  }

  async submit(): Promise<void> {
    if (this.saving()) return;
    const materialId = this.materialId();
    if (
      !materialId ||
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
      this.api.createForMaterial(materialId, payload),
    );
    if (result.ok) {
      this.toast.success('Позиция поставлена на склад');
      this.ref.close(result.data);
    } else {
      this.error.set(extractErrorMessage(result.error));
      this.saving.set(false);
    }
  }
}
