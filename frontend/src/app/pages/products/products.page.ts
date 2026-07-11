import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { PiEmptyStateComponent } from '../../shared/ui/pi-empty-state/pi-empty-state.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { Product, ProductsService, type ProductsListResponse } from './products.service';
import { ProductFormDialogComponent } from './product-form-dialog.component';

type SortKey = 'name' | 'sku' | 'listPrice' | null;
type SortDir = 'asc' | 'desc';

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
 * ProductsPage — каталог продукции.
 *
 * Канон: список с поиском, сортировкой, row-actions (edit/delete).
 * Колонки: SKU, Название, Вид, Ед., Цена (listPrice), Статус, Остаток.
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-products-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    RouterLink,
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiEmptyStateComponent,
    PiRowActionsComponent,
    ButtonComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · продукция"
      title="Продукция"
      description="Каталог готовой продукции: товары, услуги, работы. Цены, себестоимость, габариты."
    />

    <app-pi-toolbar>
      <input
        id="products-search"
        type="search"
        name="products-search"
        [value]="searchQuery()"
        (input)="onSearchInput($event)"
        placeholder="Поиск по названию или SKU…"
        aria-label="Поиск продукции"
        data-test="search-input"
        class="pi-input w-72"
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

    <app-pi-section title="Каталог" hint="сортировка · клик по заголовку" eyebrow="I">
      @if (error()) {
        <div
          role="alert"
          class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          {{ error() }}
        </div>
      }

      <div class="hairline rounded-sm overflow-x-auto">
        <table class="w-full text-sm min-w-[860px]">
          <thead class="hairline-b">
            <tr>
              <th
                class="pi-cell eyebrow cursor-pointer select-none group text-left"
                (click)="setSort('name')"
              >
                Название
                <span [class.text-sunrise-warm]="isSortedBy('name')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('name') }}</span>
              </th>
              <th
                class="pi-cell eyebrow cursor-pointer select-none group text-left"
                (click)="setSort('sku')"
              >
                SKU
                <span [class.text-sunrise-warm]="isSortedBy('sku')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('sku') }}</span>
              </th>
              <th class="pi-cell eyebrow text-left">Вид</th>
              <th class="pi-cell eyebrow text-left w-20">Ед.</th>
              <th
                class="pi-cell-numeric eyebrow cursor-pointer select-none group"
                (click)="setSort('listPrice')"
              >
                Цена
                <span [class.text-sunrise-warm]="isSortedBy('listPrice')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('listPrice') }}</span>
              </th>
              <th class="pi-cell eyebrow text-left">Статус</th>
              <th class="pi-cell-numeric eyebrow w-20">Остаток</th>
              <th class="pi-cell eyebrow w-40 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            @for (row of sortedRows(); track row._id) {
              <tr
                class="pi-table-row pi-table-row-odd last:border-0"
                [attr.data-test]="'product-row-' + row._id"
              >
                <td class="pi-cell align-top font-medium">
                  <a
                    [routerLink]="['/products', row._id]"
                    class="text-ink hover:text-sunrise-warm hover:underline"
                    [attr.aria-label]="'Открыть ' + row.name"
                    data-test="open-row-link"
                  >{{ row.name }}</a>
                </td>
                <td class="pi-cell align-top font-mono text-xs empty-cell">{{ row.sku }}</td>
                <td class="pi-cell align-top text-muted-foreground empty-cell">{{ kindLabel(row.kind) }}</td>
                <td class="pi-cell align-top whitespace-nowrap">{{ row.unit }}</td>
                <td class="pi-cell-numeric align-top empty-cell">{{ formatPrice(row) }}</td>
                <td class="pi-cell align-top empty-cell">{{ statusLabel(row) }}</td>
                <td class="pi-cell-numeric align-top">{{ row.stockQty ?? 0 }}</td>
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
                [colspan]="8"
                [message]="searchQuery() ? 'Ничего не найдено.' : 'Нет продукции. Нажмите «Создать», чтобы добавить первую.'"
                state="empty"
              />
            }
            @if (loading() && sortedRows().length === 0) {
              <app-pi-empty-state
                [colspan]="8"
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
export class ProductsPage implements OnInit {
  private readonly service = inject(ProductsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly baseUrl = inject(API_BASE_URL);

  /**
   * TZ-83 Review #2 fix: вместо `(click)` на <tr> используем `<a routerLink>`
   * в первой колонке. Это устраняет bubbling с PiRowActionsComponent
   * (раньше клик на «Редактировать» на /products одновременно навигировал
   * в /products/:id и открывал dialog). routerNavigate через RouterLink —
   * canonical click-nav паттерн, не требует stopPropagation хаков.

  /**
   * Server list = `GET /api/products` via Angular 20's `httpResource`.
   * Same shape as materials/organizations: paginated envelope
   * `{items, total, page, limit}`, debounced search, sortBy/sortOrder
   * forwarded to backend. `error` cast handles `httpResource.error()`
   * being typed `unknown`.
   */
  protected readonly listRes = httpResource<ProductsListResponse>(() => ({
    url: `${this.baseUrl}/products`,
    params: {
      page: 1,
      limit: 50,
      ...(this.debouncedSearch() ? { search: this.debouncedSearch() } : {}),
      ...(this.sortKey()
        ? { sortBy: this.sortKey()!, sortOrder: this.sortDir() }
        : {}),
    },
  }));

  protected readonly data = computed<Product[]>(
    () => this.listRes.value()?.items ?? [],
  );
  protected readonly total = computed<number>(
    () => this.listRes.value()?.total ?? this.data().length,
  );
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  /** Live search input (echoed in @if branches). */
  protected readonly searchQuery = signal<string>('');
  /** Debounced snapshot driving the httpResource params. */
  protected readonly debouncedSearch = signal<string>('');
  protected readonly sortKey = signal<SortKey>('name');
  protected readonly sortDir = signal<SortDir>('asc');

  protected readonly sortedRows = computed<Product[]>(() => {
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
    // `listRes` auto-fires its initial GET — no explicit `reload()`.
  }

  protected kindLabel(kind: Product['kind']): string {
    return KIND_LABELS[kind] ?? kind;
  }

  protected statusLabel(row: Product): string {
    return row.status ? STATUS_LABELS[row.status] : '—';
  }

  protected formatPrice(row: Product): string {
    if (row.listPrice == null) return '';
    return `${row.listPrice.toFixed(2)} ₽`;
  }

  protected totalLabel(n: number): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'продукт';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
      return 'продукта';
    }
    return 'продуктов';
  }

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(
      () => this.debouncedSearch.set(target.value.trim()),
      300,
    );
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

  protected openCreate(): void {
    const ref = this.dialog.open(ProductFormDialogComponent, {
      data: null,
      width: 'lg',
    });
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }

  protected openEdit(product: Product): void {
    const ref = this.dialog.open(ProductFormDialogComponent, {
      data: product,
      width: 'lg',
    });
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
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
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.service.remove(row._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Продукт удалён');
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
}
