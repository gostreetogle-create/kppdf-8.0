import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { createSearchState } from '../../shared/util/search';
import { pluralize } from '../../shared/util/format';
import { ColumnDef, SortDirection, TableComponent } from '../../shared/ui/pi-table.component';
import {
  Organization,
  OrganizationsService,
  ORG_TYPE_LABELS,
  type OrgType,
  type OrganizationsListResponse,
} from '../../shared/services/organizations.service';
import { OrganizationFormDialogComponent } from './organization-form-dialog.component';

type SortKey = 'name' | 'inn' | 'shortName' | null;

const PAGE_SIZE = 50;

/**
 * TZ-104.3 batch-2-A-mixed — OrganizationsPage migrated to <app-pi-table>,
 * option β (canonical).
 *
 * Pattern A-mixed: backend honors page/limit/search but NOT sortBy.
 * `[localSort]="true"` + `[initialSortKey/Dir]` seeded to name/asc.
 * pi-table re-sorts the current 50-row server page slice on click.
 * MANDATORY UX disclosure per recipe §4A.4 (sort only affects visible page).
 */
@Component({
  selector: 'app-organizations-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiRowActionsComponent,
    ButtonComponent,
    TableComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · партнёры"
      title="Организации"
      description="Юр. лица и ИП — покупатели, поставщики, подрядчики. Один контрагент может совмещать несколько ролей."
    />

    <app-pi-toolbar>
      <input
        id="organizations-search"
        type="search"
        name="organizations-search"
        [value]="searchQuery()"
        (input)="onSearchInput($event)"
        placeholder="Поиск по названию или ИНН…"
        aria-label="Поиск организаций"
        data-test="search-input"
        class="pi-input w-72"
      />
      <app-pi-button variant="default" (click)="openCreate()" data-test="create-button">
        + Создать
      </app-pi-button>
      <span hint>{{ total() }} {{ totalLabel(total()) }}</span>
    </app-pi-toolbar>

    <app-pi-section title="Каталог" hint="сортировка · клик по заголовку" eyebrow="I">
      @if (error()) {
        <div
          role="alert"
          class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          {{ error() }}
        </div>
      }

      <p data-test="sort-disclosure" class="text-[10px] text-muted-foreground mb-2">
        Сортировка применяется только к текущей странице ({{ PAGE_SIZE }} записей).
      </p>

      <div class="overflow-x-auto hairline rounded-sm">
        <app-pi-table
          [data]="data()"
          [columns]="cols"
          [loading]="loading()"
          [total]="total()"
          [page]="page()"
          [pageSize]="PAGE_SIZE"
          [emptyMessage]="emptyMessage()"
          [ariaLabel]="'Список организаций'"
          [cellTemplates]="cellTemplates"
          [rowActions]="rowActionsTplBinding"
          [localSort]="true"
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

          <ng-template #typeTpl let-row>
            <div class="flex flex-wrap gap-1">
              @for (t of (row.type || []); track t) {
                <span class="eyebrow text-[10px] px-2 py-1 hairline rounded-sm">
                  {{ orgTypeLabel(t) }}
                </span>
              }
            </div>
          </ng-template>
        </app-pi-table>
      </div>
    </app-pi-section>
  `,
})
export class OrganizationsPage implements OnInit {
  private readonly service = inject(OrganizationsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly baseUrl = inject(API_BASE_URL);

  protected readonly PAGE_SIZE = PAGE_SIZE;
  protected readonly page = signal<number>(1);

  private readonly sortKeySig = signal<SortKey>('name');
  private readonly sortDirSig = signal<'asc' | 'desc' | null>('asc');

  private readonly search = createSearchState(300);
  protected readonly searchQuery = this.search.searchQuery;

  protected readonly listRes = httpResource<OrganizationsListResponse>(() => ({
    url: `${this.baseUrl}/organizations`,
    params: {
      page: this.page(),
      limit: PAGE_SIZE,
      ...(this.search.debouncedSearch() ? { search: this.search.debouncedSearch() } : {}),
    },
  }));

  protected readonly data = computed<Organization[]>(() => this.listRes.value()?.items ?? []);
  protected readonly total = computed<number>(() => this.listRes.value()?.total ?? this.data().length);
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly emptyMessage = computed(() =>
    this.searchQuery()
      ? 'Ничего не найдено.'
      : 'Нет организаций. Нажмите «Создать», чтобы добавить первую.',
  );

  protected readonly cols: ColumnDef<Organization>[] = [
    { key: 'name', label: 'Название', sortable: true, sticky: 'left' },
    { key: 'shortName', label: 'Краткое', sortable: true, cellClass: 'empty-cell' },
    { key: 'inn', label: 'ИНН', sortable: true, cellClass: 'font-mono text-xs whitespace-nowrap' },
    { key: 'type', label: 'Типы' },
  ];

  @ViewChild('rowActionsTpl', { static: true })
  private readonly rowActionsTplRef!: TemplateRef<{ $implicit: Organization }>;

  @ViewChild('typeTpl', { static: true })
  private readonly typeTplRef!: TemplateRef<{ $implicit: Organization }>;

  protected cellTemplates: Record<string, TemplateRef<{ $implicit: Organization }>> = {};
  protected rowActionsTplBinding: TemplateRef<{ $implicit: Organization }> | null = null;

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.search.destroy());
    this.cellTemplates = { type: this.typeTplRef };
    this.rowActionsTplBinding = this.rowActionsTplRef;
  }

  protected orgTypeLabel(t: OrgType): string {
    return ORG_TYPE_LABELS[t] ?? t;
  }

  protected onSearchInput(event: Event): void {
    this.search.onSearchInput(event);
    this.page.set(1);
  }

  protected onPageChange(p: number): void {
    this.page.set(p);
  }

  protected onSortChange(event: { key: string; dir: SortDirection }): void {
    this.sortKeySig.set(event.dir === null ? null : (event.key as Exclude<SortKey, null>));
    this.sortDirSig.set(event.dir === null ? 'asc' : event.dir);
  }

  protected totalLabel(n: number): string {
    return pluralize(n, ['организация', 'организации', 'организаций']);
  }

  protected openCreate(): void {
    const ref = this.dialog.open(OrganizationFormDialogComponent, {
      data: null,
      width: 'lg',
      parentDestroyRef: this.destroyRef,
    });
    this.refreshOnDialogClose(ref);
  }

  protected openEdit(org: Organization): void {
    const ref = this.dialog.open(OrganizationFormDialogComponent, {
      data: org,
      width: 'lg',
      parentDestroyRef: this.destroyRef,
    });
    this.refreshOnDialogClose(ref);
  }

  protected onDelete(row: Organization): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить организацию?',
        description: `Удалить «${row.name}»? Это действие нельзя отменить.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.service.remove(row._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Организация удалена');
          this.listRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  private refreshOnDialogClose<TResult>(ref: DialogRef<TResult>): void {
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }
}
