import { Injectable, inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ConfirmDialogComponent,
  ConfirmData,
  ConfirmResult,
} from '../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  FormDialogComponent,
  FormDialogData,
  FormDialogResult,
} from '../../shared/components/form-dialog/form-dialog.component';

/**
 * Thin wrapper around @angular/cdk/dialog to keep dialog usage consistent.
 * - openForm() returns the form values, or undefined if cancelled.
 * - confirm() returns true on confirm, false on cancel/close.
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly dialog = inject(Dialog);

  openForm(data: FormDialogData): Observable<FormDialogResult> {
    const ref = this.dialog.open<FormDialogResult, FormDialogData>(
      FormDialogComponent,
      { data, hasBackdrop: true, backdropClass: 'cdk-overlay-transparent-backdrop' },
    );
    return ref.closed;
  }

  confirm(data: ConfirmData): Observable<boolean> {
    const ref = this.dialog.open<ConfirmResult, ConfirmData>(ConfirmDialogComponent, {
      data,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });
    return ref.closed.pipe(map((r) => r === true));
  }
}
