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
import { LucideAngularModule, RefreshCw } from 'lucide-angular';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import { CLIENTS_SECTION_CHIPS } from '../clients/clients-group-chips';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { SwitchComponent } from '../../shared/ui/switch/switch.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { pluralize } from '../../shared/util/format';
import { ColumnDef, SortDirection, TableComponent } from '../../shared/ui/pi-table.component';
import {
  Person,
  PiWorkersService,
  personDisplayName,
} from '../../shared/services/pi-workers.service';
import { PeopleFormDialogComponent } from './people-form-dialog.component';

type SortKey = 'lastName' | 'position' | 'email' | null;

const PAGE_SIZE = 20;

/**
 * TZ-UX-306 — каталог «Люди» (/people) поверх Worker API.
 */
@Component({
  selector: 'app-people-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    PiGroupWorkspaceComponent,
    PiRowActionsComponent,
    ButtonComponent,
    SwitchComponent,
    TableComponent,
  ],
  template: `
    <app-pi-group-workspace [chips]="chips" activeId="people" pathLabel="Клиенты">
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        <input
          id="people-search"
          type="search"
          name="people-search"
          [value]="searchQuery()"
          (input)="onSearchInput($event)"
          placeholder="Поиск по ФИО, email, должности…"
          aria-label="Поиск людей"
          data-test="search-input"
          class="pi-input w-72"
        />
        <app-pi-button variant="default" (click)="openCreate()" data-test="create-button">
          + Создать
        </app-pi-button>
        <app-pi-button variant="ghost" size="sm" (click)="reload()" data-test="reload-button">
          <lucide-icon [img]="RefreshIcon" [size]="14"></lucide-icon> Обновить
        </app-pi-button>
        <span class="flex-1"></span>
        <span class="text-xs text-muted-foreground">{{ total() }} {{ totalLabel(total()) }}</span>
      </div>

      @if (error()) {
        <div
          role="alert"
          class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          {{ error() }}
        </div>
      }

      <app-pi-table
        [data]="paginatedRows()"
        [columns]="cols"
        [loading]="loading()"
        [total]="total()"
        [page]="page()"
        [pageSize]="pageSize"
        [emptyMessage]="emptyMessage()"
        [ariaLabel]="'Список людей'"
        [cellTemplates]="cellTemplates"
        [rowActions]="rowActionsTplBinding"
        [localSort]="false"
        [initialSortKey]="'lastName'"
        [initialSortDir]="'asc'"
        (pageChange)="onPageChange($event)"
        (sortChange)="onSortChange($event)"
      >
        <ng-template #rowActionsTpl let-row>
          <app-pi-row-actions
            [row]="row"
            [editLabel]="'Редактировать ' + displayName(row)"
            [deleteLabel]="'Удалить ' + displayName(row)"
            [dataTestEdit]="'edit-button-' + row._id"
            [dataTestDelete]="'delete-button-' + row._id"
            (edit)="openEdit($event)"
            (delete)="onDelete($event)"
          />
        </ng-template>

        <ng-template #nameTpl let-row>
          <span class="font-medium">{{ displayName(row) }}</span>
        </ng-template>

        <ng-template #isActiveTpl let-row>
          <app-pi-switch
            [checked]="row.isActive"
            [id]="'people-switch-' + row._id"
            [ariaLabel]="(row.isActive ? 'Деактивировать ' : 'Активировать ') + displayName(row)"
            (checkedChange)="onToggleActive(row, $event)"
            data-test="active-switch"
          />
        </ng-template>
      </app-pi-table>
    </app-pi-group-workspace>
  `,
})
export class PeoplePage implements OnInit {
  protected readonly chips = CLIENTS_SECTION_CHIPS;
  private readonly service = inject(PiWorkersService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly RefreshIcon = RefreshCw;
  protected readonly pageSize = PAGE_SIZE;
  protected readonly displayName = personDisplayName;

  private readonly rowsSig = signal<Person[]>([]);
  private readonly loadingSig = signal(false);
  private readonly errorSig = signal<string | null>(null);
  private readonly searchSig = signal('');
  private readonly sortKeySig = signal<SortKey>('lastName');
  private readonly sortDirSig = signal<'asc' | 'desc' | null>('asc');
  private readonly pageSig = signal(1);

  protected readonly searchQuery = this.searchSig.asReadonly();
  protected readonly loading = this.loadingSig.asReadonly();
  protected readonly error = this.errorSig.asReadonly();
  protected readonly page = this.pageSig.asReadonly();

  protected readonly filteredRows = computed(() => {
    const q = this.searchSig().trim().toLowerCase();
    const rows = this.rowsSig();
    if (!q) return rows;
    return rows.filter((p) => {
      const blob = [
        personDisplayName(p),
        p.email ?? '',
        p.position ?? '',
        p.department ?? '',
        p.phone ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return blob.includes(q);
    });
  });

  protected readonly sortedRows = computed(() => {
    const rows = this.filteredRows();
    const key = this.sortKeySig();
    if (!key) return rows;
    const sign = this.sortDirSig() === 'asc' ? 1 : -1;
    return rows.slice().sort((a, b) => {
      const av =
        key === 'lastName'
          ? personDisplayName(a)
          : key === 'position'
            ? (a.position ?? '')
            : (a.email ?? '');
      const bv =
        key === 'lastName'
          ? personDisplayName(b)
          : key === 'position'
            ? (b.position ?? '')
            : (b.email ?? '');
      return String(av).localeCompare(String(bv), 'ru') * sign;
    });
  });

  protected readonly total = computed(() => this.sortedRows().length);

  protected readonly paginatedRows = computed(() => {
    const all = this.sortedRows();
    const start = (this.pageSig() - 1) * PAGE_SIZE;
    return all.slice(start, start + PAGE_SIZE);
  });

  protected readonly emptyMessage = computed(() =>
    this.searchQuery()
      ? 'Ничего не найдено.'
      : 'Нет записей. Нажмите «Создать», чтобы добавить человека.',
  );

  protected readonly cols: ColumnDef<Person>[] = [
    { key: 'lastName', label: 'ФИО', sortable: true, sticky: 'left' },
    { key: 'position', label: 'Должность', sortable: true, cellClass: 'empty-cell' },
    { key: 'email', label: 'Email', sortable: true, cellClass: 'empty-cell' },
    { key: 'isActive', label: 'Активен', cellClass: 'text-center' },
  ];

  @ViewChild('rowActionsTpl', { static: true })
  private readonly rowActionsTplRef!: TemplateRef<{ $implicit: Person }>;

  @ViewChild('nameTpl', { static: true })
  private readonly nameTplRef!: TemplateRef<{ $implicit: Person }>;

  @ViewChild('isActiveTpl', { static: true })
  private readonly isActiveTplRef!: TemplateRef<{ $implicit: Person }>;

  protected cellTemplates: Record<string, TemplateRef<{ $implicit: Person }>> = {};
  protected rowActionsTplBinding: TemplateRef<{ $implicit: Person }> | null = null;

  ngOnInit(): void {
    this.cellTemplates = { lastName: this.nameTplRef, isActive: this.isActiveTplRef };
    this.rowActionsTplBinding = this.rowActionsTplRef;
    this.reload();
  }

  protected onSearchInput(event: Event): void {
    this.searchSig.set((event.target as HTMLInputElement).value);
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
    return pluralize(n, ['человек', 'человека', 'человек']);
  }

  protected openCreate(): void {
    const ref = this.dialog.open(PeopleFormDialogComponent, {
      data: null,
      width: 'lg',
      parentDestroyRef: this.destroyRef,
    });
    this.refreshOnDialogClose(ref);
  }

  protected openEdit(person: Person): void {
    const ref = this.dialog.open(PeopleFormDialogComponent, {
      data: person,
      width: 'lg',
      parentDestroyRef: this.destroyRef,
    });
    this.refreshOnDialogClose(ref);
  }

  private refreshOnDialogClose<TResult>(ref: DialogRef<TResult>): void {
    onDialogCloseOnce(ref, this.injector, (value) => {
      if (value != null) this.reload();
    });
  }

  protected onToggleActive(person: Person, checked: boolean): void {
    this.service.update(person._id, { isActive: checked }).subscribe((res) => {
      if (res.ok) {
        this.toast.success(
          checked
            ? `«${personDisplayName(person)}» активирован`
            : `«${personDisplayName(person)}» деактивирован`,
        );
        this.reload();
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected onDelete(person: Person): void {
    const name = personDisplayName(person);
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Удалить запись?',
        description: `Удалить «${name}»? Запись будет скрыта (soft-delete).`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed) => {
      if (!confirmed) return;
      this.service.remove(person._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Удалено');
          this.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  protected reload(): void {
    this.loadingSig.set(true);
    this.errorSig.set(null);
    this.service.list({ limit: 100, page: 1 }).subscribe((res) => {
      this.loadingSig.set(false);
      if (res.ok) {
        this.rowsSig.set(res.data.items ?? []);
      } else {
        this.rowsSig.set([]);
        this.errorSig.set(extractErrorMessage(res.error));
      }
    });
  }
}
