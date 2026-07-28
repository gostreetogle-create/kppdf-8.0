import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { TextareaComponent } from '../../shared/ui/textarea/textarea.component';

import { PiEntityFormComponent } from '../../shared/dsl/entity-form/pi-entity-form.component';
import { PI_DIALOG_DATA } from '../../shared/ui/dialog/dialog.tokens';

import {
  ProductModule,
  ProductModuleUpsertDto,
  ProductModulesService,
  WorkTypeInModule,
} from '../../shared/services/pi-product-modules.service';
import { WorkTypesService } from '../../shared/services/pi-work-types.service';

/**
 * TZ-232.G — ModuleFormDialog migrated onto `<pi-entity-form>`.
 *
 * The most complex of the 3 pilot migrations — proves that
 * FormArray is fully subsumed by the wrapper's `[fields]`
 * projection slot. The dialog still owns:
 *
 *  - FormGroup construction including nested `dimensions` group
 *    and `workTypes[]` FormArray
 *  - workTypes[] catalog fetch (lazy-loaded via WorkTypesService.list
 *    on dialog mount — needed for the `<select>` rows)
 *  - payloadFn that flattens the FormArray into the API's
 *    `WorkTypeInModule[]` shape expected by ProductModulesService
 *
 * Migrated boilerplate removed (vs TZ-83 reference):
 *  - Submitting signal / formError signal management
 *  - SubmitGuard wiring (now in wrapper)
 *  - Toast on save / error (now in wrapper)
 *  - ref.close() / markAllAsTouched (now in wrapper)
 *
 * Net change: ~370 LoC → ~210 LoC.
 */
@Component({
  selector: 'app-module-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    PiEntityFormComponent,
  ],
  template: `
    <app-pi-entity-form
      [mutator]="mutator"
      [endpoint]="'product-modules'"
      [title]="isEdit ? 'Редактировать модуль' : 'Создать модуль'"
      [formGroup]="form"
      [payloadFn]="payloadFn"
      [isEdit]="isEdit"
      [createSuccessMessage]="'Модуль создан'"
      [updateSuccessMessage]="'Модуль обновлён'"
      [width]="'lg'"
    >
      <div class="grid grid-cols-2 gap-form-field" fields>
        <app-pi-form-field label="Название" htmlFor="mod-name" [required]="true" [error]="nameError()">
          <app-pi-input
            id="mod-name"
            formControlName="name"
            placeholder="Название модуля"
            [invalid]="nameInvalid()"
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

      <div fields>
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

      <app-pi-form-field label="Вес (кг)" htmlFor="mod-weight" fields>
        <app-pi-input
          id="mod-weight"
          type="number"
          formControlName="weight"
          placeholder="0"
          data-test="weight-input"
        />
      </app-pi-form-field>

      <app-pi-form-field label="Заметки / описание" htmlFor="mod-notes" fields>
        <app-pi-textarea
          id="mod-notes"
          [rows]="3"
          formControlName="notes"
          data-test="notes-input"
        />
      </app-pi-form-field>

      <div fields>
        <div class="flex items-baseline justify-between mb-form-row">
          <p class="eyebrow">Виды работ в составе</p>
          <button
            type="button"
            class="pi-button pi-button-outline pi-size-sm"
            (click)="addWorkType()"
            data-test="wt-add"
          >
            + Добавить вид работы
          </button>
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
              <button
                type="button"
                class="pi-button pi-button-destructive pi-size-icon"
                (click)="removeWorkType($index)"
                aria-label="Удалить строку"
              >
                ×
              </button>
            </div>
          }
        </div>
      </div>
    </app-pi-entity-form>
  `,
})
export class ModuleFormDialogComponent {
  protected readonly data = inject<ProductModule | null>(PI_DIALOG_DATA);
  protected readonly mutator = inject(ProductModulesService);
  private readonly workTypes = inject(WorkTypesService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isEdit = this.data != null;
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

  protected get workTypesArray(): FormArray {
    return this.form.controls.workTypes as FormArray;
  }

  constructor() {
    this.workTypes
      .list({ activeOnly: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
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

  protected readonly payloadFn = (): ProductModuleUpsertDto => {
    const v = this.form.getRawValue();
    const workTypesRaw = v.workTypes ?? [];
    return {
      name: v.name,
      article: v.article || undefined,
      dimensions: {
        width: v.dimensions.width ?? undefined,
        height: v.dimensions.height ?? undefined,
        depth: v.dimensions.depth ?? undefined,
        unit: v.dimensions.unit || undefined,
      },
      weight: v.weight ?? undefined,
      workTypes: workTypesRaw.map(
        (w, i): WorkTypeInModule => ({
          workTypeId: w.workTypeId,
          estimatedHours: w.estimatedHours,
          sortOrder: w.sortOrder ?? i,
        }),
      ),
    };
  };

  protected readonly nameInvalid = (): boolean =>
    this.form.controls.name.invalid && this.form.controls.name.touched;
  protected readonly nameError = (): string =>
    this.form.controls.name.invalid && this.form.controls.name.touched
      ? 'Обязательное поле'
      : '';
}
