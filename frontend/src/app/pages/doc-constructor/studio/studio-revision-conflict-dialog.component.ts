import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
} from '@angular/core';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PiDialogComponent } from '../../../shared/ui/dialog/pi-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../../shared/ui/dialog/pi-dialog.service';

export type StudioRevisionConflictAction = 'reload' | 'save-copy';

export interface StudioRevisionConflictDialogData {
  title?: string;
  description?: string;
}

/**
 * TZ-DOC-STUDIO-1901 — 409 revision conflict: reload or duplicate+apply patch.
 */
@Component({
  selector: 'app-studio-revision-conflict-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent],
  template: `
    <app-pi-dialog
      [title]="data.title ?? 'Документ изменён'"
      [width]="'sm'"
      [variant]="'alert'"
      [showClose]="false"
      [animate]="false"
    >
      <div body>
        <p class="text-sm text-muted-foreground m-0">
          {{
            data.description ?? 'Документ был изменён в другой вкладке или другим пользователем.'
          }}
        </p>
      </div>
      <div footer class="flex flex-wrap items-center justify-end gap-2">
        <app-pi-button variant="ghost" size="sm" (click)="onCancel()">Отмена</app-pi-button>
        <app-pi-button
          variant="outline"
          size="sm"
          data-test="studio-conflict-save-copy"
          (click)="onSaveCopy()"
        >
          Сохранить копию
        </app-pi-button>
        <app-pi-button variant="default" size="sm" (click)="onReload()">Обновить</app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class StudioRevisionConflictDialogComponent implements AfterViewInit {
  readonly data =
    inject<StudioRevisionConflictDialogData>(PI_DIALOG_DATA, {
      optional: true,
    }) ?? {};

  private readonly ref = inject<DialogRef<StudioRevisionConflictAction>>(PI_DIALOG_REF);
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  protected onReload(): void {
    this.ref.close('reload');
  }

  protected onSaveCopy(): void {
    this.ref.close('save-copy');
  }

  protected onCancel(): void {
    this.ref.close();
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      const host = this.hostEl.nativeElement;
      const first = host.querySelector('button');
      if (first) (first as HTMLButtonElement).focus();
    });
  }
}
