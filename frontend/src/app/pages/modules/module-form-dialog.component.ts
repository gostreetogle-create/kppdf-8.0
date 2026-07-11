import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
  imports: [ReactiveFormsModule, ButtonComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid gap-4" data-test="module-form">
      <p class="eyebrow text-muted-foreground">{{ isEdit ? 'Редактирование' : 'Создание' }} модуля</p>

      <div class="grid grid-cols-2 gap-3">
        <label class="block">
          <span class="eyebrow block mb-1.5">Название <span class="text-destructive">*</span></span>
          <input
            id="mod-name"
            type="text"
            formControlName="name"
            autocomplete="off"
            maxlength="200"
            data-test="name-input"
            class="pi-input w-full"
          />
        </label>
        <label class="block">
          <span class="eyebrow block mb-1.5">Артикул</span>
          <input
            id="mod-article"
            type="text"
            formControlName="article"
            autocomplete="off"
            maxlength="100"
            data-test="article-input"
            class="pi-input w-full font-mono"
          />
        </label>
      </div>

      <fieldset formGroupName="dimensions" class="hairline rounded-sm p-3">
        <legend class="eyebrow mb-2 px-1">Габариты модуля</legend>
        <div class="grid grid-cols-4 gap-2">
          <label class="block">
            <span class="eyebrow block mb-1.5">Ширина</span>
            <input id="mod-width" type="number" step="0.01" formControlName="width"
              data-test="dim-width" class="pi-input w-full font-mono" />
          </label>
          <label class="block">
            <span class="eyebrow block mb-1.5">Высота</span>
            <input id="mod-height" type="number" step="0.01" formControlName="height"
              data-test="dim-height" class="pi-input w-full font-mono" />
          </label>
          <label class="block">
            <span class="eyebrow block mb-1.5">Глубина</span>
            <input id="mod-depth" type="number" step="0.01" formControlName="depth"
              data-test="dim-depth" class="pi-input w-full font-mono" />
          </label>
          <label class="block">
            <span class="eyebrow block mb-1.5">Ед.</span>
            <input id="mod-dim-unit" type="text" formControlName="unit"
              data-test="dim-unit" class="pi-input w-full" />
          </label>
        </div>
      </fieldset>

      <label class="block">
        <span class="eyebrow block mb-1.5">Вес (кг)</span>
        <input id="mod-weight" type="number" step="0.01" min="0" formControlName="weight"
          data-test="weight-input" class="pi-input w-full font-mono" />
      </label>

      <label class="block">
        <span class="eyebrow block mb-1.5">Заметки / описание</span>
        <textarea id="mod-notes" rows="3" formControlName="notes"
          data-test="notes-input" class="pi-input w-full"></textarea>
      </label>

      <fieldset class="hairline rounded-sm p-3">
        <legend class="eyebrow mb-2 px-1">Виды работ в составе</legend>
        <div formArrayName="workTypes" class="grid gap-2">
          @for (ctrl of workTypesArray.controls; track $index) {
            <div [formGroupName]="$index" class="grid grid-cols-12 gap-2 items-end">
              <label class="block col-span-6">
                <span class="eyebrow block mb-1.5">Вид работы</span>
                <select class="pi-input w-full" formControlName="workTypeId" data-test="wt-select">
                  <option value="">— не выбрано —</option>
                  @for (wt of workTypesCatalog(); track wt._id) {
                    <option [value]="wt._id">{{ wt.name }}</option>
                  }
                </select>
              </label>
              <label class="block col-span-3">
                <span class="eyebrow block mb-1.5">Норма (ч)</span>
                <input type="number" step="0.01" min="0" formControlName="estimatedHours"
                  data-test="wt-hours" class="pi-input w-full font-mono" />
              </label>
              <label class="block col-span-2">
                <span class="eyebrow block mb-1.5">Сорт.</span>
                <input type="number" formControlName="sortOrder"
                  data-test="wt-sort" class="pi-input w-full font-mono" />
              </label>
              <button type="button" (click)="removeWorkType($index)"
                class="col-span-1 px-2 py-1.5 hairline border-destructive text-destructive rounded-sm hover:bg-destructive hover:text-paper"
                aria-label="Удалить строку">
                ×
              </button>
            </div>
          }
        </div>
        <button type="button" (click)="addWorkType()" data-test="wt-add"
          class="mt-2 px-3 py-1.5 hairline rounded-sm text-sm hover:bg-paper-2">
          + Добавить вид работы
        </button>
      </fieldset>

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
          {{ submitting() ? 'Сохранение…' : (isEdit ? 'Сохранить' : 'Создать') }}
        </app-pi-button>
      </div>
    </form>
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
    name: this.fb.control<string>(this.data?.name ?? '', [Validators.required, Validators.maxLength(200)]),
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
      (this.data?.workTypes ?? []).map((wt) => this.fb.group({
        workTypeId: this.fb.control<string>(
          typeof wt.workTypeId === 'string' ? wt.workTypeId : wt.workTypeId._id,
          [Validators.required],
        ),
        estimatedHours: this.fb.control<number>(wt.estimatedHours ?? 0),
        sortOrder: this.fb.control<number>(wt.sortOrder ?? 0),
      })),
    ),
  });

  protected readonly workTypesArray = computed(() => this.form.controls.workTypes as FormArray);

  constructor() {
    this.workTypes.list({ activeOnly: true }).subscribe((res) => {
      if (res.ok) {
        this.workTypesCatalog.set(
          res.data.items.map((w) => ({ _id: w._id, name: w.name })),
        );
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
