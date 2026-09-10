import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  PiOrdersService,
  PiSupplyTasksService,
  type Order,
  type SupplyTask,
  type SupplyTaskStatus,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiToastService } from '@kppdf/ui/toast';

const STATUS_LABELS: Record<SupplyTaskStatus, string> = {
  draft: 'Черновик',
  confirmed: 'Подтверждено',
  ordered: 'Заказано',
  received: 'Получено',
};

const GRID_COLS =
  'grid-cols-[1.5rem_minmax(0,1.5fr)_minmax(7rem,0.8fr)_minmax(4.5rem,0.45fr)_minmax(7rem,0.6fr)_minmax(6rem,0.55fr)_minmax(8rem,0.7fr)]';

/** TZ-NX-HUB-03 — canon H5: never show a raw ObjectId; a free-text line key is fine. */
function looksLikeObjectId(value: string): boolean {
  return /^[a-f0-9]{24}$/i.test(value);
}

/**
 * TZ-NX-SUPPLY-S1 — live SupplyTask registry only. The legacy «Быстрый
 * заказ» mode is an in-memory mock (F5 loses data) and is deliberately NOT
 * ported — this page is the single, live `/supply` mode for NX.
 */
@Component({
  selector: 'pi-supply-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, PiStatusBannerComponent, ButtonComponent],
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
        <form
          class="pi-dashed-panel p-4 flex flex-col gap-3 mb-4"
          data-test="supply-create-form"
          (submit)="onCreate($event)"
        >
          <p class="text-sm text-muted-foreground m-0">
            Выберите заказ, чтобы создать задачи снабжения из его состава.
          </p>
          <div class="flex flex-wrap gap-3 items-end">
            <label class="flex flex-col gap-1 text-xs min-w-[12rem] flex-1">
              <span class="text-muted-foreground">Разнести состав заказа</span>
              <select
                class="pi-input"
                [(ngModel)]="explodeOrderId"
                name="explodeOrderId"
                data-test="supply-explode-order"
              >
                <option value="">Выберите заказ…</option>
                @for (o of orders(); track o._id) {
                  <option [value]="o._id">{{ o.number }}</option>
                }
              </select>
            </label>
            <app-pi-button
              type="button"
              variant="secondary"
              (click)="onExplode()"
              [disabled]="exploding() || !explodeOrderId"
              data-test="supply-explode-submit"
            >
              Создать из заказа
            </app-pi-button>
          </div>
          <div class="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden="true">
            <span class="h-px bg-border flex-1"></span>
            <span>или вручную</span>
            <span class="h-px bg-border flex-1"></span>
          </div>
          <div class="flex flex-wrap gap-3 items-end">
            <label class="flex flex-col gap-1 text-xs min-w-[12rem] flex-1">
              <span class="text-muted-foreground">Заказ</span>
              <select class="pi-input" [(ngModel)]="createOrderId" name="orderId" data-test="supply-create-order">
                <option value="">Выберите заказ…</option>
                @for (o of orders(); track o._id) {
                  <option [value]="o._id">{{ o.number }}</option>
                }
              </select>
            </label>
            <label class="flex flex-col gap-1 text-xs min-w-[10rem] flex-1">
              <span class="text-muted-foreground">Что закупить</span>
              <input
                class="pi-input"
                [(ngModel)]="createTitle"
                name="title"
                maxlength="256"
                placeholder="Материал / модуль"
                data-test="supply-create-title"
              />
            </label>
            <label class="flex flex-col gap-1 text-xs w-24">
              <span class="text-muted-foreground">Кол-во</span>
              <input
                class="pi-input"
                type="number"
                min="0"
                step="any"
                [(ngModel)]="createQty"
                name="qty"
                data-test="supply-create-qty"
              />
            </label>
            <app-pi-button
              type="submit"
              variant="default"
              [disabled]="creating()"
              data-test="supply-create-submit"
            >
              Создать
            </app-pi-button>
          </div>
        </form>
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
                <div class="flex items-center justify-end" role="cell" (click)="$event.stopPropagation()">
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
  private readonly supplyApi = inject(PiSupplyTasksService);
  private readonly ordersApi = inject(PiOrdersService);
  private readonly toast = inject(PiToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly statusFilter = signal<SupplyTaskStatus | ''>('');
  protected readonly orderFilterId = signal<string | null>(null);
  protected readonly tasks = signal<SupplyTask[]>([]);
  protected readonly orders = signal<readonly Order[]>([]);
  protected readonly status = signal<'loading' | 'success' | 'error'>('loading');
  protected readonly error = signal('');
  protected readonly busyId = signal<string | null>(null);
  protected readonly showCreate = signal(false);
  protected readonly creating = signal(false);
  protected readonly exploding = signal(false);
  /** Single expand (registry pattern) — reloading the list collapses it. */
  protected readonly expandedId = signal<string | null>(null);

  protected createOrderId = '';
  protected explodeOrderId = '';
  protected createTitle = '';
  protected createQty = 1;

  private loadVersion = 0;

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const orderId = (params.get('orderId') ?? '').trim();
      this.orderFilterId.set(orderId || null);
      this.load();
    });
    void this.loadOrders();
  }

  protected onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as SupplyTaskStatus | '';
    this.statusFilter.set(value);
    this.load();
  }

  protected clearOrderFilter(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { orderId: null },
      queryParamsHandling: 'merge',
    });
  }

  protected statusLabel(s: SupplyTaskStatus): string {
    return STATUS_LABELS[s] ?? s;
  }

  protected orderLabel(orderId: string): string {
    const o = this.orders().find((x) => x._id === orderId);
    return o?.number ?? orderId.slice(-6);
  }

  protected orderFilterLabel(): string {
    const id = this.orderFilterId();
    return id ? this.orderLabel(id) : '';
  }

  /** TZ-NX-HUB-03 — full id only when it reads as a business key, not a raw ObjectId (H5). */
  protected orderLineLabel(row: SupplyTask): string {
    if (!row.orderLineId) return '—';
    return looksLikeObjectId(row.orderLineId) ? '—' : row.orderLineId;
  }

  protected fmtDate(value: string): string {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('ru-RU');
  }

  protected toggleExpand(taskId: string): void {
    this.expandedId.update((current) => (current === taskId ? null : taskId));
  }

  protected onRowSpace(event: Event, taskId: string): void {
    event.preventDefault();
    this.toggleExpand(taskId);
  }

  protected load(): void {
    const version = ++this.loadVersion;
    this.status.set('loading');
    this.error.set('');
    this.expandedId.set(null);
    const orderId = this.orderFilterId() ?? undefined;
    const status = this.statusFilter() || undefined;
    void firstValueFrom(this.supplyApi.list({ orderId, status })).then((res) => {
      if (version !== this.loadVersion) return;
      if (!res.ok) {
        this.error.set(extractErrorMessage(res.error) || 'Не удалось загрузить задачи');
        this.status.set('error');
        return;
      }
      this.tasks.set(res.data ?? []);
      this.status.set('success');
    });
  }

  protected onExplode(): void {
    const orderId = this.explodeOrderId.trim();
    if (!orderId) {
      this.toast.error('Выберите заказ');
      return;
    }
    this.exploding.set(true);
    this.supplyApi
      .explode({ orderId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.exploding.set(false);
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error) || 'Не удалось создать задачи из заказа');
          return;
        }
        const created = res.data?.created.length ?? 0;
        const skipped = res.data?.skipped ?? 0;
        this.toast.success(
          skipped > 0
            ? `Создано задач: ${created}; уже существовало: ${skipped}`
            : `Создано задач: ${created}`,
        );
        this.load();
      });
  }

  protected onCreate(ev: Event): void {
    ev.preventDefault();
    const orderId = this.createOrderId.trim();
    const title = this.createTitle.trim();
    const qty = Number(this.createQty);
    if (!orderId || !title || !(qty >= 0)) {
      this.toast.error('Укажите заказ, название и количество');
      return;
    }
    this.creating.set(true);
    this.supplyApi
      .create({ orderId, title, qty })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.creating.set(false);
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error) || 'Не создано');
          return;
        }
        this.toast.success('Задача создана');
        this.createTitle = '';
        this.createQty = 1;
        this.showCreate.set(false);
        this.load();
      });
  }

  protected onConfirm(row: SupplyTask): void {
    this.busyId.set(row._id);
    this.supplyApi
      .confirm(row._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.busyId.set(null);
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error) || 'Не подтверждено');
          return;
        }
        this.toast.success('Можно заказывать');
        this.load();
      });
  }

  protected onOrdered(row: SupplyTask): void {
    this.busyId.set(row._id);
    this.supplyApi
      .markOrdered(row._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.busyId.set(null);
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error) || 'Не отмечено');
          return;
        }
        this.toast.success('Отмечено «заказано»');
        this.load();
      });
  }

  protected onReceived(row: SupplyTask): void {
    this.busyId.set(row._id);
    this.supplyApi
      .markReceived(row._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.busyId.set(null);
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error) || 'Не отмечено');
          return;
        }
        // known_limitation: markReceived does not post a StockMovement (BE
        // gap, not invented here) — see docs/pages/supply.page.md.
        this.toast.success('Отмечено «получено»');
        this.load();
      });
  }

  private async loadOrders(): Promise<void> {
    const result = await firstValueFrom(this.ordersApi.list());
    if (result.ok) this.orders.set(result.data ?? []);
  }
}
