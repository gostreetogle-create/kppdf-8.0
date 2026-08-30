import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  MATERIAL_KINDS,
  PiMaterialsService,
  PiUnitsService,
  type CreateMaterialPayload,
  type Material,
  type MaterialDimensionType,
  type MaterialKind,
  type Unit,
} from '@kppdf/data-access';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';
import { TextareaComponent } from '@kppdf/ui/textarea';
import { PiFormSectionComponent } from '@kppdf/ui/form-section';
import { extractErrorMessage } from '@kppdf/util-http';
import { formatMaterialKind } from '../data/material-formatters';
import { CompositionPanelComponent } from '../../composition/composition-panel.component';

const DIMENSION_TYPES: { value: MaterialDimensionType; label: string }[] = [
  { value: 'length', label: 'Длина' },
  { value: 'width', label: 'Ширина' },
  { value: 'height', label: 'Высота' },
  { value: 'thickness', label: 'Толщина' },
  { value: 'diameter', label: 'Диаметр' },
  { value: 'depth', label: 'Глубина' },
];

const DETAIL_KINDS: MaterialKind[] = ['part', 'fastener', 'purchased', 'other'];

export interface MaterialFormDialogData {
  readonly mode: 'create' | 'edit';
  readonly material?: Material | null;
  readonly lockMaterialKind?: MaterialKind;
  readonly allowKindSelect?: boolean;
  readonly entityLabel?: string;
}

type DimensionGroup = FormGroup<{
  type: FormControl<MaterialDimensionType>;
  value: FormControl<number>;
  isImmutable: FormControl<boolean>;
}>;

@Component({
  selector: 'pi-material-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    PiFormSectionComponent,
    CompositionPanelComponent,
  ],
  template: `
    <app-pi-dialog
      [title]="dialogTitle()"
      variant="content"
      [maxWidth]="'min(1120px, calc(100vw - 2rem))'"
      [showClose]="true"
    >
      <form body [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" data-test="material-form">
        <app-pi-form-section title="Основные данные" headingId="mat-form-basics" tone="gold">
          <div class="grid md:grid-cols-12 gap-form-field">
            <app-pi-form-field
              label="Название"
              htmlFor="mat-name"
              [required]="true"
              [error]="fieldError('name')"
              class="md:col-span-8"
            >
              <app-pi-input id="mat-name" formControlName="name" [invalid]="invalid('name')" />
            </app-pi-form-field>

            <app-pi-form-field
              label="Артикул"
              htmlFor="mat-article"
              [required]="true"
              [error]="fieldError('article')"
              class="md:col-span-4"
            >
              <app-pi-input id="mat-article" formControlName="article" [invalid]="invalid('article')" />
            </app-pi-form-field>

            <app-pi-form-field
              label="Единица"
              htmlFor="mat-unit"
              [required]="true"
              [error]="fieldError('unit')"
              class="md:col-span-3"
            >
              <select id="mat-unit" formControlName="unit" class="pi-input w-full" data-test="mat-unit">
                <option value="" disabled>— выберите —</option>
                @for (u of units(); track u.key) {
                  <option [value]="u.key">{{ u.label }}{{ u.symbol ? ' (' + u.symbol + ')' : '' }}</option>
                }
              </select>
            </app-pi-form-field>

            <app-pi-form-field label="Внутр. код" htmlFor="mat-sku" class="md:col-span-3">
              <app-pi-input id="mat-sku" formControlName="sku" />
            </app-pi-form-field>

            @if (showKindSelect()) {
              <app-pi-form-field label="Вид" htmlFor="mat-kind" class="md:col-span-3">
                <select
                  id="mat-kind"
                  formControlName="materialKind"
                  class="pi-input w-full"
                  data-test="material-kind-select"
                >
                  @for (k of kindOptions(); track k) {
                    <option [value]="k">{{ formatKind(k) }}</option>
                  }
                </select>
              </app-pi-form-field>
            }

            <app-pi-form-field label="Категория (ID)" htmlFor="mat-category" class="md:col-span-6">
              <app-pi-input id="mat-category" formControlName="categoryId" placeholder="MongoDB ObjectId" />
            </app-pi-form-field>

            <app-pi-form-field label="Цена, ₽" htmlFor="mat-price" class="md:col-span-3">
              <app-pi-input id="mat-price" type="number" formControlName="pricePerUnit" />
            </app-pi-form-field>

            <app-pi-form-field label="Масса, кг" htmlFor="mat-weight" class="md:col-span-3">
              <app-pi-input id="mat-weight" type="number" formControlName="weightKg" />
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        <app-pi-form-section title="Справочные поля" headingId="mat-form-ref" tone="neutral">
          <div class="grid md:grid-cols-12 gap-form-field">
            <app-pi-form-field label="Сортамент" htmlFor="mat-assortment" class="md:col-span-4">
              <app-pi-input id="mat-assortment" formControlName="assortment" />
            </app-pi-form-field>
            <app-pi-form-field label="Стандарт" htmlFor="mat-standard" class="md:col-span-4">
              <app-pi-input id="mat-standard" formControlName="standardRef" />
            </app-pi-form-field>
            <app-pi-form-field label="Марка" htmlFor="mat-grade" class="md:col-span-4">
              <app-pi-input id="mat-grade" formControlName="materialGrade" />
            </app-pi-form-field>
            <app-pi-form-field
              label="Цвета (через запятую)"
              htmlFor="mat-colors"
              hint="Опции заказа у поставщика"
              class="md:col-span-12"
            >
              <app-pi-input id="mat-colors" formControlName="colorsText" />
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        <app-pi-form-section title="Описание" headingId="mat-form-notes" tone="neutral">
          <div class="grid md:grid-cols-2 gap-form-field">
            <app-pi-form-field label="Описание" htmlFor="mat-description">
              <app-pi-textarea id="mat-description" formControlName="description" [rows]="2" />
            </app-pi-form-field>
            <app-pi-form-field label="Заметки" htmlFor="mat-notes">
              <app-pi-textarea id="mat-notes" formControlName="notes" [rows]="2" />
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        <app-pi-form-section title="Габариты" headingId="mat-form-dims" tone="dimensions">
          <div class="mb-2">
            <app-pi-button type="button" variant="outline" size="sm" (click)="addDimension()" data-test="add-dimension">
              + Добавить размер
            </app-pi-button>
          </div>
          <div formArrayName="dimensions" class="space-y-2">
            @for (group of dimensionsArray.controls; track $index; let i = $index) {
              <div [formGroupName]="i" class="grid grid-cols-12 gap-2 items-center" [attr.data-test]="'dimension-row-' + i">
                <select formControlName="type" class="pi-input col-span-4 text-xs">
                  @for (opt of dimensionTypes; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
                <app-pi-input type="number" formControlName="value" class="col-span-3" />
                <label class="col-span-4 text-xs inline-flex items-center gap-2">
                  <input type="checkbox" formControlName="isImmutable" />
                  Неизменяемый
                </label>
                <app-pi-button
                  type="button"
                  variant="destructive"
                  size="icon"
                  [attr.aria-label]="'Удалить размер ' + (i + 1)"
                  (click)="removeDimension(i)"
                  >×</app-pi-button
                >
              </div>
            }
          </div>
        </app-pi-form-section>

        @if (isDetailForm()) {
          @if (savedId(); as id) {
            <pi-composition-panel parentKind="material" [entityId]="id" data-test="detail-bom-composition" />
          } @else {
            <p class="text-sm text-muted-foreground" data-test="detail-bom-create-hint">
              Сохраните деталь, чтобы указать материалы (сырьё).
            </p>
          }
        }

        @if (errorMessage()) {
          <p role="alert" class="text-xs text-destructive" data-test="material-form-error">{{ errorMessage() }}</p>
        }
      </form>

      <div footer class="flex gap-3 justify-end">
        <app-pi-button type="button" variant="default" [disabled]="submitting()" (click)="onSubmit()" data-test="material-form-save">
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
        <app-pi-button type="button" variant="outline" (click)="onCancel()" data-test="material-form-cancel">
          Отмена
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class MaterialFormDialogComponent implements OnInit {
  protected readonly dimensionTypes = DIMENSION_TYPES;
  protected readonly formatKind = formatMaterialKind;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly materialsService = inject(PiMaterialsService);
  private readonly unitsService = inject(PiUnitsService);
  private readonly data = inject<MaterialFormDialogData>(PI_DIALOG_DATA);
  private readonly ref = inject<DialogRef<Material | null | undefined>>(PI_DIALOG_REF);

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly units = signal<Unit[]>([]);
  protected readonly savedId = signal<string | null>(null);
  protected readonly mode = signal<'create' | 'edit'>(this.data.mode);
  private materialEntity = signal<Material | undefined>(undefined);

  protected readonly isDetailForm = computed(
    () => this.data.lockMaterialKind === 'part' || this.data.entityLabel === 'деталь',
  );

  protected readonly dialogTitle = computed(() => {
    const label = this.data.entityLabel ?? 'материал';
    return this.data.mode === 'edit' ? `Редактировать ${label}` : `Создать ${label}`;
  });

  protected readonly showKindSelect = computed(
    () => this.data.allowKindSelect === true && !this.data.lockMaterialKind,
  );

  protected readonly kindOptions = computed(() => {
    if (this.data.lockMaterialKind) return [this.data.lockMaterialKind];
    return DETAIL_KINDS;
  });

  protected readonly form = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.maxLength(256)]),
    article: this.fb.control('', [Validators.required, Validators.maxLength(64)]),
    unit: this.fb.control('', [Validators.required, Validators.maxLength(32)]),
    sku: this.fb.control(''),
    materialKind: this.fb.control<MaterialKind>('part'),
    categoryId: this.fb.control(''),
    pricePerUnit: this.fb.control<number | null>(null),
    weightKg: this.fb.control<number | null>(null),
    assortment: this.fb.control(''),
    standardRef: this.fb.control(''),
    materialGrade: this.fb.control(''),
    colorsText: this.fb.control(''),
    description: this.fb.control(''),
    notes: this.fb.control(''),
    dimensions: this.fb.array<DimensionGroup>([]),
  });

  get dimensionsArray(): FormArray<DimensionGroup> {
    return this.form.controls.dimensions;
  }

  ngOnInit(): void {
    void this.loadUnits();
    if (this.data.lockMaterialKind) {
      this.form.controls.materialKind.setValue(this.data.lockMaterialKind);
      this.form.controls.materialKind.disable();
    }
    if (this.data.material) {
      this.savedId.set(this.data.material._id);
      this.materialEntity.set(this.data.material);
      this.patchMaterial(this.data.material);
    } else if (this.data.lockMaterialKind) {
      this.form.controls.materialKind.setValue(this.data.lockMaterialKind);
    }
  }

  protected invalid(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }

  protected fieldError(name: keyof typeof this.form.controls): string {
    const c = this.form.controls[name];
    if (!c.invalid || (!c.dirty && !c.touched)) return '';
    if (c.errors?.['required']) return 'Обязательное поле';
    if (c.errors?.['maxlength']) return 'Слишком длинное значение';
    return 'Некорректное значение';
  }

  protected addDimension(): void {
    const used = new Set(this.dimensionsArray.controls.map((g) => g.controls.type.value));
    const next = DIMENSION_TYPES.find((t) => !used.has(t.value))?.value ?? 'length';
    this.dimensionsArray.push(this.createDimensionGroup(next, 0, false));
  }

  protected removeDimension(index: number): void {
    this.dimensionsArray.removeAt(index);
  }

  protected onCancel(): void {
    this.ref.close(undefined);
  }

  protected async onSubmit(): Promise<void> {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    this.submitting.set(true);
    this.errorMessage.set(null);

    const editId = this.materialEntity()?._id ?? this.data.material?._id;
    const res =
      this.mode() === 'edit' && editId
        ? await firstValueFrom(this.materialsService.update(editId, payload))
        : await firstValueFrom(this.materialsService.create(payload));

    this.submitting.set(false);

    if (!res.ok) {
      this.errorMessage.set(extractErrorMessage(res.error));
      return;
    }

    this.savedId.set(res.data._id);
    this.materialEntity.set(res.data);
    this.mode.set('edit');
    this.form.markAsPristine();

    if (this.data.mode === 'edit' || !this.isDetailForm()) {
      this.ref.close(res.data);
    }
  }

  private async loadUnits(): Promise<void> {
    const res = await firstValueFrom(this.unitsService.list({ limit: 100, isActive: true }));
    if (res.ok) {
      this.units.set(res.data.items.filter((u) => u.isActive));
    }
  }

  private patchMaterial(m: Material): void {
    const patch: {
      name: string;
      article: string;
      unit: string;
      sku: string;
      materialKind?: MaterialKind;
      categoryId: string;
      pricePerUnit: number | null;
      weightKg: number | null;
      assortment: string;
      standardRef: string;
      materialGrade: string;
      colorsText: string;
      description: string;
      notes: string;
    } = {
      name: m.name,
      article: m.article ?? '',
      unit: m.unit,
      sku: m.sku ?? '',
      categoryId: refId(m.categoryId) ?? '',
      pricePerUnit: m.pricePerUnit ?? null,
      weightKg: m.weightKg ?? null,
      assortment: m.assortment ?? '',
      standardRef: m.standardRef ?? '',
      materialGrade: m.materialGrade ?? '',
      colorsText: (m.colors ?? []).join(', '),
      description: m.description ?? '',
      notes: m.notes ?? '',
    };
    if (!this.data.lockMaterialKind) {
      patch.materialKind =
        m.materialKind && (MATERIAL_KINDS as readonly string[]).includes(m.materialKind)
          ? m.materialKind
          : 'part';
    }
    this.form.patchValue(patch);
    if (this.data.lockMaterialKind) {
      this.form.controls.materialKind.setValue(this.data.lockMaterialKind);
      this.form.controls.materialKind.disable();
    }
    this.dimensionsArray.clear();
    for (const d of m.dimensions ?? []) {
      this.dimensionsArray.push(this.createDimensionGroup(d.type, d.value, !!d.isImmutable));
    }
  }

  private createDimensionGroup(
    type: MaterialDimensionType,
    value: number,
    isImmutable: boolean,
  ): DimensionGroup {
    return this.fb.group({
      type: this.fb.control(type, Validators.required),
      value: this.fb.control(value, [Validators.required, Validators.min(0)]),
      isImmutable: this.fb.control(isImmutable),
    });
  }

  private buildPayload(): CreateMaterialPayload {
    const v = this.form.getRawValue();
    const payload: CreateMaterialPayload = {
      name: v.name.trim(),
      article: v.article.trim(),
      unit: v.unit,
    };
    if (v.sku?.trim()) payload.sku = v.sku.trim();
    if (v.materialKind) payload.materialKind = v.materialKind;
    if (v.categoryId?.trim()) payload.categoryId = v.categoryId.trim();
    if (v.pricePerUnit != null && v.pricePerUnit !== ('' as unknown)) {
      payload.pricePerUnit = Number(v.pricePerUnit);
    }
    if (v.weightKg != null && v.weightKg !== ('' as unknown)) payload.weightKg = Number(v.weightKg);
    if (v.assortment?.trim()) payload.assortment = v.assortment.trim();
    if (v.standardRef?.trim()) payload.standardRef = v.standardRef.trim();
    if (v.materialGrade?.trim()) payload.materialGrade = v.materialGrade.trim();
    const colors = v.colorsText
      ?.split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (colors?.length) payload.colors = colors;
    if (v.description?.trim()) payload.description = v.description.trim();
    if (v.notes?.trim()) payload.notes = v.notes.trim();
    const dimensions = v.dimensions.map((d) => ({
      type: d.type,
      value: Number(d.value),
      isImmutable: d.isImmutable,
    }));
    if (dimensions.length) payload.dimensions = dimensions;
    return payload;
  }
}

function refId(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && '_id' in value) {
    return refId((value as { _id: unknown })._id);
  }
  return null;
}
