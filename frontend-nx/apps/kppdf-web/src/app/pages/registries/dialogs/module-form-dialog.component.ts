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
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  PiModulesService,
  type CreateProductModulePayload,
  type ProductModule,
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
  });

  ngOnInit(): void {
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
    return payload;
  }
}
