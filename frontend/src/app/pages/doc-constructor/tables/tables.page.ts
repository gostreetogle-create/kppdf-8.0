import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  PiEntityListComponent,
  type DefaultListParams,
} from '../../../shared/dsl/entity-list/pi-entity-list.component';
import { PiRowActionsComponent } from '../../../shared/ui/pi-row-actions/pi-row-actions.component';
import { type DialogRef, PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../../shared/ui/toast';
import { SwitchComponent } from '../../../shared/ui/switch/switch.component';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../../core/silent-http';
import { type ColumnDef } from '../../../shared/ui/pi-table.component';
import { toEntityService } from '../../../shared/dsl/entity/entity-service';
import {
  type TableTemplate,
  type TableTemplateListParams,
  TableTemplatesService,
} from '../../../shared/services/pi-table-templates.service';
import {
  TableTemplateFormDialogComponent,
  type TableTemplateDialogConfig,
} from './table-template-dialog.component';

/**
 * TZ-232.F.5 — Tables page migrated to `<pi-entity-list>` wrapper.
 *
 * Hybrid pattern (per TZ-232.F.3 documents + TZ-232.F.4 texts):
 *  - `toEntityService(this.service)` — adapter for canonical envelope
 *  - `[showCreate]="false"` + `<button toolbarExtras>` slot — page-level buttons
 *  - `[cellTemplates]` (signal-derived dict) — status dot + Switch column
 *  - `[rowActionsTpl]` (signal-derived) — Copy + Edit + Delete actions
 *  - `[localSort]="true"` — backend ignores `?sortBy=`
 *  - `viewChild<TemplateRef>` (NON-required) + `computed` null-guard per texts v3
 *
 * **Defensive `listRef()?.reload?.()` pattern** — under `NO_ERRORS_SCHEMA`
 * (test override), `<app-pi-entity-list>` renders as an ElementRef placeholder
 * rather than a real component instance. Optional chaining on `.reload()`
 * alone still throws "is not a function" because the ElementRef exists but
 * has no `.reload` method. Adding `?.` on `.reload` itself handles both:
 *  - `listRef()` returns undefined → `undefined?.reload?.()` → no-op
 *  - `listRef()` returns ElementRef → `elementRef.reload?.()` → no-op
 *  - `listRef()` returns wrapper → `wrapper.reload()` → real call
 *
 * Полная документация страницы: docs/pages/tables.page.md
 */
@Component({
  selector: 'app-tables-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiEntityListComponent,
    PiRowActionsComponent,
    SwitchComponent,
  ],
  template: `
    <header class="tables-head">
      <span class="eyebrow text-muted-foreground">раздел · конструктор документов</span>
      <h1 class="tables-title font-display">Таблицы</h1>
      <p class="tables-desc text-muted-foreground">
        Шаблоны таблиц — задают форму колонок, типы данных и форматирование. Используются в шаблонах
        документов и рендерятся как inline HTML.
      </p>
    </header>

    <app-pi-entity-list
      #list
      [service]="entityService"
      [cols]="cols"
      [cellTemplates]="cellTemplates()"
      [rowActionsTpl]="rowActionsTpl()"
      [showCreate]="false"
      [initialSortKey]="'name'"
      [initialSortDir]="'asc'"
      [localSort]="true"
      [searchPlaceholder]="'Поиск по названию…'"
      [emptyMessage]="emptyMessage"
      [ariaLabel]="'Каталог шаблонов таблиц'"
    >
      <button
        toolbarExtras
        type="button"
        class="pi-btn pi-btn-primary"
        (click)="openCreate()"
        data-test="create-button"
      >
        + Новая таблица
      </button>
      <button
        toolbarExtras
        type="button"
        class="pi-btn pi-btn-ghost"
        (click)="openFromRegistry()"
        data-test="registry-button"
      >
        ⇄ Из существующих данных
      </button>
    </app-pi-entity-list>

    <aside class="tables-promo hairline rounded-sm">
      <div class="tables-promo-text">
        <h3 class="font-display text-lg font-semibold">Настройте визуализацию данных</h3>
        <p class="text-sm text-muted-foreground">
          Создавайте кастомные представления таблиц для экспорта в PDF или печать. Настройте
          колонки, типы ячеек и образцы строк.
        </p>
      </div>
    </aside>

    <ng-template #isActiveCell let-row>
      <div class="tables-active-cell">
        <span
          class="tables-status-dot"
          [class.is-on]="row.isActive"
          [class.is-off]="!row.isActive"
          aria-hidden="true"
        ></span>
        <app-pi-switch
          [checked]="row.isActive"
          [id]="'switch-' + row._id"
          [ariaLabel]="(row.isActive ? 'Деактивировать ' : 'Активировать ') + row.name"
          (checkedChange)="onToggleActive(row, $event)"
          data-test="active-switch"
        />
      </div>
    </ng-template>

    <ng-template #actionsCell let-row>
      <div class="tables-row-actions">
        <button
          type="button"
          class="pi-icon-btn pi-focus-ring"
          [attr.aria-label]="'Копировать ' + row.name"
          [attr.data-test]="'copy-button-' + row._id"
          (click)="onCopy(row)"
          title="Копировать шаблон"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        <app-pi-row-actions
          [row]="row"
          [editLabel]="'Редактировать ' + row.name"
          [deleteLabel]="'Удалить ' + row.name"
          [dataTestEdit]="'edit-button-' + row._id"
          [dataTestDelete]="'delete-button-' + row._id"
          (edit)="openEdit($event)"
          (delete)="onDelete($event)"
        />
      </div>
    </ng-template>
  `,
  styles: [
    `
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
      .tables-status-dot.is-on {
        background: var(--color-accent-cool);
      }
      .tables-status-dot.is-off {
        background: var(--color-muted-foreground-strong);
      }

      .tables-row-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
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
      .tables-promo-text p {
        margin: 0;
      }
    `,
  ],
})
export class TablesPage {
  private readonly service = inject(TableTemplatesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  /** Wrapper ref — non-required, see header docblock on defensive `?.reload?.()`. */
  private readonly listRef =
    viewChild<PiEntityListComponent<TableTemplate, DefaultListParams>>('list');

  private readonly isActiveCellRef =
    viewChild<TemplateRef<{ $implicit: TableTemplate }>>('isActiveCell');
  private readonly actionsCellRef =
    viewChild<TemplateRef<{ $implicit: TableTemplate }>>('actionsCell');

  protected readonly entityService = toEntityService<
    TableTemplate,
    TableTemplateListParams
  >(this.service);

  protected readonly cellTemplates = computed<
    Record<string, TemplateRef<{ $implicit: TableTemplate }>>
  >(() => {
    const result: Record<string, TemplateRef<{ $implicit: TableTemplate }>> = {};
    const tpl = this.isActiveCellRef();
    if (tpl) {
      result['isActive'] = tpl;
    }
    return result;
  });

  protected readonly rowActionsTpl = computed<
    TemplateRef<{ $implicit: TableTemplate }> | null
  >(() => this.actionsCellRef() ?? null);

  protected readonly cols: ColumnDef<TableTemplate>[] = [
    {
      key: 'name',
      label: 'Название',
      sortable: true,
      cellClass: 'font-medium',
    },
    {
      key: 'category',
      label: 'Категория',
      sortable: true,
      cellClass: 'text-muted-foreground',
      format: (row: TableTemplate) => this.categoryLabel(row.category),
    },
    {
      key: 'columns',
      label: 'Колонок',
      sortable: false,
      align: 'center',
      cellClass: 'font-mono text-xs',
      format: (row: TableTemplate) => String(row.columns.length),
    },
    {
      key: 'sampleRows',
      label: 'Образцов',
      sortable: false,
      align: 'center',
      cellClass: 'font-mono text-xs',
      format: (row: TableTemplate) => String(row.sampleRows?.length ?? 0),
    },
    {
      key: 'sortOrder',
      label: 'Порядок',
      sortable: true,
      align: 'center',
      cellClass: 'font-mono text-xs text-muted-foreground',
      format: (row: TableTemplate) => String(row.sortOrder),
    },
    {
      key: 'isActive',
      label: 'Активен',
      sortable: false,
      align: 'center',
    },
  ];

  protected readonly emptyMessage = 'Нет шаблонов таблиц. Нажмите «Создать».';

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

  // ─── Dialog handlers ───────────────────────────────────────────────────────
  protected openCreate(): void {
    const ref = this.dialog.open(TableTemplateFormDialogComponent, {
      data: { mode: 'new' } as TableTemplateDialogConfig,
      parentDestroyRef: this.destroyRef,
    });
    this.refreshOnDialogClose(ref);
  }

  protected openFromRegistry(): void {
    const ref = this.dialog.open(TableTemplateFormDialogComponent, {
      data: { mode: 'from-registry' } as TableTemplateDialogConfig,
      parentDestroyRef: this.destroyRef,
    });
    this.refreshOnDialogClose(ref);
  }

  protected openEdit(template: TableTemplate): void {
    const ref = this.dialog.open(TableTemplateFormDialogComponent, {
      data: { template } as TableTemplateDialogConfig,
      parentDestroyRef: this.destroyRef,
    });
    this.refreshOnDialogClose(ref);
  }

  protected onCopy(template: TableTemplate): void {
    const ref = this.dialog.open(TableTemplateFormDialogComponent, {
      data: { template, mode: 'duplicate' } as TableTemplateDialogConfig,
      parentDestroyRef: this.destroyRef,
    });
    this.refreshOnDialogClose(ref);
  }

  private refreshOnDialogClose<TResult>(ref: DialogRef<TResult>): void {
    onDialogCloseOnce(ref, this.injector, () => this.listRef()?.reload?.());
  }

  // ─── Inline Switch (isActive toggle) ──────────────────────────────────────
  protected onToggleActive(template: TableTemplate, checked: boolean): void {
    this.service.update(template._id, { isActive: checked }).subscribe((res) => {
      if (res.ok) {
        this.toast.success(
          checked ? `«${template.name}» активирован` : `«${template.name}» деактивирован`,
        );
        this.listRef()?.reload?.();
      } else {
        this.toast.error(extractErrorMessage(res.error as HttpErrorResponse));
      }
    });
  }

  // ─── Delete (with confirm dialog) ─────────────────────────────────────────
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
          this.listRef()?.reload?.();
        } else {
          this.toast.error(extractErrorMessage(res.error as HttpErrorResponse));
        }
      });
    });
  }
}
