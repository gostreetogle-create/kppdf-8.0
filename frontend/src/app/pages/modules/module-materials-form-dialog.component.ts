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
  ProductModule,
  ProductModulesService,
} from '../../shared/services/pi-product-modules.service';
import {
  Material,
  MATERIAL_KIND_LABELS,
  MaterialsService,
} from '../../shared/services/materials.service';
import { extractErrorMessage, SilentResult } from '../../core/silent-http';
import { forkJoin, Observable } from 'rxjs';

type CompositionRow = {
  lineId?: string;
  lineType: 'material' | 'module';
  materialId: string;
  moduleId: string;
  quantity: number;
  unit: string;
  isPurchased: boolean;
  sortOrder: number;
  overrideDimensions?: { length?: number; width?: number; height?: number; unit?: string };
};

/**
 * Module composition editor (TZ-CATALOG-320).
 * Materials remain catalog leaves classified by materialKind; child modules
 * use the same canonical composition endpoint and cannot reference the parent.
 */
@Component({
  selector: 'app-module-materials-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent, PiDialogComponent],
  template: `
    <app-pi-dialog title="Состав модуля" [width]="'xl'">
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field overflow-y-auto min-h-0"
        data-test="materials-form"
      >
        <div formArrayName="composition" class="space-y-3">
          @for (ctrl of compositionArray.controls; track $index) {
            <div [formGroupName]="$index" class="p-3 hairline rounded-sm bg-paper-2/30">
              <div class="grid grid-cols-12 gap-2 items-start">
                <label class="block col-span-2">
                  <span class="eyebrow block mb-1.5">Тип</span>
                  <select class="pi-input w-full" formControlName="lineType" data-test="line-type">
                    <option value="material">Материал</option>
                    <option value="module">Модуль</option>
                  </select>
                </label>
                @if (compositionArray.at($index).get('lineType')?.value === 'module') {
                  <label class="block col-span-5">
                    <span class="eyebrow block mb-1.5">Дочерний модуль *</span>
                    <select
                      class="pi-input w-full"
                      formControlName="moduleId"
                      data-test="module-select"
                    >
                      <option value="">— выбрать модуль —</option>
                      @for (child of childModules(); track child._id) {
                        <option [value]="child._id">
                          {{ child.name }} · {{ child.article ?? '—' }}
                        </option>
                      }
                    </select>
                  </label>
                } @else {
                  <label class="block col-span-5">
                    <span class="eyebrow block mb-1.5">Материал *</span>
                    <select
                      class="pi-input w-full"
                      formControlName="materialId"
                      data-test="mat-select"
                    >
                      <option value="">— выбрать материал —</option>
                      @for (m of materialsCatalog(); track m._id) {
                        <option [value]="m._id">{{ m.name }} · {{ materialKindLabel(m) }}</option>
                      }
                    </select>
                  </label>
                }
                <label class="block col-span-2">
                  <span class="eyebrow block mb-1.5">Кол-во *</span>
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
                <app-pi-button
                  type="button"
                  variant="destructive"
                  size="icon"
                  (click)="removeRow($index)"
                  aria-label="Удалить строку"
                >
                  ×
                </app-pi-button>
              </div>

              @if (compositionArray.at($index).get('lineType')?.value === 'material') {
                <div class="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <input type="checkbox" formControlName="isPurchased" data-test="mat-purchased" />
                  <span>Закупка (контекст линии)</span>
                </div>
                <div
                  formGroupName="overrideDimensions"
                  class="mt-3 grid grid-cols-12 gap-2 items-end"
                >
                  <span class="col-span-12 eyebrow text-muted-foreground"
                    >Override-габариты (необязательно)</span
                  >
                  <label class="block col-span-2"
                    ><span class="eyebrow block mb-1.5">Длина</span
                    ><app-pi-input type="number" formControlName="length" placeholder="0"
                  /></label>
                  <label class="block col-span-2"
                    ><span class="eyebrow block mb-1.5">Ширина</span
                    ><app-pi-input type="number" formControlName="width" placeholder="0"
                  /></label>
                  <label class="block col-span-2"
                    ><span class="eyebrow block mb-1.5">Высота</span
                    ><app-pi-input type="number" formControlName="height" placeholder="0"
                  /></label>
                  <label class="block col-span-3"
                    ><span class="eyebrow block mb-1.5">Ед.</span
                    ><app-pi-input formControlName="unit" placeholder="мм/см/м"
                  /></label>
                </div>
              }
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
          + Добавить строку
        </app-pi-button>
        @if (formError()) {
          <p role="alert" class="text-xs text-destructive">{{ formError() }}</p>
        }
      </form>

      <div footer class="flex gap-3">
        <app-pi-button variant="ghost" type="button" (click)="onCancel()" data-test="cancel-button"
          >Отмена</app-pi-button
        >
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
  protected readonly moduleCatalog = signal<ProductModule[]>([]);
  protected readonly materialKindLabels = MATERIAL_KIND_LABELS;
  private originalComposition: CompositionLine[] = [];

  protected readonly form = this.fb.group({
    composition: this.fb.array(this.seedRows().map((row) => this.rowGroup(row))),
  });

  private seedRows(): CompositionRow[] {
    const lines = this.data.composition ?? [];
    if (lines.length > 0) {
      this.originalComposition = lines;
      return lines.map((line) => ({
        lineId: line._id,
        lineType: line.lineType === 'module' ? 'module' : 'material',
        materialId: line.lineType === 'material' ? line.refId : '',
        moduleId: line.lineType === 'module' ? line.refId : '',
        quantity: line.quantity ?? 1,
        unit: line.unit ?? 'шт',
        isPurchased: line.lineType === 'material' ? (line.isPurchased ?? true) : true,
        sortOrder: line.sortOrder ?? 0,
        overrideDimensions: line.lineType === 'material' ? line.overrideDimensions : undefined,
      }));
    }
    return (this.data.materials ?? []).map((material, index) => ({
      lineType: 'material',
      materialId:
        typeof material.materialId === 'string' ? material.materialId : material.materialId._id,
      moduleId: '',
      quantity: material.quantity ?? 1,
      unit: material.unit ?? 'шт',
      isPurchased: material.isPurchased ?? true,
      sortOrder: index,
      overrideDimensions: material.overrideDimensions,
    }));
  }

  protected get compositionArray(): FormArray {
    return this.form.controls.composition as FormArray;
  }

  constructor() {
    this.materialsSvc.list({ limit: 200 }).subscribe((res) => {
      if (res.ok) this.materialsCatalog.set(res.data.items);
    });
    this.modules.list().subscribe((res) => {
      if (res.ok) this.moduleCatalog.set(res.data);
    });
  }

  protected childModules(): ProductModule[] {
    return this.moduleCatalog().filter((module) => module._id !== this.data.moduleId);
  }

  protected materialKindLabel(material: Material): string {
    return material.materialKind
      ? (MATERIAL_KIND_LABELS[material.materialKind] ?? material.materialKind)
      : 'тип не указан';
  }

  private rowGroup(row: CompositionRow) {
    return this.fb.group({
      lineId: this.fb.control<string | null>(row.lineId ?? null),
      lineType: this.fb.control<'material' | 'module'>(row.lineType, Validators.required),
      materialId: this.fb.control<string>(row.materialId),
      moduleId: this.fb.control<string>(row.moduleId),
      quantity: this.fb.control<number>(row.quantity, [
        Validators.required,
        Validators.min(0.0001),
      ]),
      unit: this.fb.control<string>(row.unit),
      isPurchased: this.fb.control<boolean>(row.isPurchased),
      sortOrder: this.fb.control<number>(row.sortOrder),
      overrideDimensions: this.fb.group({
        length: this.fb.control<number | null>(row.overrideDimensions?.length ?? null),
        width: this.fb.control<number | null>(row.overrideDimensions?.width ?? null),
        height: this.fb.control<number | null>(row.overrideDimensions?.height ?? null),
        unit: this.fb.control<string>(row.overrideDimensions?.unit ?? ''),
      }),
    });
  }

  protected addRow(): void {
    this.compositionArray.push(
      this.rowGroup({
        lineType: 'material',
        materialId: '',
        moduleId: '',
        quantity: 1,
        unit: 'шт',
        isPurchased: true,
        sortOrder: this.compositionArray.length,
      }),
    );
  }

  protected removeRow(index: number): void {
    this.compositionArray.removeAt(index);
  }

  private rowValue(index: number): CompositionRow {
    const value = this.compositionArray.at(index).getRawValue();
    const dimensions = value.overrideDimensions;
    const hasDimensions =
      dimensions.length != null ||
      dimensions.width != null ||
      dimensions.height != null ||
      !!dimensions.unit?.trim();
    return {
      lineId: value.lineId ?? undefined,
      lineType: value.lineType,
      materialId: value.materialId,
      moduleId: value.moduleId,
      quantity: value.quantity,
      unit: value.unit,
      isPurchased: value.isPurchased,
      sortOrder: index,
      overrideDimensions: hasDimensions ? dimensions : undefined,
    };
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const rows = this.compositionArray.controls.map((_, index) => this.rowValue(index));
    const invalid = rows.find((row) =>
      row.lineType === 'module'
        ? !row.moduleId || row.moduleId === this.data.moduleId
        : !row.materialId,
    );
    if (invalid) {
      this.formError.set(
        invalid.lineType === 'module' && invalid.moduleId === this.data.moduleId
          ? 'Модуль не может содержать ссылку на самого себя.'
          : 'Выберите элемент для каждой строки состава.',
      );
      return;
    }
    const kept = new Set(rows.map((row) => row.lineId).filter((id): id is string => !!id));
    const calls: Observable<SilentResult<unknown>>[] = [];
    this.originalComposition.forEach((line) => {
      if (!kept.has(line._id))
        calls.push(this.modules.removeModuleCompositionLine(this.data.moduleId, line._id));
    });
    rows.forEach((row) => {
      const dto = {
        lineType: row.lineType,
        refId: row.lineType === 'module' ? row.moduleId : row.materialId,
        quantity: row.quantity,
        unit: row.unit || undefined,
        sortOrder: row.sortOrder,
        ...(row.lineType === 'material'
          ? { isPurchased: row.isPurchased, overrideDimensions: row.overrideDimensions }
          : {}),
      } as const;
      if (row.lineId) {
        calls.push(this.modules.updateModuleCompositionLine(this.data.moduleId, row.lineId, dto));
      } else {
        calls.push(this.modules.addModuleCompositionLine(this.data.moduleId, dto));
      }
    });
    const legacyMaterials: MaterialInModule[] = rows
      .filter((row) => row.lineType === 'material')
      .map((row) => ({
        materialId: row.materialId,
        quantity: row.quantity,
        unit: row.unit,
        isPurchased: row.isPurchased,
        sortOrder: row.sortOrder,
        overrideDimensions: row.overrideDimensions,
      }));
    this.submitting.set(true);
    if (calls.length === 0) {
      this.submitting.set(false);
      this.toast.success('Состав обновлён');
      this.ref.close({ materials: legacyMaterials });
      return;
    }
    forkJoin(calls).subscribe((result: SilentResult<unknown>[]) => {
      this.submitting.set(false);
      const ok = result.every((item) => item.ok);
      if (ok) {
        this.toast.success('Состав обновлён');
        this.ref.close({ materials: legacyMaterials });
      } else {
        const first = result.find((item) => !item.ok);
        const message =
          first && 'error' in first
            ? extractErrorMessage(first.error)
            : 'Не удалось обновить состав';
        this.formError.set(message);
        this.toast.error(message);
      }
    });
  }

  protected immutableDimsForIdx(index: number): Set<string> {
    const row = this.compositionArray.at(index);
    const materialId = row?.get('materialId')?.value as string | undefined;
    const material = materialId
      ? this.materialsCatalog().find((item) => item._id === materialId)
      : undefined;
    return material?.dimensions
      ? new Set(
          material.dimensions
            .filter((dimension) => dimension.isImmutable)
            .map((dimension) => dimension.type),
        )
      : new Set();
  }

  protected onCancel(): void {
    this.ref.close(null);
  }
}
