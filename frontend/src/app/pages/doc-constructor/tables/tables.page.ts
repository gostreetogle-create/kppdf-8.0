import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse, httpResource } from '@angular/common/http';
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
  TableTemplatesService,
} from '../../../shared/services/pi-table-templates.service';
import { TableTemplateFormDialogComponent } from './table-template-dialog.component';
import { pluralRu } from '../../../shared/util/russian-plural';

const RU_TEMPLATES = ['шаблон', 'шаблона', 'шаблонов'] as const;

type SortKey = 'name' | 'category' | 'sortOrder' | null;
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-tables-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiRowActionsComponent,
    ButtonComponent,
    SwitchComponent,
  ],
  template: `
    <header class="tables-head">
      <span class="eyebrow text-muted-foreground">раздел · конструктор документов</span>
      <h1 class="tables-title font-display">Таблицы</h1>
      <p class="tables-desc text-muted-foreground">
        Шаблоны таблиц — задают форму колонок, типы данных и форматирование.
        Используются в шаблонах документов и рендерятся как inline HTML.
      </p>
    </header>

    <div class="tables-toolbar hairline-b">
      <div class="tables-toolbar-left">
        <div class="tables-search-wrap">
          <span class="tables-search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            class="tables-search-input"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
            placeholder="Поиск по названию…"
            aria-label="Поиск шаблонов таблиц"
          />
        </div>
        <span class="tables-count-badge eyebrow">{{ data().length }} {{ totalLabel(data().length) }}</span>
      </div>
      <app-pi-button variant="default" (click)="openCreate()" data-test="create-button">
        + Создать
      </app-pi-button>
    </div>

    @if (error()) {
      <div role="alert" class="tables-error">{{ error() }}</div>
    }

    <section class="tables-catalog" aria-label="Каталог шаблонов таблиц">
      <div class="tables-catalog-head">
        <h2 class="eyebrow m-0">II · Каталог</h2>
        <span class="text-xs text-muted-foreground italic">клик по заголовку — сортировка</span>
      </div>

      @if (loading() && sortedRows().length === 0) {
        <p class="tables-empty text-muted-foreground">Загрузка…</p>
      } @else if (sortedRows().length === 0) {
        <p class="tables-empty text-muted-foreground">
          {{ searchQuery() ? 'Ничего не найдено.' : 'Нет шаблонов таблиц. Нажмите «Создать».' }}
        </p>
      } @else {
        <div class="tables-table-wrap">
          <table class="tables-table">
            <thead>
              <tr>
                <th class="eyebrow cursor-pointer" (click)="setSort('name')">
                  Название <span class="opacity-40">{{ sortIcon('name') }}</span>
                </th>
                <th class="eyebrow cursor-pointer" (click)="setSort('category')">
                  Категория <span class="opacity-40">{{ sortIcon('category') }}</span>
                </th>
                <th class="eyebrow text-center">Колонок</th>
                <th class="eyebrow text-center">Образцов</th>
                <th class="eyebrow text-center cursor-pointer" (click)="setSort('sortOrder')">
                  Порядок <span class="opacity-40">{{ sortIcon('sortOrder') }}</span>
                </th>
                <th class="eyebrow text-center">Активен</th>
                <th class="eyebrow text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              @for (row of sortedRows(); track row._id) {
                <tr
                  class="tables-row group"
                  [class.opacity-50]="!row.isActive"
                  [attr.data-test]="'table-row-' + row._id"
                >
                  <td class="font-medium">{{ row.name }}</td>
                  <td class="text-muted-foreground">{{ categoryLabel(row.category) }}</td>
                  <td class="text-center font-mono text-xs">{{ row.columns.length }}</td>
                  <td class="text-center font-mono text-xs">{{ row.sampleRows?.length ?? 0 }}</td>
                  <td class="text-center font-mono text-xs text-muted-foreground">{{ row.sortOrder }}</td>
                  <td>
                    <div class="tables-active-cell">
                      <span
                        class="tables-status-dot"
                        [class.is-on]="row.isActive"
                        [class.is-off]="!row.isActive"
                      ></span>
                      <app-pi-switch
                        [checked]="row.isActive"
                        [id]="'switch-' + row._id"
                        [ariaLabel]="(row.isActive ? 'Деактивировать ' : 'Активировать ') + row.name"
                        (checkedChange)="onToggleActive(row, $event)"
                        data-test="active-switch"
                      />
                    </div>
                  </td>
                  <td class="text-right">
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
            </tbody>
          </table>
        </div>
      }
    </section>

    <aside class="tables-promo hairline rounded-sm">
      <div class="tables-promo-text">
        <h3 class="font-display text-lg font-semibold">Настройте визуализацию данных</h3>
        <p class="text-sm text-muted-foreground">
          Создавайте кастомные представления таблиц для экспорта в PDF или печать.
          Настройте колонки, типы ячеек и образцы строк.
        </p>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
      max-width: 1200px;
    }

    .tables-head {
      margin-bottom: 32px;
    }
    .tables-title {
      margin: 8px 0 0;
      font-size: 32px;
      font-weight: 600;
      line-height: 1.2;
      color: var(--color-ink);
    }
    .tables-desc {
      margin: 8px 0 0;
      max-width: 48ch;
      font-size: 14px;
      line-height: 1.5;
    }

    .tables-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding-bottom: 16px;
      margin-bottom: 16px;
    }
    .tables-toolbar-left {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
      flex: 1;
      min-width: 0;
    }
    .tables-search-wrap { position: relative; width: 100%; max-width: 288px; }
    .tables-search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-muted-foreground-strong);
      pointer-events: none;
    }
    .tables-search-input {
      width: 100%;
      padding: 8px 12px 8px 36px;
      font-size: 14px;
      border: none;
      border-radius: 6px;
      background: var(--color-paper-2);
      color: var(--color-ink);
    }
    .tables-search-input:focus {
      outline: none;
      box-shadow: 0 0 0 2px var(--color-ink);
    }
    .tables-count-badge {
      padding: 4px 8px;
      background: var(--color-paper-2);
      border: 1px solid var(--color-rule);
      border-radius: 4px;
      white-space: nowrap;
    }

    .tables-error {
      margin-bottom: 16px;
      padding: 12px 16px;
      font-size: 14px;
      color: var(--color-destructive);
      border: 1px solid var(--color-destructive);
      border-radius: 4px;
    }

    .tables-catalog-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 8px;
    }
    .tables-table-wrap {
      border-top: 2px solid var(--color-ink);
      border-bottom: 2px solid var(--color-ink);
      overflow-x: auto;
    }
    .tables-table {
      width: 100%;
      min-width: 800px;
      border-collapse: collapse;
      text-align: left;
      font-size: 14px;
    }
    .tables-table thead {
      background: var(--color-paper-2);
      border-bottom: 1px solid var(--color-rule);
    }
    .tables-table th {
      padding: 12px 16px;
      color: var(--color-muted-foreground-strong);
    }
    .tables-table td {
      padding: 12px 16px;
      vertical-align: middle;
      border-bottom: 1px solid var(--color-rule);
    }
    .tables-row:hover { background: color-mix(in oklch, var(--color-paper-2) 80%, transparent); }
    .tables-row:last-child td { border-bottom: none; }

    .tables-active-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .tables-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .tables-status-dot.is-on { background: var(--color-accent-cool); }
    .tables-status-dot.is-off { background: var(--color-muted-foreground-strong); }

    .tables-empty {
      padding: 32px 16px;
      text-align: center;
      font-size: 14px;
    }

    .tables-promo {
      margin-top: 32px;
      padding: 24px;
      background: var(--color-paper);
    }
    .tables-promo-text h3 {
      margin: 0 0 8px;
      color: var(--color-ink);
    }
    .tables-promo-text p { margin: 0; }
  `],
})
export class TablesPage {
  private readonly service = inject(TableTemplatesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly baseUrl = inject(API_BASE_URL);

  private readonly listRes = httpResource<TableTemplate[]>(() => ({
    url: `${this.baseUrl}/table-templates`,
  }));

  protected readonly data = computed<TableTemplate[]>(() => this.listRes.value() ?? []);
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
    this.searchQuery.set((event.target as HTMLInputElement).value);
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
    return pluralRu(n, RU_TEMPLATES);
  }

  protected openCreate(): void {
    const ref = this.dialog.open(TableTemplateFormDialogComponent, {
      data: null,
      width: 'xl',
      parentDestroyRef: this.destroyRef,
    });
    this.refreshOnDialogClose(ref);
  }

  protected openEdit(template: TableTemplate): void {
    const ref = this.dialog.open(TableTemplateFormDialogComponent, {
      data: template,
      width: 'xl',
      parentDestroyRef: this.destroyRef,
    });
    this.refreshOnDialogClose(ref);
  }

  private refreshOnDialogClose<TResult>(ref: DialogRef<TResult>): void {
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }

  protected onToggleActive(template: TableTemplate, checked: boolean): void {
    this.service.update(template._id, { isActive: checked }).subscribe((res) => {
      if (res.ok) {
        this.toast.success(
          checked ? `«${template.name}» активирован` : `«${template.name}» деактивирован`,
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
      parentDestroyRef: this.destroyRef,
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
