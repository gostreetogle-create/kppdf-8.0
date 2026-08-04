import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormArray, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import {
  CompositionLine,
  MaterialInModule,
  ProductModulesService,
} from '../../shared/services/pi-product-modules.service';
import { Material, MaterialsService } from '../../shared/services/materials.service';
import { extractErrorMessage, SilentResult } from '../../core/silent-http';
import { forkJoin, Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';

/**
 * TZ-83 Phase C + TZ-CATALOG-317: ModuleMaterialsFormDialog.
 *
 * Поведение:
 *  - input: { moduleId, materials: MaterialInModule[], composition?: CompositionLine[] }
 *    (current state; composition — канонический состав модуля)
 *  - FormArray: каждая строка = material picker + quantity + unit +
 *    override length/width/height/unit (4 необязательных поля)
 *  - seed: dual-read — непустой composition (lineType=material) → строки из
 *    линий (с lineId); иначе legacy materials[]
 *  - save: composition API (TZ-CATALOG-302/317):
 *      DELETE /modules/:id/composition/:lineId  — убранные линии
 *      POST   /modules/:id/composition          — новые строки
 *      PATCH  /modules/:id/composition/:lineId  — изменённые (qty/unit/…)
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
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent, PiDialogComponent],
  template: `
    <app-pi-dialog title="Материалы в составе модуля" [width]="'lg'">
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field overflow-y-auto min-h-0"
        data-test="materials-form"
      >
        <div formArrayName="materials" class="space-y-3">
          @for (ctrl of materialsArray.controls; track $index) {
            <div [formGroupName]="$index" class="p-3 hairline rounded-sm bg-paper-2/30">
              <div class="grid grid-cols-12 gap-2 items-start">
                <label class="block col-span-5">
                  <span class="eyebrow block mb-1.5"
                    >Материал <span class="text-destructive">*</span></span
                  >
                  <select
                    class="pi-input w-full"
                    formControlName="materialId"
                    data-test="mat-select"
                  >
                    <option value="">— выбрать —</option>
                    @for (m of materialsCatalog(); track m._id) {
                      <option [value]="m._id">{{ m.name }} ({{ m.unit }})</option>
                    }
                  </select>
                </label>
                <label class="block col-span-2">
                  <span class="eyebrow block mb-1.5"
                    >Кол-во <span class="text-destructive">*</span></span
                  >
                  <app-pi-input
                    type="number"
                    formControlName="quantity"
                    placeholder="0"
                    data-test="mat-qty"
                  />
                </label>
                <label class="block col-span-2">
                  <span class="eyebrow block mb-1.5">Ед.</span>
                  <app-pi-input formControlName="unit" placeholder="шт" data-test="mat-unit" />
                </label>
                <label class="flex items-center gap-2 col-span-2 pt-6 select-none cursor-pointer">
                  <input type="checkbox" formControlName="isPurchased" data-test="mat-purchased" />
                  <span class="eyebrow">Закупка</span>
                </label>
                <app-pi-button
                  type="button"
                  variant="destructive"
                  size="icon"
                  (click)="removeRow($index)"
                  aria-label="Удалить материал"
                >
                  ×
                </app-pi-button>
              </div>

              <div
                formGroupName="overrideDimensions"
                class="mt-3 grid grid-cols-12 gap-2 items-end"
              >
                <span class="col-span-12 eyebrow text-muted-foreground"
                  >Override-габариты (необязательно)</span
                >
                <label class="block col-span-2">
                  <span class="eyebrow block mb-1.5">Длина</span>
                  <app-pi-input
                    type="number"
                    formControlName="length"
                    placeholder="0"
                    data-test="override-len"
                  />
                </label>
                <label class="block col-span-2">
                  <span class="eyebrow block mb-1.5">Ширина</span>
                  <app-pi-input
                    type="number"
                    formControlName="width"
                    placeholder="0"
                    data-test="override-w"
                  />
                </label>
                <label class="block col-span-2">
                  <span class="eyebrow block mb-1.5">Высота</span>
                  <app-pi-input
                    type="number"
                    formControlName="height"
                    placeholder="0"
                    data-test="override-h"
                  />
                </label>
                <label class="block col-span-3">
                  <span class="eyebrow block mb-1.5">Ед.</span>
                  <app-pi-input
                    formControlName="unit"
                    placeholder="мм/см/м"
                    data-test="override-unit"
                  />
                </label>
              </div>
            </div>
          }
        </div>

        <app-pi-button
          type="button"
          variant="outline"
          size="sm"
          (click)="addRow()"
          data-test="mat-add"
        >
          + Добавить материал
        </app-pi-button>

        @if (formError()) {
          <p role="alert" class="text-xs text-destructive">
            {{ formError() }}
          </p>
        }
      </form>

      <div footer class="flex gap-3">
        <app-pi-button variant="ghost" type="button" (click)="onCancel()" data-test="cancel-button">
          Отмена
        </app-pi-button>
        <app-pi-button
          variant="default"
          type="submit"
          [disabled]="form.invalid || submitting()"
          data-test="submit-button"
        >
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class ModuleMaterialsFormDialogComponent {
  protected readonly ref =
    inject<DialogRef<null | { materials: MaterialInModule[] }>>(PI_DIALOG_REF);
  protected readonly data = inject<{
    moduleId: string;
    materials: MaterialInModule[];
    composition?: CompositionLine[];
  }>(PI_DIALOG_DATA);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly modules = inject(ProductModulesService);
  private readonly materialsSvc = inject(MaterialsService);
  private readonly toast = inject(PiToastService);

  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly materialsCatalog = signal<Material[]>([]);

  /** Исходные material-линии состава (для diff на save; пуст на legacy). */
  private originalComposition: CompositionLine[] = [];

  protected readonly form = this.fb.group({
    materials: this.fb.array(this.seedRows()),
  });

  private seedRows(): { lineId?: string } & MaterialInModule[] {
    const lines = (this.data.composition ?? []).filter((l) => l.lineType === 'material');
    if (lines.length > 0) {
      this.originalComposition = lines;
      return lines.map((l) => ({
        lineId: l._id,
        materialId: l.refId,
        quantity: l.quantity ?? 1,
        unit: l.unit ?? 'шт',
        isPurchased: l.isPurchased ?? true,
        overrideDimensions: l.overrideDimensions,
        sortOrder: l.sortOrder ?? 0,
      }));
    }
    return this.data.materials ?? [];
  }

  protected get materialsArray(): FormArray {
    return this.form.controls.materials as FormArray;
  }

  constructor() {
    // Catalog lookup — однократно. Большие лимиты (200) — справочник небольшой.
    this.materialsSvc.list({ limit: 200 }).subscribe((res) => {
      if (res.ok) this.materialsCatalog.set(res.data.items);
    });
  }

  private rowGroup(m: MaterialInModule & { lineId?: string }) {
    return this.fb.group({
      lineId: this.fb.control<string | null>(m.lineId ?? null),
      materialId: this.fb.control<string>(
        typeof m.materialId === 'string' ? m.materialId : m.materialId._id,
        [Validators.required],
      ),
      quantity: this.fb.control<number>(m.quantity ?? 1, [
        Validators.required,
        Validators.min(0.0001),
      ]),
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
    this.materialsArray.push(
      this.rowGroup({
        materialId: '',
        quantity: 1,
        unit: 'шт',
        isPurchased: true,
        sortOrder: this.materialsArray.length,
      }),
    );
  }

  private rowValue(idx: number): MaterialInModule & { lineId?: string } {
    const r = this.materialsArray.at(idx).getRawValue();
    return {
      lineId: r.lineId ?? undefined,
      materialId: r.materialId,
      quantity: r.quantity,
      unit: r.unit || undefined,
      isPurchased: r.isPurchased,
      sortOrder: idx,
      overrideDimensions: (() => {
        const od = r.overrideDimensions as
          { length?: number; width?: number; height?: number; unit?: string } | undefined;
        const hasOverride =
          od != null &&
          (od.length != null || od.width != null || od.height != null || !!od.unit?.trim());
        return hasOverride
          ? {
              length: od?.length ?? undefined,
              width: od?.width ?? undefined,
              height: od?.height ?? undefined,
              unit: od?.unit || undefined,
            }
          : undefined;
      })(),
    };
  }

  protected removeRow(idx: number): void {
    this.materialsArray.removeAt(idx);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const rows = (this.form.getRawValue().materials ?? []).map((_, i) => this.rowValue(i));

    // Diff против исходных material-линий состава (TZ-CATALOG-317):
    //   - линий больше нет в форме → DELETE
    //   - строка с lineId → PATCH (qty/unit/…)
    //   - новая строка (или legacy → первая запись) → POST
    const keptLineIds = new Set(rows.map((r) => r.lineId).filter((id): id is string => !!id));
    const calls: Observable<SilentResult<unknown>>[] = [];
    this.originalComposition.forEach((line) => {
      if (!keptLineIds.has(line._id)) {
        calls.push(this.modules.removeModuleCompositionLine(this.data.moduleId, line._id));
      }
    });
    rows.forEach((r) => {
      if (r.lineId) {
        calls.push(
          this.modules.updateModuleCompositionLine(this.data.moduleId, r.lineId, {
            quantity: r.quantity,
            unit: r.unit,
            isPurchased: r.isPurchased,
            overrideDimensions: r.overrideDimensions,
            sortOrder: r.sortOrder,
          }),
        );
      } else {
        calls.push(
          this.modules.addModuleCompositionLine(this.data.moduleId, {
            lineType: 'material',
            refId: typeof r.materialId === 'string' ? r.materialId : r.materialId._id,
            quantity: r.quantity,
            unit: r.unit,
            isPurchased: r.isPurchased,
            overrideDimensions: r.overrideDimensions,
            sortOrder: r.sortOrder,
          }),
        );
      }
    });

    const payload: MaterialInModule[] = rows.map((r, i) => ({
      materialId: r.materialId,
      quantity: r.quantity,
      unit: r.unit,
      isPurchased: r.isPurchased,
      sortOrder: i,
      overrideDimensions: r.overrideDimensions,
    }));

    this.submitting.set(true);
    if (calls.length === 0) {
      this.submitting.set(false);
      this.toast.success('Материалы обновлены');
      this.ref.close({ materials: payload });
      return;
    }
    this.modules
      .update(this.data.moduleId, { materials: payload })
      .pipe(
        // best-effort: если PATCH materials ещё работает (pre-304) — сохраняем
        // legacy-зеркало; если 400 (post-304) — состав всё равно записан через
        // composition выше, и dual-read покажет линию.
        concatMap(() => (calls.length > 1 ? forkJoin(calls) : calls[0])),
      )
      .subscribe((res) => {
        this.submitting.set(false);
        if (Array.isArray(res) ? res.every((r) => r.ok) : res.ok) {
          this.toast.success('Материалы обновлены');
          this.ref.close({ materials: payload });
        } else {
          const first = Array.isArray(res) ? res[0] : res;
          const msg =
            first && 'error' in first
              ? extractErrorMessage(first.error)
              : 'Не удалось обновить материалы';
          this.formError.set(msg);
          this.toast.error(msg);
        }
      });
  }

  /** TZ-MATERIALS-309: ���������� Set immutable dimension-����� ��� ��������� � ������ idx. */
  protected immutableDimsForIdx(idx: number): Set<string> {
    const row = this.materialsArray.at(idx);
    if (!row) return new Set();
    const matId = row.get('materialId')?.value as string;
    if (!matId) return new Set();
    const mat = this.materialsCatalog().find((m) => m._id === matId);
    if (!mat?.dimensions) return new Set();
    return new Set(mat.dimensions.filter((d) => d.isImmutable).map((d) => d.type));
  }

  protected onCancel(): void {
    this.ref.close(null);
  }
}
