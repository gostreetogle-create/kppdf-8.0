import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { filter, map, switchMap } from 'rxjs';
import { PiGroupWorkspaceComponent } from '../../../shared/page/pi-group-workspace.component';
import { PiSectionComponent } from '../../../shared/page/pi-section.component';
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
  TableTemplatesService,
} from '../../../shared/services/pi-table-templates.service';
import {
  TableTemplateFormDialogComponent,
  type TableTemplateDialogConfig,
} from './table-template-dialog.component';
import { pluralRu } from '../../../shared/util/russian-plural';
import { ColumnDef, TableComponent } from '../../../shared/ui/pi-table.component';
import { DOCUMENTS_SECTION_CHIPS } from '../documents/documents-group-chips';

const RU_TEMPLATES = ['шаблон', 'шаблона', 'шаблонов'] as const;

/**
 * Полная документация страницы: docs/pages/tables.page.md
 * TZ-DOC-336 — Pi chrome; promo aside removed; copy via PiRowActions.
 * TZ-DOC-335 — editId queryParam auto-open preserved.
 */

type SortKey = 'name' | 'category' | 'sortOrder' | null;
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-tables-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiGroupWorkspaceComponent,
    PiSectionComponent,
    PiEmptyStateComponent,
    PiRowActionsComponent,
    ButtonComponent,
    SwitchComponent,
    TableComponent,
  ],
  template: `
    <app-pi-group-workspace pathLabel="Документы" [chips]="chips" activeId="tables">
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        <input
          type="search"
          class="pi-input w-72"
          placeholder="Поиск по названию…"
          [value]="searchQuery()"
          (input)="onSearchInput($event)"
          aria-label="Поиск шаблонов таблиц"
        />
        <app-pi-button variant="default" (click)="openCreate()" data-test="create-button">
          + Новая таблица
        </app-pi-button>
        <app-pi-button variant="ghost" (click)="openFromRegistry()" data-test="registry-button">
          Из существующих данных
        </app-pi-button>
        <span class="text-xs text-muted-foreground"
          >{{ data().length }} {{ totalLabel(data().length) }}</span
        >
      </div>

      @if (error()) {
        <div
          role="alert"
          class="mb-4 hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          {{ error() }}
        </div>
      }

      <ng-template #activeTpl let-row>
        <app-pi-switch
          [checked]="row.isActive"
          [id]="'switch-' + row._id"
          [ariaLabel]="(row.isActive ? 'Деактивировать ' : 'Активировать ') + row.name"
          (checkedChange)="onToggleActive(row, $event)"
        />
      </ng-template>
      <ng-template #rowActionsTpl let-row>
        <app-pi-row-actions
          [row]="row"
          [copyLabel]="'Копировать ' + row.name"
          [editLabel]="'Редактировать ' + row.name"
          [deleteLabel]="'Удалить ' + row.name"
          (copy)="onCopy($event)"
          (edit)="openEdit($event)"
          (delete)="onDelete($event)"
        />
      </ng-template>

      <app-pi-section title="Каталог" eyebrow="I">
        @if (loading() && sortedRows().length === 0) {
          <app-pi-empty-state [colspan]="1" message="Загрузка…" state="loading" />
        } @else if (sortedRows().length === 0) {
          <app-pi-empty-state
            [colspan]="1"
            [message]="
              searchQuery() ? 'Ничего не найдено.' : 'Нет шаблонов таблиц. Нажмите «Новая таблица».'
            "
          />
        } @else {
          <div class="hairline rounded-sm overflow-x-auto">
            <app-pi-table
              [data]="sortedRows()"
              [columns]="columns"
              [cellTemplates]="cellTemplates()"
              [rowActions]="rowActionsTpl"
              [total]="sortedRows().length"
              [loading]="loading()"
              [localSort]="false"
              (sortChange)="onSortChange($event)"
              ariaLabel="Каталог шаблонов таблиц"
              data-test="tables-table"
            />
          </div>
        }
      </app-pi-section>
    </app-pi-group-workspace>
  `,
})
export class TablesPage {
  protected readonly chips = DOCUMENTS_SECTION_CHIPS;
  private readonly service = inject(TableTemplatesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly baseUrl = inject(API_BASE_URL);

  constructor() {
    // TZ-DOC-335: auto-open editor when navigated from builder with editId.
    this.route.queryParams
      .pipe(
        map((p) => p['editId'] as string | undefined),
        filter((id): id is string => !!id),
        switchMap((id) => this.service.findById(id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        if (res.ok) {
          this.openEdit(res.data);
          void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { editId: null },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        } else {
          this.toast.error(extractErrorMessage(res.error as HttpErrorResponse));
        }
      });
  }

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

  protected readonly columns: ColumnDef<TableTemplate>[] = [
    { key: 'name', label: 'Название', sortable: true, cellClass: 'font-medium' },
    {
      key: 'category',
      label: 'Категория',
      sortable: true,
      accessor: (row) => this.categoryLabel(row.category),
    },
    {
      key: 'columns',
      label: 'Колонок',
      accessor: (row) => row.columns.length,
      numeric: true,
      align: 'center',
    },
    {
      key: 'sampleRows',
      label: 'Образцов',
      accessor: (row) => row.sampleRows?.length ?? 0,
      numeric: true,
      align: 'center',
    },
    { key: 'sortOrder', label: 'Порядок', sortable: true, numeric: true, align: 'center' },
    { key: 'isActive', label: 'Активен', align: 'center' },
  ];
  @ViewChild('activeTpl', { static: true }) private readonly activeTpl!: TemplateRef<{
    $implicit: TableTemplate;
  }>;
  @ViewChild('rowActionsTpl', { static: true }) protected readonly rowActionsTpl!: TemplateRef<{
    $implicit: TableTemplate;
  }>;
  protected readonly cellTemplates = computed(() => ({ isActive: this.activeTpl }));

  private readonly visible = computed<TableTemplate[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.data();
    return this.data().filter(
      (t) => t.name.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q),
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

  protected onSortChange(event: { key: string; dir: 'asc' | 'desc' | null }): void {
    this.setSort(event.key as Exclude<SortKey, null>, event.dir);
  }

  protected setSort(key: Exclude<SortKey, null>, direction?: SortDir | null): void {
    if (direction !== undefined) {
      this.sortKey.set(direction === null ? null : key);
      this.sortDir.set(direction === 'desc' ? 'desc' : 'asc');
    } else if (this.sortKey() !== key) {
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
