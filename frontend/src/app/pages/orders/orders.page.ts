import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { LucideAngularModule, RefreshCw } from 'lucide-angular';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import { DEALS_TOC_CHIPS } from '../commercial/deals-group-chips';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import {
  CompositionTreeComponent,
  type CompositionTreeExpandEvent,
  type CompositionTreeSelectEvent,
  type CompositionTreeEditEvent,
} from '../../shared/ui/composition/composition-tree.component';
import {
  CompositionTreeNode,
  ProductModulesService,
} from '../../shared/services/pi-product-modules.service';
import { ProductsService } from '../../shared/services/products.service';
import { MaterialsService } from '../../shared/services/materials.service';
import {
  loadOrderCompositionForest,
  ORDER_TREE_INITIAL_DEPTH,
  ORDER_TREE_MAX_DEPTH,
} from './order-composition-forest';
import {
  isEmptyCatalogBranch,
  openCatalogEditFromTree,
  type CatalogCompositionEditDeps,
} from './open-catalog-composition-edit';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { createSearchState } from '../../shared/util/search';
import { pluralize, formatDate } from '../../shared/util/format';
import { createLookupTable } from '../../shared/util/lookup-table';
import { ColumnDef, SortDirection, TableComponent } from '../../shared/ui/pi-table.component';
import { Counterparty, CounterpartyService } from '../../shared/services/pi-counterparty.service';
import { Order, OrdersService } from './orders.service';
import { OrderFormDialogComponent } from './order-form-dialog.component';
import {
  SupplyTask,
  SupplyTaskService,
  type SupplyTaskStatus,
} from '../../shared/services/pi-supply.service';
import { Reservation, ReservationsService } from '../../shared/services/pi-reservations.service';

type SortKey = 'number' | 'date' | 'status';

type SupplyExpandCounters = Record<SupplyTaskStatus, number> & { total: number };

type ReservationExpandCounters = { active: number; total: number };

const EMPTY_SUPPLY_COUNTERS: SupplyExpandCounters = {
  draft: 0,
  confirmed: 0,
  ordered: 0,
  received: 0,
  total: 0,
};

const EMPTY_RESERVATION_COUNTERS: ReservationExpandCounters = { active: 0, total: 0 };

/** Client-side pagination page size for /orders flat-array endpoint. */
const PAGE_SIZE = 10;

const ORDER_STATUS_LABELS: Record<Order['status'], string> = {
  draft: 'Черновик',
  confirmed: 'Подтверждён',
  in_production: 'В производстве',
  ready: 'Готов',
  shipped: 'Отгружен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

/**
 * Status cycle for sort: draft → confirmed → in_production → ready →
 * shipped → delivered → cancelled. Alphabetical ordering on the raw
 * status string would give `cancelled < confirmed < delivered < draft`,
 * which is meaningless to a sales-manager reading the order pipeline.
 * Sort by numeric index instead.
 */
const STATUS_CYCLE_INDEX: Record<Order['status'], number> = {
  draft: 0,
  confirmed: 1,
  in_production: 2,
  ready: 3,
  shipped: 4,
  delivered: 5,
  cancelled: 6,
};

const PRIORITY_LABELS: Record<NonNullable<Order['priority']>, string> = {
  low: 'Низкий',
  normal: 'Обычный',
  high: 'Высокий',
  urgent: 'Срочный',
};

/**
 * Custom sort accessor per key. Different keys have different "natural"
 * sort semantics — `status` is the lifecycle cycle above, `date` is
 * chronological (null/undefined → bottom regardless of direction),
 * `total` is numeric, `number` is string-locale.
 */
function accessorFor(key: SortKey): (row: Order) => unknown {
  switch (key) {
    case 'status':
      return (r) => STATUS_CYCLE_INDEX[r.status] ?? -1;
    case 'date':
      return (r) => (r.date ? Date.parse(r.date) : null);
    case 'number':
      return (r) => r.number;
  }
}

/**
 * Compare two values per the sign direction. Mirrors the logic in
 * `createSortState.sorted` but applied to the page-owned sort pipeline
 * (page-owned because `pi-table [localSort]=false` here and the page
 * reads the accessor function directly).
 */
function compareValues(av: unknown, bv: unknown, sign: 1 | -1): number {
  if (av == null && bv == null) return 0;
  if (av == null) return -1 * sign;
  if (bv == null) return 1 * sign;
  if (typeof av === 'number' && typeof bv === 'number') {
    return (av - bv) * sign;
  }
  return String(av).localeCompare(String(bv), 'ru') * sign;
}

/**
 * Counterparty ID extractor — accepts either a string ID (unpopulated)
 * or a populated Counterparty sub-document. Mirrors the dual-shape
 * pattern used by `Material.supplierId` in materials.page.ts.
 */
function counterpartyIdOf(row: Order): string {
  if (!row.counterpartyId) return '';
  if (typeof row.counterpartyId === 'string') return row.counterpartyId;
  return row.counterpartyId._id ?? '';
}

type PopulatedOrderRef = string | { _id: string; name?: string; address?: string };

function refId(value: PopulatedOrderRef | null | undefined): string {
  if (!value) return '';
  return typeof value === 'string' ? value : value._id;
}

/**
 * Полная документация страницы: docs/pages/orders.page.md
 *
 * TZ-104.3 batch-1 commit 3/3 + TZ-104.4.2 — OrdersPage migrated to
 * `<app-pi-table>`, with TZ-104.4.2 dropping the `any`-escape
 * hatch that v4 needed.
 *
 * Architectural shift vs materials.page.ts (server-side pagination):
 *  - Backend GET /orders returns a FLAT `Order[]` (no
 *    `{items, total, page, limit}` envelope). The OrderService
 *    doesn't paginate/sort/filter yet; the page owns the pipeline.
 *  - CLIENT-SIDE sort + filter + slice pagination. `[total]` is the
 *    CURRENT filtered+sorted length (modulo search), and
 *    `paginatedRows` is the page slice of that.
 *  - Sort is page-owned via custom accessors (different keys have
 *    different natural sorts — `status` cycle index, `date`
 *    chronological, `number` locale).
 *
 * TZ-104.4.2 page-loaded default sort: `[initialSortKey]="'date'"`
 * + `[initialSortDir]="'desc'"` so users see "newest orders first"
 * on first load (matching pre-migration UX). The page's internal
 * `sortKeySig/sortDirSig` are seeded to `'date'/'desc'` to match
 * pi-table's internal state after ngOnInit — both halves of the
 * lockstep cycle start in sync, so the round-2 mirror-event handler
 * stays correct from the very first click.
 *
 * BUG fixes vs the pre-migration source:
 *  1. `sortedRows` was previously bound via
 *     `sort.sorted(this.filteredRows(), fn)`. That captures
 *     `filteredRows()` ONCE at construction (a static snapshot) —
 *     the internal `computed` re-ran only on `sortKey/sortDir`
 *     changes, NOT on filter changes. The new impl binds as a
 *     reactive `computed` that reads both `filtered()` AND the
 *     sort signals so any change triggers re-compute.
 *  2. The pre-migration source had a page-level `searchQuery`
 *     signal AND `createClientSearchState`'s own internal
 *     `searchQuery`. Replaced with `createSearchState` + a single
 *     reactive filtered computed reading `debouncedSearch`.
 *
 *  Template-ref strategy (post-TZ-104.4.2):
 *   `@ViewChild({ static: true })` decorators with strong typing
 *   `TemplateRef<{ $implicit: Order }>` (NOT `any`). Pre-TZ-104.4.2
 *   we used `any` because pi-table's `[cellTemplates]` was typed
 *   `Record<string, TemplateRef<{ $implicit: unknown }>>` and
 *   TemplateRef invariance broke the binding. TZ-104.4.2 re-typed
 *   pi-table so the strict Order typing now flows through.
 *
 *  Standalone + OnPush + signal-based. The `?q=` query parameter is
 *  applied to the same debounced search state as the toolbar input,
 *  so inspector deep-links and manual search share one filter path.
 */
@Component({
  selector: 'app-orders-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    RouterLink,
    PiGroupWorkspaceComponent,
    PiRowActionsComponent,
    ButtonComponent,
    TableComponent,
    CompositionTreeComponent,
  ],
  template: `
    <app-pi-group-workspace [toc]="dealsToc" tocActiveId="orders" [chips]="emptyChips" activeId="">
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
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
        <app-pi-button variant="default" (click)="openCreate()" data-test="create-button">
          + Создать заказ
        </app-pi-button>
        <app-pi-button variant="ghost" size="sm" (click)="reload()" data-test="reload-button">
          <lucide-icon [img]="RefreshIcon" [size]="14"></lucide-icon> Обновить
        </app-pi-button>
        <span class="flex-1"></span>
        <span class="text-xs text-muted-foreground"
          >{{ visibleCount() }} {{ totalLabel(visibleCount()) }}</span
        >
      </div>

      <div class="pi-table-surface hairline rounded-sm overflow-hidden">
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
            [data]="paginatedRows()"
            [columns]="cols"
            [loading]="loading()"
            [total]="total()"
            [page]="page()"
            [pageSize]="pageSize"
            [emptyMessage]="emptyMessage()"
            [ariaLabel]="'Список заказов'"
            [cellTemplates]="cellTemplates"
            [rowActions]="rowActionsTplBinding"
            [localSort]="false"
            [initialSortKey]="'date'"
            [initialSortDir]="'desc'"
            (pageChange)="onPageChange($event)"
            (sortChange)="onSortChange($event)"
            (rowClick)="onRowClick($event)"
            [expandedRow]="expandedTpl"
            [expandedRowWhen]="isExpandedRow"
            [expandedRowLabel]="expandedRowLabel"
          >
            <!-- ───── Number → detail ───── -->
            <ng-template #numberTpl let-row>
              <a
                class="text-ink hover:text-sunrise-warm underline-offset-2 hover:underline font-mono"
                [routerLink]="['/orders', row._id]"
                [attr.data-test]="'order-link-' + row._id"
                (click)="$event.stopPropagation()"
                >{{ row.number }}</a
              >
            </ng-template>

            <!-- ───── Counterparty lookup cell ───── -->
            <ng-template #counterpartyTpl let-row>
              {{ counterpartyNameOf(row) ?? '—' }}
            </ng-template>

            <!-- ───── Site / proposal cells ───── -->
            <ng-template #siteTpl let-row>
              {{ siteLabel(row.siteId) || '—' }}
            </ng-template>

            <ng-template #proposalTpl let-row>
              @if (proposalIdOf(row)) {
                <a
                  routerLink="/proposals"
                  class="text-ink hover:text-sunrise-warm hover:underline"
                  (click)="$event.stopPropagation()"
                  [attr.data-test]="'proposal-link-' + row._id"
                >
                  {{ proposalLabelOf(row) }}
                </a>
              } @else {
                <span>{{ proposalLabelOf(row) }}</span>
              }
            </ng-template>

            <!-- ───── Row actions cluster ───── -->
            <ng-template #rowActionsTpl let-row>
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
            </ng-template>

            <ng-template #expandedTpl let-row>
              @if (expandedId() === row._id) {
                <div
                  class="px-4 py-3.5 border-l-[3px] border-l-gold bg-[var(--color-sunrise-soft)]"
                  data-test="expanded-content"
                  role="region"
                  [attr.aria-label]="'Сводка заказа: ' + row.number"
                >
                  <div class="space-y-4" data-test="order-lifecycle-groups">
                    <section
                      class="rounded-sm border hairline border-ink/10 bg-paper-raised/85 p-3"
                      data-test="order-group-order"
                    >
                      <div
                        class="flex items-baseline gap-2 border-b hairline border-ink/5 pb-2 mb-3"
                      >
                        <p class="eyebrow m-0">Заказ</p>
                        <span class="text-xs text-muted-foreground">основной состав</span>
                      </div>
                      <section
                        class="min-w-0 flex flex-col gap-1"
                        data-test="order-composition-block"
                      >
                        <button
                          type="button"
                          class="flex items-center justify-between gap-3 w-full min-h-touch text-left text-sm text-ink pi-focus-ring rounded-sm"
                          [attr.aria-expanded]="compositionExpandedId() === row._id"
                          [attr.aria-controls]="'order-composition-' + row._id"
                          (click)="toggleComposition(row); $event.stopPropagation()"
                          data-test="order-composition-toggle"
                        >
                          <span class="font-medium">Состав заказа</span>
                          <span class="text-xs text-muted-foreground">
                            {{ row.items?.length ?? 0 }}
                            {{ itemCountLabel(row.items?.length ?? 0) }}
                            <span aria-hidden="true">
                              ·
                              {{
                                compositionExpandedId() === row._id ? 'свернуть' : 'раскрыть'
                              }}</span
                            >
                          </span>
                        </button>
                        @if (compositionExpandedId() === row._id) {
                          <div
                            class="border-t hairline border-ink/5 pt-3 mt-1"
                            [id]="'order-composition-' + row._id"
                            data-test="order-composition-panel"
                          >
                            @if ((row.items?.length ?? 0) === 0) {
                              <p class="text-xs text-muted-foreground m-0">В заказе нет изделий.</p>
                            } @else if (
                              compositionForestLoading() && compositionForestOrderId() === row._id
                            ) {
                              <p
                                class="text-sm text-muted-foreground py-3 m-0"
                                data-test="order-composition-loading"
                              >
                                Загрузка состава…
                              </p>
                            } @else if (compositionForestOrderId() === row._id) {
                              <div
                                class="space-y-3 p-2 hairline rounded-sm bg-paper"
                                data-test="order-composition-tree"
                              >
                                @for (
                                  root of compositionForest();
                                  track trackCompositionRoot($index, root)
                                ) {
                                  <app-composition-tree
                                    [root]="root"
                                    [selectedId]="compositionSelectedId()"
                                    [showEdit]="true"
                                    ariaLabel="Состав изделия в заказе"
                                    (expandedChange)="onCompositionExpand($event)"
                                    (selectedChange)="onCompositionSelect($event)"
                                    (editClick)="onCompositionEdit($event)"
                                  />
                                }
                              </div>
                            }
                            <a
                              [routerLink]="['/orders', row._id]"
                              class="text-xs underline underline-offset-2 hover:text-sunrise-warm mt-3 inline-block"
                              (click)="$event.stopPropagation()"
                              >Открыть карточку заказа</a
                            >
                          </div>
                        }
                      </section>
                    </section>

                    <section
                      class="rounded-sm border hairline border-ink/10 bg-paper-raised/85 p-3"
                      data-test="order-group-execution"
                    >
                      <div
                        class="flex items-baseline gap-2 border-b hairline border-ink/5 pb-2 mb-3"
                      >
                        <p class="eyebrow m-0">Исполнение</p>
                        <span class="text-xs text-muted-foreground">цех и готовность</span>
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
                        <section class="min-w-0 flex flex-col gap-1" data-test="order-supply-block">
                          <div class="flex items-baseline gap-3 flex-wrap">
                            <p class="eyebrow m-0">Снабжение</p>
                            <a
                              routerLink="/supply"
                              [queryParams]="{ orderId: row._id }"
                              class="text-xs underline underline-offset-2 hover:text-sunrise-warm"
                              data-test="order-supply-link"
                              (click)="$event.stopPropagation()"
                              >Открыть снабжение</a
                            >
                          </div>
                          @if (supplyExpandLoading() && supplyExpandOrderId() === row._id) {
                            <p class="text-xs text-muted-foreground m-0 mt-1">Загрузка…</p>
                          } @else if (supplyExpandError() && supplyExpandOrderId() === row._id) {
                            <p
                              class="text-xs text-destructive m-0 mt-1"
                              role="alert"
                              data-test="order-supply-error"
                            >
                              {{ supplyExpandError() }}
                            </p>
                          } @else if (
                            supplyExpandOrderId() === row._id && supplyExpandCounters().total === 0
                          ) {
                            <p class="text-xs text-muted-foreground m-0 mt-1">
                              Нет задач снабжения
                            </p>
                          } @else if (supplyExpandOrderId() === row._id) {
                            <p class="text-xs m-0 mt-1" data-test="order-supply-counters">
                              Черновик {{ supplyExpandCounters().draft }} · Подтверждено
                              {{ supplyExpandCounters().confirmed }} · Заказано
                              {{ supplyExpandCounters().ordered }} · Получено
                              {{ supplyExpandCounters().received }}
                              <span class="text-muted-foreground"
                                >· всего {{ supplyExpandCounters().total }}</span
                              >
                            </p>
                          }
                        </section>

                        <section
                          class="min-w-0 flex flex-col gap-1"
                          data-test="order-production-block"
                        >
                          <p class="eyebrow m-0 mb-1">Производство</p>
                          <p class="text-sm m-0">Оценка в цехе</p>
                          <a
                            routerLink="/production"
                            [queryParams]="{ orderId: row._id }"
                            class="text-xs underline underline-offset-2 hover:text-sunrise-warm mt-2 inline-block"
                            data-test="order-production-link"
                            (click)="$event.stopPropagation()"
                            >Открыть производство</a
                          >
                        </section>

                        <section
                          class="min-w-0 flex flex-col gap-1"
                          data-test="order-readiness-block"
                        >
                          <div class="flex items-baseline gap-3 flex-wrap">
                            <p class="eyebrow m-0">Готовность</p>
                            <a
                              [routerLink]="['/orders', row._id]"
                              class="text-xs underline underline-offset-2 hover:text-sunrise-warm"
                              data-test="order-readiness-link"
                              (click)="$event.stopPropagation()"
                              >Открыть заказ</a
                            >
                          </div>
                          <p class="text-sm m-0 mt-1" data-test="order-readiness-summary">
                            {{ readinessLabel(row) }}
                          </p>
                          @if ((row.items?.length ?? 0) === 0) {
                            <p class="text-xs text-muted-foreground m-0 mt-1">
                              Нет линий для готовности.
                            </p>
                          } @else {
                            <ul
                              class="m-0 mt-1 pl-4 space-y-0.5 text-sm"
                              data-test="order-readiness-lines"
                            >
                              @for (item of row.items; track $index) {
                                <li>
                                  {{
                                    item.productName ||
                                      'Изделие ' + item.productId.slice(0, 8) + '…'
                                  }}
                                  ·
                                  <span
                                    [class.text-muted-foreground]="item.readyForWork !== true"
                                    [attr.data-test]="
                                      item.readyForWork === true
                                        ? 'order-readiness-ready'
                                        : 'order-readiness-not-ready'
                                    "
                                  >
                                    {{ item.readyForWork === true ? 'готово' : 'не готово' }}
                                  </span>
                                </li>
                              }
                            </ul>
                          }
                        </section>
                      </div>
                    </section>

                    <section
                      class="rounded-sm border hairline border-ink/10 bg-paper-raised/85 p-3"
                      data-test="order-group-logistics"
                    >
                      <div
                        class="flex items-baseline gap-2 border-b hairline border-ink/5 pb-2 mb-3"
                      >
                        <p class="eyebrow m-0">Логистика</p>
                        <span class="text-xs text-muted-foreground">склад и отгрузка</span>
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <section
                          class="min-w-0 flex flex-col gap-1"
                          data-test="order-warehouse-block"
                        >
                          <div class="flex items-baseline gap-3 flex-wrap">
                            <p class="eyebrow m-0">Склад</p>
                            <a
                              routerLink="/storage-items"
                              class="text-xs underline underline-offset-2 hover:text-sunrise-warm"
                              data-test="order-warehouse-link"
                              (click)="$event.stopPropagation()"
                              >Склад</a
                            >
                          </div>
                          @if (
                            reservationExpandLoading() && reservationExpandOrderId() === row._id
                          ) {
                            <p class="text-xs text-muted-foreground m-0 mt-1">Загрузка…</p>
                          } @else if (
                            reservationExpandError() && reservationExpandOrderId() === row._id
                          ) {
                            <p
                              class="text-xs text-destructive m-0 mt-1"
                              role="alert"
                              data-test="order-warehouse-error"
                            >
                              {{ reservationExpandError() }}
                            </p>
                          } @else if (
                            reservationExpandOrderId() === row._id &&
                            reservationExpandCounters().total === 0
                          ) {
                            <p class="text-xs text-muted-foreground m-0 mt-1">Нет броней</p>
                          } @else if (reservationExpandOrderId() === row._id) {
                            <p class="text-xs m-0 mt-1" data-test="order-warehouse-counters">
                              Активных {{ reservationExpandCounters().active }} · всего
                              {{ reservationExpandCounters().total }}
                            </p>
                          }
                        </section>

                        <section
                          class="min-w-0 flex flex-col gap-1"
                          data-test="order-shipping-block"
                        >
                          <p class="eyebrow m-0 mb-1">Отгрузка</p>
                          <p class="text-sm m-0" data-test="order-shipping-stub">
                            Отгрузка пока не ведётся в интерфейсе. Открыть раздел „Отгрузка“.
                          </p>
                          <a
                            routerLink="/shipping"
                            class="text-xs underline underline-offset-2 hover:text-sunrise-warm mt-2 inline-block"
                            data-test="order-shipping-link"
                            (click)="$event.stopPropagation()"
                            >Открыть раздел „Отгрузка“</a
                          >
                        </section>
                      </div>
                    </section>

                    <section
                      class="rounded-sm border hairline border-ink/10 bg-paper-raised/85 p-3"
                      data-test="order-group-documents"
                    >
                      <div
                        class="flex items-baseline gap-2 border-b hairline border-ink/5 pb-2 mb-3"
                      >
                        <p class="eyebrow m-0">Документы</p>
                        <span class="text-xs text-muted-foreground"
                          >печатные материалы и шаблоны</span
                        >
                      </div>
                      <div class="text-sm">
                        <a
                          routerLink="/doc-constructor/templates"
                          [queryParams]="{ source: 'order', sourceId: row._id }"
                          class="text-xs underline underline-offset-2 hover:text-sunrise-warm"
                          data-test="order-documents-link"
                          (click)="$event.stopPropagation()"
                          >Шаблоны документов</a
                        >
                      </div>
                    </section>
                  </div>
                </div>
              }
            </ng-template>
          </app-pi-table>
        </div>
      </div>
    </app-pi-group-workspace>
  `,
})
export class OrdersPage implements OnInit {
  protected readonly dealsToc = DEALS_TOC_CHIPS;
  protected readonly emptyChips: readonly never[] = [];

  constructor() {
    this.counterpartiesLookup.load();
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const query = params.get('q') ?? '';
      this.search.searchQuery.set(query);
      this.search.debouncedSearch.set(query.trim());
      this.pageSig.set(1);
      this.resetExpansion();
    });
    this.destroyRef.onDestroy(() => this.search.destroy());
  }
  private readonly service = inject(OrdersService);
  private readonly counterpartyService = inject(CounterpartyService);
  private readonly catalog = inject(ProductModulesService);
  private readonly products = inject(ProductsService);
  private readonly materials = inject(MaterialsService);
  private readonly supply = inject(SupplyTaskService);
  private readonly reservations = inject(ReservationsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly RefreshIcon = RefreshCw;

  /** Exposed to template via `[pageSize]="pageSize"`. */
  protected readonly pageSize = PAGE_SIZE;

  /**
   * Page-owned sort signals. Seeded to `'date'`/`'desc'` to MATCH
   * pi-table's internal state after ngOnInit applies the
   * `[initialSortKey]="'date'"` + `[initialSortDir]="'desc'"`
   * bindings (TZ-104.4.2). Both halves of the lockstep cycle start
   * in sync — the round-2 mirror-event handler stays correct on
   * the very first click instead of needing a recovery cycle.
   *
   * Pre-TZ-104.4.2 init: `(null, 'asc')` to align with pi-table's
   * pre-extension internal defaults. After TZ-104.4.2, both sides
   * default to the page's chosen default.
   */
  private readonly sortKeySig = signal<SortKey | null>('date');
  private readonly sortDirSig = signal<'asc' | 'desc'>('desc');

  protected readonly sortKey = this.sortKeySig.asReadonly();
  protected readonly sortDir = this.sortDirSig.asReadonly();

  /** Current page (1-indexed). Bumped via `(pageChange)` from pi-table. */
  private readonly pageSig = signal<number>(1);
  protected readonly page = this.pageSig.asReadonly();

  private readonly counterpartiesLookup = createLookupTable<Counterparty>(
    this.counterpartyService.list({ limit: 200 }),
  );

  /** Single debounced search state — owns its own `searchQuery` signal. */
  private readonly search = createSearchState(300);
  protected readonly searchQuery = this.search.searchQuery;

  protected readonly listRes = httpResource<Order[]>(() => ({
    url: `${this.baseUrl}/orders`,
  }));

  protected readonly data = computed<Order[]>(() => this.listRes.value() ?? []);
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as
      import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  /**
   * Client-side filter: reactive computed reading `data()` (the
   * signal) and `debouncedSearch()` (signal). Fixes the duplicate
   * `searchQuery` bug in the previous source.
   */
  protected readonly filteredRows = computed<Order[]>(() => {
    const rows = this.data();
    const q = this.search.debouncedSearch().trim().toLowerCase();
    if (!q) return rows.slice();
    return rows.filter((o) => {
      const hay = [
        o.number,
        o.deliveryAddress,
        o.notes,
        this.counterpartiesLookup.byId()[counterpartyIdOf(o)]?.name,
        this.counterpartiesLookup.byId()[counterpartyIdOf(o)]?.shortName,
        this.counterpartiesLookup.byId()[counterpartyIdOf(o)]?.inn,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  });

  /**
   * Filtered + sorted rows. Reactive computed reading BOTH
   * `filteredRows()` AND `sortKey/sortDir` — fixes the
   * `sort.sorted(this.filteredRows(), ...)` snapshot bug. Uses
   * custom accessor per key (status cycle index, date
   * chronological, number locale).
   */
  protected readonly sortedRows = computed<Order[]>(() => {
    const rows = this.filteredRows();
    const key = this.sortKeySig();
    if (!key) return rows;
    const sign = this.sortDirSig() === 'asc' ? 1 : -1;
    // TZ-104.4.2: removed `as SortKey` cast — sortKeySig is now
    // typed `SortKey | null` so the cast is no longer needed.
    const accessor = accessorFor(key);
    return rows.slice().sort((a, b) => compareValues(accessor(a), accessor(b), sign));
  });

  /**
   * Total = full filtered+sorted length, NOT page slice. pi-table
   * derives `totalPages = ceil(total / pageSize)` from this and
   * shows the Prev/Next pager accordingly. When `total <= pageSize`,
   * the pager is hidden (`showPager = total > 0 && totalPages > 1`).
   */
  protected readonly total = computed<number>(() => this.sortedRows().length);

  /**
   * Page slice of the sorted+filtered list. Reads `page()` and
   * `sortedRows()` so any change re-computes the slice.
   *
   *   start = (page-1) * pageSize   (0-indexed start)
   *   end   = start + pageSize       (exclusive end)
   */
  protected readonly paginatedRows = computed<Order[]>(() => {
    const all = this.sortedRows();
    const start = (this.pageSig() - 1) * PAGE_SIZE;
    return all.slice(start, start + PAGE_SIZE);
  });

  /** Modal toolbar count: visible rows after filtering (not the page slice). */
  protected readonly visibleCount = computed<number>(() => this.sortedRows().length);

  protected readonly emptyMessage = computed(() =>
    this.searchQuery()
      ? 'Ничего не найдено.'
      : 'Нет заказов. Нажмите «+ Создать заказ», чтобы добавить первый.',
  );

  // ─── Column definitions ────────────────────────────────────────────
  /**
   * Column-set mirroring the pre-migration source's 7 visible columns
   * + the trailing actions slot (auto-injected by `[rowActions]`).
   * - `number` is sticky-left (acts as an ID column per tablet UX)
   * - `date` shows `formatDate(...)` and is `empty-cell` muted
   * - `counterpartyId` is a `cellTemplate` (lookup helper)
   * - `status` sorts via custom `STATUS_CYCLE_INDEX` accessor and
   *   falls through to `ORDER_STATUS_LABELS` format string
   * - `siteId` and `quotationId` use typed cell templates
   * - `readyForWork` is shown as an X/Y operational readiness aggregate
   */
  protected readonly cols: ColumnDef<Order>[] = [
    {
      key: 'number',
      label: 'Номер',
      sortable: true,
      sticky: 'left',
    },
    {
      key: 'date',
      label: 'Дата',
      sortable: true,
      cellClass: 'empty-cell',
      format: (r) => formatDate(r.date),
    },
    {
      key: 'counterpartyId',
      label: 'Заказчик',
      width: '180px',
    },
    {
      key: 'siteId',
      label: 'Объект',
      width: '190px',
    },
    {
      key: 'status',
      label: 'Статус',
      sortable: true,
      cellClass: 'empty-cell',
      format: (r) => ORDER_STATUS_LABELS[r.status] ?? r.status,
    },
    {
      key: 'priority',
      label: 'Приоритет',
      cellClass: 'empty-cell',
      format: (r) => (r.priority ? (PRIORITY_LABELS[r.priority] ?? r.priority) : '—'),
    },
    {
      key: 'items',
      label: 'Позиций',
      cellClass: 'text-muted-foreground',
      format: (r) => String(r.items?.length ?? 0),
    },
    {
      key: 'quotationId',
      label: 'КП',
      width: '150px',
    },
    {
      key: 'readyForWork',
      label: 'Готовность',
      width: '112px',
      format: (r) => this.readinessLabel(r),
    },
  ];

  // ─── Template refs (resolved at view init, static:true → BEFORE ngOnInit) ──
  // TZ-104.4.2: strong typing matches pi-table's re-parameterized
  // `[cellTemplates]` input. Pre-TZ-104.4.2 these were `TemplateRef<any>`.
  @ViewChild('numberTpl', { static: true })
  private readonly numberTplRef!: TemplateRef<{ $implicit: Order }>;
  @ViewChild('counterpartyTpl', { static: true })
  private readonly counterpartyTplRef!: TemplateRef<{ $implicit: Order }>;
  @ViewChild('siteTpl', { static: true })
  private readonly siteTplRef!: TemplateRef<{ $implicit: Order }>;
  @ViewChild('proposalTpl', { static: true })
  private readonly proposalTplRef!: TemplateRef<{ $implicit: Order }>;
  @ViewChild('rowActionsTpl', { static: true })
  private readonly rowActionsTplRef!: TemplateRef<{ $implicit: Order }>;

  /** Built in ngOnInit after ViewChild fields resolve. Stable reference. */
  protected cellTemplates: Record<string, TemplateRef<{ $implicit: Order }>> = {};
  /** Built in ngOnInit; null until then so pi-table defers the slot. */
  protected rowActionsTplBinding: TemplateRef<{ $implicit: Order }> | null = null;

  ngOnInit(): void {
    // Build cell-template map + row-actions binding AFTER static
    // ViewChild fields resolve. Avoids TemplateRef<C> invariance
    // trap and Angular's signal-binding name-collision.
    this.cellTemplates = {
      number: this.numberTplRef,
      counterpartyId: this.counterpartyTplRef,
      siteId: this.siteTplRef,
      quotationId: this.proposalTplRef,
    };
    this.rowActionsTplBinding = this.rowActionsTplRef;
  }

  // ─── Cell template helpers ─────────────────────────────────────────
  /**
   * TZ-104.4.2: `row: Order` (was `unknown` + `as Order` cast).
   */
  protected counterpartyNameOf(row: Order): string | null {
    const value = row.counterpartyId;
    if (value && typeof value !== 'string') {
      return value.name?.trim() || null;
    }
    const id = counterpartyIdOf(row);
    if (!id) return null;
    return (
      this.counterpartiesLookup.byId()[id]?.shortName ??
      this.counterpartiesLookup.byId()[id]?.name ??
      null
    );
  }

  protected siteLabel(value: PopulatedOrderRef | null | undefined): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return [value.name, value.address].filter(Boolean).join(' · ');
  }

  protected totalLabel(n: number): string {
    return pluralize(n, ['заказ', 'заказа', 'заказов']);
  }

  protected proposalIdOf(row: Order): string {
    return refId(row.quotationId as PopulatedOrderRef | null | undefined);
  }

  protected proposalLabelOf(row: Order): string {
    const proposal = row.quotationId;
    if (!proposal) return 'Прямой';
    if (typeof proposal === 'string') return 'КП';
    const number = (proposal.number ?? '').trim();
    const base = number ? `№${number}` : 'КП';
    return proposal.isStub ? `${base} · заглушка` : base;
  }

  protected readinessLabel(row: Order): string {
    const items = row.items ?? [];
    if (items.length === 0) return '—';
    const ready = items.filter((item) => item.readyForWork === true).length;
    return `${ready} из ${items.length}`;
  }

  protected itemCountLabel(count: number): string {
    return pluralize(count, ['позиция', 'позиции', 'позиций']);
  }

  protected readonly compositionExpandedId = signal<string | null>(null);
  protected readonly compositionForest = signal<CompositionTreeNode[]>([]);
  protected readonly compositionForestLoading = signal(false);
  protected readonly compositionForestOrderId = signal<string | null>(null);
  protected readonly compositionSelectedId = signal<string | null>(null);
  private readonly compositionRequestedDepth = signal(ORDER_TREE_INITIAL_DEPTH);
  private compositionLoadSeq = 0;
  private readonly catalogEditBusy = signal(false);
  private compositionExpandRow: Order | null = null;

  protected toggleComposition(row: Order): void {
    const closing = this.compositionExpandedId() === row._id;
    this.compositionExpandedId.set(closing ? null : row._id);
    if (closing) {
      this.clearCompositionForest();
      return;
    }
    this.compositionRequestedDepth.set(ORDER_TREE_INITIAL_DEPTH);
    this.loadCompositionForest(row);
  }

  protected trackCompositionRoot(index: number, root: CompositionTreeNode): string {
    return `${index}:${root._id}`;
  }

  protected onCompositionSelect(ev: CompositionTreeSelectEvent): void {
    this.compositionSelectedId.set(ev.node._id);
    if (isEmptyCatalogBranch(ev.node)) {
      openCatalogEditFromTree(this.catalogEditDeps(), ev);
    }
  }

  protected onCompositionEdit(ev: CompositionTreeEditEvent): void {
    this.compositionSelectedId.set(ev.node._id);
    openCatalogEditFromTree(this.catalogEditDeps(), ev);
  }

  protected onCompositionExpand(ev: CompositionTreeExpandEvent): void {
    if (!ev.expanded) return;
    const row = this.compositionExpandRow;
    if (!row) return;
    const depth = this.depthOfComposition(ev.node);
    if (depth < 0) return;
    const need = Math.min(depth + 2, ORDER_TREE_MAX_DEPTH);
    if (need <= this.compositionRequestedDepth()) return;
    this.compositionRequestedDepth.set(need);
    this.loadCompositionForest(row);
  }

  private catalogEditDeps(): CatalogCompositionEditDeps {
    return {
      dialog: this.dialog,
      products: this.products,
      modules: this.catalog,
      materials: this.materials,
      toast: this.toast,
      injector: this.injector,
      destroyRef: this.destroyRef,
      busy: this.catalogEditBusy,
      onSaved: () => {
        const row = this.compositionExpandRow;
        if (row) this.loadCompositionForest(row);
      },
    };
  }

  private loadCompositionForest(row: Order): void {
    this.compositionExpandRow = row;
    this.compositionForestOrderId.set(row._id);
    const items = row.items ?? [];
    if (items.length === 0) {
      this.compositionForest.set([]);
      this.compositionForestLoading.set(false);
      return;
    }
    const seq = ++this.compositionLoadSeq;
    this.compositionForestLoading.set(true);
    loadOrderCompositionForest(this.catalog, items, this.compositionRequestedDepth()).subscribe(
      (roots) => {
        if (seq !== this.compositionLoadSeq) return;
        this.compositionForestLoading.set(false);
        this.compositionForest.set(roots);
      },
    );
  }

  private clearCompositionForest(): void {
    this.compositionExpandRow = null;
    this.compositionForestOrderId.set(null);
    this.compositionForest.set([]);
    this.compositionForestLoading.set(false);
    this.compositionSelectedId.set(null);
    this.compositionRequestedDepth.set(ORDER_TREE_INITIAL_DEPTH);
  }

  private depthOfComposition(
    target: CompositionTreeNode,
    roots: CompositionTreeNode[] = this.compositionForest(),
  ): number {
    for (const root of roots) {
      const found = this.depthInComposition(target, root, 0);
      if (found !== -1) return found;
    }
    return -1;
  }

  private depthInComposition(
    target: CompositionTreeNode,
    node: CompositionTreeNode,
    depth: number,
  ): number {
    if (node._id === target._id) return depth;
    for (const child of node.children) {
      const found = this.depthInComposition(target, child, depth + 1);
      if (found !== -1) return found;
    }
    return -1;
  }

  protected readonly expandedId = signal<string | null>(null);
  protected readonly isExpandedRow = (row: Order): boolean => this.expandedId() === row._id;
  protected readonly expandedRowLabel = (row: Order): string => `Сводка заказа: ${row.number}`;

  /** HUB-303: lazy supply summary for the currently expanded row only. */
  protected readonly supplyExpandOrderId = signal<string | null>(null);
  protected readonly supplyExpandLoading = signal(false);
  protected readonly supplyExpandError = signal<string | null>(null);
  protected readonly supplyExpandCounters = signal<SupplyExpandCounters>({
    ...EMPTY_SUPPLY_COUNTERS,
  });

  /** HUB-304: lazy reservations by Order.number for the expanded row. */
  protected readonly reservationExpandOrderId = signal<string | null>(null);
  protected readonly reservationExpandLoading = signal(false);
  protected readonly reservationExpandError = signal<string | null>(null);
  protected readonly reservationExpandCounters = signal<ReservationExpandCounters>({
    ...EMPTY_RESERVATION_COUNTERS,
  });

  protected onRowClick(row: Order): void {
    const closing = this.expandedId() === row._id;
    this.expandedId.update((current) => (current === row._id ? null : row._id));
    if (closing) {
      this.clearSupplyExpand();
      this.clearReservationExpand();
      return;
    }
    this.loadSupplyExpand(row._id);
    this.loadReservationExpand(row._id, row.number);
  }

  private resetExpansion(): void {
    this.expandedId.set(null);
    this.compositionExpandedId.set(null);
    this.clearCompositionForest();
    this.clearSupplyExpand();
    this.clearReservationExpand();
  }

  private clearSupplyExpand(): void {
    this.supplyExpandOrderId.set(null);
    this.supplyExpandLoading.set(false);
    this.supplyExpandError.set(null);
    this.supplyExpandCounters.set({ ...EMPTY_SUPPLY_COUNTERS });
  }

  private clearReservationExpand(): void {
    this.reservationExpandOrderId.set(null);
    this.reservationExpandLoading.set(false);
    this.reservationExpandError.set(null);
    this.reservationExpandCounters.set({ ...EMPTY_RESERVATION_COUNTERS });
  }

  private loadSupplyExpand(orderId: string): void {
    this.supplyExpandOrderId.set(orderId);
    this.supplyExpandLoading.set(true);
    this.supplyExpandError.set(null);
    this.supplyExpandCounters.set({ ...EMPTY_SUPPLY_COUNTERS });
    this.supply.list({ orderId }).subscribe((res) => {
      if (this.expandedId() !== orderId) return;
      this.supplyExpandLoading.set(false);
      if (!res.ok) {
        this.supplyExpandError.set(
          extractErrorMessage(res.error) || 'Не удалось загрузить задачи снабжения',
        );
        this.supplyExpandCounters.set({ ...EMPTY_SUPPLY_COUNTERS });
        return;
      }
      this.supplyExpandCounters.set(this.countSupplyStatuses(res.data ?? []));
    });
  }

  /** Query by business number (`Order.number`), never `reservationIds[]`. */
  private loadReservationExpand(orderMongoId: string, orderNumber: string): void {
    this.reservationExpandOrderId.set(orderMongoId);
    this.reservationExpandLoading.set(true);
    this.reservationExpandError.set(null);
    this.reservationExpandCounters.set({ ...EMPTY_RESERVATION_COUNTERS });
    this.reservations.list(orderNumber).subscribe((res) => {
      if (this.expandedId() !== orderMongoId) return;
      this.reservationExpandLoading.set(false);
      if (!res.ok) {
        this.reservationExpandError.set(
          extractErrorMessage(res.error) || 'Не удалось загрузить брони',
        );
        this.reservationExpandCounters.set({ ...EMPTY_RESERVATION_COUNTERS });
        return;
      }
      this.reservationExpandCounters.set(this.countReservations(res.data ?? []));
    });
  }

  private countSupplyStatuses(tasks: SupplyTask[]): SupplyExpandCounters {
    const counters: SupplyExpandCounters = { ...EMPTY_SUPPLY_COUNTERS };
    for (const task of tasks) {
      counters[task.status] = (counters[task.status] ?? 0) + 1;
      counters.total += 1;
    }
    return counters;
  }

  private countReservations(list: Reservation[]): ReservationExpandCounters {
    let active = 0;
    for (const r of list) {
      if (r.status === 'active') active += 1;
    }
    return { active, total: list.length };
  }

  // ─── Event handlers ───────────────────────────────────────────────
  protected onSearchInput(event: Event): void {
    this.search.onSearchInput(event);
    // Reset to first page when the filter set changes so users don't
    // land on an out-of-range page of a (possibly empty) filter set.
    this.pageSig.set(1);
    this.resetExpansion();
  }

  protected onPageChange(p: number): void {
    this.pageSig.set(p);
    this.resetExpansion();
  }

  /**
   * Page-owned sort handler. `[localSort]="false"` keeps pi-table
   * from re-sorting the visible page slice, and this handler simply
   * MIRRORS pi-table's sortChange emit into the page's sort signals.
   *
   * Why mirror rather than re-derive? pi-table's internal sort
   * signals are private (no public API to set them externally).
   * The handler MUST advance the page's state to exactly match
   * pi-table's, otherwise the cycles phase-shift: pi-table starts
   * at `(null, null-dir)` while the page starts at `(null, 'asc')`,
   * which means an over-engineered "re-derive" handler would diverge
   * from pi-table on the very second click of a column. Mirroring
   * the event keeps them in lockstep regardless of starting state.
   *
   * pi-table's emit contract: `{key, dir: SortDirection}` where dir
   * ∈ {'asc' | 'desc' | null}. When `dir === null`, pi-table has
   * cleared its key (third click past desc). Page mirrors by
   * clearing its own sort key (sortKeySig → null) and falling back
   * sortDirSig to 'asc' as a no-visual-effect placeholder.
   */
  protected onSortChange(event: { key: string; dir: SortDirection }): void {
    // pi-table's `sortChange` output type is `{ key: string, ... }`
    // — pi-table doesn't statically know about this page's `SortKey`
    // union, so a single boundary cast is required at the event
    // ingestion point. Once stored in `sortKeySig` (typed
    // `SortKey | null`), no further casts are needed downstream.
    this.sortKeySig.set(event.dir === null ? null : (event.key as SortKey));
    this.sortDirSig.set(event.dir === null ? 'asc' : event.dir);
    // Reset to first page on every sort change so users see the
    // first rows of the freshly ordered set.
    this.pageSig.set(1);
    this.resetExpansion();
  }

  protected openCreate(): void {
    const ref = this.dialog.open(OrderFormDialogComponent, {
      data: null,
      width: 'lg',
    });
    this.refreshOnDialogClose(ref);
  }

  protected openEdit(order: Order): void {
    const ref = this.dialog.open(OrderFormDialogComponent, {
      data: order,
      width: 'lg',
    });
    this.refreshOnDialogClose(ref);
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
      parentDestroyRef: this.destroyRef,
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

  protected onCreateDocument(row: Order): void {
    this.router.navigate(['/doc-constructor/templates'], {
      queryParams: { source: 'order', sourceId: row._id },
    });
  }

  protected reload(): void {
    this.listRes.reload();
  }

  private refreshOnDialogClose(ref: DialogRef<unknown>): void {
    onDialogCloseOnce(ref, this.injector, () => {
      this.counterpartiesLookup.load();
      this.listRes.reload();
    });
  }
}
