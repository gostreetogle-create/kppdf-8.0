import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { PiEmptyTileComponent } from '../../shared/ui/pi-empty-tile/pi-empty-tile.component';
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
import { Material, MaterialsService, type MaterialsListResponse } from './materials.service';
import { Photo, PhotosService } from './photos.service';
import { Organization, OrganizationsService } from '../../shared/services/organizations.service';
import { MaterialFormDialogComponent } from './material-form-dialog.component';

/** Server-side pagination page size for /materials endpoint. */
const PAGE_SIZE = 50;

/**
 * TZ-104.3 Phase B — MaterialsPage migrated to `<app-pi-table>`.
 *
 * Inline `<table>` markup is replaced by the Paper & Ink primitive.
 * The page wires [total]/[page]/[pageSize] + (pageChange) for
 * server-side pagination, plus cell templates for photo/supplier/
 * dimensions HTML-rich content. The `<app-pi-row-actions>` cluster
 * is moved from inline-per-row into the `[rowActions]` ng-template
 * slot. Sort is delegated entirely to pi-table's internal sort.
 *
 * Template-ref strategy (post-3-iteration hardening):
 *  Uses `@ViewChild({ static: true })` decorators with `any`-typed
 *  refs (NOT the `viewChild` signal API). The signal API surfaced
 *  two pitfalls across iterations 2-3:
 *    (a) Angular's compiler treats locator strings the same as the
 *        local property name (`viewChild('rowActionsTpl')` + class
 *        field `rowActionsTpl` + template ref `#rowActionsTpl`),
 *        producing `"rowActionsTpl_r9 is not a function"` runtime
 *        errors when the symbol resolves ambiguously at the binding
 *        site.
 *    (b) `TemplateRef<C>` is invariant — assigning
 *        `Record<string, TemplateRef<{ $implicit: unknown }>>` to a
 *        Record of a different $implicit fails TS2345.
 *  `any` is bidirectional with every other type so both issues
 *  disappear at once without losing runtime safety (the row IS still
 *  injected as Material at runtime — type relaxation is type-only).
 *
 *  Templates use `let-row` directly: with `any` $implicit, all
 *  `row.X` accesses are typed-as-any, no `@let m = ... as Material`
 *  cast pattern needed (Angular's template parser rejects `as Type`
 *  inside `@let`, surfaced in iteration 2).
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
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiEmptyTileComponent,
    PiRowActionsComponent,
    ButtonComponent,
    TableComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · каталог"
      title="Материалы"
      description="Справочник материалов: номенклатура, поставщики, габариты, фото, цены, остатки."
    />

    <app-pi-toolbar>
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
      <app-pi-button
        variant="default"
        (click)="openCreate()"
        data-test="create-button"
      >
        + Создать
      </app-pi-button>
      <span hint>{{ total() }} {{ totalLabel(total()) }}</span>
    </app-pi-toolbar>

    <app-pi-section
      title="Каталог"
      hint="сортировка · клик по заголовку · габариты: L=Длина W=Ширина H=Высота T=Толщина Ø=Диаметр D=Глубина"
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
        >
          <!-- ───── Photo cell ───── -->
          <ng-template #photoTpl let-row>
            @if (mainPhotoOf(row); as mp) {
              <img
                [src]="mp.storageUrl"
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

          <!-- ───── Dimensions cell (font-mono glyphs) ───── -->
          <ng-template #dimsTpl let-row>
            <span class="font-mono text-xs whitespace-nowrap">{{ dimensionsSummary(row) }}</span>
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
        </app-pi-table>
      </div>
    </app-pi-section>
  `,
})
export class MaterialsPage implements OnInit {
  private readonly service = inject(MaterialsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly orgs = inject(OrganizationsService);
  private readonly photosService = inject(PhotosService);
  private readonly injector = inject(Injector);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly destroyRef = inject(DestroyRef);

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
  private readonly photosLookup = createLookupTable<Photo>(
    this.photosService.list(),
  );

  // ─── Template refs (resolved at view init, static:true → BEFORE ngOnInit) ──
  // `any` typing is deliberate: it bypasses `TemplateRef<C>` invariance
  // (TS would otherwise reject assigning TemplateRef<{ $implicit: unknown }>
  // to a different $implicit) and matches what Angular's relaxed template
  // type-inference does for `let-row` anyway. Runtime values are still
  // the page's row type (Material) — this is TYPE-LEVEL relaxation only.
  @ViewChild('photoTpl', { static: true })
  private readonly photoTplRef!: TemplateRef<any>;
  @ViewChild('supplierTpl', { static: true })
  private readonly supplierTplRef!: TemplateRef<any>;
  @ViewChild('dimsTpl', { static: true })
  private readonly dimsTplRef!: TemplateRef<any>;
  @ViewChild('rowActionsTpl', { static: true })
  private readonly rowActionsTplRef!: TemplateRef<any>;

  /** Built in ngOnInit after ViewChild fields resolve. Stable reference. */
  protected cellTemplates: Record<string, TemplateRef<any>> = {};
  /** Built in ngOnInit; null until then so pi-table defers the slot. */
  protected rowActionsTplBinding: TemplateRef<any> | null = null;

  /**
   * Single `computed()` that batches `page` + `limit` + `search`
   * signal reads. httpResource reads `listParams()` and auto-refires
   * when any signal it depends on changes; with these three signals
   * collapsed into ONE computed, Angular 20 schedules a single re-fire
   * per CD cycle instead of 3.
   */
  private readonly listParams = computed(() => ({
    page: this.pageSig(),
    limit: PAGE_SIZE,
    ...(this.search.debouncedSearch()
      ? { search: this.search.debouncedSearch() }
      : {}),
  }));

  protected readonly listRes = httpResource<MaterialsListResponse>(() => ({
    url: `${this.baseUrl}/materials`,
    params: this.listParams(),
  }));

  protected readonly data = computed<Material[]>(
    () => this.listRes.value()?.items ?? [],
  );
  /**
   * Backend reported total (canonical `{items, total, page, limit}`
   * envelope). The pi-table pager uses this to compute
   * `totalPages = ceil(total / pageSize)` and render the Prev / Next
   * controls. When backend has ≤limit rows, pi-table hides the pager.
   */
  protected readonly total = computed<number>(
    () => this.listRes.value()?.total ?? 0,
  );
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly searchQuery = this.search.searchQuery;

  protected readonly emptyMessage = computed(() =>
    this.searchQuery()
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
    { key: 'sku', label: 'Код', sortable: true, cellClass: 'empty-cell' },
    { key: 'unit', label: 'Ед.', sortable: true, width: '60px' },
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
      label: 'Остаток',
      sortable: true,
      numeric: true,
      align: 'right',
      width: '96px',
      format: (r) => String(r.stockQty ?? 0),
    },
  ];

  ngOnInit(): void {
    this.suppliersLookup.load();
    this.photosLookup.load();
    this.destroyRef.onDestroy(() => this.search.destroy());

    // Build cell-template map + row-actions binding AFTER the static
    // @ViewChild fields resolve (static:true resolves BEFORE
    // ngOnInit). Targeting fields directly avoids the TemplateRef<C>
    // invariance trap and Angular's signal-binding name-collision.
    this.cellTemplates = {
      mainPhotoId: this.photoTplRef,
      supplierId: this.supplierTplRef,
      dimensions: this.dimsTplRef,
    };
    this.rowActionsTplBinding = this.rowActionsTplRef;
  }

  // ─── Cell template helpers ─────────────────────────────────────────
  /**
   * Accept `unknown` (row from `let-row`) — Angular binding inserts
   * the actual Material instance at runtime, so we cast once here
   * rather than per template call site.
   */
  protected mainPhotoOf(row: unknown): Photo | null {
    const m = row as Material;
    if (!m.mainPhotoId) return null;
    if (typeof m.mainPhotoId !== 'string') return m.mainPhotoId;
    return this.photosLookup.byId()[m.mainPhotoId] ?? null;
  }

  protected supplierNameOf(row: unknown): string | null {
    const m = row as Material;
    if (!m.supplierId) return null;
    return (
      this.suppliersLookup.byId()[m.supplierId]?.shortName ??
      this.suppliersLookup.byId()[m.supplierId]?.name ??
      null
    );
  }

  protected dimensionsSummary(row: unknown): string {
    const m = row as Material;
    if (!m.dimensions || m.dimensions.length === 0) return '';
    return m.dimensions
      .map((d) => `${typeLetter(d.type)} ${formatVal(d.value)}`)
      .join(' × ');
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

  protected onPageChange(p: number): void {
    this.pageSig.set(p);
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

// ─── Local helpers (no need to export) ───
function typeLetter(t: string): string {
  switch (t) {
    case 'length': return 'L';
    case 'width': return 'W';
    case 'height': return 'H';
    case 'thickness': return 'T';
    case 'diameter': return 'Ø';
    case 'depth': return 'D';
    default: return t;
  }
}

function formatVal(n: number): string {
  if (n >= 1) return `${n}мм`;
  return `${(n * 1000).toFixed(0)}мкм`;
}
