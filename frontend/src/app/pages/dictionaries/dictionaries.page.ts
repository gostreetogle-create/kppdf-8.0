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
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { SwitchComponent } from '../../shared/ui/switch/switch.component';
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
    PiEmptyStateComponent,
    PiRowActionsComponent,
    ButtonComponent,
    SwitchComponent,
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
          <thead class="hairline-b">
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
                  <app-pi-switch
                    [checked]="u.isActive"
                    [id]="'switch-' + u.key"
                    [ariaLabel]="(u.isActive ? 'Деактивировать ' : 'Активировать ') + u.label"
                    (checkedChange)="onToggleActive(u, $event)"
                    data-test="active-switch"
                  />
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
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly baseUrl = inject(API_BASE_URL);

  /**
   * Server list = `GET /api/units` via Angular 20's `httpResource`.
   * No search/filter on this page (the only "filter" is "system vs
   * non-system" which is rendered, not filtered server-side), so the
   * resource's params are static. Same pattern as `materials.page.ts`
   * and `organizations.page.ts`. `adding` stays as a separate manual
   * signal — it's about form submit state, not list fetch state.
   */
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

  /** Form-submit state — separate from list fetch state. */
  protected readonly adding = signal<boolean>(false);

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
    // `listRes` auto-fires its initial GET — no explicit `reload()`.
  }

  protected onAdd(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.adding.set(true);
    // (No `this.error.set(null)` — `error` is a `computed()` over
    // `listRes.error()`. Form-submit failures already go to toast and
    // auto-dismiss there; nothing to clear on the fetch banner side.)
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
