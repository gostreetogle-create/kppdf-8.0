import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
import { ButtonComponent } from '@kppdf/ui/button';
import { PI_DIALOG_REF, PiDialogComponent, type DialogRef } from '@kppdf/ui/dialog';

export type StudioUnsavedChangesChoice = 'stay' | 'leave' | 'save-and-leave';

/**
 * Прогон перед уходом из студии с несохранёнными правками (TZ-NX-DOCSTUDIO-S38).
 * AlertDialogComponent поддерживает только confirm/cancel, здесь нужен третий
 * вариант («Сохранить и уйти»), поэтому диалог собран напрямую на PiDialogComponent.
 */
@Component({
  selector: 'app-studio-unsaved-changes-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent],
  template: `
    <app-pi-dialog
      title="Уйти без сохранения?"
      [width]="'sm'"
      [variant]="'alert'"
      [showClose]="false"
      [animate]="false"
    >
      <div body>
        <p class="text-sm text-muted-foreground">Несохранённые изменения документа будут потеряны.</p>
      </div>
      <div footer>
        <app-pi-button variant="ghost" size="sm" data-test="studio-unsaved-stay" (click)="onStay()">
          Остаться
        </app-pi-button>
        <app-pi-button variant="destructive" size="sm" data-test="studio-unsaved-leave" (click)="onLeave()">
          Уйти
        </app-pi-button>
        <app-pi-button variant="default" size="sm" data-test="studio-unsaved-save-and-leave" (click)="onSaveAndLeave()">
          Сохранить и уйти
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class StudioUnsavedChangesDialogComponent implements AfterViewInit {
  private readonly ref = inject<DialogRef<StudioUnsavedChangesChoice>>(PI_DIALOG_REF);
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  protected onStay(): void {
    this.ref.close('stay');
  }

  protected onLeave(): void {
    this.ref.close('leave');
  }

  protected onSaveAndLeave(): void {
    this.ref.close('save-and-leave');
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      const host = this.hostEl.nativeElement;
      const first = host.querySelector('button');
      if (first) (first as HTMLButtonElement).focus();
    });
  }
}
