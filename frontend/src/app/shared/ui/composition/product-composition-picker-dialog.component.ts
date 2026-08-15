import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { PiDialogComponent } from '../dialog/pi-dialog.component';
import { DialogRef, PiDialogService } from '../dialog/pi-dialog.service';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../dialog/dialog.tokens';
import { PiOverflowSelectComponent } from '../overflow-select/pi-overflow-select.component';
import { Product, ProductsService } from '../../services/products.service';
import {
  isValidProductUnitPriceOverride,
  ProductModule,
  ProductModulesService,
} from '../../services/pi-product-modules.service';
import { Material, MaterialsService } from '../../services/materials.service';
import {
  dictionaryLabelOptions,
  PiDictionaryLabelsService,
} from '../../services/pi-dictionary-labels.service';
import { extractErrorMessage } from '../../../core/silent-http';
import { CatalogKindMarkerComponent } from '../catalog/catalog-kind-marker.component';
import { ProductCompositionDialogService } from '../../services/product-composition-dialog.service';
import { onDialogCloseOnce } from '../../util/on-dialog-close-once';

export type ProductCompositionPickerResult =
  | { lineType: 'module'; refId: string; quantity: number }
  | { lineType: 'material'; refId: string; quantity: number; material: Material }
  | {
      lineType: 'product';
      refId: string;
      quantity: number;
      product: Product;
      unitPriceOverride?: number;
    };

type PickerKind = 'product' | 'module' | 'material';

/** Close payload when add-and-continue was used (writes already happened via onAdded). */
export type ProductCompositionPickerCloseResult =
  ProductCompositionPickerResult | { done: true } | null;

export interface ProductCompositionPickerSessionItem {
  label: string;
  kind: PickerKind;
  quantity: number;
}

export interface ProductCompositionPickerData {
  productId: string;
  /** When true: only module + material (incl. raw); no product-complex tab. */
  restrictToModule?: boolean;
  /**
   * Called on each successful Add; dialog stays open (TZ-UX-DIALOG-303).
   * Parent writes the composition line; picker clears selection after resolve.
   */
  onAdded?: (result: ProductCompositionPickerResult) => void | Promise<void>;
}

/**
 * Catalog picker for composition lines.
 * Fixed xl shell — tab switch must not resize the dialog.
 * The options remain in a bounded list so the picker stays stable while kind markers
 * provide the same visual language as catalog tables.
 */
@Component({
  selector: 'app-product-composition-picker-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    PiDialogComponent,
    PiOverflowSelectComponent,
    CatalogKindMarkerComponent,
  ],
  template: `
    <!-- TZ-UX-DIALOG-305: picker = kind C width (parity with catalog FullEditors). -->
    <app-pi-dialog
      [title]="dialogTitle"
      [variant]="'form'"
      [maxWidth]="'min(1120px, calc(100vw - 2rem))'"
    >
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
              <app-catalog-kind-marker [kind]="kind.value">
                {{ kind.label }}
              </app-catalog-kind-marker>
            </button>
          }
        </div>

        @if (data.restrictToModule) {
          <p
            class="text-xs text-muted-foreground m-0 leading-snug"
            data-test="picker-inclusion-hint"
          >
            В состав модуля можно добавить модуль или материал.
          </p>
        }

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
                (valueChange)="onSelectItem($event)"
                searchable="auto"
                placeholder="— выбрать —"
                ariaLabel="Что добавить"
                dataTest="composition-picker-select"
              />
              <div class="flex flex-wrap items-center justify-between gap-2 mt-2">
                <p class="text-[11px] text-muted-foreground m-0 tabular-nums">
                  {{ available().length }} в списке
                  @if (query().trim()) {
                    <span>· фильтр</span>
                  }
                </p>
                <app-pi-button
                  type="button"
                  variant="outline"
                  size="sm"
                  (click)="openCreateForActiveKind()"
                  data-test="composition-picker-create"
                >
                  Создать
                </app-pi-button>
              </div>
              <label class="block max-w-[10rem] mt-3">
                <span class="eyebrow block mb-1.5">Кол-во</span>
                <input
                  class="pi-input w-full"
                  type="number"
                  min="0.001"
                  step="0.001"
                  [value]="quantity()"
                  (input)="onQuantityChange($event)"
                  data-test="composition-picker-quantity"
                />
              </label>
            </div>
          </div>

          @if (validationError()) {
            <p role="alert" class="text-xs text-destructive">{{ validationError() }}</p>
          }

          <div class="min-h-[4.5rem]">
            @if (activeKind() === 'product') {
              <label class="block max-w-xs">
                <span class="eyebrow block mb-1.5">Цена в составе, ₽</span>
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
                <p class="text-[11px] text-muted-foreground m-0 mt-1.5 leading-snug">
                  Входит в себестоимость родителя. Карточку ребёнка не меняет.
                </p>
              </label>
            }
          </div>

          @if (sessionAdded().length > 0) {
            <div class="space-y-1.5" data-test="picker-session-added">
              <p class="pi-label m-0">Добавлено сейчас</p>
              <ul
                class="m-0 max-h-28 overflow-y-auto space-y-1 list-none p-0"
                aria-label="Добавлено в этой сессии"
              >
                @for (item of sessionAdded(); track $index) {
                  <li class="text-sm text-ink leading-snug">
                    {{ item.label }}
                    <span class="text-muted-foreground"
                      >· {{ kindSessionLabel(item.kind) }} · Кол-во {{ item.quantity }}</span
                    >
                  </li>
                }
              </ul>
            </div>
          }
        }
      </div>
      <div footer class="flex gap-3 justify-end">
        <app-pi-button variant="ghost" type="button" (click)="onCancel()">{{
          closeLabel
        }}</app-pi-button>
        <app-pi-button
          variant="default"
          type="button"
          [disabled]="!selectedId() || adding()"
          (click)="onSubmit()"
          >{{ adding() ? '…' : 'Добавить' }}</app-pi-button
        >
      </div>
    </app-pi-dialog>
  `,
})
export class ProductCompositionPickerDialogComponent {
  protected readonly ref = inject<DialogRef<ProductCompositionPickerCloseResult>>(PI_DIALOG_REF);
  protected readonly data = inject<ProductCompositionPickerData>(PI_DIALOG_DATA);
  private readonly modulesSvc = inject(ProductModulesService);
  private readonly materialsSvc = inject(MaterialsService);
  private readonly productsSvc = inject(ProductsService);
  private readonly dialog = inject(PiDialogService);
  private readonly compositionDialogs = inject(ProductCompositionDialogService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dictionaryLabels = inject(PiDictionaryLabelsService, { optional: true });
  protected readonly materialKindLabels = signal<Record<string, string>>(
    Object.fromEntries(
      dictionaryLabelOptions('materialKind').map((item) => [item.key, item.label]),
    ),
  );

  /**
   * Order: изделие → модуль → деталь/материал.
   * On product: material tab = «Деталь» (raw forbidden).
   * On module: material tab = «Материал» (raw allowed).
   */
  protected readonly visibleKinds: { value: PickerKind; label: string }[] = this.data
    .restrictToModule
    ? [
        // TZ-UX-COMPOSE-301: для модуля материал — первая вкладка (смысл цеха), модуль остаётся.
        { value: 'material', label: 'Материал' },
        { value: 'module', label: 'Модуль' },
      ]
    : [
        { value: 'product', label: 'Изделие' },
        { value: 'module', label: 'Модуль' },
        { value: 'material', label: 'Деталь' },
      ];

  protected readonly dialogTitle = this.data.restrictToModule
    ? 'Добавить в состав модуля'
    : 'Добавить в состав изделия';

  /** Ghost footer: «Закрыть» when add-and-continue; legacy «Отмена» otherwise. */
  protected readonly closeLabel = this.data.onAdded ? 'Закрыть' : 'Отмена';

  protected readonly activeKind = signal<PickerKind>(
    // TZ-UX-COMPOSE-301: restrictToModule открывается на «Материал» — первая по смыслу.
    this.data.restrictToModule ? 'material' : 'product',
  );
  protected readonly selectedId = signal('');
  protected readonly quantity = signal('1');
  protected readonly unitPriceOverride = signal('');
  protected readonly query = signal('');
  protected readonly validationError = signal<string | null>(null);
  protected readonly modules = signal<ProductModule[]>([]);
  protected readonly materials = signal<Material[]>([]);
  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly adding = signal(false);
  protected readonly sessionAdded = signal<ProductCompositionPickerSessionItem[]>([]);
  /** True after at least one successful onAdded in this open session. */
  private usedAddAndContinue = false;

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
          label: `${item.name} · ${item.materialKind ? (this.materialKindLabels()[item.materialKind] ?? item.materialKind) : 'тип не указан'}`,
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
    this.dictionaryLabels?.active('materialKind').subscribe((labels) => {
      this.materialKindLabels.set(Object.fromEntries(labels.map((item) => [item.key, item.label])));
    });
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
    this.quantity.set('1');
    this.unitPriceOverride.set('');
    this.query.set('');
    this.validationError.set(null);
  }

  /** Open the catalog create flow for the currently selected picker tab. */
  protected openCreateForActiveKind(): void {
    const kind = this.activeKind();
    this.validationError.set(null);

    if (kind === 'material') {
      // Material has a richer form rather than the product/module profile QuickCreate.
      this.compositionDialogs
        .openMaterialCreate({ parentDestroyRef: this.destroyRef, injector: this.injector })
        .then((created) => this.onCatalogCreated(kind, created))
        .catch(() => this.validationError.set('Не удалось открыть создание материала.'));
      return;
    }

    // Keep QuickCreate dynamic: QuickCreate itself embeds ProductBomPanel, which embeds
    // this picker.
    void import('../quick-create/quick-create-dialog.component')
      .then(({ QuickCreateDialogComponent }) => {
        const ref = this.dialog.open(QuickCreateDialogComponent, {
          data: { entity: kind, size: 'M' },
          width: 'lg',
          parentDestroyRef: this.destroyRef,
        });
        onDialogCloseOnce(ref, this.injector, (created) => {
          this.onCatalogCreated(kind, created);
        });
      })
      .catch(() => {
        this.validationError.set('Не удалось открыть быстрое создание.');
      });
  }

  /** Add the newly created catalog row to the active options and preserve quantity. */
  private onCatalogCreated(kind: PickerKind, created: unknown): void {
    if (!isCreatedCatalogItem(created)) return;

    if (kind === 'product') {
      const product = created as Product;
      this.products.update((items) => [
        ...items.filter((item) => item._id !== product._id),
        product,
      ]);
    } else if (kind === 'module') {
      const module = created as ProductModule;
      this.modules.update((items) => [...items.filter((item) => item._id !== module._id), module]);
    } else {
      const material = created as Material;
      this.materials.update((items) => [
        ...items.filter((item) => item._id !== material._id),
        material,
      ]);
    }

    this.selectedId.set(created._id);
    this.validationError.set(null);
  }

  /** Prefill «Цена в составе» from child costPrice → listPrice (D3). Does not PATCH child. */
  protected onSelectItem(id: string): void {
    this.selectedId.set(id);
    this.validationError.set(null);
    if (this.activeKind() !== 'product' || !id) {
      return;
    }
    const product = this.products().find((item) => item._id === id);
    this.unitPriceOverride.set(defaultCompositionPrice(product));
  }

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected onPriceChange(event: Event): void {
    this.unitPriceOverride.set((event.target as HTMLInputElement).value);
  }

  protected onQuantityChange(event: Event): void {
    this.quantity.set((event.target as HTMLInputElement).value);
    this.validationError.set(null);
  }

  protected kindSessionLabel(kind: PickerKind): string {
    if (kind === 'product') return 'изделие';
    if (kind === 'module') return 'модуль';
    return this.data.restrictToModule ? 'материал' : 'деталь';
  }

  protected onSubmit(): void {
    if (this.adding()) return;
    const result = this.buildResult();
    if (!result) return;

    const onAdded = this.data.onAdded;
    if (!onAdded) {
      this.ref.close(result);
      return;
    }

    this.adding.set(true);
    this.validationError.set(null);
    void Promise.resolve(onAdded(result))
      .then(() => {
        this.usedAddAndContinue = true;
        this.sessionAdded.update((list) => [
          ...list,
          {
            label: this.sessionLabel(result),
            kind: result.lineType as PickerKind,
            quantity: result.quantity,
          },
        ]);
        this.selectedId.set('');
        this.quantity.set('1');
        this.unitPriceOverride.set('');
        this.validationError.set(null);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Не удалось добавить. Попробуйте ещё раз.';
        this.validationError.set(message);
      })
      .finally(() => {
        this.adding.set(false);
      });
  }

  protected onCancel(): void {
    this.ref.close(this.usedAddAndContinue ? { done: true } : null);
  }

  private buildResult(): ProductCompositionPickerResult | null {
    const id = this.selectedId();
    if (!id) return null;
    const quantity = Number(this.quantity());
    if (!Number.isFinite(quantity) || quantity < 0.001) {
      this.validationError.set('Количество должно быть не меньше 0,001.');
      return null;
    }
    if (this.activeKind() === 'product') {
      const rawPrice = this.unitPriceOverride().trim();
      const unitPriceOverride = rawPrice === '' ? undefined : Number(rawPrice);
      if (!isValidProductUnitPriceOverride(unitPriceOverride)) {
        this.validationError.set('Цена в составе не может быть отрицательной.');
        return null;
      }
      const product = this.products().find((item) => item._id === id);
      if (!product) return null;
      return { lineType: 'product', refId: id, product, quantity, unitPriceOverride };
    }
    if (this.activeKind() === 'module') {
      return { lineType: 'module', refId: id, quantity };
    }
    const material = this.materials().find((item) => item._id === id);
    if (!material) return null;
    return { lineType: 'material', refId: id, material, quantity };
  }

  private sessionLabel(result: ProductCompositionPickerResult): string {
    if (result.lineType === 'product') return result.product.name;
    if (result.lineType === 'material') return result.material.name;
    return this.modules().find((item) => item._id === result.refId)?.name ?? result.refId;
  }
}

/** D3: costPrice → listPrice → empty. Never writes to child card. */
function isCreatedCatalogItem(value: unknown): value is { _id: string; name: string } {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { _id?: unknown; name?: unknown };
  return (
    typeof candidate._id === 'string' &&
    candidate._id.length > 0 &&
    typeof candidate.name === 'string'
  );
}

export function defaultCompositionPrice(
  product: Pick<Product, 'costPrice' | 'listPrice'> | undefined,
): string {
  if (!product) return '';
  if (product.costPrice != null && Number.isFinite(product.costPrice)) {
    return String(product.costPrice);
  }
  if (product.listPrice != null && Number.isFinite(product.listPrice)) {
    return String(product.listPrice);
  }
  return '';
}
