import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { createSearchState } from '../../shared/util/search';
import { pluralize, formatPrice } from '../../shared/util/format';
import { ColumnDef, SortDirection, TableComponent } from '../../shared/ui/pi-table.component';
import {
  Product,
  ProductsService,
  type ProductsListResponse,
} from '../../shared/services/products.service';
import { ProductFormDialogComponent } from './product-form-dialog.component';

/** Server-side pagination page size for /products endpoint. */
const PAGE_SIZE = 50;

/** Backend accepts only these sortBy values (see ProductsListParams). */
type SortKey = 'name' | 'sku' | 'listPrice';

const KIND_LABELS: Record<Product['kind'], string> = {
  good: 'Товар',
  service: 'Услуга',
  work: 'Работа',
};

const STATUS_LABELS: Record<NonNullable<Product['status']>, string> = {
  new: 'Новый',
  active: 'Активный',
  archived: 'Архив',
  draft: 'Черновик',
};

/**
 * TZ-104.3 batch-1 commit 2/3 — ProductsPage migrated to `<app-pi-table>`.
 *
 * Architecture: products is server-side paginated AND sorted (matches
 * materials). The backend GET /products endpoint accepts:
 *   - envelope: `{items, total, page, limit}`
 *   - params: `page`, `limit`, `search`, `sortBy`, `sortOrder`
 *   - `sortBy` ∈ {'name' | 'sku' | 'listPrice' | 'createdAt'}
 *
 * So the page wires:
 *   - `[total]="listRes.total"` for the pager footer
 *   - `(pageChange)="onPageChange($event)"` to bump `pageSig`
 *   - `(sortChange)="onSortChange($event)"` to mirror pi-table's
 *     emit into `sortKeySig/sortDirSig`, then include them in
 *     `listParams` so httpResource auto-refires
 *   - `[localSort]="false"` so pi-table does NOT re-sort the page
 *     slice (the backend already sorted)
 *
 * BUG fixes vs the pre-migration source:
 *   1. `params.page: 1` was hardcoded — pagination was BROKEN
 *      (always returning first 50 rows). Migration reads
 *      page from a pageSig signal via listParams.
 *   2. `sortedRows = sort.sorted(this.data(), ...)` captured
 *      `data()` as a static snapshot AND frontend-sorted the
 *      already-server-sorted payload (no-op client-side sort +
 *      stale snapshot bug). Migration drops `sortedRows` entirely
 *      — backend handles ordering, page just slices+paginates.
 *   3. `total = data().length` was the count of CURRENT page
 *      items, not the backend's true total. Migration reads
 *      `listRes.value()?.total` which is the canonical envelope
 *      field.
 *
 *  Sort ownership: page uses direct `sortKeySig/sortDirSig`
 *  initialised to `(null, 'asc')` so both start in lockstep with
 *  pi-table's internal sortKeySig (also `null`-initial). The
 *  mirror-event handler sorts in lockstep on every click — same
 *  TZ-104.4-alignment as the orders round-2 fix.
 *
 *  Template-ref strategy mirrors materials v4 (see materials.page.ts):
 *  `@ViewChild({ static: true })` decorators + `any`-typed refs +
 *  plain property bindings + ngOnInit assignment. Bypasses
 *  `TemplateRef<C>` invariance + Angular's signal-binding
 *  name-collision; runtime row type is still Product.
 *
 *  Standalone + OnPush + signal-based. No `products.page.spec.ts`
 *  exists yet; v1 acceptance is visual smoke + tsc.
 */
@Component({
  selector: 'app-products-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiRowActionsComponent,
    ButtonComponent,
    TableComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · продукция"
      title="Продукция"
      description="Каталог готовой продукции: товары, услуги, работы. Цены, себестоимость, габариты."
    />

    <app-pi-toolbar>
      <input
        id="products-search"
        type="search"
        name="products-search"
        [value]="searchQuery()"
        (input)="onSearchInput($event)"
        placeholder="Поиск по названию или SKU…"
        aria-label="Поиск продукции"
        data-test="search-input"
        class="pi-input w-72"
      />
      <app-pi-button
        variant="default"
        (click)="openCreate()"
        data-test="create-button"
      >
        + Создать
      </app-pi-button>
      <span hint>{{ total() }} {{ totalLabel(total()) }}</span>
    </app-pi-toolbar>

    <app-pi-section title="Каталог" hint="сортировка · клик по заголовку" eyebrow="I">
      @if (error()) {
        <div
          role="alert"
          class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          {{ error() }}
        </div>
      }

      <div class="overflow-x-auto hairline rounded-sm">
        <p class="text-[10px] text-muted-foreground mb-1 sm:hidden">
          ← Таблица широкая — прокручивайте горизонтально →
        </p>
        <app-pi-table
          [data]="data()"
          [columns]="cols"
          [loading]="loading()"
          [total]="total()"
          [page]="page()"
          [pageSize]="pageSize"
          [emptyMessage]="emptyMessage()"
          [ariaLabel]="'Список продукции'"
          [cellTemplates]="cellTemplates"
          [rowActions]="rowActionsTplBinding"
          [localSort]="false"
          (pageChange)="onPageChange($event)"
          (sortChange)="onSortChange($event)"
        >
          <!-- ───── Name cell (routerLink to detail page) ───── -->
          <!-- The (click) propagates to the row <tr>. pi-table wraps
               each row with (click)="onRowClick(row)" so without
               stopPropagation the navigation would also fire
               rowClick. Today the page doesn't subscribe to
               (rowClick), so it's latent — but stopPropagation
               makes the cell template robust against any future
               consumer that adds a row-level click handler. -->
          <ng-template #nameTpl let-row>
            <a
              [routerLink]="['/products', row._id]"
              (click)="$event.stopPropagation()"
              class="text-ink hover:text-sunrise-warm hover:underline"
              [attr.aria-label]="'Открыть ' + row.name"
              data-test="open-row-link"
              >{{ row.name }}</a
            >
          </ng-template>

          <!-- ───── Row actions cluster ───── -->
          <ng-template #rowActionsTpl let-row>
            <app-pi-row-actions
              [row]="row"
              [editLabel]="'Редактировать ' + row.name"
              [deleteLabel]="'Удалить ' + row.name"
              [dataTestEdit]="'edit-button-' + row._id"
              [dataTestDelete]="'delete-button-' + row._id"
              (edit)="openEdit($event)"
              (delete)="onDelete($event)"
            />
          </ng-template>
        </app-pi-table>
      </div>
    </app-pi-section>
  `,
})
export class ProductsPage implements OnInit {
  private readonly service = inject(ProductsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly destroyRef = inject(DestroyRef);

  /** Exposed to template via `[pageSize]="pageSize"`. */
  protected readonly pageSize = PAGE_SIZE;

  /** Current page (1-indexed). Bumped via `(pageChange)`. */
  private readonly pageSig = signal<number>(1);
  protected readonly page = this.pageSig.asReadonly();

  /**
   * Page-owned sort signals. Initial `null/asc` matches pi-table's
   * internal sortKeySig start (also null). Both progress through
   * the same three-state cycle on each click of the SAME column.
   * see `onSortChange` below for the mirror-event handler.
   */
  private readonly sortKeySig = signal<SortKey | null>(null);
  private readonly sortDirSig = signal<'asc' | 'desc' | null>('asc');

  /** Debounced search — single source (`this.search.searchQuery`). */
  private readonly search = createSearchState(300);
  protected readonly searchQuery = this.search.searchQuery;

  /**
   * Single `computed()` that batches `page` + `limit` + `search` +
   * `sort` signal reads. httpResource reads `listParams()` and
   * auto-refires when any signal it depends on changes; collapsing
   * these into ONE computed collapses N refires per CD cycle to 1.
   *
   * When `sortKeySig` is null, both `sortBy` and `sortOrder` are
   * omitted from the params — backend applies its own default
   * ordering (typically by `createdAt desc`).
   */
  private readonly listParams = computed(() => {
    const sortKey = this.sortKeySig();
    const sortDir = this.sortDirSig();
    return {
      page: this.pageSig(),
      limit: PAGE_SIZE,
      ...(this.search.debouncedSearch()
        ? { search: this.search.debouncedSearch() }
        : {}),
      ...(sortKey && sortDir
        ? { sortBy: sortKey, sortOrder: sortDir }
        : {}),
    };
  });

  protected readonly listRes = httpResource<ProductsListResponse>(() => ({
    url: `${this.baseUrl}/products`,
    params: this.listParams(),
  }));

  protected readonly data = computed<Product[]>(
    () => this.listRes.value()?.items ?? [],
  );
  /**
   * Backend-reported total (canonical `{items, total, page, limit}`
   * envelope). The pi-table pager uses this to compute
   * `totalPages = ceil(total / pageSize)` and render Prev/Next.
   * When backend has ≤limit rows, pi-table hides the pager.
   *
   * Fixes the prior `total = data().length` which reported the
   * count of the CURRENT page only.
   */
  protected readonly total = computed<number>(
    () => this.listRes.value()?.total ?? 0,
  );
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly emptyMessage = computed(() =>
    this.searchQuery()
      ? 'Ничего не найдено.'
      : 'Нет продукции. Нажмите «Создать», чтобы добавить первую.',
  );

  // ─── Column definitions ────────────────────────────────────────────
  /**
   * 7 visible columns + row-actions slot (auto-injected).
   * - `name` is sticky-left (ID-like for tablets) and a `cellTemplate`
   *   so the rich `<a [routerLink]>` markup renders. Sort wires to
   *   backend `sortBy=name`.
   * - `sku`/`kind`/`unit` are textual format() functions; `sku` and
   *   `kind`/`status` get `cellClass: 'empty-cell'` muted styling
   *   for null/undefined values.
   * - `listPrice` is numeric, right-aligned, formatPrice() (mirrors
   *   materials `pricePerUnit`).
   * - `status` falls through to STATUS_LABELS; sort wires to
   *   backend `sortBy` — backend stores the raw enum so alphabetical
   *   sort `active/archived/draft/new` is what users see. (No status
   *   cycle order needed since status enum isn't a lifecycle like
   *   Order.status.)
   * - `stockQty` is numeric with manual format() (string) so we can
   *   default null to 0.
   */
  protected readonly cols: ColumnDef<Product>[] = [
    {
      key: 'name',
      label: 'Название',
      sortable: true,
      sticky: 'left',
      width: '240px',
    },
    {
      key: 'sku',
      label: 'SKU',
      sortable: true,
      cellClass: 'empty-cell font-mono text-xs',
    },
    {
      key: 'kind',
      label: 'Вид',
      cellClass: 'empty-cell text-muted-foreground',
      format: (r) => (r.kind ? (KIND_LABELS[r.kind] ?? r.kind) : '—'),
    },
    { key: 'unit', label: 'Ед.', width: '64px' },
    {
      key: 'listPrice',
      label: 'Цена',
      sortable: true,
      numeric: true,
      align: 'right',
      width: '128px',
      format: (r) => formatPrice(r.listPrice),
    },
    {
      key: 'status',
      label: 'Статус',
      cellClass: 'empty-cell',
      format: (r) => (r.status ? (STATUS_LABELS[r.status] ?? r.status) : '—'),
    },
    {
      key: 'stockQty',
      label: 'Остаток',
      numeric: true,
      align: 'right',
      width: '96px',
      format: (r) => String(r.stockQty ?? 0),
    },
  ];

  // ─── Template refs (resolved at view init, static:true → BEFORE ngOnInit) ──
  // `any` typing mirrors materials v4 — bypasses TemplateRef<C>
  // invariance + Angular's signal-binding name-collision. Runtime
  // values are still Product; this is type-level relaxation only.
  @ViewChild('nameTpl', { static: true })
  private readonly nameTplRef!: TemplateRef<any>;
  @ViewChild('rowActionsTpl', { static: true })
  private readonly rowActionsTplRef!: TemplateRef<any>;

  /** Built in ngOnInit after ViewChild fields resolve. Stable reference. */
  protected cellTemplates: Record<string, TemplateRef<any>> = {};
  /** Built in ngOnInit; null until then so pi-table defers the slot. */
  protected rowActionsTplBinding: TemplateRef<any> | null = null;

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.search.destroy());

    // Build cell-template map + row-actions binding AFTER static
    // ViewChild fields resolve. Avoids TemplateRef<C> invariance
    // trap and Angular's signal-binding name-collision.
    this.cellTemplates = { name: this.nameTplRef };
    this.rowActionsTplBinding = this.rowActionsTplRef;
  }

  protected totalLabel(n: number): string {
    return pluralize(n, ['продукт', 'продукта', 'продуктов']);
  }

  // ─── Event handlers ───────────────────────────────────────────────
  protected onSearchInput(event: Event): void {
    this.search.onSearchInput(event);
    // Reset to first page when the search filter changes so users
    // don't land on an out-of-range page of a (possibly empty)
    // filter set.
    this.pageSig.set(1);
  }

  protected onPageChange(p: number): void {
    this.pageSig.set(p);
  }

  /**
   * Page-owned sort handler. `[localSort]="false"` keeps pi-table
   * from re-sorting the page slice, and this handler simply MIRRORS
   * pi-table's sortChange emit into the page's sort signals. The
   * mirror-event pattern (vs re-derive) keeps the cycles in
   * lockstep regardless of starting-state divergence; see the
   * orders.page.ts round-2 fix comment for the full reasoning.
   */
  protected onSortChange(event: { key: string; dir: SortDirection }): void {
    const key = event.key;
    const dir = event.dir;
    this.sortKeySig.set(dir === null ? null : (key as SortKey));
    // sortDir is null only when sortKey is also null (both cleared).
    // When pi-table's dir is null, page falls back to 'asc' as
    // no-visual-effect placeholder (sortedRows returns backend
    // default order once listParams drops both sortBy+sortOrder).
    this.sortDirSig.set(dir === null ? null : dir);
    // Reset to first page on every sort change so users see the
    // first rows of the freshly ordered set.
    this.pageSig.set(1);
  }

  protected openCreate(): void {
    const ref = this.dialog.open(ProductFormDialogComponent, {
      data: null,
      width: 'lg',
    });
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }

  protected openEdit(product: Product): void {
    const ref = this.dialog.open(ProductFormDialogComponent, {
      data: product,
      width: 'lg',
    });
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }

  protected onDelete(row: Product): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить продукт?',
        description: `Удалить «${row.name}»? Это действие нельзя отменить.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.service.remove(row._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Продукт удалён');
          this.listRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  protected reload(): void {
    this.listRes.reload();
  }
}
