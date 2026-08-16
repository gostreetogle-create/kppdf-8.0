import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  inject,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { LucideAngularModule, Pencil } from 'lucide-angular';
import { PiPageChromeComponent, PageCrumb } from '../../shared/page/pi-page-chrome.component';
import { BoardLane, Order, OrderItem, OrdersService } from '../orders/orders.service';
import { DashboardDialogService } from '../../shared/services/dashboard-dialog.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { API_BASE_URL } from '../../core/api.tokens';
import { extractErrorMessage } from '../../core/silent-http';

/** Flat card on Комбайн: one OrderItem + order badge context. */
export interface CombineItemCard {
  key: string;
  orderId: string;
  orderNumber: string;
  lineId: string;
  itemIndex: number;
  productName: string;
  quantity: number;
  unit?: string;
  boardLane: BoardLane;
  order: Order;
  item: OrderItem;
}

export interface CombineColumn {
  id: BoardLane;
  title: string;
  helper: string;
}

type LaneSnapshot = { orderId: string; lineId: string; boardLane: BoardLane };

/** TZ-COMBINE-402 legacy: OrderItem.status → boardLane when lane missing. */
const STATUS_TO_BOARD_LANE: Record<NonNullable<OrderItem['status']>, BoardLane> = {
  pending: 'prep',
  in_production: 'shop',
  ready: 'to_ship',
  shipped: 'shipped',
};

const SHIP_READY_LANES: ReadonlySet<BoardLane> = new Set(['to_ship', 'shipped']);
const SHOP_ENTERED_LANES: ReadonlySet<BoardLane> = new Set(['shop', 'to_ship', 'shipped']);

@Component({
  selector: 'app-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, PiPageChromeComponent, CdkDropList, CdkDrag],
  template: `
    <app-pi-page-chrome [crumbs]="crumbs" title="Комбайн заказов" />

    <!-- Analytics Panel -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="p-4 rounded-sm border hairline bg-paper flex flex-col gap-1">
        <span class="text-xs text-muted-foreground uppercase tracking-wider">Новые</span>
        <span class="text-2xl font-display">{{ stats().new }}</span>
      </div>
      <div class="p-4 rounded-sm border hairline bg-paper flex flex-col gap-1">
        <span class="text-xs text-muted-foreground uppercase tracking-wider">В работе</span>
        <span class="text-2xl font-display">{{ stats().inProgress }}</span>
      </div>
      <div class="p-4 rounded-sm border hairline bg-paper flex flex-col gap-1">
        <span class="text-xs text-muted-foreground uppercase tracking-wider">Готовы</span>
        <span class="text-2xl font-display">{{ stats().ready }}</span>
      </div>
      <div class="p-4 rounded-sm border hairline bg-paper flex flex-col gap-1">
        <span class="text-xs text-muted-foreground uppercase tracking-wider">Просрочены</span>
        <span class="text-2xl font-display text-destructive">{{ stats().overdue }}</span>
      </div>
    </div>

    @if (error()) {
      <div
        class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
      >
        {{ error() }}
      </div>
    }

    <div class="mb-4 flex items-center gap-3">
      <label class="text-sm text-muted-foreground" for="combine-order-filter">Заказ</label>
      <select
        id="combine-order-filter"
        class="border hairline rounded-sm bg-paper px-3 py-1.5 text-sm min-w-[12rem]"
        [value]="filterOrderId()"
        (change)="onFilterChange($event)"
      >
        <option value="">Все заказы</option>
        @for (order of data(); track order._id) {
          <option [value]="order._id">№{{ order.number }}</option>
        }
      </select>
    </div>

    <!-- Kanban Board: item cards by boardLane + CDK DnD (TZ-COMBINE-405). -->
    <div class="flex gap-4 overflow-x-auto pb-4 min-h-[60vh]">
      @for (col of columns; track col.id) {
        <div
          class="flex-shrink-0 w-80 flex flex-col bg-paper-raised/50 rounded-sm border hairline overflow-hidden"
        >
          <div class="p-3 border-b hairline bg-paper">
            <div class="font-medium flex justify-between items-center">
              <span>{{ col.title }}</span>
              <span class="text-xs text-muted-foreground bg-ink/5 px-2 py-0.5 rounded-full">
                {{ columnCards(col.id).length }}
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-1 leading-snug">{{ col.helper }}</p>
          </div>

          <div
            class="flex-1 p-2 flex flex-col gap-2 overflow-y-auto min-h-[8rem]"
            cdkDropList
            [id]="col.id"
            [cdkDropListData]="col.id"
            [cdkDropListConnectedTo]="connectedLists"
            (cdkDropListDropped)="dropItem($event)"
          >
            @for (card of columnCards(col.id); track card.key) {
              <div
                cdkDrag
                [cdkDragData]="card"
                class="bg-paper border hairline rounded-sm p-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-ink/20 transition-colors"
              >
                <div class="flex justify-between items-start gap-2 mb-2">
                  <button
                    type="button"
                    class="font-mono text-xs font-medium hover:underline text-left shrink-0"
                    (click)="openOrder(card.order); $event.stopPropagation()"
                    title="Открыть заказ"
                  >
                    №{{ card.orderNumber }}
                  </button>
                  <button
                    type="button"
                    class="text-muted-foreground hover:text-ink p-1 -mr-1 -mt-1 rounded-sm hover:bg-ink/5 shrink-0"
                    (click)="editProduct(card.item.productId); $event.stopPropagation()"
                    title="Редактировать изделие"
                  >
                    <lucide-icon [img]="PencilIcon" [size]="14"></lucide-icon>
                  </button>
                </div>

                <button
                  type="button"
                  class="text-sm font-medium text-left w-full line-clamp-2 hover:underline"
                  [title]="card.productName"
                  (click)="openOrder(card.order)"
                >
                  {{ card.productName }}
                </button>

                <div class="text-xs text-muted-foreground mt-2">
                  {{ card.quantity }} {{ card.unit || 'шт' }}
                </div>
              </div>
            }
            @if (columnCards(col.id).length === 0) {
              <div class="text-xs text-muted-foreground text-center py-6">Нет изделий</div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardPage {
  // TZ-NAV-303: Комбайн переехал под Проект — /design/combine.
  protected readonly crumbs: PageCrumb[] = [
    { label: 'Проектирование', link: '/design' },
    { label: 'Комбайн' },
  ];
  protected readonly PencilIcon = Pencil;

  private readonly dashboardDialogs = inject(DashboardDialogService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly orders = inject(OrdersService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly baseUrl = inject(API_BASE_URL);

  protected readonly listRes = httpResource<Order[]>(() => ({
    url: `${this.baseUrl}/orders`,
  }));

  protected readonly data = computed<Order[]>(() => this.listRes.value() ?? []);
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as
      import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  /** TZ-COMBINE-404: колонки = boardLane + RU title + helper. */
  protected readonly columns: CombineColumn[] = [
    {
      id: 'prep',
      title: 'Комплектация',
      helper: 'Состав / модули / материалы — к чертежу',
    },
    {
      id: 'design',
      title: 'Проектирование',
      helper: 'Чертежи, виды работ, сроки',
    },
    {
      id: 'shop',
      title: 'В цехе',
      helper: 'План на Ганте; первый вход → freeze состава заказа',
    },
    {
      id: 'to_ship',
      title: 'К отгрузке',
      helper: 'Готово к документам',
    },
    {
      id: 'shipped',
      title: 'Отгружены',
      helper: 'Только отгрузка целого заказа (не PATCH lane)',
    },
  ];

  protected readonly connectedLists = this.columns.map((c) => c.id);

  protected readonly filterOrderId = signal<string>('');

  constructor() {
    this.listRes.reload();
  }

  protected stats = computed(() => {
    const orders = this.data();
    const now = new Date();
    let newOrders = 0;
    let inProgress = 0;
    let ready = 0;
    let overdue = 0;

    for (const o of orders) {
      if (o.status === 'draft' || o.status === 'confirmed') newOrders++;
      if (o.status === 'in_production') inProgress++;
      if (o.status === 'ready') ready++;

      const deadline = o.plannedDate ? new Date(o.plannedDate) : null;
      if (deadline && deadline < now && !['shipped', 'delivered', 'cancelled'].includes(o.status)) {
        overdue++;
      }
    }

    return { new: newOrders, inProgress, ready, overdue };
  });

  /** Flat OrderItems from all (filtered) orders. */
  protected readonly itemCards = computed<CombineItemCard[]>(() => {
    const filter = this.filterOrderId();
    const cards: CombineItemCard[] = [];
    for (const order of this.data()) {
      if (filter && order._id !== filter) continue;
      const items = order.items ?? [];
      items.forEach((item, index) => {
        const lineId = item.lineId || `legacy-${index}-${order._id}`;
        const boardLane = this.boardLaneOf(item);
        cards.push({
          key: `${order._id}:${lineId}`,
          orderId: order._id,
          orderNumber: order.number,
          lineId,
          itemIndex: index,
          productName: item.productName || `Изделие ${item.productId.slice(0, 8)}`,
          quantity: item.quantity,
          unit: item.unit,
          boardLane,
          order,
          item,
        });
      });
    }
    return cards;
  });

  protected columnCards(colId: BoardLane): CombineItemCard[] {
    return this.itemCards().filter((c) => c.boardLane === colId);
  }

  protected boardLaneOf(item: OrderItem): BoardLane {
    if (item.boardLane) return item.boardLane;
    return STATUS_TO_BOARD_LANE[item.status ?? 'pending'] ?? 'prep';
  }

  protected onFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filterOrderId.set(select.value);
  }

  protected openOrder(order: Order): void {
    this.dashboardDialogs.openOrderEdit(order, this.injector, () => this.listRes.reload());
  }

  protected editProduct(productId: string): void {
    this.dashboardDialogs.openProductEdit(productId, this.injector, () => this.listRes.reload());
  }

  /**
   * TZ-COMBINE-405 — drop изделия между колонками boardLane.
   * «Отгружены» → ship-whole gate (не PATCH lane=shipped).
   * Первый вход в shop → freeze modal.
   */
  protected dropItem(event: CdkDragDrop<BoardLane>): void {
    if (event.previousContainer === event.container) return;

    const card = event.item.data as CombineItemCard | undefined;
    const targetLane = event.container.id as BoardLane;
    if (!card || !targetLane) return;
    if (card.boardLane === targetLane) return;

    const order = this.data().find((o) => o._id === card.orderId);
    if (!order) return;

    if (targetLane === 'shipped') {
      this.handleShipDrop(order);
      return;
    }

    if (!card.item.lineId) {
      this.toast.error('У изделия нет lineId — обновите заказ и повторите.');
      return;
    }

    if (targetLane === 'shop' && this.isFirstShopEntry(order)) {
      this.confirmFreezeThenPatch(order, card.item.lineId, targetLane);
      return;
    }

    this.applyLanePatch(order, card.item.lineId, targetLane);
  }

  /** Все линии ещё не входили в shop/to_ship/shipped → первый вход в цех. */
  protected isFirstShopEntry(order: Order): boolean {
    return !(order.items ?? []).some((item) => SHOP_ENTERED_LANES.has(this.boardLaneOf(item)));
  }

  /** Линии не в to_ship/shipped — сколько «ещё не готовы» к отгрузке. */
  protected countNotShipReady(order: Order): number {
    return (order.items ?? []).filter((item) => !SHIP_READY_LANES.has(this.boardLaneOf(item)))
      .length;
  }

  private handleShipDrop(order: Order): void {
    const notReady = this.countNotShipReady(order);
    if (notReady > 0) {
      this.toast.error(`Ещё ${notReady} изделий не готовы`);
      return;
    }
    this.confirmShip(order);
  }

  private confirmFreezeThenPatch(order: Order, lineId: string, lane: BoardLane): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Состав заказа будет заморожен. Добавить изделия после этого нельзя.',
        confirmLabel: 'Продолжить',
        cancelLabel: 'Отмена',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.applyLanePatch(order, lineId, lane);
    });
  }

  /** TZ-SWEEP-401 pattern: confirm → POST /ship (не PATCH lane). */
  private confirmShip(order: Order): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: `Создать отгрузку по заказу №${order.number}?`,
        description: 'Появится документ отгрузки.',
        confirmLabel: 'Отгрузить',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      const snapshot = this.laneSnapshot();
      this.applyOptimisticShip(order);
      this.orders.ship(order._id, {}).subscribe((res) => {
        if (res.ok) {
          this.replaceOrder(res.data);
        } else {
          this.restoreLanes(snapshot);
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  private applyLanePatch(order: Order, lineId: string, lane: BoardLane): void {
    const snapshot = this.laneSnapshot();
    this.setItemLane(order._id, lineId, lane);

    this.orders.patchLane(order._id, lineId, lane).subscribe((res) => {
      if (res.ok) {
        this.replaceOrder(res.data);
      } else {
        this.restoreLanes(snapshot);
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  private laneSnapshot(): LaneSnapshot[] {
    const out: LaneSnapshot[] = [];
    for (const order of this.data()) {
      for (const item of order.items ?? []) {
        if (!item.lineId) continue;
        out.push({
          orderId: order._id,
          lineId: item.lineId,
          boardLane: this.boardLaneOf(item),
        });
      }
    }
    return out;
  }

  private restoreLanes(snapshot: LaneSnapshot[]): void {
    for (const s of snapshot) {
      this.setItemLane(s.orderId, s.lineId, s.boardLane);
    }
  }

  private setItemLane(orderId: string, lineId: string, lane: BoardLane): void {
    const order = this.data().find((o) => o._id === orderId);
    const item = order?.items?.find((i) => i.lineId === lineId);
    if (item) item.boardLane = lane;
  }

  private applyOptimisticShip(order: Order): void {
    order.status = 'shipped';
    for (const item of order.items ?? []) {
      item.boardLane = 'shipped';
      item.status = 'shipped';
    }
  }

  private replaceOrder(updated: Order): void {
    this.listRes.value.set(this.data().map((o) => (o._id === updated._id ? updated : o)));
  }

  /**
   * Kept for specs / rollup stats: «X из Y» by item.status ∈ {ready, shipped}.
   * НЕ OR-ит readyForWork (гейт /orders, HUB-304).
   */
  protected readinessLabel(order: Order): string {
    const items = order.items ?? [];
    if (items.length === 0) return '—';
    const ready = items.filter((item) => {
      const s = item.status;
      return s === 'ready' || s === 'shipped';
    }).length;
    return `${ready} из ${items.length}`;
  }
}
