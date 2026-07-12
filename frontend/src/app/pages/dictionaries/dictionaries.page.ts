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
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
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
 * TZ-NEW DictionariesPage — каталог единиц измерения (Units).
 *
 * Сейчас содержит только один справочник — `units`. Архитектура готова
 * к расширению: в будущем сюда можно добавить «Категории материалов»,
 * «Статусы документов» и т.д. — через добавление табов или секций.
 *
 * CRUD: создание, деактивация, удаление (системные юниты нельзя удалить).
 */
@Component({
  selector: 'app-dictionaries-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiPageHeaderComponent,
    PiSectionComponent,
    PiRowActionsComponent,
    ButtonComponent,
    SwitchComponent,
    TableComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · справочники"
      title="Справочники"
      description="Словари значений для выпадающих списков. Единицы измерения — добавление, редактирование, деактивация."
    />

    <app-pi-section
      title="Единицы измерения"
      hint="системные юниты нельзя удалить"
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

      <!-- ───── Форма добавления ───── -->
      <form
        [formGroup]="form"
        (ngSubmit)="onAdd()"
        class="mb-section p-4 hairline rounded-sm bg-paper-2/30"
        data-test="add-unit-form"
      >
        <p class="eyebrow mb-3">Новая единица</p>
        <div class="grid grid-cols-1 sm:grid-cols-5 gap-form-field items-end">
          <label class="block">
            <span class="eyebrow block mb-1.5">Ключ <span class="text-destructive">*</span></span>
            <input
              id="u-key"
              type="text"
              formControlName="key"
              placeholder="m, mm, km…"
              maxlength="32"
              autocomplete="off"
              class="pi-input w-full mono"
            />
          </label>
          <label class="block">
            <span class="eyebrow block mb-1.5">Название <span class="text-destructive">*</span></span>
            <input
              id="u-label"
              type="text"
              formControlName="label"
              placeholder="Метр"
              maxlength="128"
              autocomplete="off"
              class="pi-input w-full"
            />
          </label>
          <label class="block">
            <span class="eyebrow block mb-1.5">Символ</span>
            <input
              id="u-symbol"
              type="text"
              formControlName="symbol"
              placeholder="м"
              maxlength="16"
              autocomplete="off"
              class="pi-input w-full"
            />
          </label>
          <label class="block">
            <span class="eyebrow block mb-1.5">Категория</span>
            <input
              id="u-category"
              type="text"
              formControlName="category"
              placeholder="length / mass / volume…"
              maxlength="32"
              autocomplete="off"
              class="pi-input w-full"
            />
          </label>
          <app-pi-button
            type="submit"
            variant="default"
            [disabled]="form.invalid || adding()"
            data-test="add-button"
          >
            {{ adding() ? 'Добавление…' : '+ Добавить' }}
          </app-pi-button>
        </div>
      </form>

      <!-- ───── pi-table ───── -->
      <app-pi-table
        [data]="sortedUnits()"
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
    </app-pi-section>
  `,
})
export class DictionariesPage implements OnInit {
  private readonly service = inject(UnitsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly baseUrl = inject(API_BASE_URL);

  /** Server list via httpResource. */
  protected readonly listRes = httpResource<UnitsListResponse>(() => ({
    url: `${this.baseUrl}/units`,
    params: { page: 1, limit: 100 },
  }));

  protected readonly data = computed<Unit[]>(
    () => this.listRes.value()?.items ?? [],
  );
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly adding = signal<boolean>(false);

  /** Client-side sort by sortOrder then key. */
  protected readonly sortedUnits = computed<Unit[]>(() => {
    return this.data().slice().sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.key.localeCompare(b.key);
    });
  });

  /** Column defs — with isActive switch column via cellTemplates. */
  protected readonly columns: ColumnDef<Unit>[] = [
    { key: 'key', label: 'Ключ', sortable: true, width: '8rem', cellClass: 'font-mono text-xs font-medium' },
    { key: 'label', label: 'Название', sortable: true },
    { key: 'symbol', label: 'Символ', width: '5rem' },
    { key: 'category', label: 'Категория', sortable: true, width: '8rem' },
    { key: 'sortOrder', label: 'Сорт.', align: 'right', numeric: true, width: '5rem' },
    { key: 'isActive', label: 'Активен', width: '5rem', sortable: true },
  ];

  @ViewChild('rowActionsTpl', { static: true })
  protected readonly rowActionsTpl!: TemplateRef<{ $implicit: Unit }>;

  /**
   * Per-column rich templates: isActive switch column.
   * Mapped via `[cellTemplates]="tpls"` binding on pi-table.
   */
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

  ngOnInit(): void {}

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
        this.toast.success(
          checked ? `«${u.label}» активирована` : `«${u.label}» деактивирована`,
        );
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

  protected reload(): void {
    this.listRes.reload();
  }
}
