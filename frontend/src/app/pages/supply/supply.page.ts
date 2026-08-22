import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  PiGroupWorkspaceComponent,
  type GroupChip,
} from '../../shared/page/pi-group-workspace.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { ColumnDef, TableComponent } from '../../shared/ui/pi-table.component';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import { formatDate } from '../../shared/util/format';
import {
  SupplyTask,
  SupplyTaskService,
  type SupplyTaskStatus,
} from '../../shared/services/pi-supply.service';
import { OrdersService, type Order } from '../orders/orders.service';
import { LOGISTICS_SECTION_CHIPS } from './logistics-group-chips';
import { SupplyQuickOrderComponent } from './supply-quick-order.component';

const STATUS_LABELS: Record<SupplyTaskStatus, string> = {
  draft: 'Черновик',
  confirmed: 'Подтверждено',
  ordered: 'Заказано',
  received: 'Получено',
};

export type SupplyViewMode = 'quick' | 'registry';

/**
 * TZ-SUPPLY-304 — supply workspace: «Быстрый заказ» (default) + «Реестр» (301/302).
 */
@Component({
  selector: 'app-supply-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    RouterLink,
    NgTemplateOutlet,
    PiGroupWorkspaceComponent,
    ButtonComponent,
    TableComponent,
    SupplyQuickOrderComponent,
  ],
  template: `
    <app-pi-group-workspace [toc]="toc" tocActiveId="supply" [chips]="emptyChips" activeId="">
      <div tools class="flex flex-col gap-2 w-full min-w-0">
        <div
          class="flex items-center gap-1 flex-wrap min-w-0 hairline-b pb-1"
          role="tablist"
          aria-label="Режим снабжения"
          data-test="supply-view-chips"
        >
          <a
            [routerLink]="['/supply']"
            [queryParams]="viewQueryParams('quick')"
            class="group-chip inline-flex items-center gap-1 px-2.5 py-0.5
                   text-xs leading-5 rounded-sm transition-colors
                   pi-focus-ring cursor-pointer no-underline"
            [class.bg-sunrise-warm]="viewMode() === 'quick'"
            [class.text-on-gold]="viewMode() === 'quick'"
            [class.text-ink]="viewMode() !== 'quick'"
            [class.hover:bg-paper-2]="viewMode() !== 'quick'"
            [attr.aria-current]="viewMode() === 'quick' ? 'page' : undefined"
            data-test="supply-view-quick"
          >
            Быстрый заказ
          </a>
          <a
            [routerLink]="['/supply']"
            [queryParams]="viewQueryParams('registry')"
            class="group-chip inline-flex items-center gap-1 px-2.5 py-0.5
                   text-xs leading-5 rounded-sm transition-colors
                   pi-focus-ring cursor-pointer no-underline"
            [class.bg-sunrise-warm]="viewMode() === 'registry'"
            [class.text-on-gold]="viewMode() === 'registry'"
            [class.text-ink]="viewMode() !== 'registry'"
            [class.hover:bg-paper-2]="viewMode() !== 'registry'"
            [attr.aria-current]="viewMode() === 'registry' ? 'page' : undefined"
            data-test="supply-view-registry"
          >
            Реестр
          </a>
        </div>

        @if (viewMode() === 'quick') {
          @if (quickToolbarTemplate(); as toolbarTpl) {
            <ng-container *ngTemplateOutlet="toolbarTpl" />
          }
        } @else {
          <div class="flex items-center gap-form-field flex-wrap w-full">
            <select
              class="pi-input w-44"
              [ngModel]="statusFilter()"
              (ngModelChange)="onStatusFilter($event)"
              aria-label="Фильтр по статусу"
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
                  class="underline underline-offset-2 hover:text-sunrise-warm"
                  (click)="clearOrderFilter()"
                  data-test="supply-order-filter-clear"
                >
                  Сбросить
                </button>
              </span>
            }
            <span class="text-sm text-muted-foreground">{{ tasks().length }} задач</span>
            <span class="flex-1"></span>
            <app-pi-button
              variant="outline"
              size="sm"
              (click)="reload()"
              data-test="supply-refresh"
            >
              Обновить
            </app-pi-button>
            <app-pi-button
              variant="default"
              size="sm"
              (click)="showCreate.set(!showCreate())"
              data-test="supply-create-toggle"
            >
              + Задача
            </app-pi-button>
          </div>
        }
      </div>

      @if (viewMode() === 'quick') {
        <app-supply-quick-order #quickOrder [prefillOrderId]="orderFilterId()" />
      } @else {
        <div class="flex flex-col gap-6 w-full min-w-0">
          @if (showCreate()) {
            <form
              class="pi-dashed-panel p-4 flex flex-col gap-3"
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
                    [ngModel]="explodeOrderId"
                    (ngModelChange)="explodeOrderId = $event"
                    name="explodeOrderId"
                    required
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
                  variant="outline"
                  size="sm"
                  (click)="onExplode()"
                  [disabled]="exploding()"
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
                  <select
                    class="pi-input"
                    [(ngModel)]="createOrderId"
                    name="orderId"
                    required
                    data-test="supply-create-order"
                  >
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
                    required
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
                    required
                    data-test="supply-create-qty"
                  />
                </label>
                <app-pi-button
                  type="submit"
                  variant="default"
                  size="sm"
                  [disabled]="creating()"
                  data-test="supply-create-submit"
                >
                  Создать
                </app-pi-button>
              </div>
            </form>
          }

          @if (error()) {
            <div
              role="alert"
              class="border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
            >
              {{ error() }}
            </div>
          }

          <div class="pi-table-surface overflow-x-auto">
            <app-pi-table
              [data]="tasks()"
              [columns]="columns"
              [cellTemplates]="tpls()"
              [rowActions]="actionsTpl"
              [loading]="loading()"
              [emptyMessage]="'Нет задач снабжения. Создайте первую — «+ Задача».'"
              [initialSortKey]="'createdAt'"
              [initialSortDir]="'desc'"
              ariaLabel="Задачи снабжения"
              data-test="supply-tasks-table"
            />
          </div>

          <ng-template #titleTpl let-row>
            <div class="flex flex-col gap-0.5">
              <span class="text-sm">{{ row.title || 'Без названия' }}</span>
              @if (row.orderLineId) {
                <span class="text-xs text-muted-foreground">линия {{ row.orderLineId }}</span>
              }
            </div>
          </ng-template>

          <ng-template #orderTpl let-row>
            <a
              class="text-sm underline-offset-2 hover:underline"
              [routerLink]="['/orders', row.orderId]"
              data-test="supply-order-link"
            >
              {{ orderLabel(row.orderId) }}
            </a>
          </ng-template>

          <ng-template #statusTpl let-row>
            <span
              class="text-sm"
              [class.text-sunrise-warm]="row.status === 'confirmed'"
              data-test="supply-status"
            >
              {{ statusLabel(row.status) }}
            </span>
          </ng-template>

          <ng-template #confirmTpl let-row>
            @if (row.confirmedAt) {
              <span class="text-xs text-muted-foreground" data-test="supply-confirmed-at">
                {{ fmtDate(row.confirmedAt) }}
              </span>
            } @else {
              <span class="text-xs text-muted-foreground">—</span>
            }
          </ng-template>

          <ng-template #actionsTpl let-row>
            <div class="flex items-center gap-2 flex-wrap justify-end">
              @if (row.status === 'draft') {
                <app-pi-button
                  variant="default"
                  size="sm"
                  (click)="onConfirm(row)"
                  [disabled]="busyId() === row._id"
                  [attr.data-test]="'supply-confirm-' + row._id"
                >
                  Подтвердить
                </app-pi-button>
              }
              @if (row.status === 'confirmed') {
                <app-pi-button
                  variant="outline"
                  size="sm"
                  (click)="onOrdered(row)"
                  [disabled]="busyId() === row._id"
                  [attr.data-test]="'supply-ordered-' + row._id"
                >
                  Заказано
                </app-pi-button>
              }
              @if (row.status === 'ordered') {
                <app-pi-button
                  variant="outline"
                  size="sm"
                  (click)="onReceived(row)"
                  [disabled]="busyId() === row._id"
                  [attr.data-test]="'supply-received-' + row._id"
                >
                  Получено
                </app-pi-button>
              }
            </div>
          </ng-template>
        </div>
      }
    </app-pi-group-workspace>
  `,
})
export class SupplyPage implements AfterViewInit {
  private readonly supply = inject(SupplyTaskService);
  private readonly ordersSvc = inject(OrdersService);
  private readonly toast = inject(PiToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('quickOrder')
  protected set quickOrderRef(comp: SupplyQuickOrderComponent | undefined) {
    this.quickToolbarTemplate.set(comp?.toolbarTemplate ?? null);
    this.cdr.markForCheck();
  }

  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly quickToolbarTemplate = signal<TemplateRef<void> | null>(null);

  protected readonly toc = LOGISTICS_SECTION_CHIPS;
  protected readonly emptyChips: readonly GroupChip[] = [];

  protected readonly viewMode = signal<SupplyViewMode>('quick');
  protected readonly orderFilterId = signal<string | null>(null);

  protected readonly tasks = signal<SupplyTask[]>([]);
  protected readonly orders = signal<Order[]>([]);
  protected readonly loading = signal(true);
  protected readonly creating = signal(false);
  protected readonly exploding = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly busyId = signal<string | null>(null);
  protected readonly statusFilter = signal<SupplyTaskStatus | ''>('');
  protected readonly showCreate = signal(false);
  private readonly viewReady = signal(false);

  protected createOrderId = '';
  protected explodeOrderId = '';
  protected createTitle = '';
  protected createQty = 1;

  @ViewChild('titleTpl', { static: true })
  protected readonly titleTpl!: TemplateRef<{ $implicit: SupplyTask }>;

  @ViewChild('orderTpl', { static: true })
  protected readonly orderTpl!: TemplateRef<{ $implicit: SupplyTask }>;

  @ViewChild('statusTpl', { static: true })
  protected readonly statusTpl!: TemplateRef<{ $implicit: SupplyTask }>;

  @ViewChild('confirmTpl', { static: true })
  protected readonly confirmTpl!: TemplateRef<{ $implicit: SupplyTask }>;

  @ViewChild('actionsTpl', { static: true })
  protected readonly actionsTpl!: TemplateRef<{ $implicit: SupplyTask }>;

  protected readonly tpls = computed((): Record<string, TemplateRef<{ $implicit: SupplyTask }>> => {
    if (!this.viewReady()) {
      return {} as Record<string, TemplateRef<{ $implicit: SupplyTask }>>;
    }
    return {
      title: this.titleTpl,
      orderId: this.orderTpl,
      status: this.statusTpl,
      confirmedAt: this.confirmTpl,
    };
  });

  protected readonly columns: ColumnDef<SupplyTask>[] = [
    { key: 'title', label: 'Позиция', sortable: true },
    { key: 'orderId', label: 'Заказ', sortable: true },
    { key: 'qty', label: 'Кол-во', sortable: true, numeric: true },
    { key: 'status', label: 'Статус', sortable: true },
    { key: 'confirmedAt', label: 'Подтверждено', sortable: true },
  ];

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const rawView = (params.get('view') ?? '').trim();
      this.viewMode.set(rawView === 'registry' ? 'registry' : 'quick');

      const rawOrderId = (params.get('orderId') ?? '').trim();
      this.orderFilterId.set(rawOrderId || null);

      if (this.viewMode() === 'registry') {
        this.reload();
      } else {
        this.loading.set(false);
        this.error.set(null);
      }
    });
    this.ordersSvc
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res.ok) this.orders.set(res.data ?? []);
      });
  }

  ngAfterViewInit(): void {
    this.viewReady.set(true);
  }

  protected viewQueryParams(mode: SupplyViewMode): Record<string, string | null> {
    const orderId = this.orderFilterId();
    if (mode === 'registry') {
      return { view: 'registry', orderId: orderId ?? null };
    }
    return { view: null, orderId: orderId ?? null };
  }

  protected fmtDate(d: string | undefined | null): string {
    return formatDate(d);
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

  protected clearOrderFilter(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { orderId: null },
      queryParamsHandling: 'merge',
    });
  }

  protected onStatusFilter(v: string): void {
    this.statusFilter.set((v || '') as SupplyTaskStatus | '');
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    const status = this.statusFilter();
    const orderId = this.orderFilterId() ?? undefined;
    this.supply
      .list({
        ...(orderId ? { orderId } : {}),
        ...(status ? { status } : {}),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.loading.set(false);
        if (!res.ok) {
          this.error.set(extractErrorMessage(res.error) || 'Не удалось загрузить задачи');
          this.tasks.set([]);
          return;
        }
        this.tasks.set(res.data ?? []);
      });
  }

  protected onExplode(): void {
    const orderId = this.explodeOrderId.trim();
    if (!orderId) {
      this.toast.error('Выберите заказ');
      return;
    }
    this.exploding.set(true);
    this.supply
      .explode(orderId)
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
        this.reload();
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
    this.supply
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
        this.reload();
      });
  }

  protected onConfirm(row: SupplyTask): void {
    this.busyId.set(row._id);
    this.supply
      .confirm(row._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.busyId.set(null);
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error) || 'Не подтверждено');
          return;
        }
        this.toast.success('Можно заказывать');
        this.reload();
      });
  }

  protected onOrdered(row: SupplyTask): void {
    this.busyId.set(row._id);
    this.supply
      .markOrdered(row._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.busyId.set(null);
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error) || 'Не отмечено');
          return;
        }
        this.toast.success('Отмечено «заказано»');
        this.reload();
      });
  }

  protected onReceived(row: SupplyTask): void {
    this.busyId.set(row._id);
    this.supply
      .markReceived(row._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.busyId.set(null);
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error) || 'Не отмечено');
          return;
        }
        this.toast.success('Отмечено «получено»');
        this.reload();
      });
  }
}
