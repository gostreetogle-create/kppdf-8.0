import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

export type FormFieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'date'
  | 'textarea'
  | 'select'
  | 'boolean'
  | 'relation';

export interface FormFieldSpec {
  key: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface FormDialogData {
  title: string;
  fields: FormFieldSpec[];
  initial?: Record<string, unknown>;
}

export type FormDialogResult = Record<string, unknown> | undefined;

@Component({
  selector: 'app-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in"
    >
      <div
        class="card w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-lg animate-slide-up"
        (click)="$event.stopPropagation()"
      >
        <div class="card-header">
          <h2 class="card-title">{{ data.title }}</h2>
        </div>
        <div class="card-content">
          <form class="space-y-3" (submit)="$event.preventDefault(); save()">
            @for (field of data.fields; track field.key) {
              <div class="space-y-1">
                <label class="label" [attr.for]="field.key">
                  {{ field.label }}
                  @if (field.required) { <span class="text-destructive">*</span> }
                </label>
                @switch (field.type) {
                  @case ('textarea') {
                    <textarea
                      class="input min-h-[80px]"
                      [id]="field.key"
                      [name]="field.key"
                      [placeholder]="field.placeholder ?? ''"
                      [(ngModel)]="values[field.key]"
                    ></textarea>
                  }
                  @case ('select') {
                    <select
                      class="input"
                      [id]="field.key"
                      [name]="field.key"
                      [(ngModel)]="values[field.key]"
                    >
                      <option [ngValue]="null">—</option>
                      @for (opt of field.options; track opt.value) {
                        <option [ngValue]="opt.value">{{ opt.label }}</option>
                      }
                    </select>
                  }
                  @case ('relation') {
                    <select
                      class="input"
                      [id]="field.key"
                      [name]="field.key"
                      [(ngModel)]="values[field.key]"
                    >
                      <option [ngValue]="null">— Не выбрано —</option>
                      @for (opt of field.options; track opt.value) {
                        <option [ngValue]="opt.value">{{ opt.label }}</option>
                      }
                    </select>
                  }
                  @case ('boolean') {
                    <select
                      class="input"
                      [id]="field.key"
                      [name]="field.key"
                      [(ngModel)]="values[field.key]"
                    >
                      <option [ngValue]="true">Да</option>
                      <option [ngValue]="false">Нет</option>
                    </select>
                  }
                  @case ('date') {
                    <input
                      class="input"
                      type="date"
                      [id]="field.key"
                      [name]="field.key"
                      [placeholder]="field.placeholder ?? ''"
                      [(ngModel)]="values[field.key]"
                    />
                  }
                  @default {
                    <input
                      class="input"
                      [type]="field.type"
                      [id]="field.key"
                      [name]="field.key"
                      [placeholder]="field.placeholder ?? ''"
                      [(ngModel)]="values[field.key]"
                    />
                  }
                }
              </div>
            }
          </form>
        </div>
        <div class="card-footer justify-end gap-2">
          <button type="button" class="btn-outline" (click)="cancel()">Отмена</button>
          <button type="button" class="btn-primary" (click)="save()">Сохранить</button>
        </div>
      </div>
    </div>
  `,
})
export class FormDialogComponent {
  readonly ref = inject<DialogRef<FormDialogResult>>(DialogRef);
  readonly data = inject<FormDialogData>(DIALOG_DATA);
  values: Record<string, unknown> = { ...(this.data.initial ?? {}) };

  save(): void {
    this.ref.close(this.values);
  }

  cancel(): void {
    this.ref.close(undefined);
  }
}
