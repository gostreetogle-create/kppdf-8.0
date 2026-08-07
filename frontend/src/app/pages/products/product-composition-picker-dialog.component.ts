import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiOverflowSelectComponent } from '../../shared/ui/overflow-select/pi-overflow-select.component';
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
  /** When true: only module + material (incl. raw); no product-complex tab. */
  restrictToModule?: boolean;
}

type PickerKind = 'product' | 'module' | 'material';

/**
 * Catalog picker for composition lines.
 * Fixed xl shell — tab switch must not resize the dialog.
 * Dropdown: app-pi-overflow-select (docs/pages/ui-overflow-select.md).
 */
@Component({
  selector: 'app-product-composition-picker-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent, PiOverflowSelectComponent],
  template: `
    <app-pi-dialog [title]="dialogTitle" [width]="'xl'" [variant]="'form'">
      <div body class="space-y-4">
        <div
          class="grid grid-cols-3 gap-1 hairline rounded-sm p-1"
          role="tablist"
          aria-label="Тип строки состава"
        >
          @for (kind of visibleKinds; track kind.value) {
            <button
              type="button"
              role="tab"
              class="px-2 py-2 text-sm rounded-sm transition-colors text-center leading-snug"
              [class.bg-paper-2]="activeKind() === kind.value"
              [class.font-medium]="activeKind() === kind.value"
              [attr.aria-selected]="activeKind() === kind.value"
              (click)="selectKind(kind.value)"
            >
              {{ kind.label }}
            </button>
          }
        </div>

        @if (loading()) {
          <p role="status" class="text-xs text-muted-foreground py-8 text-center">
            Загрузка каталога…
          </p>
        }
        @if (error()) {
          <p role="alert" class="text-sm text-destructive">{{ error() }}</p>
        }

        @if (!loading() && !error()) {
          <div
            class="grid grid-cols-1 md:grid-cols-[minmax(11rem,14rem)_minmax(0,1fr)] gap-3 items-start"
          >
            <label class="block min-w-0">
              <span class="eyebrow block mb-1.5">Поиск</span>
              <input
                class="pi-input w-full"
                type="search"
                [value]="query()"
                (input)="onQuery($event)"
                [placeholder]="searchPlaceholder()"
                data-test="composition-picker-search"
              />
              <p class="text-[11px] text-muted-foreground m-0 mt-1.5 leading-snug">
                {{ kindHint() }}
              </p>
            </label>

            <div class="block min-w-0">
              <span class="eyebrow block mb-1.5">Что добавить</span>
              <app-pi-overflow-select
                [items]="available()"
                [value]="selectedId()"
                (valueChange)="selectedId.set($event)"
                placeholder="— выбрать —"
                ariaLabel="Что добавить"
                dataTest="composition-picker-select"
              />
              <p class="text-[11px] text-muted-foreground m-0 mt-1.5 tabular-nums">
                {{ available().length }} в списке
                @if (query().trim()) {
                  <span>· фильтр</span>
                }
              </p>
            </div>
          </div>

          @if (validationError()) {
            <p role="alert" class="text-xs text-destructive">{{ validationError() }}</p>
          }

          <div class="min-h-[4.5rem]">
            @if (activeKind() === 'product') {
              <label class="block max-w-xs">
                <span class="eyebrow block mb-1.5">Цена переопределения, ₽</span>
                <input
                  class="pi-input w-full"
                  type="number"
                  min="0"
                  step="0.01"
                  [value]="unitPriceOverride()"
                  (input)="onPriceChange($event)"
                  placeholder="необязательно"
                  data-test="unit-price-override"
                />
              </label>
            }
          </div>
        }
      </div>
      <div footer class="flex gap-3 justify-end">
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

  /**
   * Order: изделие → модуль → деталь/материал.
   * On product: material tab = «Деталь» (raw forbidden).
   * On module: material tab = «Материал» (raw allowed).
   */
  protected readonly visibleKinds: { value: PickerKind; label: string }[] = this.data
    .restrictToModule
    ? [
        { value: 'module', label: 'Модуль' },
        { value: 'material', label: 'Материал' },
      ]
    : [
        { value: 'product', label: 'Изделие' },
        { value: 'module', label: 'Модуль' },
        { value: 'material', label: 'Деталь' },
      ];

  protected readonly dialogTitle = this.data.restrictToModule
    ? 'Добавить в состав модуля'
    : 'Добавить в состав изделия';

  protected readonly activeKind = signal<PickerKind>(
    this.data.restrictToModule ? 'module' : 'product',
  );
  protected readonly selectedId = signal('');
  protected readonly unitPriceOverride = signal('');
  protected readonly query = signal('');
  protected readonly validationError = signal<string | null>(null);
  protected readonly modules = signal<ProductModule[]>([]);
  protected readonly materials = signal<Material[]>([]);
  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly available = computed(() => {
    const q = this.query().trim().toLowerCase();
    const filter = (label: string) => !q || label.toLowerCase().includes(q);
    if (this.activeKind() === 'module')
      return this.modules()
        .map((item) => ({
          id: item._id,
          label: `${item.name} · ${item.article ?? 'без артикула'}`,
        }))
        .filter((item) => filter(item.label));
    if (this.activeKind() === 'material')
      return this.materials()
        .map((item) => ({
          id: item._id,
          label: `${item.name} · ${item.materialKind ? MATERIAL_KIND_LABELS[item.materialKind] : 'тип не указан'}`,
        }))
        .filter((item) => filter(item.label));
    return this.products()
      .map((item) => ({
        id: item._id,
        label: `${item.name} · ${item.sku ?? 'без SKU'}`,
      }))
      .filter((item) => filter(item.label));
  });

  constructor() {
    this.load();
  }

  protected searchPlaceholder(): string {
    if (this.activeKind() === 'module') return 'Название, артикул…';
    if (this.activeKind() === 'material') return 'Название, тип…';
    return 'Название, SKU…';
  }

  protected kindHint(): string {
    if (this.activeKind() === 'product') {
      return 'Другое изделие → текущий товар станет комплексом.';
    }
    if (this.activeKind() === 'module') {
      return 'Готовый модуль из каталога.';
    }
    if (this.data.restrictToModule) {
      return 'Любой материал, включая сырьё.';
    }
    return 'Деталь, метиз, покупное — без сырья.';
  }

  private load(): void {
    const forModule = !!this.data.restrictToModule;
    let remaining = forModule ? 2 : 3;
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
      if (res.ok) {
        const items = res.data.items ?? [];
        this.materials.set(forModule ? items : items.filter((item) => item.materialKind !== 'raw'));
      } else this.error.set(extractErrorMessage(res.error));
      done();
    });
    if (!forModule) {
      this.productsSvc.list({ limit: 200 }).subscribe((res) => {
        if (res.ok)
          this.products.set(res.data.items.filter((item) => item._id !== this.data.productId));
        else this.error.set(extractErrorMessage(res.error));
        done();
      });
    }
  }

  protected selectKind(kind: PickerKind): void {
    this.activeKind.set(kind);
    this.selectedId.set('');
    this.unitPriceOverride.set('');
    this.query.set('');
    this.validationError.set(null);
  }

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
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
