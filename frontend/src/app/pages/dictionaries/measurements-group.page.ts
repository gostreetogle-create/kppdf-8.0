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
import { httpResource } from '@angular/common/http';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  FormsModule,
  Validators,
} from '@angular/forms';
import {
  PiGroupWorkspaceComponent,
  type GroupChip,
} from '../../shared/page/pi-group-workspace.component';
import { DICTIONARY_TOC_CHIPS } from './dictionary-group-chips';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { SwitchComponent } from '../../shared/ui/switch/switch.component';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { TableComponent, ColumnDef } from '../../shared/ui/pi-table.component';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { Unit, UnitsService, type UnitsListResponse } from './units.service';

/**
 * TZ-DICT-308 — Measurements group page (/dictionaries/measurements).
 *
 * Pilot for Group Chip Workspace: chips row (Единицы) + units table.
 * No H1 title, no path breadcrumbs — just chips + tools + table.
 */
@Component({
  selector: 'app-measurements-group-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    PiGroupWorkspaceComponent,
    PiRowActionsComponent,
    ButtonComponent,
    SwitchComponent,
    TableComponent,
  ],
  template: `
    <app-pi-group-workspace [toc]="toc" tocActiveId="measurements" [chips]="chips" activeId="units">
      @if (error()) {
        <div
          role="alert"
          class="mb-4 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          {{ error() }}
        </div>
      }

      <!-- Sticky tools: search + filter + compact add -->
      <div tools class="flex items-end gap-form-field flex-wrap w-full" [formGroup]="form">
        <input
          type="search"
          [ngModel]="searchQuery()"
          [ngModelOptions]="{ standalone: true }"
          (ngModelChange)="searchQuery.set($event)"
          placeholder="Поиск по названию или ключу…"
          aria-label="Поиск единиц"
          class="pi-input w-56"
          data-test="search-input"
        />
        <input
          type="text"
          [ngModel]="categoryFilter()"
          [ngModelOptions]="{ standalone: true }"
          (ngModelChange)="categoryFilter.set($event)"
          placeholder="Фильтр по категории…"
          aria-label="Фильтр по категории"
          class="pi-input w-36"
          data-test="category-filter"
        />
        <span class="flex-1"></span>
        <input
          type="text"
          formControlName="key"
          placeholder="Ключ *"
          maxlength="32"
          class="pi-input w-20 mono"
          aria-label="Ключ единицы"
        />
        <input
          type="text"
          formControlName="label"
          placeholder="Название *"
          maxlength="128"
          class="pi-input w-28"
          aria-label="Название единицы"
        />
        <input
          type="text"
          formControlName="symbol"
          placeholder="Символ"
          maxlength="16"
          class="pi-input w-16"
          aria-label="Символ единицы"
        />
        <input
          type="text"
          formControlName="category"
          placeholder="Категория"
          maxlength="32"
          class="pi-input w-28"
          aria-label="Категория единицы"
        />
        <app-pi-button
          type="button"
          variant="default"
          (click)="onAdd()"
          [disabled]="form.invalid || adding()"
          data-test="add-button"
        >
          {{ adding() ? '…' : '+ Добавить' }}
        </app-pi-button>
      </div>

      <!-- Data table -->
      <app-pi-table
        [data]="filteredUnits()"
        [columns]="columns"
        [cellTemplates]="tpls()"
        [rowActions]="rowActionsTpl"
        [total]="data().length"
        [pageSize]="100"
        [loading]="loading()"
        [emptyMessage]="'Нет единиц. Добавьте первую.'"
        [initialSortKey]="'sortOrder'"
        [initialSortDir]="'asc'"
        ariaLabel="Единицы измерения"
        data-test="units-table"
      />

      <ng-template #rowActionsTpl let-u>
        <app-pi-row-actions
          [row]="u"
          editLabel="Не применимо (системный справочник)"
          [deleteLabel]="'Удалить ' + u.label"
          [deleteTitle]="u.isSystem ? 'Системный юнит — нельзя удалить' : 'Удалить'"
          [deleteDisabled]="u.isSystem"
          [dataTestDelete]="'delete-button-' + u.key"
          (delete)="onDelete($event)"
        />
      </ng-template>

      <ng-template #activeSwitchTpl let-u>
        <app-pi-switch
          [checked]="u.isActive"
          [attr.aria-label]="(u.isActive ? 'Деактивировать ' : 'Активировать ') + u.label"
          (checkedChange)="onToggleActive(u, $event)"
          data-test="active-switch"
        />
      </ng-template>
    </app-pi-group-workspace>
  `,
})
export class MeasurementsGroupPage {
  private readonly service = inject(UnitsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly baseUrl = inject(API_BASE_URL);

  protected readonly toc = DICTIONARY_TOC_CHIPS;
  protected readonly chips: readonly GroupChip[] = [
    { id: 'units', label: 'Единицы', route: '/dictionaries/measurements' },
  ];

  protected readonly listRes = httpResource<UnitsListResponse>(() => ({
    url: `${this.baseUrl}/units`,
    params: { page: 1, limit: 100 },
  }));

  protected readonly data = computed<Unit[]>(() => this.listRes.value()?.items ?? []);
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as
      import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly adding = signal<boolean>(false);
  protected readonly searchQuery = signal<string>('');
  protected readonly categoryFilter = signal<string>('');

  protected readonly filteredUnits = computed<Unit[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const cat = this.categoryFilter().trim().toLowerCase();
    return this.data()
      .filter((u) => {
        if (q && !u.label.toLowerCase().includes(q) && !u.key.toLowerCase().includes(q))
          return false;
        if (cat && (!u.category || !u.category.toLowerCase().includes(cat))) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.key.localeCompare(b.key);
      });
  });

  protected readonly columns: ColumnDef<Unit>[] = [
    {
      key: 'key',
      label: 'Ключ',
      sortable: true,
      width: '8rem',
      cellClass: 'font-mono text-xs font-medium',
    },
    { key: 'label', label: 'Название', sortable: true },
    { key: 'symbol', label: 'Символ', width: '5rem' },
    { key: 'category', label: 'Категория', sortable: true, width: '8rem' },
    { key: 'sortOrder', label: 'Сорт.', align: 'right', numeric: true, width: '5rem' },
    { key: 'isActive', label: 'Активен', width: '5rem', sortable: true },
  ];

  @ViewChild('rowActionsTpl', { static: true })
  protected readonly rowActionsTpl!: TemplateRef<{ $implicit: Unit }>;

  @ViewChild('activeSwitchTpl', { static: true })
  protected readonly activeSwitchTpl!: TemplateRef<{ $implicit: Unit }>;

  protected readonly tpls = computed<Record<string, TemplateRef<{ $implicit: Unit }>>>(() => ({
    isActive: this.activeSwitchTpl,
  }));

  protected readonly form = this.fb.group({
    key: this.fb.control('', [Validators.required, Validators.maxLength(32)]),
    label: this.fb.control('', [Validators.required, Validators.maxLength(128)]),
    symbol: this.fb.control<string>(''),
    category: this.fb.control<string>(''),
  });

  protected onAdd(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.adding.set(true);
    this.service
      .create({
        key: v.key,
        label: v.label,
        symbol: v.symbol || undefined,
        category: v.category || undefined,
        sortOrder: 100,
        isActive: true,
      })
      .subscribe((res) => {
        if (res.ok) {
          this.toast.success(`Единица «${v.label}» добавлена`);
          this.form.reset({ key: '', label: '', symbol: '', category: '' });
          this.adding.set(false);
          this.listRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
          this.adding.set(false);
        }
      });
  }

  protected onToggleActive(u: Unit, checked: boolean): void {
    this.service.update(u.key, { isActive: checked }).subscribe((res) => {
      if (res.ok) {
        this.toast.success(checked ? `«${u.label}» активирована` : `«${u.label}» деактивирована`);
        this.listRes.reload();
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected onDelete(u: Unit): void {
    if (u.isSystem) return;
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить единицу?',
        description: `Удалить «${u.label}» (${u.key})? Это действие нельзя отменить.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.service.remove(u.key).subscribe((res) => {
        if (res.ok) {
          this.toast.success(`Единица «${u.label}» удалена`);
          this.listRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }
}
