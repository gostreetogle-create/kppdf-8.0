import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormArray, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { TextareaComponent } from '../../shared/ui/textarea/textarea.component';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import {
  ProductModule,
  ProductModuleUpsertDto,
  ProductModulesService,
  WorkTypeInModule,
} from '../../shared/services/pi-product-modules.service';
import { WorkTypesService } from '../../shared/services/pi-work-types.service';
import { extractErrorMessage } from '../../core/silent-http';

/**
 * TZ-83 Phase C: ModuleFormDialog.
 *
 * Поля:
 *  - name (required)
 *  - article
 *  - dimensions.width / height / depth + unit
 *  - weight
 *  - notes (description)
 *  - workTypes[] — FormArray (workTypeId picker + estimatedHours + sortOrder)
 *
 * workTypes lookup происходит через WorkTypesService.list() на mount
 * (однократно), сохраняется в сигнале `workTypesCatalog`.
 */
@Component({
  selector: 'app-module-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    PiDialogComponent,
  ],
  template: `
    <app-pi-dialog [title]="isEdit ? 'Редактировать модуль' : 'Создать модуль'" [width]="'lg'">
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field overflow-y-auto min-h-0"
        data-test="module-form"
      >
        <div class="grid grid-cols-2 gap-form-field">
          <app-pi-form-field
            label="Название"
            htmlFor="mod-name"
            [required]="true"
            [error]="
              form.controls.name.invalid && form.controls.name.touched ? 'Обязательное поле' : ''
            "
          >
            <app-pi-input
              id="mod-name"
              formControlName="name"
              placeholder="Название модуля"
              [invalid]="form.controls.name.invalid && form.controls.name.touched"
              data-test="name-input"
            />
          </app-pi-form-field>
          <app-pi-form-field label="Артикул" htmlFor="mod-article">
            <app-pi-input
              id="mod-article"
              formControlName="article"
              placeholder="Артикул"
              data-test="article-input"
            />
          </app-pi-form-field>
        </div>

        <div>
          <p class="eyebrow mb-form-row">Габариты модуля</p>
          <div class="grid grid-cols-4 gap-form-field">
            <app-pi-form-field label="Ширина" htmlFor="mod-width">
              <app-pi-input
                id="mod-width"
                type="number"
                formControlName="width"
                placeholder="0"
                data-test="dim-width"
              />
            </app-pi-form-field>
            <app-pi-form-field label="Высота" htmlFor="mod-height">
              <app-pi-input
                id="mod-height"
                type="number"
                formControlName="height"
                placeholder="0"
                data-test="dim-height"
              />
            </app-pi-form-field>
            <app-pi-form-field label="Глубина" htmlFor="mod-depth">
              <app-pi-input
                id="mod-depth"
                type="number"
                formControlName="depth"
                placeholder="0"
                data-test="dim-depth"
              />
            </app-pi-form-field>
            <app-pi-form-field label="Ед." htmlFor="mod-dim-unit">
              <app-pi-input
                id="mod-dim-unit"
                formControlName="unit"
                placeholder="мм"
                data-test="dim-unit"
              />
            </app-pi-form-field>
          </div>
        </div>

        <app-pi-form-field label="Вес (кг)" htmlFor="mod-weight">
          <app-pi-input
            id="mod-weight"
            type="number"
            formControlName="weight"
            placeholder="0"
            data-test="weight-input"
          />
        </app-pi-form-field>

        <app-pi-form-field label="Заметки / описание" htmlFor="mod-notes">
          <app-pi-textarea
            id="mod-notes"
            [rows]="3"
            formControlName="notes"
            data-test="notes-input"
          />
        </app-pi-form-field>

        <div>
          <div class="flex items-baseline justify-between mb-form-row">
            <p class="eyebrow">Виды работ в составе</p>
            <app-pi-button
              type="button"
              variant="outline"
              size="sm"
              (click)="addWorkType()"
              data-test="wt-add"
            >
              + Добавить вид работы
            </app-pi-button>
          </div>
          <div formArrayName="workTypes" class="space-y-2">
            @for (ctrl of workTypesArray.controls; track $index) {
              <div
                [formGroupName]="$index"
                class="grid grid-cols-12 gap-2 items-end p-2 hairline rounded-sm bg-paper-2/30"
              >
                <label class="block col-span-6">
                  <span class="eyebrow block mb-1.5">Вид работы</span>
                  <select
                    class="pi-input w-full"
                    formControlName="workTypeId"
                    data-test="wt-select"
                  >
                    <option value="">— не выбрано —</option>
                    @for (wt of workTypesCatalog(); track wt._id) {
                      <option [value]="wt._id">{{ wt.name }}</option>
                    }
                  </select>
                </label>
                <label class="block col-span-3">
                  <span class="eyebrow block mb-1.5">Норма (ч)</span>
                  <app-pi-input
                    type="number"
                    formControlName="estimatedHours"
                    placeholder="0"
                    data-test="wt-hours"
                  />
                </label>
                <label class="block col-span-2">
                  <span class="eyebrow block mb-1.5">Сорт.</span>
                  <app-pi-input
                    type="number"
                    formControlName="sortOrder"
                    placeholder="0"
                    data-test="wt-sort"
                  />
                </label>
                <app-pi-button
                  type="button"
                  variant="destructive"
                  size="icon"
                  (click)="removeWorkType($index)"
                  aria-label="Удалить строку"
                >
                  ×
                </app-pi-button>
              </div>
            }
          </div>
        </div>

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
          {{ submitting() ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Создать' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class ModuleFormDialogComponent {
  // TZ-83 cleanup: use proper token exports — DialogRef (not PiDialogRef),
  // PI_DIALOG_DATA / PI_DIALOG_REF. DialogRef already exists as exported
  // interface in pi-dialog.service.ts.
  protected readonly ref = inject<DialogRef<ProductModule | null>>(PI_DIALOG_REF);
  protected readonly data = inject<ProductModule | null>(PI_DIALOG_DATA);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly modules = inject(ProductModulesService);
  private readonly workTypes = inject(WorkTypesService);
  private readonly toast = inject(PiToastService);

  protected readonly isEdit = this.data != null;
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly workTypesCatalog = signal<{ _id: string; name: string }[]>([]);

  protected readonly form = this.fb.group({
    name: this.fb.control<string>(this.data?.name ?? '', [
      Validators.required,
      Validators.maxLength(200),
    ]),
    article: this.fb.control<string>(this.data?.article ?? ''),
    dimensions: this.fb.group({
      width: this.fb.control<number | null>(this.data?.dimensions?.width ?? null),
      height: this.fb.control<number | null>(this.data?.dimensions?.height ?? null),
      depth: this.fb.control<number | null>(this.data?.dimensions?.depth ?? null),
      unit: this.fb.control<string>(this.data?.dimensions?.unit ?? 'мм'),
    }),
    weight: this.fb.control<number | null>(this.data?.weight ?? null),
    notes: this.fb.control<string>(''),
    workTypes: this.fb.array(
      (this.data?.workTypes ?? []).map((wt) =>
        this.fb.group({
          workTypeId: this.fb.control<string>(
            typeof wt.workTypeId === 'string' ? wt.workTypeId : wt.workTypeId._id,
            [Validators.required],
          ),
          estimatedHours: this.fb.control<number>(wt.estimatedHours ?? 0),
          sortOrder: this.fb.control<number>(wt.sortOrder ?? 0),
        }),
      ),
    ),
  });

  // Plain getter (not computed) — we need the FormArray ref itself; @for {@for (ctrl of workTypesArray.controls; ...)}
  // reads `.controls` from the FormArray, NOT from a Signal.
  protected get workTypesArray(): FormArray {
    return this.form.controls.workTypes as FormArray;
  }

  constructor() {
    this.workTypes.list({ activeOnly: true }).subscribe((res) => {
      if (res.ok) {
        this.workTypesCatalog.set(res.data.items.map((w) => ({ _id: w._id, name: w.name })));
      }
    });
  }

  protected addWorkType(): void {
    (this.form.controls.workTypes as FormArray).push(
      this.fb.group({
        workTypeId: this.fb.control<string>('', [Validators.required]),
        estimatedHours: this.fb.control<number>(0),
        sortOrder: this.fb.control<number>(0),
      }),
    );
  }

  protected removeWorkType(idx: number): void {
    (this.form.controls.workTypes as FormArray).removeAt(idx);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const workTypesRaw = v.workTypes ?? [];
    const payload: ProductModuleUpsertDto = {
      name: v.name,
      article: v.article || undefined,
      dimensions: {
        width: v.dimensions.width ?? undefined,
        height: v.dimensions.height ?? undefined,
        depth: v.dimensions.depth ?? undefined,
        unit: v.dimensions.unit || undefined,
      },
      weight: v.weight ?? undefined,
      workTypes: workTypesRaw.map((w, i): WorkTypeInModule => ({
        workTypeId: w.workTypeId,
        estimatedHours: w.estimatedHours,
        sortOrder: w.sortOrder ?? i,
      })),
    };
    this.submitting.set(true);
    const op = this.isEdit
      ? this.modules.update(this.data!._id, payload)
      : this.modules.create(payload);
    op.subscribe((res) => {
      this.submitting.set(false);
      if (res.ok) {
        this.toast.success(this.isEdit ? 'Модуль обновлён' : 'Модуль создан');
        this.ref.close(res.data ?? null);
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
