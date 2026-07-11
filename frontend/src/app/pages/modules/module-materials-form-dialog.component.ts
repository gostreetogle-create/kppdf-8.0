import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormArray,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import {
  MaterialInModule,
  ProductModulesService,
} from '../../shared/services/pi-product-modules.service';
import { Material, MaterialsService } from '../materials/materials.service';
import { extractErrorMessage } from '../../core/silent-http';

/**
 * TZ-83 Phase C: ModuleMaterialsFormDialog.
 *
 * Поведение:
 *  - input: { moduleId, materials: MaterialInModule[] } (current state)
 *  - FormArray: каждая строка = material picker + quantity + unit +
 *    override length/width/height/unit (4 необязательных поля)
 *  - save: PATCH /product-modules/:id { materials: [...] }
 *    overrideDimensions сохраняется только если хотя бы одно поле заполнено
 *
 * Зачем separate dialog от ModuleFormDialog:
 *  - ModuleFormDialog = basics + workTypes (Phase C.1)
 *  - ModuleMaterialsFormDialog = materials с override UI (Phase C.2)
 *  - Чище для UX: открываем отдельную панель для редактирования материалов.
 */
@Component({
  selector: 'app-module-materials-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid gap-4" data-test="materials-form">
      <p class="eyebrow text-muted-foreground">Материалы в составе модуля</p>

      <div formArrayName="materials" class="grid gap-3">
        @for (ctrl of materialsArray.controls; track $index) {
          <fieldset [formGroupName]="$index" class="hairline rounded-sm p-3">
            <div class="grid grid-cols-12 gap-2 items-start">
              <label class="block col-span-5">
                <span class="eyebrow block mb-1.5">Материал <span class="text-destructive">*</span></span>
                <select class="pi-input w-full" formControlName="materialId" data-test="mat-select">
                  <option value="">— выбрать —</option>
                  @for (m of materialsCatalog(); track m._id) {
                    <option [value]="m._id">{{ m.name }} ({{ m.unit }})</option>
                  }
                </select>
              </label>
              <label class="block col-span-2">
                <span class="eyebrow block mb-1.5">Кол-во <span class="text-destructive">*</span></span>
                <input type="number" step="0.01" min="0" formControlName="quantity"
                  data-test="mat-qty" class="pi-input w-full font-mono" />
              </label>
              <label class="block col-span-2">
                <span class="eyebrow block mb-1.5">Ед.</span>
                <input type="text" formControlName="unit" data-test="mat-unit" class="pi-input w-full" />
              </label>
              <label class="flex items-center gap-2 col-span-2 pt-6 select-none cursor-pointer">
                <input type="checkbox" formControlName="isPurchased" data-test="mat-purchased" />
                <span class="eyebrow">Закупка</span>
              </label>
              <button type="button" (click)="removeRow($index)"
                class="col-span-1 px-2 py-1.5 hairline border-destructive text-destructive rounded-sm hover:bg-destructive hover:text-paper"
                aria-label="Удалить материал">
                ×
              </button>
            </div>

            <!-- Override-dimensions (Phase C.4: 4 поля — L/W/H/unit) -->
            <div formGroupName="overrideDimensions" class="mt-3 grid grid-cols-12 gap-2 items-end">
              <span class="col-span-12 eyebrow text-muted-foreground">Override-габариты (необязательно)</span>
              <label class="block col-span-2">
                <span class="eyebrow block mb-1.5">Длина</span>
                <input type="number" step="0.01" min="0" formControlName="length"
                  data-test="override-len" class="pi-input w-full font-mono" />
              </label>
              <label class="block col-span-2">
                <span class="eyebrow block mb-1.5">Ширина</span>
                <input type="number" step="0.01" min="0" formControlName="width"
                  data-test="override-w" class="pi-input w-full font-mono" />
              </label>
              <label class="block col-span-2">
                <span class="eyebrow block mb-1.5">Высота</span>
                <input type="number" step="0.01" min="0" formControlName="height"
                  data-test="override-h" class="pi-input w-full font-mono" />
              </label>
              <label class="block col-span-3">
                <span class="eyebrow block mb-1.5">Ед.</span>
                <input type="text" formControlName="unit"
                  data-test="override-unit" class="pi-input w-full" placeholder="мм/см/м" />
              </label>
            </div>
          </fieldset>
        }
      </div>

      <button type="button" (click)="addRow()" data-test="mat-add"
        class="px-3 py-1.5 hairline rounded-sm text-sm hover:bg-paper-2 w-fit">
        + Добавить материал
      </button>

      @if (formError()) {
        <div role="alert" class="border hairline border-destructive rounded-sm px-3 py-2 text-sm text-destructive">
          {{ formError() }}
        </div>
      }

      <div class="flex justify-end gap-2 pt-2 hairline-t">
        <app-pi-button variant="ghost" type="button" (click)="onCancel()" data-test="cancel-button">
          Отмена
        </app-pi-button>
        <app-pi-button variant="default" type="submit"
          [disabled]="form.invalid || submitting()" data-test="submit-button">
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
      </div>
    </form>
  `,
})
export class ModuleMaterialsFormDialogComponent {
  protected readonly ref =
    inject<DialogRef<null | { materials: MaterialInModule[] }>>(PI_DIALOG_REF);
  protected readonly data =
    inject<{ moduleId: string; materials: MaterialInModule[] }>(PI_DIALOG_DATA);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly modules = inject(ProductModulesService);
  private readonly materialsSvc = inject(MaterialsService);
  private readonly toast = inject(PiToastService);

  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly materialsCatalog = signal<Material[]>([]);

  protected readonly form = this.fb.group({
    materials: this.fb.array(
      (this.data.materials ?? []).map((m) => this.rowGroup(m)),
    ),
  });

  protected get materialsArray(): FormArray {
    return this.form.controls.materials as FormArray;
  }

  constructor() {
    // Catalog lookup — однократно. Большие лимиты (200) — справочник небольшой.
    this.materialsSvc.list({ limit: 200 }).subscribe((res) => {
      if (res.ok) this.materialsCatalog.set(res.data.items);
    });
  }

  private rowGroup(m: MaterialInModule) {
    return this.fb.group({
      materialId: this.fb.control<string>(typeof m.materialId === 'string' ? m.materialId : m.materialId._id,
        [Validators.required]),
      quantity: this.fb.control<number>(m.quantity ?? 1, [Validators.required, Validators.min(0.0001)]),
      unit: this.fb.control<string>(m.unit ?? 'шт'),
      isPurchased: this.fb.control<boolean>(m.isPurchased ?? true),
      overrideDimensions: this.fb.group({
        length: this.fb.control<number | null>(m.overrideDimensions?.length ?? null),
        width: this.fb.control<number | null>(m.overrideDimensions?.width ?? null),
        height: this.fb.control<number | null>(m.overrideDimensions?.height ?? null),
        unit: this.fb.control<string>(m.overrideDimensions?.unit ?? ''),
      }),
    });
  }

  protected addRow(): void {
    this.materialsArray.push(this.rowGroup({
      materialId: '',
      quantity: 1,
      unit: 'шт',
      isPurchased: true,
      sortOrder: this.materialsArray.length,
    }));
  }

  protected removeRow(idx: number): void {
    this.materialsArray.removeAt(idx);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue().materials ?? [];
    const payload: MaterialInModule[] = raw.map((r, i) => {
      const od = r.overrideDimensions;
      const hasOverride =
        od.length != null || od.width != null || od.height != null || !!od.unit?.trim();
      return {
        materialId: r.materialId,
        quantity: r.quantity,
        unit: r.unit || undefined,
        isPurchased: r.isPurchased,
        sortOrder: i,
        overrideDimensions: hasOverride
          ? {
              length: od.length ?? undefined,
              width: od.width ?? undefined,
              height: od.height ?? undefined,
              unit: od.unit || undefined,
            }
          : undefined,
      };
    });

    this.submitting.set(true);
    this.modules.update(this.data.moduleId, { materials: payload }).subscribe((res) => {
      this.submitting.set(false);
      if (res.ok) {
        this.toast.success('Материалы обновлены');
        this.ref.close({ materials: res.data?.materials ?? payload });
      } else {
        const msg = extractErrorMessage(res.error);
        this.formError.set(msg);
        this.toast.error(msg);
      }
    });
  }

  protected onCancel(): void {
    this.ref.close(null);
  }
}
