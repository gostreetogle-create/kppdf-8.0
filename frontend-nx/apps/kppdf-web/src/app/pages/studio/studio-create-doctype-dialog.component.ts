import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';
import { SelectComponent, SelectOptionComponent } from '@kppdf/ui/select';
import type { DocType } from '@kppdf/data-access';

export interface StudioCreateDoctypeDialogData {
  readonly defaultName: string;
  readonly docTypes: readonly DocType[];
}

export interface StudioCreateDoctypeResult {
  readonly name: string;
  readonly docTypeId: string;
}

@Component({
  selector: 'pi-studio-create-doctype-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PiDialogComponent, ButtonComponent, FormFieldComponent, InputComponent, SelectComponent, SelectOptionComponent],
  template: `<app-pi-dialog title="Создать документ" variant="content" [showClose]="true" (userClose)="ref.close(undefined)">
    <form body [formGroup]="form" (ngSubmit)="submit()" class="space-y-3" data-test="studio-create-doctype-dialog">
      <app-pi-form-field label="Название" htmlFor="studio-create-doctype-name" [required]="true">
        <app-pi-input id="studio-create-doctype-name" formControlName="name" data-test="studio-create-doctype-name" />
      </app-pi-form-field>
      <app-pi-form-field label="Тип документа" htmlFor="studio-create-doctype-type" [required]="true">
        <app-pi-select
          id="studio-create-doctype-type"
          ariaLabel="Тип документа"
          placeholder="— выберите тип —"
          formControlName="docTypeId"
          data-test="studio-create-doctype-type"
        >
          @for (dt of data.docTypes; track dt._id) {
            <app-pi-select-option [value]="dt._id">{{ dt.name }}</app-pi-select-option>
          }
        </app-pi-select>
      </app-pi-form-field>
    </form>
    <div footer class="flex gap-3 justify-end">
      <app-pi-button
        type="button"
        variant="default"
        [disabled]="form.invalid"
        (click)="submit()"
        data-test="studio-create-doctype-confirm"
      >
        Создать
      </app-pi-button>
      <app-pi-button type="button" variant="outline" (click)="ref.close(undefined)">Отмена</app-pi-button>
    </div>
  </app-pi-dialog>`,
})
export class StudioCreateDoctypeDialogComponent {
  protected readonly data = inject<StudioCreateDoctypeDialogData>(PI_DIALOG_DATA);
  protected readonly ref = inject<DialogRef<StudioCreateDoctypeResult | undefined>>(PI_DIALOG_REF);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    name: this.fb.control(this.data.defaultName, [Validators.required, Validators.maxLength(256)]),
    docTypeId: this.fb.control('', [Validators.required]),
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.ref.close({ name: v.name.trim(), docTypeId: v.docTypeId });
  }
}
