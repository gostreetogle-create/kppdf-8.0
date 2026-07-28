import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
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
import { ColumnDef } from '../../shared/ui/pi-table.component';
import {
  PiEntityListComponent,
  DefaultListParams,
  SortChangeEvent,
} from '../../shared/dsl/entity-list/pi-entity-list.component';
import { EntityService } from '../../shared/dsl/entity/entity-service';
import {
  ProductModule,
  ProductModuleUpsertDto,
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
 * TZ-232.E warmup #3 — modules migrated to <pi-entity-list> wrapper,
 * Approach D (hybrid adapter pattern).
 *
 * Backend `/modules` endpoint returns a flat array (NO envelope),
 * and does NOT support `?search=` or `?sortBy=` query params
 * (TZ-104.3 batch-2-B-flat pattern). Wrapper's debounced search +
 * server-side sort would be broken UX; pre-migration page handled
 * filter/sort/paginate entirely client-side using signal-driven
 * computed chains.
 *
 * Migration strategy (Approach D):
 *  - `httpResource` KEEPS the flat-array fetch preserved.
 *  - Synthetic `localAdapter: EntityService<T, P>` slices filtered+
 *    sorted data into `{items, total}` shape expected by the wrapper.
 *  - Wrapper's `[showSearch]="false"` + `[localSort]="false"` —
 *    page owns search input via `[toolbarExtras]` and sort cycle
 *    via `(sortChange)` output fired from pi-table → page updates
 *    `sortKeySig/sortDirSig` → re-computes `sortedRows()` → reloads
 *    via `wrapper.reload()` (effect-driven).
 *  - Wrapper's `(rowClick)` output triggers `router.navigate`.
 *
 * Trade-offs / decisions:
 *  - **Search is page-level**, not wrapper-level. Backend can't honor
 *    `?search=`, so we keep the existing `createSearchState` + page-
 *    level debounced search → filter computed.
 *  - **Sort cycle is page-level**. Wrapper's `(sortChange)` output
 *    forwards pi-table's emit; page mirrors into `sortKeySig/sortDirSig`
 *    + triggers `wrapper.reload()` via effect on `sortedRows()` change.
 *  - **Paginate is wrapper-level**. Wrapper's `page/pageSize` flow
 *    into the synthetic `localAdapter.list(params)` which returns
 *    the slice of `sortedRows()` for that page.
 *  - **Row-click navigation** preserved via wrapper's `(rowClick)`
 *    → page navigates to `/modules/:id`.
 *  - **Count hint** preserved via `viewChild.listRef().total()` →
 *    "{{ total() }} модулей" (pluralized).
 */
@Component({
  selector: 'app-modules-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiRowActionsComponent,
    ButtonComponent,
    PiEntityListComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · каталог"
      title="Модули"
      description="Составные части продукции: материалы + виды работ. Модуль переиспользуется между товарами."
    />

    <app-pi-entity-list
      #list
      [service]="localAdapter"
      [cols]="cols"
      ariaLabel="Список модулей"
      [pageSize]="PAGE_SIZE"
      [showSearch]="false"
      [localSort]="false"
      [initialSortKey]="'name'"
      [initialSortDir]="'asc'"
      emptyMessage="Нет модулей. Нажмите «Создать», чтобы добавить первый."
      [cellTemplates]="cellTemplates()"
      [rowActionsTpl]="rowActionsTplBinding()"
      (create)="openCreate()"
      (rowEdit)="openEdit($event)"
      (rowDelete)="onDelete($event)"
      (sortChange)="onSortChange($event)"
      (rowClick)="onRowClick($event)"
    >
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

      <!-- Page-level toolbar: search input + count hint -->
      <div toolbarExtras class="flex items-center gap-2 flex-wrap">
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
        <span class="text-xs text-muted-foreground" data-test="modules-count">
          {{ visibleCount() }} {{ totalLabel(visibleCount()) }}
        </span>
      </div>
    </app-pi-entity-list>

    <p class="text-[10px] text-muted-foreground mt-2 sm:hidden">
      ← Таблица широкая — прокручивайте горизонтально →
    </p>
  `,
})
export class ModulesPage {
  private readonly service = inject(ProductModulesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly destroyRef = inject(DestroyRef);

  /** Exposed to template via `[pageSize]`. */
  protected readonly PAGE_SIZE = PAGE_SIZE;

  /**
   * Page-owned sort signals. Seeded to MATCH wrapper/pi-table's
   * internal state after initial sort applied (`name` / `asc`).
   */
  protected readonly sortKeySig = signal<SortKey>('name');
  protected readonly sortDirSig = signal<'asc' | 'desc' | null>('asc');

  /** Page-level debounced search (Backend ignores `?search=` → local filter). */
  private readonly search = createSearchState(300);
  protected readonly searchQuery = this.search.searchQuery;

  /**
   * Flat-array GET /modules via httpResource — preserves the cached
   * dataset that the page-level `filteredRows` computed reacts to.
   */
  protected readonly listRes = httpResource<ProductModule[]>(() => ({
    url: `${this.baseUrl}/modules`,
  }));

  protected readonly data = computed<ProductModule[]>(() => this.listRes.value() ?? []);
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as
      | import('@angular/common/http').HttpErrorResponse
      | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  /**
   * Client-side filter across `name` + `article` (pre-migration UX).
   * Reactive computed reading `data()` and `debouncedSearch()`.
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
   * Filtered + sorted rows. Reactive computed reading all upstream
   * signals (`filteredRows()` + `sortKeySig/sortDirSig`).
   */
  protected readonly sortedRows = computed<ProductModule[]>(() => {
    const rows = this.filteredRows();
    const key = this.sortKeySig();
    if (!key) return rows;
    const sign = this.sortDirSig() === 'asc' ? 1 : -1;
    const accessor = accessorFor(key);
    return rows
      .slice()
      .sort((a, b) => compareValues(accessor(a), accessor(b), sign));
  });

  /** Total = full filtered+sorted length, NOT page slice. */
  protected readonly total = computed<number>(() => this.sortedRows().length);

  /** Modal toolbar count: visible rows after filtering (not the page slice). */
  protected readonly visibleCount = computed<number>(() => this.sortedRows().length);

  // ─── Wrapper ref + synthetic EntityService adapter ────────────────
  private readonly listRef = viewChild<
    PiEntityListComponent<ProductModule>
  >('list');

  /**
   * Template refs via `viewChild` signal (modern Angular 20).
   */
  private readonly rowActionsTplRef = viewChild<TemplateRef<{ $implicit: ProductModule }>>(
    'rowActionsTpl',
  );

  protected readonly cellTemplates = computed<
    Record<string, TemplateRef<{ $implicit: ProductModule }>>
  >(() => {
    const result: Record<string, TemplateRef<{ $implicit: ProductModule }>> = {};
    void this.rowActionsTplRef();
    // No per-column cell templates for modules (rowActionsTpl is
    // forwarded separately via [rowActionsTpl], not via cellTemplates).
    return result;
  });

  protected readonly rowActionsTplBinding = computed<
    TemplateRef<{ $implicit: ProductModule }> | null
  >(() => this.rowActionsTplRef() ?? null);

  /**
   * Synthetic `EntityService<T, P>` adapter — slices the locally
   * filtered+sorted `sortedRows()` into `{items, total}` shape that
   * the wrapper expects. `findById/create/update/remove` delegate
   * straight to the underlying `ProductModulesService`.
   *
   * `list()` runs synchronously (`of(...)`) because all data is
   * already in memory after `httpResource` resolves. This bypasses
   * wrapper's HTTP fetch pipeline cleanly for in-memory pages.
   *
   * Update/create cast: the generic `EntityService<T, P>` adapter
   * uses `Partial<T>` for both update and create payloads, but the
   * underlying `ProductModulesService.create/update` expects
   * `ProductModuleUpsertDto` (a subset of `ProductModule`). The
   * runtime payload is the same shape; the cast preserves the
   * contract without runtime cost.
   */
  protected readonly localAdapter: EntityService<ProductModule, DefaultListParams> = {
    list: (params) => {
      const limit = Math.max(params.limit ?? PAGE_SIZE, 1);
      const start = ((params.page ?? 1) - 1) * limit;
      const all = this.sortedRows();
      return of({
        ok: true as const,
        data: {
          items: all.slice(start, start + limit),
          total: all.length,
          page: params.page ?? 1,
          limit,
        },
      });
    },
    findById: (id: string) => this.service.findById(id),
    create: (payload) =>
      this.service.create(payload as unknown as ProductModuleUpsertDto),
    update: (id, payload) =>
      this.service.update(
        id,
        payload as unknown as Partial<ProductModuleUpsertDto>,
      ),
    remove: (id) => this.service.remove(id),
  };

  constructor() {
    // Reload the wrapper whenever `sortedRows()` changes (i.e.
    // search OR sort cycle change). Manual trigger pattern mirrors
    // wrapper's own internal fetch trigger; deterministic in
    // `fakeAsync` test zones. `firstRun` guard skips the initial
    // mount (wrapper's ngOnInit already fired the first fetch);
    // subsequent changes trigger `wrapper.reload()` to re-slice
    // the synthetic adapter with the new sorted state.
    let firstEffectRun = true;
    effect(() => {
      this.sortedRows();
      if (firstEffectRun) {
        firstEffectRun = false;
        return;
      }
      this.listRef()?.reload();
    });

    void this.error; // referenced for TemplateRef binding
  }

  // ─── Columns ──────────────────────────────────────────────────────
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

  // ─── Event handlers ───────────────────────────────────────────────
  protected totalLabel(n: number): string {
    return pluralize(n, ['модуль', 'модуля', 'модулей']);
  }

  protected onSearchInput(event: Event): void {
    this.search.onSearchInput(event);
    // Reset sort to defaults on search so users get a stable
    // alphabetical view of the freshly filtered dataset.
    this.sortKeySig.set('name');
    this.sortDirSig.set('asc');
  }

  /**
   * Page-owned sort handler. pi-table emits `{key, dir}`. We mirror
   * pi-table's state into the page's `sortKeySig/sortDirSig`; the
   * constructor's effect re-fires `wrapper.reload()` automatically
   * because `sortedRows()` is reactive.
   */
  protected onSortChange(event: SortChangeEvent): void {
    const dir = event.dir;
    this.sortKeySig.set(dir === null ? null : (event.key as Exclude<SortKey, null>));
    this.sortDirSig.set(dir === null ? 'asc' : dir);
  }

  /**
   * Row-click navigation — preserved from pre-migration. Clicking any
   * cell OUTSIDE the trailing action column navigates to
   * `/modules/:id`. Action column clicks are stopPropagation'd by
   * pi-table.
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

  private refreshOnDialogClose<TResult>(ref: DialogRef<TResult>): void {
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }
}