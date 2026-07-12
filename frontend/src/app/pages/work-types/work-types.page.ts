import {
  ChangeDetectionStrategy,
  Component,
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
import { WorkType, WorkTypesService } from '../../shared/services/pi-work-types.service';
import { WorkTypeFormDialogComponent } from './work-type-form-dialog.component';

type SortKey = 'name' | 'section' | 'department' | 'hourlyRate' | null;
type SortDir = 'asc' | 'desc';

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
      <span hint>{{ visible().length }} {{ totalLabel(visible().length) }}</span>
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
  private readonly injector = inject(Injector);
  private readonly baseUrl = inject(API_BASE_URL);

  /**
   * GET /api/work-types через httpResource.
   * `WorkType[]` raw shape (backend не пагинирует) — total computed из длины.
   */
  protected readonly listRes = httpResource<WorkType[]>(() => ({
    url: `${this.baseUrl}/work-types`,
  }));

  protected readonly data = computed<WorkType[]>(
    () => this.listRes.value() ?? [],
  );
  /** search-filtered без sort — sort ниже делается на visible(). */
  protected readonly visible = computed<WorkType[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.data();
    return this.data().filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        (w.section ?? '').toLowerCase().includes(q) ||
        (w.department ?? '').toLowerCase().includes(q),
    );
  });
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly searchQuery = signal<string>('');
  protected readonly sortKey = signal<SortKey>('name');
  protected readonly sortDir = signal<SortDir>('asc');

  protected readonly sortedRows = computed<WorkType[]>(() => {
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

  ngOnInit(): void {
    // listRes auto-fire;
  }

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

  protected isSortedBy(key: Exclude<SortKey, null>): boolean {
    return this.sortKey() === key;
  }

  protected totalLabel(n: number): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'вид';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'вида';
    return 'видов';
  }

  protected openCreate(): void {
    const ref = this.dialog.open(WorkTypeFormDialogComponent, { data: null, width: 'md' });
    this.refreshOnDialogClose(ref);
  }

  protected openEdit(wt: WorkType): void {
    const ref = this.dialog.open(WorkTypeFormDialogComponent, { data: wt, width: 'md' });
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
