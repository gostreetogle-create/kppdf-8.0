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
import { Router } from '@angular/router';
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
import { pluralize } from '../../shared/util/format';
import { ColumnDef, SortDirection, TableComponent } from '../../shared/ui/pi-table.component';
import {
  ProductModule,
  ProductModulesService,
} from '../../shared/services/pi-product-modules.service';
import { ModuleFormDialogComponent } from './module-form-dialog.component';

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

/** Client-side pagination page size for /modules flat-array endpoint. */
const PAGE_SIZE = 20;

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
 * Полная документация страницы: docs/pages/modules.page.md
 *
 * TZ-104.3 batch-2-B-flat.2 — ModulesPage migrated to <app-pi-table>,
 * with TZ-104.4.2 typed TemplateRef propagation.
 *
 * Second B-flat page (after contracts); validates Pattern B-flat's
 * cross-type stability: the same pattern works for Contract (8 columns,
 * dual lookups) and for ProductModule (5 columns, no lookups, with a
 * row-click navigation handler). The pattern survives the
 * Contract↔ProductModule type permutations because both interfaces
 * carry `_id: string` (MongoDB convention) — which is exactly the
 * pi-table keyOf() JSON.stringify-fallback footgun guard.
 *
 * Backend response caveat: flat array (no envelope). Pagination TODO
 * at backend. Sort + filter + slice are page-owned.
 *
 * TZ-104.4.2 page-loaded default sort: `[initialSortKey]="'name'"`
 * + `[initialSortDir]="'asc'"` per spec §1.12.1 (alphabetical by
 * module name, ascending). The page's internal `sortKeySig/sortDirSig`
 * are seeded to MATCH pi-table's post-ngOnInit state so the
 * mirror-event handler stays in lockstep from the very first click.
 *
 * SortKey union: `'name' | 'article'` (intentionally narrow — see
 * file-top SortKey JSDoc for the why). Matches pre-migration UX.
 *
 * Row-click handler preserved from the pre-migration source: clicking
 * any cell OUTSIDE the trailing action column navigates to
 * `/modules/:id` for the detail page. pi-table's trailing action
 * `<td>` stops `$event.stopPropagation()` automatically (per
 * pi-table JSDoc on `[rowActions]`) so action clicks don't bubble.
 *
 * BUG fixes vs the pre-migration source (mirror of contracts recipe):
 *  1. `sortedRows` was previously bound via an INLINE `computed()`
 *     with sortKey/sortDir signals and `visible()` reads. The
 *     migrated version follows the canonical Pattern B reactive
 *     computed chain (`data() → filteredRows() → sortedRows() →
 *     paginatedRows()`) reading ALL upstream signals so any change
 *     cascades.
 *  2. Pre-migration had a page-level `searchQuery` signal AND an
 *     inline `visible()` computed that filtered inside the same
 *     chain. Replaced with `createSearchState` + a single reactive
 *     `filteredRows` computed reading `debouncedSearch`.
 *  3. SortKey typing `'name' | 'article' | null` lets `null` carry
 *     pi-table's "third-click-past-desc clears sort" state cleanly.
 *
 * Dead imports pruned: FormsModule (was unused even pre-migration —
 * `<input>` used `[value]`/`(input)`, not `ngModel`), PiEmptyStateComponent
 * (replaced by pi-table's native `[emptyMessage]` + `[loading]` states —
 * pi-table renders its own empty-state row + skeleton overlay).
 *
 * Standalone + OnPush + signal-based. No `modules.page.spec.ts` exists
 * for v1; acceptance is visual smoke + ng build (recipe §7 Rule 4).
 */
@Component({
  selector: 'app-modules-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiRowActionsComponent,
    ButtonComponent,
    TableComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · каталог"
      title="Модули"
      description="Составные части продукции: материалы + виды работ. Модуль переиспользуется между товарами."
    />

    <app-pi-toolbar>
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
      <app-pi-button variant="default" (click)="openCreate()" data-test="create-button">
        + Создать
      </app-pi-button>
      <span hint>{{ visibleCount() }} {{ totalLabel(visibleCount()) }}</span>
    </app-pi-toolbar>

    <app-pi-section
      title="Каталог модулей"
      hint="сортировка · клик по строке → детальная страница"
      eyebrow="I"
    >
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
          [data]="paginatedRows()"
          [columns]="cols"
          [loading]="loading()"
          [total]="total()"
          [page]="page()"
          [pageSize]="pageSize"
          [emptyMessage]="emptyMessage()"
          [ariaLabel]="'Список модулей'"
          [cellTemplates]="cellTemplates"
          [rowActions]="rowActionsTplBinding"
          [localSort]="false"
          [initialSortKey]="'name'"
          [initialSortDir]="'asc'"
          (pageChange)="onPageChange($event)"
          (sortChange)="onSortChange($event)"
          (rowClick)="onRowClick($event)"
        >
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
export class ModulesPage implements OnInit {
  constructor() {
    this.destroyRef.onDestroy(() => this.search.destroy());
  }
  private readonly service = inject(ProductModulesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly destroyRef = inject(DestroyRef);

  /** Exposed to template via `[pageSize]="pageSize"`. */
  protected readonly pageSize = PAGE_SIZE;

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

  /** Single debounced search state — owns its own `searchQuery` signal. */
  private readonly search = createSearchState(300);
  protected readonly searchQuery = this.search.searchQuery;

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
   * Client-side filter across `name` + `article` (verified by
   * pre-migration UX surface: the search input placeholder reads
   * "Поиск по названию или артикулу"). Reactive computed reading
   * `data()` and `debouncedSearch()` so both filter-set and
   * search-text changes trigger re-compute.
   */
  protected readonly filteredRows = computed<ProductModule[]>(() => {
    const rows = this.data();
    const q = this.search.debouncedSearch().trim().toLowerCase();
    if (!q) return rows.slice();
    return rows.filter((m) => {
      const hay = [m.name, m.article ?? ''].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
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

  /**
   * Page slice of the sorted+filtered list.
   *   start = (page-1) * pageSize
   *   end   = start + pageSize
   */
  protected readonly paginatedRows = computed<ProductModule[]>(() => {
    const all = this.sortedRows();
    const start = (this.pageSig() - 1) * PAGE_SIZE;
    return all.slice(start, start + PAGE_SIZE);
  });

  /** Modal toolbar count: visible rows after filtering (not the page slice). */
  protected readonly visibleCount = computed<number>(() => this.sortedRows().length);

  protected readonly emptyMessage = computed(() =>
    this.searchQuery()
      ? 'Ничего не найдено.'
      : 'Нет модулей. Нажмите «Создать», чтобы добавить первый.',
  );

  // ─── Column definitions ────────────────────────────────────────────
  /**
   * Column-set mirroring the pre-migration source's 5 user-visible
   * columns + the trailing actions slot (auto-injected by
   * `[rowActions]`):
   *   - `name`     sortable + sticky-left (acts as ID column for tablet UX)
   *   - `article`  sortable + monospace (catalog SKU style)
   *   - `dimensions`  muted, custom `moduleDimensions()` formatter
   *   - `materials`    count, derived .length (DISPLAY ONLY, not sortable)
   *   - `workTypes`    count, derived .length (DISPLAY ONLY, not sortable)
   *
   * Sortable count is intentionally 2 (`name` + `article`), matching
   * pre-migration. The Материалов / Работ columns are display-only
   * because pi-table's ColumnDef.key is `keyof T & string` — a virtual
   * `_materialsCount` is type-system-forbidden. Users wanting sort
   * by count can use `sortOrder` (sortOrder?: number is on the type).
   * Not exposing sortOrder here matches current pre-migration UX
   * (no sortOrder header was clickable in the source).
   */
  protected readonly cols: ColumnDef<ProductModule>[] = [
    {
      key: 'name',
      label: 'Название',
      sortable: true,
      sticky: 'left',
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
      format: (r) => String(r.materials?.length ?? 0),
    },
    {
      key: 'workTypes',
      label: 'Работ',
      cellClass: 'text-muted-foreground',
      format: (r) => String(r.workTypes?.length ?? 0),
    },
  ];

  // ─── Template refs (resolved at view init, static:true → BEFORE ngOnInit) ──
  /**
   * TZ-104.4.2: strongly typed `TemplateRef<{ $implicit: ProductModule }>`.
   * Pre-TZ-104.4.2 these were `TemplateRef<any>`. There is NO
   * `cellTemplates` content for modules (no rich cell content
   * needed beyond row-actions), but we still type the field for
   * parity with the contracts pattern — `{}` initial assignment.
   */
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
    this.cellTemplates = {};
    this.rowActionsTplBinding = this.rowActionsTplRef;
  }

  // ─── Event handlers ───────────────────────────────────────────────
  protected totalLabel(n: number): string {
    return pluralize(n, ['модуль', 'модуля', 'модулей']);
  }

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
   * from re-sorting the visible page slice, and this handler simply
   * MIRRORS pi-table's sortChange emit into the page's sort
   * signals. The mirror-event pattern (vs re-derive) keeps the
   * cycles in lockstep regardless of starting-state divergence;
   * see `docs/pi-table-migration-recipe.md` §8 R-5.
   *
   * pi-table's emit contract: `{key, dir: SortDirection}` where
   * dir ∈ {'asc' | 'desc' | null}. When `dir === null`, pi-table
   * has cleared its key (third click past desc). Page mirrors by
   * clearing sortKeySig and keeping sortDirSig at 'asc' as a
   * no-visual-effect placeholder.
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
   * Row-click handler — preserved from pre-migration. Clicking any
   * cell OUTSIDE the trailing action column navigates to
   * `/modules/:id` for the detailed product module page. Trailing
   * action `<td>` is wrapped by pi-table with `$event.stopPropagation()`
   * (per pi-table JSDoc on `[rowActions]`), so action clicks don't
   * bubble. This is the canonical R-8 footgun prevention.
   */
  protected onRowClick(row: ProductModule): void {
    this.router.navigate(['/modules', row._id]);
  }

  protected openCreate(): void {
    const ref = this.dialog.open(ModuleFormDialogComponent, {
      data: null,
      width: 'lg',
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
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }
}
