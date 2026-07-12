# pi-table Migration Recipe

**Status:** ROUND-1 architect verdict · **Phase:** TZ-104 onboarding doc · **Owner:** Codex

> **Read this before migrating any catalog list-page to `<app-pi-table>`.**
> This is the canonical pattern extracted from `materials.page.ts` (envelope, server-side), `products.page.ts` (envelope, server-side, sort+paginate), and `orders.page.ts` (flat-array, client-side). The 3 commits `fc398a2` + `7f4e359` + `d331e22` shipped these. The TZ-104.4 commit `dd88b42` extended `<app-pi-table>` with the typed `initialSortKey`/`initialSortDir` inputs that drop the `any` escape hatch.

**Depends on:**
- `frontend/src/app/shared/ui/pi-table.component.ts` (the primitive — `TableComponent<T extends Record<string, unknown>>`).
- `tasks/TZ-104.3-batch-2.md` (the batch-2 spec — which pages to migrate + grouping).

**Unlocks:** Any future batch (batch-3+) of catalog list-page migrations without re-deriving the pattern.

---

## 1. Why this doc exists

Three pages were migrated to `<app-pi-table>` (commits `fc398a2` + `7f4e359` + `d331e22`). The post-migration state was further cleaned by TZ-104.4 (`dd88b42`) which:
1. Re-typed `<app-pi-table>` `[cellTemplates]` from `Record<string, TemplateRef<{ $implicit: unknown }>>` to `Record<string, TemplateRef<{ $implicit: T }>>`, allowing page-side `@ViewChild` to use strong `TemplateRef<{ $implicit: <Row> }>` typing.
2. Added `[initialSortKey]` + `[initialSortDir]` inputs so page-loaded default sorts don't need a `null → <default>` phase-shift dance.

This doc captures the **post-TZ-104.4.2 canonical pattern**. Future batch-2+ pages should copy from §4 (Pattern A) or §5 (Pattern B) verbatim. Don't re-derive — the footguns in §8 are subtle.

---

## 2. The `<app-pi-table>` API (relevant subset)

| Input | Type | Default | Use when |
|---|---|---|---|
| `[data]` | `T[]` | `[]` | The visible row set. For envelope pages: the `items` slice. For flat-array pages: the `paginatedRows()` slice. |
| `[columns]` | `ColumnDef<T>[]` | **required** | Column descriptors. `key` is `keyof T & string` — typos caught at compile time. |
| `[total]` | `number` | `0` | Total row count. For envelope pages: `listRes.value()?.total` (canonical envelope field). For flat-array pages: `sortedRows().length`. When 0, pager is hidden. |
| `[page]` | `number` | `1` | Current 1-indexed page. Parent syncs via `(pageChange)`. |
| `[pageSize]` | `number` | `20` | Items per page. |
| `[localSort]` | `boolean` | `true` | **CRITICAL**: set to `false` for server-side sort+paginate (envelope pages) so pi-table doesn't re-sort the page slice (the backend already sorted). |
| `[initialSortKey]` | `keyof T & string \| null` | `null` | **TZ-104.4.2**: one-shot seed for pi-table's internal sort state. Strongly typed so typos like `'naem'` are compile errors. |
| `[initialSortDir]` | `'asc' \| 'desc' \| null` | `null` | **TZ-104.4.2**: paired with `initialSortKey`. Both null = no seeded sort. |
| `[loading]` | `boolean` | `false` | Skeleton overlay + `aria-busy="true"`. Wire to `listRes.isLoading()`. |
| `[emptyMessage]` | `string` | `'Нет данных для отображения.'` | Override per page (e.g. "Ничего не найдено."). |
| `[ariaLabel]` | `string` | `'Таблица'` | Screen reader label — should be page-specific (e.g. `'Список материалов'`). |
| `[cellTemplates]` | `Record<string, TemplateRef<{ $implicit: T }>>` | `{}` | Per-column rich-content templates. Map `ColumnDef.key → TemplateRef`. Pages without rich cells can leave this empty. |
| `[rowActions]` | `TemplateRef<{ $implicit: T }> \| null` | `null` | Trailing right-aligned cell with row-level action buttons. pi-table wraps this `<td>` with `$event.stopPropagation()` so clicks don't bubble to the row's `rowClick` handler. |

| Output | Type | Use when |
|---|---|---|
| `(pageChange)` | `number` (1-indexed page) | User clicked Prev/Next. Parent updates `pageSig` and `httpResource` auto-refires. |
| `(sortChange)` | `{ key: string; dir: 'asc' \| 'desc' \| null }` | User clicked a column header. **MIRROR this event** into the page's `sortKeySig`/`sortDirSig`. The boundary `as SortKey` cast happens here. |
| `(rowClick)` | `T` | User clicked anywhere on the row (outside the action cell). Optional handler — most list pages don't need it. |

**Two outputs that DON'T exist** (and why you should not invent them):
- `(sortKey)` / `(sortDir)` — pi-table does NOT expose its internal sort state as outputs. The mirror-event pattern in §4.3 / §5.3 is the canonical way to keep the page in lockstep.
- `[sortKey]` / `[sortDir]` — same reason. Don't try to make pi-table a controlled component; it isn't.

---

## 3. Backend-shape pre-flight (verify BEFORE writing code)

The migration recipe depends on the backend's response shape. **Verify the actual `list()` method return type before writing any migration code** — mismatched assumption produces tsc errors that block the commit.

**How to verify:**

```bash
# 1. Find the page's service file
ls frontend/src/app/pages/<page>/<page>.service.ts
# OR
ls frontend/src/app/shared/services/<page>.service.ts

# 2. Inspect the list() return type
head -60 frontend/src/app/<path>/<service>.ts
grep -nE 'list\(.*\).*:|<X>ListResponse|SilentResult<' frontend/src/app/<path>/<service>.ts
```

**Decision matrix:**

| Backend returns | Use pattern | Key signals |
|---|---|---|
| `Observable<SilentResult<{ items: T[]; total: number; page: number; limit: number; }>>` or `httpResource<{ items, total, page, limit }>` | **Pattern A — Envelope** | `items` + `total` keys in the response shape |
| `Observable<SilentResult<T[]>>` or `httpResource<T[]>` | **Pattern B — Flat-array** | Top-level array, no envelope wrapper |

**Don't trust the page name** — `organizations` could be either; the service decides. Inventory in `tasks/TZ-104.3-batch-2.md` §1 is best-effort and pages flagged `TBD` MUST be re-verified.

---

## 4. Pattern A — Envelope (server-side paginated + sorted)

**Use when:** backend returns `{items, total, page, limit}`. Backend accepts `page`, `limit`, `search`, `sortBy`, `sortOrder` query params. Examples: `materials`, `products`, `stock-movements`, `storage-items`, `units`, `categories`.

**Canonical source:** `frontend/src/app/pages/products/products.page.ts` (post-TZ-104.4 `dd88b42`). `materials.page.ts` is a slight variant — it has no client-side sort (pi-table's internal sort owns it), so it's simpler.

### 4.1 Template structure (copy verbatim)

```html
<app-pi-table
  [data]="data()"
  [columns]="cols"
  [loading]="loading()"
  [total]="total()"
  [page]="page()"
  [pageSize]="pageSize"
  [emptyMessage]="emptyMessage()"
  [ariaLabel]="'Список <pluralized noun>'"
  [cellTemplates]="cellTemplates"
  [rowActions]="rowActionsTplBinding"
  [localSort]="false"
  [initialSortKey]="'name'"          <!-- page-specific default -->
  [initialSortDir]="'asc'"
  (pageChange)="onPageChange($event)"
  (sortChange)="onSortChange($event)"
>
  <!-- Per-column rich-cell template(s) — only for columns that need HTML -->
  <ng-template #someTpl let-row>
    <!-- row: <Row> (post-TZ-104.4.2 strongly typed) -->
    <!-- {{ row.X }} — no cast needed -->
  </ng-template>

  <!-- Trailing row-actions slot -->
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
```

### 4.2 Class structure (copy verbatim)

```ts
/** Server-side pagination page size for /<endpoint>. */
const PAGE_SIZE = 50;

/** Backend accepts only these sortBy values (see <Service>ListParams). */
type SortKey = 'name' | 'createdAt' | '<other>';

@Component({
  selector: 'app-<page>-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    /* shared layout, dialog, toast, etc. */
    TableComponent,
  ],
  template: `...`,
})
export class <Page>Page implements OnInit {
  private readonly service = inject(<Page>Service);
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
   * Page-owned sort signals. Seeded to MATCH pi-table's internal
   * state after ngOnInit applies the `[initialSortKey]` +
   * `[initialSortDir]` bindings. Both halves of the lockstep cycle
   * start in sync — the mirror-event handler stays correct on the
   * very first click instead of needing a recovery cycle.
   *
   * <Strongly-typed SortKey union, e.g. 'name' | 'sku' | 'listPrice'>.
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
      ...(this.search.debouncedSearch()
        ? { search: this.search.debouncedSearch() }
        : {}),
      ...(sortKey && sortDir
        ? { sortBy: sortKey, sortOrder: sortDir }
        : {}),
    };
  });

  protected readonly listRes = httpResource<<Page>ListResponse>(() => ({
    url: `${this.baseUrl}/<endpoint>`,
    params: this.listParams(),
  }));

  protected readonly data = computed<<Row>[]>(
    () => this.listRes.value()?.items ?? [],
  );
  /**
   * Backend-reported total (canonical `{items, total, page, limit}`
   * envelope). NOT `data().length` (that would be the count of the
   * CURRENT page only). The pi-table pager uses this to compute
   * `totalPages = ceil(total / pageSize)` and render Prev/Next.
   */
  protected readonly total = computed<number>(
    () => this.listRes.value()?.total ?? 0,
  );
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly emptyMessage = computed(() =>
    this.searchQuery()
      ? 'Ничего не найдено.'
      : 'Нет <pluralized noun>. Нажмите «Создать», чтобы добавить первый.',
  );

  // ─── Column definitions (page-specific) ──────────────────────
  protected readonly cols: ColumnDef<<Row>>[] = [
    /* page-specific */
  ];

  /**
   * Template refs (resolved at view init, `static: true` → BEFORE
   * ngOnInit). Strongly typed `TemplateRef<{ $implicit: <Row> }>`
   * post-TZ-104.4.2. Pre-TZ-104.4.2 these were `TemplateRef<any>`.
   */
  @ViewChild('someTpl', { static: true })
  private readonly someTplRef!: TemplateRef<{ $implicit: <Row> }>;
  @ViewChild('rowActionsTpl', { static: true })
  private readonly rowActionsTplRef!: TemplateRef<{ $implicit: <Row> }>;

  /** Built in ngOnInit after ViewChild fields resolve. Stable reference. */
  protected cellTemplates: Record<string, TemplateRef<{ $implicit: <Row> }>> = {};
  /** Built in ngOnInit; null until then so pi-table defers the slot. */
  protected rowActionsTplBinding: TemplateRef<{ $implicit: <Row> }> | null = null;

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.search.destroy());

    // Build cell-template map + row-actions binding AFTER static
    // ViewChild fields resolve. Avoids TemplateRef<C> invariance
    // trap and Angular's signal-binding name-collision.
    this.cellTemplates = { /* page-specific */ };
    this.rowActionsTplBinding = this.rowActionsTplRef;
  }

  // ─── Cell template helpers (page-specific) ────────────────────
  // Strongly typed: `row: <Row>` (NOT `unknown` + `as <Row>` cast).
  protected someNameOf(row: <Row>): string | null { /* ... */ }

  // ─── Event handlers ───────────────────────────────────────────
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
   * lockstep regardless of starting-state divergence; see §8 R-5.
   */
  protected onSortChange(event: { key: string; dir: SortDirection }): void {
    const dir = event.dir;
    // Single boundary cast: pi-table emits `key: string`, page's
    // SortKey is a union. Cast at the event ingestion point; no
    // further casts needed downstream.
    this.sortKeySig.set(dir === null ? null : (event.key as SortKey));
    this.sortDirSig.set(dir === null ? null : dir);
    // Reset to first page on every sort change so users see the
    // first rows of the freshly ordered set.
    this.pageSig.set(1);
  }

  protected openCreate(): void { /* ... */ }
  protected openEdit(row: <Row>): void { /* ... */ }
  protected onDelete(row: <Row>): void { /* ... */ }
  protected reload(): void { this.listRes.reload(); }
}
```

### 4.3 Sort wiring (Pattern A specifics)

- `[localSort]="false"` is REQUIRED. The backend already sorted; pi-table sorting the page slice would re-order only the current 50 rows of an already-sorted result.
- `sortKeySig` and `sortDirSig` are seeded to MATCH pi-table's `[initialSortKey]` + `[initialSortDir]` values. E.g. if `initialSortKey="name"` and `initialSortDir="asc"`, then `sortKeySig.set('name')` and `sortDirSig.set('asc')` at construction.
- The `onSortChange` mirror handler updates both signals AND resets `pageSig` to 1. This is the round-2 lockstep fix — see §8 R-5.
- When pi-table's emit is `dir === null` (third click past desc clears the sort), the page sets `sortKeySig` to null and `sortDirSig` to null. The `listParams` computed then omits both `sortBy` and `sortOrder`, falling back to backend default ordering.

### 4.4 listParams computed (Pattern A specifics)

The single `computed()` collapses N signal reads into 1 httpResource fetch. Each dependent signal change within ONE CD cycle batches into a single refire (instead of N refires per N signal changes spread across multiple CD cycles).

```ts
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
```

httpResource reads `this.listParams()` and auto-refires when any of the 4 signals changes. Since they're all in one `computed`, Angular 20 schedules a single fetch per CD cycle.

---

## 5. Pattern B — Flat-array (client-side sort + filter + slice)

**Use when:** backend returns a flat `T[]` (no envelope). The page owns sort, filter, and pagination. Examples: `orders`, `contracts`.

**Canonical source:** `frontend/src/app/pages/orders/orders.page.ts` (post-TZ-104.4 `dd88b42`).

### 5.1 Template structure (copy verbatim)

```html
<app-pi-table
  [data]="paginatedRows()"
  [columns]="cols"
  [loading]="loading()"
  [total]="total()"
  [page]="page()"
  [pageSize]="pageSize"
  [emptyMessage]="emptyMessage()"
  [ariaLabel]="'Список <pluralized noun>'"
  [cellTemplates]="cellTemplates"
  [rowActions]="rowActionsTplBinding"
  [localSort]="false"
  [initialSortKey]="'date'"          <!-- page-specific default -->
  [initialSortDir]="'desc'"
  (pageChange)="onPageChange($event)"
  (sortChange)="onSortChange($event)"
>
  <!-- per-column rich-cell template(s) -->
  <ng-template #someTpl let-row>
    <!-- row: <Row> -->
  </ng-template>

  <!-- row-actions slot -->
  <ng-template #rowActionsTpl let-row>
    <app-pi-row-actions [row]="row" ... />
  </ng-template>
</app-pi-table>
```

Note: `[data]` is `paginatedRows()`, NOT `data()`. The pager reads `[total]` to know the total filtered count, and `[data]` is the slice for the current page.

### 5.2 Class structure (copy verbatim)

```ts
/** Client-side pagination page size for flat-array endpoint. */
const PAGE_SIZE = 20;

type SortKey = 'number' | 'date' | 'total' | 'status';

/**
 * Custom sort accessor per key. Different keys have different
 * "natural" sort semantics — `status` is the lifecycle cycle
 * below, `date` is chronological, `total` is numeric, `number` is
 * string-locale.
 */
function accessorFor(key: SortKey): (row: <Row>) => unknown {
  switch (key) {
    case 'status':
      return (r) => STATUS_CYCLE_INDEX[r.status] ?? -1;
    case 'date':
      return (r) => (r.date ? Date.parse(r.date) : null);
    case 'total':
      return (r) => r.total;
    case 'number':
      return (r) => r.number;
  }
}

/** Compare two values per the sign direction. */
function compareValues(av: unknown, bv: unknown, sign: 1 | -1): number {
  if (av == null && bv == null) return 0;
  if (av == null) return -1 * sign;
  if (bv == null) return 1 * sign;
  if (typeof av === 'number' && typeof bv === 'number') {
    return (av - bv) * sign;
  }
  return String(av).localeCompare(String(bv), 'ru') * sign;
}

@Component({
  /* same shape as Pattern A */
})
export class <Page>Page implements OnInit {
  // ... same DI as Pattern A ...

  protected readonly pageSize = PAGE_SIZE;

  /**
   * Page-owned sort signals. Seeded to MATCH pi-table's
   * `[initialSortKey]` + `[initialSortDir]` inputs (TZ-104.4.2).
   */
  private readonly sortKeySig = signal<SortKey | null>('date');
  private readonly sortDirSig = signal<'asc' | 'desc' | null>('desc');

  private readonly pageSig = signal<number>(1);
  protected readonly page = this.pageSig.asReadonly();

  private readonly search = createSearchState(300);
  protected readonly searchQuery = this.search.searchQuery;

  // NO listParams (backend doesn't paginate). listRes fetches the
  // full list once.
  protected readonly listRes = httpResource<<Row>[]>(() => ({
    url: `${this.baseUrl}/<endpoint>`,
  }));

  protected readonly data = computed<<Row>[]>(() => this.listRes.value() ?? []);
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  /**
   * Client-side filter: reactive computed reading `data()` and
   * `debouncedSearch()`. The previous source had a duplicate
   * `searchQuery` signal — replaced with `createSearchState` +
   * a single reactive filtered computed.
   */
  protected readonly filteredRows = computed<<Row>[]>(() => {
    const rows = this.data();
    const q = this.search.debouncedSearch().trim().toLowerCase();
    if (!q) return rows.slice();
    return rows.filter((r) => {
      // page-specific matcher
      const hay = [r.X, r.Y /* ... */].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });
  });

  /**
   * Filtered + sorted rows. Reactive computed reading BOTH
   * `filteredRows()` AND `sortKey/sortDir` — fixes the
   * `sort.sorted(this.filteredRows(), ...)` snapshot bug. Uses
   * custom accessor per key.
   */
  protected readonly sortedRows = computed<<Row>[]>(() => {
    const rows = this.filteredRows();
    const key = this.sortKeySig();
    if (!key) return rows;
    const sign = this.sortDirSig() === 'asc' ? 1 : -1;
    // sortKeySig is typed `SortKey | null`; after the guard above,
    // TS narrows to `SortKey`. No `as SortKey` cast needed.
    const accessor = accessorFor(key);
    return rows.slice().sort((a, b) => compareValues(accessor(a), accessor(b), sign));
  });

  /**
   * Total = full filtered+sorted length, NOT page slice. pi-table
   * derives `totalPages = ceil(total / pageSize)` and shows the
   * Prev/Next pager accordingly.
   */
  protected readonly total = computed<number>(() => this.sortedRows().length);

  /**
   * Page slice of the sorted+filtered list.
   *   start = (page-1) * pageSize   (0-indexed start)
   *   end   = start + pageSize       (exclusive end)
   */
  protected readonly paginatedRows = computed<<Row>[]>(() => {
    const all = this.sortedRows();
    const start = (this.pageSig() - 1) * PAGE_SIZE;
    return all.slice(start, start + PAGE_SIZE);
  });

  // ... columns, ViewChild, ngOnInit, handlers — same shape as Pattern A ...
}
```

### 5.3 Sort pipeline (Pattern B specifics)

The pipeline is `data() → filteredRows() → sortedRows() → paginatedRows()`. Each stage is a reactive `computed` so any upstream change cascades:

1. **`data()`** — the raw `listRes.value() ?? []` array.
2. **`filteredRows()`** — filters `data()` by `debouncedSearch()`. Returns the full filtered list (NOT a page slice).
3. **`sortedRows()`** — sorts `filteredRows()` by `sortKeySig`/`sortDirSig` using `accessorFor(key)` + `compareValues`. Returns the full filtered+SORTED list.
4. **`paginatedRows()`** — slices `sortedRows()` by `(page-1) * PAGE_SIZE .. + PAGE_SIZE`. This is what `[data]` binds to.
5. **`total()`** — `sortedRows().length` (post-filter, pre-slice). pi-table's pager derives `totalPages = ceil(total / pageSize)` from this.

`[localSort]="false"` is REQUIRED here too — otherwise pi-table would sort `paginatedRows()` (a single page slice) in place, producing nonsensical ordering on the third column click.

### 5.4 Custom sort accessors (Pattern B specifics)

Different keys have different "natural" sorts. The page owns a `accessorFor(key: SortKey)` function that returns the right extractor:

```ts
function accessorFor(key: SortKey): (row: Order) => unknown {
  switch (key) {
    case 'status':
      // Lifecycle cycle, NOT alphabetical. (See R-3 in §8.)
      return (r) => STATUS_CYCLE_INDEX[r.status] ?? -1;
    case 'date':
      // Chronological. null/undefined → bottom regardless of dir.
      return (r) => (r.date ? Date.parse(r.date) : null);
    case 'total':
      // Numeric, no formatting.
      return (r) => r.total;
    case 'number':
      // String-locale (Russian collation).
      return (r) => r.number;
  }
}
```

`compareValues(av, bv, sign)` handles `null` (bottom), numbers (subtract), and strings (locale-aware).

---

## 6. Cross-cutting TS strictness (post-TZ-104.4.2)

**The TZ-104.4.2 cleanup** (`dd88b42`) re-typed pi-table's `[cellTemplates]` to `Record<string, TemplateRef<{ $implicit: T }>>` so pages no longer need the `any` escape hatch. Strict typing flows through the entire page:

| Symbol | Pre-TZ-104.4.2 (anti-pattern) | Post-TZ-104.4.2 (canonical) |
|---|---|---|
| `@ViewChild` typing | `TemplateRef<any>` | `TemplateRef<{ $implicit: <Row> }>` |
| `cellTemplates` | `Record<string, TemplateRef<any>>` | `Record<string, TemplateRef<{ $implicit: <Row> }>>` |
| `rowActionsTplBinding` | `TemplateRef<any> \| null` | `TemplateRef<{ $implicit: <Row> }> \| null` |
| Helper signatures | `(row: unknown)` | `(row: <Row>)` |
| Helper internals | `const x = (row as <Row>).X` | `return row.X` (no cast) |
| `<ng-template let-row>` | `row: any` | `row: <Row>` (compile-time shape) |
| `onSortChange` boundary | `event.key as SortKey` (TWO casts) | `event.key as SortKey` (ONE cast at event ingestion) |

**The one allowed `as` cast** in any migrated page:

```ts
protected onSortChange(event: { key: string; dir: SortDirection }): void {
  // pi-table's sortChange output type is { key: string, ... } —
  // pi-table doesn't statically know about this page's `SortKey`
  // union, so a SINGLE boundary cast at the event ingestion point
  // is required. After this assignment, no further casts.
  this.sortKeySig.set(dir === null ? null : (event.key as SortKey));
  this.sortDirSig.set(dir === null ? null : dir);
}
```

The cast is required because pi-table's `sortChange` output type is `string` (generic), but the page's `sortKeySig` is `SortKey | null` (specific union). This is the ONLY `as` cast allowed in the page; everywhere else, types flow through.

---

## 7. Lifecycle hooks (both patterns)

```ts
ngOnInit(): void {
  // 1. Tear down debounce timer on component destroy (prevents
  //    setTimeout-after-destroy warnings).
  this.destroyRef.onDestroy(() => this.search.destroy());

  // 2. Load any lookup tables the page depends on (e.g. supplier
  //    lookup for materials; counterparty lookup for orders).
  this.someLookup.load();

  // 3. Build the cell-templates map + row-actions binding AFTER
  //    static @ViewChild fields resolve. This is the canonical
  //    resolution order: ViewChild with static:true resolves
  //    BEFORE ngOnInit; the page then assembles the maps.
  this.cellTemplates = { /* map ColumnDef.key → TemplateRef */ };
  this.rowActionsTplBinding = this.rowActionsTplRef;
}
```

**Three rules for lifecycle:**

1. **Tear down `search.destroy()`** in `destroyRef.onDestroy()`. Skipping this produces a "setState after destroy" warning when the user navigates away mid-debounce.
2. **Resolve `@ViewChild` with `{ static: true }`** so the refs are available BEFORE `ngOnInit` (vs the default `static: false` which resolves after, requiring a `setTimeout` dance or `afterRenderEffect` to populate `cellTemplates`).
3. **Build `cellTemplates` and `rowActionsTplBinding` in `ngOnInit`, not in the constructor.** Pre-`ngOnInit` would try to read the unresolved `@ViewChild` fields → undefined.

---

## 8. Common footguns (R-1 .. R-8)

These are the issues that bit the 3 migrated pages and the TZ-104.4 cleanup. Each is a real diff that future pages should NOT have to re-derive.

| # | Footgun | Symptom | Fix |
|---|---|---|---|
| **R-1** | `total = data().length` on envelope pages | Pager shows "1/1" because `data().length` is the current page count, not the canonical envelope total. | `total = computed(() => listRes.value()?.total ?? 0)`. Read from the envelope. |
| **R-2** | `total = data().length` on flat-array pages | Pager is "right" only if data fits in one page. With filter applied, the pager doesn't reflect the filtered set. | `total = computed(() => sortedRows().length)`. Read from POST-filter, PRE-slice. |
| **R-3** | Sorting `status` alphabetically on flat-array | `cancelled < confirmed < delivered < draft` — meaningless lifecycle ordering. | Use a `STATUS_CYCLE_INDEX: Record<Status, number>` and a custom `accessorFor('status')` that returns the cycle index. |
| **R-4** | Forgetting `[localSort]="false"` on envelope pages | pi-table re-sorts the page slice, but the backend already sorted. First click reverses visible order. Visible rows "skip" each refresh. | ALWAYS set `[localSort]="false"` for both Pattern A and Pattern B. |
| **R-5** | Page's `sortKeySig/sortDirSig` NOT seeded to match `[initialSortKey/Dir]` | First natural click: page's sort handler doesn't re-derive what pi-table is showing. The backend request uses stale sort. | Both halves of the lockstep cycle seeded identically at construction: `signal<SortKey \| null>('name')` matches `[initialSortKey]="'name'"`. The mirror-event handler stays correct on the first click without a recovery cycle. |
| **R-6** | `sort.sorted(this.filteredRows(), fn)` snapshot bug | `sort.sorted` (from `createSortState`) captures `filteredRows()` ONCE at construction as a static value. Re-runs only on `sortKey/sortDir` change, NOT on filter change. | Bind as a reactive `computed` that reads BOTH `filteredRows()` AND the sort signals, so any change triggers re-compute. Pattern B §5.2. |
| **R-7** | `cellTemplates` populated in constructor | `cellTemplates = { photo: this.photoTplRef }` before `ngOnInit` — `photoTplRef` is undefined because `@ViewChild({ static: true })` resolves AFTER the constructor. | Build `cellTemplates` in `ngOnInit` AFTER ViewChild fields resolve. |
| **R-8** | `(click)="$event.stopPropagation()"` missing on `<a [routerLink]>` inside a cell template | Row click handler also fires (and the page doesn't currently subscribe, so it's latent today). If a future consumer adds `(rowClick)`, the navigation would double-fire. | Add `(click)="$event.stopPropagation()"` to the `<a [routerLink]>` inside the cell template. See `products.page.ts` `nameTpl`. |

**Two latent issues that are now fixed by pi-table itself** (you don't need to worry about them, but historical context):

- **Cycle phase-shift** between pi-table's internal sort and the page's `sortKeySig/sortDirSig` — fixed by `[initialSortKey]/[initialSortDir]` inputs (TZ-104.4.2). Pre-104.4.2 required careful ngOnInit seeding AND effect coordination.
- **`any` escape hatch** in `TemplateRef` typing — fixed by re-typed `[cellTemplates]` (TZ-104.4.2). Pre-1044.2 required `TemplateRef<any>` everywhere.

---

## 9. Per-page commit body template

```text
feat(frontend): [TZ-104.3-batch-2-A.N] <page>.page.ts migrated to <app-pi-table>

<Brief summary line referencing the batch-2 sub-task + backend pattern>

Files (1-3):
  - frontend/src/app/pages/<page>/<page>.page.ts (migrated)
  - frontend/src/app/pages/<page>/<page>.spec.ts (updated, if exists)

Pattern: <Pattern A or B reference from §4 / §5 of docs/pi-table-migration-recipe.md>

Backend shape: <envelope | flat-array> (verified against <service file>)

Pre-flight (R-3 / R-4 / R-5): confirmed <service>.list() returns <envelope | flat-array>

Acceptance criteria verified:
  AC-1 inline <table> removed              →  grep -cE '<table' = 0
  AC-2 <app-pi-table> used                 →  grep -cE '<app-pi-table' ≥ 1
  AC-3 [total] + [page] + [pageSize] wired  →  grep -cE '\[total\]|\[page\]|\[pageSize\]|pageChange' ≥ 4
  AC-4 [initialSort*] bound                →  grep -cE '\[initialSortKey\]|\[initialSortDir\]' = 2
  AC-5 NO TemplateRef<any> / row: unknown  →  grep = 0
  AC-6 page's sortKeySig seeded to match   →  grep = 1 (SortKey type def + signal init)
  AC-7 listParams = computed (Pattern A)   →  grep -cE 'listParams = computed' = 1
  AC-8 ONE `as SortKey` cast in onSortChange  →  grep -cE 'as SortKey' = 1

Verification:
  pnpm exec tsc -p tsconfig.app.json --noEmit   →  exit 0
  pnpm exec jest --testPathPattern='<page>.spec'  →  exit 0 (if spec exists)
  code-reviewer-minimax-m3 verdict               →  SHIP-READY

Depends on: TZ-104.3-batch-2 spec (this doc's sibling) merged
Unlocks: TZ-104 §1.1 27-page wave closure (incremental)

<if .A-page, note:>
This commit migrates an envelope-pattern page (server-side paginated
+ sorted). Pattern mirror: docs/pi-table-migration-recipe.md §4.

<if .B-page, note:>
This commit migrates a flat-array-pattern page (client-side sort +
filter + slice). Pattern mirror: docs/pi-table-migration-recipe.md
§5.
```

---

## 10. Out of scope (this recipe does NOT cover)

- ❌ **Form-dialogs** (`<page>-form-dialog.component.ts`) — covered by TZ-104.5 (form primitives).
- ❌ **Detail pages** (`<page>-detail.page.ts`) — covered by TZ-83 Phase D.
- ❌ **Inventory dashboard** (`inventory-dashboard.page.ts`) — dashboard pattern, not list.
- ❌ **Kit showcase pages** (`/kit/*`) — kit-only reference.
- ❌ **Backend changes** — this recipe is read-only on the backend. Backend shape is verified, not modified.
- ❌ **pi-table itself** — this recipe is a CONSUMER pattern. Extending pi-table (e.g. new inputs, new outputs) is a separate spec; see TZ-104.3 Phase A-extension and TZ-104.4.2.
- ❌ **Re-classifying pages without backend-shape verification** — the §3 pre-flight gate is non-negotiable.

---

## 11. Cross-references

- `frontend/src/app/shared/ui/pi-table.component.ts` — the primitive. Read the JSDoc on `[cellTemplates]`, `[rowActions]`, `[localSort]`, `[initialSortKey]`, `[initialSortDir]` for full input/output contracts.
- `frontend/src/app/pages/materials/materials.page.ts` — Pattern A canonical (server-side, with rich cell templates for photo/supplier/dimensions). v1 of Pattern A; no client-side sort.
- `frontend/src/app/pages/products/products.page.ts` — Pattern A canonical (server-side sort+paginate, page-owned sort signals). Post-TZ-104.4.2 (the typed template cleanup).
- `frontend/src/app/pages/orders/orders.page.ts` — Pattern B canonical (flat-array, client-side sort+filter+slice, custom accessors for `status` cycle). Post-TZ-104.4.2.
- `tasks/TZ-104.3-batch-2.md` — the batch-2 spec that this recipe services.
- `tasks/TZ-104.4.md` — the parent spec that shipped the `[initialSortKey/Dir]` inputs + typed template cleanup.
- TZ-83 — original list-page architecture (pre-pi-table). The data layer is preserved by this recipe.

---

## 12. Versioning

| Date | Commit | Change |
|---|---|---|
| 2026-07-12 | (this doc) | ROUND-1 — initial extraction. Captures the post-TZ-104.4.2 canonical pattern. |
| (pending) | TZ-104.3-batch-2-A.1 | First batch-2 page migrated against this recipe. Reveals any oversights. |
| (pending) | TZ-104.3-batch-2-B.1 | First batch-2 flat-array page migrated. Reveals Pattern B oversights. |

If batch-2 finds a gap in this recipe, update this doc in the same commit as the page that exposed the gap. Don't fork — converge.

---

**End of pi-table migration recipe · Round 1 ready for batch-2 consumption.**
