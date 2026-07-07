import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { PiEmptyTileComponent } from '../../shared/ui/pi-empty-tile/pi-empty-tile.component';
import { PiEmptyStateComponent } from '../../shared/ui/pi-empty-state/pi-empty-state.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { Material, MaterialsService } from './materials.service';
import { Photo, PhotosService } from './photos.service';
import { Organization, OrganizationsService } from '../organizations/organizations.service';
import { MaterialFormDialogComponent } from './material-form-dialog.component';

type SortKey =
  | 'name'
  | 'article'
  | 'sku'
  | 'unit'
  | 'pricePerUnit'
  | 'stockQty'
  | null;
type SortDir = 'asc' | 'desc';

/**
 * MaterialsPage — list with supplier/photo/dimensions columns.
 *
 * Lookup tables:
 *  - suppliersById: orgId → Organization (for Поставщик column)
 *  - photosById: photoId → Photo (for thumbnail + Фото column)
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-materials-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiEmptyTileComponent,
    PiEmptyStateComponent,
    PiRowActionsComponent,
    ButtonComponent,
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
        <table class="w-full text-sm min-w-[1280px]">
          <thead class="border-b hairline border-rule">
            <tr>
              <th class="pi-cell eyebrow w-20 text-left">Фото</th>
              <th
                class="pi-cell eyebrow cursor-pointer select-none group text-left"
                (click)="setSort('name')"
              >
                Название
                <span [class.text-sunrise-warm]="isSortedBy('name')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('name') }}</span>
              </th>
              <th
                class="pi-cell eyebrow cursor-pointer select-none group text-left"
                (click)="setSort('article')"
              >
                Артикул
                <span [class.text-sunrise-warm]="isSortedBy('article')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('article') }}</span>
              </th>
              <th
                class="pi-cell eyebrow cursor-pointer select-none group text-left"
                (click)="setSort('sku')"
              >
                Код
                <span [class.text-sunrise-warm]="isSortedBy('sku')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('sku') }}</span>
              </th>
              <th
                class="pi-cell eyebrow cursor-pointer select-none min-w-24 whitespace-nowrap text-left group"
                (click)="setSort('unit')"
              >
                Ед.
                <span [class.text-sunrise-warm]="isSortedBy('unit')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('unit') }}</span>
              </th>
              <th class="pi-cell eyebrow min-w-40 text-left">Поставщик</th>
              <th class="pi-cell eyebrow min-w-40 text-left">Габариты</th>
              <th
                class="pi-cell-numeric eyebrow cursor-pointer select-none min-w-32 group"
                (click)="setSort('pricePerUnit')"
              >
                Цена
                <span [class.text-sunrise-warm]="isSortedBy('pricePerUnit')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('pricePerUnit') }}</span>
              </th>
              <th
                class="pi-cell-numeric eyebrow cursor-pointer select-none min-w-24 group"
                (click)="setSort('stockQty')"
              >
                Остаток
                <span [class.text-sunrise-warm]="isSortedBy('stockQty')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('stockQty') }}</span>
              </th>
              <th class="pi-cell eyebrow w-40 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            @for (row of sortedRows(); track row._id) {
              <tr
                class="pi-table-row pi-table-row-odd last:border-0"
                [attr.data-test]="'material-row-' + row._id"
              >
                <td class="pi-cell align-top">
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
                </td>
                <td class="pi-cell align-top font-medium">{{ row.name }}</td>
                <td class="pi-cell align-top empty-cell">{{ row.article }}</td>
                <td class="pi-cell align-top empty-cell">{{ row.sku }}</td>
                <td class="pi-cell align-top whitespace-nowrap">{{ row.unit }}</td>
                <td class="pi-cell align-top empty-cell">{{ supplierNameOf(row) }}</td>
                <td class="pi-cell align-top font-mono text-xs whitespace-nowrap empty-cell">{{ dimensionsSummary(row) }}</td>
                <td class="pi-cell-numeric align-top empty-cell">{{ formatPrice(row) }}</td>
                <td class="pi-cell-numeric align-top">
                  {{ row.stockQty ?? 0 }}
                </td>
                <td class="pi-cell align-top">
                  <app-pi-row-actions
                    [row]="row"
                    [editLabel]="'Редактировать ' + row.name"
                    [deleteLabel]="'Удалить ' + row.name"
                    [dataTestEdit]="'edit-button-' + row._id"
                    [dataTestDelete]="'delete-button-' + row._id"
                    (edit)="openEdit($event)"
                    (delete)="onDelete($event)"
                  />
                </td>
              </tr>
            }
            @if (sortedRows().length === 0 && !loading()) {
              <app-pi-empty-state
                [colspan]="10"
                [message]="searchQuery()
                  ? 'Ничего не найдено.'
                  : 'Нет материалов. Нажмите «Создать», чтобы добавить первый.'"
                state="empty"
              />
            }
            @if (loading() && sortedRows().length === 0) {
              <app-pi-empty-state
                [colspan]="10"
                message="Загрузка…"
                state="loading"
              />
            }
          </tbody>
        </table>
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

  protected readonly data = signal<Material[]>([]);
  protected readonly total = signal<number>(0);
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);

  protected readonly searchQuery = signal<string>('');
  protected readonly sortKey = signal<SortKey>('name');
  protected readonly sortDir = signal<SortDir>('asc');

  // Lookup tables for supplier/photo rendering
  protected readonly suppliersById = signal<Record<string, Organization>>({});
  protected readonly photosById = signal<Record<string, Photo>>({});

  protected readonly sortedRows = computed<Material[]>(() => {
    const rows = this.data().slice();
    const k = this.sortKey();
    if (!k) return rows;
    const sign = this.sortDir() === 'asc' ? 1 : -1;
    return rows.sort((a, b) => {
      const av = a[k];
      const bv = b[k];
      if (av == null && bv == null) return 0;
      if (av == null) return -1 * sign;
      if (bv == null) return 1 * sign;
      if (typeof av === 'number' && typeof bv === 'number') {
        return (av - bv) * sign;
      }
      return String(av).localeCompare(String(bv), 'ru') * sign;
    });
  });

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadLookups();
    this.reload();
  }

  private loadLookups(): void {
    this.orgs.list({ limit: 200 }).subscribe((res) => {
      if (!res.ok) return; // Silently ignore — lookup tables are non-critical; data falls back to ID-only.
      const map: Record<string, Organization> = {};
      for (const o of res.data.items ?? []) map[o._id] = o;
      this.suppliersById.set(map);
    });
    this.photosService.list().subscribe((res) => {
      if (!res.ok) return; // Silently ignore — thumbnails fall back to the empty tile.
      const all = res.data;
      const map: Record<string, Photo> = {};
      for (const p of all) map[p._id] = p;
      this.photosById.set(map);
    });
  }

  protected mainPhotoOf(row: Material): Photo | null {
    if (!row.mainPhotoId) return null;
    // Backend auto-populates `mainPhotoId` as a `Photo` object. If it's
    // already populated, use it directly. Otherwise look it up in the
    // photos lookup table by its string ID.
    if (typeof row.mainPhotoId !== 'string') return row.mainPhotoId;
    return this.photosById()[row.mainPhotoId] ?? null;
  }

  protected supplierNameOf(row: Material): string | null {
    if (!row.supplierId) return null;
    return this.suppliersById()[row.supplierId]?.shortName
      ?? this.suppliersById()[row.supplierId]?.name
      ?? null;
  }

  protected dimensionsSummary(row: Material): string {
    if (!row.dimensions || row.dimensions.length === 0) return '';
    return row.dimensions
      .map((d) => `${typeLetter(d.type)} ${formatVal(d.value)}`)
      .join(' × ');
  }

  private refreshOnDialogClose(ref: DialogRef<unknown>): void {
    onDialogCloseOnce(ref, this.injector, (saved: unknown) => {
      // Dialog's onSubmit always closes with `ref.close(saved)` where
      // saved: Material. Cancel/ESC/backdrop close with null/undefined,
      // which the `if (v)` check in `onDialogCloseOnce` filters out, so
      // any non-null value reaching here is a Material. Narrow + cast.
      if (saved && typeof saved === 'object' && '_id' in saved) {
        const material = saved as Material;
        // Optimistic update: add (create) or replace (edit) the saved
        // material in the local data signal synchronously, so the table
        // reflects it immediately. The server has already confirmed the
        // save (we have the returned Material with _id), so this is a
        // local reconciliation of an already-committed change — not a
        // guess. `reload()` below resyncs in case other rows changed.
        const isUpdate = this.data().some((m) => m._id === material._id);
        this.data.update((cur) => {
          const idx = cur.findIndex((m) => m._id === material._id);
          if (idx >= 0) {
            const next = cur.slice();
            next[idx] = material;
            return next;
          }
          return [...cur, material];
        });
        if (!isUpdate) this.total.update((n) => n + 1);
      }
      this.loadLookups();
      this.reload();
    });
  }

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.reload(), 300);
  }

  protected setSort(key: Exclude<SortKey, null>): void {
    if (this.sortKey() !== key) {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    } else if (this.sortDir() === 'asc') {
      this.sortDir.set('desc');
    } else {
      this.sortKey.set(null);
      this.sortDir.set('asc');
    }
  }

  protected sortIcon(key: Exclude<SortKey, null>): string {
    if (this.sortKey() !== key) return '↕';
    return this.sortDir() === 'asc' ? '↑' : '↓';
  }

  protected isSortedBy(key: Exclude<SortKey, null>): boolean {
    return this.sortKey() === key;
  }

  protected formatPrice(row: Material): string {
    if (row.pricePerUnit == null) return '';
    return `${row.pricePerUnit.toFixed(2)} ₽`;
  }

  protected totalLabel(n: number): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'материал';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
      return 'материала';
    }
    return 'материалов';
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
    const ok = window.confirm(
      `Удалить материал «${row.name}»?\n\nЭто действие нельзя отменить.`,
    );
    if (!ok) return;
    this.service.remove(row._id).subscribe((res) => {
      if (res.ok) {
        this.toast.success('Материал удалён');
        this.reload();
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    const search = this.searchQuery().trim();
    this.service
      .list({ page: 1, limit: 50, search: search || undefined })
      .subscribe((res) => {
        if (res.ok) {
          this.data.set(res.data.items ?? []);
          this.total.set(res.data.total ?? res.data.items?.length ?? 0);
          this.loading.set(false);
        } else {
          this.error.set(extractErrorMessage(res.error));
          this.loading.set(false);
        }
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
