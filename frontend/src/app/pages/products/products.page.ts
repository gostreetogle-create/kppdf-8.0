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
import { LucideAngularModule, Filter, LayoutGrid, List, RefreshCw } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import { CATALOG_SECTION_CHIPS } from '../catalog/catalog-group-chips';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { PiEmptyTileComponent } from '../../shared/ui/pi-empty-tile/pi-empty-tile.component';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { createSearchState } from '../../shared/util/search';
import { pluralize, formatPrice } from '../../shared/util/format';
import { ColumnDef, SortDirection, TableComponent } from '../../shared/ui/pi-table.component';
import { PiShowcaseCardComponent } from '../../shared/ui/card/pi-showcase-card.component';
import {
  Product,
  ProductStatus,
  ProductsService,
  type ProductsListResponse,
} from '../../shared/services/products.service';
import {
  ProductModule,
  ProductModulesService,
} from '../../shared/services/pi-product-modules.service';
import { CategoriesService, type Category } from '../../shared/services/categories.service';
import type { Photo } from '../../shared/services/photos.service';
import { ProductFormDialogComponent } from './product-form-dialog.component';
import {
  QuickCreateDialogComponent,
  type QuickCreateDialogData,
} from '../../shared/ui/quick-create/quick-create-dialog.component';
import { CatalogKindMarkerComponent } from '../../shared/ui/catalog/catalog-kind-marker.component';

/** Server-side pagination page size for /products endpoint. */
const PAGE_SIZE = 50;

/** Backend accepts only these sortBy values (see ProductsListParams). */
type SortKey = 'name' | 'listPrice';

const STATUS_LABELS: Record<ProductStatus, string> = {
  new: 'Новый',
  active: 'Активный',
  archived: 'Архив',
  draft: 'Черновик',
};

const STATUS_OPTIONS: ProductStatus[] = ['new', 'active', 'archived', 'draft'];

const KIND_LABELS: Record<Product['kind'], string> = {
  good: 'Товар',
  service: 'Услуга',
  work: 'Работа',
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
    PiGroupWorkspaceComponent,
    PiRowActionsComponent,
    ButtonComponent,
    TableComponent,
    PiShowcaseCardComponent,
    PiEmptyTileComponent,
    CatalogKindMarkerComponent,
  ],
  template: `
    <app-pi-group-workspace [chips]="chips" activeId="products">
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        <input
          id="products-search"
          type="search"
          name="products-search"
          [value]="searchQuery()"
          (input)="onSearchInput($event)"
          placeholder="Поиск по названию…"
          aria-label="Поиск продукции"
          data-test="search-input"
          class="pi-input w-64"
        />
        <select
          id="products-status-filter"
          name="products-status-filter"
          [value]="statusFilter() ?? ''"
          (change)="onStatusFilterChange($event)"
          aria-label="Фильтр по статусу"
          data-test="status-filter"
          class="pi-input w-36"
        >
          <option value="">Все статусы</option>
          @for (s of STATUS_OPTIONS; track s) {
            <option [value]="s">{{ STATUS_LABELS[s] }}</option>
          }
        </select>
        <select
          id="products-active-filter"
          name="products-active-filter"
          [value]="activeFilterValue()"
          (change)="onActiveFilterChange($event)"
          aria-label="Фильтр активности"
          data-test="active-filter"
          class="pi-input w-36"
        >
          <option value="">Все</option>
          <option value="true">Активные</option>
          <option value="false">Неактивные</option>
        </select>
        <select
          id="products-category-filter"
          name="products-category-filter"
          [value]="categoryFilter() ?? ''"
          (change)="onCategoryFilterChange($event)"
          aria-label="Фильтр по категории"
          data-test="category-filter"
          class="pi-input w-44"
        >
          <option value="">Все категории</option>
          @for (c of categories(); track c._id) {
            <option [value]="c._id">{{ c.name }}</option>
          }
        </select>
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
        <span class="flex-1"></span>
        <span class="text-xs text-muted-foreground">{{ total() }} {{ totalLabel(total()) }}</span>
      </div>

      @if (error()) {
        <div
          role="alert"
          class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          {{ error() }}
        </div>
      }

      <div class="relative flex gap-3 items-start" data-test="products-layout">
        <!-- Узкая полоска + панель ВЫШЕ затемнения (z-40); иначе клики/селекты ломаются -->
        <aside
          class="relative z-40 shrink-0 w-12"
          data-test="filters-rail"
          [attr.aria-expanded]="filtersOpen()"
        >
          <div class="sticky top-2 hairline rounded-sm bg-paper p-1 shadow-sm">
            <button
              type="button"
              class="flex w-full min-h-touch items-center justify-center rounded-sm text-ink hover:bg-paper-2 transition-colors pi-focus-ring"
              (click)="toggleFiltersRail()"
              [attr.aria-label]="filtersOpen() ? 'Свернуть фильтры' : 'Открыть фильтры'"
              data-test="filters-rail-toggle"
            >
              <lucide-icon [img]="FilterIcon" [size]="18"></lucide-icon>
            </button>
          </div>

          @if (filtersOpen()) {
            <div
              class="absolute left-full top-0 ml-2 z-40 w-64 min-h-[22rem] max-h-[min(36rem,80vh)] overflow-y-auto hairline rounded-sm bg-paper p-4 shadow-lg"
              data-test="filters-rail-panel"
              role="dialog"
              aria-label="Фильтры каталога"
              (pointerdown)="$event.stopPropagation()"
              (click)="$event.stopPropagation()"
            >
              <div class="flex items-center justify-between gap-2 mb-3">
                <div class="text-sm font-medium text-ink">Фильтры</div>
                <button
                  type="button"
                  class="text-xs text-muted-foreground hover:text-ink pi-focus-ring rounded-sm px-1 min-h-touch"
                  (click)="closeFilters()"
                  aria-label="Закрыть"
                  data-test="filters-panel-close"
                >
                  Закрыть
                </button>
              </div>
              <div class="flex flex-col gap-3">
                <label
                  class="text-[10px] uppercase tracking-wide text-muted-foreground"
                  for="rail-status"
                  >Статус</label
                >
                <select
                  id="rail-status"
                  class="pi-input w-full text-sm"
                  [value]="statusFilter() ?? ''"
                  (change)="onStatusFilterChange($event)"
                >
                  <option value="">Все</option>
                  @for (s of STATUS_OPTIONS; track s) {
                    <option [value]="s">{{ STATUS_LABELS[s] }}</option>
                  }
                </select>
                <label
                  class="text-[10px] uppercase tracking-wide text-muted-foreground"
                  for="rail-active"
                  >Активность</label
                >
                <select
                  id="rail-active"
                  class="pi-input w-full text-sm"
                  [value]="activeFilterValue()"
                  (change)="onActiveFilterChange($event)"
                >
                  <option value="">Все</option>
                  <option value="true">Активные</option>
                  <option value="false">Неактивные</option>
                </select>
                <label
                  class="text-[10px] uppercase tracking-wide text-muted-foreground"
                  for="rail-category"
                  >Категория</label
                >
                <select
                  id="rail-category"
                  class="pi-input w-full text-sm"
                  [value]="categoryFilter() ?? ''"
                  (change)="onCategoryFilterChange($event)"
                >
                  <option value="">Все</option>
                  @for (c of categories(); track c._id) {
                    <option [value]="c._id">{{ c.name }}</option>
                  }
                </select>
                <label
                  class="text-[10px] uppercase tracking-wide text-muted-foreground"
                  for="rail-sort"
                  >Сортировка</label
                >
                <select
                  id="rail-sort"
                  class="pi-input w-full text-sm"
                  [value]="sortSelectValue()"
                  (change)="onRailSortChange($event)"
                  data-test="rail-sort"
                >
                  <option value="name:asc">Название ↑</option>
                  <option value="name:desc">Название ↓</option>
                  <option value="listPrice:asc">Прайс ↑</option>
                  <option value="listPrice:desc">Прайс ↓</option>
                </select>
                <button
                  type="button"
                  class="text-xs text-muted-foreground hover:text-ink underline decoration-dotted min-h-touch self-start"
                  (click)="clearFilters()"
                  data-test="clear-filters"
                >
                  Сбросить
                </button>
              </div>
            </div>
          }
        </aside>

        <div class="relative min-w-0 flex-1">
          @if (filtersOpen()) {
            <button
              type="button"
              class="absolute inset-0 z-20 border-0 cursor-default bg-ink/20 dark:bg-ink/40"
              aria-label="Закрыть фильтры"
              data-test="filters-backdrop"
              (pointerdown)="closeFilters()"
              (click)="closeFilters()"
            ></button>
          }

          <div class="relative z-0">
            @if (viewMode() === 'grid') {
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
                  class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch"
                  data-test="products-grid"
                >
                  @for (row of data(); track row._id) {
                    <a
                      [routerLink]="['/products', row._id]"
                      class="block min-w-0 h-full"
                      [attr.aria-label]="'Открыть ' + row.name"
                      [attr.data-test]="'showcase-cell-' + row._id"
                    >
                      <app-pi-showcase-card
                        class="h-full"
                        size="md"
                        [title]="row.name"
                        [description]="gridDescription(row)"
                        [eyebrow]="gridEyebrow(row)"
                        [mediaUrl]="mainPhotoUrl(row)"
                        [interactive]="true"
                        [arrow]="false"
                      >
                        <span sc-actions-md class="flex items-center gap-2 justify-between w-full">
                          <span class="flex flex-col gap-0.5 min-w-0">
                            <span class="font-medium tabular-nums" data-test="showcase-price">
                              {{ gridPrice(row) }}
                            </span>
                            <span
                              class="text-xs text-muted-foreground tabular-nums"
                              data-test="showcase-cost"
                              >Себест. {{ gridCost(row) }}</span
                            >
                          </span>
                          <span class="text-xs text-muted-foreground">{{ row.unit }}</span>
                        </span>
                      </app-pi-showcase-card>
                    </a>
                  }
                </div>
                @if (total() > pageSize) {
                  <div
                    class="mt-4 flex items-center justify-end gap-2"
                    data-test="grid-pager"
                    role="navigation"
                    aria-label="Страницы каталога"
                  >
                    <span class="text-xs text-muted-foreground tabular-nums" data-test="pager-info">
                      {{ pageRangeLabel() }}
                    </span>
                    <app-pi-button
                      variant="ghost"
                      size="sm"
                      [disabled]="page() <= 1"
                      (click)="onPageChange(page() - 1)"
                      data-test="pager-prev"
                      >Назад</app-pi-button
                    >
                    <span class="text-xs tabular-nums" data-test="pager-page">{{ page() }}</span>
                    <app-pi-button
                      variant="ghost"
                      size="sm"
                      [disabled]="page() >= totalPages()"
                      (click)="onPageChange(page() + 1)"
                      data-test="pager-next"
                      >Далее</app-pi-button
                    >
                  </div>
                }
              }
            } @else {
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
            }
          </div>
        </div>
      </div>

      <ng-template #photoTpl let-row>
        <div
          class="flex items-center justify-center w-[5.5rem] h-[5.5rem] mx-auto"
          data-test="product-photo-cell"
        >
          @if (mainPhotoOf(row); as mp) {
            <img
              [src]="mp.storageUrl"
              [alt]="mp.originalFilename || row.name"
              class="block w-[5.5rem] h-[5.5rem] object-cover hairline rounded-sm"
              loading="lazy"
              data-test="product-photo"
            />
          } @else {
            <app-pi-empty-tile [sizePx]="88" />
          }
        </div>
      </ng-template>

      <ng-template #nameTpl let-row>
        <app-catalog-kind-marker kind="product">
          <a
            [routerLink]="['/products', row._id]"
            (click)="$event.stopPropagation()"
            class="text-ink hover:text-sunrise-warm hover:underline"
            [attr.aria-label]="'Открыть ' + row.name"
            data-test="open-row-link"
            >{{ row.name }}</a
          >
        </app-catalog-kind-marker>
      </ng-template>

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
    </app-pi-group-workspace>
  `,
})
export class ProductsPage implements OnInit {
  constructor() {
    this.destroyRef.onDestroy(() => this.search.destroy());
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
  protected readonly chips = CATALOG_SECTION_CHIPS;
  protected readonly STATUS_LABELS = STATUS_LABELS;
  protected readonly STATUS_OPTIONS = STATUS_OPTIONS;
  private readonly service = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly modulesService = inject(ProductModulesService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly RefreshIcon = RefreshCw;
  protected readonly ListIcon = List;
  protected readonly GridIcon = LayoutGrid;
  protected readonly FilterIcon = Filter;

  protected readonly viewMode = signal<ProductsViewMode>(loadProductsViewMode());
  protected readonly filtersOpen = signal(false);
  protected readonly categories = signal<Category[]>([]);

  private readonly statusFilterSig = signal<ProductStatus | null>(null);
  private readonly categoryFilterSig = signal<string | null>(null);
  private readonly activeFilterSig = signal<boolean | null>(null);
  protected readonly statusFilter = this.statusFilterSig.asReadonly();
  protected readonly categoryFilter = this.categoryFilterSig.asReadonly();

  protected setViewMode(mode: ProductsViewMode): void {
    this.viewMode.set(mode);
    saveProductsViewMode(mode);
  }

  protected toggleFiltersRail(): void {
    this.filtersOpen.update((v) => !v);
  }

  protected closeFilters(): void {
    this.filtersOpen.set(false);
  }

  protected readonly pageSize = PAGE_SIZE;
  private readonly pageSig = signal<number>(1);
  protected readonly page = this.pageSig.asReadonly();

  private readonly sortKeySig = signal<SortKey | null>('name');
  private readonly sortDirSig = signal<'asc' | 'desc' | null>('asc');

  private readonly search = createSearchState(300);
  protected readonly searchQuery = this.search.searchQuery;

  private readonly listParams = computed(() => {
    const sortKey = this.sortKeySig();
    const sortDir = this.sortDirSig();
    const status = this.statusFilterSig();
    const categoryId = this.categoryFilterSig();
    const isActive = this.activeFilterSig();
    return {
      page: this.pageSig(),
      limit: PAGE_SIZE,
      ...(this.search.debouncedSearch() ? { search: this.search.debouncedSearch() } : {}),
      ...(sortKey && sortDir ? { sortBy: sortKey, sortOrder: sortDir } : {}),
      ...(status ? { status } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(typeof isActive === 'boolean' ? { isActive } : {}),
    };
  });

  protected readonly listRes = httpResource<ProductsListResponse>(() => ({
    url: `${this.baseUrl}/products`,
    params: this.listParams(),
  }));

  protected readonly data = computed<Product[]>(() => this.listRes.value()?.items ?? []);
  protected readonly total = computed<number>(() => this.listRes.value()?.total ?? 0);
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as
      import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly emptyMessage = computed(() =>
    this.searchQuery() || this.statusFilter() || this.categoryFilter() || this.activeFilterValue()
      ? 'Ничего не найдено.'
      : 'Нет продукции. Нажмите «Создать», чтобы добавить первую.',
  );

  protected readonly cols: ColumnDef<Product>[] = [
    { key: 'photoIds', label: 'Фото', width: '104px', align: 'center' },
    { key: 'name', label: 'Название', sortable: true, sticky: 'left', width: '240px' },
    { key: 'unit', label: 'Ед.', width: '64px' },
    {
      key: 'listPrice',
      label: 'Прайс',
      sortable: true,
      numeric: true,
      align: 'right',
      width: '128px',
      format: (r) => formatPrice(r.listPrice),
    },
    {
      key: 'costPrice',
      label: 'Себест.',
      numeric: true,
      align: 'right',
      width: '128px',
      format: (r) => (r.costPrice != null ? formatPrice(r.costPrice) : '—'),
    },
    {
      key: 'productModuleIds',
      label: 'Модулей',
      numeric: true,
      align: 'right',
      width: '80px',
      format: (r) => {
        const lines = (r.composition ?? []).filter((l) => l.lineType === 'module');
        return String(lines.length > 0 ? lines.length : (r.productModuleIds?.length ?? 0));
      },
    },
  ];

  @ViewChild('photoTpl', { static: true })
  private readonly photoTplRef!: TemplateRef<{ $implicit: Product }>;
  @ViewChild('nameTpl', { static: true })
  private readonly nameTplRef!: TemplateRef<{ $implicit: Product }>;
  @ViewChild('rowActionsTpl', { static: true })
  private readonly rowActionsTplRef!: TemplateRef<{ $implicit: Product }>;

  protected cellTemplates: Record<string, TemplateRef<{ $implicit: Product }>> = {};
  protected rowActionsTplBinding: TemplateRef<{ $implicit: Product }> | null = null;

  ngOnInit(): void {
    this.cellTemplates = { photoIds: this.photoTplRef, name: this.nameTplRef };
    this.rowActionsTplBinding = this.rowActionsTplRef;
    this.categoriesService.list('product').subscribe((res) => {
      if (res.ok) this.categories.set(res.data.filter((c) => c.isActive !== false));
    });
  }

  protected totalLabel(n: number): string {
    return pluralize(n, ['продукт', 'продукта', 'продуктов']);
  }

  protected activeFilterValue(): string {
    const v = this.activeFilterSig();
    if (v === true) return 'true';
    if (v === false) return 'false';
    return '';
  }

  protected sortSelectValue(): string {
    const k = this.sortKeySig() ?? 'name';
    const d = this.sortDirSig() ?? 'asc';
    return `${k}:${d}`;
  }

  protected pageRangeLabel(): string {
    const t = this.total();
    if (t === 0) return '0';
    const start = (this.page() - 1) * PAGE_SIZE + 1;
    const end = Math.min(this.page() * PAGE_SIZE, t);
    return `${start}–${end} из ${t}`;
  }

  protected onSearchInput(event: Event): void {
    this.search.onSearchInput(event);
    this.pageSig.set(1);
  }

  protected onStatusFilterChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.statusFilterSig.set(v ? (v as ProductStatus) : null);
    this.pageSig.set(1);
  }

  protected onActiveFilterChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.activeFilterSig.set(v === 'true' ? true : v === 'false' ? false : null);
    this.pageSig.set(1);
  }

  protected onCategoryFilterChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.categoryFilterSig.set(v || null);
    this.pageSig.set(1);
  }

  protected onRailSortChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    const [key, dir] = v.split(':') as [SortKey, 'asc' | 'desc'];
    this.sortKeySig.set(key);
    this.sortDirSig.set(dir);
    this.pageSig.set(1);
  }

  protected clearFilters(): void {
    this.statusFilterSig.set(null);
    this.categoryFilterSig.set(null);
    this.activeFilterSig.set(null);
    this.search.searchQuery.set('');
    this.search.debouncedSearch.set('');
    this.pageSig.set(1);
  }

  protected onPageChange(p: number): void {
    this.pageSig.set(Math.min(Math.max(1, p), this.totalPages()));
  }

  protected onSortChange(event: { key: string; dir: SortDirection }): void {
    const dir = event.dir;
    this.sortKeySig.set(dir === null ? null : (event.key as SortKey));
    this.sortDirSig.set(dir === null ? null : dir);
    this.pageSig.set(1);
  }

  /** TZ-DICT-316 — list «Создать» → QuickCreate (profile S/M/L); edit stays FullEditor. */
  protected openCreate(): void {
    const ref = this.dialog.open(QuickCreateDialogComponent, {
      data: { entity: 'product', size: 'M' } satisfies QuickCreateDialogData,
      width: 'md',
    });
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }

  protected openEdit(product: Product): void {
    const ref = this.dialog.open(ProductFormDialogComponent, { data: product, width: 'lg' });
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

  protected readonly expandedId = signal<string | null>(null);
  protected readonly isExpandedRow = (row: Product): boolean => this.expandedId() === row._id;
  protected readonly expandedRowLabel = (row: Product): string => `Состав товара: ${row.name}`;

  protected onRowClick(row: Product): void {
    this.expandedId.update((cur) => (cur === row._id ? null : row._id));
  }

  protected readonly moduleCatalog = signal<ProductModule[]>([]);

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

  protected mainPhotoOf(row: Product): Photo | null {
    for (const p of row.photoIds ?? []) {
      if (typeof p !== 'string' && p?.storageUrl) return p;
    }
    return null;
  }

  protected mainPhotoUrl(row: Product): string {
    return this.mainPhotoOf(row)?.storageUrl ?? '';
  }

  protected gridEyebrow(row: Product): string {
    return row.kind ? (KIND_LABELS[row.kind] ?? row.kind) : '';
  }

  protected gridDescription(row: Product): string {
    const parts: string[] = [];
    if (row.subcategory) parts.push(row.subcategory);
    const n = (row.composition ?? []).filter((l) => l.lineType === 'module').length;
    const modCount = n > 0 ? n : (row.productModuleIds?.length ?? 0);
    if (modCount > 0) parts.push(`${modCount} мод.`);
    return parts.join(' · ');
  }

  protected gridPrice(row: Product): string {
    return formatPrice(row.listPrice) || '—';
  }

  protected gridCost(row: Product): string {
    return row.costPrice != null ? formatPrice(row.costPrice) : '—';
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
