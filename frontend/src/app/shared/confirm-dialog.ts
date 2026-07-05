import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  /** Modal title (short). */
  title: string;
  /**
   * Body copy. Plain string for now — if we need rich content later,
   * swap to an inner template projected from the caller.
   */
  message: string;
  /** Defaults to "Отмена". */
  cancelLabel?: string;
  /** Defaults to "Подтвердить". */
  confirmLabel?: string;
  /** Tints confirm button; defaults to "primary". */
  variant?: 'primary' | 'warn';
}

/**
 * Reactive confirmation dialog used by destructive flows (delete, archive).
 * Returns a single boolean via afterClosed — true means confirmed.
 */
@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="title">
      <mat-icon class="title-icon" [class.warn]="data.variant === 'warn'">
        {{ data.variant === 'warn' ? 'warning' : 'help_outline' }}
      </mat-icon>
      <span>{{ data.title }}</span>
    </h2>

    <p mat-dialog-content class="body">{{ data.message }}</p>

    <div mat-dialog-actions align="end" class="actions">
      <button mat-button type="button" (click)="dialog.close(false)">
        {{ data.cancelLabel ?? 'Отмена' }}
      </button>
      <button
        mat-flat-button
        [color]="data.variant === 'warn' ? 'warn' : 'primary'"
        type="button"
        (click)="dialog.close(true)"
      >
        {{ data.confirmLabel ?? 'Подтвердить' }}
      </button>
    </div>
  `,
  styles: `
    :host { display: block; min-width: 360px; max-width: 480px; }

    .title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .title-icon {
      color: var(--mat-sys-primary);
    }

    .title-icon.warn { color: var(--mat-sys-error); }

    .body {
      margin: 0;
      line-height: 1.5;
      white-space: pre-line;
    }

    .actions {
      gap: 8px;
    }
  `,
})
export class ConfirmDialogComponent {
  readonly dialog = inject<MatDialogRef<ConfirmDialogComponent, boolean>>(MatDialogRef);
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
