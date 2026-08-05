import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { LucideAngularModule, LayoutGrid, List, RefreshCw } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { createSearchState } from '../../shared/util/search';
import { pluralize, formatPrice } from '../../shared/util/format';
import { ColumnDef, SortDirection, TableComponent } from '../../shared/ui/pi-table.component';
import { PiShowcaseCardComponent } from '../../shared/ui/card/pi-showcase-card.component';
import { AvatarComponent } from '../../shared/ui/avatar/avatar.component';
import {
  Product,
  ProductsService,
  type ProductsListResponse,
} from '../../shared/services/products.service';
import {
  ProductModule,
  ProductModulesService,
} from '../../shared/services/pi-product-modules.service';
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
 * Полная документация страницы: docs/pages/products.page.md
 *
 * TZ-104.3 batch-1 commit 2/3 + TZ-104.4.2 — ProductsPage migrated to
 * `<app-pi-table>`, with TZ-104.4.2 dropping the `any`-escape
 * hatch that v4 needed.
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
 *   - `[initialSortKey]="'name'"` + `[initialSortDir]="'asc'"`
 *     so users see alphabetical-by-name default on first load,
 *     matching the pre-migration `createSortState<SortKey>('name')`
 *     behavior. listParams seed on first load includes
 *     `{sortBy:'name', sortOrder:'asc'}`.
 *
 * TZ-104.4.2 lockstep: the page's `sortKeySig/sortDirSig` are
 * seeded to `'name'/'asc'` to MATCH pi-table's internal state
 * after ngOnInit applies the inputs above. Page-owned signal
 * state stays in lockstep with pi-table's internal signal state
 * from frame 1, so the round-2 mirror-event handler produces the
 * correct backend request on the very first click.
 *
 * BUG fixes vs the pre-migration source:
 *   1. `params.page: 1` was hardcoded — pagination was BROKEN.
 *   2. `sortedRows = sort.sorted(this.data(), ...)` captured
 *      `data()` as a static snapshot AND frontend-sorted the
 *      already-server-sorted payload. Migration drops sortedRows.
 *   3. `total = data().length` was the count of CURRENT page
 *      items, not the backend's true total.
 *
 *  Template-ref strategy (post-TZ-104.4.2):
 *   `@ViewChild({ static: true })` decorators with strong typing
 *   `TemplateRef<{ $implicit: Product }>` (NOT `any`). Pre-TZ-104.4.2
 *   we used `any` because pi-table's `[cellTemplates]` was typed
 *   `Record<string, TemplateRef<{ $implicit: unknown }>>` and
 *   TemplateRef invariance broke the binding. TZ-104.4.2 re-typed
 *   pi-table so the strict Product typing now flows through.
 *
 * TZ-PRODUCTS-304 — expandable-строки: клик по строке разворачивает
 * список привязанных модулей (карточки: инициалы-аватар, имя, артикул,
 * «N материалов», ссылка на /modules/:id). `expandedId` сигнал хранит
 * _id развёрнутого товара; повторный клик сворачивает. `[expandedRow]`
 * передаёт `expandedTpl` ТОЛЬКО когда есть развёрнутая строка
 * (свёрнутые строки без пустых `<tr>`).
 *
 *  Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-products-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    RouterLink,
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiRowActionsComponent,
    ButtonComponent,
    TableComponent,
    PiShowcaseCardComponent,
    AvatarComponent,
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
      <app-pi-button variant="default" (click)="openCreate()" data-test="create-button">
        + Создать
      </app-pi-button>
      <app-pi-button variant="ghost" size="sm" (click)="reload()" data-test="reload-button">
        <lucide-icon [img]="RefreshIcon" [size]="14"></lucide-icon> Обновить
      </app-pi-button>
      <div
        class="flex items-center gap-0.5 hairline rounded-sm p-0.5"
        role="group"
        aria-label="Вид каталога"
        data-test="view-toggle"
      >
        <button
          type="button"
          (click)="setViewMode('list')"
          [attr.aria-pressed]="viewMode() === 'list'"
          [class]="
            viewMode() === 'list'
              ? 'min-h-touch min-w-8 px-2 rounded-sm bg-paper-2 text-ink transition-colors'
              : 'min-h-touch min-w-8 px-2 rounded-sm text-muted-foreground hover:bg-paper-2/60 hover:text-ink transition-colors'
          "
          aria-label="Показать списком"
          data-test="view-list-button"
        >
          <lucide-icon [img]="ListIcon" [size]="16"></lucide-icon>
        </button>
        <button
          type="button"
          (click)="setViewMode('grid')"
          [attr.aria-pressed]="viewMode() === 'grid'"
          [class]="
            viewMode() === 'grid'
              ? 'min-h-touch min-w-8 px-2 rounded-sm bg-paper-2 text-ink transition-colors'
              : 'min-h-touch min-w-8 px-2 rounded-sm text-muted-foreground hover:bg-paper-2/60 hover:text-ink transition-colors'
          "
          aria-label="Показать карточками"
          data-test="view-grid-button"
        >
          <lucide-icon [img]="GridIcon" [size]="16"></lucide-icon>
        </button>
      </div>
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

      @if (viewMode() === 'grid') {
        <!-- ───── Grid view: showcase cards (TZ-PRODUCTS-305) ───── -->
        @if (loading()) {
          <p class="text-sm text-muted-foreground py-8 text-center" data-test="grid-loading">
            Загрузка…
          </p>
        } @else if (data().length === 0) {
          <p class="text-sm text-muted-foreground py-8 text-center" data-test="grid-empty">
            {{ emptyMessage() }}
          </p>
        } @else {
          <div
            class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            data-test="products-grid"
          >
            @for (row of data(); track row._id) {
              <a
                [routerLink]="['/products', row._id]"
                class="block min-w-0"
                [attr.aria-label]="'Открыть ' + row.name"
                [attr.data-test]="'showcase-cell-' + row._id"
              >
                <app-pi-showcase-card
                  size="sm"
                  [title]="row.name"
                  [description]="gridDescription(row)"
                  [eyebrow]="gridEyebrow(row)"
                  [interactive]="true"
                >
                  <span sc-actions-sm class="flex items-center gap-2">
                    <app-pi-avatar
                      [alt]="row.name"
                      size="xs"
                      ariaLabel="Иконка товара"
                      data-test="showcase-avatar"
                    />
                    @if (statusLabel(row)) {
                      <span [class]="statusBadgeClass(row)" data-test="showcase-status">
                        {{ statusLabel(row) }}
                      </span>
                    }
                    <span class="font-medium" data-test="showcase-price">
                      {{ gridPrice(row) }}
                    </span>
                  </span>
                </app-pi-showcase-card>
              </a>
            }
          </div>
        }
      } @else {
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
            [initialSortKey]="'name'"
            [initialSortDir]="'asc'"
            (pageChange)="onPageChange($event)"
            (sortChange)="onSortChange($event)"
            (rowClick)="onRowClick($event)"
            [expandedRow]="expandedTpl"
            [expandedRowWhen]="isExpandedRow"
            [expandedRowLabel]="expandedRowLabel"
          ></app-pi-table>
        </div>
      }
    </app-pi-section>

    <!-- ───── Template refs (hoisted out of @if/@else so the
         @ViewChild({ static: true }) queries resolve) ───── -->
    <!-- Name cell (routerLink to detail page). The (click) propagates
         to the row <tr>. pi-table wraps each row with
         (click)="onRowClick(row)" so without stopPropagation the
         navigation would also fire rowClick — the stopPropagation
         makes the cell template robust against row-level click. -->
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

    <!-- ───── Expanded row: модули в составе (TZ-PRODUCTS-304) ───── -->
    <ng-template #expandedTpl let-row>
      @if (expandedId() === row._id) {
        <div
          class="px-4 py-3"
          data-test="expanded-content"
          [attr.aria-label]="'Состав товара: ' + row.name"
        >
          @if (modulesOf(row).length === 0) {
            <p class="text-xs text-muted-foreground" data-test="expanded-empty">
              Нет модулей в составе. Откройте товар, чтобы привязать модули.
            </p>
          } @else {
            <div class="flex flex-wrap gap-2">
              @for (m of modulesOf(row); track m._id) {
                <a
                  [routerLink]="['/modules', m._id]"
                  class="inline-flex items-center gap-2 min-h-touch px-2 py-1.5 text-sm hairline rounded-sm bg-paper hover:bg-paper-2 hover:shadow-sm transition-all"
                  [attr.aria-label]="'Открыть модуль ' + m.name"
                  [attr.data-test]="'module-card-' + m._id"
                >
                  <span
                    class="w-7 h-7 rounded-sm hairline bg-paper-2 flex items-center justify-center text-muted-foreground text-xs font-medium shrink-0"
                    aria-hidden="true"
                  >
                    {{ (m.name || 'M').charAt(0).toUpperCase() }}
                  </span>
                  <span class="font-medium truncate max-w-40">{{ m.name }}</span>
                  <span class="font-mono text-xs text-muted-foreground empty-cell">
                    {{ m.article ?? '—' }}
                  </span>
                  <span class="text-xs text-muted-foreground">
                    {{ m.materials.length }} материалов
                  </span>
                </a>
              }
            </div>
          }
        </div>
      }
    </ng-template>
  `,
})
export class ProductsPage implements OnInit {
  constructor() {
    this.destroyRef.onDestroy(() => this.search.destroy());
    // Dual-read (TZ-CATALOG-317): каталог модулей грузим лениво — только
    // когда в списке появились composition-линии (после миграции 304).
    // effect() реактивно следит за data() (HTTP-ответ приходит асинхронно).
    effect(() => {
      const needsCatalog = this.data().some((p) =>
        (p.composition ?? []).some((l) => l.lineType === 'module'),
      );
      if (needsCatalog && this.moduleCatalog().length === 0) {
        this.modulesService.list().subscribe((res) => {
          if (res.ok) this.moduleCatalog.set(res.data);
        });
      }
    });
  }
  private readonly service = inject(ProductsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly modulesService = inject(ProductModulesService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly RefreshIcon = RefreshCw;
  protected readonly ListIcon = List;
  protected readonly GridIcon = LayoutGrid;

  /**
   * TZ-PRODUCTS-305 — вид каталога: `list` (pi-table) ↔ `grid` (sm
   * showcase-карточки). Переключение в тулбаре; выбор сохраняется в
   * localStorage (паттерн snapSettings в builder).
   */
  protected readonly viewMode = signal<ProductsViewMode>(loadProductsViewMode());

  protected setViewMode(mode: ProductsViewMode): void {
    this.viewMode.set(mode);
    saveProductsViewMode(mode);
  }

  /** Exposed to template via `[pageSize]="pageSize"`. */
  protected readonly pageSize = PAGE_SIZE;

  /** Current page (1-indexed). Bumped via `(pageChange)`. */
  private readonly pageSig = signal<number>(1);
  protected readonly page = this.pageSig.asReadonly();

  /**
   * Page-owned sort signals. Seeded to `'name'/'asc'` to MATCH
   * pi-table's internal state after ngOnInit applies the
   * `[initialSortKey]="'name'"` + `[initialSortDir]="'asc'"`
   * bindings (TZ-104.4.2). Both halves of the lockstep cycle start
   * in sync — the round-2 mirror-event handler stays correct on
   * the very first click instead of needing a recovery cycle.
   */
  private readonly sortKeySig = signal<SortKey | null>('name');
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
      ...(this.search.debouncedSearch() ? { search: this.search.debouncedSearch() } : {}),
      ...(sortKey && sortDir ? { sortBy: sortKey, sortOrder: sortDir } : {}),
    };
  });

  protected readonly listRes = httpResource<ProductsListResponse>(() => ({
    url: `${this.baseUrl}/products`,
    params: this.listParams(),
  }));

  protected readonly data = computed<Product[]>(() => this.listRes.value()?.items ?? []);
  /**
   * Backend-reported total (canonical `{items, total, page, limit}`
   * envelope). The pi-table pager uses this to compute
   * `totalPages = ceil(total / pageSize)` and render Prev/Next.
   * When backend has ≤limit rows, pi-table hides the pager.
   *
   * Fixes the prior `total = data().length` which reported the
   * count of the CURRENT page only.
   */
  protected readonly total = computed<number>(() => this.listRes.value()?.total ?? 0);
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as
      import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly emptyMessage = computed(() =>
    this.searchQuery()
      ? 'Ничего не найдено.'
      : 'Нет продукции. Нажмите «Создать», чтобы добавить первую.',
  );

  // ─── Column definitions ────────────────────────────────────────────
  /**
   * 8 visible columns + row-actions slot (auto-injected).
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
   * - `productModuleIds` («Модулей», TZ-PRODUCTS-304) is numeric and
   *   counts the RAW array length (strings + objects) — backend `list()`
   *   populates top-level, so it matches the expanded-row card count
   *   (`modulesOf` filters to populated objects only).
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
      key: 'productModuleIds',
      label: 'Модулей',
      numeric: true,
      align: 'right',
      width: '80px',
      // Dual-read (TZ-CATALOG-317): непустой composition (module-линии)
      // имеет приоритет над legacy productModuleIds.
      format: (r) => {
        const lines = (r.composition ?? []).filter((l) => l.lineType === 'module');
        return String(lines.length > 0 ? lines.length : (r.productModuleIds?.length ?? 0));
      },
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
  // TZ-104.4.2: strong typing matches pi-table's re-parameterized
  // `[cellTemplates]` input. Pre-TZ-104.4.2 these were `TemplateRef<any>`.
  @ViewChild('nameTpl', { static: true })
  private readonly nameTplRef!: TemplateRef<{ $implicit: Product }>;
  @ViewChild('rowActionsTpl', { static: true })
  private readonly rowActionsTplRef!: TemplateRef<{ $implicit: Product }>;

  /** Built in ngOnInit after ViewChild fields resolve. Stable reference. */
  protected cellTemplates: Record<string, TemplateRef<{ $implicit: Product }>> = {};
  /** Built in ngOnInit; null until then so pi-table defers the slot. */
  protected rowActionsTplBinding: TemplateRef<{ $implicit: Product }> | null = null;

  ngOnInit(): void {
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
    const dir = event.dir;
    // TZ-104.4.2: removed `as SortKey` cast — sortKeySig is now
    // typed `SortKey | null` so the sortKey-bounded assignment is
    // direct.
    // pi-table's `sortChange` output type is `{ key: string, ... }`
    // — pi-table doesn't statically know about this page's `SortKey`
    // union ('name' | 'sku' | 'listPrice'), so a single boundary
    // cast is required at the event ingestion point.
    this.sortKeySig.set(dir === null ? null : (event.key as SortKey));
    // sortDir is null only when sortKey is also null (both cleared).
    // When pi-table's dir is null, page falls back to null so the
    // listParams check `sortKey && sortDir` correctly omits both.
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
      parentDestroyRef: this.destroyRef,
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

  // ─── Expandable rows (TZ-PRODUCTS-304) ──────────────────────────────

  /**
   * Single-expand state for the shared Expandable table variant.
   * `null` keeps all detail rows collapsed; selecting another product
   * moves the open detail row rather than stacking multiple panels.
   */
  protected readonly expandedId = signal<string | null>(null);

  protected readonly isExpandedRow = (row: Product): boolean => this.expandedId() === row._id;
  protected readonly expandedRowLabel = (row: Product): string => `Состав товара: ${row.name}`;

  /**
   * Клик по строке — toggle expand. Повторный клик по той же строке
   * сворачивает. Редактирование/удаление НЕ триггерят expand (pi-table
   * сам делает stopPropagation на row-actions `<td>`).
   */
  protected onRowClick(row: Product): void {
    this.expandedId.update((cur) => (cur === row._id ? null : row._id));
  }

  /** Каталог модулей — для резолва имён composition-линий в expand. */
  protected readonly moduleCatalog = signal<ProductModule[]>([]);

  /**
   * Dual-read модули товара для expandedTpl (TZ-CATALOG-317):
   *  - непустой `row.composition` (lineType=module) → резолвим refId через
   *    каталог модулей (линии без каталога скрываем);
   *  - иначе legacy `productModuleIds` (populated объекты).
   */
  protected modulesOf(row: Product): ProductModule[] {
    const lines = (row.composition ?? []).filter((l) => l.lineType === 'module');
    if (lines.length > 0) {
      const byId = new Map(this.moduleCatalog().map((m) => [m._id, m]));
      return lines.map((l) => byId.get(l.refId)).filter((m): m is ProductModule => !!m);
    }
    return (row.productModuleIds ?? []).filter(
      (m): m is ProductModule => typeof m === 'object' && m !== null && '_id' in m,
    );
  }

  // ─── Grid view helpers (TZ-PRODUCTS-305) ──────────────────────────

  /** Eyebrow в sm-карточке: метка вида («Товар»/«Услуга»/«Работа»). */
  protected gridEyebrow(row: Product): string {
    return row.kind ? (KIND_LABELS[row.kind] ?? row.kind) : '';
  }

  /**
   * Подпись под названием в sm-карточке: SKU + категория (если есть).
   * Инициалы/фото — PiAvatar (фото нет в list-payload, показываем
   * монограмму по названию).
   */
  protected gridDescription(row: Product): string {
    const parts: string[] = [];
    if (row.sku) parts.push(row.sku);
    if (row.subcategory) parts.push(row.subcategory);
    return parts.join(' · ');
  }

  /** Цена в sm-карточке (footer actions-sm слот). */
  protected gridPrice(row: Product): string {
    return formatPrice(row.listPrice);
  }

  /** Badge статуса: «Активен»/«Неактивен» по isActive, иначе статус. */
  protected statusLabel(row: Product): string {
    if (row.isActive === false) return 'Неактивен';
    return row.status ? (STATUS_LABELS[row.status] ?? row.status) : '';
  }

  /** Класс бейджа статуса: muted для неактивных/архива, иначе default. */
  protected statusBadgeClass(row: Product): string {
    const muted = row.isActive === false || row.status === 'archived' || row.status === 'draft';
    const base =
      'text-[10px] font-medium uppercase tracking-wide hairline rounded-full px-2 py-0.5 bg-paper-2';
    return `${base} ${muted ? 'text-muted-foreground' : 'text-ink'}`;
  }
}

// ─── View-mode persistence (TZ-PRODUCTS-305, паттерн snapSettings) ───
const PRODUCTS_VIEW_MODE_KEY = 'pi-products-view-mode';

type ProductsViewMode = 'list' | 'grid';

const DEFAULT_VIEW_MODE: ProductsViewMode = 'list';

function loadProductsViewMode(): ProductsViewMode {
  try {
    const raw = localStorage.getItem(PRODUCTS_VIEW_MODE_KEY);
    return raw === 'grid' ? 'grid' : 'list';
  } catch {
    return DEFAULT_VIEW_MODE;
  }
}

function saveProductsViewMode(mode: ProductsViewMode): void {
  try {
    localStorage.setItem(PRODUCTS_VIEW_MODE_KEY, mode);
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded)
  }
}
