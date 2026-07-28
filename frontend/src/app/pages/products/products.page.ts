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
import { RouterLink, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { pluralize, formatPrice } from '../../shared/util/format';
import { ColumnDef } from '../../shared/ui/pi-table.component';
import {
  PiEntityListComponent,
  SortChangeEvent,
  DefaultListParams,
} from '../../shared/dsl/entity-list/pi-entity-list.component';
import {
  EntityService,
  type PaginatedResponse,
} from '../../shared/dsl/entity/entity-service';
import {
  Product,
  ProductsService,
} from '../../shared/services/products.service';
import { ProductFormDialogComponent } from './product-form-dialog.component';

/** Server-side pagination page size for /products endpoint. */
const PAGE_SIZE = 50;

/** Backend accepts these sortBy values (see ProductsListParams.sortBy). */
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
 * TZ-232.D sentinel #1 — products migrated to <pi-entity-list> wrapper.
 *
 * Backend /products endpoint returns canonical paginated
 * `{items, total, page, limit}` response AND honors server-side
 * `?sortBy=&sortOrder=` query params. Migration uses an
 * "Approach D-inspired" LOCAL ADAPTER (EntityService-shaped wrapper)
 * that merges page-level sort signals (`sortKeySig/sortDirSig`) into
 * the params passed to the underlying service.list() call —
 * because wrapper's `[params]` input is reserved for wrapper-
 * controlled filter shapes and does NOT accept sort params (sort
 * flows through the `(sortChange)` output cycle instead).
 *
 * Architecture summary:
 *  - `httpResource` removed → wrapper drives fetches via RxJS pipeline
 *  - `localAdapter: EntityService<Product, DefaultListParams>` is
 *    a synthesized adapter whose `list(params)` merges
 *    `{sortBy, sortOrder}` (from page's sortKeySig/sortDirSig)
 *    into the params dispatched to ProductsService.list().
 *  - `(sortChange)` output fired by the wrapper (when the user clicks
 *    a header) updates `sortKeySig/sortDirSig` via the mirror
 *    handler; an effect on those signals calls `listRef?.reload()`
 *    to drive the wrapper's fetch pipeline with the new sort.
 *  - `[showSearch] default true` (backend supports `?search=`)
 *  - `[localSort]="false"` (backend sorts; pi-table does NOT
 *    re-sort the visible slice)
 *  - `[initialSortKey]="'name'" + [initialSortDir]="'asc'"` mirrors
 *    page-side signal seed for first-load lockstep.
 *  - **Count hint** in `toolbarExtras` via `viewChild.listRef().total()`
 *  - **Cell template for `name`** renders routerLink to `/products/:id`
 *    with click stopPropagation so future `(rowClick)` doesn't fire.
 *  - **`LucideAngularModule` + `RefreshCw`** removed — wrapper has
 *    its own `↻` glyph.
 */
@Component({
  selector: 'app-products-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    PiPageHeaderComponent,
    PiRowActionsComponent,
    ButtonComponent,
    PiEntityListComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · продукция"
      title="Продукция"
      description="Каталог готовой продукции: товары, услуги, работы. Цены, себестоимость, габариты."
    />

    <app-pi-entity-list
      #list
      [service]="localAdapter"
      [cols]="cols"
      ariaLabel="Список продукции"
      [pageSize]="PAGE_SIZE"
      [searchPlaceholder]="'Поиск по названию или SKU…'"
      [localSort]="false"
      [initialSortKey]="'name'"
      [initialSortDir]="'asc'"
      emptyMessage="Нет продукции. Нажмите «Создать», чтобы добавить первую."
      [cellTemplates]="cellTemplates()"
      [rowActionsTpl]="rowActionsTplBinding()"
      (create)="openCreate()"
      (rowEdit)="openEdit($event)"
      (rowDelete)="onDelete($event)"
      (sortChange)="onSortChange($event)"
    >
      <!-- ───── Name cell (routerLink to detail page) ───── -->
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

      <!-- Page-level count hint -->
      <span
        hint
        toolbarExtras
        class="text-xs text-muted-foreground"
        data-test="products-count"
      >
        {{ listTotal() }} {{ totalLabel(listTotal()) }}
      </span>
    </app-pi-entity-list>
  `,
})
export class ProductsPage {
  private readonly service = inject(ProductsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly PAGE_SIZE = PAGE_SIZE;

  // ─── Sort signals (page-owned, mirror pi-table emit) ──────────────
  /**
   * Seeded to 'name' / 'asc' to MATCH pi-table's internal state
   * after ngOnInit applies the `[initialSortKey/initialSortDir]`
   * bindings (TZ-104.4.2 lockstep). Page-owned state stays in sync
   * from frame 1.
   */
  protected readonly sortKeySig = signal<SortKey | null>('name');
  protected readonly sortDirSig = signal<'asc' | 'desc' | null>('asc');

  /** Wrapper ref — used for `reload()` after sort change + reading `total()` for count hint. */
  private readonly listRef = viewChild<PiEntityListComponent<Product>>('list');

  protected readonly listTotal = computed<number>(() => this.listRef()?.total() ?? 0);

  // ─── Template refs (viewChild signal — modern Angular 20) ──────────
  private readonly nameTplRef = viewChild<TemplateRef<{ $implicit: Product }>>(
    'nameTpl',
  );
  private readonly rowActionsTplRef = viewChild<TemplateRef<{ $implicit: Product }>>(
    'rowActionsTpl',
  );

  protected readonly cellTemplates = computed<
    Record<string, TemplateRef<{ $implicit: Product }>>
  >(() => {
    const result: Record<string, TemplateRef<{ $implicit: Product }>> = {};
    const tpl = this.nameTplRef();
    if (tpl) {
      result['name'] = tpl;
    }
    return result;
  });

  protected readonly rowActionsTplBinding = computed<
    TemplateRef<{ $implicit: Product }> | null
  >(() => this.rowActionsTplRef() ?? null);

  // ─── Local adapter (Approach D-inspired: merges sort + service.list) ──
  /**
   * Synthetic `EntityService<Product, DefaultListParams>` adapter.
   * The wrapper calls `list(params)` with `{page, limit, search}`
   * (search via debounced input). We merge page-owned
   * `sortBy/sortOrder` into the call:
   *   - `sortKeySig() && sortDirSig()` → `{sortBy, sortOrder}`
   *     backend applies SQL `ORDER BY sortBy sortOrder`.
   * `findById/create/update/remove` delegate straight through to
   * the underlying `ProductsService`.
   */
  protected readonly localAdapter: EntityService<Product, DefaultListParams> = {
    list: (params: DefaultListParams) => {
      const sortKey = this.sortKeySig();
      const sortDir = this.sortDirSig();
      // Map wrapper's DefaultListParams → backend's ProductsListParams.
      const merged = {
        page: params.page ?? 1,
        limit: params.limit ?? this.PAGE_SIZE,
        ...(params.search ? { search: params.search } : {}),
        ...(sortKey && sortDir ? { sortBy: sortKey, sortOrder: sortDir } : {}),
      };
      // Backend returns {items, total, page, limit} — already a
      // PaginatedResponse<Product>. Adapt at the boundary by
      // recovering it as `PaginatedResponse<Product>` via upward cast
      // (TS can verify the structural shape — both have items+total
      // and the wrapper's paging arithmetic uses length, not literal).
      return this.service.list(merged) as unknown as Observable<
        import('../../core/silent-http').SilentResult<PaginatedResponse<Product>>
      >;
    },
    findById: (id: string) => this.service.findById(id),
    create: (payload: Partial<Product>) => this.service.create(payload),
    update: (id: string, payload: Partial<Product>) => this.service.update(id, payload),
    remove: (id: string) => this.service.remove(id),
  };

  constructor() {
    /**
     * When `sortKeySig/sortDirSig` change, the local adapter already
     * reads them — but the wrapper itself NEEDS a `reload()` trigger
     * to re-push its `fetchParams` into the fetch pipeline (otherwise
     * the wrapper keeps showing the previous response).
     * `firstRun` guard skips the initial effect run (wrapper's
     * own ngOnInit already fired the initial fetch).
     */
    let firstEffectRun = true;
    effect(() => {
      this.sortKeySig();
      this.sortDirSig();
      if (firstEffectRun) {
        firstEffectRun = false;
        return;
      }
      this.listRef()?.reload();
    });
  }

  // ─── Column definitions ─────────────────────────────────────────────
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

  protected totalLabel(n: number): string {
    return pluralize(n, ['продукт', 'продукта', 'продуктов']);
  }

  // ─── Event handlers ────────────────────────────────────────────────
  /**
   * Page-owned sort handler. pi-table emits `{key, dir}` from its
   * `(sortChange)` output (forwarded by wrapper). We mirror into
   * `sortKeySig/sortDirSig` then the constructor's effect calls
   * `listRef?.reload()` automatically.
   *
   * Backend sorts the FULL dataset (not the current page slice),
   * so no `localSort` opt-in needed.
   */
  protected onSortChange(event: SortChangeEvent): void {
    const dir = event.dir;
    // Boundary cast: pi-table emits `key: string`, page's SortKey
    // is narrowed to 'name' | 'sku' | 'listPrice'.
    this.sortKeySig.set(dir === null ? null : (event.key as SortKey));
    this.sortDirSig.set(dir === null ? null : (dir as 'asc' | 'desc'));
  }

  protected openCreate(): void {
    const ref = this.dialog.open(ProductFormDialogComponent, {
      data: null,
      width: 'lg',
    });
    this.refreshOnDialogClose(ref);
  }

  protected openEdit(product: Product): void {
    const ref = this.dialog.open(ProductFormDialogComponent, {
      data: product,
      width: 'lg',
    });
    this.refreshOnDialogClose(ref);
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
          this.listRef()?.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  private refreshOnDialogClose(ref: DialogRef<unknown>): void {
    onDialogCloseOnce(ref, this.injector, () => this.listRef()?.reload());
  }
}