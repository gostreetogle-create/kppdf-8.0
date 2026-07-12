import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  computed,
  inject,
  signal,
} from '@angular/core';
import { httpResource, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PiPageHeaderComponent } from '../../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../../shared/page/pi-toolbar.component';
import { PiEmptyStateComponent } from '../../../shared/ui/pi-empty-state/pi-empty-state.component';
import { PiRowActionsComponent } from '../../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PiDialogService, type DialogRef } from '../../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../../shared/ui/toast';
import { SwitchComponent } from '../../../shared/ui/switch/switch.component';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../../core/silent-http';
import { API_BASE_URL } from '../../../core/api.tokens';
import {
  TableTemplate,
  TableTemplateListResponse,
  TableTemplatesService,
} from '../../../shared/services/pi-table-templates.service';
import { TableTemplateFormDialogComponent } from './table-template-dialog.component';

type SortKey = 'name' | 'category' | 'sortOrder' | null;
type SortDir = 'asc' | 'desc';

/**
 * TZ-86 Phase C.3 — TablesPage.
 *
 * /doc-constructor/tables — sub-page для CRUD table-template (column presets
 * используемых в Document Constructor canvas (Phase D — «Таблицы» tab)).
 *
 * Каноничный Paper & Ink list-page паттерн (mirror work-types/texts).
 * Backend возвращает { items, total } envelope через Phase B.2 service.
 */
@Component({
  selector: 'app-tables-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiEmptyStateComponent,
    PiRowActionsComponent,
    ButtonComponent,
    SwitchComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · конструктор документов"
      title="Таблицы"
      description="Шаблоны таблиц (column presets) — задают форму колонок, типы данных и форматирование. Используются в шаблонах документов и рендерятся как inline HTML в build()."
    />

    <app-pi-toolbar>
      <input
        type="search"
        name="tables-search"
        [value]="searchQuery()"
        (input)="onSearchInput($event)"
        placeholder="Поиск по названию…"
        aria-label="Поиск шаблонов таблиц"
        class="pi-input w-72"
      />
      <app-pi-button variant="default" (click)="openCreate()" data-test="create-button">
        + Создать
      </app-pi-button>
      <span hint>{{ data().length }} {{ totalLabel(data().length) }}</span>
    </app-pi-toolbar>

    <app-pi-section title="Каталог" eyebrow="II" hint="клик по заголовку — сортировка">
      @if (error()) {
        <div role="alert" class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive">
          {{ error() }}
        </div>
      }
      <div class="hairline rounded-sm overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="hairline-b">
            <tr>
              <th class="pi-cell eyebrow cursor-pointer select-none text-left" (click)="setSort('name')">
                Название <span class="ml-1 opacity-40">{{ sortIcon('name') }}</span>
              </th>
              <th class="pi-cell eyebrow cursor-pointer select-none text-left" (click)="setSort('category')">
                Категория <span class="ml-1 opacity-40">{{ sortIcon('category') }}</span>
              </th>
              <th class="pi-cell-numeric eyebrow w-32 text-right">Колонок</th>
              <th class="pi-cell-numeric eyebrow w-32 text-right">Образцов</th>
              <th class="pi-cell eyebrow cursor-pointer select-none text-left w-28" (click)="setSort('sortOrder')">
                Порядок <span class="ml-1 opacity-40">{{ sortIcon('sortOrder') }}</span>
              </th>
              <th class="pi-cell eyebrow w-20 text-center">Активен</th>
              <th class="pi-cell eyebrow w-40 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            @for (row of sortedRows(); track row._id) {
              <tr
                class="pi-table-row pi-table-row-odd"
                [class.opacity-50]="!row.isActive"
                [attr.data-test]="'table-row-' + row._id"
              >
                <td class="pi-cell align-top font-medium">{{ row.name }}</td>
                <td class="pi-cell align-top text-muted-foreground empty-cell">{{ categoryLabel(row.category) }}</td>
                <td class="pi-cell-numeric align-top font-mono text-xs empty-cell">{{ row.columns.length }}</td>
                <td class="pi-cell-numeric align-top font-mono text-xs empty-cell">{{ row.sampleRows?.length ?? 0 }}</td>
                <td class="pi-cell align-top text-muted-foreground font-mono text-xs empty-cell">{{ row.sortOrder }}</td>
                <td class="pi-cell align-top text-center">
                  <app-pi-switch
                    [checked]="row.isActive"
                    [id]="'switch-' + row._id"
                    [ariaLabel]="(row.isActive ? 'Деактивировать ' : 'Активировать ') + row.name"
                    (checkedChange)="onToggleActive(row, $event)"
                    data-test="active-switch"
                  />
                </td>
                <td class="pi-cell align-top">
                  <app-pi-row-actions
                    [row]="row"
                    [editLabel]="'Редактировать ' + row.name"
                    [deleteLabel]="'Удалить ' + row.name"
                    [dataTestEdit]="'edit-button-' + row._id"
                    [dataTestDelete]="'delete-button-' + row._id"
                    (edit)="openEdit($event)"
                    (delete)="onDelete($event)"
                  />
                </td>
              </tr>
            }
            @if (sortedRows().length === 0 && !loading()) {
              <app-pi-empty-state
                [colspan]="7"
                [message]="searchQuery() ? 'Ничего не найдено.' : 'Нет шаблонов таблиц. Нажмите «Создать», чтобы добавить первый.'"
                state="empty"
              />
            }
            @if (loading() && sortedRows().length === 0) {
              <app-pi-empty-state [colspan]="7" message="Загрузка…" state="loading" />
            }
          </tbody>
        </table>
      </div>
    </app-pi-section>
  `,
})
export class TablesPage {
  private readonly service = inject(TableTemplatesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly baseUrl = inject(API_BASE_URL);

  private readonly listRes = httpResource<TableTemplateListResponse>(() => ({
    url: `${this.baseUrl}/table-templates`,
  }));

  protected readonly data = computed<TableTemplate[]>(
    () => this.listRes.value()?.items ?? [],
  );
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly searchQuery = signal<string>('');
  protected readonly sortKey = signal<SortKey>('name');
  protected readonly sortDir = signal<SortDir>('asc');

  private readonly visible = computed<TableTemplate[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.data();
    return this.data().filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q),
    );
  });

  protected readonly sortedRows = computed<TableTemplate[]>(() => {
    const rows = this.visible().slice();
    const k = this.sortKey();
    if (!k) return rows;
    const sign = this.sortDir() === 'asc' ? 1 : -1;
    return rows.sort((a, b) => {
      const av = a[k];
      const bv = b[k];
      if (av == null && bv == null) return 0;
      if (av == null) return -1 * sign;
      if (bv == null) return 1 * sign;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sign;
      return String(av).localeCompare(String(bv), 'ru') * sign;
    });
  });

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  protected setSort(key: Exclude<SortKey, null>): void {
    if (this.sortKey() !== key) {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    } else if (this.sortDir() === 'asc') {
      this.sortDir.set('desc');
    } else {
      this.sortKey.set(null);
      this.sortDir.set('asc');
    }
  }

  protected sortIcon(key: Exclude<SortKey, null>): string {
    if (this.sortKey() !== key) return '↕';
    return this.sortDir() === 'asc' ? '↑' : '↓';
  }

  protected categoryLabel(c: TableTemplate['category'] | undefined): string {
    if (!c) return '—';
    return {
      'product-spec': 'Спецификация',
      'cost-calc': 'Калькуляция',
      'order-summary': 'Сводка заказа',
      'price-list': 'Прайс-лист',
      custom: 'Прочее',
    }[c];
  }

  protected totalLabel(n: number): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'шаблон';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'шаблона';
    return 'шаблонов';
  }

  protected openCreate(): void {
    const ref = this.dialog.open(TableTemplateFormDialogComponent, { data: null, width: 'lg' });
    this.refreshOnDialogClose(ref);
  }

  protected openEdit(template: TableTemplate): void {
    const ref = this.dialog.open(TableTemplateFormDialogComponent, { data: template, width: 'lg' });
    this.refreshOnDialogClose(ref);
  }

  private refreshOnDialogClose<TResult>(ref: DialogRef<TResult>): void {
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }

  protected onToggleActive(template: TableTemplate, checked: boolean): void {
    this.service.update(template._id, { isActive: checked }).subscribe((res) => {
      if (res.ok) {
        this.toast.success(
          checked
            ? `«${template.name}» активирован`
            : `«${template.name}» деактивирован`,
        );
        this.listRes.reload();
      } else {
        this.toast.error(extractErrorMessage(res.error as HttpErrorResponse));
      }
    });
  }

  protected onDelete(template: TableTemplate): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить шаблон таблицы?',
        description: `Удалить «${template.name}»? Если он используется в шаблонах документов — операция может быть отклонена сервером.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.service.remove(template._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Шаблон таблицы удалён');
          this.listRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error as HttpErrorResponse));
        }
      });
    });
  }
}
