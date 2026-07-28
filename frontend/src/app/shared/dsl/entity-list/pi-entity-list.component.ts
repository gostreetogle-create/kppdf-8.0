import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  TemplateRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { ColumnDef, SortDirection, TableComponent } from '../../ui/pi-table.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { extractErrorMessage } from '../../../core/silent-http';
import { EntityService } from '../entity/entity-service';

/**
 * Default shape for the list-query params bag. Pages that need extra
 * filters (e.g. `warehouseId`, `categoryId`) extend this with
 * intersection types or use the EntityService's default `P` directly.
 */
export type DefaultListParams = {
  page: number;
  limit: number;
  search?: string;
};

/**
 * External params accepted by the wrapper. Anything in `P` OTHER than
 * the wrapper-controlled fields (`page`, `limit`, `search`) — the
 * page owns the EXTERNAL filter shape, the wrapper owns pagination
 * + search + debounce + page-reset semantics.
 *
 * `Omit<P, keyof DefaultListParams>` strips the wrapper-controlled
 * keys from the input type so the page CANNOT silently override them
 * via `[params]` (e.g. setting `[params]="{ page: 99 }"` would have
 * raced with the wrapper's debounced state — tightened here to
 * `Omit<...>` to make that compile-time impossible).
 */
export type ExternalParams<P extends DefaultListParams> = Partial<
  Omit<P, keyof DefaultListParams>
>;

/**
 * Event payload for `(sortChange)` — mirrors pi-table's emit type.
 * `dir` is `null` when pi-table cleared the sort (third click past
 * desc — "unsorted" state).
 */
export interface SortChangeEvent {
  key: string;
  dir: SortDirection;
}

/**
 * `<app-pi-entity-list>` — generic list-page wrapper over `<app-pi-table>`
 * for canonical 5-CRUD entities built via `defineEntity`.
 *
 * Built-in safety / UX features:
 *  1. **Debounced search** — `300ms` (research-backed UX sweet spot).
 *  2. **Loading + error states** — `loading()` signal + `error()` inline alert.
 *  3. **Empty state** — inherited from `<app-pi-table>`'s default markup.
 *  4. **Create + row events** — `create` + `rowEdit` + `rowDelete` outputs.
 *  5. **Cross-resource composability** — page composes extra filter fields.
 *  6. **In-flight cancellation** — `Subject + switchMap` cancels pending HTTP.
 *  7. **Page reset on search** — any search change resets `page()` to `1`.
 *  8. **Initial sort passthrough** — `[initialSortKey/initialSortDir]`.
 *  9. **Per-column cell templates** — `[cellTemplates]` passthrough.
 * 10. **Manual fetch triggers** — deterministic in `fakeAsync` test zones.
 * 11. **Local sort opt-in** — `[localSort]="true"` for backends that ignore
 *     `?sortBy=`. Defaults to `false` (server-side sort via re-fetch).
 * 12. **Public readonly state signals** — `rows()`, `total()`, `loading()`
 *     exposed for page-level concerns (toolbar count hint, breadcrumbs).
 * 13. **`(sortChange)` output** — forwards pi-table's sort emit so pages
 *     with hybrid client-side sort can re-trigger fetch from a sort cycle
 *     click. Pages with server-side sort can ignore this output.
 * 14. **`(rowClick)` output** — forwards pi-table's row-click emit so
 *     pages can implement row-level navigation (e.g. `/modules/:id`)
 *     without re-implementing the click-stop propagation logic on every
 *     cell. The trailing action `<td>` already stops propagation via
 *     pi-table's rowActions slot, so action clicks don't bubble.
 *
 * Non-goals (out of scope):
 *  - Custom toolbar (extra buttons / filters). Use `[toolbarExtras]`
 *    ng-content slot to project your own markup AFTER the
 *    search + create + reload row.
 *  - Bulk-delete / multi-row actions.
 *  - Internal delete flow. Wrapper emits `(rowDelete)` and lets the
 *    page handle confirmation dialogs.
 *  - Auto-reactivity to `[params]` input changes.
 */
@Component({
  selector: 'app-pi-entity-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableComponent, ButtonComponent],
  template: `
    <div class="space-y-3">
      <div class="flex items-center gap-2 flex-wrap">
        @if (showSearch()) {
          <input
            type="search"
            [value]="searchInput()"
            (input)="onSearchInput($event)"
            [placeholder]="searchPlaceholder()"
            [attr.aria-label]="searchPlaceholder()"
            class="pi-input flex-1 min-w-[12rem]"
            data-test="entity-list-search"
          />
        }
        @if (canCreate() && showCreate()) {
          <app-pi-button
            variant="primary"
            size="sm"
            (click)="onCreateClick()"
            data-test="entity-list-create"
          >
            <span aria-hidden="true">+</span>
            <span class="ml-1">{{ createLabel() }}</span>
          </app-pi-button>
        }
        <button
          type="button"
          class="pi-icon-btn pi-focus-ring"
          (click)="reload()"
          aria-label="Перезагрузить"
          data-test="entity-list-reload"
        >
          <span aria-hidden="true">↻</span>
        </button>
        <ng-content select="[toolbarExtras]" />
      </div>

      @if (error(); as err) {
        <div
          role="alert"
          class="border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
          data-test="entity-list-error"
        >
          {{ err }}
        </div>
      }

      <div class="overflow-x-auto hairline rounded-sm">
        <app-pi-table
          [data]="rows()"
          [columns]="cols()"
          [loading]="loading()"
          [total]="total()"
          [page]="page()"
          [pageSize]="pageSize()"
          [emptyMessage]="emptyMessage()"
          [rowActions]="rowActionsTpl()"
          [cellTemplates]="cellTemplates()"
          [initialSortKey]="initialSortKey()"
          [initialSortDir]="initialSortDir()"
          [localSort]="localSort()"
          (pageChange)="onPageChange($event)"
          (sortChange)="onSortChange($event)"
          (rowClick)="rowClick.emit($event)"
          [attr.aria-label]="ariaLabel()"
        />
      </div>
    </div>
  `,
})
export class PiEntityListComponent<
  T extends { _id?: string },
  P extends DefaultListParams = DefaultListParams,
> implements OnInit
{
  // ─── Required inputs ─────────────────────────────────────────────
  readonly service = input.required<EntityService<T, P>>();
  readonly cols = input.required<ColumnDef<T>[]>();
  readonly ariaLabel = input.required<string>();

  // ─── Optional inputs ─────────────────────────────────────────────
  readonly params = input<ExternalParams<P>>({});
  readonly pageSize = input<number>(50);
  readonly searchPlaceholder = input<string>('Поиск…');
  readonly emptyMessage = input<string>('Нет данных для отображения.');
  readonly canCreate = input<boolean>(true);
  readonly showCreate = input<boolean>(true);
  readonly showSearch = input<boolean>(true);
  readonly createLabel = input<string>('Создать');
  readonly rowActionsTpl = input<TemplateRef<{ $implicit: T }> | null>(null);
  readonly cellTemplates = input<
    Record<string, TemplateRef<{ $implicit: T }>>
  >({});
  readonly debounceMs = input<number>(300);
  readonly initialSearch = input<string>('');
  readonly initialSortKey = input<string | null>(null);
  readonly initialSortDir = input<SortDirection>(null);
  /** Local sort opt-in (default false, server-sort). */
  readonly localSort = input<boolean>(false);

  // ─── Outputs ─────────────────────────────────────────────────────
  readonly create = output<void>();
  readonly rowEdit = output<T>();
  readonly rowDelete = output<T>();
  /**
   * Sort change forwarded from `<app-pi-table>`. Emitted when the
   * user clicks a sortable column header. Pages with hybrid
   * client-side sort (where the backend doesn't support `?sortBy=`)
   * can use this to drive their own sort key/dir signals + reload.
   * Pages with server-side sort can ignore this output.
   */
  readonly sortChange = output<SortChangeEvent>();
  /**
   * Row click forwarded from `<app-pi-table>`. Emitted when the user
   * clicks any non-action cell. Pages can use this to implement row-
   * level navigation (e.g. `/modules/:id`). Action column clicks are
   * already stopPropagation'd by pi-table.
   */
  readonly rowClick = output<T>();

  // ─── Internal state ──────────────────────────────────────────────
  private readonly destroyRef = inject(DestroyRef);

  protected readonly searchInput = signal<string>(this.initialSearch());
  protected readonly debouncedSearch = signal<string>(this.initialSearch());

  protected readonly page = signal<number>(1);

  readonly rows = signal<T[]>([]);
  readonly total = signal<number>(0);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  private readonly fetchParams = computed<P>(() => ({
    ...(this.params() as Record<string, unknown>),
    ...(this.debouncedSearch() ? { search: this.debouncedSearch() } : {}),
    page: this.page(),
    limit: this.pageSize(),
  } as unknown as P));

  private readonly searchSubject = new Subject<string>();
  private readonly fetchTrigger = new Subject<P>();

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(this.debounceMs()),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        this.debouncedSearch.set(value);
        this.page.set(1);
        this.fetchTrigger.next(this.fetchParams());
      });

    this.fetchTrigger
      .pipe(
        switchMap((params) => {
          this.loading.set(true);
          this.error.set(null);
          return this.service().list(params);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        if (!res.ok) {
          this.error.set(extractErrorMessage(res.error));
          this.rows.set([]);
          this.total.set(0);
          this.loading.set(false);
          return;
        }
        this.error.set(null);
        this.rows.set(res.data.items ?? []);
        this.total.set(res.data.total ?? 0);
        this.loading.set(false);
      });
  }

  ngOnInit(): void {
    this.fetchTrigger.next(this.fetchParams());
  }

  // ─── Event handlers ──────────────────────────────────────────────
  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchInput.set(value);
    this.searchSubject.next(value);
  }

  protected onPageChange(target: number): void {
    this.page.set(target);
    this.fetchTrigger.next(this.fetchParams());
  }

  protected onSortChange(event: SortChangeEvent): void {
    // Forward pi-table's sortChange to the page; the page decides
    // whether to mutate its own sortKeySig/sortDirSig + reload or
    // ignore (server-side sort cases).
    this.sortChange.emit(event);
  }

  protected onCreateClick(): void {
    this.create.emit();
  }

  /**
   * Force re-fetch — public so parent pages can call this
   * programmatically (e.g. after a dialog save or external filter
   * change). Pushes the current `fetchParams` to `fetchTrigger`.
   */
  reload(): void {
    this.fetchTrigger.next(this.fetchParams());
  }
}