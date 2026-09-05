import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  PiCompositionService,
  PiReservationsService,
  PiSupplyRequestsService,
  type CompositionTreeNode,
  type Order,
  type OrderItem,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { CompositionTreeComponent, type CompositionTreeSelectEvent } from '../composition/composition-tree.component';
import { orderStatusLabel } from './order-status';

type SupplyCounters = { readonly ordered: number; readonly received: number; readonly total: number };
type ReservationCounters = { readonly active: number; readonly total: number };

const EMPTY_SUPPLY_COUNTERS: SupplyCounters = { ordered: 0, received: 0, total: 0 };
const EMPTY_RESERVATION_COUNTERS: ReservationCounters = { active: 0, total: 0 };

/**
 * Order hub expand — hub-only (TZ-NX-DEALS-D2). No desk-write controls (confirm,
 * ship, add-line, notebook, cancel-shipment) — those stay legacy-only until a
 * dedicated `/desk` route ships (out of this wave). Groups per PO visual lock
 * (2026-08-15, `docs/pages/orders.page.md` § Визуальная иерархия expand):
 * Заказ → Исполнение (Снабжение/Производство/Готовность) → Логистика (Склад/Отгрузка) → Документы.
 */
@Component({
  selector: 'app-order-hub-tray',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CompositionTreeComponent],
  template: `
    <div
      class="order-hub-tray bg-paper-2 border-t hairline"
      data-test="order-hub-tray"
      role="region"
      [attr.aria-label]="'Сводка заказа: ' + order().number"
    >
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 p-4" data-test="order-lifecycle-groups">
        <!-- Заказ -->
        <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="order-group-order">
          <button
            type="button"
            class="flex items-center gap-3 w-full min-h-touch text-left text-sm pi-focus-ring rounded-sm hover:bg-paper-2 px-2 -mx-2"
            [attr.aria-expanded]="compositionExpanded()"
            (click)="toggleComposition()"
            data-test="order-composition-toggle"
          >
            <span class="font-medium">Состав заказа</span>
            <span class="flex-1"></span>
            <span class="text-xs text-muted-foreground">
              {{ order().items?.length ?? 0 }} поз.
            </span>
            <span class="border hairline px-2 py-0.5 text-xs rounded-sm" aria-hidden="true">
              {{ compositionExpanded() ? 'свернуть' : 'раскрыть' }}
            </span>
          </button>
          @if (compositionExpanded()) {
            <div class="border-t hairline pt-3 mt-3" data-test="order-composition-panel">
              @if ((order().items?.length ?? 0) === 0) {
                <p class="text-xs text-muted-foreground m-0">Состав пуст.</p>
              } @else if (compositionLoading()) {
                <p class="text-sm text-muted-foreground py-3 m-0" data-test="order-composition-loading">
                  Загрузка состава…
                </p>
              } @else {
                <div class="space-y-3" data-test="order-composition-tree">
                  @for (item of order().items ?? []; track trackItem($index, item)) {
                    <div>
                      <div class="text-xs text-muted-foreground mb-1" data-test="order-item-fact">
                        {{ lineLabel(item) }} ·
                        {{ item.readyForWork === true ? 'готово' : 'не готово' }}
                      </div>
                      @if (compositionRoots()[$index]; as root) {
                        <pi-composition-tree
                          [root]="root"
                          [selectedId]="compositionSelectedId()"
                          ariaLabel="Состав изделия в заказе"
                          (selectedChange)="onCompositionSelect($event)"
                        />
                      } @else {
                        <p class="text-xs text-muted-foreground m-0" data-test="order-composition-line">
                          {{ lineLabel(item) }}
                        </p>
                      }
                    </div>
                  }
                </div>
              }
              <a
                [routerLink]="['/orders', order()._id]"
                class="min-h-touch px-3 py-1.5 mt-3 inline-flex items-center border border-rule-strong rounded-sm bg-transparent text-sm"
                (click)="$event.stopPropagation()"
                >Открыть карточку заказа</a
              >
            </div>
          }
        </section>

        <!-- Исполнение: Снабжение + Производство + Готовность -->
        <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="order-group-execution">
          <h3 class="text-sm font-medium text-ink m-0 mb-3">Исполнение</h3>

          <section class="min-w-0 flex flex-col gap-1.5" data-test="order-supply-block">
            <div class="flex items-baseline gap-3 flex-wrap">
              <span class="text-xs text-muted-foreground">Снабжение</span>
              <a
                routerLink="/supply"
                [queryParams]="{ orderId: order()._id }"
                class="min-h-touch px-2 py-1 ml-auto inline-flex items-center border border-rule-strong rounded-sm bg-transparent text-xs"
                data-test="order-supply-link"
                (click)="$event.stopPropagation()"
                >Снабжение</a
              >
            </div>
            @if (supplyLoading()) {
              <p class="text-xs text-muted-foreground m-0">Загрузка…</p>
            } @else if (supplyError()) {
              <p class="text-xs text-destructive m-0" role="alert" data-test="order-supply-error">
                {{ supplyError() }}
              </p>
            } @else if (supplyCounters().total === 0) {
              <p class="text-xs text-muted-foreground m-0">Нет задач снабжения</p>
            } @else {
              <p class="text-xs m-0" data-test="order-supply-counters">
                Заказано {{ supplyCounters().ordered }} · Получено {{ supplyCounters().received }} · всего
                {{ supplyCounters().total }}
              </p>
            }
          </section>

          <section
            class="min-w-0 flex flex-col gap-1.5 border-t hairline pt-3 mt-3"
            data-test="order-production-block"
          >
            <div class="flex items-baseline gap-3 flex-wrap">
              <span class="text-xs text-muted-foreground">Производство</span>
              <a
                routerLink="/production"
                [queryParams]="{ orderId: order()._id }"
                class="min-h-touch px-2 py-1 ml-auto inline-flex items-center border border-rule-strong rounded-sm bg-transparent text-xs"
                data-test="order-production-link"
                (click)="$event.stopPropagation()"
                >Производство</a
              >
            </div>
            <p class="text-xs text-muted-foreground m-0">Оценка в цехе</p>
          </section>

          <section
            class="min-w-0 flex flex-col gap-1 border-t hairline pt-3 mt-3"
            data-test="order-readiness-block"
          >
            <div class="flex items-baseline gap-3 flex-wrap">
              <span class="text-xs text-muted-foreground">Готовность</span>
              <span class="text-sm m-0 font-medium" data-test="order-readiness-summary">
                {{ readinessLabel() }}
              </span>
              <a
                [routerLink]="['/orders', order()._id]"
                class="min-h-touch px-2 py-1 ml-auto inline-flex items-center border border-rule-strong rounded-sm bg-transparent text-xs"
                data-test="order-readiness-link"
                (click)="$event.stopPropagation()"
                >Открыть заказ</a
              >
            </div>
            @if ((order().items?.length ?? 0) > 0) {
              <ul class="m-0 mt-1 pl-4 space-y-0.5 text-sm" data-test="order-readiness-lines">
                @for (item of order().items ?? []; track trackItem($index, item)) {
                  <li>
                    {{ lineLabel(item) }} ·
                    <span
                      [class.text-muted-foreground]="item.readyForWork !== true"
                      [attr.data-test]="item.readyForWork === true ? 'order-readiness-ready' : 'order-readiness-not-ready'"
                    >
                      {{ item.readyForWork === true ? 'готово' : 'не готово' }}
                    </span>
                  </li>
                }
              </ul>
            }
          </section>
        </section>

        <!-- Логистика: Склад + Отгрузка -->
        <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="order-group-logistics">
          <h3 class="text-sm font-medium text-ink m-0 mb-3">Логистика</h3>

          <section class="min-w-0 flex flex-col gap-1" data-test="order-warehouse-block">
            <div class="flex items-baseline gap-3 flex-wrap">
              <span class="text-xs text-muted-foreground">Склад</span>
              <a
                routerLink="/storage-items"
                class="min-h-touch px-2 py-1 ml-auto border border-rule-strong rounded-sm bg-transparent text-xs"
                data-test="order-warehouse-link"
                (click)="$event.stopPropagation()"
                >Открыть</a
              >
            </div>
            @if (reservationLoading()) {
              <p class="text-xs text-muted-foreground m-0 mt-1">Загрузка…</p>
            } @else if (reservationError()) {
              <p class="text-xs text-destructive m-0 mt-1" role="alert" data-test="order-warehouse-error">
                {{ reservationError() }}
              </p>
            } @else if (reservationCounters().total === 0) {
              <p class="text-xs text-muted-foreground m-0 mt-1">Нет броней</p>
            } @else {
              <p class="text-xs m-0 mt-1" data-test="order-warehouse-counters">
                Активных {{ reservationCounters().active }} · всего {{ reservationCounters().total }}
              </p>
            }
          </section>

          <section
            class="min-w-0 flex flex-col gap-1 border-t hairline pt-3 mt-3"
            data-test="order-shipping-block"
          >
            <div class="flex items-baseline gap-3 flex-wrap">
              <span class="text-xs text-muted-foreground">Отгрузка</span>
              <a
                routerLink="/shipping"
                class="min-h-touch px-2 py-1 ml-auto border border-rule-strong rounded-sm bg-transparent text-xs"
                data-test="order-shipping-link"
                (click)="$event.stopPropagation()"
                >Открыть раздел „Отгрузка“</a
              >
            </div>
            <p class="text-xs text-muted-foreground m-0 mt-1" data-test="order-shipping-summary">
              {{ statusLabel(order().status) }}
            </p>
          </section>
        </section>

        <!-- Документы -->
        <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="order-group-documents">
          <h3 class="text-sm font-medium text-ink m-0 mb-3">Документы</h3>
          <a
            routerLink="/doc-constructor/templates"
            [queryParams]="{ source: 'order', sourceId: order()._id }"
            class="text-xs underline underline-offset-2 hover:text-sunrise-warm"
            data-test="order-documents-link"
            (click)="$event.stopPropagation()"
            >Шаблоны документов</a
          >
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class OrderHubTrayComponent implements OnInit {
  readonly order = input.required<Order>();

  private readonly compositionApi = inject(PiCompositionService);
  private readonly supplyApi = inject(PiSupplyRequestsService);
  private readonly reservationsApi = inject(PiReservationsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly compositionExpanded = signal(false);
  protected readonly compositionLoading = signal(false);
  protected readonly compositionRoots = signal<readonly (CompositionTreeNode | null)[]>([]);
  protected readonly compositionSelectedId = signal<string | null>(null);
  private compositionLoaded = false;

  protected readonly supplyLoading = signal(false);
  protected readonly supplyError = signal<string | null>(null);
  protected readonly supplyCounters = signal<SupplyCounters>(EMPTY_SUPPLY_COUNTERS);

  protected readonly reservationLoading = signal(false);
  protected readonly reservationError = signal<string | null>(null);
  protected readonly reservationCounters = signal<ReservationCounters>(EMPTY_RESERVATION_COUNTERS);

  protected readonly statusLabel = orderStatusLabel;

  ngOnInit(): void {
    // Row-expand-lazy (HUB-303 budget: supply=1 + reservations=1). Composition
    // stays behind its own disclosure — loaded only on first toggle.
    this.loadSupply();
    this.loadReservations();
  }

  protected trackItem(index: number, item: OrderItem): string {
    return `${index}:${item.productId}`;
  }

  protected lineLabel(item: OrderItem): string {
    return item.productName || `Изделие ${item.productId.slice(0, 8)}…`;
  }

  protected readinessLabel(): string {
    const items = this.order().items ?? [];
    if (items.length === 0) return '—';
    const ready = items.filter((item) => item.readyForWork === true).length;
    return `${ready} из ${items.length}`;
  }

  protected onCompositionSelect(ev: CompositionTreeSelectEvent): void {
    this.compositionSelectedId.set(ev.node._id);
  }

  protected toggleComposition(): void {
    this.compositionExpanded.update((open) => !open);
    if (this.compositionExpanded() && !this.compositionLoaded) {
      this.loadComposition();
    }
  }

  private loadComposition(): void {
    const items = this.order().items ?? [];
    if (items.length === 0) return;
    this.compositionLoaded = true;
    this.compositionLoading.set(true);
    forkJoin(items.map((item) => this.compositionApi.getProductTree(item.productId)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results) => {
        this.compositionLoading.set(false);
        this.compositionRoots.set(results.map((res) => (res.ok ? res.data : null)));
      });
  }

  private loadSupply(): void {
    this.supplyLoading.set(true);
    this.supplyError.set(null);
    this.supplyApi
      .list({ orderId: this.order()._id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.supplyLoading.set(false);
        if (!res.ok) {
          this.supplyError.set(extractErrorMessage(res.error) || 'Не удалось загрузить задачи снабжения');
          return;
        }
        const tasks = res.data ?? [];
        this.supplyCounters.set({
          ordered: tasks.filter((task) => task.status === 'ordered').length,
          received: tasks.filter((task) => task.status === 'received').length,
          total: tasks.length,
        });
      });
  }

  private loadReservations(): void {
    this.reservationLoading.set(true);
    this.reservationError.set(null);
    this.reservationsApi
      .list({ orderId: this.order().number })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.reservationLoading.set(false);
        if (!res.ok) {
          this.reservationError.set(extractErrorMessage(res.error) || 'Не удалось загрузить брони');
          return;
        }
        const rows = res.data ?? [];
        this.reservationCounters.set({
          active: rows.filter((row) => row.status === 'active').length,
          total: rows.length,
        });
      });
  }
}
