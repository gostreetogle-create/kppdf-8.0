import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PiShowcaseCardComponent } from '../../../shared/ui/card/pi-showcase-card.component';
import { PaginationComponent } from '../../../shared/ui/pi-pagination.component';
import { PI_DEFAULT_PAGE_SIZE } from '../../../shared/ui/pi-pagination.constants';
import { Product, ProductsService } from '../../../shared/services/products.service';
import { CategoriesService, type Category } from '../../../shared/services/categories.service';
import { photoListUrl, type Photo } from '../../../shared/services/photos.service';
import { ProductFormDialogComponent } from '../../products/product-form-dialog.component';
import { ModuleFormDialogComponent } from '../../modules/module-form-dialog.component';
import { MaterialFormDialogComponent } from '../../materials/material-form-dialog.component';
import {
  ProductModulesService,
  type ProductModule,
} from '../../../shared/services/pi-product-modules.service';
import { MaterialsService, type Material } from '../../../shared/services/materials.service';
import {
  QuickCreateDialogComponent,
  type QuickCreateDialogData,
} from '../../../shared/ui/quick-create/quick-create-dialog.component';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../../core/silent-http';
import { formatPrice } from '../../../shared/util/format';

export type ProposalLineKind = 'catalog' | 'custom' | 'module' | 'material';

export type CatalogDirtyField = 'productName' | 'description' | 'productSku' | 'unit';
export type CatalogDecision = 'pending' | 'kp-only';

export interface ProposalDraftLine {
  /** Catalog = Product FK; module/material = refId; custom has no catalog FK. */
  lineKind?: ProposalLineKind;
  /** UI track id: productId (catalog), refId (module/material), or custom-* . */
  productId: string;
  /** Persisted typed ref for module/material lines (SALES-348). */
  refId?: string;
  productName: string;
  description?: string;
  productSku?: string;
  photoUrl?: string;
  /** Snapshot-only catalog identity edits; never inferred from commercial fields. */
  catalogDirtyFields?: CatalogDirtyField[];
  catalogDecision?: CatalogDecision;
  catalogSourceVersion?: number;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discountPercent?: number;
  isOptional?: boolean;
  /** Visual-only blank settings (TZ-SALES-370). */
  rowPresentation?: ProposalRowPresentation;
}

/** Per-line visual snapshot for KP blank. Defaults applied at render. */
export interface ProposalRowPresentation {
  density?: 'auto' | 'compact' | 'large';
  emphasis?: 'normal' | 'accent';
  separatorBefore?: boolean;
  pageBreakBefore?: boolean;
  showDescription?: boolean;
  photoFit?: 'inherit' | 'contain' | 'cover';
}

type RailKind = 'catalog' | 'module' | 'material';

interface RailCard {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  unit?: string;
  unitPrice: number;
  photoUrl?: string;
  eyebrow: string;
  kind: RailKind;
  raw: Product | ProductModule | Material;
}

/** Canon PAGE_SIZE=10 (TZ-UX-342); 3-col grid still fits. */
const PAGE_SIZE = PI_DEFAULT_PAGE_SIZE;

/**
 * Shop-style catalog picker for Create КП (TZ-SALES-328 + 348).
 * Emits draft lines; parent owns composition. Add & continue — panel stays open.
 */
@Component({
  selector: 'app-proposal-product-rail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent, PiShowcaseCardComponent, PaginationComponent],
  template: `
    <div class="rail" data-test="kp-product-rail">
      <div class="rail__header">
        <div>
          <p class="eyebrow m-0">Каталог</p>
          <h2 class="rail__title">Товары</h2>
          <p class="text-xs text-muted-foreground m-0 mt-1" data-test="kp-hint-catalog">
            Добавление в состав — только это КП. Карточку изделия правьте через строку таблицы.
          </p>
        </div>
        <app-pi-button
          type="button"
          variant="default"
          size="sm"
          [disabled]="readOnly()"
          (click)="openCreate()"
          data-test="kp-rail-create"
        >
          {{ createLabel() }}
        </app-pi-button>
      </div>

      <div
        class="rail__chips"
        role="tablist"
        aria-label="Вид каталога"
        data-test="kp-rail-kind-chips"
      >
        <button
          type="button"
          class="rail__chip"
          role="tab"
          [attr.aria-selected]="railKind() === 'catalog'"
          [class.rail__chip--active]="railKind() === 'catalog'"
          (click)="setRailKind('catalog')"
          data-test="kp-rail-kind-catalog"
        >
          Изделия
        </button>
        <button
          type="button"
          class="rail__chip"
          role="tab"
          [attr.aria-selected]="railKind() === 'module'"
          [class.rail__chip--active]="railKind() === 'module'"
          (click)="setRailKind('module')"
          data-test="kp-rail-kind-module"
        >
          Модули
        </button>
        <button
          type="button"
          class="rail__chip"
          role="tab"
          [attr.aria-selected]="railKind() === 'material'"
          [class.rail__chip--active]="railKind() === 'material'"
          (click)="setRailKind('material')"
          data-test="kp-rail-kind-material"
        >
          Материалы
        </button>
      </div>

      <div class="rail__filters">
        <label class="rail__search">
          <span class="eyebrow">Поиск</span>
          <input
            type="search"
            class="pi-input w-full"
            [placeholder]="searchPlaceholder()"
            [ngModel]="query()"
            (ngModelChange)="onQuery($event)"
            data-test="kp-rail-search"
            [attr.aria-label]="searchPlaceholder()"
          />
        </label>
        @if (railKind() !== 'module') {
          <label class="rail__category">
            <span class="eyebrow">Категория</span>
            <select
              class="pi-input w-full"
              [value]="categoryId()"
              (change)="onCategoryChange($event)"
              data-test="kp-rail-category"
              aria-label="Категория"
            >
              <option value="">Все категории</option>
              @for (category of categories(); track category._id) {
                <option [value]="category._id">{{ category.name }}</option>
              }
            </select>
          </label>
        }
      </div>

      @if (loading()) {
        <p class="rail__state" data-test="kp-rail-loading">Загрузка…</p>
      } @else if (error()) {
        <p class="rail__state rail__state--error" role="alert">{{ error() }}</p>
      } @else if (cards().length === 0) {
        <p class="rail__state" data-test="kp-rail-empty">{{ emptyHint() }}</p>
      } @else {
        <div class="rail__grid" data-test="kp-rail-grid">
          @for (card of cards(); track card.id) {
            <app-pi-showcase-card
              size="md"
              [title]="card.name"
              [description]="cardDescription(card)"
              [eyebrow]="card.eyebrow"
              [mediaUrl]="card.photoUrl || ''"
              [arrow]="false"
            >
              <span sc-actions-md class="rail__actions">
                <span class="rail__add-block">
                  @if (inKpQty(card) > 0) {
                    <span class="rail__in-kp" [attr.data-test]="'kp-rail-in-kp-' + card.id"
                      >В КП: {{ inKpQty(card) }}</span
                    >
                  }
                  <label class="rail__add-qty">
                    <span class="sr-only">Количество для добавления</span>
                    <input
                      class="pi-input rail__add-qty-input"
                      type="number"
                      min="1"
                      step="any"
                      [value]="addQty(card.id)"
                      [disabled]="readOnly()"
                      [attr.data-test]="'kp-rail-add-qty-' + card.id"
                      (change)="onAddQtyChange(card.id, $event)"
                      (click)="$event.stopPropagation()"
                    />
                  </label>
                  <app-pi-button
                    type="button"
                    variant="default"
                    size="sm"
                    (click)="addCard(card)"
                    [disabled]="readOnly()"
                    [attr.data-test]="'kp-rail-add-' + card.id"
                    [attr.aria-label]="addLabel(card)"
                  >
                    {{ addLabel(card) }}
                  </app-pi-button>
                </span>
                <app-pi-button
                  type="button"
                  variant="outline"
                  size="sm"
                  (click)="openEdit(card)"
                  [disabled]="readOnly()"
                  [attr.data-test]="'kp-rail-edit-' + card.id"
                  [attr.aria-label]="'Редактировать ' + card.name"
                >
                  Редактировать
                </app-pi-button>
              </span>
            </app-pi-showcase-card>
          }
        </div>

        @if (total() > pageSize) {
          <div class="rail__pager" data-test="kp-rail-pager">
            <app-pi-pagination
              [total]="total()"
              [pageSize]="pageSize"
              [currentPage]="page()"
              [showPageSize]="false"
              [ariaLabel]="pagerAria()"
              (pageChange)="onPageChange($event)"
            />
          </div>
        }
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: auto;
      max-height: 100%;
      min-height: 0;
    }

    .rail {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-height: 0;
      height: auto;
      padding: 0.75rem;
    }

    .rail__header,
    .rail__filters,
    .rail__pager {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .rail__header {
      justify-content: space-between;
      gap: 1rem;
    }

    .rail__title {
      margin: 0.15rem 0 0;
      color: var(--color-ink);
      font-family: var(--font-display, Georgia, serif);
      font-size: 1.35rem;
      line-height: 1.1;
    }

    .rail__chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .rail__chip {
      border: 1px solid var(--color-rule);
      background: transparent;
      color: var(--color-ink);
      font-size: 0.8125rem;
      line-height: 1.2;
      padding: 0.35rem 0.7rem;
      cursor: pointer;
    }

    .rail__chip--active {
      border-color: color-mix(in oklch, var(--color-accent, #c9a227) 70%, var(--color-rule));
      background: color-mix(in oklch, var(--color-accent, #c9a227) 18%, transparent);
    }

    .rail__filters {
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .rail__search {
      flex: 1 1 16rem;
      min-width: 12rem;
    }

    .rail__category {
      flex: 0 1 14rem;
    }

    .rail__search,
    .rail__category {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .rail__add-qty-input {
      width: 4.5rem;
      flex: 0 0 4.5rem;
    }

    .rail__add-qty-input {
      width: 3.5rem;
      flex: 0 0 3.5rem;
      padding-inline: 0.35rem;
    }

    .rail__grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      align-items: stretch;
      gap: 0.65rem;
      flex: 0 1 auto;
      max-height: min(34rem, calc(100vh - 16rem));
      min-height: 0;
      overflow-y: auto;
      padding: 0.1rem 0.15rem 0.25rem 0;
    }

    .rail__grid app-pi-showcase-card {
      min-width: 0;
    }

    .rail__actions {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
      width: 100%;
    }

    .rail__add-block {
      display: flex;
      flex: 1;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.35rem;
      min-width: 0;
    }

    .rail__in-kp {
      flex: 1 1 100%;
      font-size: 0.6875rem;
      color: var(--color-muted-foreground, #6b7280);
      letter-spacing: 0.02em;
    }

    .rail__actions app-pi-button:last-child {
      flex: 0 1 auto;
    }

    .rail__pager {
      justify-content: flex-end;
      flex-wrap: wrap;
      padding-top: 0.25rem;
      border-top: 1px solid var(--color-rule);
    }

    .rail__state {
      margin: auto 0;
      padding: 2rem 0;
      color: var(--color-muted-foreground, #6b7280);
      font-size: 0.875rem;
      text-align: center;
    }

    .rail__state--error {
      color: var(--color-destructive, #b42318);
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    @media (max-width: 70rem) {
      .rail__grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 48rem) {
      .rail__grid {
        grid-template-columns: minmax(0, 1fr);
      }

      .rail__header {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `,
})
export class ProposalProductRailComponent implements OnInit, OnDestroy {
  private readonly productsService = inject(ProductsService);
  private readonly modulesService = inject(ProductModulesService);
  private readonly materialsService = inject(MaterialsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly dialog = inject(PiDialogService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  readonly productAdd = output<ProposalDraftLine>();
  readonly draftLines = input<ProposalDraftLine[]>([]);
  readonly readOnly = input(false);

  protected readonly railKind = signal<RailKind>('catalog');
  protected readonly query = signal('');
  protected readonly categoryId = signal('');
  protected readonly cards = signal<RailCard[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly pageSize = PAGE_SIZE;
  /** Per-card add quantity (defaults to 1). */
  private readonly addQtyById = signal<Record<string, number>>({});

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  /** Full module list for client-side search/page (API returns array). */
  private allModules: ProductModule[] = [];

  protected readonly createLabel = computed(() => {
    switch (this.railKind()) {
      case 'module':
        return 'Создать модуль';
      case 'material':
        return 'Создать материал';
      default:
        return 'Создать изделие';
    }
  });

  ngOnInit(): void {
    this.loadCategories();
    this.load();
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

  protected searchPlaceholder(): string {
    return 'Название или артикул…';
  }

  protected pagerAria(): string {
    switch (this.railKind()) {
      case 'module':
        return 'Страницы модулей';
      case 'material':
        return 'Страницы материалов';
      default:
        return 'Страницы изделий';
    }
  }

  protected emptyHint(): string {
    const filtered = this.query().trim() || this.categoryId();
    if (filtered) return 'Измените поиск или выберите другой вид каталога.';
    switch (this.railKind()) {
      case 'module':
        return 'Выберите «Изделия» или «Материалы» — или создайте модуль здесь.';
      case 'material':
        return 'Материалов пока нет. Смените chip или создайте материал здесь.';
      default:
        return 'Изделий пока нет. Смените chip или создайте изделие здесь.';
    }
  }

  protected cardDescription(card: RailCard): string {
    return (
      [card.sku, card.unitPrice > 0 ? formatPrice(card.unitPrice) : null]
        .filter(Boolean)
        .join(' · ') || 'Цена по запросу'
    );
  }

  protected inKpQty(card: RailCard): number {
    return this.draftLines()
      .filter((line) => this.lineMatchesCard(line, card))
      .reduce((sum, line) => sum + (Number.isFinite(line.quantity) ? line.quantity : 0), 0);
  }

  protected addQty(id: string): number {
    return this.addQtyById()[id] ?? 1;
  }

  protected addLabel(card: RailCard): string {
    const qty = this.addQty(card.id);
    return this.inKpQty(card) > 0 ? `Ещё +${qty}` : 'Добавить';
  }

  protected setRailKind(kind: RailKind): void {
    if (this.railKind() === kind) return;
    this.railKind.set(kind);
    this.categoryId.set('');
    this.page.set(1);
    this.addQtyById.set({});
    this.loadCategories();
    this.load();
  }

  protected onQuery(value: string): void {
    this.query.set(value);
    this.page.set(1);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.load(), 250);
  }

  protected onCategoryChange(event: Event): void {
    this.categoryId.set((event.target as HTMLSelectElement).value);
    this.page.set(1);
    this.load();
  }

  protected onPageChange(nextPage: number): void {
    this.page.set(Math.min(Math.max(1, nextPage), this.totalPages()));
    this.load();
  }

  protected onAddQtyChange(id: string, event: Event): void {
    if (this.readOnly()) return;
    const raw = Number((event.target as HTMLInputElement).value);
    const qty = Number.isFinite(raw) && raw >= 1 ? raw : 1;
    this.addQtyById.update((map) => ({ ...map, [id]: qty }));
  }

  protected totalPages(): number {
    return Math.max(1, Math.ceil(this.total() / PAGE_SIZE));
  }

  protected addCard(card: RailCard): void {
    if (this.readOnly()) return;
    const quantity = Math.max(1, this.addQty(card.id));
    this.productAdd.emit({
      lineKind: card.kind,
      productId: card.id,
      ...(card.kind !== 'catalog' ? { refId: card.id } : {}),
      productName: card.name,
      description: card.description,
      productSku: card.sku,
      photoUrl: card.photoUrl || undefined,
      ...(card.kind === 'catalog'
        ? { catalogSourceVersion: this.productVersion(card.raw as Product) }
        : {}),
      quantity,
      unit: card.unit,
      unitPrice: card.unitPrice,
    });
  }

  protected openCreate(): void {
    if (this.readOnly()) return;
    if (this.railKind() === 'catalog') {
      const ref = this.dialog.open(QuickCreateDialogComponent, {
        data: { entity: 'product', size: 'M' } satisfies QuickCreateDialogData,
      });
      onDialogCloseOnce(ref, this.injector, () => this.load());
      return;
    }
    if (this.railKind() === 'module') {
      const ref = this.dialog.open(QuickCreateDialogComponent, {
        data: { entity: 'module', size: 'M' } satisfies QuickCreateDialogData,
      });
      onDialogCloseOnce(ref, this.injector, () => this.load());
      return;
    }
    const ref = this.dialog.open(MaterialFormDialogComponent, { data: null, width: 'lg' });
    onDialogCloseOnce(ref, this.injector, () => this.load());
  }

  protected openEdit(card: RailCard): void {
    if (this.readOnly()) return;
    if (card.kind === 'catalog') {
      const ref = this.dialog.open(ProductFormDialogComponent, {
        data: card.raw as Product,
        width: 'lg',
      });
      onDialogCloseOnce(ref, this.injector, () => this.load());
      return;
    }
    if (card.kind === 'module') {
      const ref = this.dialog.open(ModuleFormDialogComponent, {
        data: card.raw as ProductModule,
        width: 'lg',
      });
      onDialogCloseOnce(ref, this.injector, () => this.load());
      return;
    }
    const ref = this.dialog.open(MaterialFormDialogComponent, {
      data: card.raw as Material,
      width: 'lg',
    });
    onDialogCloseOnce(ref, this.injector, () => this.load());
  }

  private lineMatchesCard(line: ProposalDraftLine, card: RailCard): boolean {
    const kind = line.lineKind ?? 'catalog';
    if (kind !== card.kind) return false;
    if (kind === 'catalog') return line.productId === card.id;
    return (line.refId ?? line.productId) === card.id;
  }

  private loadCategories(): void {
    const type = this.railKind() === 'material' ? 'material' : 'product';
    if (this.railKind() === 'module') {
      this.categories.set([]);
      return;
    }
    this.categoriesService
      .list(type)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res.ok) {
          this.categories.set((res.data ?? []).filter((category) => category.isActive !== false));
        }
      });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    const kind = this.railKind();
    if (kind === 'catalog') {
      this.loadProducts();
      return;
    }
    if (kind === 'module') {
      this.loadModules();
      return;
    }
    this.loadMaterials();
  }

  private loadProducts(): void {
    this.productsService
      .list({
        page: this.page(),
        limit: PAGE_SIZE,
        ...(this.query().trim() ? { search: this.query().trim() } : {}),
        ...(this.categoryId() ? { categoryId: this.categoryId() } : {}),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.loading.set(false);
        if (!res.ok) {
          this.cards.set([]);
          this.total.set(0);
          this.error.set(extractErrorMessage(res.error));
          return;
        }
        const items = res.data.items ?? [];
        this.cards.set(items.map((product) => this.productCard(product)));
        this.total.set(res.data.total ?? 0);
      });
  }

  private loadModules(): void {
    this.modulesService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.loading.set(false);
        if (!res.ok) {
          this.cards.set([]);
          this.total.set(0);
          this.allModules = [];
          this.error.set(extractErrorMessage(res.error));
          return;
        }
        this.allModules = res.data ?? [];
        const q = this.query().trim().toLowerCase();
        const filtered = q
          ? this.allModules.filter(
              (mod) =>
                mod.name.toLowerCase().includes(q) || (mod.article ?? '').toLowerCase().includes(q),
            )
          : this.allModules;
        this.total.set(filtered.length);
        const start = (this.page() - 1) * PAGE_SIZE;
        this.cards.set(filtered.slice(start, start + PAGE_SIZE).map((mod) => this.moduleCard(mod)));
      });
  }

  private loadMaterials(): void {
    this.materialsService
      .list({
        page: this.page(),
        limit: PAGE_SIZE,
        ...(this.query().trim() ? { search: this.query().trim() } : {}),
        ...(this.categoryId() ? { categoryId: this.categoryId() } : {}),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.loading.set(false);
        if (!res.ok) {
          this.cards.set([]);
          this.total.set(0);
          this.error.set(extractErrorMessage(res.error));
          return;
        }
        const items = res.data.items ?? [];
        this.cards.set(items.map((material) => this.materialCard(material)));
        this.total.set(res.data.total ?? 0);
      });
  }

  private productCard(product: Product): RailCard {
    return {
      id: product._id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      unit: product.unit,
      unitPrice: product.listPrice ?? 0,
      photoUrl: this.mainPhotoUrl(product) || undefined,
      eyebrow: product.kind === 'service' ? 'Услуга' : 'Изделие',
      kind: 'catalog',
      raw: product,
    };
  }

  private moduleCard(mod: ProductModule): RailCard {
    return {
      id: mod._id,
      name: mod.name,
      sku: mod.article,
      unit: 'шт',
      unitPrice: 0,
      eyebrow: 'Модуль',
      kind: 'module',
      raw: mod,
    };
  }

  private materialCard(material: Material): RailCard {
    return {
      id: material._id,
      name: material.name,
      sku: material.article ?? material.sku,
      unit: material.unit,
      unitPrice: material.pricePerUnit ?? 0,
      eyebrow: 'Материал',
      kind: 'material',
      raw: material,
    };
  }

  private productVersion(product: Product): number | undefined {
    return typeof product.__v === 'number'
      ? product.__v
      : typeof product.version === 'number'
        ? product.version
        : undefined;
  }

  private mainPhotoOf(product: Product): Photo | null {
    for (const photo of product.photoIds ?? []) {
      if (typeof photo !== 'string' && photo?.storageUrl) return photo;
    }
    return null;
  }

  private mainPhotoUrl(product: Product): string {
    const photo = this.mainPhotoOf(product);
    if (!photo) return '';
    const allPhotos = (product.photoIds ?? []).filter(
      (candidate): candidate is Photo => typeof candidate !== 'string',
    );
    return photoListUrl(photo, allPhotos);
  }
}
