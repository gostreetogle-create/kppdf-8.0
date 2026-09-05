import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  OnInit,
  ViewChild,
  computed,
  inject,
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
  PiModulesService,
  PiWorkTypesService,
  type CreateProductModulePayload,
  type ProductModule,
  type ProductModuleWorkTypePayload,
  type WorkType,
} from '@kppdf/data-access';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogComponent, PiDialogService, PI_DIALOG_DATA, PI_DIALOG_REF } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';
import { PiFormSectionComponent } from '@kppdf/ui/form-section';
import { extractErrorMessage } from '@kppdf/util-http';
import { CompositionPanelComponent } from '../../composition/composition-panel.component';
import { scrollCompositionBlockIntoView } from '../../composition/composition-focus-scroll';
import { confirmDirtyClose } from '../../composition/dirty-dialog.guard';

export interface ModuleFormDialogData {
  mode: 'create' | 'edit';
  module?: ProductModule;
  focusComposition?: boolean;
}

@Component({
  selector: 'pi-module-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    PiFormSectionComponent,
    CompositionPanelComponent,
  ],
  template: `
    <app-pi-dialog
      [title]="dialogTitle()"
      variant="content"
      [maxWidth]="'min(1120px, calc(100vw - 2rem))'"
      [showClose]="true"
      (userClose)="onCancel()"
    >
      <form body [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" data-test="module-form">
        <app-pi-form-section title="Модуль" headingId="module-main" tone="gold">
          <div class="grid md:grid-cols-12 gap-form-field">
            <app-pi-form-field label="Название" htmlFor="mod-name" [required]="true" class="md:col-span-8">
              <app-pi-input id="mod-name" formControlName="name" />
            </app-pi-form-field>
            <app-pi-form-field label="Артикул" htmlFor="mod-article" [required]="true" class="md:col-span-4">
              <app-pi-input id="mod-article" formControlName="article" />
            </app-pi-form-field>
            <app-pi-form-field label="Ширина" htmlFor="mod-w" class="md:col-span-3">
              <app-pi-input id="mod-w" type="number" formControlName="width" />
            </app-pi-form-field>
            <app-pi-form-field label="Высота" htmlFor="mod-h" class="md:col-span-3">
              <app-pi-input id="mod-h" type="number" formControlName="height" />
            </app-pi-form-field>
            <app-pi-form-field label="Глубина" htmlFor="mod-d" class="md:col-span-3">
              <app-pi-input id="mod-d" type="number" formControlName="depth" />
            </app-pi-form-field>
            <app-pi-form-field label="Ед. габаритов" htmlFor="mod-dim-unit" class="md:col-span-3">
              <app-pi-input id="mod-dim-unit" formControlName="dimUnit" />
            </app-pi-form-field>
            <app-pi-form-field label="Вес" htmlFor="mod-weight" class="md:col-span-3">
              <app-pi-input id="mod-weight" type="number" formControlName="weight" />
            </app-pi-form-field>
            <app-pi-form-field label="Порядок" htmlFor="mod-sort" class="md:col-span-3">
              <app-pi-input id="mod-sort" type="number" formControlName="sortOrder" />
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        <app-pi-form-section title="Виды работ" headingId="module-work-types" tone="neutral">
          <div class="flex items-baseline justify-between gap-3 mb-form-row">
            <p class="text-sm text-muted-foreground">
              Длительность Ганта — «Дней» в строке модуля; норма, ч — только себестоимость. На заказе срок можно скорректировать на Ганте.
            </p>
            <app-pi-button type="button" variant="outline" size="sm" (click)="addWorkType()" data-test="module-work-type-add">
              + Добавить вид работы
            </app-pi-button>
          </div>
          <div formArrayName="workTypes" class="space-y-2" data-test="module-work-types">
            @for (group of workTypesArray.controls; track $index; let i = $index) {
              <div [formGroupName]="i" class="grid grid-cols-12 gap-2 items-end p-2 hairline rounded-sm bg-paper-2/30" [attr.data-test]="'module-work-type-row-' + i">
                <label class="block col-span-4">
                  <span class="eyebrow block mb-1.5">Вид работы</span>
                  <select formControlName="workTypeId" (change)="seedDaysFromCatalog(i)" class="pi-input w-full" [attr.aria-label]="'Вид работы ' + (i + 1)" data-test="module-work-type-select">
                    <option value="">— выберите —</option>
                    @for (workType of workTypes(); track workType._id) {
                      <option [value]="workType._id">{{ workType.name }}</option>
                    }
                  </select>
                </label>
                <app-pi-form-field label="Дней" [htmlFor]="'module-work-type-days-' + i" class="col-span-2">
                  <app-pi-input [id]="'module-work-type-days-' + i" type="number" formControlName="days" data-test="module-work-type-days" />
                </app-pi-form-field>
                <app-pi-form-field label="Норма, ч" [htmlFor]="'module-work-type-hours-' + i" class="col-span-2">
                  <app-pi-input [id]="'module-work-type-hours-' + i" type="number" formControlName="estimatedHours" data-test="module-work-type-hours" />
                </app-pi-form-field>
                <app-pi-form-field label="Порядок" [htmlFor]="'module-work-type-sort-' + i" class="col-span-2">
                  <app-pi-input [id]="'module-work-type-sort-' + i" type="number" formControlName="sortOrder" data-test="module-work-type-sort" />
                </app-pi-form-field>
                <div class="flex gap-1 col-span-2" role="group" [attr.aria-label]="'Порядок строки ' + (i + 1)">
                  <app-pi-button type="button" variant="outline" size="icon" [disabled]="i === 0" (click)="moveWorkType(i, -1)" [attr.aria-label]="'Поднять вид работы ' + (i + 1)" data-test="module-work-type-up">↑</app-pi-button>
                  <app-pi-button type="button" variant="outline" size="icon" [disabled]="i === workTypesArray.length - 1" (click)="moveWorkType(i, 1)" [attr.aria-label]="'Опустить вид работы ' + (i + 1)" data-test="module-work-type-down">↓</app-pi-button>
                  <app-pi-button type="button" variant="destructive" size="icon" (click)="removeWorkType(i)" [attr.aria-label]="'Удалить вид работы ' + (i + 1)" data-test="module-work-type-remove">×</app-pi-button>
                </div>
              </div>
            } @empty {
              <p class="text-sm text-muted-foreground" data-test="module-work-types-empty">Виды работ не добавлены.</p>
            }
          </div>
        </app-pi-form-section>

        @if (savedId(); as id) {
          <div
            #compositionBlock
            tabindex="-1"
            [attr.data-test]="focusComposition() ? 'module-composition-focus' : 'module-composition-block'"
          >
            <pi-composition-panel parentKind="module" [entityId]="id" />
          </div>
        } @else {
          <p class="text-sm text-muted-foreground" data-test="module-composition-create-hint">
            Сохраните модуль, чтобы редактировать состав.
          </p>
        }

        @if (errorMessage()) {
          <p role="alert" class="text-xs text-destructive" data-test="module-form-error">{{ errorMessage() }}</p>
        }
      </form>

      <div footer class="flex gap-3 justify-end sticky bottom-0 bg-paper">
        <app-pi-button type="button" variant="default" [disabled]="submitting()" (click)="onSubmit()" data-test="module-form-save">
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
        <app-pi-button type="button" variant="outline" (click)="onCancel()" data-test="module-form-cancel">Отмена</app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class ModuleFormDialogComponent implements OnInit, AfterViewInit {
  @ViewChild('compositionBlock') private compositionBlock?: ElementRef<HTMLElement>;
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly modulesService = inject(PiModulesService);
  private readonly workTypesService = inject(PiWorkTypesService);
  private readonly data = inject<ModuleFormDialogData>(PI_DIALOG_DATA);
  private readonly ref = inject<DialogRef<ProductModule | null | undefined>>(PI_DIALOG_REF);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly savedId = signal<string | null>(null);
  protected readonly focusComposition = signal(!!this.data.focusComposition);

  protected readonly mode = signal<'create' | 'edit'>(this.data.mode);
  protected readonly moduleEntity = signal<ProductModule | undefined>(this.data.module);
  protected readonly workTypes = signal<WorkType[]>([]);

  protected readonly dialogTitle = computed(() =>
    this.mode() === 'edit' ? 'Редактировать модуль' : 'Создать модуль',
  );

  protected readonly form = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.maxLength(200)]),
    article: this.fb.control('', [Validators.required, Validators.maxLength(64)]),
    width: this.fb.control<number | null>(null),
    height: this.fb.control<number | null>(null),
    depth: this.fb.control<number | null>(null),
    dimUnit: this.fb.control('mm'),
    weight: this.fb.control<number | null>(null),
    sortOrder: this.fb.control<number | null>(null),
    workTypes: this.fb.array<WorkTypeFormGroup>([]),
  });

  get workTypesArray(): FormArray<WorkTypeFormGroup> {
    return this.form.controls.workTypes;
  }

  ngOnInit(): void {
    void this.loadWorkTypes();
    if (this.data.module) {
      this.savedId.set(this.data.module._id);
      this.patchModule(this.data.module);
    }
  }

  ngAfterViewInit(): void {
    if (this.data.focusComposition) {
      scrollCompositionBlockIntoView(this.compositionBlock?.nativeElement);
    }
  }

  protected onCancel(): void {
    confirmDirtyClose(
      this.dialog,
      this.destroyRef,
      this.injector,
      () => this.form.dirty,
      () => this.ref.close(this.moduleEntity() ?? undefined),
    );
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.buildPayload();
    this.submitting.set(true);
    this.errorMessage.set(null);
    const existing = this.moduleEntity();
    const res =
      this.mode() === 'edit' && existing
        ? await firstValueFrom(this.modulesService.update(existing._id, payload))
        : await firstValueFrom(this.modulesService.create(payload));
    this.submitting.set(false);
    if (!res.ok) {
      this.errorMessage.set(extractErrorMessage(res.error));
      return;
    }
    this.savedId.set(res.data._id);
    this.moduleEntity.set(res.data);
    this.mode.set('edit');
    this.form.markAsPristine();
    if (this.data.mode === 'edit') {
      this.ref.close(res.data);
    }
  }

  protected addWorkType(): void {
    this.workTypesArray.push(this.createWorkTypeGroup());
    this.form.markAsDirty();
  }

  protected removeWorkType(index: number): void {
    this.workTypesArray.removeAt(index);
    this.form.markAsDirty();
  }

  protected moveWorkType(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= this.workTypesArray.length) return;
    const current = this.workTypesArray.at(index);
    this.workTypesArray.removeAt(index, { emitEvent: false });
    this.workTypesArray.insert(target, current, { emitEvent: false });
    this.form.markAsDirty();
  }

  private createWorkTypeGroup(row?: NonNullable<ProductModule['workTypes']>[number]): WorkTypeFormGroup {
    return this.fb.group({
      workTypeId: this.fb.control(resolveWorkTypeId(row), Validators.required),
      estimatedHours: this.fb.control(row?.estimatedHours ?? null),
      sortOrder: this.fb.control(row?.sortOrder ?? 0),
      days: this.fb.control(row?.days ?? null),
    });
  }

  /** Seeds an empty «Дней» field from the WorkType catalog default when a skill is picked (fallback, not a lock). */
  protected seedDaysFromCatalog(index: number): void {
    const group = this.workTypesArray.at(index);
    if (group.controls.days.value != null) return;
    const catalogDays = this.workTypes().find((wt) => wt._id === group.controls.workTypeId.value)?.days;
    if (catalogDays != null) group.controls.days.setValue(catalogDays);
  }

  private async loadWorkTypes(): Promise<void> {
    const result = await firstValueFrom(this.workTypesService.list({ activeOnly: true }));
    if (result.ok) this.workTypes.set(result.data.items);
  }

  private patchModule(m: ProductModule): void {
    this.form.patchValue({
      name: m.name,
      article: m.article,
      width: m.dimensions?.width ?? null,
      height: m.dimensions?.height ?? null,
      depth: m.dimensions?.depth ?? null,
      dimUnit: m.dimensions?.unit ?? 'mm',
      weight: m.weight ?? null,
      sortOrder: m.sortOrder ?? null,
    });
    this.workTypesArray.clear();
    for (const row of m.workTypes ?? []) this.workTypesArray.push(this.createWorkTypeGroup(row));
    this.form.markAsPristine();
  }

  private buildPayload(): CreateProductModulePayload {
    const v = this.form.getRawValue();
    const payload: CreateProductModulePayload = {
      name: v.name.trim(),
      article: v.article.trim(),
    };
    if (v.weight != null) payload.weight = Number(v.weight);
    if (v.sortOrder != null) payload.sortOrder = Number(v.sortOrder);
    if (v.width != null || v.height != null || v.depth != null || v.dimUnit) {
      payload.dimensions = {
        width: v.width ?? undefined,
        height: v.height ?? undefined,
        depth: v.depth ?? undefined,
        unit: v.dimUnit || undefined,
      };
    }
    payload.workTypes = v.workTypes
      .filter((row) => row.workTypeId.trim().length > 0)
      .map((row): ProductModuleWorkTypePayload => ({
        workTypeId: row.workTypeId,
        ...(row.estimatedHours == null ? {} : { estimatedHours: Number(row.estimatedHours) }),
        ...(row.sortOrder == null ? {} : { sortOrder: Number(row.sortOrder) }),
        ...(row.days == null ? {} : { days: Number(row.days) }),
      }));
    return payload;
  }
}

type WorkTypeFormGroup = FormGroup<{
  workTypeId: FormControl<string>;
  estimatedHours: FormControl<number | null>;
  sortOrder: FormControl<number>;
  days: FormControl<number | null>;
}>;

function resolveWorkTypeId(row: NonNullable<ProductModule['workTypes']>[number] | undefined): string {
  if (!row) return '';
  return typeof row.workTypeId === 'string' ? row.workTypeId : row.workTypeId._id;
}
