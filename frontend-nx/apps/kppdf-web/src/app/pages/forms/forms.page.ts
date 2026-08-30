import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { PiPageHeaderComponent } from '@kppdf/ui/page';
import { PiSectionComponent } from '@kppdf/ui/page';
import { ButtonComponent } from '@kppdf/ui/button';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';
import { SelectComponent } from '@kppdf/ui/select';
import { SelectOptionComponent } from '@kppdf/ui/select';
import { CheckboxComponent } from '@kppdf/ui/checkbox';
import { PiToastService } from '@kppdf/ui/toast';
import { ColumnDef, TableComponent } from '@kppdf/ui/table';
import { PiTableTreeComponent } from '@kppdf/ui/table-tree';
import { PiRowActionsComponent } from '@kppdf/ui/row-actions';
import { PiSelectAddRowComponent } from '@kppdf/ui/select-add-row';

interface InventoryRow {
  id: string;
  name: string;
  qty: number;
  status: 'in-stock' | 'low' | 'out';
}

interface StockRow {
  id: string;
  name: string;
  qty: number;
  supplier: string;
  lastDelivery: string;
}

interface CategoryNode {
  _id: string;
  name: string;
  qty: number;
}

type SortKey = 'name' | 'qty' | 'status' | null;
type SortDir = 'asc' | 'desc';

/**
 * Forms page (/kit/forms) — TZ-72, TZ-UI-WR-506.
 *
 * Validated reactive form + sortable paginated data-table
 * (TableComponent) + form variants (inline, stacked, architectural).
 *
 * ── Паспорта примитивов ──
 *
 * PiSelect
 *   Назначение: выбор из статического списка опций в форме.
 *   Anti-use: не для динамических/поисковых списков (OverflowSelect),
 *             не для навигации, не для меню.
 *   Keyboard: ↑↓ стрелки, Enter выбрать, Esc закрыть.
 *   Статус: canonical.
 *
 * FormField
 *   Назначение: обёртка label + error + hint для form-контролов.
 *   Anti-use: не standalone, всегда с Input/Select/Checkbox.
 *   Keyboard: label кликабелен (htmlFor).
 *   Статус: canonical.
 *
 * Skeleton
 *   Назначение: placeholder-анимация загрузки контента (заглушка).
 *   Anti-use: не для пустых состояний (EmptyState), не для ошибок.
 *   Keyboard: не интерактивен.
 *   Статус: experimental (компонент не создан, заменяется текстом «Загрузка…»).
 *
 * Native &lt;select&gt;
 *   Назначение: короткий enum ≤~20 опций без поиска — официальный Paper & Ink
 *     fallback. Класс `.pi-native-select` в styles.css подгоняет border/radius/
 *     height/color под токены form-control (как app-pi-input).
 *   Anti-use: не для каталогов / поиска по 1000+ (PiOverflowSelect),
 *             не для меню действий (DropdownMenu), не Material MatSelect.
 *   Keyboard: стандартная клавиатура браузера — Tab/Shift-Tab, пробел раскрыть,
 *     стрелки ↑↓, Enter выбрать, Esc закрыть.
 *   Статус: canonical (TZ-UI-ROI-521).
 *
 * PiSelectAddRow
 *   Назначение: select + инлайн-кнопка «+» в одном ряду — быстрое создание
 *     нового значения списка прямо рядом с полем (TZ-UI-PLUS-605). Проверен
 *     в проде: 25 мест использования в materials/products/orders/proposals/
 *     counterparties/doc-constructor.
 *   Anti-use: не для меню действий, не для случаев где создание требует
 *     отдельной многополевой формы (там — отдельная кнопка + диалог).
 *   Keyboard: `+`-кнопка — обычная кнопка, Tab-доступна, Enter/Space жмёт.
 *   Статус: canonical.
 *
 * TableTree
 *   Назначение: раскрывающаяся (expandable) древовидная таблица —
 *     категории/подкатегории, с опциональным drag-reorder.
 *   Anti-use: не для плоских списков (обычный TableComponent), не для
 *     таблиц с сортировкой по колонкам (сортировка не реализована в
 *     tree-варианте).
 *   Keyboard: кнопка раскрытия узла — Tab/Enter/Space; drag-reorder — мышь/
 *     touch only (нет keyboard reordering).
 *   Статус: canonical.
 *
 * TableComponent [expandedRow] + [rowActions]
 *   Назначение: обычная (плоская) таблица тоже умеет раскрывающуюся деталь-
 *     строку (`[expandedRow]` + `[expandedRowWhen]` + `(rowClick)`) и
 *     правую колонку действий (`[rowActions]` + `app-pi-row-actions`) —
 *     это встроенные возможности TableComponent, не отдельные компоненты.
 *   Anti-use: `[expandedRow]` — не для древовидных данных (TableTree);
 *     `[rowActions]` — не для навигации (используй ссылку в ячейке).
 *   Keyboard: строка с `[expandedRow]` — Tab на строку, Enter/Space
 *     раскрывает (см. `onRowKeydown` в pi-table.component.ts).
 *   Статус: canonical.
 */
@Component({
  selector: 'app-forms-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiPageHeaderComponent,
    PiSectionComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    SelectComponent,
    SelectOptionComponent,
    CheckboxComponent,
    TableComponent,
    PiTableTreeComponent,
    PiRowActionsComponent,
    PiSelectAddRowComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="04 · формы и таблицы"
      title="Формы &amp; Таблицы"
      description="Реактивные формы с validators и sortable, paginated data-table."
    />

    <!-- ───── Section I. Validated form ───── -->
    <app-pi-section title="Validated form" hint="reactive · class-validator" eyebrow="I">
      <form
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="max-w-xl space-y-form-field"
        data-test="validated-form"
      >
        <app-pi-form-field
          label="Имя"
          htmlFor="form-name"
          [required]="true"
          [error]="
            form.controls.name.invalid && form.controls.name.touched ? 'Минимум 2 символа' : ''
          "
        >
          <app-pi-input
            id="form-name"
            type="text"
            formControlName="name"
            placeholder="Иван"
            [invalid]="form.controls.name.invalid && form.controls.name.touched"
          />
        </app-pi-form-field>

        <app-pi-form-field
          label="E-mail"
          htmlFor="form-email"
          [required]="true"
          [error]="
            form.controls.email.invalid && form.controls.email.touched ? 'Невалидный e-mail' : ''
          "
        >
          <app-pi-input
            id="form-email"
            type="email"
            formControlName="email"
            placeholder="you@example.com"
            [invalid]="form.controls.email.invalid && form.controls.email.touched"
          />
        </app-pi-form-field>

        <app-pi-form-field label="Роль" [required]="true">
          <app-pi-select formControlName="role" placeholder="Выберите роль" ariaLabel="Роль">
            <app-pi-select-option value="admin">Admin</app-pi-select-option>
            <app-pi-select-option value="manager">Manager</app-pi-select-option>
            <app-pi-select-option value="user">User</app-pi-select-option>
          </app-pi-select>
        </app-pi-form-field>

        <div class="flex items-center gap-2">
          <app-pi-checkbox formControlName="subscribe" ariaLabel="Подписаться на обновления" />
          <span class="text-sm">Подписаться на обновления</span>
        </div>

        <div class="flex gap-2 pt-2">
          <app-pi-button type="submit" variant="default" [disabled]="form.invalid">
            Отправить
          </app-pi-button>
          <app-pi-button type="button" variant="ghost" (click)="form.reset()">
            Сбросить
          </app-pi-button>
        </div>
      </form>
    </app-pi-section>

    <!-- ───── Section II. Data table ───── -->
    <app-pi-section title="Data table" hint="sortable · paginated · row actions" eyebrow="II">
      <div class="hairline rounded-sm overflow-hidden">
        <app-pi-table
          [data]="pagedRows()"
          [columns]="columns"
          [total]="data().length"
          [page]="page()"
          [pageSize]="pageSize"
          ariaLabel="Демонстрационная таблица запасов"
          data-test="forms-table"
          (pageChange)="onPageChange($event)"
          [localSort]="false"
          (sortChange)="onSortChange($event)"
          [rowActions]="inventoryActionsTpl"
        />
      </div>
      <ng-template #inventoryActionsTpl let-row>
        <app-pi-row-actions
          [row]="row"
          editLabel="Редактировать"
          deleteLabel="Удалить"
          dataTestEdit="inventory-edit"
          dataTestDelete="inventory-delete"
          (edit)="onInventoryEdit($event)"
          (delete)="onInventoryDelete($event)"
        />
      </ng-template>
    </app-pi-section>

    <!-- ───── Section III. Select + inline create (TZ-UI-PLUS-605) ───── -->
    <app-pi-section
      title="Select + inline create"
      hint="app-pi-select-add-row · «+» ряд рядом с полем"
      eyebrow="III"
    >
      <app-pi-form-field label="Категория" htmlFor="form-category-add" class="max-w-xl">
        <app-pi-select-add-row
          addTitle="Добавить категорию"
          addAriaLabel="Добавить категорию"
          addDataTest="kit-category-add"
          (addClick)="onAddCategory()"
        >
          <app-pi-select
            id="form-category-add"
            ariaLabel="Категория"
            placeholder="Выберите категорию"
            [value]="selectedCategory()"
            (valueChange)="selectedCategory.set($event)"
          >
            @for (opt of categoryOptions(); track opt) {
              <app-pi-select-option [value]="opt">{{ opt }}</app-pi-select-option>
            }
          </app-pi-select>
        </app-pi-select-add-row>
      </app-pi-form-field>
    </app-pi-section>

    <!-- ───── Section IV. Expandable table (TableComponent [expandedRow]) ───── -->
    <app-pi-section
      title="Expandable table"
      hint="[expandedRow] · [expandedRowWhen] · одна деталь-строка за раз"
      eyebrow="IV"
    >
      <div class="hairline rounded-sm overflow-hidden">
        <app-pi-table
          [data]="stockRows"
          [columns]="stockColumns"
          ariaLabel="Остатки по поставщикам"
          data-test="expandable-table"
          [expandedRow]="stockDetailTpl"
          [expandedRowWhen]="isStockRowExpanded"
          (rowClick)="toggleStockRow($event)"
        />
      </div>
      <ng-template #stockDetailTpl let-row>
        <div class="p-4 text-sm grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 max-w-md">
          <span class="text-muted-foreground">Поставщик</span><span>{{ row.supplier }}</span>
          <span class="text-muted-foreground">Последняя поставка</span>
          <span>{{ row.lastDelivery }}</span>
        </div>
      </ng-template>
    </app-pi-section>

    <!-- ───── Section V. Tree table (app-pi-table-tree) ───── -->
    <app-pi-section
      title="Tree table"
      hint="app-pi-table-tree · категории → подкатегории"
      eyebrow="V"
    >
      <div class="hairline rounded-sm overflow-hidden">
        <app-pi-table-tree
          [data]="treeRows"
          [columns]="treeColumns"
          [childRows]="treeChildRowsOf"
          ariaLabel="Дерево категорий"
          data-test="tree-table"
        />
      </div>
    </app-pi-section>

    <!-- ───── Section VI. Hint tones (TZ-UI-DEN-502) ───── -->
    <app-pi-section title="Hint tones" hint="default · ai · success · warn" eyebrow="VI">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field max-w-2xl">
        <app-pi-form-field label="Default" hint="Muted helper — backward compatible">
          <app-pi-input type="text" placeholder="Default tone" />
        </app-pi-form-field>
        <app-pi-form-field
          label="AI suggestion"
          hint="Подсказка от AI — не подтверждение"
          hintTone="ai"
        >
          <app-pi-input type="text" placeholder="AI tone" />
        </app-pi-form-field>
        <app-pi-form-field label="Success" hint="Значение сохранено" hintTone="success">
          <app-pi-input type="text" placeholder="Success tone" />
        </app-pi-form-field>
        <app-pi-form-field label="Warning" hint="Проверьте формат" hintTone="warn">
          <app-pi-input type="text" placeholder="Warn tone" />
        </app-pi-form-field>
      </div>
    </app-pi-section>

    <!-- ───── Section VII. Form variants ───── -->
    <app-pi-section title="Form variants" hint="inline · stacked · architectural" eyebrow="VII">
      <div class="space-y-section max-w-2xl">
        <div>
          <p class="eyebrow mb-3">Inline (label · input · button в одну строку)</p>
          <div class="flex items-end gap-form-field">
            <app-pi-form-field label="Поиск" htmlFor="form-search" class="flex-1">
              <app-pi-input id="form-search" type="search" placeholder="Найти…" />
            </app-pi-form-field>
            <app-pi-button variant="default">Найти</app-pi-button>
          </div>
        </div>
        <div>
          <p class="eyebrow mb-3">Stacked (label сверху)</p>
          <div class="space-y-form-field">
            <app-pi-form-field label="Город" htmlFor="form-city">
              <app-pi-input id="form-city" type="text" placeholder="Москва" />
            </app-pi-form-field>
            <app-pi-form-field label="Индекс" htmlFor="form-zip">
              <app-pi-input id="form-zip" type="text" placeholder="101000" />
            </app-pi-form-field>
          </div>
        </div>
        <!-- TZ-95: Architectural form field demo -->
        <div>
          <p class="eyebrow mb-3">Architectural (pi-dashed-panel + pi-tech-label)</p>
          <div class="pi-dashed-panel p-stack-lg bg-paper max-w-md">
            <span class="pi-tech-label absolute top-2 right-2">REF: FORM.04</span>
            <h4 class="font-title-sm text-ink mb-stack-sm">Form Field (Architectural)</h4>
            <div class="space-y-form-field">
              <app-pi-form-field
                label="Email"
                hint="Используется для уведомлений"
                [required]="true"
              >
                <app-pi-input type="email" placeholder="user@company.ru" />
              </app-pi-form-field>
              <app-pi-form-field label="Пароль" [required]="true">
                <app-pi-input type="password" placeholder="Введите пароль" />
              </app-pi-form-field>
            </div>
          </div>
        </div>
      </div>
    </app-pi-section>
    <!-- ───── Section VIII. Footer pattern (single CTA) — TZ-UI-DEN-504 ───── -->
    <app-pi-section
      title="Footer pattern (single CTA)"
      hint="Desktop Import reference · one gold button"
      eyebrow="VIII"
    >
      <p class="text-xs text-muted-foreground max-w-prose mb-4">
        На экране — <strong class="font-medium text-ink">одна</strong> золотая залитая кнопка (<code
          class="font-mono text-[11px]"
          >variant="default"</code
        >). Остальные действия — <code class="font-mono text-[11px]">outline</code> или
        <code class="font-mono text-[11px]">ghost</code>.
      </p>
      <div
        class="hairline-t pt-3 flex items-center justify-between gap-4 min-h-[44px] bg-paper sticky bottom-0"
        data-test="footer-single-cta"
      >
        <p class="text-xs text-muted-foreground font-mono tabular-nums">
          Идемпотентность: повторная отправка безопасна · 142 строки готовы
        </p>
        <div class="flex items-center gap-2 shrink-0">
          <app-pi-button variant="outline" type="button">Отмена</app-pi-button>
          <app-pi-button variant="default" type="button">Отправить 142 строки</app-pi-button>
        </div>
      </div>
    </app-pi-section>
  `,
})
export class FormsPage {
  protected readonly toast = inject(PiToastService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.minLength(2)]),
    email: this.fb.control('', [Validators.required, Validators.email]),
    role: this.fb.control<'admin' | 'manager' | 'user'>('user', [Validators.required]),
    subscribe: this.fb.control(false),
  });

  protected readonly data = signal<InventoryRow[]>([
    { id: '1', name: 'Бумага А4', qty: 240, status: 'in-stock' },
    { id: '2', name: 'Картридж HP', qty: 12, status: 'low' },
    { id: '3', name: 'Сетевой кабель', qty: 0, status: 'out' },
    { id: '4', name: 'Папка-регистратор', qty: 86, status: 'in-stock' },
    { id: '5', name: 'Маркер', qty: 5, status: 'low' },
    { id: '6', name: 'Степлер', qty: 24, status: 'in-stock' },
    { id: '7', name: 'Скобы', qty: 0, status: 'out' },
    { id: '8', name: 'Флешка 32ГБ', qty: 18, status: 'in-stock' },
    { id: '9', name: 'Батарейки AA', qty: 144, status: 'in-stock' },
    { id: '10', name: 'Клей ПВА', qty: 3, status: 'low' },
  ]);

  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly sortKey = signal<SortKey>(null);
  protected readonly sortDir = signal<SortDir>('asc');

  protected readonly columns: ColumnDef<InventoryRow>[] = [
    { key: 'name', label: 'Название', sortable: true },
    { key: 'qty', label: 'Кол-во', sortable: true, numeric: true, align: 'right' },
    {
      key: 'status',
      label: 'Статус',
      sortable: true,
      format: (row) => this.statusLabel(row.status),
    },
  ];

  protected readonly pagedRows = signal<InventoryRow[]>([]);
  protected readonly totalPages = signal(1);
  protected readonly pageNumbers = signal<number[]>([]);

  // ─── Section III: select + inline create (TZ-UI-PLUS-605) ────────────
  protected readonly categoryOptions = signal<string[]>([
    'Расходники',
    'Оргтехника',
    'Канцелярия',
  ]);
  protected readonly selectedCategory = signal<string | null>(null);

  // ─── Section IV: expandable table demo data ───────────────────────────
  protected readonly stockColumns: ColumnDef<StockRow>[] = [
    { key: 'name', label: 'Название' },
    { key: 'qty', label: 'Кол-во', align: 'right', numeric: true },
  ];
  protected readonly stockRows: StockRow[] = [
    { id: 's1', name: 'Бумага А4', qty: 240, supplier: 'ООО «Бумпром»', lastDelivery: '12.08.2026' },
    {
      id: 's2',
      name: 'Картридж HP',
      qty: 12,
      supplier: 'ТД «Оргтехника»',
      lastDelivery: '03.08.2026',
    },
    { id: 's3', name: 'Маркер', qty: 5, supplier: 'КанцОпт', lastDelivery: '20.07.2026' },
  ];
  private readonly expandedStockId = signal<string | null>(null);
  /** Stable bound reference for [expandedRowWhen] — one row expanded at a time. */
  protected readonly isStockRowExpanded = (row: StockRow): boolean =>
    row.id === this.expandedStockId();

  // ─── Section V: tree table demo data ──────────────────────────────────
  protected readonly treeColumns: ColumnDef<CategoryNode>[] = [
    { key: 'name', label: 'Категория' },
    { key: 'qty', label: 'Кол-во', align: 'right', numeric: true },
  ];
  protected readonly treeRows: CategoryNode[] = [
    { _id: 'cat-1', name: 'Офисная бумага', qty: 12 },
    { _id: 'cat-2', name: 'Картриджи', qty: 8 },
  ];
  private readonly treeChildren = new Map<string, CategoryNode[]>([
    [
      'cat-1',
      [
        { _id: 'cat-1-1', name: 'А4', qty: 6 },
        { _id: 'cat-1-2', name: 'А3', qty: 6 },
      ],
    ],
    [
      'cat-2',
      [
        { _id: 'cat-2-1', name: 'HP', qty: 5 },
        { _id: 'cat-2-2', name: 'Canon', qty: 3 },
      ],
    ],
  ]);
  /** Stable bound reference for [childRows]. */
  protected readonly treeChildRowsOf = (row: CategoryNode): CategoryNode[] =>
    this.treeChildren.get(row._id) ?? [];

  constructor() {
    this.recompute();
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.toast.error('Форма невалидна — исправьте ошибки');
      this.form.markAllAsTouched();
      return;
    }
    this.toast.success('Форма валидна · отправлено');
  }

  protected onInventoryEdit(row: InventoryRow): void {
    this.toast.show(`Редактировать «${row.name}» (демо, без реального сохранения)`);
  }

  protected onInventoryDelete(row: InventoryRow): void {
    this.toast.warning(`Удалить «${row.name}»? (демо, без подтверждения)`);
  }

  protected onAddCategory(): void {
    const name = `Новая категория ${this.categoryOptions().length + 1}`;
    this.categoryOptions.update((opts) => [...opts, name]);
    this.selectedCategory.set(name);
    this.toast.success(`Категория «${name}» добавлена (демо)`);
  }

  protected toggleStockRow(row: StockRow): void {
    this.expandedStockId.update((id) => (id === row.id ? null : row.id));
  }

  protected setSort(key: 'name' | 'qty' | 'status'): void {
    if (this.sortKey() !== key) {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    } else if (this.sortDir() === 'asc') {
      this.sortDir.set('desc');
    } else {
      this.sortKey.set(null);
      this.sortDir.set('asc');
    }
    this.page.set(1);
    this.recompute();
  }

  protected onPageChange(page: number): void {
    this.page.set(page);
    this.recompute();
  }

  protected onSortChange(event: { key: string; dir: 'asc' | 'desc' | null }): void {
    this.sortKey.set(event.dir === null ? null : (event.key as Exclude<SortKey, null>));
    this.sortDir.set(event.dir === 'desc' ? 'desc' : 'asc');
    this.page.set(1);
    this.recompute();
  }

  protected sortIndicator(key: 'name' | 'qty' | 'status'): string {
    if (this.sortKey() !== key) return '';
    return this.sortDir() === 'asc' ? '↑' : '↓';
  }

  protected isSortedBy(key: 'name' | 'qty' | 'status'): boolean {
    return this.sortKey() === key;
  }

  protected statusLabel(s: InventoryRow['status']): string {
    return s === 'in-stock' ? 'в наличии' : s === 'low' ? 'мало' : 'нет';
  }

  private recompute(): void {
    const all = [...this.data()];
    const k = this.sortKey();
    if (k) {
      const dir = this.sortDir() === 'asc' ? 1 : -1;
      all.sort((a, b) => {
        const av = a[k];
        const bv = b[k];
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      });
    }
    const total = Math.max(1, Math.ceil(all.length / this.pageSize));
    this.totalPages.set(total);
    if (this.page() > total) this.page.set(total);
    const start = (this.page() - 1) * this.pageSize;
    this.pagedRows.set(all.slice(start, start + this.pageSize));
    this.pageNumbers.set(Array.from({ length: total }, (_, i) => i + 1));
  }
}
