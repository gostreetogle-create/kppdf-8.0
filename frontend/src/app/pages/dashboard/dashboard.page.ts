import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  inject,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { LucideAngularModule, Pencil } from 'lucide-angular';
import { PiPageChromeComponent, PageCrumb } from '../../shared/page/pi-page-chrome.component';
import { Order, OrdersService } from '../orders/orders.service';
import { DashboardDialogService } from '../../shared/services/dashboard-dialog.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { API_BASE_URL } from '../../core/api.tokens';
import { extractErrorMessage } from '../../core/silent-http';

import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, RouterLink, PiPageChromeComponent, DragDropModule, DatePipe],
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

    <!-- Kanban Board -->
    <div class="flex gap-4 overflow-x-auto pb-4 min-h-[60vh]">
      @for (col of columns; track col.id) {
        <div
          class="flex-shrink-0 w-80 flex flex-col bg-paper-raised/50 rounded-sm border hairline overflow-hidden"
        >
          <div class="p-3 border-b hairline font-medium flex justify-between items-center bg-paper">
            <span>{{ col.title }}</span>
            <span class="text-xs text-muted-foreground bg-ink/5 px-2 py-0.5 rounded-full">
              {{ columnOrders(col.id).length }}
            </span>
          </div>

          <div
            class="flex-1 p-2 flex flex-col gap-2 overflow-y-auto"
            cdkDropList
            [id]="col.id"
            [cdkDropListData]="columnOrders(col.id)"
            [cdkDropListConnectedTo]="connectedLists"
            (cdkDropListDropped)="dropOrder($event)"
          >
            @for (order of columnOrders(col.id); track order._id) {
              <div
                cdkDrag
                [cdkDragData]="order"
                class="bg-paper border hairline rounded-sm p-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-ink/20 transition-colors"
                (click)="toggleExpand(order._id)"
              >
                <div class="flex justify-between items-start mb-2">
                  <a
                    [routerLink]="['/orders', order._id]"
                    class="font-mono text-sm font-medium hover:underline"
                    (click)="$event.stopPropagation()"
                    >{{ order.number }}</a
                  >
                  <button
                    type="button"
                    class="text-muted-foreground hover:text-ink p-1 -mr-1 -mt-1 rounded-sm hover:bg-ink/5"
                    (click)="editOrder(order); $event.stopPropagation()"
                    title="Редактировать заказ"
                  >
                    <lucide-icon [img]="PencilIcon" [size]="14"></lucide-icon>
                  </button>
                </div>

                <div class="text-sm mb-2 line-clamp-1" [title]="counterpartyName(order)">
                  {{ counterpartyName(order) || '—' }}
                </div>

                <div class="flex justify-between items-center text-xs text-muted-foreground mt-3">
                  <span [class.text-destructive]="isOverdue(order)">
                    Дедлайн:
                    {{ order.plannedDate ? (order.plannedDate | date: 'dd.MM.yyyy') : '—' }}
                  </span>
                  <span>{{ readinessLabel(order) }}</span>
                </div>

                <!-- Expanded Items -->
                @if (expandedOrderId === order._id) {
                  <div
                    class="mt-3 pt-3 border-t hairline flex flex-col gap-2"
                    (click)="$event.stopPropagation()"
                  >
                    @for (item of order.items; track $index) {
                      <div
                        class="bg-paper-raised p-2 rounded-sm border hairline text-xs flex justify-between items-center group"
                      >
                        <div class="flex-1 min-w-0 pr-2">
                          <div class="truncate font-medium" [title]="item.productName">
                            {{ item.productName || 'Изделие ' + item.productId.slice(0, 8) }}
                          </div>
                          <div class="text-muted-foreground mt-0.5 flex items-center gap-2">
                            <span>{{ item.quantity }} {{ item.unit || 'шт' }}</span>
                            <select
                              class="bg-transparent border-none p-0 text-xs text-ink focus:ring-0 cursor-pointer"
                              [value]="item['status'] || 'pending'"
                              (change)="changeItemStatus(order._id, $index, $event)"
                            >
                              <option value="pending">Ожидает</option>
                              <option value="in_production">В работе</option>
                              <option value="ready">Готово</option>
                              <option value="shipped">Отгружено</option>
                            </select>
                          </div>
                        </div>
                        <button
                          type="button"
                          class="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-ink p-1 rounded-sm hover:bg-ink/5 transition-opacity shrink-0"
                          (click)="editProduct(item.productId)"
                          title="Редактировать изделие"
                        >
                          <lucide-icon [img]="PencilIcon" [size]="12"></lucide-icon>
                        </button>
                      </div>
                    }
                    @if (!order.items?.length) {
                      <div class="text-xs text-muted-foreground text-center py-2">Нет изделий</div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardPage {
  // TZ-NAV-303: Комбайн переехал под Проект — /design/combine.
  // Крошки = «Проектирование → /design» + «Комбайн» (не «Главная / Дашборд»).
  protected readonly crumbs: PageCrumb[] = [
    { label: 'Проектирование', link: '/design' },
    { label: 'Комбайн' },
  ];
  protected readonly PencilIcon = Pencil;

  private readonly service = inject(OrdersService);
  private readonly dashboardDialogs = inject(DashboardDialogService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
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

  protected readonly columns = [
    { id: 'draft', title: 'Черновики', statuses: ['draft'] },
    { id: 'confirmed', title: 'Подтверждены', statuses: ['confirmed'] },
    { id: 'in_production', title: 'В производстве', statuses: ['in_production'] },
    { id: 'ready', title: 'Готовы', statuses: ['ready'] },
    { id: 'shipped', title: 'Отгружены', statuses: ['shipped', 'delivered'] },
  ];

  protected readonly connectedLists = this.columns.map((c) => c.id);

  protected expandedOrderId: string | null = null;

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

  protected columnOrders(colId: string): Order[] {
    const col = this.columns.find((c) => c.id === colId);
    if (!col) return [];
    return this.data().filter((o) => col.statuses.includes(o.status));
  }

  /** TZ-SWEEP-401: снимок статусов ДО дропа — эталон отката PRODUCTION-333. */
  private statusSnapshot(): { id: string; status: Order['status'] }[] {
    return this.data().map((o) => ({ id: o._id, status: o.status }));
  }

  /** Вернуть карточки в исходные колонки после отмены/ошибки (без reload). */
  private restoreStatuses(snapshot: { id: string; status: Order['status'] }[]): void {
    for (const s of snapshot) {
      const order = this.data().find((o) => o._id === s.id);
      if (order) order.status = s.status;
    }
  }

  /** Подставить ответ PATCH/POST в список — список совпадает с сервером. */
  private replaceOrder(updated: Order): void {
    this.listRes.value.set(this.data().map((o) => (o._id === updated._id ? updated : o)));
  }

  protected dropOrder(event: CdkDragDrop<Order[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }
    const order = event.previousContainer.data[event.previousIndex];
    const newStatus = this.columns.find((c) => c.id === event.container.id)?.statuses[0];
    if (!newStatus || order.status === newStatus) return;

    if (newStatus === 'shipped') {
      // TZ-SWEEP-401: «Отгружены» — НЕ PATCH. Сначала confirm, потом POST /ship
      // (создаёт Shipment). Cancel/ESC/backdrop не двигают карточку.
      this.confirmShip(order);
      return;
    }

    const snapshot = this.statusSnapshot();
    // Оптимистичный перенос (silent-http никогда не error-ит — откат по res.ok).
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
    order.status = newStatus as Order['status'];

    // Операционные колонки (draft…ready) — PATCH status.
    this.service.update(order._id, { status: newStatus as Order['status'] }).subscribe((res) => {
      if (res.ok) {
        this.replaceOrder(res.data);
      } else {
        this.restoreStatuses(snapshot);
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  /** TZ-SWEEP-401: confirm отгрузки — onDialogCloseOnce срабатывает только на OK. */
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
      const snapshot = this.statusSnapshot();
      order.status = 'shipped'; // optimistic
      this.service.ship(order._id, {}).subscribe((res) => {
        if (res.ok) {
          this.replaceOrder(res.data);
        } else {
          this.restoreStatuses(snapshot);
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  protected toggleExpand(orderId: string) {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  protected editOrder(order: Order): void {
    this.dashboardDialogs.openOrderEdit(order, this.injector, () => this.listRes.reload());
  }

  protected editProduct(productId: string): void {
    this.dashboardDialogs.openProductEdit(productId, this.injector, () => this.listRes.reload());
  }

  protected changeItemStatus(orderId: string, itemIndex: number, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as 'pending' | 'in_production' | 'ready' | 'shipped';

    this.service.setItemStatus(orderId, itemIndex.toString(), newStatus).subscribe((res) => {
      if (res.ok) {
        this.replaceOrder(res.data);
      } else {
        // Ошибка не должна оставлять селект в лживом значении — показываем правду.
        this.toast.error(extractErrorMessage(res.error));
        this.listRes.reload();
      }
    });
  }

  protected counterpartyName(order: Order): string {
    const cp = order.counterpartyId as
      { _id: string; name?: string; shortName?: string } | string | undefined;
    if (!cp) return '';
    return typeof cp === 'string' ? cp : cp.shortName || cp.name || '';
  }

  protected isOverdue(order: Order): boolean {
    const deadline = order.plannedDate ? new Date(order.plannedDate) : null;
    if (!deadline) return false;
    return deadline < new Date() && !['shipped', 'delivered', 'cancelled'].includes(order.status);
  }

  /**
   * TZ-SWEEP-401: «X из Y» = item.status ∈ {ready, shipped}; нет поля → pending.
   * НЕ OR-ит readyForWork (это гейт «можно начинать» на /orders, HUB-304).
   */
  protected readinessLabel(order: Order): string {
    const items = order.items ?? [];
    if (items.length === 0) return '—';
    const ready = items.filter((item) => {
      const s = (item as { status?: string }).status;
      return s === 'ready' || s === 'shipped';
    }).length;
    return `${ready} из ${items.length}`;
  }
}
