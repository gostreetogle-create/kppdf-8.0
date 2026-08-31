import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import type { DocumentTemplate } from '@kppdf/data-access';

@Component({
  selector: 'pi-studio-template-picker-dialog',
  standalone: true,
  imports: [PiDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-pi-dialog title="Выберите шаблон" variant="content" [showClose]="true">
    <div body class="space-y-2" data-test="studio-template-picker">
      @for (template of data.templates; track template._id) {
        <button type="button" class="block w-full text-left pi-focus-ring px-3 py-2 hairline rounded-sm" [attr.data-test]="'studio-template-option-' + template._id" (click)="ref.close(template)">
          <strong>{{ template.name }}</strong>
          <span class="block text-xs text-muted-foreground">{{ template.orientation === 'landscape' ? 'Альбомная' : 'Книжная' }} · {{ template.pageSize ?? 'A4' }}</span>
        </button>
      }
    </div>
  </app-pi-dialog>`,
})
export class StudioTemplatePickerDialogComponent {
  protected readonly data = inject<{ templates: readonly DocumentTemplate[] }>(PI_DIALOG_DATA);
  protected readonly ref = inject<DialogRef<DocumentTemplate | undefined>>(PI_DIALOG_REF);
}
