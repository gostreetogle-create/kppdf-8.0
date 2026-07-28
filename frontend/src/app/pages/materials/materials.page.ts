import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiEmptyTileComponent } from '../../shared/ui/pi-empty-tile/pi-empty-tile.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { pluralize, formatPrice } from '../../shared/util/format';
import { createLookupTable } from '../../shared/util/lookup-table';
import { ColumnDef } from '../../shared/ui/pi-table.component';
import { PiEntityListComponent } from '../../shared/dsl/entity-list/pi-entity-list.component';
import { toEntityService } from '../../shared/dsl/entity/entity-service';
import {
  Material,
  MaterialsService,
} from '../../shared/services/materials.service';
import { Photo, PhotosService } from '../../shared/services/photos.service';
import { Organization, OrganizationsService } from '../../shared/services/organizations.service';
import { MaterialFormDialogComponent } from './material-form-dialog.component';

/** Server-side pagination page size for /materials endpoint. */
const PAGE_SIZE = 50;

/**
 * TZ-232.E warmup #4 — materials migrated to <pi-entity-list> wrapper.
 *
 * Backend MaterialsController returns canonical paginated
 * `{items, total, page, limit}` response and honors `?search=`
 * (named `MaterialsListResponse`). This is the SIMPLE migration
 * pattern (NOT Approach D — backend already paginated). Uses
 * `toEntityService` helper for a 1-LOC adapter.
 *
 * Trade-offs:
 *  - **`httpResource` removed** — replaced by wrapper's RxJS pipeline
 *    (debounce + switchMap).
 *  - **Page-level search input removed** — wrapper's `[showSearch]`
 *    debounced search takes over. Toolbar simplified (no inline
 *    `<input>` / `Reload` button). Wrapper's `↻` icon replaces
 *    `<lucide-icon [img]="RefreshCw">`.
 *  - **`LucideAngularModule` + `RefreshCw` imports removed** — wrapper
 *    has its own reload affordance.
 *  - **3 cell templates** (photo, supplier, dimensions) preserved via
 *    `viewChild` + `cellTemplates` computed filter pattern (same as
 *    work-types for `isActive`). Templates are inside the wrapper to
 *    keep TemplateRefs in the page's view tree.
 *  - **Lookup tables** (suppliers, photos) stay page-level — wrapper
 *    doesn't know about them. After dialog close (create/edit), the
 *    page reloads both lookups + triggers `wrapper.reload()`.
 *  - **No row-click handler** — pre-migration didn't have one (no
 *    detail page for materials).
 *
 * Lookup-subscription cleanup: `createLookupTable` internally applies
 * `takeUntilDestroyed(destroyRef)` to every subscription, so when the
 * MaterialsPage component is destroyed any in-flight lookup fetch is
 * auto-cancelled. `load()` also calls `subscription?.unsubscribe()`
 * before each new run, so refreshing lookups after dialog close
 * CANCELS the previous (potentially stale) fetch — no race against
 * in-flight from initial constructor load.
 */
@Component({
  selector: 'app-materials-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiEmptyTileComponent,
    PiRowActionsComponent,
    ButtonComponent,
    PiEntityListComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · каталог"
      title="Материалы"
      description="Справочник материалов: номенклатура, поставщики, габариты, фото, цены, остатки."
    />

    <app-pi-entity-list
      #list
      [service]="listService"
      [cols]="cols"
      ariaLabel="Список материалов"
      [pageSize]="PAGE_SIZE"
      [searchPlaceholder]="'Поиск по названию…'"
      emptyMessage="Нет материалов. Нажмите «Создать», чтобы добавить первый."
      [cellTemplates]="cellTemplates()"
      [rowActionsTpl]="rowActionsTplBinding()"
      (create)="openCreate()"
      (rowEdit)="openEdit($event)"
      (rowDelete)="onDelete($event)"
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

      <!-- Page-level count hint -->
      <span
        hint
        toolbarExtras
        class="text-xs text-muted-foreground"
        data-test="materials-count"
      >
        {{ listTotal() }} {{ totalLabel(listTotal()) }}
      </span>
    </app-pi-entity-list>
  `,
})
export class MaterialsPage {
  private readonly service = inject(MaterialsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly orgs = inject(OrganizationsService);
  private readonly photosService = inject(PhotosService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly PAGE_SIZE = PAGE_SIZE;

  /** 1-LOC adapter via `toEntityService` helper — backend already paginated. */
  protected readonly listService = toEntityService(this.service);

  /** Wrapper ref — used for `reload()` after dialog close + reading `total()` for count hint. */
  private readonly listRef = viewChild<PiEntityListComponent<Material>>('list');

  protected readonly listTotal = computed<number>(() => this.listRef()?.total() ?? 0);

  // ─── Lookup tables (page-level, not wrapper concern) ──────────────
  // Internal `takeUntilDestroyed(destroyRef)` handles cleanup of any
  // in-flight subscriptions when the page component is destroyed,
  // and `load()` cancels the previous subscription before starting a
  // new one — so refreshing lookups after dialog close is race-free
  // even if the initial constructor load is still pending.
  private readonly suppliersLookup = createLookupTable<Organization>(
    this.orgs.list({ limit: 200 }),
  );
  private readonly photosLookup = createLookupTable<Photo>(this.photosService.list());

  constructor() {
    this.suppliersLookup.load();
    this.photosLookup.load();
  }

  /**
   * Template refs via `viewChild` signal — modern Angular 20.
   */
  private readonly photoTplRef = viewChild<TemplateRef<{ $implicit: Material }>>(
    'photoTpl',
  );
  private readonly supplierTplRef = viewChild<TemplateRef<{ $implicit: Material }>>(
    'supplierTpl',
  );
  private readonly dimsTplRef = viewChild<TemplateRef<{ $implicit: Material }>>(
    'dimsTpl',
  );
  private readonly rowActionsTplRef = viewChild<TemplateRef<{ $implicit: Material }>>(
    'rowActionsTpl',
  );

  /**
   * Cell templates map — filters out undefined refs so the wrapper's
   * `Record<string, TemplateRef>` (non-nullable values) is satisfied
   * at compile time. Pre-resolution (first CD), `cellTemplates` is
   * `{}`; the table renders plain values; CD-2+ resolves templates
   * and re-renders with rich content.
   */
  protected readonly cellTemplates = computed<
    Record<string, TemplateRef<{ $implicit: Material }>>
  >(() => {
    const result: Record<string, TemplateRef<{ $implicit: Material }>> = {};
    const photo = this.photoTplRef();
    const supplier = this.supplierTplRef();
    const dims = this.dimsTplRef();
    if (photo) result['mainPhotoId'] = photo;
    if (supplier) result['supplierId'] = supplier;
    if (dims) result['dimensions'] = dims;
    return result;
  });

  protected readonly rowActionsTplBinding = computed<
    TemplateRef<{ $implicit: Material }> | null
  >(() => this.rowActionsTplRef() ?? null);

  // ─── Column definitions ─────────────────────────────────────────────
  /**
   * Columns keyed by existing `Material` fields. Non-sortable cells
   * (mainPhotoId, supplierId, dimensions) use `cellTemplates` for
   * rich content; sortable cells use `format` for currency/number.
   * `name` is sticky-left for horizontal-scroll context.
   */
  protected readonly cols: ColumnDef<Material>[] = [
    { key: 'mainPhotoId', label: 'Фото', width: '96px', align: 'center' },
    { key: 'name', label: 'Название', sortable: true, sticky: 'left' },
    { key: 'article', label: 'Артикул', sortable: true, cellClass: 'empty-cell' },
    { key: 'sku', label: 'Код', sortable: true, cellClass: 'empty-cell' },
    { key: 'unit', label: 'Ед.', sortable: true, width: '60px' },
    { key: 'supplierId', label: 'Поставщик', cellClass: 'empty-cell' },
    { key: 'dimensions', label: 'Габариты', cellClass: 'empty-cell' },
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

  // ─── Cell template helpers ─────────────────────────────────────────
  protected mainPhotoOf(row: Material): Photo | null {
    if (!row.mainPhotoId) return null;
    if (typeof row.mainPhotoId !== 'string') return row.mainPhotoId;
    return this.photosLookup.byId()[row.mainPhotoId] ?? null;
  }

  protected supplierNameOf(row: Material): string | null {
    if (!row.supplierId) return null;
    return (
      this.suppliersLookup.byId()[row.supplierId]?.shortName ??
      this.suppliersLookup.byId()[row.supplierId]?.name ??
      null
    );
  }

  protected dimensionsSummary(row: Material): string {
    if (!row.dimensions || row.dimensions.length === 0) return '';
    return row.dimensions.map((d) => `${typeLetter(d.type)} ${formatVal(d.value)}`).join(' × ');
  }

  protected totalLabel(n: number): string {
    return pluralize(n, ['материал', 'материала', 'материалов']);
  }

  // ─── Event handlers ────────────────────────────────────────────────
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
          this.listRef()?.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  private refreshOnDialogClose(ref: DialogRef<unknown>): void {
    onDialogCloseOnce(ref, this.injector, () => {
      this.suppliersLookup.load();
      this.photosLookup.load();
      this.listRef()?.reload();
    });
  }
}

// ─── Local helpers (no need to export) ───
function typeLetter(t: string): string {
  switch (t) {
    case 'length':
      return 'L';
    case 'width':
      return 'W';
    case 'height':
      return 'H';
    case 'thickness':
      return 'T';
    case 'diameter':
      return 'Ø';
    case 'depth':
      return 'D';
    default:
      return t;
  }
}

function formatVal(n: number): string {
  if (n >= 1) return `${n}мм`;
  return `${(n * 1000).toFixed(0)}мкм`;
}