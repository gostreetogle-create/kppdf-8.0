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
  OnInit,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { LucideAngularModule, RefreshCw } from 'lucide-angular';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { SwitchComponent } from '../../shared/ui/switch/switch.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { createClientSearchState } from '../../shared/util/search';
import { pluralize } from '../../shared/util/format';
import { ColumnDef, SortDirection, TableComponent } from '../../shared/ui/pi-table.component';
import { WorkType, WorkTypesService } from '../../shared/services/pi-work-types.service';
import { WorkTypeFormDialogComponent } from './work-type-form-dialog.component';

type SortKey = 'name' | 'section' | 'department' | 'hourlyRate' | null;

const PAGE_SIZE = 20;

function compareValues(av: unknown, bv: unknown, sign: 1 | -1): number {
  if (av == null && bv == null) return 0;
  if (av == null) return -1 * sign;
  if (bv == null) return 1 * sign;
  if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sign;
  return String(av).localeCompare(String(bv), 'ru') * sign;
}

function accessorFor(key: Exclude<SortKey, null>): (row: WorkType) => unknown {
  switch (key) {
    case 'name':
      return (r) => r.name;
    case 'section':
      return (r) => r.section;
    case 'department':
      return (r) => r.department;
    case 'hourlyRate':
      return (r) => r.hourlyRate;
    default:
      return (r) => r.name;
  }
}

/**
 * TZ-104.3 batch-2-B-envelope — WorkTypesPage migrated to <app-pi-table>,
 * with TZ-104.4.2 typed TemplateRef propagation.
 *
 * Pattern B-envelope: backend returns flat WorkType[] (no pagination envelope).
 * Client-side filter + sort + paginate. `[localSort]="false"` — page owns sort.
 *
 * Cell template: 'isActive' column uses SwitchComponent for inline toggle.
 */
@Component({
  selector: 'app-work-types-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiRowActionsComponent,
    ButtonComponent,
    SwitchComponent,
    TableComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · справочники"
      title="Виды работ"
      description="Справочник видов работ с нормативами часов, ставкой и привязкой к рабочему центру. Используется в составе модулей продукции."
    />

    <app-pi-toolbar>
      <input
        id="work-types-search"
        type="search"
        name="work-types-search"
        [value]="searchQuery()"
        (input)="onSearchInput($event)"
        placeholder="Поиск по названию…"
        aria-label="Поиск видов работ"
        data-test="search-input"
        class="pi-input w-64"
      />
      <app-pi-button variant="default" (click)="openCreate()" data-test="create-button">
        + Создать
      </app-pi-button>
      <app-pi-button variant="ghost" size="sm" (click)="reload()" data-test="reload-button">
        <lucide-icon [img]="RefreshIcon" [size]="14"></lucide-icon> Обновить
      </app-pi-button>
      <span hint>{{ total() }} {{ totalLabel(total()) }}</span>
    </app-pi-toolbar>

    <app-pi-section
      title="Каталог"
      hint="сортировка · клик по заголовку · деактивированные — приглушены"
      eyebrow="I"
    >
      @if (error()) {
        <div
          role="alert"
          class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          {{ error() }}
        </div>
      }

      <div class="overflow-x-auto hairline rounded-sm">
        <app-pi-table
          [data]="paginatedRows()"
          [columns]="cols"
          [loading]="loading()"
          [total]="total()"
          [page]="page()"
          [pageSize]="pageSize"
          [emptyMessage]="emptyMessage()"
          [ariaLabel]="'Список видов работ'"
          [cellTemplates]="cellTemplates"
          [rowActions]="rowActionsTplBinding"
          [localSort]="false"
          [initialSortKey]="'name'"
          [initialSortDir]="'asc'"
          (pageChange)="onPageChange($event)"
          (sortChange)="onSortChange($event)"
        >
          <ng-template #rowActionsTpl let-row>
            <app-pi-row-actions
              [row]="row"
              [editLabel]="'Редактировать ' + row.name"
              [deleteLabel]="'Удалить ' + row.name"
              [dataTestEdit]="'edit-button-' + row._id"
              [dataTestDelete]="'delete-button-' + row._id"
              (edit)="openEdit($event)"
              (delete)="onDelete($event)"
            />
          </ng-template>

          <ng-template #isActiveTpl let-row>
            <app-pi-switch
              [checked]="row.isActive"
              [id]="'switch-' + row._id"
              [ariaLabel]="(row.isActive ? 'Деактивировать ' : 'Активировать ') + row.name"
              (checkedChange)="onToggleActive(row, $event)"
              data-test="active-switch"
            />
          </ng-template>
        </app-pi-table>
      </div>
    </app-pi-section>
  `,
})
export class WorkTypesPage implements OnInit {
  constructor() {
    this.destroyRef.onDestroy(() => this.search.destroy());
  }
  private readonly service = inject(WorkTypesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly baseUrl = inject(API_BASE_URL);

  protected readonly RefreshIcon = RefreshCw;
  protected readonly pageSize = PAGE_SIZE;

  private readonly sortKeySig = signal<SortKey>('name');
  private readonly sortDirSig = signal<'asc' | 'desc' | null>('asc');
  private readonly pageSig = signal<number>(1);
  protected readonly page = this.pageSig.asReadonly();

  private readonly search = createClientSearchState(
    () => this.data(),
    (w: WorkType, q: string) =>
      w.name.toLowerCase().includes(q) ||
      (w.section ?? '').toLowerCase().includes(q) ||
      (w.department ?? '').toLowerCase().includes(q),
  );
  protected readonly searchQuery = this.search.searchQuery;

  protected readonly listRes = httpResource<WorkType[]>(() => ({
    url: `${this.baseUrl}/work-types`,
  }));

  protected readonly data = computed<WorkType[]>(() => this.listRes.value() ?? []);
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as
      import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly filteredRows = this.search.filtered;

  protected readonly sortedRows = computed<WorkType[]>(() => {
    const rows = this.filteredRows();
    const key = this.sortKeySig();
    if (!key) return rows;
    const sign = this.sortDirSig() === 'asc' ? 1 : -1;
    const accessor = accessorFor(key as Exclude<SortKey, null>);
    return rows.slice().sort((a, b) => compareValues(accessor(a), accessor(b), sign));
  });

  protected readonly total = computed<number>(() => this.sortedRows().length);

  protected readonly paginatedRows = computed<WorkType[]>(() => {
    const all = this.sortedRows();
    const start = (this.pageSig() - 1) * PAGE_SIZE;
    return all.slice(start, start + PAGE_SIZE);
  });

  protected readonly emptyMessage = computed(() =>
    this.searchQuery()
      ? 'Ничего не найдено.'
      : 'Нет видов работ. Нажмите «Создать», чтобы добавить первый.',
  );

  protected readonly cols: ColumnDef<WorkType>[] = [
    { key: 'name', label: 'Название', sortable: true, sticky: 'left' },
    { key: 'section', label: 'Секция', sortable: true, cellClass: 'empty-cell' },
    { key: 'department', label: 'Отдел', sortable: true, cellClass: 'empty-cell' },
    {
      key: 'hourlyRate',
      label: 'Час/₽',
      sortable: true,
      align: 'right',
      cellClass: 'empty-cell font-mono text-xs',
    },
    { key: 'isActive', label: 'Активен', cellClass: 'text-center' },
  ];

  @ViewChild('rowActionsTpl', { static: true })
  private readonly rowActionsTplRef!: TemplateRef<{ $implicit: WorkType }>;

  @ViewChild('isActiveTpl', { static: true })
  private readonly isActiveTplRef!: TemplateRef<{ $implicit: WorkType }>;

  protected cellTemplates: Record<string, TemplateRef<{ $implicit: WorkType }>> = {};
  protected rowActionsTplBinding: TemplateRef<{ $implicit: WorkType }> | null = null;

  ngOnInit(): void {
    this.cellTemplates = { isActive: this.isActiveTplRef };
    this.rowActionsTplBinding = this.rowActionsTplRef;
  }

  protected onSearchInput(event: Event): void {
    this.search.onSearchInput(event);
    this.pageSig.set(1);
  }

  protected onPageChange(p: number): void {
    this.pageSig.set(p);
  }

  protected onSortChange(event: { key: string; dir: SortDirection }): void {
    const dir = event.dir;
    this.sortKeySig.set(dir === null ? null : (event.key as Exclude<SortKey, null>));
    this.sortDirSig.set(dir === null ? 'asc' : dir);
    this.pageSig.set(1);
  }

  protected totalLabel(n: number): string {
    return pluralize(n, ['вид', 'вида', 'видов']);
  }

  protected openCreate(): void {
    const ref = this.dialog.open(WorkTypeFormDialogComponent, {
      data: null,
      width: 'md',
      parentDestroyRef: this.destroyRef,
    });
    this.refreshOnDialogClose(ref);
  }

  protected openEdit(wt: WorkType): void {
    const ref = this.dialog.open(WorkTypeFormDialogComponent, {
      data: wt,
      width: 'md',
      parentDestroyRef: this.destroyRef,
    });
    this.refreshOnDialogClose(ref);
  }

  private refreshOnDialogClose<TResult>(ref: DialogRef<TResult>): void {
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }

  protected onToggleActive(wt: WorkType, checked: boolean): void {
    this.service.update(wt._id, { isActive: checked }).subscribe((res) => {
      if (res.ok) {
        this.toast.success(checked ? `«${wt.name}» активирован` : `«${wt.name}» деактивирован`);
        this.listRes.reload();
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected onDelete(wt: WorkType): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Удалить вид работ?',
        description: `Удалить «${wt.name}»? Если он используется в модулях продукции — операция может быть отклонена сервером.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.service.remove(wt._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Вид работ удалён');
          this.listRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  protected reload(): void {
    this.listRes.reload();
  }
}
