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
 * TZ-NEW MaterialsPage (CRUD edition) — site landing with full
 * create / read / update / delete + search.
 *
 * Uses an inline custom HTML table (NOT PiTableComponent) so we can
 * render per-row action buttons (Edit / Delete) — PiTable supports
 * sortable columns but not template cells. The table style mirrors
 * the PiTable aesthetic (border hairline, font-display headers,
 * hover bg) and the canonical example in `forms.page.ts`.
 *
 * Standalone, OnPush, signal-based. Debounced search (300ms) hits
 * /api/materials?search=<q> on the server.
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
      eyebrow="site · каталог"
      title="Материалы"
      description="Справочник материалов: номенклатура, единицы, цены, остатки."
    />

    <div class="px-5 pt-6 flex items-center gap-3 flex-wrap">
      <input
        type="search"
        [value]="searchQuery()"
        (input)="onSearchInput($event)"
        placeholder="Поиск по названию…"
        aria-label="Поиск материалов"
        data-test="search-input"
        class="border hairline border-rule rounded-sm px-3 py-2 bg-paper text-sm font-body focus:outline-none focus:border-ink w-64 transition-colors"
      />
      <app-pi-button
        variant="default"
        (click)="openCreate()"
        data-test="create-button"
      >
        + Создать
      </app-pi-button>
      <span class="eyebrow text-sunrise-warm ml-auto">
        {{ total() }} {{ totalLabel(total()) }}
      </span>
    </div>

    <app-pi-section title="Каталог" hint="sortable · click headers" eyebrow="I">
      @if (error()) {
        <div
          role="alert"
          class="mb-4 border hairline border-destructive rounded-sm px-3 py-2 text-sm text-destructive"
        >
          {{ error() }}
        </div>
      }
      <div class="border hairline border-rule rounded-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="border-b hairline border-rule">
            <tr>
              <th
                class="text-left py-3 px-3 eyebrow cursor-pointer select-none"
                (click)="setSort('name')"
              >
                Название {{ sortIcon('name') }}
              </th>
              <th
                class="text-left py-3 px-3 eyebrow cursor-pointer select-none"
                (click)="setSort('article')"
              >
                Артикул {{ sortIcon('article') }}
              </th>
              <th
                class="text-left py-3 px-3 eyebrow cursor-pointer select-none"
                (click)="setSort('sku')"
              >
                SKU {{ sortIcon('sku') }}
              </th>
              <th
                class="text-left py-3 px-3 eyebrow cursor-pointer select-none"
                (click)="setSort('unit')"
              >
                Ед. {{ sortIcon('unit') }}
              </th>
              <th
                class="text-right py-3 px-3 eyebrow cursor-pointer select-none"
                (click)="setSort('pricePerUnit')"
              >
                Цена {{ sortIcon('pricePerUnit') }}
              </th>
              <th
                class="text-right py-3 px-3 eyebrow cursor-pointer select-none"
                (click)="setSort('stockQty')"
              >
                Остаток {{ sortIcon('stockQty') }}
              </th>
              <th class="text-right py-3 px-3 eyebrow w-32">Действия</th>
            </tr>
          </thead>
          <tbody>
            @for (row of sortedRows(); track row._id) {
              <tr
                class="border-b hairline border-rule last:border-0 hover:bg-sunrise-soft transition-colors"
                [attr.data-test]="'material-row-' + row._id"
              >
                <td class="py-3 px-3 align-top">{{ row.name }}</td>
                <td class="py-3 px-3 align-top">{{ row.article || '—' }}</td>
                <td class="py-3 px-3 align-top">{{ row.sku || '—' }}</td>
                <td class="py-3 px-3 align-top">{{ row.unit }}</td>
                <td class="py-3 px-3 text-right align-top">
                  {{ formatPrice(row) }}
                </td>
                <td class="py-3 px-3 text-right align-top">
                  {{ row.stockQty ?? 0 }}
                </td>
                <td class="py-3 px-3 text-right align-top">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      class="inline-flex items-center justify-center w-7 h-7 hairline border border-rule rounded-sm bg-paper hover:bg-paper-2 transition-colors text-sm"
                      [attr.aria-label]="'Редактировать ' + row.name"
                      [attr.data-test]="'edit-button-' + row._id"
                      (click)="openEdit(row)"
                    >
                      <span aria-hidden="true">✎</span>
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center w-7 h-7 hairline border border-rule rounded-sm bg-paper hover:bg-destructive hover:text-paper hover:border-destructive transition-colors text-sm"
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
                  colspan="7"
                  class="py-12 px-3 text-center text-muted"
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
                <td colspan="7" class="py-12 px-3 text-center text-muted">
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

  protected readonly data = signal<Material[]>([]);
  protected readonly total = signal<number>(0);
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);

  protected readonly searchQuery = signal<string>('');
  protected readonly sortKey = signal<SortKey>('name');
  protected readonly sortDir = signal<SortDir>('asc');

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
    this.reload();
  }

  /**
   * Bridge a DialogRef's `closed` signal to a one-shot subscription.
   * Signal is `TResult | undefined` (undefined before close); `first(v !== undefined)`
   * takes only the value set by ref.close(v). We reload only if the
   * user actually saved (v truthy) — not on cancel.
   */
  private refreshOnDialogClose<TResult>(ref: DialogRef<TResult>): void {
    toObservable(ref.closed)
      .pipe(first((v) => v !== undefined))
      .subscribe((v) => {
        if (v) this.reload();
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

  protected formatPrice(row: Material): string {
    if (row.pricePerUnit == null) return '—';
    const cur = row.priceCurrency ?? 'RUB';
    return `${row.pricePerUnit.toFixed(2)} ${cur}`;
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

  /**
   * (No more setInterval polling — moved to refreshOnDialogClose above.)
   */
}
