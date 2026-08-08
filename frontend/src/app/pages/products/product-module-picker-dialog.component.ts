import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiOverflowSelectComponent } from '../../shared/ui/overflow-select/pi-overflow-select.component';
import {
  ProductModule,
  ProductModulesService,
} from '../../shared/services/pi-product-modules.service';
import { extractErrorMessage } from '../../core/silent-http';

/**
 * ProductModulePickerDialog — выбор модулей для товара.
 *
 * Режимы (data.multi):
 *   - default: `app-pi-overflow-select` searchable=auto (≥10 → поиск в панели).
 *   - multi: чекбокс-список, возвращает `string[]`.
 *
 * Уже привязанные модули исключаются через `excludeIds`.
 */
export interface ProductModulePickerData {
  productId: string;
  excludeIds: string[];
  /** true → чекбокс-список, возвращает string[]; default → select, возвращает string. */
  multi?: boolean;
}

@Component({
  selector: 'app-product-module-picker-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent, PiDialogComponent, PiOverflowSelectComponent],
  template: `
    <app-pi-dialog
      [title]="multi ? 'Добавить модули в состав' : 'Привязать модуль к товару'"
      [width]="'lg'"
      [variant]="'content'"
    >
      <form body [formGroup]="form" (ngSubmit)="onSubmit()" data-test="picker-form">
        <p class="eyebrow text-muted-foreground mb-3">
          {{ multi ? 'Отметьте модули в составе товара' : 'Привязать модуль к товару' }}
        </p>

        @if (loading()) {
          <p class="text-xs text-muted-foreground py-2" role="status">Загрузка модулей…</p>
        } @else if (error()) {
          <p class="text-xs text-destructive py-2" role="alert">{{ error() }}</p>
        } @else if (multi) {
          <div class="max-h-72 overflow-y-auto hairline rounded-sm p-1 space-y-0.5">
            @for (m of available(); track m._id) {
              <label
                class="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-paper-2 cursor-pointer"
                [attr.data-test]="'picker-row-' + m._id"
              >
                <input
                  type="checkbox"
                  class="w-4 h-4 shrink-0"
                  [checked]="selected().includes(m._id)"
                  (change)="toggle(m._id)"
                  data-test="picker-check"
                />
                <span class="text-sm truncate">{{ m.name }}</span>
                <span class="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                  {{ m.article ?? '—' }} · {{ m.materials.length }} материалов
                </span>
              </label>
            } @empty {
              <p class="px-2 py-3 text-xs text-muted-foreground">Нет доступных модулей.</p>
            }
          </div>
        } @else {
          <div class="block min-w-0">
            <span class="eyebrow block mb-1.5">
              Модуль <span class="text-destructive">*</span>
            </span>
            <app-pi-overflow-select
              [items]="selectItems()"
              [value]="form.controls.moduleId.value"
              (valueChange)="onSinglePick($event)"
              searchable="auto"
              placeholder="— выбрать модуль —"
              ariaLabel="Модуль"
              dataTest="picker-select"
            />
          </div>
        }
      </form>

      <div footer>
        <app-pi-button variant="ghost" type="button" (click)="onCancel()" data-test="cancel-button">
          Отмена
        </app-pi-button>
        <app-pi-button
          variant="default"
          type="submit"
          [disabled]="multi ? selected().length === 0 : form.invalid"
          data-test="submit-button"
        >
          {{ multi ? 'Добавить' : 'Привязать' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class ProductModulePickerDialogComponent {
  protected readonly ref = inject<DialogRef<string | string[] | null>>(PI_DIALOG_REF);
  protected readonly data = inject<ProductModulePickerData>(PI_DIALOG_DATA);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly modules = inject(ProductModulesService);

  /** Мульти-режим задаётся ДО рендера через data.multi (статично). */
  protected readonly multi = this.data.multi ?? false;

  /** Каталог всех модулей, загруженный один раз на mount. */
  protected readonly all = signal<ProductModule[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  /** Доступные = каталог минус уже привязанные (excludeIds). */
  protected readonly available = computed<ProductModule[]>(() =>
    this.all().filter((m) => !this.data.excludeIds.includes(m._id)),
  );

  protected readonly selectItems = computed(() =>
    this.available().map((m) => ({
      id: m._id,
      label: `${m.name} · ${m.article ?? '—'} · ${m.materials.length} материалов`,
    })),
  );

  /** Выбранные id в мульти-режиме. */
  protected readonly selected = signal<string[]>([]);

  protected readonly form = this.fb.group({
    moduleId: this.fb.control<string>('', [Validators.required]),
  });

  constructor() {
    this.load();
  }

  protected onSinglePick(id: string): void {
    this.form.controls.moduleId.setValue(id);
    this.form.controls.moduleId.markAsDirty();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.modules.list().subscribe((res) => {
      this.loading.set(false);
      if (res.ok) {
        this.all.set(res.data);
      } else {
        this.all.set([]);
        this.error.set(extractErrorMessage(res.error));
      }
    });
  }

  protected toggle(id: string): void {
    this.selected.update((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  protected onSubmit(): void {
    if (this.multi) {
      if (this.selected().length === 0) return;
      this.ref.close(this.selected());
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.ref.close(this.form.getRawValue().moduleId || null);
  }

  protected onCancel(): void {
    this.ref.close(null);
  }
}
