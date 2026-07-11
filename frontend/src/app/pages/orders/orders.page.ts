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
import { Router } from '@angular/router';
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
import { Counterparty, CounterpartyService } from '../../shared/services/pi-counterparty.service';
import { API_BASE_URL } from '../../core/api.tokens';
import { Order, OrdersService } from './orders.service';
import { OrderFormDialogComponent } from './order-form-dialog.component';

type SortKey = 'number' | 'date' | 'total' | 'status' | null;
type SortDir = 'asc' | 'desc';

const ORDER_STATUS_LABELS: Record<Order['status'], string> = {
  draft: 'Черновик',
  confirmed: 'Подтверждён',
  in_production: 'В производстве',
  ready: 'Готов',
  shipped: 'Отгружен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

const PRIORITY_LABELS: Record<NonNullable<Order['priority']>, string> = {
  low: 'Низкий',
  normal: 'Обычный',
  high: 'Высокий',
  urgent: 'Срочный',
};

/**
 * OrdersPage — flat-list list of orders.
 *
 * IMPORTANT: backend GET /orders returns a flat array (not a
 * paginated `{items, total, page, limit}` envelope). The page does
 * client-side filtering + sort over the loaded array. Suitable for
 * ≤hundreds of rows in v1; pagination is a backend TODO.
 *
 * Softer convention than materials/organizations: "X заказов" count
 * is computed from the filtered list (not total). The pi-toolbar
 * hint slot uses the count of currently visible rows.
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-orders-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiEmptyStateComponent,
    PiRowActionsComponent,
    ButtonComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · заказы"
      title="Заказы"
      description="Заказы покупателей с привязкой к контрагенту и контракту. Бизнес-действия (отгрузка, резервирование) — в следующей итерации."
    />

    <app-pi-toolbar>
      <input
        id="orders-search"
        type="search"
        name="orders-search"
        [value]="searchQuery()"
        (input)="onSearchInput($event)"
        placeholder="Поиск по номеру заказа…"
        aria-label="Поиск заказов"
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
      <span hint>{{ visibleCount() }} {{ totalLabel(visibleCount()) }}</span>
    </app-pi-toolbar>

    <app-pi-section
      title="Заказы"
      hint="сортировка · клик по заголовку"
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

      <div class="hairline rounded-sm overflow-x-auto">
        <table class="w-full text-sm min-w-[960px]">
          <thead class="hairline-b">
            <tr>
              <th
                class="pi-cell eyebrow cursor-pointer select-none group text-left"
                (click)="setSort('number')"
              >
                Номер
                <span [class.text-sunrise-warm]="isSortedBy('number')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('number') }}</span>
              </th>
              <th
                class="pi-cell eyebrow cursor-pointer select-none group text-left"
                (click)="setSort('date')"
              >
                Дата
                <span [class.text-sunrise-warm]="isSortedBy('date')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('date') }}</span>
              </th>
              <th class="pi-cell eyebrow text-left min-w-40">Контрагент</th>
              <th
                class="pi-cell eyebrow cursor-pointer select-none group text-left"
                (click)="setSort('status')"
              >
                Статус
                <span [class.text-sunrise-warm]="isSortedBy('status')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('status') }}</span>
              </th>
              <th class="pi-cell eyebrow text-left">Приоритет</th>
              <th class="pi-cell eyebrow text-left">Позиций</th>
              <th
                class="pi-cell-numeric eyebrow cursor-pointer select-none group"
                (click)="setSort('total')"
              >
                Сумма
                <span [class.text-sunrise-warm]="isSortedBy('total')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('total') }}</span>
              </th>
              <th class="pi-cell eyebrow w-40 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            @for (row of sortedRows(); track row._id) {
              <tr
                class="pi-table-row pi-table-row-odd last:border-0"
                [attr.data-test]="'order-row-' + row._id"
              >
                <td class="pi-cell align-top font-mono text-xs font-medium">{{ row.number }}</td>
                <td class="pi-cell align-top text-muted-foreground whitespace-nowrap empty-cell">{{ formatDate(row.date) }}</td>
                <td class="pi-cell align-top">{{ counterpartyNameOf(row) ?? '—' }}</td>
                <td class="pi-cell align-top empty-cell">{{ statusBadge(row.status) }}</td>
                <td class="pi-cell align-top empty-cell">{{ priorityLabel(row.priority) }}</td>
                <td class="pi-cell align-top text-muted-foreground">{{ row.items?.length ?? 0 }}</td>
                <td class="pi-cell-numeric align-top">{{ formatTotal(row) }}</td>
                <td class="pi-cell align-top">
                  <app-pi-row-actions
                    [row]="row"
                    [documentLabel]="'Создать документ для заказа ' + row.number"
                    [dataTestDocument]="'document-button-' + row._id"
                    [editLabel]="'Редактировать заказ ' + row.number"
                    [deleteLabel]="'Удалить заказ ' + row.number"
                    [dataTestEdit]="'edit-button-' + row._id"
                    [dataTestDelete]="'delete-button-' + row._id"
                    (document)="onCreateDocument($event)"
                    (edit)="openEdit($event)"
                    (delete)="onDelete($event)"
                  />
                </td>
              </tr>
            }
            @if (sortedRows().length === 0 && !loading()) {
              <app-pi-empty-state
                [colspan]="8"
                [message]="searchQuery() ? 'Ничего не найдено.' : 'Нет заказов. Нажмите «Создать», чтобы добавить первый.'"
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
export class OrdersPage implements OnInit {
  private readonly service = inject(OrdersService);
  private readonly counterpartyService = inject(CounterpartyService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly baseUrl = inject(API_BASE_URL);
  // TZ-86 Phase E.1: per-row «Создать документ» navigates to the builder's
  // empty-state picker with `?source=order&sourceId=<row._id>`. The builder
  // (builder.page.ts, Phase D.2 plumbing) reads the query params, shows the
  // template picker, and preserves them when the user picks a template.
  private readonly router = inject(Router);

  /**
   * Server list = `GET /api/orders` via Angular 20's `httpResource`.
   *
   * Backend caveat: GET /orders returns a FLAT ARRAY (not the canonical
   * `{items, total, page, limit}` envelope). Search is client-side
   * over the loaded array, so no `search` query param is sent (and
   * accordingly no `debouncedSearch` signal — `searchQuery` is what
   * the input box echoes back). When backend gains real pagination,
   * switch this to the envelope shape and add `debouncedSearch` like
   * materials/products do.
   *
   * `data` is a `computed()` over `listRes.value() ?? []`; `filteredRows`
   * (search) tracks `data()` and `counterpartiesById()` — both via
   * signal reads, so they re-run automatically when either changes.
   */
  protected readonly listRes = httpResource<Order[]>(() => ({
    url: `${this.baseUrl}/orders`,
  }));

  protected readonly data = computed<Order[]>(() => this.listRes.value() ?? []);
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly searchQuery = signal<string>('');
  protected readonly sortKey = signal<SortKey>('date');
  protected readonly sortDir = signal<SortDir>('desc');

  protected readonly counterpartiesById = signal<Record<string, Counterparty>>({});

  /** Filtered rows (search applied). Sort applied in sortedRows below. */
  protected readonly filteredRows = computed<Order[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.data();
    return this.data().filter((o) => {
      const hay = [
        o.number,
        o.deliveryAddress,
        o.notes,
        this.counterpartiesById()[counterpartyIdOf(o)]?.name,
        this.counterpartiesById()[counterpartyIdOf(o)]?.shortName,
        this.counterpartiesById()[counterpartyIdOf(o)]?.inn,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  });

  protected readonly sortedRows = computed<Order[]>(() => {
    const rows = this.filteredRows().slice();
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

  protected readonly visibleCount = computed(() => this.sortedRows().length);

  ngOnInit(): void {
    this.loadCounterparties();
    // `listRes` auto-fires its initial GET — no explicit `reload()`.
  }

  private loadCounterparties(): void {
    this.counterpartyService.list({ limit: 200 }).subscribe((res) => {
      if (!res.ok) return; // Silently degrade — table will show raw IDs.
      const map: Record<string, Counterparty> = {};
      for (const c of res.data.items ?? []) map[c._id] = c;
      this.counterpartiesById.set(map);
    });
  }

  protected counterpartyNameOf(row: Order): string | null {
    const id = counterpartyIdOf(row);
    if (!id) return null;
    return (
      this.counterpartiesById()[id]?.shortName ??
      this.counterpartiesById()[id]?.name ??
      null
    );
  }

  protected statusBadge(status: Order['status']): string {
    return ORDER_STATUS_LABELS[status] ?? status;
  }

  protected priorityLabel(p: Order['priority'] | undefined): string {
    if (!p) return '—';
    return PRIORITY_LABELS[p] ?? p;
  }

  protected formatDate(d: string | undefined): string {
    if (!d) return '';
    // Backend serializes Date as ISO string; format as dd.mm.yyyy.
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}`;
  }

  protected formatTotal(row: Order): string {
    if (row.total == null) return '—';
    return `${row.total.toFixed(2)} ₽`;
  }

  protected totalLabel(n: number): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'заказ';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
      return 'заказа';
    }
    return 'заказов';
  }

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
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
    const ref = this.dialog.open(OrderFormDialogComponent, {
      data: null,
      width: 'lg',
    });
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }

  protected openEdit(order: Order): void {
    const ref = this.dialog.open(OrderFormDialogComponent, {
      data: order,
      width: 'lg',
    });
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }

  protected onDelete(row: Order): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить заказ?',
        description: `Удалить «${row.number}»? Это действие нельзя отменить.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.service.remove(row._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Заказ удалён');
          this.listRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  /**
   * TZ-86 Phase E.1: navigate to the document constructor's empty-state
   * picker with `?source=order&sourceId=<row._id>` query params. The
   * builder (D.2 plumbing) reads these and shows the template picker
   * preserving the params; after the user picks a template, the params
   * are forwarded to `/doc-constructor/builder/:id`.
   *
   * Future TZ-XX: the builder will use `sourceId` to pre-bind dataBinding
   * sources from the order (customer, products, dates, total). Out of
   * scope for this PR — the routing plumbing ships here.
   */
  protected onCreateDocument(row: Order): void {
    this.router.navigate(['/doc-constructor/builder'], {
      queryParams: { source: 'order', sourceId: row._id },
    });
  }

  protected reload(): void {
    this.listRes.reload();
  }
}

// ─── Local helpers ───
function counterpartyIdOf(row: Order): string {
  if (!row.counterpartyId) return '';
  if (typeof row.counterpartyId === 'string') return row.counterpartyId;
  return row.counterpartyId._id ?? '';
}
