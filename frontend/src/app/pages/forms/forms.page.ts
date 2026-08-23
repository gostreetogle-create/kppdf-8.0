import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { SelectComponent } from '../../shared/ui/select/select.component';
import { SelectOptionComponent } from '../../shared/ui/select/select-option.component';
import { CheckboxComponent } from '../../shared/ui/checkbox/checkbox.component';
import { PiToastService } from '../../shared/ui/toast';
import { ColumnDef, TableComponent } from '../../shared/ui/pi-table.component';

interface InventoryRow {
  id: string;
  name: string;
  qty: number;
  status: 'in-stock' | 'low' | 'out';
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
    <app-pi-section title="Data table" hint="sortable · paginated · 10 rows" eyebrow="II">
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
        />
      </div>
    </app-pi-section>

    <!-- ───── Section III. Form variants ───── -->
    <app-pi-section title="Form variants" hint="inline · stacked · architectural" eyebrow="III">
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
