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
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiToastService } from '../../shared/ui/toast';
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
        class="mb-section p-4 border hairline border-rule rounded-sm bg-paper-2/30"
        data-test="add-unit-form"
      >
        <p class="eyebrow mb-3">Новая единица</p>
        <div class="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
          <label class="block">
            <span class="eyebrow block mb-1.5">Ключ <span class="text-destructive">*</span></span>
            <input
              id="u-key"
              type="text"
              formControlName="key"
              placeholder="m, mm, km…"
              maxlength="32"
              autocomplete="off"
              class="w-full h-9 px-3 text-sm border hairline border-rule rounded-sm bg-paper focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper transition-colors mono"
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
              class="w-full h-9 px-3 text-sm border hairline border-rule rounded-sm bg-paper focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper transition-colors"
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
              class="w-full h-9 px-3 text-sm border hairline border-rule rounded-sm bg-paper focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper transition-colors"
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
              class="w-full h-9 px-3 text-sm border hairline border-rule rounded-sm bg-paper focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper transition-colors"
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
      <div class="border hairline border-rule rounded-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="border-b hairline border-rule">
            <tr>
              <th class="text-left py-2.5 px-4 eyebrow w-24 whitespace-nowrap">Ключ</th>
              <th class="text-left py-2.5 px-4 eyebrow">Название</th>
              <th class="text-left py-2.5 px-4 eyebrow w-20">Символ</th>
              <th class="text-left py-2.5 px-4 eyebrow w-32">Категория</th>
              <th class="text-right py-2.5 px-4 eyebrow w-20">Сорт.</th>
              <th class="text-center py-2.5 px-4 eyebrow w-20">Активен</th>
              <th class="text-right py-2.5 px-4 eyebrow w-32">Действия</th>
            </tr>
          </thead>
          <tbody>
            @for (u of sortedUnits(); track u._id) {
              <tr
                class="border-b hairline border-rule last:border-0 odd:bg-paper-2/30 hover:bg-sunrise-soft transition-colors"
                [class.opacity-50]="!u.isActive"
                [attr.data-test]="'unit-row-' + u.key"
              >
                <td class="py-2.5 px-4 align-top mono text-xs font-medium whitespace-nowrap">{{ u.key }}</td>
                <td class="py-2.5 px-4 align-top">{{ u.label }}</td>
                <td class="py-2.5 px-4 align-top text-muted empty-cell">{{ u.symbol }}</td>
                <td class="py-2.5 px-4 align-top text-muted text-xs empty-cell">{{ u.category }}</td>
                <td class="py-2.5 px-4 align-top text-right mono text-xs">{{ u.sortOrder }}</td>
                <td class="py-2.5 px-4 align-top text-center">
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
                <td class="py-2.5 px-4 text-right align-top">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      class="inline-flex items-center justify-center w-8 h-8 hairline border border-rule rounded-sm bg-paper hover:bg-destructive hover:text-paper hover:border-destructive transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                      [attr.aria-label]="'Удалить ' + u.label"
                      [attr.data-test]="'delete-button-' + u.key"
                      [disabled]="u.isSystem"
                      [title]="u.isSystem ? 'Системный юнит — нельзя удалить' : 'Удалить'"
                      (click)="onDelete(u)"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                </td>
              </tr>
            }
            @if (sortedUnits().length === 0 && !loading()) {
              <tr>
                <td colspan="7" class="py-12 px-4 text-center text-muted">
                  <div class="flex flex-col items-center gap-1">
                    <span class="eyebrow text-sunrise-warm">00</span>
                    <span class="text-sm">Нет единиц. Добавьте первую.</span>
                  </div>
                </td>
              </tr>
            }
            @if (loading() && sortedUnits().length === 0) {
              <tr>
                <td colspan="7" class="py-12 px-4 text-center text-muted">Загрузка…</td>
              </tr>
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
      .subscribe({
        next: () => {
          this.toast.success(`Единица «${v.label}» добавлена`);
          this.form.reset({ key: '', label: '', symbol: '', category: '' });
          this.adding.set(false);
          this.reload();
        },
        error: (err: unknown) => {
          const e = err as { error?: { message?: string }; message?: string };
          this.error.set(
            e?.error?.message ?? e?.message ?? 'Не удалось добавить единицу.',
          );
          this.adding.set(false);
        },
      });
  }

  protected onToggleActive(u: Unit): void {
    this.service.update(u.key, { isActive: !u.isActive }).subscribe({
      next: () => {
        this.toast.success(
          u.isActive ? `«${u.label}» деактивирована` : `«${u.label}» активирована`,
        );
        this.reload();
      },
      error: (err: unknown) => {
        const e = err as { error?: { message?: string }; message?: string };
        this.toast.error(e?.error?.message ?? e?.message ?? 'Не удалось обновить.');
      },
    });
  }

  protected onDelete(u: Unit): void {
    if (u.isSystem) return;
    const ok = window.confirm(`Удалить единицу «${u.label}» (${u.key})?`);
    if (!ok) return;
    this.service.remove(u.key).subscribe({
      next: () => {
        this.toast.success(`Единица «${u.label}» удалена`);
        this.reload();
      },
      error: (err: unknown) => {
        const e = err as { error?: { message?: string }; message?: string };
        this.toast.error(e?.error?.message ?? e?.message ?? 'Не удалось удалить.');
      },
    });
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.list({ page: 1, limit: 100 }).subscribe({
      next: (res) => {
        this.data.set(res.items ?? []);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        const e = err as { error?: { message?: string }; message?: string };
        this.error.set(
          e?.error?.message ?? e?.message ?? 'Не удалось загрузить справочник.',
        );
        this.loading.set(false);
      },
    });
  }
}
