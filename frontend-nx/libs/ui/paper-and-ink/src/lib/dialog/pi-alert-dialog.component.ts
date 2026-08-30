import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { PiDialogComponent } from '../dialog/pi-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from './dialog.tokens';
import type { DialogRef } from './pi-dialog.service';

export type AlertDialogVariant = 'default' | 'destructive';

export interface AlertDialogData {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: AlertDialogVariant;
}

/**
 * AlertDialog — typed wrapper for confirm/cancel flows, opened via
 * PiDialogService.open(). Receives config from PI_DIALOG_DATA token.
 *
 * TZ-90 Phase C: migrated to polymorphic <app-pi-dialog variant="alert">.
 * PiDialogComponent handles role="alertdialog", header, sticky footer.
 * This component provides body content (description) and footer buttons.
 *
 * Web-spec compliant: role="alertdialog" (via PiDialogComponent for alert variant),
 * initial focus = cancel button (safer for destructive operations).
 *
 * @example
 *   this.dialog.open(AlertDialogComponent, {
 *     data: {
 *       title: 'Удалить запись?',
 *       description: 'Это действие нельзя отменить.',
 *       confirmLabel: 'Удалить',
 *       variant: 'destructive',
 *     },
 *     width: 'sm',
 *   });
 */
@Component({
  selector: 'app-pi-alert-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent],
  template: `
    <app-pi-dialog
      [title]="data.title"
      [width]="'sm'"
      [variant]="'alert'"
      [showClose]="false"
      [animate]="false"
    >
      <div body>
        @if (data.description) {
          <p class="text-sm text-muted-foreground">{{ data.description }}</p>
        }
      </div>
      <div footer>
        <app-pi-button variant="ghost" size="sm" (click)="onCancel()">
          {{ data.cancelLabel || 'Отмена' }}
        </app-pi-button>
        <app-pi-button
          [variant]="data.variant === 'destructive' ? 'destructive' : 'default'"
          size="sm"
          (click)="onConfirm()"
        >
          {{ data.confirmLabel || 'Подтвердить' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class AlertDialogComponent implements AfterViewInit {
  readonly data = inject<AlertDialogData>(PI_DIALOG_DATA);

  private readonly ref = inject<DialogRef<boolean>>(PI_DIALOG_REF);
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  protected onConfirm(): void {
    this.ref.close(true);
  }

  protected onCancel(): void {
    this.ref.close();
  }

  ngAfterViewInit(): void {
    // Initial focus on cancel button — safer for destructive actions.
    queueMicrotask(() => {
      const host = this.hostEl.nativeElement;
      const first = host.querySelector('button');
      if (first) (first as HTMLButtonElement).focus();
    });
  }
}
