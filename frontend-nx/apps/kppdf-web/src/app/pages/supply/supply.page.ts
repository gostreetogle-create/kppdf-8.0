import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { SupplyTask } from '@kppdf/data-access';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { ButtonComponent } from '@kppdf/ui/button';
import { SupplyFacade, SupplyCreateFormComponent } from '@kppdf/features/supply';

const GRID_COLS =
  'grid-cols-[1.5rem_minmax(0,1.5fr)_minmax(7rem,0.8fr)_minmax(4.5rem,0.45fr)_minmax(7rem,0.6fr)_minmax(6rem,0.55fr)_minmax(8rem,0.7fr)]';

/**
 * TZ-NX-SUPPLY-S1 — live SupplyTask registry only. The legacy «Быстрый
 * заказ» mode is an in-memory mock (F5 loses data) and is deliberately NOT
 * ported — this page is the single, live `/supply` mode for NX.
 *
 * TZ-NX-SUPPLY-PAGE-FACADE — list/filter/create/status-transition signals
 * and methods moved to `SupplyFacade`; this page stays a thin host.
 */
@Component({
  selector: 'pi-supply-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SupplyFacade],
  imports: [RouterLink, PiStatusBannerComponent, ButtonComponent, SupplyCreateFormComponent],
  template: `
    <main class="px-panel-inset py-6" data-test="supply-page">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div>
          <div class="eyebrow">Снабжение</div>
          <h1 class="font-display text-2xl m-0">Закупки</h1>
          <p class="text-sm text-muted-foreground m-0 mt-1">
            Реестр задач снабжения: подтверждение, заказ, получение.
          </p>
        </div>
        <app-pi-button
          variant="default"
          type="button"
          (click)="showCreate.set(!showCreate())"
          data-test="supply-create-toggle"
        >
          + Задача
        </app-pi-button>
      </div>

      <div class="flex flex-wrap items-center gap-3 mb-4">
        <label class="sr-only" for="supply-status-filter">Фильтр по статусу</label>
        <select
          id="supply-status-filter"
          class="pi-input w-56 pi-focus-ring"
          [value]="statusFilter()"
          (change)="onStatusChange($event)"
          data-test="supply-status-filter"
        >
          <option value="">Все статусы</option>
          <option value="draft">Черновик</option>
          <option value="confirmed">Подтверждено</option>
          <option value="ordered">Заказано</option>
          <option value="received">Получено</option>
        </select>

        @if (orderFilterId()) {
          <span
            class="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-sm bg-paper-2 border hairline"
            data-test="supply-order-filter-chip"
          >
            <span>Фильтр: заказ {{ orderFilterLabel() }}</span>
            <button
              type="button"
              class="pi-outline-btn"
              (click)="clearOrderFilter()"
              data-test="supply-order-filter-clear"
            >
              Сбросить
            </button>
          </span>
        }

        <span class="text-sm text-muted-foreground">{{ tasks().length }} задач</span>
        <span class="flex-1"></span>
        <app-pi-button variant="secondary" type="button" (click)="load()" data-test="supply-refresh">
          Обновить
        </app-pi-button>
      </div>

      @if (showCreate()) {
        <pi-supply-create-form
          [orders]="orders()"
          [exploding]="exploding()"
          [creating]="creating()"
          [explodeOrderId]="facade.explodeOrderId"
          [createOrderId]="facade.createOrderId"
          [createTitle]="facade.createTitle"
          [createQty]="facade.createQty"
          (explodeOrderIdChange)="facade.explodeOrderId = $event"
          (createOrderIdChange)="facade.createOrderId = $event"
          (createTitleChange)="facade.createTitle = $event"
          (createQtyChange)="facade.createQty = $event"
          (explode)="onExplode()"
          (create)="onCreate($event)"
        />
      }

      @if (status() === 'loading') {
        <div class="text-sm text-muted-foreground" data-test="supply-loading">Загрузка…</div>
      }
      @if (status() === 'error') {
        <app-pi-status-banner
          tone="destructive"
          [message]="error()"
          actionLabel="Повторить"
          (action)="load()"
          data-test="supply-error"
        />
      }
      @if (status() === 'success' && tasks().length === 0) {
        <div class="pi-dashed-panel p-8 text-center" data-test="supply-empty">
          Нет задач снабжения. Создайте первую — «+ Задача».
        </div>
      }
      @if (status() === 'success' && tasks().length > 0) {
        <div class="pi-table-surface hairline rounded-sm overflow-x-auto bg-paper-raised" data-test="supply-tasks-table">
          <div class="min-w-[60rem]" role="table" aria-label="Задачи снабжения">
            <div class="grid ${GRID_COLS} gap-4 px-4 py-2 text-xs text-muted-foreground hairline-bottom" role="row">
              <span role="columnheader" aria-hidden="true"></span>
              <span role="columnheader">Позиция</span>
              <span role="columnheader">Заказ</span>
              <span role="columnheader" class="text-right">Кол-во</span>
              <span role="columnheader">Статус</span>
              <span role="columnheader">Создано</span>
              <span role="columnheader" aria-label="Действия"></span>
            </div>
            @for (row of tasks(); track row._id) {
              <div
                class="grid ${GRID_COLS} gap-4 items-center px-4 py-2 hairline-bottom last:border-b-0 cursor-pointer hover:bg-paper-2 pi-focus-ring border-l-2"
                role="row"
                data-test="supply-row"
                tabindex="0"
                [class.bg-paper-2]="expandedId() === row._id"
                [class.border-l-gold-deep]="expandedId() === row._id"
                [class.border-l-transparent]="expandedId() !== row._id"
                [attr.aria-expanded]="expandedId() === row._id"
                (click)="toggleExpand(row._id)"
                (keydown.enter)="toggleExpand(row._id)"
                (keydown.space)="onRowSpace($event, row._id)"
              >
                <span role="cell" aria-hidden="true" class="text-muted-foreground" data-test="supply-row-chevron">
                  {{ expandedId() === row._id ? '▾' : '▸' }}
                </span>
                <div role="cell" class="min-w-0">
                  <div class="text-sm truncate">{{ row.title || 'Без названия' }}</div>
                </div>
                <div role="cell">
                  <a
                    class="text-sm underline-offset-2 hover:underline"
                    [routerLink]="['/orders', row.orderId]"
                    data-test="supply-order-link"
                    (click)="$event.stopPropagation()"
                  >
                    {{ orderLabel(row.orderId) }}
                  </a>
                </div>
                <div class="text-sm text-right tabular-nums" role="cell">{{ row.qty }}</div>
                <div role="cell">
                  <span
                    class="text-sm"
                    [class.text-sunrise-warm]="row.status === 'confirmed'"
                    data-test="supply-status"
                  >
                    {{ statusLabel(row.status) }}
                  </span>
                </div>
                <div class="text-sm text-muted-foreground tabular-nums" role="cell">
                  {{ row.createdAt ? fmtDate(row.createdAt) : '—' }}
                </div>
                <div class="flex items-center justify-end gap-2" role="cell" (click)="$event.stopPropagation()">
                  @if (row.status === 'draft') {
                    <button
                      type="button"
                      class="pi-outline-btn"
                      (click)="onConfirm(row)"
                      [disabled]="busyId() === row._id"
                      [attr.data-test]="'supply-confirm-' + row._id"
                    >
                      {{ busyId() === row._id ? '…' : 'Подтвердить' }}
                    </button>
                  }
                  @if (row.status === 'confirmed') {
                    <button
                      type="button"
                      class="pi-outline-btn"
                      (click)="onUnconfirm(row)"
                      [disabled]="busyId() === row._id"
                      [attr.data-test]="'supply-unconfirm-' + row._id"
                      aria-label="Отменить подтверждение, вернуть в черновик"
                      title="Отменить подтверждение, вернуть в черновик"
                    >
                      {{ busyId() === row._id ? '…' : 'В черновик' }}
                    </button>
                    <button
                      type="button"
                      class="pi-outline-btn"
                      (click)="onOrdered(row)"
                      [disabled]="busyId() === row._id"
                      [attr.data-test]="'supply-ordered-' + row._id"
                    >
                      {{ busyId() === row._id ? '…' : 'Заказано' }}
                    </button>
                  }
                  @if (row.status === 'ordered') {
                    <button
                      type="button"
                      class="pi-outline-btn"
                      (click)="onReceived(row)"
                      [disabled]="busyId() === row._id"
                      [attr.data-test]="'supply-received-' + row._id"
                    >
                      {{ busyId() === row._id ? '…' : 'Получено' }}
                    </button>
                  }
                </div>
              </div>
              @if (expandedId() === row._id) {
                <div
                  class="supply-task-hub-tray bg-paper-2 border-t hairline"
                  data-test="supply-row-expand"
                  role="region"
                  [attr.aria-label]="'Сводка задачи снабжения: ' + (row.title || 'Без названия')"
                >
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="supply-expand-position">
                      <h3 class="text-sm font-medium text-ink m-0 mb-3">Позиция</h3>
                      <dl class="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                        <dt class="text-muted-foreground">Название</dt>
                        <dd class="m-0">{{ row.title || 'Без названия' }}</dd>
                        <dt class="text-muted-foreground">Кол-во</dt>
                        <dd class="m-0 tabular-nums">{{ row.qty }}</dd>
                        <dt class="text-muted-foreground">Статус</dt>
                        <dd class="m-0">{{ statusLabel(row.status) }}</dd>
                      </dl>
                    </section>

                    <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="supply-expand-order">
                      <h3 class="text-sm font-medium text-ink m-0 mb-3">Связь с заказом</h3>
                      <dl class="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs mb-3">
                        <dt class="text-muted-foreground">Линия заказа</dt>
                        <dd class="m-0" data-test="supply-expand-line">{{ orderLineLabel(row) }}</dd>
                      </dl>
                      <a
                        class="pi-outline-btn"
                        [routerLink]="['/orders', row.orderId]"
                        data-test="supply-expand-order-link"
                      >
                        Заказ {{ orderLabel(row.orderId) }}
                      </a>
                    </section>

                    <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="supply-expand-composition">
                      <h3 class="text-sm font-medium text-ink m-0 mb-3">Состав</h3>
                      <dl class="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                        <dt class="text-muted-foreground">Материал</dt>
                        <dd class="m-0">{{ row.materialId ? 'Материал задан' : '—' }}</dd>
                        <dt class="text-muted-foreground">Модуль</dt>
                        <dd class="m-0">{{ row.moduleId ? 'Модуль задан' : '—' }}</dd>
                      </dl>
                    </section>

                    <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="supply-expand-dates">
                      <h3 class="text-sm font-medium text-ink m-0 mb-3">Сроки и заметки</h3>
                      <dl class="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs mb-2">
                        <dt class="text-muted-foreground">Создано</dt>
                        <dd class="m-0">{{ row.createdAt ? fmtDate(row.createdAt) : '—' }}</dd>
                        <dt class="text-muted-foreground">Подтверждено</dt>
                        <dd class="m-0">{{ row.confirmedAt ? fmtDate(row.confirmedAt) : '—' }}</dd>
                        <dt class="text-muted-foreground">Обновлено</dt>
                        <dd class="m-0">{{ row.updatedAt ? fmtDate(row.updatedAt) : '—' }}</dd>
                      </dl>
                      <p class="text-xs text-muted-foreground m-0">{{ row.notes || 'Без примечаний' }}</p>
                    </section>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      }
    </main>
  `,
})
export class SupplyPage {
  protected readonly facade = inject(SupplyFacade);

  protected readonly statusFilter = this.facade.statusFilter;
  protected readonly orderFilterId = this.facade.orderFilterId;
  protected readonly tasks = this.facade.tasks;
  protected readonly orders = this.facade.orders;
  protected readonly status = this.facade.status;
  protected readonly error = this.facade.error;
  protected readonly busyId = this.facade.busyId;
  protected readonly showCreate = this.facade.showCreate;
  protected readonly creating = this.facade.creating;
  protected readonly exploding = this.facade.exploding;
  protected readonly expandedId = this.facade.expandedId;

  protected onStatusChange(event: Event): void {
    this.facade.onStatusChange(event);
  }

  protected clearOrderFilter(): void {
    this.facade.clearOrderFilter();
  }

  protected statusLabel(s: SupplyTask['status']): string {
    return this.facade.statusLabel(s);
  }

  protected orderLabel(orderId: string): string {
    return this.facade.orderLabel(orderId);
  }

  protected orderFilterLabel(): string {
    return this.facade.orderFilterLabel();
  }

  protected orderLineLabel(row: SupplyTask): string {
    return this.facade.orderLineLabel(row);
  }

  protected fmtDate(value: string): string {
    return this.facade.fmtDate(value);
  }

  protected toggleExpand(taskId: string): void {
    this.facade.toggleExpand(taskId);
  }

  protected onRowSpace(event: Event, taskId: string): void {
    this.facade.onRowSpace(event, taskId);
  }

  protected load(): void {
    this.facade.load();
  }

  protected onExplode(): void {
    this.facade.onExplode();
  }

  protected onCreate(ev: Event): void {
    this.facade.onCreate(ev);
  }

  protected onConfirm(row: SupplyTask): void {
    this.facade.onConfirm(row);
  }

  protected onUnconfirm(row: SupplyTask): void {
    this.facade.onUnconfirm(row);
  }

  protected onOrdered(row: SupplyTask): void {
    this.facade.onOrdered(row);
  }

  protected onReceived(row: SupplyTask): void {
    this.facade.onReceived(row);
  }
}
