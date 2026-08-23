import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  Injector,
  TemplateRef,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
  untracked,
  OnInit,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Filter, LayoutGrid, List, RefreshCw } from 'lucide-angular';
import {
  PiGroupWorkspaceComponent,
  type GroupChip,
} from '../../shared/page/pi-group-workspace.component';
import { PiChromeToolsService } from '../../shared/chrome/pi-chrome-tools.service';
import type { PiChromeToolItem } from '../../shared/chrome/pi-chrome-tools.types';
import { CATALOG_SECTION_CHIPS } from '../catalog/catalog-group-chips';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { createSearchState } from '../../shared/util/search';
import { pluralize } from '../../shared/util/format';
import { createLookupTable } from '../../shared/util/lookup-table';
import { ColumnDef, SortDirection, TableComponent } from '../../shared/ui/pi-table.component';
import { PaginationComponent } from '../../shared/ui/pi-pagination.component';
import { PI_DEFAULT_PAGE_SIZE } from '../../shared/ui/pi-pagination.constants';
import {
  ProductModule,
  ProductModulesService,
  type CompositionTreeNode,
} from '../../shared/services/pi-product-modules.service';
import { photoListUrl, Photo, PhotosService } from '../../shared/services/photos.service';
import { PiShowcaseCardComponent } from '../../shared/ui/card/pi-showcase-card.component';
import { PiPhotoLightboxComponent } from '../../shared/ui/photo';
import { PiEmptyTileComponent } from '../../shared/ui/pi-empty-tile/pi-empty-tile.component';
import { ModuleFormDialogComponent } from './module-form-dialog.component';
import {
  QuickCreateDialogComponent,
  type QuickCreateDialogData,
} from '../../shared/ui/quick-create/quick-create-dialog.component';
import { CatalogKindMarkerComponent } from '../../shared/ui/catalog/catalog-kind-marker.component';
import { catalogKindOklch } from '../../shared/ui/catalog/catalog-kind-oklch';
import { CatalogAppearanceService } from '../../shared/ui/catalog/catalog-appearance.service';
import { PiSkeletonComponent } from '../../shared/ui/skeleton/pi-skeleton.component';
import { ErrorBannerComponent } from '../../shared/ui/error-banner/error-banner.component';
import { PiFilterPanelComponent } from '../../shared/ui/filter-panel/pi-filter-panel.component';

const CHROME_OWNER = 'modules-page';

/**
 * SortKey union intentionally narrow: matches the pre-migration
 * surface where ONLY `name` and `article` were user-clickable
 * sortable columns. Virtual keys like `materialsCount` would
 * require ColumnDef.key to be `keyof ProductModule & string`,
 * which the type system forbids for derived/count fields.
 * The Материалов / Работ columns show `.length` counts but are
 * NOT sortable — same UX as pre-migration.
 */
type SortKey = 'name' | 'article' | null;

/** TZ-CATALOG-372 — client-side «Состав» filter (dual-read composition/lines). */
type CompositionFilter = 'all' | 'with-materials' | 'empty';

/**
 * Compare two values per the sign direction. Mirrors `compareValues`
 * in `orders.page.ts` and `contracts.page.ts` — the three B-flat
 * pages (orders + contracts + modules) share the same value
 * comparison semantics so the dashboard filter UX feels uniform.
 *
 *   null/undefined → bottom regardless of direction (R-3-style
 *   accident prevention; or alphabetical would give
 *   `cancelled < completed < draft` nonsense).
 */
function compareValues(av: unknown, bv: unknown, sign: 1 | -1): number {
  if (av == null && bv == null) return 0;
  if (av == null) return -1 * sign;
  if (bv == null) return 1 * sign;
  if (typeof av === 'number' && typeof bv === 'number') {
    return (av - bv) * sign;
  }
  return String(av).localeCompare(String(bv), 'ru') * sign;
}

/**
 * Custom sort accessor per SortKey. Mirrors the `accessorFor()`
 * pattern from `orders.page.ts`. `name` and `article` are direct
 * field reads (string-locale Russian collation).
 */
function accessorFor(key: Exclude<SortKey, null>): (row: ProductModule) => unknown {
  switch (key) {
    case 'name':
      return (r) => r.name;
    case 'article':
      return (r) => r.article;
  }
}

/**
 * Module dimensions formatter. Reads `row.dimensions` (subdoc),
 * composes "W … × H … × D … unit" string. Empty when no dimensions
 * set. Mirrors the pre-migration helper 1:1.
 */
function moduleDimensions(row: ProductModule): string {
  const d = row.dimensions;
  if (!d || (d.width == null && d.height == null && d.depth == null)) return '';
  const parts: string[] = [];
  if (d.width != null) parts.push(`W ${d.width}`);
  if (d.height != null) parts.push(`H ${d.height}`);
  if (d.depth != null) parts.push(`D ${d.depth}`);
  return `${parts.join(' × ')} ${d.unit ?? ''}`.trim();
}

/**
 * TZ-CATALOG-372: material count of a module via dual-read
 * (composition material-lines have priority over legacy `materials[]`),
 * same semantics as the table column formatter.
 */
function moduleMaterialCount(row: ProductModule): number {
  const lines = (row.composition ?? []).filter((l) => l.lineType === 'material');
  return lines.length > 0 ? lines.length : (row.materials?.length ?? 0);
}

function moduleHasMaterials(row: ProductModule): boolean {
  return moduleMaterialCount(row) > 0;
}

/** Dual-read: composition lines (any) or legacy materials[] — for expand empty. */
function moduleHasComposition(row: ProductModule): boolean {
  const lines = row.composition ?? [];
  if (lines.length > 0) return true;
  return (row.materials?.length ?? 0) > 0;
}

/**
 * Полная документация страницы: docs/pages/modules.page.md
 *
 * TZ-104.3 batch-2-B-flat.2 — ModulesPage migrated to <app-pi-table>,
 * with TZ-104.4.2 typed TemplateRef propagation.
 *
 * TZ-CATALOG-372 — витрина как у Продукции (эталон products.page.ts):
 *   - Фото-колонка (PhotosService lookup + photoListUrl, materials-паттерн)
 *     и имя-ссылка на `/modules/:id`;
 *   - Toolbar: поиск · «Состав» · «+ Создать» · счётчик; view/refresh/filters
 *     → PiChromeToolsService (TZ-UX-327, эталон products TZ-UX-326); fallback
 *     &lt;1024 в toolbar без локальной w-12 колонки.
 *   - Filters flyout (канон products): absolute left overlay + backdrop на
 *     контенте; Состав · Сортировка (name↑↓ / article↑↓) · Сбросить · Закрыть;
 *   - Grid: `PiShowcaseCard` md в сетке 1/2/3, клик → `/modules/:id`,
 *     pager через app-pi-pagination (TZ-UX-341); себест. — hint «см. карточку» (TZ-COST-303,
 *     без N+1 cost-preview).
 *
 * TZ-CATALOG-374 — list row-click раскрывает tray состава (паритет products
 *   `expandedId` / `expandedTpl` / `getProductTree` → `getModuleTree`).
 *   Detail — через имя-ссылку и «Открыть карточку» в tray. Grid без expand.
 *
 * Backend response caveat: flat array (no envelope). Pagination TODO
 * at backend. Sort + filter + slice are page-owned.
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-modules-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    RouterLink,
    PiGroupWorkspaceComponent,
    PiRowActionsComponent,
    ButtonComponent,
    TableComponent,
    PaginationComponent,
    PiShowcaseCardComponent,
    PiEmptyTileComponent,
    CatalogKindMarkerComponent,
    PiSkeletonComponent,
    ErrorBannerComponent,
    PiFilterPanelComponent,
  ],
  styles: `
    @media (min-width: 1024px) {
      .modules-chrome-fallback {
        display: none;
      }
    }
  `,
  template: `
    <app-pi-group-workspace [toc]="toc" tocActiveId="modules" [chips]="emptyChips" activeId="">
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        <input
          id="modules-search"
          type="search"
          name="modules-search"
          [value]="searchQuery()"
          (input)="onSearchInput($event)"
          placeholder="Поиск по названию или артикулу…"
          aria-label="Поиск модулей"
          data-test="search-input"
          class="pi-input w-72"
        />
        <!-- TZ-CATALOG-372: client-side «Состав» filter (dual-read) -->
        <select
          id="modules-composition-filter"
          name="modules-composition-filter"
          [value]="compositionFilter()"
          (change)="onCompositionFilterChange($event)"
          aria-label="Фильтр по составу"
          data-test="composition-filter"
          class="pi-input w-40"
        >
          <option value="all">Все</option>
          <option value="with-materials">С материалами</option>
          <option value="empty">Пустые</option>
        </select>
        <app-pi-button variant="default" (click)="openCreate()" data-test="create-button">
          + Создать
        </app-pi-button>
        <div class="modules-chrome-fallback flex items-center gap-form-field">
          <button
            type="button"
            class="flex min-h-touch min-w-8 items-center justify-center rounded-sm text-ink hover:bg-paper-2 transition-colors pi-focus-ring"
            (click)="toggleFiltersRail()"
            [attr.aria-label]="filtersOpen() ? 'Свернуть фильтры' : 'Открыть фильтры'"
            [attr.aria-expanded]="filtersOpen()"
            aria-controls="modules-flyout-filters"
            data-test="filters-rail-toggle"
          >
            <lucide-icon [img]="FilterIcon" [size]="16"></lucide-icon>
          </button>
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
        </div>
        <span class="flex-1"></span>
        <span class="text-xs text-muted-foreground">{{ total() }} {{ totalLabel(total()) }}</span>
      </div>

      <app-error-banner
        [error]="error()"
        [canRetry]="true"
        data-test="modules-error-banner"
        (retry)="reload()"
      />

      <div class="relative" data-test="modules-layout">
        <app-pi-filter-panel
          [open]="filtersOpen()"
          (openChange)="closeFilters()"
          [ariaLabel]="'Фильтры каталога'"
        >
          <label
            class="text-[11px] uppercase tracking-wide text-muted-foreground"
            for="rail-composition"
            >Состав</label
          >
          <select
            id="rail-composition"
            class="pi-input w-full text-sm"
            [value]="compositionFilter()"
            (change)="onCompositionFilterChange($event)"
            data-test="rail-composition"
          >
            <option value="all">Все</option>
            <option value="with-materials">С материалами</option>
            <option value="empty">Пустые</option>
          </select>
          <label class="text-[11px] uppercase tracking-wide text-muted-foreground" for="rail-sort"
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
            <option value="article:asc">Артикул ↑</option>
            <option value="article:desc">Артикул ↓</option>
          </select>
          <button
            type="button"
            class="text-xs text-muted-foreground hover:text-ink underline decoration-dotted min-h-touch self-start"
            (click)="clearFilters()"
            data-test="clear-filters"
          >
            Сбросить
          </button>
        </app-pi-filter-panel>

        <div class="relative min-w-0">
          <div class="relative z-0">
            @if (viewMode() === 'grid') {
              @if (loading()) {
                <app-pi-skeleton
                  [count]="3"
                  width="100%"
                  height="1.25rem"
                  ariaLabel="Загрузка списка модулей"
                  data-test="grid-loading"
                />
              } @else if (data().length === 0) {
                <p class="text-sm text-muted-foreground py-8 text-center" data-test="grid-empty">
                  {{ emptyMessage() }}
                </p>
              } @else {
                <div
                  class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch"
                  data-test="modules-grid"
                >
                  @for (row of paginatedRows(); track row._id) {
                    <div
                      class="relative block min-w-0 h-full"
                      [attr.data-test]="'showcase-cell-' + row._id"
                    >
                      <a
                        [routerLink]="['/modules', row._id]"
                        class="absolute inset-0 z-0 rounded-sm pi-focus-ring"
                        [attr.aria-label]="'Открыть ' + row.name"
                        [attr.data-test]="'showcase-link-' + row._id"
                      ></a>
                      <app-pi-showcase-card
                        class="relative z-1 h-full pointer-events-none"
                        size="md"
                        [title]="row.name"
                        [description]="gridDescription(row)"
                        [eyebrow]="gridEyebrow(row)"
                        [mediaUrl]="mainPhotoUrl(row)"
                        [interactive]="true"
                        [mediaInteractive]="true"
                        (mediaActivate)="openPhoto(row)"
                        [arrow]="false"
                      >
                        <span sc-actions-md class="flex items-center gap-2 justify-between w-full">
                          <span class="text-xs text-muted-foreground" data-test="showcase-cost"
                            >Себест. см. карточку</span
                          >
                        </span>
                      </app-pi-showcase-card>
                    </div>
                  }
                </div>
                <div class="mt-4 flex justify-end" data-test="grid-pager">
                  <app-pi-pagination
                    [total]="total()"
                    [pageSize]="pageSize()"
                    [currentPage]="page()"
                    ariaLabel="Страницы каталога"
                    (pageChange)="onPageChange($event)"
                    (pageSizeChange)="onPageSizeChange($event)"
                  />
                </div>
              }
            } @else {
              <p class="text-[11px] text-muted-foreground mb-1 sm:hidden">
                ← Таблица широкая — прокручивайте горизонтально →
              </p>
              <app-pi-table
                [data]="paginatedRows()"
                [columns]="cols"
                [loading]="loading()"
                [total]="total()"
                [page]="page()"
                [pageSize]="pageSize()"
                [emptyMessage]="emptyMessage()"
                [ariaLabel]="'Список модулей'"
                [cellTemplates]="cellTemplates"
                [rowActions]="rowActionsTplBinding"
                [localSort]="false"
                [initialSortKey]="'name'"
                [initialSortDir]="'asc'"
                (pageChange)="onPageChange($event)"
                (pageSizeChange)="onPageSizeChange($event)"
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

      <!-- TZ-CATALOG-372: templates OUTSIDE the @if/@else block — static
           ViewChild refs must resolve before the first CD (products-канон). -->
      <ng-template #photoTpl let-row>
        <div
          class="flex items-center justify-center w-[5.5rem] h-[5.5rem] mx-auto"
          data-test="module-photo-cell"
        >
          @if (mainPhotoOf(row); as mp) {
            <img
              [src]="mainPhotoUrl(row)"
              [alt]="mp.originalFilename || row.name"
              class="block w-[5.5rem] h-[5.5rem] object-cover hairline rounded-sm"
              loading="lazy"
              data-test="module-photo"
            />
          } @else {
            <app-pi-empty-tile [sizePx]="88" />
          }
        </div>
      </ng-template>

      <ng-template #nameTpl let-row>
        <app-catalog-kind-marker kind="module">
          <a
            [routerLink]="['/modules', row._id]"
            (click)="$event.stopPropagation()"
            class="text-ink hover:text-sunrise-warm hover:underline"
            [attr.aria-label]="'Открыть ' + row.name"
            data-test="open-row-link"
            >{{ row.name }}</a
          >
        </app-catalog-kind-marker>
      </ng-template>

      <!-- TZ-COST-303: no batch cost-preview → hint to detail (302 has preview). -->
      <ng-template #costTpl>
        <span
          class="text-muted-foreground text-xs whitespace-nowrap"
          title="Расчёт себестоимости на карточке модуля"
          data-test="module-list-cost-hint"
          >см. карточку</span
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

      <!-- TZ-CATALOG-374: expandable composition tray (products parity). -->
      <ng-template #expandedTpl let-row>
        @if (expandedId() === row._id) {
          <div
            class="px-4 py-3.5 border-l-[3px] border-l-gold bg-[var(--color-gold-soft)]"
            data-test="expanded-content"
            [attr.aria-label]="'Состав модуля: ' + row.name"
          >
            <div
              class="flex items-center justify-between gap-3 mb-2.5 flex-wrap"
              data-test="module-expand-sections"
            >
              <!-- Future tray sections: expand via expandedSection signal (successor). -->
              <span class="text-xs font-medium text-ink tracking-wide">Состав</span>
              <a
                [routerLink]="['/modules', row._id]"
                (click)="$event.stopPropagation()"
                class="text-xs text-ink hover:text-sunrise-warm hover:underline"
                data-test="module-expand-open-detail"
                >Открыть карточку</a
              >
            </div>

            @if (!moduleHasComposition(row)) {
              <p class="text-xs text-muted-foreground m-0" data-test="expanded-empty">
                В составе нет материалов.
                <a
                  [routerLink]="['/modules', row._id]"
                  (click)="$event.stopPropagation()"
                  class="ml-1 hover:text-sunrise-warm hover:underline"
                  >Открыть карточку</a
                >
                , чтобы добавить состав.
              </p>
            } @else if (treeLoading(row._id)) {
              <p
                class="text-xs text-muted-foreground m-0"
                role="status"
                data-test="expanded-tree-loading"
              >
                Загрузка состава…
              </p>
            } @else if (treeError(row._id)) {
              <p class="text-xs text-destructive m-0" role="alert" data-test="expanded-tree-error">
                Не удалось загрузить состав модуля.
              </p>
            } @else if (moduleTree(row._id); as tree) {
              <div class="space-y-1" data-test="expanded-tree" role="list">
                @for (child of tree.children; track child._id + ':' + $index) {
                  <div
                    class="flex items-start gap-2 min-w-0 px-2.5 py-2 hairline rounded-sm bg-paper/70"
                    [attr.data-test]="'preview-child-' + child._id"
                  >
                    @if (child.kind === 'module' && child.children.length > 0) {
                      <button
                        type="button"
                        class="shrink-0 min-w-6 min-h-6 rounded-sm text-muted-foreground hover:bg-paper-2 pi-focus-ring"
                        [attr.aria-expanded]="isPreviewExpanded(child)"
                        [attr.aria-label]="
                          (isPreviewExpanded(child) ? 'Свернуть ' : 'Развернуть ') + child.name
                        "
                        (click)="togglePreviewNode(child); $event.stopPropagation()"
                      >
                        {{ isPreviewExpanded(child) ? '⌄' : '›' }}
                      </button>
                    } @else {
                      <span class="w-6 shrink-0" aria-hidden="true"></span>
                    }
                    <span
                      class="shrink-0 eyebrow px-1.5 py-0.5 rounded-sm hairline"
                      [style.color]="childAccent(child)"
                      >{{ kindShort(child) }}</span
                    >
                    <a
                      [routerLink]="previewLink(child)"
                      (click)="$event.stopPropagation()"
                      class="min-w-0 flex-1 line-clamp-2 break-words hover:text-sunrise-warm hover:underline"
                      >{{ child.name }}</a
                    >
                    @if (child.quantity != null && child.quantity !== 1) {
                      <span class="shrink-0 text-xs text-muted-foreground tabular-nums"
                        >×{{ child.quantity }}</span
                      >
                    }
                  </div>
                  @if (isPreviewExpanded(child)) {
                    <div class="ml-8 space-y-1" data-test="preview-child-children">
                      @for (grandchild of child.children; track grandchild._id + ':' + $index) {
                        <a
                          [routerLink]="previewLink(grandchild)"
                          (click)="$event.stopPropagation()"
                          class="block px-2 py-1 text-xs text-muted-foreground line-clamp-2 break-words hover:text-ink"
                          >{{ kindShort(grandchild) }} {{ grandchild.name }}</a
                        >
                      }
                    </div>
                  }
                } @empty {
                  <p class="text-xs text-muted-foreground m-0" data-test="expanded-empty">
                    В составе нет материалов.
                  </p>
                }
              </div>
            }
          </div>
        }
      </ng-template>
    </app-pi-group-workspace>
  `,
})
export class ModulesPage implements OnInit {
  constructor() {
    this.photosLookup.load();
    this.destroyRef.onDestroy(() => {
      this.search.destroy();
      this.chromeTools.clear(CHROME_OWNER);
    });
    effect(() => {
      void this.filtersOpen();
      void this.viewMode();
      void this.filtersDirty();
      untracked(() => this.syncChromeTools());
    });
  }
  protected readonly toc = CATALOG_SECTION_CHIPS;
  protected readonly emptyChips: readonly GroupChip[] = [];
  private readonly service = inject(ProductModulesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly destroyRef = inject(DestroyRef);
  private readonly photosService = inject(PhotosService);
  private readonly appearance = inject(CatalogAppearanceService);
  private readonly chromeTools = inject(PiChromeToolsService);

  protected readonly RefreshIcon = RefreshCw;
  protected readonly ListIcon = List;
  protected readonly GridIcon = LayoutGrid;
  protected readonly FilterIcon = Filter;

  /** Exposed to template via `[pageSize]="pageSize()"`. */
  private readonly pageSizeSig = signal(PI_DEFAULT_PAGE_SIZE);
  protected readonly pageSize = this.pageSizeSig.asReadonly();

  /**
   * TZ-CATALOG-372: list↔grid view mode, persisted in localStorage
   * (`pi-modules-view-mode`) — паттерн products.
   */
  protected readonly viewMode = signal<ModulesViewMode>(loadModulesViewMode());
  protected readonly filtersOpen = signal(false);

  protected setViewMode(mode: ModulesViewMode): void {
    this.viewMode.set(mode);
    saveModulesViewMode(mode);
  }

  protected toggleFiltersRail(): void {
    this.filtersOpen.update((v) => !v);
  }

  protected closeFilters(): void {
    this.filtersOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.filtersOpen()) this.closeFilters();
  }

  private syncChromeTools(): void {
    const open = this.filtersOpen();
    const dirty = this.filtersDirty();
    const mode = this.viewMode();
    const items: PiChromeToolItem[] = [
      {
        id: 'filters',
        side: 'left',
        ariaLabel: dirty ? 'Фильтры изменены' : 'Фильтры',
        title: dirty ? 'Фильтры изменены' : 'Фильтры',
        icon: this.FilterIcon,
        active: open || dirty,
        ariaExpanded: open,
        ariaControls: 'modules-flyout-filters',
        order: 1,
        onClick: () => this.toggleFiltersRail(),
      },
      {
        id: 'view-list',
        side: 'right',
        ariaLabel: 'Показать списком',
        title: 'Показать списком',
        icon: this.ListIcon,
        active: mode === 'list',
        order: 1,
        onClick: () => this.setViewMode('list'),
      },
      {
        id: 'view-grid',
        side: 'right',
        ariaLabel: 'Показать карточками',
        title: 'Показать карточками',
        icon: this.GridIcon,
        active: mode === 'grid',
        order: 2,
        onClick: () => this.setViewMode('grid'),
      },
      {
        id: 'refresh',
        side: 'right',
        ariaLabel: 'Обновить',
        title: 'Обновить',
        icon: this.RefreshIcon,
        order: 3,
        onClick: () => this.reload(),
      },
    ];
    this.chromeTools.setTools(CHROME_OWNER, items);
  }

  /**
   * Page-owned sort signals. Seeded to MATCH pi-table's internal
   * state after ngOnInit applies the `[initialSortKey]="'name'"`
   * + `[initialSortDir]="'asc'"` bindings (TZ-104.4.2).
   */
  private readonly sortKeySig = signal<SortKey>('name');
  private readonly sortDirSig = signal<'asc' | 'desc' | null>('asc');

  /** Current page (1-indexed). Bumped via `(pageChange)` from pi-table. */
  private readonly pageSig = signal<number>(1);
  protected readonly page = this.pageSig.asReadonly();

  /**
   * TZ-CATALOG-372: client-side «Состав» filter. Toolbar select and
   * rail select share this signal (как статус/категория у products).
   */
  private readonly compositionFilterSig = signal<CompositionFilter>('all');
  protected readonly compositionFilter = this.compositionFilterSig.asReadonly();
  protected readonly filtersDirty = computed(() => this.compositionFilterSig() !== 'all');

  /** Single debounced search state — owns its own `searchQuery` signal. */
  private readonly search = createSearchState(300);
  protected readonly searchQuery = this.search.searchQuery;

  private readonly photosLookup = createLookupTable<Photo>(this.photosService.list());

  protected readonly listRes = httpResource<ProductModule[]>(() => ({
    url: `${this.baseUrl}/modules`,
  }));

  protected readonly data = computed<ProductModule[]>(() => this.listRes.value() ?? []);
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as
      import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  /**
   * Client-side filter across `name` + `article` and the
   * TZ-CATALOG-372 «Состав» filter (dual-read composition/lines).
   * Reactive computed reading `data()` + `debouncedSearch()` +
   * `compositionFilterSig()`.
   */
  protected readonly filteredRows = computed<ProductModule[]>(() => {
    const rows = this.data();
    const q = this.search.debouncedSearch().trim().toLowerCase();
    const cf = this.compositionFilterSig();
    return rows.filter((m) => {
      if (cf === 'with-materials' && !moduleHasMaterials(m)) return false;
      if (cf === 'empty' && moduleHasMaterials(m)) return false;
      if (q) {
        const hay = [m.name, m.article ?? ''].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  });

  /**
   * Filtered + sorted rows. Reactive computed reading ALL upstream
   * signals (`filteredRows()` + `sortKey/sortDir`). Pre-migration
   * had an inline `computed` referencing `visible()` snapshot —
   * same fix as the orders + contracts recipes; fixes the snapshot
   * bug where filter changes didn't re-trigger sort.
   */
  protected readonly sortedRows = computed<ProductModule[]>(() => {
    const rows = this.filteredRows();
    const key = this.sortKeySig();
    if (!key) return rows;
    const sign = this.sortDirSig() === 'asc' ? 1 : -1;
    const accessor = accessorFor(key);
    return rows.slice().sort((a, b) => compareValues(accessor(a), accessor(b), sign));
  });

  /**
   * Total = full filtered+sorted length, NOT page slice. pi-table
   * derives `totalPages = ceil(total / pageSize)` and renders
   * Prev/Next accordingly.
   */
  protected readonly total = computed<number>(() => this.sortedRows().length);
  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSizeSig())),
  );

  /**
   * Page slice of the sorted+filtered list.
   *   start = (page-1) * pageSize
   *   end   = start + pageSize
   */
  protected readonly paginatedRows = computed<ProductModule[]>(() => {
    const all = this.sortedRows();
    const size = this.pageSizeSig();
    const start = (this.pageSig() - 1) * size;
    return all.slice(start, start + size);
  });

  protected readonly emptyMessage = computed(() =>
    this.searchQuery() || this.compositionFilter() !== 'all'
      ? 'Ничего не найдено.'
      : 'Нет модулей. Нажмите «Создать», чтобы добавить первый.',
  );

  // ─── Column definitions ────────────────────────────────────────────
  /**
   * TZ-CATALOG-372: `photoIds` (Фото) первая; `name` — sticky-left с
   * именем-ссылкой; остальные колонки как раньше. `weight` — display-only
   * hint «см. карточку» (TZ-COST-303, без N+1 cost-preview).
   */
  protected readonly cols: ColumnDef<ProductModule>[] = [
    { key: 'photoIds', label: 'Фото', width: '104px', align: 'center' },
    {
      key: 'name',
      label: 'Название',
      sortable: true,
      sticky: 'left',
      cellClass: 'catalog-kind-name-cell',
    },
    {
      key: 'article',
      label: 'Артикул',
      sortable: true,
      cellClass: 'empty-cell',
    },
    {
      key: 'dimensions',
      label: 'Габариты модуля',
      cellClass: 'empty-cell whitespace-nowrap',
      format: (r) => moduleDimensions(r),
    },
    {
      key: 'materials',
      label: 'Материалов',
      cellClass: 'text-muted-foreground',
      // Dual-read (TZ-CATALOG-317): непустой composition (material-линии)
      // имеет приоритет над legacy materials[].
      format: (r) => String(moduleMaterialCount(r)),
    },
    {
      key: 'workTypes',
      label: 'Работ',
      cellClass: 'text-muted-foreground',
      format: (r) => String(r.workTypes?.length ?? 0),
    },
    {
      key: 'weight',
      label: 'Себест.',
      align: 'right',
      cellClass: 'text-muted-foreground',
      format: () => 'см. карточку',
    },
  ];

  // ─── Template refs (resolved at view init, static:true → BEFORE ngOnInit) ──
  @ViewChild('photoTpl', { static: true })
  private readonly photoTplRef!: TemplateRef<{ $implicit: ProductModule }>;
  @ViewChild('nameTpl', { static: true })
  private readonly nameTplRef!: TemplateRef<{ $implicit: ProductModule }>;
  @ViewChild('costTpl', { static: true })
  private readonly costTplRef!: TemplateRef<{ $implicit: ProductModule }>;
  @ViewChild('rowActionsTpl', { static: true })
  private readonly rowActionsTplRef!: TemplateRef<{ $implicit: ProductModule }>;

  /** Built in ngOnInit after ViewChild fields resolve. Stable reference. */
  protected cellTemplates: Record<string, TemplateRef<{ $implicit: ProductModule }>> = {};
  /** Built in ngOnInit; null until then so pi-table defers the slot. */
  protected rowActionsTplBinding: TemplateRef<{ $implicit: ProductModule }> | null = null;

  ngOnInit(): void {
    // Build cell-templates map + row-actions binding AFTER static
    // @ViewChild fields resolve. Avoids TemplateRef<C> invariance
    // trap and Angular's signal-binding name-collision.
    this.cellTemplates = {
      photoIds: this.photoTplRef,
      name: this.nameTplRef,
      weight: this.costTplRef,
    };
    this.rowActionsTplBinding = this.rowActionsTplRef;
  }

  // ─── Cell template helpers (TZ-CATALOG-372) ────────────────────────
  /**
   * Main/first photo by id via PhotosService lookup (materials-паттерн).
   * List endpoint не populate Photo — id достаточно для lookup.
   */
  protected mainPhotoOf(row: ProductModule): Photo | null {
    const id = row.mainPhotoId ?? row.photoIds?.[0];
    return id ? (this.photosLookup.byId()[id] ?? null) : null;
  }

  protected mainPhotoUrl(row: ProductModule): string {
    const photo = this.mainPhotoOf(row);
    return photo ? photoListUrl(photo, Object.values(this.photosLookup.byId())) : '';
  }

  protected openPhoto(row: ProductModule): void {
    const photo = this.mainPhotoOf(row);
    const src = this.mainPhotoUrl(row);
    if (!photo || !src) return;
    this.dialog.open(PiPhotoLightboxComponent, {
      data: {
        src,
        alt: photo.originalFilename || row.name,
        filename: photo.originalFilename || row.name,
      },
    });
  }

  protected gridEyebrow(row: ProductModule): string {
    return row.article || 'Модуль';
  }

  protected gridDescription(row: ProductModule): string {
    const dims = moduleDimensions(row);
    if (dims) return dims;
    return `${moduleMaterialCount(row)} мат. · ${row.workTypes?.length ?? 0} раб.`;
  }

  // ─── Event handlers ───────────────────────────────────────────────
  protected totalLabel(n: number): string {
    return pluralize(n, ['модуль', 'модуля', 'модулей']);
  }

  protected sortSelectValue(): string {
    const k = this.sortKeySig() ?? 'name';
    const d = this.sortDirSig() ?? 'asc';
    return `${k}:${d}`;
  }

  protected onSearchInput(event: Event): void {
    this.search.onSearchInput(event);
    // Reset to first page when the search filter changes so users
    // don't land on an out-of-range page of a (possibly empty)
    // filter set.
    this.pageSig.set(1);
  }

  protected onCompositionFilterChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value as CompositionFilter;
    this.compositionFilterSig.set(v === 'with-materials' || v === 'empty' ? v : 'all');
    if (this.pageSig() !== 1) this.pageSig.set(1);
  }

  protected onRailSortChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    const [key, dir] = v.split(':') as [Exclude<SortKey, null>, 'asc' | 'desc'];
    this.sortKeySig.set(key);
    this.sortDirSig.set(dir);
    this.pageSig.set(1);
  }

  protected clearFilters(): void {
    this.compositionFilterSig.set('all');
    this.search.searchQuery.set('');
    this.search.debouncedSearch.set('');
    this.pageSig.set(1);
  }

  protected onPageChange(p: number): void {
    this.pageSig.set(Math.min(Math.max(1, p), this.totalPages()));
  }

  /** TZ-UX-341: size select → update slice size and reset to page 1. */
  protected onPageSizeChange(size: number): void {
    this.pageSizeSig.set(size);
    this.pageSig.set(1);
  }

  /**
   * Page-owned sort handler. `[localSort]="false"` keeps pi-table
   * from re-sorting the visible page slice, and this handler simply
   * MIRRORS pi-table's sortChange emit into the page's sort
   * signals.
   */
  protected onSortChange(event: { key: string; dir: SortDirection }): void {
    const dir = event.dir;
    // Single boundary cast: pi-table emits `key: string`, page's
    // SortKey is a union. Cast at the event ingestion point; no
    // further casts needed downstream. Mirrors `orders.page.ts` +
    // `contracts.page.ts`.
    this.sortKeySig.set(dir === null ? null : (event.key as Exclude<SortKey, null>));
    this.sortDirSig.set(dir === null ? 'asc' : dir);
    // Reset to first page on every sort change so users see the
    // first rows of the freshly ordered set.
    this.pageSig.set(1);
  }

  /**
   * TZ-CATALOG-374: row-click toggles composition expand (products parity).
   * Detail navigation stays on the name link / «Открыть карточку».
   */
  protected onRowClick(row: ProductModule): void {
    const opening = this.expandedId() !== row._id;
    this.expandedId.update((cur) => (cur === row._id ? null : row._id));
    if (opening) {
      this.expandedSection.set('composition');
      if (this.moduleHasComposition(row)) this.ensureModuleTree(row._id);
    }
  }

  protected readonly expandedId = signal<string | null>(null);
  /** Tray section key — only `composition` is live; successors add more without template rewrite. */
  protected readonly expandedSection = signal<'composition'>('composition');
  protected readonly isExpandedRow = (row: ProductModule): boolean => this.expandedId() === row._id;
  protected readonly expandedRowLabel = (row: ProductModule): string =>
    `Состав модуля: ${row.name}`;

  private readonly treeCache = signal(new Map<string, CompositionTreeNode>());
  private readonly treeLoadingIds = signal(new Set<string>());
  private readonly treeErrorIds = signal(new Set<string>());
  private readonly previewExpandedIds = signal(new Set<string>());

  protected moduleHasComposition = moduleHasComposition;

  protected moduleTree(moduleId: string): CompositionTreeNode | null {
    return this.treeCache().get(moduleId) ?? null;
  }

  protected treeLoading(moduleId: string): boolean {
    return this.treeLoadingIds().has(moduleId);
  }

  protected treeError(moduleId: string): boolean {
    return this.treeErrorIds().has(moduleId);
  }

  protected kindShort(node: CompositionTreeNode): string {
    return node.kind === 'module' ? 'мод' : node.kind === 'product' ? 'изд' : 'мат';
  }

  protected childAccent(node: CompositionTreeNode): string {
    return catalogKindOklch(
      node.kind,
      node.materialKind ?? null,
      0.11,
      0.62,
      this.appearance.palette(),
    );
  }

  protected previewLink(node: CompositionTreeNode): string[] {
    return node.kind === 'module'
      ? ['/modules', node._id]
      : node.kind === 'product'
        ? ['/products', node._id]
        : ['/materials', node._id];
  }

  protected isPreviewExpanded(node: CompositionTreeNode): boolean {
    return this.previewExpandedIds().has(node._id);
  }

  protected togglePreviewNode(node: CompositionTreeNode): void {
    const next = new Set(this.previewExpandedIds());
    if (next.has(node._id)) next.delete(node._id);
    else next.add(node._id);
    this.previewExpandedIds.set(next);
  }

  private ensureModuleTree(moduleId: string): void {
    if (this.treeCache().has(moduleId) || this.treeLoading(moduleId)) return;
    this.treeLoadingIds.update((ids) => new Set(ids).add(moduleId));
    this.treeErrorIds.update((ids) => {
      const next = new Set(ids);
      next.delete(moduleId);
      return next;
    });
    this.service.getModuleTree(moduleId, 2).subscribe((res) => {
      this.treeLoadingIds.update((ids) => {
        const next = new Set(ids);
        next.delete(moduleId);
        return next;
      });
      if (res.ok) {
        this.treeCache.update((cache) => new Map(cache).set(moduleId, res.data));
      } else {
        this.treeErrorIds.update((ids) => new Set(ids).add(moduleId));
        this.toast.error('Не удалось загрузить состав модуля');
      }
    });
  }

  /** TZ-DICT-316 — list «Создать» → QuickCreate (profile S/M/L); edit stays FullEditor. */
  protected openCreate(): void {
    // Width comes from QuickCreate SIZE_TO_WIDTH (S/M/L) — do not pin opener to md.
    const ref = this.dialog.open(QuickCreateDialogComponent, {
      data: { entity: 'module', size: 'M' } satisfies QuickCreateDialogData,
    });
    this.refreshOnDialogClose(ref);
  }

  protected openEdit(row: ProductModule): void {
    const ref = this.dialog.open(ModuleFormDialogComponent, {
      data: row,
      width: 'lg',
    });
    this.refreshOnDialogClose(ref);
  }

  protected onDelete(row: ProductModule): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить модуль?',
        description: `Удалить «${row.name}»? Если он используется в товарах — операция может быть отклонена сервером.`,
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
          this.toast.success('Модуль удалён');
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

  private refreshOnDialogClose<TResult>(ref: DialogRef<TResult>): void {
    onDialogCloseOnce(ref, this.injector, () => {
      this.photosLookup.load();
      this.listRes.reload();
    });
  }
}

// ─── View-mode persistence (TZ-CATALOG-372, паттерн products) ───
const MODULES_VIEW_MODE_KEY = 'pi-modules-view-mode';

type ModulesViewMode = 'list' | 'grid';

const DEFAULT_VIEW_MODE: ModulesViewMode = 'list';

function loadModulesViewMode(): ModulesViewMode {
  try {
    const raw = localStorage.getItem(MODULES_VIEW_MODE_KEY);
    return raw === 'grid' ? 'grid' : 'list';
  } catch {
    return DEFAULT_VIEW_MODE;
  }
}

function saveModulesViewMode(mode: ModulesViewMode): void {
  try {
    localStorage.setItem(MODULES_VIEW_MODE_KEY, mode);
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded)
  }
}
