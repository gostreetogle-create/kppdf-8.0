import { ChangeDetectionStrategy, Component, inject, Injector, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PiDocumentTemplatesService, type DocumentTemplate } from '@kppdf/data-access';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF, PiDialogService, AlertDialogComponent, type DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { onDialogCloseOnce } from '../on-dialog-close-once';

export interface StudioTemplatePickerDialogData {
  readonly templates: readonly DocumentTemplate[];
  readonly onDeleted?: (id: string) => void;
}

@Component({
  selector: 'pi-studio-template-picker-dialog',
  standalone: true,
  imports: [PiDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-pi-dialog title="Выберите шаблон" variant="content" [showClose]="true">
    <div body class="space-y-2" data-test="studio-template-picker">
      @for (template of templates(); track template._id) {
        <div class="flex items-center gap-2">
          <button type="button" class="flex-1 text-left pi-focus-ring px-3 py-2 hairline rounded-sm" [attr.data-test]="'studio-template-option-' + template._id" (click)="ref.close(template)">
            <strong>{{ template.name }}</strong>
            <span class="block text-xs text-muted-foreground">{{ template.orientation === 'landscape' ? 'Альбомная' : 'Книжная' }} · {{ template.pageSize ?? 'A4' }}</span>
          </button>
          <button class="pi-icon-button pi-focus-ring shrink-0" type="button" aria-label="Удалить шаблон" title="Удалить" [attr.data-test]="'studio-template-delete-' + template._id" (click)="removeTemplate(template, $event)">×</button>
        </div>
      }
    </div>
  </app-pi-dialog>`,
})
export class StudioTemplatePickerDialogComponent {
  private readonly documentTemplates = inject(PiDocumentTemplatesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  protected readonly data = inject<StudioTemplatePickerDialogData>(PI_DIALOG_DATA);
  protected readonly ref = inject<DialogRef<DocumentTemplate | undefined>>(PI_DIALOG_REF);
  protected readonly templates = signal<readonly DocumentTemplate[]>([...this.data.templates]);

  protected removeTemplate(template: DocumentTemplate, event: Event): void {
    event.stopPropagation();
    const confirmRef = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: `Удалить шаблон «${template.name}»?`,
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена',
        variant: 'destructive',
      },
      width: 'sm',
    });
    onDialogCloseOnce(confirmRef, this.injector, (ok) => {
      if (ok !== true) return;
      void firstValueFrom(this.documentTemplates.remove(template._id)).then((result) => {
        if (!result.ok) {
          this.toast.error(String(result.error));
          return;
        }
        this.templates.update((rows) => rows.filter((row) => row._id !== template._id));
        this.data.onDeleted?.(template._id);
      });
    });
  }
}
