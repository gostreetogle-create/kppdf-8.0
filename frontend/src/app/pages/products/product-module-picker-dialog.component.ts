import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import {
  ProductModule,
  ProductModulesService,
} from '../../shared/services/pi-product-modules.service';

/**
 * TZ-83 Phase D: ProductModulePickerDialog.
 *
 * Показывает все модули из каталога, исключая уже привязанные.
 * Юзер выбирает один → возвращает moduleId строкой (ref.close(id)).
 * Cancel → null.
 */
@Component({
  selector: 'app-product-module-picker-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid gap-4" data-test="picker-form">
      <p class="eyebrow text-muted-foreground">Привязать модуль к товару</p>

      <label class="block">
        <span class="eyebrow block mb-1.5">Модуль <span class="text-destructive">*</span></span>
        <select class="pi-input w-full" formControlName="moduleId" data-test="picker-select" size="10">
          @for (m of available(); track m._id) {
            <option [value]="m._id">
              {{ m.name }} · {{ m.article ?? '—' }} · {{ m.materials.length }} материалов
            </option>
          } @empty {
            <option disabled>Нет доступных модулей.</option>
          }
        </select>
      </label>

      <div class="flex justify-end gap-2 pt-2 hairline-t">
        <app-pi-button variant="ghost" type="button" (click)="onCancel()" data-test="cancel-button">
          Отмена
        </app-pi-button>
        <app-pi-button variant="default" type="submit"
          [disabled]="form.invalid" data-test="submit-button">
          Привязать
        </app-pi-button>
      </div>
    </form>
  `,
})
export class ProductModulePickerDialogComponent {
  protected readonly ref = inject<DialogRef<string | null>>(PI_DIALOG_REF);
  protected readonly data = inject<{ productId: string; excludeIds: string[] }>(PI_DIALOG_DATA);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly modules = inject(ProductModulesService);

  /** Loaded once on mount. */
  protected readonly all = signal<ProductModule[]>([]);
  protected readonly available = computed<ProductModule[]>(() =>
    this.all().filter((m) => !this.data.excludeIds.includes(m._id)),
  );

  protected readonly form = this.fb.group({
    moduleId: this.fb.control<string>('', [Validators.required]),
  });

  constructor() {
    this.modules.list().subscribe((res) => {
      if (res.ok) this.all.set(res.data);
    });
  }

  protected onSubmit(): void {
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
