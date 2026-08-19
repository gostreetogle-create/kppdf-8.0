import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewChild,
  computed,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { formatDate } from '../../shared/util/format';
import {
  MOCK_CATEGORIES,
  MOCK_COMPANIES,
  MOCK_SUPPLIERS,
  QUICK_ORDER_PRIORITIES,
  QUICK_ORDER_REQUESTED_BY,
  QUICK_ORDER_STATUSES,
  QUICK_ORDER_UNITS,
  createEmptyQuickOrderRow,
  createQuickOrderSeedRows,
  priorityIcon,
  priorityLabel,
  prioritySortWeight,
  statusLabel,
  supplierShortLabel,
  type QuickOrderCategory,
  type QuickOrderPriority,
  type QuickOrderStatus,
  type QuickOrderSupplier,
  type SupplyQuickOrderRow,
} from './supply-quick-order.mock';

@Component({
  selector: 'app-supply-quick-order',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent],
  template: `
    <ng-template #toolbarTemplate>
      <div
        class="flex items-center gap-form-field flex-wrap w-full"
        data-test="supply-quick-toolbar"
      >
        <input
          class="pi-input w-44 min-w-[10rem]"
          type="search"
          placeholder="Поиск…"
          [ngModel]="searchQuery()"
          (ngModelChange)="searchQuery.set($event)"
          aria-label="Поиск заявок"
          data-test="supply-quick-search"
        />
        <select
          class="pi-input w-40"
          [ngModel]="statusFilter()"
          (ngModelChange)="onStatusFilter($event)"
          aria-label="Фильтр по статусу"
          data-test="supply-quick-status-filter"
        >
          <option value="">Все статусы</option>
          @for (s of statuses; track s.value) {
            <option [value]="s.value">{{ s.label }}</option>
          }
        </select>
        <select
          class="pi-input w-36"
          [ngModel]="priorityFilter()"
          (ngModelChange)="onPriorityFilter($event)"
          aria-label="Фильтр по приоритету"
          data-test="supply-quick-priority-filter"
        >
          <option value="">Все приоритеты</option>
          @for (p of priorities; track p.value) {
            <option [value]="p.value">{{ p.label }}</option>
          }
        </select>
        <span class="text-sm text-muted-foreground" data-test="supply-quick-count">
          {{ visibleRows().length }} заявок
        </span>
        <span class="flex-1"></span>
        <app-pi-button
          variant="default"
          size="sm"
          (click)="onCreate()"
          data-test="supply-quick-create"
        >
          + Создать
        </app-pi-button>
      </div>
    </ng-template>

    <div class="supply-quick-order flex flex-col gap-3 max-w-6xl" data-test="supply-quick-order">
      @if (visibleRows().length === 0) {
        <p class="text-sm text-muted-foreground m-0" data-test="supply-quick-empty">
          Нет заявок. Нажмите «+ Создать» — первая строка откроется сразу.
        </p>
      }

      @for (row of visibleRows(); track row.id) {
        <div class="supply-quick-order__item" [attr.data-test]="'supply-quick-tile-' + row.id">
          <button
            type="button"
            class="supply-quick-order__summary"
            [class.supply-quick-order__summary--expanded]="expandedId() === row.id"
            [attr.aria-expanded]="expandedId() === row.id"
            [attr.data-test]="'supply-quick-tile-toggle-' + row.id"
            (click)="toggleExpand(row.id)"
          >
            <span class="supply-quick-order__disclosure" aria-hidden="true">
              {{ expandedId() === row.id ? '▾' : '▸' }}
            </span>
            <span class="supply-quick-order__summary-text">
              <span>{{ fmtDay(row.createdAt) }}</span>
              <span class="supply-quick-order__dot">·</span>
              <span>{{ categoryLabel(row.categoryId) }}</span>
              <span class="supply-quick-order__dot">·</span>
              <span class="supply-quick-order__title">{{ row.title || 'Без названия' }}</span>
              <span class="supply-quick-order__dot">·</span>
              <span>{{ row.qty }} {{ row.unit }}</span>
              <span class="supply-quick-order__dot">·</span>
              <span
                class="supply-quick-order__status-badge"
                [attr.data-status]="row.status"
                data-test="supply-quick-status-badge"
              >
                {{ statusLabel(row.status) }}
              </span>
              <span class="supply-quick-order__dot">·</span>
              <span
                class="supply-quick-order__priority"
                [class.supply-quick-order__priority--urgent]="row.priority === 'urgent'"
                [class.supply-quick-order__priority--low]="row.priority === 'low'"
              >
                {{ priorityIcon(row.priority) }} {{ priorityLabel(row.priority) }}
              </span>
              <span class="supply-quick-order__dot">·</span>
              <span>{{ supplierShort(suppliers(), row.supplierId) }}</span>
            </span>
          </button>

          @if (expandedId() === row.id) {
            <div class="supply-quick-order__expanded" data-test="supply-quick-tile-expanded">
              <div class="flex justify-end pb-2">
                <app-pi-button
                  variant="outline"
                  size="sm"
                  class="text-destructive"
                  (click)="onDelete(row.id)"
                  data-test="supply-quick-delete"
                >
                  Удалить
                </app-pi-button>
              </div>

              <div class="pi-dashed-panel p-4 flex flex-col gap-3 mb-3">
                <h3 class="text-xs font-medium text-muted-foreground m-0 uppercase tracking-wide">
                  Что заказать
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <label class="flex flex-col gap-1 text-xs">
                    <span class="text-muted-foreground">Категория</span>
                    <div class="flex gap-2 items-center">
                      <select
                        class="pi-input flex-1"
                        [ngModel]="row.categoryId"
                        (ngModelChange)="patchRow(row.id, { categoryId: $event })"
                        data-test="supply-quick-category-select"
                      >
                        @for (c of categories(); track c.id) {
                          <option [value]="c.id">{{ c.label }}</option>
                        }
                      </select>
                      @if (!showNewCategory()) {
                        <button
                          type="button"
                          class="text-xs underline underline-offset-2 shrink-0"
                          (click)="showNewCategory.set(true)"
                          data-test="supply-quick-category-add"
                        >
                          + Новая
                        </button>
                      }
                    </div>
                    @if (showNewCategory()) {
                      <div
                        class="flex gap-2 items-end mt-1 p-2 border hairline rounded-sm"
                        data-test="supply-quick-category-panel"
                      >
                        <label class="flex flex-col gap-1 flex-1">
                          <span class="text-muted-foreground">Название категории</span>
                          <input
                            class="pi-input"
                            [ngModel]="newCategoryName()"
                            (ngModelChange)="newCategoryName.set($event)"
                          />
                        </label>
                        <app-pi-button
                          variant="default"
                          size="sm"
                          (click)="saveNewCategory(row.id)"
                        >
                          Сохранить
                        </app-pi-button>
                        <app-pi-button variant="outline" size="sm" (click)="cancelNewCategory()">
                          Отмена
                        </app-pi-button>
                      </div>
                    }
                  </label>
                  <label class="flex flex-col gap-1 text-xs md:col-span-2">
                    <span class="text-muted-foreground">Наименование *</span>
                    <input
                      class="pi-input"
                      [ngModel]="row.title"
                      (ngModelChange)="patchRow(row.id, { title: $event })"
                      maxlength="256"
                      data-test="supply-quick-title-input"
                    />
                  </label>
                  <label class="flex flex-col gap-1 text-xs">
                    <span class="text-muted-foreground">Артикул</span>
                    <input
                      class="pi-input"
                      [ngModel]="row.article"
                      (ngModelChange)="patchRow(row.id, { article: $event })"
                    />
                  </label>
                  <label class="flex flex-col gap-1 text-xs">
                    <span class="text-muted-foreground">Цвет</span>
                    <input
                      class="pi-input"
                      [ngModel]="row.color"
                      (ngModelChange)="patchRow(row.id, { color: $event })"
                    />
                  </label>
                  <div class="flex flex-col gap-1 text-xs">
                    <span class="text-muted-foreground">Фото</span>
                    <div
                      class="flex items-center gap-2 p-2 border hairline rounded-sm text-xs text-muted-foreground"
                      data-test="supply-quick-photo-stub"
                    >
                      <span
                        class="inline-block w-10 h-10 bg-paper-2 border hairline rounded-sm"
                      ></span>
                      <button type="button" class="underline underline-offset-2" disabled>
                        Загрузить
                      </button>
                    </div>
                  </div>
                  <label class="flex flex-col gap-1 text-xs">
                    <span class="text-muted-foreground">Кол-во *</span>
                    <input
                      class="pi-input"
                      type="number"
                      min="0"
                      step="any"
                      [ngModel]="row.qty"
                      (ngModelChange)="patchRow(row.id, { qty: +$event })"
                    />
                  </label>
                  <label class="flex flex-col gap-1 text-xs">
                    <span class="text-muted-foreground">Ед. изм. *</span>
                    <select
                      class="pi-input"
                      [ngModel]="row.unit"
                      (ngModelChange)="patchRow(row.id, { unit: $event })"
                    >
                      @for (u of units; track u) {
                        <option [value]="u">{{ u }}</option>
                      }
                    </select>
                  </label>
                </div>
              </div>

              <div class="pi-dashed-panel p-4 flex flex-col gap-3 mb-3">
                <h3 class="text-xs font-medium text-muted-foreground m-0 uppercase tracking-wide">
                  Откуда купить
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label class="flex flex-col gap-1 text-xs">
                    <span class="text-muted-foreground">Поставщик</span>
                    <div class="flex gap-2 items-center">
                      <select
                        class="pi-input flex-1"
                        [ngModel]="row.supplierId ?? ''"
                        (ngModelChange)="patchRow(row.id, { supplierId: $event || null })"
                        data-test="supply-quick-supplier-select"
                      >
                        <option value="">—</option>
                        @for (s of suppliers(); track s.id) {
                          <option [value]="s.id">{{ s.name }}</option>
                        }
                      </select>
                      @if (!showNewSupplier()) {
                        <button
                          type="button"
                          class="text-xs underline underline-offset-2 shrink-0"
                          (click)="showNewSupplier.set(true)"
                          data-test="supply-quick-supplier-add"
                        >
                          + Новый
                        </button>
                      }
                    </div>
                    @if (showNewSupplier()) {
                      <div
                        class="flex flex-col gap-2 mt-1 p-2 border hairline rounded-sm"
                        data-test="supply-quick-supplier-panel"
                      >
                        <label class="flex flex-col gap-1">
                          <span class="text-muted-foreground">Название *</span>
                          <input
                            class="pi-input"
                            [ngModel]="newSupplierName()"
                            (ngModelChange)="newSupplierName.set($event)"
                          />
                        </label>
                        <label class="flex flex-col gap-1">
                          <span class="text-muted-foreground">Сайт</span>
                          <input
                            class="pi-input"
                            [ngModel]="newSupplierWebsite()"
                            (ngModelChange)="newSupplierWebsite.set($event)"
                            placeholder="https://…"
                          />
                        </label>
                        <div class="flex gap-2">
                          <app-pi-button
                            variant="default"
                            size="sm"
                            (click)="saveNewSupplier(row.id)"
                            data-test="supply-quick-supplier-save"
                          >
                            Сохранить
                          </app-pi-button>
                          <app-pi-button variant="outline" size="sm" (click)="cancelNewSupplier()">
                            Отмена
                          </app-pi-button>
                        </div>
                      </div>
                    }
                  </label>
                  <label class="flex flex-col gap-1 text-xs">
                    <span class="text-muted-foreground">Ссылка на товар</span>
                    <input
                      class="pi-input"
                      [ngModel]="row.productUrl"
                      (ngModelChange)="patchRow(row.id, { productUrl: $event })"
                      placeholder="https://…"
                    />
                  </label>
                </div>
              </div>

              <div class="pi-dashed-panel p-4 flex flex-col gap-3 mb-3">
                <h3 class="text-xs font-medium text-muted-foreground m-0 uppercase tracking-wide">
                  Контекст
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <label class="flex flex-col gap-1 text-xs">
                    <span class="text-muted-foreground">Наша компания</span>
                    <select
                      class="pi-input"
                      [ngModel]="row.companyId"
                      (ngModelChange)="patchRow(row.id, { companyId: $event })"
                    >
                      @for (c of companies; track c.id) {
                        <option [value]="c.id">{{ c.name }}</option>
                      }
                    </select>
                  </label>
                  <label class="flex flex-col gap-1 text-xs">
                    <span class="text-muted-foreground">Кто просил</span>
                    <select
                      class="pi-input"
                      [ngModel]="row.requestedBy"
                      (ngModelChange)="patchRow(row.id, { requestedBy: $event })"
                    >
                      @for (r of requestedBy; track r) {
                        <option [value]="r">{{ r }}</option>
                      }
                    </select>
                  </label>
                  <label class="flex flex-col gap-1 text-xs">
                    <span class="text-muted-foreground">Связь с заказом</span>
                    <input
                      class="pi-input"
                      [ngModel]="row.orderId ?? ''"
                      (ngModelChange)="patchRow(row.id, { orderId: $event || null })"
                      placeholder="Необязательно"
                    />
                  </label>
                  <label class="flex flex-col gap-1 text-xs">
                    <span class="text-muted-foreground">Нужно к</span>
                    <input
                      class="pi-input"
                      type="date"
                      [ngModel]="row.neededBy"
                      (ngModelChange)="patchRow(row.id, { neededBy: $event })"
                    />
                  </label>
                </div>
              </div>

              <div class="pi-dashed-panel p-4 flex flex-col gap-3 mb-3">
                <h3 class="text-xs font-medium text-muted-foreground m-0 uppercase tracking-wide">
                  Статус и приоритет
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label class="flex flex-col gap-1 text-xs">
                    <span class="text-muted-foreground">Статус</span>
                    <select
                      class="pi-input"
                      [ngModel]="row.status"
                      (ngModelChange)="patchRow(row.id, { status: $event })"
                      data-test="supply-quick-status-select"
                    >
                      @for (s of statuses; track s.value) {
                        <option [value]="s.value">{{ s.label }}</option>
                      }
                    </select>
                  </label>
                  <label class="flex flex-col gap-1 text-xs">
                    <span class="text-muted-foreground">Приоритет</span>
                    <select
                      class="pi-input"
                      [ngModel]="row.priority"
                      (ngModelChange)="patchRow(row.id, { priority: $event })"
                      data-test="supply-quick-priority-select"
                    >
                      @for (p of priorities; track p.value) {
                        <option [value]="p.value">{{ p.label }}</option>
                      }
                    </select>
                  </label>
                  <label class="flex flex-col gap-1 text-xs md:col-span-2">
                    <span class="text-muted-foreground">Примечание</span>
                    <textarea
                      class="pi-input min-h-[4rem]"
                      [ngModel]="row.notes"
                      (ngModelChange)="patchRow(row.id, { notes: $event })"
                      rows="3"
                    ></textarea>
                  </label>
                </div>
              </div>

              <button
                type="button"
                class="supply-quick-order__more-toggle"
                [attr.aria-expanded]="moreExpanded()"
                (click)="moreExpanded.set(!moreExpanded())"
                data-test="supply-quick-more-toggle"
              >
                {{ moreExpanded() ? '▾' : '▸' }} Ещё
              </button>
              @if (moreExpanded()) {
                <div
                  class="pi-dashed-panel p-4 flex flex-col gap-3"
                  data-test="supply-quick-more-panel"
                >
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label class="flex flex-col gap-1 text-xs">
                      <span class="text-muted-foreground">Ориентир. цена</span>
                      <input
                        class="pi-input"
                        type="number"
                        min="0"
                        step="any"
                        [ngModel]="row.priceHint"
                        (ngModelChange)="
                          patchRow(row.id, { priceHint: $event === '' ? null : +$event })
                        "
                      />
                    </label>
                    <label class="flex flex-col gap-1 text-xs">
                      <span class="text-muted-foreground">Сумма строки</span>
                      <input
                        class="pi-input"
                        type="number"
                        min="0"
                        step="any"
                        [ngModel]="row.lineTotal"
                        (ngModelChange)="
                          patchRow(row.id, { lineTotal: $event === '' ? null : +$event })
                        "
                      />
                    </label>
                    <label class="flex flex-col gap-1 text-xs">
                      <span class="text-muted-foreground">Дата заказа у поставщика</span>
                      <input
                        class="pi-input"
                        type="date"
                        [ngModel]="row.supplierOrderDate"
                        (ngModelChange)="patchRow(row.id, { supplierOrderDate: $event })"
                      />
                    </label>
                    <div class="flex flex-col gap-1 text-xs">
                      <span class="text-muted-foreground">Ответственный</span>
                      <span class="text-sm">{{ row.responsible }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .supply-quick-order__item {
        min-width: 0;
      }
      .supply-quick-order__summary {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        width: 100%;
        min-height: 3rem;
        padding: 0.55rem 0.75rem;
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        background: var(--color-paper);
        color: inherit;
        cursor: pointer;
        text-align: left;
        transition:
          border-color 120ms ease,
          background-color 120ms ease;
      }
      .supply-quick-order__summary:hover,
      .supply-quick-order__summary--expanded {
        border-color: var(--color-sunrise-warm, #c79542);
        background: var(--color-sunrise-soft, #fff6df);
      }
      .supply-quick-order__summary--expanded {
        border-bottom-color: transparent;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }
      .supply-quick-order__disclosure {
        display: inline-flex;
        width: 1.2rem;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        color: var(--color-sunrise-warm, #9b6b1e);
        font-size: 0.9rem;
      }
      .supply-quick-order__summary-text {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.25rem 0.35rem;
        min-width: 0;
        font-size: 0.82rem;
      }
      .supply-quick-order__dot {
        color: var(--color-muted-foreground);
      }
      .supply-quick-order__title {
        font-weight: 600;
        max-width: 14rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .supply-quick-order__status-badge {
        display: inline-flex;
        padding: 0.1rem 0.4rem;
        border-radius: 2px;
        border: 1px solid var(--color-rule);
        background: var(--color-paper-2);
        font-size: 0.75rem;
      }
      .supply-quick-order__priority--urgent {
        color: var(--color-destructive);
      }
      .supply-quick-order__priority--low {
        color: var(--color-success, #2d6a4f);
      }
      .supply-quick-order__expanded {
        padding: 0 0.75rem 0.75rem;
        border: 1px solid var(--color-sunrise-warm, #c79542);
        border-top: none;
        border-radius: 0 0 2px 2px;
        background: var(--color-paper);
      }
      .supply-quick-order__more-toggle {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        margin-bottom: 0.5rem;
        padding: 0.25rem 0;
        border: none;
        background: transparent;
        color: var(--color-muted-foreground);
        font: inherit;
        font-size: 0.82rem;
        cursor: pointer;
      }
      .supply-quick-order__more-toggle:hover {
        color: var(--color-ink);
      }
    `,
  ],
})
export class SupplyQuickOrderComponent {
  readonly prefillOrderId = input<string | null>(null);

  @ViewChild('toolbarTemplate', { static: true })
  readonly toolbarTemplate!: TemplateRef<void>;

  protected readonly statuses = QUICK_ORDER_STATUSES;
  protected readonly priorities = QUICK_ORDER_PRIORITIES;
  protected readonly units = QUICK_ORDER_UNITS;
  protected readonly companies = MOCK_COMPANIES;
  protected readonly requestedBy = QUICK_ORDER_REQUESTED_BY;

  protected readonly rows = signal<SupplyQuickOrderRow[]>(createQuickOrderSeedRows());
  protected readonly categories = signal<QuickOrderCategory[]>([...MOCK_CATEGORIES]);
  protected readonly suppliers = signal<QuickOrderSupplier[]>([...MOCK_SUPPLIERS]);

  protected readonly expandedId = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly statusFilter = signal<QuickOrderStatus | ''>('');
  protected readonly priorityFilter = signal<QuickOrderPriority | ''>('');
  protected readonly moreExpanded = signal(false);

  protected readonly showNewSupplier = signal(false);
  protected readonly newSupplierName = signal('');
  protected readonly newSupplierWebsite = signal('');

  protected readonly showNewCategory = signal(false);
  protected readonly newCategoryName = signal('');

  protected readonly visibleRows = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    const priority = this.priorityFilter();

    let list = this.rows().filter((row) => {
      if (status && row.status !== status) return false;
      if (priority && row.priority !== priority) return false;
      if (!q) return true;
      const cat = this.categoryLabel(row.categoryId).toLowerCase();
      const sup = row.supplierId
        ? (this.suppliers().find((s) => s.id === row.supplierId)?.name ?? '').toLowerCase()
        : '';
      return (
        row.title.toLowerCase().includes(q) ||
        row.article.toLowerCase().includes(q) ||
        cat.includes(q) ||
        sup.includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      const pw = prioritySortWeight(b.priority) - prioritySortWeight(a.priority);
      if (pw !== 0) return pw;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return list;
  });

  protected statusLabel = statusLabel;
  protected priorityLabel = priorityLabel;
  protected priorityIcon = priorityIcon;

  protected fmtDay(d: Date): string {
    return formatDate(d.toISOString()).slice(0, 5);
  }

  protected categoryLabel(categoryId: string): string {
    return this.categories().find((c) => c.id === categoryId)?.label ?? '—';
  }

  protected supplierShort(suppliers: QuickOrderSupplier[], supplierId: string | null): string {
    return supplierShortLabel(suppliers, supplierId);
  }

  protected onStatusFilter(v: string): void {
    this.statusFilter.set((v || '') as QuickOrderStatus | '');
  }

  protected onPriorityFilter(v: string): void {
    this.priorityFilter.set((v || '') as QuickOrderPriority | '');
  }

  protected toggleExpand(id: string): void {
    const next = this.expandedId() === id ? null : id;
    this.expandedId.set(next);
    if (next) this.moreExpanded.set(false);
  }

  protected onCreate(): void {
    const row = createEmptyQuickOrderRow(this.prefillOrderId());
    this.rows.update((rows) => [row, ...rows]);
    this.expandedId.set(row.id);
    this.moreExpanded.set(false);
    queueMicrotask(() => {
      const el = document.querySelector<HTMLInputElement>('[data-test="supply-quick-title-input"]');
      el?.focus();
    });
  }

  protected patchRow(id: string, patch: Partial<SupplyQuickOrderRow>): void {
    this.rows.update((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  protected onDelete(id: string): void {
    if (!globalThis.confirm?.('Удалить заявку?')) return;
    this.rows.update((rows) => rows.filter((r) => r.id !== id));
    if (this.expandedId() === id) this.expandedId.set(null);
  }

  protected saveNewSupplier(rowId: string): void {
    const name = this.newSupplierName().trim();
    if (!name) return;
    const id = `sup-${Date.now()}`;
    const website = this.newSupplierWebsite().trim();
    const supplier: QuickOrderSupplier = { id, name, ...(website ? { website } : {}) };
    this.suppliers.update((list) => [...list, supplier]);
    this.patchRow(rowId, { supplierId: id });
    this.cancelNewSupplier();
  }

  protected cancelNewSupplier(): void {
    this.showNewSupplier.set(false);
    this.newSupplierName.set('');
    this.newSupplierWebsite.set('');
  }

  protected saveNewCategory(rowId: string): void {
    const label = this.newCategoryName().trim();
    if (!label) return;
    const id = `cat-${Date.now()}`;
    this.categories.update((list) => [...list, { id, label }]);
    this.patchRow(rowId, { categoryId: id });
    this.cancelNewCategory();
  }

  protected cancelNewCategory(): void {
    this.showNewCategory.set(false);
    this.newCategoryName.set('');
  }
}
