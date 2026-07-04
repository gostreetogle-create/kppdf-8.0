import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

export interface ConfirmData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
}

export type ConfirmResult = boolean | undefined;

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in"
    >
      <div
        class="card w-full max-w-md shadow-lg animate-slide-up"
        (click)="$event.stopPropagation()"
      >
        <div class="card-header">
          <h2 class="card-title">{{ data.title }}</h2>
          <p class="card-description">{{ data.message }}</p>
        </div>
        <div class="card-footer justify-end gap-2">
          <button type="button" class="btn-outline" (click)="ref.close(false)">
            {{ data.cancelLabel ?? 'Отмена' }}
          </button>
          <button
            type="button"
            [class]="data.variant === 'destructive' ? 'btn-destructive' : 'btn-primary'"
            (click)="ref.close(true)"
          >
            {{ data.confirmLabel ?? 'Подтвердить' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  readonly ref = inject<DialogRef<ConfirmResult>>(DialogRef);
  readonly data = inject<ConfirmData>(DIALOG_DATA);
}
