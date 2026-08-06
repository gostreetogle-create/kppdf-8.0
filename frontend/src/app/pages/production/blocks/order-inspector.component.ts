import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
  effect,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { OrdersService, type Order, type OrderPriority } from '../../orders/orders.service';
import { WorkTypesService } from '../../../shared/services/pi-work-types.service';
import { PiToastService } from '../../../shared/ui/toast';
import { extractErrorMessage } from '../../../core/silent-http';
import { ProductionReadFacade } from '../production-read.facade';
import {
  ORDER_STATUS_LABELS,
  type OrderEstimateInput,
  type DirectModuleRef,
} from '../gantt-bar.model';
import type { OrderStatus } from '../../orders/orders.service';

const PRIORITIES: { value: OrderPriority; label: string }[] = [
  { value: 'low', label: 'Низкий' },
  { value: 'normal', label: 'Обычный' },
  { value: 'high', label: 'Высокий' },
  { value: 'urgent', label: 'Срочный' },
];

/**
 * Right-hand order inspector for Production Cockpit.
 * Tree: product → module → work type (+ days edit, workers from facade labels).
 */
@Component({
  selector: 'app-order-inspector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <aside
      class="flex flex-col h-full min-h-0 w-[22rem] shrink-0 border-l hairline bg-paper"
      data-test="order-inspector"
      aria-label="Карточка заказа на Ганте"
    >
      <header class="shrink-0 px-3 py-2 border-b hairline flex items-start gap-2">
        <div class="min-w-0 flex-1">
          <div class="text-sm font-semibold text-ink truncate" data-test="inspector-order-number">
            {{ order().number }}
          </div>
          <div class="text-[11px] text-muted-foreground">
            {{ statusLabel(order().status) }}
            @if (readOnly()) {
              <span class="text-amber-700 dark:text-amber-400"> · только просмотр</span>
            }
          </div>
        </div>
        <button
          type="button"
          class="pi-btn pi-btn-ghost pi-focus-ring !text-xs !px-2 !py-1 shrink-0"
          (click)="closed.emit()"
          aria-label="Закрыть панель"
          data-test="inspector-close"
        >
          ×
        </button>
      </header>

      <div class="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-4 text-sm">
        <section class="space-y-2" data-test="inspector-meta">
          <label class="block text-xs text-muted-foreground">
            Приоритет
            <select
              class="pi-input w-full mt-1 text-sm"
              [value]="priorityDraft()"
              [disabled]="readOnly() || saving()"
              (change)="onPriority($event)"
              data-test="inspector-priority"
            >
              @for (p of priorities; track p.value) {
                <option [value]="p.value">{{ p.label }}</option>
              }
            </select>
          </label>
          <label class="block text-xs text-muted-foreground">
            План. дата (якорь Ганта)
            <input
              type="date"
              class="pi-input w-full mt-1 text-sm"
              [value]="plannedDraft()"
              [disabled]="readOnly() || saving()"
              (change)="onPlanned($event)"
              data-test="inspector-planned-date"
            />
          </label>
          @if (!readOnly()) {
            <app-pi-button
              variant="default"
              size="sm"
              class="w-full"
              [disabled]="saving() || !metaDirty()"
              (click)="saveMeta()"
              data-test="inspector-save-meta"
            >
              {{ saving() ? 'Сохранение…' : 'Сохранить заказ' }}
            </app-pi-button>
          }
        </section>

        <section data-test="inspector-tree">
          <h3 class="text-xs font-medium text-muted-foreground mb-2">Состав заказа</h3>
          @if (loadingTree()) {
            <p class="text-xs text-muted-foreground">Загрузка дерева…</p>
          } @else if (!tree()?.items?.length) {
            <p class="text-xs text-muted-foreground" role="status">
              Нет позиций или у изделий нет модулей.
            </p>
          } @else {
            <ul class="space-y-1">
              @for (item of tree()!.items; track item.orderItemIndex) {
                <li class="border hairline rounded-sm">
                  <button
                    type="button"
                    class="w-full text-left px-2 py-1.5 pi-focus-ring flex items-center gap-1"
                    (click)="toggle('p-' + item.orderItemIndex)"
                    [attr.data-test]="'inspector-product-' + item.orderItemIndex"
                  >
                    <span class="text-[10px] w-3">{{
                      expanded().has('p-' + item.orderItemIndex) ? '▾' : '▸'
                    }}</span>
                    <span class="font-medium truncate flex-1">{{ item.productName }}</span>
                    <span class="font-mono text-[10px] text-muted-foreground"
                      >×{{ item.quantity }}</span
                    >
                  </button>
                  @if (expanded().has('p-' + item.orderItemIndex)) {
                    <ul class="border-t hairline bg-paper-2/30">
                      @for (mod of item.modules; track mod.moduleId) {
                        <li>
                          <button
                            type="button"
                            class="w-full text-left pl-5 pr-2 py-1.5 pi-focus-ring flex items-center gap-1 text-xs"
                            (click)="toggle('m-' + mod.moduleId)"
                            [attr.data-test]="'inspector-module-' + mod.moduleId"
                          >
                            <span class="text-[10px] w-3">{{
                              expanded().has('m-' + mod.moduleId) ? '▾' : '▸'
                            }}</span>
                            <span class="truncate">{{ mod.moduleName }}</span>
                          </button>
                          @if (expanded().has('m-' + mod.moduleId)) {
                            <ul class="border-t hairline">
                              @for (wt of mod.workTypes; track wt.workTypeId) {
                                <li
                                  class="pl-8 pr-2 py-2 space-y-1 border-b hairline last:border-0"
                                  [attr.data-test]="'inspector-wt-' + wt.workTypeId"
                                >
                                  <div class="text-xs font-medium">{{ wt.workTypeName }}</div>
                                  <div class="text-[10px] text-muted-foreground">
                                    Люди:
                                    {{ workerLabel(wt.workTypeId) }}
                                  </div>
                                  <label class="flex items-center gap-2 text-[11px]">
                                    <span class="text-muted-foreground shrink-0">Дни</span>
                                    <input
                                      type="number"
                                      min="1"
                                      step="1"
                                      class="pi-input !py-0.5 !text-xs w-16"
                                      [value]="daysDraft(wt.workTypeId, wt.days)"
                                      [disabled]="readOnly() || daysSaving()"
                                      (change)="onDaysChange(wt.workTypeId, $event)"
                                      [attr.data-test]="'inspector-days-' + wt.workTypeId"
                                    />
                                  </label>
                                  <p class="text-[10px] text-muted-foreground/80">
                                    Дни — справочник вида работ (влияют на все заказы с этим видом).
                                  </p>
                                </li>
                              } @empty {
                                <li class="pl-8 py-2 text-[11px] text-muted-foreground">
                                  Нет видов работ у модуля
                                </li>
                              }
                            </ul>
                          }
                        </li>
                      } @empty {
                        <li class="px-3 py-2 text-[11px] text-muted-foreground">Нет модулей</li>
                      }
                    </ul>
                  }
                </li>
              }
            </ul>
          }
        </section>
      </div>
    </aside>
  `,
})
export class OrderInspectorComponent {
  readonly order = input.required<Order>();
  readonly readOnly = input(false);
  readonly workerLabels = input<ReadonlyMap<string, string>>(new Map());
  readonly closed = output<void>();
  readonly changed = output<void>();

  private readonly ordersApi = inject(OrdersService);
  private readonly workTypesApi = inject(WorkTypesService);
  private readonly facade = inject(ProductionReadFacade);
  private readonly toast = inject(PiToastService);

  protected readonly priorities = PRIORITIES;
  protected readonly tree = signal<OrderEstimateInput | null>(null);
  protected readonly loadingTree = signal(false);
  protected readonly expanded = signal(new Set<string>());
  protected readonly saving = signal(false);
  protected readonly daysSaving = signal(false);
  protected readonly priorityDraft = signal<OrderPriority>('normal');
  protected readonly plannedDraft = signal('');
  private readonly daysOverrides = signal<Record<string, number>>({});

  protected readonly metaDirty = computed(() => {
    const o = this.order();
    const planned = toDateInput(o.plannedDate) || toDateInput(o.date);
    return this.priorityDraft() !== (o.priority ?? 'normal') || this.plannedDraft() !== planned;
  });

  constructor() {
    effect(() => {
      const o = this.order();
      this.priorityDraft.set(o.priority ?? 'normal');
      this.plannedDraft.set(toDateInput(o.plannedDate) || toDateInput(o.date));
      this.daysOverrides.set({});
      void this.reloadTree(o);
    });
  }

  protected statusLabel(s: OrderStatus): string {
    return ORDER_STATUS_LABELS[s] ?? s;
  }

  protected workerLabel(workTypeId: string): string {
    return this.workerLabels().get(workTypeId) ?? '—';
  }

  protected daysDraft(workTypeId: string, days: number | null | undefined): number | string {
    const ov = this.daysOverrides()[workTypeId];
    if (ov != null) return ov;
    return days ?? '';
  }

  protected toggle(key: string): void {
    const next = new Set(this.expanded());
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.expanded.set(next);
  }

  protected onPriority(ev: Event): void {
    this.priorityDraft.set((ev.target as HTMLSelectElement).value as OrderPriority);
  }

  protected onPlanned(ev: Event): void {
    this.plannedDraft.set((ev.target as HTMLInputElement).value);
  }

  protected async saveMeta(): Promise<void> {
    if (this.readOnly() || this.saving()) return;
    this.saving.set(true);
    const planned = this.plannedDraft();
    const res = await firstValueFrom(
      this.ordersApi.update(this.order()._id, {
        priority: this.priorityDraft(),
        plannedDate: planned ? new Date(planned + 'T12:00:00').toISOString() : undefined,
      }),
    );
    this.saving.set(false);
    if (!res.ok) {
      this.toast.error(extractErrorMessage(res.error));
      return;
    }
    this.toast.success('Заказ обновлён');
    this.changed.emit();
  }

  protected async onDaysChange(workTypeId: string, ev: Event): Promise<void> {
    if (this.readOnly()) return;
    const raw = (ev.target as HTMLInputElement).value;
    const days = Math.floor(Number(raw));
    if (!Number.isFinite(days) || days < 1) {
      this.toast.error('Дни: целое число ≥ 1');
      return;
    }
    this.daysOverrides.update((m) => ({ ...m, [workTypeId]: days }));
    this.daysSaving.set(true);
    const res = await firstValueFrom(this.workTypesApi.update(workTypeId, { days }));
    this.daysSaving.set(false);
    if (!res.ok) {
      this.toast.error(extractErrorMessage(res.error));
      return;
    }
    this.toast.success('Дни вида работ обновлены');
    this.facade.clearCaches();
    await this.reloadTree(this.order());
    this.changed.emit();
  }

  private async reloadTree(order: Order): Promise<void> {
    this.loadingTree.set(true);
    try {
      const input = await this.facade.buildOrderEstimatePublic(order);
      this.tree.set(input);
      const open = new Set<string>();
      for (const item of input.items) {
        open.add('p-' + item.orderItemIndex);
        for (const mod of item.modules as DirectModuleRef[]) {
          open.add('m-' + mod.moduleId);
        }
      }
      this.expanded.set(open);
    } finally {
      this.loadingTree.set(false);
    }
  }
}

function toDateInput(value: string | undefined | null): string {
  if (!value) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : '';
}
