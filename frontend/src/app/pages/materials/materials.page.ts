import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { first } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
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
    ButtonComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · каталог"
      title="Материалы"
      description="Справочник материалов: номенклатура, поставщики, габариты, фото, цены, остатки."
    />

    <div class="px-page-x pt-0 pb-6 flex items-center gap-3 flex-wrap">
      <input
        type="search"
        [value]="searchQuery()"
        (input)="onSearchInput($event)"
        placeholder="Поиск по названию…"
        aria-label="Поиск материалов"
        data-test="search-input"
        class="border hairline border-rule rounded-sm px-control-x py-control-y bg-paper text-sm font-body focus:outline-none focus:border-ink w-64 transition-colors"
      />
      <app-pi-button
        variant="default"
        (click)="openCreate()"
        data-test="create-button"
      >
        + Создать
      </app-pi-button>
      <span class="eyebrow text-sunrise-warm">
        {{ total() }} {{ totalLabel(total()) }}
      </span>
    </div>

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
      <div class="overflow-x-auto border hairline border-rule rounded-sm">
        <p class="text-[10px] text-muted-foreground mb-1 sm:hidden">
          ← Таблица широкая — прокручивайте горизонтально →
        </p>
        <table class="w-full text-sm min-w-[1280px]">
          <thead class="border-b hairline border-rule">
            <tr>
              <th class="text-left py-2.5 px-4 eyebrow w-16">Фото</th>
              <th
                class="text-left py-2.5 px-4 eyebrow cursor-pointer select-none group"
                (click)="setSort('name')"
              >
                Название
                <span [class.text-sunrise-warm]="isSortedBy('name')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('name') }}</span>
              </th>
              <th
                class="text-left py-2.5 px-4 eyebrow cursor-pointer select-none group"
                (click)="setSort('article')"
              >
                Артикул
                <span [class.text-sunrise-warm]="isSortedBy('article')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('article') }}</span>
              </th>
              <th
                class="text-left py-2.5 px-4 eyebrow cursor-pointer select-none group"
                (click)="setSort('sku')"
              >
                Код
                <span [class.text-sunrise-warm]="isSortedBy('sku')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('sku') }}</span>
              </th>
              <th
                class="text-left py-2.5 px-4 eyebrow cursor-pointer select-none min-w-24 whitespace-nowrap group"
                (click)="setSort('unit')"
              >
                Ед.
                <span [class.text-sunrise-warm]="isSortedBy('unit')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('unit') }}</span>
              </th>
              <th class="text-left py-2.5 px-4 eyebrow min-w-40">Поставщик</th>
              <th class="text-left py-2.5 px-4 eyebrow min-w-40">Габариты</th>
              <th
                class="text-right py-2.5 px-4 eyebrow cursor-pointer select-none min-w-32 whitespace-nowrap group"
                (click)="setSort('pricePerUnit')"
              >
                Цена
                <span [class.text-sunrise-warm]="isSortedBy('pricePerUnit')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('pricePerUnit') }}</span>
              </th>
              <th
                class="text-right py-2.5 px-4 eyebrow cursor-pointer select-none min-w-24 whitespace-nowrap group"
                (click)="setSort('stockQty')"
              >
                Остаток
                <span [class.text-sunrise-warm]="isSortedBy('stockQty')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('stockQty') }}</span>
              </th>
              <th class="text-right py-2.5 px-4 eyebrow w-40">Действия</th>
            </tr>
          </thead>
          <tbody>
            @for (row of sortedRows(); track row._id) {
              <tr
                class="border-b hairline border-rule last:border-0 odd:bg-paper-2/30 hover:bg-sunrise-soft transition-colors"
                [attr.data-test]="'material-row-' + row._id"
              >
                <td class="py-1.5 px-4 align-top">
                  @if (mainPhotoOf(row); as mp) {
                    <img
                      [src]="mp.storageUrl"
                      [alt]="mp.originalFilename || row.name"
                      class="block w-12 h-12 object-cover border hairline border-rule rounded-sm"
                      loading="lazy"
                    />
                  } @else {
                    <div
                      class="w-12 h-12 border hairline border-rule rounded-sm bg-paper-2 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span class="text-muted text-xs">—</span>
                    </div>
                  }
                </td>
                <td class="py-2.5 px-4 align-top font-medium">{{ row.name }}</td>
                <td class="py-2.5 px-4 align-top empty-cell">{{ row.article }}</td>
                <td class="py-2.5 px-4 align-top empty-cell">{{ row.sku }}</td>
                <td class="py-2.5 px-4 align-top whitespace-nowrap">{{ row.unit }}</td>
                <td class="py-2.5 px-4 align-top empty-cell">{{ supplierNameOf(row) }}</td>
                <td class="py-2.5 px-4 align-top mono text-xs whitespace-nowrap empty-cell">{{ dimensionsSummary(row) }}</td>
                <td class="py-2.5 px-4 text-right align-top whitespace-nowrap empty-cell">{{ formatPrice(row) }}</td>
                <td class="py-2.5 px-4 text-right align-top whitespace-nowrap">
                  {{ row.stockQty ?? 0 }}
                </td>
                <td class="py-2.5 px-4 text-right align-top">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      class="inline-flex items-center justify-center w-8 h-8 hairline border border-rule rounded-sm bg-paper hover:bg-paper-2 transition-colors text-sm"
                      [attr.aria-label]="'Редактировать ' + row.name"
                      [attr.data-test]="'edit-button-' + row._id"
                      (click)="openEdit(row)"
                    >
                      <span aria-hidden="true">✎</span>
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center w-8 h-8 hairline border border-rule rounded-sm bg-paper hover:bg-destructive hover:text-paper hover:border-destructive transition-colors text-sm"
                      [attr.aria-label]="'Удалить ' + row.name"
                      [attr.data-test]="'delete-button-' + row._id"
                      (click)="onDelete(row)"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                </td>
              </tr>
            }
            @if (sortedRows().length === 0 && !loading()) {
              <tr>
                <td
                  colspan="10"
                  class="py-12 px-4 text-center text-muted"
                >
                  <div class="flex flex-col items-center gap-1">
                    <span class="eyebrow text-sunrise-warm">00</span>
                    <span class="text-sm">
                      {{ searchQuery() ? 'Ничего не найдено.' : 'Нет материалов. Нажмите «Создать», чтобы добавить первый.' }}
                    </span>
                  </div>
                </td>
              </tr>
            }
            @if (loading() && sortedRows().length === 0) {
              <tr>
                <td colspan="10" class="py-12 px-4 text-center text-muted">
                  Загрузка…
                </td>
              </tr>
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
    this.orgs.list({ limit: 200 }).subscribe({
      next: (res) => {
        const map: Record<string, Organization> = {};
        for (const o of res.items ?? []) map[o._id] = o;
        this.suppliersById.set(map);
      },
    });
    this.photosService.list().subscribe({
      next: (all) => {
        const map: Record<string, Photo> = {};
        for (const p of all) map[p._id] = p;
        this.photosById.set(map);
      },
    });
  }

  protected mainPhotoOf(row: Material): Photo | null {
    if (!row.mainPhotoId) return null;
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

  private refreshOnDialogClose<TResult>(ref: DialogRef<TResult>): void {
    toObservable(ref.closed)
      .pipe(first((v) => v !== undefined))
      .subscribe((v) => {
        if (v) {
          this.reload();
          this.loadLookups();
        }
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
    this.service.remove(row._id).subscribe({
      next: () => {
        this.toast.success('Материал удалён');
        this.reload();
      },
      error: (err: unknown) => {
        const e = err as { error?: { message?: string }; message?: string };
        this.toast.error(
          e?.error?.message ?? e?.message ?? 'Не удалось удалить материал.',
        );
      },
    });
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    const search = this.searchQuery().trim();
    this.service
      .list({ page: 1, limit: 50, search: search || undefined })
      .subscribe({
        next: (res) => {
          this.data.set(res.items ?? []);
          this.total.set(res.total ?? res.items?.length ?? 0);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          const e = err as { error?: { message?: string }; message?: string };
          this.error.set(
            e?.error?.message ?? e?.message ?? 'Не удалось загрузить материалы.',
          );
          this.loading.set(false);
        },
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
