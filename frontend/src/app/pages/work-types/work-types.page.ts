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
import { SwitchComponent } from '../../shared/ui/switch/switch.component';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { createSortState } from '../../shared/util/sort';
import { createClientSearchState } from '../../shared/util/search';
import { pluralize } from '../../shared/util/format';
import { WorkType, WorkTypesService } from '../../shared/services/pi-work-types.service';
import { WorkTypeFormDialogComponent } from './work-type-form-dialog.component';

type SortKey = 'name' | 'section' | 'department' | 'hourlyRate';

/**
 * TZ-83 Phase B: WorkTypesPage.
 *
 * Каноничный Paper & Ink list-page паттерн:
 *  - OnPush + signal-based
 *  - httpResource для list-GET (auto-fire на first read)
 *  - data/total/loading/error — computed wrappers
 *  - search debounced через signals
 *  - CRUD через silent-http Observable<SilentResult<T>>
 *  - dialogs через onDialogCloseOnce
 *
 * Backend GET /api/work-types не возвращает pagination-shape, поэтому
 * `data` здесь — массив, не `{ items, total }`. total() возвращает длину.
 */
@Component({
  selector: 'app-work-types-page',
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
      <app-pi-button
        variant="default"
        (click)="openCreate()"
        data-test="create-button"
      >
        + Создать
      </app-pi-button>
      <span hint>{{ sortedRows().length }} {{ totalLabel(sortedRows().length) }}</span>
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
      <div class="hairline rounded-sm overflow-x-auto">
        <table class="w-full text-sm">
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
                (click)="setSort('section')"
              >
                Секция
                <span [class.text-sunrise-warm]="isSortedBy('section')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('section') }}</span>
              </th>
              <th
                class="pi-cell eyebrow cursor-pointer select-none group text-left"
                (click)="setSort('department')"
              >
                Отдел
                <span [class.text-sunrise-warm]="isSortedBy('department')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('department') }}</span>
              </th>
              <th
                class="pi-cell-numeric eyebrow cursor-pointer select-none min-w-24 group"
                (click)="setSort('hourlyRate')"
              >
                Час/₽
                <span [class.text-sunrise-warm]="isSortedBy('hourlyRate')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('hourlyRate') }}</span>
              </th>
              <th class="pi-cell eyebrow w-20 text-center">Активен</th>
              <th class="pi-cell eyebrow w-40 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            @for (row of sortedRows(); track row._id) {
              <tr
                class="pi-table-row pi-table-row-odd last:border-0"
                [class.opacity-50]="!row.isActive"
                [attr.data-test]="'work-type-row-' + row._id"
              >
                <td class="pi-cell align-top font-medium">{{ row.name }}</td>
                <td class="pi-cell align-top text-muted-foreground empty-cell">{{ row.section }}</td>
                <td class="pi-cell align-top text-muted-foreground empty-cell">{{ row.department }}</td>
                <td class="pi-cell-numeric align-top empty-cell font-mono text-xs">{{ row.hourlyRate ?? '—' }}</td>
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
                [colspan]="6"
                [message]="searchQuery() ? 'Ничего не найдено.' : 'Нет видов работ. Нажмите «Создать», чтобы добавить первый.'"
                state="empty"
              />
            }
            @if (loading() && sortedRows().length === 0) {
              <app-pi-empty-state [colspan]="6" message="Загрузка…" state="loading" />
            }
          </tbody>
        </table>
      </div>
    </app-pi-section>
  `,
})
export class WorkTypesPage implements OnInit {
  private readonly service = inject(WorkTypesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly baseUrl = inject(API_BASE_URL);

  private readonly sort = createSortState<SortKey>('name');

  protected readonly listRes = httpResource<WorkType[]>(() => ({
    url: `${this.baseUrl}/work-types`,
  }));

  protected readonly data = computed<WorkType[]>(
    () => this.listRes.value() ?? [],
  );

  protected readonly filteredRows = createClientSearchState(
    () => this.data(),
    (w: WorkType, q: string) =>
      w.name.toLowerCase().includes(q) ||
      (w.section ?? '').toLowerCase().includes(q) ||
      (w.department ?? '').toLowerCase().includes(q),
  ).filtered;

  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly sortedRows = this.sort.sorted(this.filteredRows(), (r) => {
    const k = this.sort.sortKey();
    if (!k) return null;
    return (r as any)[k];
  });

  protected readonly searchQuery = signal<string>('');

  ngOnInit(): void {}

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
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
    return pluralize(n, ['вид', 'вида', 'видов']);
  }

  protected openCreate(): void {
    const ref = this.dialog.open(WorkTypeFormDialogComponent, { data: null, width: 'md', parentDestroyRef: this.destroyRef });
    this.refreshOnDialogClose(ref);
  }

  protected openEdit(wt: WorkType): void {
    const ref = this.dialog.open(WorkTypeFormDialogComponent, { data: wt, width: 'md', parentDestroyRef: this.destroyRef });
    this.refreshOnDialogClose(ref);
  }

  private refreshOnDialogClose<TResult>(ref: DialogRef<TResult>): void {
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }

  protected onToggleActive(wt: WorkType, checked: boolean): void {
    this.service.update(wt._id, { isActive: checked }).subscribe((res) => {
      if (res.ok) {
        this.toast.success(
          checked ? `«${wt.name}» активирован` : `«${wt.name}» деактивирован`,
        );
        this.listRes.reload();
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected onDelete(wt: WorkType): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить вид работ?',
        description: `Удалить «${wt.name}»? Если он используется в модулях продукции — операция может быть отклонена сервером.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
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
}
