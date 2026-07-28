import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import {
  DefaultListParams,
  PiEntityListComponent,
} from '../../shared/dsl/entity-list/pi-entity-list.component';
import {
  EntityService,
  toEntityService,
} from '../../shared/dsl/entity/entity-service';
import { SilentResult } from '../../core/silent-http';
import { ColumnDef } from '../../shared/ui/pi-table.component';
import {
  StockMovement,
  MovementType,
  StockMovementsService,
} from './stock-movements.service';

/**
 * Module-level type alias: intersects `DefaultListParams` with
 * StockMovementsService's full filter surface
 * (`warehouseId`, `productId`, `type`, `from`, `to`).
 */
type MovementListParams = DefaultListParams & {
  warehouseId?: string;
  productId?: string;
  type?: string;
  from?: string;
  to?: string;
};

/**
 * Helper for stock-movements page-level not-implemented stubs.
 *
 * `StockMovementsService` lacks `findById()` / `update()` — only
 * `list/summary/create/remove` exist on the backend. To satisfy the
 * wrapper's `EntityService<T, P>` shape, we provide typed stubs that
 * return `{ok: false, error: HttpErrorResponse}` with status 501.
 *
 * `HttpErrorResponse` is the canonical `SilentResult.error` shape;
 * plain `Error` instances are rejected by TS structural typing.
 * `as const` on `ok: false` forces the discriminant literal so the
 * return type narrows correctly to the failure branch of the
 * `SilentResult<T>` discriminated union.
 *
 * If 2+ more pages hit this same impedance (likely for TZ-232.F
 * documents/templates/texts/tables), promote this to a shared
 * `toReadOnlyEntityService<T, P>(svc)` helper in
 * `shared/dsl/entity/entity-service.ts`.
 */
function notImplementedStub<T>(): Observable<SilentResult<T>> {
  return of<SilentResult<T>>({
    ok: false as const,
    error: new HttpErrorResponse({
      error: 'Method not implemented client-side',
      status: 501,
      statusText: 'Not Implemented',
      url: 'client-side-stub',
    }),
  });
}

/**
 * TZ-232.F.1 — StockMovementsPage migrated to `<pi-entity-list>`.
 *
 * Backend `/stock-movements` returns the canonical envelope
 * `{items, total, page, limit}` AND accepts custom filter params
 * (`warehouseId`, `productId`, `type`, `from`, `to`).
 *
 * Migration uses:
 *  - Local wrapper adapter (Option 4 per TZ-232.F design review)
 *    wrapping `StockMovementsService` for type-safe handoff to
 *    `toEntityService<StockMovement, MovementListParams>`.
 *  - Page-owned `selectedType` signal drives `[params]` input of the
 *    wrapper. The wrapper merges `[params]` with its own pagination
 *    + search state into the final `service.list(params)` call.
 *  - Type filter `select` element projected into the wrapper's
 *    `toolbarExtras` content slot — keeps search/filter/CRUD UX
 *    in the same row.
 */
@Component({
  selector: 'app-stock-movements-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiPageHeaderComponent, PiEntityListComponent],
  template: `
    <app-pi-page-header
      eyebrow="07 · склад"
      title="Движения на складе"
      description="Журнал приходов, расходов и перемещений."
    />

    <app-pi-entity-list
      [service]="listService"
      [params]="typeFilterParams()"
      [cols]="cols"
      ariaLabel="Движения на складе"
      searchPlaceholder="Поиск движений…"
      [showCreate]="false"
      emptyMessage="Нет движений."
      [initialSortKey]="'date'"
      [initialSortDir]="'desc'"
      [pageSize]="50"
      data-test="stock-movements-list"
    >
      <!-- ───── Type filter in toolbar extras ───── -->
      <div
        toolbarExtras
        class="flex items-center gap-2"
        data-test="type-filter"
      >
        <select
          class="pi-input"
          [value]="selectedType()"
          (change)="onTypeChange($event)"
          aria-label="Фильтр по типу движения"
          data-test="type-filter-select"
        >
          <option value="">Все типы</option>
          <option value="in">Приход</option>
          <option value="out">Расход</option>
          <option value="adjust">Корректировка</option>
          <option value="transfer">Перемещение</option>
        </select>
        <button
          type="button"
          class="pi-btn pi-btn--ghost pi-btn--sm"
          (click)="clearFilters()"
          data-test="type-filter-clear"
          [disabled]="!selectedType()"
        >
          Сбросить
        </button>
      </div>
    </app-pi-entity-list>
  `,
})
export class StockMovementsPage {
  private readonly service = inject(StockMovementsService);

  /**
   * Page-owned type filter signal. Wrapped in a `computed` and bound
   * to the wrapper's `[params]` input — the wrapper's fetch pipeline
   * reads it via `params.type` and passes through to the underlying
   * `service.list(params)` call.
   *
   * The empty `{}` branch is cast to `MovementListParams` because
   * TypeScript can't widen `{}` to a record with required
   * `page/limit` fields. Wrapper ignores fields it doesn't need
   * at runtime.
   */
  protected readonly selectedType = signal<string>('');

  protected readonly typeFilterParams = computed<MovementListParams>(() => {
    const type = this.selectedType();
    return (type ? { type } : {}) as MovementListParams;
  });

  /**
   * Local wrapper adapter (Option 4 per TZ-232.F design review).
   *
   * `StockMovementsService` lacks `findById` / `update` — those
   * methods are stubbed via `notImplementedStub<T>()` returning
   * `Observable<SilentResult<T>>` with status 501. The stubs are
   * never invoked in this template (no `(rowEdit)` / `(rowDelete)`
   * wiring) but the shape satisfies `EntityService<T, P>` so the
   * wrapper compiles. See `notImplementedStub` JSDoc for the
   * rationale.
   */
  protected readonly listService: EntityService<StockMovement, MovementListParams> =
    toEntityService<StockMovement, MovementListParams>({
      list: (params: any) =>
        this.service.list(
          params as Parameters<StockMovementsService['list']>[0],
        ),
      findById: () => notImplementedStub<StockMovement>(),
      create: (payload) => this.service.create(payload),
      update: () => notImplementedStub<StockMovement>(),
      remove: (id) => this.service.remove(id),
    });

  // ─── Column definitions ────────────────────────────────────────────
  protected readonly cols: ColumnDef<StockMovement>[] = [
    {
      key: 'date',
      label: 'Дата',
      sortable: true,
      width: '10rem',
      format: (row) => this.formatDate(row.date),
    },
    {
      key: 'type',
      label: 'Тип',
      sortable: true,
      width: '7rem',
      format: (row) => this.typeLabel(row.type),
    },
    {
      key: 'product',
      label: 'Продукт',
      format: (row) => row.product?.name ?? '—',
    },
    {
      key: 'warehouse',
      label: 'Склад',
      format: (row) => row.warehouse?.name ?? '—',
    },
    {
      key: 'qty',
      label: 'Кол-во',
      align: 'right',
      numeric: true,
      width: '6rem',
      format: (row) => String(row.qty),
    },
    {
      key: 'documentRef',
      label: 'Документ',
      width: '8rem',
      format: (row) => row.documentRef ?? '—',
    },
  ];

  // ─── Helpers ───────────────────────────────────────────────────────
  protected onTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedType.set(value);
  }

  protected clearFilters(): void {
    this.selectedType.set('');
  }

  protected typeLabel(type: MovementType): string {
    const labels: Record<MovementType, string> = {
      in: 'Приход',
      out: 'Расход',
      adjust: 'Корр.',
      transfer: 'Перемещ.',
    };
    return labels[type] ?? type;
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
