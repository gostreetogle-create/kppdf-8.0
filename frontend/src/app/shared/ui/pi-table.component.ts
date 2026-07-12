import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export type SortDirection = 'asc' | 'desc' | null;

export interface ColumnDef<T> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: string;
  format?: (row: T) => string;
  cellClass?: string;
  accessor?: (row: T) => unknown;
  /** Applies `tabular-nums` to `<td>` for monospace numeric alignment. */
  numeric?: boolean;
  /**
   * TZ-104.3 — sticky cell behaviour. `'left'` anchors the cell to the
   * table's left edge (typical for ID/name columns), `'right'` to the
   * right edge (typical for action clusters), `false` (default) leaves
   * the cell flowing normally. Renders with `sticky`, `bg-paper`, and
   * `z-10` so content scrolling under the sticky column is masked.
   */
  sticky?: 'left' | 'right' | false;
}

export type SelectionMode = 'none' | 'single' | 'multi';

/**
 * Paper & Ink data table primitive.
 *
 * Features (TZ-104.3 Phase A):
 * - Sortable column headers (click-toggle asc → desc → null).
 * - Optional single/multi row selection with header checkbox.
 * - Optional expanded row content via TemplateRef.
 * - Per-column sticky cells (`sticky: 'left' | 'right' | false`).
 * - Row action slot via TemplateRef (`[rowActions]`).
 * - Server-side pagination (`total` + `page` + `pageSize` → `(pageChange)`).
 * - Loading skeleton (5 pulsing rows when `loading=true`).
 * - Empty state via `<app-pi-empty-state>` with `emptyMessage` override.
 * - Footer slot for `<app-pi-pagination>`-style paginators.
 *
 * Standalone, OnPush, signal-based. NO Material, NO shadows.
 */
@Component({
  selector: 'app-pi-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  template: `
    <table
      role="table"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-busy]="loading() ? 'true' : null"
      class="w-full border-collapse text-sm"
    >
      <thead class="hairline-b">
        <tr>
          @if (selectionMode() !== 'none') {
            <th class="w-10 py-3 px-3 text-left">
              @if (selectionMode() === 'multi') {
                <input
                  type="checkbox"
                  [checked]="isAllSelected()"
                  [indeterminate]="isSomeSelected() && !isAllSelected()"
                  (change)="toggleAll($event)"
                  name="table-select-all"
                  aria-label="Выбрать всё"
                  class="align-middle"
                />
              }
            </th>
          }
          @for (col of columns(); track col.key) {
            <th
              class="eyebrow py-3 px-3 select-none"
              [class.text-left]="(col.align ?? 'left') === 'left'"
              [class.text-right]="col.align === 'right'"
              [class.text-center]="col.align === 'center'"
              [class.cursor-pointer]="col.sortable"
              [class.sticky]="col.sticky"
              [class.left-0]="col.sticky === 'left'"
              [class.right-0]="col.sticky === 'right'"
              [class.z-10]="col.sticky"
              [class.bg-paper]="col.sticky"
              [style.width]="col.width ?? null"
              (click)="col.sortable && onSort(col.key)"
            >
              <span>{{ col.label }}</span>
              @if (col.sortable) {
                <span class="ml-1 font-mono text-[10px] text-muted-foreground" aria-hidden="true">
                  {{ sortIcon(col.key) }}
                </span>
              }
            </th>
          }
          @if (rowActions()) {
            <th
              class="eyebrow py-3 px-3 text-right w-24"
              [class.sticky]="true"
              [class.right-0]="true"
              [class.z-10]="true"
              [class.bg-paper]="true"
            >
              <span class="sr-only">Действия</span>
            </th>
          }
        </tr>
      </thead>
      <tbody>
        @if (loading()) {
          @for (skel of skeletonRows; track $index) {
            <tr class="hairline-b" data-test="table-skeleton-row">
              <td
                [attr.colspan]="visibleColumns()"
                class="py-3 px-3"
              >
                <div class="h-3 bg-paper-2 rounded-sm animate-pulse w-full"></div>
              </td>
            </tr>
          }
        } @else {
          @for (row of sortedData(); track rowKeyOf(row, $index)) {
            <tr
              class="hairline-b hover:bg-paper-2 transition-colors cursor-pointer"
              (click)="onRowClick(row)"
              [attr.data-test]="'table-row-' + rowKeyOf(row, $index)"
            >
              @if (selectionMode() !== 'none') {
                <td class="py-3 px-3 align-middle" (click)="$event.stopPropagation()">
                  <input
                    type="checkbox"
                    [attr.id]="'table-select-' + rowKeyOf(row, $index)"
                    [attr.name]="'table-select-' + rowKeyOf(row, $index)"
                    [checked]="isRowSelected(row)"
                    (change)="toggleRow(row, $event)"
                    aria-label="Выбрать строку"
                  />
                </td>
              }
              @for (col of columns(); track col.key) {
                <td
                  class="py-3 px-3 align-top"
                  [class.tabular-nums]="col.numeric"
                  [class.text-right]="col.align === 'right'"
                  [class.text-center]="col.align === 'center'"
                  [class.sticky]="col.sticky"
                  [class.left-0]="col.sticky === 'left'"
                  [class.right-0]="col.sticky === 'right'"
                  [class.z-10]="col.sticky"
                  [class.bg-paper]="col.sticky"
                  [class]="col.cellClass ?? ''"
                >
                  @if (cellTemplates()[col.key]; as tpl) {
                    <ng-container *ngTemplateOutlet="tpl; context: { $implicit: row }" />
                  } @else {
                    {{ formatCell(col, row) }}
                  }
                </td>
              }
              @if (rowActions()) {
                <td
                  class="py-3 px-3 align-top text-right"
                  (click)="$event.stopPropagation()"
                  data-test="row-actions-cell"
                >
                  <ng-container
                    *ngTemplateOutlet="rowActions()!; context: { $implicit: row }"
                  />
                </td>
              }
            </tr>
            @if (expandedRow()) {
              <tr>
                <td
                  [attr.colspan]="visibleColumns() + (rowActions() ? 1 : 0)"
                  class="bg-paper-2 p-0 hairline-b"
                >
                  <ng-container
                    *ngTemplateOutlet="expandedRow()!; context: { $implicit: row }"
                  />
                </td>
              </tr>
            }
          }
          @if (sortedData().length === 0) {
            <tr data-test="empty-state-row">
              <td
                [attr.colspan]="visibleColumns() + (rowActions() ? 1 : 0)"
                class="py-12 px-3 text-center text-muted-foreground"
              >
                @if (emptyTemplate()) {
                  <ng-container
                    *ngTemplateOutlet="emptyTemplate()!"
                    data-test="custom-empty"
                  />
                } @else {
                  <div
                    class="max-w-sm mx-auto p-6 pi-dashed-panel flex flex-col items-center gap-1"
                    data-test="default-empty"
                  >
                    <span class="eyebrow text-sunrise-warm">00</span>
                    <span class="text-sm">{{ emptyMessage() }}</span>
                  </div>
                }
              </td>
            </tr>
          }
        }
      </tbody>
    </table>
    <div class="hairline-t px-3 py-3 flex items-center justify-between gap-2">
      <div class="text-xs text-muted-foreground">
        <ng-content select="[caption]" />
      </div>
      <div class="flex items-center gap-2">
        @if (showPager()) {
          <span class="text-xs text-muted-foreground tabular-nums" data-test="pager-info">
            {{ pageRangeStart() }}–{{ pageRangeEnd() }} из {{ total() }}
          </span>
          <button
            type="button"
            class="pi-icon-btn pi-focus-ring"
            [disabled]="page() <= 1"
            (click)="goToPage(page() - 1)"
            aria-label="Предыдущая страница"
            data-test="pager-prev"
          >
            <span aria-hidden="true">←</span>
          </button>
          <span
            class="text-xs tabular-nums"
            data-test="pager-page"
            aria-label="Текущая страница"
          >
            {{ page() }} / {{ totalPages() }}
          </span>
          <button
            type="button"
            class="pi-icon-btn pi-focus-ring"
            [disabled]="page() >= totalPages()"
            (click)="goToPage(page() + 1)"
            aria-label="Следующая страница"
            data-test="pager-next"
          >
            <span aria-hidden="true">→</span>
          </button>
        }
        <ng-content select="[footer]" />
      </div>
    </div>
  `,
})
export class TableComponent<T extends Record<string, unknown>> implements OnInit {
  readonly data = input<T[]>([]);
  readonly columns = input.required<ColumnDef<T>[]>();
  readonly selectionMode = input<SelectionMode>('none');
  readonly ariaLabel = input<string>('Таблица');
  readonly expandedRow = input<TemplateRef<{ $implicit: T }> | null>(null);

  // ─── TZ-104.3 Phase A additions ────────────────────────────────────
  /**
   * Optional row-actions template. Rendered as a trailing right-aligned
   * `<td>` for every row. Receives `$implicit: T`. Stop event propagation
   * is automatically wired on the wrapper `<td>` so clicks on action
   * buttons don't bubble to the row (which would also fire `rowClick`).
   * Typical use: `<ng-template #rowActions let-row><app-pi-row-actions [row]="row" .../></ng-template>`.
   */
  readonly rowActions = input<TemplateRef<{ $implicit: T }> | null>(null);

  /**
   * TZ-104.3 Phase B + TZ-104.4.2 — per-column rich-content templates.
   * Map of `ColumnDef.key → TemplateRef<{ $implicit: T }>`. When a
   * column has a matching entry, the cell is rendered via
   * `*ngTemplateOutlet` with `{ $implicit: row }` instead of the
   * textual `formatCell()` result.
   *
   * Use this for HTML-rich cells that can't be expressed as a string
   * (e.g. `<img>` thumbnails, `<a [routerLink]>` row-open links,
   * formatted dimension glyphs). Columns without an entry fall
   * through to the existing textual render path — backward compat.
   *
   * TZ-104.4.2 re-typed this from `TemplateRef<{ $implicit: unknown }>`
   * to `TemplateRef<{ $implicit: T }>` so the keyof T type from
   * `ColumnDef<T>['key']` flows through to the templates. Page-side
   * bindings now have compile-time checking without needing the
   * `any` escape hatch (materials/orders/products pre-TZ-104.4.2).
   *
   * Typical use:
   * ```html
   * <app-pi-table [columns]="cols" [cellTemplates]="tpls" ...>
   *   <ng-template #photoTpl let-row>
   *     <img [src]="row.thumbnailUrl" />
   *   </ng-template>
   * </app-pi-table>
   * ```
   * Where `tpls: Record<string, TemplateRef<{ $implicit: T }>>` and
   * `tpls['photo'] = photoTpl` matches `cols[0].key = 'photo'`.
   */
  readonly cellTemplates = input<
    Record<string, TemplateRef<{ $implicit: T }>>
  >({});

  /**
   * TZ-104.3 Phase B — controls sort ownership.
   *
   * When `true` (default), pi-table sorts the visible `data()` array
   * internally based on column clicks + initial null sort. Backward-
   * compatible with existing consumers.
   *
   * When `false`, `sortedData()` returns `data()` unchanged — pi-table
   * does NOT sort the visible rows. Header arrows still flip on click
   * and `sortChange` still emits — but the data order is whatever the
   * parent passed in. Use this for **server-side sort**: parent
   * listens to `(sortChange)`, updates its own sort signals, and
   * re-fetches via httpResource (Angular 20 auto-refires on signal
   * deps). This avoids sorting only the current 50-row page while
   * pretending the whole dataset is sorted.
   */
  readonly localSort = input<boolean>(true);
  /**
   * Total row count for server-side pagination. When 0 (default),
   * pagination footer is hidden. When > pageSize(), a minimal pager
   * (Prev / page / Next + range label) is auto-rendered.
   */
  readonly total = input<number>(0);
  /**
   * Current page (1-indexed). Parent syncs this when (pageChange) fires.
   * Defaults to 1 — meaningful only when `total() > pageSize()`.
   */
  readonly page = input<number>(1);
  /** Items per page. Defaults to 20. */
  readonly pageSize = input<number>(20);
  /** Fires when the user clicks Prev / Next in the auto pager. */
  readonly pageChange = output<number>();
  /**
   * When true, the table body renders 5 animated skeleton rows instead
   * of the data rows (sortedData is bypassed). Sorts are preserved but
   * the user cannot interact with rows until `loading` flips back to
   * false. ARIA: `aria-busy="true"` on the `<table>`.
   */
  readonly loading = input<boolean>(false);
  /**
   * Override the default empty-row message. Default:
   * 'Нет данных для отображения.'. Ignored when an `[emptyTemplate]`
   * is provided (since custom templates own their message).
   */
  readonly emptyMessage = input<string>('Нет данных для отображения.');

  /**
   * TZ-104.3 Round 4 — typed TemplateRef for the empty-state slot.
   * Renders via `*ngTemplateOutlet` when supplied. Wins over the
   * inline default-empty markup (which uses `emptyMessage`).
   *
   * Why this instead of `<ng-content select="[empty]">` projection?
   *  1. Angular's `<ng-content>` does NOT render inline fallback
   *     content (Round 1 finding).
   *  2. Angular's `contentChild('[empty]')` signal-based query does
   *     NOT fire synchronously with the first template render in
   *     test fixtures (Rounds 2-3 finding — default-empty flashed
   *     one CD cycle even when a `[empty]` block was provided).
   *  3. A `TemplateRef` is a synchronous, typed, by-reference value
   *     — no projection timing surface. Templates render immediately
   *     when `*ngTemplateOutlet` evaluates the input signal.
   *
   * Typical use:
   * ```html
   * <app-pi-table ... [emptyTemplate]="emptyTpl">
   *   <ng-template #emptyTpl>
   *     <div>...custom empty markup...</div>
   *   </ng-template>
   * </app-pi-table>
   * ```
   */
  readonly emptyTemplate = input<TemplateRef<unknown> | null>(null);

  /**
   * TZ-104.4.2 — initial sort key. One-shot seed for pi-table's
   * internal sortKeySig. When non-null, ngOnInit syncs the internal
   * signal before the first template render (avoiding the
   * `effect()`-delay footgun of post-first-CD signal writes).
   *
   * Behavior:
   *  - First click on a *different* column: cycle starts fresh
   *    (pi-table emits the new key/dir, just like before).
   *  - First click on the *same* column: cycle continues from the
   *    pre-seeded dir (asc → desc → null from the seeded 'asc';
   *    or desc → null → asc from the seeded 'desc').
   *
   * Strongly typed to `keyof T & string` so the compiler catches
   * typos like `initialSortKey="naem"` that would otherwise silently
   * produce a non-functional arrow.
   *
   * Caveat — page-side state must MIRROR pi-table's seeded state:
   *  - If a page owns its own sort (orders/products post-TZ-104.3
   *    migration), the page's `sortKeySig/sortDirSig` must be seeded
   *    to the SAME values; otherwise the mirror-event handler from
   *    the lockstep fix will diverge from pi-table's internal on the
   *    very first natural click. See materials/orders/products
   *    docblocks for examples.
   */
  readonly initialSortKey = input<keyof T & string | null>(null);

  /**
   * TZ-104.4.2 — initial sort direction. Pairs with `initialSortKey`
   * to seed pi-table's internal sortDirSig. When `null`
   * (default), pi-table starts in a "no sort" state — same as if
   * `initialSortKey` were also null. The seeded arrow display is
   * determined by whether `initialSortKey` and `initialSortDir`
   * are both non-null.
   */
  readonly initialSortDir = input<SortDirection>(null);

  // ─── Existing outputs (preserved) ──────────────────────────────────
  readonly rowClick = output<T>();
  readonly sortChange = output<{ key: string; dir: SortDirection }>();
  readonly selectionChange = output<T[]>();

  // ─── Lifecycle (TZ-104.4.2) ───────────────────────────────────────────
  /**
   * One-shot sync of internal sort signals from `initialSortKey` /
   * `initialSortDir` inputs. Runs once after inputs are bound and
   * BEFORE the first template render, so the very first frame shows
   * the seeded sort arrow instead of flashing a "no sort" state on
   * the way to the seeded value.
   *
   * Why ngOnInit instead of `effect()`? `effect()` is microtask-
   * deferred — it doesn't fire until *after* the first render.
   * That produces a CD-1-to-CD-2 arrow flash that breaks the
   * "initial" UX promise. ngOnInit is synchronous and fires before
   * the first template evaluation.
   */
  ngOnInit(): void {
    const initKey = this.initialSortKey();
    const initDir = this.initialSortDir();
    if (initKey !== null) this.sortKeySig.set(initKey);
    if (initDir !== null) this.sortDirSig.set(initDir);
  }

  // ─── Internal state (signals) ──────────────────────────────────────
  private readonly sortKeySig = signal<string | null>(null);
  private readonly sortDirSig = signal<SortDirection>(null);
  private readonly selectedKeys = signal<Set<string>>(new Set());

  /** Fixed number of skeleton rows shown while loading. */
  protected readonly skeletonRows = [0, 1, 2, 3, 4] as const;

  // ─── Computed ──────────────────────────────────────────────────────
  readonly sortKey = computed(() => this.sortKeySig());
  readonly isAllSelected = computed(() => {
    const data = this.data();
    if (data.length === 0) return false;
    const selected = this.selectedKeys();
    return data.every((row) => selected.has(this.keyOf(row)));
  });
  readonly isSomeSelected = computed(() => {
    const data = this.data();
    const selected = this.selectedKeys();
    return data.some((row) => selected.has(this.keyOf(row))) && !this.isAllSelected();
  });

  /**
   * TZ-104.3 — number of visible data + selection columns (excludes
   * the trailing actions column, which is added separately in colspan
   * calculations). Used for colspan on empty / expanded rows.
   */
  readonly visibleColumns = computed(
    () =>
      this.columns().length + (this.selectionMode() !== 'none' ? 1 : 0),
  );

  /** Total page count for server-side pagination. */
  readonly totalPages = computed(() => {
    const total = this.total();
    const pageSize = Math.max(1, this.pageSize());
    return Math.max(1, Math.ceil(total / pageSize));
  });

  /** Whether the auto pager should render (server-side mode + >1 page). */
  readonly showPager = computed(
    () => this.total() > 0 && this.totalPages() > 1,
  );

  /** Index of first row on current page (1-indexed), for pager range label. */
  readonly pageRangeStart = computed(() => {
    const page = this.page();
    const pageSize = Math.max(1, this.pageSize());
    return Math.max(1, (page - 1) * pageSize + 1);
  });

  /** Index of last row on current page (clamped to total). */
  readonly pageRangeEnd = computed(() => {
    const start = this.pageRangeStart();
    const end = start + Math.max(1, this.pageSize()) - 1;
    return Math.min(end, this.total());
  });

  readonly sortedData = computed<T[]>(() => {
    if (!this.localSort()) return this.data().slice();
    const data = this.data().slice();
    const key = this.sortKeySig();
    const dir = this.sortDirSig();
    if (!key || !dir) return data;
    const cols = this.columns();
    const col = cols.find((c) => c.key === key);
    if (!col) return data;
    const accessor = col.accessor ?? ((row: T) => row[col.key]);
    const sign = dir === 'asc' ? 1 : -1;
    return data.sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av == null && bv == null) return 0;
      if (av == null) return -1 * sign;
      if (bv == null) return 1 * sign;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sign;
      return String(av).localeCompare(String(bv), 'ru') * sign;
    });
  });

  // ─── Methods ───────────────────────────────────────────────────────
  rowKeyOf(row: T, index: number): string {
    return this.keyOf(row) ?? `idx-${index}`;
  }

  onSort(key: string): void {
    const currentDir = this.sortDirSig();
    const currentKey = this.sortKeySig();
    let nextDir: SortDirection = 'asc';
    if (currentKey === key) {
      if (currentDir === 'asc') nextDir = 'desc';
      else if (currentDir === 'desc') nextDir = null;
    }
    this.sortKeySig.set(nextDir === null ? null : key);
    this.sortDirSig.set(nextDir);
    this.sortChange.emit({ key, dir: nextDir });
  }

  sortIcon(key: string): string {
    if (this.sortKeySig() !== key) return '↕';
    return this.sortDirSig() === 'asc' ? '↑' : '↓';
  }

  isRowSelected(row: T): boolean {
    return this.selectedKeys().has(this.keyOf(row));
  }

  toggleRow(row: T, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const key = this.keyOf(row);
    const mode = this.selectionMode();
    const next = new Set(this.selectedKeys());
    if (mode === 'single') {
      next.clear();
      if (checked) next.add(key);
    } else if (mode === 'multi') {
      if (checked) next.add(key);
      else next.delete(key);
    }
    this.selectedKeys.set(next);
    this.emitSelectionChange();
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const data = this.data();
    const next = new Set<string>();
    if (checked) data.forEach((row) => next.add(this.keyOf(row)));
    this.selectedKeys.set(next);
    this.emitSelectionChange();
  }

  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  /**
   * Pager navigation. Clamps the target page to [1, totalPages] then
   * emits via `pageChange`. Parent listens, fetches new data, updates
   * `[page]` input.
   */
  goToPage(target: number): void {
    const clamped = Math.max(1, Math.min(target, this.totalPages()));
    if (clamped === this.page()) return;
    this.pageChange.emit(clamped);
  }

  formatCell(col: ColumnDef<T>, row: T): string {
    if (col.format) return col.format(row);
    const val = col.accessor ? col.accessor(row) : row[col.key];
    if (val == null) return '';
    return String(val);
  }

  private keyOf(row: T): string {
    const k = (row as { id?: string }).id;
    return k ?? JSON.stringify(row);
  }

  private emitSelectionChange(): void {
    const data = this.data();
    const selectedSet = this.selectedKeys();
    const selected = data.filter((row) => selectedSet.has(this.keyOf(row)));
    this.selectionChange.emit(selected);
  }
}
