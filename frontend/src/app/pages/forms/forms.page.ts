import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { SelectComponent } from '../../shared/ui/select/select.component';
import { SelectOptionComponent } from '../../shared/ui/select/select-option.component';
import { CheckboxComponent } from '../../shared/ui/checkbox/checkbox.component';
import { PiToastService } from '../../shared/ui/toast';

interface InventoryRow {
  id: string;
  name: string;
  qty: number;
  status: 'in-stock' | 'low' | 'out';
}

type SortKey = 'name' | 'qty' | 'status' | null;
type SortDir = 'asc' | 'desc';

/**
 * Forms page (/forms) — TZ-72.
 *
 * Validated reactive form + sortable paginated raw-HTML data-table
 * (TableComponent + PaginationComponent не используются — реализованы
 * inline для совместимости с Paper & Ink эстетикой) + form variants.
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
    SelectComponent,
    SelectOptionComponent,
    CheckboxComponent,
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
        <app-pi-form-field label="Имя" htmlFor="form-name" [required]="true" [error]="form.controls.name.invalid && form.controls.name.touched ? 'Минимум 2 символа' : ''">
          <input
            id="form-name"
            type="text"
            formControlName="name"
            placeholder="Иван"
            class="pi-input w-full"
            [class.border-rule]="!form.controls.name.invalid || !form.controls.name.touched"
            [class.border-destructive]="form.controls.name.invalid && form.controls.name.touched"
          />
        </app-pi-form-field>

        <app-pi-form-field label="E-mail" htmlFor="form-email" [required]="true" [error]="form.controls.email.invalid && form.controls.email.touched ? 'Невалидный e-mail' : ''">
          <input
            id="form-email"
            type="email"
            formControlName="email"
            placeholder="you@example.com"
            class="pi-input w-full"
            [class.border-rule]="!form.controls.email.invalid || !form.controls.email.touched"
            [class.border-destructive]="form.controls.email.invalid && form.controls.email.touched"
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
        <table class="w-full text-sm">
          <thead class="border-b hairline border-rule">
            <tr>
              <th
                class="pi-cell font-display font-semibold cursor-pointer group text-left"
                (click)="setSort('name')"
              >Название <span [class.text-sunrise-warm]="isSortedBy('name')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIndicator('name') }}</span></th>
              <th
                class="pi-cell-numeric font-display font-semibold cursor-pointer group"
                (click)="setSort('qty')"
              >Кол-во <span [class.text-sunrise-warm]="isSortedBy('qty')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIndicator('qty') }}</span></th>
              <th
                class="pi-cell font-display font-semibold cursor-pointer group text-left"
                (click)="setSort('status')"
              >Статус <span [class.text-sunrise-warm]="isSortedBy('status')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIndicator('status') }}</span></th>
            </tr>
          </thead>
          <tbody>
            @for (row of pagedRows(); track row.id) {
              <tr class="pi-table-row pi-table-row-odd last:border-0">
                <td class="pi-cell">{{ row.name }}</td>
                <td class="pi-cell-numeric font-mono text-xs">{{ row.qty }}</td>
                <td class="pi-cell">
                  <span class="eyebrow text-[10px]">{{ statusLabel(row.status) }}</span>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <div class="flex items-center justify-between px-4 py-form-field hairline-t">
          <span class="text-xs text-muted-foreground">
            Page {{ page() }} / {{ totalPages() }} · {{ data().length }} rows
          </span>
          <nav class="flex items-center gap-1" aria-label="Pagination">
            <app-pi-button
              size="sm"
              variant="outline"
              [disabled]="page() === 1"
              (click)="page.set(page() - 1)"
            >‹ Prev</app-pi-button>
            @for (p of pageNumbers(); track p) {
              <app-pi-button
                size="sm"
                [variant]="p === page() ? 'default' : 'outline'"
                (click)="page.set(p)"
              >{{ p }}</app-pi-button>
            }
            <app-pi-button
              size="sm"
              variant="outline"
              [disabled]="page() === totalPages()"
              (click)="page.set(page() + 1)"
            >Next ›</app-pi-button>
          </nav>
        </div>
      </div>
    </app-pi-section>

    <!-- ───── Section III. Form variants ───── -->
    <app-pi-section title="Form variants" hint="inline · stacked" eyebrow="III">
      <div class="space-y-section max-w-2xl">
        <div>
          <p class="eyebrow mb-3">Inline (label · input · button в одну строку)</p>
          <div class="flex items-end gap-form-field">
        <app-pi-form-field label="Поиск" htmlFor="form-search" class="flex-1">
          <input
            id="form-search"
            type="search"
            placeholder="Найти…"
            class="pi-input w-full"
          />
        </app-pi-form-field>
            <app-pi-button variant="default">Найти</app-pi-button>
          </div>
        </div>
        <div>
          <p class="eyebrow mb-3">Stacked (label сверху)</p>
          <div class="space-y-form-field">
            <app-pi-form-field label="Город" htmlFor="form-city">
              <input
                id="form-city"
                type="text"
                placeholder="Москва"
                class="pi-input w-full"
              />
            </app-pi-form-field>
            <app-pi-form-field label="Индекс" htmlFor="form-zip">
              <input
                id="form-zip"
                type="text"
                placeholder="101000"
                class="pi-input w-full"
              />
            </app-pi-form-field>
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
  protected readonly pageSize = 5;
  protected readonly sortKey = signal<SortKey>(null);
  protected readonly sortDir = signal<SortDir>('asc');

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
