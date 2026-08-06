import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { Product, ProductsService } from '../../shared/services/products.service';
import {
  isValidProductUnitPriceOverride,
  ProductModule,
  ProductModulesService,
} from '../../shared/services/pi-product-modules.service';
import {
  Material,
  MATERIAL_KIND_LABELS,
  MaterialsService,
} from '../../shared/services/materials.service';
import { extractErrorMessage } from '../../core/silent-http';

export type ProductCompositionPickerResult =
  | { lineType: 'module'; refId: string }
  | { lineType: 'material'; refId: string; material: Material }
  | { lineType: 'product'; refId: string; product: Product; unitPriceOverride?: number };

export interface ProductCompositionPickerData {
  productId: string;
}

@Component({
  selector: 'app-product-composition-picker-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent],
  template: `
    <app-pi-dialog title="Добавить в состав изделия" [width]="'lg'" [variant]="'content'">
      <div body class="space-y-3">
        <div
          class="flex gap-1 hairline rounded-sm p-1"
          role="tablist"
          aria-label="Тип строки состава"
        >
          @for (kind of kinds; track kind.value) {
            <button
              type="button"
              role="tab"
              class="flex-1 px-3 py-2 text-sm rounded-sm transition-colors"
              [class.bg-paper-2]="activeKind() === kind.value"
              [attr.aria-selected]="activeKind() === kind.value"
              (click)="selectKind(kind.value)"
            >
              {{ kind.label }}
            </button>
          }
        </div>
        @if (loading()) {
          <p role="status" class="text-xs text-muted-foreground">Загрузка каталога…</p>
        }
        @if (error()) {
          <p role="alert" class="text-xs text-destructive">{{ error() }}</p>
        }
        @if (!loading() && !error()) {
          <label class="block"
            ><span class="eyebrow block mb-1.5">Что добавить</span>
            <select
              class="pi-input w-full"
              [value]="selectedId()"
              (change)="onSelectionChange($event)"
              data-test="composition-picker-select"
            >
              <option value="">— выбрать —</option>
              @for (item of available(); track item.id) {
                <option [value]="item.id">{{ item.label }}</option>
              }
            </select>
          </label>
          @if (activeKind() === 'material') {
            <p class="text-xs text-muted-foreground">
              Сырьё запрещено на изделии: доступны только детали, метизы, покупное и другое.
            </p>
          }
          @if (validationError()) {
            <p role="alert" class="text-xs text-destructive">{{ validationError() }}</p>
          }
          @if (activeKind() === 'product') {
            <label class="block"
              ><span class="eyebrow block mb-1.5">Цена переопределения, ₽ (необязательно)</span>
              <input
                class="pi-input w-full"
                type="number"
                min="0"
                step="0.01"
                [value]="unitPriceOverride()"
                (input)="onPriceChange($event)"
                data-test="unit-price-override"
              />
            </label>
          }
        }
      </div>
      <div footer class="flex gap-3">
        <app-pi-button variant="ghost" type="button" (click)="onCancel()">Отмена</app-pi-button>
        <app-pi-button
          variant="default"
          type="button"
          [disabled]="!selectedId()"
          (click)="onSubmit()"
          >Добавить</app-pi-button
        >
      </div>
    </app-pi-dialog>
  `,
})
export class ProductCompositionPickerDialogComponent {
  protected readonly ref = inject<DialogRef<ProductCompositionPickerResult | null>>(PI_DIALOG_REF);
  protected readonly data = inject<ProductCompositionPickerData>(PI_DIALOG_DATA);
  private readonly modulesSvc = inject(ProductModulesService);
  private readonly materialsSvc = inject(MaterialsService);
  private readonly productsSvc = inject(ProductsService);

  protected readonly kinds = [
    { value: 'module', label: 'Модуль' },
    { value: 'material', label: 'Материал' },
    { value: 'product', label: 'Изделие' },
  ] as const;
  protected readonly activeKind = signal<'module' | 'material' | 'product'>('module');
  protected readonly selectedId = signal('');
  protected readonly unitPriceOverride = signal('');
  protected readonly validationError = signal<string | null>(null);
  protected readonly modules = signal<ProductModule[]>([]);
  protected readonly materials = signal<Material[]>([]);
  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly available = computed(() => {
    if (this.activeKind() === 'module')
      return this.modules().map((item) => ({
        id: item._id,
        label: `${item.name} · ${item.article ?? '—'}`,
      }));
    if (this.activeKind() === 'material')
      return this.materials().map((item) => ({
        id: item._id,
        label: `${item.name} · ${item.materialKind ? MATERIAL_KIND_LABELS[item.materialKind] : 'тип не указан'}`,
      }));
    return this.products().map((item) => ({
      id: item._id,
      label: `${item.name} · ${item.sku ?? '—'}`,
    }));
  });

  constructor() {
    this.load();
  }

  private load(): void {
    let remaining = 3;
    const done = (): void => {
      remaining -= 1;
      if (remaining === 0) this.loading.set(false);
    };
    this.modulesSvc.list().subscribe((res) => {
      if (res.ok) this.modules.set(res.data);
      else this.error.set(extractErrorMessage(res.error));
      done();
    });
    this.materialsSvc.list({ limit: 200 }).subscribe((res) => {
      if (res.ok)
        this.materials.set((res.data.items ?? []).filter((item) => item.materialKind !== 'raw'));
      else this.error.set(extractErrorMessage(res.error));
      done();
    });
    this.productsSvc.list({ limit: 200 }).subscribe((res) => {
      if (res.ok)
        this.products.set(res.data.items.filter((item) => item._id !== this.data.productId));
      else this.error.set(extractErrorMessage(res.error));
      done();
    });
  }

  protected selectKind(kind: 'module' | 'material' | 'product'): void {
    this.activeKind.set(kind);
    this.selectedId.set('');
    this.unitPriceOverride.set('');
    this.validationError.set(null);
  }

  protected onSelectionChange(event: Event): void {
    this.selectedId.set((event.target as HTMLSelectElement).value);
  }

  protected onPriceChange(event: Event): void {
    this.unitPriceOverride.set((event.target as HTMLInputElement).value);
  }

  protected onSubmit(): void {
    const id = this.selectedId();
    if (!id) return;
    if (this.activeKind() === 'product') {
      const rawPrice = this.unitPriceOverride().trim();
      const unitPriceOverride = rawPrice === '' ? undefined : Number(rawPrice);
      if (!isValidProductUnitPriceOverride(unitPriceOverride)) {
        this.validationError.set('Цена переопределения не может быть отрицательной.');
        return;
      }
      const product = this.products().find((item) => item._id === id);
      if (product) this.ref.close({ lineType: 'product', refId: id, product, unitPriceOverride });
      return;
    }
    if (this.activeKind() === 'module') this.ref.close({ lineType: 'module', refId: id });
    else if (this.activeKind() === 'material') {
      const material = this.materials().find((item) => item._id === id);
      if (material) this.ref.close({ lineType: 'material', refId: id, material });
    }
  }

  protected onCancel(): void {
    this.ref.close(null);
  }
}
