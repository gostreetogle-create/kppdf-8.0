import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';
import { PiToastService } from '@kppdf/ui/toast';

export interface StudioRenameDocumentDialogData {
  readonly currentName: string;
}

export interface StudioRenameDocumentResult {
  readonly name: string;
}

@Component({
  selector: 'pi-studio-rename-document-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PiDialogComponent, ButtonComponent, FormFieldComponent, InputComponent],
  template: `
    <app-pi-dialog title="Переименовать документ" variant="content" [showClose]="true" (userClose)="ref.close(undefined)">
      <form body [formGroup]="form" (ngSubmit)="submit()" class="space-y-3" data-test="studio-rename-form">
        <app-pi-form-field label="Название документа" htmlFor="rename-name" [required]="true">
          <app-pi-input id="rename-name" formControlName="name" data-test="studio-rename-name-input" />
        </app-pi-form-field>
      </form>
      <div footer class="flex gap-3 justify-end">
        <app-pi-button type="button" variant="default" (click)="submit()" data-test="studio-rename-confirm">
          Сохранить
        </app-pi-button>
        <app-pi-button type="button" variant="outline" (click)="ref.close(undefined)">Отмена</app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class StudioRenameDocumentDialogComponent {
  protected readonly data = inject<StudioRenameDocumentDialogData>(PI_DIALOG_DATA);
  protected readonly ref = inject<DialogRef<StudioRenameDocumentResult | undefined>>(PI_DIALOG_REF);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly toast = inject(PiToastService);

  protected readonly form = this.fb.group({
    name: this.fb.control(this.data.currentName, [Validators.maxLength(256)]),
  });

  protected submit(): void {
    const name = this.form.getRawValue().name.trim();
    if (!name) {
      this.toast.error('Название документа не может быть пустым');
      return;
    }
    this.ref.close({ name });
  }
}
