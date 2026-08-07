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
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { OrdersService, type Order, type OrderPriority } from '../../orders/orders.service';
import { WorkTypesService } from '../../../shared/services/pi-work-types.service';
import { PiToastService } from '../../../shared/ui/toast';
import { extractErrorMessage } from '../../../core/silent-http';
import { ProductionReadFacade } from '../production-read.facade';
import {
  ORDER_STATUS_LABELS,
  workTypeOklch,
  workTypeWash,
  type OrderEstimateInput,
  type DirectModuleRef,
} from '../gantt-bar.model';
import type { OrderStatus } from '../../orders/orders.service';

const PRIORITIES: { value: OrderPriority; label: string; hint: string }[] = [
  {
    value: 'low',
    label: 'Низкий',
    hint: 'Можно сдвинуть в очереди; фильтр rail «Низкий».',
  },
  {
    value: 'normal',
    label: 'Обычный',
    hint: 'Стандартная срочность заказа в списке и фильтре.',
  },
  {
    value: 'high',
    label: 'Высокий',
    hint: 'Выделяется в rail; фильтр «Высокий». На шкалу дней не влияет.',
  },
  {
    value: 'urgent',
    label: 'Срочный',
    hint: 'Максимальная срочность в списке/фильтре. Длительность полос — от дней вида работ.',
  },
];

/**
 * Right-hand order inspector for Production Cockpit.
 */
@Component({
  selector: 'app-order-inspector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, RouterLink],
  template: `
    <aside
      class="flex flex-col h-full min-h-0 w-[20rem] xl:w-[22rem] shrink-0 border-l hairline bg-paper"
      data-test="order-inspector"
      aria-label="Карточка заказа на Ганте"
      (click)="$event.stopPropagation()"
    >
      <header class="shrink-0 px-3 py-2 border-b hairline flex items-start gap-2">
        <div class="min-w-0 flex-1">
          <div class="text-sm font-semibold text-ink truncate" data-test="inspector-order-number">
            {{ order().number }}
          </div>
          <div class="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
            <span>{{ statusLabel(order().status) }}</span>
            <a
              class="text-ink underline underline-offset-2 pi-focus-ring"
              [routerLink]="['/orders']"
              [queryParams]="{ q: order().number }"
              data-test="inspector-open-order"
              title="Открыть заказ в списке"
              >Открыть заказ</a
            >
            @if (estimateReadOnly()) {
              <span class="text-amber-700 dark:text-amber-400"> · оценка read-only</span>
            }
          </div>
          <a
            class="text-[11px] underline-offset-2 hover:underline text-ink"
            [routerLink]="['/orders']"
            [queryParams]="{ q: order().number }"
            data-test="inspector-open-order"
            >Открыть в списке заказов</a
          >
        </div>
        <button
          type="button"
          class="pi-btn pi-btn-ghost pi-focus-ring !text-sm !px-2 !py-1 shrink-0"
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
            Приоритет заказа
            <select
              class="pi-input w-full mt-1 text-sm"
              [value]="priorityDraft()"
              [disabled]="!canEditOrder() || saving()"
              (change)="onPriority($event)"
              data-test="inspector-priority"
            >
              @for (p of priorities; track p.value) {
                <option [value]="p.value">{{ p.label }}</option>
              }
            </select>
          </label>
          <p
            class="text-[11px] text-muted-foreground leading-snug"
            data-test="inspector-priority-hint"
          >
            {{ priorityHint() }} Не длина полоски на календаре — только важность в списке и фильтре
            слева.
          </p>
          <label class="block text-xs text-muted-foreground">
            План. дата (якорь шкалы Ганта)
            <input
              type="date"
              class="pi-input w-full mt-1 text-sm"
              [value]="plannedDraft()"
              [disabled]="!canEditOrder() || saving()"
              (change)="onPlanned($event)"
              data-test="inspector-planned-date"
            />
          </label>
          @if (canEditOrder()) {
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
          } @else {
            <p class="text-[11px] text-muted-foreground">
              Правка заказа — роли admin / manager (как на API).
            </p>
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
            <ul class="space-y-2">
              @for (item of tree()!.items; track item.orderItemIndex) {
                <li class="border hairline rounded-sm overflow-hidden bg-paper">
                  <div class="flex items-stretch">
                    <button
                      type="button"
                      class="flex-1 min-w-0 text-left px-2 py-2.5 pi-focus-ring flex items-center gap-2 hover:bg-paper-2"
                      (click)="toggle('p-' + item.orderItemIndex)"
                      [attr.aria-expanded]="expanded().has('p-' + item.orderItemIndex)"
                      [attr.data-test]="'inspector-product-' + item.orderItemIndex"
                    >
                      <span
                        class="inline-flex items-center justify-center w-7 h-7 shrink-0 rounded-sm border hairline text-sm font-semibold text-ink bg-paper-2"
                        aria-hidden="true"
                        >{{ expanded().has('p-' + item.orderItemIndex) ? '−' : '+' }}</span
                      >
                      @if (item.productPhotoUrl) {
                        <img
                          [src]="item.productPhotoUrl"
                          alt=""
                          class="w-9 h-9 rounded-sm object-cover border hairline shrink-0"
                        />
                      } @else {
                        <span
                          class="w-9 h-9 rounded-sm border hairline shrink-0 bg-paper-2 text-[10px] flex items-center justify-center text-muted-foreground"
                          >изд.</span
                        >
                      }
                      <span class="min-w-0 flex-1">
                        <span class="font-medium block truncate">{{ item.productName }}</span>
                        <span class="text-[10px] text-muted-foreground"
                          >Изделие · нажмите строку</span
                        >
                      </span>
                      <span class="font-mono text-[10px] text-muted-foreground shrink-0"
                        >×{{ item.quantity }}</span
                      >
                    </button>
                    <a
                      class="shrink-0 px-2 flex items-center text-[11px] text-ink underline-offset-2 hover:underline border-l hairline pi-focus-ring"
                      [routerLink]="['/products', item.productId]"
                      data-test="inspector-open-product"
                      title="Открыть карточку изделия"
                      >→</a
                    >
                  </div>
                  @if (expanded().has('p-' + item.orderItemIndex)) {
                    <ul class="border-t hairline">
                      @for (mod of item.modules; track mod.moduleId) {
                        <li>
                          <div class="flex items-stretch">
                            <button
                              type="button"
                              class="flex-1 min-w-0 text-left pl-3 pr-2 py-2 pi-focus-ring flex items-center gap-2 hover:bg-paper-2 text-xs"
                              (click)="toggle('m-' + mod.moduleId)"
                              [attr.aria-expanded]="expanded().has('m-' + mod.moduleId)"
                              [attr.data-test]="'inspector-module-' + mod.moduleId"
                            >
                              <span
                                class="inline-flex items-center justify-center w-6 h-6 shrink-0 rounded-sm border hairline text-xs font-semibold bg-paper-2"
                                aria-hidden="true"
                                >{{ expanded().has('m-' + mod.moduleId) ? '−' : '+' }}</span
                              >
                              @if (mod.modulePhotoUrl) {
                                <img
                                  [src]="mod.modulePhotoUrl"
                                  alt=""
                                  class="w-8 h-8 rounded-sm object-cover border hairline shrink-0"
                                />
                              }
                              <span class="truncate font-medium">{{ mod.moduleName }}</span>
                            </button>
                            <a
                              class="shrink-0 px-2 flex items-center text-[11px] underline-offset-2 hover:underline border-l hairline pi-focus-ring"
                              [routerLink]="['/modules', mod.moduleId]"
                              data-test="inspector-open-module"
                              title="Открыть карточку модуля"
                              >→</a
                            >
                          </div>
                          @if (expanded().has('m-' + mod.moduleId)) {
                            <ul class="border-t hairline">
                              @for (wt of mod.workTypes; track wt.workTypeId) {
                                <li
                                  class="pl-4 pr-2 py-2.5 space-y-1.5 border-b hairline last:border-0"
                                  [style.background]="wtWash(wt.workTypeId, wt.accentHue)"
                                  [attr.data-test]="'inspector-wt-' + wt.workTypeId"
                                >
                                  <div class="flex items-center gap-2">
                                    <span
                                      class="w-3 h-3 rounded-sm shrink-0 border hairline"
                                      [style.background]="wtFill(wt.workTypeId, wt.accentHue)"
                                      aria-hidden="true"
                                    ></span>
                                    <div class="text-xs font-medium truncate">
                                      {{ wt.workTypeName }}
                                    </div>
                                  </div>
                                  <div class="text-[10px] text-muted-foreground pl-5">
                                    Люди: {{ workerLabel(wt.workTypeId) }}
                                  </div>
                                  <label class="flex items-center gap-2 text-[11px] pl-5">
                                    <span class="text-muted-foreground shrink-0">Дни</span>
                                    <input
                                      type="number"
                                      min="1"
                                      step="1"
                                      class="pi-input !py-0.5 !text-xs w-16"
                                      [value]="daysDraft(wt.workTypeId, wt.days)"
                                      [disabled]="!canEditCatalog() || daysSaving()"
                                      (change)="onDaysChange(wt.workTypeId, $event)"
                                      [attr.data-test]="'inspector-days-' + wt.workTypeId"
                                    />
                                  </label>
                                  <p class="text-[10px] text-muted-foreground/80 pl-5">
                                    Цвет = вид работ (как полоска на Ганте). Дни — справочник, на
                                    все заказы с этим видом.
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
  /** Status shipped/delivered/cancelled — estimate view hint. */
  readonly estimateReadOnly = input(false);
  /** Mirror BE @Roles(admin|manager) for order PATCH. */
  readonly canEditOrder = input(false);
  /** Catalog WorkType.days — typically admin/manager. */
  readonly canEditCatalog = input(false);
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

  protected readonly priorityHint = computed(() => {
    const hit = PRIORITIES.find((p) => p.value === this.priorityDraft());
    return hit?.hint ?? '';
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

  protected wtWash(workTypeId: string, hue?: number | null): string {
    return workTypeWash(workTypeId, hue);
  }

  protected wtFill(workTypeId: string, hue?: number | null): string {
    return workTypeOklch(workTypeId, 0.12, 0.72, hue);
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
    if (!this.canEditOrder() || this.saving()) return;
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
    if (!this.canEditCatalog()) return;
    const inputEl = ev.target as HTMLInputElement;
    const raw = inputEl.value;
    const days = Math.floor(Number(raw));
    const previous = this.daysDraft(workTypeId, this.findTreeDays(workTypeId));
    if (!Number.isFinite(days) || days < 1) {
      this.toast.error('Дни: целое число ≥ 1');
      inputEl.value = String(previous);
      return;
    }
    const ok = window.confirm(
      'Изменить норматив вида работ (дни) для ВСЕХ заказов с этим видом?\n\n' +
        'Это правка справочника WorkType, не только текущего заказа.',
    );
    if (!ok) {
      inputEl.value = String(previous);
      return;
    }
    this.daysOverrides.update((m) => ({ ...m, [workTypeId]: days }));
    this.daysSaving.set(true);
    const res = await firstValueFrom(this.workTypesApi.update(workTypeId, { days }));
    this.daysSaving.set(false);
    if (!res.ok) {
      this.toast.error(extractErrorMessage(res.error));
      this.daysOverrides.update((m) => {
        const next = { ...m };
        if (typeof previous === 'number') next[workTypeId] = previous;
        else delete next[workTypeId];
        return next;
      });
      inputEl.value = String(previous);
      return;
    }
    this.toast.success('Норматив дней вида работ обновлён (глобально)');
    this.facade.clearCaches();
    await this.reloadTree(this.order());
    this.changed.emit();
  }

  private findTreeDays(workTypeId: string): number | null | undefined {
    for (const item of this.tree()?.items ?? []) {
      for (const mod of item.modules) {
        for (const wt of mod.workTypes) {
          if (wt.workTypeId === workTypeId) return wt.days;
        }
      }
    }
    return undefined;
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
