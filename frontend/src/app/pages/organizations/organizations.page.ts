import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { PiEmptyStateComponent } from '../../shared/ui/pi-empty-state/pi-empty-state.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { createSortState } from '../../shared/util/sort';
import { createSearchState } from '../../shared/util/search';
import { pluralize } from '../../shared/util/format';
import {
  Organization,
  OrganizationsService,
  type OrganizationsListResponse,
} from '../../shared/services/organizations.service';
import { OrganizationFormDialogComponent } from './organization-form-dialog.component';

type SortKey = 'name' | 'inn' | 'shortName';

@Component({
  selector: 'app-organizations-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiEmptyStateComponent,
    PiRowActionsComponent,
    ButtonComponent,
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
      <app-pi-button
        variant="default"
        (click)="openCreate()"
        data-test="create-button"
      >
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

      <div class="hairline rounded-sm overflow-x-auto">
        <table class="w-full text-sm min-w-[640px]">
          <thead class="hairline-b">
            <tr>
              <th
                class="pi-cell eyebrow cursor-pointer select-none group text-left"
                (click)="setSort('name')"
              >
                Название
                <span [class.text-sunrise-warm]="isSortedBy('name')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('name') }}</span>
              </th>
              <th
                class="pi-cell eyebrow cursor-pointer select-none group text-left"
                (click)="setSort('shortName')"
              >
                Краткое
                <span [class.text-sunrise-warm]="isSortedBy('shortName')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('shortName') }}</span>
              </th>
              <th
                class="pi-cell eyebrow cursor-pointer select-none group text-left"
                (click)="setSort('inn')"
              >
                ИНН
                <span [class.text-sunrise-warm]="isSortedBy('inn')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('inn') }}</span>
              </th>
              <th class="pi-cell eyebrow text-left">Типы</th>
              <th class="pi-cell eyebrow w-40 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            @for (row of sortedRows(); track row._id) {
              <tr
                class="pi-table-row pi-table-row-odd last:border-0"
                [attr.data-test]="'org-row-' + row._id"
              >
                <td class="pi-cell align-top font-medium">{{ row.name }}</td>
                <td class="pi-cell align-top text-muted-foreground empty-cell">{{ row.shortName }}</td>
                <td class="pi-cell align-top font-mono text-xs whitespace-nowrap">
                  {{ row.inn }}
                </td>
                <td class="pi-cell align-top">
                  <div class="flex flex-wrap gap-1">
                    @for (t of (row.type || []); track t) {
                      <span class="eyebrow text-[10px] px-2 py-1 hairline rounded-sm">
                        {{ t }}
                      </span>
                    }
                  </div>
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
                [colspan]="5"
                [message]="searchQuery()
                  ? 'Ничего не найдено.'
                  : 'Нет организаций. Нажмите «Создать», чтобы добавить первую.'"
                state="empty"
              />
            }
            @if (loading() && sortedRows().length === 0) {
              <app-pi-empty-state
                [colspan]="5"
                message="Загрузка…"
                state="loading"
              />
            }
          </tbody>
        </table>
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

  private readonly search = createSearchState(300);
  private readonly sort = createSortState<SortKey>('name');

  protected readonly listRes = httpResource<OrganizationsListResponse>(() => ({
    url: `${this.baseUrl}/organizations`,
    params: {
      page: 1,
      limit: 50,
      ...(this.search.debouncedSearch() ? { search: this.search.debouncedSearch() } : {}),
    },
  }));

  protected readonly data = computed<Organization[]>(
    () => this.listRes.value()?.items ?? [],
  );
  protected readonly total = computed<number>(
    () => this.listRes.value()?.total ?? this.data().length,
  );
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly sortedRows = this.sort.sorted(this.data(), (r) => {
    const k = this.sort.sortKey();
    if (!k) return null;
    return (r as any)[k];
  });

  protected readonly searchQuery = this.search.searchQuery;

  ngOnInit(): void {}

  private refreshOnDialogClose<TResult>(ref: DialogRef<TResult>): void {
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }

  protected onSearchInput(event: Event): void {
    this.search.onSearchInput(event);
  }

  protected setSort(key: SortKey): void {
    this.sort.setSort(key);
  }

  protected sortIcon(key: SortKey): string {
    return this.sort.sortIcon(key);
  }

  protected isSortedBy(key: SortKey): boolean {
    return this.sort.isSortedBy(key);
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

  protected reload(): void {
    this.listRes.reload();
  }
}
