import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef, PiDialogComponent } from '@kppdf/ui/dialog';
import { ButtonComponent } from '@kppdf/ui/button';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent, type PiInputType } from '@kppdf/ui/input';

export type SimpleRegistryDialogKind = 'organization' | 'supply-request' | 'passport';
export interface SimpleRegistryDialogData { readonly kind: SimpleRegistryDialogKind; readonly value?: Record<string, unknown>; }

@Component({ selector: 'pi-simple-registry-form-dialog', standalone: true, imports: [ReactiveFormsModule, PiDialogComponent, ButtonComponent, FormFieldComponent, InputComponent], changeDetection: ChangeDetectionStrategy.OnPush, template: `<app-pi-dialog [title]="title" variant="content" [showClose]="true"><form body [formGroup]="form" (ngSubmit)="save()">@for (field of fields; track field.key) {<app-pi-form-field [label]="field.label" [htmlFor]="field.key" [required]="true"><app-pi-input [id]="field.key" [type]="field.type ?? 'text'" [formControlName]="field.key" /></app-pi-form-field>}<div footer class="flex justify-end gap-3"><app-pi-button type="button" variant="outline" (click)="close()">Отмена</app-pi-button><app-pi-button type="submit" [disabled]="form.invalid">Сохранить</app-pi-button></div></form></app-pi-dialog>` })
export class SimpleRegistryFormDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  readonly data = inject<SimpleRegistryDialogData>(PI_DIALOG_DATA);
  readonly ref = inject<DialogRef<Record<string, unknown> | undefined>>(PI_DIALOG_REF);
  readonly title = this.data.value ? 'Редактировать' : 'Создать';
  readonly fields: readonly { key: string; label: string; type?: PiInputType }[] = this.data.kind === 'organization' ? [{ key: 'name', label: 'Название' }, { key: 'inn', label: 'ИНН' }] : this.data.kind === 'supply-request' ? [{ key: 'title', label: 'Наименование' }, { key: 'qty', label: 'Количество', type: 'number' }] : [{ key: 'passportNumber', label: 'Номер паспорта' }, { key: 'productId', label: 'Изделие' }];
  readonly form = this.fb.group(Object.fromEntries(this.fields.map((field) => [field.key, [String(this.data.value?.[field.key] ?? ''), Validators.required]])));
  save(): void { if (this.form.valid) this.ref.close(this.form.getRawValue()); }
  close(): void { this.ref.close(undefined); }
}
