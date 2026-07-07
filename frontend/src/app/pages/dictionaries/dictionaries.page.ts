import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiEmptyStateComponent } from '../../shared/ui/pi-empty-state/pi-empty-state.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import { Unit, UnitsService } from './units.service';

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
    PiEmptyStateComponent,
    PiRowActionsComponent,
    ButtonComponent,
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

      <!-- ───── Таблица существующих ───── -->
      <div class="hairline rounded-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="border-b hairline border-rule">
            <tr>
              <th class="pi-cell eyebrow w-24 whitespace-nowrap text-left">Ключ</th>
              <th class="pi-cell eyebrow text-left">Название</th>
              <th class="pi-cell eyebrow w-20 text-left">Символ</th>
              <th class="pi-cell eyebrow w-32 text-left">Категория</th>
              <th class="pi-cell eyebrow w-20 text-right">Сорт.</th>
              <th class="pi-cell eyebrow w-20 text-center">Активен</th>
              <th class="pi-cell eyebrow w-32 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            @for (u of sortedUnits(); track u._id) {
              <tr
                class="pi-table-row pi-table-row-odd last:border-0"
                [class.opacity-50]="!u.isActive"
                [attr.data-test]="'unit-row-' + u.key"
              >
                <td class="pi-cell align-top font-mono text-xs font-medium whitespace-nowrap">{{ u.key }}</td>
                <td class="pi-cell align-top">{{ u.label }}</td>
                <td class="pi-cell align-top text-muted-foreground empty-cell">{{ u.symbol }}</td>
                <td class="pi-cell align-top text-muted-foreground text-xs empty-cell">{{ u.category }}</td>
                <td class="pi-cell align-top text-right font-mono text-xs">{{ u.sortOrder }}</td>
                <td class="pi-cell align-top text-center">
                  <button
                    type="button"
                    role="switch"
                    [attr.aria-checked]="u.isActive"
                    (click)="onToggleActive(u)"
                    class="inline-flex items-center justify-center w-9 h-5 rounded-full transition-colors"
                    [class.bg-ink]="u.isActive"
                    [class.bg-rule]="!u.isActive"
                    [attr.aria-label]="(u.isActive ? 'Деактивировать ' : 'Активировать ') + u.label"
                  >
                    <span
                      class="block w-4 h-4 rounded-full bg-paper transition-transform"
                      [class.translate-x-2]="u.isActive"
                      [class.-translate-x-2]="!u.isActive"
                    ></span>
                  </button>
                </td>
                <td class="pi-cell align-top">
                  <app-pi-row-actions
                    [row]="u"
                    editLabel="Не применимо (системный справочник)"
                    [deleteLabel]="'Удалить ' + u.label"
                    [deleteTitle]="u.isSystem ? 'Системный юнит — нельзя удалить' : 'Удалить'"
                    [deleteDisabled]="u.isSystem"
                    [dataTestDelete]="'delete-button-' + u.key"
                    (delete)="onDelete($event)"
                  />
                </td>
              </tr>
            }
            @if (sortedUnits().length === 0 && !loading()) {
              <app-pi-empty-state
                [colspan]="7"
                message="Нет единиц. Добавьте первую."
                state="empty"
              />
            }
            @if (loading() && sortedUnits().length === 0) {
              <app-pi-empty-state
                [colspan]="7"
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
export class DictionariesPage implements OnInit {
  private readonly service = inject(UnitsService);
  private readonly toast = inject(PiToastService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly data = signal<Unit[]>([]);
  protected readonly loading = signal<boolean>(true);
  protected readonly adding = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);

  protected readonly sortedUnits = computed<Unit[]>(() => {
    return this.data().slice().sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.key.localeCompare(b.key);
    });
  });

  protected readonly form = this.fb.group({
    key: this.fb.control('', [Validators.required, Validators.maxLength(32)]),
    label: this.fb.control('', [Validators.required, Validators.maxLength(128)]),
    symbol: this.fb.control<string>(''),
    category: this.fb.control<string>(''),
  });

  ngOnInit(): void {
    this.reload();
  }

  protected onAdd(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.adding.set(true);
    this.error.set(null);
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
          this.reload();
        } else {
          this.error.set(extractErrorMessage(res.error));
          this.adding.set(false);
        }
      });
  }

  protected onToggleActive(u: Unit): void {
    this.service.update(u.key, { isActive: !u.isActive }).subscribe((res) => {
      if (res.ok) {
        this.toast.success(
          u.isActive ? `«${u.label}» деактивирована` : `«${u.label}» активирована`,
        );
        this.reload();
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected onDelete(u: Unit): void {
    if (u.isSystem) return;
    const ok = window.confirm(`Удалить единицу «${u.label}» (${u.key})?`);
    if (!ok) return;
    this.service.remove(u.key).subscribe((res) => {
      if (res.ok) {
        this.toast.success(`Единица «${u.label}» удалена`);
        this.reload();
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.list({ page: 1, limit: 100 }).subscribe((res) => {
      if (res.ok) {
        this.data.set(res.data.items ?? []);
        this.loading.set(false);
      } else {
        this.error.set(extractErrorMessage(res.error));
        this.loading.set(false);
      }
    });
  }
}
