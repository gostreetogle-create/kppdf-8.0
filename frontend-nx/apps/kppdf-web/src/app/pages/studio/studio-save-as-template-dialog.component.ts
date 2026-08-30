import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';

export interface StudioSaveAsTemplateDialogData {
  readonly defaultName: string;
}

export interface StudioSaveAsTemplateResult {
  readonly name: string;
  readonly keepDataBindings: boolean;
}

@Component({
  selector: 'pi-studio-save-as-template-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PiDialogComponent, ButtonComponent, FormFieldComponent, InputComponent],
  template: `
    <app-pi-dialog title="Сохранить как шаблон" variant="content" [showClose]="true" (userClose)="ref.close(undefined)">
      <form body [formGroup]="form" (ngSubmit)="submit()" class="space-y-3" data-test="studio-save-as-template-form">
        <app-pi-form-field label="Название шаблона" htmlFor="template-name" [required]="true">
          <app-pi-input id="template-name" formControlName="name" data-test="studio-template-name-input" />
        </app-pi-form-field>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" formControlName="keepDataBindings" data-test="studio-template-keep-bindings" />
          Сохранить привязки к данным
        </label>
      </form>
      <div footer class="flex gap-3 justify-end">
        <app-pi-button
          type="button"
          variant="default"
          [disabled]="form.invalid"
          (click)="submit()"
          data-test="studio-save-as-template-confirm"
        >
          Сохранить
        </app-pi-button>
        <app-pi-button type="button" variant="outline" (click)="ref.close(undefined)">Отмена</app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class StudioSaveAsTemplateDialogComponent {
  protected readonly data = inject<StudioSaveAsTemplateDialogData>(PI_DIALOG_DATA);
  protected readonly ref = inject<DialogRef<StudioSaveAsTemplateResult | undefined>>(PI_DIALOG_REF);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly saving = signal(false);

  protected readonly form = this.fb.group({
    name: this.fb.control(this.data.defaultName, [Validators.required, Validators.maxLength(256)]),
    keepDataBindings: this.fb.control(false),
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.ref.close({ name: v.name.trim(), keepDataBindings: v.keepDataBindings });
  }
}
