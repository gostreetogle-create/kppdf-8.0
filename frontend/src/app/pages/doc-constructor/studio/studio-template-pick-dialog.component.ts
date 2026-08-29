import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PiDialogComponent } from '../../../shared/ui/dialog/pi-dialog.component';
import { PiOverflowSelectComponent } from '../../../shared/ui/overflow-select/pi-overflow-select.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../../shared/ui/dialog/pi-dialog.service';
import {
  DocumentTemplate,
  DocumentTemplatesService,
} from '../../../shared/services/pi-document-templates.service';
import { extractErrorMessage } from '../../../core/silent-http';

export interface StudioTemplatePickDialogData {
  templates?: DocumentTemplate[];
}

/**
 * TZ-DOC-STUDIO-1301 — pick a DocumentTemplate to create a studio document from.
 */
@Component({
  selector: 'app-studio-template-pick-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent, PiOverflowSelectComponent],
  template: `
    <app-pi-dialog title="Из шаблона" width="md">
      <div body class="flex flex-col gap-3">
        <p class="text-sm text-muted-foreground m-0">
          Выберите шаблон — будет создан документ с копией блоков и настроек листа.
        </p>
        @if (loading()) {
          <p class="text-sm text-muted-foreground m-0">Загрузка шаблонов…</p>
        } @else if (error()) {
          <p class="text-sm text-destructive m-0" role="alert">{{ error() }}</p>
        } @else {
          <app-pi-overflow-select
            [items]="templateItems()"
            [value]="selectedId()"
            (valueChange)="selectedId.set($event)"
            searchable="auto"
            placeholder="Выберите шаблон…"
            ariaLabel="Шаблон документа"
            dataTest="studio-template-pick-select"
          />
        }
      </div>
      <div footer>
        <app-pi-button variant="ghost" size="sm" (click)="onCancel()">Отмена</app-pi-button>
        <app-pi-button
          variant="default"
          size="sm"
          [disabled]="!selectedId() || loading()"
          data-test="studio-template-pick-confirm"
          (click)="onConfirm()"
        >
          Создать
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class StudioTemplatePickDialogComponent {
  private readonly templatesSvc = inject(DocumentTemplatesService);
  private readonly ref = inject<DialogRef<DocumentTemplate>>(PI_DIALOG_REF);
  readonly data = inject<StudioTemplatePickDialogData>(PI_DIALOG_DATA, { optional: true });

  protected readonly loading = signal(!this.data?.templates?.length);
  protected readonly error = signal<string | null>(null);
  protected readonly all = signal<DocumentTemplate[]>(this.data?.templates ?? []);
  protected readonly selectedId = signal('');

  constructor() {
    if (this.data?.templates?.length) {
      this.loading.set(false);
      return;
    }
    this.templatesSvc.list({}).subscribe((res) => {
      this.loading.set(false);
      if (!res.ok) {
        this.error.set(extractErrorMessage(res.error));
        this.all.set([]);
        return;
      }
      this.all.set((res.data.items ?? []).filter((t) => t.isActive));
    });
  }

  protected templateItems(): { id: string; label: string }[] {
    return this.all().map((t) => ({ id: t._id, label: t.name }));
  }

  protected onCancel(): void {
    this.ref.close();
  }

  protected onConfirm(): void {
    const tpl = this.all().find((t) => t._id === this.selectedId());
    if (!tpl) return;
    this.ref.close(tpl);
  }
}
