/**
 * TZ-NX-SUPPLY-PAGE-FACADE — domain facade for `SupplyPage`.
 *
 * Owns: list/filter signals, inline-create form fields, and every
 * load/explode/create/confirm/unconfirm/ordered/received method — moved
 * as-is from the page. No status label or transition rule changes.
 */
import { DestroyRef, Injectable, Injector, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  PiOrdersService,
  PiSupplyTasksService,
  type Order,
  type SupplyTask,
  type SupplyTaskStatus,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiToastService } from '@kppdf/ui/toast';
import { PiDialogService, AlertDialogComponent } from '@kppdf/ui/dialog';
import { onDialogCloseOnce } from './ui/on-dialog-close-once';

export const STATUS_LABELS: Record<SupplyTaskStatus, string> = {
  draft: 'Черновик',
  confirmed: 'Подтверждено',
  ordered: 'Заказано',
  received: 'Получено',
};

/** TZ-NX-HUB-03 — canon H5: never show a raw ObjectId; a free-text line key is fine. */
function looksLikeObjectId(value: string): boolean {
  return /^[a-f0-9]{24}$/i.test(value);
}

@Injectable()
export class SupplyFacade {
  private readonly supplyApi = inject(PiSupplyTasksService);
  private readonly ordersApi = inject(PiOrdersService);
  private readonly toast = inject(PiToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(PiDialogService);
  private readonly injector = inject(Injector);

  readonly statusFilter = signal<SupplyTaskStatus | ''>('');
  readonly orderFilterId = signal<string | null>(null);
  readonly tasks = signal<SupplyTask[]>([]);
  readonly orders = signal<readonly Order[]>([]);
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('');
  readonly busyId = signal<string | null>(null);
  readonly showCreate = signal(false);
  readonly creating = signal(false);
  readonly exploding = signal(false);
  /** Single expand (registry pattern) — reloading the list collapses it. */
  readonly expandedId = signal<string | null>(null);

  createOrderId = '';
  explodeOrderId = '';
  createTitle = '';
  createQty = 1;

  private loadVersion = 0;

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const orderId = (params.get('orderId') ?? '').trim();
      this.orderFilterId.set(orderId || null);
      this.load();
    });
    void this.loadOrders();
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as SupplyTaskStatus | '';
    this.statusFilter.set(value);
    this.load();
  }

  clearOrderFilter(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { orderId: null },
      queryParamsHandling: 'merge',
    });
  }

  statusLabel(s: SupplyTaskStatus): string {
    return STATUS_LABELS[s] ?? s;
  }

  orderLabel(orderId: string): string {
    const o = this.orders().find((x) => x._id === orderId);
    return o?.number ?? orderId.slice(-6);
  }

  orderFilterLabel(): string {
    const id = this.orderFilterId();
    return id ? this.orderLabel(id) : '';
  }

  /** TZ-NX-HUB-03 — full id only when it reads as a business key, not a raw ObjectId (H5). */
  orderLineLabel(row: SupplyTask): string {
    if (!row.orderLineId) return '—';
    return looksLikeObjectId(row.orderLineId) ? '—' : row.orderLineId;
  }

  fmtDate(value: string): string {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('ru-RU');
  }

  toggleExpand(taskId: string): void {
    this.expandedId.update((current) => (current === taskId ? null : taskId));
  }

  onRowSpace(event: Event, taskId: string): void {
    event.preventDefault();
    this.toggleExpand(taskId);
  }

  load(): void {
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

  onExplode(): void {
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

  onCreate(ev: Event): void {
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

  /** TZ-NX-SUPPLY-TASK-UNCONFIRM ШАГ 3 — cheap accidental-click guard, same AlertDialog pattern as `confirmDirtyClose`. */
  onConfirm(row: SupplyTask): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Подтвердить задачу снабжения?',
        description: 'После подтверждения задачу можно будет отметить «Заказано».',
        confirmLabel: 'Подтвердить',
        cancelLabel: 'Отмена',
      },
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed) => {
      if (!confirmed) return;
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
    });
  }

  /** TZ-NX-SUPPLY-TASK-UNCONFIRM — revert an accidental confirm back to draft. */
  onUnconfirm(row: SupplyTask): void {
    this.busyId.set(row._id);
    this.supplyApi
      .unconfirm(row._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.busyId.set(null);
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error) || 'Не удалось вернуть в черновик');
          return;
        }
        this.toast.success('Возвращено в черновик');
        this.load();
      });
  }

  onOrdered(row: SupplyTask): void {
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

  onReceived(row: SupplyTask): void {
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
