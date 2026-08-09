import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  OnDestroy,
  OnInit,
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
import { Product, ProductsService } from '../../../shared/services/products.service';
import { CategoriesService, type Category } from '../../../shared/services/categories.service';
import { photoListUrl, type Photo } from '../../../shared/services/photos.service';
import { ProductFormDialogComponent } from '../../products/product-form-dialog.component';
import {
  QuickCreateDialogComponent,
  type QuickCreateDialogData,
} from '../../../shared/ui/quick-create/quick-create-dialog.component';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../../core/silent-http';
import { formatPrice } from '../../../shared/util/format';

export interface ProposalDraftLine {
  productId: string;
  productName: string;
  productSku?: string;
  photoUrl?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
}

const PAGE_SIZE = 12;

/**
 * Shop-style product picker for Create КП (TZ-SALES-328).
 * Emits products to add; the parent owns the in-memory draft.
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
          <p class="eyebrow m-0">Каталог изделий</p>
          <h2 class="rail__title">Товары</h2>
        </div>
        <app-pi-button
          type="button"
          variant="default"
          size="sm"
          [disabled]="readOnly()"
          (click)="openCreate()"
          data-test="kp-rail-create"
        >
          Создать изделие
        </app-pi-button>
      </div>

      <div class="rail__filters">
        <label class="rail__search">
          <span class="eyebrow">Поиск</span>
          <input
            type="search"
            class="pi-input w-full"
            placeholder="Название или артикул…"
            [ngModel]="query()"
            (ngModelChange)="onQuery($event)"
            data-test="kp-rail-search"
            aria-label="Поиск изделий"
          />
        </label>
        <label class="rail__category">
          <span class="eyebrow">Категория</span>
          <select
            class="pi-input w-full"
            [value]="categoryId()"
            (change)="onCategoryChange($event)"
            data-test="kp-rail-category"
            aria-label="Категория изделий"
          >
            <option value="">Все категории</option>
            @for (category of categories(); track category._id) {
              <option [value]="category._id">{{ category.name }}</option>
            }
          </select>
        </label>
      </div>

      @if (draftLines().length > 0) {
        <section class="rail__draft-lines" data-test="kp-rail-draft-lines">
          <p class="eyebrow m-0">Позиции КП</p>
          @for (line of draftLines(); track line.productId + '-' + $index; let index = $index) {
            <label class="rail__draft-line">
              <span class="rail__draft-line-name">{{ line.productName }}</span>
              <input
                class="pi-input rail__quantity"
                type="number"
                min="0"
                [value]="line.quantity"
                [disabled]="readOnly()"
                [attr.data-test]="'kp-line-quantity-' + index"
                (change)="onQuantityChange(index, $event)"
                [attr.aria-label]="'Количество: ' + line.productName"
              />
            </label>
          }
        </section>
      }

      @if (loading()) {
        <p class="rail__state" data-test="kp-rail-loading">Загрузка…</p>
      } @else if (error()) {
        <p class="rail__state rail__state--error" role="alert">{{ error() }}</p>
      } @else if (products().length === 0) {
        <p class="rail__state" data-test="kp-rail-empty">{{ emptyHint() }}</p>
      } @else {
        <div class="rail__grid" data-test="kp-rail-grid">
          @for (product of products(); track product._id) {
            <app-pi-showcase-card
              size="md"
              [title]="product.name"
              [description]="productDescription(product)"
              [eyebrow]="product.kind === 'service' ? 'Услуга' : 'Изделие'"
              [mediaUrl]="mainPhotoUrl(product)"
              [arrow]="false"
            >
              <span sc-actions-md class="rail__actions">
                <app-pi-button
                  type="button"
                  variant="default"
                  size="sm"
                  (click)="addProduct(product)"
                  [disabled]="readOnly()"
                  [attr.data-test]="'kp-rail-add-' + product._id"
                  [attr.aria-label]="'Добавить ' + product.name"
                >
                  Добавить
                </app-pi-button>
                <app-pi-button
                  type="button"
                  variant="outline"
                  size="sm"
                  (click)="openEdit(product)"
                  [disabled]="readOnly()"
                  [attr.data-test]="'kp-rail-edit-' + product._id"
                  [attr.aria-label]="'Редактировать ' + product.name"
                >
                  Редактировать
                </app-pi-button>
              </span>
            </app-pi-showcase-card>
          }
        </div>

        @if (total() > pageSize) {
          <div class="rail__pager" data-test="kp-rail-pager">
            <span class="text-xs text-muted-foreground tabular-nums" data-test="kp-rail-pager-info">
              {{ pageRangeLabel() }}
            </span>
            <app-pi-pagination
              [total]="total()"
              [pageSize]="pageSize"
              [currentPage]="page()"
              ariaLabel="Страницы изделий"
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

    .rail__draft-lines {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      padding: 0.55rem;
      border: 1px solid var(--color-rule);
      background: color-mix(in oklch, var(--color-paper, #fff) 90%, transparent);
    }

    .rail__draft-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      min-width: 0;
    }

    .rail__draft-line-name {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.75rem;
    }

    .rail__quantity {
      width: 4.5rem;
      flex: 0 0 4.5rem;
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
      align-items: center;
      gap: 0.5rem;
      width: 100%;
    }

    .rail__actions app-pi-button:first-child {
      flex: 1;
    }

    .rail__actions app-pi-button:last-child {
      flex: 0 1 auto;
    }

    .rail__pager {
      justify-content: space-between;
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
  private readonly categoriesService = inject(CategoriesService);
  private readonly dialog = inject(PiDialogService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  readonly productAdd = output<ProposalDraftLine>();
  readonly quantityChange = output<{ index: number; quantity: number }>();
  readonly draftLines = input<ProposalDraftLine[]>([]);
  readonly readOnly = input(false);

  protected readonly query = signal('');
  protected readonly categoryId = signal('');
  protected readonly products = signal<Product[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly pageSize = PAGE_SIZE;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.load();
    this.categoriesService
      .list('product')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res.ok) {
          this.categories.set((res.data ?? []).filter((category) => category.isActive !== false));
        }
      });
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

  protected emptyHint(): string {
    return this.query().trim() || this.categoryId()
      ? 'Ничего не найдено'
      : 'Изделий пока нет. Создайте первое прямо здесь.';
  }

  protected productDescription(product: Product): string {
    return (
      [product.sku, product.listPrice != null ? formatPrice(product.listPrice) : null]
        .filter(Boolean)
        .join(' · ') || 'Цена по запросу'
    );
  }

  protected mainPhotoOf(product: Product): Photo | null {
    for (const photo of product.photoIds ?? []) {
      if (typeof photo !== 'string' && photo?.storageUrl) return photo;
    }
    return null;
  }

  protected mainPhotoUrl(product: Product): string {
    const photo = this.mainPhotoOf(product);
    if (!photo) return '';
    const allPhotos = (product.photoIds ?? []).filter(
      (candidate): candidate is Photo => typeof candidate !== 'string',
    );
    return photoListUrl(photo, allPhotos);
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

  protected totalPages(): number {
    return Math.max(1, Math.ceil(this.total() / PAGE_SIZE));
  }

  protected pageRangeLabel(): string {
    const count = this.total();
    if (count === 0) return '0';
    const start = (this.page() - 1) * PAGE_SIZE + 1;
    const end = Math.min(this.page() * PAGE_SIZE, count);
    return `${start}–${end} из ${count}`;
  }

  protected addProduct(product: Product): void {
    if (this.readOnly()) return;
    this.productAdd.emit({
      productId: product._id,
      productName: product.name,
      productSku: product.sku,
      photoUrl: this.mainPhotoUrl(product) || undefined,
      quantity: 1,
      unit: product.unit,
      unitPrice: product.listPrice ?? 0,
    });
  }

  protected onQuantityChange(index: number, event: Event): void {
    if (this.readOnly()) return;
    const raw = Number((event.target as HTMLInputElement).value);
    this.quantityChange.emit({ index, quantity: Number.isFinite(raw) ? raw : 0 });
  }

  protected openCreate(): void {
    if (this.readOnly()) return;
    const ref = this.dialog.open(QuickCreateDialogComponent, {
      data: { entity: 'product', size: 'M' } satisfies QuickCreateDialogData,
    });
    onDialogCloseOnce(ref, this.injector, () => this.load());
  }

  protected openEdit(product: Product): void {
    if (this.readOnly()) return;
    const ref = this.dialog.open(ProductFormDialogComponent, { data: product, width: 'lg' });
    onDialogCloseOnce(ref, this.injector, () => this.load());
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
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
          this.products.set([]);
          this.total.set(0);
          this.error.set(extractErrorMessage(res.error));
          return;
        }
        this.products.set(res.data.items ?? []);
        this.total.set(res.data.total ?? 0);
      });
  }
}
