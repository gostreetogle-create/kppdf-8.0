import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Filter, LayoutGrid, List, RefreshCw } from 'lucide-angular';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import { CATALOG_SECTION_CHIPS } from '../catalog/catalog-group-chips';
import { PiEmptyTileComponent } from '../../shared/ui/pi-empty-tile/pi-empty-tile.component';
import { PiShowcaseCardComponent } from '../../shared/ui/card/pi-showcase-card.component';
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
import { createLookupTable } from '../../shared/util/lookup-table';
import { ColumnDef, TableComponent } from '../../shared/ui/pi-table.component';
import {
  Material,
  MATERIAL_KINDS,
  type MaterialKind,
  MaterialsService,
  type MaterialsListResponse,
} from '../../shared/services/materials.service';
import { photoListUrl, Photo, PhotosService } from '../../shared/services/photos.service';
import { Organization, OrganizationsService } from '../../shared/services/organizations.service';
import { MaterialFormDialogComponent } from './material-form-dialog.component';
import { CatalogKindMarkerComponent } from '../../shared/ui/catalog/catalog-kind-marker.component';
import {
  dictionaryLabelOptions,
  PiDictionaryLabelsService,
} from '../../shared/services/pi-dictionary-labels.service';

/** Server-side pagination page size for /materials endpoint. */
const PAGE_SIZE = 10;

/**
 * Полная документация страницы: docs/pages/materials.page.md
 *
 * TZ-104.3 Phase B + TZ-104.4.2 — MaterialsPage migrated to
 * `<app-pi-table>`, with TZ-104.4.2 dropping the `any`-escape hatch
 * that the v4 migration needed.
 *
 * Inline `<table>` markup is replaced by the Paper & Ink primitive.
 * The page wires [total]/[page]/[pageSize] + (pageChange) for
 * server-side pagination, plus cell templates for photo/supplier/
 * dimensions HTML-rich content. The `<app-pi-row-actions>` cluster
 * is moved from inline-per-row into the `[rowActions]` ng-template
 * slot. Sort is delegated entirely to pi-table's internal sort.
 *
 * Template-ref strategy (post-TZ-104.4.2):
 *  `@ViewChild({ static: true })` decorators with **strong** typing
 *  `TemplateRef<{ $implicit: Material }>` (NOT `any`). Pre-TZ-104.4.2
 *  we used `any` because pi-table's `[cellTemplates]` was typed
 *  `Record<string, TemplateRef<{ $implicit: unknown }>>`, and
 *  `TemplateRef<C>` is invariant — assigning a Record of one
 *  `$implicit` shape to a different shape failed TS2345. TZ-104.4.2
 *  re-typed pi-table's `[cellTemplates]` to
 *  `Record<string, TemplateRef<{ $implicit: T }>>`, so the strict
 *  Material typing now flows through.
 *
 *  `let-row` in templates is now `Material` instead of `any`, so
 *  `row.X` accesses are static-checked against `Material`. Helper
 *  methods drop `unknown`-typed arguments and the `as Material`
 *  internal cast — runtime behavior unchanged.
 *
 * Spec compatibility: `debouncedSearch` is exposed publicly so the
 * existing `materials.page.spec.ts` test #4 can drive the httpResource
 * auto-refire contract via `comp.debouncedSearch.set('steel')` —
 * untyped cast pattern in the spec accesses the signal directly.
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-materials-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    PiGroupWorkspaceComponent,
    PiEmptyTileComponent,
    PiShowcaseCardComponent,
    PiRowActionsComponent,
    ButtonComponent,
    TableComponent,
    RouterLink,
    CatalogKindMarkerComponent,
  ],
  template: `
    <app-pi-group-workspace [chips]="chips" activeId="materials">
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        <input
          id="materials-search"
          type="search"
          name="materials-search"
          [value]="searchQuery()"
          (input)="onSearchInput($event)"
          placeholder="Поиск по названию…"
          aria-label="Поиск материалов"
          data-test="search-input"
          class="pi-input w-64"
        />
        <!-- TZ-CATALOG-316: kind filter — server attaches ?materialKind= to GET /materials -->
        <select
          id="materials-kind-filter"
          name="materials-kind-filter"
          [value]="kindFilter() ?? ''"
          (change)="onKindFilterChange($event)"
          aria-label="Фильтр по типу материала"
          data-test="kind-filter"
          class="pi-input w-40"
        >
          <option value="">Все типы</option>
          @for (k of kindOptions(); track k.value) {
            <option [value]="k.value">{{ k.label }}</option>
          }
        </select>
        <app-pi-button variant="default" (click)="openCreate()" data-test="create-button">
          + Создать
        </app-pi-button>
        <app-pi-button variant="ghost" size="sm" (click)="reload()" data-test="reload-button">
          <lucide-icon [img]="RefreshIcon" [size]="14"></lucide-icon> Обновить
        </app-pi-button>
        <!-- TZ-CATALOG-373: view toggle list/grid (canon products TZ-PRODUCTS-305) -->
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

      <!-- TZ-CATALOG-373: products-layout паттерн — узкий рейл + колонка контента (канон products.page.ts) -->
      <div class="relative flex gap-3 items-start" data-test="materials-layout">
        <!-- Панель ВЫШЕ затемнения (z-40); иначе клики/селекты ломаются -->
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
                <!-- Тот же сигнал, что у toolbar-селекта → ?materialKind= (TZ-CATALOG-316) -->
                <label
                  class="text-[10px] uppercase tracking-wide text-muted-foreground"
                  for="rail-kind"
                  >Тип</label
                >
                <select
                  id="rail-kind"
                  class="pi-input w-full text-sm"
                  [value]="kindFilter() ?? ''"
                  (change)="onKindFilterChange($event)"
                  data-test="rail-kind"
                >
                  <option value="">Все типы</option>
                  @for (k of kindOptions(); track k.value) {
                    <option [value]="k.value">{{ k.label }}</option>
                  }
                </select>
                <!-- TZ-CATALOG-373 known_limitation: backend GET /materials не умеет
                     sortBy/sortOrder (всегда sort({name:1}), см. MaterialService.findAll) —
                     rail sort НЕ добавляем (фейковый client-sort page slice запрещён). -->
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
                  data-test="materials-grid"
                >
                  @for (row of data(); track row._id) {
                    <a
                      [routerLink]="['/materials', row._id]"
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
                            @if (gridPriceUnit(row); as unit) {
                              <span class="text-xs text-muted-foreground" data-test="showcase-unit">
                                за {{ unit }}
                              </span>
                            }
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
                [ariaLabel]="'Список материалов'"
                [cellTemplates]="cellTemplates"
                [rowActions]="rowActionsTplBinding"
                (pageChange)="onPageChange($event)"
              ></app-pi-table>
            }
          </div>
        </div>
      </div>

      <!-- ───── Cell templates ─────
           ВНЕ @if/@else: static @ViewChild({ static: true }) не видит ng-template
           внутри control-flow блоков (embedded view), поэтому шаблоны лежат
           на верхнем уровне app-pi-group-workspace (канон products.page.ts). -->
      <ng-template #photoTpl let-row>
        @if (mainPhotoOf(row); as mp) {
          <img
            [src]="mainPhotoUrl(row)"
            [alt]="mp.originalFilename || row.name"
            class="block w-20 h-20 object-cover hairline rounded-sm"
            loading="lazy"
          />
        } @else {
          <app-pi-empty-tile [sizePx]="80" />
        }
      </ng-template>

      <!-- ───── Supplier cell (lookup name) ───── -->
      <ng-template #supplierTpl let-row>
        {{ supplierNameOf(row) ?? '' }}
      </ng-template>

      <!-- ───── TZ-CATALOG-316: kind cell (Russian short label; — for unset) ───── -->
      <ng-template #kindTpl let-row>
        {{ kindLabelOf(row) ?? '' }}
      </ng-template>

      <!-- ───── Dimensions cell (font-mono glyphs) ───── -->
      <ng-template #dimsTpl let-row>
        <span class="font-mono text-xs whitespace-nowrap">{{ dimensionsSummary(row) }}</span>
      </ng-template>

      <!-- ───── Name cell with detail link (TZ-CATALOG-312) ───── -->
      <ng-template #nameTpl let-row>
        <app-catalog-kind-marker kind="material" [materialKind]="row.materialKind">
          <a
            [routerLink]="['/materials', row._id]"
            class="text-ink hover:text-sunrise-warm underline decoration-dotted underline-offset-4 transition-colors"
            [attr.aria-label]="'Открыть ' + row.name"
          >
            {{ row.name }}
          </a>
        </app-catalog-kind-marker>
      </ng-template>

      <!-- ───── Stock cell (TZ-MATERIALS-308, read-only link) ───── -->
      <ng-template #stockTpl let-row>
        <a
          [routerLink]="['/storage-items']"
          [queryParams]="{ materialId: row._id }"
          class="inline-flex items-center gap-1 text-primary underline decoration-dotted underline-offset-4 transition-colors"
          [attr.aria-label]="'Остатки на складе: ' + row.name"
        >
          Склад →
        </a>
      </ng-template>

      <!-- ───── Row actions cluster ───── -->
      <ng-template #rowActionsTpl let-row>
        <app-pi-row-actions
          [row]="row"
          [copyLabel]="'Копировать ' + row.name"
          [editLabel]="'Редактировать ' + row.name"
          [deleteLabel]="'Удалить ' + row.name"
          [dataTestCopy]="'copy-button-' + row._id"
          [dataTestEdit]="'edit-button-' + row._id"
          [dataTestDelete]="'delete-button-' + row._id"
          (copy)="onCopy($event)"
          (edit)="openEdit($event)"
          (delete)="onDelete($event)"
        />
      </ng-template>
    </app-pi-group-workspace>
  `,
})
export class MaterialsPage implements OnInit {
  constructor() {
    this.loadKindLabels();
    this.suppliersLookup.load();
    this.photosLookup.load();
    this.destroyRef.onDestroy(() => this.search.destroy());
  }
  protected readonly chips = CATALOG_SECTION_CHIPS;
  private readonly service = inject(MaterialsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly orgs = inject(OrganizationsService);
  private readonly photosService = inject(PhotosService);
  private readonly injector = inject(Injector);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly RefreshIcon = RefreshCw;
  protected readonly ListIcon = List;
  protected readonly GridIcon = LayoutGrid;
  protected readonly FilterIcon = Filter;

  /**
   * TZ-CATALOG-373: list↔grid view mode (canon products TZ-PRODUCTS-305).
   * Persisted to `pi-materials-view-mode` so F5 keeps the user's choice.
   */
  protected readonly viewMode = signal<MaterialsViewMode>(loadMaterialsViewMode());
  protected readonly filtersOpen = signal(false);

  protected setViewMode(mode: MaterialsViewMode): void {
    this.viewMode.set(mode);
    saveMaterialsViewMode(mode);
  }

  protected toggleFiltersRail(): void {
    this.filtersOpen.update((v) => !v);
  }

  protected closeFilters(): void {
    this.filtersOpen.set(false);
  }

  /** Exposed to template via `[pageSize]="pageSize"` (constant literal). */
  protected readonly pageSize = PAGE_SIZE;

  private readonly search = createSearchState(300);

  /**
   * Current page (1-indexed). Bumped via `(pageChange)` from pi-table.
   * Reset to 1 on every search input so users land on the first page
   * of the new result set (avoids page-4-of-empty-filter UX).
   */
  private readonly pageSig = signal<number>(1);
  protected readonly page = this.pageSig.asReadonly();

  /**
   * TZ-CATALOG-316: kind filter signal — when set, the resource
   * attaches `?materialKind=<value>` to the GET request. `null` =
   * "All" (no param sent).
   */
  private readonly kindFilterSig = signal<MaterialKind | null>(null);
  protected readonly kindFilter = this.kindFilterSig.asReadonly();

  /**
   * Public exposure of the debounced search signal. Required so the
   * `materials.page.spec.ts` test #4 can drive the resource's
   * auto-refire contract via `comp.debouncedSearch.set('steel')` (the
   * spec's `as unknown as { debouncedSearch: ... }` cast bypasses TS
   * private modifiers but reads from this getter at runtime).
   *
   * NOT for use in template — the template binds via `searchQuery()`
   * for the input field. This getter is used by the test only.
   */
  protected readonly debouncedSearch = this.search.debouncedSearch;

  private readonly suppliersLookup = createLookupTable<Organization>(
    this.orgs.list({ limit: 200 }),
  );
  private readonly photosLookup = createLookupTable<Photo>(this.photosService.list());

  // ─── Template refs (resolved at view init, static:true → BEFORE ngOnInit) ──
  // TZ-104.4.2: strong typing matches pi-table's re-parameterized
  // `[cellTemplates]` input. Pre-TZ-104.4.2 these were `TemplateRef<any>`
  // because pi-table's old typed input was `TemplateRef<{ $implicit:
  // unknown }>` and `TemplateRef<C>` invariance broke the assignment.
  @ViewChild('photoTpl', { static: true })
  private readonly photoTplRef!: TemplateRef<{ $implicit: Material }>;
  @ViewChild('supplierTpl', { static: true })
  private readonly supplierTplRef!: TemplateRef<{ $implicit: Material }>;
  // TZ-CATALOG-316: 301 fields column also rendered via TemplateRef<{ $implicit: Material }>
  @ViewChild('kindTpl', { static: true })
  private readonly kindTplRef!: TemplateRef<{ $implicit: Material }>;
  @ViewChild('nameTpl', { static: true })
  private readonly nameTplRef!: TemplateRef<{ $implicit: Material }>;
  @ViewChild('dimsTpl', { static: true })
  private readonly dimsTplRef!: TemplateRef<{ $implicit: Material }>;
  @ViewChild('stockTpl', { static: true })
  private readonly stockTplRef!: TemplateRef<{ $implicit: Material }>;
  @ViewChild('rowActionsTpl', { static: true })
  private readonly rowActionsTplRef!: TemplateRef<{ $implicit: Material }>;

  /** Built in ngOnInit after ViewChild fields resolve. Stable reference. */
  protected cellTemplates: Record<string, TemplateRef<{ $implicit: Material }>> = {};
  /** Built in ngOnInit; null until then so pi-table defers the slot. */
  protected rowActionsTplBinding: TemplateRef<{ $implicit: Material }> | null = null;

  /**
   * Single `computed()` that batches `page` + `limit` + `search` +
   * `materialKind` signal reads. httpResource reads `listParams()` and
   * auto-refires when any signal it depends on changes; with these
   * signals collapsed into ONE computed, Angular 20 schedules a single
   * re-fire per CD cycle instead of N.
   *
   * Built explicitly (not via spread) so the return type is
   * `Record<string, string | number | boolean>` — required by
   * `httpResource`'s `params` overload (it rejects `null`/`undefined`
   * per-key). The boolean-to-omit dance below keeps falsy
   * `kindFilter() | debouncedSearch()` out of the query string.
   */
  private readonly listParams = computed(() => {
    const params: Record<string, string | number | boolean> = {
      page: this.pageSig(),
      limit: PAGE_SIZE,
    };
    const search = this.search.debouncedSearch();
    if (search) params['search'] = search;
    const kind = this.kindFilterSig();
    if (kind) params['materialKind'] = kind;
    return params;
  });

  protected readonly listRes = httpResource<MaterialsListResponse>(() => ({
    url: `${this.baseUrl}/materials`,
    params: this.listParams(),
  }));

  protected readonly data = computed<Material[]>(() => this.listRes.value()?.items ?? []);
  /**
   * Backend reported total (canonical `{items, total, page, limit}`
   * envelope). The pi-table pager uses this to compute
   * `totalPages = ceil(total / pageSize)` and render the Prev / Next
   * controls. When backend has ≤limit rows, pi-table hides the pager.
   */
  protected readonly total = computed<number>(() => this.listRes.value()?.total ?? 0);
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as
      import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly searchQuery = this.search.searchQuery;

  protected readonly emptyMessage = computed(() =>
    this.searchQuery() || this.kindFilter()
      ? 'Ничего не найдено.'
      : 'Нет материалов. Нажмите «Создать», чтобы добавить первый.',
  );

  // ─── Column definitions ────────────────────────────────────────────
  /**
   * Columns keyed by existing `Material` fields. Non-sortable cells
   * (mainPhotoId, supplierId, dimensions) use `cellTemplates` for
   * rich content; sortable cells use `format` for currency/number
   * formatting. `name` is sticky-left for horizontal-scroll context
   * (tablets, narrow viewports). `cellClass: 'empty-cell'` muted-cell
   * styling restores the original page's visual regression — empty
   * values (article / sku / supplier / dimensions rendering empty
   * string) now dim instead of glaring.
   */
  protected readonly cols: ColumnDef<Material>[] = [
    { key: 'mainPhotoId', label: 'Фото', width: '96px', align: 'center' },
    {
      key: 'name',
      label: 'Название',
      sortable: true,
      sticky: 'left',
    },
    { key: 'article', label: 'Артикул', sortable: true, cellClass: 'empty-cell' },
    { key: 'sku', label: 'Внутренний код', sortable: true, cellClass: 'empty-cell' },
    { key: 'unit', label: 'Ед.', sortable: true, width: '60px' },
    // TZ-CATALOG-316: catalog-leaf classification column.
    { key: 'materialKind', label: 'Тип', width: '110px', cellClass: 'empty-cell' },
    {
      key: 'supplierId',
      label: 'Поставщик',
      cellClass: 'empty-cell' /* non-sortable, cellTemplate */,
    },
    {
      key: 'dimensions',
      label: 'Габариты',
      cellClass: 'empty-cell' /* non-sortable, cellTemplate */,
    },
    {
      key: 'pricePerUnit',
      label: 'Цена',
      sortable: true,
      numeric: true,
      align: 'right',
      width: '128px',
      format: (r) => formatPrice(r.pricePerUnit),
    },
    {
      key: 'stockQty',
      label: 'Склад',
      cellClass: 'empty-cell' /* non-sortable, cellTemplate */,
    },
  ];

  /** Toolbar options use the same API-backed cache as material forms. */
  protected readonly kindOptions = signal(
    dictionaryLabelOptions('materialKind')
      .filter((item) => MATERIAL_KINDS.includes(item.key as MaterialKind))
      .map((item) => ({ value: item.key as MaterialKind, label: item.label })),
  );
  private readonly dictionaryLabels = inject(PiDictionaryLabelsService, { optional: true });

  protected kindLabel(k: MaterialKind): string {
    return this.kindOptions().find((item) => item.value === k)?.label ?? k;
  }

  private loadKindLabels(): void {
    this.dictionaryLabels?.active('materialKind').subscribe((labels) => {
      const options = labels
        .filter((item) => MATERIAL_KINDS.includes(item.key as MaterialKind))
        .map((item) => ({ value: item.key as MaterialKind, label: item.label }));
      if (options.length > 0) this.kindOptions.set(options);
    });
  }

  ngOnInit(): void {
    // Build cell-template map + row-actions binding AFTER the static
    // @ViewChild fields resolve (static:true resolves BEFORE
    // ngOnInit). Targeting fields directly avoids the TemplateRef<C>
    // invariance trap and Angular's signal-binding name-collision.
    this.cellTemplates = {
      mainPhotoId: this.photoTplRef,
      name: this.nameTplRef,
      supplierId: this.supplierTplRef,
      materialKind: this.kindTplRef,
      dimensions: this.dimsTplRef,
      stockQty: this.stockTplRef,
    };
    this.rowActionsTplBinding = this.rowActionsTplRef;
  }

  // ─── Cell template helpers ─────────────────────────────────────────
  /**
   * TZ-104.4.2: `row: Material` (was `unknown` + `as Material` cast).
   * With the strongly-typed `TemplateRef<{ $implicit: Material }>`,
   * `let-row` in templates IS Material — no cast needed.
   */
  protected mainPhotoOf(row: Material): Photo | null {
    if (!row.mainPhotoId) return null;
    if (typeof row.mainPhotoId !== 'string') return row.mainPhotoId;
    return this.photosLookup.byId()[row.mainPhotoId] ?? null;
  }

  protected mainPhotoUrl(row: Material): string {
    const photo = this.mainPhotoOf(row);
    return photo ? photoListUrl(photo, Object.values(this.photosLookup.byId())) : '';
  }

  protected supplierNameOf(row: Material): string | null {
    if (!row.supplierId) return null;
    return (
      this.suppliersLookup.byId()[row.supplierId]?.shortName ??
      this.suppliersLookup.byId()[row.supplierId]?.name ??
      null
    );
  }

  /**
   * TZ-CATALOG-316: render a row's `materialKind` as a short Russian
   * label. Legacy rows without kind (server sends `null | undefined`)
   * return `null` so the empty-cell style shows "—" muted instead of
   * leaving a visible "другое" banner they didn't ask for.
   */
  protected kindLabelOf(row: Material): string | null {
    const k = row.materialKind;
    if (!k) return null;
    return this.kindOptions().find((item) => item.value === k)?.label ?? null;
  }

  protected dimensionsSummary(row: Material): string {
    if (!row.dimensions || row.dimensions.length === 0) return '';
    return row.dimensions.map((d) => `${typeLetter(d.type)} ${formatVal(d.value)}`).join(' × ');
  }

  // ─── TZ-CATALOG-373: grid-витрина (канон products.page.ts) ───────────────
  /** Eyebrow карточки — подпись типа материала, иначе артикул. */
  protected gridEyebrow(row: Material): string {
    return this.kindLabelOf(row) ?? (row.article || '');
  }

  /** Описание карточки — габариты, иначе поставщик. */
  protected gridDescription(row: Material): string {
    return this.dimensionsSummary(row) || this.supplierNameOf(row) || '';
  }

  /** Цена карточки (тот же formatPrice, что в таблице). */
  protected gridPrice(row: Material): string {
    return row.pricePerUnit != null ? formatPrice(row.pricePerUnit) : '—';
  }

  /** Подпись под ценой «за <ед.>» (пусто — скрывается). */
  protected gridPriceUnit(row: Material): string {
    return row.unit || '';
  }

  protected totalLabel(n: number): string {
    return pluralize(n, ['материал', 'материала', 'материалов']);
  }

  // ─── Event handlers ───────────────────────────────────────────────
  protected onSearchInput(event: Event): void {
    this.search.onSearchInput(event);
    // Reset to first page when search query changes so the user doesn't
    // land on an out-of-range page of a (possibly empty) filter set.
    this.pageSig.set(1);
  }

  /**
   * TZ-CATALOG-316: when the user picks a kind from the toolbar select,
   * set the signal; httpResource auto-refires with `?materialKind=…`.
   * Empty string → null (drop the param so server returns all kinds);
   * any valid value → filter; invalid → no-op (defensive).
   */
  protected onKindFilterChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    if (!v) {
      this.kindFilterSig.set(null);
    } else if ((MATERIAL_KINDS as readonly string[]).includes(v)) {
      this.kindFilterSig.set(v as MaterialKind);
    }
    // Reset to page 1 only when needed — unconditional set(1) while already
    // on page 1 double-fires listParams → httpResource and trips NG0101 in
    // TestBed.flushEffects (materials.page.spec TZ-CATALOG-316).
    if (this.pageSig() !== 1) {
      this.pageSig.set(1);
    }
  }

  protected onPageChange(p: number): void {
    this.pageSig.set(Math.min(Math.max(1, p), this.totalPages()));
  }

  /**
   * TZ-CATALOG-373: «Сбросить» в фильтр-рейле — kind + поиск + страница 1
   * (тот же контракт, что clearFilters у products).
   */
  protected clearFilters(): void {
    this.kindFilterSig.set(null);
    this.search.searchQuery.set('');
    this.search.debouncedSearch.set('');
    this.pageSig.set(1);
  }

  protected pageRangeLabel(): string {
    const t = this.total();
    if (t === 0) return '0';
    const start = (this.page() - 1) * PAGE_SIZE + 1;
    const end = Math.min(this.page() * PAGE_SIZE, t);
    return `${start}–${end} из ${t}`;
  }

  protected openCreate(): void {
    const ref = this.dialog.open(MaterialFormDialogComponent, {
      data: null,
      width: 'lg',
    });
    this.refreshOnDialogClose(ref);
  }

  protected openEdit(material: Material): void {
    const ref = this.dialog.open(MaterialFormDialogComponent, {
      data: material,
      width: 'lg',
    });
    this.refreshOnDialogClose(ref);
  }

  protected onDelete(row: Material): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить материал?',
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
          this.toast.success('Материал удалён');
          this.listRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  /**
   * TZ-MATERIALS-310: per-row Copy action.
   *
   * Flow:
   *  1. Confirmation dialog (`AlertDialogComponent`) warns that photos
   *     are NOT copied (TZ-MATERIALS-306 contract, prevents orphan
   *     uploads) and shows the source material name.
   *  2. On confirm — `MaterialsService.duplicate(id)` POSTs to the
   *     server-side clone endpoint, which generates a fresh SKU (when
   *     category has a prefix) and returns the new `Material` document.
   *  3. On success — open the edit dialog pre-filled with the clone
   *     so the user can amend photo selection, dimensions, etc., without
   *     losing the original. Suppress list-res refetch on this case
   *     (the clone isn't bound to the current filter yet).
   *  4. On error — toast the message; the list stays as-is.
   */
  protected onCopy(row: Material): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Копировать материал?',
        description:
          `Создать копию «${row.name}»? Внутренний код будет сгенерирован автоматически; ` +
          `фотографии и остатки на складе НЕ копируются — их можно добавить после открытия клона.`,
        confirmLabel: 'Копировать',
        variant: 'form',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.service.duplicate(row._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success(`Создана копия: ${res.data.name}`);
          // Open the edit dialog pre-filled with the fresh clone so the
          // user can attach photos and tweak fields immediately.
          this.openEdit(res.data);
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  protected reload(): void {
    this.listRes.reload();
  }

  private refreshOnDialogClose(ref: DialogRef<unknown>): void {
    onDialogCloseOnce(ref, this.injector, () => {
      this.suppliersLookup.load();
      this.photosLookup.load();
      this.listRes.reload();
    });
  }
}

// ─── View-mode persistence (TZ-CATALOG-373, паттерн products TZ-PRODUCTS-305) ───
const MATERIALS_VIEW_MODE_KEY = 'pi-materials-view-mode';

type MaterialsViewMode = 'list' | 'grid';

const DEFAULT_VIEW_MODE: MaterialsViewMode = 'list';

function loadMaterialsViewMode(): MaterialsViewMode {
  try {
    const raw = localStorage.getItem(MATERIALS_VIEW_MODE_KEY);
    return raw === 'grid' ? 'grid' : 'list';
  } catch {
    return DEFAULT_VIEW_MODE;
  }
}

function saveMaterialsViewMode(mode: MaterialsViewMode): void {
  try {
    localStorage.setItem(MATERIALS_VIEW_MODE_KEY, mode);
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded)
  }
}

// ─── Local helpers (no need to export) ───
/** UI-сокращения габаритов (русские; в API type остаётся length/width/…). */
function typeLetter(t: string): string {
  switch (t) {
    case 'length':
      return 'Д.';
    case 'width':
      return 'Ш.';
    case 'height':
      return 'В.';
    case 'thickness':
      return 'Т.';
    case 'diameter':
      return 'Ø';
    case 'depth':
      return 'Г.';
    default:
      return t;
  }
}

function formatVal(n: number): string {
  if (n >= 1) return `${n}мм`;
  return `${(n * 1000).toFixed(0)}мкм`;
}
